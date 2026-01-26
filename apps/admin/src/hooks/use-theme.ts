'use client';

import { useTheme as useNextTheme } from 'next-themes';
import { useCallback, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

/**
 * Hook para manejo de tema (dark/light mode)
 *
 * @example
 * ```tsx
 * function ThemeToggle() {
 *   const { theme, setTheme, toggleTheme, isDark } = useTheme();
 *
 *   return (
 *     <button onClick={toggleTheme}>
 *       {isDark ? <Sun /> : <Moon />}
 *     </button>
 *   );
 * }
 * ```
 */
export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';
  const isLight = mounted && resolvedTheme === 'light';
  const isSystem = theme === 'system';

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  const setLightTheme = useCallback(() => {
    setTheme('light');
  }, [setTheme]);

  const setDarkTheme = useCallback(() => {
    setTheme('dark');
  }, [setTheme]);

  const setSystemTheme = useCallback(() => {
    setTheme('system');
  }, [setTheme]);

  return {
    theme: theme as Theme,
    resolvedTheme: resolvedTheme as 'light' | 'dark' | undefined,
    systemTheme: systemTheme as 'light' | 'dark' | undefined,
    setTheme: setTheme as (theme: Theme) => void,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    isDark,
    isLight,
    isSystem,
    mounted,
  };
}
