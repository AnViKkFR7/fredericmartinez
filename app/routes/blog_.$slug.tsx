import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getBlogPost, publicSiteUrl } from "~/lib/blog.server";
import { blogMeta, httpsUrl } from "~/lib/blog";
import BlogBody from "~/components/ui/BlogBody";
import "~/styles/Blog.css";

export async function loader({ params }: LoaderFunctionArgs) {
  const post = await getBlogPost(params.slug ?? "");
  if (params.slug !== post.slug) throw redirect(`/blog/${post.slug}`, 301);
  return json({ post, siteUrl: publicSiteUrl() });
}
export const meta: MetaFunction<typeof loader> = ({ data }) => data ? blogMeta(data.post, data.siteUrl) : [{ title: "Artículo no encontrado | Frederic Martínez" }];

export default function BlogPostPage() {
  const { post } = useLoaderData<typeof loader>();
  return <main className="blog-page blog-article">
    <Link to="/blog" className="blog-back">← Todos los artículos</Link>
    <article>
      <header className="blog-heading"><p className="blog-eyebrow">BLOG</p><h1>{post.title}</h1>
        {post.heading && <p>{post.heading}</p>}
        {post.published_at && <time dateTime={post.published_at}>{new Date(post.published_at).toLocaleDateString("es-ES", { timeZone: "Europe/Madrid", day: "numeric", month: "long", year: "numeric" })}</time>}
      </header>
      {httpsUrl(post.cover?.url_externa) && <img className="blog-cover" src={post.cover!.url_externa} alt={post.cover?.alt_text ?? ""} width={1200} height={750} fetchPriority="high" />}
      {post.intro && <p className="blog-intro">{post.intro}</p>}
      <BlogBody body={post.body ?? ""} />
      {post.media.filter((item) => item.id !== post.cover?.id && httpsUrl(item.url_externa)).map((item) => <figure key={item.id} className="blog-figure">
        <img src={item.url_externa} alt={item.alt_text ?? ""} width={1200} height={750} loading="lazy" />
        {item.title && <figcaption>{item.title}</figcaption>}
      </figure>)}
    </article>
  </main>;
}
