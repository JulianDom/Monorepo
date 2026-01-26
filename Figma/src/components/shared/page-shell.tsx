import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageShellProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
}

/**
 * Layout wrapper para páginas
 * Proporciona estructura consistente con título, descripción y acciones
 */
export function PageShell({ children, className, title, description, actions }: PageShellProps) {
  return (
    <div className={cn('space-y-4 md:space-y-6', className)}>
      {(title || description || actions) && (
        <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
          {(title || description) && (
            <div>
              {title && <h1 className="text-foreground">{title}</h1>}
              {description && (
                <p className="text-muted-foreground text-sm mt-1">{description}</p>
              )}
            </div>
          )}
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
