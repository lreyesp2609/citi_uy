// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/api/auth';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Obtener token de las cookies
    const token = request.cookies.get('auth-token')?.value;

    console.log('🔍 Session Check - Token presente:', !!token);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verificar token
    const decoded = verifyToken(token);

    if (!decoded) {
      console.log('❌ Token inválido o expirado');
      return NextResponse.json(
        { success: false, message: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    console.log('✅ Token válido para usuario ID:', decoded.id);

    // Obtener datos del usuario
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .select('id_usuario, id_persona, id_rol, usuario, activo')
      .eq('id_usuario', decoded.id)
      .single();

    if (usuarioError || !usuarioData || !usuarioData.activo) {
      console.error('❌ Error obteniendo usuario:', usuarioError);
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado o inactivo' },
        { status: 401 }
      );
    }

    console.log('✅ Usuario encontrado:', usuarioData.usuario);

    // Obtener datos de la persona
    const { data: personaData, error: personaError } = await supabase
      .from('personas')
      .select('nombres, apellidos, correo_electronico, numero_cedula, celular, direccion, fecha_nacimiento, genero, nivel_estudio, profesion')
      .eq('id_persona', usuarioData.id_persona)
      .single();

    if (personaError) {
      console.error('⚠️ Error obteniendo persona:', personaError);
    }

    // Obtener rol - CRÍTICO: No usar valor por defecto aquí
    const { data: rolData, error: rolError } = await supabase
      .from('rol')
      .select('rol')
      .eq('id_rol', usuarioData.id_rol)
      .single();

    if (rolError) {
      console.error('❌ Error obteniendo rol:', rolError);
      // Si no puede obtener el rol, es un error crítico
      return NextResponse.json(
        { success: false, message: 'Error obteniendo rol del usuario' },
        { status: 500 }
      );
    }

    console.log('✅ Rol obtenido:', rolData?.rol);

    // Si no hay rol, también es un error
    if (!rolData || !rolData.rol) {
      console.error('❌ No se encontró rol para id_rol:', usuarioData.id_rol);
      return NextResponse.json(
        { success: false, message: 'Rol no encontrado' },
        { status: 500 }
      );
    }

    // Obtener contraseña hasheada para detectar si es la predeterminada
    const { data: usuarioConPassword, error: passwordError } = await supabase
      .from('usuarios')
      .select('contrasenia')
      .eq('id_usuario', decoded.id)
      .single();

    // Detectar si la contraseña es la cédula (contraseña predeterminada)
    let requiereCambioPassword = false;
    if (personaData?.numero_cedula && usuarioConPassword?.contrasenia) {
      const bcrypt = require('bcryptjs');
      const passwordEsCedula = await bcrypt.compare(personaData.numero_cedula, usuarioConPassword.contrasenia);
      if (passwordEsCedula) {
        console.log('⚠️ Usuario tiene contraseña predeterminada (cédula)');
        requiereCambioPassword = true;
      }
    }

    const user = {
      id: usuarioData.id_usuario,
      usuario: usuarioData.usuario,
      nombre: personaData ? `${personaData.nombres} ${personaData.apellidos}`.trim() : '',
      rol: rolData.rol, // ← Sin valor por defecto
      // Datos adicionales
      correo: personaData?.correo_electronico,
      cedula: personaData?.numero_cedula,
      celular: personaData?.celular,
      direccion: personaData?.direccion,
      fecha_nacimiento: personaData?.fecha_nacimiento,
      genero: personaData?.genero,
      nivel_estudio: personaData?.nivel_estudio,
      profesion: personaData?.profesion,
      requiere_cambio_password: requiereCambioPassword,
    };

    console.log('✅ Usuario completo:', {
      id: user.id,
      usuario: user.usuario,
      rol: user.rol
    });

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error: any) {
    console.error('💥 Error verificando sesión:', error);
    return NextResponse.json(
      { success: false, message: 'Error del servidor' },
      { status: 500 }
    );
  }
}