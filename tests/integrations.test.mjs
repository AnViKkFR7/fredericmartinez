import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { buildSync } from "esbuild";

const require = createRequire(import.meta.url);
const COMPANY = "40e02f2e-8863-4d3a-9bc8-352223d9aab0";
function load(entry, prod = true) {
  const { outputFiles } = buildSync({
    entryPoints: [entry], bundle: true, write: false, format: "cjs", platform: "node",
    packages: "external", alias: { "~": "./app" }, define: { "import.meta.env.PROD": String(prod), "import.meta.env.VITE_COMPANY_ID": JSON.stringify(COMPANY) },
  });
  const module = { exports: {} };
  new Function("require", "module", "exports", outputFiles[0].text)(require, module, module.exports);
  return module.exports;
}
const core = load("app/lib/trackCore.ts");
const leadCore = load("app/lib/leadCore.ts");
const saved = new Map(["window", "document", "navigator", "localStorage", "requestAnimationFrame", "fetch", "performance"].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
const originalEnv = { ...process.env };
afterEach(() => {
  for (const [key, descriptor] of saved) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else delete globalThis[key];
  }
  process.env = { ...originalEnv };
});
function browser() {
  const sent = [], events = [], storage = new Map();
  const win = Object.assign(new EventTarget(), {
    location: { pathname: "/servicios", search: "?utm_source=Google&utm_campaign=otoño", host: "example.com" },
    innerHeight: 800, scrollY: 0,
  });
  const doc = Object.assign(new EventTarget(), { visibilityState: "visible", referrer: "https://google.com/search?q=private", documentElement: { scrollHeight: 3000 } });
  const nav = { language: "es-ES", globalPrivacyControl: false, sendBeacon: (_url, blob) => { sent.push(blob); return true; } };
  for (const [key, value] of Object.entries({ window: win, document: doc, navigator: nav, localStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) }, requestAnimationFrame: (fn) => { fn(); return 1; } })) {
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  win.addEventListener("moira:lead-sent", () => events.push("lead"));
  return { win, doc, nav, sent, events, storage, payloads: () => Promise.all(sent.map(async (blob) => JSON.parse(await blob.text()))) };
}

test("tracking strips query, UUID and long identifiers; excludes internal routes", () => {
  assert.equal(core.normalizePath(`/pedido/${COMPANY}?email=personal#x`), "/pedido/:id");
  assert.equal(core.normalizePath("/pedido/12345678"), "/pedido/:token");
  assert.equal(core.parseTrackPayload({ company_id: COMPANY, event_type: "page_view", path: "/ADMIN/test" }), null);
  assert.equal(core.referrerHost("https://www.google.com/search?q=private", "example.com"), "google.com");
  assert.equal(core.referrerHost("https://checkout.stripe.com/pay", "example.com"), undefined);
});
test("reserved conversions are accepted without registration; custom keys require registration", () => {
  for (const key of ["phone_click", "email_click", "form_submit"]) assert.ok(core.isEventKeyAllowed(key, new Set()));
  assert.equal(core.isEventKeyAllowed("whatsapp_click", new Set()), false);
});
test("visitor hash rotates daily and never exposes IP", async () => {
  const a = await core.visitorHash("secret", "2026-10-24", "192.0.2.1", "Browser");
  assert.match(a, /^[a-f0-9]{24}$/);
  assert.equal(a, await core.visitorHash("secret", "2026-10-24", "192.0.2.1", "Browser"));
  assert.notEqual(a, await core.visitorHash("secret", "2026-10-25", "192.0.2.1", "Browser"));
});
test("scroll and engagement validation reject garbage and cap time", () => {
  const base = { company_id: COMPANY, path: "/" };
  assert.equal(core.parseTrackPayload({ ...base, event_type: "scroll_depth", value: 101 }), null);
  assert.equal(core.parseTrackPayload({ ...base, event_type: "engagement", value: -1 }), null);
  assert.equal(core.parseTrackPayload({ ...base, event_type: "engagement", value: 99999 }).value, 7200);
});
test("lead validation requires name and one contact method, trims limits", () => {
  assert.equal(leadCore.parseLead({ company_id: COMPANY, name: "Ana" }), null);
  assert.equal(leadCore.parseLead({ company_id: COMPANY, name: "Ana", email: "bad" }), null);
  const lead = leadCore.parseLead({ company_id: COMPANY, name: "x".repeat(200), phone: "123", message: "x".repeat(5000), source_path: "/servicios?email=private" });
  assert.equal(lead.name.length, 120);
  assert.equal(lead.message.length, 4000);
  assert.equal(lead.source_path, "/servicios");
});
test("consent expires, is versioned, persists choices and respects GPC", () => {
  const { nav, storage } = browser();
  const consent = load("app/lib/consent.ts");
  assert.equal(consent.measurementAllowed(null), true);
  let stored = consent.writeConsent({ measurement: false, analytics: false, marketing: false });
  assert.equal(consent.measurementAllowed(consent.readConsent()), false);
  stored = consent.writeConsent({ measurement: true, analytics: false, marketing: false });
  nav.globalPrivacyControl = true;
  assert.equal(consent.measurementAllowed(stored), false);
  storage.set("moira.consent.v1", JSON.stringify({ ...stored, version: 0 }));
  assert.equal(consent.readConsent(), null);
  storage.set("moira.consent.v1", JSON.stringify({ ...stored, decidedAt: "2020-01-01" }));
  assert.equal(consent.readConsent(), null);
});
test("consent works with blocked localStorage", () => {
  browser();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, get() { throw new Error("blocked"); } });
  const consent = load("app/lib/consent.ts");
  assert.equal(consent.readConsent(), null);
  consent.writeConsent({ measurement: false, analytics: false, marketing: false });
  assert.equal(consent.readConsent().measurement, false);
});
test("auto tracking is idempotent; pageviews and 404 do not duplicate in StrictMode", async () => {
  const b = browser();
  const analytics = load("app/lib/analytics.ts");
  analytics.initAutoTracking(); analytics.initAutoTracking();
  analytics.trackPageview("/servicios", "first"); analytics.trackPageview("/servicios", "first");
  analytics.trackNotFound("first"); analytics.trackNotFound("first");
  b.win.dispatchEvent(new Event("moira:lead-sent"));
  const payloads = await b.payloads();
  assert.deepEqual(payloads.map((p) => p.event_type), ["page_view", "not_found", "cta_click"]);
  assert.equal(payloads[0].referrer, "google.com");
  assert.equal(payloads[2].event_key, "form_submit");
  assert.ok(payloads.every((p) => !("session_id" in p)));
});
test("development and GPC never send tracking", () => {
  let b = browser();
  let a = load("app/lib/analytics.ts", false); a.initAutoTracking(); a.trackPageview();
  assert.equal(b.sent.length, 0);
  b = browser(); b.nav.globalPrivacyControl = true;
  a = load("app/lib/analytics.ts"); a.initAutoTracking(); a.trackPageview(); a.trackEvent("form_submit");
  assert.equal(b.sent.length, 0);
});
test("opposition immediately stops events and does not count rejected time on re-enable", async () => {
  const b = browser(); let now = 0;
  Object.defineProperty(globalThis, "performance", { configurable: true, value: { now: () => now } });
  const a = load("app/lib/analytics.ts"); a.initAutoTracking(); a.trackPageview();
  now = 5000; a.setMeasurement(false); now = 15000; a.trackEvent("phone_click");
  a.setMeasurement(true); now = 17000; b.win.dispatchEvent(new Event("pagehide"));
  const payloads = await b.payloads();
  assert.equal(payloads.filter((p) => p.event_type === "cta_click").length, 0);
  assert.deepEqual(payloads.filter((p) => p.event_type === "engagement").map((p) => p.value), [2]);
});
test("scroll thresholds fire once per page; short pages are ignored", async () => {
  const b = browser(), a = load("app/lib/analytics.ts"); a.initAutoTracking(); a.trackPageview();
  b.win.scrollY = 2200; b.win.dispatchEvent(new Event("scroll")); b.win.dispatchEvent(new Event("scroll"));
  assert.deepEqual((await b.payloads()).filter((p) => p.event_type === "scroll_depth").map((p) => p.value), [25, 50, 75, 100]);
  a.trackPageview("/corta", "second"); b.doc.documentElement.scrollHeight = 900; b.win.dispatchEvent(new Event("scroll"));
  assert.equal((await b.payloads()).filter((p) => p.path === "/corta" && p.event_type === "scroll_depth").length, 0);
});
test("submitLead fires a conversion only for 201, never for honeypot/errors/network", async () => {
  const b = browser(); const leads = load("app/lib/leads.ts");
  const input = { name: "Ana", email: "ana@example.com", privacy: true };
  let submitted;
  globalThis.fetch = async (_url, init) => { submitted = JSON.parse(init.body); return new Response(null, { status: 201 }); };
  assert.equal((await leads.submitLead(input)).ok, true);
  assert.equal(submitted.source_path, "/servicios"); assert.equal(submitted.source_campaign, "otoño");
  for (const status of [200, 400, 500]) {
    globalThis.fetch = async () => new Response(null, { status });
    await leads.submitLead(input);
  }
  globalThis.fetch = async () => { throw new Error("offline"); };
  assert.equal((await leads.submitLead(input)).reason, "network");
  assert.equal(b.events.length, 1);
});

function server() {
  process.env.SUPABASE_URL = "https://database.example.com";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "server-only-test-key";
  process.env.ANALYTICS_SALT = "test-salt";
  process.env.VITE_COMPANY_ID = COMPANY;
  delete process.env.SMTP_HOST;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), body: init?.body ? JSON.parse(init.body) : null });
    return String(url).includes("rpc/analytics_salt")
      ? new Response(JSON.stringify("daily-test-salt"), { headers: { "content-type": "application/json" } })
      : new Response(null, { status: 201 });
  };
  return calls;
}
function request(body, headers = {}) {
  return new Request("https://example.com/api/lead", {
    method: "POST", headers: { "content-type": "application/json", "sec-fetch-site": "same-origin", "user-agent": "Mozilla/5.0 Safari/604.1", ...headers },
    body: JSON.stringify(body),
  });
}
test("lead endpoint stores only allowed columns and returns 201 after persistence", async () => {
  const calls = server(); const { action } = load("app/routes/api.lead.ts");
  const response = await action({ request: request({ company_id: COMPANY, name: "Ana", phone: "123", privacy: true, status: "closed", source_path: "/servicios", source_campaign: "otoño" }) });
  assert.equal(response.status, 201); assert.equal(calls.length, 1);
  assert.match(calls[0].url, /\/rest\/v1\/lead$/);
  assert.equal(calls[0].body.company_id, COMPANY); assert.equal(calls[0].body.status, undefined);
  assert.equal(calls[0].body.source_campaign, "otoño");
});
test("lead endpoint rejects invalid input, missing privacy, foreign company and cross-origin", async () => {
  const calls = server(); const { action } = load("app/routes/api.lead.ts");
  const base = { company_id: COMPANY, name: "Ana", email: "ana@example.com", privacy: true };
  for (const patch of [{ company_id: "0aad4a59-d6ee-47c9-bb9e-da5e2bb3fb48" }, { privacy: false }, { email: "invalid" }, { name: "" }]) {
    assert.equal((await action({ request: request({ ...base, ...patch }) })).status, 400);
  }
  assert.equal((await action({ request: request(base, { "sec-fetch-site": "cross-site" }) })).status, 403);
  assert.equal((await action({ request: request(null) })).status, 400);
  assert.equal(calls.length, 0);
});
test("honeypot pretends success without saving; missing config and database errors never pretend success", async () => {
  const calls = server(); const { action } = load("app/routes/api.lead.ts");
  const base = { company_id: COMPANY, name: "Ana", email: "ana@example.com", privacy: true };
  assert.equal((await action({ request: request({ ...base, company_website: "bot" }) })).status, 200);
  assert.equal(calls.length, 0);
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  assert.equal((await action({ request: request(base) })).status, 503);
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
  globalThis.fetch = async () => new Response(JSON.stringify({ code: "TEST_ERROR" }), { status: 500 });
  assert.equal((await action({ request: request(base) })).status, 500);
});
test("tracking endpoint uses server-derived visitor and device, never trusts client identity", async () => {
  const calls = server(), { action } = load("app/routes/api.track.ts");
  const response = await action({ request: request({ company_id: COMPANY, event_type: "cta_click", event_key: "form_submit", path: "/contacto?private=x", visitor: "forged", device: "forged" }, { "x-real-ip": "192.0.2.1", "x-vercel-ip-country": "ES" }) });
  assert.equal(response.status, 204);
  const insert = calls.find((c) => c.url.includes("analytics_events"));
  assert.ok(insert); assert.match(insert.body.visitor, /^[a-f0-9]{24}$/);
  assert.equal(insert.body.device, "desktop"); assert.equal(insert.body.country, "ES");
  assert.equal(insert.body.path, "/contacto"); assert.ok(!JSON.stringify(insert.body).includes("192.0.2.1"));
  assert.equal(calls.filter((c) => c.url.includes("definitions")).length, 0);
});
test("tracking silently discards bots, GPC, cross-origin, other company, malformed JSON and missing config", async () => {
  const calls = server(), { action } = load("app/routes/api.track.ts");
  const base = { company_id: COMPANY, event_type: "page_view", path: "/" };
  for (const headers of [{ "user-agent": "Googlebot" }, { "sec-gpc": "1" }, { "sec-fetch-site": "cross-site" }]) {
    assert.equal((await action({ request: request(base, headers) })).status, 204);
  }
  await action({ request: request({ ...base, company_id: "0aad4a59-d6ee-47c9-bb9e-da5e2bb3fb48" }) });
  await action({ request: new Request("https://example.com/api/track", { method: "POST", headers: { "sec-fetch-site": "same-origin", "user-agent": "Mozilla/5.0" }, body: "bad json" }) });
  delete process.env.ANALYTICS_SALT;
  await action({ request: request(base) });
  assert.equal(calls.length, 0);
});
test("endpoints reject GET and other methods", async () => {
  for (const file of ["app/routes/api.lead.ts", "app/routes/api.track.ts"]) {
    const route = load(file);
    assert.equal(route.loader().status, 405);
    assert.equal((await route.action({ request: new Request("https://example.com", { method: "PUT" }) })).status, 405);
  }
});
