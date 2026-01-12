'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/lib/services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (usuario: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const result = await authService.checkSession();
      console.log('🔍 CheckAuth result:', result);
      
      if (result.success && result.user) {
        console.log('✅ Usuario autenticado:', result.user.usuario, '- Rol:', result.user.rol);
        setUser(result.user);
      } else {
        console.log('❌ No hay sesión activa o token inválido');
        setUser(null);
        // Si estamos en una ruta protegida y no hay sesión, limpiar cookie
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          // La cookie será eliminada por el servidor, pero aseguramos limpieza local
          document.cookie = 'auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
      }
    } catch (error) {
      console.error('💥 Error verificando sesión:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const result = await authService.checkSession();
      if (result.success && result.user) {
        setUser(result.user);
      }
    } catch (error) {
      console.error('Error refrescando usuario:', error);
    }
  };

  const login = async (usuario: string, password: string) => {
    try {
      const result = await authService.login({ usuario, password });
      console.log('🔐 Login result:', result);
      
      if (result.success && result.user) {
        console.log('✅ Login exitoso - Usuario:', result.user.usuario, '- Rol:', result.user.rol);
        
        // Setear el usuario inmediatamente con los datos del login
        setUser(result.user);
        
        // Pequeña espera para asegurar que la cookie se guarde
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return { success: true };
      }
      
      console.log('❌ Login fallido:', result.message);
      return { success: false, message: result.message };
    } catch (error: any) {
      console.error('💥 Error en login:', error);
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Cerrando sesión...');
      await authService.logout();
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('💥 Error al cerrar sesión:', error);
      setUser(null);
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}