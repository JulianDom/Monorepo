/**
 * EJEMPLO: Servicio de usuarios
 * Este archivo muestra cómo crear un servicio usando el factory
 */

import { createApiService } from '@/lib/create-api-service';

// Tipos de la entidad
export interface User {
  id: string;
  fullName: string;
  emailAddress: string;
  username: string;
  online: boolean;
  createdAt: string;
}

export interface CreateUserDto {
  fullName: string;
  emailAddress: string;
  username: string;
  password: string;
}

export interface UpdateUserDto {
  fullName?: string;
  language?: string;
}

// Crear servicio con una línea
export const userService = createApiService<User, CreateUserDto, UpdateUserDto>(
  '/users'
);
