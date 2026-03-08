'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
    const pathname = usePathname();
    const { user, isAdmin, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
        { href: '/', label: 'Complaints', icon: 'home' },
        { href: '/submit', label: 'Submit', icon: 'edit' },
    ];

    if (isAdmin) {
        navLinks.push({ href: '/admin', label: 'Dashboard', icon: 'settings' });
    }

    return (
        <nav
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 40,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                borderBottom: '1px solid var(--color-gray-200)',
            }}
        >
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
                <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-gray-900)', letterSpacing: '-0.02em' }}>
                        JanSamadhan+
                    </span>
                </Link>

                <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {navLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="btn-ghost"
                            style={{
                                textDecoration: 'none',
                                color: pathname === link.href ? 'var(--color-primary-600)' : 'var(--color-gray-600)',
                                backgroundColor: pathname === link.href ? 'var(--color-primary-50)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: '0.8125rem',
                                fontWeight: 500,
                                borderRadius: 6,
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div style={{ width: 1, height: 20, backgroundColor: 'var(--color-gray-200)', margin: '0 8px' }} />
                    {user ? (
                        <button onClick={logout} className="btn btn-secondary btn-sm">
                            Sign out
                        </button>
                    ) : (
                        <Link href="/admin/login" style={{ textDecoration: 'none' }}>
                            <button className="btn btn-secondary btn-sm">
                                Admin
                            </button>
                        </Link>
                    )}
                </div>

                <button
                    className="mobile-only btn-ghost"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                    style={{ padding: 8 }}
                >
                    {mobileOpen ? 'Close Menu' : 'Menu'}
                </button>
            </div>

            {mobileOpen && (
                <div
                    className="mobile-only"
                    style={{
                        padding: '8px 16px 16px',
                        borderTop: '1px solid var(--color-gray-100)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        backgroundColor: '#ffffff',
                    }}
                >
                    {navLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            style={{
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 12px',
                                borderRadius: 8,
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: pathname === link.href ? 'var(--color-primary-600)' : 'var(--color-gray-700)',
                                backgroundColor: pathname === link.href ? 'var(--color-primary-50)' : 'transparent',
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <hr className="divider" style={{ margin: '8px 0' }} />
                    {user ? (
                        <button
                            onClick={() => { logout(); setMobileOpen(false); }}
                            className="btn btn-secondary"
                            style={{ justifyContent: 'flex-start', width: '100%' }}
                        >
                            Sign out
                        </button>
                    ) : (
                        <Link href="/admin/login" style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                            <button className="btn btn-secondary" style={{ width: '100%' }}>
                                Admin Login
                            </button>
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}
