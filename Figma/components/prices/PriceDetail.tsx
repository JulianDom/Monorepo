import { ArrowLeft, Package, MapPin, User, Calendar, DollarSign, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { PriceRecord } from '../PriceVisualization';

interface PriceDetailProps {
  record: PriceRecord;
  onBack: () => void;
}

export function PriceDetail({ record, onBack }: PriceDetailProps) {
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
            <Badge variant="default">Relevamiento #{record.id}</Badge>
            <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              {formatDateShort(record.fecha)}
            </span>
          </div>
          <h1 className="text-foreground">Detalle del Relevamiento</h1>
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
            Información completa del registro de precio
          </p>
        </div>
      </div>

      {/* Price Card - Destacado */}
      <Card className="border-l-4 border-l-primary bg-primary/5 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              Precio Relevado
            </p>
            <p className="font-semibold text-primary" style={{ fontSize: '56px', lineHeight: '1.2' }}>
              ${record.precio.toFixed(2)}
            </p>
          </div>
          <div className="rounded-full bg-primary/10 p-4">
            <DollarSign className="h-12 w-12 text-primary" />
          </div>
        </div>
      </Card>

      {/* Product Information */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-medium text-foreground">Información del Producto</h3>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                Código
              </p>
              <p className="font-medium text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                {record.productoCodigo}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                Nombre
              </p>
              <p className="font-medium text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                {record.productoNombre}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Location Information */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-medium text-foreground">Información del Local</h3>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                Código
              </p>
              <p className="font-medium text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                {record.localCodigo}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                Nombre
              </p>
              <p className="font-medium text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                {record.localNombre}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* User and Date Information */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <User className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium text-foreground">Usuario Relevador</h3>
            </div>
            
            <div className="space-y-1">
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                Nombre completo
              </p>
              <p className="font-medium text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                {record.usuarioNombre}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium text-foreground">Fecha y Hora</h3>
            </div>
            
            <div className="space-y-1">
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                Registro creado
              </p>
              <p className="font-medium text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                {formatDate(record.fecha)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Observations */}
      {record.observaciones && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium text-foreground">Observaciones</h3>
            </div>
            
            <p className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
              {record.observaciones}
            </p>
          </div>
        </Card>
      )}

      {/* Metadata */}
      <Card className="bg-muted/30 p-6">
        <div className="space-y-2">
          <p className="font-medium text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
            Información del registro
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>ID del relevamiento</p>
              <p className="font-mono text-foreground" style={{ fontSize: 'var(--text-sm)' }}>{record.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>ID del producto</p>
              <p className="font-mono text-foreground" style={{ fontSize: 'var(--text-sm)' }}>{record.productoId}</p>
            </div>
            <div>
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>ID del local</p>
              <p className="font-mono text-foreground" style={{ fontSize: 'var(--text-sm)' }}>{record.localId}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={onBack}>
          Cerrar detalle
        </Button>
      </div>
    </div>
  );
}
