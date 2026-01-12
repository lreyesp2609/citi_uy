// lib/services/personasService.tsx
/**
 * Servicio para gestión de personas
 */

import { apiClient } from '@/lib/api/client';

export interface Persona {
  id_persona: number;
  numero_cedula: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string | null;
  genero: string | null;
  celular: string | null;
  direccion: string | null;
  correo_electronico: string | null;
  nivel_estudio: string | null;
  nacionalidad: string | null;
  profesion: string | null;
  estado_civil: string | null;
  lugar_trabajo: string | null;
}

export interface PersonasListResponse {
  success: boolean;
  message?: string;
  data?: Persona[];
  total?: number;
}

export interface PersonaResponse {
  success: boolean;
  message?: string;
  data?: Persona;
}

export const personasService = {
  /**
   * Obtiene todas las personas
   * Solo accesible para Pastor (rol 1) y Líder (rol 2)
   */
  async getAll(): Promise<PersonasListResponse> {
    try {
      const response = await apiClient.get<Persona[]>('/personas');
      
      // Si la respuesta tiene un array de data, devolverlo correctamente
      return {
        success: response.success,
        message: response.message,
        data: Array.isArray(response.data) ? response.data : [],
        total: Array.isArray(response.data) ? response.data.length : 0
      };
    } catch (error: any) {
      console.error('Error obteniendo personas:', error);
      return {
        success: false,
        message: error.message || 'Error al obtener personas',
        data: [],
        total: 0
      };
    }
  },

  /**
   * Obtiene una persona por ID
   * @param id - ID de la persona
   */
  async getById(id: number): Promise<PersonaResponse> {
    try {
      const response = await apiClient.get<Persona>(`/personas/${id}`);
      
      return {
        success: response.success,
        message: response.message,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error obteniendo persona:', error);
      return {
        success: false,
        message: error.message || 'Error al obtener persona'
      };
    }
  },

  /**
   * Crea una nueva persona
   * @param persona - Datos de la persona
   */
  async create(persona: Omit<Persona, 'id_persona'>): Promise<PersonaResponse> {
    try {
      const response = await apiClient.post<Persona>('/personas', persona);
      
      return {
        success: response.success,
        message: response.message,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error creando persona:', error);
      return {
        success: false,
        message: error.message || 'Error al crear persona'
      };
    }
  },

  /**
   * Actualiza una persona existente
   * @param id - ID de la persona
   * @param persona - Datos actualizados
   */
  async update(id: number, persona: Partial<Persona>): Promise<PersonaResponse> {
    try {
      const response = await apiClient.put<Persona>(`/personas/${id}`, persona);
      
      return {
        success: response.success,
        message: response.message,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error actualizando persona:', error);
      return {
        success: false,
        message: error.message || 'Error al actualizar persona'
      };
    }
  },

  /**
   * Elimina una persona
   * @param id - ID de la persona
   */
  async delete(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.delete(`/personas/${id}`);
      
      return {
        success: response.success,
        message: response.message
      };
    } catch (error: any) {
      console.error('Error eliminando persona:', error);
      return {
        success: false,
        message: error.message || 'Error al eliminar persona'
      };
    }
  },
};