// app/(dashboard)/lideres/page.tsx
'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ListaLideres from '@/components/dashboard/lideres/ListaLideres';

export default function LideresPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Verificar autenticación y permisos
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Verificar que sea solo Pastor (solo ellos pueden gestionar líderes)
  const esPastor = user.rol?.toLowerCase() === 'pastor';

  if (!esPastor) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                No tienes permisos para acceder a este módulo. Solo los Pastores pueden gestionar líderes.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestión de Líderes</h1>
              <p className="text-gray-600 mt-1">
                Administra y asigna roles de liderazgo a los miembros
              </p>
            </div>
            <div className="bg-purple-100 px-4 py-2 rounded-lg">
              <span className="text-purple-800 font-semibold">Pastor</span>
            </div>
          </div>
        </div>

        {/* Lista de Líderes */}
        <ListaLideres userRole={user.rol || ''} />
      </div>
    </DashboardLayout>
  );
}