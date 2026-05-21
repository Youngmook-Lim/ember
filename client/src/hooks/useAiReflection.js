import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL;

export function useAiReflection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { i18n } = useTranslation();

  async function generate({ text, source, work }) {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/quotes/ai-reflect`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          source: source || undefined,
          work: work || undefined,
          language: i18n.language === 'ko' ? 'ko' : 'en',
        }),
      });
      if (!res.ok) { setError('error'); return null; }
      const data = await res.json();
      if (data.status === 'unavailable') { setError('unavailable'); return null; }
      const reflection = (data.reflection || '').trim();
      if (!reflection) { setError('error'); return null; }
      return reflection;
    } catch {
      setError('error');
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { generate, loading, error, clearError: () => setError('') };
}
