import { iberfitApi, iberfitGetHealth, saveCoachSession, readCoachSession, clearCoachSession } from './api-v10.js';
import { IBERFIT_CONFIG } from './config-v10.js';

const state = {
  session: null,
  dashboard: null,
  clients: [],
  activeModule: 'dashboard',
  selectedClientId: '',
  workspace: null,
  workspaceTab: 'resumen',
  currentDraft: null,
  lastHealth: null,
};

const MODULES = [
  ['dashboard', 'Panel Hoy'],
  ['clientes', 'Clientes'],
  ['iri', 'IRI'],
  ['bio', 'Bioimpedancia'],
  ['sesion-vivo', 'Sesión presencial'],
  ['sesiones', 'Sesiones'],
  ['cargas', 'Cargas'],
  ['historico', 'Histórico'],
  ['informes', 'Informes'],
  ['biblioteca', 'Biblioteca'],
  ['decisiones', 'Decisiones'],
  ['alertas', 'Alertas'],
  ['accesos', 'Accesos'],
  ['qa', 'QA Sistema'],
];

function $(selector, root = document) { return root.querySelector(selector); }
function $$(selector, root = document) { return Array.from(root.querySelectorAll(selector)); }
function root() { return $('#coachRoot'); }
function esc(value = '') { return String(value ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])); }
function valueOf(...items) { return items.find(v => v !== undefined && v !== null && String(v).trim() !== '') ?? ''; }
function arr(value) { return Array.isArray(value) ? value : []; }
function nowLabel() { return new Date().toLocaleString('es-CL'); }
function safeJson(value) { try { return JSON.stringify(value, null, 2); } catch { return String(value); } }
function clientName(client = {}) { return valueOf(client.name, client.NOMBRE_VISIBLE, client.nombre, client.CLIENTE_ID, client.id, 'Cliente'); }
function clientId(client = {}) { return valueOf(client.id, client.CLIENTE_ID, client.clientId, ''); }
function clientModality(client = {}) { return valueOf(client.modality, client.MODALIDAD, client.modalidad, 'PRESENCIAL'); }
function set(html) { const el = root(); if (!el) throw new Error('coachRoot no existe en el DOM.'); el.innerHTML = html; }
function showLoading(message = 'Cargando Coach OS') { set(`<main class="loading-card"><section><div class="spinner"></div><h1>${esc(message)}</h1><p class="muted">IBERFIT está preparando el sistema interno. Si falla, se mostrará el diagnóstico técnico.</p></section></main>`); }
function showError(title, message, details = null) {
  const detailText = details ? safeJson(details) : '';
  set(`<main class="error-page"><section class="error-card"><span class="pill">Diagnóstico IBERFIT</span><h1>${esc(title)}</h1><p>${esc(message)}</p>${detailText ? `<pre class="debug-panel">${esc(detailText)}</pre>` : ''}<div class="action-row"><button class="btn btn-primary" id="reloadCoach">Recargar sin caché</button><button class="btn btn-ghost" id="openApi">Probar GET API</button><button class="btn btn-outline" id="goLogin">Volver al login</button></div></section></main>`);
  $('#reloadCoach')?.addEventListener('click', () => { window.location.href = `/coach.html?v=${Date.now()}`; });
  $('#openApi')?.addEventListener('click', () => window.open('/api/ibf', '_blank'));
  $('#goLogin')?.addEventListener('click', () => { clearCoachSession(); renderLogin('Sesión local reiniciada.'); });
}
function statusBox(message, type = 'error') { return `<div class="status-box ${type === 'ok' ? 'success-box' : type === 'warn' ? 'warning-box' : ''}">${esc(message)}</div>`; }

window.addEventListener('error', event => {
  console.error('IBERFIT Coach JS error', event.error || event.message);
  if (root()) showError('Coach OS detectó un error de JavaScript', event.message || 'Error no especificado', { stack: event.error?.stack || '', file: event.filename, line: event.lineno, column: event.colno });
});
window.addEventListener('unhandledrejection', event => {
  console.error('IBERFIT Coach promise error', event.reason);
  if (root()) showError('Coach OS detectó una promesa rechazada', event.reason?.message || String(event.reason || 'Error no especificado'), { stack: event.reason?.stack || '' });
});

function renderLogin(message = '') {
  clearCoachSession();
  state.session = null;
  set(`<main class="coach-login-screen"><section class="coach-login-brand"><div class="coach-logo"><img src="/assets/iberfit-isotipo.png" alt="IBERFIT"></div><h1>IBERFIT Coach OS</h1><p>Gestión interna completa: clientes, IRI, bioimpedancia, histórico, cargas, sesión presencial, informes, decisiones, alertas y publicación al cliente.</p><div class="coach-login-points"><span>V10.0.2</span><span>Canonical</span><span>Sin pantalla muda</span><span>Riqueza recuperada</span></div></section><section class="coach-login-card"><h2>Acceso Coach OS</h2><p class="muted">Ruta estable: /coach.html · Ruta limpia física: /coach/</p>${message ? statusBox(message, message.includes('correcta') || message.includes('activa') ? 'ok' : 'error') : ''}<form id="coachLoginForm"><div class="field"><label for="coachLogin">Usuario</label><input id="coachLogin" type="email" autocomplete="username" value="iberfit.cl@gmail.com"></div><div class="field"><label for="coachPassword">Contraseña</label><input id="coachPassword" type="password" autocomplete="current-password" autofocus></div><button class="btn btn-primary btn-full" type="submit">Entrar a Coach OS</button></form><button class="btn btn-ghost btn-full" id="probeBackend" style="margin-top:12px">Verificar backend</button><button class="btn btn-link btn-full" id="clearCoach">Limpiar sesión local</button></section></main>`);
  $('#coachLoginForm')?.addEventListener('submit', doCoachLogin);
  $('#probeBackend')?.addEventListener('click', probeBackendFromLogin);
  $('#clearCoach')?.addEventListener('click', () => { clearCoachSession(); renderLogin('Sesión local eliminada.'); });
}

async function probeBackendFromLogin() {
  showLoading('Verificando API y backend');
  const getHealth = await iberfitGetHealth();
  const postHealth = await iberfitApi('backendHealth', {});
  state.lastHealth = { getHealth, postHealth };
  renderLogin(postHealth.ok !== false ? 'Conexión backend correcta.' : `Backend no responde correctamente: ${postHealth.status || postHealth.message}`);
  const card = $('.coach-login-card');
  if (card) card.insertAdjacentHTML('beforeend', `<pre class="qa-panel debug-panel">${esc(safeJson(state.lastHealth))}</pre>`);
}

async function doCoachLogin(event) {
  event.preventDefault();
  const login = $('#coachLogin')?.value.trim() || '';
  const password = $('#coachPassword')?.value || '';
  if (!login || !password) { renderLogin('Ingresa usuario y contraseña.'); return; }
  showLoading('Validando acceso Coach');
  const response = await iberfitApi('coachLogin', { login, password });
  if (!response || response.ok === false) { renderLogin(response?.message || response?.status || 'No se pudo iniciar sesión Coach.'); return; }
  try {
    state.session = saveCoachSession(response);
  } catch (err) {
    showError('El backend respondió login, pero la sesión Coach está incompleta', err.message, response);
    return;
  }
  await loadDashboard('dashboard');
}

function shell(body, options = {}) {
  const active = options.active || state.activeModule;
  set(`<main class="coach-shell"><aside class="coach-sidebar"><div><div class="brand-mini"><img src="/assets/iberfit-isotipo.png" alt="IBERFIT"><strong>IBERFIT</strong><span>Coach OS V10.0.2</span><span>${esc(state.session?.coachName || 'Coach')}</span></div><nav class="coach-nav">${MODULES.map(([key, label]) => `<button class="${key === active ? 'active' : ''}" data-module="${esc(key)}">${esc(label)}</button>`).join('')}</nav></div><div class="sidebar-footer"><div>MASTER STABLE</div><div>${esc(nowLabel())}</div><button class="btn btn-ghost btn-mini" id="logoutCoach" style="margin-top:12px">Salir</button></div></aside><section class="coach-main"><div class="topbar"><div><span class="pill green">${esc(labelForModule(active))}</span><h1 style="margin:8px 0 0">${esc(options.title || labelForModule(active))}</h1></div><div class="action-row"><button class="btn btn-ghost btn-mini" id="refreshCoach">Actualizar</button><button class="btn btn-outline btn-mini" id="openClientApp">App Client</button></div></div>${body}</section></main>`);
  $$('[data-module]').forEach(button => button.addEventListener('click', () => renderModule(button.dataset.module)));
  $('#logoutCoach')?.addEventListener('click', () => { clearCoachSession(); renderLogin('Sesión Coach cerrada.'); });
  $('#refreshCoach')?.addEventListener('click', () => loadDashboard(state.activeModule));
  $('#openClientApp')?.addEventListener('click', () => window.open('/', '_blank'));
}
function labelForModule(key) { return MODULES.find(m => m[0] === key)?.[1] || 'Coach OS'; }

async function loadDashboard(targetModule = 'dashboard') {
  showLoading('Cargando dashboard Coach');
  const response = await iberfitApi('coachGetDashboard', { coachToken: state.session?.coachToken });
  if (!response || response.ok === false) {
    if (['INVALID_COACH_TOKEN', 'COACH_SESSION_EXPIRED', 'UNAUTHORIZED'].includes(response?.status)) { renderLogin(response?.message || 'Sesión Coach caducada.'); return; }
    showError('No se pudo cargar Coach Dashboard', response?.message || response?.status || 'Error desconocido', response);
    return;
  }
  state.dashboard = response.data || response;
  state.clients = arr(state.dashboard.clients || state.dashboard.clientes).map(normalizeClient);
  renderModule(targetModule);
}

function normalizeClient(client) {
  return {
    ...client,
    id: clientId(client),
    name: clientName(client),
    email: valueOf(client.email, client.EMAIL, client.login, ''),
    modality: clientModality(client),
    objective: valueOf(client.objective, client.OBJETIVO_PRINCIPAL, client.objetivo, ''),
    status: valueOf(client.status, client.ESTADO, client.estado, ''),
    accessStatus: valueOf(client.accessStatus, client.ESTADO_ACCESO, client.acceso, ''),
  };
}

function renderModule(moduleKey) {
  state.activeModule = moduleKey;
  const handlers = {
    dashboard: renderDashboard,
    clientes: renderClients,
    iri: () => renderClientRequired('iri'),
    bio: () => renderClientRequired('bio'),
    'sesion-vivo': renderLiveSession,
    sesiones: renderSessionsModule,
    cargas: () => renderClientRequired('cargas'),
    historico: () => renderClientRequired('historico'),
    informes: () => renderClientRequired('informes'),
    biblioteca: renderLibrary,
    decisiones: renderDecisions,
    alertas: renderAlerts,
    accesos: renderAccesses,
    qa: renderQa,
  };
  (handlers[moduleKey] || renderDashboard)();
}

function renderDashboard() {
  const metrics = state.dashboard?.metrics || state.dashboard?.metricas || {};
  const clients = state.clients;
  shell(`<section class="hero-card"><p>COACH OS</p><h1>Centro de decisión IBERFIT</h1><span>Diagnosticar, planificar, ejecutar, registrar, informar y publicar sin mezclar clientes ni perder criterio.</span></section>${metricGrid([
    ['Clientes', valueOf(metrics.clientes, metrics.clients, clients.length, '-')],
    ['Sesiones publicadas', valueOf(metrics.sesionesPublicadas, metrics.publishedSessions, '-')],
    ['Cargas registradas', valueOf(metrics.cargasRegistradas, metrics.loads, '-')],
    ['Alertas', valueOf(metrics.alertas, metrics.alerts, '-')],
  ])}<section class="module-grid"><article class="app-card"><h2>Prioridad operativa</h2><div class="timeline"><div class="timeline-item"><strong>1. Migración real</strong><p>Ejecutar adminV10ImportHistoricalData() si ficha, histórico y biblioteca siguen vacíos.</p></div><div class="timeline-item"><strong>2. Clientes y acceso</strong><p>Verificar Cynthia = APPCLI-0001 · PRESENCIAL. Nunca permitir cruce con Arleana.</p></div><div class="timeline-item"><strong>3. Publicación con criterio</strong><p>Objetivo, qué observar, cómo ajustar y qué reportar son obligatorios.</p></div></div></article><article class="app-card"><h2>Diagnóstico rápido</h2><p>Usa QA Sistema para comprobar GET API, POST backendHealth y auditoría autenticada.</p><button class="btn btn-primary" id="quickQa">Ejecutar QA rápido</button><div id="quickQaResult"></div></article></section><section class="app-card"><h2>Clientes recientes</h2>${renderClientsMini(clients)}</section>`, { active: 'dashboard', title: 'Panel Hoy' });
  $('#quickQa')?.addEventListener('click', runQuickQa);
}

function renderClientsMini(clients) {
  if (!clients.length) return `<div class="empty-state">El backend no entregó clientes. Verifica coachGetDashboard y migración.</div>`;
  return clients.slice(0, 8).map(client => `<button class="client-row" data-select-client="${esc(client.id)}"><strong>${esc(client.name)}</strong><span>${esc(client.modality)} · ${esc(client.objective || 'Objetivo pendiente')} · ${esc(client.status || 'Estado pendiente')}</span></button>`).join('');
}

function metricGrid(items) {
  return `<section class="metric-grid">${items.map(([label, value]) => `<article class="app-card"><strong class="metric">${esc(value)}</strong><span class="label">${esc(label)}</span></article>`).join('')}</section>`;
}

async function runQuickQa() {
  const target = $('#quickQaResult');
  if (target) target.innerHTML = statusBox('Ejecutando QA...', 'warn');
  const getApi = await iberfitGetHealth();
  const backend = await iberfitApi('backendHealth', {});
  const out = { getApi, backend };
  if (target) target.innerHTML = `<pre class="qa-panel debug-panel">${esc(safeJson(out))}</pre>`;
}

function renderClients() {
  shell(`<section class="hero-card"><p>CLIENTES</p><h1>Ficha, IRI, histórico e informes</h1><span>Selecciona un cliente para recuperar la profundidad técnica completa.</span></section><section class="client-selector"><article class="app-card"><h2>Clientes activos</h2><div class="field"><label>Buscar</label><input id="clientSearch" placeholder="Nombre, email, modalidad, objetivo"></div><div class="client-list" id="clientList">${renderClientsMini(state.clients)}</div></article><article class="app-card" id="clientWorkspace"><h2>Workspace</h2><p>Selecciona un cliente.</p></article></section>`, { active: 'clientes', title: 'Clientes' });
  bindClientList();
  $('#clientSearch')?.addEventListener('input', event => {
    const q = event.target.value.toLowerCase();
    const filtered = state.clients.filter(c => `${c.name} ${c.email} ${c.modality} ${c.objective}`.toLowerCase().includes(q));
    $('#clientList').innerHTML = renderClientsMini(filtered);
    bindClientList();
  });
  if (state.selectedClientId) loadClientWorkspace(state.selectedClientId, 'resumen');
}

function bindClientList() { $$('[data-select-client]').forEach(button => button.addEventListener('click', () => loadClientWorkspace(button.dataset.selectClient, 'resumen'))); }

async function loadClientWorkspace(id, tab = state.workspaceTab || 'resumen') {
  state.selectedClientId = id;
  state.workspaceTab = tab;
  const host = $('#clientWorkspace');
  if (host) host.innerHTML = '<h2>Cargando workspace...</h2><p class="muted">Recuperando ficha, IRI, cargas e histórico.</p>';
  const response = await iberfitApi('coachGetClientWorkspace', { coachToken: state.session?.coachToken, clientId: id });
  if (!response || response.ok === false) {
    const html = `<h2>No se pudo cargar cliente</h2><p>${esc(response?.message || response?.status || 'Error desconocido')}</p><pre class="qa-panel debug-panel">${esc(safeJson(response))}</pre>`;
    if (host) host.innerHTML = html; else shell(`<section class="app-card">${html}</section>`, { active: state.activeModule });
    return;
  }
  state.workspace = normalizeWorkspace(response.data || response);
  renderWorkspace(tab);
}

function normalizeWorkspace(raw = {}) {
  const client = normalizeClient(raw.client || raw.cliente || {});
  return {
    raw,
    client,
    ficha: arr(raw.ficha || raw.profile || raw.fichaCliente),
    iri: raw.iri || raw.diagnosticoIri || raw.diagnostico || {},
    bio: raw.bio || raw.bioimpedancia || {},
    sessions: arr(raw.sessions || raw.sesiones),
    loads: arr(raw.loads || raw.cargas),
    loadHistory: arr(raw.loadHistory || raw.historicoCargas || raw.historico),
    reports: arr(raw.reports || raw.informes),
    feedback: arr(raw.feedback),
    checkins: arr(raw.checkins || raw.checkin),
    decisions: arr(raw.decisions || raw.decisiones),
    alerts: arr(raw.alerts || raw.alertas),
  };
}

function workspaceTabs() {
  return [
    ['resumen', 'Resumen'], ['ficha', 'Ficha'], ['iri', 'IRI'], ['bio', 'Bio'], ['sesiones', 'Sesiones'], ['cargas', 'Cargas'], ['historico', 'Histórico'], ['informes', 'Informes'], ['feedback', 'Feedback'], ['decisiones', 'Decisiones']
  ];
}
function renderWorkspace(tab = 'resumen') {
  if (!state.workspace) return;
  state.workspaceTab = tab;
  const w = state.workspace;
  const body = `<h2>${esc(w.client.name)}</h2><p><strong>ID:</strong> ${esc(w.client.id)} · <strong>Modalidad:</strong> ${esc(w.client.modality)} · <strong>Estado:</strong> ${esc(w.client.status || '-')}</p><p><strong>Objetivo:</strong> ${esc(w.client.objective || 'Pendiente')}</p><div class="coach-tabs">${workspaceTabs().map(([key, label]) => `<button class="${key === tab ? 'active' : ''}" data-wtab="${key}">${esc(label)}</button>`).join('')}</div>${workspaceTabContent(tab, w)}`;
  const host = $('#clientWorkspace');
  if (host) host.innerHTML = body; else shell(`<section class="app-card">${body}</section>`, { active: state.activeModule, title: labelForModule(state.activeModule) });
  $$('[data-wtab]').forEach(button => button.addEventListener('click', () => renderWorkspace(button.dataset.wtab)));
}

function workspaceTabContent(tab, w) {
  if (tab === 'resumen') return `${metricGrid([['IRI', valueOf(w.iri.score, w.iri.IRI_TOTAL, w.iri.total, 'Pendiente')], ['Sesiones', w.sessions.length], ['Cargas', w.loads.length], ['Histórico', w.loadHistory.length]])}<article class="data-card"><h3>Lectura técnica</h3><p>Cliente ${esc(w.client.modality)} con objetivo ${esc(w.client.objective || 'pendiente')}. Revisar IRI, histórico de cargas y feedback antes de progresar.</p></article>`;
  if (tab === 'ficha') return renderKeyValueTable(w.ficha, ['SECCION', 'CAMPO', 'VALOR'], 'Ficha pendiente de migración. Ejecutar adminV10ImportHistoricalData().');
  if (tab === 'iri') return renderIri(w.iri);
  if (tab === 'bio') return renderObjectCard(w.bio, 'Bioimpedancia pendiente.');
  if (tab === 'sesiones') return renderSessionsTable(w.sessions);
  if (tab === 'cargas') return renderGenericTable(w.loads, ['EJERCICIO', 'ULTIMA_CARGA', 'RPE', 'TENDENCIA', 'RECOMENDACION'], 'Sin cargas actuales.');
  if (tab === 'historico') return renderGenericTable(w.loadHistory, ['FECHA_REGISTRO', 'EJERCICIO_TEXTO', 'SERIES', 'REPETICIONES', 'CARGA', 'RPE', 'DECISION_IBERFIT'], 'Histórico pendiente de migración.');
  if (tab === 'informes') return renderGenericTable(w.reports, ['TIPO_INFORME', 'FECHA', 'ESTADO', 'URL_PDF', 'RESUMEN'], 'Sin informes publicados.');
  if (tab === 'feedback') return renderGenericTable([...w.feedback, ...w.checkins], ['FECHA_ENVIO', 'SESION_ID', 'RPE', 'FATIGA', 'ENERGIA', 'COMENTARIO_CLIENTE', 'OBSERVACION_CLIENTE'], 'Sin feedback/check-in.');
  if (tab === 'decisiones') return renderGenericTable(w.decisions, ['FECHA', 'TIPO', 'DECISION_IBERFIT', 'CRITERIO', 'ESTADO'], 'Sin decisiones registradas.');
  return '';
}

function renderClientRequired(tab) {
  if (!state.selectedClientId) {
    renderClients();
    const host = $('#clientWorkspace');
    if (host) host.insertAdjacentHTML('beforeend', statusBox(`Selecciona un cliente para abrir ${labelForModule(state.activeModule)}.`, 'warn'));
    return;
  }
  if (!state.workspace || state.workspace.client.id !== state.selectedClientId) { loadClientWorkspace(state.selectedClientId, tab); return; }
  shell(`<section class="app-card" id="clientWorkspace"></section>`, { active: state.activeModule, title: labelForModule(state.activeModule) });
  renderWorkspace(tab);
}

function renderIri(iri = {}) {
  const total = valueOf(iri.score, iri.total, iri.IRI_TOTAL, 'Pendiente');
  const classification = valueOf(iri.classification, iri.clasificacion, iri.CLASIFICACION, 'Sin clasificación');
  return `<section class="module-grid"><article class="data-card"><h2>IRI</h2><strong class="metric">${esc(total)}</strong><span class="label">${esc(classification)}</span><div class="progress-bar" style="margin-top:12px"><span style="width:${Math.max(0, Math.min(100, Number(total) || 0))}%"></span></div></article><article class="data-card"><h2>Recomendación</h2><p>${esc(valueOf(iri.recommendation, iri.RECOMENDACION, iri.decision, iri.DECISION_IBERFIT, 'Pendiente de informe IRI.'))}</p></article></section><section class="module-grid-3"><article class="data-card"><h3>Contexto</h3><p>${esc(valueOf(iri.context, iri.CONTEXTO, '-'))}</p></article><article class="data-card"><h3>Fuerza</h3><p>${esc(valueOf(iri.strength, iri.FUERZA, '-'))}</p></article><article class="data-card"><h3>Metabólico</h3><p>${esc(valueOf(iri.metabolic, iri.METABOLICO, '-'))}</p></article></section><article class="data-card"><h3>Datos crudos</h3><pre class="qa-panel debug-panel">${esc(safeJson(iri))}</pre></article>`;
}
function renderObjectCard(obj, empty) { if (!obj || Object.keys(obj).length === 0) return `<div class="empty-state">${esc(empty)}</div>`; return `<pre class="qa-panel debug-panel">${esc(safeJson(obj))}</pre>`; }
function renderKeyValueTable(rows, keys, empty) { return renderGenericTable(rows, keys, empty); }
function renderGenericTable(rows, preferredKeys = [], empty = 'Sin datos.') {
  rows = arr(rows);
  if (!rows.length) return `<div class="empty-state">${esc(empty)}</div>`;
  const keys = preferredKeys.filter(k => rows.some(r => r && r[k] !== undefined && r[k] !== null && String(r[k]) !== ''));
  const finalKeys = keys.length ? keys : Object.keys(rows[0] || {}).slice(0, 8);
  return `<div class="table-wrap"><table><thead><tr>${finalKeys.map(k => `<th>${esc(k)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${finalKeys.map(k => `<td>${esc(row?.[k] ?? row?.[k.toLowerCase()] ?? '-')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function renderSessionsTable(rows) { return renderGenericTable(rows, ['TITULO_SESION', 'title', 'ESTADO_SESION', 'status', 'OBJETIVO_SESION', 'PUBLICADO_EN'], 'Sin sesiones.'); }

function renderSessionsModule() {
  const sessions = state.workspace?.sessions || arr(state.dashboard?.sessions || state.dashboard?.sesiones);
  shell(`<section class="hero-card"><p>SESIONES</p><h1>Planificación y publicación</h1><span>Borrador, revisión manual, criterio completo y publicación al cliente.</span></section><section class="module-grid"><article class="app-card"><h2>Crear sesión</h2>${builderForm()}</article><article class="app-card"><h2>Borrador / IA</h2><div id="draftPreview" class="empty-state">Genera una sesión o selecciona un cliente.</div></article></section><section class="app-card"><h2>Sesiones recientes</h2>${renderSessionsTable(sessions)}</section>`, { active: 'sesiones', title: 'Sesiones' });
  bindBuilder();
}
function builderForm() {
  return `<div class="field"><label>Cliente</label><select id="bClient">${state.clients.map(c => `<option value="${esc(c.id)}" ${c.id === state.selectedClientId ? 'selected' : ''}>${esc(c.name)} · ${esc(c.modality)}</option>`).join('')}</select></div><div class="form-grid"><div class="field"><label>Tipo</label><select id="bType"><option>PRESENCIAL</option><option>ONLINE</option><option>HIBRIDO</option></select></div><div class="field"><label>Duración</label><input id="bDuration" value="60 min"></div></div><div class="field"><label>Objetivo de sesión</label><input id="bObjective" placeholder="Ej: técnica de fuerza + tolerancia metabólica"></div><div class="field"><label>Qué observar</label><textarea id="bObserve" placeholder="Técnica, RPE, dolor, tolerancia, descanso..."></textarea></div><div class="field"><label>Cómo ajustar</label><textarea id="bAdjust" placeholder="Criterios de progresión/regresión..."></textarea></div><div class="field"><label>Qué reportar</label><textarea id="bReport" placeholder="Qué debe ver el cliente y qué queda interno..."></textarea></div><div class="action-row"><button class="btn btn-primary" id="aiSession">IA controlada</button><button class="btn btn-ghost" id="saveDraft">Guardar borrador</button><button class="btn btn-outline" id="publishDraft">Publicar</button></div><div id="builderStatus"></div>`;
}
function collectCriterion() {
  const objective = $('#bObjective')?.value || '';
  const observe = $('#bObserve')?.value || '';
  const adjust = $('#bAdjust')?.value || '';
  const report = $('#bReport')?.value || '';
  const criterionText = [`Objetivo: ${objective}`, `Qué observar: ${observe}`, `Cómo ajustar: ${adjust}`, `Qué reportar: ${report}`].join('\n');
  return {
    clientId: $('#bClient')?.value || state.selectedClientId,
    type: $('#bType')?.value || 'PRESENCIAL',
    duration: $('#bDuration')?.value || '',
    objective,
    observe,
    adjust,
    report,
    criterion: criterionText,
    criterionText,
  };
}
function criterionIsComplete(c) { return c.objective.trim() && c.observe.trim() && c.adjust.trim() && c.report.trim(); }
function bindBuilder() {
  $('#aiSession')?.addEventListener('click', async () => {
    const payload = collectCriterion();
    $('#builderStatus').innerHTML = statusBox('Generando propuesta con IA controlada...', 'warn');
    const response = await iberfitApi('coachAiGenerate', { coachToken: state.session?.coachToken, mode: 'SESSION_FULL', ...payload });
    const data = response.data || response;
    if (!response || response.ok === false) { $('#builderStatus').innerHTML = statusBox(response?.message || response?.status || 'No se pudo generar IA.'); return; }
    state.currentDraft = data;
    $('#draftPreview').innerHTML = renderDraftPreview(data);
    if (data.criterion || data.criterio) $('#bObserve').value = $('#bObserve').value || String(data.criterion || data.criterio).slice(0, 500);
    $('#builderStatus').innerHTML = statusBox('Propuesta generada. Revisa antes de guardar/publicar.', 'ok');
  });
  $('#saveDraft')?.addEventListener('click', saveDraft);
  $('#publishDraft')?.addEventListener('click', publishDraft);
}
async function saveDraft() {
  const criterion = collectCriterion();
  if (!criterionIsComplete(criterion)) { $('#builderStatus').innerHTML = statusBox('Falta criterio completo: objetivo, qué observar, cómo ajustar y qué reportar.'); return; }
  const response = await iberfitApi('coachSaveSessionDraft', { coachToken: state.session?.coachToken, ...criterion, draft: state.currentDraft || {} });
  if (!response || response.ok === false) { $('#builderStatus').innerHTML = statusBox(response?.message || response?.status || 'No se pudo guardar borrador.'); return; }
  state.currentDraft = { ...(state.currentDraft || {}), ...criterion, ...(response.data || response) };
  $('#draftPreview').innerHTML = renderDraftPreview(state.currentDraft);
  $('#builderStatus').innerHTML = statusBox('Borrador guardado.', 'ok');
}
async function publishDraft() {
  const criterion = collectCriterion();
  if (!criterionIsComplete(criterion)) { $('#builderStatus').innerHTML = statusBox('No se publica: falta criterio completo.'); return; }
  const sessionId = valueOf(state.currentDraft?.sessionId, state.currentDraft?.id, state.currentDraft?.SESION_ID, '');
  if (!sessionId) { $('#builderStatus').innerHTML = statusBox('Primero guarda el borrador para obtener SESION_ID.'); return; }
  const response = await iberfitApi('coachPublishSession', { coachToken: state.session?.coachToken, sessionId, ...criterion });
  $('#builderStatus').innerHTML = response?.ok === false ? statusBox(response.message || response.status || 'No se pudo publicar.') : statusBox('Sesión publicada al cliente.', 'ok');
}
function renderDraftPreview(data) { return `<h3>${esc(valueOf(data.title, data.TITULO_SESION, 'Sesión IBERFIT'))}</h3><p>${esc(valueOf(data.objective, data.OBJETIVO_SESION, data.criterion, ''))}</p><pre class="qa-panel debug-panel">${esc(safeJson(data))}</pre>`; }

function renderLiveSession() {
  shell(`<section class="hero-card"><p>SESIÓN PRESENCIAL</p><h1>Ejecución en vivo</h1><span>Control de series, carga, RPE, descanso, reemplazos, omitidos y cierre técnico.</span></section><section class="module-grid"><article class="app-card"><h2>Cliente activo</h2><div class="field"><label>Cliente</label><select id="liveClient">${state.clients.map(c => `<option value="${esc(c.id)}" ${c.id === state.selectedClientId ? 'selected' : ''}>${esc(c.name)} · ${esc(c.modality)}</option>`).join('')}</select></div><button class="btn btn-primary" id="loadLiveClient">Cargar workspace</button><div id="liveClientStatus"></div></article><article class="app-card"><h2>Readiness</h2><div class="form-grid"><div class="field"><label>Sueño</label><input id="readySleep" type="number" min="1" max="10"></div><div class="field"><label>Energía</label><input id="readyEnergy" type="number" min="1" max="10"></div><div class="field"><label>Fatiga</label><input id="readyFatigue" type="number" min="1" max="10"></div><div class="field"><label>Molestia</label><input id="readyPain" type="number" min="0" max="10"></div></div><button class="btn btn-ghost" id="calcReadiness">Evaluar readiness</button><div id="readyVerdict" class="empty-state">Pendiente.</div></article></section><section class="app-card"><h2>Registro de ejecución</h2><p>Esta versión deja preparado el módulo vivo. El guardado real debe mapear contra 06 Sesión Presencial y 08 Histórico de Cargas.</p><div class="form-grid-3"><div class="field"><label>Ejercicio</label><input id="liveExercise" placeholder="Sentadilla goblet"></div><div class="field"><label>Series</label><input id="liveSets" placeholder="3"></div><div class="field"><label>Reps/Tiempo</label><input id="liveReps" placeholder="10 / 45s"></div><div class="field"><label>Carga</label><input id="liveLoad" placeholder="12 kg"></div><div class="field"><label>RPE</label><input id="liveRpe" placeholder="7"></div><div class="field"><label>Descanso</label><input id="liveRest" placeholder="90s"></div></div><div class="field"><label>Decisión IBERFIT</label><textarea id="liveDecision" placeholder="Mantener, progresar, reducir, reemplazar..."></textarea></div><button class="btn btn-primary" id="addLiveRow">Añadir registro local</button><div id="liveRows"></div></section>`, { active: 'sesion-vivo', title: 'Sesión presencial' });
  $('#loadLiveClient')?.addEventListener('click', () => loadClientWorkspace($('#liveClient').value, 'resumen'));
  $('#calcReadiness')?.addEventListener('click', () => {
    const sleep = Number($('#readySleep').value || 0), energy = Number($('#readyEnergy').value || 0), fatigue = Number($('#readyFatigue').value || 0), pain = Number($('#readyPain').value || 0);
    const score = sleep + energy + (10 - fatigue) + (10 - pain);
    const verdict = score >= 28 ? 'LISTO' : score >= 20 ? 'AJUSTAR' : 'REDUCIR';
    $('#readyVerdict').innerHTML = `<strong>${verdict}</strong><p>Score operativo: ${score}/40. Usar criterio del coach antes de progresar.</p>`;
  });
  $('#addLiveRow')?.addEventListener('click', () => {
    const row = [$('#liveExercise').value, $('#liveSets').value, $('#liveReps').value, $('#liveLoad').value, $('#liveRpe').value, $('#liveRest').value, $('#liveDecision').value];
    const current = $('#liveRows').innerHTML || '';
    $('#liveRows').innerHTML = current + `<div class="data-card" style="margin-top:10px"><strong>${esc(row[0] || 'Ejercicio')}</strong><p>${esc(row.slice(1,6).filter(Boolean).join(' · '))}</p><p>${esc(row[6] || '')}</p></div>`;
  });
}

function renderLibrary() {
  const library = arr(state.dashboard?.library || state.dashboard?.biblioteca || state.workspace?.raw?.library || []);
  shell(`<section class="hero-card"><p>BIBLIOTECA</p><h1>Ejercicios y multimedia</h1><span>Debe recuperar los ~200 ejercicios migrados, patrones, regresiones, progresiones e indicaciones técnicas.</span></section><section class="app-card"><h2>Biblioteca recibida</h2>${renderGenericTable(library, ['NOMBRE_EJERCICIO', 'PATRON', 'ZONA', 'MATERIAL', 'NIVEL', 'INDICACIONES_TECNICAS', 'REGRESION', 'PROGRESION'], 'Biblioteca no entregada por dashboard. Ejecutar migración o endpoint específico.')}</section>`, { active: 'biblioteca', title: 'Biblioteca' });
}
function renderDecisions() { const rows = arr(state.workspace?.decisions || state.dashboard?.decisions || state.dashboard?.decisiones); shell(`<section class="hero-card"><p>DECISIONES</p><h1>Registro de criterio</h1><span>Cada ajuste relevante debe quedar trazado.</span></section><section class="app-card">${renderGenericTable(rows, ['FECHA', 'CLIENTE_ID', 'TIPO', 'DECISION_IBERFIT', 'CRITERIO', 'ESTADO'], 'Sin decisiones recibidas.')}</section>`, { active: 'decisiones', title: 'Decisiones' }); }
function renderAlerts() { const rows = arr(state.workspace?.alerts || state.dashboard?.alerts || state.dashboard?.alertas); shell(`<section class="hero-card"><p>ALERTAS</p><h1>Prioridad y riesgo operativo</h1><span>Alertas de adherencia, ausencia, dolor, carga o información incompleta.</span></section><section class="app-card">${renderGenericTable(rows, ['FECHA', 'CLIENTE_ID', 'TIPO_ALERTA', 'PRIORIDAD', 'DESCRIPCION', 'ESTADO'], 'Sin alertas recibidas.')}</section>`, { active: 'alertas', title: 'Alertas' }); }
function renderAccesses() { const rows = arr(state.dashboard?.accesses || state.dashboard?.accesos); shell(`<section class="hero-card"><p>ACCESOS</p><h1>Control de identidad</h1><span>Verificar acceso activo, cliente correcto y cero sesiones contaminadas.</span></section><section class="app-card">${renderGenericTable(rows, ['CLIENTE_ID', 'LOGIN', 'ROL_ACCESO', 'ESTADO_ACCESO', 'ULTIMO_ACCESO'], 'Accesos no entregados al frontend. Mantener revisión en Sheets/admin audit.')}</section>`, { active: 'accesos', title: 'Accesos' }); }

function renderQa() {
  shell(`<section class="hero-card"><p>QA SISTEMA</p><h1>Auditoría antes de cierre</h1><span>Sin QA verde no se declara estable.</span></section><section class="module-grid"><article class="app-card"><h2>Pruebas</h2><div class="action-row"><button class="btn btn-primary" id="qaGet">GET /api/ibf</button><button class="btn btn-primary" id="qaPost">POST backendHealth</button><button class="btn btn-primary" id="qaAudit">adminV10SystemAudit</button></div><div id="qaStatus"></div></article><article class="app-card"><h2>Criterios de aprobación</h2><ul><li>/api/ibf devuelve V10.0.2 o superior.</li><li>POST backendHealth responde JSON en menos de 5 s.</li><li>Cynthia resuelve APPCLI-0001 · PRESENCIAL.</li><li>Sin sesiones contaminadas.</li><li>Feedback/check-in escriben headers canónicos.</li></ul></article></section><section class="app-card"><h2>Resultado</h2><pre class="qa-panel debug-panel" id="qaOutput">Pendiente.</pre></section>`, { active: 'qa', title: 'QA Sistema' });
  $('#qaGet')?.addEventListener('click', async () => { $('#qaOutput').textContent = safeJson(await iberfitGetHealth()); });
  $('#qaPost')?.addEventListener('click', async () => { $('#qaOutput').textContent = safeJson(await iberfitApi('backendHealth', {})); });
  $('#qaAudit')?.addEventListener('click', async () => { $('#qaOutput').textContent = safeJson(await iberfitApi('adminV10SystemAudit', { coachToken: state.session?.coachToken })); });
}

function boot() {
  try {
    if (!root()) throw new Error('No se encontró #coachRoot.');
    showLoading('Iniciando Coach OS');
    const existing = readCoachSession();
    if (!existing) { renderLogin(); return; }
    state.session = existing;
    loadDashboard('dashboard');
  } catch (err) {
    showError('No se pudo iniciar Coach OS', err.message, { stack: err.stack });
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
