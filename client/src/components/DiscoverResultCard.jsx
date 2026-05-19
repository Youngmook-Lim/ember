import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';

const API_URL = import.meta.env.VITE_API_URL;

export function DiscoverResultCard({ result, initiallySaved }) {
  const { t } = useTranslation();
  // Display Korean only when the backend returned a Korean translation (i.e. the
  // user's query was Korean), regardless of UI language. This keeps the text,
  // author, and work consistent on a single card.
  const isKoResult = !!result.translatedText;
  const [saved, setSaved] = useState(!!initiallySaved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const displayText = isKoResult ? result.translatedText : result.text;
  const displayAuthor = isKoResult ? (result.authorKo || result.author) : result.author;
  const displayWork = isKoResult ? (result.workKo || result.work) : result.work;

  async function handleSave() {
    if (saved || saving) return;
    setSaving(true);
    setError(null);
    setSaved(true); // optimistic
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
      background: 'var(--surface-raised)',
      border: '1px solid var(--rule)',
      borderRadius: 14,
      padding: '20px 22px',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <blockquote
        className={isKoResult ? '' : 'italic-display'}
        style={{
          margin: 0,
          fontFamily: isKoResult ? 'var(--font-body)' : undefined,
          fontWeight: isKoResult ? 500 : undefined,
          fontSize: 19,
          lineHeight: 1.5,
        }}
      >
        {displayText}
      </blockquote>
      <div style={{ fontSize: 13, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>
        {displayAuthor}{displayWork ? ` · ${displayWork}` : ''}
      </div>
      {result.blurb && (
        <div style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--ink-mute)' }}>
          {result.blurb}
        </div>
      )}
      {result.reasoning && (
        <details style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
          <summary style={{ cursor: 'pointer' }}>{t('discover.reasoningLabel')}</summary>
          <div style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{result.reasoning}</div>
        </details>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          className={saved ? 'btn' : 'btn btn-primary'}
          onClick={handleSave}
          disabled={saved || saving}
          style={{ padding: '8px 14px' }}
        >
          <Icon name={saved ? 'check' : 'plus'} size={14} stroke={2} />{' '}
          {saved ? t('discover.saved') : t('discover.save')}
        </button>
        {error && <span style={{ fontSize: 12, color: '#C0392B' }}>{error}</span>}
      </div>
    </article>
  );
}
