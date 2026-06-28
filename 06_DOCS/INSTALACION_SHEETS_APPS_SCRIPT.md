# Instalación Google Sheets + Apps Script · IBERFIT V6.7 RC

1. Subir `IBERFIT_OS_SHEET_V6_7_RC_PREMIUM.xlsx` a Google Drive.
2. Abrir como Google Sheets.
3. Extensiones → Apps Script.
4. Pegar `02_APPS_SCRIPT_BACKEND/Codigo.gs`.
5. Ejecutar:

```javascript
adminSetupWorkerSecret()
```

6. Copiar `workerSecret` en Cloudflare como variable `IBERFIT_WORKER_SECRET`.
7. Ejecutar:

```javascript
qaServerProbeWithSecret()
```

8. Crear contraseña real demo:

```javascript
adminCreatePassword_APPCLI0001()
```

9. Implementar como aplicación web.
10. Copiar URL `/exec` en Cloudflare como:

```text
APPS_SCRIPT_WEBAPP_URL
```

## Importante

- No usar mock para producción.
- No pegar contraseñas reales en chats.
- Apps Script valida `workerSecret`.
- La contraseña no se guarda en texto plano: se guarda `PASSWORD_HASH` + `SALT`.


## Nota V6.6

V6.6 bloquea el uso de logos sustitutos. La App Client debe usar siempre el isotipo real IBERFIT y navegación con iconos SVG semánticos.


## Nota V6.6

El check-in semanal incluye `Molestia general` y envía `molestiaGeneral` al backend para cumplir el contrato de Apps Script.
