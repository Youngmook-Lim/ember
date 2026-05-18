import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DiscoverResultCard } from '../components/DiscoverResultCard';

const API_URL = import.meta.env.VITE_API_URL;

const SHIMMER_STYLES = `
@keyframes discoverShimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.discoverSkeleton {
  background: linear-gradient(
    90deg,
    var(--surface) 0%,
    var(--surface-raised) 50%,
    var(--surface) 100%
  );
  background-size: 200% 100%;
  animation: discoverShimmer 1.6s ease-in-out infinite;
}
@keyframes discoverDots {
  0%, 20% { content: ''; }
  40% { content: '.'; }
  60% { content: '..'; }
  80%, 100% { content: '...'; }
}
.discoverThinking::after {
  content: '';
  display: inline-block;
  animation: discoverDots 1.5s steps(1) infinite;
}
`;

export default function DiscoverPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | results | clarify | unavailable | empty | error
  const [results, setResults] = useState([]);
  const [intro, setIntro] = useState('');
  const [clarification, setClarification] = useState('');
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
    setIntro('');
    setClarification('');
    try {
      const res = await fetch(`${API_URL}/api/discover/search`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      });
      if (!res.ok) throw new Error('server error');
      const data = await res.json();
      if (data.status === 'unavailable') {
        setStatus('unavailable');
      } else if (data.status === 'clarify') {
        setClarification(data.clarificationMessage);
        setStatus('clarify');
      } else if (data.status === 'ok' && data.picks.length === 0) {
        setStatus('empty');
      } else {
        setIntro(data.intro);
        setResults(data.picks);
        setStatus('results');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 80px' }}>
      <style>{SHIMMER_STYLES}</style>

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
          <p style={{ color: 'var(--ink-mute)', fontSize: 14, margin: '0 0 4px' }}>
            <span className="discoverThinking">{t('discover.thinking')}</span>
          </p>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="discoverSkeleton"
              style={{
                border: '1px solid var(--rule)', borderRadius: 14,
                height: 130,
              }}
            />
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

      {status === 'clarify' && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <p style={{
            fontFamily: 'var(--font-serif, Georgia, serif)',
            fontSize: 17,
            color: 'var(--ink)',
            lineHeight: 1.6,
            maxWidth: 480,
            margin: '0 auto',
          }}>
            {clarification}
          </p>
        </div>
      )}

      {status === 'unavailable' && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <p style={{
            fontFamily: 'var(--font-serif, Georgia, serif)',
            fontSize: 17,
            fontWeight: 600,
            color: 'var(--ink)',
            margin: '0 0 10px',
          }}>
            {t('discover.unavailableTitle')}
          </p>
          <p style={{
            color: 'var(--ink-mute)',
            fontSize: 15,
            lineHeight: 1.6,
            maxWidth: 420,
            margin: '0 auto',
          }}>
            {t('discover.unavailableBody')}
          </p>
        </div>
      )}

      {status === 'results' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {intro && (
            <p style={{
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontSize: 17,
              color: 'var(--ink)',
              lineHeight: 1.6,
              margin: '0 0 4px',
            }}>
              {intro}
            </p>
          )}
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
