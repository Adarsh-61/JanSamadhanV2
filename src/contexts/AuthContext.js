'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    async function handleSession(session) {
        if (session?.user) {
            setUser(session.user);
            // Check if user is admin by looking in admin_users table
            const { data } = await supabase
                .from('admin_users')
                .select('id')
                .eq('id', session.user.id)
                .single();
            setIsAdmin(!!data);
        } else {
            setUser(null);
            setIsAdmin(false);
        }
    }

    async function login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;

        // Check admin status
        const { data: adminData } = await supabase
            .from('admin_users')
            .select('id')
            .eq('id', data.user.id)
            .single();

        if (!adminData) {
            await supabase.auth.signOut();
            throw new Error('Access denied. This account is not an admin.');
        }

        return data;
    }

    async function logout() {
        await supabase.auth.signOut();
        setUser(null);
        setIsAdmin(false);
    }

    return (
        <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
