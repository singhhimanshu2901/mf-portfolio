import { createContext, useContext, useEffect, useState } from "react";

// ======================================
// Theme Context
// ======================================
// Site-wide light/dark mode. We apply a "dark" class on <html> and every
// page/component reads its colors from CSS variables (see index.css) that
// flip based on that class. This is far more maintainable than manually
// adding dark:/light: variants to every single element across the app —
// change the variable once, every page updates.

const ThemeContext = createContext(null);

const STORAGE_KEY = "theme";

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      return saved;
    }
  } catch (err) {
    // localStorage unavailable (private browsing etc.) — fall through.
  }

  // Default to dark, matching this app's original look.
  return "dark";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (err) {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
