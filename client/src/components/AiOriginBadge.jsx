import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';
import { useIsMobile } from '../hooks/useIsMobile';

export function AiOriginBadge() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [visible, setVisible] = useState(false);

  return (
    <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <span
        onMouseEnter={() => { if (!isMobile) setVisible(true); }}
        onMouseLeave={() => { if (!isMobile) setVisible(false); }}
        onClick={e => { if (isMobile) { e.stopPropagation(); setVisible(v => !v); } }}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 22, height: 22,
          borderRadius: 999,
          background: 'color-mix(in srgb, var(--ember) 14%, transparent)',
          color: 'var(--ember-deep)',
          border: '1px solid color-mix(in srgb, var(--ember) 30%, transparent)',
          flexShrink: 0,
          cursor: isMobile ? 'pointer' : 'default',
        }}
      >
        <Icon name="sparkle" size={11} stroke={2} />
      </span>

      {visible && (
        <span style={{
          position: 'absolute',
          bottom: 'calc(100% + 6px)',
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
          background: 'var(--ink)',
          color: 'var(--bg)',
          fontSize: 11,
          fontWeight: 500,
          padding: '4px 8px',
          borderRadius: 6,
          pointerEvents: 'none',
          zIndex: 100,
        }}>
          {t('collection.aiBadge')}
        </span>
      )}
    </span>
  );
}
