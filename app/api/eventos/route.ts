import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/api/auth';
import { createEvento, getEventosByMinisterio } from '@/lib/api/eventos';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });

        const searchParams = request.nextUrl.searchParams;
        const ministerioId = searchParams.get('ministerioId');

        if (!ministerioId) {
            return NextResponse.json({ success: false, message: 'Ministerio ID requerido' }, { status: 400 });
        }

        const result = await getEventosByMinisterio(parseInt(ministerioId));
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });

        const decoded = verifyToken(token);
        // Validar rol aquí si es necesario (Líder o Pastor) - Por ahora asumimos que el middleware protege o validamos en UI
        // Idealmente verificar si el usuario pertenece al ministerio

        const body = await request.json();
        const result = await createEvento(body);

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
