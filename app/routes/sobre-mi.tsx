import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getTrayectoriaSlide, getWebSection } from "~/lib/content.server";
import TrayectoriaCarousel from "~/components/ui/TrayectoriaCarousel";
import ButtonSlider from "~/components/ui/ButtonSlider";
import "~/styles/SobreMi.css";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const attrs = data?.section?.attrs ?? {};
  return [
    { title: (attrs["seo_title"] as string) ?? "Sobre mí | Frederic Martínez" },
    { name: "description", content: (attrs["seo_description"] as string) ?? "" },
  ];
};

export async function loader(_args: LoaderFunctionArgs) {
  const section = await getWebSection("sobre_mi");
  const slides = await getTrayectoriaSlide();
  return json({ section, slides });
}

export default function SobreMiRoute() {
  const { section, slides } = useLoaderData<typeof loader>();
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
            <img src="/images/sobre_mi1.png" alt="Frederic Martínez" />
          </div>

          {/* Card derecha: texto + CTA */}
          <div className="about-split-content">
            <h1 className="about-split-title">{heroTitle}</h1>
            <p className="about-split-desc">{heroDesc}</p>

            <ButtonSlider to="/proyectos" text="CONÓCEME EN 60 SEGUNDOS" />

            {heroBadge && (
              <div className="about-split-badge-row">
                <div className="about-split-avatars" aria-hidden>
                  <img src="/images/Icono FS Gava.png" alt="Icono FS Gava" className="about-split-avatar" />
                  <img src="/images/Icono Merkapiso.png" alt="Icono Merkapiso" className="about-split-avatar" />
                  <img src="/images/Icono TC.png" alt="Icono TC" className="about-split-avatar" />
                </div>
                <p className="about-split-badge-text">{heroBadge}</p>
              </div>
            )}
          </div>
        </div>
      </section>
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
        <TrayectoriaCarousel slides={slides} />
      </section>
    </main>
  );
}

