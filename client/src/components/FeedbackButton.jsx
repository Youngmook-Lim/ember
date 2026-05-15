import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';

export function FeedbackButton({ onClick }) {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      title={t('feedback.buttonLabel')}
      aria-label={t('feedback.buttonLabel')}
      style={{
        position: 'fixed',
        right: 'max(16px, env(safe-area-inset-right))',
        bottom: 'calc(max(16px, env(safe-area-inset-bottom)) + 76px)',
        width: 44, height: 44,
        borderRadius: 999,
        background: 'color-mix(in srgb, var(--surface-raised) 92%, transparent)',
        border: '1px solid var(--rule)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 8px 24px -10px rgba(20,10,6,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--ink)',
        cursor: 'pointer',
        zIndex: 55,
      }}
    >
      <Icon name="message" size={18} />
    </button>
  );
}
