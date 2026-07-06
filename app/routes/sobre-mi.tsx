import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getWebSection } from "~/lib/content.server";
import TrayectoriaCarousel from "~/components/ui/TrayectoriaCarousel";
import type { TrayectoriaSlide } from "~/components/ui/TrayectoriaCarousel";
import ButtonSlider from "~/components/ui/ButtonSlider";
import "~/styles/SobreMi.css";
import ScrollIndicator from "~/components/ui/ScrollIndicator";

// TODO: reemplazar con items de tipo 'trayectoria' en Supabase cuando se añadan al schema
const TRAYECTORIA_SLIDES: TrayectoriaSlide[] = [
  {
    id: "1",
    category: "FORMACIÓN",
    years: "2016 – 18",
    title: "Grado Superior en Marketing y Publicidad",
    institution: "CEFP Nuria",
    color: "dark",
  },
  {
    id: "2",
    category: "FORMACIÓN",
    years: "2019 – 21",
    title: "Diseño y Comunicación Visual",
    institution: "ESDI Barcelona",
    color: "dark",
  },
  {
    id: "3",
    category: "EXPERIENCIA",
    years: "2019 – 26",
    title: "Producción Audiovisual Corporativa",
    institution: "zonatv",
    color: "blue",
  },
  {
    id: "4",
    category: "PROYECTO",
    years: "2022 – 23",
    title: "Plan de Comunicación",
    institution: "Grau Distribucions",
    color: "dark",
  },
  {
    id: "5",
    category: "PROYECTO",
    years: "2023",
    title: "Estrategia y Plan de Comunicación",
    institution: "elBulli Foundation",
    color: "blue",
  },
];

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const attrs = data?.section?.attrs ?? {};
  return [
    { title: (attrs["seo_title"] as string) ?? "Sobre mí | Frederic Martínez" },
    { name: "description", content: (attrs["seo_description"] as string) ?? "" },
  ];
};

export async function loader(_args: LoaderFunctionArgs) {
  const section = await getWebSection("sobre_mi");
  return json({ section });
}

export default function SobreMiRoute() {
  const { section } = useLoaderData<typeof loader>();
  const attrs = section?.attrs ?? {};

  const heroTitle = (attrs["hero_title"] as string) ?? "";
  const heroDesc = (attrs["hero_description"] as string) ?? "";
  const heroBadge = (attrs["hero_badge"] as string) ?? "";
  const trayectoriaLabel = (attrs["trayectoria_label"] as string) ?? "MI TRAYECTORIA";
  const trayectoriaTitle = (attrs["trayectoria_title"] as string) ?? "";
  const trayectoriaDesc = (attrs["trayectoria_description"] as string) ?? "";

  return (
    <main>
      {/* ── HERO: dos cards a pantalla completa ── */}
      <section className="about-split">
        <div className="about-split-grid">
          {/* Card izquierda: imagen */}
          <div className="about-split-image">
            <img src="/app/images/sobre_mi1.png" alt="Frederic Martínez" />
          </div>

          {/* Card derecha: texto + CTA */}
          <div className="about-split-content">
            <h1 className="about-split-title">{heroTitle}</h1>
            <p className="about-split-desc">{heroDesc}</p>

            <ButtonSlider to="/proyectos" text="CONÓCEME EN 60 SEGUNDOS" />

            {heroBadge && (
              <div className="about-split-badge-row">
                <div className="about-split-avatars" aria-hidden>
                  <span className="about-split-avatar about-split-avatar--blue" />
                  <span className="about-split-avatar about-split-avatar--lime" />
                  <span className="about-split-avatar about-split-avatar--dark" />
                </div>
                <p className="about-split-badge-text">{heroBadge}</p>
              </div>
            )}
          </div>
        </div>
      </section>
      <ScrollIndicator />
      {/* ── TRAYECTORIA: label + título + descripción ── */}
      <section id="trayectoria" className="trayectoria-section">
        <div className="trayectoria-header">
          <p className="trayectoria-section-label">{trayectoriaLabel}</p>
          <h2 className="trayectoria-section-title">{trayectoriaTitle}</h2>
          {trayectoriaDesc && (
            <p className="trayectoria-section-desc">{trayectoriaDesc}</p>
          )}
        </div>

        {/* ── CAROUSEL DRAG MANUAL ── */}
        <TrayectoriaCarousel slides={TRAYECTORIA_SLIDES} />
      </section>
    </main>
  );
}

