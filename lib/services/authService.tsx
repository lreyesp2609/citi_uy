/**
 * Servicio de autenticación - Agrupa todas las llamadas relacionadas con auth
 */

import { apiClient } from '@/lib/api/client';

export interface LoginCredentials {
  usuario: string;
  password: string;
}

export interface User {
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
  // Control de cambio de contraseña
  requiere_cambio_password?: boolean;
}

export interface LoginResult {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}

export const authService = {
  /**
   * Inicia sesión con usuario y contraseña
   */
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    return apiClient.post<User>('/auth/login', credentials);
  },

  /**
   * Cierra la sesión actual
   */
  async logout(): Promise<{ success: boolean; message?: string }> {
    return apiClient.delete('/auth/login');
  },

  /**
   * Verifica si el usuario tiene una sesión activa
   */
  async checkSession(): Promise<{ success: boolean; user?: User }> {
    return apiClient.get('/auth/session');
  },

  /**
   * Solicita recuperación de contraseña
   */
  async requestPasswordReset(usuario: string): Promise<{ success: boolean; message?: string }> {
    return apiClient.post('/auth/password-reset', { usuario });
  },

  /**
   * Restablece la contraseña con token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    return apiClient.post('/auth/password-reset/confirm', { token, newPassword });
  },

  /**
   * Cambia la contraseña del usuario autenticado
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; message?: string }> {
    return apiClient.post('/auth/change-password', data);
  },
};