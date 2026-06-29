# IBERFIT V9.6.2 Canonical Launch

## Orden exacto

1. Apps Script: reemplazar `Código.gs` por `CODIGO_APPS_SCRIPT_V9_6_2_CANONICAL_LAUNCH.gs`.
2. Ejecutar `adminCanonicalStatusV962()`.
3. Ejecutar `adminRepairClientAccessV962('cynthia.catalan@gmail.com')`.
4. Ejecutar `adminGeminiProbe()`.
5. Si falta volcado completo de datos: ejecutar `adminImportarDatosHistoricosV96()` y luego `adminV96MigrationStatus()`.
6. Implementar nueva versión en el MISMO Web App `/exec`.
7. Cloudflare/GitHub: subir SOLO el contenido del ZIP `IBERFIT_V9_6_2_CANONICAL_LAUNCH_SOLO_CONTENIDO_CLOUDFLARE_APP.zip`.
8. Probar en incógnito App Client y Coach OS.

## Prohibido
- No subir `.gs` a Cloudflare como frontend.
- No volver a usar `02_CLIENTES` / `03_ACCESOS` como fuente operativa.
- No lanzar si Coach OS queda verde vacío o App Client bloquea por diagnóstico pendiente.
