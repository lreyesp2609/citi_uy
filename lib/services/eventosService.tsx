import { apiClient, ApiResponse } from '@/lib/api/client';

export type EventoEstado = 'PENDIENTE' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO' | 'CANCELADO';

export interface Evento {
    id_evento: number;
    id_ministerio: number;
    nombre: string;
    descripcion: string | null;
    fecha_inicio: string;
    fecha_fin: string | null;
    ubicacion: string | null;
    activo: boolean; // Para soft delete si se usa, o simplemente para mostrar
    estado: EventoEstado;
    motivo_rechazo?: string | null;
    fecha_creacion: string;
}

export interface EventoResponse {
    success: boolean;
    message?: string;
    data?: Evento;
}

export interface EventoListResponse {
    success: boolean;
    message?: string;
    data?: Evento[];
    total?: number;
}

export const eventosService = {
    /**
     * Obtiene los eventos de un ministerio
     */
    async getByMinisterio(idMinisterio: number): Promise<EventoListResponse> {
        try {
            const response = await apiClient.get<Evento[]>(`/eventos?ministerioId=${idMinisterio}`);
            return {
                success: response.success,
                message: response.message,
                data: Array.isArray(response.data) ? response.data : [],
                total: response.total
            };
        } catch (error: any) {
            console.error('Error obteniendo eventos:', error);
            return {
                success: false,
                message: error.message || 'Error al obtener eventos'
            };
        }
    },

    /**
     * Crea un nuevo evento
     */
    async create(evento: Omit<Evento, 'id_evento' | 'fecha_creacion' | 'estado' | 'motivo_rechazo' | 'activo'>): Promise<EventoResponse> {
        try {
            const response = await apiClient.post<Evento>('/eventos', evento);
            return {
                success: response.success,
                message: response.message || 'Evento creado exitosamente',
                data: response.data
            };
        } catch (error: any) {
            console.error('Error creando evento:', error);
            return {
                success: false,
                message: error.message || 'Error al crear evento'
            };
        }
    },

    /**
     * Actualiza un evento existente
     */
    async update(id: number, evento: Partial<Evento>): Promise<EventoResponse> {
        try {
            const response = await apiClient.put<Evento>(`/eventos/${id}`, evento);
            return {
                success: response.success,
                message: response.message || 'Evento actualizado exitosamente',
                data: response.data
            };
        } catch (error: any) {
            console.error('Error actualizando evento:', error);
            return {
                success: false,
                message: error.message || 'Error al actualizar evento'
            };
        }
    },

    /**
     * Cambia el estado de un evento (Solicitar Aprobación, Aprobar, Rechazar)
     */
    async changeEstado(id: number, estado: EventoEstado, motivoRechazo?: string): Promise<EventoResponse> {
        try {
            const payload: any = { estado };
            if (motivoRechazo) payload.motivo_rechazo = motivoRechazo;

            const response = await apiClient.put<Evento>(`/eventos/${id}/estado`, payload);
            return {
                success: response.success,
                message: response.message || `Estado actualizado a ${estado}`,
                data: response.data
            };
        } catch (error: any) {
            console.error('Error cambiando estado del evento:', error);
            return {
                success: false,
                message: error.message || 'Error al cambiar estado'
            };
        }
    },

    /**
     * Cancela un evento
     */
    async cancel(id: number): Promise<EventoResponse> {
        return this.changeEstado(id, 'CANCELADO');
    }
};
