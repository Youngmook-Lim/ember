import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth <= 640);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const h = e => setMobile(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return mobile;
}

export function useIsShortScreen() {
  const [short, setShort] = useState(window.innerHeight <= 740);
  useEffect(() => {
    const mq = window.matchMedia('(max-height: 740px)');
    const h = e => setShort(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return short;
}
