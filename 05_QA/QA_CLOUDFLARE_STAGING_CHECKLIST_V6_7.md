# IBERFIT V6.7 · Checklist staging Cloudflare

## Antes de backend real

- [ ] Cloudflare root: `03_CLOUDFLARE_APP`.
- [ ] Build output: `.`.
- [ ] Preview normal abre login.
- [ ] Preview normal usa real.
- [ ] Preview con `?mock=1` usa mock.
- [ ] `GET /api/ibf` responde JSON.
- [ ] Isotipo real visible.
- [ ] Navegación usa SVG.
- [ ] WhatsApp dice “Enviar por WhatsApp”.
- [ ] Check-in muestra “Molestia general”.

## Sheets

- [ ] Subir `IBERFIT_OS_SHEET_V6_7_RC_PREMIUM.xlsx` a Google Drive.
- [ ] Convertirlo a Google Sheets.
- [ ] Confirmar que fila 5 tiene encabezados reales en:
  - `02_CLIENTES`
  - `03_ACCESOS`
  - `07_FEEDBACK`
  - `08_CHECKIN`
  - `99_LOG`
- [ ] `serverProbe_()` debe validar hojas y headers obligatorios.
- [ ] `qaServerProbeWithSecret(secret)` no debe dejar cambiado el secret.

## Staging real

- [ ] Apps Script `adminSetupWorkerSecret()`.
- [ ] Cloudflare `IBERFIT_WORKER_SECRET`.
- [ ] Cloudflare `APPS_SCRIPT_WEBAPP_URL`.
- [ ] `qaServerProbeWithSecret(secret)` OK.
- [ ] Contraseña real demo creada.
- [ ] Login real OK.
- [ ] Feedback real en `07_FEEDBACK`.
- [ ] Check-in real en `08_CHECKIN`.
