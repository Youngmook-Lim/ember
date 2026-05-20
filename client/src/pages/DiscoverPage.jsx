import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { EmberFlame } from '../components/EmberFlame';
import { EmberSparks } from '../components/EmberSparks';
import { AnimatedPrompt } from '../components/AnimatedPrompt';
import { DiscoverResultCard } from '../components/DiscoverResultCard';
import { Icon } from '../components/Icon';
import { useIsMobile } from '../hooks/useIsMobile';

const API_URL = import.meta.env.VITE_API_URL;
const SESSION_KEY = 'ember_discover';

const THREAD_TONES = {
  ember: { dot: 'var(--ember)',      bg: 'rgba(217,106,60,0.10)',  border: 'var(--ember)' },
  olive: { dot: 'var(--olive)',      bg: 'rgba(122,132,80,0.12)',  border: 'var(--olive)' },
  plum:  { dot: 'var(--plum)',       bg: 'rgba(108,62,95,0.12)',   border: 'var(--plum)' },
  gold:  { dot: '#C99040',           bg: 'rgba(201,144,64,0.12)',  border: '#C99040' },
  slate: { dot: '#5B7EA6',           bg: 'rgba(91,126,166,0.12)',  border: '#5B7EA6' },
};

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.7-4.7" />
    </svg>
  );
}

function ArrowRight({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14" /><path d="m13 5 7 7-7 7" />
    </svg>
  );
}

function SearchSection({ query, setQuery, onSubmit, mobile }) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);

  const threads = [
    { text: t('discover.example1'), tone: 'ember' },
    { text: t('discover.example2'), tone: 'olive' },
    { text: t('discover.example3'), tone: 'plum' },
    { text: t('discover.example4'), tone: 'gold' },
    { text: t('discover.example5'), tone: 'slate' },
  ];

  const prompts = mobile
    ? threads.map(th => th.text)
    : threads.map(th => `e.g. ${th.text}`);

  return (
    <div style={{ padding: mobile ? '28px 20px 36px' : '44px 56px 56px', position: 'relative' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: mobile ? '1fr' : '1.7fr 1fr',
        gap: 24,
        alignItems: 'center',
        marginBottom: 14,
      }}>
        <h1 className="display" style={{
          margin: 0,
          fontSize: mobile ? 38 : 56,
          lineHeight: mobile ? 1 : 0.98,
          letterSpacing: '-0.01em',
        }}>
          What are you<br />
          <span className="italic-display" style={{ color: 'var(--ember-deep)' }}>looking for</span>
          <span style={{ color: 'var(--ember)' }}>?</span>
        </h1>

        <div style={{
          padding: mobile ? '8px 12px' : '10px 14px',
          background: 'rgba(217,106,60,0.05)',
          borderLeft: '2px solid var(--ember)',
          borderRadius: '0 4px 4px 0',
          marginTop: mobile ? 10 : 0,
        }}>
          <p className="mono" style={{
            margin: 0,
            fontSize: mobile ? 9 : 9.5,
            letterSpacing: '0.18em',
            color: 'var(--ember-deep)',
            opacity: 0.85,
          }}>HOW IT WORKS</p>
          <p style={{
            margin: '4px 0 0',
            fontFamily: 'var(--font-display)',
            fontSize: mobile ? 11.5 : 12.5,
            lineHeight: 1.5,
            color: 'var(--ink-soft)',
          }}>
            Tell me a feeling, a fragment, the thing you can't quite name. I'll bring five voices that lived near it.
          </p>
        </div>
      </div>

      {/* Hearth search bar */}
      <form onSubmit={e => { e.preventDefault(); onSubmit(); }}>
        <div style={{ position: 'relative', padding: `${mobile ? 44 : 64}px 0 0` }}>
          <div aria-hidden style={{
            position: 'absolute',
            left: 0, right: 0, top: 0,
            height: mobile ? 48 : 72,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}>
            <EmberSparks count={mobile ? 11 : 18} height={mobile ? 48 : 72} intensity={mobile ? 0.85 : 1} />
          </div>

          <div className={mobile ? 'discover-hearth-bar-mobile' : 'discover-hearth-bar'}>
            <div style={{
              width: mobile ? 30 : 36,
              height: mobile ? 30 : 36,
              borderRadius: '999px',
              background: 'var(--ember)',
              color: '#FFFBEE',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 6px 14px -6px var(--ember-deep), inset 0 -2px 0 rgba(0,0,0,0.15)',
              flexShrink: 0,
            }}>
              <SearchIcon />
            </div>

            <div style={{ flex: 1, position: 'relative', minHeight: mobile ? 22 : 26 }}>
              {!query && !focused && (
                <span style={{
                  position: 'absolute', inset: 0,
                  pointerEvents: 'none',
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: mobile ? 16 : 22,
                  color: 'var(--ink-mute)',
                  display: 'flex',
                  alignItems: 'center',
                  overflow: 'hidden',
                }}>
                  <AnimatedPrompt prompts={prompts} />
                </span>
              )}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  background: 'transparent',
                  border: 'none', outline: 'none',
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: mobile ? 16 : 22,
                  color: 'var(--ink)',
                  padding: 0,
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!query.trim()}
              style={{
                padding: mobile ? '9px 14px' : '12px 22px',
                fontSize: mobile ? 12 : 14,
                background: 'var(--ember-deep)',
                boxShadow: '0 6px 14px -6px var(--ember-deep), inset 0 -2px 0 rgba(0,0,0,0.2)',
                flexShrink: 0,
              }}
            >
              {mobile ? <>ask <ArrowRight size={12} /></> : <>ask Ember <ArrowRight size={14} /></>}
            </button>
          </div>
        </div>
      </form>

      {/* Thread chips */}
      <div style={{ marginTop: mobile ? 24 : 32 }}>
        <p className="smallcaps" style={{
          color: 'var(--ink-mute)',
          margin: `0 0 ${mobile ? 10 : 14}px`,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontSize: mobile ? 10 : undefined,
        }}>
          <span style={{ height: 1, width: mobile ? 18 : 24, background: 'var(--rule)' }} />
          or pull a thread
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: mobile ? 8 : 10, alignItems: 'center' }}>
          {threads.map((th, i) => {
            const c = THREAD_TONES[th.tone];
            return (
              <button
                key={i}
                onClick={() => onSubmit(th.text)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: mobile ? 6 : 8,
                  padding: mobile ? '6px 12px' : '8px 16px 8px 14px',
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  borderRadius: 999,
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: mobile ? 13 : 15,
                  color: 'var(--ink)',
                  cursor: 'pointer',
                }}
              >
                <span style={{ width: mobile ? 5 : 6, height: mobile ? 5 : 6, borderRadius: '999px', background: c.dot }} />
                {th.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LoadingPanel({ mobile }) {
  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg-deeper) 80%)',
      border: '1px solid var(--rule)',
      borderRadius: 22,
      overflow: 'hidden',
      height: mobile ? 200 : 280,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 50% 45% at 50% 80%, rgba(244,164,102,0.35) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <EmberSparks count={mobile ? 16 : 22} height={mobile ? 170 : 240} intensity={1} />

      <div style={{
        position: 'absolute',
        left: '50%', bottom: mobile ? 14 : 18,
        transform: 'translateX(-50%)',
      }}>
        <div style={{ animation: 'breathe 2.4s ease-in-out infinite', transformOrigin: 'center bottom' }}>
          <EmberFlame size={mobile ? 42 : 58} />
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: mobile ? 24 : 36, textAlign: 'center' }}>
        <p style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: mobile ? 17 : 22,
          color: 'var(--ember-deep)',
        }}>
          Ember is listening
          <span style={{
            display: 'inline-block',
            width: mobile ? 6 : 8, height: mobile ? 6 : 8,
            borderRadius: '999px',
            background: 'var(--ember)',
            marginLeft: mobile ? 6 : 8,
            verticalAlign: 'middle',
            animation: 'breathe 1.2s ease-in-out infinite',
          }} />
        </p>
        <p className="mono" style={{
          margin: `${mobile ? 6 : 10}px 0 0`,
          fontSize: mobile ? 9.5 : 11,
          color: 'var(--ink-mute)',
          letterSpacing: '0.14em',
        }}>
          STIRRING THE CORPUS · READING
        </p>
      </div>
    </div>
  );
}

function LetterCard({ intro, query, mobile, hasPicks = false }) {
  return (
    <article style={{
      position: 'relative',
      padding: mobile ? '22px 22px 24px' : '34px 38px 40px',
      background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--bg) 100%)',
      borderRadius: 14,
      border: '1px solid var(--rule)',
      boxShadow: '0 24px 40px -28px rgba(60,34,20,0.4)',
      marginBottom: 22,
    }}>
      {/* Header: AI badge only */}
      <div style={{ marginBottom: mobile ? 12 : 18 }}>
        <span className="mono" style={{
          display: 'inline-flex', alignItems: 'center', gap: mobile ? 6 : 8,
          padding: mobile ? '4px 9px' : '5px 11px',
          background: 'rgba(217,106,60,0.10)',
          color: 'var(--ember-deep)',
          fontSize: mobile ? 9 : 10,
          letterSpacing: '0.18em',
          borderRadius: 999,
          border: '1px dashed var(--ember)',
        }}>
          <Icon name="sparkle" size={mobile ? 9 : 10} stroke={2} />
          CURATED FOR YOU
        </span>
      </div>

      <p style={{
        fontFamily: 'var(--font-display)', fontStyle: 'italic',
        fontSize: mobile ? 13 : 15, color: 'var(--ink-mute)',
        margin: `0 0 ${mobile ? 10 : 14}px`,
      }}>
        On "<span style={{ color: 'var(--ink)' }}>{query}</span>" —
      </p>

      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: mobile ? 17 : 22,
        lineHeight: 1.5,
        color: 'var(--ink)',
        margin: 0,
      }}>
        {intro}
      </p>

      {/* Footer — letter-signature style */}
      <div style={{
        marginTop: mobile ? 18 : 24,
        display: 'flex', alignItems: 'center', gap: mobile ? 10 : 12,
      }}>
        <span style={{
          width: mobile ? 28 : 36,
          height: 1.5,
          background: 'var(--ember-deep)',
          flexShrink: 0,
          borderRadius: 1,
        }} />
        <span style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: mobile ? 18 : 22,
          color: 'var(--ember-deep)',
          letterSpacing: '-0.005em',
        }}>from Ember</span>
        <span style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
        {hasPicks && (
          <span className="mono" style={{ fontSize: mobile ? 9 : 10, color: 'var(--ink-mute)', letterSpacing: '0.14em' }}>
            {mobile ? '5 PICKS' : '5 PICKS BELOW'}
          </span>
        )}
      </div>
    </article>
  );
}

function QuietState({ onReset, mobile }) {
  return (
    <div style={{
      position: 'relative',
      textAlign: 'center',
      padding: mobile ? '32px 20px 36px' : '44px 30px 50px',
      background: 'linear-gradient(180deg, var(--surface-raised), var(--bg-deeper))',
      border: '1px solid var(--rule)',
      borderRadius: mobile ? 16 : 18,
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: mobile ? 14 : 18 }}>
        <svg width={mobile ? 48 : 56} height={mobile ? 68 : 80} viewBox="0 0 56 80" aria-hidden>
          <defs>
            <radialGradient id="quiet-glow" cx="50%" cy="80%" r="50%">
              <stop offset="0%" stopColor="var(--ember-glow)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="var(--ember)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="28" cy="64" r="20" fill="url(#quiet-glow)" />
          <circle cx="28" cy="64" r="5" fill="var(--ember-deep)" />
          <path
            d="M28 58 C 32 50, 22 44, 30 36 C 36 28, 24 22, 30 14"
            stroke="var(--ink-mute)" strokeWidth="1.5" fill="none"
            strokeLinecap="round" opacity="0.45"
            style={{ animation: 'breathe 3s ease-in-out infinite' }}
          />
        </svg>
      </div>

      <p style={{
        margin: 0,
        fontFamily: 'var(--font-display)', fontStyle: 'italic',
        fontSize: mobile ? 21 : 26, color: 'var(--ink)',
      }}>
        I'm momentarily quiet.
      </p>
      <p style={{
        margin: `${mobile ? 10 : 12}px auto 0`,
        maxWidth: 380,
        fontSize: mobile ? 13 : 14,
        lineHeight: 1.6,
        color: 'var(--ink-mute)',
      }}>
        The well I draw from is dry for the moment. The ember will catch again — try in a little while.
      </p>
      <div style={{ marginTop: mobile ? 16 : 22, display: 'flex', justifyContent: 'center', gap: 10 }}>
        <button className="btn btn-ghost" onClick={onReset} style={{ fontSize: mobile ? 12 : 13 }}>
          try again
        </button>
      </div>
    </div>
  );
}

export default function DiscoverPage({ userId }) {
  const mobile = useIsMobile();
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [status, setStatus] = useState('idle');
  const [results, setResults] = useState([]);
  const [intro, setIntro] = useState('');
  const [clarification, setClarification] = useState('');
  const [savedIds, setSavedIds] = useState(new Set());
  const loadingRef = useRef(null);
  const responseRef = useRef(null);
  const isLiveSearch = useRef(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY));
      if (saved && saved.userId === userId && saved.status && saved.status !== 'idle' && saved.status !== 'loading') {
        setQuery(saved.submittedQuery || saved.query || '');
        setSubmittedQuery(saved.submittedQuery || saved.query || '');
        setStatus(saved.status);
        setResults(saved.results || []);
        setIntro(saved.intro || '');
        setClarification(saved.clarification || '');
      } else if (saved && saved.userId !== userId) {
        sessionStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // ignore sessionStorage parse errors
    }
  }, [userId]);

  useEffect(() => {
    if (status === 'idle' || status === 'loading') return;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId, submittedQuery, status, results, intro, clarification }));
  }, [userId, submittedQuery, status, results, intro, clarification]);

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

  useEffect(() => {
    if (status === 'loading' && isLiveSearch.current) {
      requestAnimationFrame(() => {
        loadingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
    if (status !== 'idle' && status !== 'loading' && isLiveSearch.current) {
      requestAnimationFrame(() => {
        responseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [status]);

  async function submit(textOverride) {
    const text = (textOverride ?? query).trim();
    if (!text || status === 'loading') return;
    isLiveSearch.current = true;
    setQuery(text);
    setSubmittedQuery(text);
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

  function handleReset() {
    sessionStorage.removeItem(SESSION_KEY);
    setStatus('idle');
    setResults([]);
    setIntro('');
    setClarification('');
    setQuery('');
    setSubmittedQuery('');
  }

  const isQuiet = status === 'unavailable' || status === 'empty' || status === 'error';
  const pb = mobile ? 100 : 80;

  return (
    <main style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Search bar + thread chips — always visible */}
      <SearchSection
        query={query}
        setQuery={setQuery}
        onSubmit={submit}
        mobile={mobile}
      />

      {/* Loading panel — appears below search bar, disappears when done */}
      {status === 'loading' && (
        <div ref={loadingRef} style={{ padding: `0 ${mobile ? 20 : 56}px ${pb}px` }}>
          <LoadingPanel mobile={mobile} />
        </div>
      )}

      {/* Results */}
      {status === 'results' && (
        <div ref={responseRef} style={{ padding: `0 ${mobile ? 20 : 56}px ${pb}px`, scrollMarginTop: mobile ? 56 : 64 }}>
          {intro && <LetterCard intro={intro} query={submittedQuery} mobile={mobile} hasPicks={results.length > 0} />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? 14 : 18 }}>
            {results.map((r, i) => (
              <DiscoverResultCard
                key={r.corpusQuoteId}
                result={r}
                initiallySaved={savedIds.has(r.corpusQuoteId)}
                index={i}
                total={results.length}
                mobile={mobile}
              />
            ))}
          </div>
          <div style={{
            marginTop: mobile ? 24 : 32,
            paddingTop: mobile ? 18 : 22,
            borderTop: '1px dashed var(--rule)',
            display: 'flex',
            flexDirection: mobile ? 'column' : 'row',
            alignItems: mobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: mobile ? 12 : 10,
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: mobile ? 14 : 15, color: 'var(--ink-mute)',
            }}>
              Want another pass? Phrase it differently.
            </span>
            <button className="btn btn-ghost" onClick={handleReset} style={{ fontSize: mobile ? 12 : 13 }}>
              ask again
            </button>
          </div>
        </div>
      )}

      {/* Clarify */}
      {status === 'clarify' && (
        <div ref={responseRef} style={{ padding: `0 ${mobile ? 20 : 56}px ${pb}px`, scrollMarginTop: mobile ? 56 : 64 }}>
          <LetterCard intro={clarification} query={submittedQuery} mobile={mobile} />
          <div style={{
            marginTop: 16, paddingTop: mobile ? 18 : 22,
            borderTop: '1px dashed var(--rule)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: mobile ? 14 : 15, color: 'var(--ink-mute)',
            }}>
              Try rephrasing your search.
            </span>
            <button className="btn btn-ghost" onClick={handleReset} style={{ fontSize: mobile ? 12 : 13 }}>
              ask again
            </button>
          </div>
        </div>
      )}

      {/* Quiet / error */}
      {isQuiet && (
        <div ref={responseRef} style={{ padding: `0 ${mobile ? 20 : 56}px ${pb}px`, scrollMarginTop: mobile ? 56 : 64 }}>
          <QuietState onReset={handleReset} mobile={mobile} />
        </div>
      )}
    </main>
  );
}
