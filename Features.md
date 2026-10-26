# Funcionalidades

## [P1] Solicitudes y analítica Moira Ordo

El formulario guarda solicitudes en la bandeja del panel y conserva los avisos SMTP
opcionales. La medición propia registra navegación, conversiones, lectura, tiempo y 404,
con preferencias de privacidad reabribles. Configuración y validación: `docs/integraciones.md`.

| Decisión | Motivo |
| --- | --- |
| D1 · Mantener Remix y React existentes | La integración no requiere migrar el sitio. |
| D2 · Endpoints Remix `/api/lead` y `/api/track` | Adaptar los snippets al servidor existente. |
| D3 · Empresa fijada en servidor | La clave de servicio no permite elegir otra empresa desde el cliente. |
| D4 · Conversión solo después del guardado | Evitar contar intentos fallidos o duplicados. |
| D5 · Medición propia independiente de cookies | Seguir el contrato del snippet y respetar oposición/GPC. |
| D6 · SMTP opcional tras guardar | Un fallo de correo no pierde la solicitud ni induce a reenviarla. |

## [P2] Actualización de CRM y blog público

- Solicitudes con ficha consultada, referrer y cinco UTM. Consentimiento explícito
  versionado, con fecha del servidor; la casilla es opcional para solicitar respuesta.
- Empresa obligatoria en la configuración del servidor y comprobación del módulo CRM.
- Blog público en `/blog` y `/blog/:slug`, paginación, imágenes con alt, Markdown seguro,
  canonical y Open Graph en SSR. Sitemap en `/sitemap.xml`.
- Auditoría de slugs con `npm run audit:blog`; los errores de carga o preflight no se
  convierten en una lista vacía. No se crean publicaciones de ejemplo en Supabase.
- Analítica: la guía recibida no cambia respecto a la integración existente; las nuevas
  rutas usan la medición y el seguimiento de 404 ya instalados.

| Decisión | Motivo |
| --- | --- |
| D7 · Consulta sin consentimiento afirmativo | Seguir el nuevo contrato: responder a una petición no equivale a registrar consentimiento. |
| D8 · Lectura del blog solo con clave pública y filtros de empresa/estado | Mantener RLS y no exponer borradores ni contenido de otra empresa. |
| D9 · Preflight de slugs obligatorio en las rutas | Evitar publicar URLs inválidas o duplicadas. |
| D10 · Mantener las URLs existentes de proyectos/servicios | No modificar enlaces indexados al incorporar el blog. |

## Changelog

- 2026-10-24 · [P1] Implementación de las dos integraciones, banner, política actualizada y pruebas.

- 2026-10-26 · [P2] CRM actualizado, blog público, auditoría y pruebas de SSR de producción.
