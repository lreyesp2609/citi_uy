'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: string[]; // Roles permitidos (opcional)
}

export default function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }

    // Verificar roles si se especificaron
    if (!loading && isAuthenticated && requireRole && user) {
      if (!requireRole.includes(user.rol)) {
        router.push('/dashboard'); // Redirigir a dashboard si no tiene el rol
      }
    }
  }, [loading, isAuthenticated, user, router, requireRole]);

  // Mostrar loader mientras verifica
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // No mostrar nada si no está autenticado (se está redirigiendo)
  if (!isAuthenticated) {
    return null;
  }

  // Verificar rol
  if (requireRole && user && !requireRole.includes(user.rol)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-red-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  // Usuario autenticado y con rol correcto
  return <>{children}</>;
}