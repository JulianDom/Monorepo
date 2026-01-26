import { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Mail, Phone, Lock, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { toast } from 'sonner@2.0.3';
import type { Operative } from './OperativeManagement';

interface OperativeFormProps {
  mode: 'create' | 'edit';
  operative: Operative | null;
  onSave: (data: Omit<Operative, 'id' | 'createdAt' | 'lastAccess'>) => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export function OperativeForm({ mode, operative, onSave, onCancel }: OperativeFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: operative?.name || '',
    email: operative?.email || '',
    phone: operative?.phone || '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (operative) {
      setFormData({
        name: operative.name,
        email: operative.email,
        phone: operative.phone || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [operative]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // El teléfono es opcional
    // Formato flexible para números argentinos
    const phoneRegex = /^(\+54\s?)?(\d{2,4})[\s-]?\d{4}[\s-]?\d{4}$/;
    return phoneRegex.test(phone);
  };

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'El nombre es requerido';
        if (value.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres';
        return undefined;

      case 'email':
        if (!value.trim()) return 'El correo electrónico es requerido';
        if (!validateEmail(value)) return 'Formato de correo electrónico inválido';
        return undefined;

      case 'phone':
        if (value && !validatePhone(value)) return 'Formato de teléfono inválido';
        return undefined;

      case 'password':
        if (mode === 'create' && !value) return 'La contraseña es requerida';
        if (value && value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
        return undefined;

      case 'confirmPassword':
        if (mode === 'create' && !value) return 'Debes confirmar la contraseña';
        if (value && value !== formData.password) return 'Las contraseñas no coinciden';
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

    // Si cambia la contraseña, revalidar confirmación
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
      name: true,
      email: true,
      phone: true,
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

    // Simular guardado
    await new Promise((resolve) => setTimeout(resolve, 800));

    onSave({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      status: operative?.status || 'active',
    });

    toast.success(
      mode === 'create' ? 'Usuario operativo creado' : 'Usuario operativo actualizado',
      {
        description:
          mode === 'create'
            ? `${formData.name} ha sido creado correctamente.`
            : `Los cambios en ${formData.name} se guardaron correctamente.`,
      }
    );

    setIsSaving(false);
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
            {/* Información Personal */}
            <div className="space-y-4">
              <h2 className="text-foreground font-semibold pb-2 border-b border-border">
                Información Personal
              </h2>

              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Nombre completo <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    placeholder="Ej: Roberto Sánchez"
                    className={`pl-10 ${errors.name && touched.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    disabled={isSaving}
                  />
                </div>
                {errors.name && touched.name && (
                  <p className="text-sm text-destructive flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Correo electrónico <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="usuario@empresa.com"
                    className={`pl-10 ${errors.email && touched.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    disabled={isSaving}
                  />
                </div>
                {errors.email && touched.email && (
                  <p className="text-sm text-destructive flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.email}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Este correo se usará para el inicio de sesión
                </p>
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">
                  Teléfono
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    placeholder="+54 11 2345-6789"
                    className={`pl-10 ${errors.phone && touched.phone ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    disabled={isSaving}
                  />
                </div>
                {errors.phone && touched.phone && (
                  <p className="text-sm text-destructive flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.phone}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Opcional. Formato: +54 11 2345-6789
                </p>
              </div>
            </div>

            {/* Credenciales */}
            <div className="space-y-4">
              <h2 className="text-foreground font-semibold pb-2 border-b border-border">
                {mode === 'create' ? 'Credenciales de Acceso' : 'Cambiar Contraseña'}
              </h2>

              {mode === 'edit' && (
                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                  Deja estos campos vacíos si no deseas cambiar la contraseña
                </p>
              )}

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Contraseña {mode === 'create' && <span className="text-destructive">*</span>}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder="••••••••"
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
                <p className="text-xs text-muted-foreground">
                  Mínimo 6 caracteres
                </p>
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">
                  Confirmar contraseña {mode === 'create' && <span className="text-destructive">*</span>}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    placeholder="••••••••"
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
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto gap-2"
              >
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
