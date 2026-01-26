import type { Metadata } from 'next';
import { APP } from '@/config';

interface PageSeoOptions {
  title: string;
  description?: string;
  noIndex?: boolean;
}

/**
 * Genera metadata para páginas de forma consistente
 *
 * @example
 * ```tsx
 * // app/users/page.tsx
 * export const metadata = generatePageMetadata({
 *   title: 'Usuarios',
 *   description: 'Gestión de usuarios del sistema',
 * });
 * ```
 */
export function generatePageMetadata({
  title,
  description,
  noIndex = false,
}: PageSeoOptions): Metadata {
  const fullTitle = `${title} | ${APP.NAME}`;

  return {
    title: fullTitle,
    description: description || APP.DESCRIPTION,
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

/**
 * Metadata base para el layout root
 */
export const rootMetadata: Metadata = {
  title: {
    default: APP.NAME,
    template: `%s | ${APP.NAME}`,
  },
  description: APP.DESCRIPTION,
  robots: {
    index: false, // Admin panels no deben indexarse
    follow: false,
  },
};
