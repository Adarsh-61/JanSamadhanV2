'use client';

import { memo } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import StatusBadge from './StatusBadge';

const ComplaintCard = memo(function ComplaintCard({ complaint, isAdmin = false, onStatusChange, onDelete }) {
    const {
        id,
        title,
        description,
        status,
        created_at,
        last_admin_note,
        attachments,
    } = complaint;

    const timeAgo = created_at
        ? formatDistanceToNow(new Date(created_at), { addSuffix: true })
        : '';

    const truncated = description?.length > 180
        ? description.substring(0, 180) + '...'
        : description;

    return (
        <div className="card" style={{ padding: '16px 20px', position: 'relative' }}>
            <Link href={`/complaint/${id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 className="heading-3" style={{ marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {title || 'Untitled Complaint'}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <span className="text-caption" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                {timeAgo}
                            </span>
                            {attachments && attachments.length > 0 && (
                                <span className="text-caption" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {attachments.length} file{attachments.length > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>
                    <StatusBadge status={status} />
                </div>

                <p className="text-body" style={{ marginBottom: last_admin_note ? 10 : 0 }}>
                    {truncated}
                </p>

                {last_admin_note && (
                    <div style={{
                        padding: '8px 12px',
                        borderRadius: 6,
                        backgroundColor: 'var(--color-gray-50)',
                        border: '1px solid var(--color-gray-100)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                    }}>
                        <span className="text-small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {last_admin_note}
                        </span>
                    </div>
                )}
            </Link>

            {isAdmin && (onStatusChange || complaint.id) && (
                <div style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: '1px solid var(--color-gray-100)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 8
                }}>
                    {onStatusChange && (
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onStatusChange(complaint); }}
                            className="btn btn-secondary btn-sm"
                        >
                            Update
                        </button>
                    )}
                    {isAdmin && onDelete && complaint.id && (
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(complaint); }}
                            className="btn btn-sm"
                            style={{ backgroundColor: 'var(--color-status-red)', color: 'white', border: 'none' }}
                        >
                            Delete
                        </button>
                    )}
                </div>
            )}
        </div>
    );
});

export default ComplaintCard;
