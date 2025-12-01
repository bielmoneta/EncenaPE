import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const SUPABASE_URL = `https://${projectId}.supabase.co`;

// Cliente Supabase único para toda a aplicação
export const supabase = createClient(SUPABASE_URL, publicAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Desabilitar confirmação de email para permitir cadastro sem verificação
    autoConfirm: false,
  }
});