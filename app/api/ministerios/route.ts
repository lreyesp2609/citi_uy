// app/api/ministerios/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/api/auth';
import { getAllMinisterios, createMinisterio } from '@/lib/api/ministerios';

/**
 * GET /api/ministerios
 * Obtiene todos los ministerios
 */
export async function GET(request: NextRequest) {
    try {
        console.log('📥 GET /api/ministerios');

        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            console.log('❌ No hay token');
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

        const result = await getAllMinisterios();

        if (!result.success) {
            console.error('❌ Error al obtener ministerios:', result.message);
            return NextResponse.json(
                { success: false, message: result.message },
                { status: 500 }
            );
        }

        console.log('✅ Ministerios obtenidos:', result.total);

        return NextResponse.json(result, { status: 200 });

    } catch (error: any) {
        console.error('💥 Error en GET /api/ministerios:', error);
        return NextResponse.json(
            { success: false, message: `Error interno del servidor: ${error.message}` },
            { status: 500 }
        );
    }
}

/**
 * POST /api/ministerios
 * Crea un nuevo ministerio
 */
export async function POST(request: NextRequest) {
    try {
        console.log('📥 POST /api/ministerios');

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

        // Solo Pastores pueden crear ministerios
        if (usuarioData.id_rol !== 1) {
            console.log('⛔ Acceso denegado - Rol:', usuarioData.id_rol);
            return NextResponse.json(
                { success: false, message: 'Solo los Pastores pueden crear ministerios' },
                { status: 403 }
            );
        }

        console.log('✅ Permisos validados - Rol:', usuarioData.id_rol);

        const body = await request.json();
        const { nombre, descripcion, logo_url, activo } = body;

        // Validaciones
        if (!nombre || !nombre.trim()) {
            return NextResponse.json(
                { success: false, message: 'El nombre es requerido' },
                { status: 400 }
            );
        }

        if (!descripcion || !descripcion.trim()) {
            return NextResponse.json(
                { success: false, message: 'La descripción es requerida' },
                { status: 400 }
            );
        }

        const ministerioData = {
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            logo_url: logo_url?.trim() || null,
            activo: activo ?? true
        };

        // Pasar el id del usuario que crea el ministerio
        const result = await createMinisterio(ministerioData, decoded.id);

        if (!result.success) {
            return NextResponse.json(
                { success: false, message: result.message },
                { status: 400 }
            );
        }

        console.log('✅ Ministerio creado exitosamente');

        return NextResponse.json(result, { status: 201 });

    } catch (error: any) {
        console.error('💥 Error en POST /api/ministerios:', error);
        return NextResponse.json(
            { success: false, message: `Error interno del servidor: ${error.message}` },
            { status: 500 }
        );
    }
}