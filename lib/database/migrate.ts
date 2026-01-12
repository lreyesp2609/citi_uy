/**
 * Script de migraciones de base de datos
 * Ejecuta las migraciones SQL en orden para crear/actualizar el schema
 */

import dotenv from 'dotenv';
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePassword = process.env.SUPABASE_DB_PASSWORD;
const connectionString = process.env.SUPABASE_DB_CONNECTION_STRING;

if (!supabaseUrl) {
  console.error('❌ Falta NEXT_PUBLIC_SUPABASE_URL en .env.local');
  process.exit(1);
}

if (!connectionString && !supabasePassword) {
  console.error('❌ Necesitas agregar una de estas variables en .env.local:');
  console.error('   Opción 1: SUPABASE_DB_CONNECTION_STRING (recomendada)');
  console.error('   Opción 2: SUPABASE_DB_PASSWORD\n');
  console.error('📝 Obtén el connection string en:');
  console.error('   Supabase → Settings → Database → Connection String → URI\n');
  process.exit(1);
}

let client: Client;

if (connectionString) {
  // Usar connection string directamente (más confiable)
  console.log('🔌 Usando connection string...');
  client = new Client({
    connectionString: connectionString.replace('[YOUR-PASSWORD]', supabasePassword || ''),
    ssl: { rejectUnauthorized: false }
  });
} else {
  // Fallback: construir la conexión manualmente
  const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
  console.log('🔌 Construyendo conexión para proyecto:', projectRef);
  client = new Client({
    host: `aws-0-us-east-1.pooler.supabase.com`,
    port: 6543,
    database: 'postgres',
    user: `postgres.${projectRef}`,
    password: supabasePassword,
    ssl: { rejectUnauthorized: false }
  });
}

interface Migration {
  id: string;
  name: string;
  sql: string;
}

async function loadMigrations(): Promise<Migration[]> {
  const migrationsDir = path.join(process.cwd(), 'lib/database/migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.error(`❌ No existe la carpeta: ${migrationsDir}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  
  if (files.length === 0) {
    console.error('❌ No se encontraron archivos .sql en lib/database/migrations/');
    process.exit(1);
  }
  
  return files.map(file => ({
    id: file.replace('.sql', ''),
    name: file,
    sql: fs.readFileSync(path.join(migrationsDir, file), 'utf-8')
  }));
}

async function createMigrationsTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS _migrations (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  await client.query(createTableSQL);
}

async function getMigrationsExecuted(): Promise<string[]> {
  try {
    const result = await client.query('SELECT id FROM _migrations ORDER BY executed_at');
    return result.rows.map(row => row.id);
  } catch (error: any) {
    if (error.message.includes('does not exist')) {
      return [];
    }
    throw error;
  }
}

async function executeMigration(migration: Migration): Promise<boolean> {
  console.log(`\n🔄 Ejecutando migración: ${migration.name}`);
  
  try {
    // Ejecutar el SQL de la migración
    await client.query(migration.sql);
    
    // Registrar la migración como ejecutada
    await client.query(
      'INSERT INTO _migrations (id, name) VALUES ($1, $2)',
      [migration.id, migration.name]
    );
    
    console.log(`✅ Migración ${migration.name} ejecutada correctamente`);
    return true;
  } catch (error: any) {
    console.error(`❌ Error en migración ${migration.name}:`);
    console.error(error.message);
    return false;
  }
}

async function runMigrations() {
  console.log('🚀 Iniciando migraciones de base de datos...\n');
  
  try {
    // Conectar a la base de datos
    console.log('🔌 Conectando a Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado exitosamente\n');
    
    // Crear tabla de control de migraciones
    await createMigrationsTable();
    
    // Cargar todas las migraciones
    const migrations = await loadMigrations();
    console.log(`📁 Encontradas ${migrations.length} migraciones`);
    
    // Obtener migraciones ya ejecutadas
    const executed = await getMigrationsExecuted();
    console.log(`✓ ${executed.length} migraciones ya ejecutadas`);
    
    // Filtrar migraciones pendientes
    const pending = migrations.filter(m => !executed.includes(m.id));
    
    if (pending.length === 0) {
      console.log('\n✨ No hay migraciones pendientes. Base de datos actualizada.\n');
      await client.end();
      return;
    }
    
    console.log(`📝 Migraciones pendientes: ${pending.length}`);
    
    // Ejecutar migraciones pendientes
    let success = 0;
    let failed = 0;
    
    for (const migration of pending) {
      const result = await executeMigration(migration);
      if (result) {
        success++;
      } else {
        failed++;
        console.error(`\n⚠️  Deteniendo proceso por error en ${migration.name}`);
        break;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Exitosas: ${success}`);
    console.log(`❌ Fallidas: ${failed}`);
    console.log('='.repeat(50) + '\n');
    
    if (failed === 0) {
      console.log('🎉 ¡Todas las migraciones se ejecutaron correctamente!\n');
    }
    
    // Cerrar conexión
    await client.end();
    
  } catch (error: any) {
    console.error('\n❌ Error fatal:', error.message);
    await client.end();
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export { runMigrations };