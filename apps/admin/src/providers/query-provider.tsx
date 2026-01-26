'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Provider de TanStack Query v5
 * Configura el cliente con staleTime de 5 minutos
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Los datos se consideran frescos por 5 minutos
            staleTime: 5 * 60 * 1000,
            // Reintentar 1 vez en caso de error
            retry: 1,
            // No refetch en window focus por defecto
            refetchOnWindowFocus: false,
          },
          mutations: {
            // Mostrar errores de mutaciones
            onError: (error) => {
              console.error('Mutation error:', error);
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/*
        Para habilitar React Query DevTools, instala:
        pnpm add @tanstack/react-query-devtools

        Y descomenta:
        <ReactQueryDevtools initialIsOpen={false} />
      */}
    </QueryClientProvider>
  );
}
