'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Error UI para el dashboard
 *
 * Next.js muestra este componente automaticamente cuando
 * ocurre un error en la pagina. DEBE ser un Client Component.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log del error para debugging/monitoring
    console.error('[Dashboard Error]', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-foreground mb-2">
          Algo salio mal
        </h2>

        <p className="text-muted-foreground mb-6">
          Ocurrio un error al cargar esta pagina. Puedes intentar recargarla o volver al inicio.
        </p>

        {/* Error details (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left">
            <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
              Ver detalles del error
            </summary>
            <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto max-h-32">
              {error.message}
              {error.digest && `\n\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/dashboard')}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Ir al inicio
          </Button>
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Intentar de nuevo
          </Button>
        </div>
      </Card>
    </div>
  );
}
