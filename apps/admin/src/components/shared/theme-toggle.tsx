'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  /** Mostrar solo iconos (default) o con dropdown */
  variant?: 'icon' | 'dropdown';
  className?: string;
}

/**
 * Componente para cambiar entre temas
 *
 * @example
 * ```tsx
 * // Toggle simple (cicla entre light/dark)
 * <ThemeToggle />
 *
 * // Con dropdown (light/dark/system)
 * <ThemeToggle variant="dropdown" />
 * ```
 */
export function ThemeToggle({ variant = 'icon', className }: ThemeToggleProps) {
  const { toggleTheme, isDark, mounted } = useTheme();

  // Evitar hydration mismatch
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={className} disabled>
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className={className}
        aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {isDark ? (
          <Sun className="h-5 w-5 transition-transform" />
        ) : (
          <Moon className="h-5 w-5 transition-transform" />
        )}
      </Button>
    );
  }

  // Variant dropdown - botones para cada opción
  return <ThemeDropdown className={className} />;
}

function ThemeDropdown({ className }: { className?: string }) {
  const { theme, setTheme, mounted } = useTheme();

  if (!mounted) return null;

  const options = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Oscuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor },
  ] as const;

  return (
    <div className={cn('flex gap-1 rounded-lg bg-muted p-1', className)}>
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
            theme === value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label={`Usar tema ${label}`}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
