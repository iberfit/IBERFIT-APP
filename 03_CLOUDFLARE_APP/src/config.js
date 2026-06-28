// IBERFIT V7.3 · Interaction Routing Final Candidate configuration
// Default is SAFE: production uses real API. Mock is allowed only on localhost or with ?mock=1 for QA.
export const IBERFIT_CONFIG = {
  appVersion: "V7.3_INTERACTION_ROUTING_FINAL_CANDIDATE",
  whatsappNumber: "56944040032",
  demoLogin: "alejandro.demo@email.com",
  demoPassword: "IBF-DEMO-0000",
  apiPath: "/api/ibf",
  requestTimeoutMs: 12000,
  sessionStorageKey: "IBERFIT_SESSION_V7_3",
  loginStorageKey: "IBERFIT_LOGIN",
};

export function resolveApiMode() {
  const params = new URLSearchParams(window.location.search);
  const host = window.location.hostname;
  const isLocalhost = host === "localhost" || host === "127.0.0.1" || host === "::1";

  // Seguridad V6.7:
  // Mock solo se permite de forma explícita por URL (?mock=1) o en desarrollo local.
  // Producción nunca puede cambiar a mock mediante variables globales.
  if (params.get("mock") === "1") return "mock";
  if (isLocalhost) return "mock";

  return "real";
}
