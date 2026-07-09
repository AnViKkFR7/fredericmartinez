import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getWebSection, getProjectCases } from "~/lib/content.server";
import ProjectCard from "~/components/ui/ProjectCard";
import { useContactModal } from "~/context/ContactModalContext";
import ButtonSlider from "~/components/ui/ButtonSlider";
import "~/styles/Proyectos.css";

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
  const { openModal } = useContactModal();
  const { section, projects } = useLoaderData<typeof loader>();
  const attrs = section?.attrs ?? {};

  const titleLine1 = (attrs["hero_title_line1"] as string) ?? "";
  const titleLine2 = (attrs["hero_title_line2"] as string) ?? "";
  const heroDesc = (attrs["hero_description"] as string) ?? "";

  return (
    <main>
      <section className="hero-proyectos-sky">
        <div className="hero-proyectos-content">
          <h1 className="hero-proyectos-title">
            {titleLine1}
            {titleLine2 && (
              <>
                <br />
                <span className="hero-proyectos-title-dim">{titleLine2}</span>
              </>
            )}
          </h1>

          {(heroDesc) && (
            <div className="hero-proyectos-desc-block">
              {heroDesc && <p className="hero-proyectos-desc-line">{heroDesc}</p>}
            </div>
          )}

          <div className="hero-proyectos-btn-block">
            <ButtonSlider text="CUÉNTAME TU PROYECTO" onClick={openModal} />
          </div>
        </div>
      </section>
      {/* Projects */}
      <div className="proyectos-section-block" style={{ paddingTop: 0 }}>
        <div className="proyectos-grid">
          {projects.map((project) => (
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
    </main>
  );
}
