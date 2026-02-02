/**
 * =============================================================================
 * COMPONENTE: LocationForm
 * =============================================================================
 *
 * Formulario para crear/editar locales.
 * Campos según API: name (requerido), locality (requerido), zone (opcional)
 */
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import type { Store, CreateStoreDTO, UpdateStoreDTO } from '@/features/locations';

// =============================================================================
// TIPOS
// =============================================================================

interface LocationFormProps {
  store: Store | null;
  onSave: (data: CreateStoreDTO | UpdateStoreDTO) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

type FormData = {
  name: string;
  locality: string;
  zone: string;
  active: boolean;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

// =============================================================================
// HELPERS
// =============================================================================

const getInitialFormData = (store: Store | null): FormData => ({
  name: store?.name ?? '',
  locality: store?.locality ?? '',
  zone: store?.zone ?? '',
  active: store?.active ?? true,
});

const validateField = (name: keyof FormData, value: string): string | undefined => {
  switch (name) {
    case 'name':
      if (!value.trim()) return 'El nombre es obligatorio';
      if (value.length < 3) return 'El nombre debe tener al menos 3 caracteres';
      break;
    case 'locality':
      if (!value.trim()) return 'La localidad es obligatoria';
      break;
    // zone es opcional, no requiere validación
  }
  return undefined;
};

// =============================================================================
// COMPONENTE
// =============================================================================

export function LocationForm({
  store,
  onSave,
  onCancel,
  isSubmitting = false,
}: LocationFormProps) {
  const isEditing = !!store;

  // -------------------------------------------------------------------------
  // ESTADO
  // -------------------------------------------------------------------------
  const [formData, setFormData] = useState<FormData>(getInitialFormData(store));
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Actualizar form cuando cambia el store (edición)
  useEffect(() => {
    setFormData(getInitialFormData(store));
    setErrors({});
    setTouched({});
  }, [store]);

  // -------------------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name as keyof FormData, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name as keyof FormData, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const fieldsToValidate: (keyof FormData)[] = ['name', 'locality'];

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, String(formData[field]));
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    setTouched(
      fieldsToValidate.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    );

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (isEditing) {
      const data: UpdateStoreDTO = {
        name: formData.name,
        locality: formData.locality,
        zone: formData.zone || undefined,
      };
      onSave(data);
    } else {
      const data: CreateStoreDTO = {
        name: formData.name,
        locality: formData.locality,
        zone: formData.zone || undefined,
      };
      onSave(data);
    }
  };

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" onClick={onCancel} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver al listado
        </Button>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Editar Local' : 'Nuevo Local'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? 'Modifica los datos del local existente'
              : 'Completa los datos para crear un nuevo local'}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ej: Supermercado Norte"
                className={errors.name && touched.name ? 'border-destructive' : ''}
              />
              {errors.name && touched.name && (
                <p className="text-destructive text-sm">{errors.name}</p>
              )}
            </div>

            {/* Localidad */}
            <div className="space-y-2">
              <Label htmlFor="locality">
                Localidad <span className="text-destructive">*</span>
              </Label>
              <Input
                id="locality"
                name="locality"
                value={formData.locality}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ej: Buenos Aires"
                className={errors.locality && touched.locality ? 'border-destructive' : ''}
              />
              {errors.locality && touched.locality && (
                <p className="text-destructive text-sm">{errors.locality}</p>
              )}
            </div>

            {/* Zona (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="zone">Zona</Label>
              <Input
                id="zone"
                name="zone"
                value={formData.zone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ej: Centro (opcional)"
              />
            </div>

            {/* Estado (solo en edición) */}
            {isEditing && (
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                <div className="space-y-1">
                  <Label htmlFor="active" className="cursor-pointer">
                    Local activo
                  </Label>
                  <p className="text-muted-foreground text-sm">
                    Los locales activos están disponibles para relevamiento de precios
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, active: checked }))
                  }
                />
              </div>
            )}
          </div>
        </Card>

        {/* Acciones */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEditing ? 'Guardar cambios' : 'Crear local'}
          </Button>
        </div>
      </form>
    </div>
  );
}
