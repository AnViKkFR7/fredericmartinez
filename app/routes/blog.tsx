import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getBlogPage, publicSiteUrl } from "~/lib/blog.server";
import { httpsUrl } from "~/lib/blog";
import "~/styles/Blog.css";

export async function loader({ request }: LoaderFunctionArgs) {
  const raw = new URL(request.url).searchParams.get("page") || "1";
  if (!/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(Number(raw))) throw new Response("Not Found", { status: 404 });
  return json({ ...await getBlogPage(Number(raw)), siteUrl: publicSiteUrl() });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [{ title: "Blog | Frederic Martínez" }];
  const url = `${data.siteUrl}/blog${data.page > 1 ? `?page=${data.page}` : ""}`;
  const title = "Blog | Frederic Martínez";
  const description = "Ideas y experiencias sobre comunicación, diseño y proyectos audiovisuales.";
  return [{ title }, { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:title", content: title }, { property: "og:description", content: description },
    { property: "og:url", content: url }, { property: "og:type", content: "website" }];
};

export default function BlogPage() {
  const { posts, page, pageCount } = useLoaderData<typeof loader>();
  return <main className="blog-page">
    <header className="blog-heading"><p className="blog-eyebrow">IDEAS Y EXPERIENCIAS</p><h1>Blog</h1><p>Comunicación, diseño y miradas detrás de cada proyecto.</p></header>
    {posts.length ? <div className="blog-grid">{posts.map((post) => <article key={post.id} className="blog-card">
      <Link to={`/blog/${post.slug}`}>
        {httpsUrl(post.cover?.url_externa) && <img src={post.cover!.url_externa} alt={post.cover?.alt_text ?? ""} width={720} height={450} loading="lazy" />}
        {post.published_at && <time dateTime={post.published_at}>{new Date(post.published_at).toLocaleDateString("es-ES", { timeZone: "Europe/Madrid", day: "numeric", month: "long", year: "numeric" })}</time>}
        <h2>{post.title}</h2><p>{post.intro || post.heading}</p><span className="blog-read">Leer artículo ↗</span>
      </Link>
    </article>)}</div> : <p className="blog-empty" role="status">Todavía no hay artículos publicados. Pronto compartiré nuevas ideas por aquí.</p>}
    {pageCount > 1 && <nav className="blog-pagination" aria-label="Páginas del blog">
      {page > 1 && <Link to={page === 2 ? "/blog" : `/blog?page=${page - 1}`} rel="prev">← Anterior</Link>}
      <span>Página {page} de {pageCount}</span>
      {page < pageCount && <Link to={`/blog?page=${page + 1}`} rel="next">Siguiente →</Link>}
    </nav>}
  </main>;
}
