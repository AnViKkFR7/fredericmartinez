import type { ActionFunctionArgs } from "@remix-run/node";
import { integrationCompanyId, integrationDatabase, methodNotAllowed } from "~/lib/integrations.server";
import {
  businessDay, deviceFromUa, geoFromHeaders, isBot, isEventKeyAllowed,
  isReservedEventKey, isSameOrigin, parseTrackPayload, visitorHash,
} from "~/lib/trackCore";

const noContent = () => new Response(null, { status: 204 });
let definitionsCache: { companyId: string; keys: Set<string>; expiresAt: number } | null = null;
let saltCache: { day: string; salt: string } | null = null;
export const loader = methodNotAllowed;

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") return methodNotAllowed();
  const get = (header: string) => request.headers.get(header);
  const ua = get("user-agent") ?? "";
  if (get("sec-gpc") === "1" || isBot(ua) || !isSameOrigin(get)) return noContent();
  if (!process.env.ANALYTICS_SALT) return noContent();
  try {
    const db = integrationDatabase();
    if (!db) return noContent();
    const raw = await request.text();
    if (raw.length > 4000) return noContent();
    const payload = parseTrackPayload(JSON.parse(raw), { ownHost: new URL(request.url).host });
    // Bind this endpoint to this company, even with a service-role key.
    if (!payload || payload.company_id !== integrationCompanyId()) return noContent();
    if (payload.event_type === "cta_click" && !isReservedEventKey(payload.event_key!)) {
      if (definitionsCache?.companyId !== payload.company_id || definitionsCache.expiresAt <= Date.now()) {
        const { data, error } = await db.from("analytics_event_definitions").select("key")
          .eq("company_id", payload.company_id).eq("is_active", true);
        if (error) return noContent();
        definitionsCache = {
          companyId: payload.company_id,
          keys: new Set((data ?? []).map((row) => row.key as string)),
          expiresAt: Date.now() + 300_000,
        };
      }
      if (!isEventKeyAllowed(payload.event_key!, definitionsCache.keys)) return noContent();
    }
    const day = businessDay(new Date());
    if (saltCache?.day !== day) {
      const { data, error } = await db.rpc("analytics_salt", { p_day: day });
      if (error || typeof data !== "string" || !data) return noContent();
      saltCache = { day, salt: data };
    }
    const ip = get("x-real-ip") ?? get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
    const visitor = await visitorHash(`${saltCache.salt}:${process.env.ANALYTICS_SALT}`, day, ip, ua);
    const { error } = await db.from("analytics_events").insert({
      company_id: payload.company_id, event_type: payload.event_type,
      event_key: payload.event_key ?? null, value: payload.value ?? null,
      path: payload.path ?? null, visitor, device: deviceFromUa(ua), ...geoFromHeaders(get),
      lang: payload.lang ?? null, referrer: payload.referrer ?? null,
      utm_source: payload.utm_source ?? null, utm_medium: payload.utm_medium ?? null,
      utm_campaign: payload.utm_campaign ?? null,
    });
    if (error) console.error("[track] insert failed", error.code);
  } catch {
    console.error("[track] measurement unavailable");
  }
  return noContent();
}
