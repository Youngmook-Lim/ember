import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;
const STATUSES = ['new', 'reviewed', 'done', 'dismissed'];

function relTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function SectionHeader({ title, open, onToggle, sub }) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        cursor: 'pointer', userSelect: 'none', marginBottom: open ? 20 : 0,
      }}
    >
      <h2 className="display" style={{ fontSize: 20, fontWeight: 600, margin: 0, flex: 1 }}>
        {title}
        {sub != null && (
          <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--ink-mute)', marginLeft: 10 }}>
            {sub}
          </span>
        )}
      </h2>
      <span style={{ fontSize: 16, color: 'var(--ink-mute)' }}>{open ? '▾' : '▸'}</span>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{
      border: '1px solid var(--rule)',
      borderRadius: 10,
      padding: '12px 14px',
      background: 'var(--surface-raised)',
      minWidth: 100,
    }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function StatsSection({ open, onToggle }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/stats`, { credentials: 'include' })
      .then(res => {
        if (res.status === 403) { navigate('/dashboard', { replace: true }); return null; }
        if (!res.ok) throw new Error('fetch failed');
        return res.json();
      })
      .then(data => { if (data) setStats(data); })
      .catch(() => setError('Failed to load stats'));
  }, [navigate]);

  return (
    <div style={{ marginBottom: 40 }}>
      <SectionHeader title="Stats" open={open} onToggle={onToggle} />
      {open && (
        error ? (
          <div style={{ fontSize: 14, color: 'var(--ink-mute)' }}>{error}</div>
        ) : !stats ? (
          <div style={{ fontSize: 14, color: 'var(--ink-mute)' }}>Loading…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Row: totals */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-mute)', marginBottom: 10 }}>
                All time
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <StatCard label="Users" value={stats.users.total} />
                <StatCard label="Quotes" value={stats.quotes.total} />
                <StatCard label="Corpus quotes" value={stats.corpus.total} />
                <StatCard label="Open feedback" value={stats.feedback.openCount} />
              </div>
            </div>

            {/* Row: this week */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-mute)', marginBottom: 10 }}>
                This week
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <StatCard label="New users" value={stats.users.newThisWeek} />
                <StatCard label="New quotes" value={stats.quotes.newThisWeek} />
                <StatCard label="Active users" value={stats.visits.activeUsersThisWeek} />
              </div>
            </div>

            {/* Row: engagement */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-mute)', marginBottom: 10 }}>
                Engagement
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <StatCard label="Users w/ 0 quotes" value={stats.users.withZeroQuotes} />
                <StatCard label="AI-origin quotes" value={stats.quotes.aiOrigin} />
                <StatCard label="User-origin quotes" value={stats.quotes.userOrigin} />
                <StatCard label="With reflections" value={stats.quotes.withReflections} />
                <StatCard label="Pinned" value={stats.quotes.pinned} />
              </div>
            </div>

            {/* Tags */}
            {stats.tags.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-mute)', marginBottom: 10 }}>
                  Top tags
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {stats.tags.map(({ tag, count }) => (
                    <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 13, color: 'var(--ink)', minWidth: 140 }}>{tag}</span>
                      <span style={{ fontSize: 13, color: 'var(--ink-mute)' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}

function FeedbackSection({ open, onToggle }) {
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/feedback`, { credentials: 'include' })
      .then(res => {
        if (res.status === 403) { navigate('/dashboard', { replace: true }); return null; }
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

  const sub = items != null ? `${items.length} total` : null;

  return (
    <div>
      <SectionHeader title="Feedback" open={open} onToggle={onToggle} sub={sub} />
      {open && (
        error ? (
          <div style={{ fontSize: 14, color: 'var(--ink-mute)' }}>{error}</div>
        ) : items === null ? (
          <div style={{ fontSize: 14, color: 'var(--ink-mute)' }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ fontSize: 14, color: 'var(--ink-mute)' }}>No feedback yet.</div>
        ) : (
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
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

                  <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>{relTime(item.createdAt)}</span>
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

                <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{item.user?.name}</span>
                  <span>·</span>
                  {item.replyOk ? (
                    <a href={`mailto:${item.user?.email}?subject=Re: your Ember feedback`} style={{ color: 'var(--ember)' }}>
                      {item.user?.email}
                    </a>
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

                <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.55, color: 'var(--ink)', marginBottom: 8 }}>
                  {item.message}
                </div>

                <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>
                  {(item.page || '—')} · {(item.locale || '—')}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default function AdminPage() {
  const [statsOpen, setStatsOpen] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(true);

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 20px 80px' }}>
      <h1 className="display" style={{ fontSize: 28, fontWeight: 600, marginBottom: 32 }}>
        Admin
      </h1>
      <StatsSection open={statsOpen} onToggle={() => setStatsOpen(o => !o)} />
      <FeedbackSection open={feedbackOpen} onToggle={() => setFeedbackOpen(o => !o)} />
    </div>
  );
}
