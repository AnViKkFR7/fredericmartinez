import type { ActionFunctionArgs } from "@remix-run/node";
import { createClient } from "@supabase/supabase-js";
import { COMPANY_ID } from "~/lib/company";

const ALLOWED_EVENT_TYPES = new Set(["page_view", "cta_click"]);

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const isConfigured = Boolean(supabaseUrl && serviceRoleKey);

const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  serviceRoleKey || "placeholder",
);

// Caché por invocación "caliente" de la función: evita consultar las
// definiciones de eventos en cada clic.
let definitionsCache: { keys: Set<string>; expiresAt: number } | null = null;

async function activeEventKeys(): Promise<Set<string>> {
  if (definitionsCache && definitionsCache.expiresAt > Date.now()) {
    return definitionsCache.keys;
  }
  const { data } = await supabase
    .from("analytics_event_definitions")
    .select("key")
    .eq("company_id", COMPANY_ID)
    .eq("is_active", true);
  const keys = new Set((data ?? []).map((d) => d.key as string));
  definitionsCache = { keys, expiresAt: Date.now() + 5 * 60 * 1000 };
  return keys;
}

interface TrackPayload {
  event_type?: string;
  event_key?: string;
  path?: string;
  session_id?: string;
}

export async function action({ request }: ActionFunctionArgs) {
  if (!isConfigured) return new Response("Not configured", { status: 500 });

  let body: TrackPayload;
  try {
    body = await request.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const { event_type, event_key, path, session_id } = body;
  if (!event_type || !ALLOWED_EVENT_TYPES.has(event_type) || !session_id) {
    return new Response("Bad request", { status: 400 });
  }

  // Un clic cuya clave no esté dada de alta (o esté desactivada) en el panel de
  // admin se descarta en silencio: nunca da error al visitante.
  if (event_type === "cta_click") {
    if (!event_key) return new Response("Bad request", { status: 400 });
    const keys = await activeEventKeys();
    if (!keys.has(event_key)) return new Response(null, { status: 204 });
  }

  // Geolocalización ya resuelta por la CDN de Vercel, sin servicios externos.
  const country = request.headers.get("x-vercel-ip-country");
  const region = request.headers.get("x-vercel-ip-country-region");
  const city = request.headers.get("x-vercel-ip-city");

  const ua = request.headers.get("user-agent") ?? "";
  const device = /mobile/i.test(ua) ? "mobile" : /tablet|ipad/i.test(ua) ? "tablet" : "desktop";

  const { error } = await supabase.from("analytics_events").insert({
    company_id: COMPANY_ID,
    event_type,
    event_key: event_type === "cta_click" ? event_key : null,
    path,
    session_id,
    device,
    country,
    region,
    city,
  });

  if (error) {
    console.error("[analytics] insert error:", error.message);
    return new Response("Error", { status: 500 });
  }
  return new Response(null, { status: 204 });
}
