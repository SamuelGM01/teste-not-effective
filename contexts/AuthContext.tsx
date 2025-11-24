
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Trainer } from '../types';

interface AuthContextType {
    user: Trainer | null;
    login: (trainer: Trainer) => void;
    logout: () => void;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: () => {},
    logout: () => {},
    isAdmin: false
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<Trainer | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('cobblemon_auth_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (trainer: Trainer) => {
        setUser(trainer);
        localStorage.setItem('cobblemon_auth_user', JSON.stringify(trainer));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('cobblemon_auth_user');
    };

    const isAdmin = user?.nick === 'CorazonS2';

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
