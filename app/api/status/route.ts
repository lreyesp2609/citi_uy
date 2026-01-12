import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

// Función para escanear recursivamente las rutas de la API
function scanApiRoutes(dir: string, baseUrl: string = ''): any[] {
  const routes: any[] = [];
  
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      const relativePath = path.join(baseUrl, item.name);
      
      if (item.isDirectory()) {
        // Si es directorio, escanear recursivamente
        if (item.name.startsWith('(') || item.name.startsWith('_')) {
          // Ignorar rutas especiales de Next.js
          continue;
        }
        routes.push(...scanApiRoutes(fullPath, relativePath));
      } else if (item.isFile() && item.name === 'route.ts') {
        // Si es un archivo route.ts, leer su contenido
        const content = fs.readFileSync(fullPath, 'utf-8');
        const endpoint = baseUrl.replace(/\\/g, '/') || '/';
        
        // Detectar métodos HTTP exportados
        const methods: string[] = [];
        if (content.includes('export async function GET')) methods.push('GET');
        if (content.includes('export async function POST')) methods.push('POST');
        if (content.includes('export async function PUT')) methods.push('PUT');
        if (content.includes('export async function DELETE')) methods.push('DELETE');
        if (content.includes('export async function PATCH')) methods.push('PATCH');
        
        // Detectar si requiere autenticación
        const requiresAuth = content.includes('auth-token') || content.includes('verifyToken');
        
        // Extraer comentarios de descripción (si existen)
        const descriptionMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\n/);
        const description = descriptionMatch ? descriptionMatch[1] : 'Sin descripción';
        
        methods.forEach(method => {
          routes.push({
            path: `/api${endpoint}`,
            method,
            description,
            auth: requiresAuth,
            file: fullPath.replace(process.cwd(), '')
          });
        });
      }
    }
  } catch (error) {
    console.error('Error escaneando rutas:', error);
  }
  
  return routes;
}

export async function GET() {
  try {
    // Verificar conexión con Supabase
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      return NextResponse.json({
        status: 'error',
        message: 'Error al conectar con Supabase',
        error: authError.message,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Escanear todas las rutas de API
    const apiDir = path.join(process.cwd(), 'app', 'api');
    const routes = scanApiRoutes(apiDir);

    // Agrupar por path
    const groupedRoutes = routes.reduce((acc: any, route) => {
      const existing = acc.find((r: any) => r.path === route.path);
      if (existing) {
        existing.methods.push(route.method);
      } else {
        acc.push({
          path: route.path,
          methods: [route.method],
          description: route.description,
          auth: route.auth,
          file: route.file
        });
      }
      return acc;
    }, []);

    // Ordenar por path
    groupedRoutes.sort((a: any, b: any) => a.path.localeCompare(b.path));

    return NextResponse.json({
      status: 'ok',
      message: 'Sistema CENTI CITI - API REST',
      supabase: {
        connected: true,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        auth: 'Disponible',
        database: 'Conectado'
      },
      apis: {
        total: groupedRoutes.length,
        endpoints: groupedRoutes
      },
      usage: {
        auth_token: 'Incluir cookie "auth-token" o header "Authorization: Bearer <token>"',
        base_url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      },
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Error de servidor',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}