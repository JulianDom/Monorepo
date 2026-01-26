import { redirect } from 'next/navigation';
import { ROUTES } from '@/config';

/**
 * Página principal - redirige al dashboard
 */
export default function HomePage() {
  redirect(ROUTES.DASHBOARD);
}
