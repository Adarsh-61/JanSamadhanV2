'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-client';
import { useComplaintHistory } from '@/hooks/useComplaintHistory';
import StatusBadge from '@/components/StatusBadge';
import HistoryTimeline from '@/components/HistoryTimeline';
import { formatDistanceToNow, format } from 'date-fns';

export default function ComplaintDetail() {
    const { id } = useParams();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { history, loading: historyLoading } = useComplaintHistory(id);

    useEffect(() => {
        if (!id) return;

        async function fetchComplaint() {
            const { data, error: err } = await supabase
                .from('complaints')
                .select('*')
                .eq('id', id)
                .single();

            if (err) setError('Complaint not found.');
            else setComplaint(data);
            setLoading(false);
        }

        fetchComplaint();

        const channel = supabase
            .channel(`complaint-${id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'complaints',
                filter: `id=eq.${id}`,
            }, (payload) => { setComplaint(payload.new); })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [id]);

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: 32 }}>
                <div className="skeleton" style={{ height: 280 }} />
            </div>
        );
    }

    if (error || !complaint) {
        return (
            <div className="container" style={{ paddingTop: 64, paddingBottom: 64 }}>
                <div className="card" style={{ padding: '48px 24px', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
                    <h2 className="heading-2" style={{ marginBottom: 8 }}>Complaint Not Found</h2>
                    <p className="text-body" style={{ marginBottom: 20 }}>
                        This complaint may have been removed or the link may be incorrect.
                    </p>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <button className="btn btn-primary">
                            Back to Board
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
                <Link href="/" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    color: 'var(--color-gray-500)', textDecoration: 'none', fontSize: '0.8125rem',
                    fontWeight: 500, marginBottom: 20, transition: 'color 0.15s',
                }}>
                    <span style={{ fontSize: '1rem', lineHeight: 1 }}>&larr;</span> Back to all complaints
                </Link>

                <div className="card-elevated" style={{ padding: 28, marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                        <div>
                            <h1 className="heading-1" style={{ marginBottom: 8, fontSize: '1.375rem' }}>
                                {complaint.title || 'Untitled Complaint'}
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                                <span className="text-small" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {complaint.created_at && (
                                        <>
                                            {format(new Date(complaint.created_at), 'MMM d, yyyy')}
                                            {' '}
                                            ({formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })})
                                        </>
                                    )}
                                </span>
                            </div>
                        </div>
                        <StatusBadge status={complaint.status} />
                    </div>

                    <hr className="divider" style={{ margin: '16px 0' }} />

                    <div style={{ marginBottom: 20 }}>
                        <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--color-gray-700)', whiteSpace: 'pre-wrap' }}>
                            {complaint.description}
                        </p>
                    </div>

                    {complaint.attachments && complaint.attachments.length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                            <h3 className="text-small" style={{ fontWeight: 600, marginBottom: 8, color: 'var(--color-gray-700)' }}>
                                Attachments ({complaint.attachments.length})
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {complaint.attachments.map((att, idx) => (
                                    <a
                                        key={idx}
                                        href={att.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            padding: '8px 12px', borderRadius: 6,
                                            backgroundColor: 'var(--color-gray-50)',
                                            border: '1px solid var(--color-gray-200)',
                                            textDecoration: 'none', color: 'var(--color-gray-700)', fontSize: '0.8125rem',
                                            transition: 'border-color 0.15s ease',
                                        }}
                                    >
                                        <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {att.name}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {complaint.last_admin_note && (
                        <div style={{
                            padding: '14px 16px', borderRadius: 8,
                            backgroundColor: 'var(--color-primary-50)',
                            border: '1px solid var(--color-primary-100)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary-700)' }}>Admin Response</span>
                            </div>
                            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-gray-700)' }}>
                                {complaint.last_admin_note}
                            </p>
                        </div>
                    )}
                </div>

                <div className="card-elevated" style={{ padding: 24 }}>
                    <h2 className="heading-3" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        Activity History
                    </h2>
                    {historyLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 56 }} />)}
                        </div>
                    ) : (
                        <HistoryTimeline history={history} />
                    )}
                </div>
            </div>
        </div>
    );
}
