import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
}

const THEME_STORAGE_KEY = 'supreme-notify-theme';

export const useTheme = () => {
  const [themeState, setThemeState] = useState<ThemeState>(() => {
    // Get theme from localStorage or default to system
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
    const theme = storedTheme || 'system';
    
    return {
      theme,
      resolvedTheme: getResolvedTheme(theme)
    };
  });

  // Function to get resolved theme based on system preference
  function getResolvedTheme(theme: Theme): 'light' | 'dark' {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }

  // Apply theme to document
  const applyTheme = useCallback((resolvedTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // Set theme
  const setTheme = useCallback((theme: Theme) => {
    const resolvedTheme = getResolvedTheme(theme);
    
    setThemeState({ theme, resolvedTheme });
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(resolvedTheme);
  }, [applyTheme]);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const newTheme = themeState.resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [themeState.resolvedTheme, setTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (themeState.theme === 'system') {
        const resolvedTheme = getResolvedTheme('system');
        setThemeState(prev => ({ ...prev, resolvedTheme }));
        applyTheme(resolvedTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeState.theme, applyTheme]);

  // Apply initial theme
  useEffect(() => {
    applyTheme(themeState.resolvedTheme);
  }, [themeState.resolvedTheme, applyTheme]);

  return {
    theme: themeState.theme,
    resolvedTheme: themeState.resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: themeState.resolvedTheme === 'dark',
    isLight: themeState.resolvedTheme === 'light',
    isSystem: themeState.theme === 'system'
  };
};
