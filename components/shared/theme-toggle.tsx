'use client';

import { Moon, Sun } from 'lucide-react';

import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex h-7 w-[52px] shrink-0 items-center rounded-full border transition-colors duration-200',
        isDark ? 'border-transparent bg-primary' : 'border-input bg-muted'
      )}
    >
      <span
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-full bg-background shadow transition-transform duration-200',
          isDark ? 'translate-x-[27px]' : 'translate-x-1'
        )}
      >
        {isDark ? (
          <Moon className="h-3 w-3 text-primary" />
        ) : (
          <Sun className="h-3 w-3 text-muted-foreground" />
        )}
      </span>
    </button>
  );
}
