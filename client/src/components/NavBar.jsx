import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EmberFlame } from './EmberFlame';
import { Icon } from './Icon';
import { useIsMobile } from '../hooks/useIsMobile';

const API_URL = import.meta.env.VITE_API_URL;

function StreakBadge({ days }) {
  const { t } = useTranslation();
  return (
    <div title={t('nav.streakDays', { days })} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      border: '1px solid var(--rule)', borderRadius: 999,
      padding: '6px 12px 6px 8px',
      fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
      color: 'var(--ink)',
    }}>
      <span className="flicker" style={{ display: 'inline-flex' }}>
        <EmberFlame size={16} glow={false} />
      </span>
      <span>{days}</span>
    </div>
  );
}

function MenuRow({ icon, label, onClick, danger }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '9px 10px',
        borderRadius: 7, border: 'none',
        background: hov ? 'var(--surface)' : 'transparent',
        color: danger ? (hov ? '#C0392B' : 'var(--ink-mute)') : 'var(--ink)',
        cursor: 'pointer', fontSize: 13, fontWeight: 500, textAlign: 'left',
      }}
    >
      <Icon name={icon} size={15} />
      {label}
    </button>
  );
}

export function BottomTabBar() {
  const mobile = useIsMobile();
  const { t } = useTranslation();
  if (!mobile) return null;

  const tabs = [
    { id: 'dashboard', path: '/dashboard', icon: 'flame', label: t('nav.today') },
    { id: 'collection', path: '/collection', icon: 'book', label: t('nav.collection') },
    { id: 'add', path: '/add', icon: 'plus', label: t('nav.add'), primary: true },
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      display: 'flex',
      background: 'color-mix(in srgb, var(--bg) 96%, transparent)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid var(--rule)',
    }}>
      {tabs.map(t => (
        <NavLink key={t.id} to={t.path} style={{ flex: t.primary ? 1.2 : 1, display: 'flex', textDecoration: 'none' }}>
          {({ isActive }) => (
            <button style={{
              flex: 1,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 4, padding: '10px 8px 14px',
              background: t.primary ? 'var(--ember)' : 'transparent',
              border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: t.primary ? '#FFFBEE' : isActive ? 'var(--ember)' : 'var(--ink-mute)',
              margin: t.primary ? '6px 8px' : 0,
              borderRadius: t.primary ? 14 : 0,
              position: 'relative',
            }}>
              {isActive && !t.primary && (
                <span style={{
                  position: 'absolute', top: 0, left: '20%', right: '20%',
                  height: 2, background: 'var(--ember)', borderRadius: '0 0 2px 2px',
                }} />
              )}
              <Icon name={t.icon} size={t.primary ? 20 : 22} stroke={t.primary ? 2.5 : 1.6} />
              {t.label}
            </button>
          )}
        </NavLink>
      ))}
    </div>
  );
}

export default function NavBar({ user, streak, onSettings }) {
  const navigate = useNavigate();
  const mobile = useIsMobile();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    navigate('/');
  };

  const initial = user?.name?.[0]?.toUpperCase() || '?';

  const tabs = [
    { path: '/dashboard', label: t('nav.today') },
    { path: '/collection', label: t('nav.collection') },
  ];

  return (
    <nav style={{
      borderBottom: '1px solid var(--rule)',
      background: 'color-mix(in srgb, var(--bg) 92%, transparent)',
      backdropFilter: 'blur(8px)',
      position: 'sticky', top: 0, zIndex: 40,
    }}>
      <div style={{
        maxWidth: 1180, margin: '0 auto',
        padding: mobile ? '12px 16px' : '14px 28px',
        display: 'flex', alignItems: 'center', gap: mobile ? 12 : 24,
      }}>
        {/* Logo */}
        <NavLink to="/dashboard" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          textDecoration: 'none', color: 'var(--ink)',
        }}>
          <EmberFlame size={26} />
          <span className="display" style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>
            Ember
          </span>
        </NavLink>

        {/* Desktop nav tabs */}
        {!mobile && (
          <div style={{ display: 'flex', gap: 4, marginLeft: 18 }}>
            {tabs.map(t => (
              <NavLink key={t.path} to={t.path} style={{ textDecoration: 'none' }}>
                {({ isActive }) => (
                  <button style={{
                    padding: '8px 14px', borderRadius: 999,
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    fontSize: 14, fontWeight: 500,
                    color: isActive ? 'var(--ink)' : 'var(--ink-mute)',
                    position: 'relative',
                  }}>
                    {t.label}
                    {isActive && (
                      <span style={{
                        position: 'absolute', left: 14, right: 14, bottom: 2,
                        height: 2, background: 'var(--ember)', borderRadius: 2,
                      }} />
                    )}
                  </button>
                )}
              </NavLink>
            ))}
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Desktop right side */}
        {!mobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <StreakBadge days={streak} />
            <button onClick={() => navigate('/add')} className="btn btn-primary" style={{ padding: '9px 16px' }}>
              <Icon name="plus" size={16} stroke={2} /> {t('nav.newQuote')}
            </button>
          </div>
        )}

        {/* Avatar + dropdown */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            title={t('nav.account')}
            style={{
              width: 34, height: 34, borderRadius: 999,
              background: menuOpen ? 'var(--ember-deep)' : 'var(--ember)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFBEE', fontFamily: 'var(--font-display)',
              fontWeight: 600, fontSize: 15,
              border: '1px solid var(--ember-deep)', cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
          >
            {initial}
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              minWidth: 200,
              background: 'var(--surface-raised)',
              border: '1px solid var(--rule)',
              borderRadius: 12,
              boxShadow: '0 16px 40px -16px rgba(20,10,6,0.35)',
              overflow: 'hidden',
              animation: 'fadeUp 140ms ease both',
              zIndex: 60,
            }}>
              {/* User info */}
              <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--rule)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 999,
                    background: 'var(--ember)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#FFFBEE', fontFamily: 'var(--font-display)',
                    fontWeight: 600, fontSize: 16, flexShrink: 0,
                  }}>{initial}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{user?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                      {user?.email}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: 6 }}>
                <MenuRow icon="settings" label={t('nav.settings')} onClick={() => { setMenuOpen(false); onSettings?.(); }} />
                <div style={{ height: 1, background: 'var(--rule)', margin: '4px 0' }} />
                <MenuRow icon="x" label={t('nav.signOut')} onClick={handleLogout} danger />
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
