import { Link, useLocation } from "@remix-run/react";
import type { WebSection } from "~/types";
import { useContactModal } from "~/context/ContactModalContext";

interface FooterProps {
  globalSection: WebSection | null;
}

export default function Footer({ globalSection }: FooterProps) {
  const { openModal } = useContactModal();
  const { pathname } = useLocation();
  if (pathname === "/" || pathname === "/sobre-mi") return null;

  const showCta = pathname !== "/aviso-legal";

  const attrs = globalSection?.attrs ?? {};
  const ctaTitle = (attrs["cta_title"] as string) ?? "Hablemos de tu proyecto";
  const ctaSubtitle = (attrs["cta_subtitle"] as string) ?? "Barcelona y alrededores | Trabajo con empresa y agencia";
  const statusBadge = (attrs["status_badge"] as string) ?? "Disponible para nuevos proyectos";

  return (
    <>
      {showCta && (
        <section className="cta-section">
          <div className="status-badge" style={{ marginBottom: 32 }}>
            <span className="status-badge-dot" />
            {statusBadge}
          </div>
          <h2 className="cta-section-title">{ctaTitle}</h2>
          <p className="cta-section-subtitle">{ctaSubtitle}</p>
          <button onClick={openModal} className="btn btn-lime">
            HABLEMOS
            <span className="btn-icon">↗</span>
          </button>
        </section>
      )}

      <footer className="footer">
        <div className="footer-inner">
          <Link to="/" className="footer-logo">
            <strong>Frederic</strong>
            <span> Martínez</span>
          </Link>
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} Frederic Martínez
          </p>
          <Link to="/aviso-legal" className="footer-legal-link">
            Aviso legal
          </Link>
        </div>
      </footer>
    </>
  );
}

