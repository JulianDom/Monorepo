import { useState } from 'react';
import { ArrowLeft, FileUp, Download, AlertCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ImportResult } from '@/app/(dashboard)/dashboard/products/page';
import { toast } from 'sonner';

interface ProductImportProps {
  onImportComplete: (result: ImportResult) => void;
  onCancel: () => void;
}

export function ProductImport({ onImportComplete, onCancel }: ProductImportProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      toast.error('Archivo no válido', {
        description: 'Por favor, selecciona un archivo Excel (.xlsx, .xls) o CSV (.csv)',
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Archivo demasiado grande', {
        description: 'El archivo no debe superar los 5MB',
      });
      return;
    }

    setSelectedFile(file);
    toast.success('Archivo seleccionado', {
      description: `${file.name} listo para importar`,
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast.error('No hay archivo seleccionado', {
        description: 'Por favor, selecciona un archivo para importar',
      });
      return;
    }

    setIsProcessing(true);

    // Simulate processing
    setTimeout(() => {
      // Mock result with mixed success and errors
      const mockResult: ImportResult = {
        total: 12,
        exitosos: 9,
        errores: 3,
        registros: [
          {
            linea: 2,
            codigo: 'PROD-100',
            nombre: 'Producto A',
            estado: 'exito',
          },
          {
            linea: 3,
            codigo: 'PROD-101',
            nombre: 'Producto B',
            estado: 'exito',
          },
          {
            linea: 4,
            codigo: '',
            nombre: 'Producto C',
            estado: 'error',
            mensaje: 'El código es obligatorio',
          },
          {
            linea: 5,
            codigo: 'PROD-102',
            nombre: 'Producto D',
            estado: 'exito',
          },
          {
            linea: 6,
            codigo: 'PROD-103',
            nombre: '',
            estado: 'error',
            mensaje: 'El nombre es obligatorio',
          },
          {
            linea: 7,
            codigo: 'PROD-104',
            nombre: 'Producto E',
            estado: 'exito',
          },
          {
            linea: 8,
            codigo: 'PROD-105',
            nombre: 'Producto F',
            estado: 'exito',
          },
          {
            linea: 9,
            codigo: 'PROD-100',
            nombre: 'Producto duplicado',
            estado: 'error',
            mensaje: 'El código ya existe en el sistema',
          },
          {
            linea: 10,
            codigo: 'PROD-106',
            nombre: 'Producto G',
            estado: 'exito',
          },
          {
            linea: 11,
            codigo: 'PROD-107',
            nombre: 'Producto H',
            estado: 'exito',
          },
          {
            linea: 12,
            codigo: 'PROD-108',
            nombre: 'Producto I',
            estado: 'exito',
          },
          {
            linea: 13,
            codigo: 'PROD-109',
            nombre: 'Producto J',
            estado: 'exito',
          },
        ],
      };

      setIsProcessing(false);
      onImportComplete(mockResult);
      
      toast.success('Importación completada', {
        description: `${mockResult.exitosos} productos importados correctamente`,
      });
    }, 2000);
  };

  const handleDownloadTemplate = () => {
    toast.info('Descargando plantilla', {
      description: 'En una aplicación real, aquí se descargaría el archivo Excel',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" onClick={onCancel} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver al listado
        </Button>
        
        <div className="space-y-2">
          <h1 className="text-foreground">Importar Productos</h1>
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
            Carga masiva de productos mediante archivo Excel
          </p>
        </div>
      </div>

      {/* Instructions */}
      <Card className="border-l-4 border-l-primary bg-primary/5 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <p className="font-medium text-foreground" style={{ fontSize: 'var(--text-base)' }}>
              Instrucciones de importación
            </p>
            <ul className="space-y-1 text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              <li>• El archivo debe ser Excel (.xlsx, .xls) o CSV (.csv)</li>
              <li>• El tamaño máximo es de 5MB</li>
              <li>• Las columnas obligatorias son: Código, Nombre, Marca, Categoría, Precio</li>
              <li>• La columna Descripción es opcional</li>
              <li>• Descarga la plantilla para ver el formato correcto</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Download Template */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="font-medium text-foreground" style={{ fontSize: 'var(--text-base)' }}>
              Plantilla de importación
            </p>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              Descarga la plantilla Excel con el formato requerido
            </p>
          </div>
          <Button onClick={handleDownloadTemplate} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Descargar Plantilla
          </Button>
        </div>
      </Card>

      {/* File Upload */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="font-medium text-foreground" style={{ fontSize: 'var(--text-base)' }}>
              Seleccionar archivo
            </p>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              Arrastra un archivo o haz clic para seleccionar
            </p>
          </div>

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-accent/50'
            }`}
          >
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileInputChange}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-primary/10 p-4">
                <FileUp className="h-8 w-8 text-primary" />
              </div>
              
              {selectedFile ? (
                <div className="space-y-1">
                  <p className="font-medium text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                    {selectedFile.name}
                  </p>
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    Eliminar archivo
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-medium text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                    Arrastra tu archivo aquí o haz clic para seleccionar
                  </p>
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                    Excel (.xlsx, .xls) o CSV (.csv) - Máximo 5MB
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
          Cancelar
        </Button>
        <Button
          onClick={handleImport}
          disabled={!selectedFile || isProcessing}
          className="gap-2"
        >
          {isProcessing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Procesando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Importar Productos
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
