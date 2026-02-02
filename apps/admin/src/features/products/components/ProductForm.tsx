'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import type { Product, CreateProductDTO, UpdateProductDTO } from '@framework/shared-types';

interface ProductFormProps {
  product: Product | null;
  onSave: (data: CreateProductDTO | UpdateProductDTO) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

type FormErrors = {
  name?: string;
  brand?: string;
  presentation?: string;
  price?: string;
};

export function ProductForm({ product, onSave, onCancel, isLoading }: ProductFormProps) {
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    brand: product?.brand || '',
    presentation: product?.presentation || '',
    price: product?.price?.toString() || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        brand: product.brand || '',
        presentation: product.presentation,
        price: product.price.toString(),
      });
    }
  }, [product]);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'El nombre es obligatorio';
        if (value.length < 3) return 'El nombre debe tener al menos 3 caracteres';
        break;
      case 'presentation':
        if (!value.trim()) return 'La presentación es obligatoria';
        break;
      case 'price':
        if (!value.trim()) return 'El precio es obligatorio';
        const price = parseFloat(value);
        if (isNaN(price)) return 'El precio debe ser un número válido';
        if (price < 0) return 'El precio debe ser mayor o igual a 0';
        break;
    }
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const fieldsToValidate = ['name', 'presentation', 'price'];

    fieldsToValidate.forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
      }
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      presentation: true,
      price: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (isEditing) {
      const updateData: UpdateProductDTO = {
        name: formData.name,
        description: formData.description || undefined,
        brand: formData.brand || undefined,
        presentation: formData.presentation,
        price: parseFloat(formData.price),
      };
      onSave(updateData);
    } else {
      const createData: CreateProductDTO = {
        name: formData.name,
        description: formData.description || undefined,
        brand: formData.brand || undefined,
        presentation: formData.presentation,
        price: parseFloat(formData.price),
      };
      onSave(createData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" onClick={onCancel} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver al listado
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div>
            <h3>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h3>
            <p className="text-muted-foreground text-sm">
              {isEditing
                ? 'Modifica los datos del producto existente'
                : 'Completa los datos para crear un nuevo producto'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl">
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
                placeholder="Ej: Coca Cola 2.25L"
                className={errors.name && touched.name ? 'border-destructive' : ''}
              />
              {errors.name && touched.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descripción opcional del producto"
                rows={3}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>

            {/* Marca y Presentación */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Ej: Coca Cola"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="presentation">
                  Presentación <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="presentation"
                  name="presentation"
                  value={formData.presentation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej: Botella 2.25L"
                  className={errors.presentation && touched.presentation ? 'border-destructive' : ''}
                />
                {errors.presentation && touched.presentation && (
                  <p className="text-sm text-destructive">{errors.presentation}</p>
                )}
              </div>
            </div>

            {/* Precio */}
            <div className="space-y-2">
              <Label htmlFor="price">
                Precio <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="0.00"
                  className={`pl-7 ${errors.price && touched.price ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.price && touched.price && (
                <p className="text-sm text-destructive">{errors.price}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" className="gap-2" disabled={isLoading}>
            <Save className="h-4 w-4" />
            {isLoading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </div>
      </form>
    </div>
  );
}
