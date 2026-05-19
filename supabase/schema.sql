-- ============================================================
-- SUPABASE / POSTGRESQL SCHEMA — AloTrans Carga
-- Ejecuta este script en el editor SQL de Supabase:
-- https://supabase.com/dashboard → SQL Editor → New Query
-- ============================================================

-- ─── 1. TABLA DE USUARIOS (autenticación propia) ─────────────────────
CREATE TABLE IF NOT EXISTS public.usuarios (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,  -- En producción: usa bcrypt
  nombre        VARCHAR(150) NOT NULL,
  rol           VARCHAR(20)  NOT NULL DEFAULT 'COORDINADOR'
                CHECK (rol IN ('ADMIN', 'COORDINADOR')),
  activo        BOOLEAN      NOT NULL DEFAULT true,
  es_demo       BOOLEAN      NOT NULL DEFAULT false,
  creado_en     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  ultimo_login  TIMESTAMPTZ
);

-- Datos demo
INSERT INTO public.usuarios (username, password_hash, nombre, rol, es_demo)
VALUES
  ('admin', 'admin123', 'Admin Alo Trans', 'ADMIN', true),
  ('coord', 'coord123', 'Coordinador UMA', 'COORDINADOR', true)
ON CONFLICT (username) DO NOTHING;

-- ─── 2. TABLA PRINCIPAL DE SERVICIOS (64 columnas) ────────────────────
CREATE TABLE IF NOT EXISTS public.servicios (
  -- Clave primaria
  id                           VARCHAR(40)    PRIMARY KEY,

  -- ── Identificación
  viaje_interno                VARCHAR(50),
  coordina                     VARCHAR(50),
  dig                          NUMERIC,
  doc                          NUMERIC,
  tm                           NUMERIC,
  fac                          VARCHAR(160),

  -- ── Estado
  estado                       VARCHAR(20)    CHECK (estado IN ('EN CURSO','FACTURADO','TERMINADO','CUMPLIDO','CANCELADO')),
  contrato                     VARCHAR(150),
  expediente                   VARCHAR(120),
  destino_final                VARCHAR(140),
  orden_compra                 VARCHAR(140),

  -- ── Manifiesto
  manifiesto                   VARCHAR(50),
  estado_manifiesto            VARCHAR(20)    CHECK (estado_manifiesto IN ('PENDIENTE','CUMPLIDO','EN TRANSITO','ANULADO') OR estado_manifiesto IS NULL),
  remesa                       VARCHAR(50),
  radicado_remesa              VARCHAR(60),
  observaciones_manifiestos    TEXT,

  -- ── Fechas
  fecha_solicitud              TIMESTAMPTZ,
  fecha_inicio_servicio        TIMESTAMPTZ,
  fecha_finalizacion_servicio  TIMESTAMPTZ,

  -- ── Vehículo
  categoria                    VARCHAR(10)    CHECK (categoria IN ('2W','3W','4W') OR categoria IS NULL),
  vehiculo                     VARCHAR(160),
  chasis                       VARCHAR(140),
  placa_recurso                VARCHAR(20),

  -- ── Origen
  departamento_origen          VARCHAR(100),
  ciudad_origen                VARCHAR(100),
  direccion_origen             VARCHAR(255),
  cod_origen                   VARCHAR(20),

  -- ── Destino
  departamento_destino         VARCHAR(100),
  ciudad_destino               VARCHAR(100),
  direccion_destino            VARCHAR(255),
  cod_destino                  VARCHAR(20),
  nombre_destinatario          VARCHAR(200),
  contacto_destino             VARCHAR(130),

  -- ── Personal
  coordinado_con               VARCHAR(160),
  aprobado_por                 VARCHAR(140),
  proveedor                    VARCHAR(50)    CHECK (proveedor IN ('ALOTRANS_CARGA','TERCERO') OR proveedor IS NULL),
  nombre_tecnico               VARCHAR(200),
  cedula                       VARCHAR(30),

  -- ── Ruta / Logística
  ruta                         VARCHAR(120),
  tipo_ruta                    VARCHAR(140),
  kms_origen_destino           NUMERIC(10,2),
  expediente_ruta              VARCHAR(140),
  km_reales                    NUMERIC(10,2),
  num_vehiculos                INTEGER,
  tipo_mov                     VARCHAR(50),
  tipo_servicio                VARCHAR(150),
  ns                           VARCHAR(50),

  -- ── Valores (COP)
  valor_ruta                   NUMERIC(16,2)  DEFAULT 0,
  valor_remesa                 NUMERIC(16,2)  DEFAULT 0,
  valor_ok                     NUMERIC(16,2)  DEFAULT 0,
  neto_ok                      NUMERIC(16,2)  DEFAULT 0,
  valor_total                  NUMERIC(16,2)  DEFAULT 0,

  -- ── Entrega / Cumplimiento
  dias_entrega                 NUMERIC(6,2),
  dias_entrega_habil           NUMERIC(6,2),
  horas_entrega                NUMERIC(8,2),
  rango                        VARCHAR(20),
  horas_entrega_habiles        NUMERIC(8,2),
  cumplimiento                 VARCHAR(20),
  cumplimiento2                VARCHAR(20),
  observacion_incumplimiento   TEXT,

  -- ── Cliente
  cliente                      VARCHAR(100),

  -- ── Observaciones
  observaciones                TEXT,

  -- ── Metadatos de auditoría
  creado_en                    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  actualizado_en               TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  creado_por                   VARCHAR(50),
  actualizado_por              VARCHAR(50)
);

-- ─── 3. ÍNDICES para búsquedas frecuentes ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_serv_estado     ON public.servicios(estado);
CREATE INDEX IF NOT EXISTS idx_serv_cliente    ON public.servicios(cliente);
CREATE INDEX IF NOT EXISTS idx_serv_placa      ON public.servicios(placa_recurso);
CREATE INDEX IF NOT EXISTS idx_serv_fecha      ON public.servicios(fecha_inicio_servicio DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_serv_viaje      ON public.servicios(viaje_interno);
CREATE INDEX IF NOT EXISTS idx_serv_manifiesto ON public.servicios(manifiesto);
CREATE INDEX IF NOT EXISTS idx_serv_coordina   ON public.servicios(coordina);

-- ─── 4. FUNCIÓN para actualizar actualizado_en automáticamente ────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_servicios_updated_at
  BEFORE UPDATE ON public.servicios
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 5. TABLA DE CONFIGURACIÓN DE COLUMNAS ────────────────────────────
-- Permite que el admin persista la config de columnas en la nube
CREATE TABLE IF NOT EXISTS public.config_columnas (
  id         VARCHAR(60) PRIMARY KEY,   -- mismo id que en columns.js
  label      VARCHAR(200),
  type       VARCHAR(20),
  width      INTEGER,
  visible    BOOLEAN DEFAULT true,
  required   BOOLEAN DEFAULT false,
  locked     BOOLEAN DEFAULT false,
  "group"    VARCHAR(50),
  options    JSONB,                     -- array de opciones para select
  "order"    INTEGER DEFAULT 0,
  activo     BOOLEAN DEFAULT true,
  es_custom  BOOLEAN DEFAULT false,     -- true = columna agregada por admin
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 6. TABLA DE AUDITORÍA ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.auditoria (
  id            BIGSERIAL    PRIMARY KEY,
  tabla         VARCHAR(50),
  registro_id   VARCHAR(40),
  accion        VARCHAR(10)  CHECK (accion IN ('INSERT','UPDATE','DELETE')),
  usuario       VARCHAR(50),
  datos_antes   JSONB,
  datos_despues JSONB,
  ip            INET,
  creado_en     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── 7. ROW LEVEL SECURITY (RLS) ──────────────────────────────────────
-- Habilitar RLS en todas las tablas sensibles
ALTER TABLE public.servicios     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_columnas ENABLE ROW LEVEL SECURITY;

-- Por ahora: políticas abiertas para la anon key (ajustar en producción)
-- En producción reemplaza esto con políticas basadas en JWT roles.

CREATE POLICY "acceso_servicios"      ON public.servicios
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "acceso_usuarios"       ON public.usuarios
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "acceso_config_columnas" ON public.config_columnas
  FOR ALL USING (true) WITH CHECK (true);

-- ─── 8. VISTA para totales del dashboard ─────────────────────────────
CREATE OR REPLACE VIEW public.v_dashboard_totales AS
SELECT
  COUNT(*)                                                          AS total,
  COUNT(*) FILTER (WHERE estado = 'EN CURSO')                       AS en_curso,
  COUNT(*) FILTER (WHERE estado = 'FACTURADO')                      AS facturados,
  COUNT(*) FILTER (WHERE estado IN ('TERMINADO','CUMPLIDO'))         AS terminados,
  COUNT(*) FILTER (WHERE estado = 'CANCELADO')                      AS cancelados,
  -- Total Facturable: NO incluye EN CURSO
  COALESCE(SUM(valor_total) FILTER (WHERE estado IN ('FACTURADO','TERMINADO','CUMPLIDO')), 0) AS total_facturable,
  -- Valor en curso: se muestra separado
  COALESCE(SUM(valor_total) FILTER (WHERE estado = 'EN CURSO'), 0)  AS valor_en_curso
FROM public.servicios;

-- ─── VERIFICAR QUE TODO QUEDÓ BIEN ───────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM public.servicios)       AS total_servicios,
  (SELECT COUNT(*) FROM public.usuarios)        AS total_usuarios,
  (SELECT COUNT(*) FROM public.config_columnas) AS total_columnas;
