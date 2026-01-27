import { ArrowLeft, CheckCircle2, XCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImportResult } from '@/app/(dashboard)/dashboard/locations/page';
import { toast } from 'sonner';

interface LocationImportReportProps {
  result: ImportResult;
  onBack: () => void;
}

export function LocationImportReport({ result, onBack }: LocationImportReportProps) {
  const successRate = ((result.exitosos / result.total) * 100).toFixed(1);
  const hasErrors = result.errores > 0;

  const handleDownloadReport = () => {
    toast.info('Descargando reporte', {
      description: 'En una aplicación real, aquí se descargaría el reporte detallado',
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
          <h1 className="text-foreground">Resultado de Importación</h1>
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
            Resumen del proceso de importación de locales
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              Total Procesados
            </p>
            <p className="font-semibold text-foreground" style={{ fontSize: 'var(--text-4xl)' }}>
              {result.total}
            </p>
          </div>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-green-50 p-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-green-700" style={{ fontSize: 'var(--text-sm)' }}>
                Exitosos
              </p>
            </div>
            <p className="font-semibold text-green-900" style={{ fontSize: 'var(--text-4xl)' }}>
              {result.exitosos}
            </p>
          </div>
        </Card>

        <Card className="border-l-4 border-l-destructive bg-destructive/5 p-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <p className="text-destructive" style={{ fontSize: 'var(--text-sm)' }}>
                Con Errores
              </p>
            </div>
            <p className="font-semibold text-destructive" style={{ fontSize: 'var(--text-4xl)' }}>
              {result.errores}
            </p>
          </div>
        </Card>
      </div>

      {/* Success Rate */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-medium text-foreground" style={{ fontSize: 'var(--text-base)' }}>
              Tasa de éxito
            </p>
            <p className="font-semibold text-foreground" style={{ fontSize: 'var(--text-xl)' }}>
              {successRate}%
            </p>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${successRate}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Status Message */}
      {hasErrors ? (
        <Card className="border-l-4 border-l-amber-500 bg-amber-50 p-4">
          <div className="flex gap-3">
            <XCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <p className="font-medium text-amber-900" style={{ fontSize: 'var(--text-base)' }}>
                Importación completada con errores
              </p>
              <p className="text-amber-700" style={{ fontSize: 'var(--text-sm)' }}>
                Se importaron {result.exitosos} locales correctamente, pero {result.errores} registros{' '}
                contienen errores que deben ser corregidos.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-l-4 border-l-green-500 bg-green-50 p-4">
          <div className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <p className="font-medium text-green-900" style={{ fontSize: 'var(--text-base)' }}>
                Importación exitosa
              </p>
              <p className="text-green-700" style={{ fontSize: 'var(--text-sm)' }}>
                Todos los locales se importaron correctamente sin errores.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Detailed Records */}
      <Card className="overflow-hidden">
        <div className="border-b border-border bg-muted/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="font-medium text-foreground" style={{ fontSize: 'var(--text-base)' }}>
              Detalle de registros
            </p>
            <Button variant="outline" size="sm" onClick={handleDownloadReport} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar Reporte
            </Button>
          </div>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead className="sticky top-0 border-b border-border bg-muted/30">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                      Línea
                    </span>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                      Código
                    </span>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                      Nombre
                    </span>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                      Estado
                    </span>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                      Mensaje
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.registros.map((record, index) => (
                  <tr
                    key={index}
                    className={`border-b border-border last:border-0 ${
                      record.estado === 'error' ? 'bg-destructive/5' : ''
                    }`}
                  >
                    <td className="px-6 py-3">
                      <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                        {record.linea}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="font-medium text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                        {record.codigo || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                        {record.nombre || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={record.estado === 'exito' ? 'default' : 'destructive'}>
                        {record.estado === 'exito' ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Éxito
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Error
                          </div>
                        )}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">
                      {record.mensaje && (
                        <span className="text-destructive" style={{ fontSize: 'var(--text-sm)' }}>
                          {record.mensaje}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile List */}
          <div className="space-y-3 p-4 md:hidden">
            {result.registros.map((record, index) => (
              <Card
                key={index}
                className={`p-4 ${record.estado === 'error' ? 'border-destructive bg-destructive/5' : ''}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                      Línea {record.linea}
                    </span>
                    <Badge variant={record.estado === 'exito' ? 'default' : 'destructive'}>
                      {record.estado === 'exito' ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Éxito
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Error
                        </div>
                      )}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="font-medium text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                      {record.nombre || '-'}
                    </p>
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                      Código: {record.codigo || '-'}
                    </p>
                  </div>

                  {record.mensaje && (
                    <p className="text-destructive" style={{ fontSize: 'var(--text-sm)' }}>
                      {record.mensaje}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={onBack}>
          Finalizar
        </Button>
      </div>
    </div>
  );
}
