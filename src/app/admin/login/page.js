'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, user, isAdmin } = useAuth();
    const router = useRouter();
    const toast = useToast();

    if (user && isAdmin) {
        router.push('/admin');
        return null;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            toast.success('Signed in successfully.');
            router.push('/admin');
        } catch (err) {
            setError(err.message || 'Sign in failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container" style={{
            paddingTop: 64,
            paddingBottom: 64,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 'calc(100vh - 200px)',
        }}>
            <div className="card-elevated animate-fade-in" style={{ maxWidth: 400, width: '100%', padding: '40px 32px' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <h1 className="heading-2" style={{ marginBottom: 0, color: 'var(--color-gray-900)' }}>Admin Sign In</h1>
                </div>

                {error && (
                    <div style={{
                        padding: '10px 14px', borderRadius: 8,
                        backgroundColor: 'var(--color-status-red-light)',
                        border: '1px solid var(--color-status-red-border)',
                        fontSize: '0.8125rem', color: 'var(--color-status-red)',
                        marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
                        {loading && <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />}
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-caption" style={{ textAlign: 'center', marginTop: 20 }}>
                    Only authorized administrators can access this panel.
                </p>
            </div>
        </div>
    );
}
