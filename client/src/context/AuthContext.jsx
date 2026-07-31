import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    // Configure axios to always fetch the latest Supabase session
    useEffect(() => {
        const interceptor = axios.interceptors.request.use(async (config) => {
            // Get session directly from Supabase to prevent React state race conditions
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            
            if (currentSession?.access_token) {
                config.headers.Authorization = `Bearer ${currentSession.access_token}`;
                localStorage.setItem('token', currentSession.access_token);
            } else {
                const localToken = localStorage.getItem('token');
                if (localToken) {
                    config.headers.Authorization = `Bearer ${localToken}`;
                }
            }
            return config;
        });

        return () => {
            axios.interceptors.request.eject(interceptor);
        };
    }, []);

    // Sync the local user profile with the backend after authentication
    const syncUserProfile = async (supabaseUser, accessToken, providerRefreshToken) => {
        try {
            const res = await axios.post('/api/auth/sync-profile', {
                supabaseUserId: supabaseUser.id,
                username: supabaseUser.user_metadata?.username || supabaseUser.email.split('@')[0],
                email: supabaseUser.email,
                providerRefreshToken
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

    // Refresh user profile from DB (call this to get latest xp/level/streak)
    const refreshUser = async () => {
        if (!session?.access_token) return;
        try {
            const res = await axios.get('/api/auth/profile', {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            if (res.data) {
                setUser(prev => ({ ...prev, ...res.data }));
            }
        } catch (error) {
            console.warn('refreshUser failed, silently ignoring:', error?.response?.status);
        }
    };

    // Initialize — check for existing Supabase session
    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { session: existingSession } } = await supabase.auth.getSession();

                if (existingSession) {
                    setSession(existingSession);
                    if (existingSession.provider_token) {
                        localStorage.setItem('google_access_token', existingSession.provider_token);
                    }
                    const localUser = await syncUserProfile(existingSession.user, existingSession.access_token, existingSession.provider_refresh_token);
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

            if (newSession?.provider_token) {
                localStorage.setItem('google_access_token', newSession.provider_token);
            }

            if (event === 'SIGNED_IN' && newSession) {
                const localUser = await syncUserProfile(newSession.user, newSession.access_token, newSession.provider_refresh_token);
                setUser(localUser);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                localStorage.removeItem('google_access_token');
            } else if (event === 'TOKEN_REFRESHED' && newSession) {
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
        if (data.session?.provider_token) {
            localStorage.setItem('google_access_token', data.session.provider_token);
        }
        const localUser = await syncUserProfile(data.user, data.session.access_token, null);
        setUser(localUser);
    };

    const loginWithGoogle = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent'
                },
                scopes: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly'
            }
        });

        if (error) {
            throw error;
        }
        return data;
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

        if (data.session) {
            setSession(data.session);
            if (data.session?.provider_token) {
                localStorage.setItem('google_access_token', data.session.provider_token);
            }
            const localUser = await syncUserProfile(data.user, data.session.access_token);
            setUser(localUser);
        }

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
        localStorage.setItem('google_access_token', 'demo_google_access_token');
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (e) {}
        setSession(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('google_access_token');
    };

    const isExamMode = user?.is_in_exam_mode || false;

    return (
        <AuthContext.Provider value={{ user, setUser, session, login, loginWithGoogle, loginDemo, register, logout, loading, isExamMode, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

