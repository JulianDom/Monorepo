import { es, type Translations } from './locales/es';
import { en } from './locales/en';

export type Locale = 'es' | 'en';

export const locales: Record<Locale, Translations> = {
  es,
  en,
};

export const defaultLocale: Locale = 'es';

export { type Translations };
