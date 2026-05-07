import { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export function useTheme(user) {
  // Initialize from localStorage immediately to avoid flash of unstyled theme
  const [theme, setThemeState] = useState(() => localStorage.getItem('ember_theme') || 'warm');
  const synced = useRef({ fetched: false, dirty: false });

  // Apply theme to DOM whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'warm' ? '' : theme);
    localStorage.setItem('ember_theme', theme);
  }, [theme]);

  // Reset sync state on logout so the next login fetches fresh settings
  useEffect(() => {
    if (!user) {
      synced.current.fetched = false;
      synced.current.dirty = false;
    }
  }, [user]);

  // On first login, fetch the authoritative theme from the API
  useEffect(() => {
    if (!user || synced.current.fetched) return;
    synced.current.fetched = true;
    fetch(`${API_URL}/api/settings`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        // Don't overwrite a theme the user changed while the fetch was in flight
        if (data?.theme && !synced.current.dirty) setThemeState(data.theme);
      })
      .catch(() => {});
  }, [user]);

  const setTheme = (t) => {
    synced.current.dirty = true;
    setThemeState(t);
    if (user) {
      fetch(`${API_URL}/api/settings`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: t }),
      }).catch(() => {});
    }
  };

  return { theme, setTheme };
}
