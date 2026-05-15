import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;
const STATUSES = ['new', 'reviewed', 'done', 'dismissed'];

function relTime(iso) {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function AdminFeedbackPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/feedback`, { credentials: 'include' })
      .then(res => {
        if (res.status === 403) {
          navigate('/dashboard', { replace: true });
          return null;
        }
        if (!res.ok) throw new Error('fetch failed');
        return res.json();
      })
      .then(data => { if (data) setItems(data); })
      .catch(() => setError('Failed to load feedback'));
  }, [navigate]);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/api/feedback/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setItems(prev => prev.map(it => (it.id === id ? { ...it, ...updated } : it)));
      } else {
        window.alert('Failed to update status. Please try again.');
      }
    } catch {
      window.alert('Failed to update status. Please try again.');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this feedback permanently?')) return;
    try {
      const res = await fetch(`${API_URL}/api/feedback/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setItems(prev => prev.filter(it => it.id !== id));
      } else {
        window.alert('Failed to delete feedback. Please try again.');
      }
    } catch {
      window.alert('Failed to delete feedback. Please try again.');
    }
  };

  if (error) return <div style={{ padding: 32 }}>{error}</div>;
  if (items === null) return <div style={{ padding: 32 }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 20px 80px' }}>
      <h1 className="display" style={{ fontSize: 28, fontWeight: 600, marginBottom: 6 }}>
        Feedback
      </h1>
      {items.length > 0 && (
        <div style={{ fontSize: 13, color: 'var(--ink-mute)', marginBottom: 24 }}>
          {items.length} total
        </div>
      )}

      {items.length === 0 && (
        <div style={{ fontSize: 14, color: 'var(--ink-mute)' }}>No feedback yet.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items.map(item => (
          <div
            key={item.id}
            style={{
              border: '1px solid var(--rule)',
              borderRadius: 12,
              padding: '14px 16px',
              background: 'var(--surface-raised)',
            }}
          >
            {/* Header row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              flexWrap: 'wrap', marginBottom: 10,
            }}>
              <span style={{
                fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                padding: '3px 8px', borderRadius: 6,
                background: 'var(--surface)', color: 'var(--ink)',
              }}>{item.type}</span>

              <select
                value={item.status}
                onChange={e => updateStatus(item.id, e.target.value)}
                style={{
                  fontSize: 12, padding: '4px 8px', borderRadius: 6,
                  border: '1px solid var(--rule)', background: 'var(--surface)',
                  color: 'var(--ink)', cursor: 'pointer',
                }}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
                {relTime(item.createdAt)}
              </span>

              <div style={{ flex: 1 }} />

              <button
                onClick={() => remove(item.id)}
                style={{
                  fontSize: 12, padding: '4px 10px', borderRadius: 6,
                  border: '1px solid var(--rule)', background: 'transparent',
                  color: '#C0392B', cursor: 'pointer',
                }}
              >Delete</button>
            </div>

            {/* Submitter */}
            <div style={{
              fontSize: 12, color: 'var(--ink-mute)', marginBottom: 10,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span>{item.user?.name}</span>
              <span>·</span>
              {item.replyOk ? (
                <a
                  href={`mailto:${item.user?.email}?subject=Re: your Ember feedback`}
                  style={{ color: 'var(--ember)' }}
                >{item.user?.email}</a>
              ) : (
                <span>{item.user?.email}</span>
              )}
              {item.replyOk && (
                <span style={{
                  fontSize: 10, padding: '1px 6px', borderRadius: 4,
                  background: 'color-mix(in srgb, var(--ember) 14%, transparent)',
                  color: 'var(--ember)', fontWeight: 600,
                }}>reply ok</span>
              )}
            </div>

            {/* Body */}
            <div style={{
              whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.55,
              color: 'var(--ink)', marginBottom: 8,
            }}>{item.message}</div>

            {/* Footer */}
            <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>
              {(item.page || '—')} · {(item.locale || '—')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
