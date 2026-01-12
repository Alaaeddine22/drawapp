import './ActivityLog.css';

function ActivityLog({ activities }) {
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'edit': return '✏️';
            case 'draw': return '🎨';
            case 'comment': return '💬';
            case 'todo': return '✅';
            case 'join': return '👋';
            default: return '📝';
        }
    };

    return (
        <div className="activity-log">
            <h3>📊 Activity Log</h3>
            <div className="activity-list">
                {activities.length === 0 ? (
                    <p className="activity-empty">No activity yet</p>
                ) : (
                    activities.slice(0, 20).map((activity, index) => (
                        <div key={index} className="activity-item">
                            <span className="activity-icon">{getActionIcon(activity.action)}</span>
                            <div className="activity-content">
                                <span className="activity-user">{activity.userName}</span>
                                <span className="activity-details">{activity.details}</span>
                            </div>
                            <span className="activity-time">{formatTime(activity.timestamp)}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ActivityLog;
