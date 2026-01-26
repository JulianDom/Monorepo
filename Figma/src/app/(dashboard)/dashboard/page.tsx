import { PageShell } from '@/components/shared/page-shell';
import { Card } from '@/components/ui/card';
import { ShieldCheck, Users, Package, MapPin, DollarSign, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    {
      title: 'Administradores',
      value: '12',
      icon: ShieldCheck,
      description: 'Activos en el sistema',
      trend: '+2 este mes',
    },
    {
      title: 'Usuarios Operativos',
      value: '45',
      icon: Users,
      description: 'Usuarios activos',
      trend: '+5 este mes',
    },
    {
      title: 'Productos',
      value: '1,234',
      icon: Package,
      description: 'En catálogo',
      trend: '+123 este mes',
    },
    {
      title: 'Locales',
      value: '89',
      icon: MapPin,
      description: 'Puntos de venta',
      trend: '+3 este mes',
    },
    {
      title: 'Precios Registrados',
      value: '15,678',
      icon: DollarSign,
      description: 'Total de registros',
      trend: '+1,234 este mes',
    },
  ];

  return (
    <PageShell
      title="Dashboard"
      description="Resumen general del sistema"
    >
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground mb-2">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.trend}
                </p>
              </div>
            </Card>
          );
        })}
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
