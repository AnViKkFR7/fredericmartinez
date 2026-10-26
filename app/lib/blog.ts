export interface BlogMedia {
  id: string;
  post_id: string;
  file_type: string;
  url_externa: string;
  title: string | null;
  alt_text: string | null;
  sort_order: number | null;
  is_cover_image: boolean;
}

export interface BlogPost {
  id: string;
  company_id: string;
  title: string;
  heading: string | null;
  intro: string | null;
  body: string | null;
  status: string;
  slug: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_og_image_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  media: BlogMedia[];
  cover: BlogMedia | null;
}

export const BLOG_PAGE_SIZE = 12;
export const validBlogSlug = (slug: unknown): slug is string =>
  typeof slug === "string" && slug.length <= 120 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug);

export function auditBlogSlugs(posts: Array<{ id: string; slug: unknown }>) {
  const seen = new Set<string>();
  return posts.flatMap((post) => {
    if (!validBlogSlug(post.slug)) return [{ id: post.id, issue: "invalid_slug" }];
    const slug = post.slug.toLowerCase();
    if (seen.has(slug)) return [{ id: post.id, issue: "duplicate_slug" }];
    seen.add(slug);
    return [];
  });
}

export function httpsUrl(value: string | null | undefined): string | undefined {
  try {
    const url = new URL(value ?? "");
    return url.protocol === "https:" && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
}

export function blogMeta(post: BlogPost, siteUrl: string) {
  const title = post.seo_title || post.title;
  const description = post.seo_description || post.intro || post.heading || post.title;
  const url = new URL(`/blog/${post.slug}`, siteUrl).href;
  const image = httpsUrl(post.seo_og_image_url) || httpsUrl(post.cover?.url_externa);
  return [
    { title },
    { name: "description", content: description },
    { tagName: "link" as const, rel: "canonical", href: url },
    { property: "og:type", content: "article" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    ...(image ? [{ property: "og:image", content: image }] : []),
  ];
}

const xml = (value: string) => value.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!);
export function blogSitemap(siteUrl: string, posts: Array<{ slug: string; updated_at: string }>) {
  const paths = ["/", "/sobre-mi", "/servicios", "/proyectos", "/blog"];
  const entries = paths.map((path) => `<url><loc>${xml(new URL(path, siteUrl).href)}</loc></url>`);
  for (const post of posts) {
    const date = new Date(post.updated_at);
    entries.push(`<url><loc>${xml(new URL(`/blog/${post.slug}`, siteUrl).href)}</loc>${Number.isFinite(date.getTime()) ? `<lastmod>${date.toISOString()}</lastmod>` : ""}</url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join("")}</urlset>`;
}
