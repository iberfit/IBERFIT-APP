# IBERFIT V6.7 · Método de release

## Cambio clave V6.6

El Excel operativo ya no se valida solo por existencia. Debe tener encabezados reales en fila 5 para las hojas que usa Apps Script.

## Gates

1. Marca.
2. Iconografía.
3. Mock lockdown.
4. Contrato UI → JS → API → Apps Script → Sheet.
5. Headers reales en fila 5.
6. `serverProbe_()` valida headers.
7. `qaServerProbeWithSecret()` restaura secret.
8. Versionado.
9. QA estática.
10. Codex.
11. Cloudflare preview.
12. Staging real.

## Comando

```bash
python 05_QA/qa_static_v6_7.py
```
