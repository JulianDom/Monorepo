/**
 * Tipos para Sistema de Pagos
 */

export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  AUTHORIZED = 'authorized',
  IN_PROCESS = 'in_process',
  IN_MEDIATION = 'in_mediation',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  CHARGED_BACK = 'charged_back',
}

export interface PaymentItem {
  id: string;
  title: string;
  description?: string;
  pictureUrl?: string;
  categoryId?: string;
  quantity: number;
  currencyId?: string;
  unitPrice: number;
}

export interface PaymentPayer {
  name?: string;
  surname?: string;
  email: string;
  phone?: {
    areaCode?: string;
    number: string;
  };
  identification?: {
    type: string;
    number: string;
  };
  address?: {
    zipCode?: string;
    streetName?: string;
    streetNumber?: number;
  };
}

export interface CreatePreferenceDto {
  items: PaymentItem[];
  payer?: PaymentPayer;
  externalReference: string;
  notificationUrl?: string;
  backUrls?: {
    success: string;
    failure: string;
    pending: string;
  };
  autoReturn?: 'approved' | 'all';
  statementDescriptor?: string;
  expires?: boolean;
  expirationDateFrom?: string;
  expirationDateTo?: string;
  metadata?: Record<string, any>;
}

export interface PreferenceResponse {
  id: string;
  initPoint: string;
  sandboxInitPoint: string;
  externalReference: string;
  dateCreated: string;
}

export interface WebhookPayload {
  id: number;
  live_mode: boolean;
  type: string;
  date_created: string;
  user_id: number;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}

export interface PaymentInfo {
  id: number;
  status: PaymentStatus;
  statusDetail: string;
  externalReference: string;
  transactionAmount: number;
  currencyId: string;
  paymentMethodId: string;
  paymentTypeId: string;
  dateApproved?: string;
  dateCreated: string;
  payer: {
    id?: number;
    email?: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  metadata?: Record<string, any>;
}
