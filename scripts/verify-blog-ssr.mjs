// Exercises the production Remix renderer with an isolated public Supabase fixture.
import assert from "node:assert/strict";
import { createRequestHandler } from "@remix-run/node";

process.env.VITE_SUPABASE_URL = "https://fixture.example.com";
process.env.VITE_SUPABASE_ANON_KEY = "public-test-key";
process.env.PUBLIC_SITE_URL = "https://frederic.example.com";
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
const companyId = process.env.VITE_COMPANY_ID || "40e02f2e-8863-4d3a-9bc8-352223d9aab0";
const posts = [
  { id: "post-1", company_id: companyId, title: "Ideas & experiencias", heading: "Un punto de vista", intro: "Una introducción", body: "## El proceso\n\nContenido **público**.\n\n<script>alert(1)</script>", slug: "ideas", status: "published", seo_title: "Título SEO & diseño", seo_description: "Una descripción para el buscador", seo_og_image_url: "https://images.example.com/cover.jpg", published_at: "2026-10-25T10:00:00Z", created_at: "2026-10-24T10:00:00Z", updated_at: "2026-10-26T10:00:00Z" },
  { id: "draft", company_id: companyId, slug: "borrador", status: "draft" },
  { id: "other", company_id: "another-company", slug: "otra-empresa", status: "published" },
];
globalThis.fetch = async (input, init) => {
  const url = new URL(input);
  if (url.hostname !== "fixture.example.com") throw new Error("Unexpected network access");
  if (!url.pathname.endsWith("blog_posts")) return new Response("[]", { headers: { "content-type": "application/json" } });
  let rows = posts.filter((post) => url.searchParams.get("company_id") === `eq.${post.company_id}` && url.searchParams.get("status") === `eq.${post.status}`);
  const slug = url.searchParams.get("slug");
  if (slug?.startsWith("ilike.")) rows = rows.filter((post) => post.slug === slug.slice(6));
  const single = String(new Headers(init?.headers).get("accept")).includes("object+json");
  return new Response(JSON.stringify(single ? rows[0] ?? null : rows), { headers: { "content-type": "application/json" } });
};
const build = await import("../build/server/index.js");
const handle = createRequestHandler(build, "production");
const get = (path) => handle(new Request(`https://preview.example.com${path}`));
const response = await get("/blog/ideas");
assert.equal(response.status, 200);
const html = await response.text();
assert.equal((html.match(/<title>/g) ?? []).length, 1);
assert.match(html, /<title>Título SEO &amp; diseño<\/title>/);
assert.match(html, /rel="canonical" href="https:\/\/frederic.example.com\/blog\/ideas"/);
assert.match(html, /property="og:image" content="https:\/\/images.example.com\/cover.jpg"/);
assert.match(html, /<h2>El proceso<\/h2>/);
assert.ok(!html.includes("<script>alert(1)</script>"));
assert.equal((await get("/blog")).status, 200);
assert.equal((await get("/blog/borrador")).status, 404);
assert.equal((await get("/blog/otra-empresa")).status, 404);
assert.equal((await get("/blog/no-existe")).status, 404);
const sitemap = await (await get("/sitemap.xml")).text();
assert.ok(sitemap.includes("https://frederic.example.com/blog/ideas"));
assert.ok(!sitemap.includes("borrador"));
assert.ok(!sitemap.includes("otra-empresa"));
console.log("SSR de producción verificado: listado, artículo, Markdown, título único, canonical, OG, 404 y sitemap.");
