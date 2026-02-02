'use client';

import { useState } from 'react';
import { ArrowLeft, ShieldCheck, AlertCircle, Mail, User, Save, Lock, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Admin, CreateAdminDTO, UpdateAdminDTO } from '@framework/shared-types';

interface AdminFormProps {
  mode: 'create' | 'edit';
  initialData: Admin | null;
  onSave: (data: CreateAdminDTO | UpdateAdminDTO) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AdminForm({ mode, initialData, onSave, onCancel, isLoading }: AdminFormProps) {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    username: initialData?.username || '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const [touched, setTouched] = useState<{
    fullName?: boolean;
    email?: boolean;
    username?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    return usernameRegex.test(username);
  };

  const validateField = (field: keyof typeof formData, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'fullName':
        if (!value.trim()) {
          newErrors.fullName = 'El nombre es requerido';
        } else if (value.trim().length < 3) {
          newErrors.fullName = 'El nombre debe tener al menos 3 caracteres';
        } else {
          delete newErrors.fullName;
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

      case 'username':
        if (!value.trim()) {
          newErrors.username = 'El nombre de usuario es requerido';
        } else if (value.trim().length < 3) {
          newErrors.username = 'El usuario debe tener al menos 3 caracteres';
        } else if (!validateUsername(value)) {
          newErrors.username = 'Solo se permiten letras, números y guiones bajos';
        } else {
          delete newErrors.username;
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
      fullName: true,
      email: true,
      username: true,
      password: true,
      confirmPassword: true,
    });

    // Validate all fields
    validateField('fullName', formData.fullName);
    validateField('email', formData.email);
    validateField('username', formData.username);
    validateField('password', formData.password);
    validateField('confirmPassword', formData.confirmPassword);

    // Check if there are any errors
    const hasErrors =
      !formData.fullName.trim() ||
      formData.fullName.trim().length < 3 ||
      !formData.email.trim() ||
      !validateEmail(formData.email) ||
      (mode === 'create' && (!formData.username.trim() || formData.username.trim().length < 3 || !validateUsername(formData.username))) ||
      (mode === 'create' && (!formData.password || formData.password.length < 6)) ||
      (mode === 'create' && formData.password !== formData.confirmPassword) ||
      (mode === 'edit' && formData.password && formData.password.length < 6) ||
      (mode === 'edit' && formData.password && formData.password !== formData.confirmPassword);

    if (hasErrors) {
      return;
    }

    if (mode === 'create') {
      const createData: CreateAdminDTO = {
        fullName: formData.fullName,
        email: formData.email,
        username: formData.username,
        password: formData.password,
      };
      onSave(createData);
    } else {
      const updateData: UpdateAdminDTO = {
        fullName: formData.fullName,
      };
      onSave(updateData);
    }
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

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-foreground">
                Nombre completo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                placeholder="Ej: Carlos Rodríguez"
                className={errors.fullName && touched.fullName ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.fullName && touched.fullName && (
                <p className="text-sm text-destructive flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.fullName}
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
                  disabled={mode === 'edit'}
                  className={`pl-10 ${errors.email && touched.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
              </div>
              {errors.email && touched.email && (
                <p className="text-sm text-destructive flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.email}
                </p>
              )}
              {mode === 'edit' && (
                <p className="text-xs text-muted-foreground">
                  El correo electrónico no puede ser modificado
                </p>
              )}
            </div>

            {/* Username - only for create */}
            {mode === 'create' && (
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
                    placeholder="usuario123"
                    className={`pl-10 ${errors.username && touched.username ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                </div>
                {errors.username && touched.username && (
                  <p className="text-sm text-destructive flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.username}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Solo letras, números y guiones bajos
                </p>
              </div>
            )}

            {/* Username display - only for edit */}
            {mode === 'edit' && initialData && (
              <div className="space-y-2">
                <Label className="text-foreground">Nombre de usuario</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    value={initialData.username}
                    disabled
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  El nombre de usuario no puede ser modificado
                </p>
              </div>
            )}
          </div>

          {/* Credenciales - only for create */}
          {mode === 'create' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium text-foreground">Credenciales de Acceso</h4>
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Contraseña <span className="text-destructive">*</span>
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
                  Confirmar contraseña <span className="text-destructive">*</span>
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
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse md:flex-row gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full md:w-auto"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full md:w-auto gap-2"
              disabled={isLoading}
            >
              <Save className="h-4 w-4" />
              {isLoading
                ? 'Guardando...'
                : mode === 'create'
                ? 'Crear Administrador'
                : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </form>

      {/* Additional Info */}
      {mode === 'create' && (
        <div className="max-w-2xl rounded-lg bg-muted border border-border p-4">
          <h4 className="font-medium text-foreground mb-2">Proceso de alta</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span>Se creará la cuenta con los datos proporcionados</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span>El administrador recibirá las credenciales de acceso</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span>Una vez creada la cuenta, podrá acceder al sistema inmediatamente</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
