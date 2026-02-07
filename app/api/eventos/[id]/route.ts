import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/api/auth';
import { updateEvento } from '@/lib/api/eventos';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const token = request.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const result = await updateEvento(parseInt(id), body);

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
