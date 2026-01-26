import { useState } from 'react';
import { ArrowLeft, ShieldCheck, AlertCircle, Mail, User, Shield, Save, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Admin } from './AdminManagement';
import { Switch } from './ui/switch';

interface AdminFormProps {
  mode: 'create' | 'edit';
  initialData: Admin | null;
  onSave: (data: Omit<Admin, 'id' | 'createdAt' | 'lastLogin'>) => void;
  onCancel: () => void;
}

const ADMIN_ROLES = [
  'Administrador General',
  'Administrador de Usuarios',
  'Administrador de Contenido',
  'Administrador de Reportes',
  'Administrador de Configuración',
];

export function AdminForm({ mode, initialData, onSave, onCancel }: AdminFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    role: initialData?.role || '',
    isActive: initialData?.isActive ?? true,
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    role?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const [touched, setTouched] = useState<{
    name?: boolean;
    email?: boolean;
    role?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateField = (field: keyof typeof formData, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'El nombre es requerido';
        } else if (value.trim().length < 3) {
          newErrors.name = 'El nombre debe tener al menos 3 caracteres';
        } else {
          delete newErrors.name;
        }
        break;

      case 'email':
        if (!value.trim()) {
          newErrors.email = 'El correo electrónico es requerido';
        } else if (!validateEmail(value)) {
          newErrors.email = 'Formato de correo electrónico inválido';
        } else {
          delete newErrors.email;
        }
        break;

      case 'role':
        if (!value) {
          newErrors.role = 'El rol es requerido';
        } else {
          delete newErrors.role;
        }
        break;

      case 'password':
        if (mode === 'create' && !value) {
          newErrors.password = 'La contraseña es requerida';
        } else if (value && value.length < 6) {
          newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        } else {
          delete newErrors.password;
        }
        // Re-validate confirm password if it has been touched
        if (touched.confirmPassword && formData.confirmPassword) {
          if (formData.confirmPassword !== value) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
          } else {
            delete newErrors.confirmPassword;
          }
        }
        break;

      case 'confirmPassword':
        if (mode === 'create' && !value) {
          newErrors.confirmPassword = 'Debes confirmar la contraseña';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Las contraseñas no coinciden';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched({ ...touched, [field]: true });
    validateField(field, formData[field] as string);
  };

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    if (touched[field as keyof typeof touched]) {
      validateField(field, value as string);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      role: true,
      password: true,
      confirmPassword: true,
    });

    // Validate all fields
    validateField('name', formData.name);
    validateField('email', formData.email);
    validateField('role', formData.role);
    validateField('password', formData.password);
    validateField('confirmPassword', formData.confirmPassword);

    // Check if there are any errors
    const hasErrors = 
      !formData.name.trim() ||
      formData.name.trim().length < 3 ||
      !formData.email.trim() ||
      !validateEmail(formData.email) ||
      !formData.role ||
      (mode === 'create' && (!formData.password || formData.password.length < 6)) ||
      (mode === 'create' && formData.password !== formData.confirmPassword) ||
      (mode === 'edit' && formData.password && formData.password.length < 6) ||
      (mode === 'edit' && formData.password && formData.password !== formData.confirmPassword);

    if (hasErrors) {
      return;
    }

    // Don't send empty password in edit mode
    const dataToSave = { ...formData };
    if (mode === 'edit' && !formData.password) {
      delete (dataToSave as any).password;
      delete (dataToSave as any).confirmPassword;
    }

    onSave(dataToSave);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" />
        </div>
        <div>
          <h3>
            {mode === 'create' ? 'Nuevo Administrador' : 'Editar Administrador'}
          </h3>
          <p className="text-muted-foreground text-sm">
            {mode === 'create'
              ? 'Completa los datos para crear un nuevo administrador'
              : 'Modifica los datos del administrador'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="rounded-lg border border-border bg-card p-6 space-y-6">
          {/* Información Personal Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <User className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium text-foreground">Información Personal</h4>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Nombre completo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="Ej: Carlos Rodríguez"
                className={errors.name && touched.name ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
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
                  placeholder="correo@empresa.com"
                  className={`pl-10 ${errors.email && touched.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
              </div>
              {errors.email && touched.email && (
                <p className="text-sm text-destructive flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Credenciales */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium text-foreground">
                {mode === 'create' ? 'Credenciales de Acceso' : 'Cambiar Contraseña'}
              </h4>
            </div>

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
          <div className="flex flex-col-reverse md:flex-row gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full md:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full md:w-auto gap-2"
            >
              <Save className="h-4 w-4" />
              {mode === 'create' ? 'Crear Administrador' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </form>

      {/* Additional Info */}
      {mode === 'create' && (
        <div className="max-w-2xl rounded-lg bg-blue-50 border border-blue-200 p-4">
          <h4 className="font-medium text-blue-900 mb-2">Proceso de alta</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Se creará la cuenta con los datos proporcionados</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>El administrador recibirá las credenciales de acceso</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Una vez creada la cuenta, podrá acceder al sistema inmediatamente</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
