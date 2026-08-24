import type { Module } from "./types";

const WEB_CLIENT_URL = "https://agentic-web-starter-client.web.app";
const REPO_URL = "https://github.com/vanessamarely/agentic-web-starter";

export const modules: Module[] = [
  {
    id: "bienvenida",
    title: "Bienvenida",
    steps: [
      {
        title: "Building Agentic Apps with Gemini Flash and Nano",
        durationMinutes: 3,
        blocks: [
          {
            type: "p",
            text: "Hoy vamos a integrar agentes autónomos y contextuales combinando la velocidad de Gemini Flash en la nube con la eficiencia de Gemini Nano en el navegador. Todo el código que vas a ver es real y funciona — no son slides con pseudocódigo, es un proyecto completo que puedes clonar hoy mismo.",
          },
          {
            type: "list",
            items: [
              "Demo 1 — Interactive Web Apps with Gemini Nano & WebMCP",
              "Demo 2 — Orchestrating Multi-Agent Workflows with Gemini Flash",
              "Demo 3 — Local Agents with Gemma, Gemini Nano & WebMCP",
            ],
          },
          {
            type: "callout",
            kind: "info",
            text: "El caso de uso: una plataforma de triage y respuesta a emergencias inspirada en la respuesta a terremotos en Colombia. Sirve como hilo conductor, pero los patrones que vas a ver aplican a cualquier dominio.",
          },
          {
            type: "p",
            text: "Prerrequisitos si quieres seguir el codelab en tu propia laptop:",
          },
          {
            type: "list",
            items: [
              "Node.js 20+ y pnpm",
              "Chrome Canary o Dev con las flags de Prompt API activas (o usa el \"modo demo\" incluido, que no las necesita)",
              "Una API key gratuita de Gemini desde Google AI Studio (aistudio.google.com/apikey)",
            ],
          },
          {
            type: "demo-link",
            label: "Ver el repositorio completo",
            url: REPO_URL,
          },
        ],
      },
    ],
  },
  {
    id: "ecosistema",
    title: "El ecosistema de IA de Google",
    steps: [
      {
        title: "No es solo un modelo — es un ecosistema",
        durationMinutes: 4,
        blocks: [
          {
            type: "p",
            text: "Cuando alguien dice \"voy a usar IA de Google\" casi siempre piensa solo en un modelo de chat. En realidad hay un espectro completo de dónde corre el modelo (nube ↔ dispositivo) y de qué tan abierto es (gestionado ↔ pesos abiertos que tú controlas).",
          },
          {
            type: "table",
            headers: ["Producto", "Dónde corre", "Cuándo usarlo"],
            rows: [
              [
                "Gemini API (Flash / Pro)",
                "Nube (Google AI Studio / Vertex AI)",
                "Lógica compleja, function calling robusto, multimodal, la mayoría de tus agentes",
              ],
              [
                "Gemini Nano",
                "On-device, dentro de Chrome — global LanguageModel (Prompt API)",
                "Latencia cero, funciona offline, gratis, privacidad — pero solo en Chrome y con capacidad limitada",
              ],
              [
                "Gemma",
                "Donde tú quieras: navegador (MediaPipe/WebGPU), servidor, móvil, Ollama",
                "Necesitas pesos abiertos, fine-tuning, control total del runtime, o correr fuera de Chrome",
              ],
              [
                "Vertex AI Model Garden",
                "Nube gestionada",
                "Catálogo de +200 modelos (Gemini, Gemma, Llama, Claude, etc.) con despliegue gestionado para producción",
              ],
            ],
          },
          {
            type: "p",
            text: "Además de los modelos, hay herramientas que aceleran cómo construyes con ellos:",
          },
          {
            type: "list",
            items: [
              "Google AI Studio — prototipa con prompts y obtén tu API key gratis en minutos.",
              "Genkit — framework open-source (JS/Go/Python) para construir flujos y agentes con trazabilidad y evaluación integradas.",
              "ADK (Agent Development Kit) — framework de Google para construir y orquestar sistemas multi-agente en producción. Los tres agentes de la Demo 2 están construidos con @google/adk de verdad, no a mano.",
              "Google AI Edge / MediaPipe — runtime para correr modelos (incluido Gemma) on-device en web, Android e iOS.",
              "Firebase AI Logic — llama a Gemini directo desde tu app cliente sin exponer tu API key.",
            ],
          },
          {
            type: "callout",
            kind: "success",
            text: "Regla práctica: empieza en AI Studio para prototipar, usa Gemini Flash en el backend para tus agentes, añade Gemini Nano o Gemma cuando la latencia, el costo o el offline-first importen, y gradúa a Vertex AI Model Garden cuando necesites escala de producción.",
          },
        ],
      },
    ],
  },
  {
    id: "demo-1-nano",
    title: "Demo 1 · Gemini Nano + WebMCP",
    steps: [
      {
        title: "El concepto: agentes contextuales en el borde",
        durationMinutes: 2,
        blocks: [
          {
            type: "p",
            text: "Gemini Nano vive dentro de Chrome y se expone vía la Prompt API — un global LanguageModel (no window.ai, ese namespace quedó atrás en los primeros origin trials). Está activada por defecto desde Chrome 148 en escritorio: LanguageModel.availability() te dice si el modelo está \"available\", \"downloadable\", \"downloading\" o \"unavailable\", y LanguageModel.create() abre una sesión. No hay llamada de red, no hay costo por token, y funciona sin conexión.",
          },
          {
            type: "p",
            text: "WebMCP (document.modelContext) es la propuesta real de Google y Microsoft — en revisión por el W3C Web Machine Learning Community Group — para exponer acciones de tu página (\"herramientas\") de forma estructurada, igual que MCP lo hace para apps de escritorio. En vez de que el modelo solo genere texto, genera intención de acción, y tu código ejecuta esa acción sobre el DOM real.",
          },
          {
            type: "callout",
            kind: "info",
            text: "Sin WebMCP, terminas copiando y pegando la salida del modelo a mano. Con WebMCP, la salida del modelo se convierte directamente en una actualización de UI.",
          },
          {
            type: "callout",
            kind: "warning",
            text: "WebMCP está en Origin Trial desde Chrome 149 (y Edge 150) — todavía no es estándar estable. Para probarlo localmente sin token: chrome://flags/#enable-webmcp-testing. El código de este repo funciona igual con o sin el flag activo, gracias a feature-detection.",
          },
        ],
      },
      {
        title: "El código",
        durationMinutes: 2,
        blocks: [
          {
            type: "p",
            text: "El wrapper on-device hace el chequeo de disponibilidad y, si Gemini Nano no está listo, cae a un árbol de decisión determinístico (protocolo START) — la demo nunca se rompe:",
          },
          {
            type: "code",
            filename: "apps/web-client/src/ai/nano/builtInAI.ts",
            code: `export async function suggestTriagePriority(
  vitals: Vitals,
  session: TriageAISession | null,
): Promise<TriageSuggestion> {
  if (!session) return suggestTriagePriorityHeuristic(vitals);
  try {
    const raw = await session.prompt(vitalsToPromptLine(vitals));
    const parsed = parseModelJson(raw);
    if (!parsed) return suggestTriagePriorityHeuristic(vitals);
    return { ...parsed, source: session.simulated ? "on-device-ai-simulated" : "on-device-ai" };
  } catch {
    return suggestTriagePriorityHeuristic(vitals);
  }
}`,
          },
          {
            type: "p",
            text: "Cada herramienta es una función normal con un manifiesto declarativo — la misma forma que usaremos para Gemini Flash en la Demo 2:",
          },
          {
            type: "code",
            filename: "apps/web-client/src/mcp/webMcpTools.ts",
            code: `export const extractVitalsTool: MCPToolDefinition<{ rawText: string }, Partial<Vitals>> = {
  name: "extractVitals",
  description: "Parses free-text field notes into structured patient vitals fields.",
  parameters: {
    type: "object",
    properties: { rawText: { type: "string", description: "..." } },
    required: ["rawText"],
  },
  handler: ({ rawText }) => extractVitalsFromText(rawText),
};`,
          },
          {
            type: "p",
            text: "Y cuando el navegador sí implementa la API real, publicamos ese mismo catálogo con document.modelContext.registerTool() — la app funciona igual con o sin el flag, porque solo lo hace si la API existe:",
          },
          {
            type: "code",
            filename: "apps/web-client/src/mcp/webMcpTools.ts",
            code: `export function registerWebMcpTools(): void {
  const modelContext = document.modelContext;
  if (!modelContext) return; // navegador sin WebMCP: seguimos usando los tools localmente

  for (const tool of webMcpTools) {
    void modelContext.registerTool({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.parameters,
      execute: (input) => Promise.resolve(tool.handler(input)),
      annotations: { readOnlyHint: tool.name === "extractVitals" },
    });
  }
}`,
          },
        ],
      },
      {
        title: "Pruébalo en vivo",
        durationMinutes: 2,
        blocks: [
          {
            type: "list",
            items: [
              "Abre la demo y activa \"Modo demo (simular Gemini Nano)\" si tu Chrome no tiene la Prompt API habilitada.",
              "Escribe en \"Notas de campo\": RR 34, HR 128, cap refill 3s, unresponsive, not ambulatory",
              "Observa cómo la prioridad cambia a IMMEDIATE en tiempo real, sin botones — y mira la consola WebMCP debajo para ver extractVitals y updateTriageBadge disparándose.",
              "Prueba también \"🎙️ Dictar nota de voz\": graba las mismas notas habladas — Gemini Flash las transcribe en la nube (audio nativo, sin modelo de voz-a-texto aparte) y el texto entra al mismo pipeline de extracción.",
            ],
          },
          {
            type: "demo-link",
            label: "Abrir Demo 1 en vivo",
            url: `${WEB_CLIENT_URL}/#nano`,
            note: "Demo pública en Firebase Hosting — no necesitas correr nada localmente.",
          },
        ],
      },
    ],
  },
  {
    id: "demo-2-flash",
    title: "Demo 2 · Gemini Flash multi-agente",
    steps: [
      {
        title: "El concepto: function calling multi-agente",
        durationMinutes: 2,
        blocks: [
          {
            type: "p",
            text: "Gemini Flash es rápido y barato — perfecto para orquestar muchas llamadas de function calling en paralelo. En vez de un único prompt gigante, dividimos el problema en agentes especializados, cada uno con su propio set de herramientas. Este proyecto usa gemini-3.7-flash, el modelo Flash recomendado actualmente (gemini-2.5-flash sigue funcionando, pero 3.7 es la versión vigente).",
          },
          {
            type: "p",
            text: "En este proyecto: un Triage Validator (valida la prioridad clínica), un Hospital Router (encuentra el mejor hospital con capacidad) y un Supply Chain Agent (asigna insumos médicos) — los tres corren en paralelo y comparten el mismo patrón de tool-calling.",
          },
          {
            type: "p",
            text: "Los tres están construidos con el Agent Development Kit de Google (@google/adk) — no es un framework solo de Python: tiene SDK oficial de TypeScript, así que corre directo en este mismo backend Node/Express. ADK maneja el loop de tool-calling por ti (pedir al modelo, ejecutar la herramienta, reenviar el resultado, repetir) — tú solo defines el agente y sus herramientas.",
          },
        ],
      },
      {
        title: "El código",
        durationMinutes: 2,
        blocks: [
          {
            type: "p",
            text: "Cada agente es un LlmAgent de ADK con su instrucción y sus herramientas — las mismas herramientas MCP que ya viste, adaptadas a FunctionTool de ADK:",
          },
          {
            type: "code",
            filename: "apps/agent-orchestrator/src/agents/triageValidator.ts",
            code: `const triageValidatorAgent = createAdkAgent({
  name: "triage_validator",
  description: "Cross-checks a reported START priority against raw vitals.",
  instruction: SYSTEM_INSTRUCTION,
  tools: triageValidatorTools, // [validateClinicalUrgencyTool]
});

const result = await runAdkAgentTurn(triageValidatorAgent, userPrompt);`,
          },
          {
            type: "p",
            text: "ADK ejecuta las herramientas internamente — tú solo recorres el stream de eventos que va generando para armar el trace que ves en la consola de la demo:",
          },
          {
            type: "code",
            filename: "apps/agent-orchestrator/src/agents/adkRuntime.ts",
            code: `const runner = new InMemoryRunner({ agent });

for await (const event of runner.runEphemeral({
  userId: "agentic-web-starter",
  newMessage: { role: "user", parts: [{ text: userPrompt }] },
})) {
  for (const call of getFunctionCalls(event)) { /* ...guarda name + args */ }
  for (const response of getFunctionResponses(event)) { /* ...empareja por id, guarda result */ }
  if (isFinalResponse(event)) finalText = stringifyContent(event);
}`,
          },
        ],
      },
      {
        title: "Pruébalo en vivo",
        durationMinutes: 2,
        blocks: [
          {
            type: "callout",
            kind: "warning",
            text: "Esta demo necesita el backend corriendo con una GEMINI_API_KEY real en apps/agent-orchestrator/.env — sin eso verás un error claro, no una pantalla en blanco.",
          },
          {
            type: "list",
            items: [
              "Deja los valores por defecto (paciente IMMEDIATE en la región Eje Cafetero) o ajústalos.",
              "Presiona \"Ejecutar orquestación multi-agente\".",
              "Observa las 3 tarjetas de agentes aparecer en secuencia, cada una con su propio trace de llamadas a herramientas MCP.",
              "Truco para la audiencia: cambia la región a \"Tolima\" (el hospital ahí está fuera de servicio) y muestra cómo el Hospital Router maneja el caso sin capacidad disponible.",
            ],
          },
          {
            type: "demo-link",
            label: "Abrir Demo 2 en vivo",
            url: `${WEB_CLIENT_URL}/#flash`,
            note: "Backend real corriendo en Cloud Run — el rewrite de Firebase Hosting lo conecta sin CORS.",
          },
        ],
      },
    ],
  },
  {
    id: "demo-3-gemma",
    title: "Demo 3 · Gemma local + WebMCP",
    steps: [
      {
        title: "El concepto: modelos abiertos, 100% locales",
        durationMinutes: 2,
        blocks: [
          {
            type: "p",
            text: "Gemini Nano es cómodo porque ya viene en Chrome, pero es una caja cerrada: no puedes ajustarlo ni correrlo fuera del navegador. Gemma es la alternativa de pesos abiertos — el mismo modelo puede correr en tu servidor, en un móvil, o en el navegador vía Google AI Edge / MediaPipe.",
          },
          {
            type: "p",
            text: "Lección de arquitectura clave: un modelo local pequeño no es tan capaz como Gemini Flash en la nube. El patrón correcto no es pedirle que haga todo — es usar herramientas determinísticas para la parte crítica (extraer vitales, calcular prioridad) y reservar al LLM solo para lo que un LLM hace mejor: generar lenguaje natural.",
          },
        ],
      },
      {
        title: "Cómo conseguir un modelo Gemma para el navegador",
        durationMinutes: 2,
        blocks: [
          {
            type: "list",
            items: [
              "Ve a Kaggle Models (o la página de Google AI Edge) y busca \"Gemma\".",
              "Acepta la licencia de uso de Gemma (requerida una sola vez).",
              "Descarga la variante ya convertida para LLM Inference API (formato .task o .litertlm, ej. Gemma 3 1B int4 — pesa unos cientos de MB).",
              "Guarda el archivo en apps/web-client/public/models/gemma.task (esa carpeta está en .gitignore, nunca subas el modelo al repo).",
            ],
          },
          {
            type: "callout",
            kind: "warning",
            text: "El modelo pesa varios cientos de MB y requiere aceptar una licencia manualmente — no se puede automatizar. Descárgalo ANTES del evento si quieres mostrar inferencia real; el \"modo seguro\" incluido no depende de esto.",
          },
        ],
      },
      {
        title: "El código",
        durationMinutes: 2,
        blocks: [
          {
            type: "p",
            text: "La inicialización real usa el mismo paquete que usarías en cualquier proyecto web:",
          },
          {
            type: "code",
            filename: "apps/web-client/src/ai/gemma/mediapipeGemma.ts",
            code: `const genai = await FilesetResolver.forGenAiTasks(WASM_BASE);
const llmInference = await LlmInference.createFromOptions(genai, {
  baseOptions: { modelAssetPath: MODEL_ASSET_PATH },
  maxTokens: 512,
  topK: 40,
  temperature: 0.4,
});

engine.generate = (prompt) => llmInference.generateResponse(prompt);`,
          },
          {
            type: "p",
            text: "Y el agente combina ambos mundos: herramientas MCP para la decisión, Gemma solo para el reporte:",
          },
          {
            type: "code",
            filename: "apps/web-client/src/components/LocalGemmaAgentPanel.tsx",
            code: `const extracted = extractVitalsTool.handler({ rawText: rawFieldNotes });
const suggestion = suggestTriagePriorityHeuristic({ ...DEFAULT_VITALS, ...extracted });
updateTriageBadgeTool.handler({ elementId: BADGE_ELEMENT_ID, priority: suggestion.priority });

// Gemma solo redacta el reporte de traspaso en lenguaje natural:
const text = await engine.generate(
  \`Redacta un reporte breve para \${patientLabel}, prioridad \${suggestion.priority}...\`
);`,
          },
        ],
      },
      {
        title: "Pruébalo en vivo",
        durationMinutes: 2,
        blocks: [
          {
            type: "list",
            items: [
              "Con \"Modo seguro\" activo (por defecto), el agente funciona sin descargar nada — perfecto para el escenario.",
              "Si descargaste el modelo real antes del evento, desactiva el modo seguro y presiona \"Cargar Gemma real\" para mostrar inferencia genuina en el navegador.",
              "Escribe unas notas de campo y presiona \"Ejecutar agente local\" — mira cómo extractVitals y updateTriageBadge corren igual en ambos modos; solo cambia quién redacta el reporte final.",
            ],
          },
          {
            type: "demo-link",
            label: "Abrir Demo 3 en vivo",
            url: `${WEB_CLIENT_URL}/#gemma`,
          },
        ],
      },
    ],
  },
  {
    id: "cierre",
    title: "Cierre y recursos",
    steps: [
      {
        title: "Dónde desplegar esto",
        durationMinutes: 1,
        blocks: [
          {
            type: "p",
            text: "Técnicamente nada de esto necesita correr en infraestructura de Google — pero si quieres que la demo pública demuestre el ecosistema completo (y no solo la API de Gemini), tiene sentido desplegarla 100% en productos de Google. Esta charla usa exactamente esto, en vivo:",
          },
          {
            type: "table",
            headers: ["Pieza", "Servicio de Google", "Para qué"],
            rows: [
              ["web-client y codelab", "Firebase Hosting", "Build estático de Vite, CDN global, URL *.web.app gratis por sitio"],
              ["agent-orchestrator", "Cloud Run", "Contenedor del Dockerfile, escala a cero entre demos"],
              ["GEMINI_API_KEY", "Secret Manager", "La key nunca queda en texto plano en el contenedor ni en el repo"],
              ["/api/** → backend", "Rewrite de Firebase Hosting", "Un solo dominio para todo, sin configurar CORS"],
            ],
          },
          {
            type: "links",
            items: [
              {
                label: "Demo en vivo (web-client)",
                url: "https://agentic-web-starter-client.web.app",
                description: "Ya está desplegada — las 3 demos, en producción, sobre Firebase Hosting + Cloud Run.",
              },
              {
                label: "Este codelab, publicado",
                url: "https://agentic-web-starter-codelab.web.app",
                description: "También en Firebase Hosting, por si quieres compartir el link directo.",
              },
            ],
          },
        ],
      },
      {
        title: "Cómo blindamos el costo en producción",
        durationMinutes: 1,
        blocks: [
          {
            type: "p",
            text: "\"Voy a desplegar esto para que todos lo vean\" y \"me da miedo que me llegue una cuenta gigante\" no tienen por qué estar peleados. Esta demo tiene tres capas de protección, de la más simple a la más agresiva:",
          },
          {
            type: "list",
            items: [
              "min-instances=0 y max-instances=2 en Cloud Run: acota matemáticamente el peor caso a un puñado de centavos, incluso ante tráfico inesperado.",
              "Una alerta de presupuesto de Cloud Billing en $1: notifica por correo al 50% y al 100% — visibilidad temprana, no sorpresas.",
              "Un corte automático real: el presupuesto publica en Pub/Sub, y una Cloud Function desconecta la facturación de este proyecto específico si el gasto llega a $1.",
            ],
          },
          {
            type: "code",
            filename: "ops/billing-cutoff/index.js",
            code: `const PROJECT_ID = "agentic-web-starter"; // nunca la cuenta completa

exports.disableBillingOnBudgetExceeded = async (cloudEvent) => {
  const notification = JSON.parse(
    Buffer.from(cloudEvent.data.message.data, "base64").toString("utf-8"),
  );

  if (notification.costAmount < notification.budgetAmount) return;

  const billing = google.cloudbilling({ version: "v1", auth });
  await billing.projects.updateBillingInfo({
    name: \`projects/\${PROJECT_ID}\`,
    requestBody: { billingAccountName: "" }, // desvincula SOLO este proyecto
  });
};`,
          },
          {
            type: "callout",
            kind: "warning",
            text: "El patrón que documenta Google por defecto desactiva la facturación de TODA la cuenta — apagaría cualquier otro proyecto que la comparta (por ejemplo, tus propias API keys de AI Studio, que Google crea como proyectos \"gen-lang-client-...\" en esa misma cuenta). La versión de arriba usa el rol acotado \"Project Billing Manager\" para afectar solo este proyecto. Si vas a copiar este patrón, revisa qué más comparte tu cuenta de facturación antes de automatizar el corte.",
          },
        ],
      },
      {
        title: "Lo que te llevas hoy",
        durationMinutes: 2,
        blocks: [
          {
            type: "list",
            items: [
              "El mismo patrón de \"herramientas + modelo\" funciona igual en el navegador (WebMCP) y en el backend (function calling de Gemini) — aprende el patrón una vez, aplícalo en ambos lados.",
              "Elige dónde corre tu modelo según latencia, costo, privacidad y capacidad requerida — no hay una respuesta única: Nano, Gemma y Flash son complementarios, no competidores.",
              "Diseña para el fallo: heurísticos determinísticos y modos seguros hacen que tu demo (y tu producto) nunca dependan 100% de que la IA responda bien en el momento exacto.",
            ],
          },
          {
            type: "links",
            items: [
              {
                label: "Google AI Studio",
                url: "https://aistudio.google.com",
                description: "Prototipa con Gemini y obtén tu API key gratis.",
              },
              {
                label: "ai.google.dev",
                url: "https://ai.google.dev",
                description: "Documentación de la Gemini API, Gemma y las Prompt/Summarizer APIs de Chrome.",
              },
              {
                label: "Vertex AI Model Garden",
                url: "https://cloud.google.com/model-garden",
                description: "Catálogo de modelos gestionados para llevar tus agentes a producción.",
              },
              {
                label: "Kaggle Models — Gemma",
                url: "https://www.kaggle.com/models/google/gemma",
                description: "Descarga pesos de Gemma listos para MediaPipe / Google AI Edge.",
              },
              {
                label: "Google AI Edge (MediaPipe)",
                url: "https://ai.google.dev/edge/mediapipe",
                description: "Runtime on-device para web, Android e iOS.",
              },
              {
                label: "Repositorio de este proyecto",
                url: REPO_URL,
                description: "Todo el código de esta charla — clónalo y cambia el dominio por el tuyo.",
              },
            ],
          },
          {
            type: "callout",
            kind: "success",
            text: "Si eres estudiante o estás armando tu startup: el 80% de este repo es genérico (patrón de tool-calling, WebMCP, fallbacks). Cambia \"triage médico\" por tu propio dominio y ya tienes el esqueleto de tu próxima app agéntica.",
          },
        ],
      },
    ],
  },
];
