import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getWebSection, getWebServices } from "~/lib/content.server";
import ServiceCard from "~/components/ui/ServiceCard";
import { useContactModal } from "~/context/ContactModalContext";
import "~/styles/Servicios.css";
import ButtonSlider from "~/components/ui/ButtonSlider";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const attrs = data?.section?.attrs ?? {};
  return [
    { title: (attrs["seo_title"] as string) ?? "Servicios | Frederic Martínez" },
    { name: "description", content: (attrs["seo_description"] as string) ?? "" },
  ];
};

export async function loader(_args: LoaderFunctionArgs) {
  const [section, services] = await Promise.all([
    getWebSection("servicios"),
    getWebServices(),
  ]);
  return json({ section, services });
}

export default function ServiciosRoute() {
  const { openModal } = useContactModal();
  const { section, services } = useLoaderData<typeof loader>();
  const attrs = section?.attrs ?? {};

  const titleLine1 = (attrs["hero_title_line1"] as string) ?? "";
  const titleLine2 = (attrs["hero_title_line2"] as string) ?? "";
  const descLine1 = (attrs["hero_description_line1"] as string) ?? "";
  const descLine2 = (attrs["hero_description_line2"] as string) ?? "";

  return (
    <main>
      {/* Hero */}
      <section className="hero--sky">
        <div className="hero-servicios-content">
          <h1 className="hero-servicios-title">
            {titleLine1}
            {titleLine2 && (
              <>
                <br />
                <span className="hero-servicios-title-dim">{titleLine2}</span>
              </>
            )}
          </h1>

          {(descLine1 || descLine2) && (
            <div className="hero-servicios-desc-block">
              {descLine1 && <p className="hero-servicios-desc-line">{descLine1}</p>}
              {descLine2 && <p className="hero-servicios-desc-line">{descLine2}</p>}
            </div>
          )}

          <div className="hero-servicios-btn-block">
            <ButtonSlider text="CUÉNTAME TU PROYECTO" onClick={openModal} />
          </div>
        </div>
      </section>

      {/* Full service list below hero */}
      <div
        className="service-section-block"
        style={{ paddingTop: services.length > 0 ? 0 : undefined }}
      >
        <h2 className="service-section-title">Esto es lo que puedo hacer por ti.</h2>
        <div className="service-section-cards-wrapper"
        >
          {services.map((service) => (
            <ServiceCard key={`full-${service.id}`} service={service} />
          ))}
        </div>
      </div>
    </main>
  );
}
