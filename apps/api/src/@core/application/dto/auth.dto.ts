import { ActorType, TokenPair } from '@shared/types';

/**
 * DTOs de Auth para la capa de aplicación
 */

// ==================== Login ====================

export interface LoginInput {
  email: string;
  password: string;
  actorType: ActorType;
}

export interface LoginOutput {
  actor: {
    id: string;
    email: string;
    username: string;
    fullName: string;
    type: ActorType;
  };
  tokens: TokenPair;
}

// ==================== Register User ====================

export interface RegisterUserInput {
  fullName: string;
  email: string;
  username: string;
  password: string;
  language?: string;
}

// ==================== Register Admin ====================

export interface RegisterAdminInput {
  fullName: string;
  email: string;
  username: string;
  password: string;
}

// ==================== Register Output ====================

export interface RegisterOutput {
  actor: {
    id: string;
    email: string;
    username: string;
    fullName: string;
    type: ActorType;
  };
  tokens: TokenPair;
}

// ==================== Refresh Token ====================

export interface RefreshTokenInput {
  refreshToken: string;
  actorType?: ActorType;
}

export interface RefreshTokenOutput {
  actor: {
    id: string;
    email: string;
    username: string;
    fullName: string;
    type: ActorType;
  };
  tokens: TokenPair;
}

// ==================== Logout ====================

export interface LogoutInput {
  userId: string;
  actorType: ActorType;
  allSessions?: boolean;
}

export interface LogoutOutput {
  message: string;
  sessionsInvalidated: number;
}
