export default function Footer() {
    return (
        <footer style={{ marginTop: 'auto', padding: '48px 0 32px' }}>
            <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ height: 1, backgroundColor: 'var(--color-gray-200)', width: '100%' }} />

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-gray-900)' }}>
                        JanSamadhan
                    </div>
                    <div className="text-small" style={{ color: 'var(--color-gray-500)', maxWidth: 500 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)', display: 'inline-block' }}>
                            An open-source project by{' '}
                            <a
                                href="https://github.com/Adarsh-61/JanSamadhan"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'inherit', textDecoration: 'underline' }}
                            >
                                Adarsh-61
                            </a>.
                            Currently running as a demo. No sensitive data.
                        </span>
                    </div>
                    <div className="text-caption" style={{ color: 'var(--color-gray-400)', marginTop: 8 }}>
                        &copy; 2026 Adarsh-61. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}
