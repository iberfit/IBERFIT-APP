import { IBERFIT_CONFIG, resolveApiMode } from "./config.js";

const root = document.querySelector("#activationRoot");
const params = new URLSearchParams(window.location.search);
const token = params.get("token") || "";
let estado = { loading: true, error: "", tokenInfo: null, success: false, login: "" };

function html(v = "") {
  return String(v ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
}
async function api(action, payload = {}) {
  if (resolveApiMode() === "mock") {
    if (action === "validarTokenActivacion") return { ok: true, data: { nombre: "Cliente IBERFIT", email: "cl***@email.com", tipo: "ACTIVACION" } };
    if (action === "activarCuenta") return { ok: true, data: { activated: true, login: "cliente@email.com" } };
  }
  try {
    const res = await fetch(IBERFIT_CONFIG.apiPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ action, token, ...payload })
    });
    const text = await res.text();
    try { return JSON.parse(text); }
    catch { return { ok: false, message: text.slice(0, 300) }; }
  } catch {
    return { ok: false, message: "No pudimos conectar con IBERFIT." };
  }
}
function render() {
  const info = estado.tokenInfo || {};
  const title = info.tipo === "RECUPERACION" ? "Crear nueva contraseña" : "Activa tu espacio privado IBERFIT";
  root.innerHTML = `<main class="activation-screen">
    <section class="activation-brand">
      <div class="coach-logo"><img src="/assets/iberfit-isotipo.png" alt="IBERFIT"></div>
      <h1>IBERFIT</h1>
      <p>Acceso privado a tu planificación, sesiones y seguimiento técnico.</p>
    </section>
    <section class="activation-card">
      ${estado.loading ? `<h2>Validando enlace...</h2><p>Estamos verificando tu acceso.</p>` : estado.error ? errorHtml() : estado.success ? successHtml() : formHtml(title, info)}
    </section>
  </main>`;
  document.querySelector("#activationForm")?.addEventListener("submit", submit);
}
function errorHtml() {
  return `<h2>Enlace no disponible</h2><p>${html(estado.error)}</p><a class="btn btn-primary btn-full" href="/">Volver a IBERFIT</a>`;
}
function successHtml() {
  return `<h2>Acceso activado</h2><p>Tu contraseña quedó configurada de forma segura. Ya puedes entrar a tu espacio IBERFIT.</p><a class="btn btn-primary btn-full" href="/">Entrar a mi espacio</a>`;
}
function formHtml(title, info) {
  return `<h2>${html(title)}</h2><p>Hola ${html(info.nombre || "")}. Crea una contraseña segura para ${html(info.email || "tu acceso")}.</p>
    <form id="activationForm">
      <label>Nueva contraseña<input id="password" type="password" autocomplete="new-password" placeholder="Mínimo 8 caracteres"></label>
      <label>Confirmar contraseña<input id="confirmPassword" type="password" autocomplete="new-password" placeholder="Repite tu contraseña"></label>
      <button class="btn btn-primary btn-full" type="submit">Guardar contraseña</button>
      <small>Debe incluir al menos 8 caracteres, letras y números. IBERFIT no verá tu contraseña.</small>
    </form>`;
}
async function submit(e) {
  e.preventDefault();
  const password = document.querySelector("#password").value;
  const confirmPassword = document.querySelector("#confirmPassword").value;
  const res = await api("activarCuenta", { password, confirmPassword });
  if (!res.ok) { estado.error = res.message || "No se pudo activar el acceso."; render(); return; }
  estado.success = true;
  estado.login = res.data?.login || "";
  render();
}
async function init() {
  if (!token) { estado.loading = false; estado.error = "No hay un usuario asociado a este enlace. Contacte con IBERFIT para cualquier duda."; render(); return; }
  render();
  const res = await api("validarTokenActivacion");
  estado.loading = false;
  if (!res.ok) estado.error = res.message || "No hay un usuario asociado a este enlace. Contacte con IBERFIT para cualquier duda.";
  else estado.tokenInfo = res.data;
  render();
}
init();
