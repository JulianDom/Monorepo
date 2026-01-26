import { useState, useRef, useEffect } from 'react';
import { Lock, Mail, AlertCircle, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => boolean;
}

type LoginError = 
  | 'invalid-credentials' 
  | 'user-disabled' 
  | 'technical-error'
  | 'field-required'
  | 'invalid-email'
  | null;

type ForgotPasswordError =
  | 'email-not-found'
  | 'technical-error'
  | 'invalid-email'
  | null;

type VerifyCodeError =
  | 'invalid-code'
  | 'code-already-used'
  | 'incomplete-code'
  | 'technical-error'
  | null;

type ViewState = 'login' | 'forgot-password' | 'verify-code' | 'code-sent';

export function LoginScreen({ onLogin }: LoginScreenProps) {
  // View state
  const [currentView, setCurrentView] = useState<ViewState>('login');

  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<LoginError>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState<ForgotPasswordError>(null);
  const [forgotFieldError, setForgotFieldError] = useState<string | null>(null);
  const [isSendingCode, setIsSendingCode] = useState(false);

  // Verify code states
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [verifyError, setVerifyError] = useState<VerifyCodeError>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // === LOGIN HANDLERS ===

  const validateFields = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!email.trim()) {
      errors.email = 'Requerido';
      isValid = false;
    } else if (!validateEmail(email)) {
      errors.email = 'Formato email inválido';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Requerido';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError(null);
    setFieldErrors({});

    if (!validateFields()) {
      return;
    }

    setIsLoading(true);

    // Simulate delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      // Check for disabled user
      if (email === 'ana.martinez@empresa.com') {
        setError('user-disabled');
        setIsLoading(false);
        return;
      }

      // Call the onLogin function from App.tsx
      const success = onLogin(email, password);

      if (!success) {
        setError('invalid-credentials');
      }
    } catch (err) {
      setError('technical-error');
    } finally {
      setIsLoading(false);
    }
  };

  const getLoginErrorMessage = (): string | null => {
    switch (error) {
      case 'invalid-credentials':
        return 'Correo electrónico o contraseña incorrectos. Por favor, verifica tus credenciales e intenta nuevamente.';
      case 'user-disabled':
        return 'Tu cuenta ha sido deshabilitada. Por favor, contacta al administrador del sistema para más información.';
      case 'technical-error':
        return 'Error técnico al conectar con el servidor. Por favor, verifica tu conexión e intenta nuevamente.';
      default:
        return null;
    }
  };

  const handleRetry = () => {
    setError(null);
    setFieldErrors({});
    setEmail('');
    setPassword('');
  };

  // === FORGOT PASSWORD HANDLERS ===

  const simulateSendCode = async (email: string): Promise<{
    success: boolean;
    error?: ForgotPasswordError;
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simular correo no encontrado (para demo, emails que no sean del dominio empresa.com)
    if (!email.includes('@empresa.com')) {
      return { success: false, error: 'email-not-found' };
    }

    // Simular error técnico (5% probabilidad)
    if (Math.random() < 0.05) {
      return { success: false, error: 'technical-error' };
    }

    return { success: true };
  };

  const handleForgotPassword = () => {
    setCurrentView('forgot-password');
    setForgotEmail('');
    setForgotError(null);
    setForgotFieldError(null);
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();

    setForgotError(null);
    setForgotFieldError(null);

    if (!forgotEmail.trim()) {
      setForgotFieldError('Requerido');
      return;
    }

    if (!validateEmail(forgotEmail)) {
      setForgotFieldError('Formato email inválido');
      return;
    }

    setIsSendingCode(true);

    try {
      const result = await simulateSendCode(forgotEmail);

      if (result.success) {
        setCurrentView('code-sent');
        // Auto navegar a verify code después de 2 segundos
        setTimeout(() => {
          setCurrentView('verify-code');
        }, 2000);
      } else {
        setForgotError(result.error || null);
      }
    } catch (err) {
      setForgotError('technical-error');
    } finally {
      setIsSendingCode(false);
    }
  };

  const getForgotPasswordErrorMessage = (): string | null => {
    switch (forgotError) {
      case 'email-not-found':
        return 'Si el correo electrónico está registrado en nuestro sistema, recibirás un código de verificación en los próximos minutos.';
      case 'technical-error':
        return 'Error técnico al procesar tu solicitud. Por favor, intenta nuevamente más tarde.';
      default:
        return null;
    }
  };

  // === VERIFY CODE HANDLERS ===

  const handleCodeChange = (index: number, value: string) => {
    // Solo permitir números
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setVerifyError(null);

    // Auto-focus al siguiente input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      setCode(pastedData.split(''));
      setVerifyError(null);
      inputRefs[5].current?.focus();
    }
  };

  const simulateVerifyCode = async (code: string): Promise<{
    success: boolean;
    error?: VerifyCodeError;
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simular código ya utilizado
    if (code === '111111') {
      return { success: false, error: 'code-already-used' };
    }

    // Simular código inválido
    if (code !== '123456') {
      return { success: false, error: 'invalid-code' };
    }

    // Simular error técnico (5% probabilidad)
    if (Math.random() < 0.05) {
      return { success: false, error: 'technical-error' };
    }

    return { success: true };
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    setVerifyError(null);

    const codeString = code.join('');

    // Validar código completo
    if (codeString.length !== 6) {
      setVerifyError('incomplete-code');
      return;
    }

    setIsVerifying(true);

    try {
      const result = await simulateVerifyCode(codeString);

      if (result.success) {
        // Código verificado correctamente - aquí normalmente redirigirías a reset password
        // Por ahora volvemos al login
        setCurrentView('login');
        setEmail(forgotEmail);
        setForgotEmail('');
        setCode(['', '', '', '', '', '']);
      } else {
        setVerifyError(result.error || null);
      }
    } catch (err) {
      setVerifyError('technical-error');
    } finally {
      setIsVerifying(false);
    }
  };

  const getVerifyCodeErrorMessage = (): string | null => {
    switch (verifyError) {
      case 'incomplete-code':
        return 'Por favor, ingresa el código completo de 6 dígitos.';
      case 'invalid-code':
        return 'El código ingresado es inválido. Por favor, verifica e intenta nuevamente.';
      case 'code-already-used':
        return 'Este código ya ha sido utilizado. Por favor, solicita un nuevo código.';
      case 'technical-error':
        return 'Error técnico al validar el código. Por favor, intenta nuevamente.';
      default:
        return null;
    }
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
    setForgotEmail('');
    setForgotError(null);
    setForgotFieldError(null);
    setCode(['', '', '', '', '', '']);
    setVerifyError(null);
  };

  // Auto-focus primer input del código
  useEffect(() => {
    if (currentView === 'verify-code') {
      inputRefs[0].current?.focus();
    }
  }, [currentView]);

  // === RENDER LOGIN VIEW ===

  if (currentView === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Lock className="h-6 w-6 md:h-7 md:w-7" />
              </div>
            </div>
            <h1 className="text-foreground mb-2">Panel Administrativo</h1>
            <p className="text-muted-foreground text-sm">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Error global */}
          {error && (
            <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-destructive leading-relaxed">
                    {getLoginErrorMessage()}
                  </p>
                  {error === 'technical-error' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetry}
                      className="mt-3 border-destructive/30 text-destructive hover:bg-destructive/10"
                    >
                      Reintentar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors({ ...fieldErrors, email: undefined });
                    }
                    if (error) setError(null);
                  }}
                  placeholder="tu.correo@empresa.com"
                  className={`pl-10 ${fieldErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-sm text-destructive flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors({ ...fieldErrors, password: undefined });
                    }
                    if (error) setError(null);
                  }}
                  placeholder="••••••••"
                  className={`pl-10 ${fieldErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.password && (
                <p className="text-sm text-destructive flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary hover:underline"
                disabled={isLoading}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Para demostración, usa:
            </p>
            <div className="space-y-1.5 text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
              <p>📧 <strong>Cualquier email válido</strong></p>
              <p>🔑 <strong>Contraseña:</strong> admin123</p>
              <p className="text-destructive/80 mt-2">
                ⚠️ <strong>Usuario deshabilitado:</strong> ana.martinez@empresa.com
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // === RENDER FORGOT PASSWORD VIEW ===

  if (currentView === 'forgot-password') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-6 md:p-8">
          {/* Back button */}
          <button
            onClick={handleBackToLogin}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            disabled={isSendingCode}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </button>

          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Mail className="h-6 w-6 md:h-7 md:w-7" />
              </div>
            </div>
            <h1 className="text-foreground mb-2">Recuperar Contraseña</h1>
            <p className="text-muted-foreground text-sm">
              Ingresa tu correo electrónico y te enviaremos un código de verificación
            </p>
          </div>

          {/* Error global */}
          {forgotError && (
            <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-destructive leading-relaxed">
                    {getForgotPasswordErrorMessage()}
                  </p>
                  {forgotError === 'technical-error' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setForgotError(null)}
                      className="mt-3 border-destructive/30 text-destructive hover:bg-destructive/10"
                    >
                      Reintentar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Forgot Password Form */}
          <form onSubmit={handleSendCode} className="space-y-4 md:space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="forgot-email" className="text-foreground">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="forgot-email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => {
                    setForgotEmail(e.target.value);
                    setForgotFieldError(null);
                    setForgotError(null);
                  }}
                  placeholder="tu.correo@empresa.com"
                  className={`pl-10 ${forgotFieldError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  disabled={isSendingCode}
                />
              </div>
              {forgotFieldError && (
                <p className="text-sm text-destructive flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {forgotFieldError}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isSendingCode}
            >
              {isSendingCode ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando código...
                </>
              ) : (
                'Enviar Código'
              )}
            </Button>
          </form>

          {/* Demo info */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Para demostración:
            </p>
            <div className="space-y-1.5 text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
              <p>📧 Usa un email con dominio <strong>@empresa.com</strong></p>
              <p>🔢 El código de verificación será: <strong>123456</strong></p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // === RENDER CODE SENT VIEW ===

  if (currentView === 'code-sent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-6 md:p-8">
          {/* Success icon */}
          <div className="text-center mb-6 md:mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-lg bg-green-500 text-white">
                <CheckCircle className="h-6 w-6 md:h-7 md:w-7" />
              </div>
            </div>
            <h1 className="text-foreground mb-2">Código Enviado</h1>
            <p className="text-muted-foreground text-sm">
              Hemos enviado un código de verificación de 6 dígitos a
            </p>
            <p className="text-foreground font-medium mt-2">
              {forgotEmail}
            </p>
          </div>

          {/* Loading indicator */}
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Redirigiendo a la pantalla de verificación...
          </p>
        </Card>
      </div>
    );
  }

  // === RENDER VERIFY CODE VIEW ===

  if (currentView === 'verify-code') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-6 md:p-8">
          {/* Back button */}
          <button
            onClick={handleBackToLogin}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            disabled={isVerifying}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </button>

          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Lock className="h-6 w-6 md:h-7 md:w-7" />
              </div>
            </div>
            <h1 className="text-foreground mb-2">Verificar Código</h1>
            <p className="text-muted-foreground text-sm">
              Ingresa el código de 6 dígitos enviado a
            </p>
            <p className="text-foreground font-medium mt-1 text-sm">
              {forgotEmail}
            </p>
          </div>

          {/* Error global */}
          {verifyError && (
            <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-destructive leading-relaxed">
                    {getVerifyCodeErrorMessage()}
                  </p>
                  {verifyError === 'code-already-used' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentView('forgot-password');
                        setCode(['', '', '', '', '', '']);
                        setVerifyError(null);
                      }}
                      className="mt-3 border-destructive/30 text-destructive hover:bg-destructive/10"
                    >
                      Solicitar Nuevo Código
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Verify Code Form */}
          <form onSubmit={handleVerifyCode} className="space-y-6">
            {/* Code Input */}
            <div className="space-y-3">
              <Label className="text-foreground text-center block">
                Código de Verificación
              </Label>
              <div className="flex gap-2 justify-center">
                {code.map((digit, index) => (
                  <Input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    onPaste={index === 0 ? handleCodePaste : undefined}
                    className={`w-12 h-12 text-center text-lg font-semibold ${
                      verifyError ? 'border-destructive focus-visible:ring-destructive' : ''
                    }`}
                    disabled={isVerifying}
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar Código'
              )}
            </Button>

            {/* Resend code */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setCurrentView('forgot-password');
                  setCode(['', '', '', '', '', '']);
                  setVerifyError(null);
                }}
                className="text-sm text-primary hover:underline"
                disabled={isVerifying}
              >
                ¿No recibiste el código? Reenviar
              </button>
            </div>
          </form>

          {/* Demo info */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Para demostración:
            </p>
            <div className="space-y-1.5 text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
              <p>✅ <strong>Código válido:</strong> 123456</p>
              <p>❌ <strong>Código ya usado:</strong> 111111</p>
              <p>❌ <strong>Cualquier otro código:</strong> inválido</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}