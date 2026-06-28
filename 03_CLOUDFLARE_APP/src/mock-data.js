/* IBERFIT V7.3 · Mock data con sesiones reales por modalidad */

const BASE_SESSION_LOWER = {
  id: "SES-0001",
  title: "Fuerza base · Tren inferior",
  type: "PRESENCIAL",
  duration: 55,
  state: "Publicada",
  objective: "Calidad técnica y tolerancia progresiva a carga.",
  observe: "Técnica en sentadilla y bisagra de cadera. Compensaciones lumbares. RPE post-set y sensación articular.",
  blocks: [
    {
      title: "Activación y preparación",
      focus: "Control articular y patrón de bisagra antes de cargar.",
      exercises: [
        { name: "Movilidad de cadera + tobillo", time: "6 min", note: "Rango cómodo, sin dolor." },
        { name: "Puente de glúteo", sets: "2 series", reps: "12 rep", rest: "45 s", note: "Pausa breve arriba." }
      ]
    },
    {
      title: "Fuerza principal",
      focus: "Calidad técnica antes que carga.",
      exercises: [
        { name: "Sentadilla goblet o trasera", sets: "4 series", reps: "6–8 rep", rest: "90 s", note: "RPE objetivo 7." },
        { name: "Peso muerto rumano", sets: "3 series", reps: "8 rep", rest: "90 s", note: "Control lumbar y recorrido estable." }
      ]
    },
    {
      title: "Complementario y cierre",
      focus: "Estabilidad y tolerancia al volumen.",
      exercises: [
        { name: "Step-up controlado", sets: "3 series", reps: "8/lado", rest: "60 s" },
        { name: "Plancha frontal", sets: "3 series", time: "30–40 s", rest: "45 s" }
      ]
    }
  ]
};

const BASE_SESSION_MOVILIDAD = {
  id: "SES-0002",
  title: "Movilidad + Zona 2",
  type: "AUTONOMA",
  duration: 40,
  state: "Publicada",
  objective: "Recuperación activa y base de capacidad aeróbica.",
  observe: "Frecuencia cardíaca zona 2 conversacional. Sensación de recuperación y ausencia de molestias.",
  blocks: [
    {
      title: "Movilidad inicial",
      focus: "Preparar cadera, columna torácica y tobillo.",
      exercises: [
        { name: "Respiración + movilidad torácica", time: "5 min", note: "Ritmo tranquilo." },
        { name: "World greatest stretch", sets: "2 vueltas", reps: "5/lado", rest: "30 s" }
      ]
    },
    {
      title: "Zona 2",
      focus: "Trabajo aeróbico conversacional, sin competir.",
      exercises: [
        { name: "Caminata inclinada / bici / elíptica", time: "22–28 min", note: "Puedes hablar frases completas." }
      ]
    },
    {
      title: "Cierre",
      focus: "Bajar pulsaciones y registrar sensación.",
      exercises: [
        { name: "Movilidad suave + respiración", time: "5 min", note: "Terminar con sensación recuperadora." }
      ]
    }
  ]
};

// ─── PERFIL PRESENCIAL ────────────────────────────
export const mockDataPresencial = {
  client: {
    id: "APPCLI-PRES",
    name: "Claudia Presencial",
    modality: "PRESENCIAL",
    objective: "Mejorar fuerza y composición corporal con seguimiento presencial semanal."
  },
  home: {
    week: "3",
    semanaId: "SEM-PRES-003",
    iri: 68,
    sessions: 1,
    rpe: 7.2,
    focus: "Dominio técnico de sentadilla trasera antes de progresar carga.",
    nextDecision: "Revisar grabación de técnica y ajustar posición de barra si RPE supera 8.",
    ctaLabel: "Ver próxima sesión presencial"
  },
  week: {
    id: "SEM-PRES-003",
    title: "Semana 3 · Consolidación técnica",
    message: "Esta semana consolidamos el patrón de sentadilla. La sesión presencial es el foco central.",
    modalityNote: "Sesión presencial guiada. La activación, técnica y carga se trabajan dentro de la sesión.",
    sessions: [
      { ...BASE_SESSION_LOWER, type: "PRESENCIAL", title: "Sesión presencial · Fuerza tren inferior" }
    ]
  },
  process: {
    interpretation: "Respuesta técnica mejorando. RPE estable. Preparado para progresión de carga en semana 4.",
    trendLabel: "RPE consistente entre 7.0 y 7.5. Sin señales de sobreentrenamiento.",
    trend: [6.5, 7.0, 7.2, 7.1, 7.2],
    metrics: [
      ["IRI", "68", "Evaluado"],
      ["Adherencia", "100%", "Semana"],
      ["RPE", "7.2", "Promedio"],
      ["Alertas", "0", "Activas"]
    ]
  },
  channel: {
    actions: [
      { title: "Consultar técnica", text: "Envía una duda técnica sobre la sesión para recibir orientación antes de la siguiente cita." },
      { title: "Reportar molestia", text: "Avisa si aparece una molestia para ajustar el plan antes de la sesión presencial." },
      { title: "Cambiar horario", text: "Comparte disponibilidad para coordinar la siguiente sesión presencial." }
    ]
  }
};

// ─── PERFIL HÍBRIDO ───────────────────────────────
export const mockDataHibrido = {
  client: {
    id: "APPCLI-0001",
    name: "Alejandro Híbrido",
    modality: "HIBRIDO",
    objective: "Mejorar fuerza, composición corporal y adherencia sostenible a largo plazo."
  },
  home: {
    week: "1",
    semanaId: "SEM-0001",
    iri: 62,
    sessions: 2,
    rpe: 7.0,
    focus: "Construir base técnica medible antes de progresar carga.",
    nextDecision: "Mantener foco técnico y revisar respuesta post-sesión antes de subir intensidad.",
    ctaLabel: "Ver mi semana híbrida"
  },
  week: {
    id: "SEM-0001",
    title: "Semana 1 · Base técnica",
    message: "Esta semana: 1 sesión presencial + 1 sesión online complementaria.",
    modalityNote: "Sesión presencial + trabajo autónomo disponible en la app.",
    sessions: [
      { ...BASE_SESSION_LOWER, type: "PRESENCIAL", title: "Sesión presencial · Fuerza tren inferior" },
      { ...BASE_SESSION_MOVILIDAD, type: "AUTONOMA", title: "Trabajo autónomo · Movilidad + Zona 2" }
    ]
  },
  process: {
    interpretation: "La respuesta inicial es estable. El plan puede continuar y progresar carga si la calidad técnica se conserva.",
    trendLabel: "RPE estable entre 6.8 y 7.3. Rango óptimo para semana de base.",
    trend: [6.8, 7.1, 7.0, 7.3, 7.0],
    metrics: [
      ["IRI", "62", "Base"],
      ["Adherencia", "Alta", "Semana"],
      ["RPE", "7.0", "Promedio"],
      ["Alertas", "0", "Activas"]
    ]
  },
  channel: {
    actions: [
      { title: "Consultar sesión", text: "Envía una duda con el contexto de la sesión para recibir orientación técnica específica." },
      { title: "Reportar molestia", text: "Avisa si aparece cualquier molestia para ajustar el plan antes de la siguiente sesión." },
      { title: "Enviar actualización", text: "Comparte información de contexto que pueda afectar la planificación." }
    ]
  }
};

// ─── PERFIL ONLINE ────────────────────────────────
export const mockDataOnline = {
  client: {
    id: "APPCLI-ONL",
    name: "Marcos Online",
    modality: "ONLINE",
    objective: "Entrenar con autonomía guiada, mejorar adherencia y rendimiento sin entrenamiento presencial."
  },
  home: {
    week: "2",
    semanaId: "SEM-ONL-002",
    iri: 55,
    sessions: 3,
    rpe: 6.8,
    focus: "Ejecutar las 3 sesiones online con técnica limpia y registrar todas.",
    nextDecision: "Si el RPE del día 2 supera 8, reducir volumen en día 3 a 3 series.",
    ctaLabel: "Ver entrenamiento de hoy"
  },
  week: {
    id: "SEM-ONL-002",
    title: "Semana 2 · Consolidación online",
    message: "Plan de 3 sesiones. Registra cada una para que IBERFIT pueda ajustar la semana siguiente.",
    modalityNote: "100% online esta semana. Feedback obligatorio después de cada sesión.",
    sessions: [
      { ...BASE_SESSION_LOWER, id: "SES-ONL-001", type: "ONLINE", title: "Día 1 · Fuerza tren inferior" },
      { ...BASE_SESSION_MOVILIDAD, id: "SES-ONL-002", type: "ONLINE", title: "Día 2 · Recuperación activa" },
      {
        id: "SES-ONL-003",
        title: "Día 3 · Fuerza tren superior",
        type: "ONLINE",
        duration: 50,
        state: "Publicada",
        objective: "Press horizontal y remo. Control técnico y progresión de peso.",
        observe: "Posición escapular, control lumbar en press y RPE por serie.",
        blocks: [
          {
            title: "Preparación escapular",
            focus: "Activar espalda alta y control del hombro.",
            exercises: [
              { name: "Band pull-aparts", sets: "2 series", reps: "15 rep", rest: "30 s" },
              { name: "Flexiones inclinadas suaves", sets: "2 series", reps: "8 rep", rest: "45 s" }
            ]
          },
          {
            title: "Fuerza principal",
            focus: "Empuje y tracción con control técnico.",
            exercises: [
              { name: "Press con mancuernas o barra", sets: "4 series", reps: "6–8 rep", rest: "90 s", note: "RPE objetivo 7." },
              { name: "Remo con mancuerna o polea", sets: "4 series", reps: "8–10 rep", rest: "75 s" }
            ]
          },
          {
            title: "Complementario",
            focus: "Volumen controlado sin perder técnica.",
            exercises: [
              { name: "Press hombro neutro", sets: "3 series", reps: "8 rep", rest: "60 s" },
              { name: "Face pull / pájaros", sets: "3 series", reps: "12 rep", rest: "45 s" }
            ]
          }
        ]
      }
    ]
  },
  process: {
    interpretation: "Adherencia perfecta semana 1. El plan puede progresar volumen en semana 3 si el feedback confirma buena recuperación.",
    trendLabel: "RPE bajo y estable. Buena señal de adaptación inicial. Espacio para progresar.",
    trend: [6.2, 6.5, 6.8, 6.6, 6.8],
    metrics: [
      ["IRI", "55", "Base"],
      ["Adherencia", "100%", "S1"],
      ["RPE", "6.8", "Promedio"],
      ["Alertas", "0", "Activas"]
    ]
  },
  channel: {
    actions: [
      { title: "Consultar ejercicio", text: "Envía una duda técnica sobre cualquier ejercicio del plan online." },
      { title: "Reportar molestia", text: "Avisa si aparece una molestia para ajustar el plan online antes de la siguiente sesión." },
      { title: "Actualizar disponibilidad", text: "Comparte cambios en tu horario o contexto que afecten la adherencia." }
    ]
  }
};

// Default export = híbrido (backward compat con api.js)
export const mockData = mockDataHibrido;
