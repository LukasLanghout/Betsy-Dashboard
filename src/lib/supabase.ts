import { createClient } from '@supabase/supabase-js';

// Gebruik tijdelijke placeholders als de environment variabelen nog niet zijn ingesteld,
// zodat de app niet direct crasht met "supabaseUrl is required".
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Exporteer een check om te zien of de configuratie daadwerkelijk is ingevuld
export const hasSupabaseConfig = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
