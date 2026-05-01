import { useTranslation } from 'react-i18next';
import { EmberFlame } from '../components/EmberFlame';
import { Icon } from '../components/Icon';
import { useIsMobile } from '../hooks/useIsMobile';

const FEATURED_QUOTES = [
  { text: "The soul becomes dyed with the color of its thoughts.", source: "Marcus Aurelius" },
  { text: "Not all those who wander are lost.", source: "J.R.R. Tolkien" },
  { text: "We accept the love we think we deserve.", source: "Stephen Chbosky" },
  { text: "Time you enjoy wasting is not wasted time.", source: "Marthe Troly-Curtin" },
  { text: "Simplicity is the ultimate sophistication.", source: "Leonardo da Vinci" },
  { text: "The unexamined life is not worth living.", source: "Socrates" },
  { text: "To live is the rarest thing in the world. Most people just exist.", source: "Oscar Wilde" },
  { text: "In the middle of difficulty lies opportunity.", source: "Albert Einstein" },
  { text: "It is not length of life, but depth of life.", source: "Ralph Waldo Emerson" },
  { text: "A reader lives a thousand lives before he dies.", source: "George R.R. Martin" },
  { text: "The present moment always will have been.", source: "Ursula K. Le Guin" },
  { text: "Do I dare disturb the universe?", source: "T.S. Eliot" },
  { text: "I am not afraid of storms, for I am learning how to sail my ship.", source: "Louisa May Alcott" },
  { text: "The cave you fear to enter holds the treasure you seek.", source: "Joseph Campbell" },
];

function getDailyQuote() {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return FEATURED_QUOTES[seed % FEATURED_QUOTES.length];
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

function FeaturedCard({ quote, compact }) {
  const { t } = useTranslation();
  return (
    <div style={{
      maxWidth: compact ? '100%' : 440,
      width: '100%',
      background: 'var(--surface-raised)',
      border: '1px solid var(--rule)',
      borderRadius: 8,
      padding: compact ? '32px 28px' : '52px 44px',
      position: 'relative',
      boxShadow: '0 30px 60px -30px rgba(60,30,15,0.35), 0 1px 0 rgba(255,255,255,0.4) inset',
      transform: compact ? 'none' : 'rotate(1.2deg)',
    }}>
      <div style={{ marginBottom: compact ? 22 : 32 }}>
        <span className="smallcaps">{t('login.featured')}</span>
      </div>

      <div className="big-quote" style={{ fontSize: compact ? 64 : 90, marginBottom: compact ? -14 : -20, marginLeft: -8 }}>"</div>

      <p className="italic-display" style={{
        fontSize: compact ? 22 : 28, lineHeight: 1.32, margin: 0,
        color: 'var(--ink)', fontWeight: 400,
      }}>
        {quote.text}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: compact ? 22 : 32 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 13,
          color: 'var(--ink-soft)', fontWeight: 500,
        }}>
          {quote.source}
        </span>
      </div>

      <div className="margin-note" style={{ marginTop: compact ? 14 : 20, fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
        {t('login.featuredQuotes')}
      </div>

    </div>
  );
}

export default function LoginPage() {
  const mobile = useIsMobile();
  const featuredQuote = getDailyQuote();
  const { t } = useTranslation();

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <div
      className="paper-grain"
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: mobile ? '1fr' : '1.05fr 0.95fr',
        overflowX: 'hidden',
        background: `
          radial-gradient(ellipse at 85% 30%, rgba(244,164,102,0.35) 0%, transparent 55%),
          radial-gradient(ellipse at 15% 85%, rgba(138,46,42,0.18) 0%, transparent 55%),
          var(--bg)
        `,
      }}
    >
      {/* Left — brand */}
      <div style={{
        padding: mobile ? '44px 24px' : '56px 72px',
        display: 'flex', flexDirection: 'column',
        position: 'relative', zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <EmberFlame size={32} />
          <span className="display" style={{ fontSize: 24, fontWeight: 600 }}>Ember</span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Main content */}
        <div style={{ maxWidth: 520 }}>
          <h1 className="display" style={{
            fontSize: mobile ? 52 : 88,
            lineHeight: 0.95,
            letterSpacing: '-0.035em',
            margin: 0,
            fontWeight: 500,
          }}>
            {t('login.header')}<br />
            <span className="italic-display" style={{ color: 'var(--ember-deep)', fontWeight: 400 }}>
              {t('login.tagline')}
            </span>
          </h1>

          <p style={{
            marginTop: 28, maxWidth: 440,
            fontSize: mobile ? 15 : 17, lineHeight: 1.6,
            color: 'var(--ink-soft)',
          }}>
            {t('login.description')}
          </p>

          {/* Mobile quote card — between description and CTA */}
          {mobile && (
            <div style={{ marginTop: 32, paddingBottom: 8 }}>
              <FeaturedCard quote={featuredQuote} compact />
            </div>
          )}

          <div style={{ marginTop: mobile ? 32 : 44 }}>
            <button className="btn btn-primary" onClick={handleLogin} style={{ padding: '14px 22px', fontSize: 15 }}>
              <GoogleGlyph /> {t('login.cta')}
              <Icon name="arrow-right" size={16} stroke={2} />
            </button>
            <p className="tip" style={{ marginTop: 14 }}>
              {t('login.privacy')}
            </p>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Footer */}
        <div style={{
          display: 'flex', gap: 20,
          color: 'var(--ink-mute)', fontSize: 12,
          fontFamily: 'var(--font-mono)',
        }}>
          <span>{t('login.version')}</span>
          <span>·</span>
          <span>{t('login.domain')}</span>
        </div>
      </div>

      {/* Right — featured quote card (desktop only) */}
      {!mobile && (
        <div style={{
          padding: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FeaturedCard quote={featuredQuote} />
        </div>
      )}
    </div>
  );
}
