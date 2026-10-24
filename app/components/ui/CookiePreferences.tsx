import { useEffect, useRef, useState } from "react";
import { globalPrivacyControl, measurementAllowed, needsDecision, readConsent, writeConsent } from "~/lib/consent";
import { setMeasurement } from "~/lib/analytics";
import "~/styles/CookiePreferences.css";

export const openCookiePreferences = () => window.dispatchEvent(new Event("moira:cookie-preferences"));

export default function CookiePreferences() {
  const [visible, setVisible] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [options, setOptions] = useState({ measurement: true, analytics: false, marketing: false });
  const [gpc, setGpc] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const load = () => {
      const stored = readConsent();
      const privacyControl = globalPrivacyControl();
      setGpc(privacyControl);
      setOptions({ measurement: measurementAllowed(stored), analytics: stored?.analytics ?? false, marketing: stored?.marketing ?? false });
      return stored;
    };
    setVisible(needsDecision(load()));
    const reopen = () => {
      previousFocus.current = document.activeElement as HTMLElement | null;
      load();
      setConfiguring(true);
      setVisible(true);
      requestAnimationFrame(() => heading.current?.focus());
    };
    window.addEventListener("moira:cookie-preferences", reopen);
    return () => window.removeEventListener("moira:cookie-preferences", reopen);
  }, []);

  function save(analytics: boolean, marketing: boolean) {
    const stored = writeConsent({ ...options, measurement: !gpc && options.measurement, analytics, marketing });
    setMeasurement(measurementAllowed(stored));
    setVisible(false);
    previousFocus.current?.focus();
  }

  if (!visible) return null;
  return (
    <section className="cookie-panel" aria-labelledby="cookie-heading" aria-label="Preferencias de privacidad">
      <h2 id="cookie-heading" ref={heading} tabIndex={-1}>Tu privacidad</h2>
      <p>Medimos visitas sin cookies ni identificadores persistentes. Puedes oponerte en «Configurar».
        Las cookies de analítica y publicidad solo se permiten si las aceptas. <a href="/aviso-legal#cookies">Política de cookies</a>.</p>
      {configuring && (
        <div className="cookie-options">
          <label><input type="checkbox" checked disabled /> Necesarias <span>Siempre activas</span></label>
          <label><input type="checkbox" checked={options.measurement} disabled={gpc}
            onChange={(e) => setOptions({ ...options, measurement: e.target.checked })} /> Medición sin cookies
            <span>{gpc ? "Desactivada por Global Privacy Control" : "Visitas, clics y lectura; sin cookies"}</span></label>
          <label><input type="checkbox" checked={options.analytics}
            onChange={(e) => setOptions({ ...options, analytics: e.target.checked })} /> Analítica <span>Cookies de terceros; actualmente no se utilizan</span></label>
          <label><input type="checkbox" checked={options.marketing}
            onChange={(e) => setOptions({ ...options, marketing: e.target.checked })} /> Publicidad <span>Actualmente no se utilizan</span></label>
        </div>
      )}
      <div className="cookie-actions">
        <button type="button" onClick={() => save(true, true)}>Aceptar todas</button>
        <button type="button" onClick={() => save(false, false)}>Solo necesarias</button>
        {configuring
          ? <button type="button" onClick={() => save(options.analytics, options.marketing)}>Guardar preferencias</button>
          : <button type="button" onClick={() => setConfiguring(true)}>Configurar</button>}
      </div>
    </section>
  );
}
