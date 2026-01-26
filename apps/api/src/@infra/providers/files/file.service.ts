import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PDFDocument from 'pdfkit';
import { parseStream, format } from 'fast-csv';
import { createReadStream, createWriteStream } from 'fs';
import { mkdir, unlink, stat } from 'fs/promises';
import { join } from 'path';
import { PassThrough } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import {
  PaymentReceiptData,
  CsvImportOptions,
  CsvExportOptions,
  ImportResult,
  ExportResult,
} from '@shared/types';

/**
 * FileService
 *
 * Servicio para generación de PDFs y manejo de CSVs.
 * - Exportar recibos de pago en PDF con pdfkit
 * - Importar datos masivos desde CSV con fast-csv
 * - Exportar datos a CSV
 */
@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private readonly tempDir: string;
  private readonly uploadsDir: string;

  constructor(private readonly configService: ConfigService) {
    this.tempDir = this.configService.get<string>('TEMP_DIR', './temp');
    this.uploadsDir = this.configService.get<string>('UPLOADS_DIR', './uploads');
  }

  // ==================== PDF Generation ====================

  /**
   * Generar recibo de pago en PDF
   */
  async generatePaymentReceipt(data: PaymentReceiptData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        this.logger.debug(`Generating receipt: ${data.receiptNumber}`);

        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: `Recibo ${data.receiptNumber}`,
            Author: data.companyInfo.name,
            Subject: 'Recibo de Pago',
          },
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header con logo e información de empresa
        this.drawReceiptHeader(doc, data);

        // Información del cliente
        this.drawCustomerInfo(doc, data);

        // Tabla de items
        this.drawItemsTable(doc, data);

        // Totales
        this.drawTotals(doc, data);

        // Información de pago
        this.drawPaymentInfo(doc, data);

        // Footer
        this.drawReceiptFooter(doc, data);

        doc.end();
      } catch (error) {
        this.logger.error(`Failed to generate receipt: ${(error as Error).message}`);
        reject(error);
      }
    });
  }

  private drawReceiptHeader(doc: PDFKit.PDFDocument, data: PaymentReceiptData): void {
    const { companyInfo } = data;

    // Logo (si existe)
    // if (companyInfo.logo) {
    //   doc.image(companyInfo.logo, 50, 45, { width: 100 });
    // }

    // Nombre de empresa
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(companyInfo.name, 50, 50, { align: 'right' });

    // Datos de empresa
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(companyInfo.taxId, { align: 'right' })
      .text(companyInfo.address, { align: 'right' });

    if (companyInfo.phone) {
      doc.text(`Tel: ${companyInfo.phone}`, { align: 'right' });
    }
    if (companyInfo.email) {
      doc.text(companyInfo.email, { align: 'right' });
    }

    // Línea separadora
    doc.moveDown(2);
    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    // Título del recibo
    doc
      .moveDown(1)
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#333333')
      .text('RECIBO DE PAGO', { align: 'center' });

    doc
      .fontSize(12)
      .font('Helvetica')
      .text(`N° ${data.receiptNumber}`, { align: 'center' });

    doc
      .fontSize(10)
      .text(`Fecha: ${this.formatDate(data.date)}`, { align: 'center' });

    doc.moveDown(2);
  }

  private drawCustomerInfo(doc: PDFKit.PDFDocument, data: PaymentReceiptData): void {
    const { customer } = data;

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#333333')
      .text('CLIENTE');

    doc.moveDown(0.5);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Nombre: ${customer.name}`)
      .text(`Email: ${customer.email}`);

    if (customer.identification) {
      doc.text(`${customer.identification.type}: ${customer.identification.number}`);
    }

    if (customer.address) {
      doc.text(`Dirección: ${customer.address}`);
    }

    doc.moveDown(1.5);
  }

  private drawItemsTable(doc: PDFKit.PDFDocument, data: PaymentReceiptData): void {
    const tableTop = doc.y;
    const tableHeaders = ['Descripción', 'Cant.', 'Precio Unit.', 'Total'];
    const columnWidths = [250, 50, 100, 100];
    const columnX = [50, 300, 350, 450];

    // Header de tabla
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#ffffff');

    doc
      .rect(50, tableTop, 500, 20)
      .fill('#4a5568');

    tableHeaders.forEach((header, i) => {
      doc
        .fillColor('#ffffff')
        .text(header, columnX[i], tableTop + 5, { width: columnWidths[i], align: i === 0 ? 'left' : 'right' });
    });

    // Filas de items
    let rowY = tableTop + 25;
    doc.font('Helvetica').fillColor('#333333');

    data.items.forEach((item, index) => {
      const bgColor = index % 2 === 0 ? '#f7fafc' : '#ffffff';
      doc.rect(50, rowY - 3, 500, 20).fill(bgColor);

      doc
        .fillColor('#333333')
        .text(item.description, columnX[0], rowY, { width: columnWidths[0] })
        .text(item.quantity.toString(), columnX[1], rowY, { width: columnWidths[1], align: 'right' })
        .text(this.formatCurrency(item.unitPrice, data.currency), columnX[2], rowY, { width: columnWidths[2], align: 'right' })
        .text(this.formatCurrency(item.total, data.currency), columnX[3], rowY, { width: columnWidths[3], align: 'right' });

      rowY += 20;
    });

    // Línea final de tabla
    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(50, rowY)
      .lineTo(550, rowY)
      .stroke();

    doc.y = rowY + 10;
  }

  private drawTotals(doc: PDFKit.PDFDocument, data: PaymentReceiptData): void {
    const totalsX = 350;
    const valuesX = 450;

    doc.fontSize(10).font('Helvetica');

    // Subtotal
    doc
      .text('Subtotal:', totalsX, doc.y, { continued: true })
      .text(this.formatCurrency(data.subtotal, data.currency), valuesX, doc.y, { align: 'right' });

    doc.moveDown(0.5);

    // Impuestos (si aplica)
    if (data.taxes) {
      doc
        .text('Impuestos:', totalsX, doc.y, { continued: true })
        .text(this.formatCurrency(data.taxes, data.currency), valuesX, doc.y, { align: 'right' });
      doc.moveDown(0.5);
    }

    // Descuento (si aplica)
    if (data.discount) {
      doc
        .text('Descuento:', totalsX, doc.y, { continued: true })
        .text(`-${this.formatCurrency(data.discount, data.currency)}`, valuesX, doc.y, { align: 'right' });
      doc.moveDown(0.5);
    }

    // Total
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('TOTAL:', totalsX, doc.y, { continued: true })
      .text(this.formatCurrency(data.total, data.currency), valuesX, doc.y, { align: 'right' });

    doc.moveDown(2);
  }

  private drawPaymentInfo(doc: PDFKit.PDFDocument, data: PaymentReceiptData): void {
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#333333')
      .text('INFORMACIÓN DE PAGO');

    doc.moveDown(0.5);

    doc
      .font('Helvetica')
      .text(`Método de pago: ${data.paymentMethod}`)
      .text(`ID de transacción: ${data.transactionId}`);

    if (data.notes) {
      doc.moveDown(1);
      doc
        .font('Helvetica-Oblique')
        .text(`Notas: ${data.notes}`);
    }
  }

  private drawReceiptFooter(doc: PDFKit.PDFDocument, data: PaymentReceiptData): void {
    const footerY = doc.page.height - 100;

    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(50, footerY)
      .lineTo(550, footerY)
      .stroke();

    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#666666')
      .text('Este documento es un comprobante de pago válido.', 50, footerY + 10, { align: 'center' })
      .text(`${data.companyInfo.name} - ${data.companyInfo.website || ''}`, { align: 'center' });
  }

  /**
   * Generar PDF y guardarlo en archivo
   */
  async saveReceiptToFile(data: PaymentReceiptData): Promise<ExportResult> {
    const buffer = await this.generatePaymentReceipt(data);
    const fileName = `receipt_${data.receiptNumber}_${Date.now()}.pdf`;
    const filePath = join(this.uploadsDir, 'receipts', fileName);

    await mkdir(join(this.uploadsDir, 'receipts'), { recursive: true });
    await this.writeFile(filePath, buffer);

    const stats = await stat(filePath);

    return {
      success: true,
      filePath,
      fileName,
      mimeType: 'application/pdf',
      size: stats.size,
    };
  }

  // ==================== CSV Import ====================

  /**
   * Importar datos desde CSV
   */
  async importCsv<T>(
    filePath: string,
    options: CsvImportOptions<T>,
  ): Promise<ImportResult<T>> {
    return new Promise((resolve, reject) => {
      const result: ImportResult<T> = {
        success: false,
        totalRows: 0,
        importedRows: 0,
        skippedRows: 0,
        errors: [],
        data: [],
      };

      let currentRow = 0;

      const stream = createReadStream(filePath);

      parseStream(stream, {
        headers: options.headers,
        delimiter: options.delimiter || ',',
        skipLines: options.skipLines || 0,
        maxRows: options.maxRows,
      })
        .on('error', (error: Error) => {
          this.logger.error(`CSV import error: ${error.message}`);
          reject(error);
        })
        .on('data', (row: Record<string, string>) => {
          currentRow++;
          result.totalRows++;

          try {
            // Transformar fila
            const transformed = options.transform ? options.transform(row) : (row as unknown as T);

            // Validar fila
            if (options.validate && !options.validate(transformed)) {
              result.skippedRows++;
              result.errors.push({
                row: currentRow,
                message: 'Validation failed',
                data: row,
              });
              return;
            }

            result.data.push(transformed);
            result.importedRows++;
          } catch (error) {
            result.skippedRows++;
            result.errors.push({
              row: currentRow,
              message: (error as Error).message,
              data: row,
            });
          }
        })
        .on('end', () => {
          result.success = result.errors.length === 0;
          this.logger.log(
            `CSV import completed: ${result.importedRows}/${result.totalRows} rows imported`,
          );
          resolve(result);
        });
    });
  }

  /**
   * Importar CSV desde buffer o stream
   */
  async importCsvFromBuffer<T>(
    buffer: Buffer,
    options: CsvImportOptions<T>,
  ): Promise<ImportResult<T>> {
    // Guardar temporalmente
    const tempFile = join(this.tempDir, `import_${uuidv4()}.csv`);
    await mkdir(this.tempDir, { recursive: true });
    await this.writeFile(tempFile, buffer);

    try {
      const result = await this.importCsv<T>(tempFile, options);
      return result;
    } finally {
      // Limpiar archivo temporal
      await unlink(tempFile).catch(() => {});
    }
  }

  // ==================== CSV Export ====================

  /**
   * Exportar datos a CSV
   */
  async exportCsv<T extends Record<string, any>>(
    data: T[],
    options: CsvExportOptions,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const passThrough = new PassThrough();

      passThrough.on('data', (chunk: Buffer) => chunks.push(chunk));
      passThrough.on('end', () => resolve(Buffer.concat(chunks)));
      passThrough.on('error', reject);

      const csvStream = format({
        headers: options.includeHeaders !== false ? options.headers : false,
        delimiter: options.delimiter || ',',
      });

      csvStream.pipe(passThrough);

      data.forEach((row) => {
        const orderedRow = options.headers.map((header) => row[header] ?? '');
        csvStream.write(orderedRow);
      });

      csvStream.end();
    });
  }

  /**
   * Exportar CSV y guardarlo en archivo
   */
  async saveCsvToFile<T extends Record<string, any>>(
    data: T[],
    options: CsvExportOptions,
    fileName?: string,
  ): Promise<ExportResult> {
    const buffer = await this.exportCsv(data, options);
    const finalFileName = fileName || `export_${Date.now()}.csv`;
    const filePath = join(this.uploadsDir, 'exports', finalFileName);

    await mkdir(join(this.uploadsDir, 'exports'), { recursive: true });
    await this.writeFile(filePath, buffer);

    const stats = await stat(filePath);

    return {
      success: true,
      filePath,
      fileName: finalFileName,
      mimeType: 'text/csv',
      size: stats.size,
    };
  }

  // ==================== Helpers ====================

  private async writeFile(filePath: string, data: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = createWriteStream(filePath);
      stream.on('finish', resolve);
      stream.on('error', reject);
      stream.write(data);
      stream.end();
    });
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency || 'ARS',
    }).format(amount);
  }
}
