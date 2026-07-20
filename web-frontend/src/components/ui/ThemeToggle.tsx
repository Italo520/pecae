'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="p-2 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] opacity-50 cursor-default" aria-hidden="true">
        <Sun className="h-5 w-5" />
      </button>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--background)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
      aria-label="Alternar tema"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-[var(--brand-vibrant)]" />
      ) : (
        <Moon className="h-5 w-5 text-slate-700" />
      )}
    </button>
  );
}
