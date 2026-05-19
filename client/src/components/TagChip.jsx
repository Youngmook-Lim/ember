import { useTranslation } from 'react-i18next';
import { TAG_COLORS } from '../constants';

export function TagChip({ tag, onClick, active }) {
  if (!tag) return null;
  const { t } = useTranslation();
  const theme = TAG_COLORS[tag] || { bg: 'var(--surface)', dot: 'var(--ink-mute)' };
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
      {t(`tags.${tag}`, { defaultValue: tag })}
    </button>
  );
}
