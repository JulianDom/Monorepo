/**
 * =============================================================================
 * COMPONENTE: PriceDetail
 * =============================================================================
 *
 * Vista detallada de un relevamiento de precio.
 * Usa PriceRecord con relaciones según API.
 */
import { ArrowLeft, Package, MapPin, User, Calendar, DollarSign, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PriceRecord } from '@/features/prices';

// =============================================================================
// TIPOS
// =============================================================================

interface PriceDetailProps {
  record: PriceRecord;
  onBack: () => void;
}

// =============================================================================
// HELPERS
// =============================================================================

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(value);
};

// =============================================================================
// COMPONENTE
// =============================================================================

export function PriceDetail({ record, onBack }: PriceDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver al listado
        </Button>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge variant="default">Relevamiento #{record.id.slice(0, 8)}</Badge>
            <span className="text-muted-foreground text-sm">
              {formatDateShort(record.recordedAt)}
            </span>
          </div>
          <h1 className="text-2xl font-bold">Detalle del Relevamiento</h1>
          <p className="text-muted-foreground">
            Información completa del registro de precio
          </p>
        </div>
      </div>

      {/* Precio Destacado */}
      <Card className="border-l-4 border-l-primary bg-primary/5 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">Precio Relevado</p>
            <p className="text-5xl font-bold text-primary">
              {formatCurrency(record.price)}
            </p>
          </div>
          <div className="rounded-full bg-primary/10 p-4">
            <DollarSign className="h-12 w-12 text-primary" />
          </div>
        </div>
      </Card>

      {/* Información del Producto */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Información del Producto</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Nombre</p>
              <p className="font-medium">{record.product?.name ?? '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Presentación</p>
              <p className="font-medium">{record.product?.presentation ?? '-'}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Información del Local */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Información del Local</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Nombre</p>
              <p className="font-medium">{record.store?.name ?? '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Localidad</p>
              <p className="font-medium">{record.store?.locality ?? '-'}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Usuario y Fecha */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <User className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Usuario Relevador</h3>
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Nombre completo</p>
              <p className="font-medium">{record.operativeUser?.fullName ?? '-'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Fecha y Hora</h3>
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Registro creado</p>
              <p className="font-medium">{formatDate(record.recordedAt)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Observaciones */}
      {record.notes && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Observaciones</h3>
            </div>
            <p>{record.notes}</p>
          </div>
        </Card>
      )}

      {/* Foto del Relevamiento */}
      {record.photoUrl && (
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Foto del Relevamiento</h3>
            <img
              src={record.photoUrl}
              alt="Foto del relevamiento"
              className="rounded-lg max-w-full h-auto"
            />
          </div>
        </Card>
      )}

      {/* Metadata */}
      <Card className="bg-muted/30 p-6">
        <div className="space-y-2">
          <p className="font-medium text-muted-foreground text-sm">
            Información del registro
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground text-sm">ID del relevamiento</p>
              <p className="font-mono text-sm">{record.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">ID del producto</p>
              <p className="font-mono text-sm">{record.productId}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">ID del local</p>
              <p className="font-mono text-sm">{record.storeId}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Acciones */}
      <div className="flex justify-end">
        <Button onClick={onBack}>Cerrar detalle</Button>
      </div>
    </div>
  );
}
