// IBERFIT V10.0.1 · Master Stable Release configuration
// Producción: API real vía Cloudflare Pages Function. Mock solo localhost / preview con ?mock=1.
export const IBERFIT_CONFIG = Object.freeze({
  appVersion: 'V10.0.1_MASTER_STABLE_RELEASE',
  apiPath: '/api/ibf',
  requestTimeoutMs: 15000,
  sessionStorageKey: 'IBERFIT_CLIENT_SESSION_V10',
  coachSessionStorageKey: 'IBERFIT_COACH_SESSION_V10_0_1',
  loginStorageKey: 'IBERFIT_LAST_LOGIN_V10',
  whatsappNumber: '56944040032',
});

export function resolveApiMode() {
  const params = new URLSearchParams(window.location.search);
  const host = window.location.hostname;
  const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  const isPreview = host.endsWith('.pages.dev');
  return (params.get('mock') === '1' && (isLocalhost || isPreview)) || isLocalhost ? 'mock' : 'real';
}
