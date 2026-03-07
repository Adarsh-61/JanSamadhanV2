'use client';

import { useState } from 'react';
import StatusBadge from './StatusBadge';

const STATUS_OPTIONS = [
    { value: 'no_action', label: 'No Action' },
    { value: 'working', label: 'In Progress' },
    { value: 'solved', label: 'Resolved' },
];

export default function StatusChangeModal({ complaint, onSave, onClose }) {
    const [newStatus, setNewStatus] = useState(complaint.status);
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const noteRequired = newStatus === 'working' || newStatus === 'solved';
    const noteValid = note.trim().length > 0;
    const canSave = newStatus !== complaint.status && (!noteRequired || noteValid);

    async function handleSave() {
        if (!canSave) return;
        setError('');
        setSaving(true);
        try {
            await onSave(complaint.id, newStatus, note.trim(), complaint.status);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to update status');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="overlay" onClick={onClose}>
            <div
                className="card-elevated animate-slide-up"
                style={{ maxWidth: 460, width: '100%', padding: 24 }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 className="heading-2">Update Status</h2>
                    <button onClick={onClose} className="btn-ghost" style={{ padding: 4 }} aria-label="Close">
                        Close
                    </button>
                </div>

                <div style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    backgroundColor: 'var(--color-gray-50)',
                    marginBottom: 20,
                }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: 6 }}>
                        {complaint.title || 'Untitled Complaint'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="text-caption">Current status:</span>
                        <StatusBadge status={complaint.status} />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">New Status</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {STATUS_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setNewStatus(opt.value)}
                                className="btn"
                                style={{
                                    flex: 1,
                                    padding: '10px 8px',
                                    fontSize: '0.8125rem',
                                    backgroundColor: newStatus === opt.value ? 'var(--color-primary-50)' : '#ffffff',
                                    color: newStatus === opt.value ? 'var(--color-primary-700)' : 'var(--color-gray-600)',
                                    border: `1.5px solid ${newStatus === opt.value ? 'var(--color-primary-500)' : 'var(--color-gray-200)'}`,
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {noteRequired && (
                    <div className="form-group">
                        <label className="form-label form-label-required">
                            Admin Note
                            <span className="form-hint">(required for this status)</span>
                        </label>
                        <textarea
                            className={`form-input ${!noteValid && note.length > 0 ? 'form-input-error' : ''}`}
                            placeholder="Describe the action taken or resolution details..."
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            rows={3}
                        />
                    </div>
                )}

                {error && (
                    <div style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        backgroundColor: 'var(--color-status-red-light)',
                        border: '1px solid var(--color-status-red-border)',
                        fontSize: '0.8125rem',
                        color: 'var(--color-status-red)',
                        marginBottom: 16,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                    <button className="btn btn-secondary" onClick={onClose} type="button">
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={!canSave || saving} type="button">
                        {saving && <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
