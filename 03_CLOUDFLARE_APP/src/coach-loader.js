/* IBERFIT V9.6.7 · Coach loader de integridad
   Objetivo: si coach.js no carga o no reemplaza el fallback, mostrar causa visible. */
const ROOT_ID = "coachRoot";
const START = Date.now();

function esc(v = "") {
  return String(v ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
}
function root() { return document.getElementById(ROOT_ID) || document.body; }
function showDiagnostic(title, detail, extra = "") {
  const r = root();
  r.innerHTML = `
    <main class="coach-login-screen coach-diagnostic-screen">
      <section class="coach-login-brand">
        <div class="coach-logo"><img src="/assets/iberfit-isotipo.png" alt="IBERFIT"></div>
        <h1>IBERFIT Coach OS</h1>
        <p>Modo diagnóstico de carga. La app no queda oculta: muestra el fallo real para corregirlo.</p>
        <div class="coach-login-points"><span>API</span><span>JS</span><span>Coach</span><span>QA</span></div>
      </section>
      <section class="coach-login-card">
        <h2>${esc(title)}</h2>
        <p>${esc(detail)}</p>
        ${extra ? `<pre style="white-space:pre-wrap;background:rgba(31,61,43,.08);padding:12px;border-radius:14px;max-height:260px;overflow:auto">${esc(extra)}</pre>` : ""}
        <div style="display:grid;gap:10px;margin-top:16px">
          <a class="btn btn-primary btn-full" href="/coach.html?v=9.6.7-${Date.now()}">Recargar sin caché</a>
          <a class="btn btn-ghost btn-full" href="/api/ibf" target="_blank" rel="noopener">Probar API</a>
          <a class="btn btn-ghost btn-full" href="/src/coach.js?v=9.6.7-integrity" target="_blank" rel="noopener">Ver coach.js</a>
        </div>
      </section>
    </main>`;
}

window.addEventListener("error", ev => {
  showDiagnostic("Error cargando Coach OS", ev.message || "Error no identificado", `${ev.filename || ""}:${ev.lineno || ""}:${ev.colno || ""}\n${ev.error?.stack || ""}`);
});
window.addEventListener("unhandledrejection", ev => {
  const reason = ev.reason;
  showDiagnostic("Promesa rechazada en Coach OS", reason?.message || String(reason || "Error no identificado"), reason?.stack || "");
});

setTimeout(() => {
  const fallback = document.querySelector(".coach-boot-fallback");
  if (fallback) {
    showDiagnostic(
      "Coach OS no terminó de iniciar",
      "coach.js fue solicitado, pero no sustituyó la pantalla de inicio. Revisa consola/network: puede ser caché, MIME, CSP, import fallido o backend incompatible.",
      `Tiempo: ${Date.now() - START} ms\nURL: ${location.href}\nUserAgent: ${navigator.userAgent}`
    );
  }
}, 7000);

try {
  const url = `/src/coach.js?v=9.6.7-integrity-${Date.now()}`;
  import(url)
    .then(() => {
      setTimeout(() => {
        const fallback = document.querySelector(".coach-boot-fallback");
        if (fallback) {
          showDiagnostic(
            "coach.js cargó, pero no renderizó",
            "El módulo se importó sin error fatal, pero el fallback inicial sigue visible. El problema está dentro del arranque/render de Coach OS.",
            `Módulo: ${url}\nTiempo: ${Date.now() - START} ms`
          );
        }
      }, 900);
    })
    .catch(err => {
      showDiagnostic("No se pudo cargar coach.js", err?.message || String(err), err?.stack || "");
    });
} catch (err) {
  showDiagnostic("Error iniciando loader Coach", err?.message || String(err), err?.stack || "");
}
