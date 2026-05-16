// src/lib/db.js
// Capa de acceso a datos que funciona con localStorage O Supabase.
// Si VITE_SUPABASE_URL está configurado → Supabase.
// De lo contrario → localStorage (sin cambiar nada más en el código).

import { supabase, USE_SUPABASE } from './supabase.js';

// ─── Helpers localStorage ─────────────────────────────────────────────
const ls = {
  get:    (key)        => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; } },
  set:    (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } },
  remove: (key)        => { try { localStorage.removeItem(key); return true; } catch { return false; } }
};

// ─── SESIÓN ───────────────────────────────────────────────────────────
export const session = {
  get: async () => {
    if (USE_SUPABASE) {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    }
    const s = ls.get('alotrans:session');
    if (!s) return null;
    // Expirar sesiones de más de 8 horas
    if (Date.now() - new Date(s.loginAt).getTime() > 8 * 3600000) {
      ls.remove('alotrans:session');
      return null;
    }
    return s;
  },
  set: async (sess) => {
    if (USE_SUPABASE) return; // Supabase auth maneja la sesión
    ls.set('alotrans:session', sess);
  },
  remove: async () => {
    if (USE_SUPABASE) await supabase.auth.signOut();
    else ls.remove('alotrans:session');
  }
};

// ─── USUARIOS ─────────────────────────────────────────────────────────
export const users = {
  getAll: async () => {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('usuarios').select('*').order('creado_en');
      if (error) throw error;
      return data || [];
    }
    return ls.get('alotrans:usuarios') || [];
  },

  findByUsername: async (username) => {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .ilike('username', username)
        .single();
      if (error) return null;
      return data;
    }
    const lista = ls.get('alotrans:usuarios') || [];
    return lista.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
  },

  create: async (user) => {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('usuarios').insert([user]).select().single();
      if (error) throw error;
      return data;
    }
    const lista = ls.get('alotrans:usuarios') || [];
    lista.push(user);
    ls.set('alotrans:usuarios', lista);
    return user;
  },

  delete: async (username) => {
    if (USE_SUPABASE) {
      const { error } = await supabase.from('usuarios').delete().eq('username', username);
      if (error) throw error;
      return true;
    }
    const lista = (ls.get('alotrans:usuarios') || []).filter(u => u.username !== username);
    ls.set('alotrans:usuarios', lista);
    return true;
  }
};

// ─── SERVICIOS ────────────────────────────────────────────────────────
export const servicios = {
  getAll: async () => {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('servicios')
        .select('*')
        .order('creado_en', { ascending: false });
      if (error) throw error;
      return data || [];
    }
    return ls.get('alotrans:servicios') || [];
  },

  upsertMany: async (rows) => {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('servicios').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      return data;
    }
    ls.set('alotrans:servicios', rows);
    return rows;
  },

  delete: async (id) => {
    if (USE_SUPABASE) {
      const { error } = await supabase.from('servicios').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
    const lista = (ls.get('alotrans:servicios') || []).filter(s => s.id !== id);
    ls.set('alotrans:servicios', lista);
    return true;
  }
};

export const db = { session, users, servicios };
export default db;
