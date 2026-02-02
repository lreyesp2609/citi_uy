// lib/api/ministerios.ts
import { supabase } from '@/lib/supabase';

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

export interface MinisteriosResponse {
    success: boolean;
    message?: string;
    data?: Ministerio[];
    total?: number;
    missingDetails?: Array<{
        id_usuario: number;
        nombre_completo: string;
        campos_faltantes: string[];
    }>;
}

const requiredLeaderFields = [
    'nombres',
    'apellidos',
    'numero_cedula',
    'correo_electronico',
    'celular',
    'genero',
    'fecha_nacimiento',
    'direccion'
];

function getMissingLeaderFields(persona: Record<string, any>): string[] {
    return requiredLeaderFields.filter((field) => {
        const value = persona?.[field];
        if (typeof value === 'string') {
            return value.trim() === '';
        }
        return !value;
    });
}

/**
 * Obtiene todos los ministerios con sus líderes y usuario creador
 * @returns Lista de ministerios
 */
export async function getAllMinisterios(): Promise<MinisteriosResponse> {
    try {
        console.log('📋 Obteniendo todos los ministerios...');

        // Obtener ministerios con datos del usuario creador
        const { data: ministeriosData, error: ministeriosError } = await supabase
            .from('ministerios')
            .select(`
                *,
                usuario_creador:usuarios!ministerios_id_usuario_creador_fkey (
                    id_usuario,
                    usuario,
                    personas (
                        nombres,
                        apellidos
                    )
                )
            `)
            .order('id_ministerio', { ascending: true });

        if (ministeriosError) {
            console.error('❌ Error obteniendo ministerios:', ministeriosError);
            return {
                success: false,
                message: `Error al obtener ministerios: ${ministeriosError.message}`
            };
        }

        console.log('✅ Ministerios obtenidos:', ministeriosData?.length || 0);

        // Obtener líderes de cada ministerio
        const ministeriosConLideres = await Promise.all(
            (ministeriosData || []).map(async (ministerio: any) => {
                const { data: lideresData } = await supabase
                    .from('ministerio_lideres')
                    .select(`
                        id_usuario,
                        usuarios!inner (
                            usuario,
                            personas!inner (
                                nombres,
                                apellidos
                            )
                        )
                    `)
                    .eq('id_ministerio', ministerio.id_ministerio);

                const lideres = lideresData?.map((lider: any) => ({
                    id_usuario: lider.id_usuario,
                    usuario: lider.usuarios.usuario,
                    nombre_completo: `${lider.usuarios.personas.nombres} ${lider.usuarios.personas.apellidos}`
                })) || [];

                // Formatear usuario creador
                let usuario_creador = undefined;
                if (ministerio.usuario_creador) {
                    usuario_creador = {
                        id_usuario: ministerio.usuario_creador.id_usuario,
                        usuario: ministerio.usuario_creador.usuario,
                        nombre_completo: ministerio.usuario_creador.personas
                            ? `${ministerio.usuario_creador.personas.nombres} ${ministerio.usuario_creador.personas.apellidos}`
                            : ministerio.usuario_creador.usuario
                    };
                }

                return {
                    id_ministerio: ministerio.id_ministerio,
                    nombre: ministerio.nombre,
                    descripcion: ministerio.descripcion,
                    logo_url: ministerio.logo_url,
                    activo: ministerio.activo,
                    id_usuario_creador: ministerio.id_usuario_creador,
                    fecha_creacion: ministerio.fecha_creacion,
                    fecha_actualizacion: ministerio.fecha_actualizacion,
                    lideres,
                    usuario_creador
                };
            })
        );

        console.log('✅ Ministerios procesados:', ministeriosConLideres.length);

        return {
            success: true,
            data: ministeriosConLideres,
            total: ministeriosConLideres.length
        };

    } catch (error: any) {
        console.error('💥 Error en getAllMinisterios:', error);
        return {
            success: false,
            message: `Error interno del servidor: ${error.message}`
        };
    }
}

/**
 * Obtiene un ministerio por ID
 * @param id_ministerio - ID del ministerio
 */
export async function getMinisterioById(id_ministerio: number): Promise<MinisteriosResponse> {
    try {
        const { data, error } = await supabase
            .from('ministerios')
            .select(`
                *,
                usuario_creador:usuarios!ministerios_id_usuario_creador_fkey (
                    id_usuario,
                    usuario,
                    personas (
                        nombres,
                        apellidos
                    )
                )
            `)
            .eq('id_ministerio', id_ministerio)
            .single();

        if (error || !data) {
            return {
                success: false,
                message: 'Ministerio no encontrado'
            };
        }

        // Obtener líderes
        const { data: lideresData } = await supabase
            .from('ministerio_lideres')
            .select(`
                id_usuario,
                usuarios!inner (
                    usuario,
                    personas!inner (
                        nombres,
                        apellidos
                    )
                )
            `)
            .eq('id_ministerio', id_ministerio);

        const lideres = lideresData?.map((lider: any) => ({
            id_usuario: lider.id_usuario,
            usuario: lider.usuarios.usuario,
            nombre_completo: `${lider.usuarios.personas.nombres} ${lider.usuarios.personas.apellidos}`
        })) || [];

        // Formatear usuario creador
        let usuario_creador = undefined;
        if (data.usuario_creador) {
            usuario_creador = {
                id_usuario: data.usuario_creador.id_usuario,
                usuario: data.usuario_creador.usuario,
                nombre_completo: data.usuario_creador.personas
                    ? `${data.usuario_creador.personas.nombres} ${data.usuario_creador.personas.apellidos}`
                    : data.usuario_creador.usuario
            };
        }

        return {
            success: true,
            data: [{ ...data, lideres, usuario_creador }]
        };

    } catch (error) {
        console.error('Error en getMinisterioById:', error);
        return {
            success: false,
            message: 'Error interno del servidor'
        };
    }
}

/**
 * Crea un nuevo ministerio
 * @param ministerioData - Datos del ministerio
 * @param id_usuario_creador - ID del usuario que crea el ministerio
 */
export async function createMinisterio(
    ministerioData: Omit<Ministerio, 'id_ministerio' | 'fecha_creacion' | 'fecha_actualizacion' | 'lideres' | 'usuario_creador' | 'id_usuario_creador'>,
    id_usuario_creador: number
): Promise<MinisteriosResponse> {
    try {
        console.log('📝 Creando ministerio:', ministerioData.nombre);

        // Validar nombre único
        const { data: existente } = await supabase
            .from('ministerios')
            .select('id_ministerio')
            .eq('nombre', ministerioData.nombre.trim())
            .maybeSingle();

        if (existente) {
            return {
                success: false,
                message: 'Ya existe un ministerio con este nombre'
            };
        }

        // Crear ministerio
        const { data, error } = await supabase
            .from('ministerios')
            .insert([{
                nombre: ministerioData.nombre.trim(),
                descripcion: ministerioData.descripcion?.trim() || null,
                logo_url: ministerioData.logo_url?.trim() || null,
                activo: ministerioData.activo ?? true,
                id_usuario_creador: id_usuario_creador
            }])
            .select()
            .single();

        if (error) {
            console.error('❌ Error creando ministerio:', error);
            return {
                success: false,
                message: `Error al crear ministerio: ${error.message}`
            };
        }

        console.log('✅ Ministerio creado - ID:', data.id_ministerio);

        return {
            success: true,
            message: 'Ministerio creado exitosamente',
            data: [data]
        };

    } catch (error: any) {
        console.error('💥 Error en createMinisterio:', error);
        return {
            success: false,
            message: `Error interno del servidor: ${error.message}`
        };
    }
}

/**
 * Actualiza un ministerio existente
 * @param id_ministerio - ID del ministerio
 * @param ministerioData - Datos actualizados
 */
export async function updateMinisterio(
    id_ministerio: number,
    ministerioData: Partial<Omit<Ministerio, 'id_ministerio' | 'fecha_creacion' | 'fecha_actualizacion' | 'lideres' | 'usuario_creador' | 'id_usuario_creador'>>
): Promise<MinisteriosResponse> {
    try {
        console.log('✏️ Actualizando ministerio:', id_ministerio);

        // Verificar que el ministerio exista
        const { data: existente, error: checkError } = await supabase
            .from('ministerios')
            .select('*')
            .eq('id_ministerio', id_ministerio)
            .single();

        if (checkError || !existente) {
            return {
                success: false,
                message: 'Ministerio no encontrado'
            };
        }

        // Validar nombre único si se está cambiando
        if (ministerioData.nombre && ministerioData.nombre.trim() !== existente.nombre) {
            const { data: nombreDuplicado } = await supabase
                .from('ministerios')
                .select('id_ministerio')
                .eq('nombre', ministerioData.nombre.trim())
                .neq('id_ministerio', id_ministerio)
                .maybeSingle();

            if (nombreDuplicado) {
                return {
                    success: false,
                    message: 'Ya existe otro ministerio con este nombre'
                };
            }
        }

        // Preparar datos para actualización
        const updateData: any = {};
        if (ministerioData.nombre !== undefined) updateData.nombre = ministerioData.nombre.trim();
        if (ministerioData.descripcion !== undefined) updateData.descripcion = ministerioData.descripcion?.trim() || null;
        if (ministerioData.logo_url !== undefined) updateData.logo_url = ministerioData.logo_url?.trim() || null;
        if (ministerioData.activo !== undefined) updateData.activo = ministerioData.activo;

        const { data, error } = await supabase
            .from('ministerios')
            .update(updateData)
            .eq('id_ministerio', id_ministerio)
            .select()
            .single();

        if (error) {
            console.error('❌ Error actualizando ministerio:', error);
            return {
                success: false,
                message: `Error al actualizar ministerio: ${error.message}`
            };
        }

        console.log('✅ Ministerio actualizado - ID:', data.id_ministerio);

        return {
            success: true,
            message: 'Ministerio actualizado exitosamente',
            data: [data]
        };

    } catch (error: any) {
        console.error('💥 Error en updateMinisterio:', error);
        return {
            success: false,
            message: `Error interno del servidor: ${error.message}`
        };
    }
}

/**
 * Verifica si un ministerio tiene eventos programados
 * @param id_ministerio - ID del ministerio
 */
export async function ministerioTieneEventos(id_ministerio: number): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .rpc('ministerio_tiene_eventos_programados', { ministerio_id: id_ministerio });

        if (error) {
            console.error('Error verificando eventos:', error);
            return false;
        }

        return data === true;
    } catch (error) {
        console.error('Error en ministerioTieneEventos:', error);
        return false;
    }
}

/**
 * Deshabilita un ministerio
 * @param id_ministerio - ID del ministerio
 */
export async function deshabilitarMinisterio(id_ministerio: number): Promise<MinisteriosResponse> {
    try {
        // Verificar si tiene eventos programados
        const tieneEventos = await ministerioTieneEventos(id_ministerio);

        if (tieneEventos) {
            return {
                success: false,
                message: 'No se puede deshabilitar el ministerio porque tiene eventos programados'
            };
        }

        const { data, error } = await supabase
            .from('ministerios')
            .update({ activo: false })
            .eq('id_ministerio', id_ministerio)
            .select()
            .single();

        if (error) {
            console.error('Error deshabilitando ministerio:', error);
            return {
                success: false,
                message: 'Error al deshabilitar ministerio'
            };
        }

        console.log('✅ Ministerio deshabilitado - ID:', data.id_ministerio);

        return {
            success: true,
            message: 'Ministerio deshabilitado exitosamente',
            data: [data]
        };

    } catch (error) {
        console.error('Error en deshabilitarMinisterio:', error);
        return {
            success: false,
            message: 'Error interno del servidor'
        };
    }
}

/**
 * Habilita un ministerio
 * @param id_ministerio - ID del ministerio
 */
export async function habilitarMinisterio(id_ministerio: number): Promise<MinisteriosResponse> {
    try {
        const { data, error } = await supabase
            .from('ministerios')
            .update({ activo: true })
            .eq('id_ministerio', id_ministerio)
            .select()
            .single();

        if (error) {
            console.error('Error habilitando ministerio:', error);
            return {
                success: false,
                message: 'Error al habilitar ministerio'
            };
        }

        console.log('✅ Ministerio habilitado - ID:', data.id_ministerio);

        return {
            success: true,
            message: 'Ministerio habilitado exitosamente',
            data: [data]
        };

    } catch (error) {
        console.error('Error en habilitarMinisterio:', error);
        return {
            success: false,
            message: 'Error interno del servidor'
        };
    }
}

/**
 * Asigna líderes a un ministerio
 * @param id_ministerio - ID del ministerio
 * @param ids_usuarios - Array de IDs de usuarios (máximo 2)
 */
export async function asignarLideresMinisterio(
    id_ministerio: number,
    ids_usuarios: number[]
): Promise<MinisteriosResponse> {
    try {
        if (ids_usuarios.length === 0) {
            return {
                success: false,
                message: 'Debe seleccionar al menos un líder'
            };
        }

        if (ids_usuarios.length > 2) {
            return {
                success: false,
                message: 'Un ministerio no puede tener más de 2 líderes'
            };
        }

        // Verificar que todos los usuarios existan y tengan rol de líder
        const { data: usuarios, error: usuariosError } = await supabase
            .from('usuarios')
            .select('id_usuario, id_rol')
            .select(`
                id_usuario,
                id_rol,
                usuario,
                personas (
                    nombres,
                    apellidos,
                    numero_cedula,
                    correo_electronico,
                    celular,
                    genero,
                    fecha_nacimiento,
                    direccion
                )
            `)
            .in('id_usuario', ids_usuarios);

        if (usuariosError || !usuarios || usuarios.length !== ids_usuarios.length) {
            return {
                success: false,
                message: 'Uno o más usuarios no existen'
            };
        }

        // Verificar que sean líderes (rol 2) o pastores (rol 1)
        const todosLideres = usuarios.every(u => u.id_rol === 1 || u.id_rol === 2);
        if (!todosLideres) {
            return {
                success: false,
                message: 'Solo se pueden asignar usuarios con rol de Pastor o Líder'
            };
        }

        const missingDetails = usuarios
            .map((usuario: any) => {
                const persona = usuario.personas || {};
                const campos_faltantes = getMissingLeaderFields(persona);
                return {
                    id_usuario: usuario.id_usuario,
                    nombre_completo: persona.nombres && persona.apellidos
                        ? `${persona.nombres} ${persona.apellidos}`
                        : persona.nombres || persona.apellidos || usuario.usuario,
                    campos_faltantes
                };
            })
            .filter((detalle) => detalle.campos_faltantes.length > 0);

        if (missingDetails.length > 0) {
            return {
                success: false,
                message: 'Hay líderes con datos incompletos',
                missingDetails
            };
        }

        // Eliminar líderes actuales
        await supabase
            .from('ministerio_lideres')
            .delete()
            .eq('id_ministerio', id_ministerio);

        // Asignar nuevos líderes
        const insertData = ids_usuarios.map(id_usuario => ({
            id_ministerio,
            id_usuario
        }));

        const { error: insertError } = await supabase
            .from('ministerio_lideres')
            .insert(insertData);

        if (insertError) {
            console.error('Error asignando líderes:', insertError);
            return {
                success: false,
                message: 'Error al asignar líderes al ministerio'
            };
        }

        console.log('✅ Líderes asignados al ministerio:', id_ministerio);

        return {
            success: true,
            message: 'Líderes asignados exitosamente'
        };

    } catch (error) {
        console.error('Error en asignarLideresMinisterio:', error);
        return {
            success: false,
            message: 'Error interno del servidor'
        };
    }
}