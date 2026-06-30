// IBERFIT V11.0.0-F7.6.1 · Centro de verificación + trazabilidad + recuperación
// Configuración única de frontend. API real por Cloudflare Pages Function.
export const IBERFIT_CONFIG = Object.freeze({
  appVersion: 'V11.0.0_F7_6_1_VERIFICACION_TRAZABILIDAD',
  apiPath: '/api/ibf',
  requestTimeoutMs: 18000,
  sessionStorageKey: 'IBERFIT_CLIENT_SESSION_V11_F7_6_1',
  coachSessionStorageKey: 'IBERFIT_COACH_SESSION_V11_F7_6_1',
  loginStorageKey: 'IBERFIT_LAST_LOGIN_V11_F7_6_1',
  whatsappNumber: '56944040032',
  coachCanonicalPath: '/coach.html',
  publicAppPath: '/',
  diagnosticoHabilitado: false,
});

export function resolveApiMode() {
  const params = new URLSearchParams(window.location.search);
  const host = window.location.hostname;
  const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  const isPreview = host.endsWith('.pages.dev');
  return (params.get('mock') === '1' && (isLocalhost || isPreview)) || isLocalhost ? 'mock' : 'real';
}
