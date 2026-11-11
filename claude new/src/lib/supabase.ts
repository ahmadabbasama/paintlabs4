import { createClient } from '@supabase/supabase-js';

// Live Paint Labs Supabase project.
// The publishable key is designed to be shipped in browser code; what it can do
// is controlled entirely by Row Level Security policies in the dashboard
// (see supabase/schema.sql). Never put a secret / service_role key here.
const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  'https://eaacfwsxzxtporpfppbm.supabase.co';

const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  'sb_publishable_EX0IkirLxxTWMD_nCr69lQ_iiy-c00P';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
