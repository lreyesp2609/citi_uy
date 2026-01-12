/**
 * Validaciones para formularios y datos de entrada
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Valida un email
 * @param email - Email a validar
 * @returns true si es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida una contraseña
 * @param password - Contraseña a validar
 * @param minLength - Longitud mínima (default: 6)
 * @returns Objeto con validación y errores
 */
export function validatePassword(
  password: string,
  minLength: number = 6
): ValidationResult {
  const errors: string[] = [];

  if (!password) {
    errors.push('La contraseña es requerida');
  } else {
    if (password.length < minLength) {
      errors.push(`La contraseña debe tener al menos ${minLength} caracteres`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida un nombre de usuario
 * @param usuario - Usuario a validar
 * @returns Objeto con validación y errores
 */
export function validateUsername(usuario: string): ValidationResult {
  const errors: string[] = [];

  if (!usuario) {
    errors.push('El usuario es requerido');
  } else {
    if (usuario.length < 3) {
      errors.push('El usuario debe tener al menos 3 caracteres');
    }
    if (usuario.length > 50) {
      errors.push('El usuario no puede tener más de 50 caracteres');
    }
    // Solo letras, números y guiones bajos
    if (!/^[a-zA-Z0-9_]+$/.test(usuario)) {
      errors.push('El usuario solo puede contener letras, números y guiones bajos');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida datos de login
 * @param usuario - Nombre de usuario
 * @param password - Contraseña
 * @returns Objeto con validación y errores
 */
export function validateLoginData(
  usuario: string,
  password: string
): ValidationResult {
  const errors: string[] = [];

  if (!usuario || !usuario.trim()) {
    errors.push('El usuario es requerido');
  }

  if (!password || !password.trim()) {
    errors.push('La contraseña es requerida');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Sanitiza una cadena de texto
 * @param text - Texto a sanitizar
 * @returns Texto sanitizado
 */
export function sanitizeString(text: string): string {
  return text.trim().replace(/[<>]/g, '');
}

/**
 * Valida que un campo no esté vacío
 * @param value - Valor a validar
 * @param fieldName - Nombre del campo
 * @returns Mensaje de error o null
 */
export function validateRequired(value: any, fieldName: string): string | null {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `El campo ${fieldName} es requerido`;
  }
  return null;
}