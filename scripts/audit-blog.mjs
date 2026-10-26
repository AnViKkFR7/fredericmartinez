import { createClient } from "@supabase/supabase-js";
import { buildSync } from "esbuild";
import { createRequire } from "node:module";

try { process.loadEnvFile(); } catch (error) { if (error.code !== "ENOENT") throw error; }
const companyId = process.env.VITE_COMPANY_ID || "40e02f2e-8863-4d3a-9bc8-352223d9aab0";
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error("Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY. No usar service_role.");
}
const module = { exports: {} };
const bundle = buildSync({ entryPoints: ["app/lib/blog.ts"], bundle: true, write: false, platform: "node", format: "cjs" });
new Function("require", "module", "exports", bundle.outputFiles[0].text)(createRequire(import.meta.url), module, module.exports);
const db = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
const posts = [];
for (let offset = 0; ; offset += 1000) {
  const { data, error } = await db.from("blog_posts").select("id,slug")
    .eq("company_id", companyId).eq("status", "published").order("id").range(offset, offset + 999);
  if (error) throw new Error(`No se pudo auditar el blog: ${error.code}. Comprueba CONTENT_SEO_FIELDS.sql.`);
  posts.push(...data);
  if (data.length < 1000) break;
}
const issues = module.exports.auditBlogSlugs(posts);
console.log(`Posts publicados: ${posts.length}. Incidencias de slugs: ${issues.length}.`);
if (issues.length) { console.table(issues); process.exitCode = 1; }
