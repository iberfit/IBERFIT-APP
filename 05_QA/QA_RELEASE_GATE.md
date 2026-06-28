# QA Release Gate · IBERFIT V6.7 RC

## Crítico

- [ ] Cloudflare Pages usa root directory `03_CLOUDFLARE_APP`.
- [ ] Build output directory `.`.
- [ ] Mock solo se abre con `?mock=1` o localhost.
- [ ] Producción sin variables no permite login mock.
- [ ] `GET /api/ibf` falla si faltan variables.
- [ ] `IBERFIT_WORKER_SECRET` existe en Cloudflare.
- [ ] `IBERFIT_WORKER_SECRET` existe en Apps Script.
- [ ] Apps Script rechaza requests sin workerSecret.
- [ ] Login real devuelve `sessionToken`.
- [ ] `getHome`, `submitFeedback`, `submitCheckin` rechazan si no hay sesión.
- [ ] Feedback real escribe `CLIENTE_ID`.
- [ ] Feedback valida que sesión pertenece al cliente.
- [ ] Contraseña demo se guarda como hash/salt.
- [ ] WhatsApp contextual abre mensaje.
- [ ] Manifest tiene íconos.

## Experiencia

- [ ] No hay loading infinito.
- [ ] App mock en `?mock=1` funciona.
- [ ] App real falla con mensaje claro si no está configurada.
- [ ] Móvil/tablet/PC sin overflow.
- [ ] Lenguaje transmite IBERFIT: diagnóstico, criterio, seguimiento, ajuste.


## Gate adicional V6.6 · Mock Lockdown

- [ ] `src/config.js` no contiene `window.IBERFIT_API_MODE === "mock"`.
- [ ] Preview normal usa modo real.
- [ ] Preview con `?mock=1` usa modo mock.
- [ ] Localhost usa modo mock.
- [ ] Codex confirma que no queda mock global en producción.
- [ ] GET `/api/ibf` responde desde Function y no desde SPA fallback.


## Gate adicional V6.6 · Brand Lock

- [ ] No existe `marca textual falsa tipo IB`.
- [ ] No existe `marca textual falsa tipo IF`.
- [ ] No existen símbolos genéricos en la navegación (`icono genérico antiguo inicio`, `icono genérico antiguo semana`, `icono genérico antiguo sesión`, `icono genérico antiguo proceso`, `icono genérico antiguo canal`).
- [ ] Los iconos PWA usan isotipo real IBERFIT.
- [ ] El canal dice “Enviar por WhatsApp”.
- [ ] El check-in semanal es visible para el cliente.
- [ ] Codex confirma que no quedan sustitutos falsos de marca.


## Gate adicional V6.6 · Check-in Contract

- [ ] El check-in muestra “Molestia general”.
- [ ] `app.js` lee `ciMolestia`.
- [ ] `submitCheckin` envía `molestiaGeneral`.
- [ ] Backend acepta check-in real.
- [ ] 08_CHECKIN recibe `MOLESTIA_GENERAL`.
