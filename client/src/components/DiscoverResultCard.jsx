import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TAG_COLORS } from '../constants';

const API_URL = import.meta.env.VITE_API_URL;

const PICK_OFFSETS = [
  { ml: 0,   mr: 0  },
  { ml: 84,  mr: 0  },
  { ml: 0,   mr: 60 },
  { ml: 110, mr: 0  },
  { ml: 30,  mr: 30 },
];

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function DiscoverResultCard({ result, initiallySaved, index = 0, total = 5, mobile = false }) {
  const { t } = useTranslation();
  const isKoResult = !!result.translatedText;
  const [saved, setSaved] = useState(!!initiallySaved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const rawText = isKoResult ? result.translatedText : result.text;
  const displayText = rawText.replace(/^["""]+|["""]+$/g, '').trim();
  const displayAuthor = isKoResult ? (result.authorKo || result.author) : result.author;
  const displayWork = isKoResult ? (result.workKo || result.work) : result.work;

  const tagTheme = result.tag ? (TAG_COLORS[result.tag] || null) : null;
  const o = PICK_OFFSETS[index] || PICK_OFFSETS[0];

  async function handleSave() {
    if (saved || saving) return;
    setSaving(true);
    setError(null);
    setSaved(true);
    try {
      const res = await fetch(`${API_URL}/api/quotes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: displayText,
          source: displayAuthor,
          work: displayWork || undefined,
          reflection: result.blurb || undefined,
          origin: 'ai',
          corpusQuoteId: result.corpusQuoteId,
        }),
      });
      if (!res.ok) throw new Error('save failed');
    } catch {
      setSaved(false);
      setError(t('discover.savingError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <article style={{
      position: 'relative',
      marginLeft: mobile ? 0 : o.ml,
      marginRight: mobile ? 0 : o.mr,
    }}>
      {/* Ghost numeral */}
      <span aria-hidden style={{
        position: 'absolute',
        left: mobile ? -4 : -12,
        top: mobile ? -16 : -22,
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontSize: mobile ? 70 : 110,
        color: 'var(--ember)',
        opacity: 0.14,
        lineHeight: 1,
        zIndex: 0,
        userSelect: 'none',
        letterSpacing: '-0.04em',
      }}>
        {String(index + 1).padStart(2, '0')}
      </span>

      <div style={{
        position: 'relative', zIndex: 1,
        background: 'var(--surface-raised)',
        border: '1px solid var(--rule)',
        borderRadius: mobile ? 12 : 14,
        padding: mobile ? '16px 18px' : '22px 26px 20px',
      }}>
        {/* Tag color stripe */}
        {tagTheme && (
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
            background: tagTheme.dot,
            borderRadius: `${mobile ? 12 : 14}px 0 0 ${mobile ? 12 : 14}px`,
            opacity: 0.85,
          }} />
        )}

        {/* Header row: counter + tag chip */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: 12, marginBottom: mobile ? 10 : 12,
        }}>
          <span className="mono" style={{
            fontSize: mobile ? 9 : 10, letterSpacing: '0.18em', color: 'var(--ember-deep)',
          }}>
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          {tagTheme && (
            <span className="chip" style={{
              background: tagTheme.bg,
              padding: mobile ? '4px 9px' : undefined,
              fontSize: mobile ? 10 : undefined,
            }}>
              <span className="chip-dot" style={{
                background: tagTheme.dot,
                width: mobile ? 6 : undefined,
                height: mobile ? 6 : undefined,
              }} />
              {result.tag}
            </span>
          )}
        </div>

        {/* Quote text */}
        <blockquote
          className={isKoResult ? '' : 'italic-display'}
          style={{
            margin: 0,
            fontFamily: isKoResult ? 'var(--font-body)' : undefined,
            fontWeight: isKoResult ? 500 : undefined,
            fontSize: mobile ? 17 : 22,
            lineHeight: 1.42,
            color: 'var(--ink)',
          }}
        >
          &#x201C;{displayText}&#x201D;
        </blockquote>

        {/* Author + work */}
        <div style={{
          marginTop: mobile ? 12 : 14,
          display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: mobile ? 8 : 10,
        }}>
          <span style={{ height: 1, width: mobile ? 16 : 22, background: 'var(--ink)' }} />
          <span style={{ fontSize: mobile ? 12 : 13, fontWeight: 600, color: 'var(--ink)' }}>
            {displayAuthor}
          </span>
          {displayWork && (
            <span style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: mobile ? 12 : 13, color: 'var(--ink-mute)',
            }}>
              · {displayWork}
            </span>
          )}
        </div>

        {/* Blurb */}
        {result.blurb && (
          <p style={{
            margin: `${mobile ? 10 : 12}px 0 0`,
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: mobile ? 12.5 : 13.5, lineHeight: 1.5,
            color: 'var(--ink-soft)',
            paddingLeft: mobile ? 12 : 14,
            borderLeft: '1px dashed var(--rule)',
          }}>
            {result.blurb}
          </p>
        )}

        {/* Save button */}
        <div style={{
          marginTop: mobile ? 14 : 16,
          paddingTop: mobile ? 12 : 14,
          borderTop: '1px dashed var(--rule)',
        }}>
          <button
            onClick={handleSave}
            disabled={saved || saving}
            className="btn"
            style={{
              padding: mobile ? '8px 14px' : '7px 14px',
              fontSize: mobile ? 12 : 12.5,
              background: saved ? 'var(--surface)' : 'var(--ember)',
              color: saved ? 'var(--ink-mute)' : '#FFFBEE',
              border: saved ? '1px solid var(--rule)' : '1px solid var(--ember-deep)',
              width: mobile ? '100%' : undefined,
              justifyContent: mobile ? 'center' : undefined,
            }}
          >
            {saved ? <><CheckIcon /> {t('discover.saved')}</> : <><PlusIcon /> {t('discover.save')}</>}
          </button>
          {error && <span style={{ fontSize: 12, color: '#C0392B', marginLeft: 10 }}>{error}</span>}
        </div>
      </div>
    </article>
  );
}
