// src/lib/columns.js
// Definición completa de las 64 columnas del Excel maestro de AloTrans
// Los keys usan snake_case para coincidir exactamente con Supabase/PostgreSQL

export const COLUMN_TYPES = ['text', 'number', 'date', 'select'];

export const ESTADOS_OPTIONS       = ['EN CURSO', 'FACTURADO', 'TERMINADO', 'CUMPLIDO', 'CANCELADO'];
export const ESTADOS_MANIFIESTO    = ['PENDIENTE', 'CUMPLIDO', 'EN TRANSITO', 'ANULADO'];
export const CATEGORIAS_OPTIONS    = ['2W', '3W', '4W'];
export const PROVEEDORES_OPTIONS   = ['ALOTRANS_CARGA', 'TERCERO'];
export const TIPOS_MOV_OPTIONS     = ['Urbano', 'Nacionales hasta 600 km', 'Nacionales mayores 600 km'];
export const CUMPLIMIENTO_OPTIONS  = ['CUMPLIDO', 'INCUMPLIDO', 'PARCIAL'];
export const RANGO_OPTIONS         = ['RANGO 1', 'RANGO 2', 'RANGO 3', 'RANGO 4'];
export const CLIENTES_OPTIONS      = ['GRUPO UMA', 'AUTECO SAS', 'DONG FENG', 'OTROS'];

// ============================================================
// 64 COLUMNAS COMPLETAS (todas visibles por defecto, admin puede ocultar)
// locked: true = columna de sistema que no puede borrarse (sí se puede ocultar/renombrar)
// ============================================================
export const DEFAULT_COLUMNS = [
  // ── IDENTIFICACIÓN
  { id: 'viaje_interno',                label: 'VIAJE INTERNO',              type: 'text',   width: 130, visible: true,  required: true,  locked: true,  group: 'Identificación' },
  { id: 'coordina',                     label: 'COORDINA',                   type: 'text',   width: 120, visible: true,  required: true,  locked: true,  group: 'Identificación' },
  { id: 'dig',                          label: 'DIG',                        type: 'number', width: 70,  visible: true,  required: false, locked: false, group: 'Identificación' },
  { id: 'doc',                          label: 'DOC',                        type: 'number', width: 70,  visible: true,  required: false, locked: false, group: 'Identificación' },
  { id: 'tm',                           label: 'TM',                         type: 'number', width: 70,  visible: false, required: false, locked: false, group: 'Identificación' },
  { id: 'fac',                          label: 'FAC',                        type: 'text',   width: 150, visible: true,  required: false, locked: false, group: 'Identificación' },

  // ── ESTADO
  { id: 'estado',                       label: 'ESTADO',                     type: 'select', width: 130, visible: true,  required: true,  locked: true,  group: 'Estado', options: ESTADOS_OPTIONS },
  { id: 'contrato',                     label: 'CONTRATO',                   type: 'text',   width: 140, visible: true,  required: false, locked: false, group: 'Estado' },
  { id: 'expediente',                   label: 'EXPEDIENTE',                 type: 'text',   width: 120, visible: true,  required: false, locked: false, group: 'Estado' },
  { id: 'destino_final',                label: 'DESTINO FINAL',              type: 'text',   width: 140, visible: true,  required: false, locked: false, group: 'Estado' },
  { id: 'orden_compra',                 label: 'ORDEN DE COMPRA',            type: 'text',   width: 140, visible: true,  required: false, locked: false, group: 'Estado' },

  // ── MANIFIESTO
  { id: 'manifiesto',                   label: 'MANIFIESTO',                 type: 'text',   width: 130, visible: true,  required: false, locked: false, group: 'Manifiesto' },
  { id: 'estado_manifiesto',            label: 'ESTADO MANIFIESTO',          type: 'select', width: 140, visible: true,  required: false, locked: false, group: 'Manifiesto', options: ESTADOS_MANIFIESTO },
  { id: 'remesa',                       label: 'REMESA',                     type: 'text',   width: 130, visible: true,  required: false, locked: false, group: 'Manifiesto' },
  { id: 'radicado_remesa',              label: 'RADICADO REMESA',            type: 'text',   width: 140, visible: true,  required: false, locked: false, group: 'Manifiesto' },
  { id: 'observaciones_manifiestos',    label: 'OBSERVACIONES MANIFIESTOS',  type: 'text',   width: 200, visible: false, required: false, locked: false, group: 'Manifiesto' },

  // ── FECHAS
  { id: 'fecha_solicitud',              label: 'FECHA SOLICITUD',            type: 'date',   width: 150, visible: true,  required: false, locked: false, group: 'Fechas' },
  { id: 'fecha_inicio_servicio',        label: 'FECHA INICIO SERVICIO',      type: 'date',   width: 160, visible: true,  required: false, locked: false, group: 'Fechas' },
  { id: 'fecha_finalizacion_servicio',  label: 'FECHA FINALIZACIÓN',         type: 'date',   width: 160, visible: true,  required: false, locked: false, group: 'Fechas' },

  // ── VEHÍCULO
  { id: 'categoria',                    label: 'CATEGORÍA',                  type: 'select', width: 90,  visible: true,  required: false, locked: false, group: 'Vehículo', options: CATEGORIAS_OPTIONS },
  { id: 'vehiculo',                     label: 'VEHÍCULO',                   type: 'text',   width: 160, visible: true,  required: false, locked: false, group: 'Vehículo' },
  { id: 'chasis',                       label: 'CHASIS',                     type: 'text',   width: 140, visible: false, required: false, locked: false, group: 'Vehículo' },
  { id: 'placa_recurso',                label: 'PLACA RECURSO',              type: 'text',   width: 110, visible: true,  required: false, locked: false, group: 'Vehículo' },

  // ── ORIGEN
  { id: 'departamento_origen',          label: 'DEPARTAMENTO ORIGEN',        type: 'text',   width: 160, visible: false, required: false, locked: false, group: 'Origen' },
  { id: 'ciudad_origen',                label: 'CIUDAD ORIGEN',              type: 'text',   width: 130, visible: true,  required: false, locked: false, group: 'Origen' },
  { id: 'direccion_origen',             label: 'DIRECCIÓN ORIGEN',           type: 'text',   width: 220, visible: false, required: false, locked: false, group: 'Origen' },
  { id: 'cod_origen',                   label: 'COD ORIGEN',                 type: 'text',   width: 110, visible: false, required: false, locked: false, group: 'Origen' },

  // ── DESTINO
  { id: 'departamento_destino',         label: 'DEPARTAMENTO DESTINO',       type: 'text',   width: 160, visible: false, required: false, locked: false, group: 'Destino' },
  { id: 'ciudad_destino',               label: 'CIUDAD DESTINO',             type: 'text',   width: 130, visible: true,  required: false, locked: false, group: 'Destino' },
  { id: 'direccion_destino',            label: 'DIRECCIÓN DESTINO',          type: 'text',   width: 220, visible: false, required: false, locked: false, group: 'Destino' },
  { id: 'cod_destino',                  label: 'COD DESTINO',                type: 'text',   width: 110, visible: false, required: false, locked: false, group: 'Destino' },
  { id: 'nombre_destinatario',          label: 'NOMBRE DESTINATARIO',        type: 'text',   width: 200, visible: true,  required: false, locked: false, group: 'Destino' },
  { id: 'contacto_destino',             label: 'CONTACTO DESTINO',           type: 'text',   width: 140, visible: false, required: false, locked: false, group: 'Destino' },

  // ── PERSONAL
  { id: 'coordinado_con',               label: 'COORDINADO CON',             type: 'text',   width: 150, visible: false, required: false, locked: false, group: 'Personal' },
  { id: 'aprobado_por',                 label: 'APROBADO POR',               type: 'text',   width: 140, visible: false, required: false, locked: false, group: 'Personal' },
  { id: 'proveedor',                    label: 'PROVEEDOR',                  type: 'select', width: 140, visible: true,  required: false, locked: false, group: 'Personal', options: PROVEEDORES_OPTIONS },
  { id: 'nombre_tecnico',               label: 'NOMBRE TÉCNICO',             type: 'text',   width: 180, visible: true,  required: false, locked: false, group: 'Personal' },
  { id: 'cedula',                       label: 'CÉDULA',                     type: 'text',   width: 120, visible: false, required: false, locked: false, group: 'Personal' },

  // ── RUTA / LOGÍSTICA
  { id: 'ruta',                         label: 'RUTA',                       type: 'text',   width: 120, visible: false, required: false, locked: false, group: 'Ruta' },
  { id: 'tipo_ruta',                    label: 'TIPO DE RUTA',               type: 'text',   width: 140, visible: true,  required: false, locked: false, group: 'Ruta' },
  { id: 'kms_origen_destino',           label: 'KMS ORIGEN-DESTINO',         type: 'number', width: 130, visible: true,  required: false, locked: false, group: 'Ruta' },
  { id: 'expediente_ruta',              label: 'EXPEDIENTE RUTA',            type: 'text',   width: 140, visible: false, required: false, locked: false, group: 'Ruta' },
  { id: 'km_reales',                    label: 'KM REALES',                  type: 'number', width: 110, visible: false, required: false, locked: false, group: 'Ruta' },
  { id: 'num_vehiculos',                label: '# VEHÍCULOS',                type: 'number', width: 100, visible: true,  required: false, locked: false, group: 'Ruta' },
  { id: 'tipo_mov',                     label: 'TIPO MOV',                   type: 'select', width: 180, visible: true,  required: false, locked: false, group: 'Ruta', options: TIPOS_MOV_OPTIONS },
  { id: 'tipo_servicio',                label: 'TIPO DE SERVICIO',           type: 'text',   width: 150, visible: false, required: false, locked: false, group: 'Ruta' },
  { id: 'ns',                           label: 'NS',                         type: 'text',   width: 90,  visible: false, required: false, locked: false, group: 'Ruta' },

  // ── VALORES
  { id: 'valor_ruta',                   label: 'VALOR RUTA',                 type: 'number', width: 130, visible: true,  required: false, locked: false, group: 'Valores' },
  { id: 'valor_remesa',                 label: 'VALOR REMESA',               type: 'number', width: 130, visible: false, required: false, locked: false, group: 'Valores' },
  { id: 'valor_ok',                     label: 'VALOR OK',                   type: 'number', width: 120, visible: false, required: false, locked: false, group: 'Valores' },
  { id: 'neto_ok',                      label: 'NETO OK',                    type: 'number', width: 120, visible: false, required: false, locked: false, group: 'Valores' },
  { id: 'valor_total',                  label: 'VALOR TOTAL',                type: 'number', width: 140, visible: true,  required: false, locked: true,  group: 'Valores' },

  // ── ENTREGA / CUMPLIMIENTO
  { id: 'dias_entrega',                 label: 'DÍAS ENTREGA',               type: 'number', width: 120, visible: false, required: false, locked: false, group: 'Cumplimiento' },
  { id: 'dias_entrega_habil',           label: 'DÍAS ENTREGA HÁBIL',         type: 'number', width: 140, visible: false, required: false, locked: false, group: 'Cumplimiento' },
  { id: 'horas_entrega',                label: 'HORAS ENTREGA',              type: 'number', width: 130, visible: false, required: false, locked: false, group: 'Cumplimiento' },
  { id: 'rango',                        label: 'RANGO',                      type: 'select', width: 110, visible: false, required: false, locked: false, group: 'Cumplimiento', options: RANGO_OPTIONS },
  { id: 'horas_entrega_habiles',        label: 'HORAS ENTREGA HÁBILES',      type: 'number', width: 160, visible: false, required: false, locked: false, group: 'Cumplimiento' },
  { id: 'cumplimiento',                 label: 'CUMPLIMIENTO',               type: 'select', width: 130, visible: true,  required: false, locked: false, group: 'Cumplimiento', options: CUMPLIMIENTO_OPTIONS },
  { id: 'cumplimiento2',                label: 'CUMPLIMIENTO 2',             type: 'text',   width: 130, visible: false, required: false, locked: false, group: 'Cumplimiento' },
  { id: 'observacion_incumplimiento',   label: 'OBSERVACIÓN INCUMPLIMIENTO', type: 'text',   width: 220, visible: false, required: false, locked: false, group: 'Cumplimiento' },

  // ── CLIENTE
  { id: 'cliente',                      label: 'CLIENTE',                    type: 'select', width: 130, visible: true,  required: true,  locked: true,  group: 'Cliente', options: CLIENTES_OPTIONS },

  // ── OBSERVACIONES
  { id: 'observaciones',                label: 'OBSERVACIONES',              type: 'text',   width: 200, visible: true,  required: false, locked: false, group: 'Observaciones' },
];

export const STORAGE_KEY = 'alotrans:columns';

// ── Carga columnas: primero localStorage, si no hay usa DEFAULT_COLUMNS
export function loadColumns() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) { /* ignore */ }
  return DEFAULT_COLUMNS.map((c, i) => ({ ...c, order: i }));
}

// ── Persiste columnas en localStorage
export function saveColumns(cols) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cols));
    return true;
  } catch (e) { return false; }
}

// ── Columnas visibles ordenadas (las que aparecen en el grid)
export function getVisibleColumns(cols) {
  return cols
    .filter(c => c.visible)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// ── Fila vacía con todas las claves
export function emptyRow() {
  const row = {
    id: `srv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    creado_en: new Date().toISOString()
  };
  DEFAULT_COLUMNS.forEach(col => { row[col.id] = ''; });
  row.estado = 'EN CURSO';
  row.cliente = 'GRUPO UMA';
  row.proveedor = 'ALOTRANS_CARGA';
  row.num_vehiculos = 1;
  return row;
}
