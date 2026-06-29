/* IBERFIT V9.4 · Coach & Client Experience Upgrade
   No cambia la estética aprobada. Añade densidad operativa: clientes, IRI, cargas, sesión presencial, informes y Motor de Decisión IBERFIT. */
import { IBERFIT_CONFIG, resolveApiMode } from "./config.js";

const $ = (q, root = document) => root.querySelector(q);
const $$ = (q, root = document) => [...root.querySelectorAll(q)];
const root = $("#coachRoot");
const COACH_KEY = "IBERFIT_COACH_SESSION_V9_3";
const DRAFT_KEY = "IBERFIT_COACH_PRESENCIAL_DRAFT_V9_3";
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

const estado = {
  token: "",
  vence: "",
  coach: {},
  panel: null,
  espacio: null,
  clienteId: "",
  aviso: "",
  avisoTipo: "info",
  enlace: "",
  vista: "panel",
  filtroCliente: "",
  filtroEjercicio: "",
  filtroPatron: "",
  sesionActiva: "",
  ejercicioActivo: "",
  modoSesion: "presencial",
  borradorPresencial: leerBorradorPresencial()
};

function html(v = "") {
  return String(v ?? "").replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
}
function n(v, fallback = 0) {
  const x = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(x) ? x : fallback;
}
function fecha(v) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? html(v) : d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function fechaHora(v) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? html(v) : d.toLocaleString("es-CL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function safeArray(v) { return Array.isArray(v) ? v : []; }
function trunc(v, max = 90) { const s = String(v || ""); return s.length > max ? s.slice(0, max - 1) + "…" : s; }
function uid(prefix = "ID") { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`.toUpperCase(); }

function leerSesion() {
  try {
    const raw = sessionStorage.getItem(COACH_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s.coachToken) return null;
    if (s.expiresAt && Date.now() > new Date(s.expiresAt).getTime()) {
      sessionStorage.removeItem(COACH_KEY);
      return null;
    }
    return s;
  } catch { return null; }
}
function guardarSesionCoach(data) {
  const s = { coachToken: data.coachToken || "", expiresAt: data.expiresAt || "", coach: data.coach || {} };
  sessionStorage.setItem(COACH_KEY, JSON.stringify(s));
  estado.token = s.coachToken;
  estado.vence = s.expiresAt;
  estado.coach = s.coach;
}
function leerBorradorPresencial() {
  try {
    const parsed = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
    if (!parsed || typeof parsed !== "object" || !parsed.__savedAt) return {};
    if (Date.now() - new Date(parsed.__savedAt).getTime() > DRAFT_TTL_MS) {
      localStorage.removeItem(DRAFT_KEY);
      return {};
    }
    return parsed.items || {};
  } catch { return {}; }
}
function guardarBorradorPresencial() {
  localStorage.setItem(DRAFT_KEY, JSON.stringify({ __savedAt: new Date().toISOString(), items: estado.borradorPresencial || {} }));
}

async function api(action, payload = {}) {
  if (resolveApiMode() === "mock") return mock(action, payload);
  try {
    const res = await fetch(IBERFIT_CONFIG.apiPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ action, coachToken: estado.token, baseUrl: window.location.origin, ...payload })
    });
    const text = await res.text();
    try { return JSON.parse(text); }
    catch { return { ok: false, status: "ERROR_LECTURA", message: text.slice(0, 300) }; }
  } catch {
    return { ok: false, status: "ERROR_CONEXION", message: "No pudimos conectar con IBERFIT." };
  }
}

function mock(action, payload) {
  const panel = mockPanel();
  if (action === "coachLogin") return { ok: true, data: { coachToken: "MOCK-COACH-V9", expiresAt: new Date(Date.now() + 6 * 3600000).toISOString(), coach: { name: "Coach QA", login: "coach.qa", role: "Coach IBERFIT" }, dashboard: panel } };
  if (action === "coachGetDashboard") return { ok: true, data: panel };
  if (action === "coachGetClientWorkspace") return { ok: true, data: mockWorkspace(payload.clientId || "APPCLI-0001") };
  if (action === "coachCrearCliente") return { ok: true, data: { clientId: "APPCLI-0003", activationLink: `${window.location.origin}/activar.html?token=mock-v9`, expiresAt: new Date(Date.now() + 72 * 3600000).toISOString() } };
  if (action === "coachGenerarEnlaceActivacion") return { ok: true, data: { activationLink: `${window.location.origin}/activar.html?token=mock-activacion-v9` } };
  if (action === "coachGenerarEnlaceRecuperacion") return { ok: true, data: { resetLink: `${window.location.origin}/activar.html?token=mock-reset-v9` } };
  if (["coachSaveWeek", "coachSaveSession", "coachGuardarEjercicio", "coachReviewFeedback", "coachReviewCheckin", "coachRevocarSesion", "coachRevocarSesionesCliente", "coachGuardarCarga", "coachGuardarInforme", "coachGuardarIri", "coachGuardarBioimpedancia", "coachGuardarMultimedia", "coachGuardarDecisionMotor", "coachCerrarSesionPresencial"].includes(action)) {
    return { ok: true, data: { saved: true, id: uid("MOCK"), weekId: "SEM-0001", sessionId: "SES-0001" } };
  }
  if (action === "coachLogout") return { ok: true, data: { loggedOut: true } };
  return { ok: true, data: panel };
}

function mockPanel() {
  return {
    generatedAt: new Date().toISOString(),
    metrics: { clientes: 3, sesionesHoy: 2, cargasRegistradas: 18, feedbackPendiente: 2, checkinPendiente: 1, alertas: 3, informesPendientes: 2, progresionesSugeridas: 4 },
    clients: [
      { id: "APPCLI-0001", name: "Cliente QA 1", email: "qa.cliente1@example.test", modality: "HIBRIDO", objective: "Fuerza y composición corporal", status: "ACTIVO", accessStatus: "ACTIVO", activeWeekTitle: "Semana 4 · Progresión controlada", iri: "68", iriClass: "PERFORMANCE", pendingFeedback: 1, pendingCheckin: 0, decisionState: "AMARILLO" },
      { id: "APPCLI-0002", name: "Cliente QA 2", email: "qa.cliente2@example.test", modality: "PRESENCIAL", objective: "Fuerza base y adherencia", status: "ACTIVO", accessStatus: "PENDIENTE_ACTIVACION", activeWeekTitle: "Semana 1 · Base técnica", iri: "57", iriClass: "BASE", pendingFeedback: 0, pendingCheckin: 1, decisionState: "ROJO" },
      { id: "APPCLI-0003", name: "Cliente QA 3", email: "qa.cliente3@example.test", modality: "ONLINE", objective: "Performance y control de carga", status: "ACTIVO", accessStatus: "ACTIVO", activeWeekTitle: "Semana 7 · Consolidación", iri: "74", iriClass: "PERFORMANCE", pendingFeedback: 0, pendingCheckin: 0, decisionState: "VERDE" }
    ],
    today: [
      { clientId: "APPCLI-0001", clientName: "Cliente QA 1", title: "Fuerza tren inferior", mode: "PRESENCIAL", time: "18:30", status: "Preparar cargas" },
      { clientId: "APPCLI-0003", clientName: "Cliente QA 3", title: "Torso + zona 2", mode: "AUTONOMA", time: "Publicado", status: "Esperar feedback" }
    ],
    loadHistory: [
      { clientId: "APPCLI-0001", clientName: "Cliente QA 1", exercise: "Sentadilla goblet", pattern: "Sentadilla", date: "2026-06-25", load: 24, unit: "kg", sets: 3, reps: 10, rpe: 7, pain: 0, trend: "Subiendo", recommendation: "Progresar a 26 kg si técnica estable." },
      { clientId: "APPCLI-0001", clientName: "Cliente QA 1", exercise: "Peso muerto rumano", pattern: "Bisagra", date: "2026-06-25", load: 40, unit: "kg", sets: 3, reps: 8, rpe: 8, pain: 1, trend: "Estable", recommendation: "Mantener 40 kg, observar lumbar." },
      { clientId: "APPCLI-0002", clientName: "Cliente QA 2", exercise: "Press mancuernas", pattern: "Empuje", date: "2026-06-24", load: 10, unit: "kg", sets: 3, reps: 12, rpe: 6, pain: 0, trend: "Margen", recommendation: "Subir a 12 kg si técnica estable." },
      { clientId: "APPCLI-0003", clientName: "Cliente QA 3", exercise: "Remo mancuerna", pattern: "Tracción", date: "2026-06-24", load: 24, unit: "kg", sets: 4, reps: 10, rpe: 8, pain: 0, trend: "Subiendo", recommendation: "Mantener volumen; no subir carga y reps a la vez." }
    ],
    alerts: [
      { id: "ALT-1", clientId: "APPCLI-0002", priority: "ALTA", message: "Check-in con fatiga alta y molestia general. No progresar carga." },
      { id: "ALT-2", clientId: "APPCLI-0001", priority: "MEDIA", message: "Feedback pendiente de revisión post sesión presencial." }
    ],
    pendingFeedback: [{ id: "FB-1", clientId: "APPCLI-0001", sessionId: "SES-0001", rpe: 8, pain: 2, comment: "La bisagra costó más de lo normal." }],
    pendingCheckin: [{ id: "CHK-1", clientId: "APPCLI-0002", fatigue: 8, energy: 4, pain: 4, comment: "Dormí mal y estoy cansada." }],
    exerciseLibrary: mockExercises(),
    sessionTemplates: mockTemplates()
  };
}
function mockExercises() {
  return [
    { id: "EJ-0001", name: "Sentadilla goblet", pattern: "Sentadilla", zone: "Tren inferior", material: "Kettlebell/mancuerna", level: "Base", objective: "Fuerza técnica", cues: "Torso firme, rodillas acompañan línea del pie.", errors: "Colapsar rodillas, perder control de tronco.", regression: "Sentadilla a cajón", progression: "Sentadilla frontal", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0002", name: "Sentadilla a cajón", pattern: "Sentadilla", zone: "Tren inferior", material: "Cajón/banco", level: "Inicial", objective: "Patrón de sentadilla seguro", cues: "Controlar bajada y tocar cajón sin descansar.", errors: "Caer al cajón, perder tensión.", regression: "Sit to stand asistido", progression: "Sentadilla goblet", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0003", name: "Split squat", pattern: "Sentadilla unilateral", zone: "Tren inferior", material: "Peso corporal/mancuernas", level: "Intermedio", objective: "Fuerza unilateral", cues: "Paso estable, tronco alto, rodilla acompaña pie.", errors: "Acortar rango por inestabilidad.", regression: "Zancada estática asistida", progression: "Bulgarian split squat", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0004", name: "Hip thrust", pattern: "Bisagra", zone: "Glúteo/cadena posterior", material: "Banco/barra/mancuerna", level: "Base", objective: "Extensión de cadera", cues: "Costillas abajo, pausa arriba, empuje desde talón.", errors: "Hiperextender lumbar, subir sin control.", regression: "Puente glúteo suelo", progression: "Hip thrust con pausa", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0005", name: "Peso muerto rumano", pattern: "Bisagra", zone: "Cadena posterior", material: "Mancuernas/barra", level: "Base", objective: "Fuerza posterior", cues: "Bisagra de cadera, columna neutra, carga cercana.", errors: "Flexionar lumbar, alejar carga.", regression: "Bisagra con pared", progression: "RDL barra", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0006", name: "Peso muerto kettlebell", pattern: "Bisagra", zone: "Cadena posterior", material: "Kettlebell", level: "Inicial", objective: "Aprender bisagra", cues: "Kettlebell entre pies, empujar cadera atrás.", errors: "Convertirlo en sentadilla.", regression: "Bisagra sin carga", progression: "Peso muerto rumano", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0007", name: "Press mancuernas inclinado", pattern: "Empuje", zone: "Torso", material: "Mancuernas/banco", level: "Intermedio", objective: "Fuerza tren superior", cues: "Escápulas estables, control de bajada.", errors: "Hombros elevados, arco excesivo.", regression: "Press suelo", progression: "Press barra", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0008", name: "Press en suelo", pattern: "Empuje", zone: "Torso", material: "Mancuernas", level: "Base", objective: "Empuje seguro", cues: "Codos controlados, muñeca neutra.", errors: "Rebotar, perder control escapular.", regression: "Press pared", progression: "Press banco", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0009", name: "Push-up elevado", pattern: "Empuje", zone: "Torso/core", material: "Banco/caja", level: "Base", objective: "Empuje con control corporal", cues: "Cuerpo en bloque, manos bajo hombros.", errors: "Caer la pelvis, cuello adelantado.", regression: "Push-up pared", progression: "Push-up suelo", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0010", name: "Press militar mancuernas", pattern: "Empuje vertical", zone: "Hombro/tríceps", material: "Mancuernas", level: "Intermedio", objective: "Fuerza vertical", cues: "Glúteos activos, costillas abajo, trayectoria vertical.", errors: "Arquear lumbar, bloquear cuello.", regression: "Press landmine", progression: "Press militar alterno", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0011", name: "Remo mancuerna", pattern: "Tracción", zone: "Torso", material: "Mancuerna/banco", level: "Base", objective: "Tracción horizontal", cues: "Tirar con codo, controlar tronco.", errors: "Rotar tronco, encoger hombro.", regression: "Remo banda", progression: "Remo pecho apoyado", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0012", name: "Remo pecho apoyado", pattern: "Tracción", zone: "Torso", material: "Banco/mancuernas", level: "Intermedio", objective: "Tracción estricta", cues: "Pecho estable, pausa al final.", errors: "Impulsar con lumbar, perder rango.", regression: "Remo mancuerna", progression: "Remo barra", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0013", name: "Jalón con banda", pattern: "Tracción vertical", zone: "Dorsal", material: "Banda", level: "Base", objective: "Tracción vertical accesible", cues: "Codos hacia costillas, cuello largo.", errors: "Tirar con brazos solamente.", regression: "Pullover banda", progression: "Jalón polea", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0014", name: "Face pull banda", pattern: "Tracción/postural", zone: "Hombro posterior", material: "Banda", level: "Base", objective: "Control escapular", cues: "Tirar hacia cara, codos altos, escápulas controladas.", errors: "Extender lumbar, elevar hombros.", regression: "Pull-apart", progression: "Face pull polea", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0015", name: "Pallof press", pattern: "Anti-rotación", zone: "Core", material: "Banda/polea", level: "Base", objective: "Control lumbo-pélvico", cues: "Pelvis estable, exhalar al extender.", errors: "Rotar tronco, bloquear respiración.", regression: "Isométrico cerca del anclaje", progression: "Pallof caminata", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0016", name: "Deadbug", pattern: "Core", zone: "Core anterior", material: "Peso corporal", level: "Inicial", objective: "Control respiratorio y lumbopélvico", cues: "Exhalar, mantener zona lumbar estable.", errors: "Arquear lumbar, mover rápido.", regression: "Heel taps", progression: "Deadbug con carga", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0017", name: "Plancha frontal", pattern: "Core", zone: "Core anterior", material: "Peso corporal", level: "Base", objective: "Resistencia de core", cues: "Glúteos activos, costillas abajo.", errors: "Hundirse lumbar, contener respiración.", regression: "Plancha elevada", progression: "Plancha con alcance", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0018", name: "Plancha lateral", pattern: "Anti-flexión lateral", zone: "Core lateral", material: "Peso corporal", level: "Base", objective: "Estabilidad lateral", cues: "Cadera alta, hombro lejos de oreja.", errors: "Rotar tronco, caer cadera.", regression: "Plancha lateral rodillas", progression: "Plancha lateral larga", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0019", name: "Farmer carry", pattern: "Core/carga", zone: "Core y agarre", material: "Mancuernas/kettlebells", level: "Intermedio", objective: "Estabilidad y capacidad de carga", cues: "Caminar alto, costillas abajo, pasos controlados.", errors: "Inclinarse, acelerar sin control.", regression: "Suitcase carry ligero", progression: "Farmer carry pesado", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0020", name: "Step-up", pattern: "Sentadilla unilateral", zone: "Tren inferior", material: "Cajón/banco", level: "Base", objective: "Fuerza unilateral funcional", cues: "Empujar con pierna de arriba, controlar bajada.", errors: "Impulsar con pierna trasera.", regression: "Step-up bajo", progression: "Step-up con carga", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0021", name: "Zancada reversa", pattern: "Sentadilla unilateral", zone: "Tren inferior", material: "Peso corporal/mancuernas", level: "Base", objective: "Control unilateral", cues: "Paso atrás controlado, tronco estable.", errors: "Golpear rodilla, perder equilibrio.", regression: "Split squat asistido", progression: "Zancada caminando", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0022", name: "Elevación de talones", pattern: "Tobillo/pantorrilla", zone: "Pierna inferior", material: "Peso corporal/mancuernas", level: "Base", objective: "Fuerza de gemelo", cues: "Subir completo, pausa arriba, bajar lento.", errors: "Rebotar, rango corto.", regression: "Bilateral asistido", progression: "Unilateral", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0023", name: "Caminata lateral con banda", pattern: "Abducción cadera", zone: "Glúteo medio", material: "Mini-band", level: "Base", objective: "Control de cadera/rodilla", cues: "Pies paralelos, tensión constante.", errors: "Rotar pies, balancear tronco.", regression: "Abducción lateral", progression: "Monster walk", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0024", name: "Buenos días con banda", pattern: "Bisagra", zone: "Cadena posterior", material: "Banda", level: "Inicial", objective: "Aprender bisagra", cues: "Cadera atrás, columna neutra.", errors: "Flexionar rodillas en exceso.", regression: "Bisagra pared", progression: "RDL mancuerna", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0025", name: "Remo banda sentado", pattern: "Tracción", zone: "Torso", material: "Banda", level: "Inicial", objective: "Tracción accesible", cues: "Pecho alto, llevar codos atrás.", errors: "Elevar hombros.", regression: "Remo banda más ligera", progression: "Remo mancuerna", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0026", name: "Press Pallof medio arrodillado", pattern: "Anti-rotación", zone: "Core/cadera", material: "Banda/polea", level: "Intermedio", objective: "Control core + pelvis", cues: "Rodilla alineada, pelvis neutra.", errors: "Rotar tronco.", regression: "Pallof de pie", progression: "Pallof caminata", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0027", name: "Sled push / empuje trineo", pattern: "Metabólico/fuerza", zone: "Full body", material: "Trineo", level: "Intermedio", objective: "Capacidad de trabajo", cues: "Empujar fuerte, tronco firme, pasos cortos.", errors: "Colapsar lumbar, perder ritmo.", regression: "Marcha inclinada", progression: "Trineo pesado", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0028", name: "Bike zona 2", pattern: "Metabólico", zone: "Cardiorrespiratorio", material: "Bicicleta", level: "Base", objective: "Base aeróbica", cues: "Ritmo sostenible, respiración controlada.", errors: "Salir de zona objetivo.", regression: "Caminata inclinada", progression: "Intervalos controlados", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0029", name: "Step test 3 minutos", pattern: "Evaluación", zone: "Metabólico", material: "Escalón", level: "Evaluación", objective: "Respuesta cardiovascular", cues: "Ritmo constante, registrar FC al final y al minuto.", errors: "Cambiar ritmo, no medir recuperación.", regression: "Marcha controlada", progression: "Step test con ritmo mayor", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0030", name: "Movilidad cadera 90/90", pattern: "Movilidad", zone: "Cadera", material: "Peso corporal", level: "Base", objective: "Rango y control de cadera", cues: "Mover lento, respiración nasal.", errors: "Compensar con lumbar.", regression: "90/90 asistido", progression: "Transiciones 90/90", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0031", name: "Movilidad torácica open book", pattern: "Movilidad", zone: "Columna torácica", material: "Peso corporal", level: "Base", objective: "Rotación torácica", cues: "Rodillas juntas, abrir desde caja torácica.", errors: "Rotar pelvis.", regression: "Rotación menor rango", progression: "Open book con respiración", mediaStatus: "Pendiente foto/video propio IBERFIT" },
    { id: "EJ-0032", name: "Respiración 90/90", pattern: "Recuperación", zone: "Core/respiración", material: "Peso corporal", level: "Inicial", objective: "Regulación y control costal", cues: "Exhalar largo, costillas abajo.", errors: "Tensionar cuello.", regression: "Respiración supina", progression: "Respiración con reach", mediaStatus: "Pendiente foto/video propio IBERFIT" }
  ];
}
function mockTemplates() {
  return [
    { id: "PL-001", name: "Fuerza base tren inferior", type: "Fuerza", deliveryMode: "PRESENCIAL", duration: "55", objective: "Construir base técnica", criterion: "Progresar si RPE y recuperación lo permiten." },
    { id: "PL-002", name: "Autónoma full body casa", type: "Fuerza", deliveryMode: "AUTONOMA", duration: "40", objective: "Mantener estímulo fuera de sesión presencial", criterion: "RPE 6-7, técnica limpia." }
  ];
}
function mockWorkspace(clientId) {
  const panel = mockPanel();
  const c = panel.clients.find(x => x.id === clientId) || panel.clients[0];
  const blocks = [
    { title: "Preparación", focus: "Movilidad + activación", exercises: [{ name: "Movilidad cadera", time: "6 min", rest: "—", note: "Rango cómodo" }] },
    { title: "Fuerza principal", focus: "Control técnico", exercises: [{ name: "Sentadilla goblet", sets: "3", reps: "10", load: "24 kg", rest: "90 s", rpe: "7", note: "Subir si técnica estable" }, { name: "Peso muerto rumano", sets: "3", reps: "8", load: "40 kg", rest: "90 s", rpe: "7-8", note: "Observar zona lumbar" }] },
    { title: "Complementario", focus: "Core + control", exercises: [{ name: "Pallof press", sets: "3", reps: "12/lado", rest: "60 s", rpe: "6", note: "Pelvis estable" }] }
  ];
  return {
    client: { id: c.id, name: c.name, email: c.email, phone: "+56900000000", modality: c.modality, objective: c.objective, status: c.status, accessStatus: c.accessStatus, notes: "Cliente QA V9.3 sin datos reales" },
    plan: { nextAction: "Revisar respuesta y decidir progresión", objective: c.objective, notes: "Motor de Decisión activo" },
    week: { id: "SEM-0001", number: "4", title: c.activeWeekTitle, focus: "Progresión controlada", message: "Semana orientada a consolidar técnica y carga.", state: "PUBLICADA" },
    sessions: [
      { id: "SES-0001", weekId: "SEM-0001", deliveryMode: "PRESENCIAL", title: "Fuerza tren inferior", type: "Fuerza", duration: "55", state: "PUBLICADA", objective: "Técnica + progresión prudente", criterion: "Progresar solo con RPE ≤ 8 y sin molestia relevante.", preparation: "Movilidad + activación", mainBlock: "Sentadilla goblet / RDL / Pallof", coolDown: "Respiración + movilidad", indications: "Registrar RPE por ejercicio.", material: "Mancuernas, banda", blocksJson: JSON.stringify(blocks), order: "1" },
      { id: "SES-0002", weekId: "SEM-0001", deliveryMode: c.modality === "PRESENCIAL" ? "COMPLEMENTARIA" : "AUTONOMA", title: "Full body control", type: "Fuerza", duration: "40", state: "BORRADOR", objective: "Mantener estímulo", criterion: "No perseguir fatiga; controlar técnica.", blocksJson: JSON.stringify(blocks.slice(0,2)), order: "2" }
    ],
    iri: { total: c.iri, classification: c.iriClass, recommendation: "Construir progresión con control de carga y respuesta semanal.", context: "Objetivo principal: " + c.objective, bioimpedance: "Bioimpedancia registrada como punto de partida.", mobility: "Movilidad de cadera a vigilar.", strength: "Fuerza base con margen de mejora en bisagra.", metabolic: "Capacidad metabólica aceptable para progresión conservadora.", limiters: "Fatiga y técnica bajo cargas altas.", decision: "Mantener progresión prudente y repetir IRI cuando exista bloque de datos suficiente.", status: "PUBLICADO" },
    loadHistory: panel.loadHistory.filter(x => x.clientId === c.id || c.id === "APPCLI-0001"),
    reports: [
      { id: "INF-001", date: "2026-06-25", type: "IRI", title: "Informe IRI inicial", state: "PUBLICADO", clientVisible: "Sí", internalSummary: "Limitadores: movilidad cadera y fatiga; progresión conservadora." },
      { id: "INF-002", date: "2026-06-26", type: "Sesión", title: "Resumen post-sesión", state: "INTERNO", clientVisible: "No", internalSummary: "RPE alto en bisagra. Mantener carga." }
    ],
    feedback: [{ id: "FB-1", sessionId: "SES-0001", realization: "COMPLETA", rpe: "8", fatigue: "6", energy: "6", pain: "2", technique: "6", comment: "Costó la bisagra.", decision: "" }],
    checkin: [{ id: "CHK-1", weekId: "SEM-0001", sleep: "6", fatigue: "6", stress: "5", energy: "6", pain: "2", completedSessions: "2", weight: "", comment: "Semana buena.", reviewState: "PENDIENTE", decision: "" }],
    media: [{ exercise: "Sentadilla goblet", status: "Pendiente foto propia", source: "Banco IBERFIT", license: "Propia/pendiente" }],
    activeSessions: [{ id: "SAC-1", state: "ACTIVA", createdAt: new Date().toISOString(), expiresAt: new Date(Date.now()+3600000).toISOString(), source: "APP_CLIENT" }]
  };
}

function aviso(msg, tipo = "info", enlace = "") {
  estado.aviso = msg || "";
  estado.avisoTipo = tipo;
  estado.enlace = enlace || "";
  render();
}
function avisoHtml() {
  if (!estado.aviso) return "";
  return `<div class="coach-status ${html(estado.avisoTipo)}">${html(estado.aviso)}${estado.enlace ? `<div class="link-box"><input readonly value="${html(estado.enlace)}"><button type="button" class="btn btn-ghost" id="copyLastLink">Copiar</button></div>` : ""}</div>`;
}

function loginPantalla() {
  return `<main class="coach-login-screen">
    <section class="coach-login-brand">
      <div class="coach-logo"><img src="/assets/iberfit-isotipo.png" alt="IBERFIT"></div>
      <h1>IBERFIT Coach OS</h1>
      <p>Sistema interno de entrenamiento, diagnóstico, carga, informes y decisión IBERFIT.</p>
      <div class="coach-login-points"><span>IRI</span><span>Cargas</span><span>Sesión presencial</span><span>Informes</span></div>
    </section>
    <form class="coach-login-card" id="coachLoginForm">
      <h2>Acceso interno</h2>
      <p>Uso exclusivo IBERFIT.</p>
      <label>Usuario<input id="coachLogin" autocomplete="username" placeholder="Usuario"></label>
      <label>Contraseña<input id="coachPassword" type="password" autocomplete="current-password" placeholder="Contraseña"></label>
      <button class="btn btn-primary btn-full" type="submit">Entrar</button>
      ${avisoHtml()}
      <small>La sesión de coach es temporal y revocable. Para QA: añadir <strong>?mock=1</strong>.</small>
    </form>
  </main>`;
}

function shell() {
  const clientName = estado.espacio?.client?.name || "Sin cliente";
  const clientMeta = estado.espacio?.client?.modality || "";
  return `<section class="coach-app v9 v94">
    <aside class="coach-sidebar">
      <div class="sidebar-brand coach-side-brand"><div class="sidebar-iso"><img src="/assets/iberfit-isotipo.png" alt="IBERFIT"></div><strong>IBERFIT</strong><span>Coach OS V9.4</span></div>
      <nav class="coach-tabs">
        ${tabBtn("panel", "Hoy")}
        ${tabBtn("clientes", "Clientes")}
        ${tabBtn("ficha", "Ficha")}
        ${tabBtn("constructor", "Crear sesión")}
        ${tabBtn("sesion", "Sesión vivo")}
        ${tabBtn("informes", "Informes")}
        ${tabBtn("cargas", "Cargas")}
        ${tabBtn("iri", "IRI")}
        ${tabBtn("biblioteca", "Biblioteca")}
        ${tabBtn("bio", "Bioimpedancia")}
        ${tabBtn("feedback", "Feedback")}
        ${tabBtn("checkin", "Check-in")}
        ${tabBtn("multimedia", "Multimedia")}
        ${tabBtn("alertas", "Alertas")}
        ${tabBtn("accesos", "Accesos")}
        ${tabBtn("sheet", "Sheet")}
      </nav>
      <button class="btn btn-ghost btn-full" id="coachRefreshBtn">Actualizar</button>
      <button class="btn btn-link btn-full" id="coachLogoutBtn">Cerrar sesión</button>
      <p class="coach-mini">Cliente activo:<br><strong>${html(clientName)}</strong><br><span>${html(clientMeta)}</span></p>
    </aside>
    <main class="coach-main">
      <header class="coach-topbar"><div><span class="eyebrow">IBERFIT · Sistema interno</span><h1>${tituloVista()}</h1><p class="coach-context-line">${html(clientName)}${clientMeta ? " · " + html(clientMeta) : ""}</p></div><div class="coach-top-actions"><button class="btn btn-ghost" id="btnGoClientes">Elegir cliente</button><button class="btn btn-primary" id="btnNuevoCliente">Crear cliente</button></div></header>
      <nav class="coach-mobile-dock" aria-label="Accesos rápidos Coach OS">
        ${mobileNavBtn("panel", "Hoy")}
        ${mobileNavBtn("clientes", "Clientes")}
        ${mobileNavBtn("constructor", "Crear")}
        ${mobileNavBtn("sesion", "Vivo")}
        ${mobileNavBtn("informes", "Informes")}
        ${mobileNavBtn("biblioteca", "Más")}
      </nav>
      ${avisoHtml()}
      ${vistaActual()}
    </main>
  </section>`;
}
function tabBtn(key, label) { return `<button class="coach-tab ${estado.vista === key ? "active" : ""}" data-view="${key}">${label}</button>`; }
function mobileNavBtn(key, label) { return `<button class="coach-mobile-chip ${estado.vista === key ? "active" : ""}" data-view="${key}">${label}</button>`; }
function tituloVista() {
  return ({ panel: "Qué debo hacer hoy", clientes: "Clientes", ficha: "Ficha del cliente", constructor: "Crear sesión", sesion: "Sesión presencial en vivo", cargas: "Histórico de cargas", iri: "Diagnóstico IRI", bio: "Bioimpedancia", feedback: "Feedback", checkin: "Check-in", informes: "Informes y gráficas", biblioteca: "Biblioteca de ejercicios", multimedia: "Multimedia ejercicios", alertas: "Alertas", accesos: "Accesos y sesiones", sheet: "Sheet operativo" })[estado.vista] || "Coach OS";
}
function vistaActual() {
  if (estado.vista === "clientes") return vistaClientes();
  if (estado.vista === "ficha") return vistaFicha();
  if (estado.vista === "constructor") return vistaConstructorSesion();
  if (estado.vista === "sesion") return vistaSesionPresencial();
  if (estado.vista === "cargas") return vistaCargas();
  if (estado.vista === "iri") return vistaIri();
  if (estado.vista === "informes") return vistaInformes();
  if (estado.vista === "bio") return vistaBioimpedancia();
  if (estado.vista === "feedback") return vistaFeedback();
  if (estado.vista === "checkin") return vistaCheckin();
  if (estado.vista === "biblioteca") return vistaBiblioteca();
  if (estado.vista === "multimedia") return vistaMultimedia();
  if (estado.vista === "alertas") return vistaAlertas();
  if (estado.vista === "accesos") return vistaAccesos();
  if (estado.vista === "sheet") return vistaSheet();
  return vistaPanel();
}

function vistaPanel() {
  const p = estado.panel || mockPanel();
  const tasks = tareasHoy(p);
  return `<section class="coach-grid v9-dashboard">
    <div class="coach-card wide"><div class="section-head"><div><h2>Panel operativo</h2><p>Prioridades, alertas y decisiones para trabajar sin buscar información.</p></div><span class="badge-soft">${fechaHora(p.generatedAt)}</span></div>${metricas(p.metrics)}</div>
    <div class="coach-card"><h2>Qué debo hacer hoy</h2><div class="decision-list">${tasks.map(t => taskCard(t)).join("")}</div></div>
    <div class="coach-card"><h2>Semáforo clientes</h2>${clientesRapidos(p.clients).map(clienteSemaforo).join("")}</div>
    <div class="coach-card wide"><div class="section-head"><div><h2>Histórico de cargas reciente</h2><p>Visible desde el panel coach. Filtra y entra al detalle por cliente/ejercicio.</p></div><button class="btn btn-ghost" data-go="cargas">Ver cargas</button></div>${tablaCargas(safeArray(p.loadHistory).slice(0, 6), true)}</div>
    <div class="coach-card wide"><div class="section-head"><div><h2>Motor de Decisión IBERFIT</h2><p>Lectura automática basada en IRI, cargas, feedback, check-in y alertas.</p></div><span class="badge-soft gold">IA local / reglas</span></div>${decisionEnginePanel(p)}</div>
  </section>`;
}
function metricas(m = {}) {
  const items = [
    ["Clientes", m.clientes || 0], ["Sesiones hoy", m.sesionesHoy || 0], ["Feedback", m.feedbackPendiente || 0], ["Check-in", m.checkinPendiente || 0], ["Alertas", m.alertas || 0], ["Cargas", m.cargasRegistradas || 0], ["Informes", m.informesPendientes || 0], ["Progresiones", m.progresionesSugeridas || 0]
  ];
  return `<div class="metric-grid dense">${items.map(([k, v]) => `<div class="metric-card"><span>${html(k)}</span><strong>${html(v)}</strong></div>`).join("")}</div>`;
}
function tareasHoy(p) {
  const out = [];
  safeArray(p.today).forEach(s => out.push({ type: "Sesión", title: `${s.clientName} · ${s.title}`, detail: `${s.mode} · ${s.time} · ${s.status}`, priority: s.mode === "PRESENCIAL" ? "ALTA" : "MEDIA", clientId: s.clientId }));
  safeArray(p.alerts).forEach(a => out.push({ type: "Alerta", title: a.message, detail: `Prioridad ${a.priority}`, priority: a.priority, clientId: a.clientId }));
  safeArray(p.pendingFeedback).forEach(f => out.push({ type: "Feedback", title: `Revisar feedback ${f.clientId}`, detail: `RPE ${f.rpe} · molestia ${f.pain} · ${trunc(f.comment, 60)}`, priority: n(f.pain) >= 5 || n(f.rpe) >= 9 ? "ALTA" : "MEDIA", clientId: f.clientId }));
  return out.slice(0, 8);
}
function taskCard(t) {
  return `<button class="decision-item ${semaforoClass(t.priority)}" data-client-id="${html(t.clientId || "")}"><strong>${html(t.type)}</strong><span>${html(t.title)}</span><small>${html(t.detail)}</small></button>`;
}
function clientesRapidos(clients) { return safeArray(clients).slice().sort((a,b)=>riesgoScore(b)-riesgoScore(a)).slice(0, 5); }
function riesgoScore(c) { return (c.decisionState === "ROJO" ? 30 : c.decisionState === "AMARILLO" ? 15 : 0) + n(c.pendingFeedback) * 4 + n(c.pendingCheckin) * 4; }
function clienteSemaforo(c) {
  const sem = estadoCliente(c);
  return `<button class="client-row sem-${sem.color}" data-client-id="${html(c.id)}"><div><strong>${html(c.name)}</strong><span>${html(c.modality)} · ${html(c.objective)}</span></div><div><b>${html(sem.label)}</b><small>IRI ${html(c.iri || "—")} · ${html(c.iriClass || "Proceso")}</small></div></button>`;
}
function estadoCliente(c) {
  if (c.decisionState === "ROJO" || n(c.pendingCheckin) > 0 && n(c.pendingFeedback) > 0) return { color: "red", label: "Revisar" };
  if (c.decisionState === "AMARILLO" || n(c.pendingFeedback) || n(c.pendingCheckin)) return { color: "yellow", label: "Atención" };
  return { color: "green", label: "Estable" };
}
function semaforoClass(priority) { const p = String(priority || "").toUpperCase(); return p === "ALTA" ? "risk-high" : p === "MEDIA" ? "risk-mid" : "risk-low"; }
function decisionEnginePanel(p) {
  const rows = clientesRapidos(p.clients).map(c => {
    const sem = estadoCliente(c);
    const loads = safeArray(p.loadHistory).filter(x => x.clientId === c.id);
    const rec = loads[0]?.recommendation || (sem.color === "green" ? "Puede progresar con prudencia si técnica y RPE acompañan." : "Revisar feedback/check-in antes de progresar.");
    return `<div class="decision-engine-row sem-${sem.color}"><div><strong>${html(c.name)}</strong><span>${html(c.objective)}</span></div><div><b>${html(sem.label)}</b><small>${html(rec)}</small></div></div>`;
  }).join("");
  return `<div class="decision-engine">${rows || empty("No hay clientes para interpretar todavía.")}</div>`;
}

function vistaClientes() {
  const p = estado.panel || mockPanel();
  const filtro = estado.filtroCliente.toLowerCase();
  const clients = safeArray(p.clients).filter(c => [c.name, c.email, c.modality, c.objective, c.status].join(" ").toLowerCase().includes(filtro));
  return `<section class="coach-grid">
    <div class="coach-card wide"><div class="section-head"><div><h2>Elegir cliente</h2><p>Buscador/desplegable operativo. Desde aquí nace todo: ficha, IRI, semana, sesión presencial, informes y App Client.</p></div></div><div class="client-selector"><input id="clientSearch" placeholder="Buscar por nombre, email, modalidad u objetivo" value="${html(estado.filtroCliente)}"><select id="clientSelect"><option value="">Seleccionar cliente…</option>${clients.map(c => `<option value="${html(c.id)}" ${c.id === estado.clienteId ? "selected" : ""}>${html(c.name)} · ${html(c.modality)} · ${html(c.status)}</option>`).join("")}</select><button class="btn btn-primary" id="loadClientSelect">Abrir ficha</button></div><div class="client-list">${clients.map(clienteSemaforo).join("")}</div></div>
    <div class="coach-card"><h2>Crear nuevo cliente</h2>${formNuevoCliente()}</div>
  </section>`;
}
function formNuevoCliente() {
  return `<form id="newClientForm" class="stack-form">
    <label>Nombre visible<input id="newName" placeholder="Nombre del cliente" required></label>
    <label>Email<input id="newEmail" type="email" placeholder="correo@cliente.cl" required></label>
    <label>Teléfono<input id="newPhone" placeholder="+56 9 ..."></label>
    <label>Modalidad<select id="newModality"><option>HIBRIDO</option><option>PRESENCIAL</option><option>ONLINE</option></select></label>
    <label>Estado<select id="newStatus"><option>DIAGNOSTICO_PENDIENTE</option><option>LEAD</option><option>IRI_REALIZADO</option><option>ACTIVO</option><option>PAUSADO</option></select></label>
    <label>Objetivo<textarea id="newObjective" rows="3" placeholder="Objetivo principal"></textarea></label>
    <label>Observaciones<textarea id="newNotes" rows="3" placeholder="Notas internas"></textarea></label>
    <button class="btn btn-primary btn-full" type="submit">Crear cliente + enlace App Client</button>
    <small>Después: activar cuenta, iniciar IRI y crear semana inicial.</small>
  </form>`;
}

function vistaFicha() {
  if (!estado.espacio) return sinCliente("Elige un cliente para ver su ficha completa.");
  const e = estado.espacio;
  const c = e.client || {};
  return `<section class="coach-grid">
    <div class="coach-card wide client-hero"><div><span class="eyebrow">Ficha cliente</span><h2>${html(c.name)}</h2><p>${html(c.objective || "Sin objetivo principal")}</p></div><div class="hero-badges"><span>${html(c.modality)}</span><span>${html(c.status)}</span><span>${html(c.accessStatus || "Acceso")}</span></div></div>
    <div class="coach-card"><h2>Acceso App Client</h2><p>Generar activación o recuperación sin tocar contraseñas del cliente.</p><button class="btn btn-primary btn-full" id="generarActivacion">Generar activación</button><button class="btn btn-ghost btn-full" id="generarRecuperacion">Generar recuperación</button><button class="btn btn-link btn-full" id="revocarTodas">Cerrar sesiones activas</button></div>
    <div class="coach-card"><h2>Decisión actual</h2>${decisionCliente(e)}</div>
    <div class="coach-card wide"><h2>Línea de tiempo</h2>${timeline(e)}</div>
    <div class="coach-card wide"><div class="section-head"><div><h2>Semana y sesiones</h2><p>Crear/publicar sesiones para App Client o preparar sesión presencial.</p></div><button class="btn btn-ghost" data-go="sesion">Abrir presencial</button></div>${formSemanaSesion(e)}</div>
  </section>`;
}
function decisionCliente(e) {
  const d = calcularDecision(e);
  return `<div class="decision-box sem-${d.color}"><strong>${html(d.estado)}</strong><p>${html(d.motivo)}</p><small>${html(d.accion)}</small></div>`;
}
function calcularDecision(e) {
  const fb = safeArray(e.feedback)[0] || {};
  const ch = safeArray(e.checkin)[0] || {};
  const high = n(fb.rpe) >= 9 || n(fb.pain) >= 5 || n(ch.fatigue) >= 8 || n(ch.pain) >= 5;
  const mid = n(fb.rpe) >= 8 || n(ch.fatigue) >= 6 || n(ch.energy) <= 4;
  if (high) return { color: "red", estado: "Revisar antes de progresar", motivo: "Hay señales de fatiga, molestia o RPE alto.", accion: "Mantener o reducir carga; valorar variante y registrar decisión IBERFIT." };
  if (mid) return { color: "yellow", estado: "Progresión prudente", motivo: "Respuesta aceptable pero con variables a observar.", accion: "No subir carga y volumen a la vez. Confirmar técnica." };
  return { color: "green", estado: "Estable", motivo: "Sin señales relevantes de sobrecarga.", accion: "Puede progresar si la ejecución sigue limpia." };
}
function timeline(e) {
  const items = [];
  if (e.iri?.total) items.push([e.iri.date || "", "IRI", `IRI ${e.iri.total} · ${e.iri.classification}`]);
  safeArray(e.sessions).forEach(s => items.push([s.updatedAt || "", "Sesión", `${s.title} · ${s.deliveryMode} · ${s.state}`]));
  safeArray(e.loadHistory).forEach(l => items.push([l.date, "Carga", `${l.exercise}: ${l.load}${l.unit || "kg"} · ${l.sets}x${l.reps} · RPE ${l.rpe}`]));
  safeArray(e.reports).forEach(r => items.push([r.date, "Informe", `${r.title} · ${r.state}`]));
  return `<div class="timeline">${items.slice(0, 12).map(([date, type, text]) => `<div><span>${html(fecha(date))}</span><strong>${html(type)}</strong><p>${html(text)}</p></div>`).join("") || empty("La línea de tiempo aparecerá al registrar IRI, sesiones, cargas e informes.")}</div>`;
}
function formSemanaSesion(e) {
  const week = e.week || {};
  const first = safeArray(e.sessions)[0] || {};
  return `<div class="dual-form">
    <form id="weekForm" class="stack-form compact"><h3>Semana</h3><input id="weekId" value="${html(week.id || "")}" placeholder="SEMANA_ID"><input id="weekNumber" value="${html(week.number || "")}" placeholder="Nº semana"><input id="weekTitle" value="${html(week.title || "")}" placeholder="Título semana"><textarea id="weekFocus" rows="2" placeholder="Foco">${html(week.focus || "")}</textarea><textarea id="weekMessage" rows="2" placeholder="Mensaje cliente">${html(week.message || "")}</textarea><select id="weekState"><option ${week.state === "BORRADOR" ? "selected" : ""}>BORRADOR</option><option ${week.state === "PUBLICADA" ? "selected" : ""}>PUBLICADA</option><option>CERRADA</option></select><button class="btn btn-primary" type="submit">Guardar semana</button></form>
    <form id="sessionForm" class="stack-form compact"><h3>Sesión</h3><input id="sessionId" value="${html(first.id || "")}" placeholder="SESION_ID"><select id="sessionDelivery"><option ${first.deliveryMode === "PRESENCIAL" ? "selected" : ""}>PRESENCIAL</option><option ${first.deliveryMode === "AUTONOMA" ? "selected" : ""}>AUTONOMA</option><option ${first.deliveryMode === "ONLINE" ? "selected" : ""}>ONLINE</option><option ${first.deliveryMode === "COMPLEMENTARIA" ? "selected" : ""}>COMPLEMENTARIA</option></select><input id="sessionTitle" value="${html(first.title || "")}" placeholder="Título sesión"><input id="sessionType" value="${html(first.type || "Fuerza")}" placeholder="Tipo"><input id="sessionDuration" value="${html(first.duration || "")}" placeholder="Duración min"><select id="sessionState"><option>BORRADOR</option><option ${first.state === "PUBLICADA" ? "selected" : ""}>PUBLICADA</option><option>COMPLETADA</option></select><input id="sessionOrder" value="${html(first.order || "1")}" placeholder="Orden"><textarea id="sessionObjective" rows="2" placeholder="Objetivo">${html(first.objective || "")}</textarea><textarea id="sessionCriterion" rows="2" placeholder="Criterio IBERFIT">${html(first.criterion || "")}</textarea><textarea id="sessionPreparation" rows="2" placeholder="Preparación">${html(first.preparation || "")}</textarea><textarea id="sessionMainBlock" rows="3" placeholder="Bloque principal">${html(first.mainBlock || "")}</textarea><textarea id="sessionCoolDown" rows="2" placeholder="Vuelta a la calma">${html(first.coolDown || "")}</textarea><textarea id="sessionIndications" rows="2" placeholder="Indicaciones">${html(first.indications || "")}</textarea><input id="sessionMaterial" value="${html(first.material || "")}" placeholder="Material"><textarea id="sessionObserve" rows="2" placeholder="Qué observar">${html(first.observe || "")}</textarea><textarea id="sessionAdjust" rows="2" placeholder="Cómo ajustar">${html(first.adjust || "")}</textarea><textarea id="sessionReport" rows="2" placeholder="Qué reportar">${html(first.report || "")}</textarea><div id="blocksEditor">${blocksEditor(first)}</div><button class="btn btn-primary" type="submit">Guardar sesión</button></form>
  </div>`;
}
function blocksEditor(session) {
  const blocks = parseBlocks(session.blocksJson).slice(0, 3);
  while (blocks.length < 3) blocks.push({ title: "", focus: "", exercises: [] });
  return blocks.map((b, i) => `<div class="block-editor"><h4>Bloque ${i + 1}</h4><input id="block${i}Title" value="${html(b.title || "")}" placeholder="Nombre bloque"><input id="block${i}Focus" value="${html(b.focus || "")}" placeholder="Objetivo bloque">${[0,1,2,3].map(j => { const ex = (b.exercises || [])[j] || {}; return `<div class="exercise-line"><input id="b${i}e${j}Name" value="${html(ex.name || "")}" placeholder="Ejercicio"><input id="b${i}e${j}Sets" value="${html(ex.sets || "")}" placeholder="Series"><input id="b${i}e${j}Reps" value="${html(ex.reps || "")}" placeholder="Reps"><input id="b${i}e${j}Time" value="${html(ex.time || "")}" placeholder="Tiempo"><input id="b${i}e${j}Rest" value="${html(ex.rest || "")}" placeholder="Descanso"><input id="b${i}e${j}Note" value="${html(ex.note || "")}" placeholder="Notas"></div>`; }).join("")}</div>`).join("");
}
function parseBlocks(value) { try { const x = JSON.parse(value || "[]"); return Array.isArray(x) ? x : []; } catch { return []; } }


function vistaConstructorSesion() {
  if (!estado.espacio) return sinCliente("Elige un cliente antes de crear una sesión.");
  const e = estado.espacio;
  const c = e.client || {};
  const decision = calcularDecision(e);
  return `<section class="coach-grid coach-grid-builder">
    <div class="coach-card wide builder-hero"><div><span class="eyebrow">Constructor IBERFIT</span><h2>Crear sesión con criterio</h2><p>Cliente: <strong>${html(c.name || "—")}</strong>. La sesión se construye desde objetivo, respuesta real, histórico de cargas y biblioteca.</p></div><div class="builder-decision sem-${decision.color}"><strong>${html(decision.estado)}</strong><span>${html(decision.accion)}</span></div></div>
    <div class="coach-card wide">${formConstructorSesion(e)}</div>
    <div class="coach-card"><h2>Plantillas rápidas</h2><p>Úsalas como punto de partida. Carlos mantiene el criterio final.</p>${plantillasSesionRapidas()}</div>
    <div class="coach-card"><h2>Biblioteca integrada</h2><p>Selecciona ejercicios por patrón, nivel y material. La carga se ajusta con el histórico.</p>${constructorExerciseLibrary()}</div>
    <div class="coach-card wide"><h2>Vista previa para App Client</h2>${previewSesionConstructor(e)}</div>
  </section>`;
}
function formConstructorSesion(e) {
  const first = safeArray(e.sessions)[0] || {};
  const d = calcularDecision(e);
  const defaultCriterion = first.criterion || d.accion || "Progresar solo si la técnica, RPE y recuperación lo permiten.";
  return `<form id="sessionBuilderForm" class="stack-form builder-form">
    <div class="builder-steps"><span>1 · Objetivo</span><span>2 · Estructura</span><span>3 · Ejercicios</span><span>4 · Publicar</span></div>
    <div class="form-3"><label>Modalidad<select id="builderDelivery"><option>PRESENCIAL</option><option>AUTONOMA</option><option>ONLINE</option><option>COMPLEMENTARIA</option><option>EVALUACION</option></select></label><label>Tipo<select id="builderType"><option>Fuerza</option><option>Hipertrofia</option><option>Fuerza técnica</option><option>Full body</option><option>Tren inferior</option><option>Tren superior</option><option>Core/control</option><option>Metabólica</option><option>Movilidad</option><option>Recuperación</option><option>Evaluación IRI</option></select></label><label>Estado<select id="builderState"><option>BORRADOR</option><option>PUBLICADA</option></select></label></div>
    <div class="form-2"><label>Título<input id="builderTitle" value="${html(first.title || "Sesión IBERFIT")}" placeholder="Ej. Fuerza tren inferior + control"></label><label>Duración<input id="builderDuration" value="${html(first.duration || "55")}" placeholder="min"></label></div>
    <label>Objetivo de la sesión<textarea id="builderObjective" rows="2" placeholder="Qué busca esta sesión">${html(first.objective || e.plan?.objective || e.client?.objective || "")}</textarea></label>
    <label>Criterio IBERFIT<textarea id="builderCriterion" rows="3" placeholder="Por qué esta sesión, qué cuidar, cuándo ajustar">${html(defaultCriterion)}</textarea></label>
    <div class="builder-structure-grid">
      ${builderBlockInputs(0, "Preparación", "Movilidad + activación", "Movilidad cadera", "6 min", "", "Rango cómodo")}
      ${builderBlockInputs(1, "Fuerza principal", "Patrón dominante", "", "", "90 s", "Registrar RPE y técnica")}
      ${builderBlockInputs(2, "Complementario / Core", "Control + estabilidad", "", "", "60 s", "No buscar fatiga innecesaria")}
    </div>
    <label>Indicaciones para cliente<textarea id="builderIndications" rows="2" placeholder="Mensaje claro para App Client">Controla técnica, respeta RPE y registra tu respuesta al finalizar.</textarea></label>
    <div class="form-2"><label>Material<input id="builderMaterial" placeholder="Mancuernas, banda, banco..."></label><label>Orden<input id="builderOrder" value="1" placeholder="1"></label></div>
    <button class="btn btn-primary btn-full" type="submit">Guardar sesión en ficha</button>
  </form>`;
}
function builderBlockInputs(i, title, focus, exName, reps, rest, note) {
  return `<fieldset class="builder-block"><legend>Bloque ${i + 1}</legend><input id="builderBlock${i}Title" value="${html(title)}" placeholder="Nombre bloque"><input id="builderBlock${i}Focus" value="${html(focus)}" placeholder="Foco"><div class="exercise-line builder-line"><input id="builderB${i}E0Name" list="exerciseSuggestions" value="${html(exName)}" placeholder="Ejercicio"><input id="builderB${i}E0Sets" placeholder="Series"><input id="builderB${i}E0Reps" value="${html(reps)}" placeholder="Reps/tiempo"><input id="builderB${i}E0Rest" value="${html(rest)}" placeholder="Descanso"><input id="builderB${i}E0Note" value="${html(note)}" placeholder="Nota"></div><div class="exercise-line builder-line"><input id="builderB${i}E1Name" list="exerciseSuggestions" placeholder="Ejercicio"><input id="builderB${i}E1Sets" placeholder="Series"><input id="builderB${i}E1Reps" placeholder="Reps/tiempo"><input id="builderB${i}E1Rest" value="${html(rest)}" placeholder="Descanso"><input id="builderB${i}E1Note" placeholder="Nota"></div></fieldset>`;
}
function constructorExerciseLibrary() {
  const library = safeArray(estado.panel?.exerciseLibrary).length ? safeArray(estado.panel.exerciseLibrary) : mockExercises();
  const options = library.map(e => `<option value="${html(e.name)}">`).join("");
  const cards = library.slice(0, 6).map(e => `<button type="button" class="library-mini-card" data-copy-exercise="${html(e.name)}"><strong>${html(e.name)}</strong><span>${html(e.pattern)} · ${html(e.material || "")}</span><small>${html(e.regression || "Regresión pendiente")} → ${html(e.progression || "Progresión pendiente")}</small></button>`).join("");
  return `<datalist id="exerciseSuggestions">${options}</datalist><div class="library-mini-grid">${cards}</div>`;
}
function plantillasSesionRapidas() {
  const tpl = [
    ["Fuerza base", "Calentamiento + patrón principal + accesorio + core", "RPE 6-8 · técnica limpia"],
    ["Adaptada por fatiga", "Movilidad + técnica + volumen reducido", "No progresar carga"],
    ["Híbrida autónoma", "Full body simple + feedback obligatorio", "Cliente entiende el porqué"],
    ["Evaluación IRI", "Contexto + movilidad + fuerza + step test", "Registrar limitadores"]
  ];
  return `<div class="template-chip-grid">${tpl.map(t => `<button type="button" class="template-chip" data-template-title="${html(t[0])}" data-template-objective="${html(t[1])}" data-template-criterion="${html(t[2])}"><strong>${html(t[0])}</strong><small>${html(t[2])}</small></button>`).join("")}</div>`;
}
function previewSesionConstructor(e) {
  const c = e.client || {};
  return `<article class="client-preview-card"><span>Así lo verá el cliente</span><h3>Hoy priorizamos...</h3><p>${html(e.plan?.objective || c.objective || "un trabajo ajustado a tu objetivo y respuesta real")}</p><div class="client-preview-grid"><div><strong>Criterio</strong><small>La carga se ajusta según técnica, RPE e histórico.</small></div><div><strong>Registro</strong><small>Al terminar: RPE, energía, molestia y comentario.</small></div><div><strong>Decisión</strong><small>IBERFIT revisa tu respuesta antes de progresar.</small></div></div></article>`;
}
function leerBloquesConstructor() {
  const blocks = [];
  for (let i = 0; i < 3; i++) {
    const title = $(`#builderBlock${i}Title`)?.value.trim() || `Bloque ${i + 1}`;
    const focus = $(`#builderBlock${i}Focus`)?.value.trim() || "";
    const exercises = [];
    for (let j = 0; j < 2; j++) {
      const name = $(`#builderB${i}E${j}Name`)?.value.trim() || "";
      if (!name) continue;
      exercises.push({ name, sets: $(`#builderB${i}E${j}Sets`)?.value.trim() || "", reps: $(`#builderB${i}E${j}Reps`)?.value.trim() || "", rest: $(`#builderB${i}E${j}Rest`)?.value.trim() || "", note: $(`#builderB${i}E${j}Note`)?.value.trim() || "" });
    }
    if (exercises.length || focus) blocks.push({ title, focus, exercises });
  }
  return blocks;
}
async function guardarSesionConstructor(e) {
  e.preventDefault();
  if (!estado.clienteId) return aviso("Primero elige cliente.", "error");
  const blocks = leerBloquesConstructor();
  const res = await api("coachSaveSession", { clientId: estado.clienteId, weekId: estado.espacio?.week?.id || "", sessionId: "", deliveryMode: $("#builderDelivery")?.value || "PRESENCIAL", type: $("#builderType")?.value || "Fuerza", duration: $("#builderDuration")?.value.trim() || "", state: $("#builderState")?.value || "BORRADOR", order: $("#builderOrder")?.value.trim() || "1", title: $("#builderTitle")?.value.trim() || "Sesión IBERFIT", objective: $("#builderObjective")?.value.trim() || "", criterion: $("#builderCriterion")?.value.trim() || "", preparation: blocks[0]?.title || "", mainBlock: blocks.map(b => b.title).join(" / "), coolDown: "Vuelta a la calma según respuesta", indications: $("#builderIndications")?.value.trim() || "", material: $("#builderMaterial")?.value.trim() || "", observe: "Técnica, RPE, molestia y respuesta real.", adjust: "Ajustar carga, volumen o variante según semáforo IBERFIT.", report: "Registrar respuesta y decisión posterior.", blocksJson: JSON.stringify(blocks) });
  if (!res.ok) return aviso(res.message || "No se pudo guardar la sesión.", "error");
  await cargarCliente(estado.clienteId);
  estado.vista = "sesion";
  aviso("Sesión creada y lista para revisar/ejecutar.", "success");
}
function vistaSesionPresencial() {
  if (!estado.espacio) return sinCliente("Elige un cliente para hacer sesión presencial en vivo.");
  const sessions = safeArray(estado.espacio.sessions).filter(s => ["PRESENCIAL", "EVALUACION", "COMPLEMENTARIA"].includes(String(s.deliveryMode || "").toUpperCase()));
  const active = sessions.find(s => s.id === estado.sesionActiva) || sessions[0] || {};
  if (active.id && !estado.sesionActiva) estado.sesionActiva = active.id;
  const exercises = ejerciciosSesion(active);
  const drafts = estado.borradorPresencial[active.id] || [];
  return `<section class="coach-grid">
    <div class="coach-card wide"><div class="section-head"><div><h2>Sesión presencial en vivo</h2><p>Registro serie a serie, cambios sobre la marcha y cierre técnico.</p></div><select id="liveSessionSelect">${sessions.map(s => `<option value="${html(s.id)}" ${s.id === active.id ? "selected" : ""}>${html(s.title)} · ${html(s.deliveryMode)}</option>`).join("")}</select></div>${active.id ? liveSessionHeader(active) : empty("No hay sesión presencial preparada.")}</div>
    <div class="coach-card wide"><h2>Ejercicios de la sesión</h2><div class="live-exercises">${exercises.map(ex => liveExerciseCard(ex, active.id)).join("") || empty("Añade bloques/ejercicios a la sesión.")}</div></div>
    <div class="coach-card"><h2>Registro rápido</h2>${formCargaRapida(active)}</div>
    <div class="coach-card"><h2>Borrador local</h2>${drafts.length ? drafts.map(d => `<div class="draft-row"><strong>${html(d.exercise)}</strong><span>${html(d.load)} ${html(d.unit)} · ${html(d.sets)}x${html(d.reps)} · RPE ${html(d.rpe)}</span></div>`).join("") : empty("Los registros temporales aparecerán aquí antes de guardar.")}</div>
    <div class="coach-card wide"><h2>Cierre de sesión</h2>${formCierreSesion(active, drafts)}</div>
  </section>`;
}
function ejerciciosSesion(session) {
  const blocks = parseBlocks(session.blocksJson);
  return blocks.flatMap(b => safeArray(b.exercises).map(ex => ({ ...ex, block: b.title, focus: b.focus })));
}
function liveSessionHeader(s) {
  return `<div class="live-session-header"><div><strong>${html(s.title)}</strong><span>${html(s.objective)}</span></div><div><b>${html(s.duration || "—")} min</b><small>${html(s.criterion || "Sin criterio")}</small></div></div>`;
}
function liveExerciseCard(ex, sessionId) {
  const rec = recomendarEjercicio(ex.name);
  return `<article class="exercise-live-card"><div><span>${html(ex.block || "Bloque")}</span><h3>${html(ex.name)}</h3><p>${html(ex.note || ex.focus || "")}</p></div><div class="exercise-prescription"><b>${html(ex.sets || "—")} x ${html(ex.reps || ex.time || "—")}</b><small>${html(ex.load || "Carga según histórico")} · RPE ${html(ex.rpe || "objetivo")}</small></div><div class="recommendation-box"><strong>${html(rec.title)}</strong><small>${html(rec.text)}</small></div><button class="btn btn-ghost btn-small" data-register-exercise="${html(ex.name)}" data-session-id="${html(sessionId)}">Registrar</button></article>`;
}
function recomendarEjercicio(name) {
  const hist = historialEjercicio(name)[0];
  if (!hist) return { title: "Sin histórico suficiente", text: "Usar carga conservadora y registrar RPE." };
  if (n(hist.rpe) >= 8 || n(hist.pain) >= 3) return { title: "Mantener o ajustar", text: `${hist.load}${hist.unit || "kg"} anterior · RPE ${hist.rpe}. No progresar sin técnica estable.` };
  return { title: "Margen prudente", text: `${hist.load}${hist.unit || "kg"} anterior · RPE ${hist.rpe}. Progresar solo si técnica limpia.` };
}
function formCargaRapida(session) {
  return `<form id="loadForm" class="stack-form"><input type="hidden" id="loadSessionId" value="${html(session.id || "")}"><label>Ejercicio<input id="loadExercise" placeholder="Ejercicio"></label><label>Patrón<select id="loadPattern"><option>Sentadilla</option><option>Bisagra</option><option>Empuje</option><option>Tracción</option><option>Rotación/Anti-rotación</option><option>Core</option><option>Metabólico</option></select></label><div class="form-row"><label>Series<input id="loadSets" inputmode="numeric" placeholder="3"></label><label>Reps<input id="loadReps" placeholder="10"></label></div><div class="form-row"><label>Carga<input id="loadLoad" inputmode="decimal" placeholder="24"></label><label>Unidad<select id="loadUnit"><option>kg</option><option>seg</option><option>m</option><option>RPE</option></select></label></div><div class="form-row"><label>RPE<input id="loadRpe" inputmode="decimal" placeholder="7"></label><label>Descanso<input id="loadRest" placeholder="90 s"></label></div><label>Notas técnicas<textarea id="loadNotes" rows="3" placeholder="Técnica, molestias, ajustes, decisión"></textarea></label><button class="btn btn-primary btn-full" type="submit">Guardar carga en histórico</button><button class="btn btn-ghost btn-full" id="saveLoadDraft" type="button">Guardar solo borrador local</button></form>`;
}
function formCierreSesion(session, drafts) {
  return `<form id="closeSessionForm" class="stack-form"><label>Resumen interno coach<textarea id="closeInternal" rows="4" placeholder="Qué ocurrió, cambios, técnica, cargas, alertas">${html(resumenDrafts(drafts))}</textarea></label><label>Resumen cliente<textarea id="closeClient" rows="3" placeholder="Resumen claro para cliente"></textarea></label><label>Decisión próxima<textarea id="closeDecision" rows="3" placeholder="Progresar, mantener, ajustar, reevaluar"></textarea></label><button class="btn btn-primary" type="submit">Cerrar sesión + generar resumen</button></form>`;
}
function resumenDrafts(drafts) { return safeArray(drafts).map(d => `${d.exercise}: ${d.load}${d.unit} · ${d.sets}x${d.reps} · RPE ${d.rpe}`).join("\n"); }

function vistaCargas() {
  const all = estado.espacio?.loadHistory || estado.panel?.loadHistory || [];
  const filtro = estado.filtroEjercicio.toLowerCase();
  const rows = safeArray(all).filter(r => [r.clientName, r.exercise, r.pattern, r.recommendation].join(" ").toLowerCase().includes(filtro) && (!estado.filtroPatron || r.pattern === estado.filtroPatron));
  const patrones = [...new Set(safeArray(all).map(r => r.pattern).filter(Boolean))];
  return `<section class="coach-grid"><div class="coach-card wide"><div class="section-head"><div><h2>Histórico de cargas</h2><p>Acceso mínimo obligatorio desde el panel coach. Base para recomendación automática.</p></div></div><div class="client-selector"><input id="exerciseSearch" placeholder="Buscar ejercicio, cliente o recomendación" value="${html(estado.filtroEjercicio)}"><select id="patternFilter"><option value="">Todos los patrones</option>${patrones.map(p => `<option value="${html(p)}" ${p === estado.filtroPatron ? "selected" : ""}>${html(p)}</option>`).join("")}</select></div>${tablaCargas(rows, false)}</div><div class="coach-card wide"><h2>Gráfica textual de evolución</h2>${graficaCargas(rows)}</div></section>`;
}
function tablaCargas(rows, compact = false) {
  if (!rows.length) return empty("Aún no hay histórico de cargas.");
  return `<div class="table-wrap"><table class="coach-table"><thead><tr><th>Cliente</th><th>Ejercicio</th><th>Patrón</th><th>Último</th><th>RPE</th><th>Tendencia</th><th>Recomendación</th></tr></thead><tbody>${rows.map(r => `<tr><td>${html(r.clientName || r.clientId || "")}</td><td><strong>${html(r.exercise)}</strong><small>${fecha(r.date)}</small></td><td>${html(r.pattern || "")}</td><td>${html(r.load)} ${html(r.unit || "kg")} · ${html(r.sets)}x${html(r.reps)}</td><td>${html(r.rpe || "—")}</td><td>${html(r.trend || tendenciaCarga(r))}</td><td>${html(compact ? trunc(r.recommendation, 70) : r.recommendation || recomendacionCarga(r))}</td></tr>`).join("")}</tbody></table></div>`;
}
function tendenciaCarga(r) { if (n(r.rpe) <= 7 && n(r.pain) === 0) return "Margen"; if (n(r.rpe) >= 8 || n(r.pain) > 0) return "Prudencia"; return "Estable"; }
function recomendacionCarga(r) { if (n(r.rpe) >= 8 || n(r.pain) >= 3) return "Mantener/reducir; priorizar técnica."; return "Progresar con prudencia si técnica estable."; }
function graficaCargas(rows) {
  const top = safeArray(rows).slice(0, 8);
  return `<div class="load-bars">${top.map(r => `<div><span>${html(trunc(r.exercise, 24))}</span><b style="--w:${Math.min(100, Math.max(8, n(r.load) * 2))}%"></b><small>${html(r.load)}${html(r.unit || "kg")} · RPE ${html(r.rpe || "—")}</small></div>`).join("") || empty("Sin datos para graficar.")}</div>`;
}
function historialEjercicio(name) {
  const all = safeArray(estado.espacio?.loadHistory || estado.panel?.loadHistory);
  const q = String(name || "").toLowerCase();
  return all.filter(r => String(r.exercise || "").toLowerCase() === q).sort((a,b)=>new Date(b.date)-new Date(a.date));
}

function vistaIri() {
  if (!estado.espacio) return sinCliente("Elige un cliente para trabajar el IRI.");
  const iri = estado.espacio.iri || {};
  return `<section class="coach-grid"><div class="coach-card wide"><div class="section-head"><div><h2>Informe IRI</h2><p>Pieza central del método: versión interna coach y versión visible para cliente.</p></div><span class="badge-soft gold">${html(iri.status || "BORRADOR")}</span></div><div class="iri-summary"><div><span>IRI</span><strong>${html(iri.total || "—")}</strong></div><div><span>Clasificación</span><strong>${html(iri.classification || "—")}</strong></div><div><span>Limitadores</span><strong>${html(trunc(iri.limiters || "—", 60))}</strong></div></div></div><div class="coach-card wide">${formIri(iri)}</div></section>`;
}
function formIri(iri) {
  return `<form id="iriForm" class="stack-form"><input type="hidden" id="iriId" value="${html(iri.id || "")}"><div class="form-row"><label>IRI total<input id="iriTotal" value="${html(iri.total || "")}"></label><label>Clasificación<input id="iriClass" value="${html(iri.classification || "")}"></label><label>Estado<select id="iriStatus"><option>BORRADOR</option><option ${iri.status === "PUBLICADO" ? "selected" : ""}>PUBLICADO</option><option>INTERNO</option></select></label></div><label>Contexto<textarea id="iriContext" rows="3">${html(iri.context || "")}</textarea></label><label>Bioimpedancia<textarea id="iriBio" rows="3">${html(iri.bioimpedance || "")}</textarea></label><label>Movilidad<textarea id="iriMobility" rows="3">${html(iri.mobility || "")}</textarea></label><label>Fuerza<textarea id="iriStrength" rows="3">${html(iri.strength || "")}</textarea></label><label>Capacidad metabólica<textarea id="iriMetabolic" rows="3">${html(iri.metabolic || "")}</textarea></label><label>Limitadores<textarea id="iriLimiters" rows="3">${html(iri.limiters || "")}</textarea></label><label>Recomendación<textarea id="iriRecommendation" rows="3">${html(iri.recommendation || "")}</textarea></label><label>Decisión IBERFIT<textarea id="iriDecision" rows="3">${html(iri.decision || "")}</textarea></label><button class="btn btn-primary" type="submit">Guardar IRI / adjuntar a ficha</button></form>`;
}

function vistaInformes() {
  if (!estado.espacio) return sinCliente("Elige un cliente para generar informes.");
  const reports = safeArray(estado.espacio.reports);
  return `<section class="coach-grid report-center">
    <div class="coach-card wide report-hero"><div><span class="eyebrow">Centro de informes</span><h2>Informar con criterio, no solo registrar</h2><p>Genera versiones para cliente o internas, conectando IRI, sesión, cargas, feedback, check-in y próxima decisión.</p></div><div class="report-type-strip"><span>Cliente</span><span>Coach</span><span>Ambos</span></div></div>
    <div class="coach-card wide"><h2>Informes adjuntos a ficha</h2><div class="report-list">${reports.map(r => `<article class="report-card"><span>${html(r.type)} · ${fecha(r.date)}</span><h3>${html(r.title)}</h3><p>${html(r.internalSummary || "")}</p><small>${html(r.state)} · visible cliente: ${html(r.clientVisible)}</small></article>`).join("") || empty("Sin informes generados.")}</div></div>
    <div class="coach-card wide"><h2>Nuevo informe guiado</h2>${formInforme()}</div>
    <div class="coach-card"><h2>Qué incluir</h2>${reportChecklist()}</div>
    <div class="coach-card wide"><h2>Gráficas útiles</h2>${graficaCargas(estado.espacio.loadHistory || [])}</div>
  </section>`;
}
function reportChecklist() {
  const items = ["IRI y limitadores", "Cargas y tendencia", "Feedback post-sesión", "Check-in semanal", "Bioimpedancia", "Alertas", "Próxima decisión"];
  return `<div class="report-checklist">${items.map(i => `<label><input type="checkbox" checked> ${html(i)}</label>`).join("")}</div>`;
}
function formInforme() {
  const d = estado.espacio ? calcularDecision(estado.espacio) : { accion: "" };
  return `<form id="reportForm" class="stack-form report-form"><div class="form-3"><label>Tipo<select id="reportType"><option>IRI</option><option>Sesión</option><option>Progreso</option><option>Mensual</option><option>Cargas</option><option>Adherencia</option><option>Decisión IBERFIT</option></select></label><label>Destino<select id="reportAudience"><option>Cliente</option><option>Coach</option><option>Ambos</option></select></label><label>Estado<select id="reportState"><option>INTERNO</option><option>BORRADOR</option><option>PUBLICADO</option></select></label></div><div class="form-2"><label>Periodo<select id="reportPeriod"><option>Última sesión</option><option>Última semana</option><option>Último mes</option><option>Desde IRI</option></select></label><label>Título<input id="reportTitle" placeholder="Informe IBERFIT" value="Informe IBERFIT · ${html(estado.espacio?.client?.name || "cliente")}"></label></div><label>Versión interna coach<textarea id="reportInternal" rows="5" placeholder="Más técnica, crítica, con riesgos y decisiones">Decisión actual: ${html(d.accion || "pendiente de revisar respuesta real.")}</textarea></label><label>Versión cliente<textarea id="reportClient" rows="5" placeholder="Clara, sobria y entendible">Hoy priorizamos continuidad, técnica y una progresión ajustada a tu respuesta real.</textarea></label><label>URL PDF / Drive<input id="reportUrl" placeholder="Opcional"></label><button class="btn btn-primary" type="submit">Guardar informe en ficha</button></form>`;
}
function vistaBioimpedancia() {
  if (!estado.espacio) return sinCliente("Elige un cliente para registrar bioimpedancia.");
  const rows = safeArray(estado.espacio.bioimpedance);
  return `<section class="coach-grid"><div class="coach-card wide"><div class="section-head"><div><h2>Bioimpedancia</h2><p>Registro histórico de composición. Se integra al IRI, informes y Motor de Decisión.</p></div><span class="badge-soft">${rows.length} registros</span></div><div class="load-table"><table><thead><tr><th>Fecha</th><th>Peso</th><th>% grasa</th><th>Masa muscular</th><th>Fuente</th><th>Notas</th></tr></thead><tbody>${rows.map(b => `<tr><td>${fecha(b.date)}</td><td>${html(b.weight)}</td><td>${html(b.fatPct)}</td><td>${html(b.muscleMass)}</td><td>${html(b.source)}</td><td>${html(trunc(b.notes || "", 70))}</td></tr>`).join("") || `<tr><td colspan="6">Sin registros.</td></tr>`}</tbody></table></div></div><div class="coach-card wide"><h2>Nuevo registro</h2><form id="bioForm" class="coach-form"><div class="form-3"><label>Peso<input id="bioWeight" placeholder="kg"></label><label>% grasa<input id="bioFatPct" placeholder="%"></label><label>Masa muscular<input id="bioMuscle" placeholder="kg"></label></div><div class="form-3"><label>Masa grasa<input id="bioFatMass" placeholder="kg"></label><label>Agua<input id="bioWater" placeholder="%"></label><label>Grasa visceral<input id="bioVisceral" placeholder="Nivel"></label></div><label>Fuente<input id="bioSource" placeholder="Báscula / InBody / Tanita / otra"></label><label>Observaciones<textarea id="bioNotes" placeholder="Contexto, ayuno, horario, hidratación, interpretación..."></textarea></label><button class="btn btn-primary" type="submit">Guardar bioimpedancia</button></form></div></section>`;
}
function feedbackDecisionRows(rows, tipo) {
  return safeArray(rows).map(r => `<article class="report-card"><span>${tipo === "feedback" ? "Feedback" : "Check-in"} · ${html(r.sessionId || r.weekId || "")}</span><h3>${tipo === "feedback" ? `RPE ${html(r.rpe || "—")} · molestia ${html(r.pain || "—")}` : `Fatiga ${html(r.fatigue || "—")} · energía ${html(r.energy || "—")}`}</h3><p>${html(r.comment || "Sin comentario")}</p><textarea data-decision-text="${html(tipo)}:${html(r.id)}" placeholder="Decisión IBERFIT: progresar, mantener, reducir, cambiar variante, contactar...">${html(r.decision || "")}</textarea><button class="btn btn-primary" data-save-decision="${html(tipo)}:${html(r.id)}">Guardar decisión</button></article>`).join("") || empty("Sin registros pendientes.");
}
function vistaFeedback() {
  const rows = safeArray(estado.espacio?.feedback || estado.panel?.pendingFeedback);
  return `<section class="coach-grid"><div class="coach-card wide"><h2>Feedback post-sesión</h2><p>Revisar y convertir respuesta real en Decisión IBERFIT.</p><div class="report-list">${feedbackDecisionRows(rows, "feedback")}</div></div></section>`;
}
function vistaCheckin() {
  const rows = safeArray(estado.espacio?.checkin || estado.panel?.pendingCheckin);
  return `<section class="coach-grid"><div class="coach-card wide"><h2>Check-in semanal</h2><p>Fatiga, descanso, adherencia, molestias y decisión semanal.</p><div class="report-list">${feedbackDecisionRows(rows, "checkin")}</div></div></section>`;
}
function vistaMultimedia() {
  const media = safeArray(estado.espacio?.media);
  return `<section class="coach-grid"><div class="coach-card wide"><h2>Banco multimedia técnico</h2><p>Solo recursos propios o con licencia registrada. No usar imágenes sin trazabilidad.</p><div class="load-table"><table><thead><tr><th>Ejercicio</th><th>Tipo</th><th>Fuente</th><th>Licencia</th><th>Estado</th></tr></thead><tbody>${media.map(m => `<tr><td>${html(m.exercise || m.name || "")}</td><td>${html(m.type || "")}</td><td>${html(m.source || "")}</td><td>${html(m.license || "")}</td><td>${html(m.state || m.status || "")}</td></tr>`).join("") || `<tr><td colspan="5">Sin multimedia aprobada.</td></tr>`}</tbody></table></div></div><div class="coach-card wide"><h2>Nuevo recurso multimedia</h2><form id="mediaForm" class="coach-form"><div class="form-2"><label>Ejercicio<input id="mediaExercise" placeholder="Nombre ejercicio"></label><label>Tipo<select id="mediaType"><option>FOTO</option><option>VIDEO</option><option>DIAGRAMA</option></select></label></div><label>URL<input id="mediaUrl" placeholder="URL recurso"></label><div class="form-3"><label>Fuente<input id="mediaSource" placeholder="IBERFIT / banco propio / externo"></label><label>Licencia<input id="mediaLicense" placeholder="Propia / CC BY / pendiente"></label><label>Autor<input id="mediaAuthor" placeholder="Autor"></label></div><label>Notas<textarea id="mediaNotes" placeholder="Estado, encuadre técnico, observaciones de uso..."></textarea></label><button class="btn btn-primary" type="submit">Guardar multimedia</button></form></div></section>`;
}
function vistaAlertas() {
  const alerts = safeArray(estado.panel?.alerts).filter(a => !estado.clienteId || a.clientId === estado.clienteId);
  return `<section class="coach-grid"><div class="coach-card wide"><h2>Alertas y prudencia</h2><p>Riesgos, progresiones excesivas, fatiga, molestias e informes pendientes.</p><div class="decision-list">${alerts.map(a => `<div class="task-card priority-${String(a.priority || "MEDIA").toLowerCase()}"><strong>${html(a.priority || "MEDIA")}</strong><p>${html(a.message || "")}</p><small>${html(a.clientId || "")}</small></div>`).join("") || empty("Sin alertas abiertas.")}</div></div></section>`;
}
function vistaAccesos() {
  if (!estado.espacio) return sinCliente("Elige un cliente para revisar accesos.");
  const tokens = safeArray(estado.espacio.tokens);
  const sessions = safeArray(estado.espacio.activeSessions);
  return `<section class="coach-grid"><div class="coach-card"><h2>Acceso App Client</h2><p>Activación, recuperación y cierre de sesiones.</p><button class="btn btn-primary btn-full" id="generarActivacion">Generar activación</button><button class="btn btn-ghost btn-full" id="generarRecuperacion">Generar recuperación</button><button class="btn btn-link btn-full" id="revocarTodas">Cerrar sesiones activas</button></div><div class="coach-card wide"><h2>Tokens recientes</h2><div class="load-table"><table><thead><tr><th>Tipo</th><th>Estado</th><th>Creación</th><th>Expira</th></tr></thead><tbody>${tokens.map(t => `<tr><td>${html(t.type)}</td><td>${html(t.state)}</td><td>${fechaHora(t.createdAt)}</td><td>${fechaHora(t.expiresAt)}</td></tr>`).join("") || `<tr><td colspan="4">Sin tokens recientes.</td></tr>`}</tbody></table></div></div><div class="coach-card wide"><h2>Sesiones activas</h2><div class="load-table"><table><thead><tr><th>ID</th><th>Estado</th><th>Creación</th><th>Expira</th><th>Origen</th></tr></thead><tbody>${sessions.map(s => `<tr><td>${html(s.id)}</td><td>${html(s.state)}</td><td>${fechaHora(s.createdAt)}</td><td>${fechaHora(s.expiresAt)}</td><td>${html(s.source)}</td></tr>`).join("") || `<tr><td colspan="5">Sin sesiones activas.</td></tr>`}</tbody></table></div></div></section>`;
}

function vistaBiblioteca() {
  const backendLibrary = safeArray(estado.panel?.exerciseLibrary);
  const library = backendLibrary.length ? backendLibrary : mockExercises();
  const filtro = estado.filtroEjercicio.toLowerCase();
  const rows = library.filter(e => [e.name, e.pattern, e.zone, e.material, e.level, e.objective].join(" ").toLowerCase().includes(filtro));
  return `<section class="coach-grid"><div class="coach-card wide"><div class="section-head"><div><h2>Biblioteca de ejercicios</h2><p>Ejercicios con técnica, progresiones, regresiones, sustituciones y banco multimedia controlado.</p></div></div><input id="librarySearch" placeholder="Buscar ejercicio, patrón, material" value="${html(estado.filtroEjercicio)}"><div class="exercise-library">${rows.map(e => exerciseCard(e)).join("")}</div></div><div class="coach-card wide"><h2>Nuevo ejercicio</h2>${formEjercicio()}</div></section>`;
}
function exerciseCard(e) {
  return `<article class="exercise-card"><div class="exercise-media-placeholder"><span>Foto técnica</span><small>${html(e.mediaStatus || "Pendiente aprobación")}</small></div><div><span>${html(e.pattern)} · ${html(e.zone)}</span><h3>${html(e.name)}</h3><p>${html(e.objective || "")}</p><small><b>Material:</b> ${html(e.material || "")} · <b>Nivel:</b> ${html(e.level || "")}</small><details><summary>Técnica y sustituciones</summary><p><b>Indicaciones:</b> ${html(e.cues || e.indications || "Pendiente")}</p><p><b>Errores:</b> ${html(e.errors || "Pendiente")}</p><p><b>Regresión:</b> ${html(e.regression || "Pendiente")} · <b>Progresión:</b> ${html(e.progression || "Pendiente")}</p></details></div></article>`;
}
function formEjercicio() {
  return `<form id="exerciseForm" class="stack-form"><div class="form-row"><label>Nombre<input id="exName" required></label><label>Patrón<input id="exPattern"></label></div><div class="form-row"><label>Zona<input id="exZone"></label><label>Material<input id="exMaterial"></label><label>Nivel<input id="exLevel"></label></div><label>Objetivo<input id="exObjective"></label><label>Indicaciones técnicas<textarea id="exNotes" rows="4"></textarea></label><button class="btn btn-primary" type="submit">Guardar ejercicio</button></form>`;
}

function vistaSheet() {
  const sheets = ["00 Panel", "01 Clientes", "02 Ficha Cliente", "03 Planes", "04 Semanas", "05 Sesiones", "06 Sesión Presencial", "07 Cargas", "08 Histórico de Cargas", "09 Feedback", "10 Check-in", "11 Diagnóstico IRI", "12 Bioimpedancia", "13 Informes", "14 Gráficas", "15 Biblioteca Ejercicios", "16 Multimedia Ejercicios", "17 Plantillas Semana", "18 Plantillas Sesión", "19 Bloques Sesión", "20 Alertas", "21 Accesos", "22 Activaciones", "23 Sesiones Activas", "24 Decisiones IBERFIT", "25 Configuración", "26 Listas", "99 Registro"];
  return `<section class="coach-grid"><div class="coach-card wide"><h2>Orden operativo del Sheet</h2><p>Las pestañas de uso diario van al principio; lo técnico queda al final. Estética IBERFIT sin demoler lo existente.</p><div class="sheet-order">${sheets.map((s,i)=>`<div><strong>${String(i).padStart(2,"0")}</strong><span>${html(s)}</span></div>`).join("")}</div></div></section>`;
}

function sinCliente(msg) { return `<section class="coach-grid"><div class="coach-card wide empty-state"><h2>${html(msg)}</h2><p>Usa el selector de clientes o crea uno nuevo para continuar.</p><button class="btn btn-primary" data-go="clientes">Ir a clientes</button></div></section>`; }
function empty(msg) { return `<div class="empty-mini">${html(msg)}</div>`; }

function leerBloques() {
  const blocks = [];
  for (let i = 0; i < 3; i++) {
    const title = $(`#block${i}Title`)?.value.trim() || "";
    const focus = $(`#block${i}Focus`)?.value.trim() || "";
    const exercises = [];
    for (let j = 0; j < 4; j++) {
      const name = $(`#b${i}e${j}Name`)?.value.trim() || "";
      if (!name) continue;
      exercises.push({ name, sets: $(`#b${i}e${j}Sets`)?.value.trim() || "", reps: $(`#b${i}e${j}Reps`)?.value.trim() || "", time: $(`#b${i}e${j}Time`)?.value.trim() || "", rest: $(`#b${i}e${j}Rest`)?.value.trim() || "", note: $(`#b${i}e${j}Note`)?.value.trim() || "" });
    }
    if (title || focus || exercises.length) blocks.push({ title: title || `Bloque ${i+1}`, focus, exercises });
  }
  return blocks;
}
async function entrar(e) {
  e.preventDefault();
  const login = $("#coachLogin")?.value.trim() || "";
  const password = $("#coachPassword")?.value || "";
  if (!login || !password) return aviso("Ingresa usuario y contraseña.", "error");
  aviso("Validando acceso...");
  const res = await api("coachLogin", { login, password });
  if (!res.ok) {
    console.warn("IBERFIT Coach login failed", { status: res.status, message: res.message });
    return aviso(res.message || "No se pudo acceder.", "error");
  }
  guardarSesionCoach(res.data || {});
  estado.panel = res.data?.dashboard || null;
  estado.aviso = "";
  render();
}
async function actualizar() {
  const res = await api("coachGetDashboard");
  if (!res.ok) return aviso(res.message || "No se pudo actualizar.", "error");
  estado.panel = res.data;
  estado.aviso = "";
  render();
}
async function cargarCliente(id) {
  if (!id) return aviso("Selecciona un cliente.", "error");
  estado.clienteId = id;
  aviso("Cargando ficha cliente...");
  const res = await api("coachGetClientWorkspace", { clientId: id });
  if (!res.ok) return aviso(res.message || "No se pudo cargar el cliente.", "error");
  estado.espacio = res.data;
  estado.vista = "ficha";
  estado.aviso = "";
  render();
}
async function crearCliente(e) {
  e.preventDefault();
  const res = await api("coachCrearCliente", { nombre: $("#newName").value.trim(), email: $("#newEmail").value.trim(), telefono: $("#newPhone").value.trim(), modalidad: $("#newModality").value, estado: $("#newStatus").value, objetivo: $("#newObjective").value.trim(), observaciones: $("#newNotes").value.trim() });
  if (!res.ok) return aviso(res.message || "No se pudo crear cliente.", "error");
  await actualizar();
  estado.clienteId = res.data.clientId || estado.clienteId;
  aviso(`Cliente creado: ${res.data.clientId}. Copia el enlace de activación.`, "success", res.data.activationLink);
}
async function guardarSemana(e) {
  e.preventDefault();
  const res = await api("coachSaveWeek", { clientId: estado.clienteId, weekId: $("#weekId").value.trim(), weekNumber: $("#weekNumber").value.trim(), state: $("#weekState").value, title: $("#weekTitle").value.trim(), focus: $("#weekFocus").value.trim(), message: $("#weekMessage").value.trim() });
  if (!res.ok) return aviso(res.message || "No se pudo guardar semana.", "error");
  await cargarCliente(estado.clienteId);
  aviso("Semana guardada.", "success");
}
async function guardarSesionEntreno(e) {
  e.preventDefault();
  const blocks = leerBloques();
  const res = await api("coachSaveSession", { clientId: estado.clienteId, weekId: estado.espacio?.week?.id || $("#weekId")?.value || "", sessionId: $("#sessionId").value.trim(), deliveryMode: $("#sessionDelivery").value, type: $("#sessionType").value, duration: $("#sessionDuration").value.trim(), state: $("#sessionState").value, order: $("#sessionOrder").value.trim(), title: $("#sessionTitle").value.trim(), objective: $("#sessionObjective").value.trim(), criterion: $("#sessionCriterion").value.trim(), preparation: $("#sessionPreparation").value.trim(), mainBlock: $("#sessionMainBlock").value.trim(), coolDown: $("#sessionCoolDown").value.trim(), indications: $("#sessionIndications").value.trim(), material: $("#sessionMaterial").value.trim(), observe: $("#sessionObserve").value.trim(), adjust: $("#sessionAdjust").value.trim(), report: $("#sessionReport").value.trim(), blocksJson: JSON.stringify(blocks) });
  if (!res.ok) return aviso(res.message || "No se pudo guardar sesión.", "error");
  await cargarCliente(estado.clienteId);
  aviso("Sesión guardada y sincronizada.", "success");
}
async function generarEnlace(tipo) {
  if (!estado.clienteId) return aviso("Primero elige cliente.", "error");
  const action = tipo === "reset" ? "coachGenerarEnlaceRecuperacion" : "coachGenerarEnlaceActivacion";
  const res = await api(action, { clientId: estado.clienteId });
  if (!res.ok) return aviso(res.message || "No se pudo generar enlace.", "error");
  const link = res.data.resetLink || res.data.activationLink;
  aviso(tipo === "reset" ? "Enlace de recuperación generado." : "Enlace de activación generado.", "success", link);
}
async function guardarEjercicio(e) {
  e.preventDefault();
  const res = await api("coachGuardarEjercicio", { nombre: $("#exName").value.trim(), patron: $("#exPattern").value.trim(), zona: $("#exZone").value.trim(), material: $("#exMaterial").value.trim(), nivel: $("#exLevel").value.trim(), objetivo: $("#exObjective").value.trim(), indicaciones: $("#exNotes").value.trim() });
  if (!res.ok) return aviso(res.message || "No se pudo guardar ejercicio.", "error");
  await actualizar();
  aviso("Ejercicio guardado.", "success");
}
function loadFormData() {
  return { clientId: estado.clienteId, sessionId: $("#loadSessionId")?.value || estado.sesionActiva, exercise: $("#loadExercise")?.value.trim() || "", pattern: $("#loadPattern")?.value || "", sets: $("#loadSets")?.value.trim() || "", reps: $("#loadReps")?.value.trim() || "", load: $("#loadLoad")?.value.trim() || "", unit: $("#loadUnit")?.value || "kg", rpe: $("#loadRpe")?.value.trim() || "", rest: $("#loadRest")?.value.trim() || "", notes: $("#loadNotes")?.value.trim() || "", date: new Date().toISOString() };
}
async function guardarCarga(e) {
  e.preventDefault();
  const data = loadFormData();
  if (!data.exercise) return aviso("Falta ejercicio.", "error");
  const res = await api("coachGuardarCarga", data);
  if (!res.ok) return aviso(res.message || "No se pudo guardar carga.", "error");
  guardarCargaBorrador(data, false);
  if (estado.clienteId) await cargarCliente(estado.clienteId);
  estado.vista = "sesion";
  aviso("Carga guardada en histórico.", "success");
}
function guardarCargaBorrador(data = loadFormData(), rerender = true) {
  const sid = data.sessionId || "SIN_SESION";
  if (!estado.borradorPresencial[sid]) estado.borradorPresencial[sid] = [];
  estado.borradorPresencial[sid].push(data);
  guardarBorradorPresencial();
  if (rerender) aviso("Borrador local guardado.", "success");
}
async function guardarIri(e) {
  e.preventDefault();
  const res = await api("coachGuardarIri", { clientId: estado.clienteId, iriId: $("#iriId")?.value.trim() || "", total: $("#iriTotal").value.trim(), classification: $("#iriClass").value.trim(), status: $("#iriStatus").value, context: $("#iriContext").value.trim(), bioimpedance: $("#iriBio").value.trim(), mobility: $("#iriMobility").value.trim(), strength: $("#iriStrength").value.trim(), metabolic: $("#iriMetabolic").value.trim(), limiters: $("#iriLimiters").value.trim(), recommendation: $("#iriRecommendation").value.trim(), decision: $("#iriDecision").value.trim() });
  if (!res.ok) return aviso(res.message || "No se pudo guardar IRI.", "error");
  await cargarCliente(estado.clienteId);
  estado.vista = "iri";
  aviso("IRI guardado y adjuntado a ficha.", "success");
}
async function guardarInforme(e) {
  e.preventDefault();
  const res = await api("coachGuardarInforme", { clientId: estado.clienteId, type: $("#reportType").value, state: $("#reportState").value, title: $("#reportTitle").value.trim(), internalVersion: $("#reportInternal").value.trim(), clientVersion: $("#reportClient").value.trim(), url: $("#reportUrl").value.trim() });
  if (!res.ok) return aviso(res.message || "No se pudo guardar informe.", "error");
  await cargarCliente(estado.clienteId);
  estado.vista = "informes";
  aviso("Informe guardado en ficha.", "success");
}
async function cerrarSesion(e) {
  e.preventDefault();
  const res = await api("coachCerrarSesionPresencial", { clientId: estado.clienteId, sessionId: estado.sesionActiva, internalSummary: $("#closeInternal").value.trim(), clientSummary: $("#closeClient").value.trim(), decision: $("#closeDecision").value.trim(), loadDrafts: estado.borradorPresencial[estado.sesionActiva] || [] });
  if (!res.ok) return aviso(res.message || "No se pudo cerrar sesión.", "error");
  delete estado.borradorPresencial[estado.sesionActiva];
  guardarBorradorPresencial();
  await cargarCliente(estado.clienteId);
  estado.vista = "informes";
  aviso("Sesión cerrada. Resumen generado como informe interno.", "success");
}
async function guardarDecision(tipo, id, decision) {
  const action = tipo === "feedback" ? "coachReviewFeedback" : "coachReviewCheckin";
  const payload = tipo === "feedback" ? { feedbackId: id, decision } : { checkinId: id, decision };
  const res = await api(action, payload);
  if (!res.ok) return aviso(res.message || "No se pudo guardar decisión.", "error");
  await cargarCliente(estado.clienteId);
  aviso("Decisión IBERFIT guardada.", "success");
}
async function revocarTodas() {
  const res = await api("coachRevocarSesionesCliente", { clientId: estado.clienteId });
  if (!res.ok) return aviso(res.message || "No se pudieron cerrar sesiones.", "error");
  aviso("Sesiones activas cerradas.", "success");
}
async function guardarBioimpedancia(e) {
  e.preventDefault();
  const res = await api("coachGuardarBioimpedancia", { clientId: estado.clienteId, weight: $("#bioWeight").value.trim(), fatPct: $("#bioFatPct").value.trim(), muscleMass: $("#bioMuscle").value.trim(), fatMass: $("#bioFatMass").value.trim(), waterPct: $("#bioWater").value.trim(), visceralFat: $("#bioVisceral").value.trim(), source: $("#bioSource").value.trim(), notes: $("#bioNotes").value.trim() });
  if (!res.ok) return aviso(res.message || "No se pudo guardar bioimpedancia.", "error");
  await cargarCliente(estado.clienteId);
  estado.vista = "bio";
  aviso("Bioimpedancia guardada e integrada a ficha.", "success");
}
async function guardarMultimedia(e) {
  e.preventDefault();
  const res = await api("coachGuardarMultimedia", { exercise: $("#mediaExercise").value.trim(), type: $("#mediaType").value, url: $("#mediaUrl").value.trim(), source: $("#mediaSource").value.trim(), license: $("#mediaLicense").value.trim(), author: $("#mediaAuthor").value.trim(), notes: $("#mediaNotes").value.trim() });
  if (!res.ok) return aviso(res.message || "No se pudo guardar multimedia.", "error");
  if (estado.clienteId) await cargarCliente(estado.clienteId); else await actualizar();
  estado.vista = "multimedia";
  aviso("Recurso multimedia guardado con trazabilidad.", "success");
}
async function guardarDecisionDesdeBoton(value) {
  const [tipo, id] = String(value || "").split(":");
  const input = document.querySelector(`[data-decision-text="${tipo}:${id}"]`);
  const decision = input?.value?.trim() || "";
  if (!decision) return aviso("Escribe una decisión IBERFIT antes de guardar.", "error");
  return guardarDecision(tipo, id, decision);
}
function bind() {
  $("#coachLoginForm")?.addEventListener("submit", entrar);
  $("#coachRefreshBtn")?.addEventListener("click", actualizar);
  $("#coachLogoutBtn")?.addEventListener("click", async () => { try { await api("coachLogout"); } catch {} sessionStorage.removeItem(COACH_KEY); estado.token = ""; estado.panel = null; estado.espacio = null; render(); });
  $$(".coach-tab").forEach(b => b.addEventListener("click", () => { estado.vista = b.dataset.view; render(); }));
  $$('[data-go]').forEach(b => b.addEventListener("click", () => { estado.vista = b.dataset.go; render(); }));
  $("#btnGoClientes")?.addEventListener("click", () => { estado.vista = "clientes"; render(); });
  $("#btnNuevoCliente")?.addEventListener("click", () => { estado.vista = "clientes"; render(); setTimeout(() => $("#newName")?.focus(), 0); });
  $$("[data-client-id]").forEach(b => b.addEventListener("click", () => cargarCliente(b.dataset.clientId)));
  $("#clientSearch")?.addEventListener("input", e => { estado.filtroCliente = e.target.value; render(); });
  $("#clientSelect")?.addEventListener("change", e => { estado.clienteId = e.target.value; });
  $("#loadClientSelect")?.addEventListener("click", () => cargarCliente($("#clientSelect")?.value || estado.clienteId));
  $("#newClientForm")?.addEventListener("submit", crearCliente);
  $("#weekForm")?.addEventListener("submit", guardarSemana);
  $("#sessionForm")?.addEventListener("submit", guardarSesionEntreno);
  $("#sessionBuilderForm")?.addEventListener("submit", guardarSesionConstructor);
  $$("[data-template-title]").forEach(b => b.addEventListener("click", () => { $("#builderTitle") && ($("#builderTitle").value = b.dataset.templateTitle || ""); $("#builderObjective") && ($("#builderObjective").value = b.dataset.templateObjective || ""); $("#builderCriterion") && ($("#builderCriterion").value = b.dataset.templateCriterion || ""); }));
  $$("[data-copy-exercise]").forEach(b => b.addEventListener("click", () => { const target = $("#builderB1E0Name") || $("#loadExercise"); if (target) target.value = b.dataset.copyExercise || ""; }));
  $("#generarActivacion")?.addEventListener("click", () => generarEnlace("act"));
  $("#generarRecuperacion")?.addEventListener("click", () => generarEnlace("reset"));
  $("#revocarTodas")?.addEventListener("click", revocarTodas);
  $("#exerciseForm")?.addEventListener("submit", guardarEjercicio);
  $("#loadForm")?.addEventListener("submit", guardarCarga);
  $("#saveLoadDraft")?.addEventListener("click", () => guardarCargaBorrador());
  $("#iriForm")?.addEventListener("submit", guardarIri);
  $("#reportForm")?.addEventListener("submit", guardarInforme);
  $("#bioForm")?.addEventListener("submit", guardarBioimpedancia);
  $("#mediaForm")?.addEventListener("submit", guardarMultimedia);
  $("#closeSessionForm")?.addEventListener("submit", cerrarSesion);
  $("#liveSessionSelect")?.addEventListener("change", e => { estado.sesionActiva = e.target.value; const hidden = $("#loadSessionId"); if (hidden) hidden.value = estado.sesionActiva; render(); });
  $$('[data-register-exercise]').forEach(b => b.addEventListener("click", () => { $("#loadExercise").value = b.dataset.registerExercise; $("#loadSessionId").value = b.dataset.sessionId || estado.sesionActiva; $("#loadExercise").focus(); }));
  $("#exerciseSearch")?.addEventListener("input", e => { estado.filtroEjercicio = e.target.value; render(); });
  $("#librarySearch")?.addEventListener("input", e => { estado.filtroEjercicio = e.target.value; render(); });
  $("#patternFilter")?.addEventListener("change", e => { estado.filtroPatron = e.target.value; render(); });
  $$('[data-save-decision]').forEach(b => b.addEventListener("click", () => guardarDecisionDesdeBoton(b.dataset.saveDecision)));
  $("#copyLastLink")?.addEventListener("click", async () => { try { await navigator.clipboard.writeText(estado.enlace); aviso("Enlace copiado.", "success", estado.enlace); } catch {} });
}
function render() { root.innerHTML = estado.token ? shell() : loginPantalla(); bind(); }
async function init() {
  const s = leerSesion();
  if (s) {
    estado.token = s.coachToken;
    estado.vence = s.expiresAt;
    estado.coach = s.coach || {};
    const res = await api("coachGetDashboard");
    if (res.ok) estado.panel = res.data; else sessionStorage.removeItem(COACH_KEY);
  }
  render();
}
init();
