'use client';

import { useCallback, useMemo } from 'react';
import { locales, defaultLocale, type Locale, type Translations } from '@/i18n';

// Tipo para paths anidados de las traducciones
type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}` | K
          : K
        : never;
    }[keyof T]
  : never;

type TranslationKey = NestedKeyOf<Translations>;

interface UseTranslationsOptions {
  locale?: Locale;
}

/**
 * Hook para traducciones
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t, locale, setLocale } = useTranslations();
 *
 *   return (
 *     <div>
 *       <h1>{t('common.save')}</h1>
 *       <p>{t('success.created', { entity: 'Usuario' })}</p>
 *
 *       <select value={locale} onChange={(e) => setLocale(e.target.value)}>
 *         <option value="es">Español</option>
 *         <option value="en">English</option>
 *       </select>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTranslations({ locale: initialLocale }: UseTranslationsOptions = {}) {
  // En una app real, esto vendría de un contexto o cookie
  const locale = initialLocale ?? defaultLocale;

  const translations = useMemo(() => {
    return locales[locale] ?? locales[defaultLocale];
  }, [locale]);

  /**
   * Obtener traducción por key con interpolación de variables
   */
  const t = useCallback(
    (key: string, variables?: Record<string, string | number>): string => {
      // Navegar por el objeto de traducciones
      const keys = key.split('.');
      let value: unknown = translations;

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          // Key no encontrada, retornar la key
          console.warn(`Translation key not found: ${key}`);
          return key;
        }
      }

      if (typeof value !== 'string') {
        console.warn(`Translation value is not a string: ${key}`);
        return key;
      }

      // Interpolar variables
      if (variables) {
        return Object.entries(variables).reduce((acc, [varKey, varValue]) => {
          return acc.replace(new RegExp(`{{${varKey}}}`, 'g'), String(varValue));
        }, value);
      }

      return value;
    },
    [translations]
  );

  /**
   * Verificar si una key existe
   */
  const hasKey = useCallback(
    (key: string): boolean => {
      const keys = key.split('.');
      let value: unknown = translations;

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          return false;
        }
      }

      return typeof value === 'string';
    },
    [translations]
  );

  return {
    t,
    hasKey,
    locale,
    translations,
  };
}

/**
 * Función helper para usar fuera de componentes
 */
export function getTranslation(
  key: string,
  variables?: Record<string, string | number>,
  locale: Locale = defaultLocale
): string {
  const translations = locales[locale] ?? locales[defaultLocale];

  const keys = key.split('.');
  let value: unknown = translations;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }

  if (typeof value !== 'string') {
    return key;
  }

  if (variables) {
    return Object.entries(variables).reduce((acc, [varKey, varValue]) => {
      return acc.replace(new RegExp(`{{${varKey}}}`, 'g'), String(varValue));
    }, value);
  }

  return value;
}
