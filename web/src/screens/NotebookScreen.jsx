import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { notebooksAPI, contentAPI } from '../services/api';
import { getSocket, joinNotebook, leaveNotebook, emitTextUpdate, emitDrawingUpdate } from '../sockets/socketClient';
// html2pdf is imported dynamically in exportToPdf function
import RichTextEditor from '../components/RichTextEditor';
import DrawingCanvas from '../components/DrawingCanvas';
import UserPresence from '../components/UserPresence';
import Toolbar from '../components/Toolbar';
import './Notebook.css';

function NotebookScreen() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [notebook, setNotebook] = useState(null);
    const [textContent, setTextContent] = useState('');
    const [drawingData, setDrawingData] = useState({ paths: [] });
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('notes');
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [sharePassword, setSharePassword] = useState('');
    const [shareTab, setShareTab] = useState('link');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('editor');
    const [shareMessage, setShareMessage] = useState('');
    const [currentTool, setCurrentTool] = useState('pen');
    const [currentColor, setCurrentColor] = useState('#6366f1');
    const [brushSize, setBrushSize] = useState(3);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [members, setMembers] = useState([]);
    const [isOwner, setIsOwner] = useState(false);
    const [membersMessage, setMembersMessage] = useState('');

    const saveTimeoutRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        loadNotebook();
        const socket = getSocket();

        if (socket) {
            joinNotebook(id);
            socket.on('content-sync', handleContentSync);
            socket.on('text-update', handleRemoteTextUpdate);
            socket.on('drawing-update', handleRemoteDrawingUpdate);
            socket.on('online-users', setOnlineUsers);
            socket.on('user-joined', handleUserJoined);
            socket.on('user-left', handleUserLeft);
        }

        return () => {
            leaveNotebook(id);
            if (socket) {
                socket.off('content-sync');
                socket.off('text-update');
                socket.off('drawing-update');
                socket.off('online-users');
                socket.off('user-joined');
                socket.off('user-left');
            }
        };
    }, [id]);

    const loadNotebook = async () => {
        try {
            const [notebookRes, contentRes] = await Promise.all([
                notebooksAPI.getOne(id),
                contentAPI.get(id)
            ]);
            setNotebook(notebookRes.data.notebook);
            setTextContent(contentRes.data.content.textContent || '');
            setDrawingData(contentRes.data.content.drawingData || { paths: [] });
        } catch (error) {
            console.error('Failed to load notebook:', error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleContentSync = ({ textContent, drawingData }) => {
        setTextContent(textContent || '');
        setDrawingData(drawingData || { paths: [] });
    };

    const handleRemoteTextUpdate = ({ textContent: newContent }) => {
        setTextContent(newContent);
    };

    const handleRemoteDrawingUpdate = ({ path, action }) => {
        setDrawingData(prev => {
            if (action === 'add' && path) {
                return { ...prev, paths: [...prev.paths, path] };
            } else if (action === 'clear') {
                return { paths: [] };
            } else if (action === 'undo') {
                return { ...prev, paths: prev.paths.slice(0, -1) };
            }
            return prev;
        });
    };

    const handleUserJoined = ({ user: newUser }) => {
        setOnlineUsers(prev => [...prev, newUser]);
    };

    const handleUserLeft = ({ user: leftUser }) => {
        setOnlineUsers(prev => prev.filter(u => u.id !== leftUser.id));
    };

    const handleTextChange = useCallback((newContent) => {
        setTextContent(newContent);
        emitTextUpdate(id, newContent, null);
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            contentAPI.update(id, { textContent: newContent });
        }, 2000);
    }, [id]);

    const handleDrawingPath = useCallback((path) => {
        // Path already has color from DrawingCanvas, just use as-is
        setDrawingData(prev => ({ ...prev, paths: [...prev.paths, path] }));
        emitDrawingUpdate(id, path, 'add');
    }, [id]);

    const handleClearCanvas = useCallback(async () => {
        setDrawingData({ paths: [] });
        emitDrawingUpdate(id, null, 'clear');
        // Also save to database via API to ensure persistence
        try {
            await contentAPI.update(id, { drawingData: { paths: [] } });
        } catch (error) {
            console.error('Failed to save clear:', error);
        }
    }, [id]);

    const handleUndo = useCallback(() => {
        setDrawingData(prev => ({ ...prev, paths: prev.paths.slice(0, -1) }));
        emitDrawingUpdate(id, null, 'undo');
    }, [id]);

    const handleGenerateLink = async () => {
        try {
            const response = await notebooksAPI.share(id, sharePassword || null);
            const link = `${window.location.origin}/join/${response.data.shareLink}`;
            setShareLink(link);
            setShareMessage(sharePassword ? '✅ Link with password generated!' : '✅ Link generated!');
        } catch (error) {
            setShareMessage('❌ Failed to generate link');
        }
    };

    const loadMembers = async () => {
        try {
            const response = await notebooksAPI.getMembers(id);
            setMembers(response.data.members);
            setIsOwner(response.data.isOwner);
        } catch (error) {
            console.error('Failed to load members:', error);
        }
    };

    const handleKickMember = async (memberId, memberName) => {
        // Direct kick without confirm - confirmation is clicking the button
        setMembersMessage(`⏳ Removing ${memberName}...`);
        try {
            await notebooksAPI.removeMember(id, memberId);
            setMembersMessage(`✅ ${memberName} has been removed!`);
            loadMembers();
        } catch (error) {
            setMembersMessage(error.response?.data?.error || '❌ Failed to remove member');
        }
    };

    const handleTimeoutMember = async (memberId, memberName, minutes = 5) => {
        // Default 5 minutes timeout
        setMembersMessage(`⏳ Timing out ${memberName} for ${minutes} minutes...`);
        try {
            await notebooksAPI.timeoutMember(id, memberId, minutes);
            setMembersMessage(`✅ ${memberName} timed out for ${minutes} minutes!`);
            loadMembers();
        } catch (error) {
            setMembersMessage(error.response?.data?.error || '❌ Failed to timeout member');
        }
    };

    const handleDeleteNotebook = async () => {
        // Close modal first, then delete
        setShowMembersModal(false);
        try {
            await notebooksAPI.delete(id);
            navigate('/');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to delete notebook');
        }
    };

    const openMembersModal = () => {
        loadMembers();
        setShowMembersModal(true);
        setMembersMessage('');
    };

    const exportToPdf = async () => {
        try {
            // Dynamically import jsPDF
            const { jsPDF } = await import('jspdf');

            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            let yOffset = 20;

            // Add title
            doc.setFontSize(24);
            doc.setTextColor(51, 51, 51);
            doc.text(notebook?.title || 'Notebook', 20, yOffset);
            yOffset += 15;

            // Add text content
            if (textContent) {
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                // Strip HTML tags for plain text
                const plainText = textContent.replace(/<[^>]*>/g, '').trim();
                if (plainText) {
                    const lines = doc.splitTextToSize(plainText, pageWidth - 40);
                    doc.text(lines, 20, yOffset);
                    yOffset += lines.length * 7 + 10;
                }
            }

            // Add drawing if exists
            if (drawingData.paths.length > 0 && canvasRef.current) {
                const canvas = canvasRef.current.getCanvas();
                if (canvas) {
                    doc.setFontSize(16);
                    doc.text('Drawing', 20, yOffset);
                    yOffset += 10;

                    const imgData = canvas.toDataURL('image/png');
                    const imgWidth = pageWidth - 40;
                    const imgHeight = (canvas.height / canvas.width) * imgWidth;

                    // Check if image fits on current page
                    if (yOffset + imgHeight > 280) {
                        doc.addPage();
                        yOffset = 20;
                    }

                    doc.addImage(imgData, 'PNG', 20, yOffset, imgWidth, imgHeight);
                    yOffset += imgHeight + 10;
                }
            }

            // Add footer
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text(`Exported from CollabNote on ${new Date().toLocaleDateString()}`, 20, 285);

            // Save with proper filename
            doc.save(`${notebook?.title || 'notebook'}.pdf`);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Failed to export PDF. Please try again.');
        }
    };

    const handleInviteByEmail = async () => {
        if (!inviteEmail.trim()) return;
        try {
            await notebooksAPI.invite(id, { email: inviteEmail, role: inviteRole });
            setShareMessage(`✅ Invited ${inviteEmail} as ${inviteRole}`);
            setInviteEmail('');
        } catch (error) {
            setShareMessage(error.response?.data?.error || '❌ Failed to invite user');
        }
    };

    const copyShareLink = () => {
        navigator.clipboard.writeText(shareLink);
        setShareMessage('📋 Link copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="notebook-loading">
                <div className="spinner"></div>
                <p>Loading notebook...</p>
            </div>
        );
    }

    return (
        <div className="notebook-screen">
            <header className="notebook-header">
                <div className="notebook-header-left">
                    <button className="btn btn-icon" onClick={() => navigate('/')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="notebook-title">{notebook?.title}</h1>
                </div>

                <div className="notebook-header-center">
                    <div className="tab-switch">
                        <button className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
                            📝 Notes
                        </button>
                        <button className={`tab-btn ${activeTab === 'draw' ? 'active' : ''}`} onClick={() => setActiveTab('draw')}>
                            🎨 Draw
                        </button>
                    </div>
                </div>

                <div className="notebook-header-right">
                    <UserPresence users={onlineUsers} currentUser={user} />
                    <button className="btn btn-secondary btn-sm" onClick={exportToPdf} title="Export as PDF">
                        📄 Export
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={openMembersModal}>
                        ⚙️ Members
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowShareModal(true)}>
                        👥 Invite
                    </button>
                </div>
            </header>

            {activeTab === 'draw' && (
                <Toolbar
                    currentTool={currentTool}
                    setCurrentTool={setCurrentTool}
                    currentColor={currentColor}
                    setCurrentColor={setCurrentColor}
                    brushSize={brushSize}
                    setBrushSize={setBrushSize}
                    onClear={handleClearCanvas}
                    onUndo={handleUndo}
                />
            )}

            <main className="notebook-content">
                {activeTab === 'notes' ? (
                    <RichTextEditor content={textContent} onChange={handleTextChange} />
                ) : (
                    <DrawingCanvas
                        ref={canvasRef}
                        paths={drawingData.paths}
                        onDrawPath={handleDrawingPath}
                        tool={currentTool}
                        color={currentColor}
                        brushSize={brushSize}
                    />
                )}
            </main>

            {showShareModal && (
                <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
                    <div className="modal glass animate-slideUp" onClick={e => e.stopPropagation()}>
                        <h2>🔗 Invite Friends</h2>

                        <div className="share-tabs">
                            <button
                                className={`share-tab ${shareTab === 'link' ? 'active' : ''}`}
                                onClick={() => setShareTab('link')}
                            >
                                📎 Share Link
                            </button>
                            <button
                                className={`share-tab ${shareTab === 'email' ? 'active' : ''}`}
                                onClick={() => setShareTab('email')}
                            >
                                ✉️ Email Invite
                            </button>
                        </div>

                        {shareTab === 'link' && (
                            <div className="share-content">
                                <div className="input-group">
                                    <label className="input-label">Password (optional)</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Leave empty for no password"
                                        value={sharePassword}
                                        onChange={(e) => setSharePassword(e.target.value)}
                                    />
                                </div>
                                <button className="btn btn-primary" onClick={handleGenerateLink} style={{ width: '100%', marginTop: '12px' }}>
                                    Generate Link
                                </button>
                                {shareLink && (
                                    <div className="share-link-container" style={{ marginTop: '16px' }}>
                                        <input type="text" className="input" value={shareLink} readOnly />
                                        <button className="btn btn-secondary" onClick={copyShareLink}>
                                            Copy
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {shareTab === 'email' && (
                            <div className="share-content">
                                <div className="input-group">
                                    <label className="input-label">Friend's Email</label>
                                    <input
                                        type="email"
                                        className="input"
                                        placeholder="friend@example.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                    />
                                </div>
                                <div className="input-group" style={{ marginTop: '12px' }}>
                                    <label className="input-label">Role</label>
                                    <select
                                        className="input"
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value)}
                                    >
                                        <option value="editor">Editor (can edit)</option>
                                        <option value="viewer">Viewer (read only)</option>
                                    </select>
                                </div>
                                <button className="btn btn-primary" onClick={handleInviteByEmail} style={{ width: '100%', marginTop: '12px' }}>
                                    Send Invite
                                </button>
                            </div>
                        )}

                        {shareMessage && (
                            <p style={{ marginTop: '16px', textAlign: 'center', color: shareMessage.startsWith('✅') ? 'var(--success)' : shareMessage.startsWith('❌') ? 'var(--error)' : 'var(--text-secondary)' }}>
                                {shareMessage}
                            </p>
                        )}

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => {
                                setShowShareModal(false);
                                setShareMessage('');
                                setShareLink('');
                            }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Members Modal */}
            {showMembersModal && (
                <div className="modal-overlay" onClick={() => setShowMembersModal(false)}>
                    <div className="modal glass animate-slideUp" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <h2>👥 Manage Members</h2>

                        <div className="members-list" style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '16px' }}>
                            {members.map(member => (
                                <div key={member.userId?._id || member.userId} className="member-item" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px',
                                    background: 'var(--bg-secondary)',
                                    borderRadius: '8px',
                                    marginBottom: '8px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background: 'var(--accent-gradient)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: '600'
                                        }}>
                                            {member.userId?.name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                                {member.userId?.name || 'Unknown'}
                                                {member.role === 'owner' && <span style={{ color: 'var(--accent-primary)', marginLeft: '8px' }}>👑 Owner</span>}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {member.userId?.email} • {member.role}
                                            </div>
                                        </div>
                                    </div>

                                    {isOwner && member.role !== 'owner' && (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn btn-sm"
                                                style={{ background: 'var(--warning)', color: 'black' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log('Timeout clicked for:', member.userId?._id);
                                                    handleTimeoutMember(member.userId?._id, member.userId?.name);
                                                }}
                                                title="Give timeout"
                                            >
                                                ⏰
                                            </button>
                                            <button
                                                className="btn btn-sm"
                                                style={{ background: 'var(--error)' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log('Kick clicked for:', member.userId?._id);
                                                    handleKickMember(member.userId?._id, member.userId?.name);
                                                }}
                                                title="Remove member"
                                            >
                                                🚫
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {members.length === 0 && (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No members yet</p>
                            )}
                        </div>

                        {membersMessage && (
                            <p style={{
                                textAlign: 'center',
                                marginBottom: '16px',
                                color: membersMessage.startsWith('✅') ? 'var(--success)' : 'var(--error)'
                            }}>
                                {membersMessage}
                            </p>
                        )}

                        <div className="modal-actions" style={{ flexDirection: 'column', gap: '12px' }}>
                            {isOwner && (
                                <button
                                    className="btn"
                                    style={{ background: 'var(--error)', width: '100%' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('Delete clicked, isOwner:', isOwner);
                                        handleDeleteNotebook();
                                    }}
                                >
                                    🗑️ Delete Notebook
                                </button>
                            )}
                            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setShowMembersModal(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotebookScreen;
