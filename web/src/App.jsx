import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authAPI } from './services/api';
import { connectSocket, disconnectSocket } from './sockets/socketClient';
import { ThemeProvider } from './context/ThemeContext';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import NotebookScreen from './screens/NotebookScreen';
import JoinNotebook from './screens/JoinNotebook';

// Auth Context
export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (token && savedUser) {
                try {
                    const response = await authAPI.getMe();
                    setUser(response.data.user);
                    connectSocket(token);
                } catch (error) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        initAuth();

        return () => {
            disconnectSocket();
        };
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        connectSocket(token);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        disconnectSocket();
        setUser(null);
        window.location.href = '/login';
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <ThemeProvider>
            <AuthContext.Provider value={{ user, login, logout }}>
                <BrowserRouter>
                    <Routes>
                        <Route
                            path="/login"
                            element={user ? <Navigate to="/" /> : <LoginScreen />}
                        />
                        <Route
                            path="/register"
                            element={user ? <Navigate to="/" /> : <RegisterScreen />}
                        />
                        <Route
                            path="/"
                            element={user ? <DashboardScreen /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/notebook/:id"
                            element={user ? <NotebookScreen /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/join/:shareLink"
                            element={user ? <JoinNotebook /> : <Navigate to="/login" />}
                        />
                    </Routes>
                </BrowserRouter>
            </AuthContext.Provider>
        </ThemeProvider>
    );
}

export default App;
