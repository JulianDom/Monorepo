import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import * as crypto from 'crypto';
import {
  CreatePreferenceDto,
  PreferenceResponse,
  WebhookPayload,
  PaymentInfo,
  PaymentStatus,
} from '@shared/types';

/**
 * MercadoPagoService
 *
 * Servicio para integración con Mercado Pago SDK v2.
 * Maneja creación de preferencias de pago y procesamiento de webhooks.
 *
 * @see https://www.mercadopago.com.ar/developers/es/docs
 */
@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private readonly client: MercadoPagoConfig;
  private readonly preference: Preference;
  private readonly payment: Payment;
  private readonly webhookSecret: string;
  private readonly isProduction: boolean;

  constructor(private readonly configService: ConfigService) {
    const accessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN');
    this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    if (!accessToken) {
      this.logger.warn('MERCADOPAGO_ACCESS_TOKEN not configured');
    }

    this.client = new MercadoPagoConfig({
      accessToken: accessToken || '',
      options: {
        timeout: 5000,
      },
    });

    this.preference = new Preference(this.client);
    this.payment = new Payment(this.client);
    this.webhookSecret = this.configService.get<string>('MERCADOPAGO_WEBHOOK_SECRET', '');

    // SECURITY: Webhook secret is required in production
    if (this.isProduction && !this.webhookSecret) {
      throw new Error(
        'CRITICAL: MERCADOPAGO_WEBHOOK_SECRET is required in production. ' +
          'Webhooks without signature verification can lead to payment fraud.',
      );
    }
  }

  /**
   * Crear preferencia de pago
   */
  async createPreference(dto: CreatePreferenceDto): Promise<PreferenceResponse> {
    try {
      this.logger.debug(`Creating preference for external_reference: ${dto.externalReference}`);

      const notificationUrl =
        dto.notificationUrl ||
        this.configService.get<string>('MERCADOPAGO_WEBHOOK_URL', 'http://localhost:3000/api/webhooks/mercadopago');

      const response = await this.preference.create({
        body: {
          items: dto.items.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            picture_url: item.pictureUrl,
            category_id: item.categoryId,
            quantity: item.quantity,
            currency_id: item.currencyId || 'ARS',
            unit_price: item.unitPrice,
          })),
          payer: dto.payer
            ? {
                name: dto.payer.name,
                surname: dto.payer.surname,
                email: dto.payer.email,
                phone: dto.payer.phone
                  ? {
                      area_code: dto.payer.phone.areaCode,
                      number: dto.payer.phone.number,
                    }
                  : undefined,
                identification: dto.payer.identification
                  ? {
                      type: dto.payer.identification.type,
                      number: dto.payer.identification.number,
                    }
                  : undefined,
                address: dto.payer.address
                  ? {
                      zip_code: dto.payer.address.zipCode,
                      street_name: dto.payer.address.streetName,
                      street_number: dto.payer.address.streetNumber?.toString(),
                    }
                  : undefined,
              }
            : undefined,
          external_reference: dto.externalReference,
          notification_url: notificationUrl,
          back_urls: dto.backUrls
            ? {
                success: dto.backUrls.success,
                failure: dto.backUrls.failure,
                pending: dto.backUrls.pending,
              }
            : undefined,
          auto_return: dto.autoReturn,
          statement_descriptor: dto.statementDescriptor,
          expires: dto.expires,
          expiration_date_from: dto.expirationDateFrom,
          expiration_date_to: dto.expirationDateTo,
          metadata: dto.metadata,
        },
      });

      this.logger.log(`Preference created: ${response.id}`);

      return {
        id: response.id!,
        initPoint: response.init_point!,
        sandboxInitPoint: response.sandbox_init_point!,
        externalReference: response.external_reference!,
        dateCreated: response.date_created!,
      };
    } catch (error) {
      this.logger.error(`Failed to create preference: ${(error as Error).message}`);
      throw new InternalServerErrorException('Failed to create payment preference');
    }
  }

  /**
   * Obtener información de un pago
   */
  async getPayment(paymentId: string): Promise<PaymentInfo> {
    try {
      this.logger.debug(`Getting payment info: ${paymentId}`);

      const response = await this.payment.get({ id: paymentId });

      return {
        id: response.id!,
        status: response.status as PaymentStatus,
        statusDetail: response.status_detail || '',
        externalReference: response.external_reference || '',
        transactionAmount: response.transaction_amount || 0,
        currencyId: response.currency_id || 'ARS',
        paymentMethodId: response.payment_method_id || '',
        paymentTypeId: response.payment_type_id || '',
        dateApproved: response.date_approved || undefined,
        dateCreated: response.date_created || '',
        payer: {
          id: typeof response.payer?.id === 'string' ? parseInt(response.payer.id, 10) : response.payer?.id,
          email: response.payer?.email,
          identification: response.payer?.identification
            ? {
                type: response.payer.identification.type || '',
                number: response.payer.identification.number || '',
              }
            : undefined,
        },
        metadata: response.metadata,
      };
    } catch (error) {
      this.logger.error(`Failed to get payment: ${(error as Error).message}`);
      throw new BadRequestException('Failed to retrieve payment information');
    }
  }

  /**
   * Procesar webhook de Mercado Pago
   */
  async handleWebhook(payload: WebhookPayload): Promise<PaymentInfo | null> {
    this.logger.debug(`Received webhook: ${payload.type} - ${payload.action}`);

    // Solo procesar notificaciones de pago
    if (payload.type !== 'payment') {
      this.logger.debug(`Ignoring webhook type: ${payload.type}`);
      return null;
    }

    // Obtener información del pago
    const paymentInfo = await this.getPayment(payload.data.id);

    this.logger.log(
      `Payment ${paymentInfo.id} status: ${paymentInfo.status} (${paymentInfo.externalReference})`,
    );

    return paymentInfo;
  }

  /**
   * Verificar firma del webhook (HMAC)
   *
   * SECURITY:
   * - En producción: Siempre verifica la firma (el secret ya se validó en constructor)
   * - En desarrollo: Si no hay secret, permite con warning (para testing local)
   */
  verifyWebhookSignature(
    xSignature: string,
    xRequestId: string,
    dataId: string,
  ): boolean {
    // En desarrollo sin secret, permitir con warning
    if (!this.webhookSecret) {
      if (!this.isProduction) {
        this.logger.warn(
          '⚠️ DEVELOPMENT MODE: Webhook signature verification skipped. ' +
            'Configure MERCADOPAGO_WEBHOOK_SECRET for production.',
        );
        return true;
      }
      // En producción esto no debería pasar (validado en constructor)
      this.logger.error('Webhook secret not configured in production - this should not happen');
      return false;
    }

    try {
      // Validar que los headers requeridos estén presentes
      if (!xSignature || !xRequestId || !dataId) {
        this.logger.warn('Webhook rejected: Missing required headers (x-signature, x-request-id, or data.id)');
        return false;
      }

      // Parsear x-signature header
      const parts = xSignature.split(',');
      const signatureParts: Record<string, string> = {};

      parts.forEach((part) => {
        const [key, value] = part.split('=');
        if (key && value) {
          signatureParts[key.trim()] = value.trim();
        }
      });

      const ts = signatureParts['ts'];
      const v1 = signatureParts['v1'];

      if (!ts || !v1) {
        this.logger.warn('Webhook rejected: Invalid x-signature format (missing ts or v1)');
        return false;
      }

      // Construir manifest según documentación de MercadoPago
      const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

      // Calcular HMAC-SHA256
      const hmac = crypto.createHmac('sha256', this.webhookSecret);
      hmac.update(manifest);
      const calculatedSignature = hmac.digest('hex');

      // Comparación de tiempo constante para prevenir timing attacks
      const isValid = crypto.timingSafeEqual(
        Buffer.from(calculatedSignature, 'hex'),
        Buffer.from(v1, 'hex'),
      );

      if (!isValid) {
        this.logger.warn(`Webhook rejected: Signature mismatch for request ${xRequestId}`);
      }

      return isValid;
    } catch (error) {
      this.logger.error(`Webhook signature verification failed: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Reembolsar un pago
   */
  async refundPayment(paymentId: string, amount?: number): Promise<void> {
    try {
      this.logger.debug(`Refunding payment: ${paymentId}${amount ? ` (partial: ${amount})` : ''}`);

      // El SDK v2 no tiene método de refund directo, usar API REST
      const fetch = (await import('node-fetch')).default;
      const accessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN');

      const body = amount ? { amount } : {};

      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}/refunds`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(JSON.stringify(error));
      }

      this.logger.log(`Payment ${paymentId} refunded successfully`);
    } catch (error) {
      this.logger.error(`Failed to refund payment: ${(error as Error).message}`);
      throw new BadRequestException('Failed to refund payment');
    }
  }
}
