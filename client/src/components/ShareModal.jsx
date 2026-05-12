import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toBlob } from 'html-to-image';
import { Icon } from './Icon';

const FORMATS = {
  story:     { labelKey: 'share.formatStory',     ratio: '9 / 16', w: 1080, h: 1920 },
  square:    { labelKey: 'share.formatSquare',    ratio: '1 / 1',  w: 1080, h: 1080 },
  landscape: { labelKey: 'share.formatLandscape', ratio: '16 / 9', w: 1600, h: 900 },
};

const THEMES = {
  cream: { bg: '#F6EAD3', ink: '#2A1F1B', accent: '#D96A3C', grain: true },
  night: { bg: '#1C130F', ink: '#F6EAD3', accent: '#F4A466', grain: false },
  ember: { bg: 'linear-gradient(135deg, #D96A3C 0%, #8A2E2A 100%)', ink: '#FFFBEE', accent: '#FFFBEE', grain: false },
  ink:   { bg: '#0E0E0E', ink: '#F6EAD3', accent: '#F4A466', grain: false },
  paper: { bg: '#EEE6D4', ink: '#1B1B1B', accent: '#9B3A1E', grain: true },
  olive: { bg: '#3D4634', ink: '#F6EAD3', accent: '#E8C888', grain: false },
};

const TEMPLATES = ['classic', 'bold', 'minimal', 'marginalia'];

let grainTextureInjected = false;
function ensureGrainTexture() {
  if (grainTextureInjected || typeof document === 'undefined') return;
  grainTextureInjected = true;
  const size = 96;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const visible = Math.random() < 0.06;
    img.data[i]     = 38;
    img.data[i + 1] = 25;
    img.data[i + 2] = 13;
    img.data[i + 3] = visible ? 3 + Math.floor(Math.random() * 10) : 0;
  }
  ctx.putImageData(img, 0, 0);
  document.documentElement.style.setProperty('--grain-texture', `url(${canvas.toDataURL('image/png')})`);
}

function FormatGlyph({ kind }) {
  const p = { width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 1.6 };
  if (kind === 'story')     return <svg {...p} viewBox="0 0 16 16"><rect x="4.5" y="1.5" width="7" height="13" rx="1"/></svg>;
  if (kind === 'square')    return <svg {...p} viewBox="0 0 16 16"><rect x="2.5" y="2.5" width="11" height="11" rx="1"/></svg>;
  return <svg {...p} viewBox="0 0 16 16"><rect x="1.5" y="4" width="13" height="8" rx="1"/></svg>;
}

function GrainOverlay() {
  ensureGrainTexture();
  return (
    <div className="grain-overlay" />
  );
}

function SharePreview({ quote, format, theme: t, template, showAttribution, cardRef }) {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';
  const isLandscape = format.ratio === '16 / 9';
  const base = {
    aspectRatio: format.ratio,
    background: t.bg,
    color: t.ink,
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'var(--font-display)',
    width: '100%',
    maxHeight: '52vh',
  };
  const pad = isLandscape ? '8%' : '9%';

  const watermark = (
    <div style={{
      position: 'absolute', bottom: pad, right: pad,
      fontFamily: 'var(--font-body)', fontSize: 'clamp(9px, 1.3cqw, 12px)',
      letterSpacing: '0.16em', textTransform: 'uppercase',
      opacity: 0.5, color: t.ink, fontWeight: 600,
    }}><svg width="9" height="10" viewBox="0 0 40 46" fill="currentColor" aria-hidden="true" style={{display:'inline-block',verticalAlign:'middle',marginRight:'0.35em'}}><path d="M20 4 C 22 12, 30 14, 30 24 C 30 33, 25 40, 20 40 C 15 40, 10 34, 10 26 C 10 22, 13 20, 14 18 C 15 22, 17 22, 17 18 C 17 14, 19 10, 20 4 Z"/></svg>Ember</div>
  );

  if (template === 'classic') return (
    <div ref={cardRef} className="share-card" style={base}>
      {t.grain && <GrainOverlay />}
      <div style={{ padding: pad, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 'clamp(40px, 22cqw, 220px)', lineHeight: 0.7, color: t.accent, opacity: 0.55, fontStyle: 'italic', marginTop: '-0.08em' }}>"</div>
        <p style={{ fontFamily: isKo ? 'var(--font-body)' : undefined, fontStyle: isKo ? 'normal' : 'italic', fontWeight: isKo ? 500 : 400, fontSize: `clamp(16px, ${isLandscape ? '4.8cqw' : '6.2cqw'}, 44px)`, lineHeight: isKo ? 1.6 : 1.4, margin: '0.2em 0 0', flex: 1 }}>
          {quote.text}
        </p>
        {showAttribution && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8em', marginTop: '1em' }}>
            <div style={{ width: '2em', height: 1, background: t.ink, opacity: 0.4 }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(10px, 2cqw, 16px)', fontWeight: 600 }}>
              {quote.source}{quote.work && <span style={{ opacity: 0.6 }}>  ·  {quote.work}</span>}
            </span>
          </div>
        )}
      </div>
      {watermark}
    </div>
  );

  if (template === 'bold') return (
    <div ref={cardRef} className="share-card" style={base}>
      {t.grain && <GrainOverlay />}
      <div style={{ padding: pad, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p style={{ fontWeight: 600, fontSize: `clamp(20px, ${isLandscape ? '6.5cqw' : '9cqw'}, 84px)`, lineHeight: 1.2, margin: 0, letterSpacing: '-0.01em' }}>
          {quote.text}
        </p>
        {showAttribution && (
          <div style={{ marginTop: '1.4em', fontFamily: 'var(--font-body)', fontSize: 'clamp(10px, 1.8cqw, 16px)', fontWeight: 700, letterSpacing: '0.12em', color: t.accent, textTransform: 'uppercase' }}>
            — {quote.source}
          </div>
        )}
      </div>
      {watermark}
    </div>
  );

  if (template === 'minimal') return (
    <div ref={cardRef} className="share-card" style={base}>
      {t.grain && <GrainOverlay />}
      <div style={{ padding: pad, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <p style={{ fontWeight: 400, fontSize: `clamp(14px, ${isLandscape ? '4cqw' : '5cqw'}, 38px)`, lineHeight: 1.5, margin: 0 }}>
          {quote.text}
        </p>
        {showAttribution && (
          <div style={{ marginTop: '1.8em', fontFamily: 'var(--font-body)', fontSize: 'clamp(9px, 1.8cqw, 14px)', opacity: 0.6 }}>
            {quote.source}
          </div>
        )}
      </div>
      {watermark}
    </div>
  );

  // marginalia
  return (
    <div ref={cardRef} className="share-card" style={base}>
      {t.grain && <GrainOverlay />}
      <div style={{ padding: pad, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontStyle: 'italic', fontSize: 'clamp(10px, 1.8cqw, 14px)', color: t.accent, opacity: 0.7, position: 'absolute', top: pad, right: pad }}>
          No. {quote.id || '—'}
        </div>
        <p style={{ fontFamily: isKo ? 'var(--font-body)' : undefined, fontStyle: isKo ? 'normal' : 'italic', fontWeight: isKo ? 500 : 400, fontSize: `clamp(14px, ${isLandscape ? '4.2cqw' : '5.5cqw'}, 40px)`, lineHeight: isKo ? 1.6 : 1.4, margin: 'auto 20% auto 0' }}>
          {quote.text}
        </p>
        {showAttribution && (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(9px, 1.7cqw, 14px)', opacity: 0.7, display: 'flex', gap: '0.8em' }}>
            <span>{quote.source}</span>
            {quote.work && <span style={{ fontFamily: isKo ? 'var(--font-body)' : 'var(--font-display)', fontStyle: isKo ? 'normal' : 'italic' }}>{quote.work}</span>}
          </div>
        )}
      </div>
      {watermark}
    </div>
  );
}

export function ShareModal({ quote, onClose }) {
  const [format, setFormat] = useState('story');
  const [themeKey, setThemeKey] = useState('cream');
  const [template, setTemplate] = useState('classic');
  const [showAttribution, setShowAttribution] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);
  const { t: tr } = useTranslation();

  const f = FORMATS[format];
  const t = THEMES[themeKey];

  const canShareFiles = useMemo(() => {
    try {
      const isMobile = typeof window !== 'undefined'
        && window.matchMedia?.('(pointer: coarse)').matches;
      if (!isMobile) return false;
      const probe = new File([new Uint8Array()], 'probe.png', { type: 'image/png' });
      return typeof navigator !== 'undefined'
        && typeof navigator.share === 'function'
        && typeof navigator.canShare === 'function'
        && navigator.canShare({ files: [probe] });
    } catch {
      return false;
    }
  }, []);

  const download = async () => {
    setDownloading(true);
    try {
      const card = cardRef.current;
      if (!card) throw new Error('preview not mounted');

      if (document.fonts?.ready) await document.fonts.ready;

      const rect = card.getBoundingClientRect();
      const pixelRatio = f.w / rect.width;

      const blob = await toBlob(card, {
        pixelRatio,
        cacheBust: true,
      });
      if (!blob) throw new Error('rasterization failed');

      const fileName = `ember-${(quote.source || 'quote').toLowerCase().replace(/\W+/g, '-')}-${format}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      if (canShareFiles && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
        } catch (err) {
          if (err?.name !== 'AbortError') throw err;
        }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(window.location.origin + `/collection`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal share-modal" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="share-close" aria-label={tr('common.close')}>
          <Icon name="x" size={18} />
        </button>

        <div className="share-grid">
          {/* Preview */}
          <div className="share-preview-col">
            <p className="smallcaps" style={{ color: 'var(--ember-deep)', margin: 0 }}><svg width="10" height="12" viewBox="0 0 40 46" fill="currentColor" aria-hidden="true" style={{display:'inline-block',verticalAlign:'middle',marginRight:'0.3em'}}><path d="M20 4 C 22 12, 30 14, 30 24 C 30 33, 25 40, 20 40 C 15 40, 10 34, 10 26 C 10 22, 13 20, 14 18 C 15 22, 17 22, 17 18 C 17 14, 19 10, 20 4 Z"/></svg>{tr('share.header')}</p>
            <h2 className="display" style={{ fontSize: 22, margin: '6px 0 16px', fontWeight: 500 }}>{tr('share.title')}</h2>
            <div className="share-preview-wrap">
              <SharePreview quote={quote} format={f} theme={t} template={template} showAttribution={showAttribution} cardRef={cardRef} />
            </div>
          </div>

          {/* Controls */}
          <div className="share-controls-col">
            <div>
              <div className="smallcaps" style={{ marginBottom: 8 }}>{tr('share.format')}</div>
              <div className="seg">
                {Object.entries(FORMATS).map(([k, v]) => (
                  <button key={k} onClick={() => setFormat(k)} className={`seg-btn${format === k ? ' active' : ''}`}>
                    <FormatGlyph kind={k} /> {tr(v.labelKey)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="smallcaps" style={{ marginBottom: 8 }}>{tr('share.template')}</div>
              <div className="seg seg-col">
                {TEMPLATES.map(k => (
                  <button key={k} onClick={() => setTemplate(k)} className={`seg-btn${template === k ? ' active' : ''}`} style={{ textTransform: 'capitalize' }}>
                    {k}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="smallcaps" style={{ marginBottom: 8 }}>{tr('share.palette')}</div>
              <div className="swatch-row">
                {Object.entries(THEMES).map(([k, v]) => (
                  <button key={k} onClick={() => setThemeKey(k)} title={k}
                    className={`swatch${themeKey === k ? ' active' : ''}`}
                    style={{ background: v.bg }} />
                ))}
              </div>
            </div>

            <label className="check-row">
              <input type="checkbox" checked={showAttribution} onChange={e => setShowAttribution(e.target.checked)} />
              <span>{tr('share.showAttribution')}</span>
            </label>

            <div className="share-actions">
              <button className="btn btn-primary" onClick={download} disabled={downloading}>
                {downloading ? tr('share.rendering') : <><Icon name={canShareFiles ? 'share' : 'download'} size={14} /> {tr(canShareFiles ? 'share.share' : 'share.download')}</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
