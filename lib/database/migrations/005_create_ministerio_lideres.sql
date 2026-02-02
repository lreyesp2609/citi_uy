-- Migración 005: Crear tabla de líderes de ministerios
CREATE TABLE IF NOT EXISTS ministerio_lideres (
    id_ministerio_lider SERIAL PRIMARY KEY,
    id_ministerio INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ministerio) REFERENCES ministerios(id_ministerio) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    UNIQUE(id_ministerio, id_usuario)
);

-- Índice para búsquedas rápidas
CREATE INDEX idx_ministerio_lideres_ministerio ON ministerio_lideres(id_ministerio);
CREATE INDEX idx_ministerio_lideres_usuario ON ministerio_lideres(id_usuario);

-- Constraint: Máximo 2 líderes por ministerio
CREATE OR REPLACE FUNCTION check_max_lideres()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM ministerio_lideres WHERE id_ministerio = NEW.id_ministerio) >= 2 THEN
        RAISE EXCEPTION 'Un ministerio no puede tener más de 2 líderes';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_check_max_lideres
    BEFORE INSERT ON ministerio_lideres
    FOR EACH ROW
    EXECUTE PROCEDURE check_max_lideres();