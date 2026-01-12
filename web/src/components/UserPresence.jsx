import './UserPresence.css';

function UserPresence({ users, currentUser }) {
    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
    };

    const displayUsers = users.slice(0, 5);
    const extraCount = users.length - 5;

    return (
        <div className="user-presence">
            <div className="presence-avatars">
                {displayUsers.map((user, index) => (
                    <div
                        key={user.id || index}
                        className="presence-avatar"
                        style={{
                            backgroundColor: user.color || '#6366f1',
                            zIndex: displayUsers.length - index
                        }}
                        title={user.name}
                    >
                        {getInitials(user.name)}
                    </div>
                ))}
                {extraCount > 0 && (
                    <div className="presence-avatar extra">
                        +{extraCount}
                    </div>
                )}
            </div>
            {users.length > 0 && (
                <span className="presence-count">
                    {users.length} online
                </span>
            )}
        </div>
    );
}

export default UserPresence;
