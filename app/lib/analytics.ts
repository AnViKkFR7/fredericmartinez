const ENDPOINT = "/api/track";

type EventType = "page_view" | "cta_click";

// Un id aleatorio por pestaña, solo en memoria: ni localStorage ni cookies, así
// no se accede al almacenamiento del visitante y no hace falta consentimiento.
let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) sessionId = crypto.randomUUID();
  return sessionId;
}

function send(eventType: EventType, extra?: { path?: string; event_key?: string }) {
  const body = JSON.stringify({
    event_type: eventType,
    session_id: getSessionId(),
    ...extra,
  });
  // sendBeacon no bloquea la navegación ni se pierde si el visitante cambia de
  // página justo después del clic, a diferencia de un fetch normal.
  navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
}

export function trackPageview(path: string) {
  send("page_view", { path });
}

/** Para eventos que no nacen de un clic, como el resultado de enviar un formulario. */
export function trackEvent(eventKey: string) {
  send("cta_click", { path: window.location.pathname, event_key: eventKey });
}

// Un solo listener delegado para toda la app: cualquier CTA nuevo se mide
// añadiéndole el atributo data-track-event, sin tocar este archivo.
export function initAutoTracking() {
  document.addEventListener("click", (e) => {
    const target = e.target as Element | null;
    const eventKey = target?.closest?.("[data-track-event]")?.getAttribute("data-track-event");
    if (eventKey) trackEvent(eventKey);
  });
}
