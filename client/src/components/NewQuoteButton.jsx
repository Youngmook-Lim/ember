import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from './Icon';
import { useIsMobile } from '../hooks/useIsMobile';

export function NewQuoteButton() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  if (!isMobile) return null;
  if (location.pathname === '/add') return null;

  return (
    <button
      onClick={() => navigate('/add')}
      title={t('nav.newQuote')}
      aria-label={t('nav.newQuote')}
      style={{
        position: 'fixed',
        right: 'max(16px, env(safe-area-inset-right))',
        bottom: 'calc(max(16px, env(safe-area-inset-bottom)) + 76px)',
        width: 44, height: 44,
        borderRadius: 999,
        background: 'var(--ember)',
        border: '1px solid var(--ember-deep)',
        boxShadow: '0 10px 24px -8px rgba(217,106,60,0.55), 0 1px 0 rgba(181,74,34,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#FFFBEE',
        cursor: 'pointer',
        zIndex: 55,
        transition: 'background 150ms ease, transform 120ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ember-deep)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--ember)'; }}
    >
      <Icon name="plus" size={20} stroke={2.4} />
    </button>
  );
}
