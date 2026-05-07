import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

function FormatGlyph({ kind }) {
  const p = { width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 1.6 };
  if (kind === 'story')     return <svg {...p} viewBox="0 0 16 16"><rect x="4.5" y="1.5" width="7" height="13" rx="1"/></svg>;
  if (kind === 'square')    return <svg {...p} viewBox="0 0 16 16"><rect x="2.5" y="2.5" width="11" height="11" rx="1"/></svg>;
  return <svg {...p} viewBox="0 0 16 16"><rect x="1.5" y="4" width="13" height="8" rx="1"/></svg>;
}

function GrainOverlay() {
  return (
    <div className="grain-overlay" />
  );
}

function SharePreview({ quote, format, theme: t, template, showAttribution }) {
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
    }}>✦ Ember</div>
  );

  if (template === 'classic') return (
    <div className="share-card" style={base}>
      {t.grain && <GrainOverlay />}
      <div style={{ padding: pad, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 'clamp(40px, 22cqw, 220px)', lineHeight: 0.7, color: t.accent, opacity: 0.55, fontStyle: 'italic', marginTop: '-0.08em' }}>"</div>
        <p style={{ fontStyle: 'italic', fontWeight: 400, fontSize: `clamp(16px, ${isLandscape ? '4.8cqw' : '6.2cqw'}, 44px)`, lineHeight: 1.4, margin: '0.2em 0 0', flex: 1 }}>
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
    <div className="share-card" style={base}>
      {t.grain && <GrainOverlay />}
      <div style={{ padding: pad, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p style={{ fontWeight: 600, fontSize: `clamp(20px, ${isLandscape ? '6.5cqw' : '9cqw'}, 84px)`, lineHeight: 1.05, margin: 0, letterSpacing: '-0.01em' }}>
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
    <div className="share-card" style={base}>
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
    <div className="share-card" style={base}>
      {t.grain && <GrainOverlay />}
      <div style={{ padding: pad, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontStyle: 'italic', fontSize: 'clamp(10px, 1.8cqw, 14px)', color: t.accent, opacity: 0.7, position: 'absolute', top: pad, right: pad }}>
          No. {quote.id || '—'}
        </div>
        <p style={{ fontStyle: 'italic', fontWeight: 400, fontSize: `clamp(14px, ${isLandscape ? '4.2cqw' : '5.5cqw'}, 40px)`, lineHeight: 1.4, margin: 'auto 20% auto 0' }}>
          {quote.text}
        </p>
        {showAttribution && (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(9px, 1.7cqw, 14px)', opacity: 0.7, display: 'flex', gap: '0.8em' }}>
            <span>{quote.source}</span>
            {quote.work && <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{quote.work}</span>}
          </div>
        )}
      </div>
      {watermark}
    </div>
  );
}

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  wrapLines(ctx, text, maxWidth).forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
}

export function ShareModal({ quote, onClose }) {
  const [format, setFormat] = useState('story');
  const [themeKey, setThemeKey] = useState('cream');
  const [template, setTemplate] = useState('classic');
  const [showAttribution, setShowAttribution] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { t: tr } = useTranslation();

  const f = FORMATS[format];
  const t = THEMES[themeKey];

  const download = async () => {
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = f.w; canvas.height = f.h;
      const ctx = canvas.getContext('2d');

      if (t.bg.startsWith('linear-gradient')) {
        const g = ctx.createLinearGradient(0, 0, f.w, f.h);
        g.addColorStop(0, '#D96A3C'); g.addColorStop(1, '#8A2E2A');
        ctx.fillStyle = g;
      } else { ctx.fillStyle = t.bg; }
      ctx.fillRect(0, 0, f.w, f.h);

      if (t.grain) {
        ctx.save(); ctx.globalAlpha = 0.06;
        for (let i = 0; i < 3000; i++) {
          ctx.fillStyle = i % 2 ? '#2A1F1B' : '#8A6A3E';
          ctx.fillRect(Math.random() * f.w, Math.random() * f.h, 1, 1);
        }
        ctx.restore();
      }

      const pad = f.w * 0.09;
      const textWidth = f.w - pad * 2;
      ctx.fillStyle = t.ink; ctx.textBaseline = 'top';

      if (template === 'classic') {
        ctx.font = `italic 500 ${f.w * 0.22}px "Fraunces", Georgia, serif`;
        ctx.fillStyle = t.accent; ctx.globalAlpha = 0.5;
        ctx.fillText('“', pad - f.w * 0.02, pad - f.w * 0.05);
        ctx.globalAlpha = 1; ctx.fillStyle = t.ink;
        const qs = f.w * (format === 'landscape' ? 0.048 : 0.062);
        ctx.font = `italic 400 ${qs}px "Fraunces", Georgia, serif`;
        drawWrappedText(ctx, quote.text, pad, pad + f.w * 0.16, textWidth, qs * 1.4);
        if (showAttribution) {
          ctx.font = `600 ${f.w * 0.02}px "Inter", sans-serif`;
          const bot = f.h - pad;
          ctx.fillRect(pad, bot - 40, f.w * 0.06, 2);
          ctx.fillText(quote.source + (quote.work ? '  ·  ' + quote.work : ''), pad + f.w * 0.08, bot - 48);
        }
      } else if (template === 'bold') {
        const s = f.w * (format === 'landscape' ? 0.065 : 0.09);
        ctx.font = `600 ${s}px "Fraunces", Georgia, serif`;
        drawWrappedText(ctx, quote.text, pad, pad + f.h * 0.1, textWidth, s * 1.08);
        if (showAttribution) {
          ctx.font = `700 ${f.w * 0.018}px "Inter", sans-serif`;
          ctx.fillStyle = t.accent;
          ctx.fillText('— ' + quote.source.toUpperCase(), pad, f.h - pad - 20);
        }
      } else if (template === 'minimal') {
        const s = f.w * (format === 'landscape' ? 0.04 : 0.05);
        ctx.font = `400 ${s}px "Fraunces", Georgia, serif`;
        const lines = wrapLines(ctx, quote.text, textWidth);
        let y = (f.h - lines.length * s * 1.45) / 2;
        ctx.textAlign = 'center'; ctx.fillStyle = t.ink;
        lines.forEach(l => { ctx.fillText(l, f.w / 2, y); y += s * 1.45; });
        if (showAttribution) {
          ctx.font = `400 ${f.w * 0.018}px "Inter", sans-serif`;
          ctx.globalAlpha = 0.6;
          ctx.fillText(quote.source, f.w / 2, y + s * 0.5);
          ctx.globalAlpha = 1;
        }
        ctx.textAlign = 'left';
      } else {
        const s = f.w * (format === 'landscape' ? 0.042 : 0.055);
        ctx.font = `italic 400 ${s}px "Fraunces", Georgia, serif`;
        drawWrappedText(ctx, quote.text, pad, pad + f.h * 0.12, textWidth * 0.78, s * 1.4);
        if (showAttribution) {
          ctx.font = `400 ${f.w * 0.017}px "Inter", sans-serif`;
          ctx.globalAlpha = 0.7;
          ctx.fillText(quote.source, pad, f.h - pad - 20);
          ctx.globalAlpha = 1;
        }
      }

      ctx.font = `600 ${f.w * 0.014}px "Inter", sans-serif`;
      ctx.fillStyle = t.ink; ctx.globalAlpha = 0.5;
      ctx.textAlign = 'right';
      ctx.fillText('✦  EMBER', f.w - pad, f.h - pad + 6);
      ctx.globalAlpha = 1; ctx.textAlign = 'left';

      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ember-${(quote.source || 'quote').toLowerCase().replace(/\W+/g, '-')}-${format}.png`;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setDownloading(false);
      }, 'image/png');
    } catch (err) {
      console.error(err);
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
            <p className="smallcaps" style={{ color: 'var(--ember-deep)', margin: 0 }}>{tr('share.header')}</p>
            <h2 className="display" style={{ fontSize: 22, margin: '6px 0 16px', fontWeight: 500 }}>{tr('share.title')}</h2>
            <div className="share-preview-wrap">
              <SharePreview quote={quote} format={f} theme={t} template={template} showAttribution={showAttribution} />
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
              <button className="btn btn-ghost" onClick={copyLink}>
                {copied ? tr('share.copied') : tr('share.copyLink')}
              </button>
              <button className="btn btn-primary" onClick={download} disabled={downloading}>
                {downloading ? tr('share.rendering') : <><Icon name="share" size={14} /> {tr('share.download')}</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
