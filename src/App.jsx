import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Plus, Search, Edit3, Trash2, Save, X, MapPin,
  Package, CheckCircle2, Clock, AlertCircle,
  Download, ChevronDown, Zap, ArrowLeft, Database,
  ClipboardList, Shield, RefreshCw, CircleDollarSign,
  List, FileSpreadsheet, MousePointerClick, LogIn, LogOut, User,
  UserCog, Lock, LayoutDashboard, FileCheck2, EyeOff, Eye, Info,
  UserPlus, Users, Mail, TrendingUp,
  Columns, ToggleLeft, ToggleRight, ChevronUp,
  Pencil, Check, Hash, Type, Calendar,
  Layers, SlidersHorizontal, FileDown, HardDrive,
  RotateCcw, Upload, FileJson, ShieldCheck, Route
} from 'lucide-react';

import { loadColumns, saveColumns, getVisibleColumns, emptyRow, DEFAULT_COLUMNS, COLUMN_TYPES } from './lib/columns.js';
import db from './lib/db.js';
import { USE_SUPABASE } from './lib/supabase.js';

// ============================================================
//  COLORES DE MARCA
// ============================================================
const B = {
  navy:    '#16294a',
  blue:    '#2b7fc7',
  orange:  '#ff6a00',
  bg:      '#0a0e1a',
  card:    '#111729',
  cardAlt: '#161d33',
  border:  'rgba(255,255,255,0.06)',
  borderH: 'rgba(255,255,255,0.12)'
};

const USUARIOS_DEMO = [
  { username: 'admin', password: 'admin123', rol: 'ADMIN',       nombre: 'Admin Alo Trans', esDemo: true },
  { username: 'coord', password: 'coord123', rol: 'COORDINADOR', nombre: 'Coordinador', esDemo: true }
];

const PERMISOS = {
  ADMIN:       { ver: true, crear: true, editar: true, eliminar: true,  importar: true, exportar: true, gestionarUsuarios: true, gestionarColumnas: true },
  COORDINADOR: { ver: true, crear: true, editar: true, eliminar: false, importar: true, exportar: true, gestionarUsuarios: false, gestionarColumnas: false }
};

const ESTADOS_FACTURABLES = ['FACTURADO', 'TERMINADO', 'CUMPLIDO'];

// ============================================================
//  UTILIDADES
// ============================================================
const fmtCOP = (n) => '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(Number(n) || 0);
const fmtCOPCompact = (n) => {
  const num = Number(n) || 0;
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000)     return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000)         return `$${(num / 1_000).toFixed(0)}K`;
  return fmtCOP(num);
};
const fmtDate = (iso) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
};

// ── localStorage helpers (para compatibilidad sin Supabase)
const ls = {
  get:    (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } },
  set:    (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
  remove: (k) => { try { localStorage.removeItem(k); return true; } catch { return false; } }
};

// ============================================================
//  LOGO
// ============================================================
const Logo = ({ size = 'md' }) => {
  const heights = { xs: 28, sm: 36, md: 44, lg: 56, xl: 72 };
  return (
    <img
      src="/logo.png"
      alt="AloTrans Carga"
      style={{ height: heights[size], width: 'auto', display: 'block' }}
    />
  );
};

// ============================================================
//  TOAST
// ============================================================
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  const cfg = {
    success: { icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.4)' },
    error:   { icon: AlertCircle,  color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.4)' },
    info:    { icon: Zap,          color: B.orange,  bg: 'rgba(255,106,0,0.1)',   border: 'rgba(255,106,0,0.4)' }
  }[toast.type] || { icon: Zap, color: B.orange, bg: 'rgba(255,106,0,0.1)', border: 'rgba(255,106,0,0.4)' };
  const Icon = cfg.icon;
  return (
    <div className="fixed top-6 right-6 z-[100] animate-slide-in">
      <div className="flex items-center gap-3 px-5 py-4 rounded-2xl backdrop-blur-xl shadow-2xl border max-w-md"
        style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}>
        <Icon className="w-5 h-5 flex-shrink-0" style={{ color: cfg.color }} />
        <span className="text-sm font-medium text-white">{toast.message}</span>
      </div>
    </div>
  );
};

// ============================================================
//  STATUS PILL
// ============================================================
const StatusPill = ({ status, size = 'md' }) => {
  const p = {
    'EN CURSO':  { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    'FACTURADO': { color: '#3b9cf5', bg: 'rgba(59,156,245,0.12)' },
    'TERMINADO': { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    'CUMPLIDO':  { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    'CANCELADO': { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' }
  }[status] || { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-[11px]';
  return (
    <span className={`inline-flex items-center gap-1.5 ${pad} rounded-full font-bold tracking-wide border whitespace-nowrap`}
      style={{ color: p.color, backgroundColor: p.bg, borderColor: p.color + '40' }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
      {status}
    </span>
  );
};

// ============================================================
//  CONFIRM MODAL
// ============================================================
function ConfirmModal({ title, message, color, icon: Icon, onCancel, onConfirm, confirmLabel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)' }} onClick={onCancel}>
      <div className="max-w-md w-full rounded-3xl border p-6 animate-fade-up"
        style={{ backgroundColor: B.card, borderColor: color + '4D' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: color + '1A' }}>
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{title}</h3>
            <p className="text-xs text-white/50 mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-medium border text-white/80 hover:bg-white/5"
            style={{ borderColor: B.borderH }}>Cancelar</button>
          <button onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold"
            style={{ backgroundColor: color, color: 'white' }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  LOGIN VIEW
// ============================================================
function LoginView({ onLogin, showToast }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', passwordConfirm: '', nombre: '', rol: 'COORDINADOR' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errs, setErrs] = useState({});

  const set = (k, v) => { setForm(prev => ({ ...prev, [k]: v })); setErrs({}); };

  const handleLogin = async (e) => {
    e?.preventDefault();
    const errs = {};
    if (!form.username.trim()) errs.username = 'Requerido';
    if (!form.password) errs.password = 'Requerido';
    setErrs(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const demos = USUARIOS_DEMO.find(u => u.username === form.username.trim().toLowerCase() && u.password === form.password);
    const registrados = ls.get('alotrans:usuarios') || [];
    const reg = registrados.find(u => u.username === form.username.trim().toLowerCase() && u.password === form.password);
    const user = demos || reg;

    if (!user) {
      setLoading(false);
      showToast('Usuario o contraseña incorrectos', 'error');
      setErrs({ general: 'Credenciales inválidas' });
      return;
    }
    const session = { username: user.username, nombre: user.nombre, rol: user.rol, loginAt: new Date().toISOString() };
    ls.set('alotrans:session', session);
    onLogin(session);
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    const errs = {};
    if (!form.nombre.trim() || form.nombre.length < 3) errs.nombre = 'Mínimo 3 caracteres';
    if (!form.username.trim() || form.username.length < 3) errs.username = 'Mínimo 3 caracteres';
    else if (!/^[a-zA-Z0-9_.]+$/.test(form.username)) errs.username = 'Solo letras, números, _ y .';
    if (!form.password || form.password.length < 6) errs.password = 'Mínimo 6 caracteres';
    if (form.password !== form.passwordConfirm) errs.passwordConfirm = 'No coinciden';
    setErrs(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const all = [...USUARIOS_DEMO, ...(ls.get('alotrans:usuarios') || [])];
    if (all.find(u => u.username === form.username.toLowerCase())) {
      setLoading(false);
      showToast('El usuario ya existe', 'error');
      setErrs({ username: 'Nombre en uso' });
      return;
    }
    const registrados = ls.get('alotrans:usuarios') || [];
    registrados.push({ username: form.username.toLowerCase(), password: form.password, nombre: form.nombre, rol: form.rol, esDemo: false, creadoEn: new Date().toISOString() });
    ls.set('alotrans:usuarios', registrados);
    showToast('¡Cuenta creada! Ya puedes iniciar sesión', 'success');
    setMode('login');
    setForm(prev => ({ ...prev, password: '', passwordConfirm: '', nombre: '' }));
    setLoading(false);
  };

  const llenarDemo = (tipo) => {
    const u = USUARIOS_DEMO.find(x => x.rol === tipo);
    if (u) setForm(prev => ({ ...prev, username: u.username, password: u.password }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ backgroundColor: B.bg }}>
      <div className="absolute inset-0 opacity-50" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,106,0,0.08), transparent 50%), radial-gradient(circle at 75% 75%, rgba(43,127,199,0.08), transparent 50%)`
      }} />
      <div className="relative w-full max-w-md animate-fade-up">
        <div className="flex justify-center mb-6"><Logo size="xl" /></div>
        <p className="text-center text-xs text-white/40 uppercase tracking-[0.3em] mb-8">Panel Maestro de Operaciones</p>

        <div className="rounded-3xl border p-7 backdrop-blur-xl"
          style={{ backgroundColor: 'rgba(17,23,41,0.85)', borderColor: B.borderH }}>

          <div className="flex gap-1 p-1 rounded-2xl border mb-5" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: B.border }}>
            {[['login', LogIn, 'Iniciar Sesión'], ['register', UserPlus, 'Registrarse']].map(([m, Icon, lbl]) => (
              <button key={m} type="button" onClick={() => setMode(m)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all"
                style={{
                  backgroundColor: mode === m ? B.orange : 'transparent',
                  color: mode === m ? 'white' : 'rgba(255,255,255,0.6)',
                  fontWeight: mode === m ? 700 : 500
                }}>
                <Icon className="w-4 h-4" /> {lbl}
              </button>
            ))}
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <FField label="Usuario" icon={User} error={errs.username}>
                <input type="text" value={form.username} onChange={e => set('username', e.target.value)}
                  placeholder="Tu usuario"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/30 border text-white text-sm placeholder-white/30 focus:outline-none"
                  style={{ borderColor: errs.username ? '#ef4444' : B.borderH }} />
              </FField>
              <FField label="Contraseña" icon={Lock} error={errs.password}>
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-black/30 border text-white text-sm focus:outline-none"
                  style={{ borderColor: errs.password ? '#ef4444' : B.borderH }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center">
                  {showPass ? <EyeOff className="w-4 h-4 text-white/50" /> : <Eye className="w-4 h-4 text-white/50" />}
                </button>
              </FField>
              {errs.general && (
                <div className="p-3 rounded-xl border text-sm flex items-center gap-2"
                  style={{ backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                  <AlertCircle className="w-4 h-4" /> {errs.general}
                </div>
              )}
              <BtnPrimary type="submit" loading={loading} icon={LogIn}>Iniciar Sesión</BtnPrimary>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <FField label="Nombre completo" icon={User} error={errs.nombre}>
                <input type="text" value={form.nombre} onChange={e => set('nombre', e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/30 border text-white text-sm placeholder-white/30 focus:outline-none"
                  style={{ borderColor: errs.nombre ? '#ef4444' : B.borderH }} />
              </FField>
              <FField label="Usuario" icon={Mail} error={errs.username}>
                <input type="text" value={form.username} onChange={e => set('username', e.target.value.toLowerCase())}
                  placeholder="nombre.usuario"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/30 border text-white text-sm placeholder-white/30 focus:outline-none"
                  style={{ borderColor: errs.username ? '#ef4444' : B.borderH }} />
              </FField>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2 block">Rol</label>
                <div className="grid grid-cols-2 gap-2">
                  {[['ADMIN', Shield, B.orange, 'Acceso completo'], ['COORDINADOR', UserCog, B.blue, 'Sin eliminar']].map(([r, Icon, color, desc]) => (
                    <button key={r} type="button" onClick={() => set('rol', r)}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl border transition-all"
                      style={{ borderColor: form.rol === r ? color : B.borderH, backgroundColor: form.rol === r ? color + '10' : 'transparent' }}>
                      <Icon className="w-4 h-4" style={{ color }} />
                      <span className="text-white/90 font-semibold text-sm">{r === 'ADMIN' ? 'Administrador' : 'Coordinador'}</span>
                      <span className="text-[10px] text-white/40">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              <FField label="Contraseña" icon={Lock} error={errs.password}>
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-black/30 border text-white text-sm focus:outline-none"
                  style={{ borderColor: errs.password ? '#ef4444' : B.borderH }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center">
                  {showPass ? <EyeOff className="w-4 h-4 text-white/50" /> : <Eye className="w-4 h-4 text-white/50" />}
                </button>
              </FField>
              <FField label="Confirmar contraseña" icon={Lock} error={errs.passwordConfirm}>
                <input type={showPass ? 'text' : 'password'} value={form.passwordConfirm} onChange={e => set('passwordConfirm', e.target.value)}
                  placeholder="Repite tu contraseña"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/30 border text-white text-sm focus:outline-none"
                  style={{ borderColor: errs.passwordConfirm ? '#ef4444' : B.borderH }} />
              </FField>
              <BtnPrimary type="submit" loading={loading} icon={UserPlus}>Crear Cuenta</BtnPrimary>
            </form>
          )}

          {mode === 'login' && (
            <div className="mt-5 pt-5 border-t" style={{ borderColor: B.border }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 text-center">Accesos demo</p>
              <div className="grid grid-cols-2 gap-2">
                {[['ADMIN', Shield, B.orange, 'admin / admin123'], ['COORDINADOR', UserCog, B.blue, 'coord / coord123']].map(([tipo, Icon, color, hint]) => (
                  <button key={tipo} type="button" onClick={() => llenarDemo(tipo)}
                    className="flex flex-col items-center gap-1 p-3 rounded-xl border text-xs hover:bg-white/5"
                    style={{ borderColor: B.borderH }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                    <span className="text-white/80 font-semibold">{tipo === 'ADMIN' ? 'Admin' : 'Coordinador'}</span>
                    <span className="text-[10px] text-white/40 font-mono">{hint}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const FField = ({ label, icon: Icon, error, children }) => (
  <div>
    <label className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2 block">{label}</label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
      {children}
    </div>
    {error && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
  </div>
);

const BtnPrimary = ({ children, icon: Icon, loading, type = 'button', onClick, disabled }) => (
  <button type={type} onClick={onClick} disabled={loading || disabled}
    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.01] disabled:opacity-60 disabled:scale-100"
    style={{ background: `linear-gradient(135deg, ${B.orange}, #ff8a3d)`, color: 'white', boxShadow: `0 8px 24px ${B.orange}40` }}>
    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : Icon && <Icon className="w-4 h-4" />}
    {loading ? 'Cargando...' : children}
  </button>
);

// ============================================================
//  GESTOR DE COLUMNAS (ADMIN)
// ============================================================
function ColumnManagerView({ columns, onColumnsChange, showToast }) {
  const [cols, setCols] = useState(columns);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCol, setNewCol] = useState({ label: '', type: 'text', width: 130, required: false, group: 'Personalizado', options: '' });
  const [filterGroup, setFilterGroup] = useState('TODOS');
  const [searchCol, setSearchCol] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const groups = useMemo(() => {
    const gs = [...new Set(cols.map(c => c.group || 'Sin grupo'))];
    return ['TODOS', ...gs];
  }, [cols]);

  const filtered = useMemo(() => {
    let result = cols;
    if (filterGroup !== 'TODOS') result = result.filter(c => (c.group || 'Sin grupo') === filterGroup);
    if (searchCol.trim()) result = result.filter(c => c.label.toLowerCase().includes(searchCol.toLowerCase()) || c.id.toLowerCase().includes(searchCol.toLowerCase()));
    return result;
  }, [cols, filterGroup, searchCol]);

  const visibleCount = cols.filter(c => c.visible).length;

  const updateCol = (id, changes) => {
    setCols(prev => prev.map(c => c.id === id ? { ...c, ...changes } : c));
    setHasChanges(true);
  };

  const toggleVisible = (id) => {
    const col = cols.find(c => c.id === id);
    if (col?.required && col?.visible) {
      showToast('Esta columna es requerida y no se puede ocultar', 'error');
      return;
    }
    updateCol(id, { visible: !col.visible });
  };

  const moveUp = (id) => {
    const idx = cols.findIndex(c => c.id === id);
    if (idx === 0) return;
    const next = [...cols];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setCols(next.map((c, i) => ({ ...c, order: i })));
    setHasChanges(true);
  };

  const moveDown = (id) => {
    const idx = cols.findIndex(c => c.id === id);
    if (idx === cols.length - 1) return;
    const next = [...cols];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setCols(next.map((c, i) => ({ ...c, order: i })));
    setHasChanges(true);
  };

  const startEdit = (col) => {
    setEditingId(col.id);
    setEditForm({ label: col.label, width: col.width, type: col.type, group: col.group || '', options: (col.options || []).join(', ') });
  };

  const saveEdit = (id) => {
    const options = editForm.type === 'select'
      ? editForm.options.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;
    updateCol(id, {
      label: editForm.label.trim() || cols.find(c => c.id === id).label,
      width: Math.max(60, Math.min(400, Number(editForm.width) || 130)),
      type: editForm.type,
      group: editForm.group,
      ...(options !== undefined ? { options } : {})
    });
    setEditingId(null);
  };

  const addCustomColumn = () => {
    const label = newCol.label.trim();
    if (!label) { showToast('Ingresa un nombre para la columna', 'error'); return; }
    const id = `custom_${label.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    const options = newCol.type === 'select'
      ? newCol.options.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;
    const col = {
      id, label, type: newCol.type, width: newCol.width,
      visible: true, required: false, locked: false,
      group: newCol.group || 'Personalizado',
      order: cols.length,
      esCustom: true,
      ...(options ? { options } : {})
    };
    setCols(prev => [...prev, col]);
    setShowAddModal(false);
    setNewCol({ label: '', type: 'text', width: 130, required: false, group: 'Personalizado', options: '' });
    setHasChanges(true);
    showToast(`Columna "${label}" creada`, 'success');
  };

  const deleteCustom = (id) => {
    setCols(prev => prev.filter(c => c.id !== id));
    setHasChanges(true);
  };

  const handleSave = () => {
    const ordered = cols.map((c, i) => ({ ...c, order: i }));
    if (saveColumns(ordered)) {
      onColumnsChange(ordered);
      setHasChanges(false);
      showToast('Configuración de columnas guardada', 'success');
    }
  };

  const handleReset = () => {
    const def = DEFAULT_COLUMNS.map((c, i) => ({ ...c, order: i }));
    setCols(def);
    setHasChanges(true);
    setConfirmReset(false);
    showToast('Columnas restablecidas a valores predeterminados', 'info');
  };

  const showAllCols = () => { setCols(prev => prev.map(c => ({ ...c, visible: true }))); setHasChanges(true); };
  const hideNonRequired = () => { setCols(prev => prev.map(c => c.required ? c : { ...c, visible: false })); setHasChanges(true); };

  const typeIcon = (type) => ({
    text:      Type,
    money_cop: CircleDollarSign,
    decimal:   Hash,
    number:    Hash,
    km:        MapPin,
    hours:     Clock,
    days:      Calendar,
    date:      Calendar,
    select:    Layers
  }[type] || Type);

  const typeLabel = (type) => ({
    text:      'Texto',
    money_cop: 'Dinero COP ($)',
    decimal:   'Decimal',
    number:    'Número',
    km:        'Kilómetros (km)',
    hours:     'Horas (h)',
    days:      'Días',
    date:      'Fecha',
    select:    'Lista desplegable'
  }[type] || type);

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6" style={{ color: B.orange }} />
            Gestión de Columnas
          </h2>
          <p className="text-sm text-white/50 mt-1">
            Configura las {cols.length} columnas · {visibleCount} visibles · Arrastra para reordenar
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {USE_SUPABASE && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border"
              style={{ color: '#10b981', borderColor: 'rgba(16,185,129,0.3)', backgroundColor: 'rgba(16,185,129,0.08)' }}>
              <Database className="w-3 h-3" /> Supabase conectado
            </span>
          )}
          <button onClick={() => setConfirmReset(true)}
            className="px-4 py-2 rounded-xl text-xs font-medium border text-white/70 hover:bg-white/5"
            style={{ borderColor: B.borderH }}>
            Restablecer defaults
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ backgroundColor: B.blue + '20', color: B.blue, border: `1px solid ${B.blue}40` }}>
            <Plus className="w-4 h-4" /> Nueva columna
          </button>
          {hasChanges && (
            <button onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg, ${B.orange}, #ff8a3d)`, color: 'white', boxShadow: `0 8px 24px ${B.orange}40` }}>
              <Save className="w-4 h-4" /> Guardar cambios
            </button>
          )}
        </div>
      </div>

      {hasChanges && (
        <div className="rounded-xl border p-3 flex items-center gap-2 text-sm"
          style={{ backgroundColor: 'rgba(255,106,0,0.08)', borderColor: 'rgba(255,106,0,0.3)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: B.orange }} />
          <span className="text-white/80">Tienes cambios sin guardar. Haz clic en <strong style={{ color: B.orange }}>"Guardar cambios"</strong> para aplicarlos.</span>
        </div>
      )}

      {/* Acciones masivas */}
      <div className="rounded-3xl border p-4 flex items-center gap-3 flex-wrap"
        style={{ backgroundColor: B.card, borderColor: B.border }}>
        <span className="text-xs font-bold uppercase tracking-wider text-white/50">Acciones masivas:</span>
        <button onClick={showAllCols} className="px-3 py-1.5 rounded-lg text-xs font-medium border hover:bg-white/5"
          style={{ borderColor: B.borderH, color: '#10b981' }}>
          Mostrar todas
        </button>
        <button onClick={hideNonRequired} className="px-3 py-1.5 rounded-lg text-xs font-medium border hover:bg-white/5"
          style={{ borderColor: B.borderH, color: '#f59e0b' }}>
          Solo requeridas
        </button>
        <span className="text-white/30 text-xs">|</span>
        <span className="text-xs text-white/50">Visibles: <strong className="text-white">{visibleCount}</strong> / {cols.length}</span>
      </div>

      {/* Filtros */}
      <div className="rounded-3xl border p-4 flex flex-col sm:flex-row gap-3"
        style={{ backgroundColor: B.card, borderColor: B.border }}>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          <input type="text" value={searchCol} onChange={e => setSearchCol(e.target.value)}
            placeholder="Buscar columna..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-black/30 border text-white text-sm placeholder-white/30 focus:outline-none"
            style={{ borderColor: B.borderH }} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {groups.map(g => (
            <button key={g} onClick={() => setFilterGroup(g)}
              className="px-3 py-2 rounded-xl text-xs font-medium border whitespace-nowrap transition-all"
              style={{
                backgroundColor: filterGroup === g ? B.orange + '20' : 'transparent',
                borderColor: filterGroup === g ? B.orange + '60' : B.border,
                color: filterGroup === g ? B.orange : 'rgba(255,255,255,0.6)'
              }}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de columnas */}
      <div className="rounded-3xl border overflow-hidden"
        style={{ backgroundColor: B.card, borderColor: B.border }}>
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-0 text-[10px] font-bold uppercase tracking-wider text-white/40 px-4 py-3 border-b"
          style={{ borderColor: B.border }}>
          <span className="w-8">VIS.</span>
          <span>NOMBRE / ID</span>
          <span className="w-20 text-center">TIPO</span>
          <span className="w-16 text-center">ANCHO</span>
          <span className="w-16 text-center">ORDEN</span>
          <span className="w-20 text-center">ACCIONES</span>
        </div>

        <div className="divide-y" style={{ borderColor: B.border }}>
          {filtered.map(col => {
            const TypeIcon = typeIcon(col.type);
            const isEditing = editingId === col.id;
            return (
              <div key={col.id} className="px-4 py-3 hover:bg-white/[0.02] transition-colors">
                {isEditing ? (
                  // ── Fila en edición ──────────────────────────────────────
                  <div className="flex items-start gap-3 flex-wrap">
                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-white/40 mb-1 block">Nombre (label)</label>
                        <input value={editForm.label} onChange={e => setEditForm(prev => ({ ...prev, label: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border text-white text-sm focus:outline-none"
                          style={{ borderColor: B.orange }} />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/40 mb-1 block">Tipo</label>
                        <select value={editForm.type} onChange={e => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border text-white text-sm cursor-pointer focus:outline-none"
                          style={{ borderColor: B.borderH }}>
                          {COLUMN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-white/40 mb-1 block">Ancho (px)</label>
                        <input type="number" min={60} max={400} value={editForm.width}
                          onChange={e => setEditForm(prev => ({ ...prev, width: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border text-white text-sm focus:outline-none"
                          style={{ borderColor: B.borderH }} />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/40 mb-1 block">Grupo</label>
                        <input value={editForm.group} onChange={e => setEditForm(prev => ({ ...prev, group: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border text-white text-sm focus:outline-none"
                          style={{ borderColor: B.borderH }} />
                      </div>
                      {editForm.type === 'select' && (
                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-white/40 mb-1 block">Opciones (separadas por coma)</label>
                          <input value={editForm.options} onChange={e => setEditForm(prev => ({ ...prev, options: e.target.value }))}
                            placeholder="Opción 1, Opción 2, Opción 3"
                            className="w-full px-3 py-2 rounded-xl bg-black/40 border text-white text-sm focus:outline-none"
                            style={{ borderColor: B.borderH }} />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => saveEdit(col.id)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center border hover:scale-105"
                        style={{ backgroundColor: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.4)' }}>
                        <Check className="w-4 h-4" style={{ color: '#10b981' }} />
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center border hover:scale-105"
                        style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }}>
                        <X className="w-4 h-4" style={{ color: '#ef4444' }} />
                      </button>
                    </div>
                  </div>
                ) : (
                  // ── Fila normal ──────────────────────────────────────────
                  <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-3">
                    {/* Toggle visible */}
                    <button onClick={() => toggleVisible(col.id)} className="w-8 flex justify-center">
                      {col.visible
                        ? <ToggleRight className="w-5 h-5" style={{ color: '#10b981' }} />
                        : <ToggleLeft className="w-5 h-5 text-white/30" />}
                    </button>

                    {/* Nombre */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-medium ${col.visible ? 'text-white' : 'text-white/40 line-through'}`}>{col.label}</span>
                        {col.required && <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold" style={{ color: B.orange, backgroundColor: B.orange + '15' }}>REQ</span>}
                        {col.locked && <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold text-white/40" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>🔒</span>}
                        {col.esCustom && <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold" style={{ color: B.blue, backgroundColor: B.blue + '15' }}>CUSTOM</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-white/40 font-mono">{col.id}</span>
                        <span className="text-[10px] text-white/30">·</span>
                        <span className="text-[10px] text-white/40">{col.group}</span>
                      </div>
                    </div>

                    {/* Tipo */}
                    <div className="w-20 flex justify-center">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
                        style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)' }}>
                        <TypeIcon className="w-3 h-3" />
                        {typeLabel(col.type)}
                      </div>
                    </div>

                    {/* Ancho */}
                    <div className="w-16 text-center text-xs font-mono text-white/50">{col.width}px</div>

                    {/* Orden */}
                    <div className="w-16 flex justify-center gap-1">
                      <button onClick={() => moveUp(col.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => moveDown(col.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Acciones */}
                    <div className="w-20 flex justify-center gap-1">
                      <button onClick={() => startEdit(col)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center border hover:scale-110"
                        style={{ backgroundColor: B.blue + '15', borderColor: B.blue + '40' }}
                        title="Editar columna">
                        <Pencil className="w-3.5 h-3.5" style={{ color: B.blue }} />
                      </button>
                      {col.esCustom && !col.locked && (
                        <button onClick={() => deleteCustom(col.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center border hover:scale-110"
                          style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }}
                          title="Eliminar columna custom">
                          <Trash2 className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: agregar columna custom */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)' }} onClick={() => setShowAddModal(false)}>
          <div className="max-w-md w-full rounded-3xl border p-6 animate-fade-up"
            style={{ backgroundColor: B.card, borderColor: B.orange + '40' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Plus className="w-5 h-5" style={{ color: B.orange }} /> Nueva columna
              </h3>
              <button onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10">
                <X className="w-4 h-4 text-white/50" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2 block">Nombre de la columna *</label>
                <input value={newCol.label} onChange={e => setNewCol(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Ej. NÚMERO DE GUÍA"
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border text-white text-sm placeholder-white/30 focus:outline-none"
                  style={{ borderColor: B.borderH }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2 block">Tipo</label>
                  <select value={newCol.type} onChange={e => setNewCol(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-3 rounded-xl bg-black/30 border text-white text-sm cursor-pointer focus:outline-none"
                    style={{ borderColor: B.borderH }}>
                    {COLUMN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2 block">Ancho (px)</label>
                  <input type="number" min={60} max={400} value={newCol.width}
                    onChange={e => setNewCol(prev => ({ ...prev, width: Number(e.target.value) }))}
                    className="w-full px-3 py-3 rounded-xl bg-black/30 border text-white text-sm focus:outline-none"
                    style={{ borderColor: B.borderH }} />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2 block">Grupo</label>
                <input value={newCol.group} onChange={e => setNewCol(prev => ({ ...prev, group: e.target.value }))}
                  placeholder="Ej. Identificación, Logística..."
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border text-white text-sm placeholder-white/30 focus:outline-none"
                  style={{ borderColor: B.borderH }} />
              </div>
              {newCol.type === 'select' && (
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2 block">Opciones (separadas por coma)</label>
                  <input value={newCol.options} onChange={e => setNewCol(prev => ({ ...prev, options: e.target.value }))}
                    placeholder="Opción 1, Opción 2, Opción 3"
                    className="w-full px-4 py-3 rounded-xl bg-black/30 border text-white text-sm placeholder-white/30 focus:outline-none"
                    style={{ borderColor: B.borderH }} />
                </div>
              )}
              <BtnPrimary icon={Plus} onClick={addCustomColumn}>Agregar columna</BtnPrimary>
            </div>
          </div>
        </div>
      )}

      {confirmReset && (
        <ConfirmModal title="¿Restablecer columnas?" message="Se perderán todas las personalizaciones y columnas custom"
          color={B.orange} icon={AlertCircle}
          onCancel={() => setConfirmReset(false)} onConfirm={handleReset}
          confirmLabel="Restablecer" />
      )}
    </div>
  );
}

// ============================================================
//  APP PRINCIPAL
// ============================================================
export default function App() {
  const [session, setSession] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [view, setView] = useState('dashboard');
  const [columns, setColumns] = useState(() => loadColumns());
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const showToast = useCallback((msg, type = 'success') => setToast({ message: msg, type }), []);

  const visibleCols = useMemo(() => getVisibleColumns(columns), [columns]);
  const perms = useMemo(() => session ? PERMISOS[session.rol] : null, [session]);
  const puede = useCallback((a) => !!(session && perms?.[a]), [session, perms]);

  // Verificar sesión persistida
  useEffect(() => {
    const s = ls.get('alotrans:session');
    if (s) {
      const loginTime = new Date(s.loginAt).getTime();
      if (Date.now() - loginTime < 8 * 3600000) setSession(s);
      else ls.remove('alotrans:session');
    }
    setSessionChecked(true);
  }, []);

  // Cargar servicios
  useEffect(() => {
    if (!session) { setLoading(false); return; }
    setLoading(true);
    const data = ls.get('alotrans:servicios');
    setServicios(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [session]);

  const persistServicios = (lista) => {
    const ok = ls.set('alotrans:servicios', lista);
    if (!ok) showToast('Error al guardar', 'error');
    return ok;
  };

  const handleLogin = (sess) => {
    ls.set('alotrans:session', sess);
    setSession(sess);
    setView('dashboard');
    showToast(`Bienvenido, ${sess.nombre}`, 'success');
  };

  const handleLogout = () => {
    ls.remove('alotrans:session');
    setSession(null);
    setConfirmLogout(false);
    setMenuOpen(false);
    showToast('Sesión cerrada', 'info');
  };

  const handleBulkSave = (rows) => {
    const validRows = rows.filter(r => {
      const vi = r.viaje_interno?.toString().trim();
      const co = r.coordina?.toString().trim();
      return vi || co;
    });
    if (validRows.length === 0) { showToast('No hay filas con datos', 'error'); return false; }

    const now = new Date().toISOString();
    const stamped = validRows.map(r => ({ ...r, actualizado_en: now, creado_en: r.creado_en || now }));

    const existingIds = new Set(servicios.map(s => s.id));
    const updated = [...servicios];
    let added = 0, modified = 0;
    stamped.forEach(r => {
      if (existingIds.has(r.id)) {
        const idx = updated.findIndex(s => s.id === r.id);
        updated[idx] = r;
        modified++;
      } else {
        updated.unshift(r);
        added++;
      }
    });
    if (persistServicios(updated)) {
      setServicios(updated);
      showToast(`${added} nuevos · ${modified} actualizados`, 'success');
      setView('operaciones');
      setEditingRow(null);
      return true;
    }
    return false;
  };

  const handleDelete = (id) => {
    if (!puede('eliminar')) { showToast('Solo admins pueden eliminar', 'error'); return; }
    const next = servicios.filter(s => s.id !== id);
    if (persistServicios(next)) { setServicios(next); showToast('Servicio eliminado'); setConfirmDelete(null); }
  };

  const handleEditRow = (servicio) => {
    if (!puede('editar')) { showToast('No tienes permisos', 'error'); return; }
    setEditingRow(servicio);
    setView('captura');
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(servicios, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `alotrans-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    showToast('Datos exportados');
  };

  const globalStyles = `
    @keyframes slide-in { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .animate-slide-in { animation: slide-in 0.4s cubic-bezier(0.22,1,0.36,1); }
    @keyframes fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-up { animation: fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both; }
    ::-webkit-scrollbar { width:10px; height:10px; }
    ::-webkit-scrollbar-track { background:${B.bg}; }
    ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:8px; }
    ::-webkit-scrollbar-thumb:hover { background:${B.orange}; }
    input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.5); }
    select option { background-color: #161d33; color: white; }
  `;

  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: B.bg }}>
        <style>{globalStyles}</style>
        <Logo size="lg" />
        <div className="flex items-center gap-2 text-white/50 text-sm mt-4">
          <RefreshCw className="w-4 h-4 animate-spin" style={{ color: B.orange }} />
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <style>{globalStyles}</style>
        <Toast toast={toast} onClose={() => setToast(null)} />
        <LoginView onLogin={handleLogin} showToast={showToast} />
      </>
    );
  }

  const navItems = [
    { key: 'dashboard',   label: 'Panel',     icon: LayoutDashboard, show: true },
    { key: 'operaciones', label: 'Servicios', icon: List,            show: true },
    { key: 'captura',     label: 'Captura',   icon: FileSpreadsheet, show: true },
    { key: 'columnas',    label: 'Columnas',  icon: Columns,         show: puede('gestionarColumnas') },
    { key: 'rutas',       label: 'Rutas',     icon: Route,           show: puede('gestionarColumnas') },
    { key: 'usuarios',    label: 'Usuarios',  icon: Users,           show: puede('gestionarUsuarios') },
  ].filter(x => x.show);

  return (
    <div className="min-h-screen" style={{ backgroundColor: B.bg, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
      <style>{globalStyles}</style>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="fixed inset-0 pointer-events-none opacity-40" style={{
        backgroundImage: `radial-gradient(circle at 15% 10%, rgba(255,106,0,0.06), transparent 40%), radial-gradient(circle at 85% 90%, rgba(43,127,199,0.05), transparent 40%)`
      }} />

      <header className="relative z-20 backdrop-blur-xl border-b sticky top-0"
        style={{ backgroundColor: 'rgba(10,14,26,0.85)', borderColor: B.border }}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Logo size="sm" />

          <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl border"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: B.border }}>
            {navItems.map(item => (
              <button key={item.key} onClick={() => { setView(item.key); setEditingRow(null); }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm transition-all"
                style={{
                  backgroundColor: view === item.key ? B.orange : 'transparent',
                  color: view === item.key ? 'white' : 'rgba(255,255,255,0.6)',
                  fontWeight: view === item.key ? 700 : 500,
                  boxShadow: view === item.key ? `0 4px 16px ${B.orange}40` : 'none'
                }}>
                <item.icon className="w-4 h-4" /> {item.label}
              </button>
            ))}
          </nav>

          <button onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-white/80 hover:bg-white/5 transition-colors"
            style={{ borderColor: B.borderH }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: session.rol === 'ADMIN' ? B.orange + '20' : B.blue + '20',
                color: session.rol === 'ADMIN' ? B.orange : B.blue
              }}>
              {session.rol === 'ADMIN' ? <Shield className="w-3.5 h-3.5" /> : <UserCog className="w-3.5 h-3.5" />}
            </div>
            <span className="hidden sm:block text-sm font-medium">{session.nombre.split(' ')[0]}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
            <div className="absolute top-full right-4 mt-2 w-72 rounded-2xl border backdrop-blur-xl p-3 z-40 animate-fade-up"
              style={{ backgroundColor: 'rgba(17,23,41,0.95)', borderColor: B.borderH, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
              <div className="px-3 py-3 border-b mb-2" style={{ borderColor: B.border }}>
                <p className="text-sm font-bold text-white">{session.nombre}</p>
                <p className="text-xs text-white/50">@{session.username}</p>
                {USE_SUPABASE && (
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] border"
                    style={{ color: '#10b981', borderColor: 'rgba(16,185,129,0.3)', backgroundColor: 'rgba(16,185,129,0.08)' }}>
                    <Database className="w-3 h-3" /> Supabase
                  </span>
                )}
              </div>
              <div className="md:hidden space-y-1 mb-2 pb-2 border-b" style={{ borderColor: B.border }}>
                {navItems.map(item => (
                  <button key={item.key} onClick={() => { setView(item.key); setMenuOpen(false); setEditingRow(null); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
                    style={{
                      backgroundColor: view === item.key ? B.orange + '15' : 'transparent',
                      color: view === item.key ? B.orange : 'rgba(255,255,255,0.8)'
                    }}>
                    <item.icon className="w-4 h-4" /> {item.label}
                  </button>
                ))}
              </div>
              {puede('exportar') && (
                <button onClick={() => { exportJSON(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/80 hover:bg-white/5">
                  <Download className="w-4 h-4" /> Exportar JSON
                </button>
              )}
              <button onClick={() => setConfirmLogout(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-red-500/10"
                style={{ color: '#ef4444' }}>
                <LogOut className="w-4 h-4" /> Cerrar sesión
              </button>
            </div>
          </>
        )}
      </header>

      <main className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {view === 'dashboard'   && <DashboardView servicios={servicios} loading={loading} session={session} visibleCols={visibleCols} />}
        {view === 'operaciones' && <OperacionesView servicios={servicios} loading={loading}
          onEdit={handleEditRow} onDelete={id => setConfirmDelete(id)}
          onNewBulk={() => { setView('captura'); setEditingRow(null); }} puede={puede} visibleCols={visibleCols} />}
        {view === 'captura' && <SpreadsheetView initialRows={editingRow ? [editingRow] : null}
          onSave={handleBulkSave} onCancel={() => { setView('operaciones'); setEditingRow(null); }}
          showToast={showToast} isEditing={!!editingRow} visibleCols={visibleCols} />}
        {view === 'columnas' && puede('gestionarColumnas') && (
          <ColumnManagerView columns={columns} onColumnsChange={setColumns} showToast={showToast} />)}
        {view === 'rutas' && puede('gestionarColumnas') && (
          <RutasView showToast={showToast} />
        )}
        {view === 'usuarios' && puede('gestionarUsuarios') && <UsuariosView showToast={showToast} session={session} />}
      </main>

      {confirmDelete && (
        <ConfirmModal title="¿Eliminar servicio?" message="Esta acción no se puede deshacer"
          color="#ef4444" icon={AlertCircle}
          onCancel={() => setConfirmDelete(null)} onConfirm={() => handleDelete(confirmDelete)}
          confirmLabel="Eliminar" />
      )}
      {confirmLogout && (
        <ConfirmModal title="¿Cerrar sesión?" message="Deberás autenticarte de nuevo"
          color={B.orange} icon={LogOut}
          onCancel={() => setConfirmLogout(false)} onConfirm={handleLogout}
          confirmLabel="Cerrar sesión" />
      )}

      <footer className="relative z-10 mt-12 border-t py-5" style={{ borderColor: B.border }}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Logo size="xs" />
            <p className="text-xs text-white/30">© 2026 · Panel Maestro de Operaciones · Alotrans Carga</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/30">
            <Database className="w-3.5 h-3.5" />
            <span>{servicios.length} registros · {visibleCols.length} columnas activas</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================
//  DASHBOARD
// ============================================================
function DashboardView({ servicios, loading, session }) {
  const stats = useMemo(() => {
    const total = servicios.length;
    const enCurso = servicios.filter(s => s.estado === 'EN CURSO').length;
    const facturados = servicios.filter(s => s.estado === 'FACTURADO').length;
    const terminados = servicios.filter(s => s.estado === 'TERMINADO' || s.estado === 'CUMPLIDO').length;
    const cancelados = servicios.filter(s => s.estado === 'CANCELADO').length;
    const totalFacturable = servicios.filter(s => ESTADOS_FACTURABLES.includes(s.estado)).reduce((a, s) => a + (Number(s.valor_total) || 0), 0);
    const valorEnCurso = servicios.filter(s => s.estado === 'EN CURSO').reduce((a, s) => a + (Number(s.valor_total) || 0), 0);
    const porCliente = {};
    servicios.forEach(s => {
      const c = s.cliente || 'Sin cliente';
      if (!porCliente[c]) porCliente[c] = { count: 0, valor: 0 };
      porCliente[c].count++;
      if (ESTADOS_FACTURABLES.includes(s.estado)) porCliente[c].valor += Number(s.valor_total) || 0;
    });
    const clientesTop = Object.entries(porCliente).sort((a, b) => b[1].valor - a[1].valor).slice(0, 5);
    const ultimos = [...servicios].sort((a, b) => new Date(b.actualizado_en || b.creado_en || 0) - new Date(a.actualizado_en || a.creado_en || 0)).slice(0, 5);
    return { total, enCurso, facturados, terminados, cancelados, totalFacturable, valorEnCurso, clientesTop, ultimos };
  }, [servicios]);

  if (loading) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-32 rounded-3xl animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.02)', animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="rounded-3xl border p-6 sm:p-7 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${B.card}, ${B.cardAlt})`, borderColor: B.borderH }}>
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-15"
          style={{ background: `radial-gradient(circle, ${B.orange} 0%, transparent 70%)` }} />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: B.orange }}>Panel Maestro de Operaciones</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Hola, {session.nombre.split(' ')[0]} 👋</h1>
            <p className="text-sm text-white/60 mt-2">Resumen operativo de Alotrans Carga en tiempo real</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border"
            style={{
              color: session.rol === 'ADMIN' ? B.orange : B.blue,
              backgroundColor: (session.rol === 'ADMIN' ? B.orange : B.blue) + '15',
              borderColor: (session.rol === 'ADMIN' ? B.orange : B.blue) + '40'
            }}>
            {session.rol === 'ADMIN' ? <Shield className="w-3 h-3" /> : <UserCog className="w-3 h-3" />} {session.rol}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BigKpi icon={CircleDollarSign} label="Total Facturable" helper="Finalizados y facturados"
          value={fmtCOP(stats.totalFacturable)} compact={fmtCOPCompact(stats.totalFacturable)} color="#10b981" highlight />
        <BigKpi icon={Clock} label="Valor en Curso" helper="No suma al total"
          value={fmtCOP(stats.valorEnCurso)} compact={fmtCOPCompact(stats.valorEnCurso)} color="#f59e0b" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: ClipboardList, label: 'Total', value: stats.total, color: B.orange },
          { icon: Clock, label: 'En Curso', value: stats.enCurso, color: '#f59e0b' },
          { icon: FileCheck2, label: 'Facturados', value: stats.facturados, color: B.blue },
          { icon: CheckCircle2, label: 'Terminados', value: stats.terminados, color: '#10b981' },
          { icon: X, label: 'Cancelados', value: stats.cancelados, color: '#ef4444' }
        ].map(kpi => <MiniKpi key={kpi.label} {...kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-3xl border p-5 sm:p-6" style={{ backgroundColor: B.card, borderColor: B.border }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4" style={{ color: B.orange }} />
            <h3 className="font-bold text-white">Facturación por Cliente</h3>
          </div>
          {stats.clientesTop.length === 0 ? <p className="text-center text-white/40 text-sm py-12">Sin datos</p> : (
            <div className="space-y-3">
              {stats.clientesTop.map(([cliente, data]) => {
                const max = Math.max(...stats.clientesTop.map(([, d]) => d.valor), 1);
                return (
                  <div key={cliente}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-white/90 font-medium">{cliente}</span>
                      <span className="font-bold font-mono" style={{ color: B.orange }}>{fmtCOP(data.valor)}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                      <div className="h-full rounded-full" style={{ width: `${(data.valor / max) * 100}%`, background: `linear-gradient(90deg, ${B.orange}, #ff8a3d)` }} />
                    </div>
                    <p className="text-[10px] text-white/40 mt-1">{data.count} servicios</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="rounded-3xl border p-5 sm:p-6" style={{ backgroundColor: B.card, borderColor: B.border }}>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4" style={{ color: B.blue }} />
            <h3 className="font-bold text-white">Actividad Reciente</h3>
          </div>
          {stats.ultimos.length === 0 ? <p className="text-center text-white/40 text-sm py-12">Sin actividad</p> : (
            <div className="space-y-2">
              {stats.ultimos.map(s => (
                <div key={s.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl border hover:bg-white/[0.02] transition-colors"
                  style={{ borderColor: B.border }}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white truncate">{s.viaje_interno || '—'}</span>
                      <StatusPill status={s.estado} size="sm" />
                    </div>
                    <p className="text-xs text-white/50 mt-1 truncate">
                      {s.ciudad_origen || '?'} → {s.ciudad_destino || '?'} · {s.cliente}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm font-mono" style={{ color: B.orange }}>{fmtCOP(s.valor_total)}</p>
                    <p className="text-[10px] text-white/40">{fmtDate(s.fecha_inicio_servicio)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border p-4 flex items-start gap-3"
        style={{ backgroundColor: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' }}>
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#10b981' }} />
        <div className="text-xs text-white/70 leading-relaxed">
          <strong style={{ color: '#10b981' }}>Regla de cálculo: </strong>
          el <em>Total Facturable</em> solo incluye <strong className="text-white">FACTURADO</strong>,
          <strong className="text-white"> TERMINADO</strong> y <strong className="text-white">CUMPLIDO</strong>.
          Los servicios <strong className="text-white">EN CURSO</strong> se muestran aparte y no suman al total.
        </div>
      </div>
    </div>
  );
}

const BigKpi = ({ icon: Icon, label, helper, value, compact, color, highlight }) => (
  <div className="rounded-3xl border p-5 sm:p-6 relative overflow-hidden"
    style={{ backgroundColor: B.card, borderColor: highlight ? color + '40' : B.border, boxShadow: highlight ? `0 0 40px ${color}1A` : 'none' }}>
    <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-10" style={{ backgroundColor: color }} />
    <div className="flex items-center justify-between mb-3 relative">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">{label}</p>
        <p className="text-[11px] text-white/40 mt-1">{helper}</p>
      </div>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center border" style={{ backgroundColor: color + '15', borderColor: color + '40' }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
    </div>
    <p className="font-bold text-white text-2xl sm:text-3xl break-all font-mono relative">
      <span className="hidden sm:inline">{value}</span>
      <span className="sm:hidden">{compact}</span>
    </p>
  </div>
);

const MiniKpi = ({ icon: Icon, label, value, color }) => (
  <div className="rounded-2xl border p-3 sm:p-4 transition-transform hover:scale-[1.02]"
    style={{ backgroundColor: B.card, borderColor: B.border }}>
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '15' }}>
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">{label}</p>
    </div>
    <p className="font-bold text-white text-xl sm:text-2xl mt-2">{value}</p>
  </div>
);

// ============================================================
//  OPERACIONES VIEW
// ============================================================
function OperacionesView({ servicios, loading, onEdit, onDelete, onNewBulk, puede, visibleCols }) {
  const [query, setQuery]                 = useState('');
  const [filterEstado, setFilterEstado]   = useState('TODOS');
  const [filterCliente, setFilterCliente] = useState('TODOS');
  const [showExport, setShowExport]       = useState(false);

  const ESTADOS_ALL  = ['EN CURSO', 'FACTURADO', 'TERMINADO', 'CUMPLIDO', 'CANCELADO'];
  const CLIENTES_ALL = ['GRUPO UMA', 'AUTECO SAS', 'DONG FENG', 'OTROS'];

  const filtrados = useMemo(() => {
    return servicios.filter(s => {
      const q = query.toLowerCase().trim();
      const matchQ = !q || visibleCols.some(col =>
        s[col.id]?.toString().toLowerCase().includes(q)
      );
      return matchQ
        && (filterEstado  === 'TODOS' || s.estado  === filterEstado)
        && (filterCliente === 'TODOS' || s.cliente === filterCliente);
    });
  }, [servicios, query, filterEstado, filterCliente, visibleCols]);

  const fmtCell = (col, val) => {
    if (val === null || val === undefined || val === '') return '';
    const num = Number(val);
    switch (col.type) {
      case 'money_cop':
        if (isNaN(num)) return String(val);
        return '$' + new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
      case 'decimal':
        if (isNaN(num)) return String(val);
        return new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
      case 'number':
        if (isNaN(num)) return String(val);
        return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(num);
      case 'km':
        if (isNaN(num)) return String(val);
        return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(num) + ' km';
      case 'hours':
        if (isNaN(num)) return String(val);
        return new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num) + ' h';
      case 'days':
        if (isNaN(num)) return String(val);
        return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(num) + ' días';
      case 'date':
        return fmtDate(val);
      default:
        return String(val);
    }
  };

  const cellStyle = (col, val) => {
    if (!val && val !== 0) return { color: 'rgba(255,255,255,0.2)' };
    if (col.id === 'estado') {
      const colores = { 'EN CURSO': '#f59e0b', 'FACTURADO': '#3b9cf5', 'TERMINADO': '#10b981', 'CUMPLIDO': '#10b981', 'CANCELADO': '#ef4444' };
      return { color: colores[val] || 'rgba(255,255,255,0.8)', fontWeight: 700 };
    }
    if (col.id === 'placa_recurso') return { color: B.blue, fontFamily: 'monospace', fontWeight: 700 };
    if (col.id === 'viaje_interno') return { color: 'white', fontWeight: 700 };
    if (col.type === 'money_cop')   return { color: B.orange, fontFamily: 'monospace' };
    if (col.type === 'decimal')     return { color: '#ffaa55', fontFamily: 'monospace' };
    if (['km','hours','days'].includes(col.type)) return { color: '#7dd3fc', fontFamily: 'monospace' };
    if (col.type === 'number')      return { color: 'rgba(255,255,255,0.9)', fontFamily: 'monospace' };
    return { color: 'rgba(255,255,255,0.75)' };
  };

  const exportCSV = () => {
    const headers = visibleCols.map(c => `"${c.label}"`).join(',');
    const rows = filtrados.map(s =>
      visibleCols.map(col => {
        const val = s[col.id] ?? '';
        const txt = col.type === 'date' ? fmtDate(val) : String(val).replace(/"/g, '""');
        return `"${txt}"`;
      }).join(',')
    );
    const csv  = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `alotrans-servicios-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExport(false);
  };

  const exportXLSX = () => {
    const escape = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const headerCells = visibleCols.map(c => `<Cell ss:StyleID="h"><Data ss:Type="String">${escape(c.label)}</Data></Cell>`).join('');
    const dataRows = filtrados.map(s => {
      const cells = visibleCols.map(col => {
        const raw   = s[col.id] ?? '';
        const esNum = ['money_cop','decimal','number','km','hours','days'].includes(col.type) && raw !== '' && !isNaN(Number(raw));
        const val   = esNum ? Number(raw) : escape(col.type === 'date' ? fmtDate(raw) : raw);
        return `<Cell ss:StyleID="d"><Data ss:Type="${esNum ? 'Number' : 'String'}">${val}</Data></Cell>`;
      }).join('');
      return `<Row>${cells}</Row>`;
    }).join('\n');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="h"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#FF6A00" ss:Pattern="Solid"/></Style>
    <Style ss:ID="d"><Alignment ss:WrapText="0"/></Style>
  </Styles>
  <Worksheet ss:Name="Servicios AloTrans">
    <Table>
      <Row>${headerCells}</Row>
      ${dataRows}
    </Table>
  </Worksheet>
</Workbook>`;
    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `alotrans-servicios-${new Date().toISOString().slice(0,10)}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExport(false);
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-white">Operaciones</h2>
          <p className="text-sm text-white/50 mt-1">
            {filtrados.length} de {servicios.length} servicios · {visibleCols.length} columnas activas
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {puede('exportar') && filtrados.length > 0 && (
            <div className="relative">
              <button onClick={() => setShowExport(!showExport)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-white/5"
                style={{ borderColor: B.borderH, color: '#10b981' }}>
                <Download className="w-4 h-4" /> Exportar <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showExport && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowExport(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-2xl border backdrop-blur-xl p-1.5 z-40"
                    style={{ backgroundColor: 'rgba(17,23,41,0.97)', borderColor: B.borderH }}>
                    <button onClick={exportCSV}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-white/5 text-left"
                      style={{ color: '#10b981' }}>
                      <Download className="w-4 h-4" /> CSV (.csv)
                    </button>
                    <button onClick={exportXLSX}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-white/5 text-left"
                      style={{ color: '#3b9cf5' }}>
                      <FileSpreadsheet className="w-4 h-4" /> Excel (.xls)
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          {(puede('crear') || puede('editar')) && (
            <button onClick={onNewBulk}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg, ${B.orange}, #ff8a3d)`, color: 'white', boxShadow: `0 8px 24px ${B.orange}40` }}>
              <Plus className="w-4 h-4" /> Nuevo Servicio
            </button>
          )}
        </div>
      </div>

      <div className="rounded-3xl border p-4 sm:p-5" style={{ backgroundColor: B.card, borderColor: B.border }}>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Buscar en todas las columnas visibles..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/30 border text-white text-sm placeholder-white/30 focus:outline-none"
              style={{ borderColor: B.borderH }} />
          </div>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-black/30 border text-white text-sm cursor-pointer focus:outline-none"
              style={{ borderColor: B.borderH }}>
              <option value="TODOS">Todos los estados</option>
              {ESTADOS_ALL.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <select value={filterCliente} onChange={e => setFilterCliente(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-black/30 border text-white text-sm cursor-pointer focus:outline-none"
              style={{ borderColor: B.borderH }}>
              <option value="TODOS">Todos los clientes</option>
              {CLIENTES_ALL.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border overflow-hidden" style={{ backgroundColor: B.card, borderColor: B.border }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 rounded-2xl animate-pulse"
                style={{ backgroundColor: 'rgba(255,255,255,0.02)', animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        ) : servicios.length === 0 ? (
          <div className="p-12 sm:p-16 text-center">
            <Package className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white font-bold mb-1">Sin servicios registrados</p>
            <p className="text-white/50 text-sm mb-5">Usa "Nuevo Servicio" para empezar</p>
            {puede('crear') && (
              <button onClick={onNewBulk}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, ${B.orange}, #ff8a3d)`, color: 'white', boxShadow: `0 8px 24px ${B.orange}40` }}>
                <FileSpreadsheet className="w-4 h-4" /> Captura masiva
              </button>
            )}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="p-10 text-center">
            <Search className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 text-sm">Sin resultados</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
              <table className="border-collapse" style={{ minWidth: '100%' }}>
                <thead className="sticky top-0 z-10">
                  <tr style={{ backgroundColor: '#0d1220' }}>
                    <th className="sticky left-0 z-20 px-3 py-3 border-r border-b text-[10px] font-bold uppercase tracking-wider text-white/40 text-center whitespace-nowrap"
                      style={{ backgroundColor: '#0d1220', borderColor: B.border, minWidth: 76, width: 76 }}>
                      Acción
                    </th>
                    {visibleCols.map(col => (
                      <th key={col.id}
                        className="px-3 py-3 border-r border-b text-left text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ backgroundColor: '#161d33', borderColor: B.border, minWidth: col.width, width: col.width, color: 'rgba(255,255,255,0.6)' }}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((s, rowIdx) => (
                    <tr key={s.id} className="hover:bg-white/[0.025] transition-colors"
                      style={{ borderBottom: `1px solid ${B.border}`, backgroundColor: rowIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)' }}>
                      <td className="sticky left-0 z-10 px-2 py-2 border-r border-b text-center"
                        style={{ backgroundColor: rowIdx % 2 === 0 ? B.card : 'rgba(22,29,51,0.98)', borderColor: B.border }}>
                        <div className="flex items-center justify-center gap-1">
                          {puede('editar') && (
                            <button onClick={() => onEdit(s)} title="Editar"
                              className="w-7 h-7 rounded-lg flex items-center justify-center border hover:scale-110 transition-transform"
                              style={{ backgroundColor: B.blue + '15', borderColor: B.blue + '40' }}>
                              <Edit3 className="w-3 h-3" style={{ color: B.blue }} />
                            </button>
                          )}
                          {puede('eliminar') && (
                            <button onClick={() => onDelete(s.id)} title="Eliminar"
                              className="w-7 h-7 rounded-lg flex items-center justify-center border hover:scale-110 transition-transform"
                              style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }}>
                              <Trash2 className="w-3 h-3" style={{ color: '#ef4444' }} />
                            </button>
                          )}
                        </div>
                      </td>
                      {visibleCols.map(col => {
                        const val     = s[col.id];
                        const display = fmtCell(col, val);
                        const style   = cellStyle(col, val);
                        return (
                          <td key={col.id} title={String(val ?? '')}
                            className="px-3 py-2.5 border-r border-b text-sm whitespace-nowrap"
                            style={{ borderColor: B.border, minWidth: col.width, maxWidth: col.width, overflow: 'hidden', textOverflow: 'ellipsis', ...style }}>
                            {col.id === 'estado' && val
                              ? <StatusPill status={val} size="sm" />
                              : (display || <span className="text-white/20">—</span>)
                            }
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t text-xs text-white/40 flex items-center justify-between flex-wrap gap-2"
              style={{ borderColor: B.border }}>
              <span>
                Mostrando <strong className="text-white">{filtrados.length}</strong> de {servicios.length} servicios
                · <strong className="text-white">{visibleCols.length}</strong> columnas
              </span>
              <span className="flex items-center gap-1.5"><Database className="w-3 h-3" /> Datos persistidos</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
//  SPREADSHEET VIEW (con columnas dinámicas)
// ============================================================
function SpreadsheetView({ initialRows, onSave, onCancel, showToast, isEditing, visibleCols }) {
  const FILAS_INICIALES = 10;
  const [rows, setRows] = useState(() => {
    if (initialRows && initialRows.length > 0) return [...initialRows];
    return Array.from({ length: FILAS_INICIALES }, () => emptyRow());
  });
  const [activeCell, setActiveCell] = useState({ row: 0, col: 0 });
  const [editingCell, setEditingCell] = useState(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current.select) inputRef.current.select();
    }
  }, [editingCell]);

  const updateCell = useCallback((rowIdx, colId, value) => {
    setRows(prev => {
      const next = [...prev];
      next[rowIdx] = { ...next[rowIdx], [colId]: value };
      return next;
    });
  }, []);

  const addRows = (n = 5) => {
    setRows(prev => [...prev, ...Array.from({ length: n }, () => emptyRow())]);
    showToast(`${n} filas agregadas`, 'info');
  };

  const deleteRow = (idx) => {
    if (rows.length === 1) setRows([emptyRow()]);
    else setRows(prev => prev.filter((_, i) => i !== idx));
  };

  const handlePaste = useCallback((e, startRow, startCol) => {
    const text = (e.clipboardData || window.clipboardData).getData('text');
    if (!text) return;
    const lines = text.replace(/\r/g, '').split('\n');
    if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
    if (lines.length === 0) return;
    if (lines.length === 1 && !lines[0].includes('\t') && editingCell) return;

    e.preventDefault();
    const matrix = lines.map(line => line.split('\t'));

    setRows(prev => {
      const next = [...prev];
      let filasAgregadas = 0;
      matrix.forEach((cells, rOffset) => {
        const targetRow = startRow + rOffset;
        while (next.length <= targetRow) {
          next.push(emptyRow());
          filasAgregadas++;
        }
        cells.forEach((value, cOffset) => {
          const targetCol = startCol + cOffset;
          if (targetCol >= visibleCols.length) return;
          const col = visibleCols[targetCol];
          let parsed = value.trim();
          if (col.type === 'number') {
            const num = parsed.replace(/[$\s]/g, '').replace(/,/g, '').replace(/\./g, '');
            parsed = num === '' ? '' : (isNaN(Number(num)) ? parsed : Number(num));
          } else if (col.type === 'select') {
            const upper = parsed.toUpperCase();
            const match = (col.options || []).find(o => o.toUpperCase() === upper);
            if (match) parsed = match;
          }
          next[targetRow] = { ...next[targetRow], [col.id]: parsed };
        });
      });
      setTimeout(() => showToast(`${matrix.length} filas pegadas${filasAgregadas ? ` · +${filasAgregadas} nuevas` : ''}`, 'success'), 50);
      return next;
    });
    setEditingCell(null);
  }, [showToast, editingCell, visibleCols]);

  const moveActiveCell = (row, col) => {
    const r = Math.max(0, Math.min(rows.length - 1, row));
    const c = Math.max(0, Math.min(visibleCols.length - 1, col));
    setActiveCell({ row: r, col: c });
  };

  const handleKeyDown = (e, rowIdx, colIdx) => {
    if (editingCell) {
      if (e.key === 'Enter') { e.preventDefault(); setEditingCell(null); moveActiveCell(rowIdx + 1, colIdx); }
      else if (e.key === 'Escape') setEditingCell(null);
      else if (e.key === 'Tab') { e.preventDefault(); setEditingCell(null); moveActiveCell(rowIdx, colIdx + (e.shiftKey ? -1 : 1)); }
      return;
    }
    switch (e.key) {
      case 'ArrowUp':    e.preventDefault(); moveActiveCell(rowIdx - 1, colIdx); break;
      case 'ArrowDown':  e.preventDefault(); moveActiveCell(rowIdx + 1, colIdx); break;
      case 'ArrowLeft':  e.preventDefault(); moveActiveCell(rowIdx, colIdx - 1); break;
      case 'ArrowRight': e.preventDefault(); moveActiveCell(rowIdx, colIdx + 1); break;
      case 'Tab':        e.preventDefault(); moveActiveCell(rowIdx, colIdx + (e.shiftKey ? -1 : 1)); break;
      case 'Enter': case 'F2': e.preventDefault(); setEditingCell({ row: rowIdx, col: colIdx }); break;
      case 'Delete': case 'Backspace': e.preventDefault(); updateCell(rowIdx, visibleCols[colIdx].id, ''); break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          updateCell(rowIdx, visibleCols[colIdx].id, '');
          setEditingCell({ row: rowIdx, col: colIdx });
        }
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 100));
    onSave(rows);
    setSaving(false);
  };

  const filasConDatos = rows.filter(r => r.viaje_interno?.toString().trim() || r.coordina?.toString().trim()).length;
  const totalValor = rows.reduce((acc, r) => acc + (Number(r.valor_total) || 0), 0);

  return (
    <div className="space-y-4 animate-fade-up pb-28">
      <div className="rounded-3xl border p-4 sm:p-5"
        style={{ background: `linear-gradient(135deg, ${B.card}, ${B.cardAlt})`, borderColor: B.orange + '30' }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <button onClick={onCancel}
              className="w-10 h-10 rounded-xl flex items-center justify-center border hover:bg-white/5"
              style={{ borderColor: B.borderH }}>
              <ArrowLeft className="w-4 h-4 text-white/70" />
            </button>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center border"
              style={{ backgroundColor: B.orange + '15', borderColor: B.orange + '40' }}>
              <FileSpreadsheet className="w-5 h-5" style={{ color: B.orange }} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: B.orange }}>
                {isEditing ? 'Editar Servicio' : 'Captura Masiva'}
              </p>
              <h2 className="text-xl font-bold text-white">Hoja estilo Excel</h2>
              <p className="text-xs text-white/50 mt-1 hidden sm:block">
                <kbd className="px-1 py-0.5 rounded bg-white/10 text-[10px] font-mono">Ctrl+V</kbd> desde Excel ·
                <kbd className="px-1 py-0.5 ml-1 rounded bg-white/10 text-[10px] font-mono">↑↓←→</kbd> navega ·
                <kbd className="px-1 py-0.5 ml-1 rounded bg-white/10 text-[10px] font-mono">Enter</kbd> edita
              </p>
            </div>
          </div>
          <button onClick={() => addRows(5)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border"
            style={{ borderColor: B.blue + '40', backgroundColor: B.blue + '10', color: B.blue }}>
            <Plus className="w-3.5 h-3.5" /> +5 filas
          </button>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 mt-4 pt-4 border-t flex-wrap" style={{ borderColor: B.border }}>
          <Stat label="Columnas activas" value={visibleCols.length} />
          <Stat label="Con datos" value={filasConDatos} color={B.blue} />
          <Stat label="Total" value={fmtCOP(totalValor)} color={B.orange} />
        </div>
      </div>

      <div className="rounded-xl border p-3 flex items-start gap-3"
        style={{ backgroundColor: B.blue + '08', borderColor: B.blue + '30' }}>
        <MousePointerClick className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: B.blue }} />
        <div className="text-xs text-white/80">
          <strong style={{ color: B.blue }}>Tip:</strong> Selecciona el rango en Excel → Ctrl+C → clic en la celda destino → Ctrl+V.
          La hoja usa las <strong className="text-white">{visibleCols.length} columnas visibles</strong> configuradas por el Admin.
        </div>
      </div>

      <div className="rounded-3xl border overflow-hidden" style={{ backgroundColor: '#0d1220', borderColor: B.border }}>
        <div className="overflow-auto" style={{ maxHeight: '62vh' }}>
          <table className="border-collapse" style={{ minWidth: '100%' }}>
            <thead className="sticky top-0 z-20">
              <tr>
                <th className="sticky left-0 z-30 px-2 py-2 text-[10px] font-bold text-white/40 border-r border-b text-center"
                  style={{ backgroundColor: '#0d1220', borderColor: B.border, minWidth: 45 }}>#</th>
                {visibleCols.map((col, i) => (
                  <th key={col.id}
                    className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider border-r border-b whitespace-nowrap"
                    style={{
                      backgroundColor: '#161d33', borderColor: B.border,
                      minWidth: col.width, width: col.width,
                      color: i === activeCell.col ? B.orange : 'rgba(255,255,255,0.6)'
                    }}>
                    {col.label}
                    {col.required && <span style={{ color: B.orange }}>*</span>}
                  </th>
                ))}
                <th className="sticky right-0 z-30 px-2 py-3 border-l border-b text-center"
                  style={{ backgroundColor: '#0d1220', borderColor: B.border, minWidth: 50 }}>
                  <span className="text-[10px] font-bold text-white/40">·</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => {
                const tieneDatos = row.viaje_interno?.toString().trim() || row.coordina?.toString().trim();
                return (
                  <tr key={row.id} className="group">
                    <td className="sticky left-0 z-10 px-2 py-1 border-r border-b text-center text-[11px] font-mono"
                      style={{
                        backgroundColor: rowIdx === activeCell.row ? '#1a2240' : '#0d1220',
                        borderColor: B.border,
                        color: rowIdx === activeCell.row ? B.orange : tieneDatos ? B.blue : 'rgba(255,255,255,0.25)',
                        fontWeight: rowIdx === activeCell.row ? 700 : 400
                      }}>{rowIdx + 1}</td>
                    {visibleCols.map((col, colIdx) => {
                      const isActive = rowIdx === activeCell.row && colIdx === activeCell.col;
                      const isEditingThis = editingCell?.row === rowIdx && editingCell?.col === colIdx;
                      const cellValue = row[col.id] ?? '';
                      return (
                        <td key={col.id}
                          className="border-r border-b p-0 relative"
                          style={{
                            borderColor: B.border,
                            minWidth: col.width, width: col.width,
                            backgroundColor: isActive ? B.orange + '15' : 'transparent',
                            outline: isActive ? `2px solid ${B.orange}` : 'none', outlineOffset: '-2px'
                          }}
                          onClick={() => setActiveCell({ row: rowIdx, col: colIdx })}
                          onDoubleClick={() => setEditingCell({ row: rowIdx, col: colIdx })}>
                          {isEditingThis ? (
                            <CellEditor ref={inputRef} col={col} value={cellValue}
                              onChange={v => updateCell(rowIdx, col.id, v)}
                              onKeyDown={e => handleKeyDown(e, rowIdx, colIdx)}
                              onPaste={e => handlePaste(e, rowIdx, colIdx)}
                              onBlur={() => setEditingCell(null)} />
                          ) : (
                            <CellDisplay col={col} value={cellValue}
                              onKeyDown={e => handleKeyDown(e, rowIdx, colIdx)}
                              onPaste={e => handlePaste(e, rowIdx, colIdx)} />
                          )}
                        </td>
                      );
                    })}
                    <td className="sticky right-0 z-10 px-1 py-1 border-l border-b text-center"
                      style={{ backgroundColor: '#0d1220', borderColor: B.border }}>
                      <button onClick={() => deleteRow(rowIdx)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center opacity-30 group-hover:opacity-100 hover:bg-red-500/20 transition-all">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t p-3 sm:p-4"
        style={{ backgroundColor: 'rgba(10,14,26,0.95)', borderColor: B.border }}>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Shield className="w-4 h-4" style={{ color: B.blue }} />
            <span className="hidden sm:inline">Se guardarán las <strong className="text-white">{filasConDatos}</strong> filas con datos</span>
            <span className="sm:hidden">{filasConDatos} listas</span>
          </div>
          <div className="flex gap-2">
            <button onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-sm font-medium border text-white/80 hover:bg-white/5"
              style={{ borderColor: B.borderH }}>
              <X className="w-4 h-4 inline mr-1" /> Cancelar
            </button>
            <button onClick={handleSubmit} disabled={saving || filasConDatos === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
              style={{
                background: filasConDatos > 0 ? `linear-gradient(135deg, ${B.orange}, #ff8a3d)` : '#333',
                color: filasConDatos > 0 ? 'white' : '#999',
                boxShadow: filasConDatos > 0 ? `0 8px 24px ${B.orange}40` : 'none'
              }}>
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar {filasConDatos > 0 && `(${filasConDatos})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const Stat = ({ label, value, color = '#fff' }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</p>
    <p className="text-base sm:text-lg font-bold mt-0.5 font-mono" style={{ color }}>{value}</p>
  </div>
);

// Colores de estado para celdas
const CELL_COLORS = {
  'EN CURSO': '#f59e0b', 'FACTURADO': '#3b9cf5', 'TERMINADO': '#10b981', 'CUMPLIDO': '#10b981', 'CANCELADO': '#ef4444'
};

const CellDisplay = ({ col, value, onKeyDown, onPaste }) => {
  let displayValue = value?.toString() || '';
  let textColor = 'rgba(255,255,255,0.9)';
  let extraClass = '';

  if (col.type === 'number' && value !== '' && value !== null && value !== undefined && !isNaN(value)) {
    displayValue = fmtCOP(value);
    textColor = B.orange;
    extraClass = 'font-mono';
  } else if (col.type === 'date' && value) {
    try { const d = new Date(value); if (!isNaN(d)) displayValue = d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: '2-digit' }); }
    catch { }
  } else if (col.id === 'estado' && CELL_COLORS[value]) {
    textColor = CELL_COLORS[value];
    extraClass = 'font-bold';
  } else if (col.id === 'placa_recurso' && value) {
    textColor = B.blue;
    extraClass = 'font-mono font-bold';
  } else if (col.id === 'viaje_interno' && value) {
    extraClass = 'font-bold';
  }

  return (
    <div tabIndex={0} onKeyDown={onKeyDown} onPaste={onPaste}
      className={`px-3 py-2 text-sm truncate cursor-cell focus:outline-none ${extraClass}`}
      style={{ color: displayValue ? textColor : 'rgba(255,255,255,0.2)', minHeight: '34px', lineHeight: '18px' }}>
      {displayValue || ''}
    </div>
  );
};

const CellEditor = React.forwardRef(({ col, value, onChange, onKeyDown, onPaste, onBlur }, ref) => {
  const baseStyle = {
    width: '100%', minHeight: '34px', padding: '8px 12px',
    backgroundColor: '#1a2240', border: 'none', outline: `2px solid ${B.orange}`, outlineOffset: '-2px',
    color: '#fff', fontSize: '14px', fontFamily: 'inherit'
  };
  if (col.type === 'select') {
    return (
      <select ref={ref} value={value || ''} onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown} onBlur={onBlur} onPaste={onPaste} style={{ ...baseStyle, cursor: 'pointer' }}>
        <option value=""></option>
        {(col.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    );
  }
  if (col.type === 'date') {
    return (
      <input ref={ref} type="date" value={value ? value.toString().slice(0, 10) : ''}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown} onBlur={onBlur} onPaste={onPaste} style={baseStyle} />
    );
  }
  return (
    <input ref={ref} type={col.type === 'number' ? 'number' : 'text'}
      value={value === null || value === undefined ? '' : value}
      onChange={e => onChange(col.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
      onKeyDown={onKeyDown} onBlur={onBlur} onPaste={onPaste} style={baseStyle} />
  );
});

// ============================================================
//  RUTAS VIEW
// ============================================================
const COLS_RUTAS = [
  { key: 'origen',   label: 'ORIGEN',   w: 160 },
  { key: 'destino',  label: 'DESTINO',  w: 160 },
  { key: 'ruta',     label: 'RUTA',     w: 260 },
  { key: 'kms',      label: 'KMS',      w: 100 },
  { key: 'tipo_mov', label: 'TIPO MOV', w: 220 },
];

function RutasView({ showToast }) {
  const [rutas, setRutas]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [query, setQuery]           = useState('');
  const [modo, setModo]             = useState('lista'); // 'lista' | 'captura'
  const [editando, setEditando]     = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [saving, setSaving]         = useState(false);

  // Filas de la hoja de captura
  const filaVaciaRuta = () => ({
    _id: `r-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
    origen: '', destino: '', ruta: '', kms: '', tipo_mov: ''
  });
  const [rows, setRows] = useState(() =>
    Array.from({ length: 10 }, () => filaVaciaRuta())
  );
  const [activeCell, setActiveCell] = useState({ row: 0, col: 0 });
  const [editCell, setEditCell]     = useState(null);
  const inputRef                    = useRef(null);

  // ── Cargar rutas
  const cargar = async () => {
    setLoading(true);
    try {
      if (USE_SUPABASE) {
        const { data, error } = await supabase
          .from('rutas')
          .select('*')
          .eq('activa', true)
          .order('origen')
          .order('destino');
        if (error) throw error;
        setRutas(data || []);
      } else {
        setRutas(ls.get('alotrans:rutas') || []);
      }
    } catch (e) {
      showToast('Error al cargar rutas', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  useEffect(() => {
    if (editCell && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current.select) inputRef.current.select();
    }
  }, [editCell]);

  // ── Filtrar
  const filtradas = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return rutas;
    return rutas.filter(r =>
      r.origen?.toLowerCase().includes(q) ||
      r.destino?.toLowerCase().includes(q) ||
      r.ruta?.toLowerCase().includes(q) ||
      r.tipo_mov?.toLowerCase().includes(q)
    );
  }, [rutas, query]);

  // ── Eliminar ruta
  const handleDelete = async (id) => {
    try {
      if (USE_SUPABASE) {
        const { error } = await supabase.from('rutas').delete().eq('id', id);
        if (error) throw error;
      } else {
        ls.set('alotrans:rutas', rutas.filter(r => r.id !== id));
      }
      showToast('Ruta eliminada', 'success');
      setConfirmDel(null);
      cargar();
    } catch (e) {
      showToast('Error al eliminar', 'error');
    }
  };

  // ── Navegación teclado en hoja de captura
  const moverCelda = (r, c) => {
    const nr = Math.max(0, Math.min(rows.length - 1, r));
    const nc = Math.max(0, Math.min(COLS_RUTAS.length - 1, c));
    setActiveCell({ row: nr, col: nc });
  };

  const handleKeyDown = (e, ri, ci) => {
    if (editCell) {
      if (e.key === 'Enter')  { e.preventDefault(); setEditCell(null); moverCelda(ri + 1, ci); }
      if (e.key === 'Escape') { setEditCell(null); }
      if (e.key === 'Tab')    { e.preventDefault(); setEditCell(null); moverCelda(ri, ci + (e.shiftKey ? -1 : 1)); }
      return;
    }
    const moves = { ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1] };
    if (moves[e.key]) { e.preventDefault(); moverCelda(ri + moves[e.key][0], ci + moves[e.key][1]); return; }
    if (e.key === 'Tab')   { e.preventDefault(); moverCelda(ri, ci + (e.shiftKey ? -1 : 1)); return; }
    if (e.key === 'Enter' || e.key === 'F2') { e.preventDefault(); setEditCell({ row: ri, col: ci }); return; }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      setRows(prev => { const n=[...prev]; n[ri]={...n[ri],[COLS_RUTAS[ci].key]:''}; return n; });
    }
  };

  // ── Pegar desde Excel
  const handlePaste = (e, startRow, startCol) => {
    const text = (e.clipboardData || window.clipboardData).getData('text');
    if (!text) return;
    const lines = text.replace(/\r/g,'').split('\n').filter(l => l.trim());
    if (lines.length === 1 && !lines[0].includes('\t') && editCell) return;
    e.preventDefault();
    const matrix = lines.map(l => l.split('\t'));
    setRows(prev => {
      const next = [...prev];
      matrix.forEach((cells, rOff) => {
        const tr = startRow + rOff;
        while (next.length <= tr) next.push(filaVaciaRuta());
        cells.forEach((val, cOff) => {
          const tc = startCol + cOff;
          if (tc >= COLS_RUTAS.length) return;
          next[tr] = { ...next[tr], [COLS_RUTAS[tc].key]: val.trim() };
        });
      });
      return next;
    });
    setEditCell(null);
    showToast(`${matrix.length} filas pegadas`, 'success');
  };

  // ── Guardar rutas de la hoja de captura
  const guardarRutas = async () => {
    const validas = rows.filter(r => r.origen?.trim() && r.destino?.trim());
    if (validas.length === 0) { showToast('No hay filas con datos', 'error'); return; }
    setSaving(true);
    try {
      const payload = validas.map(r => ({
        origen:   r.origen.trim().toUpperCase(),
        destino:  r.destino.trim().toUpperCase(),
        ruta:     r.ruta?.trim() || `${r.origen.trim().toUpperCase()} - ${r.destino.trim().toUpperCase()}`,
        kms:      r.kms !== '' && !isNaN(Number(r.kms)) ? Number(r.kms) : null,
        tipo_mov: r.tipo_mov?.trim() || null,
        activa:   true
      }));
      if (USE_SUPABASE) {
        const { error } = await supabase.from('rutas').insert(payload);
        if (error) throw error;
      } else {
        const existentes = ls.get('alotrans:rutas') || [];
        ls.set('alotrans:rutas', [
          ...payload.map((r, i) => ({ ...r, id: Date.now() + i })),
          ...existentes
        ]);
      }
      showToast(`${payload.length} rutas guardadas`, 'success');
      setRows(Array.from({ length: 10 }, () => filaVaciaRuta()));
      setModo('lista');
      cargar();
    } catch (e) {
      showToast('Error al guardar: ' + e.message, 'error');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-5 animate-fade-up">

      {/* ── Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Route className="w-6 h-6" style={{ color: B.orange }} />
            Rutas
          </h2>
          <p className="text-sm text-white/50 mt-1">
            {rutas.length} rutas registradas
          </p>
        </div>
        <div className="flex items-center gap-2">
          {modo === 'lista' ? (
            <button onClick={() => setModo('captura')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold hover:scale-[1.02] transition-all"
              style={{ background: `linear-gradient(135deg, ${B.orange}, #ff8a3d)`, color: 'white', boxShadow: `0 8px 24px ${B.orange}40` }}>
              <Plus className="w-4 h-4" /> Agregar Rutas
            </button>
          ) : (
            <button onClick={() => setModo('lista')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border hover:bg-white/5"
              style={{ borderColor: B.borderH, color: 'rgba(255,255,255,0.7)' }}>
              <ArrowLeft className="w-4 h-4" /> Volver a la lista
            </button>
          )}
        </div>
      </div>

      {/* ══════════════ VISTA LISTA ══════════════ */}
      {modo === 'lista' && (
        <>
          {/* Buscador */}
          <div className="rounded-3xl border p-4" style={{ backgroundColor: B.card, borderColor: B.border }}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Buscar por origen, destino, ruta o tipo..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/30 border text-white text-sm placeholder-white/30 focus:outline-none"
                style={{ borderColor: B.borderH }} />
            </div>
          </div>

          {/* Tabla */}
          <div className="rounded-3xl border overflow-hidden" style={{ backgroundColor: B.card, borderColor: B.border }}>
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 rounded-2xl animate-pulse"
                    style={{ backgroundColor: 'rgba(255,255,255,0.02)' }} />
                ))}
              </div>
            ) : rutas.length === 0 ? (
              <div className="p-12 text-center">
                <Route className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white font-bold mb-1">Sin rutas registradas</p>
                <p className="text-white/50 text-sm mb-5">
                  Haz clic en "Agregar Rutas" y pega tus 950 rutas desde Excel
                </p>
                <button onClick={() => setModo('captura')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold hover:scale-[1.02]"
                  style={{ background: `linear-gradient(135deg, ${B.orange}, #ff8a3d)`, color: 'white', boxShadow: `0 8px 24px ${B.orange}40` }}>
                  <Plus className="w-4 h-4" /> Agregar Rutas
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                  <table className="border-collapse" style={{ minWidth: '100%' }}>
                    <thead className="sticky top-0 z-10">
                      <tr style={{ backgroundColor: '#0d1220' }}>
                        <th className="sticky left-0 z-20 px-3 py-3 border-r border-b text-[10px] font-bold uppercase text-white/40 text-center whitespace-nowrap"
                          style={{ backgroundColor: '#0d1220', borderColor: B.border, minWidth: 60, width: 60 }}>
                          Acción
                        </th>
                        {COLS_RUTAS.map(col => (
                          <th key={col.key}
                            className="px-3 py-3 border-r border-b text-left text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                            style={{ backgroundColor: '#161d33', borderColor: B.border, minWidth: col.w, width: col.w, color: 'rgba(255,255,255,0.6)' }}>
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtradas.map((r, idx) => (
                        <tr key={r.id} className="hover:bg-white/[0.02] transition-colors"
                          style={{ borderBottom: `1px solid ${B.border}`, backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                          <td className="sticky left-0 z-10 px-2 py-2 border-r border-b text-center"
                            style={{ backgroundColor: idx % 2 === 0 ? B.card : 'rgba(22,29,51,0.98)', borderColor: B.border }}>
                            <button onClick={() => setConfirmDel(r.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center border hover:scale-110 transition-transform mx-auto"
                              style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }}>
                              <Trash2 className="w-3 h-3" style={{ color: '#ef4444' }} />
                            </button>
                          </td>
                          <td className="px-3 py-2 border-r border-b text-sm font-bold whitespace-nowrap"
                            style={{ borderColor: B.border, color: 'white', minWidth: 160 }}>
                            {r.origen}
                          </td>
                          <td className="px-3 py-2 border-r border-b text-sm whitespace-nowrap"
                            style={{ borderColor: B.border, color: 'rgba(255,255,255,0.8)', minWidth: 160 }}>
                            {r.destino}
                          </td>
                          <td className="px-3 py-2 border-r border-b text-sm whitespace-nowrap"
                            style={{ borderColor: B.border, color: 'rgba(255,255,255,0.6)', minWidth: 260, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {r.ruta}
                          </td>
                          <td className="px-3 py-2 border-r border-b text-sm whitespace-nowrap font-mono text-center"
                            style={{ borderColor: B.border, color: '#7dd3fc', minWidth: 100 }}>
                            {r.kms ? `${r.kms} km` : '—'}
                          </td>
                          <td className="px-3 py-2 border-r border-b text-sm whitespace-nowrap"
                            style={{ borderColor: B.border, color: 'rgba(255,255,255,0.7)', minWidth: 220 }}>
                            {r.tipo_mov || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t text-xs text-white/40 flex items-center justify-between"
                  style={{ borderColor: B.border }}>
                  <span>Mostrando <strong className="text-white">{filtradas.length}</strong> de {rutas.length} rutas</span>
                  <span className="flex items-center gap-1.5"><Database className="w-3 h-3" /> Datos persistidos</span>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ══════════════ VISTA CAPTURA (hoja tipo Excel) ══════════════ */}
      {modo === 'captura' && (
        <div className="space-y-4 pb-28">
          <div className="rounded-2xl border p-3 flex items-start gap-3"
            style={{ backgroundColor: B.blue + '08', borderColor: B.blue + '30' }}>
            <MousePointerClick className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: B.blue }} />
            <div className="text-xs text-white/80">
              <strong style={{ color: B.blue }}>Tip:</strong> En Excel selecciona las columnas
              <strong className="text-white"> ORIGEN · DESTINO · RUTA · KMS · TIPO MOV</strong>
              → Ctrl+C → clic en la celda origen de la fila 1 → Ctrl+V
            </div>
          </div>

          {/* Hoja Excel */}
          <div className="rounded-3xl border overflow-hidden" style={{ backgroundColor: '#0d1220', borderColor: B.border }}>
            <div className="overflow-auto" style={{ maxHeight: '60vh' }}>
              <table className="border-collapse" style={{ minWidth: '100%' }}>
                <thead className="sticky top-0 z-20">
                  <tr style={{ backgroundColor: '#0d1220' }}>
                    <th className="sticky left-0 z-30 px-2 py-2 text-[10px] font-bold text-white/40 border-r border-b text-center"
                      style={{ backgroundColor: '#0d1220', borderColor: B.border, minWidth: 45 }}>#</th>
                    {COLS_RUTAS.map((col, ci) => (
                      <th key={col.key}
                        className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider border-r border-b whitespace-nowrap"
                        style={{ backgroundColor: '#161d33', borderColor: B.border, minWidth: col.w, width: col.w, color: ci === activeCell.col ? B.orange : 'rgba(255,255,255,0.6)' }}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <tr key={row._id}>
                      <td className="sticky left-0 z-10 px-2 py-1 border-r border-b text-center text-[11px] font-mono"
                        style={{ backgroundColor: ri === activeCell.row ? '#1a2240' : '#0d1220', borderColor: B.border, color: ri === activeCell.row ? B.orange : 'rgba(255,255,255,0.25)' }}>
                        {ri + 1}
                      </td>
                      {COLS_RUTAS.map((col, ci) => {
                        const isActive = ri === activeCell.row && ci === activeCell.col;
                        const isEditing = editCell?.row === ri && editCell?.col === ci;
                        const val = row[col.key] ?? '';
                        return (
                          <td key={col.key}
                            className="border-r border-b p-0"
                            style={{ borderColor: B.border, minWidth: col.w, width: col.w, backgroundColor: isActive ? B.orange + '15' : 'transparent', outline: isActive ? `2px solid ${B.orange}` : 'none', outlineOffset: '-2px' }}
                            onClick={() => setActiveCell({ row: ri, col: ci })}
                            onDoubleClick={() => setEditCell({ row: ri, col: ci })}>
                            {isEditing ? (
                              <input ref={inputRef} type={col.key === 'kms' ? 'number' : 'text'}
                                value={val}
                                onChange={e => setRows(prev => { const n=[...prev]; n[ri]={...n[ri],[col.key]:e.target.value}; return n; })}
                                onKeyDown={e => handleKeyDown(e, ri, ci)}
                                onPaste={e => handlePaste(e, ri, ci)}
                                onBlur={() => setEditCell(null)}
                                style={{ width:'100%', minHeight:'34px', padding:'8px 12px', backgroundColor:'#1a2240', border:'none', outline:`2px solid ${B.orange}`, outlineOffset:'-2px', color:'#fff', fontSize:'14px', fontFamily:'inherit' }} />
                            ) : (
                              <div tabIndex={0}
                                onKeyDown={e => handleKeyDown(e, ri, ci)}
                                onPaste={e => handlePaste(e, ri, ci)}
                                style={{ padding:'8px 12px', minHeight:'34px', fontSize:'14px', color: val ? (col.key==='kms' ? '#7dd3fc' : 'rgba(255,255,255,0.9)') : 'rgba(255,255,255,0.2)', fontFamily: col.key==='kms' ? 'monospace' : 'inherit' }}>
                                {val || ''}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Barra fija abajo */}
          <div className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t p-3 sm:p-4"
            style={{ backgroundColor: 'rgba(10,14,26,0.95)', borderColor: B.border }}>
            <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-white/50">
                <button onClick={() => setRows(prev => [...prev, ...Array.from({ length: 10 }, () => filaVaciaRuta())])}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs hover:bg-white/5"
                  style={{ borderColor: B.borderH, color: B.blue }}>
                  <Plus className="w-3.5 h-3.5" /> +10 filas
                </button>
                <span className="text-white/40">
                  {rows.filter(r => r.origen?.trim() && r.destino?.trim()).length} filas con datos
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setModo('lista')}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium border text-white/80 hover:bg-white/5"
                  style={{ borderColor: B.borderH }}>
                  Cancelar
                </button>
                <button onClick={guardarRutas} disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold hover:scale-[1.02] disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${B.orange}, #ff8a3d)`, color: 'white', boxShadow: `0 8px 24px ${B.orange}40` }}>
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar {rows.filter(r => r.origen?.trim() && r.destino?.trim()).length > 0 &&
                    `(${rows.filter(r => r.origen?.trim() && r.destino?.trim()).length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDel && (
        <ConfirmModal title="¿Eliminar ruta?" message="Esta acción no se puede deshacer"
          color="#ef4444" icon={AlertCircle}
          onCancel={() => setConfirmDel(null)} onConfirm={() => handleDelete(confirmDel)}
          confirmLabel="Eliminar" />
      )}
    </div>
  );
}

// ============================================================
//  GESTIÓN DE USUARIOS
// ============================================================
function UsuariosView({ showToast, session }) {
  const [usuarios, setUsuarios] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const cargar = () => {
    setUsuarios([...USUARIOS_DEMO, ...(ls.get('alotrans:usuarios') || [])]);
  };

  useEffect(() => { cargar(); }, []);

  const handleDelete = (username) => {
    const registrados = (ls.get('alotrans:usuarios') || []).filter(u => u.username !== username);
    if (ls.set('alotrans:usuarios', registrados)) {
      showToast(`Usuario "${username}" eliminado`, 'success');
      setConfirmDelete(null);
      cargar();
    }
  };

  const registradosCount = usuarios.filter(u => !u.esDemo).length;

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6" style={{ color: B.orange }} /> Gestión de Usuarios
        </h2>
        <p className="text-sm text-white/50 mt-1">Administra el acceso al sistema</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MiniKpi icon={Users} label="Total" value={usuarios.length} color={B.orange} />
        <MiniKpi icon={UserPlus} label="Registrados" value={registradosCount} color={B.blue} />
        <MiniKpi icon={Shield} label="Admins" value={usuarios.filter(u => u.rol === 'ADMIN').length} color="#10b981" />
      </div>

      <div className="rounded-xl border p-4 flex items-start gap-3"
        style={{ backgroundColor: B.blue + '08', borderColor: B.blue + '30' }}>
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: B.blue }} />
        <div className="text-xs text-white/70">
          Los usuarios se registran desde la pantalla de login. Los usuarios <strong>demo</strong> son permanentes y no pueden eliminarse.
        </div>
      </div>

      <div className="rounded-3xl border overflow-hidden" style={{ backgroundColor: B.card, borderColor: B.border }}>
        <div className="p-3 space-y-2">
          {usuarios.map(u => (
            <div key={u.username} className="rounded-2xl border p-4 flex items-center justify-between gap-3"
              style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderColor: u.username === session.username ? B.orange + '40' : B.border
              }}>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border"
                  style={{
                    backgroundColor: (u.rol === 'ADMIN' ? B.orange : B.blue) + '15',
                    borderColor: (u.rol === 'ADMIN' ? B.orange : B.blue) + '40'
                  }}>
                  {u.rol === 'ADMIN' ? <Shield className="w-5 h-5" style={{ color: B.orange }} /> : <UserCog className="w-5 h-5" style={{ color: B.blue }} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-white">{u.nombre}</p>
                    {u.username === session.username && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full border font-bold"
                        style={{ color: B.orange, borderColor: B.orange + '40', backgroundColor: B.orange + '15' }}>TÚ</span>
                    )}
                    {u.esDemo && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full border font-bold text-white/60"
                        style={{ borderColor: B.borderH, backgroundColor: 'rgba(255,255,255,0.03)' }}>DEMO</span>
                    )}
                  </div>
                  <p className="text-xs text-white/50">@{u.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border"
                  style={{
                    color: u.rol === 'ADMIN' ? B.orange : B.blue,
                    backgroundColor: (u.rol === 'ADMIN' ? B.orange : B.blue) + '15',
                    borderColor: (u.rol === 'ADMIN' ? B.orange : B.blue) + '40'
                  }}>
                  {u.rol}
                </span>
                {!u.esDemo && u.username !== session.username && (
                  <button onClick={() => setConfirmDelete(u.username)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border hover:scale-110 transition-transform"
                    style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }}>
                    <Trash2 className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {confirmDelete && (
        <ConfirmModal title={`¿Eliminar "${confirmDelete}"?`} message="El usuario ya no podrá acceder"
          color="#ef4444" icon={AlertCircle}
          onCancel={() => setConfirmDelete(null)} onConfirm={() => handleDelete(confirmDelete)}
          confirmLabel="Eliminar" />
      )}
    </div>
  );
}
