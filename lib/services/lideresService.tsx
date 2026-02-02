// lib/services/lideresService.tsx
/**
 * Servicio para gestión de líderes y asignación de roles
 */

import { apiClient } from '@/lib/api/client';

export interface AsignarRolData {
    id_persona: number;
    id_rol: number;
    usuario: string;
}

export interface AsignarRolResponse {
    success: boolean;
    message?: string;
    updated?: boolean;
    data?: {
        id_usuario?: number;
        usuario?: string;
        rol?: string;
        rol_anterior?: string;
        rol_nuevo?: string;
        credentials?: {
            usuario: string;
            password: string;
        };
    };
}

export const lideresService = {
    /**
     * Asigna un rol de liderazgo a una persona
     * Crea un nuevo usuario o actualiza el rol existente
     * Solo accesible para Pastor (rol 1)
     * @param data - Datos para asignar el rol
     */
    async asignarRol(data: AsignarRolData): Promise<AsignarRolResponse> {
        try {
            const response = await apiClient.post<any>(
                '/lideres/asignar-rol',
                data
            );

            console.log('📦 Respuesta completa del backend:', response);

            // El backend devuelve la estructura completa en response
            // Necesitamos extraer 'updated' del nivel superior de la respuesta
            return {
                success: response.success,
                message: response.message,
                updated: (response as any).updated || false, // ✅ Cast a any para acceder a updated
                data: response.data
            };
        } catch (error: any) {
            console.error('Error asignando rol:', error);
            return {
                success: false,
                message: error.message || 'Error al asignar rol de liderazgo'
            };
        }
    },

    /**
     * Remueve el rol de liderazgo de una persona
     * @param id_persona - ID de la persona
     */
    async removerRol(id_persona: number): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await apiClient.delete(`/lideres/remover-rol/${id_persona}`);

            return {
                success: response.success,
                message: response.message
            };
        } catch (error: any) {
            console.error('Error removiendo rol:', error);
            return {
                success: false,
                message: error.message || 'Error al remover rol de liderazgo'
            };
        }
    },

    /**
     * Obtiene todos los líderes (usuarios con rol 1 o 2)
     */
    async getLideres(): Promise<{
        success: boolean;
        message?: string;
        data?: any[];
    }> {
        try {
            const response = await apiClient.get('/lideres');

            return {
                success: response.success,
                message: response.message,
                data: response.data as any[]
            };
        } catch (error: any) {
            console.error('Error obteniendo líderes:', error);
            return {
                success: false,
                message: error.message || 'Error al obtener líderes'
            };
        }
    }
};