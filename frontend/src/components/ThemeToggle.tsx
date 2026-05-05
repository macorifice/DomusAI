'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'domus-theme';

export type ThemeMode = 'light' | 'dark';

function getStoredTheme(): ThemeMode | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'light' || value === 'dark') return value;
  } catch {
    /* ignore */
  }
  return null;
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    const stored = getStoredTheme();
    const resolved =
      stored ??
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    setMode(resolved);
    applyTheme(resolved);
  }, []);

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  }, []);

  return (
    <button
      type="button"
      className="themeToggle"
      onClick={toggle}
      aria-label={mode === 'dark' ? 'Passa al tema chiaro' : 'Passa al tema scuro'}
      title={mode === 'dark' ? 'Tema chiaro' : 'Tema scuro'}
    >
      <span className="themeToggleIcon" aria-hidden>
        {mode === 'dark' ? '☀' : '☽'}
      </span>
      <span className="themeToggleLabel">{mode === 'dark' ? 'Chiaro' : 'Scuro'}</span>
    </button>
  );
}
