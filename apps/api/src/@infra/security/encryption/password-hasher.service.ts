import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IPasswordHasherService } from '@core/application/ports/services';

/**
 * PasswordHasherService
 *
 * Implementación del puerto IPasswordHasherService.
 * Usa bcrypt para hashear y comparar passwords.
 */
@Injectable()
export class PasswordHasherService implements IPasswordHasherService {
  private readonly saltRounds = 12;

  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, this.saltRounds);
  }

  async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
