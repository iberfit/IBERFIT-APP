/**
 * IBERFIT V6.7 RC · Apps Script Backend
 * Función: backend/API seguro entre Cloudflare y Google Sheets.
 * La experiencia cliente vive en Cloudflare. Apps Script solo lee/escribe Sheets.
 */

const IBERFIT_V6 = {
  VERSION: 'V6_7_RC_WEEK_CHECKIN_CONTRACT',
  SESSION_TTL_SECONDS: 6 * 60 * 60,
  MAX_FAILED_ATTEMPTS: 8,
  SHEETS: {
    CLIENTES: '02_CLIENTES',
    ACCESOS: '03_ACCESOS',
    PLANES: '04_PLANES',
    SEMANAS: '05_SEMANAS',
    SESIONES: '06_SESIONES',
    FEEDBACK: '07_FEEDBACK',
    CHECKIN: '08_CHECKIN',
    IRI: '09_IRI_EVALUACION',
    LOG: '99_LOG'
  },
  SHEET_HEADERS: {
      "02_CLIENTES": [
          "CLIENTE_ID",
          "NOMBRE_VISIBLE",
          "EMAIL",
          "TELEFONO",
          "MODALIDAD",
          "OBJETIVO_PRINCIPAL",
          "ESTADO",
          "FECHA_ALTA",
          "OBSERVACIONES"
      ],
      "03_ACCESOS": [
          "ACCESO_ID",
          "CLIENTE_ID",
          "LOGIN",
          "PASSWORD_HASH",
          "SALT",
          "ESTADO_ACCESO",
          "FECHA_CREACION",
          "ULTIMO_ACCESO",
          "INTENTOS_FALLIDOS",
          "OBSERVACION"
      ],
      "04_PLANES": [
          "PLAN_ID",
          "CLIENTE_ID",
          "MODALIDAD",
          "ESTADO",
          "FECHA_INICIO",
          "PROXIMA_ACCION",
          "OBJETIVO_PLAN",
          "NOTAS_COACH"
      ],
      "05_SEMANAS": [
          "SEMANA_ID",
          "CLIENTE_ID",
          "SEMANA_NUMERO",
          "TITULO_SEMANA",
          "FOCO_SEMANA",
          "MENSAJE_IBERFIT",
          "ESTADO_SEMANA",
          "FECHA_INICIO",
          "FECHA_FIN"
      ],
      "06_SESIONES": [
          "SESION_ID",
          "SEMANA_ID",
          "CLIENTE_ID",
          "TITULO_SESION",
          "TIPO_SESION",
          "DURACION_ESTIMADA_MIN",
          "ESTADO_SESION",
          "OBJETIVO_SESION",
          "CRITERIO_COACH",
          "QUE_OBSERVAR",
          "COMO_AJUSTAR",
          "QUE_REPORTAR",
          "ORDEN"
      ],
      "07_FEEDBACK": [
          "FEEDBACK_ID",
          "FECHA_ENVIO",
          "CLIENTE_ID",
          "SESION_ID",
          "RPE",
          "FATIGA",
          "ENERGIA",
          "MOLESTIA",
          "COMENTARIO_CLIENTE",
          "PRIORIDAD",
          "DECISION_IBERFIT",
          "REVISADO_POR",
          "FECHA_REVISION"
      ],
      "08_CHECKIN": [
          "CHECKIN_ID",
          "FECHA_ENVIO",
          "CLIENTE_ID",
          "SEMANA_ID",
          "DESCANSO",
          "FATIGA_GENERAL",
          "ESTRES",
          "ENERGIA_GENERAL",
          "MOLESTIA_GENERAL",
          "PESO",
          "OBSERVACION_CLIENTE",
          "ESTADO_REVISION",
          "DECISION_IBERFIT"
      ],
      "09_IRI_EVALUACION": [
          "IRI_ID",
          "FECHA_EVALUACION",
          "CLIENTE_ID",
          "IRI_TOTAL",
          "CLASIFICACION",
          "RECOMENDACION",
          "CONTEXTO",
          "COMPOSICION",
          "MOVILIDAD",
          "FUERZA",
          "METABOLICO",
          "LIMITADORES"
      ],
      "99_LOG": [
          "LOG_ID",
          "FECHA_HORA",
          "ORIGEN",
          "ACCION",
          "USUARIO",
          "CLIENTE_ID",
          "ESTADO",
          "DETALLE"
      ]
  }
};

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    requireWorkerSecret_(payload);

    const action = String(payload.action || '');

    if (action === 'serverProbe') return json_(serverProbe_());
    if (action === 'login') return json_(login_(payload));

    const auth = requireSession_(payload);
    if (action === 'getHome') return json_({ ok: true, status: 'OK', data: buildClientData_(auth.clientId, auth.sessionToken) });
    if (action === 'submitFeedback') return json_(submitFeedback_(payload, auth));
    if (action === 'submitCheckin') return json_(submitCheckin_(payload, auth));

    return json_({ ok: false, status: 'UNKNOWN_ACTION', message: 'Acción no reconocida.' });
  } catch (err) {
    return json_({ ok: false, status: 'SERVER_ERROR', message: safeMessage_(err) });
  }
}

function doGet() {
  return json_({ ok: true, service: 'IBERFIT V6.7 Apps Script Backend', version: IBERFIT_V6.VERSION });
}

function ss_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function sheet_(name) {
  const sh = ss_().getSheetByName(name);
  if (!sh) throw new Error('Falta hoja: ' + name);
  return sh;
}

function headers_(sh) {
  return sh.getRange(5, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
}

function getRows_(name) {
  const sh = sheet_(name);
  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (lastRow < 6 || lastCol < 1) return [];
  const headers = sh.getRange(5, 1, 1, lastCol).getValues()[0].map(String);
  const values = sh.getRange(6, 1, lastRow - 5, lastCol).getValues();
  return values.map((row, idx) => {
    const o = { __rowNumber: idx + 6 };
    headers.forEach((h, i) => o[h] = row[i]);
    return o;
  });
}

function appendObject_(sheetName, obj) {
  const lock = LockService.getScriptLock();
  lock.waitLock(8000);
  try {
    const sh = sheet_(sheetName);
    const headers = headers_(sh);
    const row = headers.map(h => obj[h] !== undefined ? obj[h] : '');
    sh.appendRow(row);
  } finally {
    lock.releaseLock();
  }
}

function updateRowByNumber_(sheetName, rowNumber, updates) {
  const lock = LockService.getScriptLock();
  lock.waitLock(8000);
  try {
    const sh = sheet_(sheetName);
    const headers = headers_(sh);
    const row = sh.getRange(rowNumber, 1, 1, headers.length).getValues()[0];
    headers.forEach((h, i) => {
      if (updates[h] !== undefined) row[i] = updates[h];
    });
    sh.getRange(rowNumber, 1, 1, headers.length).setValues([row]);
  } finally {
    lock.releaseLock();
  }
}

function findBy_(rows, key, value) {
  return rows.find(r => String(r[key]).trim().toLowerCase() === String(value).trim().toLowerCase());
}

function requireWorkerSecret_(payload) {
  const expected = PropertiesService.getScriptProperties().getProperty('IBERFIT_WORKER_SECRET');
  if (!expected) {
    throw new Error('Falta configurar IBERFIT_WORKER_SECRET en Script Properties.');
  }
  if (String(payload.workerSecret || '') !== expected) {
    throw new Error('Solicitud no autorizada.');
  }
}

function login_(payload) {
  const login = String(payload.login || '').trim().toLowerCase();
  const password = String(payload.password || '').trim();

  if (!login || !password) {
    return { ok: false, status: 'BAD_REQUEST', message: 'Ingresa usuario y contraseña.' };
  }

  const clientes = getRows_(IBERFIT_V6.SHEETS.CLIENTES);
  const cliente = clientes.find(c =>
    String(c.EMAIL || '').trim().toLowerCase() === login ||
    String(c.TELEFONO || '').replace(/\D/g, '') === login.replace(/\D/g, '')
  );

  if (!cliente || String(cliente.ESTADO) !== 'ACTIVO') {
    return { ok: false, status: 'INVALID_LOGIN', message: 'No pudimos validar tu usuario o contraseña.' };
  }

  const access = findBy_(getRows_(IBERFIT_V6.SHEETS.ACCESOS), 'CLIENTE_ID', cliente.CLIENTE_ID);
  if (!access || String(access.ESTADO_ACCESO) !== 'ACTIVO') {
    return { ok: false, status: 'ACCESS_NOT_READY', message: 'Tu acceso aún no está activo. Contacta a IBERFIT.' };
  }

  const failed = Number(access.INTENTOS_FALLIDOS || 0);
  if (failed >= IBERFIT_V6.MAX_FAILED_ATTEMPTS) {
    return { ok: false, status: 'ACCESS_BLOCKED', message: 'Acceso bloqueado temporalmente. Contacta a IBERFIT.' };
  }

  const expectedHash = String(access.PASSWORD_HASH || '');
  const salt = String(access.SALT || '');
  const givenHash = hashPassword_(password, salt);

  if (!expectedHash || !salt || givenHash !== expectedHash) {
    updateRowByNumber_(IBERFIT_V6.SHEETS.ACCESOS, access.__rowNumber, { INTENTOS_FALLIDOS: failed + 1 });
    log_('LOGIN_FAIL', cliente.CLIENTE_ID, 'FAIL', 'Intento fallido');
    return { ok: false, status: 'INVALID_LOGIN', message: 'No pudimos validar tu usuario o contraseña.' };
  }

  const session = createSession_(cliente.CLIENTE_ID);
  updateRowByNumber_(IBERFIT_V6.SHEETS.ACCESOS, access.__rowNumber, {
    ULTIMO_ACCESO: new Date(),
    INTENTOS_FALLIDOS: 0
  });

  log_('LOGIN', cliente.CLIENTE_ID, 'OK', 'Acceso validado');
  return {
    ok: true,
    status: 'OK',
    data: buildClientData_(cliente.CLIENTE_ID, session.token, session.expiresAt)
  };
}

function createSession_(clientId) {
  const token = Utilities.getUuid() + Utilities.getUuid();
  const expiresAtDate = new Date(Date.now() + IBERFIT_V6.SESSION_TTL_SECONDS * 1000);
  CacheService.getScriptCache().put('SESSION_' + token, JSON.stringify({
    clientId: clientId,
    expiresAt: expiresAtDate.toISOString()
  }), IBERFIT_V6.SESSION_TTL_SECONDS);
  return { token: token, expiresAt: expiresAtDate.toISOString() };
}

function requireSession_(payload) {
  const token = String(payload.sessionToken || '').trim();
  const clientId = String(payload.clientId || '').trim();

  if (!token || !clientId) {
    throw new Error('Sesión no válida.');
  }

  const raw = CacheService.getScriptCache().get('SESSION_' + token);
  if (!raw) {
    throw new Error('Sesión expirada. Ingresa nuevamente.');
  }

  const session = JSON.parse(raw);
  if (String(session.clientId) !== clientId) {
    throw new Error('Sesión no autorizada.');
  }

  return { clientId: clientId, sessionToken: token };
}

function buildClientData_(clienteId, sessionToken, expiresAt) {
  const cliente = findBy_(getRows_(IBERFIT_V6.SHEETS.CLIENTES), 'CLIENTE_ID', clienteId) || {};
  const plan = getRows_(IBERFIT_V6.SHEETS.PLANES).find(p => String(p.CLIENTE_ID) === clienteId && String(p.ESTADO) === 'ACTIVO') || {};
  const semana = getRows_(IBERFIT_V6.SHEETS.SEMANAS).find(w => String(w.CLIENTE_ID) === clienteId && String(w.ESTADO_SEMANA) === 'PUBLICADA') || {};
  const semanaId = String(semana.SEMANA_ID || '').trim();
  const sesiones = getRows_(IBERFIT_V6.SHEETS.SESIONES).filter(s =>
    String(s.CLIENTE_ID) === clienteId &&
    String(s.ESTADO_SESION) !== 'BORRADOR' &&
    (!semanaId || String(s.SEMANA_ID) === semanaId)
  );
  const iri = getRows_(IBERFIT_V6.SHEETS.IRI).filter(i => String(i.CLIENTE_ID) === clienteId).pop() || {};
  const feedbacks = getRows_(IBERFIT_V6.SHEETS.FEEDBACK).filter(f => String(f.CLIENTE_ID) === clienteId);
  const rpes = feedbacks.map(f => Number(f.RPE)).filter(n => n >= 1 && n <= 10);
  const rpeAvg = rpes.length ? Math.round((rpes.reduce((a,b)=>a+b,0) / rpes.length) * 10) / 10 : '';

  return {
    sessionToken: sessionToken || '',
    expiresAt: expiresAt || '',
    client: {
      id: cliente.CLIENTE_ID,
      name: cliente.NOMBRE_VISIBLE,
      modality: cliente.MODALIDAD,
      objective: cliente.OBJETIVO_PRINCIPAL
    },
    home: {
      week: semana.SEMANA_NUMERO || '',
      semanaId: semanaId,
      iri: iri.IRI_TOTAL || '',
      sessions: sesiones.length,
      rpe: rpeAvg,
      focus: semana.FOCO_SEMANA || plan.PROXIMA_ACCION || '',
      nextDecision: plan.PROXIMA_ACCION || ''
    },
    week: {
      id: semanaId,
      title: semana.TITULO_SEMANA || '',
      message: semana.MENSAJE_IBERFIT || '',
      sessions: sesiones.map(s => ({
        id: s.SESION_ID,
        title: s.TITULO_SESION,
        type: s.TIPO_SESION,
        duration: s.DURACION_ESTIMADA_MIN,
        state: s.ESTADO_SESION,
        objective: s.OBJETIVO_SESION,
        criterion: s.CRITERIO_COACH,
        observe: s.QUE_OBSERVAR,
        adjust: s.COMO_AJUSTAR,
        report: s.QUE_REPORTAR
      }))
    },
    process: {
      interpretation: iri.RECOMENDACION || 'IBERFIT revisará tu evolución con criterio.',
      trend: rpes.length ? rpes.slice(-6) : [6.8, 7.1, 7.0, 7.3, 7.0],
      metrics: [
        ['IRI', iri.IRI_TOTAL || '—', iri.CLASIFICACION || 'Proceso'],
        ['Sesiones', String(sesiones.length), 'Publicadas'],
        ['Modalidad', cliente.MODALIDAD || '—', 'Plan'],
        ['Alertas', String(feedbacks.filter(f => String(f.PRIORIDAD) === 'ALTA').length), 'Actual']
      ]
    },
    channel: {
      actions: [
        { title: 'Consultar sesión', text: 'Enviar una duda con contexto de la sesión.' },
        { title: 'Reportar molestia', text: 'Avisar si aparece una molestia relevante.' },
        { title: 'Enviar actualización', text: 'Compartir información que pueda afectar el plan.' }
      ]
    }
  };
}

function submitFeedback_(payload, auth) {
  const sessionId = String(payload.sessionId || '').trim();
  if (!sessionId) return { ok: false, status: 'BAD_REQUEST', message: 'Falta sesión.' };

  const session = getRows_(IBERFIT_V6.SHEETS.SESIONES).find(s =>
    String(s.SESION_ID) === sessionId &&
    String(s.CLIENTE_ID) === auth.clientId &&
    String(s.ESTADO_SESION) !== 'BORRADOR'
  );

  if (!session) {
    return { ok: false, status: 'FORBIDDEN', message: 'No pudimos validar esta sesión para tu acceso.' };
  }

  const rpe = validateScale_(payload.rpe, 'RPE');
  const fatiga = validateScale_(payload.fatiga, 'Fatiga');
  const energia = validateScale_(payload.energia, 'Energía');
  const molestia = validateScale_(payload.molestia, 'Molestia');
  const id = 'FB-' + Utilities.getUuid().slice(0, 8).toUpperCase();

  appendObject_(IBERFIT_V6.SHEETS.FEEDBACK, {
    FEEDBACK_ID: id,
    FECHA_ENVIO: new Date(),
    CLIENTE_ID: auth.clientId,
    SESION_ID: sessionId,
    RPE: rpe,
    FATIGA: fatiga,
    ENERGIA: energia,
    MOLESTIA: molestia,
    COMENTARIO_CLIENTE: sanitizeText_(payload.comment || ''),
    PRIORIDAD: molestia >= 7 || rpe >= 10 ? 'ALTA' : 'MEDIA',
    DECISION_IBERFIT: '',
    REVISADO_POR: '',
    FECHA_REVISION: ''
  });

  log_('SUBMIT_FEEDBACK', auth.clientId, 'OK', id);
  return { ok: true, status: 'OK', data: { saved: true, feedbackId: id } };
}

function submitCheckin_(payload, auth) {
  const id = 'CHK-' + Utilities.getUuid().slice(0, 8).toUpperCase();
  const semanaId = String(payload.semanaId || '').trim();

  if (!semanaId) {
    return { ok: false, status: 'BAD_REQUEST', message: 'No pudimos validar la semana activa para esta revisión.' };
  }

  const semana = getRows_(IBERFIT_V6.SHEETS.SEMANAS).find(w =>
    String(w.SEMANA_ID) === semanaId &&
    String(w.CLIENTE_ID) === auth.clientId &&
    String(w.ESTADO_SEMANA) === 'PUBLICADA'
  );

  if (!semana) {
    return { ok: false, status: 'FORBIDDEN', message: 'No pudimos validar esta semana para tu acceso.' };
  }

  const descanso = validateScale_(payload.descanso, 'Descanso');
  const fatiga = validateScale_(payload.fatigaGeneral, 'Fatiga general');
  const estres = validateScale_(payload.estres, 'Estrés');
  const energia = validateScale_(payload.energiaGeneral, 'Energía general');
  const molestia = validateScale_(payload.molestiaGeneral, 'Molestia general');

  appendObject_(IBERFIT_V6.SHEETS.CHECKIN, {
    CHECKIN_ID: id,
    FECHA_ENVIO: new Date(),
    CLIENTE_ID: auth.clientId,
    SEMANA_ID: semanaId,
    DESCANSO: descanso,
    FATIGA_GENERAL: fatiga,
    ESTRES: estres,
    ENERGIA_GENERAL: energia,
    MOLESTIA_GENERAL: molestia,
    PESO: sanitizeText_(payload.peso || ''),
    OBSERVACION_CLIENTE: sanitizeText_(payload.observacion || ''),
    ESTADO_REVISION: 'PENDIENTE_REVISION',
    DECISION_IBERFIT: ''
  });

  log_('SUBMIT_CHECKIN', auth.clientId, 'OK', id);
  return { ok: true, status: 'OK', data: { saved: true, checkinId: id } };
}

function serverProbe_() {
  const required = Object.keys(IBERFIT_V6.SHEETS).map(k => IBERFIT_V6.SHEETS[k]);
  const result = { ok: true, version: IBERFIT_V6.VERSION, spreadsheet: ss_().getName(), sheets: {} };

  required.forEach(name => {
    const sh = ss_().getSheetByName(name);
    const requiredHeaders = IBERFIT_V6.SHEET_HEADERS[name] || [];
    let headers = [];
    let missingHeaders = requiredHeaders.slice();

    if (sh && sh.getLastColumn() > 0) {
      try {
        headers = headers_(sh).map(String).map(h => h.trim()).filter(Boolean);
        missingHeaders = requiredHeaders.filter(h => headers.indexOf(h) === -1);
      } catch (e) {
        missingHeaders = requiredHeaders.slice();
      }
    }

    const sheetOk = !!sh && missingHeaders.length === 0;
    result.sheets[name] = {
      ok: sheetOk,
      rows: sh ? sh.getLastRow() : 0,
      cols: sh ? sh.getLastColumn() : 0,
      requiredHeaders: requiredHeaders.length,
      detectedHeaders: headers.length,
      missingHeaders: missingHeaders
    };
    if (!sheetOk) result.ok = false;
  });

  return { ok: result.ok, status: result.ok ? 'OK' : 'SHEET_CONTRACT_FAIL', data: result };
}

function adminSetupWorkerSecret(secret) {
  const finalSecret = secret || ('IBF-WORKER-' + Utilities.getUuid());
  PropertiesService.getScriptProperties().setProperty('IBERFIT_WORKER_SECRET', finalSecret);
  return {
    ok: true,
    workerSecret: finalSecret,
    next: 'Copiar este valor en Cloudflare como IBERFIT_WORKER_SECRET. No compartir públicamente.'
  };
}

function adminCreatePassword_APPCLI0001() {
  return adminCreatePasswordForClient_('APPCLI-0001', 'alejandro.demo@email.com');
}

function adminCreatePasswordForClient_(clientId, login) {
  const password = 'IBF-' + Utilities.getUuid().slice(0, 4).toUpperCase() + '-' + Utilities.getUuid().slice(0, 4).toUpperCase();
  const salt = Utilities.getUuid();
  const hash = hashPassword_(password, salt);

  const rows = getRows_(IBERFIT_V6.SHEETS.ACCESOS);
  const row = findBy_(rows, 'CLIENTE_ID', clientId);
  if (!row) throw new Error('No existe fila de acceso para cliente: ' + clientId);

  updateRowByNumber_(IBERFIT_V6.SHEETS.ACCESOS, row.__rowNumber, {
    LOGIN: login || row.LOGIN,
    PASSWORD_HASH: hash,
    SALT: salt,
    ESTADO_ACCESO: 'ACTIVO',
    FECHA_CREACION: new Date(),
    INTENTOS_FALLIDOS: 0,
    OBSERVACION: 'Acceso generado V6.7'
  });

  return {
    ok: true,
    clienteId: clientId,
    usuario: login || row.LOGIN,
    password: password,
    warning: 'Guardar fuera del chat. La contraseña no se almacena en texto plano.'
  };
}

function qaServerProbeWithSecret(secret) {
  const props = PropertiesService.getScriptProperties();
  const old = props.getProperty('IBERFIT_WORKER_SECRET');
  const hadOld = old !== null && old !== undefined;

  try {
    if (secret) props.setProperty('IBERFIT_WORKER_SECRET', secret);
    return serverProbe_();
  } finally {
    if (secret) {
      if (hadOld) {
        props.setProperty('IBERFIT_WORKER_SECRET', old);
      } else {
        props.deleteProperty('IBERFIT_WORKER_SECRET');
      }
    }
  }
}

function qaCreateDemoPassword() {
  return adminCreatePassword_APPCLI0001();
}

function hashPassword_(password, salt) {
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + '|' + password, Utilities.Charset.UTF_8);
  return Utilities.base64Encode(raw);
}

function validateScale_(value, label) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1 || n > 10) throw new Error(label + ' debe estar entre 1 y 10.');
  return n;
}

function sanitizeText_(value) {
  return String(value || '').replace(/[<>]/g, '').slice(0, 1000);
}

function log_(action, clienteId, estado, detalle) {
  try {
    appendObject_(IBERFIT_V6.SHEETS.LOG, {
      LOG_ID: 'LOG-' + Utilities.getUuid().slice(0, 8).toUpperCase(),
      FECHA_HORA: new Date(),
      ORIGEN: 'APPS_SCRIPT',
      ACCION: action,
      USUARIO: 'IBERFIT_BACKEND',
      CLIENTE_ID: clienteId || '',
      ESTADO: estado || '',
      DETALLE: detalle || ''
    });
  } catch (e) {}
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function safeMessage_(err) {
  return String(err && err.message ? err.message : err).slice(0, 500);
}
