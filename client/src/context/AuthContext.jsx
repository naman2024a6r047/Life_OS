import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    // Configure axios to automatically attach the Supabase access token and keep localStorage token synced
    useEffect(() => {
        if (session?.access_token) {
            localStorage.setItem('token', session.access_token);
        } else {
            localStorage.removeItem('token');
        }

        const interceptor = axios.interceptors.request.use((config) => {
            if (session?.access_token) {
                config.headers.Authorization = `Bearer ${session.access_token}`;
            }
            return config;
        });

        return () => {
            axios.interceptors.request.eject(interceptor);
        };
    }, [session]);

    // Sync the local user profile with the backend after authentication
    const syncUserProfile = async (supabaseUser, accessToken) => {
        try {
            const res = await axios.post('/api/auth/sync-profile', {
                supabaseUserId: supabaseUser.id,
                username: supabaseUser.user_metadata?.username || supabaseUser.email.split('@')[0],
                email: supabaseUser.email
            }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            return res.data.user;
        } catch (error) {
            console.error('Profile sync failed:', error);
            // Fallback: return basic user info from Supabase
            return {
                id: supabaseUser.id,
                username: supabaseUser.user_metadata?.username || supabaseUser.email.split('@')[0],
                email: supabaseUser.email,
                xp: 0,
                level: 1
            };
        }
    };

    // Initialize — check for existing Supabase session
    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { session: existingSession } } = await supabase.auth.getSession();

                if (existingSession) {
                    setSession(existingSession);
                    const localUser = await syncUserProfile(existingSession.user, existingSession.access_token);
                    setUser(localUser);
                }
            } catch (error) {
                console.error('Auth init error:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Listen for auth state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            setSession(newSession);

            if (event === 'SIGNED_IN' && newSession) {
                const localUser = await syncUserProfile(newSession.user, newSession.access_token);
                setUser(localUser);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            } else if (event === 'TOKEN_REFRESHED' && newSession) {
                // Session refreshed — keep user as-is, just update session
                setSession(newSession);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw error;
        }

        setSession(data.session);
        const localUser = await syncUserProfile(data.user, data.session.access_token);
        setUser(localUser);
    };

    const register = async (username, email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username }
            }
        });

        if (error) {
            throw error;
        }

        // If email confirmation is disabled, user gets a session immediately
        if (data.session) {
            setSession(data.session);
            const localUser = await syncUserProfile(data.user, data.session.access_token);
            setUser(localUser);
        }

        // Also create the local profile via backend
        try {
            await axios.post('/api/auth/sync-profile', {
                supabaseUserId: data.user.id,
                username,
                email
            }, {
                headers: data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {}
            });
        } catch (syncErr) {
            console.error('Post-register profile sync error:', syncErr);
        }
    };

    const loginDemo = () => {
        const demoUser = {
            id: 'demo_user_naman',
            username: 'Naman',
            email: 'naman@lifeos.dev',
            xp: 1825,
            level: 12,
            current_streak: 32
        };
        setUser(demoUser);
        setSession({ access_token: 'demo_token' });
        localStorage.setItem('token', 'demo_token');
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (e) {}
        setSession(null);
        setUser(null);
        localStorage.removeItem('token');
    };

    const isExamMode = user?.is_in_exam_mode || false;

    return (
        <AuthContext.Provider value={{ user, setUser, session, login, loginDemo, register, logout, loading, isExamMode }}>
            {children}
        </AuthContext.Provider>
    );
};
