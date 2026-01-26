/**
 * @infra - Infrastructure Layer
 *
 * Esta capa contiene las implementaciones concretas:
 * - Implementaciones de repositorios (Prisma)
 * - Servicios externos (MercadoPago, Google Maps, Firebase)
 * - Colas (BullMQ)
 * - Cache (Redis)
 * - WebSockets (Socket.IO)
 * - Seguridad (Passport, JWT, Bcrypt, WebAuthn)
 *
 * Esta capa IMPLEMENTA los puertos definidos en @core/application/ports
 */

export * from './database';
export * from './external-services';
export * from './queues';
export * from './cache';
export * from './security';
export * from './websockets';
