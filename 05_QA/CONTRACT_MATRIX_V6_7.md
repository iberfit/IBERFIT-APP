# IBERFIT V6.7 · Matriz de contrato frontend/backend/Sheets

V6.6 endurece el contrato de Google Sheets: los encabezados deben existir como celdas reales en fila 5, no solo como definiciones internas de tabla.

## Hojas leídas/escritas por Apps Script

- `02_CLIENTES`
- `03_ACCESOS`
- `04_PLANES`
- `05_SEMANAS`
- `06_SESIONES`
- `07_FEEDBACK`
- `08_CHECKIN`
- `09_IRI_EVALUACION`
- `99_LOG`

## Feedback post-sesión

| Capa | Campos |
|---|---|
| UI visible | RPE, Fatiga, Energía, Molestia, Comentario |
| ID HTML | `fbRpe`, `fbFatiga`, `fbEnergia`, `fbMolestia`, `fbComment` |
| JS variables | `rpe`, `fatiga`, `energia`, `molestia`, `comment` |
| API action | `submitFeedback` |
| Payload | `sessionId`, `rpe`, `fatiga`, `energia`, `molestia`, `comment` |
| Backend | `submitFeedback_(payload, auth)` |
| Sheet | `07_FEEDBACK` |
| Header row | Fila 5 real |

## Revisión semanal IBERFIT

| Capa | Campos |
|---|---|
| UI visible | Descanso, Fatiga general, Estrés, Energía general, Molestia general, Observación |
| ID HTML | `ciDescanso`, `ciFatiga`, `ciEstres`, `ciEnergia`, `ciMolestia`, `ciObservacion` |
| JS variables | `descanso`, `fatigaGeneral`, `estres`, `energiaGeneral`, `molestiaGeneral`, `observacion` |
| API action | `submitCheckin` |
| Payload | `descanso`, `fatigaGeneral`, `estres`, `energiaGeneral`, `molestiaGeneral`, `observacion` |
| Backend | `submitCheckin_(payload, auth)` |
| Sheet | `08_CHECKIN` |
| Header row | Fila 5 real |


## Gate V6.7 · Check-in vinculado a semana

| Capa | Requisito |
|---|---|
| Apps Script buildClientData_ | Expone `week.id` y `home.semanaId` desde `SEMANA_ID` publicado |
| App Client | Lee `semanaId` desde `state.data.week.id` / `state.data.home.semanaId` |
| API payload | `submitCheckin` envía `semanaId` |
| Backend | Rechaza check-in sin `semanaId` |
| Backend | Valida `SEMANA_ID` + `CLIENTE_ID` + `ESTADO_SEMANA = PUBLICADA` |
| Sheet | `08_CHECKIN.SEMANA_ID` queda materializado |
