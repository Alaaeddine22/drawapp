import './CursorOverlay.css';

function CursorOverlay({ cursors, currentUserId }) {
    const otherCursors = cursors.filter(c => c.id !== currentUserId);

    return (
        <div className="cursor-overlay">
            {otherCursors.map(cursor => (
                <div
                    key={cursor.id}
                    className="remote-cursor"
                    style={{
                        left: cursor.x,
                        top: cursor.y,
                        '--cursor-color': cursor.color || '#6366f1'
                    }}
                >
                    <svg className="cursor-icon" viewBox="0 0 24 24" fill="var(--cursor-color)">
                        <path d="M4 4l16 7-7 2-2 7z" />
                    </svg>
                    <span className="cursor-label" style={{ backgroundColor: cursor.color || '#6366f1' }}>
                        {cursor.name}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default CursorOverlay;
