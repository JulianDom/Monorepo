import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { DomainException } from '@common/exceptions';
import { ApiErrorResponse } from '@common/types';
import { ERROR_CODES } from '@common/constants';

// Extender tipos de Express para TypeScript 5 / Express 5
interface TypedRequest extends Request {
  method: string;
  url: string;
  body: Record<string, unknown>;
  headers: Record<string, string | string[] | undefined>;
  ip: string;
}

interface TypedResponse extends Response {
  status(code: number): this;
  json(body: unknown): this;
}

/**
 * GlobalExceptionFilter
 *
 * Filtro global para capturar y transformar excepciones en respuestas estandarizadas.
 *
 * Maneja:
 * - Errores de Prisma (duplicados, no encontrados, etc.)
 * - Excepciones de dominio
 * - Excepciones HTTP de NestJS
 * - Errores no controlados
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<TypedResponse>();
    const request = ctx.getRequest<TypedRequest>();

    const errorResponse = this.buildErrorResponse(exception, request.url);

    // Log del error
    this.logError(exception, request);

    response.status(errorResponse.status).json(errorResponse.body);
  }

  private buildErrorResponse(
    exception: unknown,
    path: string,
  ): { status: number; body: ApiErrorResponse } {
    // Errores de Prisma
    if (this.isPrismaError(exception)) {
      return this.handlePrismaError(exception, path);
    }

    // Excepciones de dominio (cast to unknown to reset type narrowing)
    const exc = exception as unknown;
    if (exc instanceof DomainException) {
      return this.handleDomainException(exc, path);
    }

    // Excepciones HTTP de NestJS
    if (exc instanceof HttpException) {
      return this.handleHttpException(exc, path);
    }

    // Error no controlado
    return this.handleUnknownError(exception, path);
  }

  private handlePrismaError(
    exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError,
    path: string,
  ): { status: number; body: ApiErrorResponse } {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaKnownError(exception, path);
    }

    return {
      status: HttpStatus.BAD_REQUEST,
      body: {
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid data provided',
          details: { originalError: exception.message },
        },
        timestamp: new Date().toISOString(),
        path,
      },
    };
  }

  private handlePrismaKnownError(
    exception: Prisma.PrismaClientKnownRequestError,
    path: string,
  ): { status: number; body: ApiErrorResponse } {
    const { code, meta } = exception;

    switch (code) {
      case 'P2002': {
        const target = (meta?.['target'] as string[]) || ['field'];
        return {
          status: HttpStatus.CONFLICT,
          body: {
            success: false,
            error: {
              code: ERROR_CODES.ENTITY_DUPLICATED,
              message: `A record with this ${target.join(', ')} already exists`,
              details: { fields: target },
            },
            timestamp: new Date().toISOString(),
            path,
          },
        };
      }

      case 'P2025': {
        return {
          status: HttpStatus.NOT_FOUND,
          body: {
            success: false,
            error: {
              code: ERROR_CODES.ENTITY_NOT_FOUND,
              message: 'Record not found',
              details: meta as Record<string, unknown>,
            },
            timestamp: new Date().toISOString(),
            path,
          },
        };
      }

      case 'P2003': {
        const fieldName = (meta?.['field_name'] as string) || 'related record';
        return {
          status: HttpStatus.BAD_REQUEST,
          body: {
            success: false,
            error: {
              code: ERROR_CODES.DATABASE_CONSTRAINT_ERROR,
              message: `Related ${fieldName} does not exist`,
              details: { field: fieldName },
            },
            timestamp: new Date().toISOString(),
            path,
          },
        };
      }

      case 'P2011': {
        const constraint = (meta?.['constraint'] as string) || 'field';
        return {
          status: HttpStatus.BAD_REQUEST,
          body: {
            success: false,
            error: {
              code: ERROR_CODES.VALIDATION_ERROR,
              message: `Required field '${constraint}' is missing`,
              details: { field: constraint },
            },
            timestamp: new Date().toISOString(),
            path,
          },
        };
      }

      default: {
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          body: {
            success: false,
            error: {
              code: ERROR_CODES.DATABASE_ERROR,
              message: 'A database error occurred',
              details: { prismaCode: code },
            },
            timestamp: new Date().toISOString(),
            path,
          },
        };
      }
    }
  }

  private handleDomainException(
    exception: DomainException,
    path: string,
  ): { status: number; body: ApiErrorResponse } {
    return {
      status: exception.httpStatus,
      body: {
        success: false,
        error: {
          code: exception.code,
          message: exception.message,
          details: exception.details,
        },
        timestamp: new Date().toISOString(),
        path,
      },
    };
  }

  private handleHttpException(
    exception: HttpException,
    path: string,
  ): { status: number; body: ApiErrorResponse } {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string;
    let details: Record<string, unknown> | undefined;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object') {
      const response = exceptionResponse as Record<string, unknown>;
      message = (response['message'] as string) || exception.message;

      if (Array.isArray(response['message'])) {
        details = { errors: response['message'] };
        message = 'Validation failed';
      }
    } else {
      message = exception.message;
    }

    return {
      status,
      body: {
        success: false,
        error: {
          code: this.getErrorCodeFromStatus(status),
          message,
          details,
        },
        timestamp: new Date().toISOString(),
        path,
      },
    };
  }

  private handleUnknownError(
    exception: unknown,
    path: string,
  ): { status: number; body: ApiErrorResponse } {
    const message =
      process.env['NODE_ENV'] === 'production'
        ? 'An unexpected error occurred'
        : exception instanceof Error
          ? exception.message
          : 'Unknown error';

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message,
        },
        timestamp: new Date().toISOString(),
        path,
      },
    };
  }

  private isPrismaError(
    exception: unknown,
  ): exception is Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError {
    return (
      exception instanceof Prisma.PrismaClientKnownRequestError ||
      exception instanceof Prisma.PrismaClientValidationError
    );
  }

  private getErrorCodeFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ERROR_CODES.VALIDATION_ERROR;
      case HttpStatus.UNAUTHORIZED:
        return ERROR_CODES.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ERROR_CODES.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ERROR_CODES.ENTITY_NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ERROR_CODES.ENTITY_DUPLICATED;
      default:
        return ERROR_CODES.INTERNAL_ERROR;
    }
  }

  private logError(exception: unknown, request: TypedRequest): void {
    const { method, url, body, headers } = request;

    const logData = {
      method,
      url,
      body: this.sanitizeBody(body),
      userAgent: headers['user-agent'],
      ip: request.ip,
    };

    if (exception instanceof HttpException) {
      if (exception.getStatus() >= 500) {
        this.logger.error(
          `[${method}] ${url} - ${exception.message}`,
          exception.stack,
          JSON.stringify(logData),
        );
      } else {
        this.logger.warn(`[${method}] ${url} - ${exception.message}`, JSON.stringify(logData));
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `[${method}] ${url} - ${exception.message}`,
        exception.stack,
        JSON.stringify(logData),
      );
    } else {
      this.logger.error(`[${method}] ${url} - Unknown error`, JSON.stringify(logData));
    }
  }

  private sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
    if (!body || typeof body !== 'object') return body;

    const sensitiveFields = ['password', 'token', 'refreshToken', 'accessToken', 'secret'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
