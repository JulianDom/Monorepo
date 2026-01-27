import { ReactNode } from 'react';
import { UseQueryResult } from '@tanstack/react-query';
import { AlertCircle, Loader2 } from 'lucide-react';

interface QueryCellProps<TData> {
  query: UseQueryResult<TData, Error>;
  children: (data: TData) => ReactNode;
  loadingFallback?: ReactNode;
  errorFallback?: (error: Error) => ReactNode;
  emptyFallback?: ReactNode;
  isEmpty?: (data: TData) => boolean;
}

/**
 * Wrapper para manejar estados de queries de React Query
 * Maneja loading, error y empty states de forma consistente
 */
export function QueryCell<TData>({
  query,
  children,
  loadingFallback,
  errorFallback,
  emptyFallback,
  isEmpty,
}: QueryCellProps<TData>) {
  const { data, isLoading, isError, error } = query;

  // Loading state
  if (isLoading) {
    return (
      loadingFallback || (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Cargando...</p>
          </div>
        </div>
      )
    );
  }

  // Error state
  if (isError) {
    return (
      errorFallback?.(error as Error) || (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3 max-w-md text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Error al cargar los datos</h3>
              <p className="text-sm text-muted-foreground">
                {error?.message || 'Ocurrió un error inesperado'}
              </p>
            </div>
          </div>
        </div>
      )
    );
  }

  // Empty state
  if (isEmpty && data && isEmpty(data)) {
    return emptyFallback || null;
  }

  // Success state
  return <>{data ? children(data) : null}</>;
}

/**
 * Ejemplo de uso:
 * 
 * const usersQuery = useQuery({
 *   queryKey: ['users'],
 *   queryFn: () => userService.list()
 * });
 * 
 * <QueryCell
 *   query={usersQuery}
 *   isEmpty={(data) => data.data.length === 0}
 *   emptyFallback={<EmptyUsers />}
 * >
 *   {(data) => <UserList users={data.data} />}
 * </QueryCell>
 */
