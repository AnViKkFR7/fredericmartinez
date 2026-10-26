# Integraciones de solicitudes y analítica

Implementadas sobre Remix, manteniendo React y el diseño existentes. Los documentos
`LEADS_INTEGRATION.md` y `ANALYTICS_INTEGRATION.md` describen el contrato de Moira Ordo;
los snippets originales se han adaptado a las resource routes de esta aplicación.

## Configuración

Configurar en el servidor local y en el hosting, sin publicar secretos:

| Variable | Uso |
| --- | --- |
| `SUPABASE_URL` | Instancia de Supabase del panel. Si está vacía se utiliza `VITE_SUPABASE_URL`, por compatibilidad con la configuración existente. |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privada del servidor de esa instancia. Nunca usar un prefijo `VITE_`. |
| `ANALYTICS_SALT` | Secreto aleatorio exclusivo de este entorno. Necesario para medir. |
| `VITE_COMPANY_ID` | UUID público de la empresa. Obligatorio y válido en servidor para aceptar solicitudes. El ID de Frederic es `40e02f2e-8863-4d3a-9bc8-352223d9aab0`; debe coincidir en build y servidor. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Aviso por email opcional, conservado del formulario anterior. |

Para generar una sal: `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
Guardar el resultado en `ANALYTICS_SALT` del servidor. No compartirlo ni añadirlo al repositorio.
Recompilar si cambia `VITE_COMPANY_ID`.

El backend del panel debe tener la tabla `lead` y las migraciones de analítica indicadas
en la guía: `ANALYTICS_PRIVACY_UPGRADE.sql`, `ANALYTICS_ENGAGEMENT.sql` y
`ANALYTICS_AGGREGATION.sql`. La rotación/eliminación de sales, el límite de 500 eventos
por visitante/día, la purga a 35 días y los resúmenes se ejecutan allí. Este repositorio
consume esos contratos y no modifica el panel ni su base de datos.

## Solicitudes

- El modal usa `submitLead` → `POST /api/lead` → tabla `lead`.
- Nombre y email o teléfono, validación del servidor, límites del snippet,
  casilla de consentimiento opcional con versión del texto y honeypot fuera de pantalla.
- Se añaden ruta, referrer y los cinco UTM de la URL al enviar. En fichas se añade el título y segmento público de la ruta como `source_item`. Sin almacenamiento persistente de atribución.
- Se fija la empresa del lado servidor; una petición no puede elegir otra bandeja.
- Solo un `201` dispara `moira:lead-sent`, que produce `form_submit`. El honeypot
  devuelve `200` sin guardar ni contar una conversión. Un error de BD nunca muestra éxito.
- El aviso SMTP se intenta después del guardado. Si falla, la solicitud sigue guardada;
  no hay cola de reintento de correo en esta web.
- `/contact` permanece como alias para clientes anteriores. Los formularios URL-encoded
  pueden usar `nombre` y `mensaje`, y pueden enviar `consent_given` y `consent_text_version`; la ausencia de consentimiento no bloquea la solicitud.

## Medición y privacidad

- Inicio en `entry.client.tsx` antes de hidratar. Vistas por navegación de Remix,
  sin duplicados de StrictMode; detección de 404 en el error boundary.
- Clics `tel:`, `mailto:`, eventos `data-track-event`, scroll 25/50/75/100 y
  tiempo visible. Los eventos propios necesitan estar activos en el panel.
- `POST /api/track` limpia rutas y origen, descarta bots/rutas internas/peticiones
  de otra web, calcula el visitante en servidor con la RPC `analytics_salt` y HMAC diario,
  y usa geolocalización y dispositivo del servidor. Los fallos responden `204`.
- El navegador solo envía eventos en builds de producción (`import.meta.env.PROD`).
  No usar builds de preview con credenciales de producción si se quiere excluir su tráfico.
- Medición propia activa por defecto; oposición inmediata y GPC tanto en cliente como servidor.
  No guarda cookies, `session_id` ni identificadores persistentes de visitante.
- Banner después de hidratar: necesarias, medición sin cookies, analítica y publicidad.
  «Solo necesarias» conserva la opción de medición. Decisión versionada y válida un año;
  el almacenamiento local se usa exclusivamente para guardar las preferencias.
- Preferencias reabribles en el pie de todas las páginas y desde la política de cookies.
- No se cargan GA4, Meta ni los anteriores componentes de medición de Vercel.
  Los permisos de analítica/publicidad quedan preparados, sin instalar proveedores nuevos.

## Verificación

`npm test`, `npm run typecheck`, `npm run build`.
Las pruebas usan el transporte de Supabase simulado; no escriben solicitudes ni visitas reales.
Cubren validación, aislamiento por empresa, privacidad, rotación de hashes, conversiones,
rechazo de bots, configuración ausente y fallos del backend.

Para comprobar la conexión real tras configurar el hosting:

1. Enviar una solicitud de prueba y comprobarla en «Solicitudes» de la empresa.
2. En una build de producción, navegar, clicar un email/teléfono y consultar «Analítica».
3. Desactivar «Medición sin cookies» y comprobar que dejan de salir peticiones a `/api/track`.

El guardado real en el panel queda pendiente de verificar con su configuración; las pruebas
automatizadas no confirman que las migraciones estén aplicadas en la instancia remota.


## Actualización 2026-10-26: CRM

El servidor consulta la empresa configurada y `company_modules` antes de insertar.
Un módulo `crm` desactivado o un fallo al comprobarlo devuelve `503`.
Un `VITE_COMPANY_ID` ausente o inválido también devuelve `503`, sin fallback.

Se escriben `source_item`, `source_referrer`, `source_campaign` (UTM campaign),
`source_utm_source`, `source_utm_medium`, `source_utm_term` y `source_utm_content`.
Nunca se acepta `contact_id`: el backend crea/enlaza el contacto mediante sus triggers.
Los textos de atribución son declarados por el navegador, no datos verificados.

`consent_given` solo es verdadero con casilla marcada y versión no vacía.
La fecha y `consent_source=public_contact_form` se fijan en el servidor; sin aceptación,
fecha, origen y versión quedan a null. La versión actual del texto está en `leadCore.ts`.

Requisitos remotos: `CRM_CONTACTS_PIPELINE.sql` y `CRM_LEAD_ITEM_ATTRIBUTION.sql`.
Se ha comprobado la existencia de las columnas necesarias mediante consultas sin filas;
no se han aplicado migraciones ni insertado solicitudes reales.

## Blog

- `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`: lectura pública con RLS. Nunca usar la
  clave de servicio para consultar el blog. `PUBLIC_SITE_URL` fija el dominio canónico;
  por defecto es `https://fredericmartinez.com`.
- `/blog` lista 12 entradas por página (`?page=2`); `/blog/:slug` entrega el artículo
  desde Remix con título SEO, descripción, canonical y Open Graph en el HTML inicial.
- Solo se leen posts publicados de esta empresa. Las imágenes se consultan únicamente
  para esos IDs, se filtran por tipo y se ordenan por `sort_order`. Se respeta el alt.
- Markdown con HTML desactivado y transformación segura de URLs de `react-markdown`.
  No se usa `dangerouslySetInnerHTML`. Se conservan fecha de publicación y slugs del panel;
  las variantes de mayúsculas redirigen permanentemente al slug almacenado.
- `/sitemap.xml` incluye páginas principales y todos los artículos publicados válidos.
  No incluye borradores, archivados ni entradas de otras empresas.
- Antes de publicar: aplicar `CONTENT_SEO_FIELDS.sql` y ejecutar el SQL completo
  `CONTENT_SEO_FIELDS_AUDIT.sql` en el panel, como indica la guía. `npm run audit:blog`
  permite comprobar además los slugs publicados de esta empresa con la clave pública.
  Las propias rutas bloquean la carga ante slugs inválidos o duplicados.
- Comprobación remota del 26/10/2026: columnas de blog disponibles, 0 posts publicados
  para esta empresa y 0 incidencias de slugs. La interfaz muestra el estado vacío real.
- Pruebas: `npm test`, `npm run typecheck`, `npm run build` y después `npm run test:ssr`.
  La última ejecuta el renderer de producción con un backend simulado: comprueba el HTML
  sin ejecutar JavaScript, un único título, canonical, OG, Markdown, 404 y sitemap.
