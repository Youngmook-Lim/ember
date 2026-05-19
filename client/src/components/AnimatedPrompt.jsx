import { useState, useEffect } from 'react';

export function AnimatedPrompt({ prompts, duration = 3200 }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(v => (v + 1) % prompts.length), duration);
    return () => clearInterval(t);
  }, [prompts.length, duration]);

  return (
    <span style={{ position: 'relative', display: 'inline-block', verticalAlign: 'bottom' }}>
      {prompts.map((p, i) => (
        <span
          key={i}
          style={{
            position: i === 0 ? 'relative' : 'absolute',
            left: 0, top: 0,
            opacity: i === idx ? 1 : 0,
            transform: i === idx ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 600ms ease, transform 600ms ease',
            whiteSpace: 'nowrap',
          }}
        >
          {p}
        </span>
      ))}
    </span>
  );
}
