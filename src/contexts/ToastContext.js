'use client';

import { createContext, useContext, useCallback, useState } from 'react';

const ToastContext = createContext(null);

const TOAST_STYLES = {
    success: {
        backgroundColor: 'var(--color-status-green-light)',
        borderColor: 'var(--color-status-green-border)',
        iconColor: 'var(--color-status-green)',
        textColor: 'var(--color-status-green)',
    },
    error: {
        backgroundColor: 'var(--color-status-red-light)',
        borderColor: 'var(--color-status-red-border)',
        iconColor: 'var(--color-status-red)',
        textColor: 'var(--color-status-red)',
    },
    info: {
        backgroundColor: 'var(--color-primary-50)',
        borderColor: 'var(--color-primary-200)',
        iconColor: 'var(--color-primary-600)',
        textColor: 'var(--color-primary-700)',
    },
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type, exiting: false }]);

        setTimeout(() => {
            setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 200);
        }, duration);
    }, []);

    const toast = {
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        info: (msg) => addToast(msg, 'info'),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div
                role="status"
                aria-live="polite"
                style={{
                    position: 'fixed',
                    top: 16,
                    right: 16,
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    maxWidth: 360,
                    width: '100%',
                    pointerEvents: 'none',
                }}
            >
                {toasts.map(t => {
                    const style = TOAST_STYLES[t.type] || TOAST_STYLES.info;
                    return (
                        <div
                            key={t.id}
                            className={t.exiting ? 'toast-exit' : 'toast-enter'}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '12px 16px',
                                borderRadius: 8,
                                backgroundColor: style.backgroundColor,
                                border: `1px solid ${style.borderColor}`,
                                fontSize: '0.8125rem',
                                fontWeight: 500,
                                color: style.textColor,
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                                pointerEvents: 'auto',
                            }}
                        >
                            <span>{t.message}</span>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
