"use client";

import { useLayoutEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "theme";

/**
 * Applies the theme to <html>. Kept outside React state on purpose: the icon is
 * driven by CSS `dark:` variants, so there is nothing to hydrate and no
 * server/client mismatch.
 */
function applyTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem(STORAGE_KEY, theme);
}

export function ThemeToggle() {
  // The inline script in layout.tsx sets `.dark` before paint. React's dev-mode
  // Strict Mode remount can clear attributes it manages on <html>, so re-apply
  // the stored theme here. No-op in production.
  useLayoutEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    applyTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full text-foreground/80 hover:text-foreground hover:bg-secondary transition-colors"
      aria-label="Toggle Theme"
    >
      <Moon className="h-5 w-5 transition-all dark:hidden" />
      <Sun className="hidden h-5 w-5 transition-all text-amber-400 dark:block" />
    </Button>
  );
}
