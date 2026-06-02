import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint = 640) {
  const [mobile, setMobile] = useState(window.innerWidth <= breakpoint);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const h = e => setMobile(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, [breakpoint]);
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
