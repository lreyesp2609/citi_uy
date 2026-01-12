// components/dashboard/LiderModules.tsx
'use client';

import { useAuth } from '@/providers/AuthProvider';
import UserInfoCard from './UserInfoCard';
import DashboardStats from './DashboardStats';

export default function LiderModules() {
  const { user } = useAuth();

  // Estadísticas específicas para Líder
  const liderStats = [
    {
      title: 'Mi Grupo',
      value: 25,
      subtitle: 'Miembros asignados',
      color: 'blue' as const
    },
    {
      title: 'Actividades',
      value: 8,
      subtitle: 'Este mes',
      color: 'green' as const
    },
    {
      title: 'Asistencia',
      value: 89,
      subtitle: 'Porcentaje promedio',
      color: 'purple' as const
    }
  ];

  return (
    <>
      {/* Información del usuario */}
      {user && <UserInfoCard user={user} />}

      {/* Estadísticas */}
      <DashboardStats stats={liderStats} />

      {/* Módulos específicos del Líder */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Mis Responsabilidades</h3>
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

          {/* Registro de Asistencia */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Asistencia</h4>
            <p className="text-sm text-gray-600">Registrar asistencia de actividades</p>
          </div>

          {/* Actividades */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Actividades</h4>
            <p className="text-sm text-gray-600">Planificar actividades de mi grupo</p>
          </div>

          {/* Reportes de Grupo */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Reportes</h4>
            <p className="text-sm text-gray-600">Enviar reportes a la dirección</p>
          </div>

          {/* Comunicación */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Comunicación</h4>
            <p className="text-sm text-gray-600">Mensajes y notificaciones al grupo</p>
          </div>

          {/* Recursos */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Recursos</h4>
            <p className="text-sm text-gray-600">Material de apoyo y guías</p>
          </div>
        </div>
      </div>
    </>
  );
}