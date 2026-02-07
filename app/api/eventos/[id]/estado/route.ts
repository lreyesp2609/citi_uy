import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/api/auth';
import { changeEstadoEvento, EventoEstado } from '@/lib/api/eventos';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const token = request.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const { estado, motivo_rechazo } = body;

        // Validaciones de roles podrían ir aquí:
        // - Solo Líder puede pasar a EN_REVISION
        // - Solo Pastor puede pasar a APROBADO / RECHAZADO

        const result = await changeEstadoEvento(parseInt(id), estado as EventoEstado, motivo_rechazo);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
