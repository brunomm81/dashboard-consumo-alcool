import { createClient } from '@supabase/supabase-js';

// Cliente Supabase para uso EXCLUSIVO no servidor (API routes).
// Usa a service_role key, que ignora RLS. NUNCA importar em componentes
// client ("use client") — a chave secreta jamais deve ir ao navegador.
export function getSupabaseServer() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar definidos no .env.local'
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
