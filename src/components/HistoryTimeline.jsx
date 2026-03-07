'use client';

import { formatDistanceToNow } from 'date-fns';
import StatusBadge from './StatusBadge';

const ACTION_CONFIG = {
    created: { label: 'Complaint Created' },
    status_changed: { label: 'Status Changed' },
    note_added: { label: 'Note Added' },
    deleted: { label: 'Complaint Removed' },
};

export default function HistoryTimeline({ history = [] }) {
    if (history.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <p className="text-small">No activity recorded yet.</p>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', paddingLeft: 24 }}>
            <div style={{
                position: 'absolute',
                left: 7,
                top: 8,
                bottom: 8,
                width: 2,
                backgroundColor: 'var(--color-gray-200)',
                borderRadius: 1,
            }} />

            {history.map((entry, idx) => {
                const config = ACTION_CONFIG[entry.action] || ACTION_CONFIG.created;
                const timeAgo = entry.created_at
                    ? formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })
                    : '';

                return (
                    <div key={entry.id || idx} style={{ position: 'relative', paddingBottom: idx < history.length - 1 ? 16 : 0 }}>
                        <div style={{
                            position: 'absolute',
                            left: -24,
                            top: 4,
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: '#ffffff',
                            border: '2px solid var(--color-gray-300)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                        </div>

                        <div style={{
                            padding: '10px 14px',
                            borderRadius: 8,
                            backgroundColor: 'var(--color-gray-50)',
                            border: '1px solid var(--color-gray-100)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: entry.note || entry.action === 'status_changed' ? 8 : 0 }}>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-gray-800)' }}>
                                    {config.label}
                                </span>
                                <span className="text-caption">{timeAgo}</span>
                            </div>

                            {entry.action === 'status_changed' && entry.from_status && entry.to_status && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: entry.note ? 8 : 0 }}>
                                    <StatusBadge status={entry.from_status} />
                                    <span style={{ color: 'var(--color-gray-400)', fontSize: '0.8125rem' }}>&rarr;</span>
                                    <StatusBadge status={entry.to_status} />
                                </div>
                            )}

                            {entry.note && (
                                <p className="text-small" style={{ lineHeight: 1.5 }}>
                                    {entry.note}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
