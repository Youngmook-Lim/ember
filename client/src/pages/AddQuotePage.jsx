import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '../components/Icon';
import { TagChip } from '../components/TagChip';
import { useIsMobile } from '../hooks/useIsMobile';
import { TAGS } from '../constants';

const API_URL = import.meta.env.VITE_API_URL;

function Field({ label, children }) {
  return (
    <label style={{ display: 'block' }}>
      <span className="smallcaps" style={{ display: 'block', marginBottom: 8 }}>{label}</span>
      {children}
    </label>
  );
}

function ImportModal({ onClose }) {
  const [picks, setPicks] = useState({ a: true, b: false, c: true });
  const { t } = useTranslation();
  const hits = [
    { k: 'a', text: 'You do not rise to the level of your goals. You fall to the level of your systems.', src: 'James Clear', book: 'Atomic Habits', loc: 'loc 328' },
    { k: 'b', text: 'Never attribute to malice that which is adequately explained by stupidity.', src: 'Robert Hanlon', book: "Murphy's Law Book Two", loc: 'loc 1204' },
    { k: 'c', text: 'Between stimulus and response there is a space.', src: 'Viktor Frankl', book: "Man's Search for Meaning", loc: 'loc 880' },
  ];
  const count = Object.values(picks).filter(Boolean).length;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: 'var(--ink-mute)', cursor: 'pointer' }}>
          <Icon name="x" size={18} />
        </button>
        <p className="smallcaps" style={{ color: 'var(--ember-deep)' }}>{t('addQuote.importBadge')}</p>
        <h2 className="display" style={{ fontSize: 26, margin: '10px 0 4px', fontWeight: 500 }}>
          {t('addQuote.importTitle')}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ink-mute)', margin: 0 }}>
          {t('addQuote.importCount')}
        </p>
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto', paddingRight: 6 }}>
          {hits.map(h => (
            <label key={h.k} style={{
              display: 'flex', gap: 12, padding: 14, borderRadius: 10,
              border: `1px solid ${picks[h.k] ? 'var(--ember)' : 'var(--rule)'}`,
              background: picks[h.k] ? 'rgba(217,106,60,0.07)' : 'var(--surface)',
              cursor: 'pointer', transition: 'all 120ms ease',
            }}>
              <input type="checkbox" checked={picks[h.k]} onChange={() => setPicks(p => ({ ...p, [h.k]: !p[h.k] }))}
                style={{ accentColor: 'var(--ember)', marginTop: 3 }} />
              <div style={{ flex: 1 }}>
                <p className="italic-display" style={{ margin: 0, fontSize: 15, lineHeight: 1.45, color: 'var(--ink)' }}>
                  "{h.text}"
                </p>
                <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>
                  {h.src} · {h.book} · {h.loc}
                </p>
              </div>
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button className="btn btn-primary" onClick={onClose}>
            <Icon name="plus" size={14} stroke={2} /> {t('addQuote.importSave', { count })}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>{t('addQuote.importNotNow')}</button>
        </div>
      </div>
    </div>
  );
}

export default function AddQuotePage() {
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [work, setWork] = useState('');
  const [tag, setTag] = useState('wonder');
  const [reflection, setReflection] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const mobile = useIsMobile();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const handleSubmit = async () => {
    setError('');
    if (!text.trim()) { setError(t('addQuote.textRequired')); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/quotes`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text, source: source.trim() || null,
          work: work.trim() || null,
          tag: tag || null,
          reflection: reflection.trim() || null,
        }),
      });
      if (res.ok) {
        navigate('/collection');
      } else {
        const data = await res.json();
        setError(data.error || t('addQuote.error'));
      }
    } catch {
      setError(t('addQuote.serverError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="paper-grain" style={{ minHeight: 'calc(100vh - 61px)' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: mobile ? '24px 16px 100px' : '48px 28px 80px' }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-end', marginBottom: 8,
          flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <p className="smallcaps" style={{ color: 'var(--ember-deep)', marginBottom: 10 }}>
              {t('addQuote.badge')}
            </p>
            <h1 className="display" style={{ fontSize: mobile ? 32 : 42, margin: 0, fontWeight: 500, letterSpacing: '-0.02em' }}>
              {t('addQuote.header')}
            </h1>
            <p className="margin-note" style={{ marginTop: 8 }}>
              {t('addQuote.description')}
            </p>
          </div>
          {!mobile && (
            <button className="btn btn-ghost" onClick={() => setShowImport(true)}>
              <Icon name="import" size={15} /> {t('addQuote.import')}
            </button>
          )}
        </div>

        <div className="rule" style={{ margin: '28px 0' }} />

        {/* Card */}
        <div className="card" style={{ padding: mobile ? '22px 18px' : '36px 40px', borderRadius: 18 }}>

          {/* Quote textarea — big quote mark beside it */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
            <span className="big-quote" style={{ fontSize: 72, lineHeight: 0.6, marginTop: 16 }}>"</span>
            <textarea
              className="textarea"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={t('addQuote.textPlaceholder')}
              rows={4}
              autoFocus
              style={{
                flex: 1,
                fontFamily: 'var(--font-display)', fontStyle: 'italic',
                fontSize: mobile ? 20 : 24, lineHeight: 1.4,
                background: 'transparent', border: 'none',
                padding: 0, boxShadow: 'none', resize: 'none',
                outline: 'none',
              }}
            />
          </div>

          <div className="rule" style={{ margin: '24px 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 20 }}>
            <Field label={t('addQuote.authorLabel')}>
              <input className="input" value={source} onChange={e => setSource(e.target.value)} placeholder={t('addQuote.authorPlaceholder')} />
            </Field>
            <Field label={t('addQuote.workLabel')}>
              <input className="input" value={work} onChange={e => setWork(e.target.value)} placeholder={t('addQuote.workPlaceholder')} />
            </Field>
          </div>

          <div style={{ marginTop: 22 }}>
            <p className="smallcaps" style={{ marginBottom: 10 }}>{t('addQuote.tagLabel')}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TAGS.map(tg => (
                <TagChip key={tg} tag={tg} active={tag === tg} onClick={() => setTag(a => a === tg ? '' : tg)} />
              ))}
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <p className="smallcaps" style={{ marginBottom: 10 }}>
              {t('addQuote.reflectionLabel')}{' '}
              <span style={{ textTransform: 'none', fontSize: 11, color: 'var(--ink-mute)', fontWeight: 400, letterSpacing: 0 }}>
                {t('addQuote.reflectionOptional')}
              </span>
            </p>
            <textarea
              className="textarea"
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              placeholder={t('addQuote.reflectionPlaceholder')}
              rows={3}
              style={{ fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: 16, lineHeight: 1.55 }}
            />
          </div>
        </div>

        {error && (
          <p style={{ color: '#C0392B', fontSize: 13, marginTop: 14 }}>{error}</p>
        )}

        {/* Actions outside card */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving || !text.trim()}
            style={{ opacity: text.trim() ? 1 : 0.5, padding: '14px 22px' }}
          >
            <Icon name="check" size={16} stroke={2.2} /> {saving ? t('addQuote.saving') : t('addQuote.save')}
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('/collection')}>{t('addQuote.cancel')}</button>
          <div style={{ flex: 1 }} />
          <p className="tip">{t('addQuote.keyboard')}</p>
        </div>
      </div>

      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
    </div>
  );
}
