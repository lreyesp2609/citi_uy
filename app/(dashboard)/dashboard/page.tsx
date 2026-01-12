// app/(dashboard)/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PastorModules from '@/components/dashboard/PastorModules';
import LiderModules from '@/components/dashboard/LiderModules';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirigir a login si no está autenticado
  useEffect(() => {
    if (!loading && !user) {
      console.log('❌ No hay usuario autenticado, redirigiendo a login...');
      router.replace('/'); // usar replace en vez de push
    }
  }, [loading, user, router]);

  // Mostrar loader mientras carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario después de cargar, mostrar loader mientras redirige
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  // Debug: Mostrar en consola el rol del usuario
  console.log('✅ Usuario en Dashboard:', user);
  console.log('✅ Rol del usuario:', user.rol);

  return (
    <DashboardLayout>
      {/* Renderizar módulos según el rol - usar toLowerCase() para comparar */}
      {user.rol?.toLowerCase() === 'pastor' && <PastorModules />}
      {user.rol?.toLowerCase() === 'lider' && <LiderModules />}
      
      {/* Mensaje para roles no definidos */}
      {user.rol?.toLowerCase() !== 'pastor' && user.rol?.toLowerCase() !== 'lider' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Rol no reconocido: <strong>{user.rol}</strong>. Por favor contacta al administrador.
              </p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}