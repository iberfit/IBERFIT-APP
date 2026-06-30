// IBERFIT V10.0.2 · Dos Apps Rebuild
// Configuración única de frontend. API real por Cloudflare Pages Function.
export const IBERFIT_CONFIG = Object.freeze({
  appVersion: 'V10.0.2_DOS_APPS_REBUILD',
  apiPath: '/api/ibf',
  requestTimeoutMs: 18000,
  sessionStorageKey: 'IBERFIT_CLIENT_SESSION_V10_0_2',
  coachSessionStorageKey: 'IBERFIT_COACH_SESSION_V10_0_2',
  loginStorageKey: 'IBERFIT_LAST_LOGIN_V10_0_2',
  whatsappNumber: '56944040032',
  coachCanonicalPath: '/coach.html',
  publicAppPath: '/',
});

export function resolveApiMode() {
  const params = new URLSearchParams(window.location.search);
  const host = window.location.hostname;
  const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  const isPreview = host.endsWith('.pages.dev');
  return (params.get('mock') === '1' && (isLocalhost || isPreview)) || isLocalhost ? 'mock' : 'real';
}
