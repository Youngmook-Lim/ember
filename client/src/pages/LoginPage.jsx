import { useEffect, useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EmberFlame } from '../components/EmberFlame';
import { EmberSparks } from '../components/EmberSparks';
import { Icon } from '../components/Icon';
import { useIsMobile, useIsShortScreen } from '../hooks/useIsMobile';
import { useLanguage } from '../hooks/useLanguage';
import { getDailyQuote, FEATURED_QUOTES } from '../data/featuredQuotes';
import { TAG_COLORS } from '../constants';

const API_URL = import.meta.env.VITE_API_URL;

function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const options = [{ id: 'en', label: 'English' }, { id: 'ko', label: '한국어' }];

  useEffect(() => {
    if (!open) return;
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Language"
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 34, height: 34, borderRadius: 999,
          border: '1px solid var(--rule)',
          background: open ? 'var(--surface-raised)' : 'transparent',
          color: 'var(--ink-soft)', cursor: 'pointer',
          transition: 'background 120ms ease',
        }}
      >
        <Icon name="globe" size={15} stroke={1.7} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          minWidth: 140,
          background: 'var(--surface-raised)',
          border: '1px solid var(--rule)',
          borderRadius: 10,
          boxShadow: '0 16px 40px -16px rgba(20,10,6,0.35)',
          overflow: 'hidden',
          padding: 6,
          zIndex: 60,
        }}>
          {options.map(l => {
            const active = language === l.id;
            return (
              <button
                key={l.id}
                onClick={() => { setLanguage(l.id); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '9px 10px',
                  borderRadius: 7, border: 'none',
                  background: 'transparent',
                  color: active ? 'var(--ink)' : 'var(--ink-mute)',
                  cursor: 'pointer', fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  fontFamily: 'var(--font-body)', textAlign: 'left',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                {l.label}
                {active && <Icon name="check" size={14} stroke={2} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" style={{ background: '#FFFBEE', borderRadius: 999, padding: 2 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function ArrowRight({ size = 16, stroke = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14" /><path d="m13 5 7 7-7 7" />
    </svg>
  );
}

// Scroll to a section by id. Uses direct scrollTop animation to avoid the
// body/documentElement ambiguity that causes scrollIntoView({ behavior:'smooth' })
// to silently do nothing on both real mobile and some desktop configurations.
function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const dy = el.getBoundingClientRect().top;
  if (Math.abs(dy) < 4) return;
  const scroller = document.body.scrollHeight > document.body.clientHeight
    ? document.body : document.documentElement;
  const start = scroller.scrollTop;
  const target = Math.max(0, start + dy);
  const t0 = performance.now();
  const dur = 500;
  (function step(now) {
    const p = Math.min((now - t0) / dur, 1);
    scroller.scrollTop = start + (target - start) * (1 - (1 - p) ** 3);
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}

function Reveal({ children, delay = 0, style }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } });
    }, { threshold: 0.18 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={'reveal ' + (seen ? 'in' : '')}
      style={{ transitionDelay: seen ? `${delay}ms` : '0ms', ...style }}>
      {children}
    </div>
  );
}

function FeaturedCard({ quote, isLg, mobile, short = false, withFloat = true, withTape = true }) {
  const { t, i18n } = useTranslation();
  const isKo = i18n.language === 'ko';
  const text = isKo ? (quote.textKo || quote.text) : quote.text;
  const source = isKo ? (quote.sourceKo || quote.source) : quote.source;
  const mobileShort = mobile && short;
  return (
    <div className={withFloat ? 'float-sway' : ''}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: isLg ? 460 : (mobile ? 380 : 360),
        background: 'var(--surface-raised)',
        border: '1px solid var(--rule)',
        borderRadius: 8,
        padding: isLg ? '52px 44px' : (mobileShort ? '22px 22px' : (mobile ? '36px 28px' : '34px 30px')),
        boxShadow: '0 30px 60px -30px rgba(60,30,15,0.40), 0 1px 0 rgba(255,255,255,0.4) inset',
        transform: withFloat ? undefined : `rotate(1.2deg)`,
      }}>
      {withTape && <span className="tape" />}
      <div style={{ marginBottom: isLg ? 28 : (mobileShort ? 10 : (mobile ? 16 : 18)) }}>
        <span className="smallcaps">{t('login.featured')}</span>
      </div>
      <div className="big-quote" style={{
        fontSize: isLg ? 96 : (mobileShort ? 48 : (mobile ? 64 : 72)),
        marginBottom: isLg ? -22 : (mobileShort ? -10 : (mobile ? -14 : -16)),
        marginLeft: -8,
      }}>&ldquo;</div>
      <p className={isKo ? '' : 'italic-display'} style={{
        fontFamily: isKo ? 'var(--font-body)' : undefined,
        fontSize: isLg ? 28 : (mobileShort ? 18 : (mobile ? 21 : 22)),
        lineHeight: isKo ? 1.5 : 1.32,
        margin: 0,
        color: 'var(--ink)',
        fontWeight: isKo ? 500 : 400,
      }}>
        {text}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: isLg ? 32 : (mobileShort ? 12 : (mobile ? 20 : 22)) }}>
        <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500 }}>
          {source}
        </span>
      </div>
    </div>
  );
}

function ThemePill({ theme, setTheme }) {
  const next = theme === 'warm' ? 'night' : theme === 'night' ? 'paper' : 'warm';
  const icon = theme === 'night'
    ? <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
    : theme === 'paper'
    ? <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v5h4" /></svg>
    : <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>;
  return (
    <button onClick={() => setTheme(next)} aria-label="Cycle theme"
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 34, height: 34, borderRadius: 999,
        border: '1px solid var(--rule)',
        background: 'transparent',
        color: 'var(--ink-soft)', cursor: 'pointer',
      }}>
      {icon}
    </button>
  );
}

function TopBar({ mobile, theme, setTheme }) {
  const { t } = useTranslation();
  return (
    <header style={{
      maxWidth: 1180, width: '100%', margin: '0 auto',
      padding: mobile ? '18px 24px 0' : '28px 72px 0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, position: 'relative', zIndex: 5,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: mobile ? 10 : 12 }}>
        <EmberFlame size={mobile ? 26 : 30} />
        <span className="display" style={{ fontSize: mobile ? 20 : 22, fontWeight: 600, letterSpacing: '-0.005em' }}>Ember</span>
      </div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {!mobile && (
          <>
            <button className="btn btn-ghost"
              style={{ padding: '8px 14px', fontSize: 13, borderColor: 'transparent', color: 'var(--ink-soft)' }}
              onClick={() => scrollToId('how')}>
              {t('login.navHowItWorks')}
            </button>
            <button className="btn btn-ghost"
              style={{ padding: '8px 14px', fontSize: 13, borderColor: 'transparent', color: 'var(--ink-soft)' }}
              onClick={() => scrollToId('discover')}>
              {t('login.navTheShelf')}
            </button>
            <div style={{ width: 1, height: 18, background: 'var(--rule)', margin: '0 6px' }} />
          </>
        )}
        <ThemePill theme={theme} setTheme={setTheme} />
        <LanguageToggle />
      </nav>
    </header>
  );
}

function Hero({ mobile, short, onLogin, corpusCount, theme, setTheme }) {
  const { t, i18n } = useTranslation();
  const isKo = i18n.language === 'ko';
  const heroQuote = useMemo(() => getDailyQuote(), []);
  const mobileShort = mobile && short;

  // parallax — featured card drifts slightly (desktop only)
  const cardRef = useRef(null);
  useEffect(() => {
    if (mobile) return;
    const onScroll = () => {
      if (!cardRef.current) return;
      const y = window.scrollY;
      const damped = Math.max(-80, Math.min(80, y * -0.06));
      cardRef.current.style.setProperty('--parallax', `${damped}px`);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [mobile]);

  const eyebrow = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: mobileShort ? 14 : 22 }}>
      <span style={{ display: 'inline-block', width: 28, height: 1, background: 'var(--ember-deep)' }} />
      <span className="smallcaps" style={{ color: 'var(--ember-deep)' }}>{t('login.eyebrow')}</span>
    </div>
  );

  const headline = (
    <h1 className="display" style={{
      fontSize: mobileShort ? 'clamp(22px, 6vw, 28px)' : (mobile ? 'clamp(28px, 7.5vw, 36px)' : 'clamp(52px, 5.8vw, 92px)'),
      lineHeight: mobile ? 1.04 : 1.02,
      letterSpacing: '-0.022em',
      margin: 0,
      fontWeight: 500,
    }}>
      <span style={{ display: 'block' }}>
        <span className={isKo ? '' : 'italic-display'} style={{
          fontFamily: isKo ? 'var(--font-body)' : undefined,
          color: 'var(--ember-deep)',
          fontWeight: isKo ? 500 : 400,
        }}>
          {t('login.header')}
        </span>
      </span>
      <span style={{ display: 'block', marginTop: 2 }}>{t('login.tagline')}</span>
    </h1>
  );

  const description = (
    <p style={{
      maxWidth: 440,
      fontSize: mobile ? 15.5 : 17.5,
      lineHeight: 1.55,
      color: 'var(--ink-soft)',
      margin: 0,
    }}>
      {t('login.description')}
    </p>
  );

  const ctaBlock = (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      flexDirection: 'column',
      gap: 12,
    }}>
      <button
        className="btn btn-primary"
        onClick={onLogin}
        style={{
          padding: mobile ? '14px 20px' : '14px 22px',
          fontSize: 15,
        }}>
        <GoogleGlyph /> {t('login.cta')}
        <ArrowRight size={16} />
      </button>
    </div>
  );

  const statBlock = (
    <div style={{
      paddingTop: mobileShort ? 14 : 22,
      borderTop: '1px dashed var(--rule)',
      display: 'flex', alignItems: 'center', gap: mobileShort ? 10 : 14, flexWrap: 'wrap',
      maxWidth: 440,
    }}>
      <span className="display" style={{
        fontSize: mobileShort ? 22 : 28, fontWeight: 600, lineHeight: 1,
        color: 'var(--ember-deep)', letterSpacing: '-0.01em',
      }}>
        {corpusCount != null ? `${corpusCount.toLocaleString()}+` : '—'}
      </span>
      <span className="tip" style={{ lineHeight: 1.5, maxWidth: 260 }}>
        {t('login.stat')}
      </span>
    </div>
  );

  const featuredCard = (
    <div ref={cardRef} style={{
      position: 'relative', height: mobile ? 'auto' : '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transform: 'translateY(var(--parallax, 0))',
      transition: 'transform 180ms cubic-bezier(0.2,0.7,0.2,1)',
    }}>
      <div style={{ position: 'relative', zIndex: 1 }} className="fade-up">
        <FeaturedCard quote={heroQuote} isLg={!mobile} mobile={mobile} short={short} />
      </div>
    </div>
  );

  return (
    <section className="paper-grain" style={{
      minHeight: '100vh',
      position: 'relative',
      display: 'flex', flexDirection: 'column',
      background: `
        radial-gradient(ellipse at 88% 25%, rgba(244,164,102,0.38) 0%, transparent 56%),
        radial-gradient(ellipse at 8% 92%, rgba(138,46,42,0.18) 0%, transparent 55%),
        linear-gradient(180deg, var(--bg) 75%, var(--bg-deeper) 100%)
      `,
    }}>
      <EmberSparks count={mobile ? 8 : 16} height={mobile ? 320 : 480} />
      <TopBar mobile={mobile} theme={theme} setTheme={setTheme} />

      {mobile ? (
        <div style={{
          maxWidth: 1180, width: '100%', margin: '0 auto',
          flex: 1, display: 'flex', flexDirection: 'column',
          gap: mobileShort ? 20 : 30,
          padding: mobileShort ? '24px 24px 16px' : '48px 24px 20px',
          position: 'relative', zIndex: 2,
        }}>
          <div className="fade-up" style={{ animationDelay: '60ms' }}>
            {eyebrow}
            {headline}
          </div>
          {featuredCard}
          <div className="fade-up" style={{ animationDelay: '200ms', display: 'flex', flexDirection: 'column', gap: mobileShort ? 16 : 24 }}>
            {description}
            {ctaBlock}
            {statBlock}
          </div>
        </div>
      ) : (
        <div style={{
          maxWidth: 1180, width: '100%', margin: '0 auto',
          flex: 1, display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 0.95fr)',
          gap: 56,
          alignItems: 'center',
          padding: '24px 72px 80px',
          position: 'relative', zIndex: 2,
        }}>
          <div style={{ position: 'relative' }}>
            <div className="fade-up" style={{ animationDelay: '60ms', display: 'flex', flexDirection: 'column', gap: 36 }}>
              <div>
                {eyebrow}
                {headline}
              </div>
              {description}
              {ctaBlock}
              {statBlock}
            </div>
          </div>
          {featuredCard}
        </div>
      )}

      <button
        onClick={() => scrollToId('how')}
        aria-label={t('login.scrollCue')}
        style={{
          position: 'absolute', bottom: mobile ? 12 : 24, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          color: 'var(--ink-mute)',
          background: 'transparent', border: 'none', padding: 0,
          cursor: 'pointer',
          zIndex: 3,
        }}>
        <span className="smallcaps" style={{ fontSize: 10 }}>{t('login.scrollCue')}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 5v14" /><path d="m5 13 7 7 7-7" />
        </svg>
      </button>
    </section>
  );
}

function TodayPreview({ quote, mobile }) {
  const { t, i18n } = useTranslation();
  const isKo = i18n.language === 'ko';
  const text = isKo ? (quote.textKo || quote.text) : quote.text;
  const source = isKo ? (quote.sourceKo || quote.source) : quote.source;
  const tagTheme = quote.tag ? (TAG_COLORS[quote.tag] || { bg: 'var(--surface)', dot: 'var(--ink-mute)' }) : null;
  return (
    <div className="breathe" style={{
      position: 'relative',
      background: 'var(--surface-raised)',
      border: '1px solid var(--rule)',
      borderRadius: 16,
      padding: mobile ? '22px 22px 20px' : '28px 30px 26px',
      boxShadow: '0 40px 80px -40px rgba(60,30,15,0.40), 0 1px 0 rgba(255,255,255,0.4) inset',
      maxWidth: 460,
      width: '100%',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: mobile ? 16 : 22,
      }}>
        <span className="smallcaps" style={{ fontSize: 10 }}>{t('login.ritualPreviewLabel')}</span>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ember-deep)', letterSpacing: '0.16em' }}>
          {t('login.ritualPreviewStreak')}
        </span>
      </div>

      <div className="big-quote" style={{
        fontSize: mobile ? 52 : 64,
        marginLeft: -4,
        marginBottom: mobile ? -10 : -14,
        opacity: 0.45,
      }}>&ldquo;</div>
      <p className={isKo ? '' : 'italic-display'} style={{
        fontFamily: isKo ? 'var(--font-body)' : undefined,
        fontSize: mobile ? 18 : 22, lineHeight: isKo ? 1.5 : 1.35,
        margin: '0 0 16px', color: 'var(--ink)',
      }}>
        {text}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
        <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600 }}>
          {source}
        </span>
      </div>

      <div style={{
        marginTop: mobile ? 16 : 22, paddingTop: mobile ? 14 : 18,
        borderTop: '1px dashed var(--rule)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {tagTheme ? (
          <span className="chip" style={{ background: tagTheme.bg }}>
            <span className="chip-dot" style={{ background: tagTheme.dot }} />
            {t(`tags.${quote.tag}`, { defaultValue: quote.tag })}
          </span>
        ) : <span />}
        <span className="tip" style={{ fontSize: 10 }}>{t('login.ritualPreviewReflect')}</span>
      </div>
    </div>
  );
}

function SectionRitual({ mobile }) {
  const { t, i18n } = useTranslation();
  const isKo = i18n.language === 'ko';
  const todayQuote = useMemo(() => getDailyQuote(), []);
  const steps = [
    [t('login.ritualSaveTitle'), t('login.ritualSaveBody')],
    [t('login.ritualSurfaceTitle'), t('login.ritualSurfaceBody')],
    [t('login.ritualReflectTitle'), t('login.ritualReflectBody')],
  ];

  return (
    <section id="how" className="paper-grain" style={{
      position: 'relative',
      padding: mobile ? '72px 0 80px' : '120px 0',
      background: `
        radial-gradient(ellipse 55% 45% at 10% 75%, rgba(244,164,102,0.18) 0%, transparent 65%),
        radial-gradient(ellipse 35% 30% at 90% 20%, rgba(138,46,42,0.10) 0%, transparent 60%),
        var(--bg-deeper)
      `,
    }}>
      <div style={{
        maxWidth: 1180, width: '100%', margin: '0 auto',
        padding: mobile ? '0 24px' : '0 72px',
        display: 'grid',
        gridTemplateColumns: mobile ? '1fr' : 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
        gap: mobile ? 44 : 72, alignItems: 'center',
      }}>
        <Reveal>
          <span className="smallcaps" style={{ color: 'var(--ember-deep)' }}>{t('login.ritualEyebrow')}</span>
          <h2 className="display" style={{
            fontSize: mobile ? 'clamp(34px, 9vw, 44px)' : 'clamp(40px, 5vw, 64px)',
            lineHeight: 1.02,
            letterSpacing: '-0.018em',
            margin: mobile ? '14px 0 18px' : '18px 0 24px',
            fontWeight: 500,
            maxWidth: 520,
          }}>
            {t('login.ritualHeader')}<br />
            <span className={isKo ? '' : 'italic-display'} style={{
              fontFamily: isKo ? 'var(--font-body)' : undefined,
              color: 'var(--ember-deep)',
              fontWeight: isKo ? 500 : 400,
            }}>
              {t('login.ritualTagline')}
            </span>
          </h2>
          <p style={{
            fontSize: mobile ? 15.5 : 18, lineHeight: 1.6, color: 'var(--ink-soft)',
            maxWidth: 460, margin: 0,
          }}>
            {t('login.ritualBody')}
          </p>

          <ul style={{
            listStyle: 'none', padding: 0, margin: mobile ? '24px 0 0' : '32px 0 0',
            display: 'grid', gap: mobile ? 12 : 14, maxWidth: 480,
          }}>
            {steps.map(([h, b]) => (
              <li key={h} style={{
                display: 'grid',
                gridTemplateColumns: 'min-content 1fr',
                gap: mobile ? 14 : 18,
                alignItems: 'baseline',
                paddingBottom: mobile ? 12 : 14,
                borderBottom: '1px dashed var(--rule)',
              }}>
                <span className={isKo ? '' : 'italic-display'} style={{
                  fontFamily: isKo ? 'var(--font-body)' : undefined,
                  fontSize: mobile ? 19 : 22,
                  color: 'var(--ember-deep)',
                  fontWeight: isKo ? 600 : 400,
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </span>
                <span style={{ fontSize: mobile ? 13.5 : 14.5, lineHeight: 1.55, color: 'var(--ink-soft)' }}>
                  {b}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            {!mobile && (
              <div style={{
                position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                display: 'flex', gap: 6,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: '#E0B68B' }} />
                <span style={{ width: 8, height: 8, borderRadius: 999, background: '#E0B68B' }} />
                <span style={{ width: 8, height: 8, borderRadius: 999, background: '#E0B68B' }} />
              </div>
            )}
            <TodayPreview quote={todayQuote} mobile={mobile} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function TypingPrompt({ phrases, startDelay = 600 }) {
  const [idx, setIdx] = useState(0);
  const [chars, setChars] = useState(0);
  const [phase, setPhase] = useState('typing');
  useEffect(() => {
    const tgt = phrases[idx];
    let timeout;
    if (phase === 'typing') {
      if (chars < tgt.length) {
        timeout = setTimeout(() => setChars(c => c + 1), 55 + Math.random() * 35);
      } else {
        timeout = setTimeout(() => setPhase('hold'), 1700);
      }
    } else if (phase === 'hold') {
      timeout = setTimeout(() => setPhase('erasing'), 1400);
    } else if (phase === 'erasing') {
      if (chars > 0) {
        timeout = setTimeout(() => setChars(c => c - 1), 22);
      } else {
        timeout = setTimeout(() => {
          setIdx((idx + 1) % phrases.length);
          setPhase('typing');
        }, 320);
      }
    }
    return () => clearTimeout(timeout);
  }, [chars, phase, idx, phrases]);
  useEffect(() => {
    const t = setTimeout(() => setPhase('typing'), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);
  return (
    <span>
      {phrases[idx].slice(0, chars)}
      <span className="typing-cursor" />
    </span>
  );
}

function DiscoverInputMock({ phrases, mobile }) {
  const { t } = useTranslation();
  return (
    <div style={{
      background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--bg-deeper) 100%)',
      border: '1.5px solid var(--ember-deep)',
      borderRadius: mobile ? 16 : 20,
      padding: mobile ? '12px 14px' : '18px 22px',
      display: 'flex', alignItems: 'center', gap: mobile ? 10 : 14,
      boxShadow: '0 30px 60px -30px rgba(217,106,60,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',
    }}>
      <div style={{ flexShrink: 0 }}>
        <EmberFlame size={mobile ? 22 : 26} />
      </div>
      <div style={{
        flex: 1, color: 'var(--ink)', fontSize: mobile ? 15 : 18,
        fontFamily: 'var(--font-display)', fontStyle: 'italic',
        minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
      }}>
        <TypingPrompt phrases={phrases} />
      </div>
      <button className="btn btn-primary"
        style={{ padding: mobile ? '8px 12px' : '9px 16px', fontSize: mobile ? 12 : 13 }}
        disabled>
        {mobile ? t('login.discoverAskMobile') : t('login.discoverAskDesktop')}
        <ArrowRight size={mobile ? 12 : 14} />
      </button>
    </div>
  );
}

function DiscoverCard({ result, index, total = 5, ml = 0, mr = 0, mobile }) {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';
  const theme = result.tag ? (TAG_COLORS[result.tag] || null) : null;
  return (
    <article style={{
      position: 'relative',
      marginLeft: mobile ? 0 : ml,
      marginRight: mobile ? 0 : mr,
      maxWidth: mobile ? '100%' : 460,
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: mobile ? -2 : -10, top: mobile ? -16 : -22,
        fontFamily: 'var(--font-display)', fontStyle: 'italic',
        fontSize: mobile ? 70 : 96, color: 'var(--ember)', opacity: 0.14,
        lineHeight: 1, userSelect: 'none', letterSpacing: '-0.04em',
      }}>
        {String(index + 1).padStart(2, '0')}
      </span>

      <div style={{
        position: 'relative', zIndex: 1,
        background: 'var(--surface-raised)',
        border: '1px solid var(--rule)',
        borderRadius: mobile ? 12 : 14,
        padding: mobile ? '16px 18px 14px' : '20px 24px 18px',
      }}>
        {theme && (
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
            background: theme.dot,
            borderRadius: (mobile ? '12px' : '14px') + ' 0 0 ' + (mobile ? '12px' : '14px'),
            opacity: 0.85,
          }} />
        )}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
          marginBottom: mobile ? 8 : 10,
        }}>
          <span className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--ember-deep)' }}>
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          {theme && (
            <span className="chip" style={{ background: theme.bg }}>
              <span className="chip-dot" style={{ background: theme.dot }} />
              {result.tag}
            </span>
          )}
        </div>
        <blockquote className={isKo ? '' : 'italic-display'} style={{
          fontFamily: isKo ? 'var(--font-body)' : undefined,
          margin: 0, fontSize: mobile ? 17 : 20, lineHeight: isKo ? 1.5 : 1.4, color: 'var(--ink)',
        }}>
          &ldquo;{result.text}&rdquo;
        </blockquote>
        <div style={{ marginTop: mobile ? 10 : 12, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ height: 1, width: 20, background: 'var(--ink)' }} />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>{result.source}</span>
          {result.work && (
            <span className={isKo ? '' : 'italic-display'} style={{
              fontFamily: isKo ? 'var(--font-body)' : undefined,
              fontSize: 12.5, color: 'var(--ink-mute)',
            }}>
              · {result.work}
            </span>
          )}
        </div>
        {result.blurb && !mobile && (
          <p style={{
            margin: '12px 0 0',
            fontFamily: 'var(--font-display)', fontStyle: isKo ? 'normal' : 'italic',
            fontSize: 13, lineHeight: 1.5, color: 'var(--ink-soft)',
            paddingLeft: 14, borderLeft: '1px dashed var(--rule)',
          }}>
            {result.blurb}
          </p>
        )}
      </div>
    </article>
  );
}

function SectionDiscover({ mobile }) {
  const { t, i18n } = useTranslation();
  const isKo = i18n.language === 'ko';
  const phrases = [
    t('login.discoverPhrase1'),
    t('login.discoverPhrase2'),
    t('login.discoverPhrase3'),
    t('login.discoverPhrase4'),
    t('login.discoverPhrase5'),
  ];
  const chipsDesktop = [
    t('login.discoverChip1'),
    t('login.discoverChip2'),
    t('login.discoverChip3'),
    t('login.discoverChip4'),
  ];
  const chipsMobile = chipsDesktop.slice(0, 2);
  const results = [
    {
      text: t('login.discoverResult1Text'),
      source: t('login.discoverResult1Source'),
      work: t('login.discoverResult1Work'),
      tag: 'wisdom',
      blurb: t('login.discoverResult1Blurb'),
    },
    {
      text: t('login.discoverResult2Text'),
      source: t('login.discoverResult2Source'),
      work: t('login.discoverResult2Work'),
      tag: 'courage',
      blurb: t('login.discoverResult2Blurb'),
    },
    {
      text: t('login.discoverResult3Text'),
      source: t('login.discoverResult3Source'),
      work: t('login.discoverResult3Work'),
      tag: 'wonder',
      blurb: t('login.discoverResult3Blurb'),
    },
  ];

  return (
    <section id="discover" className="paper-grain" style={{
      position: 'relative',
      padding: mobile ? '72px 0 60px' : '120px 0 80px',
      background: `
        radial-gradient(ellipse 50% 40% at 88% 30%, rgba(244,164,102,0.20) 0%, transparent 65%),
        radial-gradient(ellipse 30% 25% at 5% 80%, rgba(138,46,42,0.10) 0%, transparent 60%),
        linear-gradient(180deg, var(--bg-deeper) 0%, var(--bg) 18%, var(--bg) 100%)
      `,
    }}>
      <EmberSparks count={mobile ? 4 : 8} height={mobile ? 280 : 420} />

      <div style={{
        maxWidth: 1180, width: '100%', margin: '0 auto',
        padding: mobile ? '0 24px' : '0 72px',
        position: 'relative', zIndex: 2,
      }}>
        <Reveal>
          <div style={{ maxWidth: 760 }}>
            <span className="smallcaps" style={{ color: 'var(--ember-deep)' }}>{t('login.discoverEyebrow')}</span>
            <h2 className="display" style={{
              fontSize: mobile ? 'clamp(34px, 9.5vw, 46px)' : 'clamp(40px, 5.4vw, 68px)',
              lineHeight: 1.02,
              letterSpacing: '-0.018em',
              margin: mobile ? '14px 0 18px' : '18px 0 22px',
              fontWeight: 500,
            }}>
              {t('login.discoverHeader')}{' '}
              <span className={isKo ? '' : 'italic-display'} style={{
                fontFamily: isKo ? 'var(--font-body)' : undefined,
                color: 'var(--ember-deep)',
                fontWeight: isKo ? 500 : 400,
              }}>
                {t('login.discoverTagline')}
              </span>
            </h2>
            <p style={{
              fontSize: mobile ? 15.5 : 18, lineHeight: 1.6, color: 'var(--ink-soft)',
              maxWidth: 540,
            }}>
              {t('login.discoverBody')}
            </p>
          </div>
        </Reveal>

        <Reveal delay={120} style={{ marginTop: mobile ? 32 : 44, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
          <DiscoverInputMock phrases={phrases} mobile={mobile} />
          <div style={{
            display: 'flex', justifyContent: 'center',
            gap: mobile ? 6 : 10, marginTop: mobile ? 14 : 18, flexWrap: 'wrap',
          }}>
            {(mobile ? chipsMobile : chipsDesktop).map(p => (
              <span key={p} style={{
                fontFamily: 'var(--font-display)', fontStyle: isKo ? 'normal' : 'italic',
                fontSize: mobile ? 12.5 : 13.5, color: 'var(--ink-mute)',
                padding: mobile ? '5px 10px' : '6px 12px',
                border: '1px dashed var(--rule)',
                borderRadius: 999,
              }}>
                — {p}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={220} style={{ marginTop: mobile ? 48 : 72 }}>
          <div style={{ position: 'relative', display: 'grid', gap: mobile ? 20 : 28, maxWidth: 880, margin: '0 auto' }}>
            <DiscoverCard result={results[0]} index={0} total={5} ml={0} mr={120} mobile={mobile} />
            <DiscoverCard result={results[1]} index={1} total={5} ml={140} mr={0} mobile={mobile} />
            <DiscoverCard result={results[2]} index={2} total={5} ml={40} mr={60} mobile={mobile} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Closing({ mobile, onLogin }) {
  const { t, i18n } = useTranslation();
  const isKo = i18n.language === 'ko';
  return (
    <section id="canon" className="paper-grain" style={{
      position: 'relative',
      minHeight: '100vh',
      padding: mobile ? '112px 0 24px' : '140px 0 40px',
      display: 'flex', flexDirection: 'column',
      background: `
        radial-gradient(ellipse 55% 50% at 50% 55%, rgba(244,164,102,0.30) 0%, rgba(244,164,102,0) 100%),
        var(--bg)
      `,
      textAlign: 'center',
    }}>
      <Reveal>
        <div style={{ maxWidth: 1180, width: '100%', margin: '0 auto', padding: mobile ? '0 24px' : '0 72px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <span style={{ width: 24, height: 1, background: 'var(--ember-deep)' }} />
            <span className="smallcaps" style={{ color: 'var(--ember-deep)' }}>{t('login.closingEyebrow')}</span>
            <span style={{ width: 24, height: 1, background: 'var(--ember-deep)' }} />
          </div>
          <h2 className="display" style={{
            fontSize: mobile ? 'clamp(34px, 9.5vw, 46px)' : 'clamp(40px, 5.4vw, 68px)',
            lineHeight: 1.02,
            letterSpacing: '-0.018em',
            margin: '0 auto 22px',
            fontWeight: 500,
            maxWidth: 760,
          }}>
            {t('login.closingHeader')}<br />
            <span className={isKo ? '' : 'italic-display'} style={{
              fontFamily: isKo ? 'var(--font-body)' : undefined,
              color: 'var(--ember-deep)',
              fontWeight: isKo ? 500 : 400,
            }}>
              {t('login.closingTagline')}
            </span>
          </h2>
          <p style={{
            fontSize: mobile ? 15.5 : 18, lineHeight: 1.6, color: 'var(--ink-soft)',
            maxWidth: 520, margin: '0 auto 36px',
          }}>
            {t('login.closingBody')}
          </p>
          <button className="btn btn-primary" onClick={onLogin}
            style={{
              padding: mobile ? '11px 18px' : '12px 20px',
              fontSize: 14.5,
              width: mobile ? '100%' : undefined,
              maxWidth: mobile ? 280 : undefined,
              justifyContent: mobile ? 'center' : undefined,
            }}>
            <GoogleGlyph /> {t('login.ctaShort')}
            <ArrowRight size={16} />
          </button>

          <div className="tip" style={{ marginTop: 26 }}>
            {t('login.closingStat')}
          </div>
        </div>
      </Reveal>

      <footer style={{
        maxWidth: 1080, margin: 'auto auto 0',
        width: '100%',
        padding: mobile ? '24px 24px 0' : '32px 24px 0',
        borderTop: '1px dashed var(--rule)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: 16, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-mute)' }}>
          <EmberFlame size={18} glow={false} />
          <span className="display" style={{ fontSize: 14, color: 'var(--ink-soft)', fontWeight: 500 }}>Ember</span>
          <span className="tip">{t('login.footerTagline')}</span>
        </div>
        <div style={{ display: 'flex', gap: mobile ? 12 : 20 }}>
          <span className="tip">{t('login.version')}</span>
          <span className="tip">·</span>
          <span className="tip">{t('login.domain')}</span>
        </div>
      </footer>
    </section>
  );
}

function BackToTop() {
  const { t } = useTranslation();
  const scrollToTop = () => {
    const opts = { top: 0, behavior: 'smooth' };
    // Depending on overflow rules, html, body, or window can be the actual
    // scrolling container. Issue scrollTo to all three — the others are no-ops.
    window.scrollTo(opts);
    document.documentElement.scrollTo(opts);
    document.body.scrollTo(opts);
  };
  return (
    <button
      aria-label={t('login.backToTop')}
      onClick={scrollToTop}
      style={{
        position: 'fixed',
        right: 20, bottom: 20,
        width: 48, height: 48,
        borderRadius: 999,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--surface-raised)',
        border: '1px solid var(--rule)',
        color: 'var(--ember-deep)',
        cursor: 'pointer',
        boxShadow: '0 10px 28px -8px rgba(60,30,15,0.30), 0 2px 6px rgba(60,30,15,0.10), inset 0 1px 0 rgba(255,255,255,0.4)',
        transition: 'background 160ms ease',
        zIndex: 100,
        padding: 0,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  );
}

export default function LoginPage({ theme, setTheme }) {
  const mobile = useIsMobile();
  const short = useIsShortScreen();
  const [corpusCount, setCorpusCount] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/api/public/corpus-count`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => { if (!cancelled && data?.count != null) setCorpusCount(data.count); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const handleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div style={{ overflowX: 'hidden' }}>
      <Hero mobile={mobile} short={short} onLogin={handleLogin} corpusCount={corpusCount} theme={theme} setTheme={setTheme} />
      <SectionRitual mobile={mobile} />
      <SectionDiscover mobile={mobile} />
      <Closing mobile={mobile} onLogin={handleLogin} />
      <BackToTop />
    </div>
  );
}
