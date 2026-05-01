import { TAG_COLORS } from '../constants';

export function TagChip({ tag, onClick, active }) {
  if (!tag) return null;
  const theme = TAG_COLORS[tag] || { bg: 'var(--tag-peach)', dot: '#D96A3C' };
  return (
    <button
      onClick={onClick}
      className="chip"
      style={{
        background: active ? theme.bg : 'transparent',
        borderColor: active ? 'transparent' : 'var(--rule)',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <span className="chip-dot" style={{ background: theme.dot }} />
      {tag}
    </button>
  );
}
