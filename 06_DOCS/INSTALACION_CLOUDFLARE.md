# Instalación Cloudflare · IBERFIT V6.7 RC

## Configuración correcta

En Cloudflare Pages:

```text
Repository: iberfit-v6-rc
Project root / Root directory: 03_CLOUDFLARE_APP
Framework preset: None / Static HTML
Build command: dejar vacío
Build output directory: .
```

## Variables de entorno obligatorias

```text
APPS_SCRIPT_WEBAPP_URL
IBERFIT_WORKER_SECRET
```

`IBERFIT_WORKER_SECRET` debe ser igual al generado por Apps Script con:

```javascript
adminSetupWorkerSecret()
```

## Modo mock seguro

Producción usa modo real por defecto. V6.2 elimina cualquier override global de mock.

Para QA visual sin backend, abrir:

```text
https://TU-PREVIEW.pages.dev/?mock=1
```

Usuario mock:

```text
alejandro.demo@email.com
```

Contraseña mock:

```text
IBF-DEMO-0000
```

## Verificación API

Antes de publicar:

```text
GET /api/ibf
```

Debe indicar `ready` solo si existen variables reales.


## Verificación V6.2

En el preview normal:

```text
https://TU-PREVIEW.pages.dev/
```

debe usar API real.

En el preview con mock:

```text
https://TU-PREVIEW.pages.dev/?mock=1
```

debe usar mock.

No debe existir ninguna forma de activar mock mediante `window.IBERFIT_API_MODE`.


## Nota V6.6

V6.6 bloquea el uso de logos sustitutos. La App Client debe usar siempre el isotipo real IBERFIT y navegación con iconos SVG semánticos.


## Nota V6.6

El check-in semanal incluye `Molestia general` y envía `molestiaGeneral` al backend para cumplir el contrato de Apps Script.
