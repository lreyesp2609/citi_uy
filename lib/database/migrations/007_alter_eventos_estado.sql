-- Migración 007: Agregar estado y motivo de rechazo a eventos
ALTER TABLE eventos 
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN IF NOT EXISTS motivo_rechazo TEXT;

-- Asegurar que el estado sea uno de los permitidos
ALTER TABLE eventos 
ADD CONSTRAINT check_estado_evento 
CHECK (estado IN ('PENDIENTE', 'EN_REVISION', 'APROBADO', 'RECHAZADO', 'CANCELADO'));

-- Índice para filtrar por estado
CREATE INDEX IF NOT EXISTS idx_eventos_estado ON eventos(estado);
