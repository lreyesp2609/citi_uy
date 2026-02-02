// lib/api/personas.ts
import { supabase } from '@/lib/supabase';

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
  rol?: string | null;
  id_rol?: number | null;
}

export interface PersonasResponse {
  success: boolean;
  message?: string;
  data?: Persona[];
  total?: number;
}

/**
 * Obtiene todas las personas de la base de datos CON SUS ROLES
 * Solo accesible para roles 1 (Pastor) y 2 (Líder)
 * @returns Lista de personas ordenadas por ID con información de roles
 */
export async function getAllPersonas(): Promise<PersonasResponse> {
  try {
    // Obtener todas las personas
    const { data: personasData, error: personasError } = await supabase
      .from('personas')
      .select('*')
      .order('id_persona', { ascending: true });

    if (personasError) {
      console.error('Error obteniendo personas:', personasError);
      return {
        success: false,
        message: 'Error al obtener personas'
      };
    }

    // Obtener usuarios con roles
    const { data: usuariosData, error: usuariosError } = await supabase
      .from('usuarios')
      .select(`
        id_persona,
        id_rol,
        rol (
          rol
        )
      `);

    if (usuariosError) {
      console.error('Error obteniendo usuarios:', usuariosError);
      // Continuar sin roles
    }

    // Combinar datos
    const personasFormateadas = personasData.map((persona: any) => {
      const usuario = usuariosData?.find((u: any) => u.id_persona === persona.id_persona) as any;
      return {
        ...persona,
        rol: usuario?.rol?.rol || null,
        id_rol: usuario?.id_rol || null
      };
    });

    console.log('✅ Personas cargadas con roles:', personasFormateadas.length);

    return {
      success: true,
      data: personasFormateadas,
      total: personasFormateadas.length
    };

  } catch (error) {
    console.error('Error en getAllPersonas:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

/**
 * Crea una nueva persona en la base de datos
 * Con validación de duplicados y rollback automático en caso de error
 * Solo accesible para roles 1 (Pastor) y 2 (Líder)
 * @param personaData - Datos de la persona a crear
 * @returns Resultado de la operación
 */
export async function createPersona(personaData: Omit<Persona, 'id_persona'>): Promise<PersonasResponse> {
  try {
    // Limpiar y validar número de cédula
    let numero_cedula = personaData.numero_cedula?.trim() || null;

    // Si se proporcionó cédula, validar que no exista
    if (numero_cedula) {
      const { data: personaExistente, error: checkError } = await supabase
        .from('personas')
        .select('id_persona')
        .eq('numero_cedula', numero_cedula)
        .maybeSingle();

      if (checkError) {
        console.error('Error verificando cédula:', checkError);
        return {
          success: false,
          message: 'Error al validar número de cédula'
        };
      }

      if (personaExistente) {
        return {
          success: false,
          message: 'Ya existe una persona con este número de cédula'
        };
      }
    }

    // Preparar datos para inserción
    const personaToInsert = {
      nombres: personaData.nombres.trim().toUpperCase(), // ✅ MAYÚSCULAS
      apellidos: personaData.apellidos.trim().toUpperCase(), // ✅ MAYÚSCULAS
      numero_cedula: numero_cedula,
      correo_electronico: personaData.correo_electronico?.trim() || null,
      genero: personaData.genero?.trim() || null,
      fecha_nacimiento: personaData.fecha_nacimiento || null,
      nivel_estudio: personaData.nivel_estudio?.trim() || null,
      nacionalidad: personaData.nacionalidad?.trim() || null,
      profesion: personaData.profesion?.trim() || null,
      estado_civil: personaData.estado_civil?.trim() || null,
      lugar_trabajo: personaData.lugar_trabajo?.trim() || null,
      celular: personaData.celular?.trim() || null,
      direccion: personaData.direccion?.trim() || null,
    };

    console.log('📝 Insertando persona:', {
      nombres: personaToInsert.nombres,
      apellidos: personaToInsert.apellidos,
      cedula: personaToInsert.numero_cedula || 'sin cédula'
    });

    // Insertar persona - Supabase maneja el rollback automáticamente en caso de error
    const { data, error } = await supabase
      .from('personas')
      .insert([personaToInsert])
      .select()
      .single();

    if (error) {
      console.error('Error insertando persona:', error);

      // Manejar errores específicos de base de datos
      if (error.code === '23505') { // Unique violation
        return {
          success: false,
          message: 'Ya existe una persona con estos datos'
        };
      }

      return {
        success: false,
        message: 'Error al registrar persona'
      };
    }

    console.log('✅ Persona creada exitosamente - ID:', data.id_persona);

    return {
      success: true,
      data: [data]
    };

  } catch (error) {
    console.error('Error en createPersona:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function getPersonaById(id_persona: number): Promise<PersonasResponse> {
  try {
    const { data, error } = await supabase
      .from('personas')
      .select(`
        id_persona,
        numero_cedula,
        nombres,
        apellidos,
        fecha_nacimiento,
        genero,
        celular,
        direccion,
        correo_electronico,
        nivel_estudio,
        nacionalidad,
        profesion,
        estado_civil,
        lugar_trabajo
      `)
      .eq('id_persona', id_persona)
      .single();

    if (error) {
      console.error('Error obteniendo persona:', error);
      return {
        success: false,
        message: 'Persona no encontrada'
      };
    }

    return {
      success: true,
      data: [data]
    };

  } catch (error) {
    console.error('Error en getPersonaById:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

/**
 * Actualiza una persona existente en la base de datos
 * Con validación de duplicados (cédula, correo, celular)
 * Solo accesible para roles 1 (Pastor) y 2 (Líder)
 * @param id_persona - ID de la persona a actualizar
 * @param personaData - Datos actualizados de la persona
 * @returns Resultado de la operación
 */
export async function updatePersona(
  id_persona: number,
  personaData: Partial<Omit<Persona, 'id_persona'>>
): Promise<PersonasResponse> {
  try {
    // Verificar que la persona exista
    const { data: personaExistente, error: checkError } = await supabase
      .from('personas')
      .select('*')
      .eq('id_persona', id_persona)
      .single();

    if (checkError || !personaExistente) {
      console.error('Error verificando persona:', checkError);
      return {
        success: false,
        message: 'Persona no encontrada'
      };
    }

    // Validar duplicados solo si los campos fueron modificados

    // Validar número de cédula si se proporciona y es diferente
    if (personaData.numero_cedula && personaData.numero_cedula.trim() !== '') {
      const numero_cedula = personaData.numero_cedula.trim();

      if (numero_cedula !== personaExistente.numero_cedula) {
        const { data: cedulaDuplicada, error: cedulaError } = await supabase
          .from('personas')
          .select('id_persona')
          .eq('numero_cedula', numero_cedula)
          .neq('id_persona', id_persona)
          .maybeSingle();

        if (cedulaError) {
          console.error('Error verificando cédula:', cedulaError);
          return {
            success: false,
            message: 'Error al validar número de cédula'
          };
        }

        if (cedulaDuplicada) {
          return {
            success: false,
            message: 'Ya existe otra persona con este número de cédula'
          };
        }
      }
    }

    // Validar correo electrónico si se proporciona y es diferente
    if (personaData.correo_electronico && personaData.correo_electronico.trim() !== '') {
      const correo = personaData.correo_electronico.trim();

      if (correo !== personaExistente.correo_electronico) {
        const { data: correoDuplicado, error: correoError } = await supabase
          .from('personas')
          .select('id_persona')
          .eq('correo_electronico', correo)
          .neq('id_persona', id_persona)
          .maybeSingle();

        if (correoError) {
          console.error('Error verificando correo:', correoError);
          return {
            success: false,
            message: 'Error al validar correo electrónico'
          };
        }

        if (correoDuplicado) {
          return {
            success: false,
            message: 'Ya existe otra persona con este correo electrónico'
          };
        }
      }
    }

    // Validar celular si se proporciona y es diferente
    if (personaData.celular && personaData.celular.trim() !== '') {
      const celular = personaData.celular.trim();

      if (celular !== personaExistente.celular) {
        const { data: celularDuplicado, error: celularError } = await supabase
          .from('personas')
          .select('id_persona')
          .eq('celular', celular)
          .neq('id_persona', id_persona)
          .maybeSingle();

        if (celularError) {
          console.error('Error verificando celular:', celularError);
          return {
            success: false,
            message: 'Error al validar número de celular'
          };
        }

        if (celularDuplicado) {
          return {
            success: false,
            message: 'Ya existe otra persona con este número de celular'
          };
        }
      }
    }

    // Preparar datos para actualización (solo campos proporcionados)
    const personaToUpdate: any = {};

    if (personaData.nombres !== undefined) {
      personaToUpdate.nombres = personaData.nombres.trim().toUpperCase(); // ✅ MAYÚSCULAS
    }
    if (personaData.apellidos !== undefined) {
      personaToUpdate.apellidos = personaData.apellidos.trim().toUpperCase(); // ✅ MAYÚSCULAS
    }
    if (personaData.numero_cedula !== undefined) {
      personaToUpdate.numero_cedula = personaData.numero_cedula?.trim() || null;
    }
    if (personaData.correo_electronico !== undefined) {
      personaToUpdate.correo_electronico = personaData.correo_electronico?.trim() || null;
    }
    if (personaData.genero !== undefined) {
      personaToUpdate.genero = personaData.genero?.trim() || null;
    }
    if (personaData.fecha_nacimiento !== undefined) {
      personaToUpdate.fecha_nacimiento = personaData.fecha_nacimiento || null;
    }
    if (personaData.nivel_estudio !== undefined) {
      personaToUpdate.nivel_estudio = personaData.nivel_estudio?.trim() || null;
    }
    if (personaData.nacionalidad !== undefined) {
      personaToUpdate.nacionalidad = personaData.nacionalidad?.trim() || null;
    }
    if (personaData.profesion !== undefined) {
      personaToUpdate.profesion = personaData.profesion?.trim() || null;
    }
    if (personaData.estado_civil !== undefined) {
      personaToUpdate.estado_civil = personaData.estado_civil?.trim() || null;
    }
    if (personaData.lugar_trabajo !== undefined) {
      personaToUpdate.lugar_trabajo = personaData.lugar_trabajo?.trim() || null;
    }
    if (personaData.celular !== undefined) {
      personaToUpdate.celular = personaData.celular?.trim() || null;
    }
    if (personaData.direccion !== undefined) {
      personaToUpdate.direccion = personaData.direccion?.trim() || null;
    }

    console.log('📝 Actualizando persona:', {
      id: id_persona,
      campos: Object.keys(personaToUpdate)
    });

    // Actualizar persona
    const { data, error } = await supabase
      .from('personas')
      .update(personaToUpdate)
      .eq('id_persona', id_persona)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando persona:', error);

      // Manejar errores específicos de base de datos
      if (error.code === '23505') { // Unique violation
        return {
          success: false,
          message: 'Ya existe una persona con estos datos'
        };
      }

      return {
        success: false,
        message: 'Error al actualizar persona'
      };
    }

    console.log('✅ Persona actualizada exitosamente - ID:', data.id_persona);

    return {
      success: true,
      data: [data]
    };

  } catch (error) {
    console.error('Error en updatePersona:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}