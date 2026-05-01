export function Icon({ name, size = 18, stroke = 1.6 }) {
  const props = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round',
    'aria-hidden': true,
  };
  switch (name) {
    case 'search':    return <svg {...props}><circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.7-4.7"/></svg>;
    case 'plus':      return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case 'x':         return <svg {...props}><path d="M6 6l12 12M18 6 6 18"/></svg>;
    case 'share':     return <svg {...props}><path d="M12 3v13"/><path d="m7 8 5-5 5 5"/><path d="M5 14v6h14v-6"/></svg>;
    case 'shuffle':   return <svg {...props}><path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>;
    case 'pin':       return <svg {...props}><path d="M12 17v5"/><path d="M9 3h6l-1 6 3 3v2H7v-2l3-3-1-6Z"/></svg>;
    case 'edit':      return <svg {...props}><path d="M4 20h4l10-10-4-4L4 16z"/><path d="m14 6 4 4"/></svg>;
    case 'trash':     return <svg {...props}><path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/></svg>;
    case 'book':      return <svg {...props}><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 5v16"/></svg>;
    case 'calendar':  return <svg {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 3v4M16 3v4"/></svg>;
    case 'grid':      return <svg {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
    case 'list':      return <svg {...props}><path d="M4 6h16M4 12h16M4 18h16"/></svg>;
    case 'arrow-right': return <svg {...props}><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>;
    case 'check':     return <svg {...props}><path d="m4 12 5 5L20 6"/></svg>;
    case 'import':    return <svg {...props}><path d="M4 4h16v6"/><path d="M4 10v10h16V10"/><path d="M12 8v10m0 0-3-3m3 3 3-3"/></svg>;
    case 'settings':  return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2L10 21h4l.6-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z"/></svg>;
    case 'flame':     return <svg {...props}><path d="M12 2c0 0 4 4 4 8a4 4 0 0 1-8 0c0-2 1-4 1-4s-3 3-3 6a6 6 0 0 0 12 0c0-6-6-10-6-10Z"/></svg>;
    case 'moon':      return <svg {...props}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
    case 'sun':       return <svg {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>;
    default:          return null;
  }
}
