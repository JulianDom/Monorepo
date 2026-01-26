import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  VerifiedRegistrationResponse,
  VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from '@simplewebauthn/server';
import { IUserRepository, USER_REPOSITORY } from '@core/application/ports/repositories';
import { BiometricCredential } from '@shared/types';
import { EntityNotFoundException, BusinessValidationException } from '@shared/exceptions';

/**
 * BiometricService
 *
 * Servicio para gestión de autenticación biométrica (Passkeys/WebAuthn).
 * Implementa SimpleWebAuthn v13 para registro y verificación de credenciales.
 *
 * Usa IUserRepository (puerto) en lugar de PrismaService directamente.
 * Esto garantiza Clean Architecture - la infraestructura no conoce detalles de BD.
 *
 * Flujo de Registro:
 * 1. generateRegistrationOptions() - Genera challenge
 * 2. Frontend solicita credencial al usuario
 * 3. verifyRegistration() - Verifica y guarda credencial
 *
 * Flujo de Autenticación:
 * 1. generateAuthenticationOptions() - Genera challenge
 * 2. Frontend solicita verificación al usuario
 * 3. verifyAuthentication() - Verifica credencial
 *
 * @see https://simplewebauthn.dev/docs/packages/server
 */
@Injectable()
export class BiometricService {
  private readonly rpName: string;
  private readonly rpID: string;
  private readonly origin: string;

  constructor(
    private readonly configService: ConfigService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {
    this.rpName = this.configService.get<string>('WEBAUTHN_RP_NAME', 'Cervak Framework');
    this.rpID = this.configService.get<string>('WEBAUTHN_RP_ID', 'localhost');
    this.origin = this.configService.get<string>('WEBAUTHN_ORIGIN', 'http://localhost:3000');
  }

  /**
   * Genera opciones para registro de nueva credencial biométrica
   */
  async generateRegistrationOptions(
    userId: string,
    username: string,
    existingCredentials: BiometricCredential[] = [],
  ): Promise<{ options: PublicKeyCredentialCreationOptionsJSON; challenge: string }> {
    const options = await generateRegistrationOptions({
      rpName: this.rpName,
      rpID: this.rpID,
      userName: username,
      userDisplayName: username,
      // No incluir attestation para simplificar
      attestationType: 'none',
      // Excluir credenciales ya registradas
      excludeCredentials: existingCredentials.map((cred) => ({
        id: cred.credentialId,
        transports: cred.transports as AuthenticatorTransportFuture[],
      })),
      // Preferencias del autenticador
      authenticatorSelection: {
        // Preferir passkeys sincronizadas
        residentKey: 'preferred',
        userVerification: 'preferred',
        // Permitir cualquier tipo de autenticador
        authenticatorAttachment: undefined,
      },
      // Timeout de 5 minutos
      timeout: 300000,
    });

    // Guardar challenge usando el repositorio
    await this.userRepository.updateBiometricChallenge(userId, options.challenge);

    return {
      options,
      challenge: options.challenge,
    };
  }

  /**
   * Verifica la respuesta de registro y guarda la credencial
   */
  async verifyRegistration(
    userId: string,
    response: RegistrationResponseJSON,
  ): Promise<{ verified: boolean; credential?: BiometricCredential }> {
    // Obtener datos biométricos del usuario
    const biometricData = await this.userRepository.getBiometricData(userId);

    if (!biometricData?.biometricChallenge) {
      throw new BusinessValidationException('No registration challenge found. Start registration first.');
    }

    let verification: VerifiedRegistrationResponse;
    try {
      verification = await verifyRegistrationResponse({
        response,
        expectedChallenge: biometricData.biometricChallenge,
        expectedOrigin: this.origin,
        expectedRPID: this.rpID,
        requireUserVerification: false, // Passkeys no requieren UV estricto
      });
    } catch (error) {
      throw new BusinessValidationException(`Verification failed: ${(error as Error).message}`);
    }

    if (!verification.verified || !verification.registrationInfo) {
      return { verified: false };
    }

    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

    // Crear objeto de credencial para guardar
    const biometricCredential: BiometricCredential = {
      credentialId: credential.id,
      credentialPublicKey: Buffer.from(credential.publicKey).toString('base64'),
      counter: credential.counter,
      credentialDeviceType,
      credentialBackedUp,
      transports: response.response.transports as BiometricCredential['transports'],
    };

    // Obtener credenciales existentes o crear array vacío
    const existingCredentials = (biometricData.registrationInfo as BiometricCredential[] | null) || [];

    // Guardar credencial y limpiar challenge
    await this.userRepository.updateBiometricData(userId, {
      challenge: null,
      registrationInfo: [...existingCredentials, biometricCredential],
    });

    return { verified: true, credential: biometricCredential };
  }

  /**
   * Genera opciones para autenticación biométrica
   */
  async generateAuthenticationOptions(
    userId: string,
  ): Promise<{ options: PublicKeyCredentialRequestOptionsJSON; challenge: string }> {
    // Obtener credenciales del usuario
    const biometricData = await this.userRepository.getBiometricData(userId);

    if (!biometricData) {
      throw new EntityNotFoundException('User', userId);
    }

    const credentials = (biometricData.registrationInfo as BiometricCredential[] | null) || [];

    if (credentials.length === 0) {
      throw new BusinessValidationException('No biometric credentials registered');
    }

    const options = await generateAuthenticationOptions({
      rpID: this.rpID,
      allowCredentials: credentials.map((cred) => ({
        id: cred.credentialId,
        transports: cred.transports as AuthenticatorTransportFuture[],
      })),
      userVerification: 'preferred',
      timeout: 300000,
    });

    // Guardar challenge
    await this.userRepository.updateBiometricChallenge(userId, options.challenge);

    return {
      options,
      challenge: options.challenge,
    };
  }

  /**
   * Verifica la respuesta de autenticación
   */
  async verifyAuthentication(
    userId: string,
    response: AuthenticationResponseJSON,
  ): Promise<{ verified: boolean; credentialId?: string }> {
    // Obtener datos del usuario
    const biometricData = await this.userRepository.getBiometricData(userId);

    if (!biometricData?.biometricChallenge) {
      throw new BusinessValidationException('No authentication challenge found');
    }

    const credentials = (biometricData.registrationInfo as BiometricCredential[] | null) || [];

    // Buscar la credencial usada
    const credential = credentials.find((c) => c.credentialId === response.id);

    if (!credential) {
      throw new EntityNotFoundException('Credential', response.id);
    }

    let verification: VerifiedAuthenticationResponse;
    try {
      verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge: biometricData.biometricChallenge,
        expectedOrigin: this.origin,
        expectedRPID: this.rpID,
        credential: {
          id: credential.credentialId,
          publicKey: new Uint8Array(Buffer.from(credential.credentialPublicKey, 'base64')),
          counter: credential.counter,
          transports: credential.transports as AuthenticatorTransportFuture[],
        },
        requireUserVerification: false,
      });
    } catch (error) {
      throw new BusinessValidationException(`Authentication failed: ${(error as Error).message}`);
    }

    if (!verification.verified) {
      return { verified: false };
    }

    // Actualizar contador para prevenir replay attacks
    const updatedCredentials = credentials.map((c) => {
      if (c.credentialId === credential.credentialId) {
        return { ...c, counter: verification.authenticationInfo.newCounter };
      }
      return c;
    });

    // Limpiar challenge y actualizar contador
    await this.userRepository.updateBiometricData(userId, {
      challenge: null,
      registrationInfo: updatedCredentials,
    });

    return { verified: true, credentialId: credential.credentialId };
  }

  /**
   * Obtiene las credenciales biométricas de un usuario
   */
  async getUserCredentials(userId: string): Promise<BiometricCredential[]> {
    const biometricData = await this.userRepository.getBiometricData(userId);
    return (biometricData?.registrationInfo as BiometricCredential[] | null) || [];
  }

  /**
   * Elimina una credencial biométrica
   */
  async removeCredential(userId: string, credentialId: string): Promise<void> {
    const biometricData = await this.userRepository.getBiometricData(userId);
    const credentials = (biometricData?.registrationInfo as BiometricCredential[] | null) || [];
    const updatedCredentials = credentials.filter((c) => c.credentialId !== credentialId);

    await this.userRepository.updateRegistrationInfo(userId, updatedCredentials);
  }
}
