// app/api/personas/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/api/auth';
import { getPersonaById, updatePersona } from '@/lib/api/personas';

/**
 * GET /api/personas/[id]
 * Obtiene una persona por ID
 * Solo accesible para roles 1 (Pastor) y 2 (Líder)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    console.log('🔍 GET /api/personas/[id] - Token presente:', !!token);

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

    // Verificar permisos
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

    const rolesPermitidos = [1, 2];
    if (!rolesPermitidos.includes(usuarioData.id_rol)) {
      console.log('⛔ Acceso denegado - Rol:', usuarioData.id_rol);
      return NextResponse.json(
        { success: false, message: 'No tienes permisos para acceder a este recurso' },
        { status: 403 }
      );
    }

    // AWAIT PARAMS - ESTO ES LO IMPORTANTE
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'ID inválido' },
        { status: 400 }
      );
    }

    const result = await getPersonaById(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 404 }
      );
    }

    console.log('✅ Persona obtenida:', id);

    return NextResponse.json({
      success: true,
      data: result.data?.[0]
    });

  } catch (error: any) {
    console.error('💥 Error en GET /api/personas/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Error del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/personas/[id]
 * Actualiza una persona existente
 * Solo accesible para roles 1 (Pastor) y 2 (Líder)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    console.log('📝 PUT /api/personas/[id] - Token presente:', !!token);

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

    // Verificar permisos
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

    const rolesPermitidos = [1, 2];
    if (!rolesPermitidos.includes(usuarioData.id_rol)) {
      console.log('⛔ Acceso denegado - Rol:', usuarioData.id_rol);
      return NextResponse.json(
        { success: false, message: 'No tienes permisos para editar personas' },
        { status: 403 }
      );
    }

    console.log('✅ Permisos validados - Rol:', usuarioData.id_rol);

    // AWAIT PARAMS - ESTO ES LO IMPORTANTE
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'ID inválido' },
        { status: 400 }
      );
    }

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

    // Actualizar persona
    const result = await updatePersona(id, body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.message?.includes('ya existe') || result.message?.includes('no encontrada') ? 400 : 500 }
      );
    }

    console.log('✅ Persona actualizada exitosamente:', id);

    return NextResponse.json({
      success: true,
      message: 'Persona actualizada exitosamente',
      data: result.data?.[0]
    });

  } catch (error: any) {
    console.error('💥 Error en PUT /api/personas/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Error del servidor' },
      { status: 500 }
    );
  }
}