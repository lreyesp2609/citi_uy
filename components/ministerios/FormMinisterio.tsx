"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Toast from '@/components/ui/Toast';

interface FormMinisterioProps {
    ministerio?: any;
    onSuccess: () => void;
    onCancel: () => void;
}

interface ToastState {
    show: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
}

function FormMinisterioContent({ ministerio, onSuccess, onCancel }: FormMinisterioProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const isEditing = !!ministerio;

    const [toast, setToast] = useState<ToastState>({
        show: false,
        type: 'info',
        title: '',
        message: ''
    });

    const [formData, setFormData] = useState({
        nombre: ministerio?.nombre || '',
        descripcion: ministerio?.descripcion || '',
        logo_url: ministerio?.logo_url || ''
    });

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const showToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
        setToast({ show: true, type, title, message });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validación de campos obligatorios
            if (!formData.nombre.trim() || !formData.descripcion.trim()) {
                const errorMsg = 'Los campos Nombre y Descripción son obligatorios';
                setError(errorMsg);
                showToast('error', 'Campos requeridos', errorMsg);
                setLoading(false);
                return;
            }

            const url = isEditing
                ? `/api/ministerios/${ministerio.id_ministerio}`
                : '/api/ministerios';

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                // Traducir mensajes técnicos a lenguaje más amigable
                let userFriendlyMessage = data.error || 'Ocurrió un error inesperado';

                if (userFriendlyMessage.includes('nombre') && userFriendlyMessage.includes('existe')) {
                    userFriendlyMessage = 'Ya existe un ministerio con este nombre';
                } else if (userFriendlyMessage.includes('duplicado')) {
                    userFriendlyMessage = 'Ya existe un ministerio con estos datos';
                }

                setError(userFriendlyMessage);
                showToast('error', 'Error al guardar', userFriendlyMessage);
                setLoading(false);
                return;
            }

            console.log(`✅ Ministerio ${isEditing ? 'actualizado' : 'creado'} exitosamente`);
            showToast(
                'success',
                isEditing ? 'Ministerio actualizado' : 'Ministerio creado',
                isEditing
                    ? 'Los datos del ministerio han sido actualizados correctamente'
                    : 'El ministerio ha sido creado exitosamente'
            );

            // Esperar un momento para que el usuario vea el toast antes de cerrar
            setTimeout(() => {
                onSuccess();
            }, 1500);

        } catch (err: any) {
            const errorMsg = 'Ocurrió un error inesperado. Por favor, intenta nuevamente';
            setError(errorMsg);
            showToast('error', 'Error', errorMsg);
            console.error('Error en formulario:', err);
        } finally {
            setLoading(false);
        }
    };

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
                        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full my-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg z-10">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {isEditing ? 'Editar Ministerio' : 'Nuevo Ministerio'}
                            </h2>
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

                        {/* Form */}
                        <div className="max-h-[calc(90vh-100px)] overflow-y-auto">
                            <form onSubmit={handleSubmit} className="p-6">
                                {error && (
                                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
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

                                <div className="space-y-6">
                                    {/* Nombre del Ministerio */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nombre del Ministerio <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                                            placeholder="Ej: Alabanza y Adoración"
                                        />
                                    </div>

                                    {/* Descripción */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Descripción <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="descripcion"
                                            value={formData.descripcion}
                                            onChange={handleChange}
                                            required
                                            rows={4}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 resize-none"
                                            placeholder="Describe el propósito y actividades del ministerio..."
                                        />
                                    </div>

                                    {/* URL del Logo */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            URL del Logo (opcional)
                                        </label>
                                        <input
                                            type="url"
                                            name="logo_url"
                                            value={formData.logo_url}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                                            placeholder="https://ejemplo.com/logo.png"
                                        />
                                        {formData.logo_url && (
                                            <p className="mt-2 text-xs text-gray-500">
                                                Vista previa del logo aparecerá en la tarjeta del ministerio
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Botones */}
                                <div className="mt-6 flex items-center justify-end gap-4 border-t pt-4">
                                    <button
                                        type="button"
                                        onClick={onCancel}
                                        disabled={loading}
                                        className="cursor-pointer px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="cursor-pointer px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                {isEditing ? 'Actualizando...' : 'Guardando...'}
                                            </>
                                        ) : (
                                            isEditing ? 'Actualizar Ministerio' : 'Crear Ministerio'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function FormMinisterio(props: FormMinisterioProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <FormMinisterioContent {...props} />,
        document.body
    );
}