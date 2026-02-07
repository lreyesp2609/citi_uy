// components/dashboard/DashboardLayout.tsx
'use client';

import { useAuth } from '@/providers/AuthProvider';
import { usePathname, useRouter } from 'next/navigation';
import ChangePasswordModal from './ChangePasswordModal';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, updatePasswordRequirement } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isMainDashboard = pathname === '/dashboard';

  const routeNames: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/miembros': 'Gestión de Miembros',
    '/lideres': 'Gestión de Líderes',
    '/ministerio': 'Gestión deMinisterios',
    '/eventos': 'Eventos',
    '/reportes': 'Reportes',
    '/finanzas': 'Finanzas',
    '/configuracion': 'Configuración',
  };

  const currentPageName = routeNames[pathname] || 'Módulo';

  const handlePasswordChangeSuccess = () => {
    // Actualizar el estado del usuario para quitar el requisito de cambio
    updatePasswordRequirement(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Modal de cambio de contraseña obligatorio */}
      {user?.requiere_cambio_password && (
        <ChangePasswordModal onSuccess={handlePasswordChangeSuccess} />
      )}

      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">CENTI CITI</h1>
              {user && (
                <p className="text-sm text-gray-600">
                  {user.nombre} · <span className="font-medium text-red-600">{user.rol}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/configuracion')}
                className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition shadow flex items-center gap-2"
                title="Configuración"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Configuración
              </button>
              <button
                onClick={logout}
                className="cursor-pointer bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition shadow"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isMainDashboard ? (
          <div className="bg-gradient-to-r from-red-700 to-red-600 rounded-lg shadow-lg p-6 text-white mb-8">
            <h2 className="text-3xl font-bold mb-2">
              ¡Bienvenido, {user?.nombre?.split(' ')[0]}! 👋
            </h2>
            <p className="text-red-100">
              Iglesia Cristiana Mundial - Sistema de Gestión
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="cursor-pointer hover:text-red-600 transition flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </button>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-800 font-medium">{currentPageName}</span>
            </div>

            <button
              onClick={() => router.back()}
              className="cursor-pointer flex items-center gap-2 text-gray-600 hover:text-red-600 transition mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Regresar
            </button>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}