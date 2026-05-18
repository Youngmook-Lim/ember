import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DiscoverResultCard } from '../components/DiscoverResultCard';

const API_URL = import.meta.env.VITE_API_URL;

export default function DiscoverPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | results | empty | error
  const [results, setResults] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());

  // Pre-load the user's collection to mark already-saved corpus quotes.
  useEffect(() => {
    fetch(`${API_URL}/api/quotes`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(qs => {
        const ids = new Set();
        for (const q of qs) if (q.corpusQuoteId) ids.add(q.corpusQuoteId);
        setSavedIds(ids);
      })
      .catch(() => {});
  }, []);

  async function submit(textOverride) {
    const text = (textOverride ?? query).trim();
    if (!text) return;
    setQuery(text);
    setStatus('loading');
    try {
      const res = await fetch(`${API_URL}/api/discover/search`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      });
      if (!res.ok) throw new Error('server error');
      const data = await res.json();
      setResults(data);
      setStatus(data.length === 0 ? 'empty' : 'results');
    } catch {
      setStatus('error');
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 80px' }}>
      <h1 className="display" style={{ fontSize: 32, margin: '0 0 8px' }}>
        {t('discover.header')}
      </h1>
      <p style={{ color: 'var(--ink-mute)', margin: '0 0 24px' }}>
        {t('discover.description')}
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        style={{ display: 'flex', gap: 8, marginBottom: 20 }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('discover.placeholder')}
          disabled={status === 'loading'}
          style={{
            flex: 1, padding: '12px 14px', fontSize: 15,
            border: '1px solid var(--rule)', borderRadius: 10,
            background: 'var(--surface)', color: 'var(--ink)',
          }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={status === 'loading' || !query.trim()}
          style={{ padding: '12px 20px' }}
        >
          {status === 'loading' ? t('discover.searching') : t('discover.submit')}
        </button>
      </form>

      {status === 'idle' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['example1', 'example2', 'example3'].map((key) => (
            <button
              key={key}
              onClick={() => submit(t(`discover.${key}`))}
              style={{
                padding: '6px 12px', borderRadius: 999,
                border: '1px solid var(--rule)', background: 'transparent',
                color: 'var(--ink-mute)', fontSize: 13, cursor: 'pointer',
              }}
            >
              {t(`discover.${key}`)}
            </button>
          ))}
        </div>
      )}

      {status === 'loading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{
              background: 'var(--surface)', border: '1px solid var(--rule)', borderRadius: 14,
              height: 130, opacity: 0.55,
            }} />
          ))}
        </div>
      )}

      {status === 'empty' && (
        <p style={{ color: 'var(--ink-mute)' }}>{t('discover.empty')}</p>
      )}

      {status === 'error' && (
        <div>
          <p style={{ color: 'var(--ink-mute)' }}>{t('discover.errorTitle')}</p>
          <button className="btn" onClick={() => submit(query)}>{t('discover.errorRetry')}</button>
        </div>
      )}

      {status === 'results' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {results.map(r => (
            <DiscoverResultCard
              key={r.corpusQuoteId}
              result={r}
              initiallySaved={savedIds.has(r.corpusQuoteId)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
