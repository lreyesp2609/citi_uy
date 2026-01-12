-- Migración 003: Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    id_rol INT NOT NULL,
    id_persona INT NOT NULL,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasenia VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol) ON DELETE CASCADE,
    FOREIGN KEY (id_persona) REFERENCES personas(id_persona) ON DELETE CASCADE
);

-- Insertar usuarios iniciales
INSERT INTO usuarios (id_rol, id_persona, usuario, contrasenia, activo)
SELECT 
    r.id_rol,
    p.id_persona,
    'ktrianaa2',
    'pbkdf2_sha256$720000$nA1DBiCSy5A4HPTMAfMGDx$MmlhOsKKop+XKgi48HY1WYVShwtU6vD1/nsc8bnk2Zo=',
    true
FROM 
    rol r,
    personas p
WHERE 
    r.rol = 'Pastor' 
    AND p.numero_cedula = '1208759348'
ON CONFLICT (usuario) DO NOTHING;

INSERT INTO usuarios (id_rol, id_persona, usuario, contrasenia, activo)
SELECT 
    r.id_rol,
    p.id_persona,
    'lreyesp',
    '$2b$12$rM4Yaeqe7.6NhRiFQxom3u3rcX2ID6/FADXuTMFvkh.b66exJHfAa',
    true
FROM 
    rol r,
    personas p
WHERE 
    r.rol = 'Pastor' 
    AND p.correo_electronico = 'lreyesp@uteq.edu.ec'
ON CONFLICT (usuario) DO NOTHING;