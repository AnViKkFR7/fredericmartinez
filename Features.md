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

## Changelog

- 2026-10-24 · [P1] Implementación de las dos integraciones, banner, política actualizada y pruebas.
