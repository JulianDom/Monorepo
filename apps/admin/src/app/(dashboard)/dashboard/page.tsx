'use client';

import { PageShell } from '@/components/shared/page-shell';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck, Users, Package, MapPin, DollarSign } from 'lucide-react';
import { useDashboardStats } from '@/features/dashboard';

function formatNumber(num: number): string {
  return num.toLocaleString('es-AR');
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  isLoading,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  isLoading?: boolean;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        {isLoading ? (
          <Skeleton className="h-9 w-20 mb-2" />
        ) : (
          <p className="text-3xl font-bold text-foreground mb-2">{value}</p>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  const statCards = [
    {
      title: 'Administradores',
      value: stats ? formatNumber(stats.admins.active) : '0',
      icon: ShieldCheck,
      description: stats
        ? `${formatNumber(stats.admins.active)} de ${formatNumber(stats.admins.total)} activos`
        : 'Cargando...',
    },
    {
      title: 'Usuarios Operativos',
      value: stats ? formatNumber(stats.operatives.active) : '0',
      icon: Users,
      description: stats
        ? `${formatNumber(stats.operatives.active)} de ${formatNumber(stats.operatives.total)} activos`
        : 'Cargando...',
    },
    {
      title: 'Productos',
      value: stats ? formatNumber(stats.products.total) : '0',
      icon: Package,
      description: stats
        ? `${formatNumber(stats.products.active)} activos en catálogo`
        : 'Cargando...',
    },
    {
      title: 'Locales',
      value: stats ? formatNumber(stats.stores.total) : '0',
      icon: MapPin,
      description: stats
        ? `${formatNumber(stats.stores.active)} puntos de venta activos`
        : 'Cargando...',
    },
    {
      title: 'Precios Registrados',
      value: stats ? formatNumber(stats.priceRecords.total) : '0',
      icon: DollarSign,
      description: 'Total de registros',
    },
  ];

  return (
    <PageShell
      title="Dashboard"
      description="Resumen general del sistema"
    >
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            description={stat.description}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Welcome Message */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Bienvenido al Sistema de Relevamiento de Precios
        </h2>
        <p className="text-muted-foreground mb-4">
          Utiliza el menú lateral para navegar entre las diferentes secciones del sistema.
        </p>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border p-4">
            <h3 className="font-medium text-foreground mb-1">Administradores</h3>
            <p className="text-sm text-muted-foreground">
              Gestiona los administradores del sistema
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <h3 className="font-medium text-foreground mb-1">Usuarios Operativos</h3>
            <p className="text-sm text-muted-foreground">
              Administra los usuarios que relevan precios
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <h3 className="font-medium text-foreground mb-1">Productos</h3>
            <p className="text-sm text-muted-foreground">
              Mantén actualizado el catálogo de productos
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <h3 className="font-medium text-foreground mb-1">Locales</h3>
            <p className="text-sm text-muted-foreground">
              Gestiona los puntos de venta físicos
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <h3 className="font-medium text-foreground mb-1">Precios</h3>
            <p className="text-sm text-muted-foreground">
              Visualiza y consulta precios registrados
            </p>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}
