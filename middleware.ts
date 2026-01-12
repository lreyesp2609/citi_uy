import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas (no requieren autenticación)
const publicRoutes = ['/', '/register', '/forgot-password'];

// Rutas protegidas (requieren autenticación)
const protectedRoutes = ['/dashboard', '/profile', '/users', '/settings', '/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Obtener token de las cookies
  const token = request.cookies.get('auth-token')?.value;
  
  // Si está en una ruta protegida y NO tiene token -> redirigir a login (/)
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('redirect', pathname); // Guardar la URL a la que quería ir
    return NextResponse.redirect(loginUrl);
  }
  
  // Si está en la raíz (/) y SÍ tiene token -> redirigir a dashboard
  if (pathname === '/' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};