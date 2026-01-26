'use client';

import { type ReactNode } from 'react';
import {
  type FieldValues,
  type Path,
  type UseFormReturn,
  Controller,
} from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps<TFormValues extends FieldValues> {
  /** Instancia del formulario de react-hook-form */
  form: UseFormReturn<TFormValues>;
  /** Nombre del campo (debe coincidir con el schema) */
  name: Path<TFormValues>;
  /** Label del campo */
  label?: string;
  /** Placeholder */
  placeholder?: string;
  /** Tipo de input */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  /** Descripción/ayuda debajo del campo */
  description?: string;
  /** Deshabilitar campo */
  disabled?: boolean;
  /** Clase CSS adicional para el contenedor */
  className?: string;
  /** Render personalizado del input */
  children?: (field: {
    value: unknown;
    onChange: (...event: unknown[]) => void;
    onBlur: () => void;
    name: string;
    ref: React.Ref<unknown>;
  }) => ReactNode;
}

/**
 * Componente de campo de formulario estandarizado
 *
 * @example
 * ```tsx
 * <FormField
 *   form={form}
 *   name="email"
 *   label="Correo electrónico"
 *   type="email"
 *   placeholder="tu@email.com"
 * />
 *
 * // Con componente personalizado
 * <FormField form={form} name="role" label="Rol">
 *   {(field) => (
 *     <Select onValueChange={field.onChange} value={field.value}>
 *       <SelectTrigger>
 *         <SelectValue placeholder="Selecciona un rol" />
 *       </SelectTrigger>
 *       <SelectContent>
 *         <SelectItem value="admin">Admin</SelectItem>
 *         <SelectItem value="user">Usuario</SelectItem>
 *       </SelectContent>
 *     </Select>
 *   )}
 * </FormField>
 * ```
 */
export function FormField<TFormValues extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  type = 'text',
  description,
  disabled,
  className,
  children,
}: FormFieldProps<TFormValues>) {
  const {
    control,
    formState: { errors },
  } = form;

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label
          htmlFor={name}
          className={cn(errorMessage && 'text-destructive')}
        >
          {label}
        </Label>
      )}

      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          // Si hay children, usar render personalizado
          if (children) {
            return <>{children(field)}</>;
          }

          // Input por defecto
          return (
            <Input
              {...field}
              id={name}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                errorMessage &&
                  'border-destructive focus-visible:ring-destructive'
              )}
              value={field.value ?? ''}
            />
          );
        }}
      />

      {description && !errorMessage && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}

/**
 * Componente de grupo de campos (fieldset)
 */
export function FormFieldset({
  legend,
  children,
  className,
}: {
  legend?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cn('space-y-4', className)}>
      {legend && (
        <legend className="text-lg font-semibold tracking-tight">
          {legend}
        </legend>
      )}
      {children}
    </fieldset>
  );
}

/**
 * Componente de acciones del formulario
 */
export function FormActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-end gap-2 pt-4', className)}>
      {children}
    </div>
  );
}
