import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('ember_theme') || 'warm');

  useEffect(() => {
    const value = theme === 'warm' ? '' : theme;
    document.documentElement.setAttribute('data-theme', value);
    localStorage.setItem('ember_theme', theme);
  }, [theme]);

  return { theme, setTheme };
}
