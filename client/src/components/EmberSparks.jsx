import { useMemo } from 'react';

export function EmberSparks({ count = 14, height = 180, intensity = 1 }) {
  const sparks = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const seed = (i * 9301 + 49297) % 233280;
      const r1 = (seed % 1000) / 1000;
      const r2 = ((seed * 7) % 1000) / 1000;
      const r3 = ((seed * 13) % 1000) / 1000;
      const r4 = ((seed * 17) % 1000) / 1000;
      return {
        leftPct: r1 * 100,
        size: 2 + r2 * 4 * intensity,
        delay: -r3 * 3.6,
        duration: 2.6 + r4 * 2.4,
        drift: (r2 - 0.5) * 60,
        color: ['var(--ember-glow)', 'var(--ember)', 'var(--ember-deep)'][i % 3],
        bottom: r4 * 10,
      };
    });
  }, [count, intensity]);

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        height,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {sparks.map((s, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${s.leftPct}%`,
            bottom: s.bottom,
            width: s.size,
            height: s.size,
            borderRadius: '999px',
            background: s.color,
            boxShadow: `0 0 ${s.size * 3}px ${s.color}`,
            '--drift': `${s.drift}px`,
            animation: `emberRise ${s.duration}s ease-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
