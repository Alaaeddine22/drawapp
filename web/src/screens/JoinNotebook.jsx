import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { notebooksAPI } from '../services/api';
import './Auth.css';

function JoinNotebook() {
    const { shareLink } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [requiresPassword, setRequiresPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [notebookTitle, setNotebookTitle] = useState('');

    useEffect(() => {
        checkLink();
    }, [shareLink]);

    const checkLink = async () => {
        try {
            const response = await notebooksAPI.checkJoin(shareLink);
            setNotebookTitle(response.data.title);

            if (response.data.requiresPassword) {
                setRequiresPassword(true);
                setLoading(false);
            } else {
                // No password required, join directly
                await joinNotebook();
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid share link');
            setLoading(false);
        }
    };

    const joinNotebook = async (pwd = null) => {
        try {
            const response = await notebooksAPI.join(shareLink, pwd);
            navigate(`/notebook/${response.data.notebook._id}`);
        } catch (err) {
            if (err.response?.data?.requiresPassword) {
                setRequiresPassword(true);
                setError('Incorrect password');
            } else {
                setError(err.response?.data?.error || 'Failed to join notebook');
            }
            setLoading(false);
        }
    };

    const handleSubmitPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        await joinNotebook(password);
    };

    if (loading && !requiresPassword) {
        return (
            <div className="auth-container">
                <div className="auth-card glass">
                    <div className="spinner"></div>
                    <p style={{ marginTop: '16px' }}>Joining notebook...</p>
                </div>
            </div>
        );
    }

    if (error && !requiresPassword) {
        return (
            <div className="auth-container">
                <div className="auth-card glass">
                    <h2>❌ Oops!</h2>
                    <p style={{ color: 'var(--error)', marginTop: '16px' }}>{error}</p>
                    <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '24px' }}>
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
            </div>

            <div className="auth-card glass animate-slideUp">
                <div className="auth-header">
                    <div className="auth-logo">🔐</div>
                    <h1>Join Notebook</h1>
                    <p className="text-muted">"{notebookTitle}" is password protected</p>
                </div>

                <form onSubmit={handleSubmitPassword} className="auth-form">
                    {error && <div className="auth-error">{error}</div>}

                    <div className="input-group">
                        <label className="input-label">Enter Password</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary auth-submit"
                        disabled={loading}
                    >
                        {loading ? <div className="spinner"></div> : 'Join Notebook'}
                    </button>
                </form>

                <div className="auth-footer">
                    <button className="btn btn-secondary" onClick={() => navigate('/')}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default JoinNotebook;
