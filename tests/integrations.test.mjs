import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { buildSync } from "esbuild";

const require = createRequire(import.meta.url);
const COMPANY = "40e02f2e-8863-4d3a-9bc8-352223d9aab0";
function load(entry, prod = true) {
  const { outputFiles } = buildSync({
    entryPoints: [entry], bundle: true, write: false, format: "cjs", platform: "node",
    packages: entry.endsWith("BlogBody.tsx") ? undefined : "external", external: ["react", "react/*"], alias: { "~": "./app" }, define: { "import.meta.env.PROD": String(prod), "import.meta.env.VITE_COMPANY_ID": JSON.stringify(COMPANY) },
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
  const input = { name: "Ana", email: "ana@example.com", consent_given: true, consent_text_version: "test-v1" };
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
      : String(url).includes("/companies?")
        ? new Response(JSON.stringify({ id: COMPANY }), { headers: { "content-type": "application/json" } })
        : String(url).includes("/company_modules?")
          ? new Response("null", { headers: { "content-type": "application/json" } })
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
  const response = await action({ request: request({ company_id: COMPANY, name: "Ana", phone: "123", consent_given: true, consent_text_version: "test-v1", status: "closed", source_path: "/servicios", source_campaign: "otoño" }) });
  assert.equal(response.status, 201); assert.equal(calls.length, 3);
  assert.match(calls[2].url, /\/rest\/v1\/lead$/);
  assert.equal(calls[2].body.company_id, COMPANY); assert.equal(calls[2].body.status, undefined);
  assert.equal(calls[2].body.source_campaign, "otoño");
});
test("lead endpoint rejects invalid input, foreign company and cross-origin", async () => {
  const calls = server(); const { action } = load("app/routes/api.lead.ts");
  const base = { company_id: COMPANY, name: "Ana", email: "ana@example.com", consent_given: true, consent_text_version: "test-v1" };
  for (const patch of [{ company_id: "0aad4a59-d6ee-47c9-bb9e-da5e2bb3fb48" }, { email: "invalid" }, { name: "" }]) {
    assert.equal((await action({ request: request({ ...base, ...patch }) })).status, 400);
  }
  assert.equal((await action({ request: request(base, { "sec-fetch-site": "cross-site" }) })).status, 403);
  assert.equal((await action({ request: request(null) })).status, 400);
  assert.equal(calls.length, 0);
});
test("honeypot pretends success without saving; missing config and database errors never pretend success", async () => {
  const calls = server(); const { action } = load("app/routes/api.lead.ts");
  const base = { company_id: COMPANY, name: "Ana", email: "ana@example.com", consent_given: true, consent_text_version: "test-v1" };
  assert.equal((await action({ request: request({ ...base, company_website: "bot" }) })).status, 200);
  assert.equal(calls.length, 0);
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  assert.equal((await action({ request: request(base) })).status, 503);
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
  const dbFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => String(url).endsWith("/lead")
    ? new Response(JSON.stringify({ code: "TEST_ERROR" }), { status: 500 })
    : dbFetch(url, init);
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

test("lead records complete attribution and explicit versioned consent", async () => {
  const calls = server(), { action } = load("app/routes/api.lead.ts");
  await action({ request: request({ company_id: COMPANY, name: "Ana", phone: "123", source_item: "Diseño · diseno", source_campaign: "otoño", source_referrer: "https://example.org/", source_utm_source: "google", source_utm_medium: "cpc", source_utm_term: "diseño", source_utm_content: "banner", consent_given: true, consent_text_version: "test-v2", consent_at: "forged", contact_id: "forged" }) });
  const lead = calls.find((call) => call.url.endsWith("/lead")).body;
  assert.equal(lead.source_item, "Diseño · diseno");
  assert.equal(lead.source_utm_content, "banner");
  assert.equal(lead.source_utm_term, "diseño");
  assert.equal(lead.source_referrer, "https://example.org/");
  assert.equal(lead.consent_given, true);
  assert.equal(lead.consent_source, "public_contact_form");
  assert.equal(lead.consent_text_version, "test-v2");
  assert.ok(Number.isFinite(new Date(lead.consent_at).getTime()));
  assert.equal(lead.contact_id, undefined);
});
test("lead accepts unconsented enquiries and never invents consent without a text version", async () => {
  for (const consent of [{ consent_given: false, consent_text_version: "test-v2" }, { consent_given: true }, {}]) {
    const calls = server(), { action } = load("app/routes/api.lead.ts");
    const response = await action({ request: request({ company_id: COMPANY, name: "Ana", email: "ana@example.com", ...consent }) });
    assert.equal(response.status, 201);
    const lead = calls.find((call) => call.url.endsWith("/lead")).body;
    assert.equal(lead.consent_given, false); assert.equal(lead.consent_at, null);
    assert.equal(lead.consent_text_version, null); assert.equal(lead.consent_source, null);
  }
});
test("lead refuses disabled CRM and invalid or absent deployment company", async () => {
  const calls = server(), { action } = load("app/routes/api.lead.ts");
  const dbFetch = globalThis.fetch;
  globalThis.fetch = (url, init) => String(url).includes("/company_modules?")
    ? new Response(JSON.stringify({ is_enabled: false }), { headers: { "content-type": "application/json" } }) : dbFetch(url, init);
  const input = { company_id: COMPANY, name: "Ana", phone: "123" };
  assert.equal((await action({ request: request(input) })).status, 503);
  assert.equal(calls.some((call) => call.url.endsWith("/lead")), false);
  for (const value of ["", "invalid"]) {
    process.env.VITE_COMPANY_ID = value;
    assert.equal((await action({ request: request(input) })).status, 503);
  }
});
test("legacy URL-encoded contact endpoint records only explicitly versioned consent", async () => {
  const calls = server(), { action } = load("app/routes/contact.tsx");
  const response = await action({ request: new Request("https://example.com/contact", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded", "sec-fetch-site": "same-origin" },
    body: new URLSearchParams({ nombre: "Ana", email: "ana@example.com", mensaje: "Consulta", consent_given: "on", consent_text_version: "test-v3" }),
  }) });
  assert.equal(response.status, 201);
  const lead = calls.find((call) => call.url.endsWith("/lead")).body;
  assert.equal(lead.consent_given, true); assert.equal(lead.consent_text_version, "test-v3");
});
test("lead client sends five UTM fields, referrer and item, including an unchecked consent box", async () => {
  const b = browser(); b.win.location.search = "?utm_source=google&utm_medium=cpc&utm_campaign=otoño&utm_term=web&utm_content=banner";
  let body;
  globalThis.fetch = async (_url, init) => { body = JSON.parse(init.body); return new Response(null, { status: 201 }); };
  const leads = load("app/lib/leads.ts");
  assert.equal((await leads.submitLead({ name: "Ana", phone: "123", source_item: "Ficha", consent_given: false })).ok, true);
  assert.equal(body.source_campaign, "otoño"); assert.equal(body.source_utm_term, "web");
  assert.equal(body.source_utm_content, "banner"); assert.equal(body.source_utm_medium, "cpc");
  assert.equal(body.source_utm_source, "google"); assert.equal(body.source_item, "Ficha");
  assert.equal(body.source_referrer, b.doc.referrer); assert.equal(body.consent_given, false);
});

function blogDatabase({ posts, media = [], failTable } = {}) {
  process.env.VITE_SUPABASE_URL = "https://public.example.com";
  process.env.VITE_SUPABASE_ANON_KEY = "public-anon-test-key";
  process.env.PUBLIC_SITE_URL = "https://frederic.example.com";
  const calls = [];
  globalThis.fetch = async (input, init) => {
    const url = new URL(input); calls.push({ url, headers: init?.headers });
    const table = url.pathname.split("/").pop();
    if (table === failTable) return new Response(JSON.stringify({ code: "TEST_ERROR" }), { status: 400 });
    let rows = [...(table === "blog_posts" ? posts ?? [] : media)];
    for (const field of ["company_id", "status", "file_type"]) {
      const filter = url.searchParams.get(field);
      if (filter?.startsWith("eq.")) rows = rows.filter((row) => row[field] === filter.slice(3));
    }
    const ids = url.searchParams.get("post_id");
    if (ids) rows = rows.filter((row) => ids.includes(row.post_id));
    const slug = url.searchParams.get("slug");
    if (slug?.startsWith("ilike.")) rows = rows.filter((row) => row.slug?.toLowerCase() === slug.slice(6).toLowerCase());
    else if (slug === "not.is.null") rows = rows.filter((row) => row.slug !== null);
    const offset = Number(url.searchParams.get("offset") ?? 0), limit = Number(url.searchParams.get("limit") ?? rows.length);
    rows = rows.slice(offset, offset + limit);
    const single = String(new Headers(init?.headers).get("accept")).includes("object+json");
    return new Response(JSON.stringify(single ? rows[0] ?? null : rows), { headers: { "content-type": "application/json" } });
  };
  return calls;
}
const postFixture = (overrides = {}) => ({
  id: "post-1", company_id: COMPANY, status: "published", slug: "mi-articulo", title: "Mi artículo",
  heading: "Una mirada", intro: "Introducción", body: "## Contenido\n\nTexto público.",
  seo_title: null, seo_description: null, seo_og_image_url: null,
  published_at: "2026-10-25T10:00:00Z", updated_at: "2026-10-26T10:00:00Z", created_at: "2026-10-24T10:00:00Z",
  ...overrides,
});
test("blog audit identifies old missing slugs, invalid slugs and case-insensitive duplicates", () => {
  const blog = load("app/lib/blog.ts");
  assert.deepEqual(blog.auditBlogSlugs([{ id: "1", slug: null }, { id: "2", slug: "ruta invalida" }, { id: "3", slug: "hola" }, { id: "4", slug: "HOLA" }]).map((issue) => issue.issue), ["invalid_slug", "invalid_slug", "duplicate_slug"]);
});
test("blog lists only this company's published posts, and only their ordered images", async () => {
  const calls = blogDatabase({ posts: [postFixture(), postFixture({ id: "draft", status: "draft" }), postFixture({ id: "other", company_id: "another" })], media: [{ id: "cover", post_id: "post-1", file_type: "image", url_externa: "https://images.example.com/cover.jpg", alt_text: "Una imagen", is_cover_image: true }, { id: "private", post_id: "draft", file_type: "image" }, { id: "video", post_id: "post-1", file_type: "video" }] });
  const blog = load("app/lib/blog.server.ts"), result = await blog.getBlogPage(1);
  assert.equal(result.posts.length, 1); assert.equal(result.posts[0].media.length, 1);
  assert.equal(result.posts[0].cover.alt_text, "Una imagen");
  for (const call of calls.filter((call) => call.url.pathname.endsWith("blog_posts"))) {
    assert.equal(call.url.searchParams.get("company_id"), `eq.${COMPANY}`);
    assert.equal(call.url.searchParams.get("status"), "eq.published");
  }
  const media = calls.find((call) => call.url.pathname.endsWith("blog_media")).url;
  assert.equal(media.searchParams.get("post_id"), "in.(post-1)");
  assert.equal(media.searchParams.get("order"), "sort_order.asc,id.asc");
});
test("blog returns 404 for missing, draft, archived and other-company posts", async () => {
  blogDatabase({ posts: [postFixture({ status: "draft" }), postFixture({ id: "archive", slug: "archive", status: "archived" }), postFixture({ id: "other", slug: "otro", company_id: "another" })] });
  const blog = load("app/lib/blog.server.ts");
  for (const slug of ["mi-articulo", "archive", "otro", "no-existe", "bad_slug"]) {
    await assert.rejects(blog.getBlogPost(slug), (error) => error.status === 404);
  }
});
test("blog pagination has a real empty state and rejects out-of-range pages", async () => {
  blogDatabase({ posts: [] });
  const blog = load("app/lib/blog.server.ts");
  assert.deepEqual((await blog.getBlogPage(1)).posts, []);
  await assert.rejects(blog.getBlogPage(2), (error) => error.status === 404);
  blogDatabase({ posts: Array.from({ length: 13 }, (_, i) => postFixture({ id: `p${i}`, slug: `articulo-${i}` })) });
  const page = await blog.getBlogPage(2);
  assert.equal(page.pageCount, 2); assert.equal(page.posts.length, 1);
});
test("blog errors and preflight failures never masquerade as empty content", async () => {
  const blog = load("app/lib/blog.server.ts");
  for (const options of [{ failTable: "blog_posts" }, { posts: [postFixture({ slug: null })] }, { posts: [postFixture()], failTable: "blog_media" }]) {
    blogDatabase(options);
    await assert.rejects(blog.getBlogPage(1), (error) => error.status === 503);
  }
});
test("blog SEO uses configured canonical domain, fallbacks and HTTPS image only; sitemap excludes non-public content", async () => {
  blogDatabase({ posts: [postFixture(), postFixture({ id: "draft", status: "draft", slug: "borrador" })] });
  const blog = load("app/lib/blog.ts"), server = load("app/lib/blog.server.ts");
  const post = { ...postFixture(), media: [], cover: { url_externa: "https://images.example.com/cover.jpg" } };
  const meta = blog.blogMeta(post, "https://canonical.example.com");
  assert.equal(meta.find((m) => m.rel === "canonical").href, "https://canonical.example.com/blog/mi-articulo");
  assert.equal(meta.find((m) => m.property === "og:image").content, post.cover.url_externa);
  assert.equal(blog.blogMeta({ ...post, cover: null, seo_og_image_url: "http://unsafe/image" }, "https://canonical.example.com").some((m) => m.property === "og:image"), false);
  const sitemap = blog.blogSitemap(server.publicSiteUrl(), await server.publishedBlogIndex());
  assert.ok(sitemap.includes("https://frederic.example.com/blog/mi-articulo"));
  assert.ok(!sitemap.includes("borrador"));
});
test("Markdown drops embedded HTML and unsafe links while keeping readable content", () => {
  const { renderToStaticMarkup } = require("react-dom/server");
  const { createElement } = require("react");
  const { default: BlogBody } = load("app/components/ui/BlogBody.tsx");
  const html = renderToStaticMarkup(createElement(BlogBody, { body: '# Título\n\n<script>alert(1)</script>\n\n[Malicioso](javascript:alert(1))\n\n**Texto**' }));
  assert.ok(!html.includes("<script")); assert.ok(!html.includes("javascript:"));
  assert.ok(!html.includes("<h1")); assert.ok(html.includes("<strong>Texto</strong>"));
});
