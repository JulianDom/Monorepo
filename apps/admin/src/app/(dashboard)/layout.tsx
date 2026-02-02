'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { env, ROUTES } from '@/config';
import { DashboardShell } from '@/components/shared/dashboard-shell';
import { Loader2 } from 'lucide-react';

/**
 * Layout para rutas protegidas del dashboard
 * Requiere autenticación (excepto si authBypass está activo)
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Auth bypass para desarrollo de UI
  const bypassAuth = env.authBypass;

  useEffect(() => {
    if (!bypassAuth && !isLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, router, bypassAuth]);

  // Si hay bypass, renderizar directamente
  if (bypassAuth) {
    return <DashboardShell>{children}</DashboardShell>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
