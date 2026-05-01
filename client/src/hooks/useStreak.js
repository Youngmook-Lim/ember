import { useState, useEffect, useMemo } from 'react';

const KEY = 'ember_visit_dates';

export function useStreak(user) {
  const [dates, setDates] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  });

  // Sync today's visit into localStorage when the user is available
  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDates(prev => {
      if (prev.includes(today)) return prev;
      const next = [...prev, today];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, [user]);

  const streak = useMemo(() => {
    const dateSet = new Set(dates);
    let count = 0;
    const cursor = new Date();
    while (dateSet.has(cursor.toISOString().slice(0, 10))) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [dates]);

  const weekDays = useMemo(() => {
    const dateSet = new Set(dates);
    const week = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      week.push(dateSet.has(d.toISOString().slice(0, 10)) ? 1 : 0);
    }
    return week;
  }, [dates]);

  return { streak, weekDays };
}
