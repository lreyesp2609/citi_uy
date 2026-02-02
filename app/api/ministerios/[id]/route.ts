// app/api/ministerios/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/api/auth';
import { getMinisterioById, updateMinisterio } from '@/lib/api/ministerios';

/**
 * GET /api/ministerios/[id]
 * Obtiene un ministerio por ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'No autenticado' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: 'Token inválido o expirado' },
                { status: 401 }
            );
        }

        // 👇 AWAIT params antes de acceder a sus propiedades
        const { id } = await params;
        const id_ministerio = parseInt(id);

        if (isNaN(id_ministerio)) {
            return NextResponse.json(
                { success: false, message: 'ID de ministerio inválido' },
                { status: 400 }
            );
        }

        const result = await getMinisterioById(id_ministerio);

        if (!result.success) {
            return NextResponse.json(result, { status: 404 });
        }

        return NextResponse.json(result.data?.[0], { status: 200 });

    } catch (error) {
        console.error('💥 Error en GET /api/ministerios/[id]:', error);
        return NextResponse.json(
            { success: false, message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/ministerios/[id]
 * Actualiza un ministerio existente
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.cookies.get('auth-token')?.value;

        console.log('✏️ PUT /api/ministerios/[id] - Token presente:', !!token);

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

        console.log('✅ Usuario autenticado:', decoded.usuario);

        // Obtener el id_rol del usuario
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

        // Solo Pastores pueden editar ministerios
        if (usuarioData.id_rol !== 1) {
            console.log('⛔ Acceso denegado - Rol:', usuarioData.id_rol);
            return NextResponse.json(
                { success: false, message: 'Solo los Pastores pueden editar ministerios' },
                { status: 403 }
            );
        }

        console.log('✅ Permisos validados - Rol:', usuarioData.id_rol);

        // 👇 AWAIT params antes de acceder a sus propiedades
        const { id } = await params;
        const id_ministerio = parseInt(id);

        if (isNaN(id_ministerio)) {
            return NextResponse.json(
                { success: false, message: 'ID de ministerio inválido' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { nombre, descripcion, logo_url } = body;

        // Validaciones
        if (nombre !== undefined && (!nombre || !nombre.trim())) {
            return NextResponse.json(
                { success: false, message: 'El nombre no puede estar vacío' },
                { status: 400 }
            );
        }

        if (descripcion !== undefined && (!descripcion || !descripcion.trim())) {
            return NextResponse.json(
                { success: false, message: 'La descripción no puede estar vacía' },
                { status: 400 }
            );
        }

        const updateData: any = {};
        if (nombre !== undefined) updateData.nombre = nombre.trim();
        if (descripcion !== undefined) updateData.descripcion = descripcion.trim();
        if (logo_url !== undefined) updateData.logo_url = logo_url?.trim() || null;

        const result = await updateMinisterio(id_ministerio, updateData);

        if (!result.success) {
            return NextResponse.json(
                { success: false, message: result.message },
                { status: 400 }
            );
        }

        console.log('✅ Ministerio actualizado exitosamente:', id_ministerio);

        return NextResponse.json(result.data?.[0], { status: 200 });

    } catch (error) {
        console.error('💥 Error en PUT /api/ministerios/[id]:', error);
        return NextResponse.json(
            { success: false, message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}