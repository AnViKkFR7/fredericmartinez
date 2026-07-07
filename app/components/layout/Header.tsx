import { NavLink, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useContactModal } from "~/context/ContactModalContext";

export default function Header() {
  const { openModal } = useContactModal();
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={[
          "header",
          isHome ? "header--home" : "",
          scrolled ? "header--scrolled" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="header-inner">
          <NavLink to="/" className="header-logo">
            <strong>Frederic</strong>
            <span> Martínez</span>
          </NavLink>

          <nav>
            <ul className="header-links">
              <li><NavLink to="/" end>INICIO</NavLink></li>
              <li><NavLink to="/sobre-mi">SOBRE MÍ</NavLink></li>
              <li><NavLink to="/proyectos">PROYECTOS</NavLink></li>
              <li><NavLink to="/servicios">SERVICIOS</NavLink></li>
            </ul>
          </nav>

          <button onClick={openModal} className="header-cta-link">
            HABLEMOS
          </button>
        </div>
      </header>

      <nav className="mobile-nav" aria-label="Navegación principal">
        <NavLink to="/" end className="mobile-nav__item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
            <polyline points="9 21 9 12 15 12 15 21" />
          </svg>
          <span>INICIO</span>
        </NavLink>
        <NavLink to="/sobre-mi" className="mobile-nav__item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-3.866 3.582-7 8-7s8 3.134 8 7" />
          </svg>
          <span>SOBRE MÍ</span>
        </NavLink>
        <NavLink to="/proyectos" className="mobile-nav__item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <span>PROYECTOS</span>
        </NavLink>
        <NavLink to="/servicios" className="mobile-nav__item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <span>SERVICIOS</span>
        </NavLink>
      </nav>
    </>
  );
}

