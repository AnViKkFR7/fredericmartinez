import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getProjectCaseById } from "~/lib/content.server";
import { extractIdFromParam } from "~/lib/slugify";
import "~/styles/Proyectos.css";
import "~/styles/DetailPage.css";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];
  return [{ name: "description", content: data.project.description }];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const id = extractIdFromParam(params.idSlug ?? "");
  const project = id ? await getProjectCaseById(id) : null;
  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ project });
}

export default function ProyectoDetailRoute() {
  const { project } = useLoaderData<typeof loader>();
  const heroPhoto = project.media?.[0];
  const hasMeta = Boolean(project.rol || project.duracion || project.ambito);

  return (
    <main>
      <section className="hero-proyectos-sky">
        <div className="detail-hero-content">
          <h1 className="detail-title">{project.title}</h1>
          {project.client && <span className="hero-servicios-title-dim">{project.client}</span>}
        </div>
      </section>

      {(heroPhoto || hasMeta) && (
        <div className="detail-hero-img">
          {heroPhoto && (
            <div
              className="detail-hero-img-inner"
              style={{ backgroundImage: `url(${heroPhoto.url_externa})` }}
            >
              {heroPhoto.alt_text && (
                <div className="detail-hero-img-overlay">
                  <p className="detail-hero-img-caption">{heroPhoto.alt_text}</p>
                </div>
              )}
            </div>
          )}

          {hasMeta && (
            <div className="detail-meta-row">
              {project.rol && (
                <div className="detail-meta-item">
                  <span>ROL</span>
                  {project.rol}
                </div>
              )}
              {project.duracion && (
                <div className="detail-meta-item">
                  <span>DURACIÓN</span>
                  {project.duracion}
                </div>
              )}
              {project.ambito && (
                <div className="detail-meta-item">
                  <span>ÁMBITO</span>
                  {project.ambito}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="detail-section-block">
        <div className="detail-body-grid detail-body-grid--with-sidebar">
          <div className="detail-content">
            {project.contexto && (
              <section>
                <h2>El contexto</h2>
                <p>{project.contexto}</p>
              </section>
            )}

            {project.reto && (
              <section>
                <h2>El reto</h2>
                <p>{project.reto}</p>
              </section>
            )}

            {project.queHice.length > 0 && (
              <section>
                <h2>Qué hice</h2>
                <ul className="detail-bullets">
                  {project.queHice.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            {project.resultados.length > 0 && (
              <section>
                <h2>Resultados</h2>
                <ul className="detail-bullets">
                  {project.resultados.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="detail-sidebar">
            <div className="detail-sidebar-inner">
              {project.tags.length > 0 && (
                <div className="detail-tag-block">
                  <h3>ÁREAS</h3>
                  <div className="detail-tags">
                    {project.tags.map((tag) => (
                      <span key={tag} className="detail-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {project.stats.map((stat, index) => (
                <div key={index} className="detail-stat-card">
                  <div className="detail-stat-num">{stat.num}</div>
                  <div className="detail-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
