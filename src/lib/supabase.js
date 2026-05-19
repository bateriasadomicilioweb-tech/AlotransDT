import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON;

export const USE_SUPABASE = !!(supabaseUrl && supabaseKey);

export const supabase = USE_SUPABASE
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export default supabase;
