'use client';

import { useForm, type UseFormProps, type FieldValues, type Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ZodSchema } from 'zod';
import { useCallback } from 'react';
import { toast } from 'sonner';

interface UseStandardFormOptions<TFormValues extends FieldValues>
  extends Omit<UseFormProps<TFormValues>, 'resolver'> {
  /** Schema de Zod para validación */
  schema: ZodSchema<TFormValues>;
  /** Mostrar toast en error de validación */
  showValidationToast?: boolean;
}

/**
 * Hook estandarizado para formularios
 * Integra react-hook-form + zod con comportamientos por defecto
 *
 * @example
 * ```tsx
 * const userSchema = z.object({
 *   name: z.string().min(2, 'Mínimo 2 caracteres'),
 *   email: z.string().email('Email inválido'),
 * });
 *
 * type UserForm = z.infer<typeof userSchema>;
 *
 * function CreateUserForm() {
 *   const form = useStandardForm<UserForm>({
 *     schema: userSchema,
 *     defaultValues: { name: '', email: '' },
 *   });
 *
 *   const onSubmit = form.handleSubmit((data) => {
 *     createUser.mutate(data);
 *   });
 *
 *   return (
 *     <form onSubmit={onSubmit}>
 *       <FormField form={form} name="name" label="Nombre" />
 *       <FormField form={form} name="email" label="Email" />
 *       <button type="submit" disabled={form.isSubmitting}>
 *         Guardar
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useStandardForm<TFormValues extends FieldValues>({
  schema,
  showValidationToast = true,
  ...formOptions
}: UseStandardFormOptions<TFormValues>) {
  const form = useForm<TFormValues>({
    ...formOptions,
    resolver: zodResolver(schema),
  });

  const {
    formState: { errors, isSubmitting, isDirty, isValid },
    setError,
    clearErrors,
    reset,
    setValue,
    getValues,
  } = form;

  /**
   * Setear errores del servidor en campos específicos
   */
  const setServerErrors = useCallback(
    (serverErrors: Record<string, string>) => {
      Object.entries(serverErrors).forEach(([field, message]) => {
        setError(field as Path<TFormValues>, {
          type: 'server',
          message,
        });
      });
    },
    [setError]
  );

  /**
   * Setear error global del formulario
   */
  const setFormError = useCallback(
    (message: string) => {
      setError('root', { type: 'server', message });
      if (showValidationToast) {
        toast.error(message);
      }
    },
    [setError, showValidationToast]
  );

  /**
   * Limpiar todos los errores
   */
  const clearAllErrors = useCallback(() => {
    clearErrors();
  }, [clearErrors]);

  /**
   * Reset con nuevos valores
   */
  const resetForm = useCallback(
    (values?: TFormValues) => {
      reset(values);
    },
    [reset]
  );

  /**
   * Verificar si un campo tiene error
   */
  const hasError = useCallback(
    (name: Path<TFormValues>): boolean => {
      return !!errors[name];
    },
    [errors]
  );

  /**
   * Obtener mensaje de error de un campo
   */
  const getError = useCallback(
    (name: Path<TFormValues>): string | undefined => {
      const error = errors[name];
      return error?.message as string | undefined;
    },
    [errors]
  );

  return {
    ...form,
    // Estados
    isSubmitting,
    isDirty,
    isValid,
    errors,

    // Helpers
    setServerErrors,
    setFormError,
    clearAllErrors,
    resetForm,
    hasError,
    getError,

    // Valores
    setValue,
    getValues,
  };
}

/**
 * Tipo del formulario para usar en componentes
 */
export type StandardForm<T extends FieldValues> = ReturnType<
  typeof useStandardForm<T>
>;
