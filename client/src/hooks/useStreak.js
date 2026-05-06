import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export function useStreak(user) {
  const [streak, setStreak] = useState(0);
  const [weekDays, setWeekDays] = useState([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    if (!user) {
      setStreak(0);
      setWeekDays([0, 0, 0, 0, 0, 0, 0]);
      return;
    }
    fetch(`${API_URL}/api/settings/visits`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setStreak(data.streak);
          setWeekDays(data.weekDays);
        }
      })
      .catch(() => {});
  }, [user]);

  return { streak, weekDays };
}
