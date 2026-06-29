# IBERFIT V9.6.2 · Canonical Launch

Versión de lanzamiento para eliminar la duplicidad operativa legacy/nuevo.

## Decisiones
- Fuente única de verdad: pestañas reales 01–26 + 97/98.
- Legacy queda archivado/oculto, no eliminado.
- Backend App Client lee solo `01 Clientes` y `21 Accesos`.
- Diagnóstico pendiente no bloquea login.
- Se mantiene IA Planificador + Gemini/local fallback de V9.6.1.

## Funciones clave
- `adminCanonicalStatusV962()`
- `adminRepairClientAccessV962(email)`
- `adminImportarDatosHistoricosV96()` si aún faltan ficha/histórico/biblioteca/multimedia.

## Regla de lanzamiento
ACCESO ACTIVO + DIAGNÓSTICO PENDIENTE = ENTRA.
