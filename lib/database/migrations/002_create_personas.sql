-- Migración 002: Crear tabla de personas
CREATE TABLE IF NOT EXISTS personas (
    id_persona SERIAL PRIMARY KEY,
    numero_cedula VARCHAR(20) NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NULL,
    genero VARCHAR(20) NULL,
    celular VARCHAR(20) NULL,
    direccion VARCHAR(255) NULL,
    correo_electronico VARCHAR(100) NULL UNIQUE,  -- ⭐ AGREGADO UNIQUE
    nivel_estudio VARCHAR(50) NULL,
    numero_telefono VARCHAR(15) NULL,
    nacionalidad VARCHAR(30) NULL,
    profesion VARCHAR(50) NULL,
    estado_civil VARCHAR(20) NULL,
    lugar_trabajo VARCHAR(50) NULL
);

-- Insertar personas iniciales
INSERT INTO personas (
    numero_cedula, 
    nombres, 
    apellidos, 
    fecha_nacimiento, 
    genero, 
    celular, 
    direccion, 
    correo_electronico
)
VALUES (
    '1208759348', 
    'Kerly Mikaela', 
    'Triana Arrieta', 
    '2002-04-23', 
    'Femenino', 
    '0981346049', 
    'Ecuador - Los Rios - Quevedo', 
    'ktrianaa2@uteq.edu.ec'
)
ON CONFLICT (numero_cedula) DO NOTHING;

INSERT INTO personas (
    nombres, 
    apellidos, 
    fecha_nacimiento, 
    genero, 
    celular, 
    correo_electronico,
    direccion
)
VALUES (
    'Luis Aaron', 
    'Reyes Palacios', 
    '2026-09-26', 
    'Masculino', 
    '0981465340', 
    'lreyesp@uteq.edu.ec',
    'Ecuador - Los Rios - Quevedo'
)
ON CONFLICT (correo_electronico) DO NOTHING;