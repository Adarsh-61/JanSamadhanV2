'use client';

import { useState, useMemo } from 'react';
import { useComplaints } from '@/hooks/useComplaints';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase-client';
import ProtectedRoute from '@/components/ProtectedRoute';
import ComplaintCard from '@/components/ComplaintCard';
import StatusChangeModal from '@/components/StatusChangeModal';

const STATUS_FILTERS = [
    { value: 'all', label: 'All', headingColor: 'var(--color-primary-600)' },
    { value: 'no_action', label: 'Pending', headingColor: 'var(--color-status-red)' },
    { value: 'working', label: 'In Progress', headingColor: 'var(--color-status-amber)' },
    { value: 'solved', label: 'Resolved', headingColor: 'var(--color-status-green)' },
];

export default function AdminPanel() {
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState(''); // Added for searchQuery
    const { complaints, counts, loading, error, refetch } = useComplaints({ statusFilter, searchQuery });
    const { user } = useAuth();
    const toast = useToast();
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    async function handleStatusUpdate(complaintId, newStatus, adminNote) {
        const session = await supabase.auth.getSession();
        const token = session?.data?.session?.access_token;

        if (!token) throw new Error('Session expired. Please sign in again.');

        const res = await fetch(`/api/admin/complaints/${complaintId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ status: newStatus, admin_note: adminNote }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update status');

        toast.success('Complaint status updated successfully.');
    }

    async function handleDelete(complaint) {
        if (!window.confirm(`Are you sure you want to permanently delete "${complaint.title || 'this complaint'}"?`)) return;

        try {
            const session = await supabase.auth.getSession();
            const token = session?.data?.session?.access_token;
            if (!token) throw new Error('Session expired. Please sign in again.');

            const res = await fetch(`/api/admin/complaints/${complaint.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete complaint');

            toast.success('Complaint deleted successfully.');
        } catch (err) {
            toast.error(err.message);
        }
    }

    return (
        <ProtectedRoute>
            <div className="container animate-fade-in" style={{ paddingTop: 48, paddingBottom: 64 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 24 }}>
                    <div>
                        <h1 className="heading-1" style={{ marginBottom: 0 }}>Admin Dashboard</h1>
                    </div>
                    {user && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '6px 12px', borderRadius: 6,
                            backgroundColor: 'var(--color-gray-100)',
                            fontSize: '0.8125rem', color: 'var(--color-gray-600)',
                        }}>
                            {user.email}
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 24 }}>
                    {STATUS_FILTERS.map(filter => (
                        <button
                            key={filter.value}
                            onClick={() => setStatusFilter(filter.value)}
                            className="card"
                            style={{
                                padding: '14px 16px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                borderColor: statusFilter === filter.value ? 'var(--color-primary-500)' : 'var(--color-gray-200)',
                                backgroundColor: statusFilter === filter.value ? 'var(--color-primary-50)' : '#ffffff',
                                transition: 'border-color 0.15s',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span className="text-small" style={{ color: filter.headingColor, fontWeight: 600 }}>{filter.label}</span>
                            </div>
                            <p style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-gray-900)', lineHeight: 1.2 }}>
                                {counts[filter.value === 'all' ? 'total' : filter.value] || 0}
                            </p>
                            <p className="text-caption">{filter.label}</p>
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 90 }} />)}
                    </div>
                ) : complaints.length === 0 ? (
                    <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
                        <p className="text-body">No complaints match the selected filter.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {complaints.map(complaint => (
                            <ComplaintCard
                                key={complaint.id}
                                complaint={complaint}
                                isAdmin={true}
                                onStatusChange={setSelectedComplaint}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}

                {selectedComplaint && (
                    <StatusChangeModal
                        complaint={selectedComplaint}
                        onSave={handleStatusUpdate}
                        onClose={() => setSelectedComplaint(null)}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
}
