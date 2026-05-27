import { useEffect, useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EmberSparks } from '../components/EmberSparks';
import { AnimatedPrompt } from '../components/AnimatedPrompt';
import { DiscoverResultCard } from '../components/DiscoverResultCard';
import { Icon } from '../components/Icon';
import { useIsMobile } from '../hooks/useIsMobile';

const API_URL = import.meta.env.VITE_API_URL;

// In-memory cache: persists across tab navigation while the app is loaded,
// wiped on full page reload. Deliberately not sessionStorage.
let discoverCache = null;

const THREAD_TONES = {
  ember: { dot: 'var(--ember)',      bg: 'rgba(217,106,60,0.10)',  border: 'var(--ember)' },
  olive: { dot: 'var(--olive)',      bg: 'rgba(122,132,80,0.12)',  border: 'var(--olive)' },
  plum:  { dot: 'var(--plum)',       bg: 'rgba(108,62,95,0.12)',   border: 'var(--plum)' },
  gold:  { dot: '#C99040',           bg: 'rgba(201,144,64,0.12)',  border: '#C99040' },
  slate: { dot: '#5B7EA6',           bg: 'rgba(91,126,166,0.12)',  border: '#5B7EA6' },
};

const EXAMPLE_COUNT = 30;
const TONE_ORDER = ['ember', 'olive', 'plum', 'gold', 'slate'];
const RESET_FADE_MS = 400;
const LOADING_FADE_MS = 400;

function sampleExampleIndices(n) {
  const pool = Array.from({ length: EXAMPLE_COUNT }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

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

function SearchSection({ query, setQuery, onSubmit, mobile, isLoading }) {
  const { t, i18n } = useTranslation();
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const isKo = i18n.language === 'ko';
  const isEn = i18n.language === 'en';

  const selectedIndices = useMemo(() => sampleExampleIndices(5), []);
  const threads = selectedIndices.map((idx, i) => ({
    text: t(`discover.example${idx}`),
    tone: TONE_ORDER[i],
  }));

  const prompts = mobile
    ? threads.map(th => th.text)
    : threads.map(th => isEn ? `e.g. ${th.text}` : th.text);

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
          lineHeight: 1.15,
          letterSpacing: '-0.015em',
          fontWeight: 500,
        }}>
          {t('discover.headerLine1')}<br />
          <span className={isKo ? '' : 'italic-display'} style={{
            fontFamily: isKo ? 'var(--font-body)' : undefined,
            color: 'var(--ember-deep)',
            fontWeight: isKo ? 500 : 400,
          }}>{t('discover.headerLine2')}</span>
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
          }}>{t('discover.howItWorks')}</p>
          <p style={{
            margin: '4px 0 0',
            fontFamily: 'var(--font-display)',
            fontSize: mobile ? 11.5 : 12.5,
            lineHeight: 1.5,
            color: 'var(--ink-soft)',
          }}>
            {t('discover.howItWorksBody')}
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
                  fontFamily: isKo ? 'var(--font-body)' : 'var(--font-display)',
                  fontStyle: isKo ? 'normal' : 'italic',
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
                disabled={isLoading}
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  background: 'transparent',
                  border: 'none', outline: 'none',
                  fontFamily: isKo ? 'var(--font-body)' : 'var(--font-display)',
                  fontStyle: isKo ? 'normal' : 'italic',
                  fontSize: mobile ? 16 : 22,
                  color: 'var(--ink)',
                  padding: 0,
                  cursor: isLoading ? 'not-allowed' : 'text',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!query.trim() || isLoading}
              style={{
                padding: mobile ? '9px 14px' : '12px 22px',
                fontSize: mobile ? 12 : 14,
                background: 'var(--ember-deep)',
                boxShadow: '0 6px 14px -6px var(--ember-deep), inset 0 -2px 0 rgba(0,0,0,0.2)',
                flexShrink: 0,
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {mobile ? <>{t('discover.askMobile')} <ArrowRight size={12} /></> : <>{t('discover.askDesktop')} <ArrowRight size={14} /></>}
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
          {t('discover.pullAThread')}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: mobile ? 6 : 8, alignItems: 'center' }}>
          {threads.map((th, i) => {
            const c = THREAD_TONES[th.tone];
            return (
              <button
                key={i}
                onClick={() => onSubmit(th.text)}
                disabled={isLoading}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: mobile ? 5 : 7,
                  padding: mobile ? '5px 10px' : '7px 13px 7px 11px',
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  borderRadius: 999,
                  fontFamily: isKo ? 'var(--font-body)' : 'var(--font-display)',
                  fontStyle: isKo ? 'normal' : 'italic',
                  fontSize: mobile ? 12 : 13.5,
                  whiteSpace: 'nowrap',
                  color: 'var(--ink)',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
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
  const { t, i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  // Restart the word-stream animation every 3.5s (last word finishes at ~2970ms).
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCycle(c => c + 1), 3500);
    return () => clearInterval(id);
  }, []);

  // Cumulative delays so the "letter" writes itself top-down over ~3s.
  // Bumped LOAD_MS-ish timing matches the network round-trip we observed.
  const desktopLines = [
    { widths: [80, 56, 96],        startDelay: 0    },
    { widths: [92, 72, 110, 56],   startDelay: 650  },
    { widths: [68, 104, 78, 92],   startDelay: 1450 },
    { widths: [84, 96, 54],        startDelay: 2250 },
  ];
  const mobileLines = [
    { widths: [56, 40, 68],        startDelay: 0    },
    { widths: [64, 50, 78, 40],    startDelay: 650  },
    { widths: [48, 72, 56, 64],    startDelay: 1450 },
    { widths: [58, 68, 38],        startDelay: 2250 },
  ];
  const lines = mobile ? mobileLines : desktopLines;

  const word = (width, delay) => (
    <span
      key={`${width}-${delay}`}
      style={{
        display: 'inline-block',
        width, height: 14,
        borderRadius: 4,
        background:
          'linear-gradient(90deg,' +
          '  color-mix(in srgb, var(--ember) 32%, transparent),' +
          '  color-mix(in srgb, var(--ember-glow) 42%, transparent) 50%,' +
          '  color-mix(in srgb, var(--ember) 32%, transparent)' +
          ')',
        boxShadow: '0 0 10px -2px color-mix(in srgb, var(--ember-glow) 45%, transparent)',
        animation: 'discoverWordStream 360ms cubic-bezier(0.2,0.7,0.2,1) both',
        animationDelay: `${delay}ms`,
        opacity: 0,
      }}
    />
  );

  const renderLine = (widths, startDelay) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: mobile ? 7 : 8, position: 'relative', minHeight: 14 }}>
      {widths.map((w, i) => word(w, startDelay + i * 180))}
    </div>
  );

  return (
    <div
      style={{
        position: 'relative',
        padding: mobile ? '18px 20px 28px' : '24px 28px 34px',
        background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--bg) 100%)',
        borderRadius: mobile ? 12 : 14,
        border: '1px solid var(--rule)',
        boxShadow:
          '0 24px 40px -28px rgba(0,0,0,0.32),' +
          '0 0 0 1px color-mix(in srgb, var(--ember) 4%, transparent)',
        overflow: 'hidden',
      }}
    >
      {/* Coal-glow beneath the card — warm radial pulse rising from below. */}
      <div
        aria-hidden
        style={{
          position: 'absolute', left: '-10%', right: '-10%', bottom: '-40%', height: '85%',
          background:
            'radial-gradient(ellipse 50% 100% at 50% 100%,' +
            '  color-mix(in srgb, var(--ember-glow) 55%, transparent) 0%,' +
            '  color-mix(in srgb, var(--ember) 18%, transparent) 35%,' +
            '  transparent 70%' +
            ')',
          animation: 'discoverCoalBreathe 3.2s ease-in-out infinite',
          pointerEvents: 'none', filter: 'blur(2px)',
        }}
      />

      {/* Faint embers drifting up behind the content. */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, opacity: 0.6, pointerEvents: 'none' }}>
        <EmberSparks count={mobile ? 7 : 10} height={mobile ? 220 : 300} intensity={mobile ? 0.45 : 0.55} />
      </div>

      {/* Warm heat-haze tint across the whole card, very soft. */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0,
          background:
            'radial-gradient(ellipse 70% 60% at 50% 90%,' +
            '  color-mix(in srgb, var(--ember) 10%, transparent) 0%,' +
            '  transparent 70%' +
            ')',
          animation: 'discoverHeatHaze 4.2s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* CURATED FOR YOU badge with flat pulsing dot + ring ripple */}
      <div style={{ marginBottom: mobile ? 12 : 16, position: 'relative' }}>
        <span
          className="mono"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: mobile ? 6 : 8,
            padding: mobile ? '4px 9px' : '5px 11px',
            background: 'color-mix(in srgb, var(--ember) 10%, transparent)',
            color: 'var(--ember-deep)',
            fontSize: mobile ? 9 : 10, letterSpacing: '0.18em',
            borderRadius: 999, border: '1px dashed var(--ember)',
          }}
        >
          <Icon name="sparkle" size={mobile ? 9 : 10} stroke={2} />
          {t('discover.curatedFor')}
          <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8, marginLeft: 4 }}>
            <span
              aria-hidden
              style={{
                position: 'absolute', inset: 0,
                borderRadius: 999,
                background: 'color-mix(in srgb, var(--ember-glow) 32%, transparent)',
                animation: 'discoverRingRipple 2.2s cubic-bezier(0.2,0.7,0.2,1) infinite',
              }}
            />
            <span
              style={{
                position: 'relative',
                width: 8, height: 8, borderRadius: 999,
                background: 'var(--ember)',
                boxShadow: '0 0 6px 1px color-mix(in srgb, var(--ember-glow) 45%, transparent)',
                animation: 'discoverDotPulse 2.2s ease-in-out infinite',
              }}
            />
          </span>
        </span>
      </div>

      {/* LLM-style streaming "letter" lines — key resets every cycle to restart animations */}
      <div key={cycle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: mobile ? 7 : 9, marginBottom: mobile ? 11 : 14, position: 'relative' }}>
          {renderLine(lines[0].widths, lines[0].startDelay)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? 10 : 13, position: 'relative' }}>
          {renderLine(lines[1].widths, lines[1].startDelay)}
          {renderLine(lines[2].widths, lines[2].startDelay)}
          {renderLine(lines[3].widths, lines[3].startDelay)}
        </div>
      </div>

      {/* Signature row — same as the letter card, minus the cursor */}
      <div style={{ marginTop: mobile ? 18 : 26, display: 'flex', alignItems: 'center', gap: mobile ? 10 : 12, position: 'relative' }}>
        <span
          style={{
            display: 'inline-block',
            width: mobile ? 24 : 32, height: 1.5,
            background: 'var(--ember-deep)',
            borderRadius: 1,
            transformOrigin: 'left center',
            animation: 'discoverProgressFill 1.8s cubic-bezier(0.4,0,0.2,1) infinite',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: mobile ? 16 : 20, color: 'var(--ember-deep)',
            letterSpacing: '-0.005em',
          }}
        >
          from Ember
        </span>
        <span style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
        <span
          className="mono"
          style={{
            fontSize: mobile ? 9 : 10, letterSpacing: '0.14em',
            color: 'var(--ember-deep)',
            minWidth: mobile ? 72 : 96, textAlign: 'right',
          }}
        >
          <PhaseLabel
            phases={[
              t('discover.streamListening'),
              t('discover.streamTracing'),
              t('discover.streamComposing'),
            ]}
            intervalMs={1200}
          />
        </span>
      </div>

      {/* Hearth-glow at the bottom — soft, blended, no hard edge */}
      <div
        aria-hidden
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: mobile ? 42 : 56,
          background:
            'radial-gradient(ellipse 80% 100% at 50% 110%,' +
            '  color-mix(in srgb, var(--ember) 55%, transparent) 0%,' +
            '  color-mix(in srgb, var(--ember-glow) 28%, transparent) 35%,' +
            '  transparent 75%' +
            ')',
          filter: 'blur(4px)',
          animation: 'discoverHearthFloor 2.8s ease-in-out infinite',
          transformOrigin: 'bottom center',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute', left: '15%', right: '15%', bottom: -6, height: 24,
          background:
            'radial-gradient(ellipse 70% 100% at 50% 100%,' +
            '  color-mix(in srgb, var(--ember-glow) 55%, transparent) 0%,' +
            '  color-mix(in srgb, var(--ember-glow) 32%, transparent) 40%,' +
            '  transparent 75%' +
            ')',
          filter: 'blur(5px)',
          animation: 'discoverHearthFloor 2.8s ease-in-out infinite reverse',
          transformOrigin: 'bottom center',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

// Tiny helper for cycling the phase label in the signature row.
function PhaseLabel({ phases, intervalMs = 1200 }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % phases.length), intervalMs);
    return () => clearInterval(t);
  }, [phases.length, intervalMs]);
  return (
    <span
      key={idx}
      style={{
        display: 'inline-block',
        animation: 'discoverWordIn 460ms cubic-bezier(0.2,0.7,0.2,1) both',
      }}
    >
      {phases[idx]}
    </span>
  );
}

function LetterCard({ intro, query, mobile, hasPicks = false }) {
  const { t, i18n } = useTranslation();
  const isKo = i18n.language === 'ko';
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
          {t('discover.curatedFor')}
        </span>
      </div>

      <p style={{
        fontFamily: isKo ? 'var(--font-body)' : 'var(--font-display)',
        fontStyle: isKo ? 'normal' : 'italic',
        fontSize: mobile ? 13 : 15, color: 'var(--ink-mute)',
        margin: `0 0 ${mobile ? 10 : 14}px`,
      }}>
        {t('discover.onQueryPrefix')}<span style={{ color: 'var(--ink)' }}>{query}</span>{t('discover.onQuerySuffix')}
      </p>

      <p style={{
        fontFamily: isKo ? 'var(--font-body)' : 'var(--font-display)',
        fontSize: mobile ? 17 : 22,
        lineHeight: isKo ? 1.7 : 1.5,
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
            {mobile ? t('discover.picks') : t('discover.picksBelow')}
          </span>
        )}
      </div>
    </article>
  );
}

function QuietState({ onReset, mobile }) {
  const { t, i18n } = useTranslation();
  const isKo = i18n.language === 'ko';
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
        fontFamily: isKo ? 'var(--font-body)' : 'var(--font-display)',
        fontStyle: isKo ? 'normal' : 'italic',
        fontSize: mobile ? 21 : 26, color: 'var(--ink)',
        fontWeight: isKo ? 500 : 400,
      }}>
        {t('discover.unavailableTitle')}
      </p>
      <p style={{
        margin: `${mobile ? 10 : 12}px auto 0`,
        maxWidth: 380,
        fontSize: mobile ? 13 : 14,
        lineHeight: 1.6,
        color: 'var(--ink-mute)',
      }}>
        {t('discover.unavailableBody')}
      </p>
      <div style={{ marginTop: mobile ? 16 : 22, display: 'flex', justifyContent: 'center', gap: 10 }}>
        <button className="btn btn-ghost" onClick={onReset} style={{ fontSize: mobile ? 12 : 13 }}>
          {t('discover.errorRetry')}
        </button>
      </div>
    </div>
  );
}

export default function DiscoverPage({ userId }) {
  const { t, i18n } = useTranslation();
  const isKo = i18n.language === 'ko';
  const mobile = useIsMobile();
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [status, setStatus] = useState('idle');
  const [results, setResults] = useState([]);
  const [intro, setIntro] = useState('');
  const [clarification, setClarification] = useState('');
  const [savedIds, setSavedIds] = useState(new Set());
  const [isFading, setIsFading] = useState(false);
  // Fades the loading panel out before mounting the results, so the
  // transition reads as one continuous motion.
  const [isLoadingExiting, setIsLoadingExiting] = useState(false);
  const topRef = useRef(null);
  const loadingRef = useRef(null);
  const responseRef = useRef(null);
  const isLiveSearch = useRef(false);

  useEffect(() => {
    if (discoverCache && discoverCache.userId === userId && discoverCache.status !== 'idle' && discoverCache.status !== 'loading') {
      setQuery(discoverCache.submittedQuery || '');
      setSubmittedQuery(discoverCache.submittedQuery || '');
      setStatus(discoverCache.status);
      setResults(discoverCache.results || []);
      setIntro(discoverCache.intro || '');
      setClarification(discoverCache.clarification || '');
    } else if (discoverCache && discoverCache.userId !== userId) {
      discoverCache = null;
    }
  }, [userId]);

  useEffect(() => {
    if (status === 'idle' || status === 'loading') return;
    discoverCache = { userId, submittedQuery, status, results, intro, clarification };
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
      // Defer by 200 ms so the layout change from mounting results is well past
      // before the smooth scroll starts — the browser skips behavior:'smooth'
      // when triggered immediately after a large layout change (same quirk that
      // broke the ask-again scroll; handleReset works because it scrolls *before*
      // the layout change).
      setTimeout(() => {
        responseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
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
      // Hold the loading panel mounted while it fades out, then commit
      // the final status. Result containers fade themselves in on mount
      // via animation: discoverPanelEnter.
      setIsLoadingExiting(true);
      await new Promise(r => setTimeout(r, LOADING_FADE_MS));
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
      setIsLoadingExiting(false);
    } catch {
      setIsLoadingExiting(false);
      setStatus('error');
    }
  }

  function handleReset() {
    // 1. Scroll first while the page is still long enough for smooth scroll
    //    to engage (browser smooth-scroll bails when layout changes mid-animation).
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // 2. After the scroll has had time to finish, fade the results.
    setTimeout(() => {
      setIsFading(true);
    }, 600);
    // 3. Once the fade completes, unmount.
    setTimeout(() => {
      discoverCache = null;
      isLiveSearch.current = false;
      setStatus('idle');
      setResults([]);
      setIntro('');
      setClarification('');
      setQuery('');
      setSubmittedQuery('');
      setIsFading(false);
    }, 600 + RESET_FADE_MS);
  }

  const isQuiet = status === 'unavailable' || status === 'empty' || status === 'error';
  const pb = mobile ? 100 : 80;

  return (
    <main className="paper-grain" style={{
      minHeight: 'calc(100vh - 61px)',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* Ambient gradient — matches dashboard for visual consistency */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 60% 45% at 50% 30%, rgba(244,164,102,0.28) 0%, transparent 65%),
          radial-gradient(ellipse 30% 20% at 85% 80%, rgba(138,46,42,0.1) 0%, transparent 65%)
        `,
      }} />

      <div ref={topRef} style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1, scrollMarginTop: 64 }}>
      {/* Search bar + thread chips — always visible */}
      <SearchSection
        query={query}
        setQuery={setQuery}
        onSubmit={submit}
        mobile={mobile}
        isLoading={status === 'loading'}
      />

      {/* Loading panel — stays mounted briefly during exit fade */}
      {(status === 'loading' || isLoadingExiting) && (
        <div
          ref={loadingRef}
          style={{
            padding: `0 ${mobile ? 20 : 56}px ${pb}px`,
            opacity: isLoadingExiting ? 0 : 1,
            transform: isLoadingExiting ? 'translateY(-4px) scale(0.985)' : 'none',
            filter: isLoadingExiting ? 'blur(4px)' : 'blur(0)',
            transition: `opacity ${LOADING_FADE_MS}ms cubic-bezier(0.4,0,0.2,1), transform ${LOADING_FADE_MS}ms cubic-bezier(0.4,0,0.2,1), filter ${LOADING_FADE_MS}ms cubic-bezier(0.4,0,0.2,1)`,
          }}
        >
          <LoadingPanel mobile={mobile} />
        </div>
      )}

      {/* Results */}
      {status === 'results' && (
        <div ref={responseRef} style={{ padding: `0 ${mobile ? 20 : 56}px ${pb}px`, scrollMarginTop: mobile ? 84 : 120, opacity: isFading ? 0 : 1, transition: `opacity ${RESET_FADE_MS}ms ease`, animation: 'discoverPanelEnter 400ms cubic-bezier(0.2,0.7,0.2,1) both' }}>
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
              fontFamily: isKo ? 'var(--font-body)' : 'var(--font-display)',
              fontStyle: isKo ? 'normal' : 'italic',
              fontSize: mobile ? 14 : 15, color: 'var(--ink-mute)',
            }}>
              {t('discover.wantAnother')}
            </span>
            <button className="btn btn-ghost" onClick={handleReset} style={{ fontSize: mobile ? 12 : 13 }}>
              {t('discover.askAgain')}
            </button>
          </div>
        </div>
      )}

      {/* Clarify */}
      {status === 'clarify' && (
        <div ref={responseRef} style={{ padding: `0 ${mobile ? 20 : 56}px ${pb}px`, scrollMarginTop: mobile ? 84 : 120, opacity: isFading ? 0 : 1, transition: `opacity ${RESET_FADE_MS}ms ease`, animation: 'discoverPanelEnter 400ms cubic-bezier(0.2,0.7,0.2,1) both' }}>
          <LetterCard intro={clarification} query={submittedQuery} mobile={mobile} />
          <div style={{
            marginTop: 16, paddingTop: mobile ? 18 : 22,
            borderTop: '1px dashed var(--rule)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
          }}>
            <span style={{
              fontFamily: isKo ? 'var(--font-body)' : 'var(--font-display)',
              fontStyle: isKo ? 'normal' : 'italic',
              fontSize: mobile ? 14 : 15, color: 'var(--ink-mute)',
            }}>
              {t('discover.tryRephrase')}
            </span>
            <button className="btn btn-ghost" onClick={handleReset} style={{ fontSize: mobile ? 12 : 13 }}>
              {t('discover.askAgain')}
            </button>
          </div>
        </div>
      )}

      {/* Quiet / error */}
      {isQuiet && (
        <div ref={responseRef} style={{ padding: `0 ${mobile ? 20 : 56}px ${pb}px`, scrollMarginTop: mobile ? 84 : 120, opacity: isFading ? 0 : 1, transition: `opacity ${RESET_FADE_MS}ms ease`, animation: 'discoverPanelEnter 400ms cubic-bezier(0.2,0.7,0.2,1) both' }}>
          <QuietState onReset={handleReset} mobile={mobile} />
        </div>
      )}
      </div>
    </main>
  );
}
