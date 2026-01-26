/**
 * Tipos del módulo de administradores
 */

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface CreateAdminDTO {
  name: string;
  email: string;
  role: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateAdminDTO {
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  password?: string;
  confirmPassword?: string;
}

export type AdminFilterStatus = 'all' | 'active' | 'inactive';
