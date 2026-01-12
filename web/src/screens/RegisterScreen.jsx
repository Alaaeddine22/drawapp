import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { authAPI } from '../services/api';
import './Auth.css';

function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [resending, setResending] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await authAPI.register({ name, email, password });
            if (response.data.requiresVerification) {
                setVerificationSent(true);
                setSuccess('Verification code sent to your email!');
            } else if (response.data.token) {
                login(response.data.user, response.data.token);
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setResending(true);
        setError('');
        try {
            await authAPI.resendCode({ email });
            setSuccess('Verification code resent!');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to resend code');
        } finally {
            setResending(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setVerifying(true);
        setError('');

        try {
            const response = await authAPI.verifyCode({ email, code: verificationCode });
            login(response.data.user, response.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid verification code');
        } finally {
            setVerifying(false);
        }
    };

    // Verification code entry screen
    if (verificationSent) {
        return (
            <div className="auth-container">
                <div className="auth-background">
                    <div className="gradient-orb orb-1"></div>
                    <div className="gradient-orb orb-2"></div>
                    <div className="gradient-orb orb-3"></div>
                </div>

                <div className="auth-card glass animate-slideUp">
                    <div className="auth-header">
                        <div className="auth-logo verify-icon">📧</div>
                        <h1>Enter Verification Code</h1>
                        <p className="text-muted">
                            We've sent a 6-digit code to:<br />
                            <strong>{email}</strong>
                        </p>
                    </div>

                    <form onSubmit={handleVerifyCode} className="auth-form">
                        {error && <div className="auth-error">{error}</div>}
                        {success && <div className="auth-success">{success}</div>}

                        <div className="input-group">
                            <label className="input-label">Verification Code</label>
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

                        <button
                            type="submit"
                            className="btn btn-primary auth-submit"
                            disabled={verifying || verificationCode.length !== 6}
                        >
                            {verifying ? <div className="spinner"></div> : 'Verify Email'}
                        </button>
                    </form>

                    <div className="verification-buttons" style={{ marginTop: '20px' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={handleResendCode}
                            disabled={resending}
                            style={{ width: '100%' }}
                        >
                            {resending ? 'Sending...' : 'Resend Code'}
                        </button>
                    </div>

                    <div className="auth-footer">
                        <p>
                            Wrong email?{' '}
                            <button
                                className="link-button"
                                onClick={() => setVerificationSent(false)}
                            >
                                Go back
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

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
                    <h1>Create Account</h1>
                    <p className="text-muted">Start collaborating with CollabNote</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="auth-error">{error}</div>}

                    <div className="input-group">
                        <label className="input-label">Name</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Email</label>
                        <input
                            type="email"
                            className="input"
                            placeholder="you@gmail.com"
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

                    <div className="input-group">
                        <label className="input-label">Confirm Password</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary auth-submit"
                        disabled={loading}
                    >
                        {loading ? <div className="spinner"></div> : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RegisterScreen;
