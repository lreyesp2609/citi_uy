// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateToken } from '@/lib/api/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { usuario, password } = await request.json();

    console.log('🔐 Intento de login para:', usuario);

    // Validar campos
    if (!usuario || !password) {
      return NextResponse.json(
        { success: false, message: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario por usuario primero
    let { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .select(`
        id_usuario,
        id_persona,
        id_rol,
        usuario,
        contrasenia,
        activo
      `)
      .eq('usuario', usuario)
      .maybeSingle();

    // Si no se encontró por usuario, buscar por correo o cédula
    if (!usuarioData) {
      console.log('🔍 No encontrado por usuario, buscando por correo/cédula...');

      const { data: persona, error: personaError } = await supabase
        .from('personas')
        .select('id_persona')
        .or(`correo_electronico.eq.${usuario},numero_cedula.eq.${usuario}`)
        .maybeSingle();

      if (persona) {
        const { data: usuarioPorPersona, error: usuarioPersonaError } = await supabase
          .from('usuarios')
          .select(`
            id_usuario,
            id_persona,
            id_rol,
            usuario,
            contrasenia,
            activo
          `)
          .eq('id_persona', persona.id_persona)
          .maybeSingle();

        usuarioData = usuarioPorPersona;
      }
    }

    if (!usuarioData) {
      console.log('❌ Usuario no encontrado:', usuario);
      return NextResponse.json(
        { success: false, message: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Verificar si está activo
    if (!usuarioData.activo) {
      console.log('❌ Usuario inactivo:', usuario);
      return NextResponse.json(
        { success: false, message: 'Usuario inactivo' },
        { status: 401 }
      );
    }

    // Verificar contraseña - IMPORTANTE: usar 'contrasenia' no 'password'
    const passwordMatch = await bcrypt.compare(password, usuarioData.contrasenia);
    if (!passwordMatch) {
      console.log('❌ Contraseña incorrecta para:', usuario);
      return NextResponse.json(
        { success: false, message: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      );
    }

    console.log('✅ Credenciales válidas para:', usuarioData.usuario);

    // Obtener información completa de la persona
    const { data: personaData, error: personaError } = await supabase
      .from('personas')
      .select('nombres, apellidos, correo_electronico, numero_cedula, celular, direccion, fecha_nacimiento, genero, nivel_estudio, profesion')
      .eq('id_persona', usuarioData.id_persona)
      .single();

    if (personaError) {
      console.error('⚠️ Error obteniendo persona:', personaError);
    }

    // Obtener rol
    const { data: rolData, error: rolError } = await supabase
      .from('rol')
      .select('rol')
      .eq('id_rol', usuarioData.id_rol)
      .single();

    if (rolError) {
      console.error('⚠️ Error obteniendo rol:', rolError);
    }

    console.log('✅ Rol del usuario:', rolData?.rol);

    // Detectar si la contraseña es la cédula (contraseña predeterminada)
    let requiereCambioPassword = false;
    if (personaData?.numero_cedula) {
      const passwordEsCedula = await bcrypt.compare(personaData.numero_cedula, usuarioData.contrasenia);
      if (passwordEsCedula) {
        console.log('⚠️ Usuario tiene contraseña predeterminada (cédula)');
        requiereCambioPassword = true;
      }
    }

    // Preparar objeto de usuario
    const user = {
      id: usuarioData.id_usuario,
      usuario: usuarioData.usuario,
      nombre: personaData ? `${personaData.nombres} ${personaData.apellidos}`.trim() : '',
      rol: rolData?.rol || 'usuario',
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

    // Generar token JWT
    const token = generateToken({
      id: usuarioData.id_usuario,
      usuario: usuarioData.usuario,
      rol: rolData?.rol || 'usuario'
    });

    console.log('✅ Login exitoso - Usuario completo:', {
      id: user.id,
      usuario: user.usuario,
      rol: user.rol
    });

    // Crear respuesta con cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login exitoso',
      user,
      token
    });

    // Configurar cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/'
    });

    console.log('✅ Cookie configurada correctamente');

    return response;

  } catch (error: any) {
    console.error('💥 Error en login:', error);
    return NextResponse.json(
      { success: false, message: 'Error del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Logout
export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });

  // Eliminar cookie
  response.cookies.delete('auth-token');

  console.log('🚪 Logout - Cookie eliminada');

  return response;
}