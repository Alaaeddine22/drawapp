import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket = null;

export const connectSocket = (token) => {
    if (socket?.connected) {
        return socket;
    }

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
        console.log('🔌 Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('🔌 Socket connection error:', error.message);
    });

    socket.on('error', (error) => {
        console.error('🔌 Socket error:', error);
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const getSocket = () => socket;

// Notebook actions
export const joinNotebook = (notebookId) => {
    if (socket) {
        socket.emit('join-notebook', notebookId);
    }
};

export const leaveNotebook = (notebookId) => {
    if (socket) {
        socket.emit('leave-notebook', notebookId);
    }
};

// Text updates
export const emitTextUpdate = (notebookId, textContent, cursorPosition) => {
    if (socket) {
        socket.emit('text-update', { notebookId, textContent, cursorPosition });
    }
};

// Drawing updates
export const emitDrawingUpdate = (notebookId, path, action) => {
    if (socket) {
        socket.emit('drawing-update', { notebookId, path, action });
    }
};

// Cursor updates
export const emitCursorUpdate = (notebookId, position) => {
    if (socket) {
        socket.emit('cursor-update', { notebookId, position });
    }
};

export default {
    connect: connectSocket,
    disconnect: disconnectSocket,
    getSocket,
    joinNotebook,
    leaveNotebook,
    emitTextUpdate,
    emitDrawingUpdate,
    emitCursorUpdate
};
