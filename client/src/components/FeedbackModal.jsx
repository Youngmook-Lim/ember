import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { Icon } from './Icon';

const API_URL = import.meta.env.VITE_API_URL;
const TYPES = ['bug', 'suggestion', 'other'];
const MAX = 5000;

export function FeedbackModal({ user, onClose }) {
  const { t } = useTranslation();
  const [type, setType] = useState('suggestion');
  const [message, setMessage] = useState('');
  const [replyOk, setReplyOk] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const trimmed = message.trim();
  const disabled = submitting || done || trimmed.length === 0 || message.length > MAX;

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          message: trimmed,
          replyOk,
          page: window.location.pathname,
          locale: i18n.language,
        }),
      });
      if (!res.ok) throw new Error('submit failed');
      setDone(true);
      setTimeout(onClose, 1500);
    } catch (e) {
      setError(t('feedback.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(20,10,6,0.45)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 160ms ease both',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 460,
        margin: '0 16px',
        background: 'var(--surface-raised)',
        border: '1px solid var(--rule)',
        borderRadius: 18,
        boxShadow: '0 32px 64px -24px rgba(20,10,6,0.4)',
        overflow: 'hidden',
        animation: 'fadeUp 200ms ease both',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 18px',
          borderBottom: '1px solid var(--rule)',
        }}>
          <h2 className="display" style={{ margin: 0, fontSize: 21, fontWeight: 600 }}>
            {t('feedback.title')}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 40, height: 40, borderRadius: 999,
              background: 'transparent', border: '1px solid var(--rule)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--ink-mute)',
            }}
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Type segmented control */}
          <div>
            <label style={{
              fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--ink-mute)', display: 'block', marginBottom: 10,
            }}>{t('feedback.typeLabel')}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {TYPES.map(id => {
                const active = type === id;
                return (
                  <button
                    key={id}
                    onClick={() => setType(id)}
                    style={{
                      flex: 1, padding: '10px 12px',
                      borderRadius: 10,
                      border: active ? '2px solid var(--ember)' : '2px solid var(--rule)',
                      background: active ? 'color-mix(in srgb, var(--ember) 8%, transparent)' : 'transparent',
                      color: active ? 'var(--ember)' : 'var(--ink)',
                      fontSize: 13, fontWeight: active ? 600 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    {t(`feedback.type${id.charAt(0).toUpperCase() + id.slice(1)}`)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message */}
          <div>
            <label style={{
              fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--ink-mute)', display: 'block', marginBottom: 10,
            }}>{t('feedback.messageLabel')}</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={t('feedback.messagePlaceholder')}
              rows={5}
              maxLength={MAX}
              style={{
                width: '100%', resize: 'vertical', minHeight: 110,
                padding: '12px 14px',
                borderRadius: 10, border: '1px solid var(--rule)',
                background: 'var(--surface)',
                color: 'var(--ink)', fontFamily: 'inherit', fontSize: 14,
                lineHeight: 1.5, outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{
              fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)',
              textAlign: 'right', marginTop: 6,
            }}>{t('feedback.charCount', { used: message.length, max: MAX })}</div>
          </div>

          {/* Reply opt-in */}
          <label style={{
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 13, color: 'var(--ink)',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={replyOk}
              onChange={e => setReplyOk(e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            <span>{t('feedback.replyOk', { email: user?.email })}</span>
          </label>

          {/* Status / error */}
          {done && (
            <div style={{ fontSize: 13, color: 'var(--ember)', textAlign: 'center' }}>
              {t('feedback.thanks')}
            </div>
          )}
          {error && (
            <div style={{ fontSize: 13, color: '#C0392B', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={submit}
            disabled={disabled}
            className="btn btn-primary"
            style={{
              padding: '11px 16px',
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? 'default' : 'pointer',
            }}
          >
            {submitting ? t('feedback.submitting') : t('feedback.submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
