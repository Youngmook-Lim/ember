import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';

export function AiOriginBadge() {
  const { t } = useTranslation();
  return (
    <span
      title={t('collection.aiBadge')}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 8px',
        borderRadius: 999,
        background: 'color-mix(in srgb, var(--ember) 14%, transparent)',
        color: 'var(--ember-deep)',
        border: '1px solid color-mix(in srgb, var(--ember) 30%, transparent)',
        fontSize: 11, fontWeight: 600,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.04em', textTransform: 'uppercase',
        lineHeight: 1.2,
        flexShrink: 0,
      }}
    >
      <Icon name="sparkle" size={11} stroke={2} />
      {t('collection.aiBadge')}
    </span>
  );
}
