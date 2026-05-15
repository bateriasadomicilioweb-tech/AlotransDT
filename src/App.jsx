import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Truck, Plus, Search, Edit3, Trash2, Save, X, MapPin,
  Package, CheckCircle2, Clock, AlertCircle,
  Download, ChevronDown, Zap, ArrowLeft, Database,
  ClipboardList, Shield, RefreshCw, CircleDollarSign,
  List, FileSpreadsheet,
  MousePointerClick, LogIn, LogOut, User,
  UserCog, Lock, LayoutDashboard, FileCheck2,
  EyeOff, Eye, Info, UserPlus, Users, Mail,
  TrendingUp, BarChart3
} from 'lucide-react';

// ============================================================
//  COLORES DE MARCA
// ============================================================
const BRAND = {
  navy:    '#16294a',
  blue:    '#2b7fc7',
  orange:  '#ff6a00',
  bg:      '#0a0e1a',
  card:    '#111729',
  cardAlt: '#161d33',
  border:  'rgba(255,255,255,0.06)',
  borderH: 'rgba(255,255,255,0.12)'
};

// ============================================================
//  COMPONENTE LOGO
// ============================================================
const AloTransLogo = ({ size = 'md', showCarga = true, theme = 'dark' }) => {
  const sizes = {
    xs: { w: 100, h: 32 },
    sm: { w: 140, h: 44 },
    md: { w: 180, h: 56 },
    lg: { w: 220, h: 70 },
    xl: { w: 280, h: 90 }
  };
  const s = sizes[size];
  const navyColor = theme === 'dark' ? '#5b8bd1' : BRAND.navy;
  const blueColor = theme === 'dark' ? '#3b9cf5' : BRAND.blue;

  return (
    <svg viewBox="0 0 380 110" width={s.w} height={s.h} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <text x="0" y="72" fontFamily="'Arial Black', 'Helvetica Neue', sans-serif" fontSize="78" fontWeight="900" fill={navyColor}>Al</text>
      <circle cx="105" cy="46" r="26" fill={navyColor} />
      <circle cx="105" cy="46" r="13" fill={BRAND.bg} />
      <path d="M105 28 L96 50 L103 50 L99 64 L114 42 L107 42 L111 28 Z"
        fill="#ffffff" stroke={navyColor} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M5 88 Q50 108 130 78"
        stroke={BRAND.orange} strokeWidth="11" fill="none" strokeLinecap="round" />
      <text x="142" y="72" fontFamily="'Arial', 'Helvetica Neue', sans-serif" fontSize="72" fontWeight="400" fill={blueColor}>Trans</text>
      {showCarga && (
        <text x="115" y="105" fontFamily="'Arial', sans-serif" fontSize="20" fontWeight="700"
          fontStyle="italic" fill={BRAND.orange} letterSpacing="9">c a r g a</text>
      )}
    </svg>
  );
};

// ============================================================
//  CATÁLOGOS
// ============================================================
const ESTADOS = ['EN CURSO', 'FACTURADO', 'TERMINADO', 'CUMPLIDO', 'CANCELADO'];
const ESTADOS_FACTURABLES = ['FACTURADO', 'TERMINADO', 'CUMPLIDO'];
const CATEGORIAS = ['2W', '3W', '4W'];
const PROVEEDORES = ['ALOTRANS_CARGA', 'TERCERO'];
const CLIENTES = ['GRUPO UMA', 'AUTECO SAS', 'DONG FENG', 'OTROS'];

const USUARIOS_DEMO = [
  { username: 'admin', password: 'admin123', rol: 'ADMIN',       nombre: 'Admin Alo Trans', esDemo: true },
  { username: 'coord', password: 'coord123', rol: 'COORDINADOR', nombre: 'Coordinador UMA', esDemo: true }
];

const PERMISOS = {
  ADMIN:       { ver: true, crear: true, editar: true, eliminar: true,  importar: true, exportar: true, gestionarUsuarios: true },
  COORDINADOR: { ver: true, crear: true, editar: true, eliminar: false, importar: true, exportar: true, gestionarUsuarios: false }
};

const COLUMNAS = [
  { key: 'viajeInterno',   label: 'VIAJE',     w: 120, type: 'text' },
  { key: 'coordina',       label: 'COORDINA',  w: 110, type: 'text' },
  { key: 'cliente',        label: 'CLIENTE',   w: 130, type: 'select', options: CLIENTES },
  { key: 'estado',         label: 'ESTADO',    w: 130, type: 'select', options: ESTADOS },
  { key: 'fechaInicio',    label: 'FECHA',     w: 150, type: 'date' },
  { key: 'ciudadOrigen',   label: 'ORIGEN',    w: 130, type: 'text' },
  { key: 'ciudadDestino',  label: 'DESTINO',   w: 130, type: 'text' },
  { key: 'placaRecurso',   label: 'PLACA',     w: 100, type: 'text' },
  { key: 'nombreTecnico',  label: 'TÉCNICO',   w: 160, type: 'text' },
  { key: 'valorTotal',     label: 'VALOR',     w: 140, type: 'number' },
  { key: 'categoria',      label: 'CATEG.',    w: 90,  type: 'select', options: CATEGORIAS },
  { key: 'proveedor',      label: 'PROVEEDOR', w: 140, type: 'select', options: PROVEEDORES }
];

const filaVacia = () => ({
  id: `srv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  viajeInterno: '', coordina: '', cliente: 'GRUPO UMA', estado: 'EN CURSO',
  fechaInicio: '', ciudadOrigen: '', ciudadDestino: '',
  placaRecurso: '', nombreTecnico: '', valorTotal: '',
  categoria: '4W', proveedor: 'ALOTRANS_CARGA',
  creadoEn: new Date().toISOString()
});

// ============================================================
//  UTILIDADES
// ============================================================
const fmtCOP = (n) => {
  const num = Number(n) || 0;
  return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(num);
};
const fmtDate = (iso) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
};
const fmtCOPCompact = (n) => {
  const num = Number(n) || 0;
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000)     return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000)         return `$${(num / 1_000).toFixed(0)}K`;
  return fmtCOP(num);
};

// ============================================================
//  STORAGE HELPERS (localStorage)
// ============================================================
const storage = {
  get: (key) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch { return null; }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch { return false; }
  },
  remove: (key) => {
    try { localStorage.removeItem(key); return true; }
    catch { return false; }
  }
};

const getUsuarios = () => {
  const data = storage.get('alotrans:usuarios');
  return Array.isArray(data) ? data : [];
};
const saveUsuarios = (lista) => storage.set('alotrans:usuarios', lista);
const getTodosLosUsuarios = () => [...USUARIOS_DEMO, ...getUsuarios()];

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
  const config = {
    success: { icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.4)' },
    error:   { icon: AlertCircle,  color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.4)' },
    info:    { icon: Zap,          color: BRAND.orange, bg: 'rgba(255,106,0,0.1)', border: 'rgba(255,106,0,0.4)' }
  };
  const cfg = config[toast.type] || config.info;
  const Icon = cfg.icon;
  return (
    <div className="fixed top-6 right-6 z-[100] animate-slide-in">
      <div className="flex items-center gap-3 px-5 py-4 rounded-2xl backdrop-blur-xl shadow-2xl border max-w-md"
        style={{ backgroundColor: cfg.bg, borderColor: cfg.border, boxShadow: `0 8px 32px ${cfg.color}33` }}>
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
  const palette = {
    'EN CURSO':  { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    'FACTURADO': { color: '#3b9cf5', bg: 'rgba(59,156,245,0.12)' },
    'TERMINADO': { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    'CUMPLIDO':  { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    'CANCELADO': { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' }
  };
  const p = palette[status] || palette['EN CURSO'];
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-[11px]';
  return (
    <span className={`inline-flex items-center gap-1.5 ${padding} rounded-full font-bold tracking-wide border whitespace-nowrap`}
      style={{ color: p.color, backgroundColor: p.bg, borderColor: p.color + '40' }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color, boxShadow: `0 0 8px ${p.color}` }} />
      {status}
    </span>
  );
};

// ============================================================
//  MODAL CONFIRMACIÓN
// ============================================================
function ConfirmModal({ title, message, color, icon: Icon, onCancel, onConfirm, confirmLabel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)' }} onClick={onCancel}>
      <div className="max-w-md w-full rounded-3xl border p-6 animate-fade-up"
        style={{ backgroundColor: BRAND.card, borderColor: color + '4D' }}
        onClick={(e) => e.stopPropagation()}>
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
            className="flex-1 px-4 py-3 rounded-xl text-sm font-medium border text-white/80 hover:bg-white/5 transition-colors"
            style={{ borderColor: BRAND.borderH }}>Cancelar</button>
          <button onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: color, color: 'white' }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  LOGIN / REGISTER
// ============================================================
function LoginView({ onLogin, showToast }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState('COORDINADOR');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});

  const resetForm = () => {
    setUsername(''); setPassword(''); setPasswordConfirm('');
    setNombre(''); setRol('COORDINADOR'); setErrores({});
  };
  const cambiarModo = (nuevoModo) => { setMode(nuevoModo); resetForm(); };

  const handleLogin = async (e) => {
    e?.preventDefault();
    const errs = {};
    if (!username.trim()) errs.username = 'Requerido';
    if (!password) errs.password = 'Requerido';
    setErrores(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const todos = getTodosLosUsuarios();
    const user = todos.find(u =>
      u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (!user) {
      setLoading(false);
      showToast('Usuario o contraseña incorrectos', 'error');
      setErrores({ general: 'Credenciales inválidas' });
      return;
    }

    const session = {
      username: user.username,
      nombre: user.nombre,
      rol: user.rol,
      loginAt: new Date().toISOString(),
      token: `token-${Date.now()}-${Math.random().toString(36).slice(2)}`
    };
    onLogin(session);
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    const errs = {};
    if (!nombre.trim()) errs.nombre = 'Requerido';
    else if (nombre.trim().length < 3) errs.nombre = 'Mínimo 3 caracteres';
    if (!username.trim()) errs.username = 'Requerido';
    else if (username.trim().length < 3) errs.username = 'Mínimo 3 caracteres';
    else if (!/^[a-zA-Z0-9_.]+$/.test(username.trim())) errs.username = 'Solo letras, números, _ y .';
    if (!password) errs.password = 'Requerido';
    else if (password.length < 6) errs.password = 'Mínimo 6 caracteres';
    if (!passwordConfirm) errs.passwordConfirm = 'Confirma la contraseña';
    else if (password !== passwordConfirm) errs.passwordConfirm = 'No coinciden';
    setErrores(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 400));

    const todos = getTodosLosUsuarios();
    const existe = todos.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (existe) {
      setLoading(false);
      showToast('El usuario ya existe', 'error');
      setErrores({ username: 'Nombre de usuario en uso' });
      return;
    }

    const registrados = getUsuarios();
    const nuevoUsuario = {
      username: username.trim().toLowerCase(),
      password: password,
      nombre: nombre.trim(),
      rol: rol,
      esDemo: false,
      creadoEn: new Date().toISOString()
    };

    const ok = saveUsuarios([...registrados, nuevoUsuario]);
    if (!ok) {
      setLoading(false);
      showToast('Error al crear el usuario', 'error');
      return;
    }

    showToast(`¡Cuenta creada! Ya puedes iniciar sesión`, 'success');
    setMode('login');
    setPassword(''); setPasswordConfirm(''); setNombre('');
    setLoading(false);
  };

  const llenarDemo = (tipo) => {
    const u = USUARIOS_DEMO.find(x => x.rol === tipo);
    if (u) { setUsername(u.username); setPassword(u.password); setErrores({}); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ backgroundColor: BRAND.bg }}>
      <div className="absolute inset-0 opacity-60" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,106,0,0.08), transparent 50%), radial-gradient(circle at 75% 75%, rgba(43,127,199,0.08), transparent 50%)`
      }} />
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="relative w-full max-w-md animate-fade-up">
        <div className="flex justify-center mb-6">
          <AloTransLogo size="xl" />
        </div>
        <p className="text-center text-xs text-white/40 uppercase tracking-[0.3em] mb-8">
          Panel Maestro de Operaciones
        </p>

        <div className="rounded-3xl border p-7 backdrop-blur-xl"
          style={{
            backgroundColor: 'rgba(17,23,41,0.85)',
            borderColor: BRAND.borderH,
            boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(255,106,0,0.08)`
          }}>

          <div className="flex gap-2 p-1 rounded-2xl border mb-6"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: BRAND.border }}>
            <button type="button" onClick={() => cambiarModo('login')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all"
              style={{
                backgroundColor: mode === 'login' ? BRAND.orange : 'transparent',
                color: mode === 'login' ? 'white' : 'rgba(255,255,255,0.6)',
                fontWeight: mode === 'login' ? 700 : 500,
                boxShadow: mode === 'login' ? `0 4px 20px ${BRAND.orange}66` : 'none'
              }}>
              <LogIn className="w-4 h-4" /> Iniciar Sesión
            </button>
            <button type="button" onClick={() => cambiarModo('register')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all"
              style={{
                backgroundColor: mode === 'register' ? BRAND.orange : 'transparent',
                color: mode === 'register' ? 'white' : 'rgba(255,255,255,0.6)',
                fontWeight: mode === 'register' ? 700 : 500,
                boxShadow: mode === 'register' ? `0 4px 20px ${BRAND.orange}66` : 'none'
              }}>
              <UserPlus className="w-4 h-4" /> Registrarse
            </button>
          </div>

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <FormField label="Usuario" icon={User} error={errores.username}>
                <input type="text" value={username}
                  onChange={(e) => { setUsername(e.target.value); setErrores({}); }}
                  placeholder="Tu usuario"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/30 border text-white text-sm placeholder-white/30 focus:outline-none transition-colors"
                  style={{ borderColor: errores.username ? '#ef4444' : BRAND.borderH }} />
              </FormField>

              <FormField label="Contraseña" icon={Lock} error={errores.password}>
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrores({}); }}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-black/30 border text-white text-sm focus:outline-none transition-colors"
                  style={{ borderColor: errores.password ? '#ef4444' : BRAND.borderH }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5">
                  {showPass ? <EyeOff className="w-4 h-4 text-white/50" /> : <Eye className="w-4 h-4 text-white/50" />}
                </button>
              </FormField>

              {errores.general && (
                <div className="p-3 rounded-xl border text-sm flex items-center gap-2"
                  style={{ backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                  <AlertCircle className="w-4 h-4" /> {errores.general}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.01] disabled:opacity-60 disabled:scale-100"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.orange}, #ff8a3d)`,
                  color: 'white',
                  boxShadow: `0 8px 24px ${BRAND.orange}40`
                }}>
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                {loading ? 'Verificando...' : 'Iniciar Sesión'}
              </button>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <FormField label="Nombre completo" icon={User} error={errores.nombre}>
                <input type="text" value={nombre}
                  onChange={(e) => { setNombre(e.target.value); setErrores({}); }}
                  placeholder="Ej. Juan Pérez"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/30 border text-white text-sm placeholder-white/30 focus:outline-none transition-colors"
                  style={{ borderColor: errores.nombre ? '#ef4444' : BRAND.borderH }} />
              </FormField>

              <FormField label="Usuario" icon={Mail} error={errores.username}>
                <input type="text" value={username}
                  onChange={(e) => { setUsername(e.target.value.toLowerCase()); setErrores({}); }}
                  placeholder="nombre.usuario"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/30 border text-white text-sm placeholder-white/30 focus:outline-none transition-colors"
                  style={{ borderColor: errores.username ? '#ef4444' : BRAND.borderH }} />
              </FormField>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2 block">Rol</label>
                <div className="grid grid-cols-2 gap-2">
                  <RoleButton selected={rol === 'ADMIN'} onClick={() => setRol('ADMIN')}
                    icon={Shield} label="Administrador" desc="Acceso completo" color={BRAND.orange} />
                  <RoleButton selected={rol === 'COORDINADOR'} onClick={() => setRol('COORDINADOR')}
                    icon={UserCog} label="Coordinador" desc="Sin eliminar" color={BRAND.blue} />
                </div>
              </div>

              <FormField label="Contraseña" icon={Lock} error={errores.password}>
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrores({}); }}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-black/30 border text-white text-sm focus:outline-none transition-colors"
                  style={{ borderColor: errores.password ? '#ef4444' : BRAND.borderH }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5">
                  {showPass ? <EyeOff className="w-4 h-4 text-white/50" /> : <Eye className="w-4 h-4 text-white/50" />}
                </button>
              </FormField>

              <FormField label="Confirmar contraseña" icon={Lock} error={errores.passwordConfirm}>
                <input type={showPass ? 'text' : 'password'} value={passwordConfirm}
                  onChange={(e) => { setPasswordConfirm(e.target.value); setErrores({}); }}
                  placeholder="Repite tu contraseña"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/30 border text-white text-sm focus:outline-none transition-colors"
                  style={{ borderColor: errores.passwordConfirm ? '#ef4444' : BRAND.borderH }} />
              </FormField>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.01] disabled:opacity-60"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.orange}, #ff8a3d)`,
                  color: 'white',
                  boxShadow: `0 8px 24px ${BRAND.orange}40`
                }}>
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>
            </form>
          )}

          {mode === 'login' && (
            <div className="mt-6 pt-6 border-t" style={{ borderColor: BRAND.border }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 text-center">Accesos demo</p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => llenarDemo('ADMIN')}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl border text-xs hover:bg-white/5 transition-colors"
                  style={{ borderColor: BRAND.borderH }}>
                  <Shield className="w-4 h-4" style={{ color: BRAND.orange }} />
                  <span className="text-white/80 font-semibold">Admin</span>
                  <span className="text-[10px] text-white/40 font-mono">admin / admin123</span>
                </button>
                <button type="button" onClick={() => llenarDemo('COORDINADOR')}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl border text-xs hover:bg-white/5 transition-colors"
                  style={{ borderColor: BRAND.borderH }}>
                  <UserCog className="w-4 h-4" style={{ color: BRAND.blue }} />
                  <span className="text-white/80 font-semibold">Coordinador</span>
                  <span className="text-[10px] text-white/40 font-mono">coord / coord123</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-white/30 mt-6 tracking-wide">
          © 2026 Alo Trans Carga · Soluciones logísticas para el Grupo UMA
        </p>
      </div>
    </div>
  );
}

const FormField = ({ label, icon: Icon, error, children }) => (
  <div>
    <label className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2 block">{label}</label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
      {children}
    </div>
    {error && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
  </div>
);

const RoleButton = ({ selected, onClick, icon: Icon, label, desc, color }) => (
  <button type="button" onClick={onClick}
    className="flex flex-col items-center gap-1 p-3 rounded-xl border transition-all"
    style={{
      borderColor: selected ? color : BRAND.borderH,
      backgroundColor: selected ? color + '10' : 'transparent'
    }}>
    <Icon className="w-4 h-4" style={{ color }} />
    <span className="text-white/90 font-semibold text-sm">{label}</span>
    <span className="text-[10px] text-white/40">{desc}</span>
  </button>
);

// ============================================================
//  APP PRINCIPAL
// ============================================================
export default function App() {
  const [session, setSession] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [view, setView] = useState('dashboard');
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);

  const perms = useMemo(() => session ? PERMISOS[session.rol] : null, [session]);
  const puede = useCallback((accion) => {
    if (!session || !perms) return false;
    return !!perms[accion];
  }, [session, perms]);

  // Verificar sesión persistida
  useEffect(() => {
    try {
      const s = storage.get('alotrans:session');
      if (s) {
        const loginTime = new Date(s.loginAt).getTime();
        const OCHO_HORAS = 8 * 60 * 60 * 1000;
        if (Date.now() - loginTime < OCHO_HORAS) setSession(s);
        else storage.remove('alotrans:session');
      }
    } catch (e) { }
    finally { setSessionChecked(true); }
  }, []);

  // Cargar servicios
  useEffect(() => {
    if (!session) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = storage.get('alotrans:servicios');
      setServicios(Array.isArray(data) ? data : []);
    } catch (e) { }
    finally { setLoading(false); }
  }, [session]);

  const persistServicios = (lista) => {
    const ok = storage.set('alotrans:servicios', lista);
    if (!ok) showToast('Error al guardar', 'error');
    return ok;
  };

  const handleLogin = (sess) => {
    storage.set('alotrans:session', sess);
    setSession(sess);
    setView('dashboard');
    showToast(`Bienvenido, ${sess.nombre}`, 'success');
  };

  const handleLogout = () => {
    storage.remove('alotrans:session');
    setSession(null);
    setConfirmLogout(false);
    setMenuOpen(false);
    showToast('Sesión cerrada', 'info');
  };

  const handleBulkSave = (rows) => {
    if (!puede('crear') && !puede('editar')) {
      showToast('No tienes permisos', 'error');
      return false;
    }
    const validRows = rows.filter(r => r.viajeInterno?.toString().trim() || r.coordina?.toString().trim());
    if (validRows.length === 0) {
      showToast('No hay filas con datos', 'error');
      return false;
    }
    const now = new Date().toISOString();
    const stamped = validRows.map(r => ({ ...r, actualizadoEn: now, creadoEn: r.creadoEn || now }));

    const existingIds = new Set(servicios.map(s => s.id));
    const updated = [...servicios];
    let added = 0, modified = 0;
    stamped.forEach(r => {
      if (existingIds.has(r.id)) {
        if (!puede('editar')) return;
        const idx = updated.findIndex(s => s.id === r.id);
        updated[idx] = r;
        modified++;
      } else {
        if (!puede('crear')) return;
        updated.unshift(r);
        added++;
      }
    });
    const ok = persistServicios(updated);
    if (ok) {
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
    const nuevaLista = servicios.filter(s => s.id !== id);
    if (persistServicios(nuevaLista)) {
      setServicios(nuevaLista);
      showToast('Servicio eliminado');
      setConfirmDelete(null);
    }
  };

  const handleEditRow = (servicio) => {
    if (!puede('editar')) { showToast('No tienes permisos', 'error'); return; }
    setEditingRow(servicio);
    setView('captura');
  };

  const exportJSON = () => {
    if (!puede('exportar')) return;
    const blob = new Blob([JSON.stringify(servicios, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `alotrans-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    showToast('Datos exportados');
  };

  const globalStyles = `
    @keyframes slide-in { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .animate-slide-in { animation: slide-in 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
    @keyframes fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-up { animation: fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: ${BRAND.bg}; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 8px; }
    ::-webkit-scrollbar-thumb:hover { background: ${BRAND.orange}; }
  `;

  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: BRAND.bg }}>
        <AloTransLogo size="lg" />
        <div className="flex items-center gap-2 text-white/50 text-sm mt-4">
          <RefreshCw className="w-4 h-4 animate-spin" style={{ color: BRAND.orange }} />
          <span>Verificando sesión...</span>
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
    { key: 'usuarios',    label: 'Usuarios',  icon: Users,           show: puede('gestionarUsuarios') }
  ].filter(x => x.show);

  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND.bg, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
      <style>{globalStyles}</style>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="fixed inset-0 pointer-events-none opacity-40" style={{
        backgroundImage: `radial-gradient(circle at 15% 10%, rgba(255,106,0,0.06), transparent 40%), radial-gradient(circle at 85% 90%, rgba(43,127,199,0.05), transparent 40%)`
      }} />
      <div className="fixed inset-0 pointer-events-none opacity-30" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <header className="relative z-20 backdrop-blur-xl border-b sticky top-0"
        style={{ backgroundColor: 'rgba(10,14,26,0.85)', borderColor: BRAND.border }}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <AloTransLogo size="sm" />

          <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl border"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: BRAND.border }}>
            {navItems.map(item => (
              <button key={item.key} onClick={() => { setView(item.key); setEditingRow(null); }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm transition-all"
                style={{
                  backgroundColor: view === item.key ? BRAND.orange : 'transparent',
                  color: view === item.key ? 'white' : 'rgba(255,255,255,0.6)',
                  fontWeight: view === item.key ? 700 : 500,
                  boxShadow: view === item.key ? `0 4px 16px ${BRAND.orange}40` : 'none'
                }}>
                <item.icon className="w-4 h-4" /> {item.label}
              </button>
            ))}
          </nav>

          <button onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-white/80 hover:bg-white/5 transition-colors"
            style={{ borderColor: BRAND.borderH }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: session.rol === 'ADMIN' ? BRAND.orange + '20' : BRAND.blue + '20',
                color: session.rol === 'ADMIN' ? BRAND.orange : BRAND.blue
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
              style={{ backgroundColor: 'rgba(17,23,41,0.95)', borderColor: BRAND.borderH, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
              <div className="px-3 py-3 border-b mb-2" style={{ borderColor: BRAND.border }}>
                <p className="text-sm font-bold text-white">{session.nombre}</p>
                <p className="text-xs text-white/50">@{session.username}</p>
                <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                  style={{
                    color: session.rol === 'ADMIN' ? BRAND.orange : BRAND.blue,
                    backgroundColor: session.rol === 'ADMIN' ? BRAND.orange + '15' : BRAND.blue + '15',
                    borderColor: session.rol === 'ADMIN' ? BRAND.orange + '40' : BRAND.blue + '40'
                  }}>
                  {session.rol === 'ADMIN' ? <Shield className="w-3 h-3" /> : <UserCog className="w-3 h-3" />}
                  {session.rol}
                </span>
              </div>
              <div className="md:hidden space-y-1 mb-2 pb-2 border-b" style={{ borderColor: BRAND.border }}>
                {navItems.map(item => (
                  <button key={item.key} onClick={() => { setView(item.key); setMenuOpen(false); setEditingRow(null); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
                    style={{
                      backgroundColor: view === item.key ? BRAND.orange + '15' : 'transparent',
                      color: view === item.key ? BRAND.orange : 'rgba(255,255,255,0.8)'
                    }}>
                    <item.icon className="w-4 h-4" /> {item.label}
                  </button>
                ))}
              </div>
              {puede('exportar') && (
                <button onClick={() => { exportJSON(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/80 hover:bg-white/5 transition-colors">
                  <Download className="w-4 h-4" /> Exportar JSON
                </button>
              )}
              <button onClick={() => setConfirmLogout(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-red-500/10 transition-colors"
                style={{ color: '#ef4444' }}>
                <LogOut className="w-4 h-4" /> Cerrar sesión
              </button>
            </div>
          </>
        )}
      </header>

      <main className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {view === 'dashboard'   && <DashboardView servicios={servicios} loading={loading} session={session} />}
        {view === 'operaciones' && <OperacionesView servicios={servicios} loading={loading}
          onEdit={handleEditRow} onDelete={(id) => setConfirmDelete(id)}
          onNewBulk={() => { setView('captura'); setEditingRow(null); }} puede={puede} />}
        {view === 'captura' && <SpreadsheetView initialRows={editingRow ? [editingRow] : null}
          onSave={handleBulkSave} onCancel={() => { setView('operaciones'); setEditingRow(null); }}
          showToast={showToast} isEditing={!!editingRow} />}
        {view === 'usuarios' && puede('gestionarUsuarios') && <UsuariosView showToast={showToast} session={session} />}
      </main>

      {confirmDelete && (
        <ConfirmModal title="¿Eliminar servicio?" message="Esta acción no se puede deshacer"
          color="#ef4444" icon={AlertCircle}
          onCancel={() => setConfirmDelete(null)} onConfirm={() => handleDelete(confirmDelete)}
          confirmLabel="Eliminar" />
      )}

      {confirmLogout && (
        <ConfirmModal title="¿Cerrar sesión?" message="Deberás autenticarte de nuevo para continuar"
          color={BRAND.orange} icon={LogOut}
          onCancel={() => setConfirmLogout(false)} onConfirm={handleLogout}
          confirmLabel="Cerrar sesión" />
      )}

      <footer className="relative z-10 mt-12 border-t py-5" style={{ borderColor: BRAND.border }}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <AloTransLogo size="xs" />
            <p className="text-xs text-white/30">© 2026 · Panel Maestro de Operaciones · Grupo UMA</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/30">
            <Database className="w-3.5 h-3.5" />
            <span>{servicios.length} registros · Sesión activa</span>
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

    const totalFacturable = servicios
      .filter(s => ESTADOS_FACTURABLES.includes(s.estado))
      .reduce((acc, s) => acc + (Number(s.valorTotal) || 0), 0);

    const valorEnCurso = servicios
      .filter(s => s.estado === 'EN CURSO')
      .reduce((acc, s) => acc + (Number(s.valorTotal) || 0), 0);

    const porCliente = {};
    servicios.forEach(s => {
      const c = s.cliente || 'Sin cliente';
      if (!porCliente[c]) porCliente[c] = { count: 0, valor: 0 };
      porCliente[c].count++;
      if (ESTADOS_FACTURABLES.includes(s.estado)) porCliente[c].valor += Number(s.valorTotal) || 0;
    });
    const clientesTop = Object.entries(porCliente)
      .sort((a, b) => b[1].valor - a[1].valor)
      .slice(0, 5);

    const ultimos = [...servicios]
      .sort((a, b) => new Date(b.actualizadoEn || b.creadoEn || 0) - new Date(a.actualizadoEn || a.creadoEn || 0))
      .slice(0, 5);

    return { total, enCurso, facturados, terminados, cancelados, totalFacturable, valorEnCurso, clientesTop, ultimos };
  }, [servicios]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-3xl animate-pulse"
            style={{ backgroundColor: 'rgba(255,255,255,0.02)', animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="rounded-3xl border p-6 sm:p-7 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${BRAND.card} 0%, ${BRAND.cardAlt} 100%)`,
          borderColor: BRAND.borderH
        }}>
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-20"
          style={{ background: `radial-gradient(circle, ${BRAND.orange} 0%, transparent 70%)` }} />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: BRAND.orange }}>
              Panel Maestro de Operaciones
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Hola, {session.nombre.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-white/60 mt-2">Resumen operativo del Grupo UMA en tiempo real</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border"
            style={{
              color: session.rol === 'ADMIN' ? BRAND.orange : BRAND.blue,
              backgroundColor: (session.rol === 'ADMIN' ? BRAND.orange : BRAND.blue) + '15',
              borderColor: (session.rol === 'ADMIN' ? BRAND.orange : BRAND.blue) + '40'
            }}>
            {session.rol === 'ADMIN' ? <Shield className="w-3 h-3" /> : <UserCog className="w-3 h-3" />}
            {session.rol}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BigKpi icon={CircleDollarSign} label="Total Facturable"
          helper="Servicios finalizados y facturados"
          value={fmtCOP(stats.totalFacturable)}
          valueCompact={fmtCOPCompact(stats.totalFacturable)}
          color="#10b981" highlight />
        <BigKpi icon={Clock} label="Valor en Curso"
          helper="No suma al total facturado"
          value={fmtCOP(stats.valorEnCurso)}
          valueCompact={fmtCOPCompact(stats.valorEnCurso)}
          color="#f59e0b" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MiniKpi icon={ClipboardList} label="Total" value={stats.total} color={BRAND.orange} />
        <MiniKpi icon={Clock} label="En Curso" value={stats.enCurso} color="#f59e0b" />
        <MiniKpi icon={FileCheck2} label="Facturados" value={stats.facturados} color={BRAND.blue} />
        <MiniKpi icon={CheckCircle2} label="Terminados" value={stats.terminados} color="#10b981" />
        <MiniKpi icon={X} label="Cancelados" value={stats.cancelados} color="#ef4444" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-3xl border p-5 sm:p-6"
          style={{ backgroundColor: BRAND.card, borderColor: BRAND.border }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: BRAND.orange }} />
              <h3 className="font-bold text-white">Facturación por Cliente</h3>
            </div>
            <BarChart3 className="w-4 h-4 text-white/30" />
          </div>
          {stats.clientesTop.length === 0 ? (
            <p className="text-center text-white/40 text-sm py-12">Sin datos disponibles</p>
          ) : (
            <div className="space-y-3">
              {stats.clientesTop.map(([cliente, data]) => {
                const max = Math.max(...stats.clientesTop.map(([, d]) => d.valor), 1);
                const pct = (data.valor / max) * 100;
                return (
                  <div key={cliente}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-white/90 font-medium">{cliente}</span>
                      <span className="font-bold font-mono" style={{ color: BRAND.orange }}>{fmtCOP(data.valor)}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${BRAND.orange}, #ff8a3d)`
                        }} />
                    </div>
                    <p className="text-[10px] text-white/40 mt-1">{data.count} servicios</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-3xl border p-5 sm:p-6"
          style={{ backgroundColor: BRAND.card, borderColor: BRAND.border }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: BRAND.blue }} />
              <h3 className="font-bold text-white">Actividad Reciente</h3>
            </div>
          </div>
          {stats.ultimos.length === 0 ? (
            <p className="text-center text-white/40 text-sm py-12">Sin actividad reciente</p>
          ) : (
            <div className="space-y-2">
              {stats.ultimos.map(s => (
                <div key={s.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl border hover:bg-white/[0.02] transition-colors"
                  style={{ borderColor: BRAND.border }}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white truncate">{s.viajeInterno || '—'}</span>
                      <StatusPill status={s.estado} size="sm" />
                    </div>
                    <p className="text-xs text-white/50 mt-1 truncate">
                      {s.ciudadOrigen || '?'} → {s.ciudadDestino || '?'} · {s.cliente}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm font-mono" style={{ color: BRAND.orange }}>{fmtCOP(s.valorTotal)}</p>
                    <p className="text-[10px] text-white/40">{fmtDate(s.fechaInicio)}</p>
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
          el <em>Total Facturable</em> solo incluye servicios en estado <strong className="text-white">FACTURADO</strong>,
          <strong className="text-white"> TERMINADO</strong> o <strong className="text-white">CUMPLIDO</strong>.
          Los servicios <strong className="text-white">EN CURSO</strong> se muestran aparte y no suman al total.
        </div>
      </div>
    </div>
  );
}

const BigKpi = ({ icon: Icon, label, helper, value, valueCompact, color, highlight }) => (
  <div className="rounded-3xl border p-5 sm:p-6 relative overflow-hidden"
    style={{
      backgroundColor: BRAND.card,
      borderColor: highlight ? color + '40' : BRAND.border,
      boxShadow: highlight ? `0 0 40px ${color}1A` : 'none'
    }}>
    <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-10"
      style={{ backgroundColor: color }} />
    <div className="flex items-center justify-between mb-3 relative">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">{label}</p>
        <p className="text-[11px] text-white/40 mt-1">{helper}</p>
      </div>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center border"
        style={{ backgroundColor: color + '15', borderColor: color + '40' }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
    </div>
    <p className="font-bold text-white text-2xl sm:text-3xl break-all font-mono relative">
      <span className="hidden sm:inline">{value}</span>
      <span className="sm:hidden">{valueCompact}</span>
    </p>
  </div>
);

const MiniKpi = ({ icon: Icon, label, value, color }) => (
  <div className="rounded-2xl border p-3 sm:p-4 transition-transform hover:scale-[1.02]"
    style={{ backgroundColor: BRAND.card, borderColor: BRAND.border }}>
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: color + '15' }}>
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">{label}</p>
    </div>
    <p className="font-bold text-white text-xl sm:text-2xl mt-2">{value}</p>
  </div>
);

// ============================================================
//  OPERACIONES
// ============================================================
function OperacionesView({ servicios, loading, onEdit, onDelete, onNewBulk, puede }) {
  const [query, setQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState('TODOS');
  const [filterCliente, setFilterCliente] = useState('TODOS');

  const filtrados = useMemo(() => {
    return servicios.filter(s => {
      const q = query.toLowerCase().trim();
      const matchQ = !q ||
        s.viajeInterno?.toString().toLowerCase().includes(q) ||
        s.placaRecurso?.toString().toLowerCase().includes(q) ||
        s.nombreTecnico?.toString().toLowerCase().includes(q) ||
        s.coordina?.toString().toLowerCase().includes(q);
      const matchE = filterEstado === 'TODOS' || s.estado === filterEstado;
      const matchC = filterCliente === 'TODOS' || s.cliente === filterCliente;
      return matchQ && matchE && matchC;
    });
  }, [servicios, query, filterEstado, filterCliente]);

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-white">Operaciones</h2>
          <p className="text-sm text-white/50 mt-1">Gestión de servicios registrados</p>
        </div>
        {(puede('crear') || puede('editar')) && (
          <button onClick={onNewBulk}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${BRAND.orange}, #ff8a3d)`,
              color: 'white',
              boxShadow: `0 8px 24px ${BRAND.orange}40`
            }}>
            <Plus className="w-4 h-4" /> Nuevo Servicio
          </button>
        )}
      </div>

      <div className="rounded-3xl border p-4 sm:p-5"
        style={{ backgroundColor: BRAND.card, borderColor: BRAND.border }}>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por viaje, placa, técnico..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/30 border text-white text-sm placeholder-white/30 focus:outline-none focus:border-orange-500/40 transition-colors"
              style={{ borderColor: BRAND.borderH }} />
          </div>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-black/30 border text-white text-sm cursor-pointer focus:outline-none"
              style={{ borderColor: BRAND.borderH }}>
              <option value="TODOS">Todos los estados</option>
              {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <select value={filterCliente} onChange={(e) => setFilterCliente(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-black/30 border text-white text-sm cursor-pointer focus:outline-none"
              style={{ borderColor: BRAND.borderH }}>
              <option value="TODOS">Todos los clientes</option>
              {CLIENTES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border overflow-hidden"
        style={{ backgroundColor: BRAND.card, borderColor: BRAND.border }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 rounded-2xl animate-pulse"
                style={{ backgroundColor: 'rgba(255,255,255,0.02)', animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : servicios.length === 0 ? (
          <EmptyState onAction={onNewBulk} canCreate={puede('crear')} />
        ) : filtrados.length === 0 ? (
          <div className="p-10 sm:p-16 text-center">
            <Search className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 text-sm">No se encontraron resultados</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: BRAND.border }}>
                    {['Viaje', 'Estado', 'Cliente', 'Ruta', 'Placa', 'Fecha', 'Valor', 'Acciones'].map(h => (
                      <th key={h} className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(s => (
                    <tr key={s.id} className="border-b hover:bg-white/[0.02] transition-colors"
                      style={{ borderColor: BRAND.border }}>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white text-sm">{s.viajeInterno || '—'}</div>
                        <div className="text-xs text-white/40 mt-0.5">{s.coordina}</div>
                      </td>
                      <td className="px-4 py-3.5"><StatusPill status={s.estado} /></td>
                      <td className="px-4 py-3.5 text-sm text-white/80">{s.cliente}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 text-sm text-white/80">
                          <MapPin className="w-3.5 h-3.5" style={{ color: BRAND.blue }} />
                          <span>{s.ciudadOrigen || '?'} → {s.ciudadDestino || '?'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-mono text-sm font-bold" style={{ color: BRAND.blue }}>{s.placaRecurso || '—'}</div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-white/70 whitespace-nowrap">{fmtDate(s.fechaInicio)}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-sm whitespace-nowrap font-mono" style={{ color: BRAND.orange }}>
                          {fmtCOP(s.valorTotal)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {puede('editar') && (
                            <button onClick={() => onEdit(s)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center border hover:scale-110 transition-transform"
                              style={{ backgroundColor: BRAND.blue + '15', borderColor: BRAND.blue + '40' }}
                              title="Editar">
                              <Edit3 className="w-3.5 h-3.5" style={{ color: BRAND.blue }} />
                            </button>
                          )}
                          {puede('eliminar') && (
                            <button onClick={() => onDelete(s.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center border hover:scale-110 transition-transform"
                              style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }}
                              title="Eliminar">
                              <Trash2 className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden p-3 space-y-3">
              {filtrados.map(s => (
                <div key={s.id} className="rounded-2xl border p-4"
                  style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: BRAND.border }}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">{s.viajeInterno || '—'}</div>
                      <div className="text-xs text-white/40 mt-0.5 truncate">{s.coordina} · {s.cliente}</div>
                    </div>
                    <StatusPill status={s.estado} size="sm" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80 mt-2">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: BRAND.blue }} />
                    <span className="truncate">{s.ciudadOrigen || '?'} → {s.ciudadDestino || '?'}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: BRAND.border }}>
                    <div>
                      <div className="font-mono text-xs font-bold" style={{ color: BRAND.blue }}>{s.placaRecurso || '—'}</div>
                      <div className="text-[10px] text-white/40">{fmtDate(s.fechaInicio)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm font-mono" style={{ color: BRAND.orange }}>{fmtCOP(s.valorTotal)}</div>
                      <div className="flex items-center gap-1 mt-1.5 justify-end">
                        {puede('editar') && (
                          <button onClick={() => onEdit(s)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center border"
                            style={{ backgroundColor: BRAND.blue + '15', borderColor: BRAND.blue + '40' }}>
                            <Edit3 className="w-3 h-3" style={{ color: BRAND.blue }} />
                          </button>
                        )}
                        {puede('eliminar') && (
                          <button onClick={() => onDelete(s.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center border"
                            style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }}>
                            <Trash2 className="w-3 h-3" style={{ color: '#ef4444' }} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-3 border-t text-xs text-white/40 flex items-center justify-between"
              style={{ borderColor: BRAND.border }}>
              <span>Mostrando {filtrados.length} de {servicios.length} servicios</span>
              <span className="flex items-center gap-1.5"><Database className="w-3 h-3" /> Datos persistidos</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const EmptyState = ({ onAction, canCreate }) => (
  <div className="p-12 sm:p-16 text-center">
    <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 border"
      style={{ backgroundColor: BRAND.orange + '10', borderColor: BRAND.orange + '30' }}>
      <Package className="w-9 h-9" style={{ color: BRAND.orange }} />
    </div>
    <h3 className="text-white font-bold text-lg mb-1">Sin servicios registrados</h3>
    <p className="text-white/50 text-sm mb-6">Empieza creando tu primer servicio o pegando datos desde Excel</p>
    {canCreate && (
      <button onClick={onAction}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
        style={{
          background: `linear-gradient(135deg, ${BRAND.orange}, #ff8a3d)`,
          color: 'white',
          boxShadow: `0 8px 24px ${BRAND.orange}40`
        }}>
        <FileSpreadsheet className="w-4 h-4" /> Crear primer servicio
      </button>
    )}
  </div>
);

// ============================================================
//  SPREADSHEET (Captura masiva)
// ============================================================
function SpreadsheetView({ initialRows, onSave, onCancel, showToast, isEditing }) {
  const FILAS_INICIALES = 10;
  const [rows, setRows] = useState(() => {
    if (initialRows && initialRows.length > 0) return [...initialRows];
    return Array.from({ length: FILAS_INICIALES }, () => filaVacia());
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

  const updateCell = useCallback((rowIdx, colKey, value) => {
    setRows(prev => {
      const next = [...prev];
      next[rowIdx] = { ...next[rowIdx], [colKey]: value };
      return next;
    });
  }, []);

  const addRows = (n = 5) => {
    setRows(prev => [...prev, ...Array.from({ length: n }, () => filaVacia())]);
    showToast(`${n} filas agregadas`, 'info');
  };

  const deleteRow = (idx) => {
    if (rows.length === 1) setRows([filaVacia()]);
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
          next.push(filaVacia());
          filasAgregadas++;
        }
        cells.forEach((value, cOffset) => {
          const targetCol = startCol + cOffset;
          if (targetCol >= COLUMNAS.length) return;
          const col = COLUMNAS[targetCol];
          let parsed = value.trim();
          if (col.type === 'number') {
            const num = parsed.replace(/[$\s]/g, '').replace(/,/g, '').replace(/\./g, '');
            parsed = num === '' ? '' : (isNaN(Number(num)) ? parsed : Number(num));
          } else if (col.type === 'select') {
            const upper = parsed.toUpperCase();
            const match = col.options.find(o => o.toUpperCase() === upper);
            if (match) parsed = match;
          }
          next[targetRow] = { ...next[targetRow], [col.key]: parsed };
        });
      });
      setTimeout(() => showToast(`${matrix.length} filas pegadas${filasAgregadas ? ` · +${filasAgregadas} nuevas` : ''}`, 'success'), 50);
      return next;
    });
    setEditingCell(null);
  }, [showToast, editingCell]);

  const moveActiveCell = (row, col) => {
    const r = Math.max(0, Math.min(rows.length - 1, row));
    const c = Math.max(0, Math.min(COLUMNAS.length - 1, col));
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
      case 'Delete': case 'Backspace': e.preventDefault(); updateCell(rowIdx, COLUMNAS[colIdx].key, ''); break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          updateCell(rowIdx, COLUMNAS[colIdx].key, '');
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

  const filasConDatos = rows.filter(r => r.viajeInterno?.toString().trim() || r.coordina?.toString().trim()).length;
  const totalValor = rows.reduce((acc, r) => acc + (Number(r.valorTotal) || 0), 0);

  return (
    <div className="space-y-4 animate-fade-up pb-28">
      <div className="rounded-3xl border p-4 sm:p-5"
        style={{
          background: `linear-gradient(135deg, ${BRAND.card}, ${BRAND.cardAlt})`,
          borderColor: BRAND.orange + '30'
        }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <button onClick={onCancel}
              className="w-10 h-10 rounded-xl flex items-center justify-center border hover:bg-white/5 transition-colors"
              style={{ borderColor: BRAND.borderH }}>
              <ArrowLeft className="w-4 h-4 text-white/70" />
            </button>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center border"
              style={{ backgroundColor: BRAND.orange + '15', borderColor: BRAND.orange + '40' }}>
              <FileSpreadsheet className="w-5 h-5" style={{ color: BRAND.orange }} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: BRAND.orange }}>
                {isEditing ? 'Editar Servicio' : 'Captura Masiva'}
              </p>
              <h2 className="text-xl font-bold text-white">Hoja estilo Excel</h2>
              <p className="text-xs text-white/50 mt-1 hidden sm:block">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono">Ctrl+V</kbd> pega desde Excel ·
                <kbd className="px-1.5 py-0.5 ml-1 rounded bg-white/10 text-[10px] font-mono">↑↓←→</kbd> navega
              </p>
            </div>
          </div>
          <button onClick={() => addRows(5)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors hover:bg-white/5"
            style={{ borderColor: BRAND.blue + '40', backgroundColor: BRAND.blue + '10', color: BRAND.blue }}>
            <Plus className="w-3.5 h-3.5" /> +5 filas
          </button>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 mt-4 pt-4 border-t flex-wrap"
          style={{ borderColor: BRAND.border }}>
          <Stat label="Filas" value={rows.length} />
          <Stat label="Con datos" value={filasConDatos} color={BRAND.blue} />
          <Stat label="Total" value={fmtCOP(totalValor)} color={BRAND.orange} />
        </div>
      </div>

      <div className="rounded-xl border p-3 flex items-start gap-3"
        style={{ backgroundColor: BRAND.blue + '08', borderColor: BRAND.blue + '30' }}>
        <MousePointerClick className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: BRAND.blue }} />
        <div className="text-xs text-white/80">
          <strong style={{ color: BRAND.blue }}>Tip:</strong> Selecciona el rango en Excel → Ctrl+C → clic en la celda destino aquí → Ctrl+V
        </div>
      </div>

      <div className="rounded-3xl border overflow-hidden"
        style={{ backgroundColor: '#0d1220', borderColor: BRAND.border }}>
        <div className="overflow-auto" style={{ maxHeight: '60vh' }}>
          <table className="border-collapse" style={{ minWidth: '100%' }}>
            <thead className="sticky top-0 z-20">
              <tr>
                <th className="sticky left-0 z-30 px-2 py-2 text-[10px] font-bold text-white/40 border-r border-b text-center"
                  style={{ backgroundColor: '#0d1220', borderColor: BRAND.border, minWidth: 45 }}>#</th>
                {COLUMNAS.map((col, i) => (
                  <th key={col.key}
                    className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider border-r border-b whitespace-nowrap"
                    style={{
                      backgroundColor: '#161d33', borderColor: BRAND.border,
                      minWidth: col.w, width: col.w,
                      color: i === activeCell.col ? BRAND.orange : 'rgba(255,255,255,0.6)'
                    }}>
                    {col.label}
                  </th>
                ))}
                <th className="sticky right-0 z-30 px-2 py-3 border-l border-b text-center"
                  style={{ backgroundColor: '#0d1220', borderColor: BRAND.border, minWidth: 50 }}>
                  <span className="text-[10px] font-bold text-white/40">·</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => {
                const tieneDatos = row.viajeInterno?.toString().trim() || row.coordina?.toString().trim();
                return (
                  <tr key={row.id} className="group">
                    <td className="sticky left-0 z-10 px-2 py-1 border-r border-b text-center text-[11px] font-mono"
                      style={{
                        backgroundColor: rowIdx === activeCell.row ? '#1a2240' : '#0d1220',
                        borderColor: BRAND.border,
                        color: rowIdx === activeCell.row ? BRAND.orange : tieneDatos ? BRAND.blue : 'rgba(255,255,255,0.25)',
                        fontWeight: rowIdx === activeCell.row ? 700 : 400
                      }}>{rowIdx + 1}</td>
                    {COLUMNAS.map((col, colIdx) => {
                      const isActive = rowIdx === activeCell.row && colIdx === activeCell.col;
                      const isEditingThis = editingCell?.row === rowIdx && editingCell?.col === colIdx;
                      const cellValue = row[col.key] ?? '';
                      return (
                        <td key={col.key}
                          className="border-r border-b p-0 relative"
                          style={{
                            borderColor: BRAND.border,
                            minWidth: col.w, width: col.w,
                            backgroundColor: isActive ? BRAND.orange + '15' : 'transparent',
                            outline: isActive ? `2px solid ${BRAND.orange}` : 'none', outlineOffset: '-2px'
                          }}
                          onClick={() => setActiveCell({ row: rowIdx, col: colIdx })}
                          onDoubleClick={() => setEditingCell({ row: rowIdx, col: colIdx })}>
                          {isEditingThis ? (
                            <CellEditor ref={inputRef} col={col} value={cellValue}
                              onChange={(v) => updateCell(rowIdx, col.key, v)}
                              onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                              onPaste={(e) => handlePaste(e, rowIdx, colIdx)}
                              onBlur={() => setEditingCell(null)} />
                          ) : (
                            <CellDisplay col={col} value={cellValue}
                              onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                              onPaste={(e) => handlePaste(e, rowIdx, colIdx)} />
                          )}
                        </td>
                      );
                    })}
                    <td className="sticky right-0 z-10 px-1 py-1 border-l border-b text-center"
                      style={{ backgroundColor: '#0d1220', borderColor: BRAND.border }}>
                      <button onClick={() => deleteRow(rowIdx)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center opacity-30 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                        title="Eliminar fila">
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
        style={{ backgroundColor: 'rgba(10,14,26,0.95)', borderColor: BRAND.border }}>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Shield className="w-4 h-4" style={{ color: BRAND.blue }} />
            <span className="hidden sm:inline">Solo se guardarán las <strong className="text-white">{filasConDatos}</strong> filas con datos</span>
            <span className="sm:hidden">{filasConDatos} listas</span>
          </div>
          <div className="flex gap-2">
            <button onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-sm font-medium border text-white/80 hover:bg-white/5 transition-colors"
              style={{ borderColor: BRAND.borderH }}>
              <X className="w-4 h-4 inline mr-1" /> Cancelar
            </button>
            <button onClick={handleSubmit} disabled={saving || filasConDatos === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
              style={{
                background: filasConDatos > 0 ? `linear-gradient(135deg, ${BRAND.orange}, #ff8a3d)` : '#333',
                color: filasConDatos > 0 ? 'white' : '#999',
                boxShadow: filasConDatos > 0 ? `0 8px 24px ${BRAND.orange}40` : 'none'
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

const CellDisplay = ({ col, value, onKeyDown, onPaste }) => {
  let displayValue = value;
  if (col.type === 'number' && value !== '' && !isNaN(value)) {
    displayValue = '$' + new Intl.NumberFormat('es-CO').format(Number(value));
  } else if (col.type === 'date' && value) {
    try {
      const d = new Date(value);
      if (!isNaN(d)) displayValue = d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: '2-digit' });
    } catch { }
  }

  let textColor = 'rgba(255,255,255,0.9)';
  let extraClass = '';
  if (col.key === 'estado' && value) {
    const p = { 'EN CURSO': '#f59e0b', 'FACTURADO': BRAND.blue, 'TERMINADO': '#10b981', 'CUMPLIDO': '#10b981', 'CANCELADO': '#ef4444' };
    textColor = p[value] || '#fff';
    extraClass = 'font-bold';
  } else if (col.key === 'placaRecurso' && value) { textColor = BRAND.blue; extraClass = 'font-mono font-bold'; }
  else if (col.key === 'viajeInterno' && value) extraClass = 'font-bold';
  else if (col.type === 'number' && value) { textColor = BRAND.orange; extraClass = 'font-mono'; }

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
    backgroundColor: '#1a2240', border: 'none', outline: `2px solid ${BRAND.orange}`, outlineOffset: '-2px',
    color: '#fff', fontSize: '14px', fontFamily: 'inherit'
  };
  if (col.type === 'select') {
    return (
      <select ref={ref} value={value || ''} onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown} onBlur={onBlur} onPaste={onPaste} style={{ ...baseStyle, cursor: 'pointer' }}>
        <option value=""></option>
        {col.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    );
  }
  if (col.type === 'date') {
    return (
      <input ref={ref} type="date" value={value ? value.slice(0, 10) : ''}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown} onBlur={onBlur} onPaste={onPaste} style={baseStyle} />
    );
  }
  return (
    <input ref={ref} type={col.type === 'number' ? 'number' : 'text'}
      value={value === null || value === undefined ? '' : value}
      onChange={(e) => onChange(col.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
      onKeyDown={onKeyDown} onBlur={onBlur} onPaste={onPaste} style={baseStyle} />
  );
});

// ============================================================
//  GESTIÓN DE USUARIOS
// ============================================================
function UsuariosView({ showToast, session }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const cargar = () => {
    setLoading(true);
    setUsuarios([...USUARIOS_DEMO, ...getUsuarios()]);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const handleDelete = (username) => {
    const registrados = getUsuarios();
    const actualizados = registrados.filter(u => u.username !== username);
    if (saveUsuarios(actualizados)) {
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
          <Users className="w-6 h-6" style={{ color: BRAND.orange }} />
          Gestión de Usuarios
        </h2>
        <p className="text-sm text-white/50 mt-1">Administra el acceso al sistema</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MiniKpi icon={Users} label="Total" value={usuarios.length} color={BRAND.orange} />
        <MiniKpi icon={UserPlus} label="Registrados" value={registradosCount} color={BRAND.blue} />
        <MiniKpi icon={Shield} label="Admins" value={usuarios.filter(u => u.rol === 'ADMIN').length} color="#10b981" />
      </div>

      <div className="rounded-xl border p-4 flex items-start gap-3"
        style={{ backgroundColor: BRAND.blue + '08', borderColor: BRAND.blue + '30' }}>
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: BRAND.blue }} />
        <div className="text-xs text-white/70">
          Los usuarios se registran desde la pantalla de login. Los usuarios <strong>demo</strong> son permanentes.
        </div>
      </div>

      <div className="rounded-3xl border overflow-hidden" style={{ backgroundColor: BRAND.card, borderColor: BRAND.border }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }} />
            ))}
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {usuarios.map(u => (
              <div key={u.username} className="rounded-2xl border p-4 flex items-center justify-between gap-3"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  borderColor: u.username === session.username ? BRAND.orange + '40' : BRAND.border
                }}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border"
                    style={{
                      backgroundColor: (u.rol === 'ADMIN' ? BRAND.orange : BRAND.blue) + '15',
                      borderColor: (u.rol === 'ADMIN' ? BRAND.orange : BRAND.blue) + '40'
                    }}>
                    {u.rol === 'ADMIN' ?
                      <Shield className="w-5 h-5" style={{ color: BRAND.orange }} /> :
                      <UserCog className="w-5 h-5" style={{ color: BRAND.blue }} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-white">{u.nombre}</p>
                      {u.username === session.username && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border font-bold"
                          style={{ color: BRAND.orange, borderColor: BRAND.orange + '40', backgroundColor: BRAND.orange + '15' }}>
                          TÚ
                        </span>
                      )}
                      {u.esDemo && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border font-bold text-white/60"
                          style={{ borderColor: BRAND.borderH, backgroundColor: 'rgba(255,255,255,0.03)' }}>
                          DEMO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/50">@{u.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border"
                    style={{
                      color: u.rol === 'ADMIN' ? BRAND.orange : BRAND.blue,
                      backgroundColor: (u.rol === 'ADMIN' ? BRAND.orange : BRAND.blue) + '15',
                      borderColor: (u.rol === 'ADMIN' ? BRAND.orange : BRAND.blue) + '40'
                    }}>
                    {u.rol}
                  </span>
                  {!u.esDemo && u.username !== session.username && (
                    <button onClick={() => setConfirmDelete(u.username)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center border hover:scale-110 transition-transform"
                      style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }}
                      title="Eliminar usuario">
                      <Trash2 className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmDelete && (
        <ConfirmModal title={`¿Eliminar "${confirmDelete}"?`}
          message="El usuario ya no podrá iniciar sesión"
          color="#ef4444" icon={AlertCircle}
          onCancel={() => setConfirmDelete(null)} onConfirm={() => handleDelete(confirmDelete)}
          confirmLabel="Eliminar" />
      )}
    </div>
  );
}
