import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';
import { useAiReflection } from '../hooks/useAiReflection';

// Props:
//   text, source, work — current quote field values
//   reflection         — current reflection textarea value
//   onInsert(string)   — callback to write into the textarea
export function AiReflectButton({ text, source, work, reflection, onInsert }) {
  const { t } = useTranslation();
  const { generate, loading, error, clearError } = useAiReflection();
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  const quoteEmpty = !text || !text.trim();
  const disabled = quoteEmpty || loading;

  useEffect(() => {
    if (!error) return;
    const id = setTimeout(clearError, 6000);
    return () => clearTimeout(id);
  }, [error, clearError]);

  async function runGenerate() {
    setAwaitingConfirm(false);
    const result = await generate({ text: text.trim(), source, work });
    if (result) onInsert(result);
  }

  function handleClick() {
    if (disabled) return;
    if (reflection && reflection.trim()) {
      setAwaitingConfirm(true);
      return;
    }
    runGenerate();
  }

  function confirmReplace() {
    runGenerate();
  }

  function cancelReplace() {
    setAwaitingConfirm(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        style={{
          padding: '6px 12px 6px 8px',
          background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--bg-deeper) 100%)',
          border: '1.5px solid var(--ember-deep)',
          borderRadius: 999,
          color: 'var(--ink)',
          fontFamily: 'var(--font-body)',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.03em',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          animation: disabled && !loading ? 'none' : 'discoverGlowPulse 3.5s ease-in-out infinite',
          opacity: disabled && !loading ? 0.55 : 1,
          transition: 'opacity 200ms ease',
        }}
      >
        <span style={{
          width: 18, height: 18,
          borderRadius: '999px',
          background: 'var(--ember)',
          color: '#FFFBEE',
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 3px 8px -3px var(--ember-deep), inset 0 -1px 0 rgba(0,0,0,0.15)',
          flexShrink: 0,
        }}>
          <svg width="8" height="10" viewBox="0 0 40 46" fill="currentColor" aria-hidden="true">
            <path d="M20 4 C 22 12, 30 14, 30 24 C 30 33, 25 40, 20 40 C 15 40, 10 34, 10 26 C 10 22, 13 20, 14 18 C 15 22, 17 22, 17 18 C 17 14, 19 10, 20 4 Z" />
          </svg>
        </span>
        {loading ? t('aiReflect.loading') : t('aiReflect.button')}
      </button>

      {awaitingConfirm && (
        <div style={{
          marginTop: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
          fontSize: 13,
          color: 'var(--ink-mute)',
        }}>
          <span>{t('aiReflect.replaceConfirm')}</span>
          <button type="button" className="btn btn-primary" onClick={confirmReplace}
            style={{ fontSize: 12, padding: '4px 10px' }}>
            <Icon name="check" size={12} stroke={2} /> {t('aiReflect.replace')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={cancelReplace}
            style={{ fontSize: 12, padding: '4px 10px' }}>
            {t('aiReflect.cancel')}
          </button>
        </div>
      )}

      {error && (
        <p style={{ marginTop: 8, fontSize: 12, color: '#C0392B' }}>
          {t('aiReflect.error')}
        </p>
      )}
    </>
  );
}
