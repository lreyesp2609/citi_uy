-- Migración 004: Crear tabla de ministerios
CREATE TABLE IF NOT EXISTS ministerios (
    id_ministerio SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    logo_url VARCHAR(255) NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    id_usuario_creador INT NOT NULL DEFAULT 1,  -- 👈 NUEVO: Campo para registrar quién creó el ministerio
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Foreign key al usuario que creó el ministerio
    FOREIGN KEY (id_usuario_creador) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);

-- Índice para búsquedas rápidas por usuario creador
CREATE INDEX IF NOT EXISTS idx_ministerios_usuario_creador ON ministerios(id_usuario_creador);

-- Trigger para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ministerios_updated_at BEFORE UPDATE
    ON ministerios FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Comentario descriptivo
COMMENT ON COLUMN ministerios.id_usuario_creador IS 'ID del usuario (pastor) que creó el ministerio';