// lib/leads.ts — a copiar en el proyecto de CADA web de empresa.
// Código idéntico para todas salvo la variable de entorno VITE_COMPANY_ID.
//
// Envía el formulario de contacto a /api/lead, que lo guarda en la bandeja
// de solicitudes del admin panel.
//
// Variable de entorno requerida (esta sí con prefijo VITE_, es pública):
//   VITE_COMPANY_ID   (uuid de esta empresa en la tabla companies)
const ENDPOINT = '/api/lead'
import { COMPANY_ID } from './company'

export interface LeadInput {
  source_item?: string
  consent_given?: boolean
  consent_text_version?: string
  name: string
  email?: string
  phone?: string
  message?: string
  /** Campo trampa: debe llegar vacío. Ver el input oculto del formulario. */
  company_website?: string
}

export type LeadResult =
  | { ok: true }
  | { ok: false; reason: 'invalid' | 'network' | 'server' }

/**
 * Envía una solicitud. A diferencia de la analítica no usa sendBeacon:
 * aquí hay que saber si ha llegado para poder decírselo a la persona.
 */
export async function submitLead(input: LeadInput): Promise<LeadResult> {
  if (!COMPANY_ID) {
    console.warn('[leads] VITE_COMPANY_ID no está configurado — solicitud descartada')
    return { ok: false, reason: 'invalid' }
  }
  if (!input.name?.trim() || (!input.email?.trim() && !input.phone?.trim())) {
    return { ok: false, reason: 'invalid' }
  }

  try {
    const params = new URLSearchParams(window.location.search)
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        company_id: COMPANY_ID,
        ...input,
        source_path: window.location.pathname,
        source_campaign: params.get('utm_campaign') ?? undefined,
        source_referrer: document.referrer || undefined,
        source_utm_source: params.get('utm_source') ?? undefined,
        source_utm_medium: params.get('utm_medium') ?? undefined,
        source_utm_term: params.get('utm_term') ?? undefined,
        source_utm_content: params.get('utm_content') ?? undefined,
      }),
    })
    if (response.status === 201) {
      // Avisa a la analítica (lib/analytics.ts, si está instalada) de que ha
      // habido un envío. Se hace AQUÍ, tras la respuesta del servidor, y no en
      // el clic del botón: así el número de la analítica es el de solicitudes
      // que de verdad llegaron a la bandeja, y no el de intentos. Es un evento
      // del DOM para que este fichero no dependa de analytics.ts.
      window.dispatchEvent(new CustomEvent('moira:lead-sent'))
      return { ok: true }
    }
    if (response.status === 200) return { ok: true } // Honeypot: no conversion event.
    return { ok: false, reason: response.status === 400 ? 'invalid' : 'server' }
  } catch {
    return { ok: false, reason: 'network' }
  }
}
