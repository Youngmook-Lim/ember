import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { Icon } from './Icon';

const THEMES = [
  { id: 'warm',  bg: '#F6EAD3', ink: '#2A1F1B', ember: '#D96A3C' },
  { id: 'night', bg: '#1C130F', ink: '#F6EAD3', ember: '#F4A466' },
  { id: 'paper', bg: '#EEE6D4', ink: '#1B1B1B', ember: '#9B3A1E' },
];

const LANGUAGES = [
  { id: 'en', labelKey: 'settings.english' },
  { id: 'ko', labelKey: 'settings.korean' },
];

export function SettingsModal({ onClose }) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(20,10,6,0.45)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 160ms ease both',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 400,
        margin: '0 16px',
        background: 'var(--surface-raised)',
        border: '1px solid var(--rule)',
        borderRadius: 18,
        boxShadow: '0 32px 64px -24px rgba(20,10,6,0.4)',
        overflow: 'hidden',
        animation: 'fadeUp 200ms ease both',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 18px',
          borderBottom: '1px solid var(--rule)',
        }}>
          <h2 className="display" style={{ margin: 0, fontSize: 21, fontWeight: 600, letterSpacing: '-0.02em' }}>
            {t('settings.title')}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 999,
              background: 'transparent', border: '1px solid var(--rule)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--ink-mute)',
            }}
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Appearance */}
          <div>
            <div style={{
              fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--ink-mute)', marginBottom: 14,
            }}>
              {t('settings.appearance')}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {THEMES.map(th => {
                const active = theme === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id)}
                    style={{
                      flex: 1,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                      padding: '14px 8px',
                      borderRadius: 12,
                      border: active ? '2px solid var(--ember)' : '2px solid var(--rule)',
                      background: active ? 'color-mix(in srgb, var(--ember) 8%, transparent)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'border-color 150ms ease, background 150ms ease',
                    }}
                  >
                    {/* Mini swatch */}
                    <div style={{
                      width: 52, height: 38,
                      borderRadius: 8,
                      background: th.bg,
                      border: '1px solid rgba(0,0,0,0.12)',
                      position: 'relative',
                      overflow: 'hidden',
                      padding: '7px 9px',
                      display: 'flex', flexDirection: 'column', gap: 4,
                    }}>
                      <div style={{ height: 3, borderRadius: 2, background: th.ink, opacity: 0.7, width: '75%' }} />
                      <div style={{ height: 3, borderRadius: 2, background: th.ink, opacity: 0.4, width: '55%' }} />
                      <div style={{
                        position: 'absolute', bottom: 6, right: 7,
                        width: 9, height: 9, borderRadius: 999,
                        background: th.ember,
                      }} />
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: active ? 600 : 500,
                      color: active ? 'var(--ember)' : 'var(--ink)',
                      fontFamily: 'var(--font-body)',
                    }}>
                      {t(`settings.${th.id}`)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language */}
          <div>
            <div style={{
              fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--ink-mute)', marginBottom: 14,
            }}>
              {t('settings.language')}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {LANGUAGES.map(l => {
                const active = language === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => setLanguage(l.id)}
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: active ? '2px solid var(--ember)' : '2px solid var(--rule)',
                      background: active ? 'color-mix(in srgb, var(--ember) 8%, transparent)' : 'transparent',
                      color: active ? 'var(--ember)' : 'var(--ink)',
                      fontWeight: active ? 600 : 500,
                      fontSize: 14,
                      fontFamily: 'var(--font-body)',
                      cursor: 'pointer',
                      transition: 'border-color 150ms ease, background 150ms ease',
                    }}
                  >
                    {t(l.labelKey)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
