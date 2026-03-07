'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }) {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.replace('/admin/login');
        }
    }, [user, isAdmin, loading, router]);

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: 64, paddingBottom: 64, display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <div className="spinner" style={{ width: 28, height: 28 }} />
                    <p className="text-small">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (!user || !isAdmin) {
        return null;
    }

    return children;
}
