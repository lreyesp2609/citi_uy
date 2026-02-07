// app/(dashboard)/miembros/page.tsx
'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ListaMiembros from '@/components/dashboard/miembros/ListaMiembros';
import FormNuevaPersona from '@/components/dashboard/miembros/FormPersona';
import Toast from '@/components/ui/Toast';

interface ToastState {
  show: boolean;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

export default function MiembrosPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    setToast({ show: true, type, title, message });
  };

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Verificar que sea Pastor o Líder
  const rolesPermitidos = ['pastor', 'lider'];
  const tienePermiso = rolesPermitidos.includes(user.rol?.toLowerCase() || '');

  if (!tienePermiso) {
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
                No tienes permisos para acceder a este módulo.
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
              <h1 className="text-2xl font-bold text-gray-800">Gestión de Miembros</h1>
              <p className="text-gray-600 mt-1">
                {user.rol === 'pastor'
                  ? 'Administra todos los miembros de la iglesia'
                  : 'Visualiza los miembros de tu grupo'}
              </p>
            </div>
            {(user.rol?.toLowerCase() === 'pastor' || user.rol?.toLowerCase() === 'lider') && (
              <button
                onClick={() => setShowForm(true)}
                className="cursor-pointer bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nuevo Miembro
              </button>
            )}
          </div>
        </div>

        {/* Lista de Miembros */}
        <ListaMiembros key={refreshKey} userRole={user.rol || ''} onShowToast={showToast} />

        {/* Formulario Modal */}
        {showForm && (
          <FormNuevaPersona
            onSuccess={() => {
              setShowForm(false);
              setRefreshKey(prev => prev + 1); // Forzar recarga de la lista
            }}
            onCancel={() => setShowForm(false)}
            onShowToast={showToast}
          />
        )}

        {/* Toast de notificación */}
        {toast.show && (
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}
      </div>
    </DashboardLayout>
  );
}