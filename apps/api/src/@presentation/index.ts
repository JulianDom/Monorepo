/**
 * @presentation - Presentation Layer
 *
 * Esta capa contiene todo lo relacionado con la interfaz de la aplicación:
 * - Controllers (REST endpoints)
 * - DTOs de entrada/salida para la API
 * - Middlewares
 * - Guards (autenticación/autorización)
 * - Interceptors
 * - Pipes (validación)
 * - Exception Filters
 * - Decorators personalizados
 *
 * Esta capa depende de @core para ejecutar casos de uso.
 */

export * from './controllers';
export * from './dto';
export * from './middlewares';
export * from './guards';
export * from './interceptors';
export * from './pipes';
export * from './filters';
export * from './decorators';
