// app/api/auth/change-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/api/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        // Verificar autenticación
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
                { success: false, message: 'Token inválido' },
                { status: 401 }
            );
        }

        const { currentPassword, newPassword, confirmPassword } = await request.json();

        console.log('🔐 Cambio de contraseña para usuario ID:', decoded.id);

        // Validar campos requeridos
        if (!currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json(
                { success: false, message: 'Todos los campos son requeridos' },
                { status: 400 }
            );
        }

        // Validar que las contraseñas nuevas coincidan
        if (newPassword !== confirmPassword) {
            return NextResponse.json(
                { success: false, message: 'Las contraseñas nuevas no coinciden' },
                { status: 400 }
            );
        }

        // Validación: Mínimo 8 caracteres
        if (newPassword.length < 8) {
            return NextResponse.json(
                { success: false, message: 'La contraseña debe tener al menos 8 caracteres' },
                { status: 400 }
            );
        }

        // Validación: Al menos una letra mayúscula
        if (!/[A-Z]/.test(newPassword)) {
            return NextResponse.json(
                { success: false, message: 'La contraseña debe contener al menos una letra mayúscula' },
                { status: 400 }
            );
        }

        // Obtener usuario actual de la base de datos
        const { data: usuarioData, error: usuarioError } = await supabase
            .from('usuarios')
            .select('id_usuario, id_persona, contrasenia')
            .eq('id_usuario', decoded.id)
            .single();

        if (usuarioError || !usuarioData) {
            console.error('❌ Error obteniendo usuario:', usuarioError);
            return NextResponse.json(
                { success: false, message: 'Error del servidor' },
                { status: 500 }
            );
        }

        // E2: Verificar que la contraseña actual sea correcta
        const passwordMatch = await bcrypt.compare(currentPassword, usuarioData.contrasenia);
        if (!passwordMatch) {
            console.log('❌ Contraseña actual incorrecta');
            return NextResponse.json(
                { success: false, message: 'La contraseña actual no es correcta' },
                { status: 400 }
            );
        }

        // Obtener cédula del usuario
        const { data: personaData, error: personaError } = await supabase
            .from('personas')
            .select('numero_cedula')
            .eq('id_persona', usuarioData.id_persona)
            .single();

        if (personaError) {
            console.error('⚠️ Error obteniendo persona:', personaError);
        }

        // E4: Validar que la nueva contraseña no sea igual a la cédula
        if (personaData?.numero_cedula && newPassword === personaData.numero_cedula) {
            return NextResponse.json(
                { success: false, message: 'La nueva contraseña no puede ser igual a tu número de cédula' },
                { status: 400 }
            );
        }

        // E4: Validar que la nueva contraseña no sea igual a la actual
        const sameAsCurrentPassword = await bcrypt.compare(newPassword, usuarioData.contrasenia);
        if (sameAsCurrentPassword) {
            return NextResponse.json(
                { success: false, message: 'La nueva contraseña debe ser diferente a la contraseña actual' },
                { status: 400 }
            );
        }

        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña en la base de datos
        const { error: updateError } = await supabase
            .from('usuarios')
            .update({ contrasenia: hashedPassword })
            .eq('id_usuario', decoded.id);

        if (updateError) {
            console.error('💥 Error actualizando contraseña:', updateError);
            return NextResponse.json(
                { success: false, message: 'Error al actualizar la contraseña' },
                { status: 500 }
            );
        }

        console.log('✅ Contraseña actualizada exitosamente para usuario ID:', decoded.id);

        return NextResponse.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });

    } catch (error: any) {
        console.error('💥 Error en cambio de contraseña:', error);
        return NextResponse.json(
            { success: false, message: 'Error del servidor' },
            { status: 500 }
        );
    }
}
