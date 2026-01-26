'use client';

import { Users, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { useAuth } from '@/providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCard {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  trend?: string;
}

const stats: StatCard[] = [
  {
    title: 'Usuarios Totales',
    value: '2,350',
    description: '+180 este mes',
    icon: Users,
    trend: '+12.5%',
  },
  {
    title: 'Ventas',
    value: '1,234',
    description: '+19 hoy',
    icon: ShoppingCart,
    trend: '+8.2%',
  },
  {
    title: 'Ingresos',
    value: '$45,231',
    description: '+20.1% vs mes anterior',
    icon: DollarSign,
    trend: '+20.1%',
  },
  {
    title: 'Crecimiento',
    value: '+573',
    description: 'Nuevos usuarios activos',
    icon: TrendingUp,
    trend: '+4.3%',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido de vuelta, {user?.fullName || 'Administrador'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content Placeholder */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Gráfico de resumen (próximamente)
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Usuario #{i} se registró
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Hace {i * 5} minutos
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
