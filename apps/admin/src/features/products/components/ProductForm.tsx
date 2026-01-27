import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Product } from '@/app/(dashboard)/dashboard/products/page';
import { toast } from 'sonner';

interface ProductFormProps {
  product: Product | null;
  onSave: (product: Omit<Product, 'id' | 'fechaCreacion' | 'fechaModificacion'>) => void;
  onCancel: () => void;
}

type FormErrors = {
  codigo?: string;
  nombre?: string;
  marca?: string;
  categoria?: string;
  precio?: string;
};

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const isEditing = !!product;
  
  const [formData, setFormData] = useState({
    codigo: product?.codigo || '',
    nombre: product?.nombre || '',
    descripcion: product?.descripcion || '',
    marca: product?.marca || '',
    categoria: product?.categoria || '',
    precio: product?.precio.toString() || '',
    activo: product?.activo ?? true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        codigo: product.codigo,
        nombre: product.nombre,
        descripcion: product.descripcion,
        marca: product.marca,
        categoria: product.categoria,
        precio: product.precio.toString(),
        activo: product.activo,
      });
    }
  }, [product]);

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
      case 'marca':
        if (!value.trim()) return 'La marca es obligatoria';
        break;
      case 'categoria':
        if (!value.trim()) return 'La categoría es obligatoria';
        break;
      case 'precio':
        if (!value.trim()) return 'El precio es obligatorio';
        const precio = parseFloat(value);
        if (isNaN(precio)) return 'El precio debe ser un número válido';
        if (precio < 0) return 'El precio debe ser mayor o igual a 0';
        break;
    }
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    Object.keys(formData).forEach(key => {
      if (key !== 'descripcion' && key !== 'activo') {
        const error = validateField(key, formData[key as keyof typeof formData].toString());
        if (error) {
          newErrors[key as keyof FormErrors] = error;
        }
      }
    });

    setErrors(newErrors);
    setTouched({
      codigo: true,
      nombre: true,
      marca: true,
      categoria: true,
      precio: true,
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
      descripcion: formData.descripcion,
      marca: formData.marca,
      categoria: formData.categoria,
      precio: parseFloat(formData.precio),
      activo: formData.activo,
    });

    toast.success(
      isEditing ? 'Producto actualizado' : 'Producto creado',
      {
        description: isEditing
          ? 'El producto se actualizó correctamente.'
          : 'El producto se creó correctamente.',
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
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </h1>
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
            {isEditing
              ? 'Modifica los datos del producto existente'
              : 'Completa los datos para crear un nuevo producto'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Código */}
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
                placeholder="Ej: PROD-001"
                className={errors.codigo && touched.codigo ? 'border-destructive' : ''}
              />
              {errors.codigo && touched.codigo && (
                <p className="text-destructive" style={{ fontSize: 'var(--text-sm)' }}>
                  {errors.codigo}
                </p>
              )}
            </div>

            {/* Nombre */}
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
                placeholder="Ej: Coca Cola 2.25L"
                className={errors.nombre && touched.nombre ? 'border-destructive' : ''}
              />
              {errors.nombre && touched.nombre && (
                <p className="text-destructive" style={{ fontSize: 'var(--text-sm)' }}>
                  {errors.nombre}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">
                Descripción
              </Label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Descripción opcional del producto"
                rows={3}
                className="w-full rounded-md border border-border bg-input-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>

            {/* Marca y Categoría */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="marca">
                  Marca <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="marca"
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej: Coca Cola"
                  className={errors.marca && touched.marca ? 'border-destructive' : ''}
                />
                {errors.marca && touched.marca && (
                  <p className="text-destructive" style={{ fontSize: 'var(--text-sm)' }}>
                    {errors.marca}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">
                  Categoría <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej: Bebidas"
                  className={errors.categoria && touched.categoria ? 'border-destructive' : ''}
                />
                {errors.categoria && touched.categoria && (
                  <p className="text-destructive" style={{ fontSize: 'var(--text-sm)' }}>
                    {errors.categoria}
                  </p>
                )}
              </div>
            </div>

            {/* Precio */}
            <div className="space-y-2">
              <Label htmlFor="precio">
                Precio <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="precio"
                  name="precio"
                  type="number"
                  step="0.01"
                  value={formData.precio}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="0.00"
                  className={`pl-7 ${errors.precio && touched.precio ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.precio && touched.precio && (
                <p className="text-destructive" style={{ fontSize: 'var(--text-sm)' }}>
                  {errors.precio}
                </p>
              )}
            </div>

            {/* Estado */}
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <input
                type="checkbox"
                id="activo"
                name="activo"
                checked={formData.activo}
                onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring"
              />
              <div className="flex-1">
                <Label htmlFor="activo" className="cursor-pointer">
                  Producto activo
                </Label>
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                  Los productos activos están disponibles para relevamiento
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
            {isEditing ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </div>
      </form>
    </div>
  );
}
