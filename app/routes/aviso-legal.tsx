import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import "~/styles/AvisoLegal.css";

export const meta: MetaFunction = () => [
  { title: "Aviso Legal y Política de Privacidad | Frederic Martínez" },
  {
    name: "description",
    content:
      "Aviso legal, política de privacidad y uso de cookies de fredericmartinez.com — Frederic Martínez, Barcelona.",
  },
  { name: "robots", content: "noindex, follow" },
];

const SECTIONS = [
  { id: "titular", num: "01", title: "Identificación del titular" },
  { id: "condiciones", num: "02", title: "Condiciones de uso" },
  { id: "privacidad", num: "03", title: "Protección de datos" },
  { id: "derechos", num: "04", title: "Derechos del usuario" },
  { id: "cookies", num: "05", title: "Política de cookies" },
  { id: "terceros", num: "06", title: "Servicios de terceros" },
  { id: "propiedad", num: "07", title: "Propiedad intelectual" },
  { id: "modificaciones", num: "08", title: "Modificaciones" },
];

export default function AvisoLegalRoute() {
  return (
    <main className="legal-page">
      <div className="legal-hero">
        <div className="legal-hero-inner">
          <p className="legal-hero-label">Información legal</p>
          <h1 className="legal-hero-title">
            Aviso Legal y Política de Privacidad
          </h1>
          <p className="legal-hero-meta">
            Última actualización: julio de 2026 &nbsp;·&nbsp;{" "}
            fredericmartinez.com
          </p>
        </div>
      </div>

      <div className="legal-body">
        {/* ── Table of contents ── */}
        <nav className="legal-toc" aria-label="Índice del aviso legal">
          <p className="legal-toc-title">Índice</p>
          <ol className="legal-toc-list">
            {SECTIONS.map((s) => (
              <li key={s.id} className="legal-toc-item">
                <span className="legal-toc-num">{s.num}</span>
                <a href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── Content ── */}
        <div className="legal-content">

          {/* 01 */}
          <section id="titular" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">01</span>
              <h2 className="legal-section-title">Identificación del titular</h2>
            </div>
            <p className="legal-text">
              En cumplimiento de lo establecido en el artículo 10 de la Ley
              34/2002, de 11 de julio, de Servicios de la Sociedad de la
              Información y de Comercio Electrónico (LSSI-CE), se facilitan los
              siguientes datos identificativos del titular del sitio web:
            </p>
            <ul className="legal-list">
              <li>
                <span>
                  <strong>Titular:</strong> Frederic Martínez
                </span>
              </li>
              <li>
                <span>
                  <strong>NIF/NIE:</strong> [pendiente de completar]
                </span>
              </li>
              <li>
                <span>
                  <strong>Domicilio:</strong> Barcelona, España
                </span>
              </li>
              <li>
                <span>
                  <strong>Correo electrónico:</strong>{" "}
                  <a href="mailto:hola@fredericmartinez.com">
                    hola@fredericmartinez.com
                  </a>
                </span>
              </li>
              <li>
                <span>
                  <strong>Sitio web:</strong> fredericmartinez.com
                </span>
              </li>
            </ul>
            <p className="legal-text">
              Este sitio web tiene carácter personal y divulgativo, orientado a
              presentar la actividad profesional de Frederic Martínez en el
              ámbito del marketing, la comunicación y el diseño. No tiene
              finalidad comercial directa ni realiza ventas en línea.
            </p>
          </section>

          {/* 02 */}
          <section id="condiciones" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">02</span>
              <h2 className="legal-section-title">Condiciones de uso</h2>
            </div>
            <p className="legal-text">
              El acceso y uso de este sitio web implica la aceptación plena y
              sin reservas de las presentes condiciones. El usuario se
              compromete a hacer un uso correcto del sitio web, de conformidad
              con la ley, la moral y el orden público, absteniéndose de
              utilizarlo con fines ilícitos o lesivos.
            </p>
            <p className="legal-text">
              El titular se reserva el derecho a modificar, suspender o
              interrumpir el acceso al sitio web sin previo aviso y sin que ello
              genere ningún derecho de reclamación o indemnización.
            </p>
            <p className="legal-text">
              Los contenidos de este sitio web son meramente informativos.
              Aunque se ha procurado que la información sea precisa y
              actualizada, el titular no garantiza la exactitud, integridad ni
              actualidad de los contenidos, ni asume responsabilidad alguna por
              los daños que pudieran derivarse del uso de la información aquí
              contenida.
            </p>
          </section>

          {/* 03 */}
          <section id="privacidad" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">03</span>
              <h2 className="legal-section-title">Protección de datos personales</h2>
            </div>
            <p className="legal-text">
              De conformidad con el Reglamento (UE) 2016/679 del Parlamento
              Europeo y del Consejo (RGPD) y con la Ley Orgánica 3/2018, de 5
              de diciembre, de Protección de Datos Personales y garantía de los
              derechos digitales (LOPDGDD), se informa de lo siguiente:
            </p>
            <ul className="legal-list">
              <li>
                <span>
                  <strong>Responsable del tratamiento:</strong> Frederic
                  Martínez — hola@fredericmartinez.com
                </span>
              </li>
              <li>
                <span>
                  <strong>Datos tratados:</strong> nombre, dirección de correo
                  electrónico y mensaje, recogidos a través del formulario de
                  contacto.
                </span>
              </li>
              <li>
                <span>
                  <strong>Finalidad:</strong> atender consultas y gestionar la
                  comunicación profesional con el usuario.
                </span>
              </li>
              <li>
                <span>
                  <strong>Base jurídica:</strong> consentimiento del interesado
                  (art. 6.1.a RGPD), otorgado al enviar el formulario de
                  contacto.
                </span>
              </li>
              <li>
                <span>
                  <strong>Destinatarios:</strong> los datos no se ceden a
                  terceros. El mensaje se transmite directamente por correo
                  electrónico al titular y <strong>no se almacena</strong> en
                  ninguna base de datos.
                </span>
              </li>
              <li>
                <span>
                  <strong>Plazo de conservación:</strong> el tiempo necesario
                  para atender la consulta o hasta que el usuario solicite su
                  supresión.
                </span>
              </li>
            </ul>
            <div className="legal-highlight">
              <p>
                <strong>Transferencias internacionales:</strong> este sitio
                utiliza servicios de terceros (Vercel para el alojamiento y
                Supabase para la gestión de contenidos) cuyos servidores pueden
                estar ubicados fuera del Espacio Económico Europeo. Dichas
                transferencias se realizan bajo garantías adecuadas (Cláusulas
                Contractuales Tipo aprobadas por la Comisión Europea, art. 46
                RGPD). Los datos recogidos por el formulario de contacto
                únicamente se transmiten por correo electrónico y no se
                almacenan en dichos servicios.
              </p>
            </div>
            <p className="legal-text">
              El usuario garantiza que los datos facilitados son verídicos y
              asume la responsabilidad de mantenerlos actualizados. El titular
              no se responsabiliza de los perjuicios causados por información
              incorrecta o falsa aportada por el usuario.
            </p>
          </section>

          {/* 04 */}
          <section id="derechos" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">04</span>
              <h2 className="legal-section-title">Derechos del usuario</h2>
            </div>
            <p className="legal-text">
              De acuerdo con el RGPD y la LOPDGDD, el usuario puede ejercer en
              cualquier momento los siguientes derechos:
            </p>
            <div className="legal-rights-grid">
              <div className="legal-right-card">
                <p className="legal-right-card-name">Acceso</p>
                <p className="legal-right-card-desc">
                  Conocer qué datos personales se tratan y cómo.
                </p>
              </div>
              <div className="legal-right-card">
                <p className="legal-right-card-name">Rectificación</p>
                <p className="legal-right-card-desc">
                  Corregir datos inexactos o incompletos.
                </p>
              </div>
              <div className="legal-right-card">
                <p className="legal-right-card-name">Supresión</p>
                <p className="legal-right-card-desc">
                  Solicitar la eliminación de los datos personales.
                </p>
              </div>
              <div className="legal-right-card">
                <p className="legal-right-card-name">Limitación</p>
                <p className="legal-right-card-desc">
                  Restringir el tratamiento en determinadas circunstancias.
                </p>
              </div>
              <div className="legal-right-card">
                <p className="legal-right-card-name">Portabilidad</p>
                <p className="legal-right-card-desc">
                  Recibir los datos en formato estructurado y de uso común.
                </p>
              </div>
              <div className="legal-right-card">
                <p className="legal-right-card-name">Oposición</p>
                <p className="legal-right-card-desc">
                  Oponerse al tratamiento por motivos relacionados con la
                  situación particular del usuario.
                </p>
              </div>
            </div>
            <p className="legal-text">
              Para ejercer cualquiera de estos derechos, el usuario puede
              dirigirse al titular mediante correo electrónico a{" "}
              <a href="mailto:hola@fredericmartinez.com">
                hola@fredericmartinez.com
              </a>
              , indicando el derecho que desea ejercer y adjuntando una copia
              de su documento de identidad.
            </p>
            <p className="legal-text">
              Asimismo, el usuario tiene derecho a presentar una reclamación
              ante la Agencia Española de Protección de Datos (AEPD) si
              considera que el tratamiento no es conforme a la normativa
              vigente:{" "}
              <a
                href="https://www.aepd.es"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.aepd.es
              </a>
              .
            </p>
          </section>

          {/* 05 */}
          <section id="cookies" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">05</span>
              <h2 className="legal-section-title">Política de cookies</h2>
            </div>
            <p className="legal-text">
              Una cookie es un pequeño archivo de texto que un sitio web
              almacena en el dispositivo del usuario. De conformidad con el
              artículo 22.2 de la LSSI-CE, se informa sobre el uso de cookies
              en este sitio:
            </p>
            <ul className="legal-list">
              <li>
                <span>
                  <strong>Cookies técnicas:</strong> estrictamente necesarias
                  para el correcto funcionamiento del sitio. No requieren
                  consentimiento previo. No recopilan información personal y no
                  se utilizan con fines de seguimiento.
                </span>
              </li>
              <li>
                <span>
                  <strong>Cookies de terceros (Google Fonts):</strong> el sitio
                  utiliza tipografías alojadas en Google Fonts (fonts.googleapis.com
                  y fonts.gstatic.com), lo que puede conllevar la transmisión
                  de la dirección IP del usuario a los servidores de Google.
                  Consulta la política de privacidad de Google en{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    policies.google.com/privacy
                  </a>
                  .
                </span>
              </li>
            </ul>
            <p className="legal-text">
              Este sitio web <strong>no utiliza cookies analíticas,
              publicitarias ni de seguimiento</strong>. No existe un perfil de
              comportamiento del usuario ni se comparten datos con redes
              publicitarias.
            </p>
            <p className="legal-text">
              El usuario puede configurar su navegador para bloquear o eliminar
              cookies. Ten en cuenta que deshabilitar cookies técnicas puede
              afectar al funcionamiento del sitio.
            </p>
          </section>

          {/* 06 */}
          <section id="terceros" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">06</span>
              <h2 className="legal-section-title">Servicios de terceros</h2>
            </div>
            <p className="legal-text">
              Este sitio web hace uso de los siguientes servicios prestados por
              terceros:
            </p>
            <ul className="legal-list">
              <li>
                <span>
                  <strong>Vercel Inc.</strong> (alojamiento y despliegue) —
                  Proveedor estadounidense sujeto a las Cláusulas Contractuales
                  Tipo de la UE. Más información en{" "}
                  <a
                    href="https://vercel.com/legal/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    vercel.com/legal/privacy-policy
                  </a>
                  .
                </span>
              </li>
              <li>
                <span>
                  <strong>Supabase Inc.</strong> (gestión de contenidos del
                  sitio) — Base de datos PostgreSQL utilizada exclusivamente
                  para almacenar los contenidos editoriales del sitio (textos,
                  proyectos, servicios). No almacena datos de usuarios del sitio
                  web público. Más información en{" "}
                  <a
                    href="https://supabase.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    supabase.com/privacy
                  </a>
                  .
                </span>
              </li>
              <li>
                <span>
                  <strong>Google LLC</strong> (tipografía web — Google Fonts) —
                  Se realizan peticiones a los servidores de Google al cargar
                  las fuentes. Más información en{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    policies.google.com/privacy
                  </a>
                  .
                </span>
              </li>
              <li>
                <span>
                  <strong>Proveedor SMTP</strong> (envío de correo electrónico)
                  — El mensaje enviado mediante el formulario de contacto se
                  transmite a través de un servidor de correo saliente (SMTP)
                  configurado por el titular. Los datos del formulario se usan
                  exclusivamente para responder a la consulta y no se almacenan.
                </span>
              </li>
            </ul>
          </section>

          {/* 07 */}
          <section id="propiedad" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">07</span>
              <h2 className="legal-section-title">Propiedad intelectual e industrial</h2>
            </div>
            <p className="legal-text">
              Todos los contenidos de este sitio web —incluyendo, sin carácter
              limitativo, los textos, fotografías, imágenes, vídeos, logotipos,
              iconos, diseños, código fuente y la estructura visual y de
              navegación— son titularidad de Frederic Martínez o de terceros que
              han autorizado su uso, y están protegidos por la legislación
              española e internacional en materia de propiedad intelectual e
              industrial.
            </p>
            <p className="legal-text">
              Queda expresamente prohibida la reproducción, distribución,
              comunicación pública o transformación de los contenidos sin
              autorización expresa y por escrito del titular, salvo en los casos
              previstos por la ley.
            </p>
            <p className="legal-text">
              El usuario puede visualizar los contenidos para uso personal y
              privado. Cualquier otro uso, incluyendo la reproducción con fines
              comerciales, requerirá autorización previa y escrita del titular.
            </p>
          </section>

          {/* 08 */}
          <section id="modificaciones" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">08</span>
              <h2 className="legal-section-title">Modificaciones y legislación aplicable</h2>
            </div>
            <p className="legal-text">
              El titular se reserva el derecho a modificar el presente aviso
              legal y política de privacidad en cualquier momento, con el fin de
              adaptarlo a cambios normativos, criterios jurisprudenciales o
              novedades técnicas. Los cambios serán efectivos desde su
              publicación en este sitio.
            </p>
            <p className="legal-text">
              Las relaciones establecidas entre el titular y los usuarios de
              este sitio web se rigen por lo dispuesto en la normativa española
              vigente, en particular:
            </p>
            <ul className="legal-list">
              <li>
                <span>
                  Reglamento (UE) 2016/679 — RGPD (Reglamento General de
                  Protección de Datos)
                </span>
              </li>
              <li>
                <span>
                  Ley Orgánica 3/2018 — LOPDGDD (Protección de Datos
                  Personales y garantía de los derechos digitales)
                </span>
              </li>
              <li>
                <span>
                  Ley 34/2002 — LSSI-CE (Servicios de la Sociedad de la
                  Información y de Comercio Electrónico)
                </span>
              </li>
              <li>
                <span>
                  Real Decreto Legislativo 1/1996 — Ley de Propiedad
                  Intelectual
                </span>
              </li>
            </ul>
            <p className="legal-text">
              Para la resolución de cualquier controversia derivada del acceso o
              uso de este sitio web, las partes se someten a la jurisdicción de
              los Juzgados y Tribunales de Barcelona, con renuncia expresa a
              cualquier otro fuero que pudiera corresponderles.
            </p>
            <div className="legal-highlight">
              <p>
                ¿Tienes alguna pregunta sobre este aviso legal?{" "}
                <strong>
                  Escríbenos a{" "}
                  <a href="mailto:hola@fredericmartinez.com">
                    hola@fredericmartinez.com
                  </a>
                </strong>
              </p>
            </div>

            <p className="legal-text" style={{ marginTop: 32 }}>
              <Link to="/" style={{ color: "var(--blue-dark)", textDecoration: "underline", textUnderlineOffset: 3 }}>
                ← Volver al inicio
              </Link>
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
