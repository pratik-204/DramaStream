import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (token) {
                    apiClient.setToken(token);
                    const response = await apiClient.getCurrentUser();
                    setCurrentUser(response.user);
                }
            } catch (error) {
                console.error('Failed to restore auth:', error);
                localStorage.removeItem('authToken');
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        const authData = await apiClient.login(email, password);
        setCurrentUser(authData.user);
        return authData;
    };

    const signup = async (data) => {
        const authData = await apiClient.signup(data.email, data.password, data.username);
        setCurrentUser(authData.user);
        return authData;
    };

    const logout = async () => {
        try {
            await apiClient.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        login,
        signup,
        logout,
        isAuthenticated: !!currentUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};