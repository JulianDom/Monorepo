import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MercadoPagoService } from './payments';
import { MapsService } from './maps';
import { FileService } from './files';

/**
 * ProvidersModule
 *
 * Módulo global que exporta todos los servicios de proveedores externos.
 * Disponible en toda la aplicación sin necesidad de importar.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [MercadoPagoService, MapsService, FileService],
  exports: [MercadoPagoService, MapsService, FileService],
})
export class ProvidersModule {}
