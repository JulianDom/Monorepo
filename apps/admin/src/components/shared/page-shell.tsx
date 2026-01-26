import { type ReactNode } from 'react';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageShellProps {
  /** Título de la página */
  title: string;
  /** Breadcrumbs de navegación */
  breadcrumbs?: BreadcrumbItem[];
  /** Acciones del header (botones, etc.) */
  actions?: ReactNode;
  /** Contenido de la página */
  children: ReactNode;
  /** Descripción opcional debajo del título */
  description?: string;
}

/**
 * Layout shell para páginas del admin
 * Proporciona un header consistente con título, breadcrumbs y acciones
 */
export function PageShell({
  title,
  breadcrumbs,
  actions,
  children,
  description,
}: PageShellProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;

                return (
                  <BreadcrumbItem key={item.label}>
                    {isLast ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : (
                      <>
                        <BreadcrumbLink asChild>
                          <Link href={item.href || '#'}>{item.label}</Link>
                        </BreadcrumbLink>
                        <BreadcrumbSeparator />
                      </>
                    )}
                  </BreadcrumbItem>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        )}

        {/* Título y acciones */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
