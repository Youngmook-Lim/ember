import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EmberFlame } from '../components/EmberFlame';
import { EmberSparks } from '../components/EmberSparks';
import { AnimatedPrompt } from '../components/AnimatedPrompt';
import { Icon } from '../components/Icon';
import { TagChip } from '../components/TagChip';
import { useIsMobile } from '../hooks/useIsMobile';
import { TAG_COLORS } from '../constants';
import { getRecommendedQuote } from '../data/featuredQuotes';

const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_KEY = 'ember_daily_quote';

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function StreakCard({ streak, weekDays, compact }) {
  const { t, i18n } = useTranslation();
  const rtf = new Intl.RelativeTimeFormat(i18n.language, { numeric: 'auto' });
  return (
    <div style={{
      padding: compact ? '12px 16px' : '14px 18px',
      borderRadius: 14,
      border: '1px solid var(--rule)',
      background: 'var(--surface-raised)',
      display: 'flex', alignItems: 'center', gap: 16,
      width: compact ? '100%' : 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="flicker" style={{ display: 'inline-flex' }}>
          <EmberFlame size={compact ? 22 : 28} />
        </span>
        <div>
          <div className="mono" style={{
            fontSize: compact ? 18 : 22, fontWeight: 600,
            lineHeight: 1, color: 'var(--ember-deep)',
          }}>
            {streak}
          </div>
          <div style={{
            fontSize: 10, color: 'var(--ink-mute)',
            letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2,
          }}>
            {t('dashboard.streak')}
          </div>
        </div>
      </div>

      <div style={{ height: 28, width: 1, background: 'var(--rule)' }} />

      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
        {weekDays.map((on, i) => {
          const brightness = 0.3 + (i / (weekDays.length - 1)) * 0.7;
          const barH = 10 + i * 1.6;
          return (
            <div
              key={i}
              title={i === weekDays.length - 1 ? t('dashboard.todayLabel') : rtf.format(-(weekDays.length - 1 - i), 'day')}
              style={{
                width: 9, height: barH, borderRadius: 3,
                background: on ? `rgba(217,106,60,${brightness})` : 'transparent',
                border: on ? 'none' : '1.5px solid var(--rule)',
                boxSizing: 'border-box',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function SideSection({ title, children }) {
  return (
    <div style={{
      background: 'var(--surface-raised)',
      border: '1px solid var(--rule)',
      borderRadius: 14, padding: 18,
    }}>
      <p className="smallcaps" style={{ margin: 0, marginBottom: 12 }}>{title}</p>
      {children}
    </div>
  );
}

const DISCOVER_PROMPTS = [
  "What's on your mind today?",
  "Looking for words on something specific?",
  "Tell me what you're carrying.",
  "Need a line for a toast, a card, a friend?",
];

const DISCOVER_PROMPTS_MOBILE = [
  "What's on your mind?",
  "Looking for something?",
  "Tell me what you're carrying.",
  "A line for a toast?",
];

function DiscoverEntryD1({ mobile, onNavigate }) {
  return (
    <div
      onClick={onNavigate}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onNavigate()}
      style={{
        position: 'relative',
        padding: mobile ? '16px 16px 18px' : '22px 24px',
        borderRadius: mobile ? 16 : 18,
        background: 'linear-gradient(135deg, var(--surface-raised) 0%, var(--bg-deeper) 100%)',
        border: '1.5px solid var(--ember-deep)',
        animation: 'discoverGlowPulse 3.5s ease-in-out infinite',
        display: mobile ? 'block' : 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 18,
        alignItems: 'center',
        overflow: 'hidden',
        cursor: 'pointer',
        marginBottom: 20,
      }}
    >
      {/* Sparks on right side */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0,
        width: mobile ? 120 : 200,
        opacity: 0.7, pointerEvents: 'none',
      }}>
        <EmberSparks count={mobile ? 7 : 10} height={mobile ? 100 : 120} intensity={0.6} />
      </div>

      {/* Mobile layout: flame + text row, then full-width button */}
      {mobile ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 38, height: 44, position: 'relative', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <div style={{
                position: 'absolute', inset: -4, borderRadius: '999px',
                background: 'radial-gradient(circle, rgba(244,164,102,0.45), transparent 65%)',
              }} />
              <div style={{ position: 'relative', animation: 'breathe 2.4s ease-in-out infinite', transformOrigin: 'center bottom' }}>
                <EmberFlame size={32} />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="mono" style={{ margin: 0, fontSize: 9, letterSpacing: '0.2em', color: 'var(--ember-deep)' }}>
                EMBER · DISCOVER
              </p>
              <p style={{
                margin: '4px 0 0',
                fontFamily: 'var(--font-display)', fontStyle: 'italic',
                fontSize: 16, lineHeight: 1.3, color: 'var(--ink)',
                overflow: 'hidden',
              }}>
                <AnimatedPrompt prompts={DISCOVER_PROMPTS_MOBILE} />
              </p>
            </div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onNavigate(); }}
            className="btn btn-primary"
            style={{
              padding: '11px 16px', fontSize: 12.5,
              background: 'var(--ember-deep)',
              boxShadow: '0 4px 10px -4px var(--ember-deep), inset 0 -2px 0 rgba(0,0,0,0.18)',
              position: 'relative', zIndex: 1, width: '100%', justifyContent: 'center',
            }}
          >
            ask Ember
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14" /><path d="m13 5 7 7-7 7" />
            </svg>
          </button>
        </>
      ) : (
        <>
          {/* Flame */}
          <div style={{ width: 52, height: 60, position: 'relative', display: 'grid', placeItems: 'center' }}>
            <div style={{
              position: 'absolute', inset: -4, borderRadius: '999px',
              background: 'radial-gradient(circle, rgba(244,164,102,0.45), transparent 65%)',
            }} />
            <div style={{ position: 'relative', animation: 'breathe 2.4s ease-in-out infinite', transformOrigin: 'center bottom' }}>
              <EmberFlame size={44} />
            </div>
          </div>

          {/* Text */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p className="mono" style={{ margin: 0, fontSize: 10, letterSpacing: '0.2em', color: 'var(--ember-deep)' }}>
              EMBER · DISCOVER
            </p>
            <p style={{
              margin: '6px 0 0',
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 22, lineHeight: 1.3, color: 'var(--ink)',
            }}>
              <AnimatedPrompt prompts={DISCOVER_PROMPTS} />
            </p>
          </div>

          {/* Button */}
          <button
            onClick={e => { e.stopPropagation(); onNavigate(); }}
            className="btn btn-primary"
            style={{
              padding: '12px 18px', fontSize: 13,
              background: 'var(--ember-deep)',
              boxShadow: '0 6px 14px -6px var(--ember-deep), inset 0 -2px 0 rgba(0,0,0,0.18)',
              position: 'relative', zIndex: 1,
            }}
          >
            ask Ember
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14" /><path d="m13 5 7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

function DashboardPage({ streak, weekDays, onShare }) {
  const [quote, setQuote] = useState(null);
  const [empty, setEmpty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState([]);
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionDraft, setReflectionDraft] = useState('');
  const [savingReflection, setSavingReflection] = useState(false);
  const [recommended] = useState(getRecommendedQuote);
  const mobile = useIsMobile();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const today = new Date().toLocaleDateString(i18n.language, {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  useEffect(() => {
    const fetchDaily = async () => {
      const res = await fetch(`${API_URL}/api/quotes/daily`, { credentials: 'include' });
      if (res.status === 404) { setEmpty(true); return null; }
      const data = await res.json();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayString(), quoteId: data.id }));
      return data;
    };

    const loadDaily = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const { date, quoteId } = JSON.parse(stored);
          if (date === todayString() && quoteId != null) {
            const res = await fetch(`${API_URL}/api/quotes/${quoteId}`, { credentials: 'include' });
            if (res.ok) {
              setQuote(await res.json());
              return;
            }
            // cached id no longer valid (deleted, etc.) — fall through to a fresh daily pick
          }
        }
        const data = await fetchDaily();
        if (data) setQuote(data);
      } catch (err) {
        console.error('Failed to fetch daily quote:', err);
      } finally {
        setLoading(false);
      }
    };

    const loadRecent = async () => {
      try {
        const res = await fetch(`${API_URL}/api/quotes`, { credentials: 'include' });
        const data = await res.json();
        setRecent(data.slice(0, 4));
      } catch { /* silent */ }
    };

    loadDaily();
    loadRecent();
  }, []);

  useEffect(() => {
    if (quote) setReflectionDraft(quote.reflection || '');
  }, [quote?.id, quote?.reflection]);

  const saveReflection = async () => {
    if (!quote) return;
    setSavingReflection(true);
    try {
      const res = await fetch(`${API_URL}/api/quotes/${quote.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: quote.text,
          source: quote.source,
          work: quote.work,
          tag: quote.tag,
          reflection: reflectionDraft,
          pinned: quote.pinned,
        }),
      });
      if (res.ok) setQuote(await res.json());
    } finally {
      setSavingReflection(false);
    }
  };

  return (
    <div className="paper-grain" style={{ minHeight: 'calc(100vh - 61px)', position: 'relative', overflowX: 'hidden' }}>
      {/* Ambient gradient */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 60% 45% at 50% 35%, rgba(244,164,102,0.28) 0%, transparent 65%),
          radial-gradient(ellipse 30% 20% at 85% 80%, rgba(138,46,42,0.1) 0%, transparent 65%)
        `,
      }} />

      <div style={{
        maxWidth: 1180, margin: '0 auto',
        padding: mobile ? '28px 18px 84px' : '48px 28px 80px',
        position: 'relative', zIndex: 1,
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-end', marginBottom: mobile ? 24 : 40,
          flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <p className="smallcaps" style={{ color: 'var(--ember-deep)', marginBottom: 10 }}>
              <svg width="10" height="12" viewBox="0 0 40 46" fill="currentColor" aria-hidden="true" style={{display:'inline-block',verticalAlign:'middle',marginRight:'0.3em'}}><path d="M20 4 C 22 12, 30 14, 30 24 C 30 33, 25 40, 20 40 C 15 40, 10 34, 10 26 C 10 22, 13 20, 14 18 C 15 22, 17 22, 17 18 C 17 14, 19 10, 20 4 Z"/></svg>&nbsp;{t('dashboard.header')}
            </p>
            <h1 className="display" style={{
              fontSize: mobile ? 28 : 44, margin: 0,
              fontWeight: 500, letterSpacing: '-0.005em',
            }}>
              {today}
            </h1>
          </div>
          {!mobile && <StreakCard streak={streak} weekDays={weekDays} />}
        </div>

        {/* Mobile streak bar */}
        {mobile && (
          <div style={{ marginBottom: 24 }}>
            <StreakCard streak={streak} weekDays={weekDays} compact />
          </div>
        )}

        {/* Discover entry — D1 conversational */}
        <DiscoverEntryD1 mobile={mobile} onNavigate={() => navigate('/discover')} />

        {/* Main grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr' : 'minmax(0, 1fr) 280px',
          gap: mobile ? 20 : 40,
          alignItems: 'start',
        }}>
          {/* Hero quote card */}
          <article className="card fade-up" style={{
            padding: mobile ? '28px 22px 24px' : '56px 72px 48px',
            borderRadius: 18, position: 'relative', overflow: 'hidden',
          }}>
            {loading && (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <span className="mono" style={{ fontSize: 13, color: 'var(--ink-mute)' }}>{t('dashboard.loading')}</span>
              </div>
            )}

            {!loading && empty && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                  <EmberFlame size={52} />
                </div>
                <h2 className="display" style={{ fontSize: 22, marginBottom: 12 }}>{t('dashboard.empty')}</h2>
                <p style={{ color: 'var(--ink-mute)', marginBottom: 28, fontSize: 15 }}>
                  {t('dashboard.emptyDescription')}
                </p>
                <Link to="/add" className="btn btn-primary">
                  <Icon name="plus" size={16} stroke={2} /> {t('dashboard.emptyAdd')}
                </Link>
              </div>
            )}

            {!loading && quote && (
              <>
                {/* Tag chip top-right — cap at 2, small size */}
                {quote.tag && (() => {
                  const allTags = quote.tag.split(',');
                  const visible = allTags.slice(0, 2);
                  const extra = allTags.length - visible.length;
                  return (
                    <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '50%' }}>
                      {visible.map(tg => (
                        <TagChip key={tg} tag={tg} active style={{ padding: '3px 8px', fontSize: 9 }} />
                      ))}
                      {extra > 0 && (
                        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ink-mute)', padding: '3px 6px', alignSelf: 'center' }}>
                          +{extra}
                        </span>
                      )}
                    </div>
                  );
                })()}

                <p className="smallcaps" style={{ marginBottom: mobile ? 20 : 32 }}>
                  {t('dashboard.quoteOfDay')}
                </p>

                <div className="big-quote" style={{
                  fontSize: mobile ? 64 : 120,
                  marginLeft: mobile ? -4 : -6,
                  marginBottom: mobile ? -20 : -36,
                  lineHeight: 0.7,
                }}>
                  "
                </div>

                <p className={isKo ? '' : 'italic-display'} style={{
                  fontFamily: isKo ? 'var(--font-body)' : undefined,
                  fontSize: mobile ? 24 : 40,
                  lineHeight: isKo ? 1.6 : 1.42, margin: 0,
                  color: 'var(--ink)', fontWeight: isKo ? 500 : 400,
                }}>
                  {quote.text.trim().replace(/^["“”]+|["“”]+$/g, '').trim()}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: mobile ? 24 : 40 }}>
                  <div style={{ width: 28, height: 1, background: 'var(--ink)' }} />
                  <div>
                    <div style={{ fontSize: mobile ? 13 : 15, fontWeight: 600, color: 'var(--ink)' }}>
                      {quote.source}
                    </div>
                    {quote.work && (
                      <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontStyle: isKo ? 'normal' : 'italic', marginTop: 2 }}>
                        {quote.work}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex', gap: 8, marginTop: mobile ? 24 : 44,
                  flexWrap: 'wrap', paddingTop: mobile ? 18 : 24,
                  borderTop: '1px dashed var(--rule)', alignItems: 'center',
                }}>
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: mobile ? 13 : 14, padding: mobile ? '9px 14px' : '11px 18px' }}
                    onClick={() => onShare(quote)}
                  >
                    <Icon name="share" size={14} /> {t('dashboard.share')}
                  </button>
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: mobile ? 13 : 14, padding: mobile ? '9px 14px' : '11px 18px' }}
                    onClick={() => setShowReflection(s => !s)}
                  >
                    <Icon name="edit" size={14} /> {quote.reflection ? t('dashboard.reflection') : t('dashboard.reflect')}
                  </button>
                  {!mobile && (
                    <>
                      <div style={{ flex: 1 }} />
                      <Link to="/collection" className="btn btn-quiet">
                        {t('dashboard.browseCollection')} <Icon name="arrow-right" size={14} />
                      </Link>
                    </>
                  )}
                </div>

                {showReflection && (
                  <div style={{
                    marginTop: 16, padding: '16px 18px',
                    background: 'var(--bg-deeper)', borderRadius: 10,
                    borderLeft: '3px solid var(--ember)',
                  }}>
                    <span className="smallcaps" style={{ display: 'block', marginBottom: 8, fontStyle: 'normal' }}>
                      {t('dashboard.yourReflection')}
                    </span>
                    <textarea
                      className="textarea"
                      value={reflectionDraft}
                      onChange={e => setReflectionDraft(e.target.value)}
                      placeholder={t('dashboard.reflectionPrompt')}
                      rows={3}
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontStyle: 'normal',
                        fontSize: 14,
                        lineHeight: isKo ? 1.7 : 1.6,
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                      <button
                        className="btn btn-primary"
                        onClick={saveReflection}
                        disabled={savingReflection || reflectionDraft.trim() === (quote.reflection || '').trim()}
                        style={{ padding: '8px 16px', fontSize: 13 }}
                      >
                        {savingReflection ? t('dashboard.savingReflection') : t('dashboard.saveReflection')}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </article>

          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SideSection title={t('dashboard.quoteForYou')}>
              <p
                className={isKo ? '' : 'italic-display'}
                style={{
                  fontFamily: isKo ? 'var(--font-body)' : undefined,
                  margin: '0 0 8px',
                  fontSize: 15,
                  lineHeight: isKo ? 1.6 : 1.45,
                  color: 'var(--ink-soft)',
                  fontWeight: isKo ? 500 : 400,
                }}
              >
                "{isKo ? (recommended.textKo || recommended.text) : recommended.text}"
              </p>
              <p style={{ fontSize: 12, color: 'var(--ink-mute)', margin: 0 }}>
                — {isKo ? (recommended.sourceKo || recommended.source) : recommended.source}
              </p>
            </SideSection>

            {recent.length > 0 && (
              <SideSection title={t('dashboard.recentlyAdded')}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {recent.slice(0, mobile ? 3 : 4).map(q => (
                    <div key={q.id} style={{ display: 'flex', gap: 10 }}>
                      <div style={{
                        width: 3,
                        background: (TAG_COLORS[q.tag?.split(',')[0]]?.dot) || 'var(--ember)',
                        borderRadius: 2, flexShrink: 0,
                      }} />
                      <div style={{ minWidth: 0 }}>
                        <p style={{
                          margin: 0, fontSize: 13, color: 'var(--ink)',
                          overflow: 'hidden', display: '-webkit-box',
                          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                          lineHeight: 1.45,
                        }}>
                          {q.text}
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--ink-mute)' }}>
                          {q.source}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/collection" className="btn btn-quiet" style={{ marginTop: 8, padding: '6px 0', fontSize: 12 }}>
                  {t('dashboard.seeAll')} {recent.length > 0 ? '→' : ''}
                </Link>
              </SideSection>
            )}

            {!mobile && (
              <div style={{ padding: 18, border: '1px dashed var(--rule)', borderRadius: 12 }}>
                <p className="margin-note" style={{ fontSize: 13, margin: 0, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                  {t('dashboard.quote')}
                </p>
                <p className="tip" style={{ margin: '8px 0 0' }}>{t('dashboard.quoteAttribution')}</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
