import { useEffect, useState, useCallback } from "react";

export type AppTheme = "original" | "warm";
const STORAGE_KEY = "appTheme";

function applyTheme(theme: AppTheme) {
  const root = document.documentElement;
  if (theme === "warm") root.classList.add("warm-theme");
  else root.classList.remove("warm-theme");
}

function readStored(): AppTheme {
  if (typeof window === "undefined") return "original";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "warm" ? "warm" : "original";
}

export function useAppTheme() {
  const [theme, setThemeState] = useState<AppTheme>(() => readStored());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((t: AppTheme) => {
    window.localStorage.setItem(STORAGE_KEY, t);
    setThemeState(t);
  }, []);

  return { theme, setTheme };
}

export function AppThemeInitializer() {
  useAppTheme();
  return null;
}