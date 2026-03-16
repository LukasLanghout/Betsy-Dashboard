import { createClient } from '@supabase/supabase-js';

// Zorg ervoor dat je deze variabelen toevoegt aan je .env bestand
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
