import { createApiService } from '@/lib/create-api-service';
import type { Admin, CreateAdminDTO, UpdateAdminDTO } from '../types';

/**
 * Servicio de API para administradores
 * Generado usando el factory de servicios CRUD
 */
export const adminService = createApiService<Admin, CreateAdminDTO, UpdateAdminDTO>({
  endpoint: '/admins',
  resourceName: 'administrador',
});

/**
 * Métodos adicionales específicos del servicio de admins
 */
export const adminServiceExtended = {
  ...adminService,
  
  /**
   * Cambiar estado de un administrador
   */
  async toggleStatus(id: string) {
    // TODO: Implementar cuando la API esté lista
    return adminService.update(id, { isActive: undefined } as any);
  },
  
  /**
   * Obtener estadísticas de administradores
   */
  async getStats() {
    // TODO: Implementar cuando la API esté lista
    return {
      total: 0,
      active: 0,
      inactive: 0,
    };
  },
};
