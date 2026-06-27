import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getWebSection, getProjectCases } from "~/lib/content.server";
import ProjectCard from "~/components/ui/ProjectCard";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const attrs = data?.section?.attrs ?? {};
  return [
    { title: (attrs["seo_title"] as string) ?? "Proyectos | Frederic Martínez" },
    { name: "description", content: (attrs["seo_description"] as string) ?? "" },
  ];
};

export async function loader(_args: LoaderFunctionArgs) {
  const [section, projects] = await Promise.all([
    getWebSection("proyectos"),
    getProjectCases(),
  ]);
  return json({ section, projects });
}

export default function ProyectosRoute() {
  const { section, projects } = useLoaderData<typeof loader>();
  const attrs = section?.attrs ?? {};

  const titleLine1 = (attrs["hero_title_line1"] as string) ?? "";
  const titleLine2 = (attrs["hero_title_line2"] as string) ?? "";
  const heroDesc = (attrs["hero_description"] as string) ?? "";
  const ctaTitle = (attrs["cta_title"] as string) ?? "";
  const ctaSubtitle = (attrs["cta_subtitle"] as string) ?? "";

  return (
    <main className="page">
      {/* Hero */}
      <div className="section-block" style={{ paddingTop: 80 }}>
        <h1 className="section-title" style={{ maxWidth: 800 }}>
          {titleLine1}
          {titleLine2 && (
            <>
              <br />
              <span style={{ color: "var(--gray-dark)", fontWeight: 400 }}>
                {titleLine2}
              </span>
            </>
          )}
        </h1>
        {heroDesc && <p className="section-desc">{heroDesc}</p>}
      </div>

      {/* Projects */}
      <div className="section-block" style={{ paddingTop: 0 }}>
        <div className="projects-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>

      {/* CTA inline */}
      {(ctaTitle || ctaSubtitle) && (
        <div
          className="section-block"
          style={{
            paddingTop: 64,
            paddingBottom: 96,
            borderTop: "1px solid var(--gray-light)",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: 500,
              letterSpacing: "var(--tracking-sans)",
              marginBottom: 12,
            }}
          >
            {ctaTitle}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              letterSpacing: "var(--tracking-mono)",
              textTransform: "uppercase",
              color: "var(--gray-dark)",
              marginBottom: 32,
            }}
          >
            {ctaSubtitle}
          </p>
          <a href="mailto:hola@fredericmartinez.com" className="btn btn-lime">
            HABLEMOS
            <span className="btn-icon">&#8599;</span>
          </a>
        </div>
      )}
    </main>
  );
}
