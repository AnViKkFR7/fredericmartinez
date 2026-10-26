export const LEAD_PRIVACY_TEXT_VERSION = "contact-form-2026-10-26";
export const LEAD_LIMITS = { name: 120, email: 160, phone: 40, message: 4000, path: 300, campaign: 120, item: 200, referrer: 500 };
export const isUuid = (value: unknown): value is string =>
  typeof value === "string" && /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value);

export function cleanLeadText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  return value.trim().slice(0, max) || null;
}

export function parseLead(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const body = input as Record<string, unknown>;
  const name = cleanLeadText(body.name, LEAD_LIMITS.name);
  const email = cleanLeadText(body.email, LEAD_LIMITS.email);
  const phone = cleanLeadText(body.phone, LEAD_LIMITS.phone);
  if (!isUuid(body.company_id) || !name || (!email && !phone)) return null;
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return null;
  const path = cleanLeadText(body.source_path, LEAD_LIMITS.path);
  const version = cleanLeadText(body.consent_text_version, 80);
  const consent = body.consent_given === true && Boolean(version);
  return {
    company_id: body.company_id, name, email, phone,
    message: cleanLeadText(body.message, LEAD_LIMITS.message),
    source_path: path?.startsWith("/") && !path.startsWith("//") ? path.split(/[?#]/)[0] : null,
    source_campaign: cleanLeadText(body.source_campaign, LEAD_LIMITS.campaign),
    source_item: cleanLeadText(body.source_item, LEAD_LIMITS.item),
    source_referrer: cleanLeadText(body.source_referrer, LEAD_LIMITS.referrer),
    source_utm_source: cleanLeadText(body.source_utm_source, LEAD_LIMITS.campaign),
    source_utm_medium: cleanLeadText(body.source_utm_medium, LEAD_LIMITS.campaign),
    source_utm_term: cleanLeadText(body.source_utm_term, LEAD_LIMITS.campaign),
    source_utm_content: cleanLeadText(body.source_utm_content, LEAD_LIMITS.campaign),
    consent_given: consent,
    consent_text_version: consent ? version : null,
    consent_source: consent ? "public_contact_form" : null,
  };
}
