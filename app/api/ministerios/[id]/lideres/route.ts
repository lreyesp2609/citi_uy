// app/api/ministerios/[id]/lideres/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/api/auth';
import { asignarLideresMinisterio } from '@/lib/api/ministerios';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.cookies.get('auth-token')?.value;

        console.log('👥 POST /api/ministerios/[id]/lideres - Token presente:', !!token);

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

        const { supabase } = await import('@/lib/supabase');
        const { data: usuarioData } = await supabase
            .from('usuarios')
            .select('id_rol')
            .eq('id_usuario', decoded.id)
            .single();

        if (!usuarioData || usuarioData.id_rol !== 1) {
            console.log('⛔ Acceso denegado - Rol:', usuarioData?.id_rol);
            return NextResponse.json(
                { success: false, message: 'Solo los Pastores pueden asignar líderes a ministerios' },
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
        const { lideresIds } = body;

        // Validaciones
        if (!Array.isArray(lideresIds)) {
            return NextResponse.json(
                { success: false, message: 'lideresIds debe ser un array' },
                { status: 400 }
            );
        }

        if (lideresIds.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Debe seleccionar al menos un líder' },
                { status: 400 }
            );
        }

        if (lideresIds.length > 2) {
            return NextResponse.json(
                { success: false, message: 'Un ministerio no puede tener más de 2 líderes' },
                { status: 400 }
            );
        }

        // Validar que todos sean números
        const todosNumeros = lideresIds.every((id: any) => typeof id === 'number' && !isNaN(id));
        if (!todosNumeros) {
            return NextResponse.json(
                { success: false, message: 'Todos los IDs de líderes deben ser números válidos' },
                { status: 400 }
            );
        }

        const result = await asignarLideresMinisterio(id_ministerio, lideresIds);

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: result.message,
                    missingDetails: result.missingDetails || []
                },
                { status: 400 }
            );
        }

        console.log('✅ Líderes asignados exitosamente al ministerio:', id_ministerio);

        return NextResponse.json(
            {
                success: true,
                message: `${lideresIds.length} líder${lideresIds.length > 1 ? 'es' : ''} asignado${lideresIds.length > 1 ? 's' : ''} correctamente`
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('💥 Error en asignar líderes:', error);
        return NextResponse.json(
            { success: false, message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}