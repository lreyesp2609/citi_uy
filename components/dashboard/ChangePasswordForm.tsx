// components/dashboard/ChangePasswordForm.tsx
'use client';

import { useState } from 'react';
import { authService } from '@/lib/services/authService';

interface ChangePasswordFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    showCancelButton?: boolean;
}

export default function ChangePasswordForm({
    onSuccess,
    onCancel,
    showCancelButton = true
}: ChangePasswordFormProps) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Validaciones en tiempo real
    const passwordValidations = {
        minLength: newPassword.length >= 8,
        hasUppercase: /[A-Z]/.test(newPassword),
        passwordsMatch: newPassword === confirmPassword && newPassword !== '',
    };

    const isFormValid =
        currentPassword !== '' &&
        passwordValidations.minLength &&
        passwordValidations.hasUppercase &&
        passwordValidations.passwordsMatch;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!isFormValid) {
            setError('Por favor, completa todos los campos correctamente');
            return;
        }

        setLoading(true);

        try {
            const result = await authService.changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });

            if (result.success) {
                setSuccess(true);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');

                // Llamar callback de éxito después de un breve delay
                setTimeout(() => {
                    onSuccess?.();
                }, 1500);
            } else {
                setError(result.message || 'Error al cambiar la contraseña');
            }
        } catch (err: any) {
            setError(err.message || 'Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess(false);
        onCancel?.();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mensaje de error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Mensaje de éxito */}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    <p className="text-sm">✅ Contraseña actualizada exitosamente</p>
                </div>
            )}

            {/* Contraseña actual */}
            <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-900 mb-1">
                    Contraseña Actual
                </label>
                <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Ingresa tu contraseña actual"
                    disabled={loading || success}
                    required
                />
            </div>

            {/* Nueva contraseña */}
            <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-900 mb-1">
                    Nueva Contraseña
                </label>
                <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Ingresa tu nueva contraseña"
                    disabled={loading || success}
                    required
                />

                {/* Indicadores de validación */}
                {newPassword && (
                    <div className="mt-2 space-y-1">
                        <div className={`text-xs flex items-center gap-2 ${passwordValidations.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                            <span>{passwordValidations.minLength ? '✓' : '○'}</span>
                            <span>Mínimo 8 caracteres</span>
                        </div>
                        <div className={`text-xs flex items-center gap-2 ${passwordValidations.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                            <span>{passwordValidations.hasUppercase ? '✓' : '○'}</span>
                            <span>Al menos una letra mayúscula</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirmar contraseña */}
            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-1">
                    Confirmar Nueva Contraseña
                </label>
                <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Confirma tu nueva contraseña"
                    disabled={loading || success}
                    required
                />

                {/* Indicador de coincidencia */}
                {confirmPassword && (
                    <div className={`mt-2 text-xs flex items-center gap-2 ${passwordValidations.passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                        <span>{passwordValidations.passwordsMatch ? '✓' : '✗'}</span>
                        <span>{passwordValidations.passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}</span>
                    </div>
                )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-2">
                <button
                    type="submit"
                    disabled={!isFormValid || loading || success}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    {loading ? 'Guardando...' : 'Guardar Contraseña'}
                </button>

                {showCancelButton && (
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading || success}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    );
}
