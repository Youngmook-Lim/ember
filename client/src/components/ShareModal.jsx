import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';
import { FORMATS, THEMES, TEMPLATES, drawShareCard } from './shareCanvas';

function FormatGlyph({ kind }) {
  const p = { width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 1.6 };
  if (kind === 'story')     return <svg {...p} viewBox="0 0 16 16"><rect x="4.5" y="1.5" width="7" height="13" rx="1"/></svg>;
  if (kind === 'square')    return <svg {...p} viewBox="0 0 16 16"><rect x="2.5" y="2.5" width="11" height="11" rx="1"/></svg>;
  return <svg {...p} viewBox="0 0 16 16"><rect x="1.5" y="4" width="13" height="8" rx="1"/></svg>;
}

function bgToCss(bg) {
  if (bg.type === 'solid') return bg.color;
  if (bg.type === 'linear') {
    const stops = bg.stops.map(([c, s]) => `${c} ${s * 100}%`).join(', ');
    return `linear-gradient(${bg.angle}deg, ${stops})`;
  }
  if (bg.type === 'radial') {
    const stops = bg.stops.map(([c, s]) => `${c} ${s * 100}%`).join(', ');
    return `radial-gradient(${bg.rx * 100}% ${bg.ry * 100}% at ${bg.cx * 100}% ${bg.cy * 100}%, ${stops})`;
  }
  return 'transparent';
}

export function ShareModal({ quote, onClose }) {
  const [format, setFormat] = useState('story');
  const [themeKey, setThemeKey] = useState('cream');
  const [template, setTemplate] = useState('classic');
  const [showAttribution, setShowAttribution] = useState(true);
  const canvasRef = useRef(null);
  const drawPromiseRef = useRef(Promise.resolve());
  const { t: tr, i18n } = useTranslation();
  const isKorean = i18n.language === 'ko';

  const f = FORMATS[format];
  const fileName = `ember-${(quote.source || 'quote').toLowerCase().replace(/\W+/g, '-')}-${format}.png`;

  // Defensively strip any outer quote marks from stored text so the card's
  // decorative drop-quote glyph does not visually duplicate them.
  const sanitizedQuote = useMemo(() => ({
    ...quote,
    text: (quote.text ?? '').trim().replace(/^["“”]+|["“”]+$/g, '').trim(),
  }), [quote]);

  // Re-render the canvas whenever any visual parameter changes. Share/download
  // handlers await drawPromiseRef so they never read a mid-render canvas.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawPromiseRef.current = drawShareCard(canvas, {
      format, themeKey, template, quote: sanitizedQuote, showAttribution, isKorean,
    });
  }, [format, themeKey, template, sanitizedQuote, showAttribution, isKorean]);

  const canShareFiles = useMemo(() => {
    try {
      const probe = new File([new Uint8Array()], 'probe.png', { type: 'image/png' });
      return typeof navigator !== 'undefined'
        && typeof navigator.share === 'function'
        && typeof navigator.canShare === 'function'
        && navigator.canShare({ files: [probe] });
    } catch {
      return false;
    }
  }, []);

  const downloadFile = (file) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const canvasToFile = async () => {
    await drawPromiseRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob ? new File([blob], fileName, { type: 'image/png' }) : null);
      }, 'image/png');
    });
  };

  const onShareClick = async () => {
    const file = await canvasToFile();
    if (!file) return;
    if (canShareFiles && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
      } catch (err) {
        if (err?.name === 'AbortError') return;
        downloadFile(file);
      }
    } else {
      downloadFile(file);
    }
  };

  const onDownloadClick = async () => {
    const file = await canvasToFile();
    if (file) downloadFile(file);
  };

  return (
    <div className="modal-backdrop modal-backdrop--scrollable" onClick={onClose}>
      <div className="modal share-modal" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="share-close" aria-label={tr('common.close')}>
          <Icon name="x" size={18} />
        </button>

        <div className="share-grid">
          {/* Preview */}
          <div className="share-preview-col">
            <p className="smallcaps" style={{ color: 'var(--ember-deep)', margin: 0 }}>
              <svg width="10" height="12" viewBox="0 0 40 46" fill="currentColor" aria-hidden="true" style={{ display:'inline-block', verticalAlign:'middle', marginRight:'0.3em' }}>
                <path d="M20 4 C 22 12, 30 14, 30 24 C 30 33, 25 40, 20 40 C 15 40, 10 34, 10 26 C 10 22, 13 20, 14 18 C 15 22, 17 22, 17 18 C 17 14, 19 10, 20 4 Z"/>
              </svg>
              {tr('share.header')}
            </p>
            <h2 className="display" style={{ fontSize: 22, margin: '6px 0 16px', fontWeight: 500 }}>{tr('share.title')}</h2>
            <div className="share-preview-wrap">
              <canvas
                ref={canvasRef}
                className="share-card"
                style={{
                  display: 'block',
                  width: '100%',
                  maxWidth: `min(100%, 360px, calc(52vh * ${f.w} / ${f.h}))`,
                  height: 'auto',
                  aspectRatio: f.ratio,
                  borderRadius: 10,
                  margin: '0 auto',
                }}
              />
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
                    className={`swatch${themeKey === k ? ' active' : ''}${v.pattern ? ` swatch--${v.pattern}` : ''}`}
                    style={{ background: bgToCss(v.bg), '--swatch-accent': v.accent }} />
                ))}
              </div>
            </div>

            <label className="check-row">
              <input type="checkbox" checked={showAttribution} onChange={e => setShowAttribution(e.target.checked)} />
              <span>{tr('share.showAttribution')}</span>
            </label>

            <div className="share-actions">
              {canShareFiles && (
                <button className="btn btn-primary" onClick={onShareClick}>
                  <Icon name="share" size={14} /> {tr('share.share')}
                </button>
              )}
              <button
                className={`btn ${canShareFiles ? 'btn-ghost' : 'btn-primary'}`}
                onClick={onDownloadClick}
              >
                <Icon name="download" size={14} /> {tr('share.download')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
