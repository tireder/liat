// Auth Context - Session management with secure storage
// Per security-agent-pack: Use expo-secure-store, not AsyncStorage

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

const PHONE_KEY = 'liat_user_phone';
const NAME_KEY = 'liat_user_name';
const SESSION_KEY = 'liat_session_active';

interface AuthState {
    phone: string | null;
    name: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

interface AuthContextValue extends AuthState {
    login: (phone: string, name?: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        phone: null,
        name: null,
        isAuthenticated: false,
        isLoading: true,
    });

    // Load session on mount
    useEffect(() => {
        async function loadSession() {
            try {
                const phone = await SecureStore.getItemAsync(PHONE_KEY);
                const name = await SecureStore.getItemAsync(NAME_KEY);
                const session = await SecureStore.getItemAsync(SESSION_KEY);

                if (phone && session === 'true') {
                    setState({
                        phone,
                        name,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } else {
                    setState({
                        phone: null,
                        name: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            } catch (error) {
                console.error('Error loading session:', error);
                setState({
                    phone: null,
                    name: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        }

        loadSession();
    }, []);

    const login = async (phone: string, name?: string) => {
        try {
            await SecureStore.setItemAsync(PHONE_KEY, phone);
            await SecureStore.setItemAsync(SESSION_KEY, 'true');
            if (name) {
                await SecureStore.setItemAsync(NAME_KEY, name);
            }

            setState({
                phone,
                name: name || null,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            console.error('Error saving session:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await SecureStore.deleteItemAsync(PHONE_KEY);
            await SecureStore.deleteItemAsync(NAME_KEY);
            await SecureStore.deleteItemAsync(SESSION_KEY);

            setState({
                phone: null,
                name: null,
                isAuthenticated: false,
                isLoading: false,
            });
        } catch (error) {
            console.error('Error clearing session:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
