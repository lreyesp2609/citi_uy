// components/dashboard/PastorModules.tsx
'use client';

import { useAuth } from '@/providers/AuthProvider';
import UserInfoCard from './UserInfoCard';
import DashboardStats from './DashboardStats';

export default function PastorModules() {
  const { user } = useAuth();

  // Estadísticas específicas para Pastor
  const pastorStats = [
    {
      title: 'Miembros Totales',
      value: 150,
      subtitle: 'Miembros activos',
      color: 'blue' as const
    },
    {
      title: 'Eventos',
      value: 24,
      subtitle: 'Este mes',
      color: 'green' as const
    },
    {
      title: 'Líderes',
      value: 12,
      subtitle: 'En diferentes áreas',
      color: 'purple' as const
    }
  ];

  return (
    <>
      {/* Información del usuario */}
      {user && <UserInfoCard user={user} />}

      {/* Estadísticas */}
      <DashboardStats stats={pastorStats} />

      {/* Módulos específicos del Pastor */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Módulos de Gestión</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Gestión de Miembros */}
          <a href="/miembros" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer block">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Gestión de Miembros</h4>
            <p className="text-sm text-gray-600">Administra todos los miembros de la iglesia</p>
          </a>

          {/* Gestión de Líderes */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Gestión de Líderes</h4>
            <p className="text-sm text-gray-600">Supervisa y asigna líderes de áreas</p>
          </div>

          {/* Programación de Eventos */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Eventos</h4>
            <p className="text-sm text-gray-600">Planifica y gestiona eventos de la iglesia</p>
          </div>

          {/* Reportes */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Reportes</h4>
            <p className="text-sm text-gray-600">Visualiza reportes y estadísticas generales</p>
          </div>

          {/* Finanzas */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Finanzas</h4>
            <p className="text-sm text-gray-600">Control de ofrendas y donaciones</p>
          </div>

          {/* Configuración */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Configuración</h4>
            <p className="text-sm text-gray-600">Ajustes del sistema y permisos</p>
          </div>
        </div>
      </div>
    </>
  );
}