/**
 * Tipos para Sistema de Archivos
 */

export interface PaymentReceiptData {
  receiptNumber: string;
  date: Date;
  customer: {
    name: string;
    email: string;
    identification?: {
      type: string;
      number: string;
    };
    address?: string;
  };
  items: ReceiptItem[];
  subtotal: number;
  taxes?: number;
  discount?: number;
  total: number;
  paymentMethod: string;
  transactionId: string;
  currency: string;
  notes?: string;
  companyInfo: CompanyInfo;
}

export interface ReceiptItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CompanyInfo {
  name: string;
  taxId: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string; // Base64 o path
}

export interface CsvImportOptions<T> {
  headers: boolean;
  delimiter?: string;
  skipLines?: number;
  maxRows?: number;
  transform?: (row: Record<string, string>) => T;
  validate?: (row: T) => boolean;
}

export interface CsvExportOptions {
  headers: string[];
  delimiter?: string;
  includeHeaders?: boolean;
}

export interface ImportResult<T> {
  success: boolean;
  totalRows: number;
  importedRows: number;
  skippedRows: number;
  errors: ImportError[];
  data: T[];
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: Record<string, any>;
}

export interface ExportResult {
  success: boolean;
  filePath: string;
  fileName: string;
  mimeType: string;
  size: number;
}
