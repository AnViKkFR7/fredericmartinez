import { blogSitemap } from "~/lib/blog";
import { publicSiteUrl, publishedBlogIndex } from "~/lib/blog.server";

export async function loader() {
  return new Response(blogSitemap(publicSiteUrl(), await publishedBlogIndex()), {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300" },
  });
}
