// src/lib/supabase.js
// Cliente de Supabase — se activa automáticamente cuando existen
// las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
// Sin esas variables, toda la app funciona con localStorage normalmente.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const USE_SUPABASE = !!(supabaseUrl && supabaseKey);

export const supabase = USE_SUPABASE
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export default supabase;
