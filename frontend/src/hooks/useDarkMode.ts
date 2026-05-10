import { useEffect, useState } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const stored = localStorage.getItem('darkMode');
    const dark = stored ? JSON.parse(stored) : false;

    setIsDark(dark);
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    setMounted(true);
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    const newState = !isDark;
    setIsDark(newState);
    localStorage.setItem('darkMode', JSON.stringify(newState));

    if (newState) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  return { isDark, toggle, mounted };
}
