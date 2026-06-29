import { mockData, mockDataPresencial, mockDataHibrido, mockDataOnline } from "./mock-data.js";
import { IBERFIT_CONFIG, resolveApiMode } from "./config.js";

const TIMEOUT_MS = IBERFIT_CONFIG.requestTimeoutMs;

export function currentApiMode() {
  return resolveApiMode();
}

function timeout(ms, action) {
  return new Promise(resolve => setTimeout(() => resolve({
    ok: false,
    status: "TIMEOUT",
    message: "La conexión tardó más de lo esperado."
  }), ms));
}

export async function iberfitApi(action, payload = {}) {
  const mode = resolveApiMode();

  if (mode === "mock") {
    return mockResponse(action, payload);
  }

  const session = readSession();

  const request = fetch(IBERFIT_CONFIG.apiPath, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      action,
      sessionToken: session?.sessionToken || "",
      clientId: session?.clientId || "",
      ...payload
    })
  })
    .then(async response => {
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); }
      catch { data = { ok: false, status: "PARSE_ERROR", message: text.slice(0, 300) }; }
      if (!response.ok && data.ok !== false) {
        data.ok = false;
        data.status = data.status || "HTTP_ERROR";
      }
      return data;
    })
    .catch(error => ({
      ok: false,
      status: "CLIENT_ERROR",
      message: "No pudimos conectar con IBERFIT en este momento."
    }));

  return Promise.race([request, timeout(TIMEOUT_MS, action)]);
}

export function saveSession(data) {
  const session = {
    clientId: data?.client?.id || data?.clientId || "",
    sessionToken: data?.sessionToken || "",
    expiresAt: data?.expiresAt || "",
    clientName: data?.client?.name || ""
  };
  sessionStorage.setItem(IBERFIT_CONFIG.sessionStorageKey, JSON.stringify(session));
  return session;
}

export function readSession() {
  try {
    const raw = sessionStorage.getItem(IBERFIT_CONFIG.sessionStorageKey);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session.sessionToken || !session.clientId) return null;
    if (session.expiresAt && Date.now() > new Date(session.expiresAt).getTime()) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearSession() {
  sessionStorage.removeItem(IBERFIT_CONFIG.sessionStorageKey);
}


function selectedMockData() {
  const params = new URLSearchParams(window.location.search);
  const raw = String(params.get("perfil") || params.get("profile") || "hibrido").trim().toLowerCase();
  if (["presencial", "pres", "p"].includes(raw)) return mockDataPresencial;
  if (["online", "on", "o"].includes(raw)) return mockDataOnline;
  return mockDataHibrido;
}

function mockResponse(action, payload) {
  const activeMockData = selectedMockData();

  if (action === "serverProbe") {
    return {
      ok: true,
      status: "MOCK",
      data: {
        ok: true,
        mode: "mock",
        appVersion: IBERFIT_CONFIG.appVersion,
        message: "Frontend funcionando en modo mock seguro. No hay backend real conectado."
      }
    };
  }

  if (action === "login") {
    const loginOk = String(payload.login || "").trim().length > 0;
    const passOk = String(payload.password || "").trim().length > 0;

    if (!loginOk || !passOk) {
      return {
        ok: false,
        status: "MOCK_INVALID_LOGIN",
        message: "Modo QA: ingresa cualquier usuario y contraseña de prueba no reales."
      };
    }

    return {
      ok: true,
      status: "MOCK",
      data: {
        ...activeMockData,
        sessionToken: "MOCK_SESSION_TOKEN",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      }
    };
  }

  if (action === "getHome") return { ok: true, status: "MOCK", data: activeMockData };
  if (action === "submitFeedback") return { ok: true, status: "MOCK", data: { saved: true, feedbackId: "MOCK-FB" } };
  if (action === "submitCheckin") return { ok: true, status: "MOCK", data: { saved: true, checkinId: "MOCK-CHK" } };

  return { ok: true, status: "MOCK", data: activeMockData };
}
