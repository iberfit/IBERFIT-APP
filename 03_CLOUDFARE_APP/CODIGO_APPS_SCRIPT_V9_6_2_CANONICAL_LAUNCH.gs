/**
 * IBERFIT V9.6 · IA Planificador de sesiones + Gemini/local
 * Backend seguro: Cloudflare Pages Function -> Apps Script -> Google Sheets.
 * Principios: cliente elige contraseña, tokens de un solo uso, auditoría, estados claros, interfaz en español.
 */

const IBERFIT = {
  VERSION: 'V9_6_2_CANONICAL_LAUNCH',
  SESSION_TTL_SECONDS: 6 * 60 * 60,
  COACH_TTL_SECONDS: 6 * 60 * 60,
  ACTIVATION_TTL_HOURS: 72,
  RESET_TTL_HOURS: 24,
  MAX_FAILED_ATTEMPTS: 8,
  COACH_BLOCK_MINUTES: 30,
  SHEETS: {
    CLIENTES: '01 Clientes',
    ACCESOS: '21 Accesos',
    PLANES: '03 Planes',
    SEMANAS: '04 Semanas',
    SESIONES: '05 Sesiones',
    FEEDBACK: '09 Feedback',
    CHECKIN: '10 Check-in',
    IRI: '11 Diagnóstico IRI',
    BIOIMPEDANCIA: '12 Bioimpedancia',
    TOKENS: '22 Activaciones',
    SESIONES_ACTIVAS: '23 Sesiones Activas',
    PLANTILLAS_SEMANA: '17 Plantillas Semana',
    PLANTILLAS_SESION: '18 Plantillas Sesión',
    EJERCICIOS: '15 Biblioteca Ejercicios',
    BLOQUES: '19 Bloques Sesión',
    ALERTAS: '20 Alertas',
    CARGAS: '08 Histórico de Cargas',
    INFORMES: '13 Informes',
    MULTIMEDIA: '16 Multimedia Ejercicios',
    DECISIONES: '24 Decisiones IBERFIT',
    CONFIG: '25 Configuración',
    PANEL: '00 Panel',
    FICHA_CLIENTE: '02 Ficha Cliente',
    SESION_PRESENCIAL: '06 Sesión Presencial',
    CARGAS_UI: '07 Cargas',
    GRAFICAS: '14 Gráficas',
    LISTAS: '26 Listas',
    LOG: '99 Registro'
  },
  HEADERS: {
    '01 Clientes': [
      'CLIENTE_ID','NOMBRE_VISIBLE','EMAIL','TELEFONO','MODALIDAD','OBJETIVO_PRINCIPAL','ESTADO','FECHA_ALTA','FECHA_ACTUALIZACION','OBSERVACIONES'
    ],
    '21 Accesos': [
      'ACCESO_ID','CLIENTE_ID','LOGIN','ROL_ACCESO','HASH_CONTRASENA','SAL_CONTRASENA','PASSWORD_HASH','SALT','ESTADO_ACCESO','FECHA_CREACION','ULTIMO_ACCESO','ULTIMO_CAMBIO_CONTRASENA','INTENTOS_FALLIDOS','OBSERVACION'
    ],
    '03 Planes': [
      'PLAN_ID','CLIENTE_ID','MODALIDAD','ESTADO','FECHA_INICIO','PROXIMA_ACCION','OBJETIVO_PLAN','NOTAS_COACH'
    ],
    '04 Semanas': [
      'SEMANA_ID','CLIENTE_ID','SEMANA_NUMERO','TITULO_SEMANA','FOCO_SEMANA','MENSAJE_IBERFIT','ESTADO_SEMANA','FECHA_INICIO','FECHA_FIN','CREADO_EN','ACTUALIZADO_EN','PUBLICADO_EN'
    ],
    '05 Sesiones': [
      'SESION_ID','SEMANA_ID','CLIENTE_ID','MODALIDAD_SESION','TITULO_SESION','TIPO_SESION','DURACION_ESTIMADA_MIN','ESTADO_SESION','OBJETIVO_SESION','CRITERIO_COACH','PREPARACION','BLOQUE_PRINCIPAL','VUELTA_CALMA','INDICACIONES','MATERIAL_NECESARIO','ESTRUCTURA_SESION','ESTRUCTURA_JSON','QUE_OBSERVAR','COMO_AJUSTAR','QUE_REPORTAR','ORDEN','CREADO_EN','ACTUALIZADO_EN','PUBLICADO_EN'
    ],
    '09 Feedback': [
      'FEEDBACK_ID','FECHA_ENVIO','CLIENTE_ID','SESION_ID','REALIZACION','RPE','FATIGA','ENERGIA','MOLESTIA','DIFICULTAD_TECNICA','COMENTARIO_CLIENTE','PRIORIDAD','DECISION_IBERFIT','REVISADO_POR','FECHA_REVISION'
    ],
    '10 Check-in': [
      'CHECKIN_ID','FECHA_ENVIO','CLIENTE_ID','SEMANA_ID','DESCANSO','FATIGA_GENERAL','ESTRES','ENERGIA_GENERAL','MOLESTIA_GENERAL','SESIONES_COMPLETADAS','PESO','OBSERVACION_CLIENTE','ESTADO_REVISION','DECISION_IBERFIT','REVISADO_POR','FECHA_REVISION'
    ],
    '11 Diagnóstico IRI': [
      'IRI_ID','FECHA_EVALUACION','CLIENTE_ID','IRI_TOTAL','CLASIFICACION','RECOMENDACION','CONTEXTO','BIOIMPEDANCIA','COMPOSICION','MOVILIDAD','FUERZA','METABOLICO','LIMITADORES','DECISION_IBERFIT','INFORME_ESTADO'
    ],
    '12 Bioimpedancia': [
      'BIO_ID','FECHA_MEDICION','CLIENTE_ID','PESO','GRASA_PORCENTAJE','MASA_MUSCULAR','MASA_GRASA','AGUA_PORCENTAJE','GRASA_VISCERAL','IMC','FUENTE','OBSERVACIONES','CREADO_POR','ACTUALIZADO_EN'
    ],
    '22 Activaciones': [
      'TOKEN_ID','CLIENTE_ID','ACCESO_ID','TIPO_TOKEN','TOKEN_HASH','ESTADO_TOKEN','FECHA_CREACION','FECHA_EXPIRACION','FECHA_USO','CREADO_POR','OBSERVACION'
    ],
    '23 Sesiones Activas': [
      'SESION_ACCESO_ID','CLIENTE_ID','ACCESO_ID','TOKEN_HASH','ESTADO_SESION_ACCESO','FECHA_CREACION','FECHA_EXPIRACION','FECHA_REVOCACION','REVOCADO_POR','ORIGEN','OBSERVACION'
    ],
    '17 Plantillas Semana': [
      'PLANTILLA_SEMANA_ID','NOMBRE_PLANTILLA','MODALIDAD','OBJETIVO','NIVEL','ESTADO','DESCRIPCION','CREADO_EN','ACTUALIZADO_EN'
    ],
    '18 Plantillas Sesión': [
      'PLANTILLA_SESION_ID','NOMBRE_PLANTILLA','TIPO_SESION','MODALIDAD_SESION','DURACION_ESTIMADA_MIN','OBJETIVO_SESION','CRITERIO_COACH','PREPARACION','BLOQUE_PRINCIPAL','VUELTA_CALMA','INDICACIONES','MATERIAL_NECESARIO','ESTADO','CREADO_EN','ACTUALIZADO_EN'
    ],
    '15 Biblioteca Ejercicios': [
      'EJERCICIO_ID','NOMBRE_EJERCICIO','PATRON','ZONA','MATERIAL','NIVEL','OBJETIVO','INDICACIONES_TECNICAS','ERRORES_COMUNES','REGRESION','PROGRESION','ESTADO','ACTUALIZADO_EN'
    ],
    '19 Bloques Sesión': [
      'BLOQUE_ID','SESION_ID','ORDEN_BLOQUE','NOMBRE_BLOQUE','OBJETIVO_BLOQUE','EJERCICIO_ID','EJERCICIO_TEXTO','SERIES','REPETICIONES','TIEMPO','CARGA_REFERENCIA','DESCANSO','RPE_OBJETIVO','INDICACIONES','ORDEN_EJERCICIO'
    ],
    '20 Alertas': [
      'ALERTA_ID','FECHA_CREACION','CLIENTE_ID','ORIGEN','PRIORIDAD','ESTADO_ALERTA','MENSAJE','DECISION_IBERFIT','RESUELTO_POR','FECHA_RESOLUCION'
    ],
    '08 Histórico de Cargas': [
      'CARGA_ID','FECHA_REGISTRO','CLIENTE_ID','SESION_ID','EJERCICIO_ID','EJERCICIO_TEXTO','PATRON','MODALIDAD_SESION','SERIES','REPETICIONES','TIEMPO','CARGA','UNIDAD_CARGA','RPE','DESCANSO','VOLUMEN_ESTIMADO','MOLESTIA','NOTAS_TECNICAS','DECISION_IBERFIT','CREADO_POR'
    ],
    '13 Informes': [
      'INFORME_ID','FECHA_CREACION','CLIENTE_ID','TIPO_INFORME','TITULO_INFORME','ESTADO_INFORME','VERSION_CLIENTE','VERSION_INTERNA','URL_PDF','ADJUNTO_FICHA','DECISION_IBERFIT','CREADO_POR','ACTUALIZADO_EN'
    ],
    '16 Multimedia Ejercicios': [
      'MEDIA_ID','EJERCICIO_ID','NOMBRE_EJERCICIO','TIPO_MEDIA','URL','FUENTE','LICENCIA','AUTOR','ESTADO_APROBACION','NOTAS','ACTUALIZADO_EN'
    ],
    '24 Decisiones IBERFIT': [
      'DECISION_ID','FECHA_DECISION','CLIENTE_ID','ORIGEN','ESTADO_CLIENTE','SEMAFORO','MOTIVO','ACCION_RECOMENDADA','DECISION_FINAL','CREADO_POR'
    ],
    '25 Configuración': [
      'CLAVE','VALOR','DESCRIPCION','ACTUALIZADO_EN'
    ],
    '00 Panel': ['SECCION','METRICA','VALOR','ESTADO','NOTA'],
    '02 Ficha Cliente': ['CLIENTE_ID','SECCION','CAMPO','VALOR','ACTUALIZADO_EN'],
    '06 Sesión Presencial': ['SESION_ID','CLIENTE_ID','FECHA','ESTADO','RESUMEN','DECISION_IBERFIT'],
    '07 Cargas': ['CLIENTE_ID','EJERCICIO','ULTIMA_CARGA','RPE','TENDENCIA','RECOMENDACION'],
    '14 Gráficas': ['TIPO_GRAFICA','CLIENTE_ID','METRICA','RANGO','NOTA'],
    '26 Listas': ['LISTA','VALOR','ORDEN','ESTADO'],
    '99 Registro': [
      'LOG_ID','FECHA_HORA','ORIGEN','ACCION','USUARIO','CLIENTE_ID','ESTADO','DETALLE'
    ]
  }
};

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    requireWorkerSecret_(payload);
    const action = String(payload.action || '').trim();

    if (action === 'apiContractProbe') return json_(apiContractProbe_());
    if (action === 'serverProbe') return json_(serverProbe_());
    if (action === 'login') return json_(login_(payload));
    if (action === 'validarTokenActivacion') return json_(validarTokenActivacion_(payload));
    if (action === 'activarCuenta') return json_(activarCuenta_(payload));

    if (action === 'coachLogin') return json_(coachLogin_(payload));
    if (isCoachAction_(action)) {
      const coach = requireCoachSession_(payload);
      if (action === 'coachGetDashboard') return json_(coachGetDashboard_(payload, coach));
      if (action === 'coachGetClientWorkspace') return json_(coachGetClientWorkspace_(payload, coach));
      if (action === 'coachCrearCliente') return json_(coachCrearCliente_(payload, coach));
      if (action === 'coachGuardarCliente') return json_(coachGuardarCliente_(payload, coach));
      if (action === 'coachGenerarEnlaceActivacion') return json_(coachGenerarEnlaceActivacion_(payload, coach));
      if (action === 'coachGenerarEnlaceRecuperacion') return json_(coachGenerarEnlaceRecuperacion_(payload, coach));
      if (action === 'coachSaveWeek') return json_(coachSaveWeek_(payload, coach));
      if (action === 'coachSaveSession') return json_(coachSaveSession_(payload, coach));
      if (action === 'coachGuardarEjercicio') return json_(coachGuardarEjercicio_(payload, coach));
      if (action === 'coachGuardarPlantillaSesion') return json_(coachGuardarPlantillaSesion_(payload, coach));
      if (action === 'coachReviewFeedback') return json_(coachReviewFeedback_(payload, coach));
      if (action === 'coachReviewCheckin') return json_(coachReviewCheckin_(payload, coach));
      if (action === 'coachRevocarSesion') return json_(coachRevocarSesion_(payload, coach));
      if (action === 'coachRevocarSesionesCliente') return json_(coachRevocarSesionesCliente_(payload, coach));
      if (action === 'coachGuardarCarga') return json_(coachGuardarCarga_(payload, coach));
      if (action === 'coachGuardarInforme') return json_(coachGuardarInforme_(payload, coach));
      if (action === 'coachGuardarIri') return json_(coachGuardarIri_(payload, coach));
      if (action === 'coachGuardarBioimpedancia') return json_(coachGuardarBioimpedancia_(payload, coach));
      if (action === 'coachGuardarMultimedia') return json_(coachGuardarMultimedia_(payload, coach));
      if (action === 'coachGuardarDecisionMotor') return json_(coachGuardarDecisionMotor_(payload, coach));
      if (action === 'coachAiGenerate') return json_(coachAiGenerate_(payload, coach));
      if (action === 'coachCerrarSesionPresencial') return json_(coachCerrarSesionPresencial_(payload, coach));
      if (action === 'coachLogout') return json_(coachLogout_(payload, coach));
    }

    const auth = requireSession_(payload);
    if (action === 'getHome') return json_({ ok: true, status: 'OK', data: buildClientData_(auth.clientId, auth.sessionToken, auth.expiresAt) });
    if (action === 'submitFeedback') return json_(submitFeedback_(payload, auth));
    if (action === 'submitCheckin') return json_(submitCheckin_(payload, auth));

    return json_({ ok: false, status: 'UNKNOWN_ACTION', message: 'Acción no reconocida.' });
  } catch (err) {
    return json_({ ok: false, status: 'SERVER_ERROR', message: safeMessage_(err) });
  }
}

function doGet() {
  return json_({ ok: true, service: 'IBERFIT Apps Script Backend', version: IBERFIT.VERSION });
}

/* ───────────────────────── Base Sheets ───────────────────────── */
function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }
function sheet_(name) {
  const sh = ss_().getSheetByName(name);
  if (!sh) throw new Error('Falta hoja: ' + name);
  return sh;
}
function headers_(sh) {
  const headers = sh.getRange(5, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0].map(String);
  if (!headers.some(function(h) { return String(h || '').trim(); })) {
    throw new Error('Hoja ' + sh.getName() + ': no se encontraron headers en fila 5. Ejecuta adminEnsureV93SheetStructure().');
  }
  return headers;
}
function getRows_(sheetName) {
  const sh = sheet_(sheetName);
  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (lastRow < 6 || lastCol < 1) return [];
  const headers = headers_(sh);
  const values = sh.getRange(6, 1, lastRow - 5, lastCol).getValues();
  return values.map((row, idx) => {
    const o = { __rowNumber: idx + 6, __sheetName: sheetName };
    headers.forEach((h, i) => { if (h) o[h] = row[i]; });
    return o;
  });
}

function getRowsIfSheetExists_(sheetName) {
  const sh = ss_().getSheetByName(sheetName);
  if (!sh) return [];
  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (lastRow < 6 || lastCol < 1) return [];
  const headers = sh.getRange(5, 1, 1, Math.max(lastCol, 1)).getValues()[0].map(String);
  if (!headers.some(function(h) { return String(h || '').trim(); })) return [];
  const values = sh.getRange(6, 1, lastRow - 5, lastCol).getValues();
  return values.map((row, idx) => {
    const o = { __rowNumber: idx + 6, __sheetName: sheetName };
    headers.forEach((h, i) => { if (h) o[h] = row[i]; });
    return o;
  });
}
function rowSheetName_(row, fallback) {
  return String(row && row.__sheetName || fallback || '');
}
function appendObject_(sheetName, obj) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_(sheetName);
    const headers = headers_(sh);
    sh.appendRow(headers.map(h => obj[h] !== undefined ? obj[h] : ''));
  } finally { lock.releaseLock(); }
}
function updateRowByNumber_(sheetName, rowNumber, updates) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_(sheetName);
    const headers = headers_(sh);
    const row = sh.getRange(rowNumber, 1, 1, headers.length).getValues()[0];
    headers.forEach((h, i) => { if (updates[h] !== undefined) row[i] = updates[h]; });
    sh.getRange(rowNumber, 1, 1, headers.length).setValues([row]);
  } finally { lock.releaseLock(); }
}
function findBy_(rows, key, value) {
  return rows.find(r => String(r[key] || '').trim().toLowerCase() === String(value || '').trim().toLowerCase());
}
function field_(row, names) {
  for (let i = 0; i < names.length; i++) {
    const v = row[names[i]];
    if (v !== undefined && String(v).trim() !== '') return v;
  }
  return '';
}
function normalize_(value) {
  return String(value || '').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
function normalizeValue_(value, allowed, fallback) {
  const raw = normalize_(value);
  return allowed.indexOf(raw) !== -1 ? raw : (fallback || allowed[0]);
}
function nextId_(prefix) { return String(prefix || 'ID') + '-' + Utilities.getUuid().slice(0, 8).toUpperCase(); }
function nextClientId_() {
  const rows = getRows_(IBERFIT.SHEETS.CLIENTES);
  let max = 0;
  rows.forEach(r => {
    const m = String(r.CLIENTE_ID || '').match(/APPCLI-(\d+)/);
    if (m) max = Math.max(max, Number(m[1]));
  });
  return 'APPCLI-' + String(max + 1).padStart(4, '0');
}

/* ───────────────────────── Seguridad ───────────────────────── */
function requireWorkerSecret_(payload) {
  const expected = PropertiesService.getScriptProperties().getProperty('IBERFIT_WORKER_SECRET');
  if (!expected) throw new Error('Falta configurar IBERFIT_WORKER_SECRET en Script Properties.');
  if (String(payload.workerSecret || '') !== expected) throw new Error('Solicitud no autorizada.');
}
function hashPassword_(password, salt) {
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + '|' + password, Utilities.Charset.UTF_8);
  return Utilities.base64Encode(raw);
}
function hashToken_(token) {
  const pepper = PropertiesService.getScriptProperties().getProperty('IBERFIT_TOKEN_PEPPER');
  if (!pepper) throw new Error('Falta configurar IBERFIT_TOKEN_PEPPER en Script Properties. Ejecuta adminSetupSecuritySecrets().');
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, pepper + '|' + token, Utilities.Charset.UTF_8);
  return Utilities.base64Encode(raw);
}
function createPublicToken_() { return 'ibf_' + Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().slice(0, 8).replace(/-/g, ''); }
function passwordPolicy_(password) {
  const p = String(password || '');
  if (p.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
  if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(p) || !/\d/.test(p)) throw new Error('La contraseña debe incluir letras y números.');
  return true;
}
function createSession_(clientId, accessId) {
  const token = Utilities.getUuid() + Utilities.getUuid();
  const expiresAt = new Date(Date.now() + IBERFIT.SESSION_TTL_SECONDS * 1000);
  const sessionPayload = { clientId, expiresAt: expiresAt.toISOString() };
  CacheService.getScriptCache().put('SESSION_' + token, JSON.stringify(sessionPayload), IBERFIT.SESSION_TTL_SECONDS);
  appendObject_(IBERFIT.SHEETS.SESIONES_ACTIVAS, {
    SESION_ACCESO_ID: nextId_('SAC'),
    CLIENTE_ID: clientId,
    ACCESO_ID: accessId || '',
    TOKEN_HASH: hashToken_(token),
    ESTADO_SESION_ACCESO: 'ACTIVA',
    FECHA_CREACION: new Date(),
    FECHA_EXPIRACION: expiresAt,
    FECHA_REVOCACION: '',
    REVOCADO_POR: '',
    ORIGEN: 'APP_CLIENT',
    OBSERVACION: ''
  });
  return { token, expiresAt: expiresAt.toISOString() };
}
function activeSessionRow_(token, clientId) {
  const tokenHash = hashToken_(token);
  const rows = getRows_(IBERFIT.SHEETS.SESIONES_ACTIVAS);
  return rows.find(r => String(r.TOKEN_HASH || '') === tokenHash && String(r.CLIENTE_ID || '') === String(clientId || '')) || null;
}
function revokeActiveClientSessions_(clientId, revokedBy, observation) {
  const rows = safeRows_(IBERFIT.SHEETS.SESIONES_ACTIVAS).filter(sa =>
    String(sa.CLIENTE_ID) === String(clientId) &&
    normalize_(sa.ESTADO_SESION_ACCESO) === 'ACTIVA'
  );
  rows.forEach(sa => updateRowByNumber_(IBERFIT.SHEETS.SESIONES_ACTIVAS, sa.__rowNumber, {
    ESTADO_SESION_ACCESO: 'REVOCADA',
    FECHA_REVOCACION: new Date(),
    REVOCADO_POR: revokedBy || 'IBERFIT',
    OBSERVACION: observation || 'Sesión revocada por seguridad'
  }));
  return rows.length;
}
function createCoachSession_(login) {
  const token = Utilities.getUuid() + Utilities.getUuid();
  const expiresAt = new Date(Date.now() + IBERFIT.COACH_TTL_SECONDS * 1000);
  CacheService.getScriptCache().put('COACH_SESSION_' + token, JSON.stringify({ login, role: 'COACH', expiresAt: expiresAt.toISOString() }), IBERFIT.COACH_TTL_SECONDS);
  appendObject_(IBERFIT.SHEETS.SESIONES_ACTIVAS, {
    SESION_ACCESO_ID: nextId_('COACHSES'),
    CLIENTE_ID: '__COACH__',
    ACCESO_ID: 'COACH:' + login,
    TOKEN_HASH: hashToken_(token),
    ESTADO_SESION_ACCESO: 'ACTIVA',
    FECHA_CREACION: new Date(),
    FECHA_EXPIRACION: expiresAt,
    FECHA_REVOCACION: '',
    REVOCADO_POR: '',
    ORIGEN: 'COACH_OS',
    OBSERVACION: 'Sesión Coach OS'
  });
  return { token, expiresAt: expiresAt.toISOString() };
}
function activeCoachSessionRow_(token, login) {
  const tokenHash = hashToken_(token);
  const rows = safeRows_(IBERFIT.SHEETS.SESIONES_ACTIVAS);
  return rows.find(r => String(r.TOKEN_HASH || '') === tokenHash && String(r.CLIENTE_ID || '') === '__COACH__' && String(r.ACCESO_ID || '') === ('COACH:' + login)) || null;
}
function revokeCoachSession_(token, login, revokedBy, observation) {
  const row = activeCoachSessionRow_(token, login);
  if (!row) return false;
  updateRowByNumber_(IBERFIT.SHEETS.SESIONES_ACTIVAS, row.__rowNumber, { ESTADO_SESION_ACCESO: 'REVOCADA', FECHA_REVOCACION: new Date(), REVOCADO_POR: revokedBy || login || 'COACH', OBSERVACION: observation || 'Cierre Coach OS' });
  return true;
}
function requireSession_(payload) {
  const token = String(payload.sessionToken || '').trim();
  const clientId = String(payload.clientId || '').trim();
  if (!token || !clientId) throw new Error('Sesión no válida.');
  const raw = CacheService.getScriptCache().get('SESSION_' + token);
  if (!raw) throw new Error('Sesión expirada. Ingresa nuevamente.');
  const session = JSON.parse(raw);
  if (String(session.clientId) !== clientId) throw new Error('Sesión no autorizada.');

  const active = activeSessionRow_(token, clientId);
  if (!active) throw new Error('Sesión no registrada. Ingresa nuevamente.');
  const state = normalize_(active.ESTADO_SESION_ACCESO);
  if (state !== 'ACTIVA') throw new Error('Sesión cerrada por IBERFIT. Ingresa nuevamente.');
  if (new Date(active.FECHA_EXPIRACION).getTime() < Date.now()) {
    updateRowByNumber_(IBERFIT.SHEETS.SESIONES_ACTIVAS, active.__rowNumber, { ESTADO_SESION_ACCESO: 'EXPIRADA', OBSERVACION: 'Expirada por TTL' });
    throw new Error('Sesión expirada. Ingresa nuevamente.');
  }
  return { clientId, sessionToken: token, expiresAt: session.expiresAt || '' };
}

/* ───────────────────────── Cliente App ───────────────────────── */
function login_(payload) {
  const login = String(payload.login || '').trim().toLowerCase();
  const password = String(payload.password || '').trim();
  if (!login || !password) return { ok: false, status: 'BAD_REQUEST', message: 'Ingresa usuario y contraseña.' };

  // V9.6.2: CANONICAL ONLY.
  // No consulta 02_CLIENTES ni 03_ACCESOS. Legacy queda archivado, no operativo.
  const clientes = getRows_(IBERFIT.SHEETS.CLIENTES);
  const cliente = clientes.find(c =>
    String(c.EMAIL || '').trim().toLowerCase() === login ||
    String(c.TELEFONO || '').replace(/\D/g, '') === login.replace(/\D/g, '')
  );
  const estadoCliente = normalize_(cliente && cliente.ESTADO);
  const blockedClientStates = ['INACTIVO','DESACTIVADO','FINALIZADO','ELIMINADO','BLOQUEADO'];
  if (!cliente || blockedClientStates.indexOf(estadoCliente) !== -1) {
    return { ok: false, status: 'INVALID_LOGIN', message: 'No pudimos validar tu usuario o contraseña.' };
  }

  const clienteId = String(cliente.CLIENTE_ID || '').trim();
  const accesos = getRows_(IBERFIT.SHEETS.ACCESOS);
  let access = accesos.find(a => String(a.CLIENTE_ID || '').trim() === clienteId && String(a.LOGIN || '').trim().toLowerCase() === login && normalize_(a.ESTADO_ACCESO) === 'ACTIVO') ||
               accesos.find(a => String(a.LOGIN || '').trim().toLowerCase() === login && normalize_(a.ESTADO_ACCESO) === 'ACTIVO') ||
               accesos.find(a => String(a.CLIENTE_ID || '').trim() === clienteId && normalize_(a.ESTADO_ACCESO) === 'ACTIVO') ||
               accesos.find(a => String(a.CLIENTE_ID || '').trim() === clienteId || String(a.LOGIN || '').trim().toLowerCase() === login);

  if (!access || normalize_(access.ESTADO_ACCESO) !== 'ACTIVO') {
    return { ok: false, status: 'ACCESS_NOT_READY', message: 'Tu acceso aún no está activo. Revisa tu enlace de activación o contacta a IBERFIT.' };
  }

  // Regla lanzamiento: diagnóstico pendiente NO bloquea login. Solo bloquea acceso no activo.
  const failed = Number(access.INTENTOS_FALLIDOS || 0);
  if (failed >= IBERFIT.MAX_FAILED_ATTEMPTS) return { ok: false, status: 'ACCESS_BLOCKED', message: 'Acceso bloqueado temporalmente. Contacta a IBERFIT.' };

  const expectedHash = String(field_(access, ['HASH_CONTRASENA','PASSWORD_HASH']) || '');
  const salt = String(field_(access, ['SAL_CONTRASENA','SALT']) || '');
  if (!expectedHash || !salt || hashPassword_(password, salt) !== expectedHash) {
    updateRowByNumber_(IBERFIT.SHEETS.ACCESOS, access.__rowNumber, { INTENTOS_FALLIDOS: failed + 1 });
    log_('LOGIN_FAIL', clienteId, 'FAIL', 'Intento fallido canonical-only');
    return { ok: false, status: 'INVALID_LOGIN', message: 'No pudimos validar tu usuario o contraseña.' };
  }

  const sessionToken = Utilities.getUuid() + '-' + Utilities.getUuid();
  const expiresAt = new Date(Date.now() + IBERFIT.SESSION_TTL_SECONDS * 1000);
  appendObject_(IBERFIT.SHEETS.SESIONES_ACTIVAS, {
    SESION_ACCESO_ID: nextId_('CLI-SES'), CLIENTE_ID: clienteId, ACCESO_ID: access.ACCESO_ID || '',
    TOKEN_HASH: hashToken_(sessionToken), ESTADO_SESION_ACCESO: 'ACTIVA', FECHA_CREACION: new Date(),
    FECHA_EXPIRACION: expiresAt, FECHA_REVOCACION: '', REVOCADO_POR: '', ORIGEN: 'APP_CLIENT', OBSERVACION: 'Login V9.6.2 canonical-only'
  });
  updateRowByNumber_(IBERFIT.SHEETS.ACCESOS, access.__rowNumber, { ULTIMO_ACCESO: new Date(), INTENTOS_FALLIDOS: 0, ESTADO_ACCESO: 'ACTIVO' });
  log_('LOGIN_OK', clienteId, 'OK', 'Login cliente V9.6.2 canonical-only');

  return { ok: true, status: 'OK', data: buildClientData_(clienteId, sessionToken, expiresAt) };
}

function buildClientData_(clienteId, sessionToken, expiresAt) {
  const cliente = findBy_(getRows_(IBERFIT.SHEETS.CLIENTES), 'CLIENTE_ID', clienteId) || {};
  const plan = getRows_(IBERFIT.SHEETS.PLANES).find(p => String(p.CLIENTE_ID) === clienteId && normalize_(p.ESTADO) === 'ACTIVO') || {};
  const semanas = getRows_(IBERFIT.SHEETS.SEMANAS).filter(w => String(w.CLIENTE_ID) === clienteId);
  const semana = semanas.find(w => normalize_(w.ESTADO_SEMANA) === 'PUBLICADA') || {};
  const semanaId = String(semana.SEMANA_ID || '').trim();
  const sesiones = semanaId ? getRows_(IBERFIT.SHEETS.SESIONES).filter(s => String(s.CLIENTE_ID) === clienteId && normalize_(s.ESTADO_SESION) === 'PUBLICADA' && String(s.SEMANA_ID) === semanaId) : [];
  const iriRaw = getRows_(IBERFIT.SHEETS.IRI).filter(i => String(i.CLIENTE_ID) === clienteId && normalize_(i.INFORME_ESTADO) === 'PUBLICADO').pop() || {};
  const iri = iriClientDTO_(iriRaw);
  const publishedReports = safeRows_(IBERFIT.SHEETS.INFORMES).filter(r => String(r.CLIENTE_ID) === clienteId && normalize_(r.ESTADO_INFORME) === 'PUBLICADO' && String(r.VERSION_CLIENTE || '').trim()).slice(-20).reverse().map(clientReportDTO_);
  const bioLatest = safeRows_(IBERFIT.SHEETS.BIOIMPEDANCIA).filter(b => String(b.CLIENTE_ID) === clienteId).pop() || {};
  const feedbacks = getRows_(IBERFIT.SHEETS.FEEDBACK).filter(f => String(f.CLIENTE_ID) === clienteId);
  const rpes = feedbacks.map(f => Number(f.RPE)).filter(n => n >= 1 && n <= 10);
  const rpeAvg = rpes.length ? Math.round((rpes.reduce((a,b)=>a+b,0) / rpes.length) * 10) / 10 : '';
  const modalidad = normalizeValue_(cliente.MODALIDAD || plan.MODALIDAD || 'HIBRIDO', ['PRESENCIAL','HIBRIDO','ONLINE'], 'HIBRIDO');
  const ctaLabel = modalidad === 'PRESENCIAL' ? 'Ver próxima sesión presencial' : modalidad === 'ONLINE' ? 'Ver entrenamiento de la semana' : 'Ver mi semana híbrida';
  const modalityNote = modalidad === 'PRESENCIAL' ? 'Sesión presencial guiada. La preparación, técnica y carga se trabajan dentro de la sesión.' : modalidad === 'ONLINE' ? 'Plan online para realizar en casa. Registra cada sesión para que IBERFIT pueda ajustar con criterio.' : 'Sesión presencial + trabajo autónomo disponible en la app.';

  return {
    sessionToken: sessionToken || '',
    expiresAt: expiresAt || '',
    client: { id: cliente.CLIENTE_ID, name: cliente.NOMBRE_VISIBLE, modality: modalidad, objective: cliente.OBJETIVO_PRINCIPAL },
    iri,
    reports: publishedReports,
    bioimpedance: bioClientDTO_(bioLatest),
    home: { week: semana.SEMANA_NUMERO || '', semanaId, iri: iri.total || '', sessions: sesiones.length, rpe: rpeAvg, focus: semana.FOCO_SEMANA || plan.PROXIMA_ACCION || '', nextDecision: plan.PROXIMA_ACCION || '', ctaLabel },
    week: { id: semanaId, title: semana.TITULO_SEMANA || '', message: semana.MENSAJE_IBERFIT || '', modalityNote, sessions: sesiones.sort((a,b)=>Number(a.ORDEN||0)-Number(b.ORDEN||0)).map(clientSessionDTO_) },
    process: {
      interpretation: iri.recommendation || 'IBERFIT revisará tu evolución con criterio.',
      trend: rpes.length ? rpes.slice(-6) : [],
      trendLabel: deriveTrendLabel_(rpes),
      iri,
      metrics: [['IRI', iri.total || '—', iri.classification || 'Proceso'], ['Sesiones', String(sesiones.length), 'Publicadas'], ['Modalidad', modalidad || '—', 'Plan'], ['Alertas', String(feedbacks.filter(f => normalize_(f.PRIORIDAD) === 'ALTA').length), 'Actual']]
    },
    channel: { actions: [{ title: 'Consultar sesión', text: 'Enviar una duda con contexto de la sesión.' }, { title: 'Reportar molestia', text: 'Avisar si aparece una molestia relevante.' }, { title: 'Enviar actualización', text: 'Compartir información que pueda afectar el plan.' }] }
  };
}
function clientSessionDTO_(s) {
  return {
    id: s.SESION_ID,
    title: s.TITULO_SESION,
    type: s.TIPO_SESION,
    deliveryMode: s.MODALIDAD_SESION,
    duration: s.DURACION_ESTIMADA_MIN,
    state: s.ESTADO_SESION,
    objective: s.OBJETIVO_SESION,
    criterion: s.CRITERIO_COACH,
    preparation: s.PREPARACION || '',
    mainBlock: s.BLOQUE_PRINCIPAL || '',
    coolDown: s.VUELTA_CALMA || '',
    indications: s.INDICACIONES || '',
    material: s.MATERIAL_NECESARIO || '',
    structure: s.ESTRUCTURA_SESION || [s.PREPARACION, s.BLOQUE_PRINCIPAL, s.VUELTA_CALMA, s.INDICACIONES].filter(Boolean).join('\n\n'),
    blocks: parseBlocks_(s.ESTRUCTURA_JSON || ''),
    observe: s.QUE_OBSERVAR,
    adjust: s.COMO_AJUSTAR,
    report: s.QUE_REPORTAR
  };
}

function submitFeedback_(payload, auth) {
  const sessionId = String(payload.sessionId || '').trim();
  if (!sessionId) return { ok: false, status: 'BAD_REQUEST', message: 'Falta sesión.' };
  const semanas = getRows_(IBERFIT.SHEETS.SEMANAS);
  const semanaActiva = semanas.find(w => String(w.CLIENTE_ID) === auth.clientId && normalize_(w.ESTADO_SEMANA) === 'PUBLICADA');
  if (!semanaActiva) return { ok: false, status: 'NO_ACTIVE_WEEK', message: 'No hay una semana publicada para validar esta sesión.' };
  const session = getRows_(IBERFIT.SHEETS.SESIONES).find(s => String(s.SESION_ID) === sessionId && String(s.CLIENTE_ID) === auth.clientId && normalize_(s.ESTADO_SESION) === 'PUBLICADA' && String(s.SEMANA_ID) === String(semanaActiva.SEMANA_ID));
  if (!session) return { ok: false, status: 'FORBIDDEN', message: 'No pudimos validar esta sesión publicada para tu semana activa.' };

  const rpe = validateScale_(payload.rpe, 'RPE');
  const fatiga = validateScale_(payload.fatiga, 'Fatiga');
  const energia = validateScale_(payload.energia, 'Energía');
  const molestia = validateScale_(payload.molestia, 'Molestia');
  const tecnica = validateScale_(payload.tecnica, 'Dificultad técnica');
  const realizacion = normalizeValue_(payload.realizacion || 'COMPLETA', ['COMPLETA','PARCIAL','NO_REALIZADA'], 'COMPLETA');
  const id = nextId_('FB');
  const prioridad = molestia >= 7 || rpe >= 10 || realizacion === 'NO_REALIZADA' ? 'ALTA' : (fatiga >= 8 || energia <= 3 || tecnica >= 8 || realizacion === 'PARCIAL' ? 'MEDIA' : 'NORMAL');
  appendObject_(IBERFIT.SHEETS.FEEDBACK, {
    FEEDBACK_ID: id, FECHA_ENVIO: new Date(), CLIENTE_ID: auth.clientId, SESION_ID: sessionId, REALIZACION: realizacion, RPE: rpe, FATIGA: fatiga, ENERGIA: energia, MOLESTIA: molestia, DIFICULTAD_TECNICA: tecnica, COMENTARIO_CLIENTE: sanitizeText_(payload.comment || ''), PRIORIDAD: prioridad, DECISION_IBERFIT: '', REVISADO_POR: '', FECHA_REVISION: ''
  });
  if (prioridad === 'ALTA') crearAlerta_(auth.clientId, 'FEEDBACK', 'ALTA', 'Feedback requiere revisión en ' + sessionId);
  log_('SUBMIT_FEEDBACK', auth.clientId, 'OK', id);
  return { ok: true, status: 'OK', data: { saved: true, feedbackId: id } };
}

function submitCheckin_(payload, auth) {
  const semanaId = String(payload.semanaId || '').trim();
  if (!semanaId) return { ok: false, status: 'BAD_REQUEST', message: 'No pudimos validar la semana activa para esta revisión.' };
  const semana = getRows_(IBERFIT.SHEETS.SEMANAS).find(w => String(w.SEMANA_ID) === semanaId && String(w.CLIENTE_ID) === auth.clientId && normalize_(w.ESTADO_SEMANA) === 'PUBLICADA');
  if (!semana) return { ok: false, status: 'FORBIDDEN', message: 'No pudimos validar esta semana para tu acceso.' };
  const descanso = validateScale_(payload.descanso, 'Descanso');
  const fatiga = validateScale_(payload.fatigaGeneral, 'Fatiga general');
  const estres = validateScale_(payload.estres, 'Estrés');
  const energia = validateScale_(payload.energiaGeneral, 'Energía general');
  const molestia = validateScale_(payload.molestiaGeneral, 'Molestia general');
  const id = nextId_('CHK');
  appendObject_(IBERFIT.SHEETS.CHECKIN, {
    CHECKIN_ID: id, FECHA_ENVIO: new Date(), CLIENTE_ID: auth.clientId, SEMANA_ID: semanaId, DESCANSO: descanso, FATIGA_GENERAL: fatiga, ESTRES: estres, ENERGIA_GENERAL: energia, MOLESTIA_GENERAL: molestia, SESIONES_COMPLETADAS: sanitizeText_(payload.sesionesCompletadas || ''), PESO: sanitizeText_(payload.peso || ''), OBSERVACION_CLIENTE: sanitizeText_(payload.observacion || ''), ESTADO_REVISION: 'PENDIENTE_REVISION', DECISION_IBERFIT: '', REVISADO_POR: '', FECHA_REVISION: ''
  });
  if (molestia >= 7 || fatiga >= 8 || energia <= 3) crearAlerta_(auth.clientId, 'CHECKIN', 'MEDIA', 'Check-in requiere revisión por fatiga, energía o molestia.');
  log_('SUBMIT_CHECKIN', auth.clientId, 'OK', id);
  return { ok: true, status: 'OK', data: { saved: true, checkinId: id } };
}

/* ───────────────────────── Activación y recuperación ───────────────────────── */
function crearTokenCliente_(clientId, accessId, tipo, creadoPor, baseUrl) {
  const token = createPublicToken_();
  const now = new Date();
  const hours = tipo === 'RECUPERACION' ? IBERFIT.RESET_TTL_HOURS : IBERFIT.ACTIVATION_TTL_HOURS;
  const exp = new Date(now.getTime() + hours * 60 * 60 * 1000);
  anularTokensPendientes_(clientId, tipo);
  const tokenId = nextId_(tipo === 'RECUPERACION' ? 'RST' : 'ACT');
  appendObject_(IBERFIT.SHEETS.TOKENS, { TOKEN_ID: tokenId, CLIENTE_ID: clientId, ACCESO_ID: accessId || '', TIPO_TOKEN: tipo, TOKEN_HASH: hashToken_(token), ESTADO_TOKEN: 'PENDIENTE', FECHA_CREACION: now, FECHA_EXPIRACION: exp, FECHA_USO: '', CREADO_POR: creadoPor || 'coach', OBSERVACION: '' });
  const base = String(baseUrl || getConfig_('APP_BASE_URL') || '').replace(/\/$/, '');
  return { tokenId, token, link: base ? base + '/activar.html?token=' + encodeURIComponent(token) : '/activar.html?token=' + encodeURIComponent(token), expiresAt: exp.toISOString() };
}
function anularTokensPendientes_(clientId, tipo) {
  getRows_(IBERFIT.SHEETS.TOKENS).filter(t => String(t.CLIENTE_ID) === String(clientId) && normalize_(t.TIPO_TOKEN) === tipo && normalize_(t.ESTADO_TOKEN) === 'PENDIENTE').forEach(t => updateRowByNumber_(IBERFIT.SHEETS.TOKENS, t.__rowNumber, { ESTADO_TOKEN: 'ANULADO', OBSERVACION: 'Reemplazado por nuevo enlace' }));
}

function estadoCerrado_(estado) {
  return ['FINALIZADO','DESACTIVADO','INACTIVO','ELIMINADO','BLOQUEADO'].indexOf(normalize_(estado)) !== -1;
}
function evaluarElegibilidadAcceso_(clientId, accessId) {
  const cliente = findBy_(getRows_(IBERFIT.SHEETS.CLIENTES), 'CLIENTE_ID', clientId);
  if (!cliente || !cliente.CLIENTE_ID) return { ok: false, status: 'CLIENT_NOT_FOUND', message: 'Cliente no encontrado.' };
  if (estadoCerrado_(cliente.ESTADO)) return { ok: false, status: 'CLIENT_INACTIVE', message: 'El cliente no está habilitado para activar o recuperar acceso.' };
  const accesos = getRows_(IBERFIT.SHEETS.ACCESOS);
  const access = accessId ? findBy_(accesos, 'ACCESO_ID', accessId) : findBy_(accesos, 'CLIENTE_ID', clientId);
  if (!access || !access.ACCESO_ID) return { ok: false, status: 'ACCESS_NOT_FOUND', message: 'No encontramos el acceso asociado.' };
  if (String(access.CLIENTE_ID) !== String(clientId)) return { ok: false, status: 'ACCESS_MISMATCH', message: 'El acceso no pertenece al cliente.' };
  if (estadoCerrado_(access.ESTADO_ACCESO)) return { ok: false, status: 'ACCESS_INACTIVE', message: 'El acceso del cliente no está habilitado.' };
  return { ok: true, status: 'OK', cliente: cliente, access: access };
}
function requireElegibilidadAcceso_(clientId, accessId) {
  const eligible = evaluarElegibilidadAcceso_(clientId, accessId);
  if (!eligible.ok) throw new Error(eligible.message || 'Acceso no habilitado.');
  return eligible;
}
function validarTokenActivacion_(payload) {
  const token = String(payload.token || '').trim();
  if (!token) return { ok: false, status: 'BAD_REQUEST', message: 'Falta token.' };
  const row = findBy_(getRows_(IBERFIT.SHEETS.TOKENS), 'TOKEN_HASH', hashToken_(token));
  if (!row) return { ok: false, status: 'TOKEN_INVALIDO', message: 'Este enlace no es válido.' };
  const estado = normalize_(row.ESTADO_TOKEN);
  if (estado !== 'PENDIENTE') return { ok: false, status: 'TOKEN_NO_DISPONIBLE', message: 'Este enlace ya fue usado o reemplazado.' };
  if (new Date(row.FECHA_EXPIRACION).getTime() < Date.now()) {
    updateRowByNumber_(IBERFIT.SHEETS.TOKENS, row.__rowNumber, { ESTADO_TOKEN: 'CADUCADO' });
    return { ok: false, status: 'TOKEN_CADUCADO', message: 'Este enlace venció. Solicita uno nuevo a IBERFIT.' };
  }
  const eligible = evaluarElegibilidadAcceso_(row.CLIENTE_ID, row.ACCESO_ID);
  if (!eligible.ok) {
    updateRowByNumber_(IBERFIT.SHEETS.TOKENS, row.__rowNumber, { ESTADO_TOKEN: 'ANULADO', OBSERVACION: 'Cliente/acceso no habilitado al validar enlace' });
    return { ok: false, status: eligible.status, message: 'Este enlace ya no está disponible. Contacta con IBERFIT.' };
  }
  const cliente = eligible.cliente || {};
  return { ok: true, status: 'OK', data: { clienteId: row.CLIENTE_ID, nombre: cliente.NOMBRE_VISIBLE || 'Cliente IBERFIT', email: maskEmail_(cliente.EMAIL || ''), tipo: row.TIPO_TOKEN, expiresAt: row.FECHA_EXPIRACION } };
}
function activarCuenta_(payload) {
  const token = String(payload.token || '').trim();
  const password = String(payload.password || '').trim();
  const confirm = String(payload.confirmPassword || '').trim();
  if (password !== confirm) return { ok: false, status: 'PASSWORD_MISMATCH', message: 'Las contraseñas no coinciden.' };
  passwordPolicy_(password);
  const tokenHash = hashToken_(token);
  const rows = getRows_(IBERFIT.SHEETS.TOKENS);
  const t = findBy_(rows, 'TOKEN_HASH', tokenHash);
  if (!t) return { ok: false, status: 'TOKEN_INVALIDO', message: 'Este enlace no es válido.' };
  if (normalize_(t.ESTADO_TOKEN) !== 'PENDIENTE') return { ok: false, status: 'TOKEN_NO_DISPONIBLE', message: 'Este enlace ya fue usado o reemplazado.' };
  if (new Date(t.FECHA_EXPIRACION).getTime() < Date.now()) {
    updateRowByNumber_(IBERFIT.SHEETS.TOKENS, t.__rowNumber, { ESTADO_TOKEN: 'CADUCADO' });
    return { ok: false, status: 'TOKEN_CADUCADO', message: 'Este enlace venció. Solicita uno nuevo a IBERFIT.' };
  }
  const eligible = evaluarElegibilidadAcceso_(t.CLIENTE_ID, t.ACCESO_ID);
  if (!eligible.ok) {
    updateRowByNumber_(IBERFIT.SHEETS.TOKENS, t.__rowNumber, { ESTADO_TOKEN: 'ANULADO', OBSERVACION: 'Cliente/acceso cerrado antes de consumir enlace' });
    return { ok: false, status: eligible.status, message: 'Este enlace ya no está disponible. Contacta con IBERFIT.' };
  }
  const access = eligible.access;
  const salt = Utilities.getUuid();
  const hash = hashPassword_(password, salt);
  const tokenType = normalize_(t.TIPO_TOKEN);
  updateRowByNumber_(IBERFIT.SHEETS.ACCESOS, access.__rowNumber, { HASH_CONTRASENA: hash, SAL_CONTRASENA: salt, PASSWORD_HASH: hash, SALT: salt, ESTADO_ACCESO: 'ACTIVO', ULTIMO_CAMBIO_CONTRASENA: new Date(), INTENTOS_FALLIDOS: 0, OBSERVACION: tokenType === 'RECUPERACION' ? 'Contraseña recuperada por enlace' : 'Cuenta activada por cliente' });
  updateRowByNumber_(IBERFIT.SHEETS.TOKENS, t.__rowNumber, { ESTADO_TOKEN: 'USADO', FECHA_USO: new Date() });
  if (tokenType === 'RECUPERACION') {
    const revoked = revokeActiveClientSessions_(t.CLIENTE_ID, 'PASSWORD_RESET', 'Revocada automáticamente tras recuperación de contraseña');
    log_('RESET_PASSWORD_REVOKE_SESSIONS', t.CLIENTE_ID, 'OK', String(revoked));
  }
  log_(tokenType === 'RECUPERACION' ? 'RESET_PASSWORD' : 'ACTIVATE_ACCOUNT', t.CLIENTE_ID, 'OK', t.TOKEN_ID);
  return { ok: true, status: 'OK', data: { activated: true, login: access.LOGIN || '' }, message: 'Tu acceso IBERFIT quedó activo.' };
}

/* ───────────────────────── Coach OS ───────────────────────── */
function isCoachAction_(action) {
  return ['coachGetDashboard','coachGetClientWorkspace','coachCrearCliente','coachGuardarCliente','coachGenerarEnlaceActivacion','coachGenerarEnlaceRecuperacion','coachSaveWeek','coachSaveSession','coachGuardarEjercicio','coachGuardarPlantillaSesion','coachReviewFeedback','coachReviewCheckin','coachRevocarSesion','coachRevocarSesionesCliente','coachGuardarCarga','coachGuardarInforme','coachGuardarIri','coachGuardarBioimpedancia','coachGuardarMultimedia','coachGuardarDecisionMotor','coachAiGenerate','coachCerrarSesionPresencial','coachLogout'].indexOf(String(action || '')) !== -1;
}
function coachLogin_(payload) {
  const login = String(payload.login || '').trim().toLowerCase();
  const password = String(payload.password || '').trim();
  const props = PropertiesService.getScriptProperties();
  const expectedLogin = String(props.getProperty('IBERFIT_COACH_LOGIN') || '').trim().toLowerCase();
  const expectedHash = String(props.getProperty('IBERFIT_COACH_PASSWORD_HASH') || '');
  const salt = String(props.getProperty('IBERFIT_COACH_PASSWORD_SALT') || '');
  if (!expectedLogin || !expectedHash || !salt) return { ok: false, status: 'COACH_ACCESS_NOT_CONFIGURED', message: 'El acceso Coach OS aún no está configurado. Ejecuta adminSetupCoachAccess(login, password) en Apps Script.' };

  const blockedUntil = Number(props.getProperty('IBERFIT_COACH_BLOCKED_UNTIL') || 0);
  if (blockedUntil && blockedUntil > Date.now()) {
    return { ok: false, status: 'COACH_ACCESS_BLOCKED', message: 'Coach OS está bloqueado temporalmente por seguridad. Intenta nuevamente más tarde.' };
  }

  const valid = login && password && login === expectedLogin && hashPassword_(password, salt) === expectedHash;
  if (!valid) {
    const failed = Number(props.getProperty('IBERFIT_COACH_FAILED_ATTEMPTS') || 0) + 1;
    props.setProperty('IBERFIT_COACH_FAILED_ATTEMPTS', String(failed));
    if (failed >= IBERFIT.MAX_FAILED_ATTEMPTS) {
      props.setProperty('IBERFIT_COACH_BLOCKED_UNTIL', String(Date.now() + IBERFIT.COACH_BLOCK_MINUTES * 60 * 1000));
      log_('COACH_LOGIN_BLOCKED', '', 'FAIL', 'Intentos fallidos: ' + failed);
      return { ok: false, status: 'COACH_ACCESS_BLOCKED', message: 'Coach OS quedó bloqueado temporalmente por seguridad.' };
    }
    log_('COACH_LOGIN_FAIL', '', 'FAIL', 'Intento fallido ' + failed);
    return { ok: false, status: 'COACH_INVALID_LOGIN', message: 'Usuario o contraseña no válidos.' };
  }

  props.setProperty('IBERFIT_COACH_FAILED_ATTEMPTS', '0');
  props.deleteProperty('IBERFIT_COACH_BLOCKED_UNTIL');
  const session = createCoachSession_(expectedLogin);
  log_('COACH_LOGIN', '', 'OK', expectedLogin);
  return { ok: true, status: 'OK', data: { coachToken: session.token, expiresAt: session.expiresAt, coach: { login: expectedLogin, name: props.getProperty('IBERFIT_COACH_NAME') || 'Coach IBERFIT', role: 'Coach IBERFIT' }, dashboard: buildCoachDashboard_() } };
}
function requireCoachSession_(payload) {
  const token = String(payload.coachToken || '').trim();
  if (!token) throw new Error('Sesión Coach OS no válida.');
  const raw = CacheService.getScriptCache().get('COACH_SESSION_' + token);
  if (!raw) throw new Error('Sesión Coach OS expirada. Ingresa nuevamente.');
  const session = JSON.parse(raw);
  const active = activeCoachSessionRow_(token, session.login);
  if (!active) throw new Error('Sesión Coach OS no registrada. Ingresa nuevamente.');
  const state = normalize_(active.ESTADO_SESION_ACCESO);
  if (state !== 'ACTIVA') throw new Error('Sesión Coach OS cerrada por seguridad. Ingresa nuevamente.');
  if (new Date(active.FECHA_EXPIRACION).getTime() < Date.now()) {
    updateRowByNumber_(IBERFIT.SHEETS.SESIONES_ACTIVAS, active.__rowNumber, { ESTADO_SESION_ACCESO: 'EXPIRADA', OBSERVACION: 'Coach OS expirada por TTL' });
    throw new Error('Sesión Coach OS expirada. Ingresa nuevamente.');
  }
  return { login: session.login, role: session.role, coachToken: token };
}
function buildCoachDashboard_() {
  const clientes = getRows_(IBERFIT.SHEETS.CLIENTES);
  const accesos = getRows_(IBERFIT.SHEETS.ACCESOS);
  const semanas = getRows_(IBERFIT.SHEETS.SEMANAS);
  const sesiones = getRows_(IBERFIT.SHEETS.SESIONES);
  const feedback = getRows_(IBERFIT.SHEETS.FEEDBACK);
  const checkin = getRows_(IBERFIT.SHEETS.CHECKIN);
  const iri = getRows_(IBERFIT.SHEETS.IRI);
  const alertas = safeRows_(IBERFIT.SHEETS.ALERTAS);
  const sesionesActivas = safeRows_(IBERFIT.SHEETS.SESIONES_ACTIVAS);
  const cargas = safeRows_(IBERFIT.SHEETS.CARGAS);
  const informes = safeRows_(IBERFIT.SHEETS.INFORMES);
  const bioimpedancia = safeRows_(IBERFIT.SHEETS.BIOIMPEDANCIA);
  const activos = clientes.filter(c => ['INACTIVO','DESACTIVADO','FINALIZADO'].indexOf(normalize_(c.ESTADO)) === -1);
  const pendingFeedback = feedback.filter(f => !String(f.FECHA_REVISION || '').trim() && !String(f.REVISADO_POR || '').trim());
  const pendingCheckin = checkin.filter(c => normalize_(c.ESTADO_REVISION) !== 'REVISADO');
  const activeAlerts = alertas.filter(a => normalize_(a.ESTADO_ALERTA) !== 'RESUELTA');
  return {
    generatedAt: new Date().toISOString(),
    metrics: {
      clientes: activos.length,
      accesosPendientes: accesos.filter(a => normalize_(a.ESTADO_ACCESO) === 'PENDIENTE_ACTIVACION').length,
      semanasPublicadas: semanas.filter(w => normalize_(w.ESTADO_SEMANA) === 'PUBLICADA').length,
      sesionesPublicadas: sesiones.filter(s => normalize_(s.ESTADO_SESION) === 'PUBLICADA').length,
      feedbackPendiente: pendingFeedback.length,
      checkinPendiente: pendingCheckin.length,
      alertas: activeAlerts.length,
      sesionesActivas: sesionesActivas.filter(sa => String(sa.CLIENTE_ID) !== '__COACH__' && normalize_(sa.ESTADO_SESION_ACCESO) === 'ACTIVA' && new Date(sa.FECHA_EXPIRACION).getTime() > Date.now()).length,
      cargasRegistradas: cargas.length,
      informesPendientes: informes.filter(i => ['BORRADOR','INTERNO','PENDIENTE'].indexOf(normalize_(i.ESTADO_INFORME || '')) !== -1).length,
      bioimpedancias: bioimpedancia.length,
      progresionesSugeridas: cargas.filter(c => Number(c.RPE || 0) <= 7 && Number(c.MOLESTIA || 0) === 0).length
    },
    clients: activos.map(c => {
      const clientWeeks = semanas.filter(w => String(w.CLIENTE_ID) === String(c.CLIENTE_ID));
      const activeWeek = clientWeeks.find(w => normalize_(w.ESTADO_SEMANA) === 'PUBLICADA') || clientWeeks.pop() || {};
      const lastIri = iri.filter(i => String(i.CLIENTE_ID) === String(c.CLIENTE_ID) && normalize_(i.INFORME_ESTADO) === 'PUBLICADO').pop() || {};
      const access = findBy_(accesos, 'CLIENTE_ID', c.CLIENTE_ID) || {};
      return { id: c.CLIENTE_ID, name: c.NOMBRE_VISIBLE, email: c.EMAIL, modality: c.MODALIDAD, objective: c.OBJETIVO_PRINCIPAL, status: c.ESTADO, accessStatus: access.ESTADO_ACCESO || '', activeWeekId: activeWeek.SEMANA_ID || '', activeWeekTitle: activeWeek.TITULO_SEMANA || '', iri: lastIri.IRI_TOTAL || '', iriClass: lastIri.CLASIFICACION || '', pendingFeedback: pendingFeedback.filter(f => String(f.CLIENTE_ID) === String(c.CLIENTE_ID)).length, pendingCheckin: pendingCheckin.filter(ch => String(ch.CLIENTE_ID) === String(c.CLIENTE_ID)).length };
    }),
    pendingFeedback: pendingFeedback.slice(-20).reverse().map(coachFeedbackDTO_),
    pendingCheckin: pendingCheckin.slice(-20).reverse().map(coachCheckinDTO_),
    alerts: activeAlerts.slice(-20).reverse().map(alertDTO_),
    loadHistory: cargas.slice(-80).reverse().map(loadDTO_),
    reports: informes.slice(-40).reverse().map(reportDTO_),
    exerciseLibrary: safeRows_(IBERFIT.SHEETS.EJERCICIOS).filter(e => normalize_(e.ESTADO || 'ACTIVO') !== 'INACTIVO').slice(0, 200).map(exerciseDTO_),
    sessionTemplates: safeRows_(IBERFIT.SHEETS.PLANTILLAS_SESION).filter(p => normalize_(p.ESTADO || 'ACTIVA') !== 'INACTIVA').slice(0, 100).map(sessionTemplateDTO_)
  };
}
function safeRows_(sheetName) { try { return getRows_(sheetName); } catch(e) { return []; } }
function coachGetDashboard_(payload, coach) { return { ok: true, status: 'OK', data: buildCoachDashboard_() }; }
function coachGetClientWorkspace_(payload, coach) {
  const clientId = String(payload.clientId || '').trim();
  if (!clientId) return { ok: false, status: 'BAD_REQUEST', message: 'Falta CLIENTE_ID.' };
  const cliente = findBy_(getRows_(IBERFIT.SHEETS.CLIENTES), 'CLIENTE_ID', clientId) || {};
  if (!cliente.CLIENTE_ID) return { ok: false, status: 'NOT_FOUND', message: 'Cliente no encontrado.' };
  const plan = getRows_(IBERFIT.SHEETS.PLANES).find(p => String(p.CLIENTE_ID) === clientId && normalize_(p.ESTADO) === 'ACTIVO') || {};
  const semanas = getRows_(IBERFIT.SHEETS.SEMANAS).filter(w => String(w.CLIENTE_ID) === clientId);
  const activeWeek = semanas.find(w => normalize_(w.ESTADO_SEMANA) === 'PUBLICADA') || semanas.pop() || {};
  const sesiones = getRows_(IBERFIT.SHEETS.SESIONES).filter(s => String(s.CLIENTE_ID) === clientId && (!activeWeek.SEMANA_ID || String(s.SEMANA_ID) === String(activeWeek.SEMANA_ID)));
  const feedback = getRows_(IBERFIT.SHEETS.FEEDBACK).filter(f => String(f.CLIENTE_ID) === clientId).slice(-30).reverse();
  const checkin = getRows_(IBERFIT.SHEETS.CHECKIN).filter(c => String(c.CLIENTE_ID) === clientId).slice(-20).reverse();
  const iri = getRows_(IBERFIT.SHEETS.IRI).filter(i => String(i.CLIENTE_ID) === clientId).pop() || {};
  const access = findBy_(getRows_(IBERFIT.SHEETS.ACCESOS), 'CLIENTE_ID', clientId) || {};
  const tokens = safeRows_(IBERFIT.SHEETS.TOKENS).filter(t => String(t.CLIENTE_ID) === clientId).slice(-10).reverse();
  const activeSessions = safeRows_(IBERFIT.SHEETS.SESIONES_ACTIVAS).filter(sa => String(sa.CLIENTE_ID) === clientId && normalize_(sa.ESTADO_SESION_ACCESO) === 'ACTIVA' && new Date(sa.FECHA_EXPIRACION).getTime() > Date.now()).slice(-20).reverse();
  const loadHistory = safeRows_(IBERFIT.SHEETS.CARGAS).filter(c => String(c.CLIENTE_ID) === clientId).slice(-120).reverse();
  const reports = safeRows_(IBERFIT.SHEETS.INFORMES).filter(r => String(r.CLIENTE_ID) === clientId).slice(-60).reverse();
  const bioimpedancia = safeRows_(IBERFIT.SHEETS.BIOIMPEDANCIA).filter(b => String(b.CLIENTE_ID) === clientId).slice(-40).reverse();
  const media = safeRows_(IBERFIT.SHEETS.MULTIMEDIA).slice(-200).reverse();
  return { ok: true, status: 'OK', data: {
    client: { id: cliente.CLIENTE_ID, name: cliente.NOMBRE_VISIBLE, email: cliente.EMAIL, phone: cliente.TELEFONO, modality: cliente.MODALIDAD, objective: cliente.OBJETIVO_PRINCIPAL, status: cliente.ESTADO, notes: cliente.OBSERVACIONES, accessStatus: access.ESTADO_ACCESO || '' },
    plan: { id: plan.PLAN_ID || '', modality: plan.MODALIDAD || '', nextAction: plan.PROXIMA_ACCION || '', objective: plan.OBJETIVO_PLAN || '', notes: plan.NOTAS_COACH || '' },
    week: coachWeekDTO_(activeWeek),
    sessions: sesiones.sort((a,b)=>Number(a.ORDEN||0)-Number(b.ORDEN||0)).map(coachSessionDTO_),
    iri: iriCoachDTO_(iri),
    feedback: feedback.map(coachFeedbackDTO_),
    checkin: checkin.map(coachCheckinDTO_),
    loadHistory: loadHistory.map(loadDTO_),
    reports: reports.map(reportDTO_),
    bioimpedance: bioimpedancia.map(bioCoachDTO_),
    media: media.map(mediaDTO_),
    tokens: tokens.map(t => ({ id: t.TOKEN_ID, type: t.TIPO_TOKEN, state: t.ESTADO_TOKEN, createdAt: t.FECHA_CREACION, expiresAt: t.FECHA_EXPIRACION, usedAt: t.FECHA_USO })),
    activeSessions: activeSessions.map(sa => ({ id: sa.SESION_ACCESO_ID, state: sa.ESTADO_SESION_ACCESO, createdAt: sa.FECHA_CREACION, expiresAt: sa.FECHA_EXPIRACION, source: sa.ORIGEN || '' }))
  } };
}
function coachCrearCliente_(payload, coach) {
  const name = sanitizeText_(payload.nombre || payload.name || '');
  const email = String(payload.email || '').trim().toLowerCase();
  if (!name || !email) return { ok: false, status: 'BAD_REQUEST', message: 'Falta nombre o correo.' };
  const existing = getRows_(IBERFIT.SHEETS.CLIENTES).find(c => String(c.EMAIL || '').trim().toLowerCase() === email);
  if (existing) return { ok: false, status: 'EMAIL_EXISTS', message: 'Ya existe un cliente con ese correo.' };
  const clientId = nextClientId_();
  const accessId = nextId_('ACC');
  const now = new Date();
  appendObject_(IBERFIT.SHEETS.CLIENTES, { CLIENTE_ID: clientId, NOMBRE_VISIBLE: name, EMAIL: email, TELEFONO: sanitizeText_(payload.telefono || ''), MODALIDAD: normalizeValue_(payload.modalidad || 'HIBRIDO', ['PRESENCIAL','HIBRIDO','ONLINE'], 'HIBRIDO'), OBJETIVO_PRINCIPAL: sanitizeText_(payload.objetivo || ''), ESTADO: normalizeValue_(payload.estado || 'DIAGNOSTICO_PENDIENTE', ['LEAD','DIAGNOSTICO_PENDIENTE','IRI_REALIZADO','ACTIVO','PAUSADO','FINALIZADO'], 'DIAGNOSTICO_PENDIENTE'), FECHA_ALTA: now, FECHA_ACTUALIZACION: now, OBSERVACIONES: sanitizeText_(payload.observaciones || '') });
  appendObject_(IBERFIT.SHEETS.ACCESOS, { ACCESO_ID: accessId, CLIENTE_ID: clientId, LOGIN: email, ROL_ACCESO: 'CLIENTE', HASH_CONTRASENA: '', SAL_CONTRASENA: '', PASSWORD_HASH: '', SALT: '', ESTADO_ACCESO: 'PENDIENTE_ACTIVACION', FECHA_CREACION: now, ULTIMO_ACCESO: '', ULTIMO_CAMBIO_CONTRASENA: '', INTENTOS_FALLIDOS: 0, OBSERVACION: 'Cliente creado desde Coach OS' });
  appendObject_(IBERFIT.SHEETS.PLANES, { PLAN_ID: nextId_('PLAN'), CLIENTE_ID: clientId, MODALIDAD: normalizeValue_(payload.modalidad || 'HIBRIDO', ['PRESENCIAL','HIBRIDO','ONLINE'], 'HIBRIDO'), ESTADO: 'ACTIVO', FECHA_INICIO: now, PROXIMA_ACCION: 'Completar diagnóstico IRI y publicar primera semana', OBJETIVO_PLAN: sanitizeText_(payload.objetivo || ''), NOTAS_COACH: '' });
  const tokenData = crearTokenCliente_(clientId, accessId, 'ACTIVACION', coach.login, payload.baseUrl || '');
  log_('COACH_CREATE_CLIENT', clientId, 'OK', email);
  return { ok: true, status: 'OK', data: { clientId, accessId, activationLink: tokenData.link, expiresAt: tokenData.expiresAt } };
}
function coachGuardarCliente_(payload, coach) {
  const clientId = String(payload.clientId || '').trim();
  const rows = getRows_(IBERFIT.SHEETS.CLIENTES);
  const c = findBy_(rows, 'CLIENTE_ID', clientId);
  if (!c) return { ok: false, status: 'NOT_FOUND', message: 'Cliente no encontrado.' };
  const updates = { NOMBRE_VISIBLE: sanitizeText_(payload.nombre || payload.name || c.NOMBRE_VISIBLE), EMAIL: String(payload.email || c.EMAIL || '').trim().toLowerCase(), TELEFONO: sanitizeText_(payload.telefono || payload.phone || c.TELEFONO || ''), MODALIDAD: normalizeValue_(payload.modalidad || payload.modality || c.MODALIDAD, ['PRESENCIAL','HIBRIDO','ONLINE'], 'HIBRIDO'), OBJETIVO_PRINCIPAL: sanitizeText_(payload.objetivo || payload.objective || c.OBJETIVO_PRINCIPAL || ''), ESTADO: normalizeValue_(payload.estado || payload.status || c.ESTADO, ['LEAD','DIAGNOSTICO_PENDIENTE','IRI_REALIZADO','ACTIVO','PAUSADO','FINALIZADO'], 'ACTIVO'), FECHA_ACTUALIZACION: new Date(), OBSERVACIONES: sanitizeText_(payload.observaciones || payload.notes || c.OBSERVACIONES || '') };
  updateRowByNumber_(IBERFIT.SHEETS.CLIENTES, c.__rowNumber, updates);
  const access = findBy_(getRows_(IBERFIT.SHEETS.ACCESOS), 'CLIENTE_ID', clientId);
  if (access && updates.EMAIL) updateRowByNumber_(IBERFIT.SHEETS.ACCESOS, access.__rowNumber, { LOGIN: updates.EMAIL });
  log_('COACH_SAVE_CLIENT', clientId, 'OK', 'Cliente actualizado');
  return { ok: true, status: 'OK', data: { clientId, saved: true } };
}
function coachGenerarEnlaceActivacion_(payload, coach) {
  const clientId = String(payload.clientId || '').trim();
  const eligible = evaluarElegibilidadAcceso_(clientId, '');
  if (!eligible.ok) return { ok: false, status: eligible.status, message: eligible.message };
  const access = eligible.access;
  const estadoAcceso = normalize_(access.ESTADO_ACCESO);
  if (estadoAcceso === 'PAUSADO') log_('COACH_ACTIVATION_PAUSED_CLIENT', clientId, 'WARN', coach.login);
  if (estadoAcceso !== 'ACTIVO') updateRowByNumber_(IBERFIT.SHEETS.ACCESOS, access.__rowNumber, { ESTADO_ACCESO: 'PENDIENTE_ACTIVACION' });
  const data = crearTokenCliente_(clientId, access.ACCESO_ID, 'ACTIVACION', coach.login, payload.baseUrl || '');
  return { ok: true, status: 'OK', data: { activationLink: data.link, expiresAt: data.expiresAt } };
}
function coachGenerarEnlaceRecuperacion_(payload, coach) {
  const clientId = String(payload.clientId || '').trim();
  const eligible = evaluarElegibilidadAcceso_(clientId, '');
  if (!eligible.ok) return { ok: false, status: eligible.status, message: eligible.message };
  const data = crearTokenCliente_(clientId, eligible.access.ACCESO_ID, 'RECUPERACION', coach.login, payload.baseUrl || '');
  return { ok: true, status: 'OK', data: { resetLink: data.link, expiresAt: data.expiresAt } };
}
function coachSaveWeek_(payload, coach) {
  const clientId = String(payload.clientId || '').trim();
  if (!clientId) return { ok: false, status: 'BAD_REQUEST', message: 'Falta CLIENTE_ID.' };
  requireClienteExiste_(clientId);
  const weekId = String(payload.weekId || '').trim() || nextId_('SEM');
  const estado = normalizeValue_(payload.estado || payload.state || 'BORRADOR', ['BORRADOR','PUBLICADA','CERRADA','ARCHIVADA'], 'BORRADOR');
  const now = new Date();
  const updates = { SEMANA_ID: weekId, CLIENTE_ID: clientId, SEMANA_NUMERO: sanitizeText_(payload.weekNumber || payload.semanaNumero || ''), TITULO_SEMANA: sanitizeText_(payload.title || payload.tituloSemana || ''), FOCO_SEMANA: sanitizeText_(payload.focus || payload.focoSemana || ''), MENSAJE_IBERFIT: sanitizeText_(payload.message || payload.mensajeIberfit || ''), ESTADO_SEMANA: estado, FECHA_INICIO: sanitizeText_(payload.startDate || ''), FECHA_FIN: sanitizeText_(payload.endDate || ''), ACTUALIZADO_EN: now };
  if (estado === 'PUBLICADA') updates.PUBLICADO_EN = now;
  const rows = getRows_(IBERFIT.SHEETS.SEMANAS);
  const existing = findBy_(rows, 'SEMANA_ID', weekId);
  if (existing) updateRowByNumber_(IBERFIT.SHEETS.SEMANAS, existing.__rowNumber, updates); else appendObject_(IBERFIT.SHEETS.SEMANAS, Object.assign({ CREADO_EN: now }, updates));
  if (estado === 'PUBLICADA') rows.filter(w => String(w.CLIENTE_ID) === clientId && String(w.SEMANA_ID) !== weekId && normalize_(w.ESTADO_SEMANA) === 'PUBLICADA').forEach(w => updateRowByNumber_(IBERFIT.SHEETS.SEMANAS, w.__rowNumber, { ESTADO_SEMANA: 'ARCHIVADA' }));
  log_('COACH_SAVE_WEEK', clientId, 'OK', weekId);
  return { ok: true, status: 'OK', data: { weekId, saved: true } };
}
function coachSaveSession_(payload, coach) {
  const clientId = String(payload.clientId || '').trim();
  const weekId = String(payload.weekId || payload.semanaId || '').trim();
  if (!clientId || !weekId) return { ok: false, status: 'BAD_REQUEST', message: 'Falta CLIENTE_ID o SEMANA_ID.' };
  const week = getRows_(IBERFIT.SHEETS.SEMANAS).find(w => String(w.SEMANA_ID) === weekId && String(w.CLIENTE_ID) === clientId);
  if (!week) return { ok: false, status: 'FORBIDDEN', message: 'La semana indicada no pertenece a este cliente.' };
  const sessionId = String(payload.sessionId || '').trim() || nextId_('SES');
  const now = new Date();
  const estado = normalizeValue_(payload.state || payload.estadoSesion || 'BORRADOR', ['BORRADOR','PUBLICADA','COMPLETADA','OMITIDA','REPROGRAMADA','ARCHIVADA'], 'BORRADOR');
  const estructura = sanitizeTextLong_(payload.structure || payload.estructuraSesion || '');
  const updates = { SESION_ID: sessionId, SEMANA_ID: weekId, CLIENTE_ID: clientId, MODALIDAD_SESION: normalizeValue_(payload.deliveryMode || payload.modalidadSesion || 'AUTONOMA', ['PRESENCIAL','AUTONOMA','ONLINE','COMPLEMENTARIA','EVALUACION'], 'AUTONOMA'), TITULO_SESION: sanitizeText_(payload.title || payload.tituloSesion || ''), TIPO_SESION: sanitizeText_(payload.type || payload.tipoSesion || ''), DURACION_ESTIMADA_MIN: sanitizeText_(payload.duration || ''), ESTADO_SESION: estado, OBJETIVO_SESION: sanitizeTextLong_(payload.objective || ''), CRITERIO_COACH: sanitizeTextLong_(payload.criterion || ''), PREPARACION: sanitizeTextLong_(payload.preparation || ''), BLOQUE_PRINCIPAL: sanitizeTextLong_(payload.mainBlock || ''), VUELTA_CALMA: sanitizeTextLong_(payload.coolDown || ''), INDICACIONES: sanitizeTextLong_(payload.indications || ''), MATERIAL_NECESARIO: sanitizeText_(payload.material || ''), ESTRUCTURA_SESION: estructura, ESTRUCTURA_JSON: sanitizeTextLong_(payload.blocksJson || ''), QUE_OBSERVAR: sanitizeTextLong_(payload.observe || ''), COMO_AJUSTAR: sanitizeTextLong_(payload.adjust || ''), QUE_REPORTAR: sanitizeTextLong_(payload.report || ''), ORDEN: sanitizeText_(payload.order || ''), ACTUALIZADO_EN: now };
  if (!updates.ESTRUCTURA_SESION) updates.ESTRUCTURA_SESION = [updates.PREPARACION, updates.BLOQUE_PRINCIPAL, updates.VUELTA_CALMA, updates.INDICACIONES].filter(Boolean).join('\n\n');
  if (!updates.TITULO_SESION) return { ok: false, status: 'BAD_REQUEST', message: 'Falta título de sesión.' };
  if (estado === 'PUBLICADA') updates.PUBLICADO_EN = now;
  const rows = getRows_(IBERFIT.SHEETS.SESIONES);
  const existing = findBy_(rows, 'SESION_ID', sessionId);
  if (existing && (String(existing.CLIENTE_ID) !== clientId || String(existing.SEMANA_ID) !== weekId)) {
    return { ok: false, status: 'FORBIDDEN', message: 'La sesión existente no pertenece a este cliente y semana.' };
  }
  if (existing) updateRowByNumber_(IBERFIT.SHEETS.SESIONES, existing.__rowNumber, updates); else appendObject_(IBERFIT.SHEETS.SESIONES, Object.assign({ CREADO_EN: now }, updates));
  log_('COACH_SAVE_SESSION', clientId, 'OK', sessionId);
  return { ok: true, status: 'OK', data: { sessionId, saved: true } };
}
function coachGuardarEjercicio_(payload, coach) {
  const id = String(payload.ejercicioId || '').trim() || nextId_('EJ');
  const updates = { EJERCICIO_ID: id, NOMBRE_EJERCICIO: sanitizeText_(payload.nombre || ''), PATRON: sanitizeText_(payload.patron || ''), ZONA: sanitizeText_(payload.zona || ''), MATERIAL: sanitizeText_(payload.material || ''), NIVEL: sanitizeText_(payload.nivel || ''), OBJETIVO: sanitizeText_(payload.objetivo || ''), INDICACIONES_TECNICAS: sanitizeTextLong_(payload.indicaciones || ''), ERRORES_COMUNES: sanitizeTextLong_(payload.errores || ''), REGRESION: sanitizeText_(payload.regresion || ''), PROGRESION: sanitizeText_(payload.progresion || ''), ESTADO: normalizeValue_(payload.estado || 'ACTIVO', ['ACTIVO','INACTIVO'], 'ACTIVO'), ACTUALIZADO_EN: new Date() };
  if (!updates.NOMBRE_EJERCICIO) return { ok: false, status: 'BAD_REQUEST', message: 'Falta nombre del ejercicio.' };
  const row = findBy_(getRows_(IBERFIT.SHEETS.EJERCICIOS), 'EJERCICIO_ID', id);
  if (row) updateRowByNumber_(IBERFIT.SHEETS.EJERCICIOS, row.__rowNumber, updates); else appendObject_(IBERFIT.SHEETS.EJERCICIOS, updates);
  return { ok: true, status: 'OK', data: { ejercicioId: id, saved: true } };
}
function coachGuardarPlantillaSesion_(payload, coach) {
  const id = String(payload.plantillaSesionId || '').trim() || nextId_('PLSES');
  const updates = { PLANTILLA_SESION_ID: id, NOMBRE_PLANTILLA: sanitizeText_(payload.nombre || ''), TIPO_SESION: sanitizeText_(payload.tipo || ''), MODALIDAD_SESION: normalizeValue_(payload.modalidadSesion || 'AUTONOMA', ['PRESENCIAL','AUTONOMA','ONLINE','COMPLEMENTARIA','EVALUACION'], 'AUTONOMA'), DURACION_ESTIMADA_MIN: sanitizeText_(payload.duracion || ''), OBJETIVO_SESION: sanitizeTextLong_(payload.objetivo || ''), CRITERIO_COACH: sanitizeTextLong_(payload.criterio || ''), PREPARACION: sanitizeTextLong_(payload.preparacion || ''), BLOQUE_PRINCIPAL: sanitizeTextLong_(payload.bloquePrincipal || ''), VUELTA_CALMA: sanitizeTextLong_(payload.vueltaCalma || ''), INDICACIONES: sanitizeTextLong_(payload.indicaciones || ''), MATERIAL_NECESARIO: sanitizeText_(payload.material || ''), ESTADO: normalizeValue_(payload.estado || 'ACTIVA', ['ACTIVA','INACTIVA'], 'ACTIVA'), ACTUALIZADO_EN: new Date() };
  if (!updates.NOMBRE_PLANTILLA) return { ok: false, status: 'BAD_REQUEST', message: 'Falta nombre de plantilla.' };
  const row = findBy_(getRows_(IBERFIT.SHEETS.PLANTILLAS_SESION), 'PLANTILLA_SESION_ID', id);
  if (row) updateRowByNumber_(IBERFIT.SHEETS.PLANTILLAS_SESION, row.__rowNumber, updates); else appendObject_(IBERFIT.SHEETS.PLANTILLAS_SESION, Object.assign({ CREADO_EN: new Date() }, updates));
  return { ok: true, status: 'OK', data: { plantillaSesionId: id, saved: true } };
}
function coachReviewFeedback_(payload, coach) {
  const id = String(payload.feedbackId || '').trim();
  const row = findBy_(getRows_(IBERFIT.SHEETS.FEEDBACK), 'FEEDBACK_ID', id);
  if (!row) return { ok: false, status: 'NOT_FOUND', message: 'Feedback no encontrado.' };
  updateRowByNumber_(IBERFIT.SHEETS.FEEDBACK, row.__rowNumber, { DECISION_IBERFIT: sanitizeTextLong_(payload.decision || ''), REVISADO_POR: coach.login, FECHA_REVISION: new Date() });
  return { ok: true, status: 'OK', data: { feedbackId: id, reviewed: true } };
}
function coachReviewCheckin_(payload, coach) {
  const id = String(payload.checkinId || '').trim();
  const row = findBy_(getRows_(IBERFIT.SHEETS.CHECKIN), 'CHECKIN_ID', id);
  if (!row) return { ok: false, status: 'NOT_FOUND', message: 'Check-in no encontrado.' };
  updateRowByNumber_(IBERFIT.SHEETS.CHECKIN, row.__rowNumber, { ESTADO_REVISION: 'REVISADO', DECISION_IBERFIT: sanitizeTextLong_(payload.decision || ''), REVISADO_POR: coach.login, FECHA_REVISION: new Date() });
  return { ok: true, status: 'OK', data: { checkinId: id, reviewed: true } };
}


function coachRevocarSesion_(payload, coach) {
  const clientId = String(payload.clientId || '').trim();
  const sessionAccessId = String(payload.sessionAccessId || payload.sesionAccesoId || '').trim();
  if (!clientId || !sessionAccessId) return { ok: false, status: 'BAD_REQUEST', message: 'Falta cliente o sesión activa.' };
  const row = safeRows_(IBERFIT.SHEETS.SESIONES_ACTIVAS).find(sa => String(sa.SESION_ACCESO_ID) === sessionAccessId && String(sa.CLIENTE_ID) === clientId);
  if (!row) return { ok: false, status: 'NOT_FOUND', message: 'Sesión activa no encontrada.' };
  updateRowByNumber_(IBERFIT.SHEETS.SESIONES_ACTIVAS, row.__rowNumber, { ESTADO_SESION_ACCESO: 'REVOCADA', FECHA_REVOCACION: new Date(), REVOCADO_POR: coach.login, OBSERVACION: 'Cerrada desde Coach OS' });
  log_('COACH_REVOKE_SESSION', clientId, 'OK', sessionAccessId);
  return { ok: true, status: 'OK', data: { revoked: true, sessionAccessId } };
}
function coachRevocarSesionesCliente_(payload, coach) {
  const clientId = String(payload.clientId || '').trim();
  if (!clientId) return { ok: false, status: 'BAD_REQUEST', message: 'Falta CLIENTE_ID.' };
  const rows = safeRows_(IBERFIT.SHEETS.SESIONES_ACTIVAS).filter(sa => String(sa.CLIENTE_ID) === clientId && normalize_(sa.ESTADO_SESION_ACCESO) === 'ACTIVA');
  rows.forEach(sa => updateRowByNumber_(IBERFIT.SHEETS.SESIONES_ACTIVAS, sa.__rowNumber, { ESTADO_SESION_ACCESO: 'REVOCADA', FECHA_REVOCACION: new Date(), REVOCADO_POR: coach.login, OBSERVACION: 'Cierre masivo desde Coach OS' }));
  log_('COACH_REVOKE_ALL_SESSIONS', clientId, 'OK', String(rows.length));
  return { ok: true, status: 'OK', data: { revoked: rows.length } };
}



function requireClienteExiste_(clientId) {
  const c = findBy_(getRows_(IBERFIT.SHEETS.CLIENTES), 'CLIENTE_ID', clientId);
  if (!c || !c.CLIENTE_ID) throw new Error('Cliente no encontrado para la operación solicitada.');
  return c;
}
function requireSesionCliente_(sessionId, clientId, options) {
  const sid = String(sessionId || '').trim();
  if (!sid) return null;
  const s = getRows_(IBERFIT.SHEETS.SESIONES).find(x => String(x.SESION_ID) === sid && String(x.CLIENTE_ID) === String(clientId));
  if (!s && !(options && options.optional)) throw new Error('La sesión no pertenece al cliente o no existe.');
  return s || null;
}
function bioClientDTO_(b) { return { date: b.FECHA_MEDICION || '', weight: b.PESO || '', fatPct: b.GRASA_PORCENTAJE || '', muscleMass: b.MASA_MUSCULAR || '', source: b.FUENTE || '', notes: b.OBSERVACIONES || '' }; }
function bioCoachDTO_(b) { return { id: b.BIO_ID || '', date: b.FECHA_MEDICION || '', clientId: b.CLIENTE_ID || '', weight: b.PESO || '', fatPct: b.GRASA_PORCENTAJE || '', muscleMass: b.MASA_MUSCULAR || '', fatMass: b.MASA_GRASA || '', waterPct: b.AGUA_PORCENTAJE || '', visceralFat: b.GRASA_VISCERAL || '', bmi: b.IMC || '', source: b.FUENTE || '', notes: b.OBSERVACIONES || '' }; }

function coachGuardarCarga_(payload, coach) {
  const clientId = String(payload.clientId || '').trim();
  if (!clientId) return { ok: false, status: 'BAD_REQUEST', message: 'Falta CLIENTE_ID.' };
  const ejercicio = sanitizeText_(payload.exercise || payload.ejercicio || '');
  if (!ejercicio) return { ok: false, status: 'BAD_REQUEST', message: 'Falta ejercicio.' };
  requireClienteExiste_(clientId);
  const sessionId = sanitizeText_(payload.sessionId || '');
  if (sessionId) requireSesionCliente_(sessionId, clientId);
  const carga = Number(String(payload.load || payload.carga || '').replace(',', '.')) || 0;
  const reps = Number(String(payload.reps || payload.repeticiones || '').replace(',', '.')) || 0;
  const sets = Number(String(payload.sets || payload.series || '').replace(',', '.')) || 0;
  const volume = carga && reps && sets ? carga * reps * sets : '';
  const row = {
    CARGA_ID: nextId_('CAR'), FECHA_REGISTRO: new Date(), CLIENTE_ID: clientId, SESION_ID: sessionId, EJERCICIO_ID: sanitizeText_(payload.exerciseId || ''), EJERCICIO_TEXTO: ejercicio, PATRON: sanitizeText_(payload.pattern || payload.patron || ''), MODALIDAD_SESION: sanitizeText_(payload.modality || payload.modalidad || ''), SERIES: sets || sanitizeText_(payload.sets || ''), REPETICIONES: reps || sanitizeText_(payload.reps || ''), TIEMPO: sanitizeText_(payload.time || payload.tiempo || ''), CARGA: carga || sanitizeText_(payload.load || ''), UNIDAD_CARGA: sanitizeText_(payload.unit || payload.unidad || 'kg'), RPE: sanitizeText_(payload.rpe || ''), DESCANSO: sanitizeText_(payload.rest || payload.descanso || ''), VOLUMEN_ESTIMADO: volume, MOLESTIA: sanitizeText_(payload.pain || payload.molestia || ''), NOTAS_TECNICAS: sanitizeTextLong_(payload.notes || payload.notas || ''), DECISION_IBERFIT: sanitizeTextLong_(payload.decision || ''), CREADO_POR: coach.login
  };
  appendObject_(IBERFIT.SHEETS.CARGAS, row);
  actualizarVistaCargas_(clientId, ejercicio, row);
  log_('COACH_SAVE_LOAD', clientId, 'OK', row.CARGA_ID + ' · ' + ejercicio);
  return { ok: true, status: 'OK', data: { cargaId: row.CARGA_ID, saved: true } };
}
function actualizarVistaCargas_(clientId, ejercicio, cargaRow) {
  if (!IBERFIT.SHEETS.CARGAS_UI) return;
  const rows = safeRows_(IBERFIT.SHEETS.CARGAS_UI);
  const existing = rows.find(function(r) { return String(r.CLIENTE_ID) === String(clientId) && normalize_(r.EJERCICIO) === normalize_(ejercicio); });
  const summary = {
    CLIENTE_ID: clientId,
    EJERCICIO: ejercicio,
    ULTIMA_CARGA: String(cargaRow.CARGA || '') + (cargaRow.UNIDAD_CARGA ? ' ' + cargaRow.UNIDAD_CARGA : ''),
    RPE: cargaRow.RPE || '',
    TENDENCIA: deriveLoadTrend_(cargaRow),
    RECOMENDACION: deriveLoadRecommendation_(cargaRow)
  };
  if (existing) updateRowByNumber_(IBERFIT.SHEETS.CARGAS_UI, existing.__rowNumber, summary);
  else appendObject_(IBERFIT.SHEETS.CARGAS_UI, summary);
}
function coachGuardarInforme_(payload, coach) {
  const clientId = String(payload.clientId || '').trim();
  if (!clientId) return { ok: false, status: 'BAD_REQUEST', message: 'Falta CLIENTE_ID.' };
  requireClienteExiste_(clientId);
  const id = String(payload.reportId || payload.informeId || '').trim() || nextId_('INF');
  const updates = { INFORME_ID: id, FECHA_CREACION: new Date(), CLIENTE_ID: clientId, TIPO_INFORME: sanitizeText_(payload.type || payload.tipo || 'Informe'), TITULO_INFORME: sanitizeText_(payload.title || payload.titulo || ''), ESTADO_INFORME: normalizeValue_(payload.state || payload.estado || 'INTERNO', ['INTERNO','BORRADOR','PUBLICADO','ARCHIVADO'], 'INTERNO'), VERSION_CLIENTE: sanitizeTextLong_(payload.clientVersion || payload.versionCliente || ''), VERSION_INTERNA: sanitizeTextLong_(payload.internalVersion || payload.versionInterna || ''), URL_PDF: sanitizeTextLong_(payload.url || ''), ADJUNTO_FICHA: 'SI', DECISION_IBERFIT: sanitizeTextLong_(payload.decision || ''), CREADO_POR: coach.login, ACTUALIZADO_EN: new Date() };
  const row = findBy_(safeRows_(IBERFIT.SHEETS.INFORMES), 'INFORME_ID', id);
  if (row) updateRowByNumber_(IBERFIT.SHEETS.INFORMES, row.__rowNumber, updates); else appendObject_(IBERFIT.SHEETS.INFORMES, updates);
  log_('COACH_SAVE_REPORT', clientId, 'OK', id);
  return { ok: true, status: 'OK', data: { informeId: id, saved: true } };
}
function coachGuardarIri_(payload, coach) {
  const clientId = String(payload.clientId || '').trim();
  if (!clientId) return { ok: false, status: 'BAD_REQUEST', message: 'Falta CLIENTE_ID.' };
  requireClienteExiste_(clientId);
  const id = String(payload.iriId || '').trim() || nextId_('IRI');
  const estadoInforme = normalizeValue_(payload.status || payload.estado || 'BORRADOR', ['BORRADOR','INTERNO','PUBLICADO','ARCHIVADO'], 'BORRADOR');
  const updates = { IRI_ID: id, FECHA_EVALUACION: new Date(), CLIENTE_ID: clientId, IRI_TOTAL: sanitizeText_(payload.total || ''), CLASIFICACION: sanitizeText_(payload.classification || payload.clasificacion || ''), RECOMENDACION: sanitizeTextLong_(payload.recommendation || payload.recomendacion || ''), CONTEXTO: sanitizeTextLong_(payload.context || payload.contexto || ''), BIOIMPEDANCIA: sanitizeTextLong_(payload.bioimpedance || payload.bioimpedancia || ''), COMPOSICION: sanitizeTextLong_(payload.composition || payload.composicion || ''), MOVILIDAD: sanitizeTextLong_(payload.mobility || payload.movilidad || ''), FUERZA: sanitizeTextLong_(payload.strength || payload.fuerza || ''), METABOLICO: sanitizeTextLong_(payload.metabolic || payload.metabolico || ''), LIMITADORES: sanitizeTextLong_(payload.limiters || payload.limitadores || ''), DECISION_IBERFIT: sanitizeTextLong_(payload.decision || ''), INFORME_ESTADO: estadoInforme };
  const row = findBy_(safeRows_(IBERFIT.SHEETS.IRI), 'IRI_ID', id);
  if (row) updateRowByNumber_(IBERFIT.SHEETS.IRI, row.__rowNumber, updates); else appendObject_(IBERFIT.SHEETS.IRI, updates);
  if (estadoInforme === 'PUBLICADO' || estadoInforme === 'INTERNO') {
    coachGuardarInforme_({ clientId: clientId, type: 'IRI', title: 'Informe IRI · ' + (updates.CLASIFICACION || 'Proceso'), state: estadoInforme === 'PUBLICADO' ? 'PUBLICADO' : 'INTERNO', clientVersion: updates.RECOMENDACION, internalVersion: [updates.CONTEXTO, updates.BIOIMPEDANCIA, updates.MOVILIDAD, updates.FUERZA, updates.METABOLICO, updates.LIMITADORES, updates.DECISION_IBERFIT].filter(Boolean).join('\n\n'), decision: updates.DECISION_IBERFIT }, coach);
  }
  log_('COACH_SAVE_IRI', clientId, 'OK', id);
  return { ok: true, status: 'OK', data: { iriId: id, saved: true } };
}

function coachGuardarBioimpedancia_(payload, coach) {
  const clientId = String(payload.clientId || '').trim();
  if (!clientId) return { ok: false, status: 'BAD_REQUEST', message: 'Falta CLIENTE_ID.' };
  requireClienteExiste_(clientId);
  const id = String(payload.bioId || '').trim() || nextId_('BIO');
  const updates = { BIO_ID: id, FECHA_MEDICION: payload.date || payload.fecha || new Date(), CLIENTE_ID: clientId, PESO: sanitizeText_(payload.weight || payload.peso || ''), GRASA_PORCENTAJE: sanitizeText_(payload.fatPct || payload.grasaPorcentaje || ''), MASA_MUSCULAR: sanitizeText_(payload.muscleMass || payload.masaMuscular || ''), MASA_GRASA: sanitizeText_(payload.fatMass || payload.masaGrasa || ''), AGUA_PORCENTAJE: sanitizeText_(payload.waterPct || payload.aguaPorcentaje || ''), GRASA_VISCERAL: sanitizeText_(payload.visceralFat || payload.grasaVisceral || ''), IMC: sanitizeText_(payload.bmi || payload.imc || ''), FUENTE: sanitizeText_(payload.source || payload.fuente || 'Bioimpedancia IBERFIT'), OBSERVACIONES: sanitizeTextLong_(payload.notes || payload.observaciones || ''), CREADO_POR: coach.login, ACTUALIZADO_EN: new Date() };
  const row = findBy_(safeRows_(IBERFIT.SHEETS.BIOIMPEDANCIA), 'BIO_ID', id);
  if (row) updateRowByNumber_(IBERFIT.SHEETS.BIOIMPEDANCIA, row.__rowNumber, updates); else appendObject_(IBERFIT.SHEETS.BIOIMPEDANCIA, updates);
  log_('COACH_SAVE_BIOIMPEDANCE', clientId, 'OK', id);
  return { ok: true, status: 'OK', data: { bioId: id, saved: true } };
}

function coachGuardarMultimedia_(payload, coach) {
  const id = String(payload.mediaId || '').trim() || nextId_('MED');
  appendObject_(IBERFIT.SHEETS.MULTIMEDIA, { MEDIA_ID: id, EJERCICIO_ID: sanitizeText_(payload.exerciseId || ''), NOMBRE_EJERCICIO: sanitizeText_(payload.exercise || payload.nombreEjercicio || ''), TIPO_MEDIA: sanitizeText_(payload.type || payload.tipo || 'FOTO'), URL: sanitizeTextLong_(payload.url || ''), FUENTE: sanitizeText_(payload.source || payload.fuente || 'IBERFIT'), LICENCIA: sanitizeText_(payload.license || payload.licencia || ''), AUTOR: sanitizeText_(payload.author || payload.autor || ''), ESTADO_APROBACION: normalizeValue_(payload.state || payload.estado || 'PENDIENTE', ['PENDIENTE','APROBADO','DESCARTADO'], 'PENDIENTE'), NOTAS: sanitizeTextLong_(payload.notes || ''), ACTUALIZADO_EN: new Date() });
  return { ok: true, status: 'OK', data: { mediaId: id, saved: true } };
}
function coachGuardarDecisionMotor_(payload, coach) {
  const clientId = String(payload.clientId || '').trim();
  if (!clientId) return { ok: false, status: 'BAD_REQUEST', message: 'Falta CLIENTE_ID.' };
  requireClienteExiste_(clientId);
  const id = nextId_('DEC');
  appendObject_(IBERFIT.SHEETS.DECISIONES, { DECISION_ID: id, FECHA_DECISION: new Date(), CLIENTE_ID: clientId, ORIGEN: sanitizeText_(payload.origin || 'MOTOR_DECISION'), ESTADO_CLIENTE: sanitizeText_(payload.clientState || ''), SEMAFORO: sanitizeText_(payload.semaforo || ''), MOTIVO: sanitizeTextLong_(payload.reason || payload.motivo || ''), ACCION_RECOMENDADA: sanitizeTextLong_(payload.recommendation || payload.accion || ''), DECISION_FINAL: sanitizeTextLong_(payload.decision || ''), CREADO_POR: coach.login });
  return { ok: true, status: 'OK', data: { decisionId: id, saved: true } };
}

/* ───────────────────────── IA híbrida IBERFIT: Gemini + fallback local ─────────────────────────
 * Gemini redacta e interpreta. El motor IBERFIT local calcula, limita y decide.
 * La app nunca depende de Gemini para funcionar: si no hay API key, cuota o red, vuelve a IA local.
 * Configuración segura: Script Properties → GEMINI_API_KEY y opcional GEMINI_MODEL.
 */
function coachAiGenerate_(payload, coach) {
  const clientId = String(payload.clientId || '').trim();
  if (!clientId) return { ok: false, status: 'BAD_REQUEST', message: 'Falta CLIENTE_ID.' };
  requireClienteExiste_(clientId);
  const mode = normalizeValue_(payload.mode || payload.tipo || 'DECISION', ['SESSION','REPORT','IRI','DECISION','FEEDBACK','CHECKIN','CLOSE_SESSION'], 'DECISION');
  const ctx = buildAiContextIberfit_(clientId, mode, payload);
  const local = localAiIberfitDraft_(mode, ctx, payload);
  const providerRequest = String(payload.provider || 'AUTO').toUpperCase();
  let finalDraft = local;
  let provider = 'LOCAL';
  let warning = '';
  let model = '';
  if (providerRequest !== 'LOCAL') {
    try {
      const gemini = geminiIberfitDraft_(mode, ctx, payload, local);
      if (gemini && gemini.fields) {
        finalDraft = { fields: mergeAiFields_(local.fields, gemini.fields), raw: gemini.raw || '', text: gemini.text || '' };
        provider = 'GEMINI';
        model = gemini.model || '';
      }
    } catch (err) {
      provider = 'LOCAL';
      warning = 'Gemini no disponible; se usó IA local IBERFIT. ' + String(err && err.message ? err.message : err).slice(0, 180);
    }
  }
  log_('COACH_AI_GENERATE', clientId, provider, mode + (warning ? ' · ' + warning : ''));
  return { ok: true, status: 'OK', data: { provider: provider, fallback: provider !== 'GEMINI', model: model, mode: mode, fields: finalDraft.fields || {}, raw: finalDraft.raw || finalDraft.text || '', warning: warning, generatedAt: new Date() } };
}

function buildAiContextIberfit_(clientId, mode, payload) {
  const cliente = requireClienteExiste_(clientId);
  const iri = safeRows_(IBERFIT.SHEETS.IRI).filter(r => String(r.CLIENTE_ID) === clientId).slice(-1)[0] || {};
  const bio = safeRows_(IBERFIT.SHEETS.BIOIMPEDANCIA).filter(r => String(r.CLIENTE_ID) === clientId).slice(-3).reverse();
  const cargas = safeRows_(IBERFIT.SHEETS.CARGAS).filter(r => String(r.CLIENTE_ID) === clientId).slice(-18).reverse();
  const sesiones = safeRows_(IBERFIT.SHEETS.SESIONES).filter(r => String(r.CLIENTE_ID) === clientId).slice(-8).reverse();
  const feedback = safeRows_(IBERFIT.SHEETS.FEEDBACK).filter(r => String(r.CLIENTE_ID) === clientId).slice(-8).reverse();
  const checkin = safeRows_(IBERFIT.SHEETS.CHECKIN).filter(r => String(r.CLIENTE_ID) === clientId).slice(-6).reverse();
  const alertas = safeRows_(IBERFIT.SHEETS.ALERTAS).filter(r => String(r.CLIENTE_ID) === clientId && normalize_(r.ESTADO_ALERTA) !== 'RESUELTA').slice(-8).reverse();
  const decisiones = safeRows_(IBERFIT.SHEETS.DECISIONES).filter(r => String(r.CLIENTE_ID) === clientId).slice(-6).reverse();
  return {
    mode: mode,
    client: {
      id: cliente.CLIENTE_ID || '',
      name: cliente.NOMBRE_VISIBLE || 'Cliente IBERFIT',
      modality: cliente.MODALIDAD || '',
      objective: cliente.OBJETIVO_PRINCIPAL || '',
      status: cliente.ESTADO || '',
      notes: sanitizeTextLong_(cliente.OBSERVACIONES || '')
    },
    iri: compactIriForAi_(iri),
    bio: bio.map(compactBioForAi_),
    loads: cargas.map(compactLoadForAi_),
    sessions: sesiones.map(compactSessionForAi_),
    feedback: feedback.map(compactFeedbackForAi_),
    checkin: checkin.map(compactCheckinForAi_),
    alerts: alertas.map(function(a) { return { priority: a.PRIORIDAD || '', message: a.MENSAJE || '', decision: a.DECISION_IBERFIT || '' }; }),
    decisions: decisiones.map(function(d) { return { date: d.FECHA_DECISION || '', semaforo: d.SEMAFORO || '', reason: d.MOTIVO || '', action: d.ACCION_RECOMENDADA || '', decision: d.DECISION_FINAL || '' }; }),
    draft: sanitizeAiPayload_(payload)
  };
}
function sanitizeAiPayload_(payload) {
  const out = {};
  ['title','type','audience','period','objective','criterion','sessionDraft','closeDraft','feedbackId','checkinId','currentText'].forEach(function(k) { if (payload[k] !== undefined) out[k] = sanitizeTextLong_(payload[k]); });
  return out;
}
function compactIriForAi_(r) { return { total: r.IRI_TOTAL || '', classification: r.CLASIFICACION || '', recommendation: r.RECOMENDACION || '', context: r.CONTEXTO || '', composition: r.COMPOSICION || '', mobility: r.MOVILIDAD || '', strength: r.FUERZA || '', metabolic: r.METABOLICO || '', limiters: r.LIMITADORES || '', decision: r.DECISION_IBERFIT || '' }; }
function compactBioForAi_(b) { return { date: b.FECHA_MEDICION || '', weight: b.PESO || '', fatPct: b.GRASA_PORCENTAJE || '', muscle: b.MASA_MUSCULAR || '', visceral: b.GRASA_VISCERAL || '', bmi: b.IMC || '', notes: b.OBSERVACIONES || '' }; }
function compactLoadForAi_(l) { return { date: l.FECHA_REGISTRO || '', sessionId: l.SESION_ID || '', exercise: l.EJERCICIO_TEXTO || '', pattern: l.PATRON || '', sets: l.SERIES || '', reps: l.REPETICIONES || '', time: l.TIEMPO || '', load: l.CARGA || '', unit: l.UNIDAD_CARGA || '', rpe: l.RPE || '', pain: l.MOLESTIA || '', notes: l.NOTAS_TECNICAS || '', decision: l.DECISION_IBERFIT || '' }; }
function compactSessionForAi_(s) { return { id: s.SESION_ID || '', title: s.TITULO_SESION || '', type: s.TIPO_SESION || '', mode: s.MODALIDAD_SESION || '', state: s.ESTADO_SESION || '', objective: s.OBJETIVO_SESION || '', criterion: s.CRITERIO_COACH || '', main: s.BLOQUE_PRINCIPAL || '', observe: s.QUE_OBSERVAR || '', adjust: s.COMO_AJUSTAR || '' }; }
function compactFeedbackForAi_(f) { return { id: f.FEEDBACK_ID || '', sessionId: f.SESION_ID || '', realization: f.REALIZACION || '', rpe: f.RPE || '', fatigue: f.FATIGA || '', energy: f.ENERGIA || '', pain: f.MOLESTIA || '', technique: f.DIFICULTAD_TECNICA || '', comment: f.COMENTARIO_CLIENTE || '', priority: f.PRIORIDAD || '', decision: f.DECISION_IBERFIT || '' }; }
function compactCheckinForAi_(c) { return { id: c.CHECKIN_ID || '', sleep: c.DESCANSO || '', fatigue: c.FATIGA_GENERAL || '', stress: c.ESTRES || '', energy: c.ENERGIA_GENERAL || '', pain: c.MOLESTIA_GENERAL || '', completed: c.SESIONES_COMPLETADAS || '', weight: c.PESO || '', comment: c.OBSERVACION_CLIENTE || '', decision: c.DECISION_IBERFIT || '' }; }

function geminiIberfitDraft_(mode, ctx, payload, local) {
  const props = PropertiesService.getScriptProperties();
  const key = props.getProperty('GEMINI_API_KEY') || props.getProperty('IBERFIT_GEMINI_API_KEY');
  if (!key) throw new Error('GEMINI_API_KEY no configurada');
  const model = props.getProperty('GEMINI_MODEL') || 'gemini-3.5-flash';
  const system = getIberfitAiSystemInstruction_();
  const input = buildGeminiPrompt_(mode, ctx, local);
  const body = {
    model: model,
    system_instruction: system,
    input: input,
    generation_config: { temperature: 0.55, thinking_level: 'low' }
  };
  const response = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-goog-api-key': key },
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  });
  const code = response.getResponseCode();
  const text = response.getContentText() || '';
  if (code < 200 || code >= 300) throw new Error('GEMINI_HTTP_' + code + ': ' + text.slice(0, 160));
  const json = JSON.parse(text || '{}');
  const output = extractGeminiOutputText_(json);
  if (!output) throw new Error('Gemini respondió sin texto utilizable');
  const fields = parseAiJsonFields_(output);
  return { model: model, raw: output, text: output, fields: fields };
}
function getIberfitAiSystemInstruction_() {
  return [
    'Eres el asistente técnico interno de IBERFIT.',
    'IBERFIT es entrenamiento personal premium basado en diagnóstico, planificación, control de carga, seguimiento y criterio humano.',
    'No inventes datos. Si falta información, indícalo como pendiente.',
    'No diagnostiques enfermedades, no prometas resultados, no sustituyas al coach.',
    'Usa español, tono sobrio, claro, técnico cuando corresponda y entendible para cliente.',
    'Explica el criterio detrás de la decisión sin sonar genérico.',
    'Diferencia siempre texto para cliente y texto interno coach.',
    'No recomiendes progresar si hay RPE alto, molestia relevante, fatiga alta o datos insuficientes.',
    'Devuelve exclusivamente JSON válido, sin markdown, sin texto fuera del JSON.'
  ].join('\n');
}
function buildGeminiPrompt_(mode, ctx, local) {
  return JSON.stringify({
    tarea: mode,
    formato_obligatorio: {
      title: 'string opcional',
      objective: 'string opcional',
      criterion: 'string opcional',
      indications: 'string opcional',
      observe: 'string opcional',
      adjust: 'string opcional',
      report: 'string opcional',
      clientVersion: 'string para cliente',
      internalVersion: 'string para coach',
      decision: 'string decisión IBERFIT',
      nextAction: 'string próxima acción'
    },
    contexto_iberfit: ctx,
    borrador_local_base: local.fields || {}
  });
}
function extractGeminiOutputText_(json) {
  if (!json) return '';
  if (json.output_text) return String(json.output_text);
  if (json.outputText) return String(json.outputText);
  if (json.text) return String(json.text);
  if (Array.isArray(json.steps)) {
    const parts = [];
    json.steps.forEach(function(step) {
      if (step && step.output_text) parts.push(step.output_text);
      if (step && Array.isArray(step.output)) step.output.forEach(function(o) { if (o && o.text) parts.push(o.text); });
    });
    if (parts.length) return parts.join('\n');
  }
  if (json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts) {
    return json.candidates[0].content.parts.map(function(p) { return p.text || ''; }).join('\n');
  }
  return '';
}
function parseAiJsonFields_(text) {
  let t = String(text || '').trim();
  t = t.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  const first = t.indexOf('{');
  const last = t.lastIndexOf('}');
  if (first >= 0 && last > first) t = t.slice(first, last + 1);
  try {
    const obj = JSON.parse(t);
    const out = {};
    Object.keys(obj || {}).forEach(function(k) { if (obj[k] !== null && obj[k] !== undefined) out[k] = sanitizeTextLong_(obj[k]); });
    return out;
  } catch (e) {
    return { clientVersion: sanitizeTextLong_(text), internalVersion: sanitizeTextLong_(text) };
  }
}
function mergeAiFields_(base, extra) {
  const out = Object.assign({}, base || {});
  Object.keys(extra || {}).forEach(function(k) { if (String(extra[k] || '').trim()) out[k] = sanitizeTextLong_(extra[k]); });
  return out;
}
function localAiIberfitDraft_(mode, ctx, payload) {
  const c = ctx.client || {};
  const iri = ctx.iri || {};
  const loads = ctx.loads || [];
  const feedback = ctx.feedback || [];
  const checkin = ctx.checkin || [];
  const highRpe = loads.filter(function(l) { return Number(l.rpe || 0) >= 9; }).length;
  const pain = loads.filter(function(l) { return Number(l.pain || 0) >= 5; }).length;
  const lastFb = feedback[0] || {};
  const lastChk = checkin[0] || {};
  const limiter = iri.limiters || iri.classification || 'datos aún incompletos';
  let semaforo = 'VERDE';
  if (highRpe || pain || Number(lastFb.pain || 0) >= 5 || Number(lastChk.fatigue || 0) >= 8) semaforo = 'ROJO';
  else if (Number(lastFb.rpe || 0) >= 8 || Number(lastChk.energy || 10) <= 4 || limiter) semaforo = 'AMARILLO';
  const baseDecision = semaforo === 'ROJO'
    ? 'No progresar carga ni volumen. Revisar técnica, fatiga y molestias antes de avanzar.'
    : semaforo === 'AMARILLO'
      ? 'Progresar con prudencia, sin subir carga y volumen a la vez, observando respuesta real.'
      : 'Puede progresar de forma gradual si la técnica se mantiene estable y el RPE queda controlado.';
  const clientText = 'Hoy buscamos avanzar con criterio: priorizar técnica, continuidad y una carga ajustada a tu respuesta real. El objetivo es progresar sin perseguir fatiga innecesaria.';
  const internalText = 'Lectura IA local IBERFIT. Cliente: ' + (c.name || c.id) + '. Objetivo: ' + (c.objective || 'pendiente') + '. IRI: ' + (iri.total || 'sin dato') + ' · ' + (iri.classification || 'sin clasificación') + '. Limitadores: ' + limiter + '. RPE alto histórico: ' + highRpe + '. Molestias relevantes: ' + pain + '. Decisión: ' + baseDecision;
  const fields = { title: 'Informe IBERFIT · ' + (c.name || 'cliente'), clientVersion: clientText, internalVersion: internalText, decision: baseDecision, nextAction: baseDecision };
  if (mode === 'SESSION') {
    fields.title = 'Sesión IBERFIT · ' + (c.objective || 'progresión controlada');
    fields.objective = c.objective || 'Consolidar técnica y adherencia antes de progresar.';
    fields.criterion = 'Hoy priorizamos ' + (iri.classification ? 'una progresión compatible con IRI ' + iri.classification : 'una carga conservadora') + '. ' + baseDecision;
    fields.indications = 'Trabajar con RPE objetivo 6–8, técnica estable y registro claro de molestias, energía y percepción de esfuerzo.';
    fields.observe = 'Observar técnica, RPE, dolor/molestia, velocidad de ejecución y tolerancia al volumen.';
    fields.adjust = semaforo === 'ROJO' ? 'Reducir complejidad o carga; cambiar variante si aparece molestia.' : 'Ajustar una variable a la vez: carga, repeticiones o descanso.';
    fields.report = 'Reportar RPE global, molestia, energía y comentario sobre el ejercicio más desafiante.';
    fields.preparation = 'Movilidad específica + activación técnica.';
    fields.mainBlock = 'Bloque principal según objetivo y patrón prioritario.';
    fields.coolDown = 'Vuelta a la calma breve y registro de respuesta.';
  }
  if (mode === 'IRI') {
    fields.recommendation = iri.recommendation || baseDecision;
    fields.decision = baseDecision + ' Mantener seguimiento del limitador principal: ' + limiter + '.';
  }
  if (mode === 'CLOSE_SESSION') {
    fields.internalSummary = internalText + ' Cierre: validar cargas registradas y decidir próxima progresión.';
    fields.clientSummary = clientText + ' Se revisará tu respuesta para ajustar la próxima sesión.';
  }
  return { fields: fields, text: internalText, raw: '' };
}
function adminSetGeminiApiKey(apiKey, model) {
  if (!apiKey) throw new Error('Falta apiKey. Ejecútalo solo dentro de Apps Script; no pegues la clave en chats ni frontend.');
  const props = PropertiesService.getScriptProperties();
  props.setProperty('GEMINI_API_KEY', String(apiKey).trim());
  props.setProperty('GEMINI_MODEL', String(model || 'gemini-3.5-flash').trim());
  return { ok: true, geminiConfigured: true, model: props.getProperty('GEMINI_MODEL') };
}
function adminGeminiProbe() {
  const props = PropertiesService.getScriptProperties();
  return { ok: true, geminiConfigured: !!(props.getProperty('GEMINI_API_KEY') || props.getProperty('IBERFIT_GEMINI_API_KEY')), model: props.getProperty('GEMINI_MODEL') || 'gemini-3.5-flash' };
}

function coachCerrarSesionPresencial_(payload, coach) {
  const clientId = String(payload.clientId || '').trim();
  const sessionId = String(payload.sessionId || '').trim();
  if (!clientId || !sessionId) return { ok: false, status: 'BAD_REQUEST', message: 'Falta cliente o sesión.' };
  requireClienteExiste_(clientId);
  const s = requireSesionCliente_(sessionId, clientId);
  const drafts = Array.isArray(payload.loadDrafts) ? payload.loadDrafts : [];
  drafts.forEach(function(d, idx) {
    const ejercicio = sanitizeText_(d.exercise || d.ejercicio || '');
    if (!ejercicio) throw new Error('Borrador de carga ' + (idx + 1) + ': falta ejercicio.');
    const draftSession = String(d.sessionId || sessionId || '').trim();
    if (draftSession && String(draftSession) !== String(sessionId)) throw new Error('Borrador de carga ' + (idx + 1) + ': la sesión no coincide.');
  });
  drafts.forEach(function(d) { coachGuardarCarga_(Object.assign({}, d, { clientId: clientId, sessionId: sessionId }), coach); });
  const report = coachGuardarInforme_({ clientId: clientId, type: 'Sesión presencial', state: 'INTERNO', title: 'Resumen post-sesión · ' + sessionId, internalVersion: sanitizeTextLong_(payload.internalSummary || ''), clientVersion: sanitizeTextLong_(payload.clientSummary || ''), decision: sanitizeTextLong_(payload.decision || '') }, coach);
  updateRowByNumber_(IBERFIT.SHEETS.SESIONES, s.__rowNumber, { ESTADO_SESION: 'COMPLETADA', ACTUALIZADO_EN: new Date() });
  log_('COACH_CLOSE_PRESENTIAL_SESSION', clientId, 'OK', sessionId);
  return { ok: true, status: 'OK', data: { sessionId: sessionId, closed: true, report: report.data || {} } };
}

function coachLogout_(payload, coach) {
  revokeCoachSession_(coach.coachToken, coach.login, coach.login, 'Cierre explícito desde Coach OS');
  log_('COACH_LOGOUT', '', 'OK', coach.login);
  return { ok: true, status: 'OK', data: { loggedOut: true } };
}

function adminRevocarSesionesCoach() {
  const rows = safeRows_(IBERFIT.SHEETS.SESIONES_ACTIVAS).filter(sa => String(sa.CLIENTE_ID) === '__COACH__' && normalize_(sa.ESTADO_SESION_ACCESO) === 'ACTIVA');
  rows.forEach(sa => updateRowByNumber_(IBERFIT.SHEETS.SESIONES_ACTIVAS, sa.__rowNumber, { ESTADO_SESION_ACCESO: 'REVOCADA', FECHA_REVOCACION: new Date(), REVOCADO_POR: 'ADMIN', OBSERVACION: 'Revocación administrativa Coach OS' }));
  return { ok: true, revoked: rows.length };
}


function adminEnsureV93SheetStructure() {
  return adminEnsureV90SheetStructure();
}
function adminEnsureV92SheetStructure() {
  return adminEnsureV90SheetStructure();
}

/* ───────────────────────── DTOs ───────────────────────── */
function coachWeekDTO_(w) { return { id: w.SEMANA_ID || '', clientId: w.CLIENTE_ID || '', number: w.SEMANA_NUMERO || '', title: w.TITULO_SEMANA || '', focus: w.FOCO_SEMANA || '', message: w.MENSAJE_IBERFIT || '', state: w.ESTADO_SEMANA || '', startDate: w.FECHA_INICIO || '', endDate: w.FECHA_FIN || '' }; }
function coachSessionDTO_(s) { return { id: s.SESION_ID || '', weekId: s.SEMANA_ID || '', clientId: s.CLIENTE_ID || '', deliveryMode: s.MODALIDAD_SESION || '', title: s.TITULO_SESION || '', type: s.TIPO_SESION || '', duration: s.DURACION_ESTIMADA_MIN || '', state: s.ESTADO_SESION || '', objective: s.OBJETIVO_SESION || '', criterion: s.CRITERIO_COACH || '', preparation: s.PREPARACION || '', mainBlock: s.BLOQUE_PRINCIPAL || '', coolDown: s.VUELTA_CALMA || '', indications: s.INDICACIONES || '', material: s.MATERIAL_NECESARIO || '', structure: s.ESTRUCTURA_SESION || '', blocksJson: s.ESTRUCTURA_JSON || '', observe: s.QUE_OBSERVAR || '', adjust: s.COMO_AJUSTAR || '', report: s.QUE_REPORTAR || '', order: s.ORDEN || '' }; }
function coachFeedbackDTO_(f) { return { id: f.FEEDBACK_ID || '', date: f.FECHA_ENVIO || '', clientId: f.CLIENTE_ID || '', sessionId: f.SESION_ID || '', realization: f.REALIZACION || '', rpe: f.RPE || '', fatigue: f.FATIGA || '', energy: f.ENERGIA || '', pain: f.MOLESTIA || '', technique: f.DIFICULTAD_TECNICA || '', comment: f.COMENTARIO_CLIENTE || '', priority: f.PRIORIDAD || '', decision: f.DECISION_IBERFIT || '', reviewedBy: f.REVISADO_POR || '', reviewDate: f.FECHA_REVISION || '' }; }
function coachCheckinDTO_(c) { return { id: c.CHECKIN_ID || '', date: c.FECHA_ENVIO || '', clientId: c.CLIENTE_ID || '', weekId: c.SEMANA_ID || '', sleep: c.DESCANSO || '', fatigue: c.FATIGA_GENERAL || '', stress: c.ESTRES || '', energy: c.ENERGIA_GENERAL || '', pain: c.MOLESTIA_GENERAL || '', completedSessions: c.SESIONES_COMPLETADAS || '', weight: c.PESO || '', comment: c.OBSERVACION_CLIENTE || '', reviewState: c.ESTADO_REVISION || '', decision: c.DECISION_IBERFIT || '' }; }
function exerciseDTO_(e) { return { id: e.EJERCICIO_ID || '', name: e.NOMBRE_EJERCICIO || '', pattern: e.PATRON || '', zone: e.ZONA || '', material: e.MATERIAL || '', level: e.NIVEL || '', objective: e.OBJETIVO || '', cues: e.INDICACIONES_TECNICAS || '', errors: e.ERRORES_COMUNES || '', regression: e.REGRESION || '', progression: e.PROGRESION || '' }; }
function loadDTO_(c) { return { id: c.CARGA_ID || '', date: c.FECHA_REGISTRO || '', clientId: c.CLIENTE_ID || '', sessionId: c.SESION_ID || '', exerciseId: c.EJERCICIO_ID || '', exercise: c.EJERCICIO_TEXTO || '', pattern: c.PATRON || '', modality: c.MODALIDAD_SESION || '', sets: c.SERIES || '', reps: c.REPETICIONES || '', time: c.TIEMPO || '', load: c.CARGA || '', unit: c.UNIDAD_CARGA || 'kg', rpe: c.RPE || '', rest: c.DESCANSO || '', volume: c.VOLUMEN_ESTIMADO || '', pain: c.MOLESTIA || '', notes: c.NOTAS_TECNICAS || '', decision: c.DECISION_IBERFIT || '', recommendation: deriveLoadRecommendation_(c), trend: deriveLoadTrend_(c) }; }
function reportDTO_(r) { return { id: r.INFORME_ID || '', date: r.FECHA_CREACION || '', clientId: r.CLIENTE_ID || '', type: r.TIPO_INFORME || '', title: r.TITULO_INFORME || '', state: r.ESTADO_INFORME || '', clientVisible: normalize_(r.ESTADO_INFORME) === 'PUBLICADO' ? 'Sí' : 'No', clientVersion: r.VERSION_CLIENTE || '', internalSummary: r.VERSION_INTERNA || '', url: r.URL_PDF || '', attached: r.ADJUNTO_FICHA || '', decision: r.DECISION_IBERFIT || '' }; }
function clientReportDTO_(r) { return { id: r.INFORME_ID || '', date: r.FECHA_CREACION || '', type: r.TIPO_INFORME || '', title: r.TITULO_INFORME || '', state: r.ESTADO_INFORME || '', clientVisible: 'Sí', clientVersion: r.VERSION_CLIENTE || '', url: r.URL_PDF || '' }; }
function mediaDTO_(m) { return { id: m.MEDIA_ID || '', exerciseId: m.EJERCICIO_ID || '', exercise: m.NOMBRE_EJERCICIO || '', type: m.TIPO_MEDIA || '', url: m.URL || '', source: m.FUENTE || '', license: m.LICENCIA || '', author: m.AUTOR || '', status: m.ESTADO_APROBACION || '', notes: m.NOTAS || '' }; }
function deriveLoadRecommendation_(c) { const rpe = Number(c.RPE || 0); const pain = Number(c.MOLESTIA || 0); if (pain >= 5 || rpe >= 9) return 'Reducir o cambiar variante. Revisar técnica y fatiga.'; if (pain > 0 || rpe >= 8) return 'Mantener carga y observar respuesta antes de progresar.'; if (rpe > 0 && rpe <= 7) return 'Puede existir margen de progresión prudente si la técnica es estable.'; return 'Registrar más datos antes de recomendar carga.'; }
function deriveLoadTrend_(c) { const rpe = Number(c.RPE || 0); const pain = Number(c.MOLESTIA || 0); if (pain >= 5 || rpe >= 9) return 'Riesgo'; if (pain > 0 || rpe >= 8) return 'Prudencia'; if (rpe > 0 && rpe <= 7) return 'Margen'; return 'Sin tendencia'; }
function sessionTemplateDTO_(p) { return { id: p.PLANTILLA_SESION_ID || '', name: p.NOMBRE_PLANTILLA || '', type: p.TIPO_SESION || '', deliveryMode: p.MODALIDAD_SESION || '', duration: p.DURACION_ESTIMADA_MIN || '', objective: p.OBJETIVO_SESION || '', criterion: p.CRITERIO_COACH || '', preparation: p.PREPARACION || '', mainBlock: p.BLOQUE_PRINCIPAL || '', coolDown: p.VUELTA_CALMA || '', indications: p.INDICACIONES || '', material: p.MATERIAL_NECESARIO || '' }; }
function alertDTO_(a) { return { id: a.ALERTA_ID || '', date: a.FECHA_CREACION || '', clientId: a.CLIENTE_ID || '', origin: a.ORIGEN || '', priority: a.PRIORIDAD || '', state: a.ESTADO_ALERTA || '', message: a.MENSAJE || '', decision: a.DECISION_IBERFIT || '' }; }
function iriClientDTO_(i) { return { id: i.IRI_ID || '', date: i.FECHA_EVALUACION || '', total: i.IRI_TOTAL || '', classification: i.CLASIFICACION || '', recommendation: i.RECOMENDACION || '', status: i.INFORME_ESTADO || 'PENDIENTE', summary: [i.CLASIFICACION, i.RECOMENDACION].filter(Boolean).join(' · ') }; }
function iriCoachDTO_(i) { return iriClientDTO_(i || {}); }
function deriveTrendLabel_(rpes) { if (!rpes || !rpes.length) return 'Sin registros suficientes todavía. IBERFIT interpretará la tendencia cuando existan feedbacks.'; const last = rpes.slice(-3); const avg = Math.round((last.reduce((a,b)=>a+b,0)/last.length)*10)/10; if (avg >= 8.5) return 'Tendencia exigente. Revisar carga, recuperación y técnica antes de progresar.'; if (avg <= 5.5) return 'Tendencia cómoda. Puede existir margen para progresar si la técnica es estable.'; return 'Respuesta estable dentro del rango esperado para progresión controlada.'; }

/* ───────────────────────── Setup, QA y utilidades ───────────────────────── */

function adminEnsureV84SheetStructure() {
  const book = ss_();
  Object.keys(IBERFIT.HEADERS).forEach(name => {
    let sh = book.getSheetByName(name);
    if (!sh) sh = book.insertSheet(name);
    const required = IBERFIT.HEADERS[name];
    const lastRow = sh.getLastRow();
    const lastCol = sh.getLastColumn();
    let currentHeaders = [];
    let data = [];
    if (lastCol > 0) {
      try { currentHeaders = sh.getRange(5, 1, 1, Math.max(lastCol, 1)).getValues()[0].map(String); } catch(e) { currentHeaders = []; }
      if (lastRow >= 6) data = sh.getRange(6, 1, lastRow - 5, Math.max(lastCol, 1)).getValues();
    }
    const finalHeaders = required.concat(currentHeaders.filter(h => h && required.indexOf(h) === -1));
    if (sh.getLastRow() < 5) sh.getRange(1, 1, 5, Math.max(finalHeaders.length, 1)).clearContent();
    const indexByHeader = {};
    currentHeaders.forEach((h, i) => { if (h && indexByHeader[h] === undefined) indexByHeader[h] = i; });
    const rebuilt = data.map(row => finalHeaders.map(h => indexByHeader[h] !== undefined ? row[indexByHeader[h]] : ''));
    const clearRows = Math.max(lastRow - 4, 1);
    const clearCols = Math.max(lastCol, finalHeaders.length, 1);
    if (lastRow >= 5) sh.getRange(5, 1, clearRows, clearCols).clearContent();
    sh.getRange(1, 1).setValue('IBERFIT · ' + name.replace(/_/g, ' '));
    sh.getRange(2, 1).setValue('Ecosistema operativo V9.3 · App Coach + App Client');
    sh.getRange(5, 1, 1, finalHeaders.length).setValues([finalHeaders]);
    if (rebuilt.length) sh.getRange(6, 1, rebuilt.length, finalHeaders.length).setValues(rebuilt);
    sh.setFrozenRows(5);
    try {
      sh.getRange(1, 1, 1, finalHeaders.length).setBackground('#1F3D2B').setFontColor('#F7F4EE').setFontWeight('bold');
      sh.getRange(2, 1, 1, finalHeaders.length).setBackground('#F7F4EE').setFontColor('#1F3D2B').setFontWeight('bold');
      sh.getRange(5, 1, 1, finalHeaders.length).setBackground('#B8973A').setFontColor('#FFFFFF').setFontWeight('bold').setWrap(true);
      sh.autoResizeColumns(1, Math.min(finalHeaders.length, 12));
    } catch(e) {}
  });
  cleanActiveSessionsPlaceholders_();
  ensureDefaultConfig_();
  return serverProbe_();
}
function adminEnsureV90SheetStructure() {
  const probe = adminEnsureV84SheetStructure();
  ordenarPestanasV90_();
  return probe;
}
function ordenarPestanasV90_() {
  const book = ss_();
  const order = ['00 Panel','01 Clientes','02 Ficha Cliente','03 Planes','04 Semanas','05 Sesiones','06 Sesión Presencial','07 Cargas','08 Histórico de Cargas','09 Feedback','10 Check-in','11 Diagnóstico IRI','12 Bioimpedancia','13 Informes','14 Gráficas','15 Biblioteca Ejercicios','16 Multimedia Ejercicios','17 Plantillas Semana','18 Plantillas Sesión','19 Bloques Sesión','20 Alertas','21 Accesos','22 Activaciones','23 Sesiones Activas','24 Decisiones IBERFIT','25 Configuración','26 Listas','99 Registro'];
  order.forEach(function(name, idx) { const sh = book.getSheetByName(name); if (sh) { book.setActiveSheet(sh); book.moveActiveSheet(idx + 1); } });
}
function adminEnsureV83SheetStructure() { return adminEnsureV84SheetStructure(); }

function adminEnsureV82SheetStructure() { return adminEnsureV84SheetStructure(); }
function adminSetupSecuritySecrets() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('IBERFIT_TOKEN_PEPPER')) props.setProperty('IBERFIT_TOKEN_PEPPER', Utilities.getUuid() + Utilities.getUuid());
  if (!props.getProperty('IBERFIT_WORKER_SECRET')) props.setProperty('IBERFIT_WORKER_SECRET', 'IBF-WORKER-' + Utilities.getUuid());
  return { ok: true, tokenPepperConfigured: true, workerSecretConfigured: true, next: 'Copia IBERFIT_WORKER_SECRET en Cloudflare y conserva IBERFIT_TOKEN_PEPPER solo en Apps Script.' };
}
function adminSetupCoachAccess(login, password, coachName) {
  const finalLogin = String(login || '').trim().toLowerCase();
  const finalPassword = String(password || '').trim();
  if (!finalLogin || !finalPassword) throw new Error('Indica login y contraseña para Coach OS.');
  passwordPolicy_(finalPassword);
  const salt = Utilities.getUuid();
  const hash = hashPassword_(finalPassword, salt);
  const props = PropertiesService.getScriptProperties();
  props.setProperty('IBERFIT_COACH_LOGIN', finalLogin);
  props.setProperty('IBERFIT_COACH_PASSWORD_HASH', hash);
  props.setProperty('IBERFIT_COACH_PASSWORD_SALT', salt);
  if (coachName) props.setProperty('IBERFIT_COACH_NAME', String(coachName).trim());
  if (!props.getProperty('IBERFIT_TOKEN_PEPPER')) props.setProperty('IBERFIT_TOKEN_PEPPER', Utilities.getUuid() + Utilities.getUuid());
  return { ok: true, login: finalLogin, next: 'Acceso Coach OS configurado. La contraseña no se guarda en texto plano.' };
}
function adminSetupWorkerSecret(secret) {
  const finalSecret = secret || ('IBF-WORKER-' + Utilities.getUuid());
  PropertiesService.getScriptProperties().setProperty('IBERFIT_WORKER_SECRET', finalSecret);
  return { ok: true, workerSecret: finalSecret, next: 'Copiar este valor en Cloudflare como IBERFIT_WORKER_SECRET. No compartir públicamente.' };
}
function adminSetAppBaseUrl(url) {
  setConfig_('APP_BASE_URL', String(url || '').replace(/\/$/, ''), 'Base pública de la App Client para enlaces de activación.');
  return { ok: true, url: String(url || '').replace(/\/$/, '') };
}
function apiContractProbe_() {
  const props = PropertiesService.getScriptProperties();
  return {
    ok: true,
    status: 'OK',
    service: 'IBERFIT Apps Script Backend',
    version: IBERFIT.VERSION,
    contract: {
      coachLogin: { action: 'coachLogin', fields: ['login', 'password'] },
      workerSecretField: 'workerSecret',
      aiHybrid: { action: 'coachAiGenerate', provider: 'Gemini opcional + IA local fallback', requiresCoachToken: true }
    },
    security: {
      workerSecretConfigured: !!props.getProperty('IBERFIT_WORKER_SECRET'),
      coachLoginConfigured: !!props.getProperty('IBERFIT_COACH_LOGIN'),
      coachPasswordConfigured: !!props.getProperty('IBERFIT_COACH_PASSWORD_HASH') && !!props.getProperty('IBERFIT_COACH_PASSWORD_SALT'),
      tokenPepperConfigured: !!props.getProperty('IBERFIT_TOKEN_PEPPER'),
      geminiConfigured: !!(props.getProperty('GEMINI_API_KEY') || props.getProperty('IBERFIT_GEMINI_API_KEY'))
    }
  };
}
function serverProbe_() {
  const required = Object.keys(IBERFIT.SHEETS).map(k => IBERFIT.SHEETS[k]);
  const result = { ok: true, version: IBERFIT.VERSION, spreadsheet: ss_().getName(), sheets: {} };
  result.security = {
    tokenPepperConfigured: !!PropertiesService.getScriptProperties().getProperty('IBERFIT_TOKEN_PEPPER'),
    workerSecretConfigured: !!PropertiesService.getScriptProperties().getProperty('IBERFIT_WORKER_SECRET'),
    coachConfigured: !!PropertiesService.getScriptProperties().getProperty('IBERFIT_COACH_LOGIN'),
    geminiConfigured: !!(PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || PropertiesService.getScriptProperties().getProperty('IBERFIT_GEMINI_API_KEY'))
  };
  required.forEach(name => {
    const sh = ss_().getSheetByName(name);
    const requiredHeaders = IBERFIT.HEADERS[name] || [];
    let headers = [];
    let missingHeaders = requiredHeaders.slice();
    if (sh && sh.getLastColumn() > 0) {
      try { headers = headers_(sh).map(String).map(h => h.trim()).filter(Boolean); missingHeaders = requiredHeaders.filter(h => headers.indexOf(h) === -1); } catch(e) {}
    }
    const ok = !!sh && missingHeaders.length === 0;
    result.sheets[name] = { ok, rows: sh ? sh.getLastRow() : 0, cols: sh ? sh.getLastColumn() : 0, missingHeaders };
    if (!ok) result.ok = false;
  });
  return { ok: result.ok, status: result.ok ? 'OK' : 'SHEET_CONTRACT_FAIL', data: result };
}
function getConfig_(key) {
  const row = findBy_(safeRows_(IBERFIT.SHEETS.CONFIG), 'CLAVE', key);
  return row ? row.VALOR : '';
}
function setConfig_(key, value, description) {
  const rows = safeRows_(IBERFIT.SHEETS.CONFIG);
  const row = findBy_(rows, 'CLAVE', key);
  const updates = { CLAVE: key, VALOR: value, DESCRIPCION: description || '', ACTUALIZADO_EN: new Date() };
  if (row) updateRowByNumber_(IBERFIT.SHEETS.CONFIG, row.__rowNumber, updates); else appendObject_(IBERFIT.SHEETS.CONFIG, updates);
}
function ensureDefaultConfig_() {
  if (!getConfig_('APP_BASE_URL')) setConfig_('APP_BASE_URL', 'https://iberfit.cl', 'Base pública de la App Client. Ajustar con adminSetAppBaseUrl si se usa staging.');
}
function cleanActiveSessionsPlaceholders_() {
  safeRows_(IBERFIT.SHEETS.SESIONES_ACTIVAS).forEach(sa => {
    const noToken = !String(sa.TOKEN_HASH || '').trim();
    const noClient = !String(sa.CLIENTE_ID || '').trim();
    if (normalize_(sa.ESTADO_SESION_ACCESO) === 'ACTIVA' && (noToken || noClient)) {
      updateRowByNumber_(IBERFIT.SHEETS.SESIONES_ACTIVAS, sa.__rowNumber, { ESTADO_SESION_ACCESO: 'ANULADA', FECHA_REVOCACION: new Date(), REVOCADO_POR: 'MIGRACION_V9_3', OBSERVACION: 'Fila placeholder anulada por estructura V9.3' });
    }
  });
}
function crearAlerta_(clientId, origin, priority, message) {
  appendObject_(IBERFIT.SHEETS.ALERTAS, { ALERTA_ID: nextId_('ALT'), FECHA_CREACION: new Date(), CLIENTE_ID: clientId, ORIGEN: origin, PRIORIDAD: priority, ESTADO_ALERTA: 'ABIERTA', MENSAJE: sanitizeTextLong_(message), DECISION_IBERFIT: '', RESUELTO_POR: '', FECHA_RESOLUCION: '' });
}
function parseBlocks_(value) { const raw = String(value || '').trim(); if (!raw) return []; try { const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed : []; } catch(e) { return []; } }
function validateScale_(value, label) { const n = Number(value); if (!Number.isFinite(n) || n < 1 || n > 10) throw new Error(label + ' debe estar entre 1 y 10.'); return n; }
function sanitizeText_(value) { return String(value || '').replace(/[<>]/g, '').slice(0, 1200); }
function sanitizeTextLong_(value) { return String(value || '').replace(/[<>]/g, '').slice(0, 6000); }
function maskEmail_(email) { const e = String(email || ''); const p = e.split('@'); if (p.length !== 2) return e; return p[0].slice(0, 2) + '***@' + p[1]; }
function log_(action, clienteId, estado, detalle) { try { appendObject_(IBERFIT.SHEETS.LOG, { LOG_ID: nextId_('LOG'), FECHA_HORA: new Date(), ORIGEN: 'APPS_SCRIPT', ACCION: action, USUARIO: 'IBERFIT_BACKEND', CLIENTE_ID: clienteId || '', ESTADO: estado || '', DETALLE: sanitizeText_(detalle || '') }); } catch(e) {} }
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function safeMessage_(err) { return String(err && err.message ? err.message : err).slice(0, 500); }


/* ───────────────────────── IBERFIT V9.6 · IA Planificador de sesiones ─────────────────────────
   Este bloque sobreescribe funciones IA de V9.5 para convertir Gemini/local en un copiloto operativo:
   - sesión completa editable
   - revisión crítica
   - reemplazos de ejercicio
   - adaptación en vivo
   - auditoría y onboarding
   Las decisiones finales siguen siendo humanas y el sistema local queda como fallback.
*/

function coachAiGenerate_(payload, coach) {
  const clientId = String(payload.clientId || '').trim();
  if (!clientId) return { ok: false, status: 'BAD_REQUEST', message: 'Falta CLIENTE_ID.' };
  requireClienteExiste_(clientId);
  const validModes = ['SESSION','SESSION_FULL','SESSION_REVIEW','EXERCISE_REPLACE','LIVE_ADAPTATION','REPORT','IRI','DECISION','FEEDBACK','CHECKIN','CLOSE_SESSION','WEEK_PLAN','ONBOARDING','AUDIT','CLIENT_TEXT'];
  const mode = normalizeValue_(payload.mode || payload.tipo || 'DECISION', validModes, 'DECISION');
  const ctx = buildAiContextIberfit_(clientId, mode, payload);
  const local = localAiIberfitDraft_(mode, ctx, payload);
  const providerRequest = String(payload.provider || 'AUTO').toUpperCase();
  let finalDraft = local;
  let provider = 'LOCAL';
  let warning = '';
  let model = '';
  if (providerRequest !== 'LOCAL') {
    try {
      const gemini = geminiIberfitDraft_(mode, ctx, payload, local);
      if (gemini && gemini.fields) {
        finalDraft = { fields: mergeAiFields_(local.fields, gemini.fields), raw: gemini.raw || '', text: gemini.text || '' };
        provider = 'GEMINI';
        model = gemini.model || '';
      }
    } catch (err) {
      provider = 'LOCAL';
      warning = 'Gemini no disponible; se usó IA local IBERFIT. ' + String(err && err.message ? err.message : err).slice(0, 180);
    }
  }
  log_('COACH_AI_GENERATE_V96', clientId, provider, mode + (warning ? ' · ' + warning : ''));
  return { ok: true, status: 'OK', data: { provider: provider, fallback: provider !== 'GEMINI', model: model, mode: mode, fields: finalDraft.fields || {}, raw: finalDraft.raw || finalDraft.text || '', warning: warning, generatedAt: new Date() } };
}

function buildAiContextIberfit_(clientId, mode, payload) {
  const cliente = requireClienteExiste_(clientId);
  const iri = safeRows_(IBERFIT.SHEETS.IRI).filter(r => String(r.CLIENTE_ID) === clientId).slice(-1)[0] || {};
  const bio = safeRows_(IBERFIT.SHEETS.BIOIMPEDANCIA).filter(r => String(r.CLIENTE_ID) === clientId).slice(-3).reverse();
  const cargasActuales = safeRows_(IBERFIT.SHEETS.CARGAS).filter(r => String(r.CLIENTE_ID) === clientId).slice(-40).reverse();
  const historico = safeRows_(IBERFIT.SHEETS.HISTORICO_CARGAS).filter(r => String(r.CLIENTE_ID) === clientId).slice(-90).reverse();
  const sesiones = safeRows_(IBERFIT.SHEETS.SESIONES).filter(r => String(r.CLIENTE_ID) === clientId).slice(-12).reverse();
  const feedback = safeRows_(IBERFIT.SHEETS.FEEDBACK).filter(r => String(r.CLIENTE_ID) === clientId).slice(-10).reverse();
  const checkin = safeRows_(IBERFIT.SHEETS.CHECKIN).filter(r => String(r.CLIENTE_ID) === clientId).slice(-8).reverse();
  const alertas = safeRows_(IBERFIT.SHEETS.ALERTAS).filter(r => String(r.CLIENTE_ID) === clientId && normalize_(r.ESTADO_ALERTA) !== 'RESUELTA').slice(-10).reverse();
  const decisiones = safeRows_(IBERFIT.SHEETS.DECISIONES).filter(r => String(r.CLIENTE_ID) === clientId).slice(-8).reverse();
  const biblioteca = selectLibraryForAi_(payload, cargasActuales, historico);
  return {
    mode: mode,
    client: {
      id: cliente.CLIENTE_ID || '',
      name: cliente.NOMBRE_VISIBLE || 'Cliente IBERFIT',
      modality: cliente.MODALIDAD || '',
      objective: cliente.OBJETIVO_PRINCIPAL || '',
      status: cliente.ESTADO || '',
      notes: sanitizeTextLong_(cliente.OBSERVACIONES || '')
    },
    iri: compactIriForAi_(iri),
    bio: bio.map(compactBioForAi_),
    loads: cargasActuales.map(compactCurrentLoadForAi_),
    history: historico.map(compactLoadForAi_),
    sessions: sesiones.map(compactSessionForAi_),
    feedback: feedback.map(compactFeedbackForAi_),
    checkin: checkin.map(compactCheckinForAi_),
    alerts: alertas.map(function(a) { return { priority: a.PRIORIDAD || '', message: a.MENSAJE || '', decision: a.DECISION_IBERFIT || '' }; }),
    decisions: decisiones.map(function(d) { return { date: d.FECHA_DECISION || '', semaforo: d.SEMAFORO || '', reason: d.MOTIVO || '', action: d.ACCION_RECOMENDADA || '', decision: d.DECISION_FINAL || '' }; }),
    library: biblioteca,
    draft: sanitizeAiPayload_(payload)
  };
}

function compactCurrentLoadForAi_(l) {
  return { exercise: l.EJERCICIO || l.EJERCICIO_TEXTO || '', lastLoad: l.ULTIMA_CARGA || l.CARGA || '', rpe: l.RPE || '', trend: l.TENDENCIA || '', recommendation: l.RECOMENDACION || '', pattern: l.PATRON || '' };
}

function selectLibraryForAi_(payload, cargas, historico) {
  const raw = safeRows_(IBERFIT.SHEETS.BIBLIOTECA).filter(function(e) { return normalize_(e.ESTADO || 'ACTIVO') !== 'INACTIVO'; });
  const txt = [payload.objective, payload.focus, payload.material, payload.exerciseName, payload.currentSessionJson, payload.sessionDraft].join(' ').toLowerCase();
  const used = {};
  [].concat(cargas || [], historico || []).forEach(function(x) { const n = normalize_(x.EJERCICIO || x.EJERCICIO_TEXTO || x.exercise || ''); if (n) used[n] = true; });
  const scored = raw.map(function(e) {
    let score = 0;
    const row = [e.NOMBRE_EJERCICIO, e.PATRON, e.ZONA, e.MATERIAL, e.NIVEL, e.OBJETIVO, e.INDICACIONES_TECNICAS, e.REGRESION, e.PROGRESION].join(' ').toLowerCase();
    if (used[normalize_(e.NOMBRE_EJERCICIO || '')]) score += 6;
    ['sentadilla','bisagra','empuje','tracción','traccion','core','rotación','rotacion','metabólico','metabolico','movilidad'].forEach(function(k){ if (txt.indexOf(k) >= 0 && row.indexOf(k) >= 0) score += 3; });
    ['mancuerna','banda','trx','barra','banco','peso corporal','gimnasio','casa'].forEach(function(k){ if (txt.indexOf(k) >= 0 && row.indexOf(k) >= 0) score += 2; });
    if (!score) score = 1;
    return { e: e, score: score };
  }).sort(function(a,b){ return b.score - a.score; }).slice(0, 120);
  return scored.map(function(x) { const e = x.e; return { id: e.EJERCICIO_ID || '', name: e.NOMBRE_EJERCICIO || '', pattern: e.PATRON || '', zone: e.ZONA || '', material: e.MATERIAL || '', level: e.NIVEL || '', objective: e.OBJETIVO || '', cues: e.INDICACIONES_TECNICAS || '', errors: e.ERRORES_COMUNES || '', regression: e.REGRESION || '', progression: e.PROGRESION || '' }; });
}

function sanitizeAiPayload_(payload) {
  const out = {};
  ['title','type','audience','period','objective','criterion','sessionDraft','currentSessionJson','closeDraft','feedbackId','checkinId','currentText','desiredDuration','material','focus','constraints','exerciseName','replaceReason','liveIssue','coachInstruction','modalidad','deliveryMode'].forEach(function(k) {
    if (payload[k] !== undefined) out[k] = sanitizeAiFieldValue_(payload[k]);
  });
  return out;
}

function sanitizeAiFieldValue_(v) {
  if (v === null || v === undefined) return '';
  if (Object.prototype.toString.call(v) === '[object Array]') return v.slice(0, 60).map(sanitizeAiFieldValue_);
  if (typeof v === 'object') {
    const o = {};
    Object.keys(v).slice(0, 80).forEach(function(k) { o[sanitizeText_(k)] = sanitizeAiFieldValue_(v[k]); });
    return o;
  }
  return sanitizeTextLong_(v);
}

function buildGeminiPrompt_(mode, ctx, local) {
  const fullSessionSchema = {
    title: 'string',
    type: 'Fuerza | Hipertrofia | Full body | Metabólica | Movilidad | Evaluación IRI',
    duration: 'string minutos',
    deliveryMode: 'PRESENCIAL | AUTONOMA | ONLINE | COMPLEMENTARIA | EVALUACION',
    objective: 'string',
    criterion: 'string criterio técnico IBERFIT',
    indications: 'string visible para cliente',
    material: 'string',
    observe: 'string',
    adjust: 'string',
    report: 'string',
    blocks: [{ title: 'string', focus: 'string', exercises: [{ name: 'string de biblioteca si es posible', sets: 'string', reps: 'string', time: 'string opcional', load: 'string sugerida con prudencia', rest: 'string', rpe: 'string', note: 'string', regression: 'string', progression: 'string' }] }],
    clientVersion: 'resumen simple para App Client',
    internalVersion: 'análisis crítico para coach',
    decision: 'decisión IBERFIT',
    nextAction: 'siguiente acción'
  };
  return JSON.stringify({
    tarea: mode,
    prioridad: 'calidad IBERFIT, criterio, seguridad, personalización y utilidad operativa',
    reglas: [
      'No inventes datos que no estén en contexto; si falta algo, marcar pendiente.',
      'Usa ejercicios de biblioteca cuando existan; si propones otro, justifica por patrón/objetivo.',
      'No progreses carga y volumen a la vez si hay RPE alto, molestia, fatiga alta o poca información.',
      'La sesión debe poder editarse: estructura simple, bloques claros y ejercicios concretos.',
      'Cliente ve explicación clara; coach ve criterio técnico y advertencias.'
    ],
    formato_obligatorio: fullSessionSchema,
    contexto_iberfit: ctx,
    borrador_local_base: local.fields || {}
  });
}

function parseAiJsonFields_(text) {
  let t = String(text || '').trim();
  t = t.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  const first = t.indexOf('{');
  const last = t.lastIndexOf('}');
  if (first >= 0 && last > first) t = t.slice(first, last + 1);
  try {
    const obj = JSON.parse(t);
    const out = {};
    Object.keys(obj || {}).forEach(function(k) { if (obj[k] !== null && obj[k] !== undefined) out[k] = sanitizeAiFieldValue_(obj[k]); });
    if (!out.blocks && out.session && out.session.blocks) out.blocks = out.session.blocks;
    return out;
  } catch (e) {
    return { clientVersion: sanitizeTextLong_(text), internalVersion: sanitizeTextLong_(text) };
  }
}

function mergeAiFields_(base, extra) {
  const out = Object.assign({}, base || {});
  Object.keys(extra || {}).forEach(function(k) {
    const v = extra[k];
    if (v === null || v === undefined) return;
    if (typeof v === 'string' && !String(v).trim()) return;
    out[k] = sanitizeAiFieldValue_(v);
  });
  return out;
}

function localAiIberfitDraft_(mode, ctx, payload) {
  const c = ctx.client || {};
  const iri = ctx.iri || {};
  const loads = (ctx.history && ctx.history.length) ? ctx.history : (ctx.loads || []);
  const feedback = ctx.feedback || [];
  const checkin = ctx.checkin || [];
  const library = ctx.library || [];
  const highRpe = loads.filter(function(l) { return Number(l.rpe || l.RPE || 0) >= 9; }).length;
  const pain = loads.filter(function(l) { return Number(l.pain || l.MOLESTIA || 0) >= 5; }).length;
  const lastFb = feedback[0] || {};
  const lastChk = checkin[0] || {};
  const limiter = iri.limiters || iri.classification || 'datos aún incompletos';
  let semaforo = 'VERDE';
  if (highRpe || pain || Number(lastFb.pain || 0) >= 5 || Number(lastChk.fatigue || 0) >= 8) semaforo = 'ROJO';
  else if (Number(lastFb.rpe || 0) >= 8 || Number(lastChk.energy || 10) <= 4 || limiter) semaforo = 'AMARILLO';
  const baseDecision = semaforo === 'ROJO'
    ? 'No progresar carga ni volumen. Revisar técnica, fatiga y molestias antes de avanzar.'
    : semaforo === 'AMARILLO'
      ? 'Progresar con prudencia, sin subir carga y volumen a la vez, observando respuesta real.'
      : 'Puede progresar de forma gradual si la técnica se mantiene estable y el RPE queda controlado.';
  const clientText = 'Hoy trabajamos con criterio IBERFIT: técnica clara, carga ajustada a tu respuesta y progreso sin fatiga innecesaria.';
  const internalText = 'IA local IBERFIT V9.6. Cliente: ' + (c.name || c.id) + '. Objetivo: ' + (c.objective || 'pendiente') + '. IRI: ' + (iri.total || 'sin dato') + ' · ' + (iri.classification || 'sin clasificación') + '. Limitadores: ' + limiter + '. RPE alto histórico: ' + highRpe + '. Molestias relevantes: ' + pain + '. Decisión: ' + baseDecision;
  const fields = { title: 'Informe IBERFIT · ' + (c.name || 'cliente'), clientVersion: clientText, internalVersion: internalText, decision: baseDecision, nextAction: baseDecision };

  if (mode === 'SESSION' || mode === 'SESSION_FULL' || mode === 'WEEK_PLAN') {
    const duration = sanitizeText_(payload.desiredDuration || payload.duration || ctx.draft.desiredDuration || '55');
    const delivery = normalizeValue_(payload.deliveryMode || payload.modalidad || c.modality || 'PRESENCIAL', ['PRESENCIAL','AUTONOMA','ONLINE','COMPLEMENTARIA','EVALUACION','HIBRIDO'], 'PRESENCIAL');
    const objective = sanitizeTextLong_(payload.objective || c.objective || 'Consolidar técnica, adherencia y progresión controlada.');
    const blocks = buildLocalSessionBlocks_(objective, library, loads, semaforo);
    fields.title = 'Sesión IBERFIT · ' + (objective || 'progresión controlada');
    fields.type = objective.toLowerCase().indexOf('masa') >= 0 ? 'Hipertrofia' : objective.toLowerCase().indexOf('composición') >= 0 || objective.toLowerCase().indexOf('grasa') >= 0 ? 'Full body' : 'Fuerza técnica';
    fields.duration = duration;
    fields.deliveryMode = delivery === 'HIBRIDO' ? 'PRESENCIAL' : delivery;
    fields.objective = objective;
    fields.criterion = 'Hoy priorizamos una sesión compatible con IRI ' + (iri.classification || 'pendiente') + ' y limitador ' + limiter + '. ' + baseDecision;
    fields.indications = 'Mantén técnica limpia, respeta el RPE objetivo y registra molestia, energía y percepción al finalizar.';
    fields.material = sanitizeText_(payload.material || ctx.draft.material || inferMaterialFromLibrary_(library) || 'Material disponible según sesión');
    fields.observe = 'Técnica, RPE por ejercicio, molestia, velocidad de ejecución, tolerancia al volumen y adherencia.';
    fields.adjust = semaforo === 'ROJO' ? 'Reducir carga, rango o complejidad; cambiar variante si aparece molestia.' : 'Ajustar una variable a la vez: carga, repeticiones, descanso o complejidad.';
    fields.report = 'Reportar RPE global, ejercicio más desafiante, molestia y decisión para la siguiente sesión.';
    fields.blocks = blocks;
    fields.session = { title: fields.title, type: fields.type, duration: fields.duration, deliveryMode: fields.deliveryMode, objective: fields.objective, criterion: fields.criterion, indications: fields.indications, material: fields.material, observe: fields.observe, adjust: fields.adjust, report: fields.report, blocks: blocks };
    fields.clientVersion = 'Tu sesión está diseñada para avanzar sin perder control: primero técnica y activación, luego fuerza/control, y cierre ajustado a tu respuesta. No buscamos hacer más por hacer más; buscamos que el estímulo tenga sentido.';
    fields.internalVersion = internalText + ' Sesión local generada con bloques editables y progresión prudente.';
  }

  if (mode === 'SESSION_REVIEW') {
    fields.title = 'Revisión crítica de sesión';
    fields.internalVersion = internalText + ' Revisar que la sesión no acumule volumen excesivo, no repita patrones fatigados y no ignore limitadores/alertas.';
    fields.clientVersion = 'La sesión se revisó para mantener una progresión coherente con tu respuesta real.';
    fields.decision = baseDecision;
    fields.audit = [
      'Confirmar que no se suben carga y volumen a la vez.',
      'Verificar que el bloque principal respete el RPE objetivo.',
      'Mantener alternativas si aparece molestia o técnica baja.',
      'Registrar feedback al terminar para decidir la próxima progresión.'
    ];
  }

  if (mode === 'EXERCISE_REPLACE') {
    const name = sanitizeText_(payload.exerciseName || ctx.draft.exerciseName || 'ejercicio');
    const replacements = suggestLocalReplacements_(name, library);
    fields.title = 'Reemplazos IBERFIT para ' + name;
    fields.replacements = replacements;
    fields.internalVersion = 'Reemplazar manteniendo patrón, objetivo y seguridad. Motivo: ' + sanitizeText_(payload.replaceReason || ctx.draft.replaceReason || 'ajuste técnico/fatiga/material') + '. ' + baseDecision;
    fields.clientVersion = 'Cambiamos el ejercicio para mantener el objetivo de la sesión con una variante más adecuada para hoy.';
  }

  if (mode === 'LIVE_ADAPTATION') {
    const issue = sanitizeText_(payload.liveIssue || ctx.draft.liveIssue || 'ajuste en vivo');
    fields.title = 'Adaptación en vivo IBERFIT';
    fields.decision = issue.toLowerCase().indexOf('molest') >= 0 ? 'Cambiar variante o reducir rango/carga; no insistir con dolor.' : issue.toLowerCase().indexOf('fatiga') >= 0 ? 'Reducir volumen efectivo y ampliar descansos.' : baseDecision;
    fields.internalVersion = internalText + ' Incidencia en vivo: ' + issue + '. Decisión: ' + fields.decision;
    fields.clientVersion = 'Ajustamos la sesión en tiempo real para mantener calidad técnica y una carga adecuada para hoy.';
  }

  if (mode === 'AUDIT') {
    fields.title = 'Auditoría IA IBERFIT';
    fields.audit = buildLocalAudit_(ctx, semaforo);
    fields.internalVersion = internalText + ' Auditoría: revisar pendientes, cargas, informes, diagnóstico, multimedia y sesiones sin publicar.';
  }

  if (mode === 'ONBOARDING') {
    fields.title = 'Onboarding IBERFIT · ' + (c.name || 'cliente');
    fields.clientVersion = 'Bienvenido/a a IBERFIT. Primero entendemos tu punto de partida y luego entrenamos con un plan ajustado, no con una rutina genérica.';
    fields.internalVersion = internalText + ' Onboarding: completar datos faltantes, IRI, consentimiento, bioimpedancia y primera sesión de experiencia positiva.';
    fields.nextAction = 'Completar IRI inicial y preparar primera sesión sencilla, técnica y adherente.';
  }

  if (mode === 'IRI') {
    fields.recommendation = iri.recommendation || baseDecision;
    fields.decision = baseDecision + ' Mantener seguimiento del limitador principal: ' + limiter + '.';
  }
  if (mode === 'CLOSE_SESSION') {
    fields.internalSummary = internalText + ' Cierre: validar cargas registradas y decidir próxima progresión.';
    fields.clientSummary = clientText + ' Revisaremos tu respuesta para ajustar la próxima sesión.';
  }
  return { fields: fields, text: internalText, raw: '' };
}

function buildLocalSessionBlocks_(objective, library, loads, semaforo) {
  const lower = String(objective || '').toLowerCase();
  const choose = function(pattern, fallback) { return findExerciseByPattern_(library, pattern) || fallback; };
  const exPrep = choose('movilidad', 'Movilidad dinámica específica');
  const exSent = choose('sentadilla', 'Sentadilla goblet');
  const exBis = choose('bisagra', 'Peso muerto rumano');
  const exEmp = choose('empuje', 'Press con mancuernas');
  const exTra = choose('tracción', choose('traccion', 'Remo con mancuerna'));
  const exCore = choose('core', 'Plancha frontal');
  const exMeta = choose('metabólico', choose('metabolico', 'Bicicleta estática controlada'));
  const conservative = semaforo === 'ROJO';
  const rpeMain = conservative ? '6-7' : '7-8';
  const restMain = conservative ? '90-120 s' : '75-105 s';
  const blocks = [];
  blocks.push({ title: 'Preparación', focus: 'Movilidad, activación y lectura de respuesta', exercises: [
    { name: exPrep, sets: '1-2', reps: '6-8 min', time: '6-8 min', load: 'sin carga', rest: 'breve', rpe: '3-4', note: 'Preparar rango y control; no fatigar.' }
  ]});
  if (lower.indexOf('composición') >= 0 || lower.indexOf('grasa') >= 0) {
    blocks.push({ title: 'Fuerza full body', focus: 'Mantener masa muscular y calidad técnica', exercises: [
      { name: exSent, sets: conservative ? '2-3' : '3', reps: '8-10', load: 'según último registro, sin forzar', rest: restMain, rpe: rpeMain, note: 'Priorizar control y rango útil.' },
      { name: exTra, sets: conservative ? '2' : '3', reps: '10-12', load: 'carga moderada', rest: '60-90 s', rpe: rpeMain, note: 'Evitar compensaciones.' }
    ]});
    blocks.push({ title: 'Complementario + core', focus: 'Gasto útil sin perder técnica', exercises: [
      { name: exEmp, sets: '2-3', reps: '10-12', load: 'moderada', rest: '60-90 s', rpe: '6-8', note: 'No llegar al fallo.' },
      { name: exCore, sets: '2-3', reps: '20-40 s', time: '20-40 s', load: 'peso corporal', rest: '45-60 s', rpe: '6-7', note: 'Respiración y control.' }
    ]});
    blocks.push({ title: 'Cierre metabólico controlado', focus: 'Tolerancia al esfuerzo sin castigar recuperación', exercises: [
      { name: exMeta, sets: conservative ? '1' : '2-3', reps: '4-6 min', time: '4-8 min', load: 'zona cómoda-exigente', rest: 'según pulso', rpe: conservative ? '5-6' : '6-7', note: 'Cortar si técnica/respiración se desordenan.' }
    ]});
  } else if (lower.indexOf('masa') >= 0 || lower.indexOf('hipertrof') >= 0) {
    blocks.push({ title: 'Bloque principal', focus: 'Tensión mecánica con técnica estable', exercises: [
      { name: exBis, sets: conservative ? '2-3' : '3-4', reps: '6-10', load: 'según histórico, prudente', rest: restMain, rpe: rpeMain, note: 'No buscar fallo; cuidar bisagra.' },
      { name: exEmp, sets: '3', reps: '8-12', load: 'última carga válida o -5/10%', rest: '75-105 s', rpe: rpeMain, note: 'Control escapular y rango.' }
    ]});
    blocks.push({ title: 'Accesorios', focus: 'Volumen útil por patrón complementario', exercises: [
      { name: exSent, sets: '2-3', reps: '8-12', load: 'moderada', rest: '60-90 s', rpe: '7', note: 'Mantener ritmo y postura.' },
      { name: exTra, sets: '2-3', reps: '10-12', load: 'moderada', rest: '60-90 s', rpe: '7', note: 'Tracción limpia.' }
    ]});
    blocks.push({ title: 'Core + cierre', focus: 'Estabilidad y recuperación', exercises: [
      { name: exCore, sets: '2', reps: '30-45 s', time: '30-45 s', load: 'peso corporal', rest: '45-60 s', rpe: '6-7', note: 'Cerrar sin fatigar excesivamente.' }
    ]});
  } else {
    blocks.push({ title: 'Fuerza técnica principal', focus: 'Patrones base con progresión prudente', exercises: [
      { name: exSent, sets: '3', reps: '6-10', load: 'última carga válida o conservadora', rest: restMain, rpe: rpeMain, note: 'Rango controlado y técnica limpia.' },
      { name: exBis, sets: '3', reps: '6-10', load: 'moderada', rest: restMain, rpe: rpeMain, note: 'Bisagra sin molestias.' }
    ]});
    blocks.push({ title: 'Empuje / tracción', focus: 'Equilibrio de tren superior', exercises: [
      { name: exEmp, sets: '2-3', reps: '8-12', load: 'moderada', rest: '60-90 s', rpe: '6-8', note: 'Evitar compensaciones.' },
      { name: exTra, sets: '2-3', reps: '8-12', load: 'moderada', rest: '60-90 s', rpe: '6-8', note: 'Control escapular.' }
    ]});
    blocks.push({ title: 'Core / vuelta a la calma', focus: 'Control y cierre de respuesta', exercises: [
      { name: exCore, sets: '2', reps: '30-45 s', time: '30-45 s', load: 'peso corporal', rest: '45-60 s', rpe: '6', note: 'Respiración y control.' }
    ]});
  }
  return blocks;
}

function findExerciseByPattern_(library, pattern) {
  const p = String(pattern || '').toLowerCase();
  for (let i = 0; i < (library || []).length; i++) {
    const e = library[i] || {};
    const row = [e.name, e.pattern, e.zone, e.objective].join(' ').toLowerCase();
    if (row.indexOf(p) >= 0) return e.name || '';
  }
  return '';
}
function inferMaterialFromLibrary_(library) {
  const mats = {};
  (library || []).slice(0, 20).forEach(function(e){ if (e.material) mats[e.material] = true; });
  return Object.keys(mats).slice(0, 4).join(', ');
}
function suggestLocalReplacements_(name, library) {
  const n = String(name || '').toLowerCase();
  let pattern = '';
  (library || []).forEach(function(e){ if (!pattern && String(e.name || '').toLowerCase() === n) pattern = e.pattern || e.zone || ''; });
  if (!pattern) {
    if (n.indexOf('sentadilla') >= 0 || n.indexOf('squat') >= 0) pattern = 'sentadilla';
    else if (n.indexOf('peso muerto') >= 0 || n.indexOf('bisagra') >= 0) pattern = 'bisagra';
    else if (n.indexOf('press') >= 0 || n.indexOf('flexión') >= 0 || n.indexOf('flexion') >= 0) pattern = 'empuje';
    else if (n.indexOf('remo') >= 0 || n.indexOf('trx') >= 0) pattern = 'tracción';
    else pattern = 'core';
  }
  const reps = (library || []).filter(function(e){ return [e.pattern, e.zone, e.objective, e.name].join(' ').toLowerCase().indexOf(String(pattern).toLowerCase()) >= 0 && String(e.name || '').toLowerCase() !== n; }).slice(0, 4);
  const fallbacks = [
    { name: 'Variante asistida del mismo patrón', reason: 'Mantiene objetivo reduciendo complejidad.', tradeoff: 'Menos intensidad absoluta.', load: 'RPE 6-7' },
    { name: 'Versión unilateral asistida', reason: 'Permite control técnico.', tradeoff: 'Menos carga total.', load: 'Volumen moderado' },
    { name: 'Patrón en rango reducido', reason: 'Reduce molestia o fatiga.', tradeoff: 'Menor rango de estímulo.', load: 'Conservadora' }
  ];
  return (reps.length ? reps.map(function(e){ return { name: e.name, reason: 'Mismo patrón/objetivo en biblioteca IBERFIT.', tradeoff: e.regression || 'Ajustar según técnica.', load: 'Última carga válida o RPE 6-8', cues: e.cues || '' }; }) : fallbacks);
}
function buildLocalAudit_(ctx, semaforo) {
  const out = [];
  if (!ctx.iri || !ctx.iri.total) out.push('IRI pendiente o incompleto: no bloquear acceso, pero sí marcar tarea para completar diagnóstico.');
  if (!(ctx.history || []).length) out.push('Histórico fino insuficiente: registrar series/cargas/RPE para mejorar decisiones.');
  if (!(ctx.library || []).length) out.push('Biblioteca no disponible para IA: cargar ejercicios antes de depender del planificador.');
  if ((ctx.alerts || []).length) out.push('Existen alertas abiertas: revisar antes de publicar sesiones exigentes.');
  if ((ctx.sessions || []).filter(function(s){ return String(s.state || '').toUpperCase() === 'BORRADOR'; }).length) out.push('Hay sesiones en borrador: publicar solo las revisadas y aprobadas.');
  if (semaforo !== 'VERDE') out.push('Semáforo no verde: evitar progresiones agresivas y dejar explicación cliente/coach.');
  out.push('Confirmar que cada sesión tenga criterio, qué observar, cómo ajustar y qué reportar.');
  return out;
}

function adminGeminiProbe() {
  const props = PropertiesService.getScriptProperties();
  const key = props.getProperty('GEMINI_API_KEY') || props.getProperty('IBERFIT_GEMINI_API_KEY');
  return { ok: true, version: IBERFIT.VERSION, geminiConfigured: !!key, model: props.getProperty('GEMINI_MODEL') || 'gemini-3.5-flash', action: 'coachAiGenerate', modes: ['SESSION_FULL','SESSION_REVIEW','EXERCISE_REPLACE','LIVE_ADAPTATION','REPORT','IRI','AUDIT'], fallbackLocal: true, next: key ? 'Probar desde Coach OS: Crear sesión entera con IA.' : 'Configurar GEMINI_API_KEY; mientras tanto funciona IA local.' };
}

function adminV96MigrationStatus() {
  return {
    ok: true,
    version: IBERFIT.VERSION,
    message: 'V9.6 preparado para operar con datos migrados. Verificar 02 Ficha Cliente, 08 Histórico de Cargas, 15 Biblioteca Ejercicios y 16 Multimedia Ejercicios.',
    expected: { fichaMin: 190, historico: 82, biblioteca: 228, multimedia: 228 },
    current: {
      ficha: Math.max(0, ss_().getSheetByName(IBERFIT.SHEETS.FICHA)?.getLastRow() - 5 || 0),
      historico: Math.max(0, ss_().getSheetByName(IBERFIT.SHEETS.HISTORICO_CARGAS)?.getLastRow() - 5 || 0),
      biblioteca: Math.max(0, ss_().getSheetByName(IBERFIT.SHEETS.BIBLIOTECA)?.getLastRow() - 5 || 0),
      multimedia: Math.max(0, ss_().getSheetByName(IBERFIT.SHEETS.MULTIMEDIA)?.getLastRow() - 5 || 0)
    }
  };
}

/* ───────────────────────── IBERFIT V9.6 · Migración embebida desde Exceles reales ─────────────────────────
   Ejecutar una vez desde Apps Script después de pegar V9.6:
   adminImportarDatosHistoricosV96();
   Carga datos ya extraídos de ARLEANA, RAFAEL y RAMIRO:
   - 02 Ficha Cliente
   - 08 Histórico de Cargas
   - 15 Biblioteca Ejercicios
   - 16 Multimedia Ejercicios
*/
function adminImportarDatosHistoricosV96() {
  const packs = [
    { sheet: IBERFIT.SHEETS.FICHA, tsv: IBERFIT_MIG_FICHA_TSV_ },
    { sheet: IBERFIT.SHEETS.HISTORICO_CARGAS, tsv: IBERFIT_MIG_HIST_TSV_ },
    { sheet: IBERFIT.SHEETS.BIBLIOTECA, tsv: IBERFIT_MIG_LIB_TSV_ },
    { sheet: IBERFIT.SHEETS.MULTIMEDIA, tsv: IBERFIT_MIG_MEDIA_TSV_ }
  ];
  const result = [];
  packs.forEach(function(pack) {
    const rows = Utilities.parseCsv(pack.tsv, '	');
    const sh = ss_().getSheetByName(pack.sheet) || ss_().insertSheet(pack.sheet);
    const width = rows[0].length;
    if (sh.getMaxRows() < rows.length + 5) sh.insertRowsAfter(sh.getMaxRows(), rows.length + 5 - sh.getMaxRows());
    if (sh.getMaxColumns() < width) sh.insertColumnsAfter(sh.getMaxColumns(), width - sh.getMaxColumns());
    sh.getRange(5, 1, Math.max(sh.getMaxRows() - 4, rows.length), Math.max(sh.getMaxColumns(), width)).clearContent();
    sh.getRange(5, 1, rows.length, width).setValues(rows);
    try {
      sh.setFrozenRows(5);
      sh.getRange(5, 1, 1, width).setBackground('#B8973A').setFontColor('#FFFFFF').setFontWeight('bold').setWrap(true);
      sh.autoResizeColumns(1, Math.min(width, 12));
    } catch(e) {}
    result.push({ sheet: pack.sheet, rows: rows.length - 1, columns: width });
  });
  log_('ADMIN_IMPORT_MIGRACION_V96', '', 'MIGRACION', JSON.stringify(result));
  return { ok: true, version: IBERFIT.VERSION, imported: result, next: 'Ejecuta adminV96MigrationStatus() y prueba Coach OS → Crear sesión entera con IA.' };
}
const IBERFIT_MIG_FICHA_TSV_ = "CLIENTE_ID\tSECCION\tCAMPO\tVALOR\tACTUALIZADO_EN\nIBF-0001\tFicha legacy\tIBERFIT\u2122\tFICHA DE CLIENTE\t2026-06-29\nIBF-0001\tFicha legacy\tDIRECCI\u00d3N\tLo Fontecilla, 267, Las Condes. Dpto 106B\t2026-06-29\nIBF-0001\tFicha legacy\tFECHA INICIO\t2026-04-07\t2026-06-29\nIBF-0001\tFicha legacy\tIRI\t49.8\t2026-06-29\nIBF-0001\tFicha legacy\tNIVEL\tRECONSTRUCCI\u00d3N\t2026-06-29\nIBF-0001\tFicha legacy\tOBJETIVO PRINCIPAL\tCOMPOSICI\u00d3N CORPORAL\t2026-06-29\nIBF-0001\tFicha legacy\tFOCO ACTUAL\tCOMPOSICI\u00d3N CORPORAL\t2026-06-29\nIBF-0001\tFicha legacy\tFRECUENCIA ACTUAL\t40 sesiones totales\t2026-06-29\nIBF-0001\tFicha legacy\tFRECUENCIA OBJETIVO\t1 sesi\u00f3n/semana\t2026-06-29\nIBF-0001\tFicha legacy\tENTORNO\tGIMNASIO EDIFICIO\t2026-06-29\nIBF-0001\tFicha legacy\tLIMITADOR PRINCIPAL\tCOMPOSICI\u00d3N CORPORAL\t2026-06-29\nIBF-0001\tFicha legacy\tALERTAS CR\u00cdTICAS\tALTA\t2026-06-29\nIBF-0001\tFicha legacy\tRESUMEN PERFIL\tBuen punto de partida, con margen de mejora en COMPOSICI\u00d3N CORPORAL. Desbalance: ALTA\t2026-06-29\nIBF-0001\tFicha legacy\tESTADO CLIENTE\tActivo\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tPAR\u00c1METRO\tRESULTADO\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tDolor articular activo (\u00faltimos 30 d\u00edas)\tNO\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tPerfil de estabilidad\tLIBRE / INESTABLE\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tCirug\u00eda o lesi\u00f3n grave (\u00faltimos 12 meses)\tNO\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tPerfil de complejidad\tMEDIA\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tDiagn\u00f3stico m\u00e9dico que limite ejercicio\tNO\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tEstado recuperaci\u00f3n\tRECUPERACI\u00d3N COMPROMETIDA\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tMareos o dolor de pecho con esfuerzo\tNO\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tPrioridad t\u00e9cnica\tCOMPOSICI\u00d3N CORPORAL\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tRESTRICCIONES DETECTADAS\tNINGUNA\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tLimitador principal\tCOMPOSICI\u00d3N CORPORAL\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tSEXO\tMUJER\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tAlerta de desbalance\tALTA\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tPESO (KG)\t79.3\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tResumen perfil\tBuen punto de partida, con margen de mejora en COMPOSICI\u00d3N CORPORAL. Desbalance: ALTA\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tALTURA (CM)\t158\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tTest 1 - Flexiones (repeticiones)\t15\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tTest 2 - Sentadilla 60\" (repeticiones)\t32\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tPUNTUACI\u00d3N FUERZA\t60\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tBajada FC al minuto (lpm)\t15\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tPUNTUACI\u00d3N METAB\u00d3LICA\t40\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tTest 3A - Sentadilla profunda con brazos (0-10)\t7\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tTest 3B - Rotaci\u00f3n tor\u00e1cica cuadrupedia (0-10)\t6\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tTest 3C - Estocada est\u00e1tica brazos arriba (0-10)\t6\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tPUNTUACI\u00d3N MOVILIDAD\t85\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tPer\u00edmetro cintura (cm)\t99\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tPUNTUACI\u00d3N COMPOSICI\u00d3N\t20\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tP1 - Horas de sue\u00f1o esta semana\t40\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tP2 - Nivel estr\u00e9s (1=m\u00e1ximo 10=sin estr\u00e9s)\t4\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tP3 - Energ\u00eda diaria (1-10)\t6\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tP4 - Fatiga muscular (10=sin s\u00edntomas 1=constante)\t3\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tPROMEDIO RECUPERACI\u00d3N\t5.75\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tPUNTUACI\u00d3N RECUPERACI\u00d3N\t40\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tIRI FINAL\t49.8\t2026-06-29\nIBF-0001\tEvaluaci\u00f3n IRI\tCLASIFICACI\u00d3N\tRECONSTRUCCI\u00d3N\t2026-06-29\nIBF-0001\tInforme IRI\tFuerza\t60\t2026-06-29\nIBF-0001\tInforme IRI\tMetab\u00f3lico\t40\t2026-06-29\nIBF-0001\tInforme IRI\tMovilidad\t85\t2026-06-29\nIBF-0001\tInforme IRI\tComposici\u00f3n\t20\t2026-06-29\nIBF-0001\tInforme IRI\tRecuperaci\u00f3n\t40\t2026-06-29\nIBF-0001\tInforme IRI\tIRI\t49.8\t2026-06-29\nIBF-0001\tInforme IRI\tClasificaci\u00f3n\tRECONSTRUCCI\u00d3N\t2026-06-29\nIBF-0001\tInforme IRI\tFecha\t46201\t2026-06-29\nIBF-0001\tInforme IRI\tPerfil de carga\tCOMPOSICI\u00d3N CORPORAL\t2026-06-29\nIBF-0001\tInforme IRI\tEstabilidad\tLIBRE / INESTABLE\t2026-06-29\nIBF-0001\tInforme IRI\tComplejidad\tMEDIA\t2026-06-29\nIBF-0001\tInforme IRI\tRecuperaci\u00f3n\tRECUPERACI\u00d3N COMPROMETIDA\t2026-06-29\nIBF-0001\tInforme IRI\tLimitador principal\tCOMPOSICI\u00d3N CORPORAL\t2026-06-29\nIBF-0001\tInforme IRI\tAlerta\tALTA\t2026-06-29\nIBF-0001\tInforme IRI\tResumen Perfil\tBuen punto de partida, con margen de mejora en COMPOSICI\u00d3N CORPORAL. Desbalance: ALTA\t2026-06-29\nIBF-0001\tInforme IRI\tRecomendaci\u00f3n inicial\tPriorizar recomposici\u00f3n corporal y adherencia al proceso\t2026-06-29\nIBF-0002\tFicha legacy\tIBERFIT\u2122\tFICHA DE CLIENTE\t2026-06-29\nIBF-0002\tFicha legacy\tFECHA INICIO\t2026-05-28\t2026-06-29\nIBF-0002\tFicha legacy\tIRI\t67\t2026-06-29\nIBF-0002\tFicha legacy\tNIVEL\tPERFORMANCE\t2026-06-29\nIBF-0002\tFicha legacy\tOBJETIVO PRINCIPAL\tFUERZA\t2026-06-29\nIBF-0002\tFicha legacy\tFOCO ACTUAL\tCAPACIDAD METAB\u00d3LICA\t2026-06-29\nIBF-0002\tFicha legacy\tFRECUENCIA ACTUAL\t26 sesiones totales\t2026-06-29\nIBF-0002\tFicha legacy\tFRECUENCIA OBJETIVO\t2 sesiones/semana\t2026-06-29\nIBF-0002\tFicha legacy\tENTORNO\tEXTERNO\t2026-06-29\nIBF-0002\tFicha legacy\tLIMITADOR PRINCIPAL\tCAPACIDAD METAB\u00d3LICA\t2026-06-29\nIBF-0002\tFicha legacy\tALERTAS CR\u00cdTICAS\tMODERADA\t2026-06-29\nIBF-0002\tFicha legacy\tRESUMEN PERFIL\tBuen punto de partida, con margen de mejora en CAPACIDAD METAB\u00d3LICA. Desbalance: MODERADA\t2026-06-29\nIBF-0002\tFicha legacy\tESTADO CLIENTE\tActivo\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tPAR\u00c1METRO\tRESULTADO\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tDolor articular activo (\u00faltimos 30 d\u00edas)\tS\u00cd\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tPerfil de estabilidad\tLIBRE / INESTABLE\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tCirug\u00eda o lesi\u00f3n grave (\u00faltimos 12 meses)\tNO\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tPerfil de complejidad\tMEDIA-ALTA\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tDiagn\u00f3stico m\u00e9dico que limite ejercicio\tS\u00cd\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tEstado recuperaci\u00f3n\tRECUPERACI\u00d3N NORMAL\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tMareos o dolor de pecho con esfuerzo\tNO\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tPrioridad t\u00e9cnica\tCAPACIDAD METAB\u00d3LICA\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tRESTRICCIONES DETECTADAS\tREVISAR: 2 alertas activas\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tLimitador principal\tCAPACIDAD METAB\u00d3LICA\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tSEXO\tHOMBRE\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tAlerta de desbalance\tMODERADA\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tPESO (KG)\t77\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tResumen perfil\tBuen punto de partida, con margen de mejora en CAPACIDAD METAB\u00d3LICA. Desbalance: MODERADA\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tALTURA (CM)\t169\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tTest 1 - Flexiones (repeticiones)\t25\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tTest 2 - Sentadilla 60\" (repeticiones)\t32\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tPUNTUACI\u00d3N FUERZA\t80\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tBajada FC al minuto (lpm)\t16\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tPUNTUACI\u00d3N METAB\u00d3LICA\t40\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tTest 3A - Sentadilla profunda con brazos (0-10)\t9\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tTest 3B - Rotaci\u00f3n tor\u00e1cica cuadrupedia (0-10)\t8\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tTest 3C - Estocada est\u00e1tica brazos arriba (0-10)\t9\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tPUNTUACI\u00d3N MOVILIDAD\t100\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tPer\u00edmetro cintura (cm)\t89\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tPUNTUACI\u00d3N COMPOSICI\u00d3N\t60\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tP1 - Horas de sue\u00f1o esta semana\t8\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tP2 - Nivel estr\u00e9s (1=m\u00e1ximo 10=sin estr\u00e9s)\t4\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tP3 - Energ\u00eda diaria (1-10)\t8\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tP4 - Fatiga muscular (10=sin s\u00edntomas 1=constante)\t5\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tPROMEDIO RECUPERACI\u00d3N\t6.25\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tPUNTUACI\u00d3N RECUPERACI\u00d3N\t60\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tIRI FINAL\t67\t2026-06-29\nIBF-0002\tEvaluaci\u00f3n IRI\tCLASIFICACI\u00d3N\tPERFORMANCE\t2026-06-29\nIBF-0002\tInforme IRI\tFuerza\t80\t2026-06-29\nIBF-0002\tInforme IRI\tMetab\u00f3lico\t40\t2026-06-29\nIBF-0002\tInforme IRI\tMovilidad\t100\t2026-06-29\nIBF-0002\tInforme IRI\tComposici\u00f3n\t60\t2026-06-29\nIBF-0002\tInforme IRI\tRecuperaci\u00f3n\t60\t2026-06-29\nIBF-0002\tInforme IRI\tIRI\t67\t2026-06-29\nIBF-0002\tInforme IRI\tClasificaci\u00f3n\tPERFORMANCE\t2026-06-29\nIBF-0002\tInforme IRI\tFecha\t46201\t2026-06-29\nIBF-0002\tInforme IRI\tPerfil de carga\tCAPACIDAD METAB\u00d3LICA\t2026-06-29\nIBF-0002\tInforme IRI\tEstabilidad\tLIBRE / INESTABLE\t2026-06-29\nIBF-0002\tInforme IRI\tComplejidad\tMEDIA-ALTA\t2026-06-29\nIBF-0002\tInforme IRI\tRecuperaci\u00f3n\tRECUPERACI\u00d3N NORMAL\t2026-06-29\nIBF-0002\tInforme IRI\tLimitador principal\tCAPACIDAD METAB\u00d3LICA\t2026-06-29\nIBF-0002\tInforme IRI\tAlerta\tMODERADA\t2026-06-29\nIBF-0002\tInforme IRI\tResumen Perfil\tBuen punto de partida, con margen de mejora en CAPACIDAD METAB\u00d3LICA. Desbalance: MODERADA\t2026-06-29\nIBF-0002\tInforme IRI\tRecomendaci\u00f3n inicial\tPriorizar trabajo de capacidad metab\u00f3lica y tolerancia al esfuerzo progresiva\t2026-06-29\nIBF-0003\tFicha legacy\tIBERFIT\u2122\tFICHA DE CLIENTE\t2026-06-29\nIBF-0003\tFicha legacy\tDIRECCI\u00d3N\tDOLORES 5676, VITACURA.\t2026-06-29\nIBF-0003\tFicha legacy\tFECHA INICIO\t2026-05-27\t2026-06-29\nIBF-0003\tFicha legacy\tIRI\t59.5\t2026-06-29\nIBF-0003\tFicha legacy\tNIVEL\tPERFORMANCE\t2026-06-29\nIBF-0003\tFicha legacy\tOBJETIVO PRINCIPAL\tGANANCIA DE MASA MUSCULAR\t2026-06-29\nIBF-0003\tFicha legacy\tFOCO ACTUAL\tCOMPOSICI\u00d3N CORPORAL\t2026-06-29\nIBF-0003\tFicha legacy\tFRECUENCIA ACTUAL\t16 sesiones totales\t2026-06-29\nIBF-0003\tFicha legacy\tFRECUENCIA OBJETIVO\t1 sesi\u00f3n/semana\t2026-06-29\nIBF-0003\tFicha legacy\tLIMITADOR PRINCIPAL\tCOMPOSICI\u00d3N CORPORAL\t2026-06-29\nIBF-0003\tFicha legacy\tALERTAS CR\u00cdTICAS\tALTA\t2026-06-29\nIBF-0003\tFicha legacy\tRESUMEN PERFIL\tBuen punto de partida, con margen de mejora en COMPOSICI\u00d3N CORPORAL. Desbalance: ALTA\t2026-06-29\nIBF-0003\tFicha legacy\tESTADO CLIENTE\tActivo\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tPAR\u00c1METRO\tRESULTADO\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tDolor articular activo (\u00faltimos 30 d\u00edas)\tNO\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tPerfil de estabilidad\tLIBRE / INESTABLE\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tCirug\u00eda o lesi\u00f3n grave (\u00faltimos 12 meses)\tNO\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tPerfil de complejidad\tMEDIA-ALTA\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tDiagn\u00f3stico m\u00e9dico que limite ejercicio\tNO\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tEstado recuperaci\u00f3n\tRECUPERACI\u00d3N NORMAL\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tMareos o dolor de pecho con esfuerzo\tNO\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tPrioridad t\u00e9cnica\tCOMPOSICI\u00d3N CORPORAL\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tRESTRICCIONES DETECTADAS\tNINGUNA\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tLimitador principal\tCOMPOSICI\u00d3N CORPORAL\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tSEXO\tHOMBRE\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tAlerta de desbalance\tALTA\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tPESO (KG)\t86\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tResumen perfil\tBuen punto de partida, con margen de mejora en COMPOSICI\u00d3N CORPORAL. Desbalance: ALTA\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tALTURA (CM)\t180\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tTest 1 - Flexiones (repeticiones)\t11\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tTest 2 - Sentadilla 60\" (repeticiones)\t44\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tPUNTUACI\u00d3N FUERZA\t80\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tBajada FC al minuto (lpm)\t20\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tPUNTUACI\u00d3N METAB\u00d3LICA\t40\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tTest 3A - Sentadilla profunda con brazos (0-10)\t8\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tTest 3B - Rotaci\u00f3n tor\u00e1cica cuadrupedia (0-10)\t6\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tTest 3C - Estocada est\u00e1tica brazos arriba (0-10)\t7\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tPUNTUACI\u00d3N MOVILIDAD\t90\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tPer\u00edmetro cintura (cm)\t108\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tPUNTUACI\u00d3N COMPOSICI\u00d3N\t20\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tP1 - Horas de sue\u00f1o esta semana\t56\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tP2 - Nivel estr\u00e9s (1=m\u00e1ximo 10=sin estr\u00e9s)\t6\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tP3 - Energ\u00eda diaria (1-10)\t6\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tP4 - Fatiga muscular (10=sin s\u00edntomas 1=constante)\t6\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tPROMEDIO RECUPERACI\u00d3N\t7\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tPUNTUACI\u00d3N RECUPERACI\u00d3N\t60\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tIRI FINAL\t59.5\t2026-06-29\nIBF-0003\tEvaluaci\u00f3n IRI\tCLASIFICACI\u00d3N\tPERFORMANCE\t2026-06-29\nIBF-0003\tInforme IRI\tFuerza\t80\t2026-06-29\nIBF-0003\tInforme IRI\tMetab\u00f3lico\t40\t2026-06-29\nIBF-0003\tInforme IRI\tMovilidad\t90\t2026-06-29\nIBF-0003\tInforme IRI\tComposici\u00f3n\t20\t2026-06-29\nIBF-0003\tInforme IRI\tRecuperaci\u00f3n\t60\t2026-06-29\nIBF-0003\tInforme IRI\tIRI\t59.5\t2026-06-29\nIBF-0003\tInforme IRI\tClasificaci\u00f3n\tPERFORMANCE\t2026-06-29\nIBF-0003\tInforme IRI\tFecha\t46201\t2026-06-29\nIBF-0003\tInforme IRI\tPerfil de carga\tCOMPOSICI\u00d3N CORPORAL\t2026-06-29\nIBF-0003\tInforme IRI\tEstabilidad\tLIBRE / INESTABLE\t2026-06-29\nIBF-0003\tInforme IRI\tComplejidad\tMEDIA-ALTA\t2026-06-29\nIBF-0003\tInforme IRI\tRecuperaci\u00f3n\tRECUPERACI\u00d3N NORMAL\t2026-06-29\nIBF-0003\tInforme IRI\tLimitador principal\tCOMPOSICI\u00d3N CORPORAL\t2026-06-29\nIBF-0003\tInforme IRI\tAlerta\tALTA\t2026-06-29\nIBF-0003\tInforme IRI\tResumen Perfil\tBuen punto de partida, con margen de mejora en COMPOSICI\u00d3N CORPORAL. Desbalance: ALTA\t2026-06-29\nIBF-0003\tInforme IRI\tRecomendaci\u00f3n inicial\tPriorizar recomposici\u00f3n corporal y adherencia al proceso\t2026-06-29";
const IBERFIT_MIG_HIST_TSV_ = "CARGA_ID\tFECHA_REGISTRO\tCLIENTE_ID\tSESION_ID\tEJERCICIO_ID\tEJERCICIO_TEXTO\tPATRON\tMODALIDAD_SESION\tSERIES\tREPETICIONES\tTIEMPO\tCARGA\tUNIDAD_CARGA\tRPE\tDESCANSO\tVOLUMEN_ESTIMADO\tMOLESTIA\tNOTAS_TECNICAS\tDECISION_IBERFIT\tCREADO_POR\nHIST-IBF-0001-20260407-S1-001\t2026-04-07\tIBF-0001\tSES-IBF-0001-20260407-S1\tEX-DEADBUG\tDeadbug\tCore\tPRESENCIAL\t2\t12 / 12\t\t3\tkg/legacy\t6\t\t\t\tBloque: INTEGRACI\u00d3N | ICI: 5 | Obs: Bilateral | Regresi\u00f3n: Isom\u00e9trico | Restricci\u00f3n: Control | Uso: Bilateral | Regresi\u00f3n: Isom\u00e9trico | Restricci\u00f3n: Control | Estado: REALIZADA | Prioridad: 2 | Complejidad: 1 | Musculatura: Recto abdominal | Complementaria: Transverso\t\tMIGRACION_EXCEL\nHIST-IBF-0001-20260407-S1-002\t2026-04-07\tIBF-0001\tSES-IBF-0001-20260407-S1\tEX-PLANCHA-FRONTAL\tPlancha frontal\tCore\tPRESENCIAL\t3\t30\" / 30\" / 30\"\t\t30\tseg/legacy\t6\t\t\t\tBloque: INTEGRACI\u00d3N | ICI: 4 | Obs: Bilateral | Regresi\u00f3n: Rodillas | Restricci\u00f3n: Ninguna | Uso: Bilateral | Regresi\u00f3n: Rodillas | Restricci\u00f3n: Ninguna | Estado: REALIZADA | Prioridad: 2 | Complejidad: 1 | Musculatura: Recto abdominal | Complementaria: Transverso, Serrato anterior\tAlerta Patr\u00f3n: MISMO PATR\u00d3N\tMIGRACION_EXCEL\nHIST-IBF-0001-20260407-S1-003\t2026-04-07\tIBF-0001\tSES-IBF-0001-20260407-S1\tEX-HIP-THRUST-CON-PAUSA\tHip thrust con pausa\tBisagra\tPRESENCIAL\t2\t10 / 10\t\t10\tkg/legacy\t7\t\t\t\tBloque: INTEGRACI\u00d3N | ICI: 4 | Obs: Bilateral | Regresi\u00f3n: Puente | Restricci\u00f3n: Control | Uso: Bilateral | Regresi\u00f3n: Puente | Restricci\u00f3n: Control | Estado: REALIZADA | Prioridad: 2 | Complejidad: 2 | Musculatura: Gl\u00fateo mayor | Complementaria: Isquiosurales\t\tMIGRACION_EXCEL\nHIST-IBF-0001-20260407-S1-004\t2026-04-07\tIBF-0001\tSES-IBF-0001-20260407-S1\tEX-SENTADILLA-GOBLET\tSentadilla Goblet\tSentadilla\tPRESENCIAL\t3\t15 / 15 / 15\t\t12\tkg/legacy\t8\t\t\t\tBloque: BLOQUE A | ICI: 4 | Obs: Bilateral | Regresi\u00f3n: Sentadilla a caj\u00f3n | Restricci\u00f3n: Movilidad media | Uso: Bilateral | Regresi\u00f3n: Sentadilla a caj\u00f3n | Restricci\u00f3n: Movilidad media | Estado: REALIZADA | Prioridad: 3 | Complejidad: 1 | Musculatura: Cu\u00e1driceps | Complementaria: Gl\u00fateo mayor, Core\t\tMIGRACION_EXCEL\nHIST-IBF-0001-20260407-S1-005\t2026-04-07\tIBF-0001\tSES-IBF-0001-20260407-S1\tEX-FLEXI-N-EN-SUELO\tFlexi\u00f3n en suelo\tEmpuje horizontal\tPRESENCIAL\t3\t10 / 10 / 10\t\t10\tkg/legacy\t9\t\t\t\tBloque: BLOQUE A | ICI: 4 | Obs: Bilateral | Regresi\u00f3n: Inclinada | Restricci\u00f3n: Carga | Uso: Bilateral | Regresi\u00f3n: Inclinada | Restricci\u00f3n: Carga | Estado: REALIZADA | Prioridad: 2 | Complejidad: 2 | Musculatura: Pectoral mayor | Complementaria: Tr\u00edceps, Deltoides anterior, Core\tAlerta RPE: RPE\tMIGRACION_EXCEL\nHIST-IBF-0001-20260407-S1-006\t2026-04-07\tIBF-0001\tSES-IBF-0001-20260407-S1\tEX-REMO-EN-TRX\tRemo en TRX\tTracci\u00f3n horizontal\tPRESENCIAL\t2\t12 / 12\t\t10\tkg/legacy\t9\t\t\t\tBloque: BLOQUE B | ICI: 4 | Obs: Bilateral | Regresi\u00f3n: Banda | Restricci\u00f3n: Control | Uso: Bilateral | Regresi\u00f3n: Banda | Restricci\u00f3n: Control | Estado: REALIZADA | Prioridad: 3 | Complejidad: 2 | Musculatura: Dorsal ancho | Complementaria: B\u00edceps, Core\tAlerta RPE: RPE\tMIGRACION_EXCEL\nHIST-IBF-0001-20260407-S1-007\t2026-04-07\tIBF-0001\tSES-IBF-0001-20260407-S1\tEX-PESO-MUERTO-CON-BARRA\tPeso muerto con barra\tBisagra\tPRESENCIAL\t2\t12 / 12\t\t0\tLEGACY\t9\t\t\t\tBloque: BLOQUE B | ICI: 4 | Obs: Bilateral | Regresi\u00f3n: Mancuernas | Restricci\u00f3n: T\u00e9cnica | Uso: Bilateral | Regresi\u00f3n: Mancuernas | Restricci\u00f3n: T\u00e9cnica | Estado: REALIZADA | Prioridad: 3 | Complejidad: 3 | Musculatura: Isquiosurales / Gl\u00fateo mayor | Complementaria: Erectores espinales, Dorsales\tAlerta RPE: RPE\tMIGRACION_EXCEL\nHIST-IBF-0001-20260407-S1-008\t2026-04-07\tIBF-0001\tSES-IBF-0001-20260407-S1\tEX-CIRCUITO-INTERVALADO\tCircuito intervalado\tMetab\u00f3lico\tPRESENCIAL\t1\t3'\t\t3\tkg/legacy\t10\t\t\t\tBloque: CONDICIONAMIENTO | ICI: 1 | Obs: Bilateral | Regresi\u00f3n: Reducir intensidad | Restricci\u00f3n: Fatiga | Uso: Bilateral | Regresi\u00f3n: Reducir intensidad | Restricci\u00f3n: Fatiga | Estado: REALIZADA | Prioridad: 2 | Complejidad: 2 | Musculatura: Full Body | Complementaria: Sistema cardiovascular\tAlerta RPE: RPE\tMIGRACION_EXCEL\nHIST-IBF-0001-20260414-S2-009\t2026-04-14\tIBF-0001\tSES-IBF-0001-20260414-S2\tEX-DEADBUG\tDeadbug\tCore\tPRESENCIAL\t3\t12 / 12 / 12\t\t4\tkg/legacy\t8\t\t\t\tBloque: INTEGRACI\u00d3N | ICI: 10 | Obs: SUG: Carga sugerida 3 kg. MANTENER carga por decisi\u00f3n global. Estado operativo: APTO. \u00daltima carga: 3 | \u00daltimo RPE: 6 | \u00daltimo ICI: 5 | Fatiga actual: 5 | Uso: Bilateral | Regresi\u00f3n: Isom\u00e9trico | Restricci\u00f3n: Control | Estado: REALIZADA | Prioridad: 2 | Complejidad: 1 | Musculatura: Recto abdominal | Complementaria: Transverso\tAlerta Carga: \u2191\u2191\tMIGRACION_EXCEL\nHIST-IBF-0001-20260414-S2-010\t2026-04-14\tIBF-0001\tSES-IBF-0001-20260414-S2\tEX-PLANCHA-FRONTAL\tPlancha frontal\tCore\tPRESENCIAL\t3\t30\" / 30\" / 35\"\t\t35\tseg/legacy\t8\t\t\t\tBloque: INTEGRACI\u00d3N | ICI: 8 | Obs: SUG: Carga sugerida 30 kg. MANTENER carga por decisi\u00f3n global. Estado operativo: APTO. \u00daltima carga: 30 | \u00daltimo RPE: 6 | \u00daltimo ICI: 4 | Fatiga actual: 5 | Uso: Bilateral | Regresi\u00f3n: Rodillas | Restricci\u00f3n: Ninguna | Estado: REALIZADA | Prioridad: 2 | Complejidad: 1 | Musculatura: Recto abdominal | Complementaria: Transverso, Serrato anterior\tAlerta Patr\u00f3n: MISMO PATR\u00d3N\tMIGRACION_EXCEL\nHIST-IBF-0001-20260414-S2-011\t2026-04-14\tIBF-0001\tSES-IBF-0001-20260414-S2\tEX-HIP-THRUST-CON-PAUSA\tHip thrust con pausa\tBisagra\tPRESENCIAL\t2\t10 / 10\t\t5\tkg/legacy\t8\t\t\t\tBloque: INTEGRACI\u00d3N | ICI: 8 | Obs: SUG: Carga sugerida 10 kg. MANTENER carga por decisi\u00f3n global. Estado operativo: APTO. \u00daltima carga: 10 | \u00daltimo RPE: 7 | \u00daltimo ICI: 4 | Fatiga actual: 5 | Uso: Bilateral | Regresi\u00f3n: Puente | Restricci\u00f3n: Control | Estado: REALIZADA | Prioridad: 2 | Complejidad: 2 | Musculatura: Gl\u00fateo mayor | Complementaria: Isquiosurales\tAlerta Progresi\u00f3n: \u2193\tMIGRACION_EXCEL\nHIST-IBF-0001-20260414-S2-012\t2026-04-14\tIBF-0001\tSES-IBF-0001-20260414-S2\tEX-SENTADILLA-GOBLET\tSentadilla Goblet\tSentadilla\tPRESENCIAL\t3\t15 / 15 / 15\t\t12\tkg/legacy\t8\t\t\t\tBloque: BLOQUE A | ICI: 10 | Obs: SUG: Carga sugerida 12 kg. MANTENER carga por decisi\u00f3n global. Estado operativo: APTO. \u00daltima carga: 12 | \u00daltimo RPE: 8 | \u00daltimo ICI: 4 | Fatiga actual: 5 | Uso: Bilateral | Regresi\u00f3n: Sentadilla a caj\u00f3n | Restricci\u00f3n: Movilidad media | Estado: REALIZADA | Prioridad: 3 | Complejidad: 1 | Musculatura: Cu\u00e1driceps | Complementaria: Gl\u00fateo mayor, Core\tAlerta Progresi\u00f3n: \u2193\tMIGRACION_EXCEL\nHIST-IBF-0001-20260414-S2-013\t2026-04-14\tIBF-0001\tSES-IBF-0001-20260414-S2\tEX-FLEXI-N-EN-SUELO\tFlexi\u00f3n en suelo\tEmpuje horizontal\tPRESENCIAL\t3\t15 / 15 / 15\t\t10\tkg/legacy\t9\t\t\t\tBloque: BLOQUE A | ICI: 8 | Obs: SUG: Carga sugerida 10 kg. MANTENER carga por decisi\u00f3n global. Estado operativo: APTO. \u00daltima carga: 10 | \u00daltimo RPE: 9 | \u00daltimo ICI: 4 | Fatiga actual: 5 | Uso: Bilateral | Regresi\u00f3n: Inclinada | Restricci\u00f3n: Carga | Estado: REALIZADA | Prioridad: 2 | Complejidad: 2 | Musculatura: Pectoral mayor | Complementaria: Tr\u00edceps, Deltoides anterior, Core\tAlerta Progresi\u00f3n: \u2193 | Alerta RPE: RPE\tMIGRACION_EXCEL\nHIST-IBF-0001-20260414-S2-014\t2026-04-14\tIBF-0001\tSES-IBF-0001-20260414-S2\tEX-REMO-EN-TRX\tRemo en TRX\tTracci\u00f3n horizontal\tPRESENCIAL\t3\t12 / 10 / 10\t\t20\tkg/legacy\t7\t\t\t\tBloque: BLOQUE B | ICI: 8 | Obs: SUG: Carga sugerida 10 kg. MANTENER carga por decisi\u00f3n global. Estado operativo: APTO. \u00daltima carga: 10 | \u00daltimo RPE: 9 | \u00daltimo ICI: 4 | Fatiga actual: 5 | Uso: Bilateral | Regresi\u00f3n: Banda | Restricci\u00f3n: Control | Estado: REALIZADA | Prioridad: 3 | Complejidad: 2 | Musculatura: Dorsal ancho | Complementaria: B\u00edceps, Core\tAlerta Carga: \u2191\u2191\tMIGRACION_EXCEL\nHIST-IBF-0001-20260414-S2-015\t2026-04-14\tIBF-0001\tSES-IBF-0001-20260414-S2\tEX-PESO-MUERTO-CON-BARRA\tPeso muerto con barra\tBisagra\tPRESENCIAL\t3\t12 / 10 / 10\t\t3\tkg/legacy\t7\t\t\t\tBloque: BLOQUE B | ICI: 5 | Obs: SUG: Carga sugerida 0 kg. MANTENER carga por decisi\u00f3n global. Estado operativo: APTO. \u00daltima carga: 0 | \u00daltimo RPE: 9 | \u00daltimo ICI: 4 | Fatiga actual: 5 | Uso: Bilateral | Regresi\u00f3n: Mancuernas | Restricci\u00f3n: T\u00e9cnica | Estado: REALIZADA | Prioridad: 3 | Complejidad: 3 | Musculatura: Isquiosurales / Gl\u00fateo mayor | Complementaria: Erectores espinales, Dorsales\t\tMIGRACION_EXCEL\nHIST-IBF-0001-20260414-S2-016\t2026-04-14\tIBF-0001\tSES-IBF-0001-20260414-S2\tEX-CIRCUITO-INTERVALADO\tCircuito intervalado\tMetab\u00f3lico\tPRESENCIAL\t1\t5'\t\t5\tkg/legacy\t9\t\t\t\tBloque: CONDICIONAMIENTO | ICI: 1.5 | Obs: SUG: Carga sugerida 3 kg. MANTENER con ajuste por RPE alto. Estado operativo: APTO. \u00daltima carga: 3 | \u00daltimo RPE: 10 | \u00daltimo ICI: 1 | Fatiga actual: 5 | Uso: Bilateral | Regresi\u00f3n: Reducir intensidad | Restricci\u00f3n: Fatiga | Estado: REALIZADA | Prioridad: 2 | Complejidad: 2 | Musculatura: Full Body | Complementaria: Sistema cardiovascular\tAlerta Carga: \u2191\u2191 | Alerta RPE: RPE\tMIGRACION_EXCEL\nHIST-IBF-0001-20260421-S3-017\t2026-04-21\tIBF-0001\tSES-IBF-0001-20260421-S3\tEX-PLANCHA-FRONTAL\tPlancha frontal\tCore\tPRESENCIAL\t3\t35 / 35 / 35\t\t35\tseg/legacy\t7\t\t\t\tBloque: INTEGRACI\u00d3N | ICI: 5 | Obs: Bilateral | Regresi\u00f3n: Rodillas | Restricci\u00f3n: Ninguna | Uso: Bilateral | Regresi\u00f3n: Rodillas | Restricci\u00f3n: Ninguna | Estado: REALIZADA | Prioridad: 2 | Complejidad: 1 | Musculatura: Recto abdominal | Complementaria: Transverso, Serrato anterior\tAlerta Patr\u00f3n: #REF! | Alerta Progresi\u00f3n: \u2193\tMIGRACION_EXCEL\nHIST-IBF-0001-20260421-S3-018\t2026-04-21\tIBF-0001\tSES-IBF-0001-20260421-S3\tEX-PLANCHA-LATERAL\tPlancha lateral\tCore\tPRESENCIAL\t3\t30 / 30 / 30\t\t30\tseg/legacy\t7\t\t\t\tBloque: INTEGRACI\u00d3N | ICI: 3 | Obs: Unilateral | Regresi\u00f3n: Rodillas | Restricci\u00f3n: Ninguna | Uso: Unilateral | Regresi\u00f3n: Rodillas | Restricci\u00f3n: Ninguna | Estado: REALIZADA | Prioridad: 2 | Complejidad: 1 | Musculatura: Oblicuos | Complementaria: Transverso, Gl\u00fateo medio\tAlerta Patr\u00f3n: MISMO PATR\u00d3N\tMIGRACION_EXCEL\nHIST-IBF-0001-20260421-S3-019\t2026-04-21\tIBF-0001\tSES-IBF-0001-20260421-S3\tEX-HIP-THRUST-CON-PAUSA\tHip thrust con pausa\tBisagra\tPRESENCIAL\t2\t12 / 12\t\t5\tkg/legacy\t7\t\t\t\tBloque: INTEGRACI\u00d3N | ICI: 5 | Obs: Bilateral | Regresi\u00f3n: Puente | Restricci\u00f3n: Control | Uso: Bilateral | Regresi\u00f3n: Puente | Restricci\u00f3n: Control | Estado: REALIZADA | Prioridad: 2 | Complejidad: 2 | Musculatura: Gl\u00fateo mayor | Complementaria: Isquiosurales\tAlerta Progresi\u00f3n: \u2193\tMIGRACION_EXCEL\nHIST-IBF-0001-20260421-S3-020\t2026-04-21\tIBF-0001\tSES-IBF-0001-20260421-S3\tEX-SENTADILLA-EN-MULTIPOWER\tSentadilla en multipower\tSentadilla\tPRESENCIAL\t3\t15 / 15 / 15\t\t20\tkg/legacy\t6\t\t\t\tBloque: BLOQUE A | ICI: 3 | Obs: Bilateral | Regresi\u00f3n: Goblet | Restricci\u00f3n: Ninguna | Uso: Bilateral | Regresi\u00f3n: Goblet | Restricci\u00f3n: Ninguna | Estado: REALIZADA | Prioridad: 3 | Complejidad: 1 | Musculatura: Cu\u00e1driceps | Complementaria: Gl\u00fateo mayor\t\tMIGRACION_EXCEL\nHIST-IBF-0001-20260421-S3-021\t2026-04-21\tIBF-0001\tSES-IBF-0001-20260421-S3\tEX-FLEXI-N-EN-SUELO\tFlexi\u00f3n en suelo\tEmpuje horizontal\tPRESENCIAL\t3\t12 / 12 / 8\t\t10\tkg/legacy\t8\t\t\t\tBloque: BLOQUE A | ICI: 4 | Obs: Bilateral | Regresi\u00f3n: Inclinada | Restricci\u00f3n: Carga | Uso: Bilateral | Regresi\u00f3n: Inclinada | Restricci\u00f3n: Carga | Estado: REALIZADA | Prioridad: 2 | Complejidad: 2 | Musculatura: Pectoral mayor | Complementaria: Tr\u00edceps, Deltoides anterior, Core\tAlerta Progresi\u00f3n: \u2193\tMIGRACION_EXCEL\nHIST-IBF-0001-20260421-S3-022\t2026-04-21\tIBF-0001\tSES-IBF-0001-20260421-S3\tEX-REMO-EN-TRX\tRemo en TRX\tTracci\u00f3n horizontal\tPRESENCIAL\t3\t12 / 12 / 12\t\t20\tkg/legacy\t8\t\t\t\tBloque: BLOQUE B | ICI: 5 | Obs: Bilateral | Regresi\u00f3n: Banda | Restricci\u00f3n: Control | Uso: Bilateral | Regresi\u00f3n: Banda | Restricci\u00f3n: Control | Estado: REALIZADA | Prioridad: 3 | Complejidad: 2 | Musculatura: Dorsal ancho | Complementaria: B\u00edceps, Core\tAlerta Progresi\u00f3n: \u2193\tMIGRACION_EXCEL\nHIST-IBF-0001-20260421-S3-023\t2026-04-21\tIBF-0001\tSES-IBF-0001-20260421-S3\tEX-PESO-MUERTO-CON-BARRA\tPeso muerto con barra\tBisagra\tPRESENCIAL\t3\t10 / 10 / 10\t\t3\tkg/legacy\t7\t\t\t\tBloque: BLOQUE B | ICI: 3 | Obs: Bilateral | Regresi\u00f3n: Mancuernas | Restricci\u00f3n: T\u00e9cnica | Uso: Bilateral | Regresi\u00f3n: Mancuernas | Restricci\u00f3n: T\u00e9cnica | Estado: REALIZADA | Prioridad: 3 | Complejidad: 3 | Musculatura: Isquiosurales / Gl\u00fateo mayor | Complementaria: Erectores espinales, Dorsales\tAlerta Progresi\u00f3n: \u2193\tMIGRACION_EXCEL\nHIST-IBF-0001-20260602-S4-024\t2026-06-02\tIBF-0001\tSES-IBF-0001-20260602-S4\tEX-SENTADILLA-CON-TRX\tSentadilla con TRX\tSentadilla\tPRESENCIAL\t2\t15 / 15\t\t0\tLEGACY\t3\t\t\t\tBloque: ACTIVACI\u00d3N | ICI: 6 | Obs: SUG: Primer registro: sin historial previo para sugerir carga. | Uso: Bilateral | Regresi\u00f3n: Sentadilla a caj\u00f3n | Restricci\u00f3n: Equilibrio | Estado: REALIZADA | Prioridad: 3 | Complejidad: 1 | Musculatura: Cu\u00e1driceps | Complementaria: Gl\u00fateo mayor, Core\tAlerta Patr\u00f3n: #REF!\tMIGRACION_EXCEL\nHIST-IBF-0001-20260602-S4-025\t2026-06-02\tIBF-0001\tSES-IBF-0001-20260602-S4\tEX-PLANCHA-FRONTAL\tPlancha frontal\tCore\tPRESENCIAL\t3\t35 / 35 / 35\t\t40\tseg/legacy\t9\t\t\t\tBloque: INTEGRACI\u00d3N | ICI: 10 | Obs: SUG: Carga sugerida 35 kg. MANTENER carga por decisi\u00f3n global. Estado operativo: APTO. \u00daltima carga: 35 | \u00daltimo RPE: 7 | \u00daltimo ICI: 5 | Fatiga actual: 6 | Uso: Bilateral | Regresi\u00f3n: Rodillas | Restricci\u00f3n: Ninguna | Estado: REALIZADA | Prioridad: 2 | Complejidad: 1 | Musculatura: Recto abdominal | Complementaria: Transverso, Serrato anterior\tAlerta RPE: RPE\tMIGRACION_EXCEL\nHIST-IBF-0001-20260602-S4-026\t2026-06-02\tIBF-0001\tSES-IBF-0001-20260602-S4\tEX-WALL-SIT-ISOM-TRICO\tWall sit (isom\u00e9trico)\tSentadilla\tPRESENCIAL\t3\t35 / 35 / 35\t\t45\tseg/legacy\t7\t\t\t\tBloque: INTEGRACI\u00d3N | ICI: 10 | Obs: SUG: Primer registro: sin historial previo para sugerir carga. | Uso: Bilateral | Regresi\u00f3n: Parcial | Restricci\u00f3n: Dolor rodilla | Estado: REALIZADA | Prioridad: 2 | Complejidad: 1 | Musculatura: Cu\u00e1driceps | Complementaria: Gl\u00fateo medio\t\tMIGRACION_EXCEL\nHIST-IBF-0001-20260602-S4-027\t2026-06-02\tIBF-0001\tSES-IBF-0001-20260602-S4\tEX-PESO-MUERTO-CON-BARRA\tPeso muerto con barra\tBisagra\tPRESENCIAL\t3\t15 / 15 / 15\t\t10\tkg/legacy\t7\t\t\t\tBloque: BLOQUE A | ICI: 6 | Obs: SUG: Primer registro: sin historial previo para sugerir carga. | Uso: Bilateral | Regresi\u00f3n: Mancuernas | Restricci\u00f3n: T\u00e9cnica | Estado: REALIZADA | Prioridad: 3 | Complejidad: 3 | Musculatura: Isquiosurales / Gl\u00fateo mayor | Complementaria: Erectores espinales, Dorsales\t\tMIGRACION_EXCEL\nHIST-IBF-0001-20260602-S4-028\t2026-06-02\tIBF-0001\tSES-IBF-0001-20260602-S4\tEX-PRESS-INCLINADO-CON-MANCUERNAS\tPress inclinado con mancuernas\tEmpuje horizontal\tPRESENCIAL\t3\t12 / 12 / 12\t\t5\tkg/legacy\t8\t\t\t\tBloque: BLOQUE A | ICI: 6 | Obs: SUG: Primer registro: sin historial previo para sugerir carga. | Uso: Bilateral | Regresi\u00f3n: Flexi\u00f3n | Restricci\u00f3n: Hombro | Estado: REALIZADA | Prioridad: 3 | Complejidad: 2 | Musculatura: Pectoral mayor (superior) | Complementaria: Tr\u00edceps, Deltoides anterior\t\tMIGRACION_EXCEL\nHIST-IBF-0001-20260602-S4-029\t2026-06-02\tIBF-0001\tSES-IBF-0001-20260602-S4\tEX-SENTADILLA-B-LGARA\tSentadilla b\u00falgara\tSentadilla\tPRESENCIAL\t2\t10 / 10\t\t0\tLEGACY\t10\t\t\t\tBloque: BLOQUE B | ICI: 8 | Obs: SUG: Primer registro: sin historial previo para sugerir carga. | Uso: Unilateral | Regresi\u00f3n: Split asistido | Restricci\u00f3n: Equilibrio | Estado: REALIZADA | Prioridad: 3 | Complejidad: 2 | Musculatura: Cu\u00e1driceps | Complementaria: Gl\u00fateo mayor, Isquiosurales\tAlerta RPE: RPE\tMIGRACION_EXCEL\nHIST-IBF-0001-20260602-S4-030\t2026-06-02\tIBF-0001\tSES-IBF-0001-20260602-S4\tEX-REMO-CON-MANCUERNA\tRemo con mancuerna\tTracci\u00f3n horizontal\tPRESENCIAL\t3\t12 / 12 / 12\t\t10\tkg/legacy\t8\t\t\t\tBloque: BLOQUE B | ICI: 5 | Obs: SUG: Primer registro: sin historial previo para sugerir carga. | Uso: Unilateral | Regresi\u00f3n: Banda | Restricci\u00f3n: Estabilidad | Estado: REALIZADA | Prioridad: 3 | Complejidad: 2 | Musculatura: Dorsal ancho | Complementaria: B\u00edceps, Deltoides posterior\t\tMIGRACION_EXCEL\nHIST-IBF-0001-20260602-S4-031\t2026-06-02\tIBF-0001\tSES-IBF-0001-20260602-S4\tEX-CIRCUITO-INTERVALADO\tCircuito intervalado\tMetab\u00f3lico\tPRESENCIAL\t1\t5\t\t4.5\tkg/legacy\t9\t\t\t\tBloque: CONDICIONAMIENTO | ICI: 6 | Obs: Bilateral | Regresi\u00f3n: Reducir intensidad | Restricci\u00f3n: Fatiga | Uso: Bilateral | Regresi\u00f3n: Reducir intensidad | Restricci\u00f3n: Fatiga | Estado: REALIZADA | Prioridad: 2 | Complejidad: 2 | Musculatura: Full Body | Complementaria: Sistema cardiovascular\tAlerta Progresi\u00f3n: \u2193 | Alerta RPE: RPE\tMIGRACION_EXCEL\nHIST-IBF-0001-20260609-S5-032\t2026-06-09\tIBF-0001\tSES-IBF-0001-20260609-S5\tEX-DEADBUG-CON-CARGA\tDeadbug con carga\tCore\tPRESENCIAL\t2\t12 / 12\t\t5\tkg/legacy\t8\t\t\t\tBloque: ACTIVACI\u00d3N | ICI: 9 | Notas: COMIENZO CARGA | Obs: SUG: Primer registro: sin historial previo para sugerir carga. | Uso: Bilateral | Regresi\u00f3n: Sin carga | Restricci\u00f3n: Control | Estado: REALIZADA | Prioridad: 2 | Complejidad: 1 | Musculatura: Recto abdominal | Complementaria: Transverso, Pectoral (isom\u00e9trico)\tAlerta Patr\u00f3n: #REF!\tMIGRACION_EXCEL\nHIST-IBF-0001-20260609-S5-033\t2026-06-09\tIBF-0001\tSES-IBF-0001-20260609-S5\tEX-PUENTE-DE-GL-TEO\tPuente de gl\u00fateo\tBisagra\tPRESENCIAL\t3\t10 / 10 / 10\t\t12\tkg/legacy\t6\t\t\t\tBloque: INTEGRACI\u00d3N | ICI: 8 | Notas: COMIENZO CARGA | Obs: SUG: Primer registro: sin historial previo para sugerir carga. | Uso: Bilateral | Regresi\u00f3n: Hip hinge | Restricci\u00f3n: Control lumbar | Estado: REALIZADA | Prioridad: 2 | Complejidad: 1 | Musculatura: Gl\u00fateo mayor | Complementaria: Isquiosurales\t\tMIGRACION_EXCEL\nHIST-IBF-0001-20260609-S5-034\t2026-06-09\tIBF-0001\tSES-IBF-0001-20260609-S5\tEX-FLEXI-N-INCLINADA\tFlexi\u00f3n inclinada\tEmpuje horizontal\tPRESENCIAL\t3\t12 / 12 / 12\t\t0\tLEGACY\t9\t\t\t\tBloque: INTEGRACI\u00d3N | ICI: 6 | Notas: COMIENZO CARGA | Obs: SUG: Primer registro: sin historial previo para sugerir carga. | Uso: Bilateral | Regresi\u00f3n: Flexi\u00f3n pared | Restricci\u00f3n: Carga | Estado: REALIZADA | Prioridad: 2 | Complejidad: 1 | Musculatura: Pectoral mayor | Complementaria: Tr\u00edceps, Deltoides anterior\tAlerta RPE: RPE\tMIGRACION_EXCEL\nHIST-IBF-0001-20260609-S5-035\t2026-06-09\tIBF-0001\tSES-IBF-0001-20260609-S5\tEX-WALL-SIT-ISOM-TRICO\tWall sit (isom\u00e9trico)\tSentadilla\tPRESENCIAL\t3\t1 / 1 / 1\t\t50\tseg/legacy\t9\t\t\t\tBloque: BLOQUE A | ICI: 6 | Notas: COMIENZO CARGA | Obs: SUG: Primer registro: sin historial previo para sugerir carga. | Uso: Bilateral | Regresi\u00f3n: Parcial | Restricci\u00f3n: Dolor rodilla | Estado: REALIZADA | Prioridad: 2 | Complejidad: 1 | Musculatura: Cu\u00e1driceps | Complementaria: Gl\u00fateo medio\tAlerta RPE: RPE\tMIGRACION_EXCEL\nHIST-IBF-0001-20260609-S5-036\t2026-06-09\tIBF-0001\tSES-IBF-0001-20260609-S5\tEX-PRESS-CON-MANCUERNAS-PLANO\tPress con mancuernas plano\tEmpuje horizontal\tPRESENCIAL\t3\t15 / 15 / 15\t\t5.5\tkg/legacy\t9\t\t\t\tBloque: BLOQUE A | ICI: 7 | Notas: COMIENZO CARGA | Obs: SUG: Primer registro: sin historial previo para sugerir carga. | Uso: Bilateral | Regresi\u00f3n: Flexi\u00f3n | Restricci\u00f3n: Ninguna | Estado: REALIZADA | Prioridad: 3 | Complejidad: 2 | Musculatura: Pectoral mayor | Complementaria: Tr\u00edceps, Deltoides anterior\tAlerta RPE: RPE\tMIGRACION_EXCEL\nHIST-IBF-0001-20260609-S5-037\t2026-06-09\tIBF-0001\tSES-IBF-0001-20260609-S5\tEX-PESO-MUERTO-CON-BARRA\tPeso muerto con barra\tBisagra\tPRESENCIAL\t3\t15 / 15 / 15\t\t10.5\tkg/legacy\t8\t\t\t\tBloque: BLOQUE B | ICI: 7 | Notas: COMIENZO CARGA | Obs: SUG: Carga sugerida 3 kg. MANTENER carga por decisi\u00f3n global. Estado operativo: APTO. \u00daltima carga: 3 | \u00daltimo RPE: 7 | \u00daltimo ICI: 3 | Fatiga actual: 6 | Uso: Bilateral | Regresi\u00f3n: Mancuernas | Restricci\u00f3n: T\u00e9cnica | Estado: REALIZADA | Prioridad: 3 | Complejidad: 3 | Musculatura: Isquiosurales / Gl\u00fateo mayor | Complementaria: Erectores espinales, Dorsales\tAlerta Carga: \u2191\u2191\tMIGRACION_EXCEL\nHIST-IBF-0001-20260609-S5-038\t2026-06-09\tIBF-0001\tSES-IBF-0001-20260609-S5\tEX-PRESS-MILITAR-CON-MANCUERNAS\tPress militar con mancuernas\tEmpuje vertical\tPRESENCIAL\t2\t15 / 15\t\t5\tkg/legacy\t7\t\t\t\tBloque: BLOQUE B | ICI: 7 | Notas: COMIENZO CARGA | Obs: SUG: Primer registro: sin historial previo para sugerir carga. | Uso: Bilateral | Regresi\u00f3n: Press inclinado | Restricci\u00f3n: Hombro | Estado: REALIZADA | Prioridad: 3 | Complejidad: 3 | Musculatura: Deltoides anterior | Complementaria: Tr\u00edceps, Serrato anterior\t\tMIGRACION_EXCEL\nHIST-IBF-0001-20260609-S5-039\t2026-06-09\tIBF-0001\tSES-IBF-0001-20260609-S5\tEX-ELEVACIONES-LATERALES-CON-MANCUERNA\tElevaciones laterales con mancuerna\tEmpuje V.\tPRESENCIAL\t3\t10 / 10 / 10\t\t2.5\tkg/legacy\t8\t\t\t\tBloque: BLOQUE B | ICI: 6 | Notas: COMIENZO CARGA | Obs: SUG: Primer registro: sin historial previo para sugerir carga. | Uso: Bilateral | Regresi\u00f3n: Ninguna | Restricci\u00f3n: Hombro | Estado: REALIZADA | Prioridad: 2 | Complejidad: 2 | Musculatura: Deltoides posterior | Complementaria: Trapecio / Romboides\t\tMIGRACION_EXCEL\nHIST-IBF-0001-20260609-S5-040\t2026-06-09\tIBF-0001\tSES-IBF-0001-20260609-S5\tEX-CIRCUITO-INTERVALADO\tCircuito intervalado\tMetab\u00f3lico\tPRESENCIAL\t1\t1\t\t4.5\tkg/legacy\t10\t\t\t\tBloque: CONDICIONAMIENTO | ICI: 4 | Notas: COMIENZO CARGA | Obs: Bilateral | Regresi\u00f3n: Reducir intensidad | Restricci\u00f3n: Fatiga | Uso: Bilateral | Regresi\u00f3n: Reducir intensidad | Restricci\u00f3n: Fatiga | Estado: REALIZADA | Prioridad: 2 | Complejidad: 2 | Musculatura: Full Body | Complementaria: Sistema cardiovascular\tAlerta Progresi\u00f3n: \u2193 | Alerta RPE: RPE\tMIGRACION_EXCEL\nHIST-IBF-0002-20260602-S1-041\t2026-06-02\tIBF-0002\tSES-IBF-0002-20260602-S1\tEX-SENTADILLA-GOBLET\tSentadilla Goblet\tSentadilla\tPRESENCIAL\t2\t15 / 15\t\t0\tLEGACY\t2\t\t\t\tBloque: ACTIVACI\u00d3N | ICI: 10 | Obs: Bilateral | Regresi\u00f3n: Sentadilla a caj\u00f3n | Restricci\u00f3n: Movilidad media | Uso: Bilateral | Regresi\u00f3n: Sentadilla a caj\u00f3n | Restricci\u00f3n: Movilidad media | Estado: REALIZADA | Prioridad: 3 | Complejidad: 1 | Musculatura: Cu\u00e1driceps | Complementaria: Gl\u00fateo mayor, Core\t\tMIGRACION_EXCEL\nHIST-IBF-0002-20260602-S1-042\t2026-06-02\tIBF-0002\tSES-IBF-0002-20260602-S1\tEX-PLANCHA-FRONTAL\tPlancha frontal\tCore\tPRESENCIAL\t3\t35 / 40 / 40\t\t40\tseg/legacy\t5\t\t\t\tBloque: INTEGRACI\u00d3N | ICI: 8 | Obs: Bilateral | Regresi\u00f3n: Rodillas | Restricci\u00f3n: Ninguna | Uso: Bilateral | Regresi\u00f3n: Rodillas | Restricci\u00f3n: Ninguna | Estado: REALIZADA | Prioridad: 2 | Complejidad: 1 | Musculatura: Recto abdominal | Complementaria: Transverso, Serrato anterior\t\tMIGRACION_EXCEL\nHIST-IBF-0002-20260602-S1-043\t2026-06-02\tIBF-0002\tSES-IBF-0002-20260602-S1\tEX-WALL-SIT-ISOM-TRICO\tWall sit (isom\u00e9trico)\tSentadilla\tPRESENCIAL\t3\t1 / 1 / 1\t\t30\tseg/legacy\t6\t\t\t\tBloque: INTEGRACI\u00d3N | ICI: 8 | Obs: Bilateral | Regresi\u00f3n: Parcial | Restricci\u00f3n: Dolor rodilla | Uso: Bilateral | Regresi\u00f3n: Parcial | Restricci\u00f3n: Dolor rodilla | Estado: REALIZADA | Prioridad: 2 | Complejidad: 1 | Musculatura: Cu\u00e1driceps | Complementaria: Gl\u00fateo medio\t\tMIGRACION_EXCEL\nHIST-IBF-0002-20260602-S1-044\t2026-06-02\tIBF-0002\tSES-IBF-0002-20260602-S1\tEX-SENTADILLA-EN-MULTIPOWER\tSentadilla en multipower\tSentadilla\tPRESENCIAL\t3\t12 / 15 / 12\t\t55\tkg/legacy\t8\t\t\t\tBloque: BLOQUE A | ICI: 8 | Obs: Bilateral | Regresi\u00f3n: Goblet | Restricci\u00f3n: Ninguna | Uso: Bilateral | Regresi\u00f3n: Goblet | Restricci\u00f3n: Ninguna | Estado: REALIZADA | Prioridad: 3 | Complejidad: 1 | Musculatura: Cu\u00e1driceps | Complementaria: Gl\u00fateo mayor\tAlerta Patr\u00f3n: MISMO PATR\u00d3N\tMIGRACION_EXCEL\nHIST-IBF-0002-20260602-S1-045\t2026-06-02\tIBF-0002\tSES-IBF-0002-20260602-S1\tEX-PRESS-INCLINADO-CON-MANCUERNAS\tPress inclinado con mancuernas\tEmpuje horizontal\tPRESENCIAL\t3\t12 / 15 / 15\t\t12.5\tkg/legacy\t7\t\t\t\tBloque: BLOQUE A | ICI: 7 | Obs: Bilateral | Regresi\u00f3n: Flexi\u00f3n | Restricci\u00f3n: Hombro | Uso: Bilateral | Regresi\u00f3n: Flexi\u00f3n | Restricci\u00f3n: Hombro | Estado: REALIZADA | Prioridad: 3 | Complejidad: 2 | Musculatura: Pectoral mayor (superior) | Complementaria: Tr\u00edceps, Deltoides anterior\t\tMIGRACION_EXCEL\nHIST-IBF-0002-20260602-S1-046\t2026-06-02\tIBF-0002\tSES-IBF-0002-20260602-S1\tEX-PESO-MUERTO-RUMANO-A-UNA-PIERNA\tPeso muerto rumano a una pierna\tBisagra\tPRESENCIAL\t3\t15 / 15 / 15\t\t15\tkg/legacy\t7\t\t\t\tBloque: BLOQUE B | ICI: 8 | Obs: Unilateral | Regresi\u00f3n: Bilateral | Restricci\u00f3n: Equilibrio | Uso: Unilateral | Regresi\u00f3n: Bilateral | Restricci\u00f3n: Equilibrio | Estado: REALIZADA | Prioridad: 3 | Complejidad: 3 | Musculatura: Isquiosurales | Complementaria: Gl\u00fateo medio, Core\t\tMIGRACION_EXCEL\nHIST-IBF-0002-20260602-S1-047\t2026-06-02\tIBF-0002\tSES-IBF-0002-20260602-S1\tEX-ELEVACIONES-LATERALES-CON-MANCUERNA\tElevaciones laterales con mancuerna\tEmpuje V.\tPRESENCIAL\t3\t12 / 12 / 12\t\t7.5\tkg/legacy\t7\t\t\t\tBloque: BLOQUE B | ICI: 6 | Obs: Bilateral | Regresi\u00f3n: Ninguna | Restricci\u00f3n: Hombro | Uso: Bilateral | Regresi\u00f3n: Ninguna | Restricci\u00f3n: Hombro | Estado: REALIZADA | Prioridad: 2 | Complejidad: 2 | Musculatura: Deltoides posterior | Complementaria: Trapecio / Romboides\t\tMIGRACION_EXCEL\nHIST-IBF-0002-20260602-S1-048\t2026-06-02\tIBF-0002\tSES-IBF-0002-20260602-S1\tEX-BICICLETA-EST-TICA\tBicicleta est\u00e1tica\tMetab\u00f3lico\tPRESENCIAL\t3\t1 / 1 / 1\t\t2.1\tkg/legacy\t8\t\t\t\tBloque: CONDICIONAMIENTO | ICI: 10 | Obs: Bilateral | Regresi\u00f3n: Lento | Restricci\u00f3n: Ninguna | Uso: Bilateral | Regresi\u00f3n: Lento | Restricci\u00f3n: Ninguna | Estado: REALIZADA | Prioridad: 2 | Complejidad: 1 | Musculatura: Cu\u00e1driceps | Complementaria: Isquiosurales, Sistema cardiovascular\t\tMIGRACION_EXCEL\nHIST-IBF-0002-20260606-S2-049\t2026-06-06\tIBF-0002\tSES-IBF-0002-20260606-S2\tEX-SENTADILLA-GOBLET-PROFUNDA\tSentadilla Goblet profunda\tSentadilla\tPRESENCIAL\t2\t15 / 15\t\t0\tLEGACY\t2\t\t\t\tBloque: ACTIVACI\u00d3N | ICI: 9 | Obs: SUG: Primer registro: sin historial previo para sugerir carga. | Uso: Bilateral | Regresi\u00f3n: Sentadilla parcial | Restricci\u00f3n: Movilidad cadera | Estado: REALIZADA | Prioridad: 3 | Complejidad: 2 | Musculatura: Cu\u00e1driceps | Complementaria: Gl\u00fateo mayor, Aductores\t\tMIGRACION_EXCEL\nHIST-IBF-0002-20260606-S2-050\t2026-06-06\tIBF-0002\tSES-IBF-0002-20260606-S2\tEX-REMO-CON-MANCUERNA\tRemo con mancuerna\tTracci\u00f3n horizontal\tPRESENCIAL\t3\t15 / 15 / 15\t\t12.5\tkg/legacy\t6\t\t\t\tBloque: INTEGRACI\u00d3N | ICI: 8 | Obs: SUG: Primer registro: sin historial previo para sugerir carga. | Uso: Unilateral | Regresi\u00f3n: Banda | Restricci\u00f3n: Estabilidad | Estado: REALIZADA | Prioridad: 3 | Complejidad: 2 | Musculatura: Dorsal ancho | Complementaria: B\u00edceps, Deltoides posterior\t\tMIGRACION_EXCEL\nHIST-IBF-0002-20260606-S2-051\t2026-06-06\tIBF-0002\tSES-IBF-0002-20260606-S2\tEX-REMO-EN-TRX\tRemo en TRX\tTracci\u00f3n horizontal\tPRESENCIAL\t3\t12 / 12 / 12\t\t0\tLEGACY\t6\t\t\t\tBloque: BLOQUE A | ICI: 8 | Obs: SUG: Primer registro: sin historial previo para sugerir carga. | Uso: Bilateral | Regresi\u00f3n: Banda | Restricci\u00f3n: Control | Estado: REALIZADA | Prioridad: 3 | Complejidad: 2 | Musculatura: Dorsal ancho | Complementaria: B\u00edceps, Core\tAlerta Patr\u00f3n: MISMO PATR\u00d3N\tMIGRACION_EXCEL\nHIST-IBF-0002-20260606-S2-052\t2026-06-06\tIBF-0002\tSES-IBF-0002-20260606-S2\tEX-PRESS-INCLINADO-CON-MANCUERNAS\tPress inclinado con mancuernas\tEmpuje horizontal\tPRESENCIAL\t3\t12 / 12 / 12\t\t12.5\tkg/legacy\t7\t\t\t\tBloque: BLOQUE A | ICI: 8 | Obs: SUG: Carga sugerida 12.5 kg. Ajuste conservador. Factores: ICI muy bajo, RPE controlado, protecci\u00f3n de PB, tipo GENERAL, salto 1, estado APTO, decisi\u00f3n global PROGRESAR. \u00daltima carga: 12.5 | \u00daltimo RPE: 7 | \u00daltimo ICI: 7 | Fatiga actual: 5 | Uso: Bilateral | Regresi\u00f3n: Flexi\u00f3n | Restricci\u00f3n: Hombro | Estado: REALIZADA | Prioridad: 3 | Complejidad: 2 | Musculatura: Pectoral mayor (superior) | Complementaria: Tr\u00edceps, Deltoides anterior\tAlerta Progresi\u00f3n: \u2193\tMIGRACION_EXCEL\nHIST-IBF-0002-20260606-S2-053\t2026-06-06\tIBF-0002\tSES-IBF-0002-20260606-S2\tEX-SENTADILLA-B-LGARA\tSentadilla b\u00falgara\tSentadilla\tPRESENCIAL\t2\t12 / 12\t\t0\tLEGACY\t9\t\t\t\tBloque: BLOQUE A | ICI: 6 | Obs: SUG: Primer registro: sin historial previo para sugerir carga. | Uso: Unilateral | Regresi\u00f3n: Split asistido | Restricci\u00f3n: Equilibrio | Estado: REALIZADA | Prioridad: 3 | Complejidad: 2 | Musculatura: Cu\u00e1driceps | Complementaria: Gl\u00fateo mayor, Isquiosurales\tAlerta RPE: RPE\tMIGRACION_EXCEL\nHIST-IBF-0002-20260606-S2-054\t2026-06-06\tIBF-0002\tSES-IBF-0002-20260606-S2\tEX-HIP-THRUST-UNILATERAL\tHip thrust unilateral\tBisagra\tPRESENCIAL\t2\t12 / 12\t\t0\tLEGACY\t7\t\t\t\tBloque: BLOQUE A | ICI: 7 | Obs: SUG: Primer registro: sin historial previo para sugerir carga. | Uso: Unilateral | Regresi\u00f3n: Bilateral | Restricci\u00f3n: Equilibrio | Estado: REALIZADA | Prioridad: 2 | Complejidad: 2 | Musculatura: Gl\u00fateo mayor | Complementaria: Isquiosurales, Oblicuos\t\tMIGRACION_EXCEL\nHIST-IBF-0002-20260606-S2-055\t2026-06-06\tIBF-0002\tSES-IBF-0002-20260606-S2\tEX-PRESS-MILITAR-CON-MANCUERNAS\tPress militar con mancuernas\tEmpuje vertical\tPRESENCIAL\t2\t10 / 10\t\t7.5\tkg/legacy\t8\t\t\t\tBloque: BLOQUE B | ICI: 7 | Obs: SUG: Primer registro: sin historial previo para sugerir carga. | Uso: Bilateral | Regresi\u00f3n: Press inclinado | Restricci\u00f3n: Hombro | Estado: REALIZADA | Prioridad: 3 | Complejidad: 3 | Musculatura: Deltoides anterior | Complementaria: Tr\u00edceps, Serrato anterior\t\tMIGRACION_EXCEL\nHIST-IBF-0002-20260606-S2-056\t2026-06-06\tIBF-0002\tSES-IBF-0002-20260606-S2\tEX-ELEVACIONES-LATERALES-CON-MANCUERNA\tElevaciones laterales con mancuerna\tEmpuje V.\tPRESENCIAL\t2\t10 / 10\t\t7.5\tkg/legacy\t9\t\t\t\tBloque: BLOQUE B | ICI: 7 | Obs: SUG: Carga sugerida 7.5 kg. Ajuste conservador. Factores: ICI muy bajo, RPE controlado, protecci\u00f3n de PB, tipo AISLADO_ACCESORIO, salto 0.5, estado APTO, decisi\u00f3n global PROGRESAR. \u00daltima carga: 7.5 | \u00daltimo RPE: 7 | \u00daltimo ICI: 6 | Fatiga actual: 5 | Uso: Bilateral | Regresi\u00f3n: Ninguna | Restricci\u00f3n: Hombro | Estado: REALIZADA | Prioridad: 2 | Complejidad: 2 | Musculatura: Deltoides posterior | Complementaria: Trapecio / Romboides\tAlerta Progresi\u00f3n: \u2193 | Alerta RPE: RPE\tMIGRACION_EXCEL\nHIST-IBF-0002-20260606-S2-057\t2026-06-06\tIBF-0002\tSES-IBF-0002-20260606-S2\tEX-CURL-MARTILLO-CON-MANCUERNA\tCurl martillo con mancuerna\tTracci\u00f3n H.\tPRESENCIAL\t2\t10 / 10\t\t10\tkg/legacy\t8\t\t\t\tBloque: BLOQUE B | ICI: 8 | Obs: Bilateral | Regresi\u00f3n: Curl supino | Restricci\u00f3n: Ninguna | Uso: Bilateral | Regresi\u00f3n: Curl supino | Restricci\u00f3n: Ninguna | Estado: REALIZADA | Prioridad: 1 | Complejidad: 2 | Musculatura: B\u00edceps braquial | Complementaria: Braquial\t\tMIGRACION_EXCEL\nHIST-IBF-0002-20260606-S2-058\t2026-06-06\tIBF-0002\tSES-IBF-0002-20260606-S2\tEX-EXTENSI-N-TR-CEPS-CON-MANCUERNA\tExtensi\u00f3n tr\u00edceps con mancuerna\tEmpuje H.\tPRESENCIAL\t2\t10 / 10\t\t7.5\tkg/legacy\t8\t\t\t\tBloque: BLOQUE B | ICI: 9 | Obs: Unilateral | Regresi\u00f3n: Extensi\u00f3n polea | Restricci\u00f3n: Ninguna | Uso: Unilateral | Regresi\u00f3n: Extensi\u00f3n polea | Restricci\u00f3n: Ninguna | Estado: REALIZADA | Prioridad: 1 | Complejidad: 2 | Musculatura: Tr\u00edceps braquial | Complementaria: Deltoides anterior\t\tMIGRACION_EXCEL\nHIST-IBF-0002-20260609-S3-059\t2026-06-09\tIBF-0002\tSES-IBF-0002-20260609-S3\tEX-SENTADILLA-GOBLET\tSentadilla Goblet\tSentadilla\tPRESENCIAL\t3\t15 / 15 / 15\t\t0\tLEGACY\t2\t\t\t\tBloque: ACTIVACI\u00d3N | ICI: 9 | Notas: CARGA CONTROLADA | Obs: SUG: Carga sugerida 0 kg. MANTENER carga por decisi\u00f3n global. Estado operativo: APTO. \u00daltima carga: 0 | \u00daltimo RPE: 2 | \u00daltimo ICI: 10 | Fatiga actual: 6 | Uso: Bilateral | Regresi\u00f3n: Sentadilla a caj\u00f3n | Restricci\u00f3n: Movilidad media | Estado: REALIZADA | Prioridad: 3 | Complejidad: 1 | Musculatura: Cu\u00e1driceps | Complementaria: Gl\u00fateo mayor, Core\tAlerta Progresi\u00f3n: \u2193\tMIGRACION_EXCEL\nHIST-IBF-0002-20260609-S3-060\t2026-06-09\tIBF-0002\tSES-IBF-0002-20260609-S3\tEX-PLANCHA-FRONTAL\tPlancha frontal\tCore\tPRESENCIAL\t3\t45 / 45 / 45\t\t45\tseg/legacy\t7\t\t\t\tBloque: INTEGRACI\u00d3N | ICI: 9 | Notas: CARGA CONTROLADA | Uso: Bilateral | Regresi\u00f3n: Rodillas | Restricci\u00f3n: Ninguna | Estado: REALIZADA | Prioridad: 2 | Complejidad: 1 | Musculatura: Recto abdominal | Complementaria: Transverso, Serrato anterior\t\tMIGRACION_EXCEL\nHIST-IBF-0002-20260609-S3-061\t2026-06-09\tIBF-0002\tSES-IBF-0002-20260609-S3\tEX-WALL-SIT-ISOM-TRICO\tWall sit (isom\u00e9trico)\tSentadilla\tPRESENCIAL\t3\t1 / 1 / 1\t\t60\tseg/legacy\t8\t\t\t\tBloque: INTEGRACI\u00d3N | ICI: 9 | Notas: CARGA CONTROLADA | Uso: Bilateral | Regresi\u00f3n: Parcial | Restricci\u00f3n: Dolor rodilla | Estado: REALIZADA | Prioridad: 2 | Complejidad: 1 | Musculatura: Cu\u00e1driceps | Complementaria: Gl\u00fateo medio\t\tMIGRACION_EXCEL\nHIST-IBF-0002-20260609-S3-062\t2026-06-09\tIBF-0002\tSES-IBF-0002-20260609-S3\tEX-SENTADILLA-EN-MULTIPOWER\tSentadilla en multipower\tSentadilla\tPRESENCIAL\t1\t1\t\t0\tLEGACY\t1\t\t\t\tBloque: BLOQUE A | ICI: 10 | Notas: CARGA CONTROLADA | Uso: Bilateral | Regresi\u00f3n: Goblet | Restricci\u00f3n: Ninguna | Estado: REALIZADA | Prioridad: 3 | Complejidad: 1 | Musculatura: Cu\u00e1driceps | Complementaria: Gl\u00fateo mayor\tAlerta Patr\u00f3n: MISMO PATR\u00d3N\tMIGRACION_EXCEL\nHIST-IBF-0002-20260609-S3-063\t2026-06-09\tIBF-0002\tSES-IBF-0002-20260609-S3\tEX-PRESS-INCLINADO-CON-MANCUERNAS\tPress inclinado con mancuernas\tEmpuje horizontal\tPRESENCIAL\t3\t12 / 12 / 12\t\t15\tkg/legacy\t8\t\t\t\tBloque: BLOQUE A | ICI: 8 | Notas: CARGA CONTROLADA | Uso: Bilateral | Regresi\u00f3n: Flexi\u00f3n | Restricci\u00f3n: Hombro | Estado: REALIZADA | Prioridad: 3 | Complejidad: 2 | Musculatura: Pectoral mayor (superior) | Complementaria: Tr\u00edceps, Deltoides anterior\t\tMIGRACION_EXCEL\nHIST-IBF-0002-20260609-S3-064\t2026-06-09\tIBF-0002\tSES-IBF-0002-20260609-S3\tEX-PESO-MUERTO-RUMANO-A-UNA-PIERNA\tPeso muerto rumano a una pierna\tBisagra\tPRESENCIAL\t3\t12 / 12 / 12\t\t15\tkg/legacy\t9\t\t\t\tBloque: BLOQUE A | ICI: 5 | Notas: CARGA CONTROLADA | Obs: SUG: Primer registro: sin historial previo para sugerir carga. | Uso: Unilateral | Regresi\u00f3n: Bilateral | Restricci\u00f3n: Equilibrio | Estado: REALIZADA | Prioridad: 3 | Complejidad: 3 | Musculatura: Isquiosurales | Complementaria: Gl\u00fateo medio, Core\tAlerta RPE: RPE\tMIGRACION_EXCEL\nHIST-IBF-0002-20260609-S3-065\t2026-06-09\tIBF-0002\tSES-IBF-0002-20260609-S3\tEX-ELEVACIONES-LATERALES-CON-MANCUERNA\tElevaciones laterales con mancuerna\tEmpuje V.\tPRESENCIAL\t1\t1\t\t0\tLEGACY\t1\t\t\t\tBloque: BLOQUE B | ICI: 8 | Notas: CARGA CONTROLADA | Uso: Bilateral | Regresi\u00f3n: Ninguna | Restricci\u00f3n: Hombro | Estado: REALIZADA | Prioridad: 2 | Complejidad: 2 | Musculatura: Deltoides posterior | Complementaria: Trapecio / Romboides\t\tMIGRACION_EXCEL\nHIST-IBF-0002-20260609-S3-066\t2026-06-09\tIBF-0002\tSES-IBF-0002-20260609-S3\tEX-PRESS-MILITAR-CON-MANCUERNAS\tPress militar con mancuernas\tEmpuje vertical\tPRESENCIAL\t1\t1\t\t0\tLEGACY\t1\t\t\t\tBloque: BLOQUE B | ICI: 10 | Notas: CARGA CONTROLADA | Obs: SUG: Carga sugerida 7.5 kg. MANTENER carga por decisi\u00f3n global. Estado operativo: APTO. \u00daltima carga: 7.5 | \u00daltimo RPE: 8 | \u00daltimo ICI: 7 | Fatiga actual: 6 | Uso: Bilateral | Regresi\u00f3n: Press inclinado | Restricci\u00f3n: Hombro | Estado: REALIZADA | Prioridad: 3 | Complejidad: 3 | Musculatura: Deltoides anterior | Complementaria: Tr\u00edceps, Serrato anterior\tAlerta Progresi\u00f3n: \u2193\tMIGRACION_EXCEL\nHIST-IBF-0003-20260603-S1-067\t2026-06-03\tIBF-0003\tSES-IBF-0003-20260603-S1\tEX-SENTADILLA-GOBLET\tSentadilla Goblet\tSentadilla\tPRESENCIAL\t2\t12 / 12\t\t0\tLEGACY\t2\t\t\t\tBloque: ACTIVACI\u00d3N | ICI: 8 | Obs: Bilateral | Regresi\u00f3n: Sentadilla a caj\u00f3n | Restricci\u00f3n: Movilidad media | Uso: Bilateral | Regresi\u00f3n: Sentadilla a caj\u00f3n | Restricci\u00f3n: Movilidad media | Estado: REALIZADA | Prioridad: 3 | Complejidad: 1 | Musculatura: Cu\u00e1driceps | Complementaria: Gl\u00fateo mayor, Core\t\tMIGRACION_EXCEL\nHIST-IBF-0003-20260603-S1-068\t2026-06-03\tIBF-0003\tSES-IBF-0003-20260603-S1\tEX-DEADBUG\tDeadbug\tCore\tPRESENCIAL\t3\t12 / 12 / 12\t\t0\tLEGACY\t6\t\t\t\tBloque: INTEGRACI\u00d3N | ICI: 7 | Obs: Bilateral | Regresi\u00f3n: Isom\u00e9trico | Restricci\u00f3n: Control | Uso: Bilateral | Regresi\u00f3n: Isom\u00e9trico | Restricci\u00f3n: Control | Estado: REALIZADA | Prioridad: 2 | Complejidad: 1 | Musculatura: Recto abdominal | Complementaria: Transverso\t\tMIGRACION_EXCEL\nHIST-IBF-0003-20260603-S1-069\t2026-06-03\tIBF-0003\tSES-IBF-0003-20260603-S1\tEX-PLANCHA-FRONTAL\tPlancha frontal\tCore\tPRESENCIAL\t3\t1 / 1 / 1\t\t30\tseg/legacy\t7\t\t\t\tBloque: INTEGRACI\u00d3N | ICI: 7 | Obs: Bilateral | Regresi\u00f3n: Rodillas | Restricci\u00f3n: Ninguna | Uso: Bilateral | Regresi\u00f3n: Rodillas | Restricci\u00f3n: Ninguna | Estado: REALIZADA | Prioridad: 2 | Complejidad: 1 | Musculatura: Recto abdominal | Complementaria: Transverso, Serrato anterior\tAlerta Patr\u00f3n: MISMO PATR\u00d3N\tMIGRACION_EXCEL\nHIST-IBF-0003-20260603-S1-070\t2026-06-03\tIBF-0003\tSES-IBF-0003-20260603-S1\tEX-WALL-SIT-ISOM-TRICO\tWall sit (isom\u00e9trico)\tSentadilla\tPRESENCIAL\t3\t1 / 1 / 1\t\t45\tseg/legacy\t7\t\t\t\tBloque: BLOQUE A | ICI: 8 | Obs: Bilateral | Regresi\u00f3n: Parcial | Restricci\u00f3n: Dolor rodilla | Uso: Bilateral | Regresi\u00f3n: Parcial | Restricci\u00f3n: Dolor rodilla | Estado: REALIZADA | Prioridad: 2 | Complejidad: 1 | Musculatura: Cu\u00e1driceps | Complementaria: Gl\u00fateo medio\t\tMIGRACION_EXCEL\nHIST-IBF-0003-20260603-S1-071\t2026-06-03\tIBF-0003\tSES-IBF-0003-20260603-S1\tEX-PESO-MUERTO-RUMANO-A-UNA-PIERNA\tPeso muerto rumano a una pierna\tBisagra\tPRESENCIAL\t3\t15 / 15 / 15\t\t0\tLEGACY\t6\t\t\t\tBloque: BLOQUE A | ICI: 4 | Obs: Unilateral | Regresi\u00f3n: Bilateral | Restricci\u00f3n: Equilibrio | Uso: Unilateral | Regresi\u00f3n: Bilateral | Restricci\u00f3n: Equilibrio | Estado: REALIZADA | Prioridad: 3 | Complejidad: 3 | Musculatura: Isquiosurales | Complementaria: Gl\u00fateo medio, Core\t\tMIGRACION_EXCEL\nHIST-IBF-0003-20260603-S1-072\t2026-06-03\tIBF-0003\tSES-IBF-0003-20260603-S1\tEX-REMO-EN-TRX\tRemo en TRX\tTracci\u00f3n horizontal\tPRESENCIAL\t3\t12 / 12 / 12\t\t0\tLEGACY\t7\t\t\t\tBloque: BLOQUE B | ICI: 7 | Obs: Bilateral | Regresi\u00f3n: Banda | Restricci\u00f3n: Control | Uso: Bilateral | Regresi\u00f3n: Banda | Restricci\u00f3n: Control | Estado: REALIZADA | Prioridad: 3 | Complejidad: 2 | Musculatura: Dorsal ancho | Complementaria: B\u00edceps, Core\t\tMIGRACION_EXCEL\nHIST-IBF-0003-20260603-S1-073\t2026-06-03\tIBF-0003\tSES-IBF-0003-20260603-S1\tEX-FLEXI-N-INCLINADA\tFlexi\u00f3n inclinada\tEmpuje horizontal\tPRESENCIAL\t3\t15 / 15 / 15\t\t0\tLEGACY\t8\t\t\t\tBloque: BLOQUE B | ICI: 6 | Obs: Bilateral | Regresi\u00f3n: Flexi\u00f3n pared | Restricci\u00f3n: Carga | Uso: Bilateral | Regresi\u00f3n: Flexi\u00f3n pared | Restricci\u00f3n: Carga | Estado: REALIZADA | Prioridad: 2 | Complejidad: 1 | Musculatura: Pectoral mayor | Complementaria: Tr\u00edceps, Deltoides anterior\t\tMIGRACION_EXCEL\nHIST-IBF-0003-20260603-S1-074\t2026-06-03\tIBF-0003\tSES-IBF-0003-20260603-S1\tEX-CIRCUITO-INTERVALADO\tCircuito intervalado\tMetab\u00f3lico\tPRESENCIAL\t1\t5\t\t30\tkg/legacy\t9\t\t\t\tBloque: CONDICIONAMIENTO | ICI: 7 | Obs: Bilateral | Regresi\u00f3n: Reducir intensidad | Restricci\u00f3n: Fatiga | Uso: Bilateral | Regresi\u00f3n: Reducir intensidad | Restricci\u00f3n: Fatiga | Estado: REALIZADA | Prioridad: 2 | Complejidad: 2 | Musculatura: Full Body | Complementaria: Sistema cardiovascular\tAlerta RPE: RPE\tMIGRACION_EXCEL\nHIST-IBF-0003-20260610-S2-075\t2026-06-10\tIBF-0003\tSES-IBF-0003-20260610-S2\tEX-SENTADILLA-GOBLET\tSentadilla Goblet\tSentadilla\tPRESENCIAL\t2\t12 / 12\t\t0\tLEGACY\t4\t\t\t\tBloque: ACTIVACI\u00d3N | ICI: 8 | Notas: AUMENTAR RESISTENCIA | Obs: SUG: Carga sugerida 0 kg. Ajuste conservador. Factores: ICI muy bajo, RPE bajo, tipo MULTI_INFERIOR, salto 1, estado APTO, decisi\u00f3n global PROGRESAR. \u00daltima carga: 0 | \u00daltimo RPE: 2 | \u00daltimo ICI: 8 | Fatiga actual: 5 | Uso: Bilateral | Regresi\u00f3n: Sentadilla a caj\u00f3n | Restricci\u00f3n: Movilidad media | Estado: REALIZADA | Prioridad: 3 | Complejidad: 1 | Musculatura: Cu\u00e1driceps | Complementaria: Gl\u00fateo mayor, Core\tAlerta Progresi\u00f3n: \u2193\tMIGRACION_EXCEL\nHIST-IBF-0003-20260610-S2-076\t2026-06-10\tIBF-0003\tSES-IBF-0003-20260610-S2\tEX-DEADBUG\tDeadbug\tCore\tPRESENCIAL\t3\t12 / 12 / 12\t\t0\tLEGACY\t7\t\t\t\tBloque: INTEGRACI\u00d3N | ICI: 7 | Notas: AUMENTAR RESISTENCIA | Obs: SUG: Carga sugerida 0 kg. Ajuste conservador. Factores: ICI muy bajo, RPE bajo, tipo GENERAL, salto 0.5, estado APTO, decisi\u00f3n global PROGRESAR. \u00daltima carga: 0 | \u00daltimo RPE: 6 | \u00daltimo ICI: 7 | Fatiga actual: 5 | Uso: Bilateral | Regresi\u00f3n: Isom\u00e9trico | Restricci\u00f3n: Control | Estado: REALIZADA | Prioridad: 2 | Complejidad: 1 | Musculatura: Recto abdominal | Complementaria: Transverso\tAlerta Progresi\u00f3n: \u2193\tMIGRACION_EXCEL\nHIST-IBF-0003-20260610-S2-077\t2026-06-10\tIBF-0003\tSES-IBF-0003-20260610-S2\tEX-PLANCHA-FRONTAL\tPlancha frontal\tCore\tPRESENCIAL\t3\t1 / 1 / 1\t\t30\tseg/legacy\t8\t\t\t\tBloque: INTEGRACI\u00d3N | ICI: 9 | Notas: AUMENTAR RESISTENCIA | Obs: SUG: Carga sugerida 30 kg. Ajuste conservador. Factores: ICI muy bajo, RPE controlado, tipo CORE_ESTABILIDAD, salto 0.5, estado APTO, decisi\u00f3n global PROGRESAR. \u00daltima carga: 30 | \u00daltimo RPE: 7 | \u00daltimo ICI: 7 | Fatiga actual: 5 | Uso: Bilateral | Regresi\u00f3n: Rodillas | Restricci\u00f3n: Ninguna | Estado: REALIZADA | Prioridad: 2 | Complejidad: 1 | Musculatura: Recto abdominal | Complementaria: Transverso, Serrato anterior\tAlerta Patr\u00f3n: MISMO PATR\u00d3N | Alerta Progresi\u00f3n: \u2193\tMIGRACION_EXCEL\nHIST-IBF-0003-20260610-S2-078\t2026-06-10\tIBF-0003\tSES-IBF-0003-20260610-S2\tEX-WALL-SIT-ISOM-TRICO\tWall sit (isom\u00e9trico)\tSentadilla\tPRESENCIAL\t3\t1 / 1 / 1\t\t50\tseg/legacy\t6\t\t\t\tBloque: BLOQUE A | ICI: 8 | Notas: AUMENTAR RESISTENCIA | Obs: SUG: Carga sugerida 45 kg. Ajuste conservador. Factores: ICI muy bajo, RPE controlado, tipo GENERAL, salto 2.5, estado APTO, decisi\u00f3n global PROGRESAR. \u00daltima carga: 45 | \u00daltimo RPE: 7 | \u00daltimo ICI: 8 | Fatiga actual: 5 | Uso: Bilateral | Regresi\u00f3n: Parcial | Restricci\u00f3n: Dolor rodilla | Estado: REALIZADA | Prioridad: 2 | Complejidad: 1 | Musculatura: Cu\u00e1driceps | Complementaria: Gl\u00fateo medio\t\tMIGRACION_EXCEL\nHIST-IBF-0003-20260610-S2-079\t2026-06-10\tIBF-0003\tSES-IBF-0003-20260610-S2\tEX-PESO-MUERTO-RUMANO-A-UNA-PIERNA\tPeso muerto rumano a una pierna\tBisagra\tPRESENCIAL\t3\t12 / 12 / 12\t\t5\tkg/legacy\t5\t\t\t\tBloque: BLOQUE A | ICI: 4 | Notas: AUMENTAR RESISTENCIA | Uso: Unilateral | Regresi\u00f3n: Bilateral | Restricci\u00f3n: Equilibrio | Estado: REALIZADA | Prioridad: 3 | Complejidad: 3 | Musculatura: Isquiosurales | Complementaria: Gl\u00fateo medio, Core\t\tMIGRACION_EXCEL\nHIST-IBF-0003-20260610-S2-080\t2026-06-10\tIBF-0003\tSES-IBF-0003-20260610-S2\tEX-REMO-EN-TRX\tRemo en TRX\tTracci\u00f3n horizontal\tPRESENCIAL\t3\t7 / 7 / 7\t\t0\tLEGACY\t8\t\t\t\tBloque: BLOQUE B | ICI: 7 | Notas: AUMENTAR RESISTENCIA | Obs: SUG: Carga sugerida 0 kg. Ajuste conservador. Factores: ICI muy bajo, RPE controlado, tipo MULTI_SUPERIOR, salto 0.5, estado APTO, decisi\u00f3n global PROGRESAR. \u00daltima carga: 0 | \u00daltimo RPE: 7 | \u00daltimo ICI: 7 | Fatiga actual: 5 | Uso: Bilateral | Regresi\u00f3n: Banda | Restricci\u00f3n: Control | Estado: REALIZADA | Prioridad: 3 | Complejidad: 2 | Musculatura: Dorsal ancho | Complementaria: B\u00edceps, Core\tAlerta Progresi\u00f3n: \u2193\tMIGRACION_EXCEL\nHIST-IBF-0003-20260610-S2-081\t2026-06-10\tIBF-0003\tSES-IBF-0003-20260610-S2\tEX-FLEXI-N-INCLINADA\tFlexi\u00f3n inclinada\tEmpuje horizontal\tPRESENCIAL\t3\t8 / 8 / 8\t\t0\tLEGACY\t9\t\t\t\tBloque: BLOQUE B | ICI: 6 | Notas: AUMENTAR RESISTENCIA | Obs: SUG: Carga sugerida 0 kg. Reducir ligeramente la carga. Factores: ICI muy bajo, RPE exigente, tipo GENERAL, salto 0.5, estado APTO, decisi\u00f3n global PROGRESAR. \u00daltima carga: 0 | \u00daltimo RPE: 8 | \u00daltimo ICI: 6 | Fatiga actual: 5 | Uso: Bilateral | Regresi\u00f3n: Flexi\u00f3n pared | Restricci\u00f3n: Carga | Estado: REALIZADA | Prioridad: 2 | Complejidad: 1 | Musculatura: Pectoral mayor | Complementaria: Tr\u00edceps, Deltoides anterior\tAlerta Progresi\u00f3n: \u2193 | Alerta RPE: RPE\tMIGRACION_EXCEL\nHIST-IBF-0003-20260610-S2-082\t2026-06-10\tIBF-0003\tSES-IBF-0003-20260610-S2\tEX-CIRCUITO-INTERVALADO\tCircuito intervalado\tMetab\u00f3lico\tPRESENCIAL\t2\t2 / 2\t\t25\tkg/legacy\t9\t\t\t\tBloque: CONDICIONAMIENTO | ICI: 7 | Notas: AUMENTAR RESISTENCIA | Obs: SUG: Carga sugerida 25 kg. Reducir claramente la carga. Factores: ICI muy bajo, RPE alto, tipo GENERAL, salto 2.5, estado APTO, decisi\u00f3n global PROGRESAR. \u00daltima carga: 30 | \u00daltimo RPE: 9 | \u00daltimo ICI: 7 | Fatiga actual: 5 | Uso: Bilateral | Regresi\u00f3n: Reducir intensidad | Restricci\u00f3n: Fatiga | Estado: REALIZADA | Prioridad: 2 | Complejidad: 2 | Musculatura: Full Body | Complementaria: Sistema cardiovascular\tAlerta Progresi\u00f3n: \u2193 | Alerta RPE: RPE\tMIGRACION_EXCEL";
const IBERFIT_MIG_LIB_TSV_ = "EJERCICIO_ID\tNOMBRE_EJERCICIO\tPATRON\tZONA\tMATERIAL\tNIVEL\tOBJETIVO\tINDICACIONES_TECNICAS\tERRORES_COMUNES\tREGRESION\tPROGRESION\tESTADO\tACTUALIZADO_EN\nEX-SENTARSE-Y-LEVANTARSE-DE-SILLA\tSentarse y levantarse de silla\tSentadilla\tSentadilla\tTodos\tReconstrucci\u00f3n\tSalud/base\tAltura controlada; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Movilidad limitada\tSentadilla asistida\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SENTADILLA-A-CAJ-N\tSentadilla a caj\u00f3n\tSentadilla\tSentadilla\tTodos\tReconstrucci\u00f3n\tSalud/base\tCaja a altura rodilla; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Control limitado\tSentarse y levantarse\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SENTADILLA-GOBLET\tSentadilla Goblet\tSentadilla\tSentadilla\tTodos\tPerformance\tTodos\tMancuerna frontal; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Movilidad media\tSentadilla a caj\u00f3n\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SENTADILLA-GOBLET-PROFUNDA\tSentadilla Goblet profunda\tSentadilla\tSentadilla\tTodos\tPerformance\tP\u00e9rdida de grasa\tRango completo; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Movilidad cadera\tSentadilla parcial\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-PALLOF-CON-BANDA\tPress Pallof con banda\tCore\tCore\tGimnasio, Domicilio, Parque\tPerformance\tRendimiento\tExcelente para control central; Uso: Estabilidad; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Dificultad antirotatoria\tPlancha frontal\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SENTADILLA-B-LGARA\tSentadilla b\u00falgara\tSentadilla\tSentadilla\tTodos\tPerformance\tP\u00e9rdida de grasa\tPie trasero elevado; Uso: Unilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Equilibrio\tSplit asistido\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SPLIT-SQUAT-EST-TICO\tSplit squat est\u00e1tico\tSentadilla\tSentadilla\tTodos\tReconstrucci\u00f3n/Performance\tSalud/base\tBase unilateral; Uso: Unilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Control bajo\tSentadilla asistida\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SENTADILLA-CON-TRX\tSentadilla con TRX\tSentadilla\tSentadilla\tDomicilio\tReconstrucci\u00f3n\tSalud/base\tTRX corto; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Equilibrio\tSentadilla a caj\u00f3n\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SENTADILLA-SUMO-CON-MANCUERNA\tSentadilla sumo con mancuerna\tSentadilla\tSentadilla\tTodos\tPerformance\tEst\u00e9tica\tAductores activos; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Movilidad cadera\tGoblet\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SENTADILLA-PAUSADA\tSentadilla pausada\tSentadilla\tSentadilla\tTodos\tPerformance\tRendimiento\tPausa abajo; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Control bajo\tGoblet\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SENTADILLA-FRONTAL-CON-BARRA\tSentadilla frontal con barra\tSentadilla\tSentadilla\tGimnasio\tOptimizaci\u00f3n\tRendimiento\tBarra frontal; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Movilidad mu\u00f1eca\tGoblet\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SENTADILLA-TRASERA-CON-BARRA\tSentadilla trasera con barra\tSentadilla\tSentadilla\tGimnasio\tOptimizaci\u00f3n\tRendimiento\tBase fuerza; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: T\u00e9cnica\tGoblet\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SENTADILLA-OVERHEAD\tSentadilla overhead\tSentadilla\tSentadilla\tGimnasio\tOptimizaci\u00f3n\tRendimiento\tMuy t\u00e9cnica; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Movilidad hombro\tFrontal\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SENTADILLA-CON-SALTO\tSentadilla con salto\tSentadilla\tSentadilla\tTodos\tOptimizaci\u00f3n\tRendimiento\tPotencia; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Impacto\tSentadilla r\u00e1pida\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-WALL-SIT-ISOM-TRICO\tWall sit (isom\u00e9trico)\tSentadilla\tSentadilla\tTodos\tReconstrucci\u00f3n\tSalud/base\tIsom\u00e9trico; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Dolor rodilla\tParcial\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SENTADILLA-EN-MULTIPOWER\tSentadilla en multipower\tSentadilla\tSentadilla\tGimnasio\tPerformance\tEst\u00e9tica\tGuiado; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Ninguna\tGoblet\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SENTADILLA-EN-M-QUINA-HACK\tSentadilla en m\u00e1quina hack\tSentadilla\tSentadilla\tGimnasio\tPerformance\tEst\u00e9tica\tControlado; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Disponibilidad\tGoblet\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SENTADILLA-UNILATERAL-ASISTIDA\tSentadilla unilateral asistida\tSentadilla\tSentadilla\tTodos\tReconstrucci\u00f3n\tSalud/base\tSoporte externo; Uso: Unilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Equilibrio\tSplit\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SENTADILLA-CON-BANDA-EL-STICA\tSentadilla con banda el\u00e1stica\tSentadilla\tSentadilla\tTodos\tReconstrucci\u00f3n/Performance\tSalud/base\tBanda rodillas; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Control\tGoblet\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SENTADILLA-TEMPO-LENTO\tSentadilla tempo lento\tSentadilla\tSentadilla\tTodos\tPerformance\tRendimiento\tControl exc\u00e9ntrico; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Control bajo\tGoblet\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SENTADILLA-CON-KETTLEBELL\tSentadilla con kettlebell\tSentadilla\tSentadilla\tTodos\tPerformance\tTodos\tBase funcional; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Ninguna\tGoblet\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PUENTE-DE-GL-TEO\tPuente de gl\u00fateo\tBisagra\tBisagra\tTodos\tReconstrucci\u00f3n\tSalud/base\tSuelo; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Control lumbar\tHip hinge\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PUENTE-DE-GL-TEO-UNILATERAL\tPuente de gl\u00fateo unilateral\tBisagra\tBisagra\tTodos\tPerformance\tEst\u00e9tica\tBase unilateral; Uso: Unilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Equilibrio\tBilateral\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-HIP-THRUST-CON-BARRA\tHip thrust con barra\tBisagra\tBisagra\tGimnasio\tPerformance/Optimizaci\u00f3n\tEst\u00e9tica\tBanco; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Control lumbar\tPuente\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-HIP-THRUST-UNILATERAL\tHip thrust unilateral\tBisagra\tBisagra\tTodos\tPerformance\tEst\u00e9tica\tMuy t\u00e9cnico; Uso: Unilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Equilibrio\tBilateral\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PESO-MUERTO-RUMANO-CON-MANCUERNAS\tPeso muerto rumano con mancuernas\tBisagra\tBisagra\tTodos\tPerformance\tRendimiento\tBase; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: T\u00e9cnica\tPuente\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PESO-MUERTO-RUMANO-A-UNA-PIERNA\tPeso muerto rumano a una pierna\tBisagra\tBisagra\tTodos\tPerformance\tRendimiento\tControl; Uso: Unilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Equilibrio\tBilateral\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PESO-MUERTO-CON-BARRA\tPeso muerto con barra\tBisagra\tBisagra\tGimnasio\tOptimizaci\u00f3n\tRendimiento\tBase fuerza; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: T\u00e9cnica\tMancuernas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PESO-MUERTO-CON-TRAP-BAR\tPeso muerto con trap bar\tBisagra\tBisagra\tGimnasio\tPerformance/Optimizaci\u00f3n\tRendimiento\tM\u00e1s seguro; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Disponibilidad\tMancuernas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-KETTLEBELL-SWING\tKettlebell swing\tBisagra\tBisagra\tTodos\tOptimizaci\u00f3n\tRendimiento\tPotencia; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 1\tRevisar restricci\u00f3n: T\u00e9cnica\tPuente\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-HIP-HINGE-CON-PALO\tHip hinge con palo\tBisagra\tBisagra\tTodos\tReconstrucci\u00f3n\tSalud/base\tAprendizaje; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tPuente\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-BUENOS-D-AS-CON-BANDA\tBuenos d\u00edas con banda\tBisagra\tBisagra\tTodos\tReconstrucci\u00f3n/Performance\tSalud/base\tT\u00e9cnico; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Control lumbar\tPuente\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PULL-THROUGH-CON-POLEA\tPull through con polea\tBisagra\tBisagra\tGimnasio\tPerformance\tEst\u00e9tica\tGl\u00fateo; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: T\u00e9cnica\tPuente\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-EXTENSI-N-LUMBAR-EN-BANCO\tExtensi\u00f3n lumbar en banco\tBisagra\tBisagra\tGimnasio\tPerformance\tEst\u00e9tica\tAislamiento; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Dolor lumbar\tPuente\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PESO-MUERTO-SUMO\tPeso muerto sumo\tBisagra\tBisagra\tGimnasio\tPerformance/Optimizaci\u00f3n\tRendimiento\tAductores; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: T\u00e9cnica\tRumano\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-HIP-THRUST-EN-M-QUINA\tHip thrust en m\u00e1quina\tBisagra\tBisagra\tGimnasio\tPerformance\tEst\u00e9tica\tGuiado; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tPuente\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PESO-MUERTO-CON-KETTLEBELL\tPeso muerto con kettlebell\tBisagra\tBisagra\tTodos\tPerformance\tTodos\tBase; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Ninguna\tRumano\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PESO-MUERTO-PARCIAL\tPeso muerto parcial\tBisagra\tBisagra\tTodos\tReconstrucci\u00f3n/Performance\tSalud/base\tRango corto; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Movilidad\tPuente\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-BISAGRA-CON-BANDA\tBisagra con banda\tBisagra\tBisagra\tTodos\tReconstrucci\u00f3n\tSalud/base\tBase; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tPuente\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-HIP-THRUST-CON-PAUSA\tHip thrust con pausa\tBisagra\tBisagra\tTodos\tPerformance\tEst\u00e9tica\tTiempo bajo tensi\u00f3n; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tPuente\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PESO-MUERTO-EXC-NTRICO\tPeso muerto exc\u00e9ntrico\tBisagra\tBisagra\tTodos\tPerformance\tRendimiento\tControl; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: T\u00e9cnica\tRumano\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-FLEXI-N-EN-PARED\tFlexi\u00f3n en pared\tEmpuje horizontal\tEmpuje horizontal\tTodos\tReconstrucci\u00f3n\tSalud/base\tBase; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Control hombro\tIsom\u00e9trico\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-FLEXI-N-INCLINADA\tFlexi\u00f3n inclinada\tEmpuje horizontal\tEmpuje horizontal\tTodos\tReconstrucci\u00f3n/Performance\tSalud/base\tProgresi\u00f3n; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Carga\tFlexi\u00f3n pared\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-FLEXI-N-EN-SUELO\tFlexi\u00f3n en suelo\tEmpuje horizontal\tEmpuje horizontal\tTodos\tPerformance\tTodos\tBase; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Carga\tInclinada\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-FLEXI-N-DECLINADA\tFlexi\u00f3n declinada\tEmpuje horizontal\tEmpuje horizontal\tTodos\tPerformance/Optimizaci\u00f3n\tRendimiento\tM\u00e1s intensidad; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Carga\tSuelo\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-FLEXI-N-CON-PAUSA\tFlexi\u00f3n con pausa\tEmpuje horizontal\tEmpuje horizontal\tTodos\tPerformance\tRendimiento\tT\u00e9cnico; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tInclinada\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-CON-MANCUERNAS-PLANO\tPress con mancuernas plano\tEmpuje horizontal\tEmpuje horizontal\tGimnasio\tPerformance\tEst\u00e9tica\tBase; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tFlexi\u00f3n\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-CON-BARRA-PLANO\tPress con barra plano\tEmpuje horizontal\tEmpuje horizontal\tGimnasio\tOptimizaci\u00f3n\tRendimiento\tBase fuerza; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: T\u00e9cnica\tMancuernas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-INCLINADO-CON-MANCUERNAS\tPress inclinado con mancuernas\tEmpuje horizontal\tEmpuje horizontal\tGimnasio\tPerformance\tEst\u00e9tica\tSeguro; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Hombro\tFlexi\u00f3n\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-INCLINADO-CON-BARRA\tPress inclinado con barra\tEmpuje horizontal\tEmpuje horizontal\tGimnasio\tOptimizaci\u00f3n\tRendimiento\tAvanzado; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: T\u00e9cnica\tMancuernas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-EN-M-QUINA\tPress en m\u00e1quina\tEmpuje horizontal\tEmpuje horizontal\tGimnasio\tPerformance\tEst\u00e9tica\tGuiado; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tMancuernas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-FLEXI-N-CON-BANDA\tFlexi\u00f3n con banda\tEmpuje horizontal\tEmpuje horizontal\tTodos\tPerformance\tRendimiento\tResistencia; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Carga\tSuelo\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-UNILATERAL-MANCUERNA\tPress unilateral mancuerna\tEmpuje horizontal\tEmpuje horizontal\tTodos\tPerformance\tEst\u00e9tica\tControl; Uso: Unilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Estabilidad\tBilateral\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-FLEXI-N-EN-ANILLAS\tFlexi\u00f3n en anillas\tEmpuje horizontal\tEmpuje horizontal\tTodos\tOptimizaci\u00f3n\tRendimiento\tMuy exigente; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Estabilidad\tSuelo\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-FLEXI-N-CON-MANOS-ESTRECHAS\tFlexi\u00f3n con manos estrechas\tEmpuje horizontal\tEmpuje horizontal\tTodos\tPerformance\tRendimiento\tTr\u00edceps; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Carga\tInclinada\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-FLEXI-N-EXPLOSIVA\tFlexi\u00f3n explosiva\tEmpuje horizontal\tEmpuje horizontal\tTodos\tOptimizaci\u00f3n\tRendimiento\tPotencia; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Impacto\tSuelo\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-CON-BANDA-EL-STICA\tPress con banda el\u00e1stica\tEmpuje horizontal\tEmpuje horizontal\tTodos\tReconstrucci\u00f3n/Performance\tSalud/base\tSimple; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Control\tFlexi\u00f3n\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-SUELO-CON-MANCUERNAS\tPress suelo con mancuernas\tEmpuje horizontal\tEmpuje horizontal\tTodos\tPerformance\tTodos\tBase; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tFlexi\u00f3n\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-CON-KETTLEBELL\tPress con kettlebell\tEmpuje horizontal\tEmpuje horizontal\tTodos\tPerformance\tTodos\tFuncional; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tMancuernas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-FLEXI-N-CON-TEMPO-LENTO\tFlexi\u00f3n con tempo lento\tEmpuje horizontal\tEmpuje horizontal\tTodos\tPerformance\tRendimiento\tT\u00e9cnico; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tInclinada\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-M-QUINA-CONVERGENTE\tPress m\u00e1quina convergente\tEmpuje horizontal\tEmpuje horizontal\tGimnasio\tPerformance\tEst\u00e9tica\tAislamiento; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tMancuernas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-MILITAR-CON-MANCUERNAS\tPress militar con mancuernas\tEmpuje vertical\tEmpuje vertical\tTodos\tPerformance\tRendimiento\tBase hombro; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 3; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Hombro\tPress inclinado\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-MILITAR-CON-BARRA\tPress militar con barra\tEmpuje vertical\tEmpuje vertical\tGimnasio\tOptimizaci\u00f3n\tRendimiento\tBase fuerza; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: T\u00e9cnica\tMancuernas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-ARNOLD\tPress Arnold\tEmpuje vertical\tEmpuje vertical\tGimnasio\tPerformance\tEst\u00e9tica\tCompleto; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Hombro\tPress simple\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PUSH-PRESS\tPush press\tEmpuje vertical\tEmpuje vertical\tGimnasio\tOptimizaci\u00f3n\tRendimiento\tPotencia; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 2\tRevisar restricci\u00f3n: T\u00e9cnica\tPress militar\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-EN-M-QUINA-VERTICAL\tPress en m\u00e1quina vertical\tEmpuje vertical\tEmpuje vertical\tGimnasio\tPerformance\tEst\u00e9tica\tGuiado; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tMancuernas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-HANDSTAND-PUSH-UP\tHandstand push-up\tEmpuje vertical\tEmpuje vertical\tTodos\tOptimizaci\u00f3n\tRendimiento\tAvanzado; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tPress militar\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-SENTADO-CON-MANCUERNAS\tPress sentado con mancuernas\tEmpuje vertical\tEmpuje vertical\tGimnasio\tPerformance\tRendimiento\tControl; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Espalda\tPress de pie\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-CON-PAUSA-ARRIBA\tPress con pausa arriba\tEmpuje vertical\tEmpuje vertical\tTodos\tPerformance\tRendimiento\tT\u00e9cnico; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tPress normal\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-CON-TEMPO-LENTO\tPress con tempo lento\tEmpuje vertical\tEmpuje vertical\tTodos\tPerformance\tRendimiento\tT\u00e9cnico; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tPress normal\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-CON-BANDA-DESDE-ABAJO\tPress con banda desde abajo\tEmpuje vertical\tEmpuje vertical\tTodos\tPerformance\tRendimiento\tVariable; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Tensi\u00f3n\tMancuernas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-LANDMINE\tPress landmine\tEmpuje vertical\tEmpuje vertical\tGimnasio\tPerformance\tRendimiento\tSeguro; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Movilidad hombro\tMancuernas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-EN-MULTIPOWER\tPress en multipower\tEmpuje vertical\tEmpuje vertical\tGimnasio\tPerformance\tEst\u00e9tica\tGuiado; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tMancuernas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-REMO-CON-BANDA\tRemo con banda\tTracci\u00f3n horizontal\tTracci\u00f3n horizontal\tTodos\tReconstrucci\u00f3n/Performance\tSalud/base\tBase; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tBanda ligera\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-REMO-CON-MANCUERNA\tRemo con mancuerna\tTracci\u00f3n horizontal\tTracci\u00f3n horizontal\tTodos\tPerformance\tTodos\tMuy \u00fatil; Uso: Unilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Estabilidad\tBanda\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-REMO-CON-BARRA\tRemo con barra\tTracci\u00f3n horizontal\tTracci\u00f3n horizontal\tGimnasio\tOptimizaci\u00f3n\tRendimiento\tExigente; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: T\u00e9cnica\tMancuerna\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-REMO-EN-POLEA-BAJA\tRemo en polea baja\tTracci\u00f3n horizontal\tTracci\u00f3n horizontal\tGimnasio\tPerformance\tEst\u00e9tica\tF\u00e1cil control; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tBanda\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-REMO-INVERTIDO\tRemo invertido\tTracci\u00f3n horizontal\tTracci\u00f3n horizontal\tTodos\tPerformance\tRendimiento\tFuncional; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Fuerza\tBanda\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-REMO-EN-TRX\tRemo en TRX\tTracci\u00f3n horizontal\tTracci\u00f3n horizontal\tDomicilio\tPerformance\tTodos\tMuy \u00fatil; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tBanda\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-FACEPULL-CON-BANDA\tFacepull con banda\tTracci\u00f3n horizontal\tTracci\u00f3n horizontal\tTodos\tReconstrucci\u00f3n/Performance\tSalud/base\tEstabilidad; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Hombro\tBanda ligera\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-FACEPULL-POLEA\tFacepull polea\tTracci\u00f3n horizontal\tTracci\u00f3n horizontal\tGimnasio\tPerformance\tRendimiento\tClaves hombro; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 1\tRevisar restricci\u00f3n: T\u00e9cnica\tBanda\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-REMO-UNILATERAL-POLEA\tRemo unilateral polea\tTracci\u00f3n horizontal\tTracci\u00f3n horizontal\tGimnasio\tPerformance\tEst\u00e9tica\tControl; Uso: Unilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tBilateral\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-REMO-CON-KETTLEBELL\tRemo con kettlebell\tTracci\u00f3n horizontal\tTracci\u00f3n horizontal\tTodos\tPerformance\tTodos\tFuncional; Uso: Unilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Equilibrio\tBanda\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-REMO-CON-PAUSA\tRemo con pausa\tTracci\u00f3n horizontal\tTracci\u00f3n horizontal\tTodos\tPerformance\tRendimiento\tT\u00e9cnico; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tNormal\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-REMO-CON-TEMPO-LENTO\tRemo con tempo lento\tTracci\u00f3n horizontal\tTracci\u00f3n horizontal\tTodos\tPerformance\tRendimiento\tT\u00e9cnico; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tNormal\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-REMO-ALTO-CON-BARRA\tRemo alto con barra\tTracci\u00f3n horizontal\tTracci\u00f3n horizontal\tGimnasio\tOptimizaci\u00f3n\tRendimiento\tAvanzado; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: T\u00e9cnica\tMancuernas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-REMO-EN-M-QUINA\tRemo en m\u00e1quina\tTracci\u00f3n horizontal\tTracci\u00f3n horizontal\tGimnasio\tPerformance\tEst\u00e9tica\tGuiado; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tBanda\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-REMO-ISOM-TRICO\tRemo isom\u00e9trico\tTracci\u00f3n horizontal\tTracci\u00f3n horizontal\tTodos\tReconstrucci\u00f3n\tSalud/base\tBase; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tBanda\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-JAL-N-AL-PECHO\tJal\u00f3n al pecho\tTracci\u00f3n vertical\tTracci\u00f3n vertical\tGimnasio\tPerformance\tEst\u00e9tica\tBase; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: T\u00e9cnica\tBanda\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-DOMINADAS-ASISTIDAS\tDominadas asistidas\tTracci\u00f3n vertical\tTracci\u00f3n vertical\tGimnasio\tPerformance\tRendimiento\tBase; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Fuerza\tJal\u00f3n\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-DOMINADAS-ESTRICTAS\tDominadas estrictas\tTracci\u00f3n vertical\tTracci\u00f3n vertical\tGimnasio\tOptimizaci\u00f3n\tRendimiento\tAvanzado; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Fuerza\tAsistidas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-JAL-N-CON-AGARRE-NEUTRO\tJal\u00f3n con agarre neutro\tTracci\u00f3n vertical\tTracci\u00f3n vertical\tGimnasio\tPerformance\tEst\u00e9tica\tSeguro; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: T\u00e9cnica\tBanda\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-JAL-N-UNILATERAL\tJal\u00f3n unilateral\tTracci\u00f3n vertical\tTracci\u00f3n vertical\tGimnasio\tPerformance\tEst\u00e9tica\tEstabilidad; Uso: Unilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tBilateral\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-DOMINADAS-CON-BANDA\tDominadas con banda\tTracci\u00f3n vertical\tTracci\u00f3n vertical\tTodos\tPerformance\tRendimiento\tProgresi\u00f3n; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Fuerza\tJal\u00f3n\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-JAL-N-CON-BANDA-EL-STICA\tJal\u00f3n con banda el\u00e1stica\tTracci\u00f3n vertical\tTracci\u00f3n vertical\tTodos\tReconstrucci\u00f3n\tSalud/base\tBase; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tBanda ligera\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-DOMINADAS-NEGATIVAS\tDominadas negativas\tTracci\u00f3n vertical\tTracci\u00f3n vertical\tTodos\tPerformance\tRendimiento\tT\u00e9cnico; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Fuerza\tAsistidas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-JAL-N-TRAS-NUCA-CONTROLADO\tJal\u00f3n tras nuca (controlado)\tTracci\u00f3n vertical\tTracci\u00f3n vertical\tGimnasio\tOptimizaci\u00f3n\tRendimiento\tAvanzado; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Movilidad\tJal\u00f3n frontal\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-ESCAPULAR-PULL-UP\tEscapular pull-up\tTracci\u00f3n vertical\tTracci\u00f3n vertical\tTodos\tPerformance\tRendimiento\tBase t\u00e9cnica; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tBanda\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-DEADBUG\tDeadbug\tCore\tCore\tTodos\tReconstrucci\u00f3n/Performance\tSalud/base\tBase; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tIsom\u00e9trico\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-DEADBUG-CON-CARGA\tDeadbug con carga\tCore\tCore\tTodos\tPerformance\tRendimiento\tT\u00e9cnico; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Control\tSin carga\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PLANCHA-FRONTAL\tPlancha frontal\tCore\tCore\tTodos\tReconstrucci\u00f3n/Performance\tSalud/base\tBase; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tRodillas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PLANCHA-LATERAL\tPlancha lateral\tCore\tCore\tTodos\tReconstrucci\u00f3n/Performance\tSalud/base\tEstabilidad; Uso: Unilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tRodillas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-BIRD-DOG\tBird-dog\tCore\tCore\tTodos\tReconstrucci\u00f3n/Performance\tSalud/base\tBase; Uso: Unilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tIsom\u00e9trico\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-BIRD-DOG-AVANZADO\tBird-dog avanzado\tCore\tCore\tTodos\tPerformance\tRendimiento\tT\u00e9cnico; Uso: Unilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tB\u00e1sico\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-PALLOF\tPress Pallof\tCore\tCore\tTodos\tPerformance\tRendimiento\tAntirotaci\u00f3n; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tPlancha\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PLANCHA-CON-DESPLAZAMIENTO\tPlancha con desplazamiento\tCore\tCore\tTodos\tPerformance\tRendimiento\tDin\u00e1mico; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tPlancha\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-HOLLOW-HOLD\tHollow hold\tCore\tCore\tTodos\tPerformance\tRendimiento\tExigente; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Fatiga\tRodillas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-ELEVACIONES-DE-PIERNAS\tElevaciones de piernas\tCore\tCore\tTodos\tOptimizaci\u00f3n\tRendimiento\tAvanzado; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Fuerza\tRodillas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-RUEDA-ABDOMINAL\tRueda abdominal\tCore\tCore\tTodos\tOptimizaci\u00f3n\tRendimiento\tMuy exigente; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 2\tRevisar restricci\u00f3n: T\u00e9cnica\tPlancha\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-CARGA-UNILATERAL-CARRY\tCarga unilateral (carry)\tCore\tCore\tTodos\tPerformance\tRendimiento\tMuy \u00fatil; Uso: Unilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Fatiga\tSin carga\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-ANTI-EXTENSI-N-CON-BANDA\tAnti-extensi\u00f3n con banda\tCore\tCore\tTodos\tPerformance\tRendimiento\tClave; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tPlancha\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-RUSSIAN-TWIST\tRussian twist\tCore\tCore\tTodos\tPerformance\tEst\u00e9tica\tRotaci\u00f3n; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Espalda\tDeadbug\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-LANZAMIENTO-BAL-N-MEDICINAL\tLanzamiento bal\u00f3n medicinal\tCore\tCore\tGimnasio\tOptimizaci\u00f3n\tRendimiento\tPotencia; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 2\tRevisar restricci\u00f3n: T\u00e9cnica\tPallof\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-MARCHA-CARGADA\tMarcha cargada\tMetab\u00f3lico\tMetab\u00f3lico\tTodos\tReconstrucci\u00f3n/Performance\tP\u00e9rdida de grasa\tBase; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Fatiga\tSin carga\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PASEO-DEL-GRANJERO\tPaseo del granjero\tMetab\u00f3lico\tMetab\u00f3lico\tTodos\tPerformance\tP\u00e9rdida de grasa\tFuncional; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Agarre\tMarcha\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-CIRCUITO-PESO-CORPORAL\tCircuito peso corporal\tMetab\u00f3lico\tMetab\u00f3lico\tTodos\tPerformance\tP\u00e9rdida de grasa\tMuy \u00fatil; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Fatiga\tReducir reps\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-BURPEES\tBurpees\tMetab\u00f3lico\tMetab\u00f3lico\tTodos\tOptimizaci\u00f3n\tP\u00e9rdida de grasa\tIntenso; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Impacto\tSin salto\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-JUMPING-JACKS\tJumping jacks\tMetab\u00f3lico\tMetab\u00f3lico\tTodos\tReconstrucci\u00f3n/Performance\tP\u00e9rdida de grasa\tBase; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Impacto\tSin salto\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-CUERDA\tCuerda\tMetab\u00f3lico\tMetab\u00f3lico\tTodos\tReconstrucci\u00f3n/Performance\tP\u00e9rdida de grasa\tSimple; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Impacto\tMarcha\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SPRINT-CORTO\tSprint corto\tMetab\u00f3lico\tMetab\u00f3lico\tTodos\tOptimizaci\u00f3n\tRendimiento\tPotencia; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Impacto\tMarcha\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-AIR-BIKE\tAir bike\tMetab\u00f3lico\tMetab\u00f3lico\tGimnasio\tPerformance/Optimizaci\u00f3n\tRendimiento\tMuy eficaz; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Ninguna\tBici suave\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-REMO-ERG-METRO\tRemo erg\u00f3metro\tMetab\u00f3lico\tMetab\u00f3lico\tGimnasio\tPerformance/Optimizaci\u00f3n\tRendimiento\tCompleto; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: T\u00e9cnica\tBaja intensidad\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-CAMINATA-INCLINADA\tCaminata inclinada\tMetab\u00f3lico\tMetab\u00f3lico\tGimnasio\tReconstrucci\u00f3n/Performance\tP\u00e9rdida de grasa\tSeguro; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tLlano\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SHADOW-BOXING\tShadow boxing\tMetab\u00f3lico\tMetab\u00f3lico\tTodos\tPerformance\tP\u00e9rdida de grasa\tEntretenido; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tMov lento\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-ARRASTRE-DE-TRINEO\tArrastre de trineo\tMetab\u00f3lico\tMetab\u00f3lico\tGimnasio\tPerformance/Optimizaci\u00f3n\tRendimiento\tFuncional; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Disponibilidad\tMarcha\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SALTOS-EN-CAJ-N\tSaltos en caj\u00f3n\tMetab\u00f3lico\tMetab\u00f3lico\tGimnasio\tOptimizaci\u00f3n\tRendimiento\tPotencia; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Impacto\tSentadilla\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-CIRCUITO-INTERVALADO\tCircuito intervalado\tMetab\u00f3lico\tMetab\u00f3lico\tTodos\tPerformance\tP\u00e9rdida de grasa\tVariable; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Fatiga\tReducir intensidad\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-BICICLETA-EST-TICA\tBicicleta est\u00e1tica\tMetab\u00f3lico\tMetab\u00f3lico\tGimnasio\tReconstrucci\u00f3n/Performance\tSalud/base\tControlado; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tLento\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SENTADILLA-ZERCHER\tSentadilla Zercher\tSentadilla\tSentadilla\tGimnasio\tOptimizaci\u00f3n\tRendimiento\tAgarre Zercher, muy t\u00e9cnica; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: T\u00e9cnica\tFrontal\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SENTADILLA-PISTOLA-ASISTIDA\tSentadilla pistola asistida\tSentadilla\tSentadilla\tTodos\tPerformance\tRendimiento\tProgresi\u00f3n hacia pistola; Uso: Unilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Equilibrio\tSplit asistido\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SENTADILLA-PISTOLA\tSentadilla pistola\tSentadilla\tSentadilla\tTodos\tOptimizaci\u00f3n\tRendimiento\tM\u00e1xima unilateral; Uso: Unilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Equilibrio\tPistola asistida\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SENTADILLA-CON-PAUSA-ABAJO\tSentadilla con pausa abajo\tSentadilla\tSentadilla\tTodos\tPerformance\tRendimiento\tAumenta tiempo bajo tensi\u00f3n; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Control bajo\tGoblet\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SENTADILLA-ISOM-TRICA-EN-PARED\tSentadilla isom\u00e9trica en pared\tSentadilla\tSentadilla\tTodos\tReconstrucci\u00f3n\tSalud/base\tExcelente para rodilla; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Dolor rodilla\tNinguna\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-LUNGE-FRONTAL\tLunge frontal\tSentadilla\tSentadilla\tTodos\tPerformance\tEst\u00e9tica\tDin\u00e1mica, alternada; Uso: Unilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Equilibrio\tSplit asistido\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-LUNGE-LATERAL\tLunge lateral\tSentadilla\tSentadilla\tTodos\tPerformance\tEst\u00e9tica\tActiva aductores; Uso: Unilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Movilidad cadera\tLunge frontal\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-LUNGE-REVERSO\tLunge reverso\tSentadilla\tSentadilla\tTodos\tReconstrucci\u00f3n\tSalud/base\tMenos compresi\u00f3n rodilla; Uso: Unilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Equilibrio\tSplit asistido\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-STEP-UP-CON-MANCUERNA\tStep-up con mancuerna\tSentadilla\tSentadilla\tTodos\tPerformance\tEst\u00e9tica\tAltura controlada; Uso: Unilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Equilibrio\tLunge reverso\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-STEP-UP-LATERAL\tStep-up lateral\tSentadilla\tSentadilla\tTodos\tPerformance\tRendimiento\tTrabaja gl\u00fateo medio; Uso: Unilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Equilibrio\tStep-up frontal\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-GOOD-MORNING-CON-BARRA\tGood morning con barra\tBisagra\tBisagra\tGimnasio\tOptimizaci\u00f3n\tRendimiento\tCarga en barra sobre trapecios; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: T\u00e9cnica\tBuenos d\u00edas banda\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PESO-MUERTO-CONVENCIONAL-DEFICITARIO\tPeso muerto convencional deficitario\tBisagra\tBisagra\tGimnasio\tOptimizaci\u00f3n\tRendimiento\tMayor rango de movimiento; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: T\u00e9cnica\tConvencional\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PESO-MUERTO-RUMANO-CON-BARRA\tPeso muerto rumano con barra\tBisagra\tBisagra\tGimnasio\tPerformance\tRendimiento\tCl\u00e1sico para isquios; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: T\u00e9cnica\tRumano mancuernas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-HIPEREXTENSI-N-EN-BANCO-ROMANO\tHiperextensi\u00f3n en banco romano\tBisagra\tBisagra\tGimnasio\tPerformance\tEst\u00e9tica\tBanco 45 grados; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Dolor lumbar\tBisagra banda\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-HIPEREXTENSI-N-UNILATERAL\tHiperextensi\u00f3n unilateral\tBisagra\tBisagra\tGimnasio\tPerformance\tRendimiento\tMayor activaci\u00f3n gl\u00fateo; Uso: Unilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Equilibrio\tHiperextensi\u00f3n bilateral\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-HIP-THRUST-CON-BANDA-EN-RODILLAS\tHip thrust con banda en rodillas\tBisagra\tBisagra\tTodos\tPerformance\tEst\u00e9tica\tBanda activa gl\u00fateo medio; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Control lumbar\tPuente gl\u00fateo\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PESO-MUERTO-SUMO-CON-KETTLEBELL\tPeso muerto sumo con kettlebell\tBisagra\tBisagra\tTodos\tPerformance\tEst\u00e9tica\tM\u00e1s accesible que barra sumo; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Movilidad cadera\tSumo mancuerna\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-CURL-FEMORAL-EN-SUELO-CON-BANDA\tCurl femoral en suelo con banda\tBisagra\tBisagra\tTodos\tReconstrucci\u00f3n\tSalud/base\tTrabajo exc\u00e9ntrico isquios; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Ninguna\tIsom\u00e9trico\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-NORDIC-CURL\tNordic curl\tBisagra\tBisagra\tTodos\tOptimizaci\u00f3n\tRendimiento\tPrevenci\u00f3n lesi\u00f3n isquios; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 2\tRevisar restricci\u00f3n: T\u00e9cnica\tCurl femoral\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-BISAGRA-CON-KETTLEBELL-DOS-MANOS\tBisagra con kettlebell dos manos\tBisagra\tBisagra\tTodos\tReconstrucci\u00f3n\tSalud/base\tAprendizaje del patr\u00f3n; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Control\tHip hinge palo\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-EN-SUELO-CON-BARRA\tPress en suelo con barra\tEmpuje H.\tEmpuje H.\tGimnasio\tPerformance\tRendimiento\tLimita rango, seguro hombro; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 3\tRevisar restricci\u00f3n: T\u00e9cnica\tPress suelo mancuernas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-DECLINADO-CON-MANCUERNAS\tPress declinado con mancuernas\tEmpuje H.\tEmpuje H.\tGimnasio\tPerformance\tEst\u00e9tica\tPectoral inferior; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Hombro\tPress plano\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-CON-AGARRE-NEUTRO-MANCUERNAS\tPress con agarre neutro mancuernas\tEmpuje H.\tEmpuje H.\tGimnasio\tPerformance\tEst\u00e9tica\tM\u00e1s seguro para el hombro; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tPress plano\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-APERTURAS-CON-MANCUERNAS-PLANO\tAperturas con mancuernas plano\tEmpuje H.\tEmpuje H.\tGimnasio\tPerformance\tEst\u00e9tica\tAislamiento pectoral; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Hombro\tPress mancuernas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-APERTURAS-EN-CABLE-CRUZADO\tAperturas en cable cruzado\tEmpuje H.\tEmpuje H.\tGimnasio\tPerformance\tEst\u00e9tica\tTensi\u00f3n constante; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Ninguna\tAperturas mancuernas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-FLEXI-N-CON-PIES-ELEVADOS\tFlexi\u00f3n con pies elevados\tEmpuje H.\tEmpuje H.\tTodos\tPerformance\tRendimiento\tMayor carga tren superior; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Hombro\tFlexi\u00f3n suelo\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-CON-BARRA-AGARRE-ESTRECHO\tPress con barra agarre estrecho\tEmpuje H.\tEmpuje H.\tGimnasio\tOptimizaci\u00f3n\tRendimiento\tEnfoque tr\u00edceps; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: T\u00e9cnica\tPress neutro\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-EXTENSI-N-TR-CEPS-EN-POLEA-ALTA\tExtensi\u00f3n tr\u00edceps en polea alta\tEmpuje H.\tEmpuje H.\tGimnasio\tPerformance\tEst\u00e9tica\tAislamiento tr\u00edceps; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Ninguna\tPress en m\u00e1quina\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-EXTENSI-N-TR-CEPS-CON-MANCUERNA\tExtensi\u00f3n tr\u00edceps con mancuerna\tEmpuje H.\tEmpuje H.\tTodos\tPerformance\tEst\u00e9tica\tSobre la cabeza; Uso: Unilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tExtensi\u00f3n polea\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-FLEXI-N-DIAMANTE\tFlexi\u00f3n diamante\tEmpuje H.\tEmpuje H.\tTodos\tPerformance\tRendimiento\tM\u00e1xima activaci\u00f3n tr\u00edceps; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 3\tRevisar restricci\u00f3n: T\u00e9cnica\tFlexi\u00f3n estrecha\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-ELEVACIONES-LATERALES-CON-MANCUERNA\tElevaciones laterales con mancuerna\tEmpuje V.\tEmpuje V.\tTodos\tPerformance\tEst\u00e9tica\tDeltoides lateral; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Hombro\tNinguna\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-ELEVACIONES-LATERALES-EN-CABLE\tElevaciones laterales en cable\tEmpuje V.\tEmpuje V.\tGimnasio\tPerformance\tEst\u00e9tica\tTensi\u00f3n constante; Uso: Unilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Ninguna\tElevaciones mancuerna\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-ELEVACIONES-FRONTALES-CON-MANCUERNA\tElevaciones frontales con mancuerna\tEmpuje V.\tEmpuje V.\tTodos\tPerformance\tEst\u00e9tica\tDeltoides anterior; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Hombro\tNinguna\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-Z-CON-BARRA-EZ\tPress Z con barra EZ\tEmpuje V.\tEmpuje V.\tGimnasio\tPerformance\tRendimiento\tVariante segura; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Ninguna\tPress barra\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PRESS-EN-M-QUINA-HOMBRO\tPress en m\u00e1quina hombro\tEmpuje V.\tEmpuje V.\tGimnasio\tPerformance\tEst\u00e9tica\tGuiado, seguro; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tPress mancuernas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-REMO-YATES-CON-MANCUERNA\tRemo Yates con mancuerna\tTracci\u00f3n H.\tTracci\u00f3n H.\tTodos\tPerformance\tRendimiento\t\u00c1ngulo 70 grados; Uso: Unilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Espalda\tRemo inclinado\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-REMO-CON-BARRA-EN-T\tRemo con barra en T\tTracci\u00f3n H.\tTracci\u00f3n H.\tGimnasio\tOptimizaci\u00f3n\tRendimiento\tGran masa muscular espalda; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: T\u00e9cnica\tRemo barra\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-REMO-POLEA-ALTA-CON-CUERDA\tRemo polea alta con cuerda\tTracci\u00f3n H.\tTracci\u00f3n H.\tGimnasio\tPerformance\tEst\u00e9tica\tTrabaja posterior; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tFacepull\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-REMO-CON-BANDA-ALTA\tRemo con banda alta\tTracci\u00f3n H.\tTracci\u00f3n H.\tTodos\tReconstrucci\u00f3n\tSalud/base\tTrabaja deltoides posterior; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tBanda baja\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-CURL-CON-MANCUERNA-SUPINO\tCurl con mancuerna supino\tTracci\u00f3n H.\tTracci\u00f3n H.\tTodos\tPerformance\tEst\u00e9tica\tB\u00edceps cl\u00e1sico; Uso: Unilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tCurl banda\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-CURL-CON-BARRA-EZ\tCurl con barra EZ\tTracci\u00f3n H.\tTracci\u00f3n H.\tGimnasio\tPerformance\tEst\u00e9tica\tMenor estr\u00e9s mu\u00f1eca; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Ninguna\tCurl mancuerna\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-CURL-EN-POLEA-BAJA\tCurl en polea baja\tTracci\u00f3n H.\tTracci\u00f3n H.\tGimnasio\tPerformance\tEst\u00e9tica\tTensi\u00f3n en estiramiento; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Ninguna\tCurl barra\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-CURL-MARTILLO-CON-MANCUERNA\tCurl martillo con mancuerna\tTracci\u00f3n H.\tTracci\u00f3n H.\tTodos\tPerformance\tEst\u00e9tica\tBraquial y braquiorradial; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tCurl supino\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-CURL-CONCENTRADO\tCurl concentrado\tTracci\u00f3n H.\tTracci\u00f3n H.\tTodos\tPerformance\tEst\u00e9tica\tM\u00e1ximo pico b\u00edceps; Uso: Unilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Ninguna\tCurl mancuerna\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-CURL-ZOTTMAN\tCurl Zottman\tTracci\u00f3n H.\tTracci\u00f3n H.\tTodos\tPerformance\tRendimiento\tTrabaja flexores y extensores; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Ninguna\tCurl supino\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-JAL-N-EN-POLEA-CON-AGARRE-PRONO\tJal\u00f3n en polea con agarre prono\tTracci\u00f3n V.\tTracci\u00f3n V.\tGimnasio\tPerformance\tRendimiento\tDorsales y redondos; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tJal\u00f3n agarre neutro\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-JAL-N-EN-POLEA-CON-CUERDA\tJal\u00f3n en polea con cuerda\tTracci\u00f3n V.\tTracci\u00f3n V.\tGimnasio\tPerformance\tEst\u00e9tica\tPermite rotaci\u00f3n; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tJal\u00f3n pecho\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-REMO-EN-BARRA-FIJA-CON-PIES-ELEVADOS\tRemo en barra fija con pies elevados\tTracci\u00f3n V.\tTracci\u00f3n V.\tTodos\tOptimizaci\u00f3n\tRendimiento\tMayor porcentaje del peso; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Fuerza\tDominadas asistidas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-DOMINADAS-CON-AGARRE-SUPINO\tDominadas con agarre supino\tTracci\u00f3n V.\tTracci\u00f3n V.\tTodos\tOptimizaci\u00f3n\tRendimiento\tMayor \u00e9nfasis en b\u00edceps; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Fuerza\tAsistidas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-DOMINADAS-CON-AGARRE-NEUTRO\tDominadas con agarre neutro\tTracci\u00f3n V.\tTracci\u00f3n V.\tTodos\tOptimizaci\u00f3n\tRendimiento\tCodo m\u00e1s seguro; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Fuerza\tAsistidas\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PLANK-CON-ELEVACI-N-DE-PIERNA\tPlank con elevaci\u00f3n de pierna\tCore\tCore\tTodos\tPerformance\tRendimiento\tA\u00f1ade inestabilidad; Uso: Unilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tPlancha frontal\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PLANK-CON-TOQUE-DE-HOMBRO\tPlank con toque de hombro\tCore\tCore\tTodos\tPerformance\tRendimiento\tAnti-rotaci\u00f3n din\u00e1mica; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Control\tPlancha frontal\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PLANK-LATERAL-CON-ELEVACI-N\tPlank lateral con elevaci\u00f3n\tCore\tCore\tTodos\tPerformance\tRendimiento\tOblicuos avanzado; Uso: Unilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tPlancha lateral\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-CRUNCH-EN-POLEA\tCrunch en polea\tCore\tCore\tGimnasio\tPerformance\tEst\u00e9tica\tTensi\u00f3n constante; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Ninguna\tCrunch suelo\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-CRUNCH-BICICLETA\tCrunch bicicleta\tCore\tCore\tTodos\tPerformance\tEst\u00e9tica\tRotaci\u00f3n + flexi\u00f3n; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tCrunch suelo\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-LEG-RAISE-EN-BARRA\tLeg raise en barra\tCore\tCore\tGimnasio\tOptimizaci\u00f3n\tRendimiento\tColgado en barra; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: T\u00e9cnica\tElevaciones suelo\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-ROLLOUT-CON-BARRA\tRollout con barra\tCore\tCore\tGimnasio\tOptimizaci\u00f3n\tRendimiento\tAnti-extensi\u00f3n m\u00e1xima; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: T\u00e9cnica\tRueda abdominal\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-VAC-O-ABDOMINAL\tVac\u00edo abdominal\tCore\tCore\tTodos\tReconstrucci\u00f3n\tSalud/base\tTransverso profundo; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Ninguna\tRespiraci\u00f3n diafragm\u00e1tica\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SIT-UP-COMPLETO\tSit-up completo\tCore\tCore\tTodos\tPerformance\tEst\u00e9tica\tNo recomendado lumbar sensible; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Lumbar\tCrunch\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-AB-WHEEL-DE-RODILLAS\tAb wheel de rodillas\tCore\tCore\tTodos\tPerformance\tRendimiento\tProgresi\u00f3n rueda; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: T\u00e9cnica\tPlancha frontal\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PALLOF-PRESS-EN-ROTACI-N\tPallof press en rotaci\u00f3n\tCore\tCore\tGimnasio\tPerformance\tRendimiento\tA\u00f1ade componente rotacional; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tPallof press\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SUITCASE-CARRY\tSuitcase carry\tCore\tCore\tTodos\tPerformance\tRendimiento\tM\u00e1xima activaci\u00f3n cuadrado lumbar; Uso: Unilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tCarry bilateral\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-FARMER-CARRY\tFarmer carry\tCore\tCore\tTodos\tPerformance\tRendimiento\tAgarre y core; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tCarry suitcase\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-OVERHEAD-CARRY\tOverhead carry\tCore\tCore\tTodos\tOptimizaci\u00f3n\tRendimiento\tM\u00e1xima estabilidad hombro; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Hombro\tFarmer carry\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-CINTA-DE-CORRER-INTERVALO\tCinta de correr (intervalo)\tMetab\u00f3lico\tMetab\u00f3lico\tGimnasio\tPerformance\tP\u00e9rdida de grasa\tIntervalos 30/30; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Ninguna\tCaminata\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-ESCALADOR-MOUNTAIN-CLIMBERS\tEscalador (mountain climbers)\tMetab\u00f3lico\tMetab\u00f3lico\tTodos\tPerformance\tP\u00e9rdida de grasa\tCore + cardio; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tMarcha cargada\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-BURPEE-CON-SALTO\tBurpee con salto\tMetab\u00f3lico\tMetab\u00f3lico\tTodos\tOptimizaci\u00f3n\tP\u00e9rdida de grasa\tM\u00e1xima intensidad; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Impacto\tBurpee sin salto\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SLAM-CON-BAL-N-MEDICINAL\tSlam con bal\u00f3n medicinal\tMetab\u00f3lico\tMetab\u00f3lico\tGimnasio\tOptimizaci\u00f3n\tRendimiento\tPotencia + core; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 2\tRevisar restricci\u00f3n: T\u00e9cnica\tLanzamiento\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-TIJERAS-JUMPING-SCISSORS\tTijeras (jumping scissors)\tMetab\u00f3lico\tMetab\u00f3lico\tTodos\tPerformance\tP\u00e9rdida de grasa\tCardio de bajo impacto; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Impacto\tJumping jacks\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SKIPPING\tSkipping\tMetab\u00f3lico\tMetab\u00f3lico\tTodos\tPerformance\tRendimiento\tFrecuencia de pisada; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Impacto\tMarcha elevada\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SLED-PUSH-EMPUJE-TRINEO\tSled push (empuje trineo)\tMetab\u00f3lico\tMetab\u00f3lico\tGimnasio\tOptimizaci\u00f3n\tRendimiento\tPotencia conc\u00e9ntrica pura; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Impacto\tArrastre trineo\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-BATTLE-ROPES-ONDAS\tBattle ropes (ondas)\tMetab\u00f3lico\tMetab\u00f3lico\tGimnasio\tPerformance\tRendimiento\tCardio + hombros; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tShadow boxing\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-EL-PTICA\tEl\u00edptica\tMetab\u00f3lico\tMetab\u00f3lico\tGimnasio\tReconstrucci\u00f3n\tSalud/base\tSin impacto articular; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Ninguna\tBicicleta\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-NATACI-N-SIMULADA\tNataci\u00f3n (simulada)\tMetab\u00f3lico\tMetab\u00f3lico\tGimnasio\tReconstrucci\u00f3n\tSalud/base\tFull body sin impacto; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Ninguna\tEl\u00edptica\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-CIRCUITO-HIIT-4-EJERCICIOS\tCircuito HIIT (4 ejercicios)\tMetab\u00f3lico\tMetab\u00f3lico\tTodos\tPerformance\tP\u00e9rdida de grasa\t4 ejercicios 40/20; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Fatiga\tCircuito reducido\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-KETTLEBELL-SWING-DOBLE\tKettlebell swing doble\tMetab\u00f3lico\tMetab\u00f3lico\tTodos\tOptimizaci\u00f3n\tRendimiento\tDos kettlebells; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 2\tRevisar restricci\u00f3n: T\u00e9cnica\tKB swing simple\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-TURKISH-GET-UP\tTurkish get-up\tMetab\u00f3lico\tMetab\u00f3lico\tTodos\tOptimizaci\u00f3n\tRendimiento\tMovimiento completo; Uso: Unilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: T\u00e9cnica\tNinguna\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-CLEAN-CON-KETTLEBELL\tClean con kettlebell\tMetab\u00f3lico\tMetab\u00f3lico\tTodos\tOptimizaci\u00f3n\tRendimiento\tPotencia y t\u00e9cnica; Uso: Unilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 2\tRevisar restricci\u00f3n: T\u00e9cnica\tSwing\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-REMO-CON-CUERDA-DE-BATTLE\tRemo con cuerda de battle\tMetab\u00f3lico\tMetab\u00f3lico\tGimnasio\tPerformance\tRendimiento\tTracci\u00f3n con ondas; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tRemo banda\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-TUCK-JUMPS\tTuck jumps\tMetab\u00f3lico\tMetab\u00f3lico\tTodos\tOptimizaci\u00f3n\tRendimiento\tRodillas al pecho; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Impacto\tSentadilla con salto\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-BOX-STEP-UP-R-PIDO\tBox step-up r\u00e1pido\tMetab\u00f3lico\tMetab\u00f3lico\tGimnasio\tPerformance\tRendimiento\tComponente cardio; Uso: Unilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Impacto\tStep-up lento\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-THRUSTER-SENTADILLA-PRESS\tThruster (sentadilla + press)\tMetab\u00f3lico\tMetab\u00f3lico\tTodos\tOptimizaci\u00f3n\tRendimiento\tPotencia full body; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: T\u00e9cnica\tSentadilla + press sep\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-MAN-MAKER\tMan maker\tMetab\u00f3lico\tMetab\u00f3lico\tTodos\tOptimizaci\u00f3n\tRendimiento\tComplejo total; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: T\u00e9cnica\tBurpee\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SISSY-SQUAT\tSissy squat\tSentadilla\tSentadilla\tTodos\tOptimizaci\u00f3n\tEst\u00e9tica\tAislamiento cu\u00e1driceps; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Rodilla\tNinguna\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PATADA-DE-GL-TEO-EN-CUADRUPEDIA\tPatada de gl\u00fateo en cuadrupedia\tBisagra\tBisagra\tTodos\tReconstrucci\u00f3n\tSalud/base\tActivaci\u00f3n gl\u00fateo; Uso: Unilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Ninguna\tPuente gl\u00fateo\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-ABDUCCI-N-DE-CADERA-CON-BANDA\tAbducci\u00f3n de cadera con banda\tBisagra\tBisagra\tTodos\tReconstrucci\u00f3n\tSalud/base\tGl\u00fateo medio aislado; Uso: Unilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Ninguna\tNinguna\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-ELEVACI-N-DE-TALONES-STANDING\tElevaci\u00f3n de talones (standing)\tBisagra\tBisagra\tTodos\tPerformance\tEst\u00e9tica\tGemelos; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Ninguna\tNinguna\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-ELEVACI-N-DE-TALONES-SENTADO\tElevaci\u00f3n de talones sentado\tBisagra\tBisagra\tTodos\tReconstrucci\u00f3n\tSalud/base\tS\u00f3leo espec\u00edfico; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Ninguna\tElevaci\u00f3n de pie\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-RETRACCI-N-ESCAPULAR-CON-BANDA\tRetracci\u00f3n escapular con banda\tTracci\u00f3n H.\tTracci\u00f3n H.\tTodos\tReconstrucci\u00f3n\tSalud/base\tActiva romboides; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Ninguna\tNinguna\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-EXTERNAL-ROTATION-CON-BANDA\tExternal rotation con banda\tTracci\u00f3n H.\tTracci\u00f3n H.\tTodos\tReconstrucci\u00f3n\tSalud/base\tManguito rotador; Uso: Unilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Hombro\tNinguna\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-INTERNAL-ROTATION-CON-BANDA\tInternal rotation con banda\tTracci\u00f3n H.\tTracci\u00f3n H.\tTodos\tReconstrucci\u00f3n\tSalud/base\tManguito rotador; Uso: Unilateral; Complejidad: Baja; Fase m\u00ednima: 2; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Hombro\tNinguna\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-W-RAISE-EN-BANCO-INCLINADO\tW raise en banco inclinado\tTracci\u00f3n H.\tTracci\u00f3n H.\tGimnasio\tPerformance\tRendimiento\tDeltoides posterior y trapecios; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tRetracci\u00f3n banda\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-Y-RAISE-EN-BANCO-INCLINADO\tY raise en banco inclinado\tTracci\u00f3n H.\tTracci\u00f3n H.\tGimnasio\tPerformance\tRendimiento\tTrapecio inferior; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tW raise\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-DIP-EN-PARALELAS\tDip en paralelas\tEmpuje H.\tEmpuje H.\tGimnasio\tOptimizaci\u00f3n\tRendimiento\tPectoral inferior y tr\u00edceps; Uso: Bilateral; Complejidad: Alta; Fase m\u00ednima: 3; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Hombro\tPress barra estrecho\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-DIP-ASISTIDO-EN-M-QUINA\tDip asistido en m\u00e1quina\tEmpuje H.\tEmpuje H.\tGimnasio\tPerformance\tRendimiento\tProgresi\u00f3n hacia dip libre; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tPress m\u00e1quina\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-PUSH-UP-CON-ROTACI-N-T-PUSH\tPush-up con rotaci\u00f3n (T-push)\tEmpuje H.\tEmpuje H.\tTodos\tPerformance\tRendimiento\tCore + pectoral; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 3\tRevisar restricci\u00f3n: Hombro\tFlexi\u00f3n suelo\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-CUBAN-PRESS\tCuban press\tEmpuje V.\tEmpuje V.\tTodos\tReconstrucci\u00f3n\tSalud/base\tPrevenci\u00f3n lesi\u00f3n hombro; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 1; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Hombro\tRotaci\u00f3n externa\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-MCGILL-CURL-UP\tMcGill curl-up\tCore\tCore\tTodos\tReconstrucci\u00f3n\tSalud/base\tProtocolo McGill espalda; Uso: Bilateral; Complejidad: Baja; Fase m\u00ednima: 1; Estabilidad requerida: 1\tRevisar restricci\u00f3n: Lumbar\tVac\u00edo abdominal\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-SIDE-PLANK-CON-ROTACI-N\tSide plank con rotaci\u00f3n\tCore\tCore\tTodos\tPerformance\tRendimiento\tAnti-rotaci\u00f3n + oblicuos; Uso: Unilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tPlancha lateral\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29\nEX-STIR-THE-POT-EN-FITBALL\tStir the pot en fitball\tCore\tCore\tGimnasio\tPerformance\tRendimiento\tProtocolo McGill avanzado; Uso: Bilateral; Complejidad: Media; Fase m\u00ednima: 2; Estabilidad requerida: 2\tRevisar restricci\u00f3n: Ninguna\tPlancha frontal\tProgresar carga, rango, estabilidad o complejidad seg\u00fan respuesta IBERFIT.\tACTIVO\t2026-06-29";
const IBERFIT_MIG_MEDIA_TSV_ = "MEDIA_ID\tEJERCICIO_ID\tNOMBRE_EJERCICIO\tTIPO_MEDIA\tURL\tFUENTE\tLICENCIA\tAUTOR\tESTADO_APROBACION\tNOTAS\tACTUALIZADO_EN\nMEDIA-PEND-001\tEX-SENTARSE-Y-LEVANTARSE-DE-SILLA\tSentarse y levantarse de silla\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-002\tEX-SENTADILLA-A-CAJ-N\tSentadilla a caj\u00f3n\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-003\tEX-SENTADILLA-GOBLET\tSentadilla Goblet\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-004\tEX-SENTADILLA-GOBLET-PROFUNDA\tSentadilla Goblet profunda\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-005\tEX-PRESS-PALLOF-CON-BANDA\tPress Pallof con banda\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-006\tEX-SENTADILLA-B-LGARA\tSentadilla b\u00falgara\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-007\tEX-SPLIT-SQUAT-EST-TICO\tSplit squat est\u00e1tico\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-008\tEX-SENTADILLA-CON-TRX\tSentadilla con TRX\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-009\tEX-SENTADILLA-SUMO-CON-MANCUERNA\tSentadilla sumo con mancuerna\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-010\tEX-SENTADILLA-PAUSADA\tSentadilla pausada\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-011\tEX-SENTADILLA-FRONTAL-CON-BARRA\tSentadilla frontal con barra\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-012\tEX-SENTADILLA-TRASERA-CON-BARRA\tSentadilla trasera con barra\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-013\tEX-SENTADILLA-OVERHEAD\tSentadilla overhead\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-014\tEX-SENTADILLA-CON-SALTO\tSentadilla con salto\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-015\tEX-WALL-SIT-ISOM-TRICO\tWall sit (isom\u00e9trico)\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-016\tEX-SENTADILLA-EN-MULTIPOWER\tSentadilla en multipower\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-017\tEX-SENTADILLA-EN-M-QUINA-HACK\tSentadilla en m\u00e1quina hack\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-018\tEX-SENTADILLA-UNILATERAL-ASISTIDA\tSentadilla unilateral asistida\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-019\tEX-SENTADILLA-CON-BANDA-EL-STICA\tSentadilla con banda el\u00e1stica\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-020\tEX-SENTADILLA-TEMPO-LENTO\tSentadilla tempo lento\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-021\tEX-SENTADILLA-CON-KETTLEBELL\tSentadilla con kettlebell\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-022\tEX-PUENTE-DE-GL-TEO\tPuente de gl\u00fateo\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-023\tEX-PUENTE-DE-GL-TEO-UNILATERAL\tPuente de gl\u00fateo unilateral\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-024\tEX-HIP-THRUST-CON-BARRA\tHip thrust con barra\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-025\tEX-HIP-THRUST-UNILATERAL\tHip thrust unilateral\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-026\tEX-PESO-MUERTO-RUMANO-CON-MANCUERNAS\tPeso muerto rumano con mancuernas\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-027\tEX-PESO-MUERTO-RUMANO-A-UNA-PIERNA\tPeso muerto rumano a una pierna\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-028\tEX-PESO-MUERTO-CON-BARRA\tPeso muerto con barra\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-029\tEX-PESO-MUERTO-CON-TRAP-BAR\tPeso muerto con trap bar\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-030\tEX-KETTLEBELL-SWING\tKettlebell swing\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-031\tEX-HIP-HINGE-CON-PALO\tHip hinge con palo\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-032\tEX-BUENOS-D-AS-CON-BANDA\tBuenos d\u00edas con banda\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-033\tEX-PULL-THROUGH-CON-POLEA\tPull through con polea\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-034\tEX-EXTENSI-N-LUMBAR-EN-BANCO\tExtensi\u00f3n lumbar en banco\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-035\tEX-PESO-MUERTO-SUMO\tPeso muerto sumo\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-036\tEX-HIP-THRUST-EN-M-QUINA\tHip thrust en m\u00e1quina\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-037\tEX-PESO-MUERTO-CON-KETTLEBELL\tPeso muerto con kettlebell\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-038\tEX-PESO-MUERTO-PARCIAL\tPeso muerto parcial\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-039\tEX-BISAGRA-CON-BANDA\tBisagra con banda\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-040\tEX-HIP-THRUST-CON-PAUSA\tHip thrust con pausa\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-041\tEX-PESO-MUERTO-EXC-NTRICO\tPeso muerto exc\u00e9ntrico\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-042\tEX-FLEXI-N-EN-PARED\tFlexi\u00f3n en pared\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-043\tEX-FLEXI-N-INCLINADA\tFlexi\u00f3n inclinada\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-044\tEX-FLEXI-N-EN-SUELO\tFlexi\u00f3n en suelo\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-045\tEX-FLEXI-N-DECLINADA\tFlexi\u00f3n declinada\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-046\tEX-FLEXI-N-CON-PAUSA\tFlexi\u00f3n con pausa\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-047\tEX-PRESS-CON-MANCUERNAS-PLANO\tPress con mancuernas plano\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-048\tEX-PRESS-CON-BARRA-PLANO\tPress con barra plano\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-049\tEX-PRESS-INCLINADO-CON-MANCUERNAS\tPress inclinado con mancuernas\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-050\tEX-PRESS-INCLINADO-CON-BARRA\tPress inclinado con barra\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-051\tEX-PRESS-EN-M-QUINA\tPress en m\u00e1quina\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-052\tEX-FLEXI-N-CON-BANDA\tFlexi\u00f3n con banda\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-053\tEX-PRESS-UNILATERAL-MANCUERNA\tPress unilateral mancuerna\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-054\tEX-FLEXI-N-EN-ANILLAS\tFlexi\u00f3n en anillas\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-055\tEX-FLEXI-N-CON-MANOS-ESTRECHAS\tFlexi\u00f3n con manos estrechas\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-056\tEX-FLEXI-N-EXPLOSIVA\tFlexi\u00f3n explosiva\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-057\tEX-PRESS-CON-BANDA-EL-STICA\tPress con banda el\u00e1stica\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-058\tEX-PRESS-SUELO-CON-MANCUERNAS\tPress suelo con mancuernas\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-059\tEX-PRESS-CON-KETTLEBELL\tPress con kettlebell\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-060\tEX-FLEXI-N-CON-TEMPO-LENTO\tFlexi\u00f3n con tempo lento\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-061\tEX-PRESS-M-QUINA-CONVERGENTE\tPress m\u00e1quina convergente\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-062\tEX-PRESS-MILITAR-CON-MANCUERNAS\tPress militar con mancuernas\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-063\tEX-PRESS-MILITAR-CON-BARRA\tPress militar con barra\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-064\tEX-PRESS-ARNOLD\tPress Arnold\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-065\tEX-PUSH-PRESS\tPush press\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-066\tEX-PRESS-EN-M-QUINA-VERTICAL\tPress en m\u00e1quina vertical\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-067\tEX-HANDSTAND-PUSH-UP\tHandstand push-up\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-068\tEX-PRESS-SENTADO-CON-MANCUERNAS\tPress sentado con mancuernas\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-069\tEX-PRESS-CON-PAUSA-ARRIBA\tPress con pausa arriba\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-070\tEX-PRESS-CON-TEMPO-LENTO\tPress con tempo lento\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-071\tEX-PRESS-CON-BANDA-DESDE-ABAJO\tPress con banda desde abajo\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-072\tEX-PRESS-LANDMINE\tPress landmine\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-073\tEX-PRESS-EN-MULTIPOWER\tPress en multipower\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-074\tEX-REMO-CON-BANDA\tRemo con banda\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-075\tEX-REMO-CON-MANCUERNA\tRemo con mancuerna\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-076\tEX-REMO-CON-BARRA\tRemo con barra\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-077\tEX-REMO-EN-POLEA-BAJA\tRemo en polea baja\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-078\tEX-REMO-INVERTIDO\tRemo invertido\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-079\tEX-REMO-EN-TRX\tRemo en TRX\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-080\tEX-FACEPULL-CON-BANDA\tFacepull con banda\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-081\tEX-FACEPULL-POLEA\tFacepull polea\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-082\tEX-REMO-UNILATERAL-POLEA\tRemo unilateral polea\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-083\tEX-REMO-CON-KETTLEBELL\tRemo con kettlebell\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-084\tEX-REMO-CON-PAUSA\tRemo con pausa\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-085\tEX-REMO-CON-TEMPO-LENTO\tRemo con tempo lento\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-086\tEX-REMO-ALTO-CON-BARRA\tRemo alto con barra\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-087\tEX-REMO-EN-M-QUINA\tRemo en m\u00e1quina\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-088\tEX-REMO-ISOM-TRICO\tRemo isom\u00e9trico\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-089\tEX-JAL-N-AL-PECHO\tJal\u00f3n al pecho\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-090\tEX-DOMINADAS-ASISTIDAS\tDominadas asistidas\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-091\tEX-DOMINADAS-ESTRICTAS\tDominadas estrictas\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-092\tEX-JAL-N-CON-AGARRE-NEUTRO\tJal\u00f3n con agarre neutro\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-093\tEX-JAL-N-UNILATERAL\tJal\u00f3n unilateral\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-094\tEX-DOMINADAS-CON-BANDA\tDominadas con banda\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-095\tEX-JAL-N-CON-BANDA-EL-STICA\tJal\u00f3n con banda el\u00e1stica\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-096\tEX-DOMINADAS-NEGATIVAS\tDominadas negativas\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-097\tEX-JAL-N-TRAS-NUCA-CONTROLADO\tJal\u00f3n tras nuca (controlado)\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-098\tEX-ESCAPULAR-PULL-UP\tEscapular pull-up\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-099\tEX-DEADBUG\tDeadbug\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-100\tEX-DEADBUG-CON-CARGA\tDeadbug con carga\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-101\tEX-PLANCHA-FRONTAL\tPlancha frontal\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-102\tEX-PLANCHA-LATERAL\tPlancha lateral\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-103\tEX-BIRD-DOG\tBird-dog\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-104\tEX-BIRD-DOG-AVANZADO\tBird-dog avanzado\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-105\tEX-PRESS-PALLOF\tPress Pallof\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-106\tEX-PLANCHA-CON-DESPLAZAMIENTO\tPlancha con desplazamiento\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-107\tEX-HOLLOW-HOLD\tHollow hold\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-108\tEX-ELEVACIONES-DE-PIERNAS\tElevaciones de piernas\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-109\tEX-RUEDA-ABDOMINAL\tRueda abdominal\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-110\tEX-CARGA-UNILATERAL-CARRY\tCarga unilateral (carry)\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-111\tEX-ANTI-EXTENSI-N-CON-BANDA\tAnti-extensi\u00f3n con banda\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-112\tEX-RUSSIAN-TWIST\tRussian twist\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-113\tEX-LANZAMIENTO-BAL-N-MEDICINAL\tLanzamiento bal\u00f3n medicinal\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-114\tEX-MARCHA-CARGADA\tMarcha cargada\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-115\tEX-PASEO-DEL-GRANJERO\tPaseo del granjero\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-116\tEX-CIRCUITO-PESO-CORPORAL\tCircuito peso corporal\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-117\tEX-BURPEES\tBurpees\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-118\tEX-JUMPING-JACKS\tJumping jacks\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-119\tEX-CUERDA\tCuerda\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-120\tEX-SPRINT-CORTO\tSprint corto\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-121\tEX-AIR-BIKE\tAir bike\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-122\tEX-REMO-ERG-METRO\tRemo erg\u00f3metro\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-123\tEX-CAMINATA-INCLINADA\tCaminata inclinada\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-124\tEX-SHADOW-BOXING\tShadow boxing\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-125\tEX-ARRASTRE-DE-TRINEO\tArrastre de trineo\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-126\tEX-SALTOS-EN-CAJ-N\tSaltos en caj\u00f3n\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-127\tEX-CIRCUITO-INTERVALADO\tCircuito intervalado\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-128\tEX-BICICLETA-EST-TICA\tBicicleta est\u00e1tica\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-129\tEX-SENTADILLA-ZERCHER\tSentadilla Zercher\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-130\tEX-SENTADILLA-PISTOLA-ASISTIDA\tSentadilla pistola asistida\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-131\tEX-SENTADILLA-PISTOLA\tSentadilla pistola\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-132\tEX-SENTADILLA-CON-PAUSA-ABAJO\tSentadilla con pausa abajo\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-133\tEX-SENTADILLA-ISOM-TRICA-EN-PARED\tSentadilla isom\u00e9trica en pared\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-134\tEX-LUNGE-FRONTAL\tLunge frontal\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-135\tEX-LUNGE-LATERAL\tLunge lateral\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-136\tEX-LUNGE-REVERSO\tLunge reverso\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-137\tEX-STEP-UP-CON-MANCUERNA\tStep-up con mancuerna\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-138\tEX-STEP-UP-LATERAL\tStep-up lateral\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-139\tEX-GOOD-MORNING-CON-BARRA\tGood morning con barra\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-140\tEX-PESO-MUERTO-CONVENCIONAL-DEFICITARIO\tPeso muerto convencional deficitario\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-141\tEX-PESO-MUERTO-RUMANO-CON-BARRA\tPeso muerto rumano con barra\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-142\tEX-HIPEREXTENSI-N-EN-BANCO-ROMANO\tHiperextensi\u00f3n en banco romano\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-143\tEX-HIPEREXTENSI-N-UNILATERAL\tHiperextensi\u00f3n unilateral\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-144\tEX-HIP-THRUST-CON-BANDA-EN-RODILLAS\tHip thrust con banda en rodillas\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-145\tEX-PESO-MUERTO-SUMO-CON-KETTLEBELL\tPeso muerto sumo con kettlebell\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-146\tEX-CURL-FEMORAL-EN-SUELO-CON-BANDA\tCurl femoral en suelo con banda\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-147\tEX-NORDIC-CURL\tNordic curl\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-148\tEX-BISAGRA-CON-KETTLEBELL-DOS-MANOS\tBisagra con kettlebell dos manos\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-149\tEX-PRESS-EN-SUELO-CON-BARRA\tPress en suelo con barra\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-150\tEX-PRESS-DECLINADO-CON-MANCUERNAS\tPress declinado con mancuernas\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-151\tEX-PRESS-CON-AGARRE-NEUTRO-MANCUERNAS\tPress con agarre neutro mancuernas\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-152\tEX-APERTURAS-CON-MANCUERNAS-PLANO\tAperturas con mancuernas plano\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-153\tEX-APERTURAS-EN-CABLE-CRUZADO\tAperturas en cable cruzado\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-154\tEX-FLEXI-N-CON-PIES-ELEVADOS\tFlexi\u00f3n con pies elevados\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-155\tEX-PRESS-CON-BARRA-AGARRE-ESTRECHO\tPress con barra agarre estrecho\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-156\tEX-EXTENSI-N-TR-CEPS-EN-POLEA-ALTA\tExtensi\u00f3n tr\u00edceps en polea alta\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-157\tEX-EXTENSI-N-TR-CEPS-CON-MANCUERNA\tExtensi\u00f3n tr\u00edceps con mancuerna\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-158\tEX-FLEXI-N-DIAMANTE\tFlexi\u00f3n diamante\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-159\tEX-ELEVACIONES-LATERALES-CON-MANCUERNA\tElevaciones laterales con mancuerna\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-160\tEX-ELEVACIONES-LATERALES-EN-CABLE\tElevaciones laterales en cable\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-161\tEX-ELEVACIONES-FRONTALES-CON-MANCUERNA\tElevaciones frontales con mancuerna\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-162\tEX-PRESS-Z-CON-BARRA-EZ\tPress Z con barra EZ\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-163\tEX-PRESS-EN-M-QUINA-HOMBRO\tPress en m\u00e1quina hombro\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-164\tEX-REMO-YATES-CON-MANCUERNA\tRemo Yates con mancuerna\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-165\tEX-REMO-CON-BARRA-EN-T\tRemo con barra en T\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-166\tEX-REMO-POLEA-ALTA-CON-CUERDA\tRemo polea alta con cuerda\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-167\tEX-REMO-CON-BANDA-ALTA\tRemo con banda alta\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-168\tEX-CURL-CON-MANCUERNA-SUPINO\tCurl con mancuerna supino\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-169\tEX-CURL-CON-BARRA-EZ\tCurl con barra EZ\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-170\tEX-CURL-EN-POLEA-BAJA\tCurl en polea baja\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-171\tEX-CURL-MARTILLO-CON-MANCUERNA\tCurl martillo con mancuerna\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-172\tEX-CURL-CONCENTRADO\tCurl concentrado\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-173\tEX-CURL-ZOTTMAN\tCurl Zottman\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-174\tEX-JAL-N-EN-POLEA-CON-AGARRE-PRONO\tJal\u00f3n en polea con agarre prono\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-175\tEX-JAL-N-EN-POLEA-CON-CUERDA\tJal\u00f3n en polea con cuerda\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-176\tEX-REMO-EN-BARRA-FIJA-CON-PIES-ELEVADOS\tRemo en barra fija con pies elevados\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-177\tEX-DOMINADAS-CON-AGARRE-SUPINO\tDominadas con agarre supino\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-178\tEX-DOMINADAS-CON-AGARRE-NEUTRO\tDominadas con agarre neutro\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-179\tEX-PLANK-CON-ELEVACI-N-DE-PIERNA\tPlank con elevaci\u00f3n de pierna\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-180\tEX-PLANK-CON-TOQUE-DE-HOMBRO\tPlank con toque de hombro\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-181\tEX-PLANK-LATERAL-CON-ELEVACI-N\tPlank lateral con elevaci\u00f3n\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-182\tEX-CRUNCH-EN-POLEA\tCrunch en polea\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-183\tEX-CRUNCH-BICICLETA\tCrunch bicicleta\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-184\tEX-LEG-RAISE-EN-BARRA\tLeg raise en barra\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-185\tEX-ROLLOUT-CON-BARRA\tRollout con barra\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-186\tEX-VAC-O-ABDOMINAL\tVac\u00edo abdominal\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-187\tEX-SIT-UP-COMPLETO\tSit-up completo\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-188\tEX-AB-WHEEL-DE-RODILLAS\tAb wheel de rodillas\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-189\tEX-PALLOF-PRESS-EN-ROTACI-N\tPallof press en rotaci\u00f3n\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-190\tEX-SUITCASE-CARRY\tSuitcase carry\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-191\tEX-FARMER-CARRY\tFarmer carry\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-192\tEX-OVERHEAD-CARRY\tOverhead carry\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-193\tEX-CINTA-DE-CORRER-INTERVALO\tCinta de correr (intervalo)\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-194\tEX-ESCALADOR-MOUNTAIN-CLIMBERS\tEscalador (mountain climbers)\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-195\tEX-BURPEE-CON-SALTO\tBurpee con salto\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-196\tEX-SLAM-CON-BAL-N-MEDICINAL\tSlam con bal\u00f3n medicinal\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-197\tEX-TIJERAS-JUMPING-SCISSORS\tTijeras (jumping scissors)\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-198\tEX-SKIPPING\tSkipping\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-199\tEX-SLED-PUSH-EMPUJE-TRINEO\tSled push (empuje trineo)\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-200\tEX-BATTLE-ROPES-ONDAS\tBattle ropes (ondas)\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-201\tEX-EL-PTICA\tEl\u00edptica\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-202\tEX-NATACI-N-SIMULADA\tNataci\u00f3n (simulada)\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-203\tEX-CIRCUITO-HIIT-4-EJERCICIOS\tCircuito HIIT (4 ejercicios)\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-204\tEX-KETTLEBELL-SWING-DOBLE\tKettlebell swing doble\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-205\tEX-TURKISH-GET-UP\tTurkish get-up\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-206\tEX-CLEAN-CON-KETTLEBELL\tClean con kettlebell\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-207\tEX-REMO-CON-CUERDA-DE-BATTLE\tRemo con cuerda de battle\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-208\tEX-TUCK-JUMPS\tTuck jumps\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-209\tEX-BOX-STEP-UP-R-PIDO\tBox step-up r\u00e1pido\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-210\tEX-THRUSTER-SENTADILLA-PRESS\tThruster (sentadilla + press)\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-211\tEX-MAN-MAKER\tMan maker\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-212\tEX-SISSY-SQUAT\tSissy squat\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-213\tEX-PATADA-DE-GL-TEO-EN-CUADRUPEDIA\tPatada de gl\u00fateo en cuadrupedia\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-214\tEX-ABDUCCI-N-DE-CADERA-CON-BANDA\tAbducci\u00f3n de cadera con banda\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-215\tEX-ELEVACI-N-DE-TALONES-STANDING\tElevaci\u00f3n de talones (standing)\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-216\tEX-ELEVACI-N-DE-TALONES-SENTADO\tElevaci\u00f3n de talones sentado\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-217\tEX-RETRACCI-N-ESCAPULAR-CON-BANDA\tRetracci\u00f3n escapular con banda\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-218\tEX-EXTERNAL-ROTATION-CON-BANDA\tExternal rotation con banda\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-219\tEX-INTERNAL-ROTATION-CON-BANDA\tInternal rotation con banda\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-220\tEX-W-RAISE-EN-BANCO-INCLINADO\tW raise en banco inclinado\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-221\tEX-Y-RAISE-EN-BANCO-INCLINADO\tY raise en banco inclinado\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-222\tEX-DIP-EN-PARALELAS\tDip en paralelas\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-223\tEX-DIP-ASISTIDO-EN-M-QUINA\tDip asistido en m\u00e1quina\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-224\tEX-PUSH-UP-CON-ROTACI-N-T-PUSH\tPush-up con rotaci\u00f3n (T-push)\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-225\tEX-CUBAN-PRESS\tCuban press\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-226\tEX-MCGILL-CURL-UP\tMcGill curl-up\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-227\tEX-SIDE-PLANK-CON-ROTACI-N\tSide plank con rotaci\u00f3n\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29\nMEDIA-PEND-228\tEX-STIR-THE-POT-EN-FITBALL\tStir the pot en fitball\tPENDIENTE\t\tIBERFIT\tPENDIENTE\tIBERFIT\tPENDIENTE\tPendiente de asociar video/foto propio o licenciado.\t2026-06-29";



/** Estado canonical launch: confirma que el backend lee solo pestañas reales. */
function adminCanonicalStatusV962() {
  const cfg = safeRows_(IBERFIT.SHEETS.CONFIGURACION);
  const mode = (cfg.find(r => String(r.CLAVE || '') === 'CANONICAL_SOURCE_MODE') || {}).VALOR || '';
  const legacyRead = (cfg.find(r => String(r.CLAVE || '') === 'LEGACY_READ_ENABLED') || {}).VALOR || '';
  return {
    ok: true,
    version: IBERFIT.VERSION,
    canonicalMode: mode || 'CANONICAL_ONLY_EXPECTED',
    legacyReadEnabled: legacyRead || 'FALSE_EXPECTED',
    legacyOperational: false,
    activeSheets: {
      clientes: IBERFIT.SHEETS.CLIENTES,
      accesos: IBERFIT.SHEETS.ACCESOS,
      activaciones: IBERFIT.SHEETS.ACTIVACIONES,
      sesiones: IBERFIT.SHEETS.SESIONES,
      historico: IBERFIT.SHEETS.HISTORICO_CARGAS,
      biblioteca: IBERFIT.SHEETS.BIBLIOTECA
    },
    rule: 'ACCESO_ACTIVO_NO_BLOQUEA_DIAGNOSTICO_PENDIENTE'
  };
}

/** Reparación canonical-only de acceso cliente: solo toca 01 Clientes + 21 Accesos. */
function adminRepairClientAccessV962(email) {
  const login = String(email || '').trim().toLowerCase();
  if (!login) throw new Error('Falta email.');
  const c = getRows_(IBERFIT.SHEETS.CLIENTES).find(x => String(x.EMAIL || '').trim().toLowerCase() === login);
  if (!c) throw new Error('Cliente no encontrado en 01 Clientes: ' + login);
  updateRowByNumber_(IBERFIT.SHEETS.CLIENTES, c.__rowNumber, { ESTADO: 'ACTIVO', FECHA_ACTUALIZACION: new Date() });
  const access = getRows_(IBERFIT.SHEETS.ACCESOS).find(a => String(a.LOGIN || '').trim().toLowerCase() === login || String(a.CLIENTE_ID || '') === String(c.CLIENTE_ID || ''));
  if (!access) throw new Error('Acceso no encontrado en 21 Accesos para: ' + login);
  updateRowByNumber_(IBERFIT.SHEETS.ACCESOS, access.__rowNumber, { ESTADO_ACCESO: 'ACTIVO', INTENTOS_FALLIDOS: 0, OBSERVACION: 'Reparado V9.6.2 canonical-only: acceso activo; diagnóstico pendiente no bloquea login.' });
  return { ok: true, version: IBERFIT.VERSION, email: login, clientId: c.CLIENTE_ID || '', canonicalOnly: true };
}

/** Reparación quirúrgica de acceso cliente: sincroniza sistema nuevo/legacy sin inventar contraseña. */
function adminRepairClientAccessV961(email) {
  const login = String(email || '').trim().toLowerCase();
  if (!login) throw new Error('Falta email.');
  const newClients = getRows_(IBERFIT.SHEETS.CLIENTES);
  const legacyClients = getRowsIfSheetExists_('02_CLIENTES');
  const cNew = newClients.find(c => String(c.EMAIL || '').trim().toLowerCase() === login);
  const cLegacy = legacyClients.find(c => String(c.EMAIL || '').trim().toLowerCase() === login);
  const c = cNew || cLegacy;
  if (!c) throw new Error('Cliente no encontrado: ' + login);
  if (cNew) updateRowByNumber_(IBERFIT.SHEETS.CLIENTES, cNew.__rowNumber, { ESTADO: 'ACTIVO', FECHA_ACTUALIZACION: new Date() });
  if (cLegacy) updateRowByNumber_('02_CLIENTES', cLegacy.__rowNumber, { ESTADO: 'ACTIVO', FECHA_ACTUALIZACION: new Date() });

  const accessNew = getRows_(IBERFIT.SHEETS.ACCESOS).find(a => String(a.LOGIN || '').trim().toLowerCase() === login || String(a.CLIENTE_ID || '') === String(c.CLIENTE_ID || ''));
  const accessLegacy = getRowsIfSheetExists_('03_ACCESOS').find(a => String(a.LOGIN || '').trim().toLowerCase() === login || String(a.CLIENTE_ID || '') === String(c.CLIENTE_ID || ''));
  const source = accessNew || accessLegacy;
  if (!source) throw new Error('Acceso no encontrado para: ' + login);
  const updates = { ESTADO_ACCESO: 'ACTIVO', INTENTOS_FALLIDOS: 0, OBSERVACION: 'Reparado V9.6.2: acceso activo; diagnóstico pendiente no bloquea login.' };
  if (accessNew) updateRowByNumber_(IBERFIT.SHEETS.ACCESOS, accessNew.__rowNumber, updates);
  if (accessLegacy) updateRowByNumber_('03_ACCESOS', accessLegacy.__rowNumber, updates);
  return { ok: true, email: login, clientId: c.CLIENTE_ID || '', repairedNew: !!accessNew, repairedLegacy: !!accessLegacy };
}
