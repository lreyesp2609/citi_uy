// app/api/lideres/asignar-rol/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/api/auth';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

/**
 * Genera un username único con formato nombre.apellido
 * Si ya existe, intenta nombre.apellido1, nombre.apellido2, etc.
 */
async function generateUniqueUsername(nombres: string, apellidos: string): Promise<string> {
  const primerNombre = nombres.split(' ')[0].toLowerCase();
  const primerApellido = apellidos.split(' ')[0].toLowerCase();

  let baseUsername = `${primerNombre}.${primerApellido}`;
  let username = baseUsername;
  let counter = 1;

  while (true) {
    // Verificar si el username existe
    const { data, error } = await supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('usuario', username)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error('Error verificando username');
    }

    // Si no existe, usar este username
    if (!data) {
      return username;
    }

    // Si existe, intentar con el siguiente número
    username = `${baseUsername}${counter}`;
    counter++;
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    console.log('🔐 POST /api/lideres/asignar-rol - Token presente:', !!token);

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

    // Verificar que el usuario actual sea Pastor (id_rol = 1)
    const { data: usuarioActual, error: usuarioError } = await supabase
      .from('usuarios')
      .select('id_rol')
      .eq('id_usuario', decoded.id)
      .single();

    if (usuarioError || !usuarioActual) {
      console.error('❌ Error obteniendo usuario:', usuarioError);
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 401 }
      );
    }

    if (usuarioActual.id_rol !== 1) {
      console.log('⛔ Acceso denegado - Solo pastores pueden asignar roles');
      return NextResponse.json(
        { success: false, message: 'Solo pastores pueden asignar roles de liderazgo' },
        { status: 403 }
      );
    }

    console.log('✅ Permisos validados - Usuario es Pastor');

    // Obtener datos del body
    const { id_persona, id_rol } = await request.json();

    // Validar campos requeridos
    if (!id_persona || !id_rol) {
      return NextResponse.json(
        { success: false, message: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Validar que el rol sea 1 (Pastor) o 2 (Líder)
    if (![1, 2].includes(id_rol)) {
      return NextResponse.json(
        { success: false, message: 'Rol inválido' },
        { status: 400 }
      );
    }

    console.log('📝 Asignando rol:', { id_persona, id_rol });

    // Obtener datos completos de la persona
    const { data: persona, error: personaError } = await supabase
      .from('personas')
      .select('*')
      .eq('id_persona', id_persona)
      .single();

    if (personaError || !persona) {
      console.error('❌ Error obteniendo persona:', personaError);
      return NextResponse.json(
        { success: false, message: 'Persona no encontrada' },
        { status: 404 }
      );
    }

    // Validar que la persona tenga todos los datos completos
    const requiredFields = [
      'nombres',
      'apellidos',
      'numero_cedula',
      'correo_electronico',
      'celular',
      'genero',
      'fecha_nacimiento',
      'direccion'
    ];

    const missingFields = requiredFields.filter(field => !persona[field]);

    if (missingFields.length > 0) {
      console.log('⚠️ Datos incompletos:', missingFields);
      return NextResponse.json(
        {
          success: false,
          message: 'La persona debe tener todos sus datos completos antes de asignar un rol',
          missingFields
        },
        { status: 400 }
      );
    }

    console.log('✅ Datos de la persona completos');

    // Verificar si ya existe un usuario para esta persona
    const { data: usuarioExistente, error: checkUsuarioError } = await supabase
      .from('usuarios')
      .select('id_usuario, id_rol')
      .eq('id_persona', id_persona)
      .maybeSingle();

    if (checkUsuarioError && checkUsuarioError.code !== 'PGRST116') {
      console.error('❌ Error verificando usuario existente:', checkUsuarioError);
      return NextResponse.json(
        { success: false, message: 'Error al verificar usuario existente' },
        { status: 500 }
      );
    }

    if (usuarioExistente) {
      // Obtener el rol actual y el nuevo rol
      const { data: rolActual } = await supabase
        .from('rol')
        .select('rol')
        .eq('id_rol', usuarioExistente.id_rol)
        .single();

      const { data: rolNuevo } = await supabase
        .from('rol')
        .select('rol')
        .eq('id_rol', id_rol)
        .single();

      console.log('⚠️ Usuario ya existe, actualizando rol...');

      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ id_rol })
        .eq('id_usuario', usuarioExistente.id_usuario);

      if (updateError) {
        console.error('❌ Error actualizando rol:', updateError);
        return NextResponse.json(
          { success: false, message: 'Error al actualizar rol' },
          { status: 500 }
        );
      }

      console.log(`✅ Rol actualizado: ${rolActual?.rol} → ${rolNuevo?.rol}`);

      return NextResponse.json({
        success: true,
        message: `Rol actualizado de "${rolActual?.rol}" a "${rolNuevo?.rol}"`,
        updated: true,
        data: {
          rol_anterior: rolActual?.rol,
          rol_nuevo: rolNuevo?.rol
        }
      });
    }

    // Generar username único
    const usuario = await generateUniqueUsername(persona.nombres, persona.apellidos);
    console.log('📝 Username generado:', usuario);

    // Crear contraseña hasheada (usando la cédula)
    const password = persona.numero_cedula;
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log('🔒 Contraseña encriptada (cédula)');

    // Crear nuevo usuario
    const { data: nuevoUsuario, error: createError } = await supabase
      .from('usuarios')
      .insert([{
        id_rol,
        id_persona,
        usuario,
        contrasenia: hashedPassword,
        activo: true
      }])
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creando usuario:', createError);

      if (createError.code === '23505') {
        return NextResponse.json(
          { success: false, message: 'El nombre de usuario ya está en uso' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, message: 'Error al crear usuario' },
        { status: 500 }
      );
    }

    console.log('✅ Usuario creado exitosamente - ID:', nuevoUsuario.id_usuario);

    // Obtener nombre del rol
    const { data: rolData } = await supabase
      .from('rol')
      .select('rol')
      .eq('id_rol', id_rol)
      .single();

    return NextResponse.json({
      success: true,
      message: `Usuario creado exitosamente como ${rolData?.rol || 'líder'}`,
      data: {
        id_usuario: nuevoUsuario.id_usuario,
        usuario: nuevoUsuario.usuario,
        rol: rolData?.rol,
        credentials: {
          usuario: usuario,
          password: password
        }
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('💥 Error en POST /api/lideres/asignar-rol:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}