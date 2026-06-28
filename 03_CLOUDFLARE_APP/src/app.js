/* ══════════════════════════════════════════════════
   IBERFIT V7.4 · App Client — Session Execution Final Candidate
   Contratos técnicos V6.7 preservados · apertura real de sesiones desde Semana
   ══════════════════════════════════════════════════ */
import { iberfitApi, saveSession, clearSession, currentApiMode } from "./api.js";
import { IBERFIT_CONFIG } from "./config.js";
import { mockData } from "./mock-data.js";

/* ─── DOM helpers ─────────────────────────────── */
const $ = (q, root = document) => root.querySelector(q);
const $$ = (q, root = document) => [...root.querySelectorAll(q)];

/* ─── WA SVG (inline, no external dep) ─────────── */
const WA_SVG = `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16.03 3.2A12.74 12.74 0 0 0 5.08 22.43L3.2 29l6.72-1.77A12.73 12.73 0 1 0 16.03 3.2Zm0 2.42a10.31 10.31 0 0 1 8.73 15.8 10.29 10.29 0 0 1-13.86 3.3l-.48-.28-3.99 1.05 1.07-3.88-.31-.5A10.31 10.31 0 0 1 16.03 5.62Zm-4.1 5.47c-.23 0-.6.08-.92.44-.31.36-1.2 1.17-1.2 2.85 0 1.68 1.23 3.3 1.4 3.53.17.22 2.38 3.8 5.87 5.18 2.9 1.15 3.5.92 4.13.86.63-.06 2.04-.83 2.33-1.63.29-.8.29-1.49.2-1.63-.08-.14-.31-.22-.65-.39-.34-.17-2.04-1.01-2.36-1.12-.31-.12-.54-.17-.77.17-.23.34-.88 1.12-1.08 1.35-.2.22-.4.25-.74.08-.34-.17-1.44-.53-2.74-1.69-1.01-.9-1.7-2.02-1.9-2.36-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.11-.22.06-.43-.03-.6-.09-.17-.77-1.86-1.06-2.55-.28-.67-.56-.58-.77-.59h-.71Z"/></svg>`;

/* ─── State ───────────────────────────────────── */
const state = {
  authenticated: false,
  data: mockData,
  activeScreen: "home",
  selectedSessionId: "",
  clientId: "",
  sessionToken: ""
};

/* ─── Utils ───────────────────────────────────── */
function escapeHTML(v = "") {
  return String(v ?? "").replace(/[&<>'"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c])
  );
}

function getModality() {
  return state.data?.client?.modality || "HIBRIDO";
}

function modalityLabel(m) {
  return { PRESENCIAL: "Modalidad Presencial", HIBRIDO: "Modalidad Híbrida", ONLINE: "Modalidad Online" }[m] || m;
}

function normalizedSessionType(type = "") {
  return String(type || "").trim().toUpperCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function sessionTypePill(type) {
  const key = normalizedSessionType(type);
  const map = {
    PRESENCIAL:    ["pill-pres",   "Presencial"],
    ONLINE:        ["pill-online", "Online"],
    AUTONOMA:      ["pill-type",   "Autónoma"],
    AUTONOMO:      ["pill-type",   "Autónoma"],
    COMPLEMENTARIA:["pill-type",   "Complementaria"],
    EVALUACION:    ["pill-type",   "Evaluación"],
    CHECKIN:       ["pill-type",   "Check-in"],
    FUERZA:        ["pill-type",   "Fuerza"],
    ACONDICIONAMIENTO:["pill-type","Acondicionamiento"],
    MOVILIDAD:     ["pill-type",   "Movilidad"],
    MIXTA:         ["pill-type",   "Mixta"]
  };
  const [cls, label] = map[key] || ["pill-default", escapeHTML(type || "Sesión")];
  return `<span class="pill ${cls}">${label}</span>`;
}

function getSessionDelivery(session = {}) {
  const raw = session.deliveryMode || session.delivery || session.format || session.executionMode || session.modo || session.mode || session.tipoEjecucion || session.type || "";
  const key = normalizedSessionType(raw);
  if (["PRESENCIAL", "GUIADA", "GUIADA_PRESENCIAL", "PRESENCIAL_GUIADA"].includes(key)) return "PRESENCIAL";
  if (["AUTONOMA", "AUTONOMO", "CASA", "EN_CASA", "TRABAJO_AUTONOMO"].includes(key)) return "AUTONOMA";
  if (["ONLINE", "REMOTA", "A_DISTANCIA"].includes(key)) return "ONLINE";
  if (["COMPLEMENTARIA", "COMPLEMENTARIO"].includes(key)) return "COMPLEMENTARIA";
  return "";
}

function sessionDeliveryLabel(session = {}) {
  const delivery = getSessionDelivery(session);
  const labels = {
    PRESENCIAL: "Guiada presencial",
    AUTONOMA: "Trabajo autónomo",
    ONLINE: "Para realizar en casa",
    COMPLEMENTARIA: "Complementaria"
  };
  return labels[delivery] || "Ver sesión";
}

function sessionDeliveryKicker(session = {}) {
  const delivery = getSessionDelivery(session);
  const labels = {
    PRESENCIAL: "Sesión presencial IBERFIT",
    AUTONOMA: "Sesión autónoma",
    ONLINE: "Sesión para realizar en casa",
    COMPLEMENTARIA: "Trabajo complementario"
  };
  return labels[delivery] || "Sesión IBERFIT";
}

function isClientActionableSession(session = {}) {
  return Boolean(session?.id);
}

function firstActionableSession() {
  const sessions = state.data?.week?.sessions || [];
  return sessions.find(isClientActionableSession) || {};
}

function currentSession() {
  const sessions = state.data?.week?.sessions || [];
  if (!sessions.length) return {};
  return sessions.find(s => String(s.id) === String(state.selectedSessionId)) || firstActionableSession();
}

function openSession(sessionId) {
  const id = String(sessionId || "");
  const sessions = state.data?.week?.sessions || [];
  const target = sessions.find(s => String(s.id) === id);

  if (!target) {
    nav("week");
    return;
  }

  state.selectedSessionId = id;
  nav("session");
}

function routePrimaryCta() {
  nav("week");
}

function routeSessionNav() {
  const target = currentSession();
  if (target?.id) openSession(target.id);
  else nav("week");
}

function exerciseLine(ex = {}) {
  const dose = [ex.sets, ex.reps || ex.time].filter(Boolean).join(" · ");
  return `<li class="exercise-row">
    <div>
      <strong>${escapeHTML(ex.name || "Ejercicio")}</strong>
      ${ex.note ? `<p>${escapeHTML(ex.note)}</p>` : ""}
    </div>
    <div class="exercise-dose">
      ${dose ? `<span>${escapeHTML(dose)}</span>` : ""}
      ${ex.rest ? `<small>Descanso ${escapeHTML(ex.rest)}</small>` : ""}
    </div>
  </li>`;
}

function sessionBlocks(session = {}) {
  const blocks = Array.isArray(session.blocks) ? session.blocks : [];
  if (!blocks.length) {
    return `<section class="session-detail-card guided">
      <div class="card-title">Sesión guiada por IBERFIT</div>
      <p class="card-body">El contenido técnico se desarrolla dentro de la sesión. Usa este espacio para revisar el objetivo, registrar tu respuesta y comunicar cualquier molestia o contexto relevante.</p>
    </section>`;
  }

  return `<section class="session-detail-card">
    <div class="card-title">Estructura de la sesión</div>
    <div class="session-blocks">
      ${blocks.map((block, i) => `<article class="training-block">
        <div class="training-block-head">
          <span>Bloque ${i + 1}</span>
          <strong>${escapeHTML(block.title || "Trabajo principal")}</strong>
        </div>
        ${block.focus ? `<p class="block-focus">${escapeHTML(block.focus)}</p>` : ""}
        <ul class="exercise-list">
          ${(block.exercises || []).map(exerciseLine).join("")}
        </ul>
      </article>`).join("")}
    </div>
  </section>`;
}

/* ─── Status box ──────────────────────────────── */
function status(message, type = "info") {
  const box = $("#statusBox");
  box.textContent = typeof message === "string" ? message : JSON.stringify(message, null, 2);
  box.classList.remove("hidden", "error", "success");
  box.classList.toggle("error", type === "error");
  box.classList.toggle("success", type === "success");
}

function setAppVisible(show) {
  $("#accessScreen").classList.toggle("hidden", show);
  $("#clientApp").classList.toggle("hidden", !show);
}

/* ─── Auth ────────────────────────────────────── */
async function handleLogin(event) {
  event.preventDefault();
  const login = $("#login").value.trim();
  const password = $("#password").value.trim();

  if (!login || !password) return status("Ingresa usuario y contraseña.", "error");

  const btn = $('button[type="submit"]', $("#loginForm"));
  btn.textContent = "Validando...";
  btn.disabled = true;

  const res = await iberfitApi("login", { login, password });

  btn.textContent = "Entrar a mi espacio";
  btn.disabled = false;

  if (!res.ok) {
    clearSession();
    return status(res.message || "No pudimos validar tu acceso.", "error");
  }

  const session = saveSession(res.data);
  state.authenticated = true;
  state.clientId = session.clientId;
  state.sessionToken = session.sessionToken;
  state.data = res.data || mockData;

  localStorage.setItem(IBERFIT_CONFIG.loginStorageKey, login);
  $("#password").value = "";

  setAppVisible(true);
  updateShell();
  render();
}

async function checkConnection() {
  status("Verificando conexión con IBERFIT...");
  const res = await iberfitApi("serverProbe");
  status(res?.ok
    ? "Conexión establecida. Sistema IBERFIT operativo."
    : (res?.message || "No se pudo verificar la conexión."),
    res?.ok ? "success" : "error"
  );
}

function help() {
  const text = encodeURIComponent("Hola IBERFIT, necesito ayuda para acceder a mi Espacio IBERFIT.");
  window.open(`https://wa.me/${IBERFIT_CONFIG.whatsappNumber}?text=${text}`, "_blank", "noopener,noreferrer");
}

/* ─── Shell update (post-login) ──────────────── */
function updateShell() {
  const m = getModality();
  const name = state.data?.client?.name?.split(" ")[0] || "";

  // Modality badge in header
  const badge = $("#modalityBadge");
  if (badge) {
    badge.textContent = { PRESENCIAL: "Presencial", HIBRIDO: "Híbrida", ONLINE: "Online" }[m] || m;
    badge.className = `modality-badge ${m}`;
    badge.classList.remove("hidden");
  }

  // Sidebar updates
  const sidebarName = $("#sidebarClientName");
  if (sidebarName) sidebarName.textContent = name || "Espacio cliente";

  const sidebarMod = $("#sidebarModality");
  if (sidebarMod) sidebarMod.textContent = modalityLabel(m);
}

/* ─── Navigation ──────────────────────────────── */
function nav(screen) {
  state.activeScreen = screen;
  // Update bottom nav
  $$("#bottomNav .nav-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.screen === screen)
  );
  // Update sidebar
  $$("#sidebarNav .sidebar-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.screen === screen)
  );
  // Update header context
  const labels = { home: "Inicio", week: "Semana", session: "Sesión", process: "Proceso", channel: "Canal" };
  const ctx = $("#headerContext");
  if (ctx) ctx.textContent = labels[screen] || screen;

  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ══════════════════════════════════════════════
   SCREEN BUILDERS
   ══════════════════════════════════════════════ */

/* ─── Hero component ──────────────────────────── */
function hero(kicker, title, text) {
  return `<section class="hero">
    <p class="eyebrow">${escapeHTML(kicker)}</p>
    <h2>${escapeHTML(title)}</h2>
    <p class="hero-sub">${escapeHTML(text)}</p>
  </section>`;
}

/* ─── Metric card ─────────────────────────────── */
function metricCard(label, value, tag = "") {
  return `<div class="metric-card">
    <span class="metric-val">${escapeHTML(String(value))}</span>
    <span class="metric-lbl">${escapeHTML(label)}</span>
    ${tag ? `<em class="metric-tag">${escapeHTML(tag)}</em>` : ""}
  </div>`;
}

/* ─── Modality banner ─────────────────────────── */
function modalityBanner(modality) {
  const configs = {
    PRESENCIAL: {
      icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 20h5v-2a3 3 0 0 0-3-3h-1M9 20H4v-2a3 3 0 0 1 3-3h1m6-6a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"/></svg>`,
      text: "Modalidad Presencial · Sesión guiada por Carlos IBERFIT"
    },
    HIBRIDO: {
      icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3M12 8v8M9 11l3-3 3 3"/></svg>`,
      text: "Modalidad Híbrida · Sesión presencial + trabajo autónomo"
    },
    ONLINE: {
      icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
      text: "Modalidad Online · Sesiones prescritas para realizar en casa"
    }
  };
  const cfg = configs[modality] || configs.HIBRIDO;
  return `<div class="modality-banner ${modality}">${cfg.icon}<span>${cfg.text}</span></div>`;
}

/* ──────────────────────────────────────────────
   HOME SCREEN — adapts to modality
   ────────────────────────────────────────────── */
function home() {
  const d = state.data;
  const modality = getModality();
  const name = d.client?.name?.split(" ")[0] || "cliente";

  const ctaLabel = d.home?.ctaLabel || "Ver mi semana";
  const heroTexts = {
    PRESENCIAL: `Hola, ${name}. Tu próxima sesión presencial está programada.`,
    HIBRIDO:    `Hola, ${name}. Tu semana híbrida está activa.`,
    ONLINE:     `Hola, ${name}. Tu entrenamiento de la semana está listo.`
  };

  return `<div class="screen-grid screen-enter">
    ${hero("Espacio privado IBERFIT",
      `Hola, ${escapeHTML(name)}`,
      d.client.objective)}

    ${modalityBanner(modality)}

    <section class="card">
      <div class="card-title">Qué hacer ahora</div>
      <p class="card-body"><b>Foco:</b> ${escapeHTML(d.home.focus)}</p>
      <p class="card-body"><b>Próxima decisión:</b> ${escapeHTML(d.home.nextDecision)}</p>
      <button class="btn btn-primary" style="margin-top:14px" onclick="window.iberfit_primary_cta()">${escapeHTML(ctaLabel)}</button>
    </section>

    <section class="card">
      <div class="card-title">Método IBERFIT</div>
      <p class="card-body">No entregamos una rutina suelta. Evaluamos, interpretamos, planificamos y ajustamos con criterio basado en tu respuesta real.</p>
    </section>

    <p class="section-label">Tu semana en números</p>
    <div class="metrics-grid">
      ${metricCard("Semana", d.home.week, "Activa")}
      ${metricCard("IRI", d.home.iri, "Diagnóstico")}
      ${metricCard("Sesiones", d.home.sessions, "Publicadas")}
      ${metricCard("RPE", d.home.rpe || "—", "Promedio")}
    </div>
  </div>`;
}

/* ──────────────────────────────────────────────
   WEEK SCREEN — adapts to modality
   ────────────────────────────────────────────── */
function week() {
  const w = state.data.week;
  const modality = getModality();

  const modalityNote = w.modalityNote
    ? `<div class="card" style="margin-bottom:0;background:rgba(31,61,43,.04);border-color:var(--line)">
        <p class="card-body" style="color:var(--ink);font-weight:600">${escapeHTML(w.modalityNote)}</p>
      </div>`
    : "";

  return `<div class="screen-grid screen-enter">
    ${hero("Semana publicada", w.title, w.message)}

    ${modalityBanner(modality)}
    ${modalityNote}

    <p class="section-label">Sesiones de esta semana</p>
    ${w.sessions.map(s => {
      const actionable = isClientActionableSession(s);
      return `<article class="session-card session-card-action" role="button" tabindex="0" aria-label="Ver sesión" onclick="window.iberfit_open_session('${escapeHTML(s.id)}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();window.iberfit_open_session('${escapeHTML(s.id)}')}">
        <div class="session-card-top">
          <div>
            <div class="session-title">${escapeHTML(s.title)}</div>
            <p class="session-obj">${escapeHTML(s.objective)}</p>
          </div>
          <span class="session-arrow">${escapeHTML(sessionDeliveryLabel(s))}</span>
        </div>
        <div class="session-pills">
          <span class="pill pill-pub">${escapeHTML(s.state)}</span>
          ${sessionTypePill(s.type)}
          <span class="pill pill-dur">${escapeHTML(String(s.duration))} min</span>
        </div>
      </article>`;
    }).join("")}
  </div>`;
}

/* ──────────────────────────────────────────────
   SESSION + FEEDBACK SCREEN
   Contract: sessionId, rpe, fatiga, energia, molestia, comment
   IDs: fbRpe, fbFatiga, fbEnergia, fbMolestia, fbComment
   ────────────────────────────────────────────── */
function session() {
  const s = currentSession();
  const modality = getModality();
  const actionable = isClientActionableSession(s);

  return `<div class="screen-grid screen-enter">
    ${hero(sessionDeliveryKicker(s), s.title || "Sesión publicada", s.objective || "Revisa el objetivo y registra tu respuesta al finalizar.")}

    ${modalityBanner(modality)}

    <section class="session-overview">
      <div class="session-overview-main">
        <span class="section-label compact">Objetivo técnico</span>
        <p>${escapeHTML(s.observe || "Ejecuta con control técnico y registra tu respuesta real al terminar.")}</p>
      </div>
      <div class="session-overview-meta">
        ${sessionTypePill(s.type)}
        ${sessionDeliveryLabel(s) !== "Ver sesión" ? `<span class="pill pill-default">${escapeHTML(sessionDeliveryLabel(s))}</span>` : ""}
        <span class="pill pill-dur">${escapeHTML(String(s.duration || "—"))} min</span>
      </div>
    </section>

    ${sessionBlocks(s)}

    <section class="card">
      <div class="card-title">Registro post-sesión</div>
      <p class="card-body" style="margin-bottom:16px">Al terminar, registra tu respuesta. Este dato permite decidir si mantener, progresar o ajustar.</p>

      <div class="form-field">
        <label for="fbRpe">RPE · Esfuerzo percibido (1–10)</label>
        <div class="rpe-row">
          <input type="range" id="fbRpe" min="1" max="10" value="7"
                 oninput="document.getElementById('fbRpeVal').textContent=this.value">
          <span class="rpe-num" id="fbRpeVal">7</span>
        </div>
      </div>

      <div class="form-2col">
        <div class="form-field">
          <label for="fbFatiga">Fatiga</label>
          <input type="number" id="fbFatiga" min="1" max="10" value="5">
        </div>
        <div class="form-field">
          <label for="fbEnergia">Energía</label>
          <input type="number" id="fbEnergia" min="1" max="10" value="7">
        </div>
      </div>

      <div class="form-field">
        <label for="fbMolestia">Molestia física (1 = ninguna · 10 = alta)</label>
        <input type="number" id="fbMolestia" min="1" max="10" value="1">
      </div>

      <div class="form-field">
        <label for="fbComment">Comentario o contexto</label>
        <textarea id="fbComment" placeholder="Cómo fue la sesión, dudas técnicas o cualquier dato relevante..."></textarea>
      </div>

      <button class="btn btn-primary btn-full" id="feedbackBtn">Enviar registro</button>
      <div class="status-box hidden" id="feedbackStatus" style="margin-top:12px"></div>
    </section>
  </div>`;
}

/* ──────────────────────────────────────────────
   PROCESS + CHECK-IN SCREEN
   Contract: descanso, fatigaGeneral, estres, energiaGeneral,
             molestiaGeneral, observacion, semanaId
   IDs: ciDescanso, ciFatiga, ciEstres, ciEnergia, ciMolestia, ciObservacion
   ────────────────────────────────────────────── */
function process() {
  const p = state.data.process;
  const maxVal = Math.max(...p.trend);
  const bars = p.trend.map(v => {
    const pct = Math.round((v / maxVal) * 100);
    return `<span style="height:${pct}%" title="RPE ${v}"></span>`;
  }).join("");

  return `<div class="screen-grid screen-enter">
    ${hero("Proceso IBERFIT", "Seguimiento interpretado", p.interpretation)}

    <section class="card">
      <div class="card-title">Tendencia de esfuerzo · RPE</div>
      <p class="card-body">Evolución de las últimas sesiones registradas.</p>
      <div class="trend-bars">${bars}</div>
      <div class="trend-vals">${p.trend.join(" → ")}</div>
    </section>

    <section class="card">
      <div class="card-title">Lectura de tendencia</div>
      <p class="card-body">${escapeHTML(p.trendLabel || "Respuesta estable.")}</p>
    </section>

    <section class="checkin-card">
      <div class="card-title" style="margin-bottom:8px">Revisión semanal IBERFIT</div>
      <p class="checkin-intro">Este check-in permite a IBERFIT decidir si el plan se mantiene, progresa o se ajusta. No es una encuesta: es información para tomar mejores decisiones.</p>

      <div class="checkin-grid">
        <div class="form-field">
          <label for="ciDescanso">Descanso</label>
          <input type="number" id="ciDescanso" min="1" max="10" value="7">
        </div>
        <div class="form-field">
          <label for="ciFatiga">Fatiga general</label>
          <input type="number" id="ciFatiga" min="1" max="10" value="5">
        </div>
        <div class="form-field">
          <label for="ciEstres">Estrés</label>
          <input type="number" id="ciEstres" min="1" max="10" value="4">
        </div>
        <div class="form-field">
          <label for="ciEnergia">Energía general</label>
          <input type="number" id="ciEnergia" min="1" max="10" value="7">
        </div>
        <div class="form-field" style="grid-column:1/-1">
          <label for="ciMolestia">Molestia general</label>
          <input type="number" id="ciMolestia" min="1" max="10" value="1">
        </div>
      </div>

      <div class="form-field">
        <label for="ciObservacion">Observación de la semana</label>
        <textarea id="ciObservacion" placeholder="Adherencia, descanso, molestias, viajes, trabajo o cualquier contexto que pueda afectar el plan..."></textarea>
      </div>

      <button class="btn btn-primary btn-full" id="checkinBtn">Enviar revisión semanal</button>
      <div class="status-box hidden" id="checkinStatus" style="margin-top:12px"></div>
    </section>

    <p class="section-label">Métricas de proceso</p>
    <div class="metrics-grid">
      ${p.metrics.map(m => metricCard(m[0], m[1], m[2])).join("")}
    </div>
  </div>`;
}

/* ──────────────────────────────────────────────
   CHANNEL SCREEN
   ────────────────────────────────────────────── */
function channel() {
  const a = state.data.channel.actions;
  return `<div class="screen-grid screen-enter">
    ${hero("Canal IBERFIT", "Acompañamiento con contexto", "Cada mensaje lleva el contexto del seguimiento para que la respuesta sea precisa y útil.")}

    <p class="section-label">Acciones disponibles</p>
    ${a.map((x, idx) => `
      <div class="channel-item">
        <div class="card-title">${escapeHTML(x.title)}</div>
        <p class="card-body">${escapeHTML(x.text)}</p>
        <button class="btn-wa" data-wa-index="${idx}">
          ${WA_SVG}
          Enviar por WhatsApp
        </button>
      </div>`).join("")}
  </div>`;
}

/* ══════════════════════════════════════════════
   ACTIONS
   ══════════════════════════════════════════════ */

/* ─── submitFeedback — contract V6.7 preserved ─ */
async function sendFeedback() {
  const box = $("#feedbackStatus");
  const s = currentSession();

  const rpe      = Number($("#fbRpe").value);
  const fatiga   = Number($("#fbFatiga").value);
  const energia  = Number($("#fbEnergia").value);
  const molestia = Number($("#fbMolestia").value);
  const comment  = $("#fbComment").value.trim();

  if ([rpe, fatiga, energia, molestia].some(v => v < 1 || v > 10)) {
    box.classList.remove("hidden", "success");
    box.classList.add("error");
    box.textContent = "Todos los valores deben estar entre 1 y 10.";
    return;
  }

  const btn = $("#feedbackBtn");
  btn.textContent = "Enviando..."; btn.disabled = true;

  const res = await iberfitApi("submitFeedback", {
    sessionId: s.id, rpe, fatiga, energia, molestia, comment
  });

  btn.textContent = "Enviar registro"; btn.disabled = false;
  box.classList.remove("hidden", "error");

  if (!res.ok) {
    box.classList.add("error");
    box.textContent = res.message || "No se pudo enviar el registro.";
    return;
  }
  box.classList.add("success");
  box.textContent = "Registro enviado. IBERFIT revisará tu respuesta para ajustar si corresponde.";
}

/* ─── submitCheckin — contract V6.7 preserved ── */
async function sendCheckin() {
  const box = $("#checkinStatus");

  const descanso       = Number($("#ciDescanso").value);
  const fatigaGeneral  = Number($("#ciFatiga").value);
  const estres         = Number($("#ciEstres").value);
  const energiaGeneral = Number($("#ciEnergia").value);
  const molestiaGeneral= Number($("#ciMolestia").value);
  const observacion    = $("#ciObservacion").value.trim();
  const semanaId       = String(
    state.data.week?.id || state.data.week?.semanaId || state.data.home?.semanaId || ""
  ).trim();

  if (!semanaId) {
    box.classList.remove("hidden", "success"); box.classList.add("error");
    box.textContent = "No pudimos validar la semana activa para esta revisión.";
    return;
  }

  if ([descanso, fatigaGeneral, estres, energiaGeneral, molestiaGeneral].some(v => v < 1 || v > 10)) {
    box.classList.remove("hidden", "success"); box.classList.add("error");
    box.textContent = "Todos los valores deben estar entre 1 y 10.";
    return;
  }

  const btn = $("#checkinBtn");
  btn.textContent = "Enviando..."; btn.disabled = true;

  const res = await iberfitApi("submitCheckin", {
    descanso, fatigaGeneral, estres, energiaGeneral,
    molestiaGeneral, semanaId, observacion
  });

  btn.textContent = "Enviar revisión semanal"; btn.disabled = false;
  box.classList.remove("hidden", "error");

  if (!res.ok) {
    box.classList.add("error");
    box.textContent = res.message || "No se pudo enviar la revisión semanal.";
    return;
  }
  box.classList.add("success");
  box.textContent = "Revisión enviada. IBERFIT revisará tu contexto para ajustar el plan si corresponde.";
}

function openWhatsapp(index) {
  const action = state.data.channel.actions[Number(index)];
  const msg = `Hola IBERFIT, quiero ${action.title.toLowerCase()}.\n\nContexto: `;
  window.open(`https://wa.me/${IBERFIT_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
}

/* ══════════════════════════════════════════════
   RENDER
   ══════════════════════════════════════════════ */
function render() {
  const map = { home, week, session, process, channel };
  $("#screenContainer").innerHTML = map[state.activeScreen]?.() || "";

  // Bind session events
  const fb = $("#feedbackBtn");
  if (fb) fb.onclick = sendFeedback;

  const ci = $("#checkinBtn");
  if (ci) ci.onclick = sendCheckin;

  $$("[data-wa-index]").forEach(btn =>
    btn.addEventListener("click", () => openWhatsapp(btn.dataset.waIndex))
  );
}

/* ══════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════ */
function init() {
  const mode = currentApiMode();
  const savedLogin = localStorage.getItem(IBERFIT_CONFIG.loginStorageKey) || "";

  $("#login").value = mode === "mock" ? IBERFIT_CONFIG.demoLogin : savedLogin;
  if (mode === "mock") status("Modo QA activo · Contraseña demo: IBF-DEMO-0000");

  $("#loginForm").addEventListener("submit", handleLogin);
  $("#connectionCheckBtn").addEventListener("click", checkConnection);
  $("#helpBtn").addEventListener("click", help);

  // Bottom nav
  $$("#bottomNav .nav-btn").forEach(b =>
    b.addEventListener("click", () => b.dataset.screen === "session" ? routeSessionNav() : nav(b.dataset.screen))
  );

  // Sidebar nav
  $$("#sidebarNav .sidebar-btn").forEach(b =>
    b.addEventListener("click", () => b.dataset.screen === "session" ? routeSessionNav() : nav(b.dataset.screen))
  );

  // Expose nav helpers globally for controlled inline actions
  window.iberfit_nav = nav;
  window.iberfit_open_session = openSession;
  window.iberfit_primary_cta = routePrimaryCta;
  window.iberfit_route_session_nav = routeSessionNav;
  window.iberfit_first_actionable_session_id = () => firstActionableSession()?.id || "";

  render();
}

init();
