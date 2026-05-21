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
  const [pending, setPending] = useState(null); // generated reflection awaiting confirm

  const quoteEmpty = !text || !text.trim();
  const disabled = quoteEmpty || loading;

  useEffect(() => {
    if (!error) return;
    const id = setTimeout(clearError, 6000);
    return () => clearTimeout(id);
  }, [error, clearError]);

  async function handleClick() {
    if (disabled) return;
    const result = await generate({ text: text.trim(), source, work });
    if (!result) return;
    if (!reflection || !reflection.trim()) {
      onInsert(result);
    } else {
      setPending(result);
    }
  }

  function confirmReplace() {
    if (pending) onInsert(pending);
    setPending(null);
  }

  function cancelReplace() {
    setPending(null);
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={handleClick}
        disabled={disabled}
        style={{
          fontSize: 12,
          padding: '4px 10px',
          opacity: disabled && !loading ? 0.5 : 1,
        }}
      >
        <svg width="10" height="12" viewBox="0 0 40 46" fill="currentColor" aria-hidden="true"
          style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.4em' }}>
          <path d="M20 4 C 22 12, 30 14, 30 24 C 30 33, 25 40, 20 40 C 15 40, 10 34, 10 26 C 10 22, 13 20, 14 18 C 15 22, 17 22, 17 18 C 17 14, 19 10, 20 4 Z" />
        </svg>
        {loading ? t('aiReflect.loading') : t('aiReflect.button')}
      </button>

      {pending && (
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
