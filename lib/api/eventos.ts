import { supabase } from '@/lib/supabase';

export type EventoEstado = 'PENDIENTE' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO' | 'CANCELADO';

export interface Evento {
    id_evento: number;
    id_ministerio: number;
    nombre: string;
    descripcion: string | null;
    fecha_inicio: string;
    fecha_fin: string | null;
    ubicacion: string | null;
    activo: boolean;
    estado: EventoEstado;
    motivo_rechazo?: string | null;
    fecha_creacion: string;
}

export interface EventoResponse {
    success: boolean;
    message?: string;
    data?: Evento[];
}

/**
 * Obtiene los eventos de un ministerio
 */
export async function getEventosByMinisterio(idMinisterio: number): Promise<EventoResponse> {
    try {
        const { data, error } = await supabase
            .from('eventos')
            .select('*')
            .eq('id_ministerio', idMinisterio)
            .order('fecha_inicio', { ascending: true });

        if (error) {
            console.error('Error obteniendo eventos:', error);
            return { success: false, message: error.message };
        }

        return { success: true, data: data || [] };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Crea un nuevo evento
 */
export async function createEvento(evento: Omit<Evento, 'id_evento' | 'fecha_creacion' | 'estado' | 'motivo_rechazo' | 'activo'>): Promise<EventoResponse> {
    try {
        // Validación básica de fechas
        if (new Date(evento.fecha_inicio) < new Date()) {
            return { success: false, message: 'La fecha de inicio no puede ser en el pasado' };
        }
        if (evento.fecha_fin && new Date(evento.fecha_fin) <= new Date(evento.fecha_inicio)) {
            return { success: false, message: 'La fecha de fin debe ser posterior a la de inicio' };
        }

        const { data, error } = await supabase
            .from('eventos')
            .insert([{
                ...evento,
                estado: 'PENDIENTE',
                activo: true
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creando evento:', error);
            return { success: false, message: error.message };
        }

        return { success: true, data: [data] };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Actualiza un evento
 */
export async function updateEvento(id: number, evento: Partial<Evento>): Promise<EventoResponse> {
    try {
        const { data, error } = await supabase
            .from('eventos')
            .update(evento)
            .eq('id_evento', id)
            .select()
            .single();

        if (error) {
            console.error('Error actualizando evento:', error);
            return { success: false, message: error.message };
        }

        return { success: true, data: [data] };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Cambia el estado de un evento
 */
export async function changeEstadoEvento(id: number, estado: EventoEstado, motivoRechazo?: string): Promise<EventoResponse> {
    try {
        const updateData: any = { estado };
        if (motivoRechazo !== undefined) {
            updateData.motivo_rechazo = motivoRechazo;
        }

        const { data, error } = await supabase
            .from('eventos')
            .update(updateData)
            .eq('id_evento', id)
            .select()
            .single();

        if (error) {
            console.error('Error cambiando estado:', error);
            return { success: false, message: error.message };
        }

        return { success: true, data: [data] };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
