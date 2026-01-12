// lib/api/auth.ts
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface Usuario {
  id_usuario: number;
  id_rol: number;
  id_persona: number;
  usuario: string;
  activo: boolean;
  personas?: Array<{
    nombres: string;
    apellidos: string;
    correo_electronico: string;
    numero_cedula: string;
    celular: string;
    direccion: string;
    fecha_nacimiento: string;
    genero: string;
    nivel_estudio: string;
    profesion: string;
  }>;
  rol?: Array<{
    rol: string;
  }>;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    usuario: string;
    nombre: string;
    rol: string;
    // Datos adicionales de la persona
    correo?: string;
    cedula?: string;
    celular?: string;
    direccion?: string;
    fecha_nacimiento?: string;
    genero?: string;
    nivel_estudio?: string;
    profesion?: string;
  };
  token?: string;
}

/**
 * Genera un token JWT
 * @param userData - Datos del usuario
 * @returns Token JWT generado
 */
export function generateToken(userData: any): string {
  const payload = {
    id: userData.id,
    usuario: userData.usuario,
    rol: userData.rol,
  };
  
  const secret = process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambiar-en-produccion';
  
  return jwt.sign(payload, secret, { 
    expiresIn: '7d' // 7 días - sin issuer/audience para simplificar
  });
}

/**
 * Verifica un token JWT
 * @param token - Token a verificar
 * @returns Datos del usuario si el token es válido, null si no
 */
export function verifyToken(token: string): any {
  try {
    const secret = process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambiar-en-produccion';
    
    const decoded = jwt.verify(token, secret); // Sin issuer/audience
    
    return decoded;
  } catch (error) {
    console.error('Error verificando token:', error);
    return null;
  }
}

/**
 * Hashea una contraseña (útil para crear nuevos usuarios)
 * @param password - Contraseña en texto plano
 * @returns Contraseña hasheada
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Valida las credenciales del usuario
 * El usuario puede iniciar sesión con: usuario, correo_electronico o numero_cedula
 * @param identificador - Usuario, correo o cédula
 * @param password - Contraseña en texto plano
 * @returns Datos del usuario si las credenciales son válidas
 */
export async function validateUserCredentials(
  identificador: string,
  password: string
): Promise<LoginResponse> {
  try {
    let usuarioData = null;
    
    // 1. Intentar buscar por nombre de usuario primero
    const { data: byUsername, error: usernameError } = await supabase
      .from('usuarios')
      .select(`
        id_usuario,
        id_rol,
        id_persona,
        usuario,
        contrasenia,
        activo,
        personas (
          nombres,
          apellidos,
          correo_electronico,
          numero_cedula,
          celular,
          direccion,
          fecha_nacimiento,
          genero,
          nivel_estudio,
          profesion
        ),
        rol (
          rol
        )
      `)
      .eq('usuario', identificador)
      .maybeSingle();
    
    if (byUsername) {
      usuarioData = byUsername;
    } else {
      // 2. Si no se encontró por usuario, buscar por correo o cédula en la tabla personas
      const { data: persona, error: personaError } = await supabase
        .from('personas')
        .select('id_persona')
        .or(`correo_electronico.eq.${identificador},numero_cedula.eq.${identificador}`)
        .maybeSingle();
      
      if (persona) {
        // 3. Buscar el usuario asociado a esa persona
        const { data: byPersona, error: byPersonaError } = await supabase
          .from('usuarios')
          .select(`
            id_usuario,
            id_rol,
            id_persona,
            usuario,
            contrasenia,
            activo,
            personas (
              nombres,
              apellidos,
              correo_electronico,
              numero_cedula,
              celular,
              direccion,
              fecha_nacimiento,
              genero,
              nivel_estudio,
              profesion
            ),
            rol (
              rol
            )
          `)
          .eq('id_persona', persona.id_persona)
          .maybeSingle();
        
        usuarioData = byPersona;
      }
    }

    if (!usuarioData) {
      return {
        success: false,
        message: 'Credenciales incorrectas'
      };
    }

    // 2. Verificar si el usuario está activo
    if (!usuarioData.activo) {
      return {
        success: false,
        message: 'Usuario inactivo. Contacte al administrador'
      };
    }

    // 3. Comparar contraseña hasheada
    const passwordMatch = await bcrypt.compare(password, usuarioData.contrasenia);

    if (!passwordMatch) {
      return {
        success: false,
        message: 'Usuario o contraseña incorrectos'
      };
    }

    // 4. Preparar datos COMPLETOS del usuario (sin la contraseña)
    const persona = usuarioData.personas?.[0];
    const rolData = usuarioData.rol?.[0];
    
    const userData = {
      id: usuarioData.id_usuario,
      usuario: usuarioData.usuario,
      nombre: `${persona?.nombres || ''} ${persona?.apellidos || ''}`.trim(),
      rol: rolData?.rol || 'Usuario',
      // Datos adicionales de la persona
      correo: persona?.correo_electronico,
      cedula: persona?.numero_cedula,
      celular: persona?.celular,
      direccion: persona?.direccion,
      fecha_nacimiento: persona?.fecha_nacimiento,
      genero: persona?.genero,
      nivel_estudio: persona?.nivel_estudio,
      profesion: persona?.profesion,
    };

    // 5. Generar token
    const token = generateToken(userData);

    return {
      success: true,
      message: 'Login exitoso',
      user: userData,
      token
    };

  } catch (error) {
    console.error('Error en validateUserCredentials:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}