import { IBERFIT_CONFIG, resolveApiMode } from './config-v10.js';

export const apiMode = resolveApiMode();

function withTimeout(promise, ms, label = 'IBERFIT_TIMEOUT') {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(label)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

export async function iberfitApi(action, payload = {}) {
  if (apiMode === 'mock') return mockResponse(action, payload);
  const body = { action, ...payload, appVersion: IBERFIT_CONFIG.appVersion };
  const res = await withTimeout(fetch(IBERFIT_CONFIG.apiPath, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }), IBERFIT_CONFIG.requestTimeoutMs, `Timeout al ejecutar ${action}`);
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; }
  catch (err) {
    return { ok: false, status: 'NON_JSON_RESPONSE', message: 'La API devolvió una respuesta no JSON.', httpStatus: res.status, preview: text.slice(0, 400) };
  }
  // Cloudflare wrapper: { ok, data: { ok, status, data } }
  if (json && json.service && json.data && typeof json.data === 'object' && ('ok' in json.data || 'status' in json.data || 'data' in json.data)) {
    const inner = json.data;
    return { ...inner, _edge: { ok: json.ok, requestId: json.requestId, upstreamStatus: json.upstreamStatus } };
  }
  return json;
}

export function saveClientSession(data = {}) {
  const payload = data.data || data;
  const client = payload.client || payload.cliente || {};
  const session = {
    sessionToken: payload.sessionToken || payload.token || '',
    clientId: client.id || payload.clientId || '',
    clientName: client.name || payload.clientName || '',
    clientEmail: client.email || payload.email || '',
    expiresAt: payload.expiresAt || '',
  };
  if (!session.sessionToken || !session.clientId) throw new Error('SESSION_PAYLOAD_INCOMPLETE');
  sessionStorage.setItem(IBERFIT_CONFIG.sessionStorageKey, JSON.stringify(session));
  return session;
}
export function readClientSession() {
  try {
    const raw = sessionStorage.getItem(IBERFIT_CONFIG.sessionStorageKey);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s.sessionToken || !s.clientId) return null;
    if (s.expiresAt && Date.now() > new Date(s.expiresAt).getTime()) { clearClientSession(); return null; }
    return s;
  } catch { return null; }
}
export function clearClientSession() { sessionStorage.removeItem(IBERFIT_CONFIG.sessionStorageKey); }

export function saveCoachSession(data = {}) {
  const payload = data.data || data;
  const coach = payload.coach || {};
  const session = {
    coachToken: payload.coachToken || payload.token || '',
    coachName: coach.name || payload.coachName || 'Coach IBERFIT',
    expiresAt: payload.expiresAt || '',
  };
  if (!session.coachToken) throw new Error('COACH_SESSION_PAYLOAD_INCOMPLETE');
  sessionStorage.setItem(IBERFIT_CONFIG.coachSessionStorageKey, JSON.stringify(session));
  return session;
}
export function readCoachSession() {
  try {
    const raw = sessionStorage.getItem(IBERFIT_CONFIG.coachSessionStorageKey);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s.coachToken) return null;
    if (s.expiresAt && Date.now() > new Date(s.expiresAt).getTime()) { clearCoachSession(); return null; }
    return s;
  } catch { return null; }
}
export function clearCoachSession() { sessionStorage.removeItem(IBERFIT_CONFIG.coachSessionStorageKey); }

function mockResponse(action, payload) {
  if (action === 'health' || action === 'backendHealth') return Promise.resolve({ ok: true, status: 'MOCK', data: { version: IBERFIT_CONFIG.appVersion }});
  return Promise.resolve({ ok: false, status: 'MOCK_DISABLED', message: 'Mock mínimo. Usa producción para datos reales.' });
}
