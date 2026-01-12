// app/api/personas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/api/auth';
import { getAllPersonas, createPersona } from '@/lib/api/personas';

/**
 * GET /api/personas
 * Obtiene todas las personas
 * Solo accesible para roles 1 (Pastor) y 2 (Líder)
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener token de las cookies
    const token = request.cookies.get('auth-token')?.value;

    console.log('🔍 GET /api/personas - Token presente:', !!token);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verificar token
    const decoded = verifyToken(token);

    if (!decoded) {
      console.log('❌ Token inválido');
      return NextResponse.json(
        { success: false, message: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    console.log('✅ Usuario autenticado:', decoded.usuario);

    // Obtener el id_rol del usuario desde la base de datos
    const { supabase } = await import('@/lib/supabase');
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

    // Verificar que el rol sea 1 (Pastor) o 2 (Líder)
    const rolesPermitidos = [1, 2];
    if (!rolesPermitidos.includes(usuarioData.id_rol)) {
      console.log('⛔ Acceso denegado - Rol:', usuarioData.id_rol);
      return NextResponse.json(
        { success: false, message: 'No tienes permisos para acceder a este recurso' },
        { status: 403 }
      );
    }

    console.log('✅ Permisos validados - Rol:', usuarioData.id_rol);

    // Obtener todas las personas
    const result = await getAllPersonas();

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }

    console.log('✅ Personas obtenidas:', result.total);

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total
    });

  } catch (error: any) {
    console.error('💥 Error en GET /api/personas:', error);
    return NextResponse.json(
      { success: false, message: 'Error del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/personas
 * Registra una nueva persona
 * Solo accesible para roles 1 (Pastor) y 2 (Líder)
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener token de las cookies
    const token = request.cookies.get('auth-token')?.value;

    console.log('📝 POST /api/personas - Token presente:', !!token);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verificar token
    const decoded = verifyToken(token);

    if (!decoded) {
      console.log('❌ Token inválido');
      return NextResponse.json(
        { success: false, message: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    console.log('✅ Usuario autenticado:', decoded.usuario);

    // Obtener el id_rol del usuario desde la base de datos
    const { supabase } = await import('@/lib/supabase');
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

    // Verificar que el rol sea 1 (Pastor) o 2 (Líder)
    const rolesPermitidos = [1, 2];
    if (!rolesPermitidos.includes(usuarioData.id_rol)) {
      console.log('⛔ Acceso denegado - Rol:', usuarioData.id_rol);
      return NextResponse.json(
        { success: false, message: 'No tiene permisos para registrar personas' },
        { status: 403 }
      );
    }

    console.log('✅ Permisos validados - Rol:', usuarioData.id_rol);

    // Obtener datos del body
    const body = await request.json();

    // Validar campos obligatorios
    const camposObligatorios = ['nombres', 'apellidos'];
    for (const campo of camposObligatorios) {
      if (!body[campo] || body[campo].trim() === '') {
        return NextResponse.json(
          { success: false, message: `El campo ${campo} es obligatorio` },
          { status: 400 }
        );
      }
    }

    // Crear persona usando la función con rollback automático
    const result = await createPersona(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.message?.includes('ya existe') ? 400 : 500 }
      );
    }

    console.log('✅ Persona registrada exitosamente:', result.data?.[0]?.id_persona);

    return NextResponse.json({
      success: true,
      message: 'Persona registrada exitosamente',
      data: result.data
    }, { status: 201 });

  } catch (error: any) {
    console.error('💥 Error en POST /api/personas:', error);
    return NextResponse.json(
      { success: false, message: 'Error del servidor' },
      { status: 500 }
    );
  }
}