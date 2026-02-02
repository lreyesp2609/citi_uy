import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/api/auth';
import { supabase } from '@/lib/supabase';

const requiredFields = [
  'nombres',
  'apellidos',
  'numero_cedula',
  'correo_electronico',
  'celular',
  'genero',
  'fecha_nacimiento',
  'direccion'
] as const;

type RequiredField = (typeof requiredFields)[number];

function getMissingFields(persona: Record<string, any>): RequiredField[] {
  return requiredFields.filter((field) => {
    const value = persona?.[field];
    if (typeof value === 'string') {
      return value.trim() === '';
    }
    return !value;
  });
}

/**
 * GET /api/usuarios
 * Obtiene usuarios con datos de persona y estado de completitud
 * Solo accesible para roles 1 (Pastor) y 2 (Líder)
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    console.log('🔍 GET /api/usuarios - Token presente:', !!token);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      console.log('❌ Token inválido');
      return NextResponse.json(
        { success: false, message: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .select('id_rol')
      .eq('id_usuario', decoded.id)
      .single();

    if (usuarioError || !usuarioData) {
      console.error('❌ Error obteniendo usuario:', usuarioError);
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 401 }
      );
    }

    const rolesPermitidos = [1, 2];
    if (!rolesPermitidos.includes(usuarioData.id_rol)) {
      console.log('⛔ Acceso denegado - Rol:', usuarioData.id_rol);
      return NextResponse.json(
        { success: false, message: 'No tienes permisos para acceder a este recurso' },
        { status: 403 }
      );
    }

    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select(`
        id_usuario,
        id_rol,
        usuario,
        personas (
          nombres,
          apellidos,
          correo_electronico,
          numero_cedula,
          celular,
          genero,
          fecha_nacimiento,
          direccion
        ),
        rol (rol)
      `)
      .order('id_usuario', { ascending: true });

    if (usuariosError) {
      console.error('❌ Error obteniendo usuarios:', usuariosError);
      return NextResponse.json(
        { success: false, message: 'Error al obtener usuarios' },
        { status: 500 }
      );
    }

    const usuariosFormateados = (usuarios || []).map((usuario: any) => {
      const persona = usuario.personas || {};
      const campos_faltantes = getMissingFields(persona);

      return {
        id_usuario: usuario.id_usuario,
        rol: usuario.id_rol,
        rol_nombre: usuario.rol?.rol || null,
        usuario: usuario.usuario,
        es_usuario_actual: usuario.id_usuario === decoded.id,
        nombre_completo: persona.nombres && persona.apellidos
          ? `${persona.nombres} ${persona.apellidos}`
          : persona.nombres || persona.apellidos || usuario.usuario,
        email: persona.correo_electronico || '',
        datos_completos: campos_faltantes.length === 0,
        campos_faltantes
      };
    });

    console.log('✅ Usuarios obtenidos:', usuariosFormateados.length);

    return NextResponse.json({ success: true, data: usuariosFormateados });
  } catch (error) {
    console.error('💥 Error en GET /api/usuarios:', error);
    return NextResponse.json(
      { success: false, message: 'Error del servidor' },
      { status: 500 }
    );
  }
}