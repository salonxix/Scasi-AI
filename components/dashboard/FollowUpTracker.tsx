'use client';

import { useEffect, useState } from 'react';

interface FollowUp {
  id: string;
  subject: string | null;
  recipient: string | null;
  signal: string | null;
  status: 'pending' | 'resolved' | 'dismissed';
  detected_at: string;
}

export default function FollowUpTracker() {
  const [items, setItems] = useState<FollowUp[]>([]);
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/db/follow-ups')
      .then((r) => r.ok ? r.json() : { followUps: [] })
      .then((data) => setItems(data.followUps ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  async function dismiss(id: string) {
    setItems((prev) => prev.filter((f) => f.id !== id));
    await fetch('/api/db/follow-ups', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'dismissed' }),
    }).catch(() => null);
  }

  const pending = items.filter((f) => f.status === 'pending');

  return (
    <div style={{ borderTop: '1px solid #E6EEF6', paddingTop: 8 }}>
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', textAlign: 'left', padding: '8px 12px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 28, height: 28, borderRadius: 8, display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            background: '#EEF2FF', color: '#2563EB', fontSize: 12,
          }}>🔔</span>
          <span style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>Follow-ups</span>
          {pending.length > 0 && (
            <span style={{
              background: '#dc2626', color: 'white', borderRadius: 999,
              fontSize: 10, fontWeight: 700, padding: '1px 6px',
            }}>{pending.length}</span>
          )}
        </span>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ padding: '0 8px 8px' }}>
          {loading && (
            <div style={{ fontSize: 11, color: '#9ca3af', padding: '6px 4px' }}>Loading…</div>
          )}
          {!loading && pending.length === 0 && (
            <div style={{ fontSize: 11, color: '#9ca3af', padding: '6px 4px' }}>No pending follow-ups</div>
          )}
          {pending.map((f) => (
            <div key={f.id} style={{
              padding: '8px 10px', borderRadius: 8, marginBottom: 4,
              background: '#FFF7ED', border: '1px solid #FED7AA',
              fontSize: 12,
            }}>
              <div style={{ fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {f.subject ?? '(No subject)'}
              </div>
              {f.recipient && (
                <div style={{ color: '#6b7280', fontSize: 11, marginTop: 2 }}>To: {f.recipient}</div>
              )}
              {f.signal && (
                <div style={{ color: '#d97706', fontSize: 10, marginTop: 2, fontStyle: 'italic' }}>"{f.signal}"</div>
              )}
              <button
                onClick={() => dismiss(f.id)}
                style={{
                  marginTop: 6, padding: '2px 8px', borderRadius: 6, border: 'none',
                  background: '#e5e7eb', color: '#374151', fontSize: 10,
                  cursor: 'pointer', fontWeight: 600,
                }}
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
