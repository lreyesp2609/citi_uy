// app/(dashboard)/configuracion/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import ChangePasswordForm from '@/components/dashboard/ChangePasswordForm';

export default function ConfiguracionPage() {
    const router = useRouter();

    const handleSuccess = () => {
        // Redirigir al dashboard después de cambiar la contraseña
        setTimeout(() => {
            router.push('/dashboard');
        }, 2000);
    };

    const handleCancel = () => {
        router.push('/dashboard');
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Configuración</h1>
                <p className="text-gray-600 mt-2">Administra la configuración de tu cuenta</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Cambiar Contraseña</h2>
                <ChangePasswordForm
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}
