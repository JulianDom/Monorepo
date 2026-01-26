import { redirect } from 'next/navigation';

export default function Home() {
  // Redirigir a dashboard - el middleware se encarga de la autenticación
  redirect('/dashboard');
}
