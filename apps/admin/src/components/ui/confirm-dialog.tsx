import { AlertCircle, X, Loader2 } from 'lucide-react';
import { Button } from './button';

interface ConfirmDialogProps {
  // Soporta ambas variantes de props
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  open,
  onClose,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  isLoading = false,
}: ConfirmDialogProps) {
  // Soporta ambas variantes: isOpen o open
  const isDialogOpen = isOpen ?? open ?? false;

  // Soporta ambas variantes: onClose o onOpenChange
  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  if (!isDialogOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    // No cerramos aquí, dejamos que el padre controle cuando cerrar (ej: después de mutación exitosa)
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={isLoading ? undefined : handleClose}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4">
        <div className="rounded-lg border border-border bg-card p-6 shadow-lg">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  variant === 'destructive'
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{title}</h3>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Description */}
          <div className="mb-6 text-sm text-muted-foreground leading-relaxed pl-13">
            {description}
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse md:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {cancelText}
            </Button>
            <Button
              variant={variant === 'destructive' ? 'destructive' : 'default'}
              onClick={handleConfirm}
              disabled={isLoading}
              className="w-full md:w-auto gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
