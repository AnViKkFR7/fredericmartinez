import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useEffect } from "react";
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  useLocation,
  useRouteError,
} from "@remix-run/react";
import { Analytics } from "@vercel/analytics/remix";
import { SpeedInsights } from "@vercel/speed-insights/remix";
import { initAutoTracking, trackPageview } from "~/lib/analytics";
import { getWebSection } from "~/lib/content.server";
import Header from "~/components/layout/Header";
import Footer from "~/components/layout/Footer";
import { ContactModalProvider } from "~/context/ContactModalContext";
import ContactModal from "~/components/ui/ContactModal";
import "~/styles/global.css";

export const links: LinksFunction = () => [
  { rel: "icon", href: "/images/favicon.jpeg", type: "image/jpeg" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap",
  },
];

export async function loader(_args: LoaderFunctionArgs) {
  const globalSection = await getWebSection("global");
  return json({ globalSection });
}

export default function App() {
  const { globalSection } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();

  useEffect(() => {
    initAutoTracking();
  }, []);

  useEffect(() => {
    trackPageview(pathname);
  }, [pathname]);

  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Frederic Martínez</title>
        <Meta />
        <Links />
      </head>
      <body>
        <ContactModalProvider>
          <Header />
          <Outlet />
          <Footer globalSection={globalSection ?? null} />
          <ContactModal />
        </ContactModalProvider>
        <Analytics />
        <SpeedInsights />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// Tras un despliegue nuevo, una pestaña abierta con la versión anterior pide chunks
// que ya no existen y la navegación cliente falla a nivel de red. Una carga completa
// siempre trae los assets actuales, así que la recuperamos sola.
function isStaleBuildError(error: unknown): boolean {
  if (isRouteErrorResponse(error) || !(error instanceof Error)) return false;
  return /failed to fetch|dynamically imported module|loading chunk|module script/i.test(
    error.message,
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const isStaleBuild = isStaleBuildError(error);
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  useEffect(() => {
    if (!isStaleBuild) return;
    const key = `stale-build-reload:${window.location.pathname}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    window.location.reload();
  }, [isStaleBuild]);

  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Frederic Martínez</title>
        <Meta />
        <Links />
      </head>
      <body>
        <main className="error-page">
          <p className="error-page-code">{isNotFound ? "404" : "Vaya"}</p>
          <h1 className="error-page-title">
            {isNotFound
              ? "Esta página no existe"
              : isStaleBuild
                ? "Recargando la página..."
                : "Algo no ha ido bien"}
          </h1>
          <p className="error-page-text">
            {isNotFound
              ? "Puede que el enlace esté mal escrito o que el contenido ya no esté disponible."
              : "Inténtalo de nuevo en unos segundos."}
          </p>
          <Link to="/" className="error-page-link">
            Volver al inicio
          </Link>
        </main>
        <Scripts />
      </body>
    </html>
  );
}

