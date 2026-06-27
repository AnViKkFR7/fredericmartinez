import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getWebSection, getWebServices } from "~/lib/content.server";
import ServiceCard from "~/components/ui/ServiceCard";

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
  const { section, services } = useLoaderData<typeof loader>();
  const attrs = section?.attrs ?? {};

  const titleLine1 = (attrs["hero_title_line1"] as string) ?? "";
  const titleLine2 = (attrs["hero_title_line2"] as string) ?? "";
  const descLine1 = (attrs["hero_description_line1"] as string) ?? "";
  const descLine2 = (attrs["hero_description_line2"] as string) ?? "";

  return (
    <main>
      {/* Hero */}
      <section className="hero hero--sky">
        <div className="hero-content">
          <h1 className="hero-title">
            {titleLine1}
            {titleLine2 && (
              <>
                <br />
                <span className="hero-title-dim">{titleLine2}</span>
              </>
            )}
          </h1>

          {(descLine1 || descLine2) && (
            <div className="hero-desc-block">
              {descLine1 && <p className="hero-desc-line">{descLine1}</p>}
              {descLine2 && <p className="hero-desc-line">{descLine2}</p>}
            </div>
          )}

          <div className="hero-ctas">
            <a href="mailto:hola@fredericmartinez.com" className="btn btn-lime">
              CUÉNTAME TU PROYECTO
              <span className="btn-icon">&#8599;</span>
            </a>
          </div>
        </div>

        {/* Service cards float at the bottom of the hero */}
        {services.length > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            <div className="services-scroll-outer">
              <div className="services-scroll-track" style={{ paddingBottom: 32, paddingTop: 8 }}>
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Full service list below hero */}
      <div
        className="section-block"
        style={{ paddingTop: services.length > 0 ? 0 : undefined }}
      >
        <h2 className="section-title">Todos los servicios</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 24,
            marginTop: 48,
          }}
        >
          {services.map((service) => (
            <ServiceCard key={`full-${service.id}`} service={service} />
          ))}
        </div>
      </div>
    </main>
  );
}
