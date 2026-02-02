/**
 * Tipos de autenticación
 * Sincronizados con la API (AuthResponseDto)
 */

export type ActorType = 'ADMIN' | 'USER';

/**
 * Actor autenticado (respuesta de la API)
 */
export interface Actor {
  id: string;
  email: string;
  username: string;
  fullName: string;
  type: ActorType;
}

/**
 * Usuario para el estado local (extiende Actor con campos adicionales)
 */
export interface User extends Actor {
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  lastLogin?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Payload que se envía a la API
 */
export interface LoginPayload extends LoginCredentials {
  actorType: ActorType;
}

/**
 * Respuesta de login/register de la API
 */
export interface AuthResponse {
  actor: Actor;
  accessToken: string;
  refreshToken: string;
}

/**
 * Respuesta de refresh token
 */
export interface RefreshTokenResponse extends AuthResponse {}

/**
 * Respuesta de logout
 */
export interface LogoutResponse {
  message: string;
  sessionsInvalidated: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}
