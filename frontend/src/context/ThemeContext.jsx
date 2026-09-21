import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Dark mode is the permanent default — always force dark
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Always force dark — overwrite any stored light preference
    try {
      localStorage.setItem('luxehair_theme', 'dark');
    } catch (e) {
      console.error(e);
    }
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.removeAttribute('data-theme'); // falls back to :root (dark)
  }, []);

  // Toggle disabled — dark is permanently enforced
  const toggleTheme = () => {};


  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
