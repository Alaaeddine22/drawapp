import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { authAPI } from '../services/api';
import './Auth.css';

function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Forgot password states
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetStep, setResetStep] = useState(1); // 1=email, 2=code+password
    const [resetLoading, setResetLoading] = useState(false);

    // Verification modal for unverified users
    const [showVerification, setShowVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationEmail, setVerificationEmail] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.login({ email, password });
            login(response.data.user, response.data.token);
            navigate('/');
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData?.requiresVerification) {
                setVerificationEmail(errorData.email);
                setShowVerification(true);
            } else {
                setError(errorData?.error || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSendResetCode = async (e) => {
        e.preventDefault();
        if (!resetEmail) {
            setError('Please enter your email address');
            return;
        }

        setResetLoading(true);
        setError('');

        try {
            await authAPI.forgotPassword({ email: resetEmail });
            setSuccess('Reset code sent to your email!');
            setResetStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send reset code');
        } finally {
            setResetLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setResetLoading(true);
        setError('');

        try {
            await authAPI.resetPassword({ email: resetEmail, code: resetCode, newPassword });
            setSuccess('Password reset successfully! Please login.');
            setShowForgotPassword(false);
            setResetStep(1);
            setResetEmail('');
            setResetCode('');
            setNewPassword('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setResetLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authAPI.verifyCode({ email: verificationEmail, code: verificationCode });
            login(response.data.user, response.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            <div className="auth-card glass animate-slideUp">
                <div className="auth-header">
                    <div className="auth-logo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <h1>Welcome Back</h1>
                    <p className="text-muted">Sign in to continue to CollabNote</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="auth-error">{error}</div>}
                    {success && <div className="auth-success">{success}</div>}

                    <div className="input-group">
                        <label className="input-label">Email</label>
                        <input
                            type="email"
                            className="input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="button"
                        className="forgot-password-link"
                        onClick={() => setShowForgotPassword(true)}
                    >
                        Forgot Password?
                    </button>

                    <button
                        type="submit"
                        className="btn btn-primary auth-submit"
                        disabled={loading}
                    >
                        {loading ? <div className="spinner"></div> : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/register">Create one</Link>
                    </p>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
                    <div className="modal-content glass" onClick={e => e.stopPropagation()}>
                        <h2>🔑 Reset Password</h2>

                        {resetStep === 1 ? (
                            <form onSubmit={handleSendResetCode}>
                                <p className="text-muted">Enter your email to receive a reset code</p>

                                <div className="input-group">
                                    <input
                                        type="email"
                                        className="input"
                                        placeholder="your-email@gmail.com"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                {error && <div className="auth-error">{error}</div>}

                                <div className="modal-buttons">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowForgotPassword(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={resetLoading}
                                    >
                                        {resetLoading ? <div className="spinner"></div> : 'Send Code'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword}>
                                <p className="text-muted">Enter the code sent to {resetEmail}</p>

                                <div className="input-group">
                                    <label className="input-label">Reset Code</label>
                                    <input
                                        type="text"
                                        className="input code-input"
                                        placeholder="123456"
                                        value={resetCode}
                                        onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        maxLength={6}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">New Password</label>
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                {error && <div className="auth-error">{error}</div>}
                                {success && <div className="auth-success">{success}</div>}

                                <div className="modal-buttons">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => { setResetStep(1); setError(''); }}
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={resetLoading || resetCode.length !== 6}
                                    >
                                        {resetLoading ? <div className="spinner"></div> : 'Reset Password'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Email Verification Modal */}
            {showVerification && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <h2>📧 Verify Your Email</h2>
                        <p className="text-muted">Enter the verification code sent to {verificationEmail}</p>

                        <form onSubmit={handleVerifyCode}>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="input code-input"
                                    placeholder="123456"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    required
                                />
                            </div>

                            {error && <div className="auth-error">{error}</div>}

                            <div className="modal-buttons">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowVerification(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading || verificationCode.length !== 6}
                                >
                                    {loading ? <div className="spinner"></div> : 'Verify'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LoginScreen;
