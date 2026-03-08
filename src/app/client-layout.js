'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function ReCaptchaWrapper({ children }) {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) return children;
    return (
        <GoogleReCaptchaProvider reCaptchaKey={siteKey}>
            {children}
        </GoogleReCaptchaProvider>
    );
}

export default function ClientLayout({ children }) {
    return (
        <AuthProvider>
            <ToastProvider>
                <ReCaptchaWrapper>
                    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                        <Navbar />
                        <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                            {children}
                        </main>
                        <Footer />
                    </div>
                </ReCaptchaWrapper>
            </ToastProvider>
        </AuthProvider>
    );
}
