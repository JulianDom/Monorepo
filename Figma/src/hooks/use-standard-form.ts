'use client';

import { useForm, UseFormProps, UseFormReturn, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export interface UseStandardFormOptions<TFieldValues extends FieldValues> extends Omit<UseFormProps<TFieldValues>, 'resolver'> {
  schema: z.ZodType<TFieldValues>;
}

export interface UseStandardFormReturn<TFieldValues extends FieldValues> extends UseFormReturn<TFieldValues> {
  isValid: boolean;
  isDirty: boolean;
}

/**
 * Hook para formularios estandarizados con validación Zod
 * Integra react-hook-form con Zod para validaciones type-safe
 */
export function useStandardForm<TFieldValues extends FieldValues = FieldValues>(
  options: UseStandardFormOptions<TFieldValues>
): UseStandardFormReturn<TFieldValues> {
  const { schema, ...formOptions } = options;

  const form = useForm<TFieldValues>({
    ...formOptions,
    resolver: zodResolver(schema),
    mode: formOptions.mode || 'onBlur',
  });

  return {
    ...form,
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
  };
}

/**
 * Ejemplo de uso:
 * 
 * const userSchema = z.object({
 *   name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
 *   email: z.string().email('Email inválido'),
 *   password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
 * });
 * 
 * function UserForm() {
 *   const form = useStandardForm({
 *     schema: userSchema,
 *     defaultValues: {
 *       name: '',
 *       email: '',
 *       password: '',
 *     }
 *   });
 * 
 *   const onSubmit = (data) => {
 *     console.log(data); // Datos validados y type-safe
 *   };
 * 
 *   return (
 *     <form onSubmit={form.handleSubmit(onSubmit)}>
 *       <input {...form.register('name')} />
 *       {form.formState.errors.name && <span>{form.formState.errors.name.message}</span>}
 *     </form>
 *   );
 * }
 */
