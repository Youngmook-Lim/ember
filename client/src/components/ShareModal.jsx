import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toBlob } from 'html-to-image';
import { Icon } from './Icon';

const FORMATS = {
  story:     { labelKey: 'share.formatStory',     ratio: '9 / 16', w: 1080, h: 1920 },
  square:    { labelKey: 'share.formatSquare',    ratio: '1 / 1',  w: 1080, h: 1080 },
  landscape: { labelKey: 'share.formatLandscape', ratio: '16 / 9', w: 1600, h: 900 },
};

const THEMES = {
  // — Originals —
  cream: { bg: '#F6EAD3', ink: '#2A1F1B', accent: '#D96A3C', grain: true },
  night: { bg: '#1C130F', ink: '#F6EAD3', accent: '#F4A466' },
  ember: { bg: 'linear-gradient(135deg, #D96A3C 0%, #8A2E2A 100%)', ink: '#FFFBEE', accent: '#FFFBEE' },
  ink:   { bg: '#0E0E0E', ink: '#F6EAD3', accent: '#F4A466' },
  paper: { bg: '#EEE6D4', ink: '#1B1B1B', accent: '#9B3A1E', grain: true },
  olive: { bg: '#3D4634', ink: '#F6EAD3', accent: '#E8C888' },

  // — New solids —
  bone:    { bg: '#FBF4E3', ink: '#2A1F1B', accent: '#8A2E2A', grain: true },
  clay:    { bg: '#B26149', ink: '#FFFBEE', accent: '#F6EAD3' },
  plum:    { bg: '#3F2440', ink: '#F4DCC9', accent: '#E8C888' },
  sky:     { bg: '#4E7896', ink: '#F2E8D5', accent: '#F4A466' },
  moss:    { bg: '#1F3A2A', ink: '#E8DCC2', accent: '#E8C888' },
  oxblood: { bg: '#5A1F1C', ink: '#F6EAD3', accent: '#F4A466' },

  // — Gradients —
  dawn:   { bg: 'linear-gradient(165deg, #F7CFA8 0%, #EAC1C1 55%, #DFD2EC 100%)', ink: '#3D2A1F', accent: '#8A2E2A' },
  dusk:   { bg: 'linear-gradient(180deg, #6C3E5F 0%, #3E4970 65%, #1F2742 100%)', ink: '#F6EAD3', accent: '#F4A466' },
  aurora: { bg: 'radial-gradient(120% 90% at 20% 100%, #C99335 0%, #8A2E2A 45%, #3F2440 100%)', ink: '#FFFBEE', accent: '#F4A466' },

  // — Designs (patterned) —
  ledger:     { bg: '#F6EAD3', ink: '#2A1F1B', accent: '#8A2E2A', pattern: 'lines',   grain: true },
  dotgrid:    { bg: '#EFE2C6', ink: '#2A1F1B', accent: '#7A8450', pattern: 'dots' },
  crosshatch: { bg: '#1C130F', ink: '#F6EAD3', accent: '#F4A466', pattern: 'hatch' },
  arch:       { bg: '#1F2742', ink: '#F6EAD3', accent: '#E8C888', pattern: 'arch' },
  meridian:   { bg: '#3D4634', ink: '#F6EAD3', accent: '#E8C888', pattern: 'meridian' },
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

function PatternOverlay({ kind, color }) {
  if (kind === 'lines') {
    return (
      <div
        className="pattern-overlay"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent 0 calc(7.5% - 1px), ${color} calc(7.5% - 1px), ${color} 7.5%)`,
          opacity: 0.18,
        }}
      />
    );
  }
  if (kind === 'dots') {
    return (
      <div
        className="pattern-overlay"
        style={{
          backgroundImage: `radial-gradient(${color} 1.2px, transparent 1.6px)`,
          backgroundSize: '4.5% 4.5%',
          opacity: 0.35,
        }}
      />
    );
  }
  if (kind === 'hatch') {
    return (
      <div
        className="pattern-overlay"
        style={{
          backgroundImage:
            `repeating-linear-gradient(45deg,  transparent 0 7px, ${color} 7px 7.6px),` +
            `repeating-linear-gradient(-45deg, transparent 0 7px, ${color} 7px 7.6px)`,
          opacity: 0.10,
        }}
      />
    );
  }
  if (kind === 'arch') {
    return (
      <svg
        className="pattern-overlay pattern-overlay--svg"
        viewBox="0 0 200 160"
        preserveAspectRatio="xMidYMax meet"
        aria-hidden="true"
      >
        <g fill="none" stroke={color} strokeWidth="0.6">
          <path d="M 28 160 L 28 78 Q 100 8 172 78 L 172 160" opacity="0.28" />
          <path d="M 44 160 L 44 86 Q 100 26 156 86 L 156 160" opacity="0.20" />
          <path d="M 60 160 L 60 94 Q 100 42 140 94 L 140 160" opacity="0.14" />
          <path d="M 76 160 L 76 102 Q 100 58 124 102 L 124 160" opacity="0.10" />
        </g>
      </svg>
    );
  }
  if (kind === 'meridian') {
    return (
      <svg
        className="pattern-overlay pattern-overlay--svg"
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g fill="none" stroke={color} strokeWidth="0.5" opacity="0.35">
          <circle cx="100" cy="100" r="20" />
          <circle cx="100" cy="100" r="38" />
          <circle cx="100" cy="100" r="56" />
          <circle cx="100" cy="100" r="74" />
          <circle cx="100" cy="100" r="92" />
          <line x1="100" y1="0" x2="100" y2="200" />
          <line x1="0" y1="100" x2="200" y2="100" />
        </g>
      </svg>
    );
  }
  return null;
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
    maxWidth: `min(100%, calc(52vh * ${format.w} / ${format.h}))`,
    margin: '0 auto',
  };
  const pad = isLandscape ? '8%' : '9%';

  const quoteRef = useRef(null);
  const areaRef = useRef(null);
  const [clampLines, setClampLines] = useState(100);

  useEffect(() => {
    const isFlexP = template === 'classic';
    const measureEl = isFlexP ? quoteRef.current : areaRef.current;
    const lineEl = quoteRef.current;
    if (!measureEl || !lineEl) return;
    setClampLines(100);
    const measure = () => {
      const pEl = lineEl.firstElementChild;
      const lh = parseFloat(window.getComputedStyle(pEl || lineEl).lineHeight);
      if (!lh) return;
      const availH = isFlexP ? measureEl.clientHeight : Math.max(0, measureEl.clientHeight - lh * 2);
      setClampLines(Math.max(1, Math.floor(availH / lh)));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(measureEl);
    return () => ro.disconnect();
  }, [template, format]);

  const wmarkStyle = {
    fontFamily: 'var(--font-body)', fontSize: 'clamp(9px, 1.3cqw, 12px)',
    letterSpacing: '0.16em', textTransform: 'uppercase',
    opacity: 0.5, color: t.ink, fontWeight: 600, whiteSpace: 'nowrap',
  };
  const wmarkInner = <><svg width="9" height="10" viewBox="0 0 40 46" fill="currentColor" aria-hidden="true" style={{display:'inline-block',verticalAlign:'middle',marginRight:'0.35em'}}><path d="M20 4 C 22 12, 30 14, 30 24 C 30 33, 25 40, 20 40 C 15 40, 10 34, 10 26 C 10 22, 13 20, 14 18 C 15 22, 17 22, 17 18 C 17 14, 19 10, 20 4 Z"/></svg>Ember</>;
  const watermarkInline = <div style={{ ...wmarkStyle, flexShrink: 0 }}>{wmarkInner}</div>;

  if (template === 'classic') return (
    <div ref={cardRef} className="share-card" style={base}>
      {t.grain && <GrainOverlay />}
      {t.pattern && <PatternOverlay kind={t.pattern} color={t.accent} />}
      <div style={{ padding: pad, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 'clamp(40px, 22cqw, 220px)', lineHeight: 0.7, color: t.accent, opacity: 0.55, fontStyle: 'italic', marginTop: '-0.08em' }}>"</div>
        <div ref={quoteRef} style={{ flex: 1, minHeight: 0, overflow: 'hidden', margin: '0.2em 0 0' }}>
          <p style={{ fontFamily: isKo ? 'var(--font-body)' : undefined, fontStyle: isKo ? 'normal' : 'italic', fontWeight: isKo ? 500 : 400, fontSize: `clamp(16px, ${isLandscape ? '4.8cqw' : '6.2cqw'}, 44px)`, lineHeight: isKo ? 1.6 : 1.4, margin: 0, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: clampLines, overflow: 'hidden' }}>
            {quote.text}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5em', marginTop: '1em' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {showAttribution && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8em' }}>
                <div style={{ width: '2em', height: 1, background: t.ink, opacity: 0.4, flexShrink: 0 }} />
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(10px, 2cqw, 16px)', fontWeight: 600, wordBreak: 'break-word', minWidth: 0 }}>
                  <div>{quote.source}</div>
                  {quote.work && <div style={{ opacity: 0.6 }}>{quote.work}</div>}
                </div>
              </div>
            )}
          </div>
          {watermarkInline}
        </div>
      </div>
    </div>
  );

  if (template === 'bold') return (
    <div ref={cardRef} className="share-card" style={base}>
      {t.grain && <GrainOverlay />}
      {t.pattern && <PatternOverlay kind={t.pattern} color={t.accent} />}
      <div style={{ padding: pad, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div ref={areaRef} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
          <div ref={quoteRef} style={{ overflow: 'hidden' }}>
            <p style={{ fontWeight: 600, fontSize: `clamp(20px, ${isLandscape ? '6.5cqw' : '9cqw'}, 84px)`, lineHeight: 1.2, margin: 0, letterSpacing: '-0.01em', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: clampLines, overflow: 'hidden' }}>
              {quote.text}
            </p>
          </div>
          {showAttribution && (
            <div style={{ marginTop: '1.4em', fontFamily: 'var(--font-body)', fontSize: 'clamp(10px, 1.8cqw, 16px)', fontWeight: 700, letterSpacing: '0.12em', color: t.accent, textTransform: 'uppercase', wordBreak: 'break-word' }}>
              — {quote.source}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {watermarkInline}
        </div>
      </div>
    </div>
  );

  if (template === 'minimal') return (
    <div ref={cardRef} className="share-card" style={base}>
      {t.grain && <GrainOverlay />}
      {t.pattern && <PatternOverlay kind={t.pattern} color={t.accent} />}
      <div style={{ padding: pad, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div ref={areaRef} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', overflow: 'hidden' }}>
          <div ref={quoteRef} style={{ overflow: 'hidden' }}>
            <p style={{ fontWeight: 400, fontSize: `clamp(14px, ${isLandscape ? '4cqw' : '5cqw'}, 38px)`, lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: clampLines, overflow: 'hidden' }}>
              {quote.text}
            </p>
          </div>
          {showAttribution && (
            <div style={{ marginTop: '1.8em', fontFamily: 'var(--font-body)', fontSize: 'clamp(9px, 1.8cqw, 14px)', opacity: 0.6 }}>
              {quote.source}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {watermarkInline}
        </div>
      </div>
    </div>
  );

  // marginalia
  return (
    <div ref={cardRef} className="share-card" style={base}>
      {t.grain && <GrainOverlay />}
      {t.pattern && <PatternOverlay kind={t.pattern} color={t.accent} />}
      <div style={{ padding: pad, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontStyle: 'italic', fontSize: 'clamp(10px, 1.8cqw, 14px)', color: t.accent, opacity: 0.7, position: 'absolute', top: pad, right: pad }}>
          No. {quote.id || '—'}
        </div>
        <div ref={areaRef} style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          <div ref={quoteRef} style={{ overflow: 'hidden', marginRight: '20%' }}>
            <p style={{ fontFamily: isKo ? 'var(--font-body)' : undefined, fontStyle: isKo ? 'normal' : 'italic', fontWeight: isKo ? 500 : 400, fontSize: `clamp(14px, ${isLandscape ? '4.2cqw' : '5.5cqw'}, 40px)`, lineHeight: isKo ? 1.6 : 1.4, margin: 0, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: clampLines, overflow: 'hidden' }}>
              {quote.text}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5em' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {showAttribution && (
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(9px, 1.7cqw, 14px)', opacity: 0.7, display: 'flex', gap: '0.8em', flexWrap: 'wrap' }}>
                <span style={{ wordBreak: 'break-word' }}>{quote.source}</span>
                {quote.work && <span style={{ fontFamily: isKo ? 'var(--font-body)' : 'var(--font-display)', fontStyle: isKo ? 'normal' : 'italic', wordBreak: 'break-word' }}>{quote.work}</span>}
              </div>
            )}
          </div>
          {watermarkInline}
        </div>
      </div>
    </div>
  );
}

export function ShareModal({ quote, onClose }) {
  const [format, setFormat] = useState('story');
  const [themeKey, setThemeKey] = useState('cream');
  const [template, setTemplate] = useState('classic');
  const [showAttribution, setShowAttribution] = useState(true);
  const [copied, setCopied] = useState(false);
  const [cachedFile, setCachedFile] = useState(null);
  const [cachedKey, setCachedKey] = useState(null);
  const [rendering, setRendering] = useState(false);
  const cardRef = useRef(null);
  const { t: tr } = useTranslation();

  const f = FORMATS[format];
  const t = THEMES[themeKey];

  const fileName = `ember-${(quote.source || 'quote').toLowerCase().replace(/\W+/g, '-')}-${format}.png`;
  const cacheKey = `${quote.id}|${format}|${themeKey}|${template}|${showAttribution ? 1 : 0}`;
  const isFresh = cachedFile && cachedKey === cacheKey;

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

  const renderFile = async () => {
    setRendering(true);
    const card = cardRef.current;
    if (!card) { setRendering(false); return null; }

    // SVG foreignObject (used by html-to-image) can render fonts with slightly
    // different metrics than the browser layout engine. Bumping clamp by 1 gives
    // the renderer one extra line of breathing room before overflow:hidden on the
    // parent container clips the text — preventing the last word from being cut off.
    const quoteP = card.querySelector('p');
    const savedClamp = quoteP?.style.webkitLineClamp ?? '';
    if (quoteP && savedClamp) {
      const n = parseInt(savedClamp, 10);
      if (!isNaN(n)) quoteP.style.webkitLineClamp = String(n + 1);
    }

    try {
      if (document.fonts?.ready) await document.fonts.ready;
      const rect = card.getBoundingClientRect();
      const pixelRatio = f.w / rect.width;
      const blob = await toBlob(card, { pixelRatio, cacheBust: true });
      if (!blob) return null;
      const file = new File([blob], fileName, { type: 'image/png' });
      setCachedFile(file);
      setCachedKey(cacheKey);
      return file;
    } catch (err) {
      console.error('share render failed', err);
      return null;
    } finally {
      if (quoteP) quoteP.style.webkitLineClamp = savedClamp;
      setRendering(false);
    }
  };

  const shareWithFile = (file) => {
    if (canShareFiles && navigator.canShare?.({ files: [file] })) {
      navigator.share({ files: [file] }).catch(err => {
        if (err?.name === 'AbortError') return;
        console.error('navigator.share failed, falling back to download', err);
        downloadFile(file);
      });
    } else {
      downloadFile(file);
    }
  };

  const onShareClick = async () => {
    if (rendering) return;
    if (isFresh) {
      shareWithFile(cachedFile);
      return;
    }
    await renderFile();
  };

  const onDownloadClick = async () => {
    if (rendering) return;
    const file = isFresh ? cachedFile : await renderFile();
    if (file) downloadFile(file);
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(window.location.origin + `/collection`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
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
                    className={`swatch${themeKey === k ? ' active' : ''}${v.pattern ? ` swatch--${v.pattern}` : ''}`}
                    style={{ background: v.bg, '--swatch-accent': v.accent }} />
                ))}
              </div>
            </div>

            <label className="check-row">
              <input type="checkbox" checked={showAttribution} onChange={e => setShowAttribution(e.target.checked)} />
              <span>{tr('share.showAttribution')}</span>
            </label>

            <div className="share-actions">
              {canShareFiles && (
                <button className="btn btn-primary" onClick={onShareClick} disabled={rendering}>
                  {rendering
                    ? tr('share.rendering')
                    : isFresh
                      ? <><Icon name="share" size={14} /> {tr('share.tapToShare')}</>
                      : <><Icon name="share" size={14} /> {tr('share.share')}</>}
                </button>
              )}
              <button
                className={`btn ${canShareFiles ? 'btn-ghost' : 'btn-primary'}`}
                onClick={onDownloadClick}
                disabled={rendering}
              >
                {rendering ? tr('share.rendering') : <><Icon name="download" size={14} /> {tr('share.download')}</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
