// Single-source-of-truth share-card renderer.
// The same drawShareCard call produces both the in-app preview (CSS-scaled
// canvas) and the exported PNG (canvas.toBlob), so they are pixel-identical.

export const FORMATS = {
  story:     { labelKey: 'share.formatStory',     ratio: '9 / 16', w: 1080, h: 1920 },
  square:    { labelKey: 'share.formatSquare',    ratio: '1 / 1',  w: 1080, h: 1080 },
  landscape: { labelKey: 'share.formatLandscape', ratio: '16 / 9', w: 1600, h: 900 },
};

// Background descriptors are structured data (not CSS strings) so we can paint
// them into a canvas without parsing CSS.
const sol = (color) => ({ type: 'solid', color });
const lin = (angle, stops) => ({ type: 'linear', angle, stops });
const rad = (cx, cy, rx, ry, stops) => ({ type: 'radial', cx, cy, rx, ry, stops });

export const THEMES = {
  cream:   { bg: sol('#F6EAD3'), ink: '#2A1F1B', accent: '#D96A3C', grain: true },
  night:   { bg: sol('#1C130F'), ink: '#F6EAD3', accent: '#F4A466' },
  ember:   { bg: lin(135, [['#D96A3C', 0], ['#8A2E2A', 1]]), ink: '#FFFBEE', accent: '#FFFBEE' },
  ink:     { bg: sol('#0E0E0E'), ink: '#F6EAD3', accent: '#F4A466' },
  paper:   { bg: sol('#EEE6D4'), ink: '#1B1B1B', accent: '#9B3A1E', grain: true },
  olive:   { bg: sol('#3D4634'), ink: '#F6EAD3', accent: '#E8C888' },

  bone:    { bg: sol('#FBF4E3'), ink: '#2A1F1B', accent: '#8A2E2A', grain: true },
  clay:    { bg: sol('#B26149'), ink: '#FFFBEE', accent: '#F6EAD3' },
  plum:    { bg: sol('#3F2440'), ink: '#F4DCC9', accent: '#E8C888' },
  sky:     { bg: sol('#4E7896'), ink: '#F2E8D5', accent: '#F4A466' },
  moss:    { bg: sol('#1F3A2A'), ink: '#E8DCC2', accent: '#E8C888' },
  oxblood: { bg: sol('#5A1F1C'), ink: '#F6EAD3', accent: '#F4A466' },

  dawn:    { bg: lin(165, [['#F7CFA8', 0], ['#EAC1C1', 0.55], ['#DFD2EC', 1]]), ink: '#3D2A1F', accent: '#8A2E2A' },
  dusk:    { bg: lin(180, [['#6C3E5F', 0], ['#3E4970', 0.65], ['#1F2742', 1]]), ink: '#F6EAD3', accent: '#F4A466' },
  aurora:  { bg: rad(0.2, 1.0, 1.2, 0.9, [['#C99335', 0], ['#8A2E2A', 0.45], ['#3F2440', 1]]), ink: '#FFFBEE', accent: '#F4A466' },

  ledger:     { bg: sol('#F6EAD3'), ink: '#2A1F1B', accent: '#8A2E2A', pattern: 'lines',    grain: true },
  dotgrid:    { bg: sol('#EFE2C6'), ink: '#2A1F1B', accent: '#7A8450', pattern: 'dots' },
  crosshatch: { bg: sol('#1C130F'), ink: '#F6EAD3', accent: '#F4A466', pattern: 'hatch' },
  arch:       { bg: sol('#1F2742'), ink: '#F6EAD3', accent: '#E8C888', pattern: 'arch' },
  meridian:   { bg: sol('#3D4634'), ink: '#F6EAD3', accent: '#E8C888', pattern: 'meridian' },
};

export const TEMPLATES = ['classic', 'bold', 'minimal', 'marginalia'];

// CSS-shorthand font strings used by canvas. Canvas does not honor
// font-variation-settings (so Fraunces's WONK axis is dropped) but the family
// + weight + style are matched against what the rest of the app uses.
const DISPLAY = `'Fraunces', 'Noto Sans KR', Georgia, serif`;
const BODY    = `'Inter', 'Noto Sans KR', -apple-system, system-ui, sans-serif`;

// Preload every font combination we draw with. Without this, the first
// render after page load can fall back to a default face.
export async function ensureFontsReady(isKorean) {
  if (!document.fonts) return;
  const families = isKorean
    ? ['Inter', 'Noto Sans KR']
    : ['Fraunces', 'Inter', 'Noto Sans KR'];
  const probes = [];
  for (const family of families) {
    for (const weight of [400, 500, 600, 700]) {
      probes.push(document.fonts.load(`${weight} 64px "${family}"`));
      probes.push(document.fonts.load(`italic ${weight} 64px "${family}"`));
    }
  }
  await Promise.all(probes).catch(() => {});
  await document.fonts.ready;
}

// ---------------------------------------------------------------------------
// Background, grain, pattern overlays
// ---------------------------------------------------------------------------

function paintBackground(ctx, bg, w, h) {
  if (bg.type === 'solid') {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, w, h);
    return;
  }
  if (bg.type === 'linear') {
    // CSS gradient angle convention: 0deg = up, increases clockwise.
    const rad = ((bg.angle - 90) * Math.PI) / 180;
    const cx = w / 2, cy = h / 2;
    // Half-length of the projected gradient line for a centered rectangle.
    const r = Math.abs((w / 2) * Math.cos(rad)) + Math.abs((h / 2) * Math.sin(rad));
    const dx = Math.cos(rad) * r, dy = Math.sin(rad) * r;
    const g = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
    for (const [color, stop] of bg.stops) g.addColorStop(stop, color);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    return;
  }
  if (bg.type === 'radial') {
    const cx = bg.cx * w, cy = bg.cy * h;
    const r = Math.max(bg.rx * w, bg.ry * h);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    for (const [color, stop] of bg.stops) g.addColorStop(stop, color);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
}

function paintGrain(ctx, w, h) {
  // Sparse noise overlay. Matches the visual density of the previous CSS grain.
  const tile = 96;
  const off = document.createElement('canvas');
  off.width = tile; off.height = tile;
  const oc = off.getContext('2d');
  const img = oc.createImageData(tile, tile);
  for (let i = 0; i < img.data.length; i += 4) {
    const visible = Math.random() < 0.06;
    img.data[i]     = 38;
    img.data[i + 1] = 25;
    img.data[i + 2] = 13;
    img.data[i + 3] = visible ? 3 + Math.floor(Math.random() * 10) : 0;
  }
  oc.putImageData(img, 0, 0);
  const pattern = ctx.createPattern(off, 'repeat');
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, h);
}

function paintPattern(ctx, kind, color, w, h) {
  ctx.save();
  if (kind === 'lines') {
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, h * 0.001);
    const step = h * 0.075;
    for (let y = step; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(w, y);
      ctx.stroke();
    }
  } else if (kind === 'dots') {
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = color;
    const step = Math.min(w, h) * 0.045;
    const r = Math.max(1.2, step * 0.13);
    for (let y = step / 2; y < h; y += step) {
      for (let x = step / 2; x < w; x += step) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (kind === 'hatch') {
    ctx.globalAlpha = 0.10;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    const step = 14;
    const diag = Math.hypot(w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(Math.PI / 4);
    for (let x = -diag; x < diag; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, -diag); ctx.lineTo(x, diag);
      ctx.stroke();
    }
    ctx.restore();
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-Math.PI / 4);
    for (let x = -diag; x < diag; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, -diag); ctx.lineTo(x, diag);
      ctx.stroke();
    }
    ctx.restore();
  } else if (kind === 'arch') {
    // Concentric arches anchored to the bottom. Coordinates mirror the
    // 200x160 SVG viewBox in the previous implementation.
    const scaleX = w / 200, scaleY = h / 160;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, h * 0.0014);
    const arches = [
      { x1: 28, y1: 160, cx: 100, cy: 8,  rad: 78,  opacity: 0.28 },
      { x1: 44, y1: 160, cx: 100, cy: 26, rad: 70,  opacity: 0.20 },
      { x1: 60, y1: 160, cx: 100, cy: 42, rad: 60,  opacity: 0.14 },
      { x1: 76, y1: 160, cx: 100, cy: 58, rad: 50,  opacity: 0.10 },
    ];
    for (const a of arches) {
      ctx.globalAlpha = a.opacity;
      ctx.beginPath();
      ctx.moveTo(a.x1 * scaleX, a.y1 * scaleY);
      ctx.lineTo(a.x1 * scaleX, (a.cy + a.rad) * scaleY);
      ctx.quadraticCurveTo(100 * scaleX, a.cy * scaleY, (200 - a.x1) * scaleX, (a.cy + a.rad) * scaleY);
      ctx.lineTo((200 - a.x1) * scaleX, a.y1 * scaleY);
      ctx.stroke();
    }
  } else if (kind === 'meridian') {
    // Concentric rings + crosshair, sized to the shorter axis.
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, Math.min(w, h) * 0.0012);
    ctx.globalAlpha = 0.35;
    const cx = w / 2, cy = h / 2;
    const unit = Math.min(w, h) / 200;
    for (const r of [20, 38, 56, 74, 92]) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * unit, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
    ctx.moveTo(0, cy); ctx.lineTo(w, cy);
    ctx.stroke();
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Text wrapping & fitting
// ---------------------------------------------------------------------------

function wrapLine(ctx, text, maxWidth) {
  // Word-level wrap. If a single token is wider than maxWidth (CJK, URL,
  // long word), fall back to character-level breaks for that token.
  const tokens = text.split(/(\s+)/).filter(s => s.length);
  const lines = [];
  let current = '';
  const pushChars = (token) => {
    let chunk = '';
    for (const ch of token) {
      const test = chunk + ch;
      if (ctx.measureText(current + test).width > maxWidth && (current + chunk).trim().length) {
        lines.push((current + chunk).trim());
        current = ''; chunk = ch;
      } else {
        chunk = test;
      }
    }
    current += chunk;
  };

  for (const tok of tokens) {
    if (/^\s+$/.test(tok)) { current += tok; continue; }
    const tentative = current + tok;
    if (ctx.measureText(tentative).width <= maxWidth) {
      current = tentative;
    } else if (ctx.measureText(tok).width > maxWidth) {
      // Token alone too wide — break by character.
      pushChars(tok);
    } else {
      if (current.trim().length) lines.push(current.trim());
      current = tok;
    }
  }
  if (current.trim().length) lines.push(current.trim());
  return lines;
}

function wrapText(ctx, text, maxWidth) {
  const out = [];
  for (const paragraph of text.split('\n')) {
    if (!paragraph.length) { out.push(''); continue; }
    out.push(...wrapLine(ctx, paragraph, maxWidth));
  }
  return out;
}

// Choose the largest font size in [minPx, maxPx] such that wrapped text fits
// within (maxWidth, maxHeight).
function fitText(ctx, text, fontDecl, maxWidth, maxHeight, lineHeight, maxPx, minPx) {
  let lo = minPx, hi = maxPx, best = { size: minPx, lines: [] };
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    ctx.font = fontDecl(mid);
    const lines = wrapText(ctx, text, maxWidth);
    const totalHeight = lines.length * mid * lineHeight;
    if (totalHeight <= maxHeight) {
      best = { size: mid, lines };
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  if (!best.lines.length) {
    ctx.font = fontDecl(minPx);
    best = { size: minPx, lines: wrapText(ctx, text, maxWidth) };
  }
  return best;
}

function drawLines(ctx, lines, x, y, lineHeight, fontSize, align = 'left') {
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  const lh = fontSize * lineHeight;
  let cy = y + fontSize;
  for (const line of lines) {
    ctx.fillText(line, x, cy);
    cy += lh;
  }
}

// ---------------------------------------------------------------------------
// Watermark
// ---------------------------------------------------------------------------

function flamePath() {
  const p = new Path2D();
  // Mirrors the SVG path `M20 4 C 22 12, 30 14, 30 24 C 30 33, 25 40, 20 40
  // C 15 40, 10 34, 10 26 C 10 22, 13 20, 14 18 C 15 22, 17 22, 17 18
  // C 17 14, 19 10, 20 4 Z` on a 40x46 viewBox.
  p.moveTo(20, 4);
  p.bezierCurveTo(22, 12, 30, 14, 30, 24);
  p.bezierCurveTo(30, 33, 25, 40, 20, 40);
  p.bezierCurveTo(15, 40, 10, 34, 10, 26);
  p.bezierCurveTo(10, 22, 13, 20, 14, 18);
  p.bezierCurveTo(15, 22, 17, 22, 17, 18);
  p.bezierCurveTo(17, 14, 19, 10, 20, 4);
  p.closePath();
  return p;
}

function drawWatermark(ctx, rightX, baselineY, fontSize, color) {
  // Renders "🔥 EMBER" — flame glyph followed by the word, right-aligned at
  // (rightX, baselineY). Letter-spacing approximated by font-size factor.
  const glyphSize = fontSize * 0.9;
  const gap = fontSize * 0.35;
  const labelFont = `600 ${fontSize}px ${BODY}`;
  ctx.font = labelFont;
  const label = 'EMBER';
  // Manual letter spacing for the uppercase label.
  const tracking = fontSize * 0.16;
  const labelWidth = measureTracked(ctx, label, tracking);

  const totalWidth = glyphSize + gap + labelWidth;
  const startX = rightX - totalWidth;

  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = color;
  // Flame
  ctx.save();
  ctx.translate(startX, baselineY - glyphSize);
  ctx.scale(glyphSize / 40, glyphSize / 46);
  ctx.fill(flamePath());
  ctx.restore();
  // Label
  ctx.font = labelFont;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  drawTracked(ctx, label, startX + glyphSize + gap, baselineY - fontSize * 0.18, tracking);
  ctx.restore();
}

function measureTracked(ctx, text, tracking) {
  let w = 0;
  for (let i = 0; i < text.length; i++) {
    w += ctx.measureText(text[i]).width;
    if (i < text.length - 1) w += tracking;
  }
  return w;
}

function drawTracked(ctx, text, x, y, tracking) {
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + tracking;
  }
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

function drawClassic(ctx, params) {
  const { quote, theme, w, h, pad, isLandscape, showAttribution, isKorean } = params;
  ctx.fillStyle = theme.ink;

  const contentX = pad;
  const contentW = w - pad * 2;

  // Drop-quote glyph (large accent ") at top.
  const dropSize = w * 0.24;
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = theme.accent;
  ctx.font = `italic 400 ${dropSize}px ${DISPLAY}`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.fillText('“', contentX, pad + dropSize * 0.78);
  ctx.restore();

  // Attribution + watermark reserved at the bottom. Sizes are percentages of
  // canvas width so they scale with the export resolution.
  const attrSize = Math.round(w * 0.030);
  const attrLineH = attrSize * 1.4;
  const attrBlockH = showAttribution ? (attrSize * 1.3) * (quote.work ? 2 : 1) + 6 : 0;
  const watermarkSize = Math.round(w * 0.020);
  const bottomBlockH = Math.max(attrBlockH, watermarkSize);

  const textTop = pad + dropSize * 0.5;
  const textBottom = h - pad - bottomBlockH - attrLineH;
  const textMaxH = textBottom - textTop;

  // Body quote.
  const fontDecl = isKorean
    ? (px) => `500 ${px}px ${BODY}`
    : (px) => `italic 400 ${px}px ${DISPLAY}`;
  const lineH = isKorean ? 1.6 : 1.4;
  const maxPx = Math.round(isLandscape ? w * 0.058 : w * 0.078);
  const minPx = Math.round(w * 0.035);
  ctx.fillStyle = theme.ink;
  const { size, lines } = fitText(ctx, quote.text, fontDecl, contentW, textMaxH, lineH, Math.round(maxPx), minPx);
  ctx.font = fontDecl(size);
  drawLines(ctx, lines, contentX, textTop, lineH, size, 'left');

  // Attribution + watermark.
  const baseY = h - pad;
  if (showAttribution && quote.source) {
    ctx.fillStyle = theme.ink;
    ctx.font = `600 ${attrSize}px ${BODY}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    const rule = attrSize * 2;
    const ruleX = contentX;
    const textStartX = ruleX + rule + attrSize * 0.8;
    // Vertically center the rule with the attribution block.
    const lineCount = quote.work ? 2 : 1;
    const blockH = lineCount * attrSize * 1.2;
    const ruleY = baseY - blockH / 2 - watermarkSize * 0.6;
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = theme.ink;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ruleX, ruleY); ctx.lineTo(ruleX + rule, ruleY);
    ctx.stroke();
    ctx.restore();
    const authorY = baseY - blockH - watermarkSize * 1.2 + attrSize;
    ctx.fillText(quote.source, textStartX, authorY);
    if (quote.work) {
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillText(quote.work, textStartX, authorY + attrSize * 1.2);
      ctx.restore();
    }
  }
  drawWatermark(ctx, w - pad, baseY, watermarkSize, theme.ink);
}

function drawBold(ctx, params) {
  const { quote, theme, w, h, pad, isLandscape, showAttribution } = params;
  const contentX = pad;
  const contentW = w - pad * 2;

  const watermarkSize = Math.round(w * 0.020);
  const attrSize = Math.round(w * 0.028);
  const attrBlockH = showAttribution && quote.source ? attrSize * 2.2 : 0;
  const bottomReserve = watermarkSize * 2 + 8;

  // Bold text is heavy and large, centered vertically.
  const fontDecl = (px) => `600 ${px}px ${BODY}`;
  const lineH = 1.2;
  const maxPx = Math.round(isLandscape ? w * 0.078 : w * 0.11);
  const minPx = Math.round(w * 0.040);
  const availTop = pad;
  const availBottom = h - pad - bottomReserve - attrBlockH;
  const availH = availBottom - availTop;

  ctx.fillStyle = theme.ink;
  const { size, lines } = fitText(ctx, quote.text, fontDecl, contentW, availH, lineH, Math.round(maxPx), minPx);
  ctx.font = fontDecl(size);
  const totalTextH = lines.length * size * lineH;
  const textTop = availTop + (availH - totalTextH) / 2;
  drawLines(ctx, lines, contentX, textTop, lineH, size, 'left');

  if (showAttribution && quote.source) {
    ctx.save();
    ctx.fillStyle = theme.accent;
    ctx.font = `700 ${attrSize}px ${BODY}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    const text = `— ${quote.source.toUpperCase()}`;
    const tracking = attrSize * 0.12;
    drawTracked(ctx, text, contentX, textTop + totalTextH + attrSize * 1.6, tracking);
    ctx.restore();
  }
  drawWatermark(ctx, w - pad, h - pad, watermarkSize, theme.ink);
}

function drawMinimal(ctx, params) {
  const { quote, theme, w, h, pad, isLandscape, showAttribution } = params;
  const contentW = w - pad * 2;
  const watermarkSize = Math.round(w * 0.020);

  const fontDecl = (px) => `400 ${px}px ${BODY}`;
  const lineH = 1.5;
  const maxPx = Math.round(isLandscape ? w * 0.052 : w * 0.068);
  const minPx = Math.round(w * 0.032);
  const sourceSize = Math.round(w * 0.025);
  const sourceGap = sourceSize * 2.8;
  const availTop = pad;
  const availBottom = h - pad - watermarkSize * 2 - 8;
  const sourceReserved = showAttribution && quote.source ? sourceGap + sourceSize : 0;
  const availH = availBottom - availTop - sourceReserved;

  ctx.fillStyle = theme.ink;
  const { size, lines } = fitText(ctx, quote.text, fontDecl, contentW, availH, lineH, Math.round(maxPx), minPx);
  ctx.font = fontDecl(size);
  const totalTextH = lines.length * size * lineH;
  const blockH = totalTextH + sourceReserved;
  const blockTop = availTop + (availBottom - availTop - blockH) / 2;
  // Center each wrapped line horizontally.
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const cx = w / 2;
  let cy = blockTop + size;
  for (const line of lines) {
    ctx.fillText(line, cx, cy);
    cy += size * lineH;
  }
  if (showAttribution && quote.source) {
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.font = `400 ${sourceSize}px ${BODY}`;
    ctx.textAlign = 'center';
    ctx.fillText(quote.source, cx, blockTop + totalTextH + sourceGap);
    ctx.restore();
  }
  drawWatermark(ctx, w - pad, h - pad, watermarkSize, theme.ink);
}

function drawMarginalia(ctx, params) {
  const { quote, theme, w, h, pad, isLandscape, showAttribution, isKorean } = params;
  const watermarkSize = Math.round(w * 0.020);

  // "No. X" in the top-right corner.
  const tagSize = Math.round(w * 0.026);
  ctx.save();
  ctx.fillStyle = theme.accent;
  ctx.globalAlpha = 0.7;
  ctx.font = `italic 400 ${tagSize}px ${DISPLAY}`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(`No. ${quote.id ?? '—'}`, w - pad, pad + tagSize);
  ctx.restore();

  // Body text occupies the left 80% of the card, vertically centered.
  const contentX = pad;
  const contentW = (w - pad * 2) * 0.8;

  const attrSize = Math.round(w * 0.024);
  const attrBlockH = showAttribution && (quote.source || quote.work) ? attrSize * 2.4 : 0;
  const availTop = pad + tagSize * 1.5;
  const availBottom = h - pad - Math.max(watermarkSize, attrBlockH) - 8;
  const availH = availBottom - availTop;

  const fontDecl = isKorean
    ? (px) => `500 ${px}px ${BODY}`
    : (px) => `italic 400 ${px}px ${DISPLAY}`;
  const lineH = isKorean ? 1.6 : 1.4;
  const maxPx = Math.round(isLandscape ? w * 0.055 : w * 0.072);
  const minPx = Math.round(w * 0.034);

  ctx.fillStyle = theme.ink;
  const { size, lines } = fitText(ctx, quote.text, fontDecl, contentW, availH, lineH, Math.round(maxPx), minPx);
  ctx.font = fontDecl(size);
  const totalTextH = lines.length * size * lineH;
  const textTop = availTop + (availH - totalTextH) / 2;
  drawLines(ctx, lines, contentX, textTop, lineH, size, 'left');

  // Attribution along the bottom-left, watermark bottom-right.
  if (showAttribution && (quote.source || quote.work)) {
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = theme.ink;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `400 ${attrSize}px ${BODY}`;
    const baseline = h - pad;
    const hasBoth = quote.source && quote.work;
    if (hasBoth) {
      ctx.fillText(quote.source, contentX, baseline - attrSize * 1.4);
      const workFont = isKorean
        ? `400 ${attrSize}px ${BODY}`
        : `italic 400 ${attrSize}px ${DISPLAY}`;
      ctx.font = workFont;
      ctx.fillText(quote.work, contentX, baseline);
    } else {
      ctx.fillText(quote.source || quote.work, contentX, baseline);
    }
    ctx.restore();
  }
  drawWatermark(ctx, w - pad, h - pad, watermarkSize, theme.ink);
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function drawShareCard(canvas, opts) {
  const { format, themeKey, template, quote, showAttribution, isKorean } = opts;
  const f = FORMATS[format];
  const t = THEMES[themeKey];
  if (canvas.width !== f.w) canvas.width = f.w;
  if (canvas.height !== f.h) canvas.height = f.h;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, f.w, f.h);
  paintBackground(ctx, t.bg, f.w, f.h);
  if (t.grain) paintGrain(ctx, f.w, f.h);
  if (t.pattern) paintPattern(ctx, t.pattern, t.accent, f.w, f.h);

  await ensureFontsReady(isKorean);

  const isLandscape = f.ratio === '16 / 9';
  const pad = (isLandscape ? 0.08 : 0.09) * f.w;
  const params = { quote, theme: t, w: f.w, h: f.h, pad, isLandscape, showAttribution, isKorean };

  switch (template) {
    case 'classic':    drawClassic(ctx, params); break;
    case 'bold':       drawBold(ctx, params); break;
    case 'minimal':    drawMinimal(ctx, params); break;
    case 'marginalia': drawMarginalia(ctx, params); break;
    default:           drawClassic(ctx, params);
  }
}
