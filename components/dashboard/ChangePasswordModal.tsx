// components/dashboard/ChangePasswordModal.tsx
'use client';

import { useEffect } from 'react';
import ChangePasswordForm from './ChangePasswordForm';

interface ChangePasswordModalProps {
    onSuccess: () => void;
}

export default function ChangePasswordModal({ onSuccess }: ChangePasswordModalProps) {
    // Prevenir scroll del body cuando el modal está abierto
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                {/* Header */}
                <div className="mb-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full mb-3 mx-auto">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 text-center">
                        Cambio de Contraseña Requerido
                    </h2>
                    <p className="text-gray-700 text-center mt-1 text-sm">
                        Por seguridad, debes cambiar tu contraseña predeterminada antes de continuar.
                    </p>
                </div>

                {/* Formulario */}
                <ChangePasswordForm
                    onSuccess={onSuccess}
                    showCancelButton={false}
                />

                {/* Nota de seguridad */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                        <strong>Nota:</strong> Tu nueva contraseña debe tener al menos 8 caracteres y contener al menos una letra mayúscula.
                    </p>
                </div>
            </div>
        </div>
    );
}
