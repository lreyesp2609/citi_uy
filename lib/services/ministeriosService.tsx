// lib/services/ministeriosService.tsx
/**
 * Servicio para gestión de ministerios
 */

import { apiClient, ApiResponse } from '@/lib/api/client';

export interface Ministerio {
    id_ministerio: number;
    nombre: string;
    descripcion: string | null;
    logo_url: string | null;
    activo: boolean;
    id_usuario_creador: number | null;
    fecha_creacion: string;
    fecha_actualizacion: string;
    lideres?: Array<{
        id_usuario: number;
        nombre_completo: string;
        usuario: string;
    }>;
    usuario_creador?: {
        id_usuario: number;
        nombre_completo: string;
        usuario: string;
    };
}

export interface MinisteriosListResponse {
    success: boolean;
    message?: string;
    data?: Ministerio[];
    total?: number;
}

export interface MinisterioResponse {
    success: boolean;
    message?: string;
    data?: Ministerio;
}

export const ministeriosService = {
    /**
     * Obtiene todos los ministerios
     */
    async getAll(): Promise<MinisteriosListResponse> {
        try {
            console.log('🔄 Solicitando ministerios...');
            const response: ApiResponse<Ministerio[]> = await apiClient.get<Ministerio[]>('/ministerios');

            console.log('📦 Respuesta recibida:', {
                success: response.success,
                total: response.total || response.data?.length || 0,
                mensaje: response.message
            });

            // Manejar la respuesta
            return {
                success: response.success,
                message: response.message,
                data: Array.isArray(response.data) ? response.data : [],
                total: response.total || (Array.isArray(response.data) ? response.data.length : 0)
            };

        } catch (error: any) {
            console.error('💥 Error obteniendo ministerios:', error);
            return {
                success: false,
                message: error.message || 'Error al obtener ministerios',
                data: [],
                total: 0
            };
        }
    },

    /**
     * Obtiene un ministerio por ID
     * @param id - ID del ministerio
     */
    async getById(id: number): Promise<MinisterioResponse> {
        try {
            const response: ApiResponse<Ministerio> = await apiClient.get<Ministerio>(`/ministerios/${id}`);

            return {
                success: response.success,
                message: response.message,
                data: response.data
            };

        } catch (error: any) {
            console.error('Error obteniendo ministerio:', error);
            return {
                success: false,
                message: error.message || 'Error al obtener ministerio'
            };
        }
    },

    /**
     * Crea un nuevo ministerio
     * @param ministerio - Datos del ministerio
     */
    async create(ministerio: Omit<Ministerio, 'id_ministerio' | 'fecha_creacion' | 'fecha_actualizacion' | 'lideres' | 'usuario_creador' | 'id_usuario_creador'>): Promise<MinisterioResponse> {
        try {
            const response: ApiResponse<Ministerio> = await apiClient.post<Ministerio>('/ministerios', ministerio);

            return {
                success: response.success,
                message: response.message || 'Ministerio creado exitosamente',
                data: response.data
            };

        } catch (error: any) {
            console.error('Error creando ministerio:', error);
            return {
                success: false,
                message: error.message || 'Error al crear ministerio'
            };
        }
    },

    /**
     * Actualiza un ministerio existente
     * @param id - ID del ministerio
     * @param ministerio - Datos actualizados
     */
    async update(id: number, ministerio: Partial<Ministerio>): Promise<MinisterioResponse> {
        try {
            const response: ApiResponse<Ministerio> = await apiClient.put<Ministerio>(`/ministerios/${id}`, ministerio);

            return {
                success: response.success,
                message: response.message || 'Ministerio actualizado exitosamente',
                data: response.data
            };

        } catch (error: any) {
            console.error('Error actualizando ministerio:', error);
            return {
                success: false,
                message: error.message || 'Error al actualizar ministerio'
            };
        }
    },

    /**
     * Deshabilita un ministerio
     * @param id - ID del ministerio
     */
    async deshabilitar(id: number): Promise<{ success: boolean; message?: string }> {
        try {
            const response: ApiResponse = await apiClient.post(`/ministerios/${id}/deshabilitar`);

            return {
                success: response.success,
                message: response.message || 'Ministerio deshabilitado exitosamente'
            };
        } catch (error: any) {
            console.error('Error deshabilitando ministerio:', error);
            return {
                success: false,
                message: error.message || 'Error al deshabilitar ministerio'
            };
        }
    },

    /**
     * Habilita un ministerio
     * @param id - ID del ministerio
     */
    async habilitar(id: number): Promise<{ success: boolean; message?: string }> {
        try {
            const response: ApiResponse = await apiClient.post(`/ministerios/${id}/habilitar`);

            return {
                success: response.success,
                message: response.message || 'Ministerio habilitado exitosamente'
            };
        } catch (error: any) {
            console.error('Error habilitando ministerio:', error);
            return {
                success: false,
                message: error.message || 'Error al habilitar ministerio'
            };
        }
    },

    /**
     * Asigna líderes a un ministerio
     * @param id - ID del ministerio
     * @param ids_usuarios - Array de IDs de usuarios (máximo 2)
     */
    async asignarLideres(id: number, ids_usuarios: number[]): Promise<{ success: boolean; message?: string }> {
        try {
            const response: ApiResponse = await apiClient.post(`/ministerios/${id}/lideres`, { ids_usuarios });

            return {
                success: response.success,
                message: response.message || 'Líderes asignados exitosamente'
            };
        } catch (error: any) {
            console.error('Error asignando líderes:', error);
            return {
                success: false,
                message: error.message || 'Error al asignar líderes'
            };
        }
    },
};