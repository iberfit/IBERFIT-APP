export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const configError = validateEnv(env);
    if (configError) return json(configError, 500);

    const payload = await request.json();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort("Apps Script timeout"), 12000);

    const response = await fetch(env.APPS_SCRIPT_WEBAPP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        workerSecret: env.IBERFIT_WORKER_SECRET
      }),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); }
    catch {
      data = {
        ok: false,
        status: "UPSTREAM_PARSE_ERROR",
        message: "Apps Script devolvió una respuesta no JSON.",
        debug: text.slice(0, 300)
      };
    }

    return json(data, response.ok ? 200 : 502);
  } catch (error) {
    const isAbort = String(error?.name || error).includes("Abort") || String(error).includes("timeout");
    return json({
      ok: false,
      status: isAbort ? "UPSTREAM_TIMEOUT" : "WORKER_ERROR",
      message: isAbort ? "La conexión con IBERFIT tardó más de lo esperado." : "No pudimos conectar con IBERFIT en este momento.",
      debug: error.message || String(error)
    }, isAbort ? 504 : 500);
  }
}

export async function onRequestGet(context) {
  const configError = validateEnv(context.env);
  if (configError) return json({
    ok: false,
    service: "IBERFIT Cloudflare API",
    status: "config_error",
    configError
  }, 500);

  return json({
    ok: true,
    service: "IBERFIT Cloudflare API",
    status: "ready",
    mode: "real-ready"
  });
}

function validateEnv(env) {
  if (!env.APPS_SCRIPT_WEBAPP_URL) {
    return { ok: false, status: "CONFIG_ERROR", message: "Falta APPS_SCRIPT_WEBAPP_URL en Cloudflare." };
  }
  if (!env.IBERFIT_WORKER_SECRET) {
    return { ok: false, status: "CONFIG_ERROR", message: "Falta IBERFIT_WORKER_SECRET en Cloudflare." };
  }
  return null;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
