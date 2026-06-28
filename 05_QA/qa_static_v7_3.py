#!/usr/bin/env python3
from pathlib import Path
import json
import sys
import zipfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "03_CLOUDFLARE_APP"
APP_JS = APP / "src" / "app.js"
API_JS = APP / "src" / "api.js"
CONFIG_JS = APP / "src" / "config.js"
INDEX = APP / "index.html"
MANIFEST = APP / "manifest.webmanifest"
ROUTES = APP / "_routes.json"
CODIGO = ROOT / "02_APPS_SCRIPT_BACKEND" / "Codigo.gs"
SHEET_DIR = ROOT / "01_SHEET_OPERATIVO"

REQUIRED_HEADERS = {
    "02_CLIENTES": ["CLIENTE_ID","NOMBRE_VISIBLE","EMAIL","TELEFONO","MODALIDAD","OBJETIVO_PRINCIPAL","ESTADO","FECHA_ALTA","OBSERVACIONES"],
    "03_ACCESOS": ["ACCESO_ID","CLIENTE_ID","LOGIN","PASSWORD_HASH","SALT","ESTADO_ACCESO","FECHA_CREACION","ULTIMO_ACCESO","INTENTOS_FALLIDOS","OBSERVACION"],
    "04_PLANES": ["PLAN_ID","CLIENTE_ID","MODALIDAD","ESTADO","FECHA_INICIO","PROXIMA_ACCION","OBJETIVO_PLAN","NOTAS_COACH"],
    "05_SEMANAS": ["SEMANA_ID","CLIENTE_ID","SEMANA_NUMERO","TITULO_SEMANA","FOCO_SEMANA","MENSAJE_IBERFIT","ESTADO_SEMANA","FECHA_INICIO","FECHA_FIN"],
    "06_SESIONES": ["SESION_ID","SEMANA_ID","CLIENTE_ID","TITULO_SESION","TIPO_SESION","DURACION_ESTIMADA_MIN","ESTADO_SESION","OBJETIVO_SESION","CRITERIO_COACH","QUE_OBSERVAR","COMO_AJUSTAR","QUE_REPORTAR","ORDEN"],
    "07_FEEDBACK": ["FEEDBACK_ID","FECHA_ENVIO","CLIENTE_ID","SESION_ID","RPE","FATIGA","ENERGIA","MOLESTIA","COMENTARIO_CLIENTE","PRIORIDAD","DECISION_IBERFIT","REVISADO_POR","FECHA_REVISION"],
    "08_CHECKIN": ["CHECKIN_ID","FECHA_ENVIO","CLIENTE_ID","SEMANA_ID","DESCANSO","FATIGA_GENERAL","ESTRES","ENERGIA_GENERAL","MOLESTIA_GENERAL","PESO","OBSERVACION_CLIENTE","ESTADO_REVISION","DECISION_IBERFIT"],
    "09_IRI_EVALUACION": ["IRI_ID","FECHA_EVALUACION","CLIENTE_ID","IRI_TOTAL","CLASIFICACION","RECOMENDACION","CONTEXTO","COMPOSICION","MOVILIDAD","FUERZA","METABOLICO","LIMITADORES"],
    "99_LOG": ["LOG_ID","FECHA_HORA","ORIGEN","ACCION","USUARIO","CLIENTE_ID","ESTADO","DETALLE"],
}

failures = []
warnings = []

def fail(msg):
    failures.append(msg)

def warn(msg):
    warnings.append(msg)

def read(p):
    return p.read_text(encoding="utf-8") if p.exists() else ""

def all_text():
    chunks = []
    for p in ROOT.rglob("*"):
        if p.is_file() and p.suffix.lower() in [".html", ".css", ".js", ".json", ".gs", ".md", ".txt", ".toml", ".py"]:
            try:
                chunks.append(p.read_text(encoding="utf-8"))
            except UnicodeDecodeError:
                pass
    return "\n".join(chunks)

def get_xlsx_headers_row5(xlsx_path):
    ns = {
        "a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
        "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
        "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
    }
    with zipfile.ZipFile(xlsx_path) as z:
        shared = []
        if "xl/sharedStrings.xml" in z.namelist():
            sst = ET.fromstring(z.read("xl/sharedStrings.xml"))
            for si in sst.findall("a:si", ns):
                parts = [t.text or "" for t in si.findall(".//a:t", ns)]
                shared.append("".join(parts))

        wbxml = ET.fromstring(z.read("xl/workbook.xml"))
        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        relmap = {}
        for rel in rels:
            relmap[rel.attrib["Id"]] = rel.attrib["Target"]

        result = {}
        for sheet in wbxml.findall("a:sheets/a:sheet", ns):
            name = sheet.attrib["name"]
            rid = sheet.attrib["{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"]
            target = relmap[rid]
            if target.startswith("/"):
                path = target.lstrip("/")
            else:
                path = "xl/" + target
            xml = ET.fromstring(z.read(path))
            row = xml.find(".//a:row[@r='5']", ns)
            vals = []
            if row is not None:
                for c in row.findall("a:c", ns):
                    cell_type = c.attrib.get("t")
                    if cell_type == "inlineStr":
                        text = "".join(t.text or "" for t in c.findall(".//a:t", ns))
                        vals.append(text)
                    else:
                        v = c.find("a:v", ns)
                        if v is None:
                            vals.append("")
                        elif cell_type == "s":
                            vals.append(shared[int(v.text)])
                        else:
                            vals.append(v.text or "")
            result[name] = [str(v).strip() for v in vals if str(v).strip()]
        return result

txt = all_text()
app = read(APP_JS)
api = read(API_JS)
config = read(CONFIG_JS)
index = read(INDEX)
codigo = read(CODIGO)
mock = read(APP / "src" / "mock-data.js")

# Build forbidden tokens without embedding legacy runtime strings as visual examples.
fake_mark_1 = '<div class="brand-mark">' + 'I' + 'B' + '</div>'
fake_mark_2 = '<div class="brand-mark">' + 'I' + 'F' + '</div>'
legacy_wa_1 = 'Preparar ' + 'WhatsApp'
legacy_wa_2 = 'Preparar ' + 'mensaje'
old_symbols = [chr(0x2302), chr(0x25FB), chr(0x25C8), chr(0x2197), chr(0x25CE)]

for token in [fake_mark_1, fake_mark_2, legacy_wa_1, legacy_wa_2] + old_symbols:
    if token in txt:
        fail("Residuo prohibido encontrado.")

# Brand
if "/assets/iberfit-isotipo.png" not in index:
    fail("Index no referencia isotipo real.")
for asset in ["iberfit-isotipo.png", "icon-192.png", "icon-512.png"]:
    if not (APP / "assets" / asset).exists():
        fail("Falta asset requerido: " + asset)

# Mock lockdown
if "window.IBERFIT_API_MODE" in config:
    fail("Existe override global de mock.")
if 'params.get("mock") === "1"' not in config:
    fail("No existe mock explícito por query.")
if 'return "real"' not in config:
    fail("No existe fallback real por defecto.")

# Cloudflare
if not ROUTES.exists():
    fail("Falta _routes.json.")
else:
    try:
        routes = json.loads(read(ROUTES))
        if "/api/*" not in routes.get("include", []):
            fail("_routes.json no incluye /api/*.")
    except Exception as e:
        fail("_routes.json inválido: " + str(e))

# API/session
for token in ["readSession", "sessionToken"]:
    if token not in api:
        fail("API/session incompleta: " + token)
if "requireSession_" not in codigo:
    fail("Backend no exige sesión.")

# Feedback contract
for token in ["sessionId", "rpe", "fatiga", "energia", "molestia", "comment"]:
    if token not in app:
        fail("Feedback frontend incompleto: " + token)
for token in ["payload.sessionId", "payload.rpe", "payload.fatiga", "payload.energia", "payload.molestia", "payload.comment"]:
    if token not in codigo:
        fail("Feedback backend incompleto: " + token)

# Check-in contract
for token in ["ciDescanso", "ciFatiga", "ciEstres", "ciEnergia", "ciMolestia", "molestiaGeneral", "semanaId", "submitCheckin"]:
    if token not in app:
        fail("Check-in frontend incompleto: " + token)
if "state.data.week?.id" not in app and "state.data.home?.semanaId" not in app:
    fail("Check-in no toma semanaId desde datos cliente.")
for token in ["payload.descanso", "payload.fatigaGeneral", "payload.estres", "payload.energiaGeneral", "payload.molestiaGeneral", "payload.semanaId"]:
    if token not in codigo:
        fail("Check-in backend incompleto: " + token)
for token in ["String(w.SEMANA_ID) === semanaId", "String(w.CLIENTE_ID) === auth.clientId", "String(w.ESTADO_SEMANA) === 'PUBLICADA'"]:
    if token not in codigo:
        fail("Backend no valida semana activa publicada del cliente: " + token)
if "semanaId: semanaId" not in codigo or "id: semanaId" not in codigo:
    fail("buildClientData_ no expone semanaId al frontend.")
if "MOLESTIA_GENERAL" not in codigo:
    fail("Backend no escribe MOLESTIA_GENERAL.")

# Security
for token in ["requireWorkerSecret_", "adminSetupWorkerSecret", "PASSWORD_HASH", "SALT", "hashPassword_", "MAX_FAILED_ATTEMPTS"]:
    if token not in codigo:
        fail("Seguridad incompleta: " + token)
if "deleteProperty('IBERFIT_WORKER_SECRET')" not in codigo:
    fail("qaServerProbeWithSecret no restaura/elimina secret temporal.")
if "missingHeaders" not in codigo or "SHEET_HEADERS" not in codigo:
    fail("serverProbe_ no valida headers obligatorios.")

# Version
if "V7.3_INTERACTION_ROUTING_FINAL_CANDIDATE" not in config:
    fail("Config no está en V7.3.")
if "V6_7_RC_WEEK_CHECKIN_CONTRACT" not in codigo:
    fail("Backend V6.7 aprobado no está preservado.")

# XLSX materialized headers
xlsx_files = list(SHEET_DIR.glob("IBERFIT_OS_SHEET_V6_7_RC_PREMIUM.xlsx"))
if not xlsx_files:
    fail("Falta Excel V6.7.")
else:
    try:
        headers_by_sheet = get_xlsx_headers_row5(xlsx_files[0])
        for sheet_name, required in REQUIRED_HEADERS.items():
            actual = headers_by_sheet.get(sheet_name, [])
            missing = [h for h in required if h not in actual]
            if missing:
                fail("Excel sin headers reales fila 5 en " + sheet_name + ": " + ", ".join(missing))
    except Exception as e:
        fail("No se pudo validar XML del Excel: " + str(e))

# V7.3 modality mock routing
for token in ["mockDataPresencial", "mockDataHibrido", "mockDataOnline", "selectedMockData", 'params.get("perfil")']:
    if token not in api:
        fail("Mock multimodal incompleto: " + token)
for token in ["PRESENCIAL", "HIBRIDO", "ONLINE", "modalityBanner", "getModality"]:
    if token not in app:
        fail("UI multimodal incompleta: " + token)


# V7.3: session viewer must show real session blocks and clickable actionable sessions
for token in ["openSession", "currentSession", "sessionBlocks", "exerciseLine", "session-card-action", "Ver sesión"]:
    if token not in app:
        fail("V7.3 visor de sesión incompleto: " + token)
for token in ["blocks", "exercises", "Fuerza principal", "Zona 2"]:
    if token not in mock:
        fail("V7.3 mock no trae sesión real ejecutable: " + token)
if "Llega 10 minutos antes" in mock or "llega 10 minutos" in mock.lower():
    fail("V7.3 conserva instrucción innecesaria de llegar antes.")

# V7.3 interaction routing
for token in ["routePrimaryCta", "routeSessionNav", "window.iberfit_primary_cta", "window.iberfit_route_session_nav"]:
    if token not in app:
        fail("Routing interactivo V7.3 incompleto: " + token)
if 'b.dataset.screen === "session" ? routeSessionNav() : nav(b.dataset.screen)' not in app:
    fail("El botón Sesión de navegación no enruta según sesión ejecutable.")
if 'if (modality === "PRESENCIAL")' not in app or 'nav("week")' not in app:
    fail("CTA presencial debe ir a Semana, no a visor autónomo.")
if 'onclick="window.iberfit_primary_cta()"' not in app:
    fail("CTA principal no usa enrutamiento V7.3.")

# Manifest
try:
    manifest = json.loads(read(MANIFEST))
    icon_srcs = {i.get("src") for i in manifest.get("icons", [])}
    for src in ["/assets/icon-192.png", "/assets/icon-512.png"]:
        if src not in icon_srcs:
            fail("Manifest no referencia " + src)
except Exception as e:
    fail("Manifest inválido: " + str(e))

print(json.dumps({
    "ok": not failures,
    "failures": failures,
    "warnings": warnings,
    "checked": {
        "brand": True,
        "mock_lockdown": True,
        "cloudflare_routes": True,
        "feedback_contract": True,
        "checkin_contract": True,
        "security_contract": True,
        "version_alignment": True,
        "v7_3_modality_profiles": True,
        "v7_3_session_viewer": True,
        "v7_3_interaction_routing": True,
        "pwa_manifest": True,
        "xlsx_real_headers_row5": True,
        "server_probe_header_contract": True,
        "qa_secret_restore": True,
        "week_linked_checkin": True
    }
}, ensure_ascii=False, indent=2))

if failures:
    sys.exit(1)
