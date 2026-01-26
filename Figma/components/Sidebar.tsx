import { ShieldCheck, ChevronRight, LogOut, Users, Package, MapPin, TrendingUp } from 'lucide-react';
import { cn } from './ui/utils';

export type NavigationView = 'admins' | 'operatives' | 'products' | 'locations' | 'prices';

interface SidebarProps {
  activeView: NavigationView;
  onNavigate: (view: NavigationView) => void;
  onLogout?: () => void;
  currentUserEmail?: string;
}

interface NavigationItem {
  id: NavigationView;
  label: string;
  icon: React.ReactNode;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

const navigationSections: NavigationSection[] = [
  {
    title: 'Administración',
    items: [
      {
        id: 'admins',
        label: 'Administradores',
        icon: <ShieldCheck className="h-5 w-5" />,
      },
      {
        id: 'operatives',
        label: 'Usuarios Operativos',
        icon: <Users className="h-5 w-5" />,
      },
    ],
  },
  {
    title: 'Catálogo',
    items: [
      {
        id: 'products',
        label: 'Productos',
        icon: <Package className="h-5 w-5" />,
      },
      {
        id: 'locations',
        label: 'Locales',
        icon: <MapPin className="h-5 w-5" />,
      },
    ],
  },
  {
    title: 'Relevamientos',
    items: [
      {
        id: 'prices',
        label: 'Visualización de Precios',
        icon: <TrendingUp className="h-5 w-5" />,
      },
    ],
  },
];

export function Sidebar({ activeView, onNavigate, onLogout, currentUserEmail }: SidebarProps) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center border-b border-border px-6">
        <h2 className="font-semibold text-foreground">Panel Administrativo</h2>
      </div>

      <nav className="flex-1 space-y-6 p-4">
        {navigationSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <h3 className="px-3 text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    activeView === item.id
                      ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                      : 'text-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {activeView === item.id && <ChevronRight className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        {onLogout && (
          <div className="space-y-2 pt-4">
            <button
              onClick={onLogout}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2 transition-colors',
                'text-destructive hover:bg-destructive/10 hover:text-destructive'
              )}
            >
              <LogOut className="h-5 w-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </nav>

      <div className="border-t border-border p-4">
        <div className="rounded-lg bg-muted/50 px-3 py-2">
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
            Sistema de Relevamiento de Precios
          </p>
        </div>
      </div>
    </aside>
  );
}