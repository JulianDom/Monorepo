# Value Objects

Esta carpeta contiene los **Value Objects** del dominio.

## ¿Qué es un Value Object?

Los Value Objects son objetos inmutables que:
- Se identifican por sus **valores**, no por una identidad
- Son **inmutables**: No cambian después de crearse
- Implementan **igualdad por valor**: Dos VO con mismos valores son iguales
- Encapsulan **validaciones y reglas**: Email válido, contraseña segura, etc.

## Características

- ✅ **Inmutables**: Una vez creados, no cambian
- ✅ **Auto-validados**: Se validan en el constructor
- ✅ **Sin identidad**: Se comparan por valor, no por ID
- ✅ **Reutilizables**: Pueden usarse en múltiples entidades

## Ejemplo

```typescript
export class Email {
  private readonly value: string;

  constructor(email: string) {
    this.validate(email);
    this.value = email.toLowerCase().trim();
  }

  private validate(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
```

## Casos de uso comunes

- `Email`: Valida formato de email
- `Password`: Valida seguridad de contraseña, hash
- `Money`: Maneja cantidades monetarias con precisión
- `DateRange`: Valida rangos de fechas
- `PhoneNumber`: Valida formatos de teléfono
- `UUID`: Identificadores únicos

## Reglas

1. Los VO son **inmutables**
2. Los VO se **validan en el constructor**
3. Los VO implementan **igualdad por valor**
4. Los VO NO tienen decoradores de frameworks
