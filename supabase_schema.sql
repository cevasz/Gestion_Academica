-- ============================================
-- ESQUEMA DE BASE DE DATOS - MATRÍCULA DIGITAL
-- Sistema de Digitalización Institucional
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: instituciones
-- ============================================
CREATE TABLE instituciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    nit VARCHAR(20) UNIQUE NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(255),
    logo_url TEXT,
    plan VARCHAR(20) NOT NULL DEFAULT 'esencial' CHECK (plan IN ('esencial', 'smart', 'campus_ia', 'enterprise')),
    fecha_suscripcion DATE DEFAULT CURRENT_DATE,
    estado VARCHAR(20) DEFAULT 'activa' CHECK (estado IN ('activa', 'suspendida', 'cancelada')),
    configuracion JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para instituciones
CREATE INDEX idx_instituciones_nit ON instituciones(nit);
CREATE INDEX idx_instituciones_plan ON instituciones(plan);
CREATE INDEX idx_instituciones_estado ON instituciones(estado);

-- Trigger para actualizar updated_at en instituciones
CREATE TRIGGER update_instituciones_updated_at
    BEFORE UPDATE ON instituciones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS para instituciones
ALTER TABLE instituciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura de instituciones" ON instituciones
    FOR SELECT USING (true);

CREATE POLICY "Permitir actualización de instituciones" ON instituciones
    FOR UPDATE USING (true);

-- ============================================
-- TABLA: estudiantes
-- ============================================
CREATE TABLE estudiantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institucion_id UUID NOT NULL REFERENCES instituciones(id) ON DELETE CASCADE,
    nombre_completo VARCHAR(255) NOT NULL,
    tipo_documento VARCHAR(10) NOT NULL CHECK (tipo_documento IN ('TI', 'RC', 'CE')),
    numero_documento VARCHAR(20) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    grado VARCHAR(50) NOT NULL,
    grupo VARCHAR(10),
    director_grupo VARCHAR(255),
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'retirado')),
    observaciones TEXT,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(institucion_id, numero_documento)
);

-- Índices para estudiantes
CREATE INDEX idx_estudiantes_institucion ON estudiantes(institucion_id);
CREATE INDEX idx_estudiantes_documento ON estudiantes(numero_documento);
CREATE INDEX idx_estudiantes_estado ON estudiantes(estado);
CREATE INDEX idx_estudiantes_grado ON estudiantes(grado);

ALTER TABLE estudiantes
    ADD CONSTRAINT chk_estudiantes_documento_formato
    CHECK (numero_documento ~ '^[0-9]{7,11}$');

-- ============================================
-- TABLA: acudientes
-- ============================================
CREATE TABLE acudientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_completo VARCHAR(255) NOT NULL,
    numero_documento VARCHAR(20) NOT NULL,
    parentesco VARCHAR(50) NOT NULL,
    telefono VARCHAR(15) NOT NULL,
    correo_electronico VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para acudientes
CREATE UNIQUE INDEX idx_acudientes_documento ON acudientes(numero_documento);
CREATE INDEX idx_acudientes_correo ON acudientes(correo_electronico);

ALTER TABLE acudientes
    ADD CONSTRAINT chk_acudientes_documento_formato
    CHECK (numero_documento ~ '^[0-9]{7,11}$'),
    ADD CONSTRAINT chk_acudientes_telefono_colombia
    CHECK (telefono ~ '^3[0-9]{9}$'),
    ADD CONSTRAINT chk_acudientes_correo_formato
    CHECK (correo_electronico ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$');

-- ============================================
-- TABLA: matriculas
-- ============================================
CREATE TABLE matriculas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_matricula VARCHAR(20) NOT NULL UNIQUE,
    estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    acudiente_id UUID NOT NULL REFERENCES acudientes(id) ON DELETE CASCADE,
    tipo_operacion VARCHAR(20) NOT NULL CHECK (tipo_operacion IN ('inscripcion', 'renovacion', 'actualizacion')),
    numero_matricula_anterior VARCHAR(20),
    ano_lectivo INTEGER NOT NULL,
    estado VARCHAR(20) DEFAULT 'activa' CHECK (estado IN ('activa', 'cancelada', 'graduado')),
    fecha_matricula TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para matriculas
CREATE INDEX idx_matriculas_numero ON matriculas(numero_matricula);
CREATE INDEX idx_matriculas_estudiante ON matriculas(estudiante_id);
CREATE INDEX idx_matriculas_acudiente ON matriculas(acudiente_id);
CREATE INDEX idx_matriculas_ano ON matriculas(ano_lectivo);
CREATE INDEX idx_matriculas_estado ON matriculas(estado);

ALTER TABLE matriculas
    ADD CONSTRAINT chk_matriculas_numero_formato
    CHECK (numero_matricula ~ '^[0-9]{4}-[0-9]{4}$'),
    ADD CONSTRAINT chk_matriculas_ano_lectivo
    CHECK (ano_lectivo BETWEEN 2020 AND 2100);

-- ============================================
-- TABLA: historial_matriculas
-- ============================================
CREATE TABLE historial_matriculas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matricula_id UUID NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
    accion VARCHAR(50) NOT NULL,
    descripcion TEXT,
    usuario VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para historial
CREATE INDEX idx_historial_matricula ON historial_matriculas(matricula_id);

-- ============================================
-- FUNCIÓN: Actualizar timestamp automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_estudiantes_updated_at
    BEFORE UPDATE ON estudiantes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_acudientes_updated_at
    BEFORE UPDATE ON acudientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matriculas_updated_at
    BEFORE UPDATE ON matriculas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCIÓN: Registrar cambios en historial
-- ============================================
CREATE OR REPLACE FUNCTION registrar_historial_matricula()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO historial_matriculas (matricula_id, accion, descripcion)
        VALUES (NEW.id, 'Creación', 'Matrícula creada: ' || NEW.tipo_operacion);
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO historial_matriculas (matricula_id, accion, descripcion)
        VALUES (NEW.id, 'Actualización', 'Estado cambiado a: ' || NEW.estado);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Trigger para historial de matrículas
CREATE TRIGGER trigger_historial_matricula
    AFTER INSERT OR UPDATE ON matriculas
    FOR EACH ROW
    EXECUTE FUNCTION registrar_historial_matricula();

-- ============================================
-- SEGURIDAD Y CONTROL DE ACCESO
-- ============================================

-- La llave anon solo puede ejecutar la función pública de radicación.
-- La lectura y gestión de datos personales queda restringida a usuarios
-- autenticados con rol institucional en app_metadata.rol.
REVOKE ALL ON TABLE estudiantes FROM anon, authenticated;
REVOKE ALL ON TABLE acudientes FROM anon, authenticated;
REVOKE ALL ON TABLE matriculas FROM anon, authenticated;
REVOKE ALL ON TABLE historial_matriculas FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE estudiantes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE acudientes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE matriculas TO authenticated;
GRANT SELECT ON TABLE historial_matriculas TO authenticated;

-- Habilitar RLS en todas las tablas
ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE acudientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_matriculas ENABLE ROW LEVEL SECURITY;

-- Helper RBAC. Configurar el rol del usuario en Authentication > Users:
-- app_metadata = {"rol": "admin"} o {"rol": "secretaria"}.
CREATE OR REPLACE FUNCTION es_rol_institucional(roles_permitidos TEXT[])
RETURNS BOOLEAN AS $$
  SELECT
    auth.role() = 'authenticated'
    AND COALESCE(auth.jwt() -> 'app_metadata' ->> 'rol', '') = ANY (roles_permitidos);
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- Políticas para estudiantes
CREATE POLICY "estudiantes_select_equipo_institucional" ON estudiantes
    FOR SELECT USING (es_rol_institucional(ARRAY['admin', 'directivo', 'secretaria', 'docente']));

CREATE POLICY "estudiantes_insert_administracion" ON estudiantes
    FOR INSERT WITH CHECK (es_rol_institucional(ARRAY['admin', 'secretaria']));

CREATE POLICY "estudiantes_update_administracion" ON estudiantes
    FOR UPDATE
    USING (es_rol_institucional(ARRAY['admin', 'secretaria']))
    WITH CHECK (es_rol_institucional(ARRAY['admin', 'secretaria']));

-- Políticas para acudientes
CREATE POLICY "acudientes_select_equipo_institucional" ON acudientes
    FOR SELECT USING (es_rol_institucional(ARRAY['admin', 'directivo', 'secretaria']));

CREATE POLICY "acudientes_insert_administracion" ON acudientes
    FOR INSERT WITH CHECK (es_rol_institucional(ARRAY['admin', 'secretaria']));

CREATE POLICY "acudientes_update_administracion" ON acudientes
    FOR UPDATE
    USING (es_rol_institucional(ARRAY['admin', 'secretaria']))
    WITH CHECK (es_rol_institucional(ARRAY['admin', 'secretaria']));

-- Políticas para matrículas
CREATE POLICY "matriculas_select_equipo_institucional" ON matriculas
    FOR SELECT USING (es_rol_institucional(ARRAY['admin', 'directivo', 'secretaria', 'docente']));

CREATE POLICY "matriculas_insert_administracion" ON matriculas
    FOR INSERT WITH CHECK (es_rol_institucional(ARRAY['admin', 'secretaria']));

CREATE POLICY "matriculas_update_administracion" ON matriculas
    FOR UPDATE
    USING (es_rol_institucional(ARRAY['admin', 'secretaria']))
    WITH CHECK (es_rol_institucional(ARRAY['admin', 'secretaria']));

-- Políticas para historial
CREATE POLICY "historial_select_equipo_institucional" ON historial_matriculas
    FOR SELECT USING (es_rol_institucional(ARRAY['admin', 'directivo', 'secretaria']));

-- No se crean políticas DELETE. La eliminación directa de datos personales
-- queda bloqueada por defecto y debe manejarse con flujos auditados.

-- ============================================
-- RPC PÚBLICA PARA RADICAR MATRÍCULAS
-- ============================================

CREATE OR REPLACE FUNCTION crear_matricula_publica(
    p_tipo_operacion TEXT,
    p_nombre_estudiante TEXT,
    p_tipo_documento TEXT,
    p_numero_documento TEXT,
    p_fecha_nacimiento DATE,
    p_grado TEXT,
    p_nombre_acudiente TEXT,
    p_documento_acudiente TEXT,
    p_parentesco TEXT,
    p_telefono_acudiente TEXT,
    p_correo_acudiente TEXT,
    p_numero_matricula_anterior TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    numero_matricula TEXT,
    error TEXT
) AS $$
DECLARE
    v_estudiante_id UUID;
    v_acudiente_id UUID;
    v_numero_matricula TEXT;
    v_intentos INTEGER;
BEGIN
    IF p_tipo_operacion NOT IN ('inscripcion', 'renovacion', 'actualizacion') THEN
        RETURN QUERY SELECT false, NULL::TEXT, 'Tipo de operación inválido';
        RETURN;
    END IF;

    IF p_tipo_documento NOT IN ('TI', 'RC', 'CE') THEN
        RETURN QUERY SELECT false, NULL::TEXT, 'Tipo de documento inválido';
        RETURN;
    END IF;

    IF LENGTH(TRIM(COALESCE(p_nombre_estudiante, ''))) < 3 THEN
        RETURN QUERY SELECT false, NULL::TEXT, 'El nombre del estudiante es obligatorio';
        RETURN;
    END IF;

    IF COALESCE(p_numero_documento, '') !~ '^[0-9]{7,11}$' THEN
        RETURN QUERY SELECT false, NULL::TEXT, 'Número de documento del estudiante inválido';
        RETURN;
    END IF;

    IF p_fecha_nacimiento IS NULL
       OR p_fecha_nacimiento > CURRENT_DATE - INTERVAL '3 years'
       OR p_fecha_nacimiento < CURRENT_DATE - INTERVAL '20 years' THEN
        RETURN QUERY SELECT false, NULL::TEXT, 'La edad debe estar entre 3 y 20 años';
        RETURN;
    END IF;

    IF LENGTH(TRIM(COALESCE(p_grado, ''))) = 0 THEN
        RETURN QUERY SELECT false, NULL::TEXT, 'Debe seleccionar un grado';
        RETURN;
    END IF;

    IF LENGTH(TRIM(COALESCE(p_nombre_acudiente, ''))) < 3 THEN
        RETURN QUERY SELECT false, NULL::TEXT, 'El nombre del acudiente es obligatorio';
        RETURN;
    END IF;

    IF COALESCE(p_documento_acudiente, '') !~ '^[0-9]{7,11}$' THEN
        RETURN QUERY SELECT false, NULL::TEXT, 'Documento del acudiente inválido';
        RETURN;
    END IF;

    IF LENGTH(TRIM(COALESCE(p_parentesco, ''))) = 0 THEN
        RETURN QUERY SELECT false, NULL::TEXT, 'Debe seleccionar el parentesco';
        RETURN;
    END IF;

    IF COALESCE(p_telefono_acudiente, '') !~ '^3[0-9]{9}$' THEN
        RETURN QUERY SELECT false, NULL::TEXT, 'Celular del acudiente inválido';
        RETURN;
    END IF;

    IF COALESCE(p_correo_acudiente, '') !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
        RETURN QUERY SELECT false, NULL::TEXT, 'Correo electrónico inválido';
        RETURN;
    END IF;

    IF p_tipo_operacion = 'renovacion'
       AND LENGTH(TRIM(COALESCE(p_numero_matricula_anterior, ''))) = 0 THEN
        RETURN QUERY SELECT false, NULL::TEXT, 'El número de matrícula anterior es obligatorio';
        RETURN;
    END IF;

    INSERT INTO estudiantes (
        nombre_completo,
        tipo_documento,
        numero_documento,
        fecha_nacimiento,
        grado,
        estado
    )
    VALUES (
        TRIM(p_nombre_estudiante),
        p_tipo_documento,
        p_numero_documento,
        p_fecha_nacimiento,
        p_grado,
        'activo'
    )
    ON CONFLICT (numero_documento)
    DO UPDATE SET
        nombre_completo = EXCLUDED.nombre_completo,
        tipo_documento = EXCLUDED.tipo_documento,
        fecha_nacimiento = EXCLUDED.fecha_nacimiento,
        grado = EXCLUDED.grado,
        estado = 'activo'
    RETURNING id INTO v_estudiante_id;

    INSERT INTO acudientes (
        nombre_completo,
        numero_documento,
        parentesco,
        telefono,
        correo_electronico
    )
    VALUES (
        TRIM(p_nombre_acudiente),
        p_documento_acudiente,
        p_parentesco,
        p_telefono_acudiente,
        LOWER(TRIM(p_correo_acudiente))
    )
    ON CONFLICT (numero_documento)
    DO UPDATE SET
        nombre_completo = EXCLUDED.nombre_completo,
        parentesco = EXCLUDED.parentesco,
        telefono = EXCLUDED.telefono,
        correo_electronico = EXCLUDED.correo_electronico
    RETURNING id INTO v_acudiente_id;

    FOR v_intentos IN 1..10 LOOP
        v_numero_matricula := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' ||
            LPAD(FLOOR(RANDOM() * 10000)::INTEGER::TEXT, 4, '0');

        BEGIN
            INSERT INTO matriculas (
                numero_matricula,
                estudiante_id,
                acudiente_id,
                tipo_operacion,
                numero_matricula_anterior,
                ano_lectivo,
                estado
            )
            VALUES (
                v_numero_matricula,
                v_estudiante_id,
                v_acudiente_id,
                p_tipo_operacion,
                NULLIF(TRIM(COALESCE(p_numero_matricula_anterior, '')), ''),
                EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
                'activa'
            );

            RETURN QUERY SELECT true, v_numero_matricula, NULL::TEXT;
            RETURN;
        EXCEPTION WHEN unique_violation THEN
            -- Reintentar si el número generado ya existe.
        END;
    END LOOP;

    RETURN QUERY SELECT false, NULL::TEXT, 'No se pudo generar un número de matrícula único';
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT false, NULL::TEXT, 'No fue posible registrar la matrícula. Intente nuevamente.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION crear_matricula_publica(
    TEXT, TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION crear_matricula_publica(
    TEXT, TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO anon, authenticated;

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Matrículas completas con información relacionada
CREATE OR REPLACE VIEW vista_matriculas_completas
WITH (security_invoker = true) AS
SELECT
    m.id,
    m.numero_matricula,
    m.tipo_operacion,
    m.ano_lectivo,
    m.estado AS estado_matricula,
    m.fecha_matricula,
    e.nombre_completo AS nombre_estudiante,
    e.tipo_documento AS tipo_doc_estudiante,
    e.numero_documento AS doc_estudiante,
    e.fecha_nacimiento,
    e.grado,
    e.estado AS estado_estudiante,
    a.nombre_completo AS nombre_acudiente,
    a.numero_documento AS doc_acudiente,
    a.parentesco,
    a.telefono AS telefono_acudiente,
    a.correo_electronico AS correo_acudiente
FROM matriculas m
JOIN estudiantes e ON m.estudiante_id = e.id
JOIN acudientes a ON m.acudiente_id = a.id;

-- Vista: Estadísticas de matrículas por año
CREATE OR REPLACE VIEW vista_estadisticas_matriculas
WITH (security_invoker = true) AS
SELECT
    ano_lectivo,
    COUNT(*) AS total_matriculas,
    COUNT(CASE WHEN tipo_operacion = 'inscripcion' THEN 1 END) AS inscripciones,
    COUNT(CASE WHEN tipo_operacion = 'renovacion' THEN 1 END) AS renovaciones,
    COUNT(CASE WHEN tipo_operacion = 'actualizacion' THEN 1 END) AS actualizaciones,
    COUNT(CASE WHEN estado = 'activa' THEN 1 END) AS activas,
    COUNT(CASE WHEN estado = 'cancelada' THEN 1 END) AS canceladas
FROM matriculas
GROUP BY ano_lectivo
ORDER BY ano_lectivo DESC;

REVOKE ALL ON TABLE vista_matriculas_completas FROM anon, authenticated;
REVOKE ALL ON TABLE vista_estadisticas_matriculas FROM anon, authenticated;
GRANT SELECT ON TABLE vista_matriculas_completas TO authenticated;
GRANT SELECT ON TABLE vista_estadisticas_matriculas TO authenticated;

-- ============================================
-- DATOS DE PRUEBA (OPCIONAL)
-- ============================================

-- Puedes descomentar esto para insertar datos de prueba
/*
-- Insertar estudiante de prueba
INSERT INTO estudiantes (nombre_completo, tipo_documento, numero_documento, fecha_nacimiento, grado)
VALUES ('Juan Pérez García', 'TI', '1234567890', '2010-05-15', '8°');

-- Insertar acudiente de prueba
INSERT INTO acudientes (nombre_completo, numero_documento, parentesco, telefono, correo_electronico)
VALUES ('María García López', '9876543210', 'Madre', '3001234567', 'maria.garcia@email.com');

-- Insertar matrícula de prueba
INSERT INTO matriculas (
    numero_matricula,
    estudiante_id,
    acudiente_id,
    tipo_operacion,
    ano_lectivo
)
VALUES (
    '2026-0001',
    (SELECT id FROM estudiantes WHERE numero_documento = '1234567890'),
    (SELECT id FROM acudientes WHERE numero_documento = '9876543210'),
    'inscripcion',
    2026
);
*/

-- ============================================
-- TABLA: calificaciones
-- ============================================
CREATE TABLE calificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    materia VARCHAR(100) NOT NULL,
    periodo VARCHAR(20) NOT NULL CHECK (periodo IN ('1', '2', '3', '4', 'final')),
    ano_lectivo INTEGER NOT NULL,
    nota DECIMAL(3,2) CHECK (nota >= 0 AND nota <= 5),
    tipo VARCHAR(20) DEFAULT 'regular' CHECK (tipo IN ('regular', 'recuperacion', 'nivelacion')),
    observaciones TEXT,
    docente VARCHAR(255),
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(estudiante_id, materia, periodo, ano_lectivo, tipo)
);

-- Índices para calificaciones
CREATE INDEX idx_calificaciones_estudiante ON calificaciones(estudiante_id);
CREATE INDEX idx_calificaciones_materia ON calificaciones(materia);
CREATE INDEX idx_calificaciones_periodo ON calificaciones(periodo);
CREATE INDEX idx_calificaciones_ano ON calificaciones(ano_lectivo);

-- Trigger para actualizar updated_at en calificaciones
CREATE TRIGGER update_calificaciones_updated_at
    BEFORE UPDATE ON calificaciones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS para calificaciones
ALTER TABLE calificaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura de calificaciones" ON calificaciones
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserción de calificaciones" ON calificaciones
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualización de calificaciones" ON calificaciones
    FOR UPDATE USING (true);

-- ============================================
-- VISTA: calificaciones_completas
-- ============================================
CREATE OR REPLACE VIEW vista_calificaciones_completas AS
SELECT
    c.id,
    c.materia,
    c.periodo,
    c.ano_lectivo,
    c.nota,
    c.tipo,
    c.observaciones,
    c.docente,
    c.fecha_registro,
    e.id AS estudiante_id,
    e.nombre_completo AS nombre_estudiante,
    e.numero_documento,
    e.grado,
    e.grupo
FROM calificaciones c
JOIN estudiantes e ON c.estudiante_id = e.id
ORDER BY e.nombre_completo, c.materia, c.periodo;

-- ============================================
-- FUNCIÓN: Calcular promedio de estudiante
-- ============================================
CREATE OR REPLACE FUNCTION calcular_promedio_estudiante(
    p_estudiante_id UUID,
    p_materia VARCHAR,
    p_ano_lectivo INTEGER
) RETURNS DECIMAL(3,2) AS $$
DECLARE
    promedio DECIMAL(3,2);
BEGIN
    SELECT AVG(nota) INTO promedio
    FROM calificaciones
    WHERE estudiante_id = p_estudiante_id
    AND materia = p_materia
    AND ano_lectivo = p_ano_lectivo
    AND tipo = 'regular'
    AND nota IS NOT NULL;

    RETURN COALESCE(promedio, 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TABLA: documentos
-- ============================================
CREATE TABLE documentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    tipo_documento VARCHAR(50) NOT NULL CHECK (tipo_documento IN ('admision', 'paz_y_salvo', 'carnet', 'certificado', 'boletin', 'otro')),
    nombre_archivo VARCHAR(255) NOT NULL,
    url_archivo TEXT NOT NULL,
    tamanio_bytes BIGINT,
    mime_type VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
    observaciones TEXT,
    fecha_carga TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_revision TIMESTAMP WITH TIME ZONE,
    revisado_por VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para documentos
CREATE INDEX idx_documentos_estudiante ON documentos(estudiante_id);
CREATE INDEX idx_documentos_tipo ON documentos(tipo_documento);
CREATE INDEX idx_documentos_estado ON documentos(estado);
CREATE INDEX idx_documentos_fecha ON documentos(fecha_carga);

-- Trigger para actualizar updated_at en documentos
CREATE TRIGGER update_documentos_updated_at
    BEFORE UPDATE ON documentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS para documentos
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura de documentos" ON documentos
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserción de documentos" ON documentos
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualización de documentos" ON documentos
    FOR UPDATE USING (true);

CREATE POLICY "Permitir eliminación de documentos" ON documentos
    FOR DELETE USING (true);

-- ============================================
-- VISTA: documentos_completos
-- ============================================
CREATE OR REPLACE VIEW vista_documentos_completos AS
SELECT
    d.id,
    d.tipo_documento,
    d.nombre_archivo,
    d.url_archivo,
    d.tamanio_bytes,
    d.mime_type,
    d.estado,
    d.observaciones,
    d.fecha_carga,
    d.fecha_revision,
    d.revisado_por,
    e.id AS estudiante_id,
    e.nombre_completo AS nombre_estudiante,
    e.numero_documento AS documento_estudiante,
    e.grado,
    m.numero_matricula
FROM documentos d
JOIN estudiantes e ON d.estudiante_id = e.id
LEFT JOIN matriculas m ON e.id = m.estudiante_id AND m.estado = 'activa'
ORDER BY d.fecha_carga DESC;

-- ============================================
-- VISTA: estadisticas_documentos
-- ============================================
CREATE OR REPLACE VIEW vista_estadisticas_documentos AS
SELECT
    tipo_documento,
    COUNT(*) AS total_documentos,
    COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) AS pendientes,
    COUNT(CASE WHEN estado = 'aprobado' THEN 1 END) AS aprobados,
    COUNT(CASE WHEN estado = 'rechazado' THEN 1 END) AS rechazados,
    ROUND(AVG(tamanio_bytes)::numeric, 2) AS tamanio_promedio_bytes
FROM documentos
GROUP BY tipo_documento;

-- ============================================
-- COMENTARIOS EN TABLAS
-- ============================================

COMMENT ON TABLE estudiantes IS 'Información básica de los estudiantes matriculados';
COMMENT ON TABLE acudientes IS 'Información de contacto de acudientes responsables';
COMMENT ON TABLE matriculas IS 'Registro de matrículas por año lectivo';
COMMENT ON TABLE historial_matriculas IS 'Auditoría de cambios en matrículas';
COMMENT ON TABLE documentos IS 'Gestión de documentos institucionales de estudiantes';

COMMENT ON COLUMN estudiantes.estado IS 'Estado del estudiante: activo, inactivo, retirado';
COMMENT ON COLUMN matriculas.tipo_operacion IS 'Tipo de proceso: inscripcion, renovacion, actualizacion';
COMMENT ON COLUMN matriculas.estado IS 'Estado de la matrícula: activa, cancelada, graduado';
COMMENT ON COLUMN documentos.tipo_documento IS 'Tipo de documento: admision, paz_y_salvo, carnet, certificado, boletin, otro';
COMMENT ON COLUMN documentos.estado IS 'Estado de revisión: pendiente, aprobado, rechazado';
