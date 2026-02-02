'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Mail, AtSign, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import type {
  PersistedOperativeUserProps,
  CreateOperativeUserDTO,
  UpdateOperativeUserDTO,
} from '@framework/shared-types';

interface OperativeFormProps {
  mode: 'create' | 'edit';
  operative: PersistedOperativeUserProps | null;
  onSave: (data: CreateOperativeUserDTO | UpdateOperativeUserDTO) => void;
  onCancel: () => void;
}

interface FormData {
  fullName: string;
  emailAddress: string;
  username: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  emailAddress?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
}

/**
 * IMPORTANTE: Valores por defecto para inputs controlados
 *
 * Siempre usar '' (string vacio) como valor por defecto, NUNCA undefined.
 * Esto previene el error: "A component is changing a controlled input to be uncontrolled"
 *
 * @see https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable
 */
const getInitialFormData = (operative: PersistedOperativeUserProps | null): FormData => ({
  fullName: operative?.fullName ?? '',
  emailAddress: operative?.emailAddress ?? '',
  username: operative?.username ?? '',
  password: '',
  confirmPassword: '',
});

export function OperativeForm({ mode, operative, onSave, onCancel }: OperativeFormProps) {
  // IMPORTANTE: Usar funcion para inicializar estado con valores por defecto seguros
  const [formData, setFormData] = useState<FormData>(() => getInitialFormData(operative));
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Actualizar formData cuando cambia operative
  useEffect(() => {
    setFormData(getInitialFormData(operative));
  }, [operative]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'El nombre es requerido';
        if (value.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres';
        return undefined;

      case 'emailAddress':
        if (!value.trim()) return 'El correo electronico es requerido';
        if (!validateEmail(value)) return 'Formato de correo electronico invalido';
        return undefined;

      case 'username':
        if (!value.trim()) return 'El nombre de usuario es requerido';
        if (value.trim().length < 3) return 'El usuario debe tener al menos 3 caracteres';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Solo letras, numeros y guion bajo';
        return undefined;

      case 'password':
        if (mode === 'create' && !value) return 'La contrasena es requerida';
        if (value && value.length < 6) return 'La contrasena debe tener al menos 6 caracteres';
        return undefined;

      case 'confirmPassword':
        if (mode === 'create' && !value) return 'Debes confirmar la contrasena';
        if (value && value !== formData.password) return 'Las contrasenas no coinciden';
        return undefined;

      default:
        return undefined;
    }
  };

  const handleChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validar el campo actual
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }

    // Si cambia la contrasena, revalidar confirmacion
    if (name === 'password' && touched.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleBlur = (name: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof FormData>).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched({
      fullName: true,
      emailAddress: true,
      username: true,
      password: true,
      confirmPassword: true,
    });

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Errores en el formulario', {
        description: 'Por favor, corrige los errores antes de continuar.',
      });
      return;
    }

    setIsSaving(true);

    try {
      if (mode === 'create') {
        // API usa 'email' en DTO, no 'emailAddress'
        const createData: CreateOperativeUserDTO = {
          fullName: formData.fullName.trim(),
          email: formData.emailAddress.trim(),
          username: formData.username.trim(),
          password: formData.password,
        };
        onSave(createData);
      } else {
        // API usa 'email' en DTO, no 'emailAddress'
        const updateData: UpdateOperativeUserDTO = {
          fullName: formData.fullName.trim(),
          email: formData.emailAddress.trim(),
        };
        onSave(updateData);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onCancel} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
      </div>

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0">
          <User className="h-6 w-6 md:h-7 md:w-7" />
        </div>
        <div>
          <h1 className="text-foreground mb-1">
            {mode === 'create' ? 'Nuevo Usuario Operativo' : 'Editar Usuario Operativo'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {mode === 'create'
              ? 'Completa los datos del nuevo usuario operativo de campo'
              : 'Modifica los datos del usuario operativo'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <Card className="p-6">
          <div className="space-y-6">
            {/* Informacion Personal */}
            <div className="space-y-4">
              <h2 className="text-foreground font-semibold pb-2 border-b border-border">
                Informacion Personal
              </h2>

              {/* Nombre completo */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground">
                  Nombre completo <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    onBlur={() => handleBlur('fullName')}
                    placeholder="Ej: Roberto Sanchez"
                    className={`pl-10 ${errors.fullName && touched.fullName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    disabled={isSaving}
                  />
                </div>
                {errors.fullName && touched.fullName && (
                  <p className="text-sm text-destructive flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="emailAddress" className="text-foreground">
                  Correo electronico <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="emailAddress"
                    type="email"
                    value={formData.emailAddress}
                    onChange={(e) => handleChange('emailAddress', e.target.value)}
                    onBlur={() => handleBlur('emailAddress')}
                    placeholder="usuario@empresa.com"
                    className={`pl-10 ${errors.emailAddress && touched.emailAddress ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    disabled={isSaving}
                  />
                </div>
                {errors.emailAddress && touched.emailAddress && (
                  <p className="text-sm text-destructive flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.emailAddress}
                  </p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">
                  Nombre de usuario <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    onBlur={() => handleBlur('username')}
                    placeholder="rsanchez"
                    className={`pl-10 ${errors.username && touched.username ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    disabled={isSaving || mode === 'edit'}
                  />
                </div>
                {errors.username && touched.username && (
                  <p className="text-sm text-destructive flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.username}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {mode === 'edit'
                    ? 'El nombre de usuario no puede modificarse'
                    : 'Solo letras, numeros y guion bajo. Se usara para iniciar sesion'}
                </p>
              </div>
            </div>

            {/* Credenciales */}
            {mode === 'create' && (
              <div className="space-y-4">
                <h2 className="text-foreground font-semibold pb-2 border-b border-border">
                  Credenciales de Acceso
                </h2>

                {/* Contrasena */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">
                    Contrasena <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      onBlur={() => handleBlur('password')}
                      placeholder="********"
                      className={`pl-10 ${errors.password && touched.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      disabled={isSaving}
                    />
                  </div>
                  {errors.password && touched.password && (
                    <p className="text-sm text-destructive flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.password}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">Minimo 6 caracteres</p>
                </div>

                {/* Confirmar Contrasena */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">
                    Confirmar contrasena <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      onBlur={() => handleBlur('confirmPassword')}
                      placeholder="********"
                      className={`pl-10 ${errors.confirmPassword && touched.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      disabled={isSaving}
                    />
                  </div>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <p className="text-sm text-destructive flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving} className="w-full sm:w-auto gap-2">
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
