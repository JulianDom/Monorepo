'use client';

import { type ReactNode } from 'react';
import { type UseQueryResult } from '@tanstack/react-query';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface QueryCellProps<TData> {
  /** Resultado de useQuery */
  query: UseQueryResult<TData, Error>;
  /** Render function cuando los datos están disponibles */
  children: (data: TData) => ReactNode;
  /** Componente de loading personalizado */
  loadingComponent?: ReactNode;
  /** Componente de error personalizado */
  errorComponent?: ReactNode;
  /** Clase CSS adicional para el contenedor */
  className?: string;
}

/**
 * Componente HOC para manejar estados de React Query
 * - Loading: Muestra 3 Skeletons
 * - Error: Muestra Alert con mensaje de error
 * - Success: Renderiza children con los datos
 */
export function QueryCell<TData>({
  query,
  children,
  loadingComponent,
  errorComponent,
  className,
}: QueryCellProps<TData>) {
  const { data, isLoading, isError, error, refetch, isFetching } = query;

  // Estado de carga
  if (isLoading) {
    return (
      loadingComponent || (
        <div className={cn('space-y-4', className)}>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )
    );
  }

  // Estado de error
  if (isError) {
    return (
      errorComponent || (
        <Alert variant="destructive" className={className}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error?.message || 'Ha ocurrido un error inesperado'}</span>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-1 text-sm underline hover:no-underline"
              disabled={isFetching}
            >
              <RefreshCw
                className={cn('h-3 w-3', isFetching && 'animate-spin')}
              />
              Reintentar
            </button>
          </AlertDescription>
        </Alert>
      )
    );
  }

  // Estado de éxito - renderizar children con datos
  if (data !== undefined) {
    return <>{children(data)}</>;
  }

  // Estado por defecto (no debería llegar aquí)
  return null;
}

/**
 * Variantes de loading para diferentes casos de uso
 */
export function QueryCellTableLoading({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

export function QueryCellCardLoading({ cards = 3 }: { cards?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: cards }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-lg" />
      ))}
    </div>
  );
}
