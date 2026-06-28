# IBERFIT V7.3 · Interaction Routing Final Candidate

Continuidad sobre V7.2 sin cambios estéticos.

## Cambios

- CTA principal enruta según modalidad.
- Presencial lleva a Semana, porque la ejecución es guiada y no se entrega como sesión autónoma.
- Híbrido y Online abren directamente la primera sesión ejecutable.
- Botón Sesión de sidebar/bottom nav abre sesión ejecutable si existe.
- Si no existe sesión ejecutable, deriva a Semana.
- Sesiones AUTÓNOMA / ONLINE / COMPLEMENTARIA siguen siendo clicables desde Semana.

## No tocado

- Estética V7.2.
- Apps Script.
- Google Sheets.
- api.js.
- Cloudflare Function.
- Contratos submitFeedback / submitCheckin / semanaId.
