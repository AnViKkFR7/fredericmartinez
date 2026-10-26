import { createClient } from "@supabase/supabase-js";
import { COMPANY_ID } from "./company";
import { auditBlogSlugs, BLOG_PAGE_SIZE, validBlogSlug, type BlogMedia, type BlogPost } from "./blog";

const POST_COLUMNS = "id,company_id,title,heading,intro,body,status,slug,seo_title,seo_description,seo_og_image_url,published_at,created_at,updated_at";
const MEDIA_COLUMNS = "id,post_id,file_type,url_externa,title,alt_text,sort_order,is_cover_image";
const unavailable = () => new Response("El blog no está disponible en este momento", { status: 503 });

function publicDatabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw unavailable();
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function publicSiteUrl() {
  const url = new URL(process.env.PUBLIC_SITE_URL || "https://fredericmartinez.com");
  if (!/^https?:$/.test(url.protocol) || url.username || url.password) throw unavailable();
  return url.origin;
}

// Fail closed until old published posts have stable, unique slugs.
export async function publishedBlogIndex() {
  const db = publicDatabase();
  const posts: Array<{ id: string; slug: string; updated_at: string }> = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await db.from("blog_posts").select("id,slug,updated_at")
      .eq("company_id", COMPANY_ID).eq("status", "published").order("id").range(offset, offset + 999);
    if (error) throw unavailable();
    posts.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  if (auditBlogSlugs(posts).length) throw unavailable();
  return posts;
}

async function withMedia(posts: BlogPost[]): Promise<BlogPost[]> {
  if (!posts.length) return [];
  const { data, error } = await publicDatabase().from("blog_media").select(MEDIA_COLUMNS)
    .in("post_id", posts.map((post) => post.id)).eq("file_type", "image")
    .order("sort_order", { ascending: true }).order("id");
  if (error) throw unavailable();
  return posts.map((post) => {
    const media = (data ?? []).filter((item: BlogMedia) => item.post_id === post.id);
    return { ...post, media, cover: media.find((item: BlogMedia) => item.is_cover_image) ?? null };
  });
}

export async function getBlogPage(page: number) {
  const index = await publishedBlogIndex();
  const pageCount = Math.max(1, Math.ceil(index.length / BLOG_PAGE_SIZE));
  if (page > pageCount) throw new Response("Not Found", { status: 404 });
  const offset = (page - 1) * BLOG_PAGE_SIZE;
  const { data, error } = await publicDatabase().from("blog_posts").select(POST_COLUMNS)
    .eq("company_id", COMPANY_ID).eq("status", "published").not("slug", "is", null)
    .order("published_at", { ascending: false }).order("id", { ascending: false })
    .range(offset, offset + BLOG_PAGE_SIZE - 1);
  if (error) throw unavailable();
  return { posts: await withMedia((data ?? []) as BlogPost[]), page, pageCount };
}

export async function getBlogPost(slug: string) {
  if (!validBlogSlug(slug)) throw new Response("Not Found", { status: 404 });
  await publishedBlogIndex();
  const { data, error } = await publicDatabase().from("blog_posts").select(POST_COLUMNS)
    .eq("company_id", COMPANY_ID).eq("status", "published").ilike("slug", slug).maybeSingle();
  if (error) throw unavailable();
  if (!data) throw new Response("Not Found", { status: 404 });
  return (await withMedia([data as BlogPost]))[0];
}
