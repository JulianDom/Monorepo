/**
 * Tipos relacionados con autenticación
 * Sincronizados con la API (@core/application/dto/auth.dto.ts)
 */

/**
 * Tipos de actor en el sistema
 */
export type ActorType = 'ADMIN' | 'USER';

/**
 * Usuario/Actor autenticado
 */
export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  type: ActorType;
  permissions?: string[];
}

/**
 * Tokens de autenticación
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Credenciales de login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Input para el endpoint de login
 */
export interface LoginInput {
  email: string;
  password: string;
  actorType: ActorType;
}

/**
 * Respuesta del endpoint de login
 */
export interface LoginResponse {
  actor: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Input para refresh token
 */
export interface RefreshTokenInput {
  refreshToken: string;
}

/**
 * Respuesta del endpoint de refresh
 */
export interface RefreshTokenResponse {
  actor: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Estado de autenticación en el cliente
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
