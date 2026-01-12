import { useState } from 'react';
import './Comments.css';

function Comments({ comments, onAddComment, currentUser }) {
    const [newComment, setNewComment] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newComment.trim()) {
            onAddComment(newComment.trim());
            setNewComment('');
        }
    };

    const formatTime = (date) => {
        const d = new Date(date);
        return d.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="comments-panel">
            <div className="comments-header">
                <h3>💬 Comments</h3>
                <span className="comments-count">{comments.length}</span>
            </div>

            <div className="comments-list">
                {comments.length === 0 ? (
                    <p className="comments-empty">No comments yet. Start the discussion!</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="comment-item">
                            <div className="comment-avatar">
                                {comment.userName?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="comment-content">
                                <div className="comment-meta">
                                    <span className="comment-author">{comment.userName}</span>
                                    <span className="comment-time">{formatTime(comment.createdAt)}</span>
                                </div>
                                <p className="comment-text">{comment.text}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSubmit} className="comment-form">
                <input
                    type="text"
                    className="comment-input"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className="comment-send-btn" disabled={!newComment.trim()}>
                    Send
                </button>
            </form>
        </div>
    );
}

export default Comments;
