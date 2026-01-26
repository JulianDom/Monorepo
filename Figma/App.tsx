import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { AdminManagement } from './components/AdminManagement';
import { OperativeManagement } from './components/OperativeManagement';
import { ProductManagement } from './components/ProductManagement';
import { LocationManagement } from './components/LocationManagement';
import { PriceVisualization } from './components/PriceVisualization';
import { Sidebar, NavigationView } from './components/Sidebar';
import { MobileSidebar } from './components/MobileSidebar';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';

// Mock admin user for authentication
const MOCK_ADMIN = {
  email: 'admin@empresa.com',
  password: 'admin123',
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null);
  const [activeView, setActiveView] = useState<NavigationView>('admins');

  const handleLogin = (email: string, password: string) => {
    if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
      setIsAuthenticated(true);
      setCurrentUser({ email });
      toast.success('Bienvenido', {
        description: 'Has iniciado sesión correctamente.',
      });
      return true;
    } else {
      toast.error('Error de autenticación', {
        description: 'Credenciales incorrectas.',
      });
      return false;
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveView('admins');
    toast.info('Sesión cerrada', {
      description: 'Has cerrado sesión correctamente.',
    });
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            activeView={activeView}
            onNavigate={setActiveView}
            onLogout={handleLogout}
            currentUserEmail={currentUser?.email}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col h-full overflow-hidden">
          {/* Mobile Sidebar */}
          <MobileSidebar 
            activeView={activeView} 
            onNavigate={setActiveView}
            onLogout={handleLogout}
            currentUserEmail={currentUser?.email}
          />

          {/* Main Content with Scroll */}
          <main className="flex-1 overflow-y-auto lg:h-screen px-4 py-6 md:px-6 md:py-8 lg:px-8">
            <div className="mx-auto max-w-7xl">
              {activeView === 'admins' && (
                <AdminManagement 
                  onForceLogout={(adminId) => {
                    // Force logout if the disabled admin is the current user
                    // In a real app, you would check if adminId matches currentUser.id
                    toast.warning('Sesión cerrada', {
                      description: 'Tu cuenta ha sido deshabilitada.',
                    });
                  }}
                />
              )}
              {activeView === 'operatives' && (
                <OperativeManagement />
              )}
              {activeView === 'products' && (
                <ProductManagement />
              )}
              {activeView === 'locations' && (
                <LocationManagement />
              )}
              {activeView === 'prices' && (
                <PriceVisualization />
              )}
            </div>
          </main>
        </div>
      </div>

      <Toaster position="top-right" />
    </>
  );
}

export default App;