import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { getWebSection } from "~/lib/content.server";
import Header from "~/components/layout/Header";
import Footer from "~/components/layout/Footer";
import { ContactModalProvider } from "~/context/ContactModalContext";
import ContactModal from "~/components/ui/ContactModal";
import "~/styles/global.css";

export const links: LinksFunction = () => [
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
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ContactModalProvider>
          <Header />
          <Outlet />
          <Footer globalSection={globalSection} />
          <ContactModal />
        </ContactModalProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

