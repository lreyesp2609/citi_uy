"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Toast from '@/components/ui/Toast';

interface Usuario {
    id_usuario: number;
    nombre_completo: string;
    email: string;
    rol: number;
    datos_completos: boolean;
    campos_faltantes: string[];
}

interface AsignarLideresProps {
    ministerio: any;
    onSuccess: () => void;
    onCancel: () => void;
}

interface ToastState {
    show: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
}

function AsignarLideresContent({ ministerio, onSuccess, onCancel }: AsignarLideresProps) {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [selectedLideres, setSelectedLideres] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [toast, setToast] = useState<ToastState>({
        show: false,
        type: 'info',
        title: '',
        message: ''
    });

    const camposLabel: Record<string, string> = {
        nombres: 'Nombres',
        apellidos: 'Apellidos',
        numero_cedula: 'Número de cédula',
        correo_electronico: 'Correo electrónico',
        celular: 'Celular',
        genero: 'Género',
        fecha_nacimiento: 'Fecha de nacimiento',
        direccion: 'Dirección'
    };

    const formatMissingFields = (campos: string[]) =>
        campos.map((campo) => camposLabel[campo] || campo).join(', ');

    // Bloquear scroll del body
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    // Cerrar con ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onCancel]);

    useEffect(() => {
        fetchUsuarios();
        fetchLideresActuales();
    }, []);

    const showToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
        setToast({ show: true, type, title, message });
    };

    const fetchUsuarios = async () => {
        try {
            const response = await fetch('/api/usuarios');
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Error al cargar la lista de usuarios');
            }


            if (response.ok) {
                // Filtrar solo Pastores (rol 1) y Líderes (rol 2)
                const lideresDisponibles = data.data.filter((u: Usuario) => u.rol === 1 || u.rol === 2);
                setUsuarios(lideresDisponibles);
            }
        } catch (err) {
            console.error('Error al cargar usuarios:', err);
            const errorMsg = 'Error al cargar la lista de usuarios';
            setError(errorMsg);
            showToast('error', 'Error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const fetchLideresActuales = async () => {
        try {
            const response = await fetch(`/api/ministerios/${ministerio.id_ministerio}`);
            const data = await response.json();

            if (response.ok && data.lideres) {
                const lideresIds = data.lideres.map((l: any) => l.id_usuario);
                setSelectedLideres(lideresIds);
            }
        } catch (err) {
            console.error('Error al cargar líderes actuales:', err);
        }
    };

    const handleToggleLider = (usuarioId: number) => {
        const usuario = usuarios.find((u) => u.id_usuario === usuarioId);
        if (usuario && !usuario.datos_completos && !selectedLideres.includes(usuarioId)) {
            const errorMsg = `El usuario no tiene datos completos. Faltan: ${formatMissingFields(usuario.campos_faltantes)}`;
            setError(errorMsg);
            showToast('warning', 'Datos incompletos', errorMsg);
            return;
        }

        setSelectedLideres(prev => {
            if (prev.includes(usuarioId)) {
                setError('');
                return prev.filter(id => id !== usuarioId);
            } else {
                // Máximo 2 líderes
                if (prev.length >= 2) {
                    const errorMsg = 'Un ministerio puede tener máximo 2 líderes';
                    setError(errorMsg);
                    showToast('warning', 'Límite alcanzado', errorMsg);
                    return prev;
                }
                setError('');
                return [...prev, usuarioId];
            }
        });
    };

    const handleSubmit = async () => {
        if (selectedLideres.length === 0) {
            const errorMsg = 'Debes seleccionar al menos 1 líder';
            setError(errorMsg);
            showToast('error', 'Campos requeridos', errorMsg);
            return;
        }

        setSaving(true);
        setError('');

        try {
            const response = await fetch(`/api/ministerios/${ministerio.id_ministerio}/lideres`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ lideresIds: selectedLideres }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.missingDetails?.length) {
                    const missingResumen = data.missingDetails
                        .map((detalle: any) => `${detalle.nombre_completo}: ${formatMissingFields(detalle.campos_faltantes)}`)
                        .join(' | ');
                    throw new Error(`Hay líderes con datos incompletos. ${missingResumen}`);
                }
                throw new Error(data.message || 'Error al asignar líderes');
            }


            console.log('✅ Líderes asignados exitosamente');
            showToast(
                'success',
                'Líderes asignados',
                `Se ${selectedLideres.length === 1 ? 'ha asignado 1 líder' : 'han asignado ' + selectedLideres.length + ' líderes'} al ministerio correctamente`
            );

            // Esperar un momento para que el usuario vea el toast antes de cerrar
            setTimeout(() => {
                onSuccess();
            }, 1500);

        } catch (err: any) {
            const errorMsg = err.message || 'Ocurrió un error inesperado';
            setError(errorMsg);
            showToast('error', 'Error al asignar', errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const filteredUsuarios = usuarios.filter(u =>
        u.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            {toast.show && (
                <Toast
                    type={toast.type}
                    title={toast.title}
                    message={toast.message}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            <div
                className="fixed inset-0 z-[9999] overflow-y-auto"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                onClick={onCancel}
            >
                <div className="flex min-h-full items-center justify-center p-4">
                    <div
                        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg z-10">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Asignar Líderes
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {ministerio.nombre} - Selecciona 1 o 2 líderes
                                </p>
                            </div>
                            <button
                                onClick={onCancel}
                                type="button"
                                className="cursor-pointer text-gray-400 hover:text-gray-600 transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Search */}
                        <div className="p-6 border-b">
                            <div className="relative">
                                <svg
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    width="20"
                                    height="20"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar por nombre o email..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                                />
                            </div>

                            {selectedLideres.length > 0 && (
                                <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                                    </svg>
                                    <span>{selectedLideres.length} líder{selectedLideres.length > 1 ? 'es' : ''} seleccionado{selectedLideres.length > 1 ? 's' : ''}</span>
                                </div>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mx-6 mt-4 bg-red-50 border-l-4 border-red-500 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* User List */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {loading ? (
                                <div className="text-center py-8">
                                    <svg className="animate-spin h-8 w-8 mx-auto text-red-600" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="mt-2 text-gray-500">Cargando usuarios...</p>
                                </div>
                            ) : filteredUsuarios.length === 0 ? (
                                <div className="text-center py-8">
                                    <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    <p className="mt-2 text-gray-500">No se encontraron usuarios</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredUsuarios.map(usuario => (
                                        <div
                                            key={usuario.id_usuario}
                                            onClick={() => handleToggleLider(usuario.id_usuario)}
                                            className={`
                        p-4 rounded-lg border-2 cursor-pointer transition-all
                        ${selectedLideres.includes(usuario.id_usuario)
                                                    ? 'border-red-500 bg-red-50'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }
                        ${!usuario.datos_completos ? 'opacity-70 cursor-not-allowed' : ''}
                      `}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">
                                                        {usuario.nombre_completo}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {usuario.email}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        {usuario.rol === 1 ? 'Pastor' : 'Líder'}
                                                    </div>
                                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                                        {usuario.datos_completos ? (
                                                            <span className="rounded-full bg-green-100 px-2 py-1 text-green-700">
                                                                Datos completos
                                                            </span>
                                                        ) : (
                                                            <>
                                                                <span className="rounded-full bg-yellow-100 px-2 py-1 text-yellow-700">
                                                                    Datos incompletos
                                                                </span>
                                                                <span className="text-yellow-700">
                                                                    Faltan: {formatMissingFields(usuario.campos_faltantes)}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                {selectedLideres.includes(usuario.id_usuario) && (
                                                    <div className="ml-4">
                                                        <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex gap-4 p-6 border-t">
                            <button
                                onClick={onCancel}
                                disabled={saving}
                                className="cursor-pointer flex-1 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={saving || selectedLideres.length === 0}
                                className="cursor-pointer flex-1 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Guardando...
                                    </>
                                ) : (
                                    'Asignar Líderes'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function AsignarLideres(props: AsignarLideresProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <AsignarLideresContent {...props} />,
        document.body
    );
}