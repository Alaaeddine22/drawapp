import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { notebooksAPI } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import './Dashboard.css';

function DashboardScreen() {
    const [notebooks, setNotebooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [modalTab, setModalTab] = useState('create'); // 'create' or 'join'
    const [newTitle, setNewTitle] = useState('');
    const [creating, setCreating] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joinPassword, setJoinPassword] = useState('');
    const [joining, setJoining] = useState(false);
    const [joinMessage, setJoinMessage] = useState('');
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotebooks();
    }, []);

    const fetchNotebooks = async () => {
        try {
            const response = await notebooksAPI.getAll();
            setNotebooks(response.data.notebooks);
        } catch (error) {
            console.error('Failed to fetch notebooks:', error);
        } finally {
            setLoading(false);
        }
    };

    const createNotebook = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        setCreating(true);
        try {
            const response = await notebooksAPI.create({ title: newTitle });
            setNotebooks([response.data.notebook, ...notebooks]);
            setNewTitle('');
            setShowCreateModal(false);
            navigate(`/notebook/${response.data.notebook._id}`);
        } catch (error) {
            console.error('Failed to create notebook:', error);
        } finally {
            setCreating(false);
        }
    };

    const deleteNotebook = async (id, e) => {
        e.stopPropagation();
        if (!confirm('Delete this notebook?')) return;

        try {
            await notebooksAPI.delete(id);
            setNotebooks(notebooks.filter(n => n._id !== id));
        } catch (error) {
            console.error('Failed to delete notebook:', error);
        }
    };

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const joinWithCode = async (e) => {
        e.preventDefault();
        if (!joinCode.trim()) return;

        setJoining(true);
        setJoinMessage('');

        try {
            // Extract share code from URL or just use the code
            let shareLink = joinCode.trim();
            if (shareLink.includes('/join/')) {
                shareLink = shareLink.split('/join/').pop();
            }

            // Check if password is required
            const checkRes = await notebooksAPI.checkJoin(shareLink);

            if (checkRes.data.requiresPassword && !joinPassword) {
                setJoinMessage('⚠️ This notebook requires a password');
                setJoining(false);
                return;
            }

            // Join the notebook
            const response = await notebooksAPI.join(shareLink, joinPassword || null);
            setJoinMessage('✅ Joined successfully!');

            // Add to notebooks list and navigate
            setNotebooks([response.data.notebook, ...notebooks]);
            setTimeout(() => {
                setShowCreateModal(false);
                navigate(`/notebook/${response.data.notebook._id}`);
            }, 500);

        } catch (error) {
            setJoinMessage(error.response?.data?.error || '❌ Failed to join notebook');
        } finally {
            setJoining(false);
        }
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="header-left">
                    <div className="brand">
                        <div className="brand-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <span className="brand-name">CollabNote</span>
                    </div>
                </div>

                <div className="header-right">
                    <ThemeToggle />
                    <div className="user-menu">
                        <div className="avatar">{getInitials(user?.name)}</div>
                        <span className="user-name">{user?.name}</span>
                        <button onClick={logout} className="btn btn-secondary btn-sm">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="dashboard-main">
                <div className="container">
                    <div className="dashboard-title">
                        <h1>Your Notebooks</h1>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            New Notebook
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading notebooks...</p>
                        </div>
                    ) : notebooks.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"></path>
                                    <path d="M12 8v8M8 12h8"></path>
                                </svg>
                            </div>
                            <h3>No notebooks yet</h3>
                            <p>Create your first notebook to start collaborating!</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowCreateModal(true)}
                            >
                                Create Notebook
                            </button>
                        </div>
                    ) : (
                        <div className="notebooks-grid">
                            {notebooks.map((notebook) => (
                                <div
                                    key={notebook._id}
                                    className="notebook-card card card-interactive"
                                    onClick={() => navigate(`/notebook/${notebook._id}`)}
                                >
                                    <div className="notebook-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 19.5A2.5 2.5 0 016.5 17H20"></path>
                                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="notebook-title">{notebook.title}</h3>
                                    <div className="notebook-meta">
                                        <span className="notebook-date">
                                            {formatDate(notebook.updatedAt || notebook.createdAt)}
                                        </span>
                                        <span className="notebook-members badge badge-accent">
                                            {notebook.members?.length || 1} member{notebook.members?.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    {notebook.ownerId?._id === user?._id && (
                                        <button
                                            className="notebook-delete btn-icon"
                                            onClick={(e) => deleteNotebook(notebook._id, e)}
                                            title="Delete notebook"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {showCreateModal && (
                <div className="modal-overlay" onClick={() => { setShowCreateModal(false); setJoinMessage(''); }}>
                    <div className="modal glass animate-slideUp" onClick={e => e.stopPropagation()}>
                        <div className="share-tabs" style={{ marginBottom: '20px' }}>
                            <button
                                className={`share-tab ${modalTab === 'create' ? 'active' : ''}`}
                                onClick={() => setModalTab('create')}
                            >
                                ➕ Create New
                            </button>
                            <button
                                className={`share-tab ${modalTab === 'join' ? 'active' : ''}`}
                                onClick={() => setModalTab('join')}
                            >
                                🔗 Join with Code
                            </button>
                        </div>

                        {modalTab === 'create' && (
                            <form onSubmit={createNotebook}>
                                <div className="input-group">
                                    <label className="input-label">Notebook Title</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="My awesome notebook"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        autoFocus
                                        required
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowCreateModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={creating || !newTitle.trim()}
                                    >
                                        {creating ? <div className="spinner"></div> : 'Create'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {modalTab === 'join' && (
                            <form onSubmit={joinWithCode}>
                                <div className="input-group">
                                    <label className="input-label">Invitation Link or Code</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="http://localhost:5173/join/abc123 or just abc123"
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value)}
                                        autoFocus
                                        required
                                    />
                                </div>
                                <div className="input-group" style={{ marginTop: '12px' }}>
                                    <label className="input-label">Password (if required)</label>
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="Leave empty if no password"
                                        value={joinPassword}
                                        onChange={(e) => setJoinPassword(e.target.value)}
                                    />
                                </div>
                                {joinMessage && (
                                    <p style={{
                                        marginTop: '12px',
                                        textAlign: 'center',
                                        color: joinMessage.startsWith('✅') ? 'var(--success)' :
                                            joinMessage.startsWith('⚠️') ? 'var(--warning)' : 'var(--error)'
                                    }}>
                                        {joinMessage}
                                    </p>
                                )}
                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => { setShowCreateModal(false); setJoinMessage(''); }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={joining || !joinCode.trim()}
                                    >
                                        {joining ? <div className="spinner"></div> : 'Join Notebook'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardScreen;
