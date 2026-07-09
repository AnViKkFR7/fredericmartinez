import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getWebSection } from "~/lib/content.server";
import ButtonSlider from "~/components/ui/ButtonSlider";
import CarouselHome from "~/components/ui/CarouselHome";
import ScrollIndicator from "~/components/ui/ScrollIndicator";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const attrs = data?.homeSection?.attrs ?? {};
  return [
    { title: (attrs["seo_title"] as string) ?? "Frederic Martínez" },
    { name: "description", content: (attrs["seo_description"] as string) ?? "" },
  ];
};

export async function loader(_args: LoaderFunctionArgs) {
  const homeSection = await getWebSection("home");
  return json({ homeSection });
}

export default function IndexRoute() {
  const { homeSection } = useLoaderData<typeof loader>();
  const attrs = homeSection?.attrs ?? {};

  const titleLine1 = (attrs["hero_title_line1"] as string) ?? "";
  const titleLine2 = (attrs["hero_title_line2"] as string) ?? "";
  const subtitle = (attrs["hero_subtitle"] as string) ?? "";
  const carouselItems = (attrs["carousel_items"] as { text: string; imageSrc: string }[]) ?? [];
  const count = carouselItems.length || 1;

  return (
    <main>
      <section className="home-hero">
        {/* Upper content: title + subtitle + CTAs */}
        <div className="home-hero-upper">
          <h1 className="home-hero-title">
            {titleLine1}
            {titleLine2 && (
              <>
                <br />
                <span className="home-hero-title-dim">{titleLine2}</span>
              </>
            )}
          </h1>

          {subtitle && <p className="home-hero-subtitle">{subtitle}</p>}

          <div className="home-hero-ctas">
            <Link to="/sobre-mi" className="btn btn-outline-white">
              CONÓCEME MEJOR
            </Link>

            <ButtonSlider to="/proyectos" text="VER PROYECTOS" />
          </div>
        </div>
        <ScrollIndicator></ScrollIndicator>
        <CarouselHome carouselItems={carouselItems} />

      </section>
    </main>
  );
}


