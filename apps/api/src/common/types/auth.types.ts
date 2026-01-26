/**
 * Tipos para Autenticacion
 */

export enum ActorType {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface JwtPayload {
  sub: string; // ID del usuario/admin
  email: string;
  username: string;
  type: ActorType;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthenticatedActor {
  id: string;
  email: string;
  username: string;
  type: ActorType;
}

export interface BiometricCredential {
  credentialId: string;
  credentialPublicKey: string;
  counter: number;
  credentialDeviceType: 'singleDevice' | 'multiDevice';
  credentialBackedUp: boolean;
  transports?: AuthenticatorTransport[];
}

export type AuthenticatorTransport =
  | 'ble'
  | 'cable'
  | 'hybrid'
  | 'internal'
  | 'nfc'
  | 'smart-card'
  | 'usb';
