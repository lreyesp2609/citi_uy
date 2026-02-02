// app/(dashboard)/ministerio/page.tsx
'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { ministeriosService, Ministerio } from '@/lib/services/ministeriosService';
import FormMinisterio from '@/components/ministerios/FormMinisterio';
import AsignarLideres from '@/components/ministerios/AsignarLideres';
import Toast from '@/components/ui/Toast';

interface ToastData {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

export default function MinisterioPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ministerios, setMinisterios] = useState<Ministerio[]>([]);
  const [loadingMinisterios, setLoadingMinisterios] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [ministerioToEdit, setMinisterioToEdit] = useState<Ministerio | undefined>();
  const [ministerioToAssignLideres, setMinisterioToAssignLideres] = useState<Ministerio | undefined>();
  const [showMenuId, setShowMenuId] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [activeLogo, setActiveLogo] = useState<{ url: string; nombre: string } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    show: boolean;
    ministerio?: Ministerio;
    action: 'deshabilitar' | 'habilitar' | null;
  }>({ show: false, action: null });

  // Verificar autenticación y permisos
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      cargarMinisterios();
    }
  }, [user]);

  const cargarMinisterios = async () => {
    setLoadingMinisterios(true);
    setError('');

    try {
      const result = await ministeriosService.getAll();

      if (result.success && result.data) {
        setMinisterios(result.data);
        console.log('✅ Ministerios cargados:', result.total);
      } else {
        setError(result.message || 'Error al cargar ministerios');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoadingMinisterios(false);
    }
  };

  const handleEdit = (ministerio: Ministerio) => {
    setMinisterioToEdit(ministerio);
    setShowMenuId(null);
  };

  const handleAsignarLideres = (ministerio: Ministerio) => {
    setMinisterioToAssignLideres(ministerio);
    setShowMenuId(null);
  };

  const handleToggleEstado = (ministerio: Ministerio) => {
    setConfirmAction({
      show: true,
      ministerio,
      action: ministerio.activo ? 'deshabilitar' : 'habilitar'
    });
    setShowMenuId(null);
  };

  const confirmarToggleEstado = async () => {
    if (!confirmAction.ministerio) return;

    const ministerio = confirmAction.ministerio;
    const action = confirmAction.action;

    setConfirmAction({ show: false, action: null });

    try {
      const result = action === 'deshabilitar'
        ? await ministeriosService.deshabilitar(ministerio.id_ministerio)
        : await ministeriosService.habilitar(ministerio.id_ministerio);

      if (result.success) {
        setToast({
          type: 'success',
          title: action === 'deshabilitar' ? 'Ministerio deshabilitado' : 'Ministerio habilitado',
          message: result.message || 'Operación exitosa'
        });
        cargarMinisterios();
      } else {
        setToast({
          type: 'error',
          title: 'Error',
          message: result.message || 'Error en la operación'
        });
      }
    } catch (err: any) {
      setToast({
        type: 'error',
        title: 'Error',
        message: err.message || 'Error inesperado'
      });
    }
  };

  const getIconoMinisterio = (nombre: string) => {
    const nombreLower = nombre.toLowerCase();

    if (nombreLower.includes('alabanza') || nombreLower.includes('adoración') || nombreLower.includes('música')) {
      return (
        <div className="bg-green-100 p-3 rounded-lg">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
      );
    } else if (nombreLower.includes('enseñanza') || nombreLower.includes('educación') || nombreLower.includes('escuela')) {
      return (
        <div className="bg-blue-100 p-3 rounded-lg">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      );
    } else if (nombreLower.includes('niños') || nombreLower.includes('infancia')) {
      return (
        <div className="bg-purple-100 p-3 rounded-lg">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      );
    } else if (nombreLower.includes('joven') || nombreLower.includes('juventud')) {
      return (
        <div className="bg-yellow-100 p-3 rounded-lg">
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="bg-indigo-100 p-3 rounded-lg">
          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      );
    }
  };

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

  const rolesPermitidos = ['pastor', 'lider'];
  const tienePermiso = rolesPermitidos.includes(user.rol?.toLowerCase() || '');
  const esPastor = user.rol?.toLowerCase() === 'pastor';

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
              <h1 className="text-2xl font-bold text-gray-800">Gestión de Ministerios</h1>
              <p className="text-gray-600 mt-1">
                {esPastor
                  ? 'Administra todos los ministerios de la iglesia'
                  : 'Visualiza los ministerios disponibles'}
              </p>
            </div>
            {esPastor && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="cursor-pointer bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nuevo Ministerio
              </button>
            )}
          </div>
        </div>

        {/* Loading / Error */}
        {loadingMinisterios && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="ml-3 text-gray-600">Cargando ministerios...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Grid de Ministerios */}
        {!loadingMinisterios && ministerios.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ministerios.map((ministerio) => (
              <div
                key={ministerio.id_ministerio}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between mb-4">
                  {ministerio.logo_url ? (
                    <button
                      type="button"
                      onClick={() => setActiveLogo({ url: ministerio.logo_url as string, nombre: ministerio.nombre })}
                      className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg"
                      aria-label={`Ver logo del ministerio ${ministerio.nombre}`}
                    >
                      <img
                        src={ministerio.logo_url}
                        alt={ministerio.nombre}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    </button>
                  ) : (
                    getIconoMinisterio(ministerio.nombre)
                  )}
                  {esPastor && (
                    <div className="relative">
                      <button
                        onClick={() => setShowMenuId(showMenuId === ministerio.id_ministerio ? null : ministerio.id_ministerio)}
                        className="cursor-pointer text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                      {showMenuId === ministerio.id_ministerio && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowMenuId(null)}
                          ></div>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
                            <button
                              onClick={() => handleEdit(ministerio)}
                              className="cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Editar
                            </button>
                            <button
                              onClick={() => handleAsignarLideres(ministerio)}
                              className="cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                              Asignar Líderes
                            </button>
                            <button
                              onClick={() => handleToggleEstado(ministerio)}
                              className={`cursor-pointer w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 ${ministerio.activo ? 'text-red-600' : 'text-green-600'
                                }`}
                            >
                              {ministerio.activo ? (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                  </svg>
                                  Deshabilitar
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Habilitar
                                </>
                              )}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{ministerio.nombre}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {ministerio.descripcion || 'Sin descripción'}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {ministerio.lideres && ministerio.lideres.length > 0
                        ? `Líder${ministerio.lideres.length > 1 ? 'es' : ''}: ${ministerio.lideres.map(l => l.nombre_completo.split(' ')[0]).join(', ')}`
                        : 'Sin líderes asignados'}
                    </span>
                  </div>
                  <div className="flex items-center justify-end">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${ministerio.activo
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                      }`}>
                      {ministerio.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sin ministerios */}
        {!loadingMinisterios && ministerios.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay ministerios registrados</h3>
            <p className="text-gray-600 mb-4">Comienza creando el primer ministerio de la iglesia</p>
            {esPastor && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="cursor-pointer bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Crear Ministerio
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      {showCreateForm && (
        <FormMinisterio
          onSuccess={() => {
            setShowCreateForm(false);
            cargarMinisterios();
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {ministerioToEdit && (
        <FormMinisterio
          ministerio={ministerioToEdit}
          onSuccess={() => {
            setMinisterioToEdit(undefined);
            cargarMinisterios();
          }}
          onCancel={() => setMinisterioToEdit(undefined)}
        />
      )}

      {ministerioToAssignLideres && (
        <AsignarLideres
          ministerio={ministerioToAssignLideres}
          onSuccess={() => {
            setMinisterioToAssignLideres(undefined);
            cargarMinisterios();
          }}
          onCancel={() => setMinisterioToAssignLideres(undefined)}
        />
      )}

      {/* Modal de confirmación */}
      {confirmAction.show && confirmAction.ministerio && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0">
                <svg className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {confirmAction.action === 'deshabilitar' ? 'Deshabilitar Ministerio' : 'Habilitar Ministerio'}
                </h3>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              {confirmAction.action === 'deshabilitar'
                ? `¿Está seguro que desea deshabilitar el ministerio "${confirmAction.ministerio.nombre}"? Los líderes no podrán acceder a él hasta que sea habilitado nuevamente.`
                : `¿Está seguro que desea habilitar el ministerio "${confirmAction.ministerio.nombre}"?`}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmAction({ show: false, action: null })}
                className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarToggleEstado}
                className={`cursor-pointer px-4 py-2 text-white rounded-lg transition ${confirmAction.action === 'deshabilitar'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
                  }`}
              >
                {confirmAction.action === 'deshabilitar' ? 'Sí, deshabilitar' : 'Sí, habilitar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeLogo && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          onClick={() => setActiveLogo(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Logo de {activeLogo.nombre}</h3>
                <p className="text-sm text-gray-500">Vista previa ampliada</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveLogo(null)}
                className="cursor-pointer text-gray-400 hover:text-gray-600"
                aria-label="Cerrar vista previa"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-center">
              <img
                src={activeLogo.url}
                alt={`Logo de ${activeLogo.nombre}`}
                className="max-h-[60vh] w-auto rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </DashboardLayout>
  );
}