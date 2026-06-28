// IBERFIT V9.3 · App Coach OS Production Candidate configuration
// Default is SAFE: production uses real API. Mock is allowed only on localhost or Cloudflare Pages preview.
export const IBERFIT_CONFIG = {
  appVersion: "V9_3_APP_COACH_OS_PRODUCTION_READY_CANDIDATE",
  whatsappNumber: "56944040032",
  apiPath: "/api/ibf",
  requestTimeoutMs: 12000,
  sessionStorageKey: "IBERFIT_SESSION_V9_3",
  loginStorageKey: "IBERFIT_LOGIN",
};

export function resolveApiMode() {
  const params = new URLSearchParams(window.location.search);
  const host = window.location.hostname;
  const isLocalhost = host === "localhost" || host === "127.0.0.1" || host === "::1";

  const isPagesPreview = host.endsWith(".pages.dev");
  const qaUnlocked = params.get("mock") === "1" && (isLocalhost || isPagesPreview);

  // V9.3: en dominio público/producción el mock no puede activarse por parámetro público.
  // Solo se permite en localhost o preview de Cloudflare Pages.
  if (qaUnlocked || isLocalhost) return "mock";

  return "real";
}
