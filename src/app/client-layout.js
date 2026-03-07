'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ClientLayout({ children }) {
    return (
        <AuthProvider>
            <ToastProvider>
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <Navbar />
                    <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                        {children}
                    </main>
                    <Footer />
                </div>
            </ToastProvider>
        </AuthProvider>
    );
}
