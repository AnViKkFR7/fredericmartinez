import { NavLink, useLocation } from "@remix-run/react";

export default function Header() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <header className={`header${isHome ? " header--home" : ""}`}>
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

        <a href="mailto:hola@fredericmartinez.com" className="header-cta-link">
          HABLEMOS
        </a>
      </div>
    </header>
  );
}

