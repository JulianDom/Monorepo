import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Location } from '@/app/(dashboard)/dashboard/locations/page';
import { toast } from 'sonner';

interface LocationFormProps {
  location: Location | null;
  onSave: (location: Omit<Location, 'id' | 'fechaCreacion' | 'fechaModificacion'>) => void;
  onCancel: () => void;
}

type FormErrors = {
  codigo?: string;
  nombre?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  telefono?: string;
  email?: string;
};

export function LocationForm({ location, onSave, onCancel }: LocationFormProps) {
  const isEditing = !!location;
  
  const [formData, setFormData] = useState({
    codigo: location?.codigo || '',
    nombre: location?.nombre || '',
    direccion: location?.direccion || '',
    ciudad: location?.ciudad || '',
    provincia: location?.provincia || '',
    telefono: location?.telefono || '',
    email: location?.email || '',
    habilitado: location?.habilitado ?? true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (location) {
      setFormData({
        codigo: location.codigo,
        nombre: location.nombre,
        direccion: location.direccion,
        ciudad: location.ciudad,
        provincia: location.provincia,
        telefono: location.telefono,
        email: location.email || '',
        habilitado: location.habilitado,
      });
    }
  }, [location]);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'codigo':
        if (!value.trim()) return 'El código es obligatorio';
        if (value.length < 3) return 'El código debe tener al menos 3 caracteres';
        break;
      case 'nombre':
        if (!value.trim()) return 'El nombre es obligatorio';
        if (value.length < 3) return 'El nombre debe tener al menos 3 caracteres';
        break;
      case 'direccion':
        if (!value.trim()) return 'La dirección es obligatoria';
        break;
      case 'ciudad':
        if (!value.trim()) return 'La ciudad es obligatoria';
        break;
      case 'provincia':
        if (!value.trim()) return 'La provincia es obligatoria';
        break;
      case 'telefono':
        if (!value.trim()) return 'El teléfono es obligatorio';
        const phoneRegex = /^[\d\s\-()]+$/;
        if (!phoneRegex.test(value)) return 'El teléfono contiene caracteres no válidos';
        break;
      case 'email':
        if (value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) return 'El email no es válido';
        }
        break;
    }
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    Object.keys(formData).forEach(key => {
      if (key !== 'email' && key !== 'habilitado') {
        const error = validateField(key, formData[key as keyof typeof formData].toString());
        if (error) {
          newErrors[key as keyof FormErrors] = error;
        }
      } else if (key === 'email' && formData.email) {
        const error = validateField(key, formData.email);
        if (error) {
          newErrors.email = error;
        }
      }
    });

    setErrors(newErrors);
    setTouched({
      codigo: true,
      nombre: true,
      direccion: true,
      ciudad: true,
      provincia: true,
      telefono: true,
      email: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Error de validación', {
        description: 'Por favor, corrige los errores en el formulario.',
      });
      return;
    }

    onSave({
      codigo: formData.codigo,
      nombre: formData.nombre,
      direccion: formData.direccion,
      ciudad: formData.ciudad,
      provincia: formData.provincia,
      telefono: formData.telefono,
      email: formData.email || undefined,
      habilitado: formData.habilitado,
    });

    toast.success(
      isEditing ? 'Local actualizado' : 'Local creado',
      {
        description: isEditing
          ? 'El local se actualizó correctamente.'
          : 'El local se creó correctamente.',
      }
    );
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
          <h1 className="text-foreground">
            {isEditing ? 'Editar Local' : 'Nuevo Local'}
          </h1>
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
            {isEditing
              ? 'Modifica los datos del local existente'
              : 'Completa los datos para crear un nuevo local'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Código y Nombre */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="codigo">
                  Código <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="codigo"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej: LOC-001"
                  className={errors.codigo && touched.codigo ? 'border-destructive' : ''}
                />
                {errors.codigo && touched.codigo && (
                  <p className="text-destructive" style={{ fontSize: 'var(--text-sm)' }}>
                    {errors.codigo}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">
                  Nombre <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej: Sucursal Centro"
                  className={errors.nombre && touched.nombre ? 'border-destructive' : ''}
                />
                {errors.nombre && touched.nombre && (
                  <p className="text-destructive" style={{ fontSize: 'var(--text-sm)' }}>
                    {errors.nombre}
                  </p>
                )}
              </div>
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <Label htmlFor="direccion">
                Dirección <span className="text-destructive">*</span>
              </Label>
              <Input
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ej: Av. Corrientes 1234"
                className={errors.direccion && touched.direccion ? 'border-destructive' : ''}
              />
              {errors.direccion && touched.direccion && (
                <p className="text-destructive" style={{ fontSize: 'var(--text-sm)' }}>
                  {errors.direccion}
                </p>
              )}
            </div>

            {/* Ciudad y Provincia */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ciudad">
                  Ciudad <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ciudad"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej: Buenos Aires"
                  className={errors.ciudad && touched.ciudad ? 'border-destructive' : ''}
                />
                {errors.ciudad && touched.ciudad && (
                  <p className="text-destructive" style={{ fontSize: 'var(--text-sm)' }}>
                    {errors.ciudad}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="provincia">
                  Provincia <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="provincia"
                  name="provincia"
                  value={formData.provincia}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej: CABA"
                  className={errors.provincia && touched.provincia ? 'border-destructive' : ''}
                />
                {errors.provincia && touched.provincia && (
                  <p className="text-destructive" style={{ fontSize: 'var(--text-sm)' }}>
                    {errors.provincia}
                  </p>
                )}
              </div>
            </div>

            {/* Teléfono y Email */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="telefono">
                  Teléfono <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej: 011-4444-5555"
                  className={errors.telefono && touched.telefono ? 'border-destructive' : ''}
                />
                {errors.telefono && touched.telefono && (
                  <p className="text-destructive" style={{ fontSize: 'var(--text-sm)' }}>
                    {errors.telefono}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej: local@empresa.com"
                  className={errors.email && touched.email ? 'border-destructive' : ''}
                />
                {errors.email && touched.email && (
                  <p className="text-destructive" style={{ fontSize: 'var(--text-sm)' }}>
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Estado */}
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <input
                type="checkbox"
                id="habilitado"
                name="habilitado"
                checked={formData.habilitado}
                onChange={(e) => setFormData(prev => ({ ...prev, habilitado: e.target.checked }))}
                className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring"
              />
              <div className="flex-1">
                <Label htmlFor="habilitado" className="cursor-pointer">
                  Local habilitado
                </Label>
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                  Los locales habilitados están disponibles para relevamiento de precios
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            {isEditing ? 'Guardar cambios' : 'Crear local'}
          </Button>
        </div>
      </form>
    </div>
  );
}
