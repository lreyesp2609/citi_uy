// lib/services/uploadsService.tsx
/**
 * Servicio para subida de archivos
 */

import { apiClient, ApiResponse } from '@/lib/api/client';

interface UploadLogoResponse {
    success: boolean;
    message?: string;
    url?: string;
}

export const uploadsService = {
    async uploadMinisterioLogo(file: File): Promise<UploadLogoResponse> {
        try {
            const form = new FormData();
            form.append('file', file);

            const response: ApiResponse<{ url: string }> = await apiClient.postForm('/uploads/ministerios', form);

            return {
                success: response.success,
                message: response.message,
                url: response.data?.url,
            };
        } catch (error: any) {
            console.error('Error subiendo logo de ministerio:', error);
            return {
                success: false,
                message: error.message || 'Error al subir el logo',
            };
        }
    },
};