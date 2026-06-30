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
  liveExecution: null,
  liveRows: [],
};

const MODULES = [
  ['dashboard', 'Panel principal'],
  ['clientes', 'Clientes'],
  ['iri', 'IRI'],
  ['bio', 'Bioimpedancia'],
  ['sesion-vivo', 'Sesión presencial'],
  ['sesiones', 'Sesiones'],
  ['cargas', 'Cargas'],
  ['historico', 'Histórico'],
  ['informes', 'Informes'],
  ['biblioteca', 'Biblioteca'],
  ['multimedia', 'Multimedia'],
  ['decisiones', 'Decisiones'],
  ['aprendizaje', 'Aprendizaje'],
  ['alertas', 'Alertas'],
  ['accesos', 'Accesos'],
  ['actividad', 'Actividad externa'],
  ['experiencia', 'Experiencia premium'],
  ['qa', 'Control del sistema'],
];

const CAMPOS_BIOIMPEDANCIA_COMPLETA = Object.freeze([
  { key:'pesoKg', label:'Peso', unit:'kg', group:'Composición básica' },
  { key:'imc', label:'IMC', unit:'kg/m²', group:'Composición básica' },
  { key:'porcentajeGrasa', label:'Grasa corporal', unit:'%', group:'Composición básica' },
  { key:'masaGrasaKg', label:'Masa grasa', unit:'kg', group:'Composición básica' },
  { key:'masaLibreGrasaKg', label:'Masa libre de grasa', unit:'kg', group:'Composición básica' },
  { key:'masaMagraKg', label:'Masa magra', unit:'kg', group:'Composición básica' },
  { key:'masaMuscularKg', label:'Masa muscular', unit:'kg', group:'Músculo' },
  { key:'masaMuscularEsqueleticaKg', label:'Masa muscular esquelética', unit:'kg', group:'Músculo' },
  { key:'porcentajeMusculo', label:'Músculo', unit:'%', group:'Músculo' },
  { key:'masaOseaKg', label:'Masa ósea estimada', unit:'kg', group:'Músculo' },
  { key:'proteinaPct', label:'Proteína', unit:'%', group:'Músculo' },
  { key:'mineralesKg', label:'Minerales', unit:'kg', group:'Músculo' },
  { key:'aguaCorporalPct', label:'Agua corporal', unit:'%', group:'Agua' },
  { key:'aguaCorporalKg', label:'Agua corporal total', unit:'kg', group:'Agua' },
  { key:'aguaIntracelularKg', label:'Agua intracelular', unit:'kg', group:'Agua' },
  { key:'aguaExtracelularKg', label:'Agua extracelular', unit:'kg', group:'Agua' },
  { key:'relacionAguaExtracelularTotal', label:'Relación agua extracelular/total', unit:'', group:'Agua' },
  { key:'grasaVisceralNivel', label:'Grasa visceral', unit:'nivel', group:'Riesgo/Metabolismo' },
  { key:'areaGrasaVisceralCm2', label:'Área grasa visceral', unit:'cm²', group:'Riesgo/Metabolismo' },
  { key:'metabolismoBasalKcal', label:'Metabolismo basal', unit:'kcal/día', group:'Riesgo/Metabolismo' },
  { key:'edadMetabolica', label:'Edad metabólica', unit:'años', group:'Riesgo/Metabolismo' },
  { key:'indiceCinturaCadera', label:'Índice cintura/cadera', unit:'', group:'Riesgo/Metabolismo' },
  { key:'anguloFase', label:'Ángulo de fase', unit:'°', group:'Calidad celular' },
  { key:'impedanciaOhm', label:'Impedancia', unit:'Ω', group:'Calidad celular' },
  { key:'puntuacionEquipo', label:'Puntuación del equipo', unit:'', group:'Calidad celular' },
  { key:'masaMagraBrazoDerechoKg', label:'Masa magra brazo derecho', unit:'kg', group:'Segmental' },
  { key:'masaMagraBrazoIzquierdoKg', label:'Masa magra brazo izquierdo', unit:'kg', group:'Segmental' },
  { key:'masaMagraPiernaDerechaKg', label:'Masa magra pierna derecha', unit:'kg', group:'Segmental' },
  { key:'masaMagraPiernaIzquierdaKg', label:'Masa magra pierna izquierda', unit:'kg', group:'Segmental' },
  { key:'masaMagraTroncoKg', label:'Masa magra tronco', unit:'kg', group:'Segmental' },
  { key:'grasaBrazoDerechoPct', label:'Grasa brazo derecho', unit:'%', group:'Segmental' },
  { key:'grasaBrazoIzquierdoPct', label:'Grasa brazo izquierdo', unit:'%', group:'Segmental' },
  { key:'grasaPiernaDerechaPct', label:'Grasa pierna derecha', unit:'%', group:'Segmental' },
  { key:'grasaPiernaIzquierdaPct', label:'Grasa pierna izquierda', unit:'%', group:'Segmental' },
  { key:'grasaTroncoPct', label:'Grasa tronco', unit:'%', group:'Segmental' },
  { key:'balanceDerechaIzquierda', label:'Balance derecha/izquierda', unit:'', group:'Segmental' },
  { key:'observacionMedicion', label:'Observación de medición', unit:'', group:'Contexto' }
]);

const TIPOS_BLOQUE_SESION = Object.freeze(['Individual', 'Biserie', 'Superserie', 'Triserie', 'Circuito', 'HIIT', 'Tabata', 'EMOM', 'AMRAP', 'Movilidad', 'Técnica', 'Vuelta a la calma']);
const UNIDADES_CARGA_SESION = Object.freeze(['kg', 'segundos', 'minutos', 'metros', 'repeticiones', 'RPE', 'velocidad', 'inclinación', 'kcal', 'sin carga']);


function $(selector, root = document) { return root.querySelector(selector); }
function $$(selector, root = document) { return Array.from(root.querySelectorAll(selector)); }
function root() { return $('#coachRoot'); }
function esc(value = '') { return String(value ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])); }
function valueOf(...items) { return items.find(v => v !== undefined && v !== null && String(v).trim() !== '') ?? ''; }
function arr(value) { return Array.isArray(value) ? value : []; }
function nowLabel() { return new Date().toLocaleString('es-CL'); }
function safeJson(value) { try { return JSON.stringify(value, null, 2); } catch { return String(value); } }
const DIAGNOSTICO_ACTIVO = new URLSearchParams(window.location.search).get('diagnostico') === '1' || sessionStorage.getItem('IBERFIT_MODO_DIAGNOSTICO') === '1';
function debugPanel(value, id) { return DIAGNOSTICO_ACTIVO ? `<pre class="qa-panel debug-panel"${id ? ` id="${esc(id)}"` : ''}>${esc(typeof value === 'string' ? value : safeJson(value))}</pre>` : '<div class="muted">Diagnóstico técnico oculto en modo producción.</div>'; }

function renderVerificationCenter(data = {}) {
  const checks = data.checks || [];
  if (!checks.length) return `<div class="empty-state">Sin resultados. Ejecuta el Centro de verificación.</div>`;
  const icon = s => s === 'OK' ? '✅' : (s === 'ERROR' ? '❌' : '⚠');
  const rows = checks.map(c => `<tr><td>${icon(c.estado)}</td><td><strong>${esc(c.area || '-')}</strong></td><td>${esc(c.estado || '-')}</td><td>${esc(c.detalle || '')}</td></tr>`).join('');
  return `<div class="verification-summary"><span class="quality-chip ok">Correctos: ${esc(data.resumen?.correctos ?? 0)}</span><span class="quality-chip warn">Atención: ${esc(data.resumen?.atencion ?? 0)}</span><span class="quality-chip danger">Errores: ${esc(data.resumen?.errores ?? 0)}</span><span class="quality-chip info">Estado: ${esc(data.estadoGlobal || data.status || '-')}</span></div><div class="table-wrap"><table><thead><tr><th></th><th>Área</th><th>Estado</th><th>Detalle</th></tr></thead><tbody>${rows}</tbody></table></div>${data.siguientesPasos ? `<div class="app-card compact"><h3>Siguientes pasos</h3><ul>${arr(data.siguientesPasos).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}`;
}

function clientName(client = {}) { return valueOf(client.name, client.NOMBRE_VISIBLE, client.nombre, client.CLIENTE_ID, client.id, 'Cliente'); }
function clientId(client = {}) { return valueOf(client.id, client.CLIENTE_ID, client.clientId, ''); }
function clientModality(client = {}) { return valueOf(client.modality, client.MODALIDAD, client.modalidad, 'PRESENCIAL'); }
function set(html) { const el = root(); if (!el) throw new Error('coachRoot no existe en el DOM.'); el.innerHTML = html; }
function showLoading(message = 'Cargando App Entrenador') { set(`<main class="loading-card"><section><div class="spinner"></div><h1>${esc(message)}</h1><p class="muted">IBERFIT está preparando el sistema interno. Si falla, se mostrará el diagnóstico técnico.</p></section></main>`); }
function showError(title, message, details = null) {
  const detailText = details ? safeJson(details) : '';
  set(`<main class="error-page"><section class="error-card"><span class="pill">Diagnóstico IBERFIT</span><h1>${esc(title)}</h1><p>${esc(message)}</p>${detailText ? `${debugPanel(detailText)}` : ''}<div class="action-row"><button class="btn btn-primary" id="reloadCoach">Recargar sin caché</button><button class="btn btn-ghost" id="openApi">Probar GET API</button><button class="btn btn-outline" id="goLogin">Volver al login</button></div></section></main>`);
  $('#reloadCoach')?.addEventListener('click', () => { window.location.href = `/coach.html?v=${Date.now()}`; });
  $('#openApi')?.addEventListener('click', () => window.open('/api/ibf', '_blank'));
  $('#goLogin')?.addEventListener('click', () => { clearCoachSession(); renderLogin('Sesión local reiniciada.'); });
}
function statusBox(message, type = 'error') { return `<div class="status-box ${type === 'ok' ? 'success-box' : type === 'warn' ? 'warning-box' : ''}">${esc(message)}</div>`; }

window.addEventListener('error', event => {
  console.error('IBERFIT Coach JS error', event.error || event.message);
  if (root()) showError('App Entrenador detectó un error de JavaScript', event.message || 'Error no especificado', { file: event.filename, line: event.lineno, column: event.colno });
});
window.addEventListener('unhandledrejection', event => {
  console.error('IBERFIT Coach promise error', event.reason);
  if (root()) showError('App Entrenador detectó una respuesta incompleta', event.reason?.message || String(event.reason || 'Error no especificado'), {});
});

function renderLogin(message = '') {
  clearCoachSession();
  state.session = null;
  set(`<main class="coach-login-screen"><section class="coach-login-brand"><div class="coach-logo"><img src="/assets/iberfit-isotipo.png" alt="IBERFIT"></div><h1>IBERFIT App Entrenador</h1><p>Gestión interna completa: clientes, IRI, bioimpedancia, histórico, cargas, sesión presencial, informes, decisiones, alertas y publicación al cliente.</p><div class="coach-login-points"><span>V11-F7.7.2</span><span>Experiencia premium</span><span>Pulido visual</span><span>Flujos guiados</span></div></section><section class="coach-login-card"><h2>Acceso App Entrenador</h2><p class="muted">Ruta estable: /coach.html · Ruta limpia física: /coach/</p>${message ? statusBox(message, message.includes('correcta') || message.includes('activa') ? 'ok' : 'error') : ''}<form id="coachLoginForm"><div class="field"><label for="coachLogin">Usuario</label><input id="coachLogin" type="email" autocomplete="username" placeholder="Correo del entrenador"></div><div class="field"><label for="coachPassword">Contraseña</label><input id="coachPassword" type="password" autocomplete="current-password" autofocus></div><button class="btn btn-primary btn-full" type="submit">Entrar a App Entrenador</button></form><button class="btn btn-ghost btn-full" id="probeBackend" style="margin-top:12px">Verificar conexión no sensible</button><button class="btn btn-link btn-full" id="clearCoach">Limpiar sesión local</button></section></main>`);
  $('#coachLoginForm')?.addEventListener('submit', doCoachLogin);
  $('#probeBackend')?.addEventListener('click', probeBackendFromLogin);
  $('#clearCoach')?.addEventListener('click', () => { clearCoachSession(); renderLogin('Sesión local eliminada.'); });
}

async function probeBackendFromLogin() {
  showLoading('Verificando API y backend');
  const getHealth = await iberfitGetHealth();
  const postHealth = { ok:true, status:'HEALTH_PUBLICO_NO_SENSIBLE' };
  state.lastHealth = { getHealth, postHealth };
  renderLogin(getHealth.ok !== false ? 'Conexión pública activa. Inicia sesión para verificar backend completo.' : `API no responde correctamente: ${getHealth.status || getHealth.message}`);
  const card = $('.coach-login-card');
  if (card) card.insertAdjacentHTML('beforeend', `${debugPanel(state.lastHealth)}`);
}

async function doCoachLogin(event) {
  event.preventDefault();
  const login = $('#coachLogin')?.value.trim() || '';
  const password = $('#coachPassword')?.value || '';
  if (!login || !password) { renderLogin('Ingresa usuario y contraseña.'); return; }
  showLoading('Validando acceso de entrenador');
  const response = await iberfitApi('coachLogin', { login, password });
  if (!response || response.ok === false) { renderLogin(response?.message || response?.status || 'No se pudo iniciar sesión de entrenador.'); return; }
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
  set(`<main class="coach-shell"><aside class="coach-sidebar"><div><div class="brand-mini brand-mini-iberfit"><span class="brand-emblem"><img src="/assets/iberfit-isotipo.png" alt="IBERFIT"></span><strong>IBERFIT</strong><span>Método · App Entrenador</span><span>${esc(state.session?.coachName || 'Entrenador')}</span></div><nav class="coach-nav">${MODULES.map(([key, label]) => `<button class="${key === active ? 'active' : ''}" data-module="${esc(key)}">${esc(label)}</button>`).join('')}</nav></div><div class="sidebar-footer"><div>V11-F7.7.2 MARCA IBERFIT</div><div>${esc(nowLabel())}</div><button class="btn btn-ghost btn-mini" id="logoutCoach" style="margin-top:12px">Salir</button></div></aside><section class="coach-main"><div class="topbar"><div><span class="pill green">${esc(labelForModule(active))}</span><h1 style="margin:8px 0 0">${esc(options.title || labelForModule(active))}</h1></div><div class="action-row"><button class="btn btn-ghost btn-mini" id="refreshCoach">Actualizar</button><button class="btn btn-outline btn-mini" id="openClientApp">Espacio Cliente</button></div></div><div class="premium-system-strip brand-strip"><span>Marca IBERFIT</span><span>Isotipo activo</span><span>Flujo guiado</span><span>Entrenador al mando</span></div>${body}</section></main>`);
  $$('[data-module]').forEach(button => button.addEventListener('click', () => renderModule(button.dataset.module)));
  $('#logoutCoach')?.addEventListener('click', () => { clearCoachSession(); renderLogin('Sesión de entrenador cerrada.'); });
  $('#refreshCoach')?.addEventListener('click', () => loadDashboard(state.activeModule));
  $('#openClientApp')?.addEventListener('click', () => window.open('/', '_blank'));
}
function labelForModule(key) { return MODULES.find(m => m[0] === key)?.[1] || 'App Entrenador'; }

async function loadDashboard(targetModule = 'dashboard') {
  showLoading('Cargando panel principal');
  const response = await iberfitApi('coachGetDashboard', { coachToken: state.session?.coachToken });
  if (!response || response.ok === false) {
    if (['INVALID_COACH_TOKEN', 'COACH_SESSION_EXPIRED', 'UNAUTHORIZED'].includes(response?.status)) { renderLogin(response?.message || 'Sesión Coach caducada.'); return; }
    showError('No se pudo cargar el panel principal', response?.message || response?.status || 'Error desconocido', response);
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
    multimedia: renderMultimedia,
    decisiones: renderDecisions,
    aprendizaje: renderLearning,
    alertas: renderAlerts,
    accesos: renderAccesses,
    actividad: renderExternalActivity,
    experiencia: renderPremiumExperience,
    qa: renderQa,
  };
  (handlers[moduleKey] || renderDashboard)();
}

function renderDashboard() {
  const metrics = state.dashboard?.metrics || state.dashboard?.metricas || {};
  const clients = state.clients;
  shell(`<section class="hero-card premium-hero"><p>APP ENTRENADOR</p><h1>Centro de método IBERFIT</h1><span>Diagnóstico, planificación, ejecución y seguimiento con una experiencia propia, ligera y reconocible.</span><div class="premium-flow"><span>Diagnóstico</span><span>Planificación</span><span>Sesión</span><span>Informe</span><span>Ajuste</span></div></section>${metricGrid([
    ['Clientes', valueOf(metrics.clientes, metrics.clients, clients.length, '-')],
    ['Sesiones publicadas', valueOf(metrics.sesionesPublicadas, metrics.publishedSessions, '-')],
    ['Cargas registradas', valueOf(metrics.cargasRegistradas, metrics.loads, '-')],
    ['Alertas', valueOf(metrics.alertas, metrics.alerts, '-')],
  ])}<section class="module-grid"><article class="app-card"><h2>Prioridad operativa</h2><div class="timeline"><div class="timeline-item"><strong>1. Migración real</strong><p>Ejecutar adminV10ImportHistoricalData() si ficha, histórico y biblioteca siguen vacíos.</p></div><div class="timeline-item"><strong>2. Clientes y acceso</strong><p>Verificar Cynthia = APPCLI-0001 · PRESENCIAL. Nunca permitir cruce con Arleana.</p></div><div class="timeline-item"><strong>3. Publicación con criterio</strong><p>Objetivo, qué observar, cómo ajustar y qué reportar son obligatorios.</p></div></div></article><article class="app-card"><h2>Diagnóstico rápido</h2><p>Usa Control del sistema para comprobar conexión, salud del backend y auditoría autenticada.</p><button class="btn btn-primary" id="quickQa">Ejecutar revisión rápida</button><div id="quickQaResult"></div></article></section><section class="app-card"><h2>Clientes recientes</h2>${renderClientsMini(clients)}</section>`, { active: 'dashboard', title: 'Panel principal' });
  $('#quickQa')?.addEventListener('click', runQuickQa);
}

function renderClientsMini(clients) {
  if (!clients.length) return `<div class="empty-state">El backend no entregó clientes. Verifica el panel principal y la migración.</div>`;
  return clients.slice(0, 8).map(client => `<button class="client-row" data-select-client="${esc(client.id)}"><strong>${esc(client.name)}</strong><span>${esc(client.modality)} · ${esc(client.objective || 'Objetivo pendiente')} · ${esc(client.status || 'Estado pendiente')}</span></button>`).join('');
}

function metricGrid(items) {
  return `<section class="metric-grid">${items.map(([label, value]) => `<article class="app-card"><strong class="metric">${esc(value)}</strong><span class="label">${esc(label)}</span></article>`).join('')}</section>`;
}

async function runQuickQa() {
  const target = $('#quickQaResult');
  if (target) target.innerHTML = statusBox('Ejecutando revisión...', 'warn');
  const getApi = await iberfitGetHealth();
  const backend = await iberfitApi('backendHealth', { coachToken: state.session?.coachToken });
  const out = { getApi, backend };
  if (target) target.innerHTML = `${debugPanel(out)}`;
}

function renderClients() {
  shell(`<section class="hero-card"><p>CLIENTES</p><h1>Ficha, IRI, histórico e informes</h1><span>Selecciona un cliente para recuperar la profundidad técnica completa.</span></section><section class="client-selector"><article class="app-card"><h2>Clientes activos</h2><div class="field"><label>Buscar</label><input id="clientSearch" placeholder="Nombre, email, modalidad, objetivo"></div><div class="client-list" id="clientList">${renderClientsMini(state.clients)}</div></article><article class="app-card" id="clientWorkspace"><h2>Espacio de trabajo</h2><p>Selecciona un cliente.</p></article></section>`, { active: 'clientes', title: 'Clientes' });
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
  if (host) host.innerHTML = '<h2>Cargando espacio de trabajo...</h2><p class="muted">Recuperando ficha, IRI, cargas e histórico.</p>';
  const response = await iberfitApi('coachGetClientWorkspace', { coachToken: state.session?.coachToken, clientId: id });
  if (!response || response.ok === false) {
    const html = `<h2>No se pudo cargar cliente</h2><p>${esc(response?.message || response?.status || 'Error desconocido')}</p>${debugPanel(response)}`;
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
    bioReports: arr(raw.bioReports || raw.informesBioimpedancia || raw.bioimpedanciaInformes),
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
    ['resumen', 'Resumen'], ['ficha', 'Ficha'], ['iri', 'IRI'], ['bio', 'Bioimpedancia'], ['sesiones', 'Sesiones'], ['cargas', 'Cargas'], ['historico', 'Histórico'], ['informes', 'Informes'], ['feedback', 'Feedback'], ['decisiones', 'Decisiones']
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
  bindBioimpedanceActions();
  bindSmartReportActions();
}


function workspaceTabContent(tab, w) {
  if (tab === 'resumen') return `${metricGrid([['IRI', valueOf(w.iri.score, w.iri.IRI_TOTAL, w.iri.total, 'Pendiente')], ['Sesiones', w.sessions.length], ['Cargas', w.loads.length], ['Histórico', w.loadHistory.length]])}<article class="data-card"><h3>Lectura técnica</h3><p>Cliente ${esc(w.client.modality)} con objetivo ${esc(w.client.objective || 'pendiente')}. Revisar IRI, histórico de cargas y feedback antes de progresar.</p></article>`;
  if (tab === 'ficha') return renderKeyValueTable(w.ficha, ['SECCION', 'CAMPO', 'VALOR'], 'Ficha pendiente de migración. Ejecutar adminV10ImportHistoricalData().');
  if (tab === 'iri') return renderIri(w.iri);
  if (tab === 'bio') return renderBioimpedanceModule(w);
  if (tab === 'sesiones') return renderSessionsTable(w.sessions);
  if (tab === 'cargas') return renderGenericTable(w.loads, ['EJERCICIO', 'ULTIMA_CARGA', 'RPE', 'TENDENCIA', 'RECOMENDACION'], 'Sin cargas actuales.');
  if (tab === 'historico') return renderGenericTable(w.loadHistory, ['FECHA_REGISTRO', 'EJERCICIO_TEXTO', 'SERIES', 'REPETICIONES', 'CARGA', 'RPE', 'DECISION_IBERFIT'], 'Histórico pendiente de migración.');
  if (tab === 'informes') return renderSmartReportsWorkspace(w);
  if (tab === 'feedback') return renderGenericTable([...w.feedback, ...w.checkins], ['FECHA_ENVIO', 'SESION_ID', 'RPE', 'FATIGA', 'ENERGIA', 'COMENTARIO_CLIENTE', 'OBSERVACION_CLIENTE'], 'Sin feedback/check-in.');
  if (tab === 'decisiones') return renderGenericTable(w.decisions, ['FECHA', 'TIPO', 'DECISION_IBERFIT', 'CRITERIO', 'ESTADO'], 'Sin decisiones registradas.');
  return '';
}



function reportIdOf(row = {}) { return valueOf(row.INFORME_ID, row.informeId, row.REPORT_ID, row.ID_INFORME, row.BIO_ID, row.INFORME_BIO_ID, row.ID); }
function renderReportVisibilityControls(reports = []) {
  const options = arr(reports).map((r, idx) => {
    const id = reportIdOf(r);
    if (!id) return '';
    const type = valueOf(r.TIPO_INFORME, r.TIPO, 'Informe');
    const date = valueOf(r.FECHA, r.FECHA_CREACION, r.CREADO_EN, r.ACTUALIZADO_EN, 'sin fecha');
    const stateLabel = valueOf(r.VISIBLE_CLIENTE, r.ESTADO_INFORME, r.ESTADO, 'BORRADOR');
    return `<option value="${esc(id)}">${esc(id)} · ${esc(type)} · ${esc(date)} · ${esc(stateLabel)}</option>`;
  }).filter(Boolean).join('');
  if (!options) return `<div class="empty-state">No hay informes con identificador publicable. Genera y guarda un borrador antes de publicar.</div>`;
  return `<article class="data-card report-publish-card"><h2>Publicación al Espacio Cliente</h2><p class="muted">Elige un informe guardado. La publicación o retiro queda auditada y nunca ocurre de forma automática.</p><div class="field"><label>Informe</label><select id="reportVisibilityId">${options}</select></div><div class="action-row"><button class="btn btn-primary" id="publishClientReport">Publicar informe al cliente</button><button class="btn btn-outline" id="withdrawClientReport">Retirar del Espacio Cliente</button></div><div id="reportVisibilityStatus"></div></article>`;
}
function renderSmartReportsWorkspace(w) {
  const reports = arr(w.reports || []);
  return `<section class="module-grid"><article class="data-card"><h2>Informes inteligentes</h2><p class="muted">Genera un borrador revisable. Nada se publica al cliente sin revisión del entrenador.</p><div class="form-grid"><div class="field"><label>Tipo de informe</label><select id="smartReportType"><option value="SEMANAL">Semanal</option><option value="MENSUAL">Mensual</option><option value="PROGRESO">Progreso</option><option value="POST_SESION">Post-sesión</option><option value="IRI_BIOIMPEDANCIA">IRI + bioimpedancia</option></select></div><div class="field"><label>Sesión opcional</label><input id="smartReportSessionId" placeholder="SES-... si aplica"></div></div><div class="action-row"><button class="btn btn-primary" id="generateSmartReport">Generar borrador</button><button class="btn btn-outline" id="saveSmartReport">Guardar borrador</button></div><div id="smartReportStatus"></div></article><article class="data-card"><h2>Criterio</h2><p>El informe utiliza IRI, bioimpedancia, sesiones, cargas, feedback, check-in y análisis post-sesión cuando existen. El resultado debe ser editado antes de comunicarse.</p></article>${renderReportVisibilityControls(reports)}</section><section class="app-card"><h2>Borrador generado</h2><div id="smartReportPreview" class="empty-state">Aún no se ha generado informe.</div></section><section class="app-card"><h2>Informes guardados</h2>${renderGenericTable(reports, ['INFORME_ID', 'TIPO_INFORME', 'FECHA', 'ESTADO', 'ESTADO_INFORME', 'VISIBLE_CLIENTE', 'URL_PDF', 'RESUMEN', 'RESUMEN_CLIENTE'], 'Sin informes guardados.')}</section>`;
}

function renderSmartReportPreview(res) {
  const sections = arr(res?.sections);
  const report = res?.report || {};
  if (!sections.length) return `${debugPanel(res || {})}`;
  return `<article class="data-card"><h3>${esc(valueOf(report.TIPO_INFORME, 'Informe inteligente'))}</h3><p><strong>Estado:</strong> ${esc(valueOf(report.ESTADO, 'BORRADOR'))} · <strong>Revisión:</strong> requerida por entrenador</p>${sections.map(s => `<div class="timeline-item"><strong>${esc(s.titulo)}</strong><p>${esc(s.contenido)}</p></div>`).join('')}</article>`;
}

function bindSmartReportActions() {
  const generate = $('#generateSmartReport');
  const save = $('#saveSmartReport');
  if (!generate && !save) return;
  async function run(saveDraft) {
    const status = $('#smartReportStatus');
    const preview = $('#smartReportPreview');
    if (status) status.innerHTML = statusBox(saveDraft ? 'Guardando borrador...' : 'Generando borrador...', 'warn');
    const res = await iberfitApi('coachGenerarInformeInteligente', { coachToken: state.session?.coachToken, clientId: state.workspace?.client?.id || state.selectedClientId, reportType: $('#smartReportType')?.value || 'SEMANAL', sessionId: $('#smartReportSessionId')?.value || '', saveDraft });
    if (!res || res.ok === false) { if (status) status.innerHTML = statusBox(res?.message || res?.status || 'No se pudo generar informe.'); return; }
    state.smartReport = res;
    if (status) status.innerHTML = statusBox(res.status || 'Borrador generado.', 'ok');
    if (preview) preview.innerHTML = renderSmartReportPreview(res);
  }
  generate?.addEventListener('click', () => run(false));
  save?.addEventListener('click', () => run(true));
  async function setReportVisibility(visible) {
    const target = $('#reportVisibilityStatus');
    const reportId = $('#reportVisibilityId')?.value || '';
    if (!reportId) { if (target) target.innerHTML = statusBox('Selecciona un informe guardado.'); return; }
    if (target) target.innerHTML = statusBox(visible ? 'Publicando informe al cliente...' : 'Retirando informe del Espacio Cliente...', 'warn');
    const action = visible ? 'coachPublicarInformeCliente' : 'coachRetirarInformeCliente';
    const res = await iberfitApi(action, { coachToken: state.session?.coachToken, clientId: state.workspace?.client?.id || state.selectedClientId, reportId });
    if (!res || res.ok === false) { if (target) target.innerHTML = statusBox(res?.message || res?.status || 'No se pudo actualizar la visibilidad.'); return; }
    if (target) target.innerHTML = statusBox(res.status || (visible ? 'Informe publicado al cliente.' : 'Informe retirado del cliente.'), 'ok');
    if (state.selectedClientId) setTimeout(() => loadClientWorkspace(state.selectedClientId, 'informes'), 500);
  }
  $('#publishClientReport')?.addEventListener('click', () => setReportVisibility(true));
  $('#withdrawClientReport')?.addEventListener('click', () => setReportVisibility(false));
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
  return `<section class="module-grid"><article class="data-card"><h2>IRI</h2><strong class="metric">${esc(total)}</strong><span class="label">${esc(classification)}</span><div class="progress-bar" style="margin-top:12px"><span style="width:${Math.max(0, Math.min(100, Number(total) || 0))}%"></span></div></article><article class="data-card"><h2>Recomendación</h2><p>${esc(valueOf(iri.recommendation, iri.RECOMENDACION, iri.decision, iri.DECISION_IBERFIT, 'Pendiente de informe IRI.'))}</p></article></section><section class="module-grid-3"><article class="data-card"><h3>Contexto</h3><p>${esc(valueOf(iri.context, iri.CONTEXTO, '-'))}</p></article><article class="data-card"><h3>Fuerza</h3><p>${esc(valueOf(iri.strength, iri.FUERZA, '-'))}</p></article><article class="data-card"><h3>Metabólico</h3><p>${esc(valueOf(iri.metabolic, iri.METABOLICO, '-'))}</p></article></section><article class="data-card"><h3>Datos crudos</h3>${debugPanel(iri)}</article>`;
}
function renderObjectCard(obj, empty) { if (!obj || Object.keys(obj).length === 0) return `<div class="empty-state">${esc(empty)}</div>`; return `${debugPanel(obj)}`; }
function renderBioimpedanceModule(w) {
  const rows = arr(w.bioReports);
  const latest = rows[0] || {};
  const url = valueOf(latest.url, latest.URL_INFORME, latest.URL_PDF, latest.ARCHIVO_URL, '');
  const summary = valueOf(latest.summaryCoach, latest.RESUMEN_COACH, latest.summaryClient, latest.RESUMEN_CLIENTE, latest.RESUMEN, 'Sin resumen registrado.');
  const groups = [...new Set(CAMPOS_BIOIMPEDANCIA_COMPLETA.map(c => c.group))];
  const metricsForm = groups.map(group => {
    const fields = CAMPOS_BIOIMPEDANCIA_COMPLETA.filter(c => c.group === group).map(c => `<div class="field"><label>${esc(c.label)}${c.unit ? ` (${esc(c.unit)})` : ''}</label><input class="bio-metric" data-bio-key="${esc(c.key)}" placeholder="${esc(c.unit || 'valor')}"></div>`).join('');
    return `<details class="metric-section" ${['Composición básica','Músculo','Agua','Riesgo/Metabolismo'].includes(group) ? 'open' : ''}><summary>${esc(group)}</summary><div class="form-grid-3">${fields}</div></details>`;
  }).join('');
  return `<section class="module-grid"><article class="data-card"><h2>Último informe externo</h2>${rows.length ? `<p>${esc(summary)}</p>${url ? `<a class="btn btn-outline" href="${esc(url)}" target="_blank" rel="noopener">Abrir informe adjunto</a>` : '<p class="muted">Informe sin enlace adjunto.</p>'}` : '<div class="empty-state">Sin informes externos de bioimpedancia registrados.</div>'}<p class="muted" style="margin-top:10px">V11-F5 contempla composición, músculo, agua, grasa visceral, metabolismo, calidad celular y análisis segmental.</p></article><article class="data-card"><h2>Registrar informe externo</h2><p class="muted">Añade el informe generado por la máquina de bioimpedancia. Puede ser enlace de Drive/PDF o archivo adjunto si está configurada la carpeta de Drive.</p><div class="form-grid"><div class="field"><label>Fecha medición</label><input id="bioDate" type="date"></div><div class="field"><label>Título</label><input id="bioTitle" placeholder="Bioimpedancia inicial / control mensual"></div></div><div class="field"><label>Enlace del informe</label><input id="bioUrl" placeholder="https://drive.google.com/... o PDF"></div><div class="field"><label>Archivo opcional</label><input id="bioFile" type="file" accept="application/pdf,image/*"></div>${metricsForm}<div class="field"><label>Resumen para el entrenador</label><textarea id="bioCoachSummary" placeholder="Lectura técnica y decisión IBERFIT..."></textarea></div><div class="field"><label>Resumen visible para el cliente</label><textarea id="bioClientSummary" placeholder="Explicación simple para Espacio Cliente..."></textarea></div><label class="check-row"><input id="bioVisibleClient" type="checkbox" checked> Publicar resumen en Espacio Cliente</label><button class="btn btn-primary" id="saveBioReport">Guardar informe de bioimpedancia</button><div id="bioSaveStatus"></div></article></section><section class="app-card"><h2>Histórico de bioimpedancia</h2>${renderGenericTable(rows, ['FECHA_MEDICION','TITULO','PESO','IMC','PORCENTAJE_GRASA','MASA_MUSCULAR','MASA_MUSCULAR_ESQUELETICA','AGUA_CORPORAL','GRASA_VISCERAL','METABOLISMO_BASAL','ANGULO_FASE','URL_INFORME','RESUMEN_CLIENTE'], 'Sin histórico de bioimpedancia.')}</section>`;
}
function collectBioMetrics() {
  const metrics = {};
  $$('.bio-metric').forEach(input => { const key = input.dataset.bioKey; if (key && String(input.value || '').trim()) metrics[key] = input.value.trim(); });
  return metrics;
}
function bindBioimpedanceActions() {
  const btn = $('#saveBioReport');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const target = $('#bioSaveStatus');
    if (target) target.innerHTML = statusBox('Guardando informe de bioimpedancia...', 'warn');
    let filePayload = {};
    const file = $('#bioFile')?.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { if (target) target.innerHTML = statusBox('Archivo demasiado grande. Usa un enlace de Drive/PDF o un archivo menor a 5 MB.'); return; }
      filePayload = await fileToPayload(file);
    }
    const metrics = collectBioMetrics();
    const payload = {
      coachToken: state.session?.coachToken,
      clientId: state.workspace?.client?.id || state.selectedClientId,
      measurementDate: $('#bioDate')?.value || '',
      title: $('#bioTitle')?.value || 'Informe de bioimpedancia',
      reportUrl: $('#bioUrl')?.value || '',
      summaryCoach: $('#bioCoachSummary')?.value || '',
      summaryClient: $('#bioClientSummary')?.value || '',
      visibleClient: $('#bioVisibleClient')?.checked ? 'SI' : 'NO',
      metrics,
      ...filePayload
    };
    const res = await iberfitApi('coachAdjuntarInformeBioimpedancia', payload);
    if (!res || res.ok === false) { if (target) target.innerHTML = statusBox(res?.message || res?.status || 'No se pudo guardar el informe.'); return; }
    if (target) target.innerHTML = statusBox('Informe de bioimpedancia guardado.', 'ok');
    await loadClientWorkspace(payload.clientId, 'bio');
  });
}
function fileToPayload(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.onload = () => resolve({ fileName: file.name, fileMimeType: file.type || 'application/octet-stream', fileBase64: String(reader.result || '').split(',').pop() });
    reader.readAsDataURL(file);
  });
}
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
  shell(`<section class="hero-card"><p>SESIONES</p><h1>Planificación y publicación</h1><span>Motor de decisión local, propuesta con Generar propuesta, revisión manual y publicación tras validación previa.</span></section><section class="module-grid"><article class="app-card"><h2>Crear sesión</h2>${builderForm()}</article><article class="app-card"><h2>Borrador / IA</h2><div id="draftPreview" class="empty-state">Genera una sesión o selecciona un cliente.</div></article></section><section class="app-card"><h2>Sesiones recientes</h2>${renderSessionsTable(sessions)}</section>`, { active: 'sesiones', title: 'Sesiones' });
  bindBuilder();
}
function builderForm() {
  const typeOptions = TIPOS_BLOQUE_SESION.map(t => `<option>${esc(t)}</option>`).join('');
  const unitOptions = UNIDADES_CARGA_SESION.map(u => `<option>${esc(u)}</option>`).join('');
  return `<div class="field"><label>Cliente</label><select id="bClient">${state.clients.map(c => `<option value="${esc(c.id)}" ${c.id === state.selectedClientId ? 'selected' : ''}>${esc(c.name)} · ${esc(c.modality)}</option>`).join('')}</select></div><div class="form-grid"><div class="field"><label>Tipo general</label><select id="bType"><option>PRESENCIAL</option><option>ONLINE</option><option>HIBRIDO</option></select></div><div class="field"><label>Duración</label><input id="bDuration" value="60 min"></div></div><div class="field"><label>Objetivo de sesión</label><input id="bObjective" placeholder="Ej: técnica de fuerza + tolerancia metabólica"></div><div class="field"><label>Qué observar</label><textarea id="bObserve" placeholder="Técnica, RPE, dolor, tolerancia, descanso..."></textarea></div><div class="field"><label>Cómo ajustar</label><textarea id="bAdjust" placeholder="Criterios de progresión/regresión..."></textarea></div><div class="field"><label>Qué reportar</label><textarea id="bReport" placeholder="Qué debe ver el cliente y qué queda interno..."></textarea></div><details class="metric-section" open><summary>Constructor rápido de bloques</summary><div class="form-grid-3"><div class="field"><label>Tipo de bloque</label><select id="blockType">${typeOptions}</select></div><div class="field"><label>Nombre del bloque</label><input id="blockTitle" placeholder="Fuerza principal / HIIT final"></div><div class="field"><label>Rondas</label><input id="blockRounds" placeholder="3 / 4 / 8"></div><div class="field"><label>Trabajo</label><input id="blockWork" placeholder="40 s / 10 rep"></div><div class="field"><label>Descanso</label><input id="blockRest" placeholder="20 s / 90 s"></div><div class="field"><label>Unidad principal</label><select id="blockUnit">${unitOptions}</select></div></div><div class="field"><label>Ejercicios del bloque</label><textarea id="blockExercises" placeholder="Un ejercicio por línea: Ejercicio | series | repeticiones/tiempo | carga | unidad | descanso | RPE"></textarea></div><div class="action-row"><button class="btn btn-ghost" id="templateStrength">Plantilla fuerza</button><button class="btn btn-ghost" id="templateCircuit">Plantilla circuito</button><button class="btn btn-ghost" id="templateHiit">Plantilla HIIT</button><button class="btn btn-ghost" id="templateTabata">Plantilla Tabata</button><button class="btn btn-primary" id="addBlock">Añadir bloque</button></div><div id="sessionBlocksPreview" class="empty-state">Sin bloques añadidos.</div></details><div class="action-row"><button class="btn btn-primary" id="aiSession">Generar propuesta</button><button class="btn btn-ghost" id="saveDraft">Guardar borrador</button><button class="btn btn-outline" id="publishDraft">Publicar</button></div><div id="builderStatus"></div>`;
}
function parseExerciseLine(line) {
  const parts = String(line || '').split('|').map(x => x.trim());
  return { name:parts[0] || 'Ejercicio', sets:parts[1] || '', reps:parts[2] || '', load:parts[3] || '', unit:parts[4] || '', rest:parts[5] || '', rpe:parts[6] || '', notes:parts.slice(7).join(' | ') };
}
function collectBlockFromForm() {
  const exercises = String($('#blockExercises')?.value || '').split(/\r?\n/).map(x => x.trim()).filter(Boolean).map(parseExerciseLine);
  return { tipo:$('#blockType')?.value || 'Individual', title:$('#blockTitle')?.value || ($('#blockType')?.value || 'Bloque'), rondas:$('#blockRounds')?.value || '', trabajo:$('#blockWork')?.value || '', descanso:$('#blockRest')?.value || '', unidad:$('#blockUnit')?.value || '', exercises };
}
function renderSessionBlocksPreview() {
  const blocks = arr(state.sessionBlocks);
  const target = $('#sessionBlocksPreview');
  if (!target) return;
  target.innerHTML = blocks.length ? blocks.map((b, idx) => `<article class="data-card"><strong>${idx+1}. ${esc(b.tipo)} · ${esc(b.title)}</strong><p>${esc([b.rondas ? `${b.rondas} rondas` : '', b.trabajo ? `trabajo ${b.trabajo}` : '', b.descanso ? `descanso ${b.descanso}` : '', b.unidad ? `unidad ${b.unidad}` : ''].filter(Boolean).join(' · '))}</p><p>${esc(arr(b.exercises).map(e => e.name).join(' · '))}</p><button class="btn btn-link" data-remove-block="${idx}">Quitar bloque</button></article>`).join('') : 'Sin bloques añadidos.';
  $$('[data-remove-block]').forEach(btn => btn.addEventListener('click', () => { state.sessionBlocks.splice(Number(btn.dataset.removeBlock), 1); renderSessionBlocksPreview(); }));
}
function applyBlockTemplate(kind) {
  const templates = {
    fuerza: { type:'Individual', title:'Fuerza principal', rounds:'', work:'', rest:'90 s', unit:'kg', exercises:'Sentadilla goblet | 3 | 8-10 |  | kg | 90 s | 7\nRemo con mancuerna | 3 | 10-12 |  | kg | 75 s | 7' },
    circuito: { type:'Circuito', title:'Circuito técnico', rounds:'3', work:'10-12 rep', rest:'60 s entre rondas', unit:'repeticiones', exercises:'Step-up | 3 | 10/lado |  | kg | continuo | 7\nPress inclinado mancuernas | 3 | 10 |  | kg | continuo | 7\nPallof press | 3 | 12/lado |  | banda | continuo | 6' },
    hiit: { type:'HIIT', title:'HIIT controlado', rounds:'6', work:'40 s', rest:'20 s', unit:'segundos', exercises:'Bike / remo / cuerda | 6 | 40 s |  | segundos | 20 s | 8\nMountain climbers | 6 | 40 s | peso corporal | segundos | 20 s | 8' },
    tabata: { type:'Tabata', title:'Tabata final', rounds:'8', work:'20 s', rest:'10 s', unit:'segundos', exercises:'Sentadilla al aire | 8 | 20 s | peso corporal | segundos | 10 s | 8\nBattle ropes | 8 | 20 s |  | segundos | 10 s | 8' }
  };
  const t = templates[kind]; if (!t) return;
  $('#blockType').value = t.type; $('#blockTitle').value = t.title; $('#blockRounds').value = t.rounds; $('#blockWork').value = t.work; $('#blockRest').value = t.rest; $('#blockUnit').value = t.unit; $('#blockExercises').value = t.exercises;
}
function collectCriterion() {
  const objective = $('#bObjective')?.value || '';
  const observe = $('#bObserve')?.value || '';
  const adjust = $('#bAdjust')?.value || '';
  const report = $('#bReport')?.value || '';
  const blocks = arr(state.sessionBlocks);
  const criterionText = [`Objetivo: ${objective}`, `Qué observar: ${observe}`, `Cómo ajustar: ${adjust}`, `Qué reportar: ${report}`].join(' · ');
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
    sessionBlocks: blocks,
    draft: { blocks, estructuraTipo:'V11-F7.7.2-CONSTRUCTOR-BLOQUES-TEMPORIZADORES' }
  };
}
function criterionIsComplete(c) { return c.objective.trim() && c.observe.trim() && c.adjust.trim() && c.report.trim(); }
function bindBuilder() {
  state.sessionBlocks = arr(state.sessionBlocks);
  renderSessionBlocksPreview();
  $('#templateStrength')?.addEventListener('click', () => applyBlockTemplate('fuerza'));
  $('#templateCircuit')?.addEventListener('click', () => applyBlockTemplate('circuito'));
  $('#templateHiit')?.addEventListener('click', () => applyBlockTemplate('hiit'));
  $('#templateTabata')?.addEventListener('click', () => applyBlockTemplate('tabata'));
  $('#addBlock')?.addEventListener('click', () => { const block = collectBlockFromForm(); if (!block.exercises.length) { $('#builderStatus').innerHTML = statusBox('Añade al menos un ejercicio al bloque.'); return; } state.sessionBlocks.push(block); renderSessionBlocksPreview(); $('#blockExercises').value = ''; $('#builderStatus').innerHTML = statusBox('Bloque añadido a la sesión.', 'ok'); });
  $('#aiSession')?.addEventListener('click', async () => {
    const payload = collectCriterion();
    $('#builderStatus').innerHTML = statusBox('Generando propuesta con Motor IBERFIT...', 'warn');
    const response = await iberfitApi('coachGenerarSesionV11', { coachToken: state.session?.coachToken, mode: 'SESSION_FULL', ...payload });
    const data = response.data || response.session || response;
    if (!response || response.ok === false) { $('#builderStatus').innerHTML = statusBox(response?.message || response?.status || 'No se pudo generar la propuesta.'); return; }
    state.currentDraft = { ...data, blocks: arr(data.blocks).length ? data.blocks : payload.sessionBlocks };
    $('#draftPreview').innerHTML = renderDraftPreview(state.currentDraft);
    if (data.objective) $('#bObjective').value = $('#bObjective').value || String(data.objective);
    if (data.observe) $('#bObserve').value = $('#bObserve').value || String(data.observe);
    if (data.adjust) $('#bAdjust').value = $('#bAdjust').value || String(data.adjust);
    if (data.report) $('#bReport').value = $('#bReport').value || String(data.report);
    $('#builderStatus').innerHTML = statusBox('Propuesta generada. Revisa antes de guardar/publicar.', 'ok');
  });
  $('#saveDraft')?.addEventListener('click', saveDraft);
  $('#publishDraft')?.addEventListener('click', publishDraft);
}
async function saveDraft() {
  const criterion = collectCriterion();
  if (!criterionIsComplete(criterion)) { $('#builderStatus').innerHTML = statusBox('Falta criterio completo: objetivo, qué observar, cómo ajustar y qué reportar.'); return; }
  const draft = { ...(state.currentDraft || {}), blocks: arr(state.currentDraft?.blocks).length ? state.currentDraft.blocks : criterion.sessionBlocks, estructuraTipo:'V11-F7.7.2-CONSTRUCTOR-BLOQUES-TEMPORIZADORES' };
  const response = await iberfitApi('coachSaveSessionDraft', { coachToken: state.session?.coachToken, idempotencyKey: buildClientIdempotencyKey(criterion, draft), ...criterion, draft });
  if (!response || response.ok === false) { $('#builderStatus').innerHTML = statusBox(response?.message || response?.status || 'No se pudo guardar borrador.'); return; }
  state.currentDraft = { ...draft, ...criterion, ...(response.data || response) };
  $('#draftPreview').innerHTML = renderDraftPreview(state.currentDraft);
  $('#builderStatus').innerHTML = statusBox('Borrador guardado.', 'ok');
}
async function publishDraft() {
  const criterion = collectCriterion();
  if (!criterionIsComplete(criterion)) { $('#builderStatus').innerHTML = statusBox('No se publica: falta criterio completo.'); return; }
  const sessionId = valueOf(state.currentDraft?.sessionId, state.currentDraft?.id, state.currentDraft?.SESION_ID, '');
  if (!sessionId) { $('#builderStatus').innerHTML = statusBox('Primero guarda el borrador para obtener el identificador de sesión.'); return; }
  const response = await iberfitApi('coachPublishSession', { coachToken: state.session?.coachToken, sessionId, ...criterion });
  $('#builderStatus').innerHTML = response?.ok === false ? statusBox(response.message || response.status || 'No se pudo publicar.') : statusBox('Sesión publicada al cliente.', 'ok');
}

function buildClientIdempotencyKey(criterion, draft) {
  const raw = [criterion.clientId, criterion.title, criterion.objective, criterion.observe, criterion.adjust, criterion.report, JSON.stringify(draft || {})].join('|');
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  return `web-${Math.abs(hash)}-${raw.length}`;
}

function renderDraftPreview(data) { const decision = data?.decision || {}; const blocks = arr(data?.blocks); return `<h3>${esc(valueOf(data.title, data.TITULO_SESION, 'Sesión IBERFIT'))}</h3><p>${esc(valueOf(data.objective, data.OBJETIVO_SESION, data.criterion, ''))}</p>${decision.recommendation ? `<div class="data-card"><strong>Motor IBERFIT</strong><p>${esc(decision.recommendation)} · Confianza ${esc(decision.confidenceLabel || decision.confidence || '-')}</p><p>${esc(decision.explanationShort || '')}</p></div>` : ''}${blocks.length ? `<div class="module-grid">${blocks.map(b => `<article class="data-card"><strong>${esc(b.title || 'Bloque')}</strong><p>${esc((b.exercises || []).map(e => e.name || '').filter(Boolean).join(' · '))}</p></article>`).join('')}</div>` : ''}${debugPanel(data)}`; }

function renderLiveSession() {
  const clientOptions = state.clients.map(c => `<option value="${esc(c.id)}" ${c.id === state.selectedClientId ? 'selected' : ''}>${esc(c.name)} · ${esc(c.modality)}</option>`).join('');
  shell(`<section class="hero-card"><p>SESIÓN PRESENCIAL</p><h1>Ejecución real en vivo</h1><span>Registro serie por serie con kg, segundos, minutos, metros, repeticiones, RPE, descanso, reemplazos, omitidos, incidencias, cargas e histórico.</span></section>
  <section class="module-grid"><article class="app-card"><h2>1 · Iniciar sesión</h2><div class="form-grid"><div class="field"><label>Cliente</label><select id="liveClient">${clientOptions}</select></div><div class="field"><label>Sesión publicada o borrador</label><input id="liveSessionId" placeholder="SES-APPCLI-0001-XXXX · opcional"></div><div class="field"><label>Título de sesión</label><input id="liveTitle" placeholder="Sesión presencial IBERFIT"></div><div class="field"><label>Tipo de sesión</label><select id="liveSessionType"><option>Presencial</option><option>Fuerza</option><option>Circuito</option><option>HIIT</option><option>Tabata</option><option>Movilidad</option><option>Técnica</option></select></div></div><div class="action-row"><button class="btn btn-primary" id="startLiveSession">Iniciar sesión presencial</button><button class="btn btn-outline" id="reviewLiveSession">Revisar ejecución</button><button class="btn btn-outline" id="toggleConcentrationMode">Modo concentración</button><button class="btn btn-ghost" id="loadLiveClient">Cargar ficha</button></div><div id="liveStartStatus" class="empty-state">Sesión no iniciada.</div></article>
  <article class="app-card"><h2>Estado de preparación</h2><div class="form-grid"><div class="field"><label>Sueño</label><input id="readySleep" type="number" min="1" max="10"></div><div class="field"><label>Energía</label><input id="readyEnergy" type="number" min="1" max="10"></div><div class="field"><label>Fatiga</label><input id="readyFatigue" type="number" min="1" max="10"></div><div class="field"><label>Molestia</label><input id="readyPain" type="number" min="0" max="10"></div></div><button class="btn btn-ghost" id="calcReadiness">Evaluar preparación</button><div id="readyVerdict" class="empty-state">Pendiente.</div></article></section>
  <section class="app-card"><h2>2 · Registrar serie o bloque</h2><p>Permite individual, biserie, circuito, HIIT, Tabata, EMOM, AMRAP, movilidad o técnica. Cada registro se guarda en sesión presencial, cargas e histórico cuando corresponde.</p><div class="form-grid-3"><div class="field"><label>Tipo de bloque</label><select id="liveBlockType">${TIPOS_BLOQUE_SESION.map(t => `<option>${esc(t)}</option>`).join('')}</select></div><div class="field"><label>Bloque</label><input id="liveBlockTitle" placeholder="Fuerza principal / Circuito A"></div><div class="field"><label>Acción</label><select id="liveAction"><option>Realizada</option><option>Añadida</option><option>Reemplazada</option><option>Omitida</option><option>Ajustada</option></select></div><div class="field"><label>Ejercicio</label><input id="liveExercise" placeholder="Sentadilla goblet"></div><div class="field"><label>Reemplaza a</label><input id="liveReplacementFor" placeholder="Opcional"></div><div class="field"><label>Serie nº</label><input id="liveSetNumber" type="number" min="1" placeholder="1"></div><div class="field"><label>Repeticiones objetivo</label><input id="liveTargetReps" placeholder="10"></div><div class="field"><label>Repeticiones realizadas</label><input id="liveDoneReps" placeholder="10"></div><div class="field"><label>Tiempo</label><input id="liveTimeSeconds" placeholder="45"></div><div class="field"><label>Carga/valor</label><input id="liveLoadValue" placeholder="12"></div><div class="field"><label>Unidad</label><select id="liveLoadUnit">${UNIDADES_CARGA_SESION.map(u => `<option>${esc(u)}</option>`).join('')}</select></div><div class="field"><label>Distancia</label><input id="liveDistanceMeters" placeholder="metros, si aplica"></div><div class="field"><label>RPE</label><input id="liveRpe" type="number" min="1" max="10" placeholder="7"></div><div class="field"><label>Descanso</label><input id="liveRestSeconds" placeholder="90"></div><div class="field"><label>Resultado técnico</label><select id="liveResult"><option>Completado</option><option>Ajustado</option><option>No completado</option><option>Molestia</option><option>Mejor de lo esperado</option></select></div></div><div class="field"><label>Motivo / incidencia / nota técnica</label><textarea id="liveNotes" placeholder="Motivo del cambio, observación técnica, molestia, decisión del entrenador..."></textarea></div><div class="action-row"><button class="btn btn-primary" id="registerLiveSet">Guardar serie en Sheets</button><button class="btn btn-outline" id="clearLiveSet">Limpiar campos</button></div><div id="liveRegisterStatus"></div></section>
  <section class="app-card"><h2>3 · Registros de la sesión</h2><div id="liveRows">${renderLiveRows()}</div></section>
  <section class="app-card"><h2>4 · Cierre técnico</h2><div class="form-grid"><div class="field"><label>Decisión final IBERFIT</label><select id="liveFinalDecision"><option>Mantener progresión</option><option>Progresar próxima sesión</option><option>Repetir estímulo</option><option>Reducir carga/volumen</option><option>Revisar molestia</option><option>Cambiar enfoque</option></select></div><div class="field"><label>RPE global</label><input id="liveGlobalRpe" type="number" min="1" max="10"></div><div class="field"><label>Molestia final</label><input id="liveFinalPain" type="number" min="0" max="10"></div></div><div class="field"><label>Resumen del entrenador</label><textarea id="liveCoachSummary" placeholder="Qué ocurrió, qué ajustar, qué reportar y decisión para la próxima sesión."></textarea></div><button class="btn btn-primary" id="closeLiveSession">Cerrar sesión presencial</button><button class="btn btn-outline" id="analyzeLiveSession" type="button">Analizar sesión</button><div id="liveCloseStatus"></div><div id="liveAnalysis"></div></section>`, { active: 'sesion-vivo', title: 'Sesión presencial' });
  bindLiveSession();
}

function bindLiveSession() {
  $('#loadLiveClient')?.addEventListener('click', () => loadClientWorkspace($('#liveClient').value, 'resumen'));
  $('#calcReadiness')?.addEventListener('click', () => {
    const sleep = Number($('#readySleep').value || 0), energy = Number($('#readyEnergy').value || 0), fatigue = Number($('#readyFatigue').value || 0), pain = Number($('#readyPain').value || 0);
    const score = sleep + energy + (10 - fatigue) + (10 - pain);
    const verdict = score >= 28 ? 'LISTO' : score >= 20 ? 'AJUSTAR' : 'REDUCIR';
    $('#readyVerdict').innerHTML = `<strong>${verdict}</strong><p>Puntaje operativo: ${score}/40. Usar criterio del entrenador antes de progresar.</p>`;
  });
  $('#startLiveSession')?.addEventListener('click', startLiveSession);
  $('#registerLiveSet')?.addEventListener('click', registerLiveSet);
  $('#closeLiveSession')?.addEventListener('click', closeLiveSession);
  $('#reviewLiveSession')?.addEventListener('click', reviewLiveSession);
  $('#clearLiveSet')?.addEventListener('click', clearLiveSetFields);
  $('#searchLiveExercise')?.addEventListener('click', searchLiveExercise);
  $('#liveExercise')?.addEventListener('change', loadExerciseHistory);
  $('#toggleConcentrationMode')?.addEventListener('click', toggleConcentrationMode);
  $('#analyzeLiveSession')?.addEventListener('click', analyzeLiveSession);
}

function liveBasePayload() {
  return {
    coachToken: state.session?.coachToken,
    clientId: $('#liveClient')?.value || state.selectedClientId,
    sessionId: $('#liveSessionId')?.value.trim() || state.liveExecution?.sessionId || '',
    executionId: state.liveExecution?.executionId || '',
    title: $('#liveTitle')?.value.trim() || 'Sesión presencial IBERFIT',
    type: $('#liveSessionType')?.value || 'Presencial'
  };
}
async function startLiveSession() {
  $('#liveStartStatus').innerHTML = statusBox('Iniciando sesión presencial...', 'warn');
  const payload = liveBasePayload();
  const res = await iberfitApi('coachIniciarSesionPresencial', { ...payload, idempotencyKey: `inicio-${payload.clientId}-${payload.sessionId || payload.title}-${new Date().toISOString().slice(0,10)}` });
  if (!res || res.ok === false) { $('#liveStartStatus').innerHTML = statusBox(res?.message || res?.status || 'No se pudo iniciar la sesión.'); return; }
  state.liveExecution = res.data || res;
  state.liveRows = [];
  if (state.liveExecution.sessionId) $('#liveSessionId').value = state.liveExecution.sessionId;
  $('#liveStartStatus').innerHTML = statusBox(`Sesión iniciada: ${state.liveExecution.executionId || ''}`, 'ok');
  $('#liveRows').innerHTML = renderLiveRows();
}
function collectLiveSet() {
  return {
    blockType: $('#liveBlockType')?.value || 'Individual', blockTitle: $('#liveBlockTitle')?.value || '', actionType: $('#liveAction')?.value || 'Realizada',
    exerciseName: $('#liveExercise')?.value || '', replacementFor: $('#liveReplacementFor')?.value || '', setNumber: $('#liveSetNumber')?.value || '',
    targetReps: $('#liveTargetReps')?.value || '', doneReps: $('#liveDoneReps')?.value || '', timeSeconds: $('#liveTimeSeconds')?.value || '',
    loadValue: $('#liveLoadValue')?.value || '', loadUnit: $('#liveLoadUnit')?.value || '', distanceMeters: $('#liveDistanceMeters')?.value || '',
    rpe: $('#liveRpe')?.value || '', restSeconds: $('#liveRestSeconds')?.value || '', result: $('#liveResult')?.value || '', notes: $('#liveNotes')?.value || ''
  };
}
async function registerLiveSet() {
  const set = collectLiveSet();
  if (!set.exerciseName && set.actionType !== 'Omitida') { $('#liveRegisterStatus').innerHTML = statusBox('Indica el ejercicio o registra una omisión con motivo.'); return; }
  if (!state.liveExecution?.executionId) await startLiveSession();
  const base = liveBasePayload();
  const idKey = `serie-${base.clientId}-${base.sessionId}-${state.liveExecution?.executionId}-${set.exerciseName}-${set.setNumber}-${Date.now()}`;
  $('#liveRegisterStatus').innerHTML = statusBox('Guardando serie en sesión presencial, cargas e histórico...', 'warn');
  const res = await iberfitApi('coachRegistrarSeriePresencial', { ...base, executionId: state.liveExecution?.executionId, set, idempotencyKey: idKey });
  if (!res || res.ok === false) { $('#liveRegisterStatus').innerHTML = statusBox(res?.message || res?.status || 'No se pudo guardar la serie.'); return; }
  state.liveRows.push((res.data && res.data.registro) || { ...set, FECHA: new Date().toISOString() });
  $('#liveRows').innerHTML = renderLiveRows();
  $('#liveRegisterStatus').innerHTML = statusBox('Serie guardada y trazada.', 'ok');
  clearLiveSetFields(false);
}
async function reviewLiveSession() {
  const base = liveBasePayload();
  $('#liveStartStatus').innerHTML = statusBox('Revisando ejecución guardada...', 'warn');
  const res = await iberfitApi('coachRevisarSesionPresencial', { ...base });
  if (!res || res.ok === false) { $('#liveStartStatus').innerHTML = statusBox(res?.message || res?.status || 'No se pudo revisar la sesión.'); return; }
  const rows = arr(res.data?.registros || res.registros);
  state.liveRows = rows.length ? rows : state.liveRows;
  $('#liveRows').innerHTML = renderLiveRows();
  $('#liveStartStatus').innerHTML = statusBox(`Registros recuperados: ${state.liveRows.length}`, 'ok');
}
async function closeLiveSession() {
  const base = liveBasePayload();
  if (!base.sessionId && !state.liveExecution?.sessionId) { $('#liveCloseStatus').innerHTML = statusBox('No hay sesión iniciada para cerrar.'); return; }
  $('#liveCloseStatus').innerHTML = statusBox('Cerrando sesión presencial...', 'warn');
  const res = await iberfitApi('coachCerrarSesionPresencial', { ...base, executionId: state.liveExecution?.executionId, finalDecision: $('#liveFinalDecision')?.value, globalRpe: $('#liveGlobalRpe')?.value, finalPain: $('#liveFinalPain')?.value, summary: $('#liveCoachSummary')?.value });
  $('#liveCloseStatus').innerHTML = res?.ok === false ? statusBox(res.message || res.status || 'No se pudo cerrar.') : statusBox(`Sesión cerrada. Series registradas: ${res.data?.series || res.series || state.liveRows.length}`, 'ok');
}
function clearLiveSetFields(clearExercise = true) {
  ['liveSetNumber','liveTargetReps','liveDoneReps','liveTimeSeconds','liveLoadValue','liveDistanceMeters','liveRpe','liveRestSeconds','liveNotes','liveReplacementFor'].forEach(id => { const el = $('#'+id); if (el) el.value = ''; });
  if (clearExercise && $('#liveExercise')) $('#liveExercise').value = '';
}
function renderLiveRows() {
  const rows = arr(state.liveRows);
  if (!rows.length) return '<div class="empty-state">Aún no hay series guardadas en esta ejecución.</div>';
  return `<div class="table-scroll"><table><thead><tr><th>Ejercicio</th><th>Bloque</th><th>Serie</th><th>Reps/Tiempo</th><th>Carga</th><th>RPE</th><th>Acción</th><th>Nota</th></tr></thead><tbody>${rows.map(r => `<tr><td>${esc(valueOf(r.EJERCICIO, r.exerciseName, r.ejercicio, ''))}</td><td>${esc(valueOf(r.TIPO_BLOQUE, r.blockType, ''))}</td><td>${esc(valueOf(r.SERIE_NUMERO, r.setNumber, ''))}</td><td>${esc(valueOf(r.REPETICIONES_REALIZADAS, r.doneReps, r.TIEMPO_SEGUNDOS, r.timeSeconds, ''))}</td><td>${esc([valueOf(r.CARGA_VALOR, r.loadValue, r.CARGA, ''), valueOf(r.UNIDAD_CARGA, r.loadUnit, r.UNIDAD, '')].filter(Boolean).join(' '))}</td><td>${esc(valueOf(r.RPE, r.rpe, ''))}</td><td>${esc(valueOf(r.ACCION, r.actionType, ''))}</td><td>${esc(valueOf(r.NOTAS, r.notes, r.MOTIVO, ''))}</td></tr>`).join('')}</tbody></table></div>`;
}


async function searchLiveExercise() {
  const q = $('#liveExercise')?.value || '';
  const res = await iberfitApi('coachBuscarEjercicios', { coachToken: state.session?.coachToken, query: q, clientId: $('#liveClient')?.value || state.selectedClientId, limit: 10 });
  const host = $('#liveLibraryResults');
  if (!host) return;
  if (!res || res.ok === false) { host.innerHTML = statusBox(res?.message || res?.status || 'No se pudo buscar en biblioteca.'); return; }
  const rows = arr(res.results || res.data || []);
  host.innerHTML = rows.length ? `<section class="app-card"><h3>Biblioteca inteligente</h3>${rows.map(ex => `<button class="client-row" data-exercise-pick="${esc(ex.nombre || ex.name || '')}"><strong>${esc(ex.nombre || ex.name || '')}</strong><span>${esc([ex.patron, ex.zona, ex.material, ex.nivel].filter(Boolean).join(' · '))}</span></button>`).join('')}</section>` : '<div class="empty-state">Sin resultados de biblioteca para esta búsqueda.</div>';
  $$('[data-exercise-pick]', host).forEach(btn => btn.addEventListener('click', () => { $('#liveExercise').value = btn.dataset.exercisePick || ''; loadExerciseHistory(); }));
}
async function loadExerciseHistory() {
  const exercise = $('#liveExercise')?.value || '';
  const clientId = $('#liveClient')?.value || state.selectedClientId;
  if (!exercise || !clientId) return;
  const res = await iberfitApi('coachHistorialEjercicio', { coachToken: state.session?.coachToken, clientId, exercise });
  const host = $('#liveExerciseHistory');
  if (!host) return;
  if (!res || res.ok === false) { host.innerHTML = ''; return; }
  const s = res.summary || {};
  host.innerHTML = `<section class="app-card"><h3>Historial del ejercicio</h3><p><strong>Registros:</strong> ${esc(s.registros || 0)} · <strong>Mejor carga:</strong> ${esc(s.mejorCarga || 'sin dato')} · <strong>Última carga:</strong> ${esc(s.ultimaCarga || 'sin dato')} · <strong>RPE medio:</strong> ${esc(s.rpePromedio || 'sin dato')}</p><p class="muted">${esc(s.recomendacion || 'Usar criterio del entrenador.')}</p></section>`;
}
function toggleConcentrationMode() {
  document.body.classList.toggle('modo-concentracion');
  const active = document.body.classList.contains('modo-concentracion');
  const box = $('#liveStartStatus');
  if (box) box.innerHTML = statusBox(active ? 'Modo concentración activo: se prioriza la ejecución de la sesión.' : 'Modo concentración desactivado.', active ? 'ok' : 'warn');
}
async function analyzeLiveSession() {
  const base = liveBasePayload();
  const host = $('#liveAnalysis');
  if (host) host.innerHTML = statusBox('Analizando sesión registrada...', 'warn');
  const res = await iberfitApi('coachAnalisisPostSesion', { ...base, executionId: state.liveExecution?.executionId });
  if (!host) return;
  if (!res || res.ok === false) { host.innerHTML = statusBox(res?.message || res?.status || 'No se pudo analizar la sesión.'); return; }
  const a = res.data || {};
  host.innerHTML = `<section class="app-card"><h3>Análisis post-sesión</h3><p><strong>Series:</strong> ${esc(a.series || 0)} · <strong>RPE medio:</strong> ${esc(a.rpePromedio || 'sin dato')} · <strong>Omisiones:</strong> ${esc(a.omisiones || 0)} · <strong>Ajustes:</strong> ${esc(a.ajustes || 0)} · <strong>Prioridad:</strong> ${esc(a.prioridad || '')}</p><p>${esc(a.decisionSugerida || '')}</p></section>`;
}

function renderLibrary() {
  const library = arr(state.dashboard?.library || state.dashboard?.biblioteca || state.workspace?.raw?.library || []);
  shell(`<section class="hero-card"><p>BIBLIOTECA INTELIGENTE</p><h1>Ejercicios, sustituciones e historial</h1><span>Buscar ejercicios por patrón, material, nivel o restricción, con salida preparada para sesión guiada y modo concentración.</span></section><section class="module-grid"><article class="app-card"><h2>Buscar ejercicio</h2><div class="form-grid"><div class="field"><label>Búsqueda</label><input id="libraryQuery" placeholder="sentadilla, empuje, mancuerna, movilidad..."></div><div class="field"><label>Patrón</label><input id="libraryPattern" placeholder="sentadilla, empuje, tracción..."></div><div class="field"><label>Material</label><input id="libraryMaterial" placeholder="mancuernas, banda, máquina..."></div></div><button class="btn btn-primary" id="librarySearchBtn">Buscar en biblioteca</button><div id="librarySearchStatus"></div></article><article class="app-card"><h2>Criterio V11-F7.7.2</h2><p>La biblioteca no es solo una lista: debe aportar progresiones, regresiones, sustituciones, restricciones, indicaciones técnicas y enlaces multimedia cuando existan.</p></article></section><section class="app-card"><h2>Resultados</h2><div id="libraryResults">${renderGenericTable(library, ['NOMBRE_EJERCICIO', 'PATRON', 'ZONA', 'MATERIAL', 'NIVEL', 'INDICACIONES_TECNICAS', 'REGRESION', 'PROGRESION'], 'Usa el buscador para consultar biblioteca semántica.')}</div></section>`, { active: 'biblioteca', title: 'Biblioteca inteligente' });
  $('#librarySearchBtn')?.addEventListener('click', searchLibraryModule);
}

async function searchLibraryModule() {
  const payload = { coachToken: state.session?.coachToken, query: $('#libraryQuery')?.value || '', pattern: $('#libraryPattern')?.value || '', material: $('#libraryMaterial')?.value || '', limit: 25 };
  $('#librarySearchStatus').innerHTML = statusBox('Buscando ejercicios...', 'warn');
  const res = await iberfitApi('coachBuscarEjercicios', payload);
  if (!res || res.ok === false) { $('#librarySearchStatus').innerHTML = statusBox(res?.message || res?.status || 'No se pudo buscar.'); return; }
  $('#librarySearchStatus').innerHTML = statusBox(`Resultados: ${res.summary?.resultados || arr(res.results).length}`, 'ok');
  $('#libraryResults').innerHTML = renderGenericTable(arr(res.results), ['nombre','patron','zona','material','nivel','indicaciones','regresion','progresion','sustitucion','restricciones','video'], 'Sin resultados.');
}


function renderMultimedia() {
  shell(`<section class="hero-card"><p>MULTIMEDIA</p><h1>Vídeos, imágenes y recursos por ejercicio</h1><span>Asocia recursos claros a ejercicios para mejorar la sesión guiada del cliente sin sobrecargar la App Entrenador.</span></section><section class="module-grid"><article class="app-card"><h2>Guardar recurso</h2><div class="form-grid"><div class="field"><label>Ejercicio</label><input id="mediaExercise" placeholder="Sentadilla goblet"></div><div class="field"><label>Tipo</label><select id="mediaType"><option>VIDEO</option><option>IMAGEN</option><option>PDF</option><option>ENLACE</option></select></div></div><div class="field"><label>Título visible</label><input id="mediaTitle" placeholder="Técnica de sentadilla goblet"></div><div class="field"><label>Enlace</label><input id="mediaUrl" placeholder="https://... vídeo, imagen o documento"></div><div class="form-grid"><div class="field"><label>Duración en segundos</label><input id="mediaDuration" type="number" min="0" placeholder="45"></div><div class="field"><label>Visible para cliente</label><select id="mediaVisible"><option>SI</option><option>NO</option></select></div></div><div class="field"><label>Descripción / indicación</label><textarea id="mediaDescription" placeholder="Qué debe observar el cliente o el entrenador..."></textarea></div><button class="btn btn-primary" id="saveMedia">Guardar multimedia</button><div id="mediaStatus"></div></article><article class="app-card"><h2>Revisar recursos</h2><div class="field"><label>Ejercicio</label><input id="mediaProbeExercise" placeholder="Sentadilla, remo, movilidad..."></div><button class="btn btn-outline" id="reviewMedia">Revisar multimedia</button><p class="muted">Los recursos visibles se incorporan a la sesión guiada cuando el ejercicio coincide.</p></article></section><section class="app-card"><h2>Resultado</h2><div id="mediaOutput" class="muted">Pendiente.</div></section>`, { active: 'multimedia', title: 'Multimedia' });
  $('#saveMedia')?.addEventListener('click', saveExerciseMedia);
  $('#reviewMedia')?.addEventListener('click', reviewExerciseMedia);
}
async function saveExerciseMedia() {
  const res = await iberfitApi('coachGuardarMultimediaEjercicio', { coachToken: state.session?.coachToken, exerciseName: $('#mediaExercise')?.value || '', mediaType: $('#mediaType')?.value || 'VIDEO', title: $('#mediaTitle')?.value || '', url: $('#mediaUrl')?.value || '', durationSeconds: $('#mediaDuration')?.value || '', visibleClient: $('#mediaVisible')?.value || 'SI', description: $('#mediaDescription')?.value || '' });
  $('#mediaStatus').innerHTML = res?.ok !== false ? statusBox('Multimedia guardada.', 'ok') : statusBox(res?.message || res?.status || 'No se pudo guardar.');
  $('#mediaOutput').textContent = safeJson(res);
}
async function reviewExerciseMedia() {
  const res = await iberfitApi('coachRevisarMultimediaEjercicio', { coachToken: state.session?.coachToken, exerciseName: $('#mediaProbeExercise')?.value || $('#mediaExercise')?.value || '' });
  $('#mediaOutput').textContent = safeJson(res);
}

function renderDecisions() { const rows = arr(state.workspace?.decisions || state.dashboard?.decisions || state.dashboard?.decisiones); shell(`<section class="hero-card"><p>DECISIONES</p><h1>Registro de criterio</h1><span>Cada ajuste relevante debe quedar trazado.</span></section><section class="app-card">${renderGenericTable(rows, ['FECHA', 'CLIENTE_ID', 'TIPO', 'DECISION_IBERFIT', 'CRITERIO', 'ESTADO'], 'Sin decisiones recibidas.')}</section>`, { active: 'decisiones', title: 'Decisiones' }); }

function renderLearning() {
  shell(`<section class="hero-card"><p>APRENDIZAJE SUPERVISADO</p><h1>IA propone · entrenador decide · resultado se registra</h1><span>IBERFIT aprende del criterio del entrenador sin tomar decisiones automáticas.</span></section><section class="module-grid"><article class="app-card"><h2>Registrar aprendizaje</h2><div class="form-grid"><div class="field"><label>Cliente</label><select id="learnClient"><option value="">Seleccionar</option>${state.clients.map(c => `<option value="${esc(c.id)}" ${c.id===state.selectedClientId?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div><div class="field"><label>Sesión opcional</label><input id="learnSessionId" placeholder="SES-..."></div></div><div class="field"><label>Propuesta IA / Motor IBERFIT</label><textarea id="learnAiProposal" placeholder="Qué propuso el sistema..."></textarea></div><div class="field"><label>Decisión del entrenador</label><textarea id="learnCoachDecision" placeholder="Qué decidió Carlos y por qué..."></textarea></div><div class="field"><label>Resultado observado</label><select id="learnResult"><option value="ACEPTADA">Aceptada</option><option value="CORREGIDA">Corregida</option><option value="DESCARTADA">Descartada</option><option value="PENDIENTE">Pendiente</option></select></div><div class="field"><label>Motivo / aprendizaje</label><textarea id="learnReason" placeholder="Qué debe recordar IBERFIT para próximas sugerencias..."></textarea></div><button class="btn btn-primary" id="saveLearning">Guardar aprendizaje</button><div id="learningStatus"></div></article><article class="app-card"><h2>Revisión</h2><p>Este módulo no entrena modelos externos. Solo deja trazabilidad interna para mejorar reglas, informes y recomendaciones futuras.</p><button class="btn btn-outline" id="reviewLearning">Revisar aprendizaje guardado</button></article></section><section class="app-card"><h2>Resultado</h2><div id="learningOutput" class="muted">Pendiente.</div></section>`, { active: 'aprendizaje', title: 'Aprendizaje supervisado' });
  $('#saveLearning')?.addEventListener('click', saveLearning);
  $('#reviewLearning')?.addEventListener('click', reviewLearning);
}

async function saveLearning() {
  const res = await iberfitApi('coachRegistrarAprendizajeSupervisado', { coachToken: state.session?.coachToken, clientId: $('#learnClient')?.value || state.selectedClientId, sessionId: $('#learnSessionId')?.value || '', aiProposal: $('#learnAiProposal')?.value || '', coachDecision: $('#learnCoachDecision')?.value || '', result: $('#learnResult')?.value || '', reason: $('#learnReason')?.value || '' });
  $('#learningStatus').innerHTML = res?.ok !== false ? statusBox('Aprendizaje guardado.', 'ok') : statusBox(res?.message || res?.status || 'No se pudo guardar.');
  $('#learningOutput').textContent = safeJson(res);
}
async function reviewLearning() {
  const res = await iberfitApi('coachRevisarAprendizajeSupervisado', { coachToken: state.session?.coachToken, clientId: $('#learnClient')?.value || state.selectedClientId });
  $('#learningOutput').textContent = safeJson(res);
}
function renderAlerts() { const rows = arr(state.workspace?.alerts || state.dashboard?.alerts || state.dashboard?.alertas); shell(`<section class="hero-card"><p>ALERTAS</p><h1>Prioridad y riesgo operativo</h1><span>Alertas de adherencia, ausencia, dolor, carga o información incompleta.</span></section><section class="app-card">${renderGenericTable(rows, ['FECHA', 'CLIENTE_ID', 'TIPO_ALERTA', 'PRIORIDAD', 'DESCRIPCION', 'ESTADO'], 'Sin alertas recibidas.')}</section>`, { active: 'alertas', title: 'Alertas' }); }
function renderAccesses() { const rows = arr(state.dashboard?.accesses || state.dashboard?.accesos); shell(`<section class="hero-card"><p>ACCESOS</p><h1>Control de identidad</h1><span>Verificar acceso activo, cliente correcto y cero sesiones contaminadas.</span></section><section class="app-card">${renderGenericTable(rows, ['CLIENTE_ID', 'LOGIN', 'ROL_ACCESO', 'ESTADO_ACCESO', 'ULTIMO_ACCESO'], 'Accesos no entregados a la interfaz. Mantener revisión en Sheets/auditoría administrativa.')}</section>`, { active: 'accesos', title: 'Accesos' }); }



function renderExternalActivity() {
  shell(`<section class="hero-card premium-hero"><p>ACTIVIDAD EXTERNA</p><h1>Datos complementarios y wearables</h1><span>Integración prudente: primero registro fiable, luego conexiones automáticas con consentimiento y QA.</span><div class="premium-flow"><span>Manual</span><span>Validado</span><span>Conectado</span><span>Interpretado</span></div></section><section class="module-grid"><article class="app-card premium-card"><h2>Estado de integraciones</h2><p>Wearables todavía no están conectados automáticamente. Esta versión deja preparada la experiencia segura sin depender de APIs externas.</p><div class="quality-grid"><span class="quality-chip info">Apple Watch · futuro</span><span class="quality-chip info">Garmin · futuro</span><span class="quality-chip info">Strava · futuro</span><span class="quality-chip info">Fitbit · futuro</span><span class="quality-chip ok">Registro manual activo</span></div></article><article class="app-card"><h2>Revisar cliente</h2><div class="field"><label>Cliente</label><select id="activityClient">${state.clients.map(c => `<option value="${esc(c.id)}" ${c.id === state.selectedClientId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div><button class="btn btn-primary" id="reviewExternalActivity">Revisar actividad complementaria</button><div id="externalActivityOut"></div></article></section><section class="app-card premium-card"><h2>Regla IBERFIT</h2><p>Los datos externos son contexto, no fuente de verdad absoluta. El entrenador revisa tendencias y decide cómo ajustar el entrenamiento.</p><ul><li>Sin autorización explícita no se conecta ningún dispositivo.</li><li>Si una integración falla, la app sigue funcionando.</li><li>La actividad externa no reemplaza feedback, RPE ni molestias reportadas.</li></ul></section>`, { active:'actividad', title:'Actividad externa' });
  $('#reviewExternalActivity')?.addEventListener('click', async () => {
    const clientId = $('#activityClient')?.value || state.selectedClientId;
    const res = await iberfitApi('coachRevisarActividadExterna', { coachToken: state.session?.coachToken, clientId });
    $('#externalActivityOut').innerHTML = `${debugPanel(res)}`;
  });
}

function renderPremiumExperience() {
  shell(`<section class="hero-card premium-hero"><p>MARCA IBERFIT</p><h1>Identidad visual y facilidad de uso</h1><span>El sistema debe sentirse propio de IBERFIT: elegante, dinámico, guiado y sin peso visual innecesario.</span><div class="premium-flow"><span>Claridad</span><span>Control</span><span>Confianza</span><span>Seguimiento</span></div></section><section class="module-grid"><article class="app-card premium-card"><h2>Principios IBERFIT</h2><div class="premium-checklist"><div><strong>1. Contexto primero</strong><span>Cada pantalla explica qué se está viendo y qué hacer después.</span></div><div><strong>2. Acción principal clara</strong><span>Un botón dominante por tarea crítica para evitar ruido.</span></div><div><strong>3. Estado siempre visible</strong><span>Sincronización, validación, error o éxito deben verse al momento.</span></div><div><strong>4. Cliente sin complejidad</strong><span>El cliente recibe una sesión guiada, no una tabla técnica.</span></div></div></article><article class="app-card premium-card"><h2>Revisión visual rápida</h2><div class="quality-grid"><span class="quality-chip ok">Español visible</span><span class="quality-chip ok">Isotipo visible</span><span class="quality-chip ok">Paleta IBERFIT</span><span class="quality-chip ok">Modo concentración</span><span class="quality-chip warn">Probar tablet</span><span class="quality-chip warn">Probar móvil</span><span class="quality-chip info">Pulido continuo</span></div><button class="btn btn-primary" id="premiumGuideBtn">Revisar guía del sistema</button><div id="premiumGuideOut"></div></article></section><section class="app-card premium-card"><h2>Patrón visual IBERFIT recomendado</h2><div class="premium-flow large"><span>Resumen</span><span>Datos relevantes</span><span>Acción</span><span>Confirmación</span><span>Siguiente paso</span></div><p class="muted">Este patrón debe repetirse en creación de sesión, sesión presencial, bioimpedancia, informes, aprendizaje y Espacio Cliente.</p></section>`, { active: 'experiencia', title: 'Experiencia premium' });
  $('#premiumGuideBtn')?.addEventListener('click', async () => {
    const host = $('#premiumGuideOut'); if (host) host.innerHTML = statusBox('Revisando criterios de experiencia premium...', 'warn');
    const res = await iberfitApi('coachGuiaExperienciaPremium', { coachToken: state.session?.coachToken });
    if (host) host.innerHTML = res?.ok === false ? statusBox(res.message || res.status || 'No se pudo revisar.') : `${debugPanel(res.data || res)}`;
  });
}

function renderQa() {
  shell(`<section class="hero-card"><p>CONTROL DEL SISTEMA</p><h1>Centro de verificación V11-F7.7.2</h1><span>Validar sistema completo antes de despliegue: autenticación, Sheets, publicación, informes, IRI, bioimpedancia, sesiones, PWA y Gemini opcional.</span></section><section class="module-grid"><article class="app-card"><h2>Pruebas</h2><div class="action-row"><button class="btn btn-primary" id="qaCentroVerificacion">Centro de verificación</button><button class="btn btn-primary" id="qaGet">Conexión API</button><button class="btn btn-primary" id="qaPost">Salud del servidor</button><button class="btn btn-primary" id="qaAudit">Auditoría V11</button><button class="btn btn-primary" id="qaHealth">Panel de salud del sistema</button><button class="btn btn-primary" id="qaDecision">Resumen de decisión</button><button class="btn btn-primary" id="qaSemantic">Biblioteca semántica</button><button class="btn btn-primary" id="qaBio">Informes de bioimpedancia</button><button class="btn btn-primary" id="qaLive">Sesión presencial</button><button class="btn btn-primary" id="qaSearch">Buscar ejercicios</button><button class="btn btn-primary" id="qaPostAnalysis">Análisis post-sesión</button><button class="btn btn-primary" id="qaSmartReport">Informe inteligente</button><button class="btn btn-primary" id="qaLearning">Aprendizaje supervisado</button><button class="btn btn-primary" id="qaMedia">Multimedia</button><button class="btn btn-primary" id="qaClientExp">Experiencia cliente</button><button class="btn btn-primary" id="qaPremiumExp">Experiencia premium</button><button class="btn btn-primary" id="qaExternalActivity">Actividad externa</button><button class="btn btn-primary" id="qaWearablesGuide">Guía de integraciones</button></div><div id="qaStatus"></div></article><article class="app-card"><h2>Criterios de aprobación V11-F7.7.2</h2><ul><li>Contrato de headers OK en Clientes, Sesiones, Feedback y Check-in.</li><li>Sin IDs duplicados ni sesiones huérfanas.</li><li>Estados de sesión válidos.</li><li>La validación previa bloquea publicaciones incoherentes.</li><li>Gemini queda como apoyo opcional, nunca fuente de verdad.</li><li>V11-F7.7.2 mantiene decisión explicable y refuerza marca IBERFIT, isotipo, experiencia guiada y pulido visual final.</li><li>Sesión presencial puede iniciar, registrar series, actualizar cargas/histórico y cerrar.</li><li>Biblioteca semántica disponible o declarada como parcial antes de automatizar cargas.</li></ul></article></section><section class="app-card"><h2>Validación previa de publicación</h2><div class="form-grid"><div class="field"><label>Identificador de sesión</label><input id="qaSessionId" placeholder="SES-APPCLI-0001-XXXX"></div><div class="field"><label>Acción</label><button class="btn btn-outline" id="qaPreflight">Ejecutar validación previa</button></div></div></section><section class="app-card"><h2>Resultado</h2><div id="qaOutput" class="muted">Pendiente.</div></section>`, { active: 'qa', title: 'Control del sistema' });
  $('#qaGet')?.addEventListener('click', async () => { const out = await iberfitGetHealth(); $('#qaOutput').textContent = DIAGNOSTICO_ACTIVO ? safeJson(out) : (out?.status || out?.message || 'Prueba ejecutada. Activa diagnóstico para ver detalle técnico.'); });
  $('#qaPost')?.addEventListener('click', async () => { const out = await iberfitApi('backendHealth', { coachToken: state.session?.coachToken }); $('#qaOutput').textContent = DIAGNOSTICO_ACTIVO ? safeJson(out) : (out?.status || out?.message || 'Prueba ejecutada. Activa diagnóstico para ver detalle técnico.'); });
  $('#qaAudit')?.addEventListener('click', async () => { const out = await iberfitApi('adminV11SystemAudit', { coachToken: state.session?.coachToken }); $('#qaOutput').textContent = DIAGNOSTICO_ACTIVO ? safeJson(out) : (out?.status || out?.message || 'Prueba ejecutada. Activa diagnóstico para ver detalle técnico.'); });
  $('#qaCentroVerificacion')?.addEventListener('click', async () => {
    $('#qaOutput').innerHTML = '<div class="status-box">Ejecutando Centro de verificación...</div>';
    const out = await iberfitApi('coachCentroVerificacionSistema', { coachToken: state.session?.coachToken });
    $('#qaOutput').innerHTML = out?.ok === false ? statusBox(out.message || out.status || 'No se pudo ejecutar el Centro de verificación.') : renderVerificationCenter(out.data || out);
  });
  $('#qaHealth')?.addEventListener('click', async () => { const out = await iberfitApi('coachPanelSaludSistema', { coachToken: state.session?.coachToken }); $('#qaOutput').textContent = DIAGNOSTICO_ACTIVO ? safeJson(out) : (out?.status || out?.message || 'Prueba ejecutada. Activa diagnóstico para ver detalle técnico.'); });
  $('#qaPreflight')?.addEventListener('click', async () => { const out = await iberfitApi('coachValidacionPreviaPublicacion', { coachToken: state.session?.coachToken, sessionId: $('#qaSessionId')?.value.trim() }); $('#qaOutput').textContent = DIAGNOSTICO_ACTIVO ? safeJson(out) : (out?.status || out?.message || 'Prueba ejecutada. Activa diagnóstico para ver detalle técnico.'); });
  $('#qaDecision')?.addEventListener('click', async () => { const out = await iberfitApi('coachResumenDecision', { coachToken: state.session?.coachToken, clientId: state.selectedClientId }); $('#qaOutput').textContent = DIAGNOSTICO_ACTIVO ? safeJson(out) : (out?.status || out?.message || 'Prueba ejecutada. Activa diagnóstico para ver detalle técnico.'); });
  $('#qaSemantic')?.addEventListener('click', async () => { const out = await iberfitApi('coachRevisarBibliotecaSemantica', { coachToken: state.session?.coachToken }); $('#qaOutput').textContent = DIAGNOSTICO_ACTIVO ? safeJson(out) : (out?.status || out?.message || 'Prueba ejecutada. Activa diagnóstico para ver detalle técnico.'); });
  $('#qaBio')?.addEventListener('click', async () => { const out = await iberfitApi('coachRevisarInformesBioimpedancia', { coachToken: state.session?.coachToken, clientId: state.selectedClientId }); $('#qaOutput').textContent = DIAGNOSTICO_ACTIVO ? safeJson(out) : (out?.status || out?.message || 'Prueba ejecutada. Activa diagnóstico para ver detalle técnico.'); });
  $('#qaLive')?.addEventListener('click', async () => { const out = await iberfitApi('coachRevisarSesionPresencial', { coachToken: state.session?.coachToken, clientId: state.selectedClientId }); $('#qaOutput').textContent = DIAGNOSTICO_ACTIVO ? safeJson(out) : (out?.status || out?.message || 'Prueba ejecutada. Activa diagnóstico para ver detalle técnico.'); });
  $('#qaSearch')?.addEventListener('click', async () => { const out = await iberfitApi('coachBuscarEjercicios', { coachToken: state.session?.coachToken, query:'sentadilla', limit:5 }); $('#qaOutput').textContent = DIAGNOSTICO_ACTIVO ? safeJson(out) : (out?.status || out?.message || 'Prueba ejecutada. Activa diagnóstico para ver detalle técnico.'); });
  $('#qaPostAnalysis')?.addEventListener('click', async () => { const out = await iberfitApi('coachAnalisisPostSesion', { coachToken: state.session?.coachToken, clientId: state.selectedClientId, sessionId: $('#qaSessionId')?.value }); $('#qaOutput').textContent = DIAGNOSTICO_ACTIVO ? safeJson(out) : (out?.status || out?.message || 'Prueba ejecutada. Activa diagnóstico para ver detalle técnico.'); });
  $('#qaSmartReport')?.addEventListener('click', async () => { const out = await iberfitApi('coachGenerarInformeInteligente', { coachToken: state.session?.coachToken, clientId: state.selectedClientId, reportType:'SEMANAL' }); $('#qaOutput').textContent = DIAGNOSTICO_ACTIVO ? safeJson(out) : (out?.status || out?.message || 'Prueba ejecutada. Activa diagnóstico para ver detalle técnico.'); });
  $('#qaLearning')?.addEventListener('click', async () => { const out = await iberfitApi('coachRevisarAprendizajeSupervisado', { coachToken: state.session?.coachToken, clientId: state.selectedClientId }); $('#qaOutput').textContent = DIAGNOSTICO_ACTIVO ? safeJson(out) : (out?.status || out?.message || 'Prueba ejecutada. Activa diagnóstico para ver detalle técnico.'); });
  $('#qaMedia')?.addEventListener('click', async () => { const out = await iberfitApi('coachRevisarMultimediaEjercicio', { coachToken: state.session?.coachToken, exerciseName:'sentadilla' }); $('#qaOutput').textContent = DIAGNOSTICO_ACTIVO ? safeJson(out) : (out?.status || out?.message || 'Prueba ejecutada. Activa diagnóstico para ver detalle técnico.'); });
  $('#qaClientExp')?.addEventListener('click', async () => { const out = await iberfitApi('coachRevisarExperienciaCliente', { coachToken: state.session?.coachToken, clientId: state.selectedClientId }); $('#qaOutput').textContent = DIAGNOSTICO_ACTIVO ? safeJson(out) : (out?.status || out?.message || 'Prueba ejecutada. Activa diagnóstico para ver detalle técnico.'); });
  $('#qaPremiumExp')?.addEventListener('click', async () => { const out = await iberfitApi('coachGuiaExperienciaPremium', { coachToken: state.session?.coachToken }); $('#qaOutput').textContent = DIAGNOSTICO_ACTIVO ? safeJson(out) : (out?.status || out?.message || 'Prueba ejecutada. Activa diagnóstico para ver detalle técnico.'); });
  $('#qaExternalActivity')?.addEventListener('click', async () => { const out = await iberfitApi('coachRevisarActividadExterna', { coachToken: state.session?.coachToken, clientId: state.selectedClientId }); $('#qaOutput').textContent = DIAGNOSTICO_ACTIVO ? safeJson(out) : (out?.status || out?.message || 'Prueba ejecutada. Activa diagnóstico para ver detalle técnico.'); });
  $('#qaWearablesGuide')?.addEventListener('click', async () => { const out = await iberfitApi('coachGuiaIntegracionesWearables', { coachToken: state.session?.coachToken }); $('#qaOutput').textContent = DIAGNOSTICO_ACTIVO ? safeJson(out) : (out?.status || out?.message || 'Prueba ejecutada. Activa diagnóstico para ver detalle técnico.'); });
}

function boot() {
  try {
    if (!root()) throw new Error('No se encontró #coachRoot.');
    showLoading('Iniciando App Entrenador');
    const existing = readCoachSession();
    if (!existing) { renderLogin(); return; }
    state.session = existing;
    loadDashboard('dashboard');
  } catch (err) {
    showError('No se pudo iniciar App Entrenador', err.message, {});
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
