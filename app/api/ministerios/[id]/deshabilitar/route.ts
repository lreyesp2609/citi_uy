// app/api/ministerios/[id]/deshabilitar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/api/auth';
import { deshabilitarMinisterio } from '@/lib/api/ministerios';

export async function POST(
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

        const { supabase } = await import('@/lib/supabase');
        const { data: usuarioData } = await supabase
            .from('usuarios')
            .select('id_rol')
            .eq('id_usuario', decoded.id)
            .single();

        if (!usuarioData || usuarioData.id_rol !== 1) {
            return NextResponse.json(
                { success: false, message: 'Solo los Pastores pueden deshabilitar ministerios' },
                { status: 403 }
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

        const result = await deshabilitarMinisterio(id_ministerio);

        if (!result.success) {
            return NextResponse.json(result, { status: 400 });
        }

        console.log('✅ Ministerio deshabilitado:', id_ministerio);

        return NextResponse.json(
            {
                success: true,
                message: 'Ministerio deshabilitado correctamente',
                data: result.data?.[0]
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('💥 Error en deshabilitar ministerio:', error);
        return NextResponse.json(
            { success: false, message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}