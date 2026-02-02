// components/dashboard/lideres/DesignarRol.tsx
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Persona } from '@/lib/services/personasService';
import { lideresService } from '@/lib/services/lideresService';
import Toast from '@/components/ui/Toast';

interface DesignarRolProps {
    persona: Persona;
    onSuccess: () => void;
    onClose: () => void;
}

interface ToastData {
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
}

function DesignarRolContent({ persona, onSuccess, onClose }: DesignarRolProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [selectedRole, setSelectedRole] = useState<number>(2);
    const [generatedUsername, setGeneratedUsername] = useState('');
    const [hasExistingRole, setHasExistingRole] = useState(false);
    const [toast, setToast] = useState<ToastData | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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
            if (e.key === 'Escape') {
                if (showConfirmDialog) {
                    setShowConfirmDialog(false);
                } else {
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose, showConfirmDialog]);

    // Verificar si ya tiene rol
    useEffect(() => {
        if (persona.rol && persona.id_rol) {
            setHasExistingRole(true);
            setSelectedRole(persona.id_rol);
        }
    }, [persona]);

    // Generar username automáticamente (formato: nombre.apellido)
    useEffect(() => {
        if (persona.nombres && persona.apellidos) {
            const primerNombre = persona.nombres.split(' ')[0].toLowerCase();
            const primerApellido = persona.apellidos.split(' ')[0].toLowerCase();
            const username = `${primerNombre}.${primerApellido}`;
            setGeneratedUsername(username);
        }
    }, [persona]);

    // Validar datos completos
    const validatePersona = (): string[] => {
        const errors: string[] = [];

        if (!persona.nombres?.trim()) errors.push('Nombres');
        if (!persona.apellidos?.trim()) errors.push('Apellidos');
        if (!persona.numero_cedula?.trim()) errors.push('Número de cédula');
        if (!persona.correo_electronico?.trim()) errors.push('Correo electrónico');
        if (!persona.celular?.trim()) errors.push('Celular');
        if (!persona.genero?.trim()) errors.push('Género');
        if (!persona.fecha_nacimiento) errors.push('Fecha de nacimiento');
        if (!persona.direccion?.trim()) errors.push('Dirección');

        return errors;
    };

    useEffect(() => {
        const errors = validatePersona();
        setValidationErrors(errors);
    }, [persona]);

    const handleSubmitConfirmed = async () => {
        setShowConfirmDialog(false);
        setLoading(true);
        setError('');

        try {
            const result = await lideresService.asignarRol({
                id_persona: persona.id_persona,
                id_rol: selectedRole,
                usuario: generatedUsername,
            });

            console.log('📦 Resultado completo:', result); // Para debugging

            if (result.success) {
                console.log('✅ Rol asignado exitosamente');

                if (result.updated) {
                    setToast({
                        type: 'success',
                        title: '✅ Rol actualizado',
                        message: `El rol se ha actualizado exitosamente\n\nDe: ${result.data?.rol_anterior || 'N/A'}\nA: ${result.data?.rol_nuevo || 'N/A'}`
                    });
                } else {
                    // Acceder correctamente a las credenciales
                    const usuario = result.data?.credentials?.usuario || result.data?.usuario || generatedUsername;
                    const password = result.data?.credentials?.password || persona.numero_cedula;

                    setToast({
                        type: 'success',
                        title: '✅ Usuario creado exitosamente',
                        message: `Credenciales de acceso:\n\nUsuario: ${usuario}\nContraseña: ${password}\n\nLa persona puede cambiar su contraseña después del primer inicio de sesión.`
                    });
                }

                setTimeout(() => {
                    onSuccess();
                }, 3000);
            } else {
                setError(result.message || 'Error al asignar rol');
            }
        } catch (err: any) {
            console.error('Error completo:', err);
            setError(err.message || 'Error inesperado');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const errors = validatePersona();
        if (errors.length > 0) {
            setError('La persona debe tener todos sus datos completos antes de asignar un rol.');
            return;
        }

        // Mostrar confirmación si ya tiene rol y está cambiando
        if (hasExistingRole && persona.rol && persona.id_rol !== selectedRole) {
            setShowConfirmDialog(true);
            return;
        }

        // Si no tiene rol o no está cambiando, proceder directamente
        handleSubmitConfirmed();
    };

    const isDataComplete = validationErrors.length === 0;

    return (
        <>
            <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                onClick={onClose}
            >
                <div
                    className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-700 to-red-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg sticky top-0 z-10">
                        <div>
                            <h2 className="text-2xl font-bold">Designar Rol de Liderazgo</h2>
                            <p className="text-red-100 text-sm mt-1">
                                {persona.nombres} {persona.apellidos}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            type="button"
                            className="cursor-pointer text-white/80 hover:text-white transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Contenido */}
                    <form onSubmit={handleSubmit} className="p-6">
                        {/* Advertencia si ya tiene rol */}
                        {hasExistingRole && (
                            <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-amber-800">
                                            Usuario ya registrado
                                        </h3>
                                        <div className="mt-2 text-sm text-amber-700">
                                            <p>Esta persona ya tiene un usuario con el rol de <strong>"{persona.rol}"</strong>.</p>
                                            <p className="mt-1">Al continuar, se actualizará su rol al seleccionado.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Validación de datos */}
                        {!isDataComplete && (
                            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-yellow-800">
                                            Datos incompletos
                                        </h3>
                                        <div className="mt-2 text-sm text-yellow-700">
                                            <p className="mb-2">Los siguientes campos están vacíos:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                {validationErrors.map((field, index) => (
                                                    <li key={index}>{field}</li>
                                                ))}
                                            </ul>
                                            <p className="mt-3 font-medium">
                                                Por favor, complete todos los datos de la persona antes de asignar un rol.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Información de la persona */}
                        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Información de la Persona</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-500">Cédula:</span>
                                    <span className="ml-2 font-medium text-gray-900">{persona.numero_cedula || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Correo:</span>
                                    <span className="ml-2 font-medium text-gray-900 break-all">{persona.correo_electronico || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Celular:</span>
                                    <span className="ml-2 font-medium text-gray-900">{persona.celular || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Género:</span>
                                    <span className="ml-2 font-medium text-gray-900">{persona.genero || '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Selección de rol */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Seleccionar Rol <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-3">
                                <label className="cursor-pointer flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition">
                                    <input
                                        type="radio"
                                        name="rol"
                                        value="2"
                                        checked={selectedRole === 2}
                                        onChange={(e) => setSelectedRole(Number(e.target.value))}
                                        className="cursor-pointer h-4 w-4 text-blue-600 focus:ring-blue-500"
                                        disabled={!isDataComplete}
                                    />
                                    <div className="ml-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-900">Líder</span>
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                Recomendado
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Puede gestionar miembros, registrar asistencia y planificar actividades de su grupo
                                        </p>
                                    </div>
                                </label>

                                <label className="cursor-pointer flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 transition">
                                    <input
                                        type="radio"
                                        name="rol"
                                        value="1"
                                        checked={selectedRole === 1}
                                        onChange={(e) => setSelectedRole(Number(e.target.value))}
                                        className="cursor-pointer h-4 w-4 text-purple-600 focus:ring-purple-500"
                                        disabled={!isDataComplete}
                                    />
                                    <div className="ml-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-900">Pastor</span>
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                                Privilegios administrativos
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Acceso completo al sistema, puede gestionar líderes, eventos, finanzas y configuración
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Información del usuario que se creará */}
                        {isDataComplete && !hasExistingRole && (
                            <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-800">
                                            Credenciales de acceso
                                        </h3>
                                        <div className="mt-2 text-sm text-blue-700">
                                            <p>Se creará un usuario con las siguientes credenciales:</p>
                                            <ul className="mt-2 space-y-1">
                                                <li><strong>Usuario:</strong> {generatedUsername}</li>
                                                <li><strong>Contraseña:</strong> {persona.numero_cedula} (cédula)</li>
                                            </ul>
                                            <p className="mt-2 text-xs">
                                                La persona podrá cambiar su contraseña después del primer inicio de sesión.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botones */}
                        <div className="flex items-center justify-end gap-4 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="cursor-pointer px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !isDataComplete}
                                className="cursor-pointer px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {hasExistingRole ? 'Actualizando...' : 'Asignando...'}
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        {hasExistingRole ? 'Actualizar Rol' : 'Asignar Rol'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal de confirmación */}
            {showConfirmDialog && (
                <div
                    className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={() => setShowConfirmDialog(false)}
                >
                    <div
                        className="bg-white rounded-lg shadow-2xl w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex-shrink-0">
                                    <svg className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Confirmar cambio de rol
                                    </h3>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-6">
                                Esta persona ya tiene el rol de <strong>"{persona.rol}"</strong>. ¿Está seguro que desea cambiar su rol?
                            </p>
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmDialog(false)}
                                    className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmitConfirmed}
                                    className="cursor-pointer px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                >
                                    Sí, cambiar rol
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast de notificación */}
            {toast && (
                <Toast
                    type={toast.type}
                    title={toast.title}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    );
}

export default function DesignarRol(props: DesignarRolProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <DesignarRolContent {...props} />,
        document.body
    );
}