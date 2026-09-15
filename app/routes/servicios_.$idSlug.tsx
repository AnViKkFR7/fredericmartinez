import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getServiceById, getRelatedProjects } from "~/lib/content.server";
import { extractIdFromParam } from "~/lib/slugify";
import ProjectCard from "~/components/ui/ProjectCard";
import "~/styles/Servicios.css";
import "~/styles/DetailPage.css";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];
  return [{ name: "description", content: data.service.description }];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const id = extractIdFromParam(params.idSlug ?? "");
  const service = id ? await getServiceById(id) : null;
  if (!service) {
    throw new Response("Not Found", { status: 404 });
  }
  const relatedProjects = await getRelatedProjects(service.relatedProjectSlugs);
  return json({ service, relatedProjects });
}

export default function ServicioDetailRoute() {
  const { service, relatedProjects } = useLoaderData<typeof loader>();
  const heroPhoto = service.media?.[0];

  return (
    <main>
      <section className="hero--sky">
        <div className="detail-hero-content">
          <h1 className="detail-title">{service.title}</h1>
          {!heroPhoto && service.description && (
            <p className="detail-lede">{service.description}</p>
          )}
        </div>
      </section>

      {heroPhoto && (
        <div className="detail-hero-img">
          <div
            className="detail-hero-img-inner"
            style={{ backgroundImage: `url(${heroPhoto.url_externa})` }}
          >
            <div className="detail-hero-img-overlay">
              {heroPhoto.alt_text && (
                <p className="detail-hero-img-caption">{heroPhoto.alt_text}</p>
              )}
              {service.description && (
                <p className="detail-hero-img-lede">{service.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {(service.paraQuien.length > 0 || service.incluye.length > 0) && (
        <div className="detail-section-block">
          <div className="detail-body-grid">
            {service.paraQuien.length > 0 && (
              <div className="detail-panel detail-panel--quien">
                <h2>Para quién es</h2>
                <ul className="detail-bullets">
                  {service.paraQuien.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {service.incluye.length > 0 && (
              <div className="detail-panel detail-panel--incluye">
                <h2>Qué incluye</h2>
                <ul className="detail-bullets">
                  {service.incluye.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {relatedProjects.length > 0 && (
        <div className="detail-related">
          <h2>Ejemplos de este servicio</h2>
          <div className="detail-related-grid">
            {relatedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={{
                  ...project,
                  media: project.media.map((item) => ({
                    ...item,
                    metadata: item.metadata ?? {},
                  })),
                }}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
