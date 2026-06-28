# IBERFIT V6.7 RC · Arquitectura

## Principio estratégico

IBERFIT no es una app de entrenamiento. Es un sistema premium de entrenamiento personal:

```text
Diagnóstico → interpretación → planificación → ejecución → registro → revisión → ajuste
```

## Capas

```text
Cloudflare Pages = experiencia cliente premium
Cloudflare Function = API segura / proxy
Apps Script = backend temporal y automatización
Google Sheets = sistema operativo interno
GitHub = control de versiones
Codex = auditoría técnica
```

## Decisión clave

La App Client no vive en Apps Script. Apps Script solo hace backend.

## Correcciones V6.1

- Producción ya no cae a mock por defecto.
- Mock solo funciona en localhost o con `?mock=1`.
- Worker valida variables y aplica timeout.
- Apps Script exige `workerSecret`.
- Login devuelve sesión temporal.
- Endpoints privados exigen `sessionToken`.
- Feedback/check-in se escriben con `CLIENTE_ID` autenticado.
- Contraseña usa hash + salt en `03_ACCESOS`.


## Corrección V6.2

- Se elimina el override global `window.IBERFIT_API_MODE === "mock"`.
- Mock queda permitido solo en localhost o con `?mock=1`.
- Producción debe caer siempre a API real.


## Nota V6.6

V6.6 bloquea el uso de logos sustitutos. La App Client debe usar siempre el isotipo real IBERFIT y navegación con iconos SVG semánticos.


## Nota V6.6

El check-in semanal incluye `Molestia general` y envía `molestiaGeneral` al backend para cumplir el contrato de Apps Script.
