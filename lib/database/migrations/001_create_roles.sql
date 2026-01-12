-- Migración 001: Crear tabla de roles
CREATE TABLE IF NOT EXISTS rol (
    id_rol SERIAL PRIMARY KEY,
    rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

-- Insertar roles iniciales
INSERT INTO rol (rol, descripcion) VALUES 
    ('Pastor', 'Usuario con privilegios administrativos'),
    ('Lider', 'Usuario líder con permisos extendidos')
ON CONFLICT (rol) DO NOTHING;