'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useComplaints } from '@/hooks/useComplaints';
import ComplaintCard from '@/components/ComplaintCard';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'no_action', label: 'No Action' },
  { value: 'working', label: 'In Progress' },
  { value: 'solved', label: 'Resolved' },
];

export default function PublicBoard() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { complaints, counts, loading, error } = useComplaints({
    statusFilter,
    searchQuery,
  });

  function handleSearch(e) {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
  }

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 64 }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ maxWidth: 600 }}>
            <h1 className="heading-1" style={{ marginBottom: 0 }}>Complaint Board</h1>
          </div>
          <Link href="/submit" style={{ textDecoration: 'none' }}>
            <button className="btn btn-primary btn-lg">
              New Complaint
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div className="card" style={{ padding: '24px', flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="text-small" style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>Total</span>
          <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-gray-900)', lineHeight: 1.2 }}>
            {counts.total}
          </span>
        </div>
        <div className="card" style={{ padding: '24px', flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="text-small" style={{ color: 'var(--color-status-red)', fontWeight: 600 }}>No Action</span>
          <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-gray-900)', lineHeight: 1.2 }}>
            {counts.no_action}
          </span>
        </div>
        <div className="card" style={{ padding: '24px', flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="text-small" style={{ color: 'var(--color-status-amber)', fontWeight: 600 }}>In Progress</span>
          <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-gray-900)', lineHeight: 1.2 }}>
            {counts.working}
          </span>
        </div>
        <div className="card" style={{ padding: '24px', flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="text-small" style={{ color: 'var(--color-status-green)', fontWeight: 600 }}>Resolved</span>
          <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-gray-900)', lineHeight: 1.2 }}>
            {counts.solved}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={statusFilter === opt.value ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
              style={{ fontSize: '0.75rem' }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 24, backgroundColor: 'var(--color-gray-200)' }} className="desktop-only" />

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 6, flex: 1, minWidth: 180 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              className="form-input"
              placeholder="Search..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{ paddingLeft: 34, padding: '6px 10px 6px 34px', fontSize: '0.8125rem' }}
            />
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchInput(''); setSearchQuery(''); }}
              className="btn btn-ghost btn-sm"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Status indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <span style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: 'var(--color-status-green)',
          display: 'inline-block',
        }} />
        <span className="text-caption">Live</span>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: 100 }} />
          ))}
        </div>
      ) : error ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <p className="text-body">Unable to load complaints. Check your connection and try again.</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <h3 className="heading-3" style={{ marginBottom: 8 }}>No complaints found</h3>
          <p className="text-body" style={{ marginBottom: 20 }}>
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'There are no complaints yet. Be the first to submit one.'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Link href="/submit" style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary">
                Submit a Complaint
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {complaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </div>
      )}
    </div>
  );
}
