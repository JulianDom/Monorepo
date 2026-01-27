'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { env, ROUTES } from '@/config';
import type { User, LoginCredentials, AuthContextValue } from '@/types/auth.types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Provider de autenticación
 * Maneja el estado de autenticación y persistencia en localStorage
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario desde localStorage al montar
  useEffect(() => {
    const storedToken = localStorage.getItem(env.authTokenKey);
    const storedUser = localStorage.getItem(env.authUserKey);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        // Asegurar que la cookie esté sincronizada
        document.cookie = `access_token=${storedToken}; path=/; max-age=2592000; samesite=lax`;
      } catch (error) {
        // Si hay error al parsear, limpiar
        localStorage.removeItem(env.authTokenKey);
        localStorage.removeItem(env.authUserKey);
        document.cookie = 'access_token=; path=/; max-age=0';
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      // TODO: Reemplazar con llamada real a la API
      // const response = await apiClient.post('/auth/login', credentials);

      // Mock de login
      const mockUser: User = {
        id: '1',
        name: 'Administrador',
        email: credentials.email,
        role: 'Administrador General',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      const mockToken = 'mock-jwt-token';

      // Guardar en localStorage
      localStorage.setItem(env.authTokenKey, mockToken);
      localStorage.setItem(env.authUserKey, JSON.stringify(mockUser));

      // Guardar token en cookie para el middleware
      document.cookie = `access_token=${mockToken}; path=/; max-age=2592000; samesite=lax`;

      // Actualizar estado
      setToken(mockToken);
      setUser(mockUser);

      // Redirigir al dashboard
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // Limpiar localStorage
    localStorage.removeItem(env.authTokenKey);
    localStorage.removeItem(env.authUserKey);

    // Limpiar cookie
    document.cookie = 'access_token=; path=/; max-age=0';

    // Limpiar estado
    setToken(null);
    setUser(null);

    // Redirigir al login
    router.push(ROUTES.LOGIN);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem(env.authUserKey, JSON.stringify(updatedUser));
  };

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para acceder al contexto de autenticación
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  
  return context;
}
