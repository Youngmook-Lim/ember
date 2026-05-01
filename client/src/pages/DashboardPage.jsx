import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EmberFlame } from '../components/EmberFlame';
import { Icon } from '../components/Icon';
import { TagChip } from '../components/TagChip';
import { useIsMobile } from '../hooks/useIsMobile';
import { TAG_COLORS } from '../constants';

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

function DashboardPage({ streak, weekDays, onShare }) {
  const [quote, setQuote] = useState(null);
  const [empty, setEmpty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState([]);
  const [showReflection, setShowReflection] = useState(false);
  const mobile = useIsMobile();
  const { t, i18n } = useTranslation();

  const today = new Date().toLocaleDateString(i18n.language, {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  useEffect(() => {
    const loadDaily = async () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { date, quote: saved } = JSON.parse(stored);
        if (date === todayString()) {
          setQuote(saved);
          setLoading(false);
          return;
        }
      }
      try {
        const res = await fetch(`${API_URL}/api/quotes/daily`, { credentials: 'include' });
        if (res.status === 404) {
          setEmpty(true);
        } else {
          const data = await res.json();
          setQuote(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayString(), quote: data }));
        }
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
        padding: mobile ? '28px 18px 100px' : '48px 28px 80px',
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
              ✦ &nbsp;{t('dashboard.header')}
            </p>
            <h1 className="display" style={{
              fontSize: mobile ? 28 : 44, margin: 0,
              fontWeight: 500, letterSpacing: '-0.02em',
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
                {/* Tag chip top-right */}
                <div style={{ position: 'absolute', top: 16, right: 16 }}>
                  <TagChip tag={quote.tag} active />
                </div>

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

                <p className="italic-display" style={{
                  fontSize: mobile ? 24 : 40,
                  lineHeight: 1.28, margin: 0,
                  color: 'var(--ink)', fontWeight: 400,
                }}>
                  {quote.text}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: mobile ? 24 : 40 }}>
                  <div style={{ width: 28, height: 1, background: 'var(--ink)' }} />
                  <div>
                    <div style={{ fontSize: mobile ? 13 : 15, fontWeight: 600, color: 'var(--ink)' }}>
                      {quote.source}
                    </div>
                    {quote.work && (
                      <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontStyle: 'italic', marginTop: 2 }}>
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
                    fontStyle: 'italic', color: 'var(--ink-soft)',
                    fontSize: 14, lineHeight: 1.6,
                  }}>
                    <span className="smallcaps" style={{ display: 'block', marginBottom: 6, fontStyle: 'normal' }}>
                      {t('dashboard.yourReflection')}
                    </span>
                    {quote.reflection || (
                      <span style={{ color: 'var(--ink-mute)' }}>{t('dashboard.reflectionPrompt')}</span>
                    )}
                  </div>
                )}
              </>
            )}
          </article>

          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SideSection title={t('dashboard.onThisDay')}>
              <p style={{ fontSize: 13, color: 'var(--ink-mute)', margin: 0, lineHeight: 1.5 }}>
                {t('dashboard.onThisDayText')}
              </p>
              <p className="italic-display" style={{ margin: '10px 0 8px', fontSize: 15, lineHeight: 1.45, color: 'var(--ink-soft)' }}>
                "Attention is the rarest and purest form of generosity."
              </p>
              <p style={{ fontSize: 12, color: 'var(--ink-mute)', margin: 0 }}>— Simone Weil</p>
            </SideSection>

            {recent.length > 0 && (
              <SideSection title={t('dashboard.recentlyAdded')}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {recent.slice(0, mobile ? 3 : 4).map(q => (
                    <div key={q.id} style={{ display: 'flex', gap: 10 }}>
                      <div style={{
                        width: 3,
                        background: (TAG_COLORS[q.tag]?.dot) || 'var(--ember)',
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
