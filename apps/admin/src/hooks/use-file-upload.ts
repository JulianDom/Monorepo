'use client';

import { useState, useCallback, useRef } from 'react';
import { apiClient } from '@/lib';
import { toast } from 'sonner';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UploadedFile {
  url: string;
  name: string;
  size: number;
  type: string;
}

interface UseFileUploadOptions {
  /** Endpoint de upload */
  endpoint?: string;
  /** Tipos de archivo permitidos (ej: ['image/*', '.pdf']) */
  accept?: string[];
  /** Tamaño máximo en bytes (default: 10MB) */
  maxSize?: number;
  /** Permitir múltiples archivos */
  multiple?: boolean;
  /** Callback al completar upload */
  onSuccess?: (files: UploadedFile[]) => void;
  /** Callback en error */
  onError?: (error: Error) => void;
}

/**
 * Hook para subida de archivos con progreso
 *
 * @example
 * ```tsx
 * function ImageUploader() {
 *   const {
 *     upload,
 *     isUploading,
 *     progress,
 *     uploadedFiles,
 *     openFileDialog,
 *     inputProps,
 *   } = useFileUpload({
 *     endpoint: '/uploads/images',
 *     accept: ['image/*'],
 *     maxSize: 5 * 1024 * 1024, // 5MB
 *     onSuccess: (files) => console.log('Uploaded:', files),
 *   });
 *
 *   return (
 *     <div>
 *       <input {...inputProps} className="hidden" />
 *       <button onClick={openFileDialog} disabled={isUploading}>
 *         {isUploading ? `Subiendo ${progress.percentage}%` : 'Subir imagen'}
 *       </button>
 *
 *       {uploadedFiles.map((file) => (
 *         <img key={file.url} src={file.url} alt={file.name} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useFileUpload({
  endpoint = '/uploads',
  accept = [],
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  onSuccess,
  onError,
}: UseFileUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0,
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Validar archivo
  const validateFile = useCallback(
    (file: File): string | null => {
      // Validar tamaño
      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        return `El archivo excede el tamaño máximo de ${maxSizeMB}MB`;
      }

      // Validar tipo (si hay restricciones)
      if (accept.length > 0) {
        const isValidType = accept.some((type) => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          if (type.endsWith('/*')) {
            const category = type.replace('/*', '');
            return file.type.startsWith(category);
          }
          return file.type === type;
        });

        if (!isValidType) {
          return `Tipo de archivo no permitido. Tipos aceptados: ${accept.join(', ')}`;
        }
      }

      return null;
    },
    [accept, maxSize]
  );

  // Subir archivos
  const upload = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      if (fileArray.length === 0) return;

      // Validar todos los archivos
      for (const file of fileArray) {
        const validationError = validateFile(file);
        if (validationError) {
          toast.error(validationError);
          onError?.(new Error(validationError));
          return;
        }
      }

      setIsUploading(true);
      setError(null);
      setProgress({ loaded: 0, total: 0, percentage: 0 });

      try {
        const formData = new FormData();

        fileArray.forEach((file) => {
          formData.append(multiple ? 'files' : 'file', file);
        });

        const response = await apiClient.post<{ files: UploadedFile[] }>(
          endpoint,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const total = progressEvent.total ?? 0;
              const loaded = progressEvent.loaded;
              const percentage = total > 0 ? Math.round((loaded / total) * 100) : 0;

              setProgress({ loaded, total, percentage });
            },
          }
        );

        const uploaded = response.data.files;
        setUploadedFiles((prev) => [...prev, ...uploaded]);
        toast.success(
          `${uploaded.length} archivo${uploaded.length > 1 ? 's' : ''} subido${uploaded.length > 1 ? 's' : ''} correctamente`
        );
        onSuccess?.(uploaded);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Error al subir archivo');
        setError(error);
        onError?.(error);
      } finally {
        setIsUploading(false);
      }
    },
    [endpoint, multiple, onError, onSuccess, validateFile]
  );

  // Manejar cambio de input
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        upload(files);
      }
      // Reset input para permitir subir el mismo archivo
      event.target.value = '';
    },
    [upload]
  );

  // Abrir diálogo de archivos
  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  // Limpiar archivos subidos
  const clearFiles = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  // Eliminar archivo específico
  const removeFile = useCallback((url: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.url !== url));
  }, []);

  // Props para el input
  const inputProps = {
    ref: inputRef,
    type: 'file' as const,
    accept: accept.join(','),
    multiple,
    onChange: handleChange,
    style: { display: 'none' },
  };

  return {
    upload,
    isUploading,
    progress,
    uploadedFiles,
    error,
    openFileDialog,
    clearFiles,
    removeFile,
    inputProps,
    inputRef,
  };
}
