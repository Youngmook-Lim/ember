export function EmberFlame({ size = 28, glow = true }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 40 46" fill="none" aria-hidden>
      {glow && (
        <defs>
          <radialGradient id="ef-glow" cx="50%" cy="70%" r="60%">
            <stop offset="0%" stopColor="var(--ember-glow)" stopOpacity="0.7" />
            <stop offset="60%" stopColor="var(--ember)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--ember)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ef-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ember-glow)" />
            <stop offset="55%" stopColor="var(--ember)" />
            <stop offset="100%" stopColor="var(--ember-deep)" />
          </linearGradient>
        </defs>
      )}
      {glow && <circle cx="20" cy="30" r="22" fill="url(#ef-glow)" />}
      <path
        d="M20 4 C 22 12, 30 14, 30 24 C 30 33, 25 40, 20 40 C 15 40, 10 34, 10 26 C 10 22, 13 20, 14 18 C 15 22, 17 22, 17 18 C 17 14, 19 10, 20 4 Z"
        fill={glow ? 'url(#ef-fill)' : 'var(--ember)'}
      />
      <path
        d="M20 18 C 21 22, 24 23, 24 28 C 24 33, 22 36, 20 36 C 18 36, 16 33, 16 29 C 16 26, 18 24, 20 18 Z"
        fill="var(--ember-glow)"
        opacity="0.8"
      />
    </svg>
  );
}
