import { createClient } from "@supabase/supabase-js";

// Separate from the public content client: never expose the service role key.
export function integrationDatabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export const integrationCompanyId = () =>
  process.env.VITE_COMPANY_ID || "40e02f2e-8863-4d3a-9bc8-352223d9aab0";

export const methodNotAllowed = () =>
  new Response(null, { status: 405, headers: { Allow: "POST" } });
