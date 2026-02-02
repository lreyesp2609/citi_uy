-- Migración 006: Crear tabla básica de eventos
CREATE TABLE IF NOT EXISTS eventos (
    id_evento SERIAL PRIMARY KEY,
    id_ministerio INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP,
    ubicacion VARCHAR(255),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ministerio) REFERENCES ministerios(id_ministerio) ON DELETE CASCADE
);

-- Índice para búsquedas rápidas
CREATE INDEX idx_eventos_ministerio ON eventos(id_ministerio);
CREATE INDEX idx_eventos_fecha ON eventos(fecha_inicio);

-- Función para verificar si un ministerio tiene eventos programados
CREATE OR REPLACE FUNCTION ministerio_tiene_eventos_programados(ministerio_id INT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM eventos 
        WHERE id_ministerio = ministerio_id 
        AND activo = TRUE 
        AND fecha_inicio > CURRENT_TIMESTAMP
    );
END;
$$ language 'plpgsql';