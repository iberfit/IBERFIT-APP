# Codex Review · IBERFIT V7.3 Session Viewer Final Candidate

No modifiques archivos. Audita.

Verifica:
1. Backend V6.7 preservado: Codigo.gs, Function /api/ibf, Excel operativo.
2. App Client V7.1 visual premium: login, home, semana, sesión, proceso, check-in, canal.
3. Modalidades: presencial, híbrida y online.
4. Mock URLs:
   - /?mock=1&perfil=presencial
   - /?mock=1&perfil=hibrido
   - /?mock=1&perfil=online
5. Check-in mantiene semanaId y contrato V6.7.
6. submitFeedback mantiene contrato.
7. No hay IB/IF falso ni símbolos antiguos.
8. WhatsApp dice Enviar por WhatsApp.
9. Cloudflare Pages: root 03_CLOUDFLARE_APP, output ., /api/* en _routes.json.
10. QA estática v7_1 coherente.

Entrega:
A. Críticos
B. Riesgos altos
C. Problemas UX/marca
D. Problemas contrato
E. Estado mock/staging/producción
F. Próxima acción exacta
