import type { Module } from "./types";

const WEB_CLIENT_URL = "https://agentic-web-starter-client.web.app";

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
            text: "Hoy vamos a integrar agentes autónomos y contextuales combinando la velocidad de Gemini Flash en la nube con la eficiencia de Gemini Nano en el navegador. Todo el código que vas a ver es real y funciona — no son slides con pseudocódigo, es un proyecto completo que vas a ver funcionando demo tras demo.",
          },
          {
            type: "list",
            items: [
              "Demo 1 — Interactive Web Apps with Gemini Nano & WebMCP",
              "Demo 2 — Orchestrating Multi-Agent Workflows with Gemini Flash",
              "Demo 3 — Local Agents with Gemma, Gemini Nano & WebMCP",
              "Demo 4 (bonus) — Google AI Studio vs. Gemini Enterprise Agent Platform",
              "Demo 5 (extra) — Planificador de viajes multi-agente con ADK",
              "Demo 6 (extra) — Panel de contexto médico con WebMCP",
            ],
          },
          {
            type: "callout",
            kind: "info",
            text: "El caso de uso: una plataforma de triage y respuesta a emergencias inspirada en la respuesta a terremotos en Colombia. Sirve como hilo conductor, pero los patrones que vas a ver aplican a cualquier dominio.",
          },
          {
            type: "callout",
            kind: "warning",
            text: "Si en tu evento solo tienes créditos de Google Cloud (no de Google AI Studio): las Demos 1, 2 y 5 tienen un selector \"Google AI Studio / Agent Platform\" junto al botón de ejecutar — cámbialo a Agent Platform y todo corre igual, pero autenticado con las credenciales de tu proyecto de GCP en vez de una API key.",
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
            type: "callout",
            kind: "success",
            text: "¿Prefieres ver la charla completa en formato de diapositivas antes de entrar al paso a paso? Ábrela en otra pestaña y vuelve aquí cuando quieras — el codelab sigue exactamente en este punto.",
          },
          {
            type: "demo-link",
            label: "Opción A · Ver el slide deck de la charla",
            url: "./slides.html",
            note: "Se abre en una pestaña nueva. Úsalo con las flechas ← → o deslizando en móvil.",
          },
          {
            type: "p",
            text: "Opción B: continúa leyendo — el resto de este codelab es el mismo contenido en formato paso a paso, con el código real y links a las demos en vivo.",
          },
        ],
      },
    ],
  },
  {
    id: "requisitos",
    title: "Antes de empezar: consigue acceso a Gemini",
    steps: [
      {
        title: "¿Cuál camino elijo?",
        durationMinutes: 2,
        blocks: [
          {
            type: "p",
            text: "Todas las demos de esta charla pueden correr de dos formas: con una API key de Google AI Studio, o con la Gemini Enterprise Agent Platform (Google Cloud). Ambas llaman al mismo modelo — la diferencia es solo cómo te autenticas. No necesitas los dos: elige el que aplique a tu situación.",
          },
          {
            type: "table",
            headers: ["", "Google AI Studio", "Gemini Enterprise Agent Platform"],
            rows: [
              ["¿Qué necesitas?", "Una cuenta de Google", "Un proyecto de Google Cloud con facturación"],
              ["¿Pide tarjeta de crédito?", "No, para el nivel gratuito", "Sí, para habilitar la facturación del proyecto (aunque uses créditos gratis)"],
              ["¿Cuánto tarda?", "Unos 5 minutos", "20–30 minutos la primera vez"],
              ["Úsalo si...", "Quieres probar rápido, o vas a usar tu propia cuenta/créditos", "Prefieres autenticación sin API key, o vas a llevar esto a producción"],
            ],
          },
          {
            type: "callout",
            kind: "info",
            text: "Si no sabes cuál elegir: empieza por el Camino A (Google AI Studio). Es más simple, y puedes cambiar al Camino B más adelante sin tocar el código — solo cambias el selector \"Google AI Studio / Agent Platform\" que ya trae la app.",
          },
        ],
      },
      {
        title: "Camino A · Google AI Studio, paso a paso",
        durationMinutes: 5,
        blocks: [
          {
            type: "p",
            text: "Pensado para alguien que nunca ha usado ninguna herramienta de Google Cloud ni de IA generativa.",
          },
          {
            type: "list",
            items: [
              "1. Si no tienes una cuenta de Google, créala en accounts.google.com/signup (es gratis y toma 2 minutos).",
              "2. Entra a aistudio.google.com con esa cuenta y acepta los términos de servicio si te los pide.",
              "3. En el menú lateral, haz clic en \"Get API key\" (Obtener clave de API).",
              "4. Haz clic en \"Create API key\" (Crear clave de API). AI Studio crea automáticamente un proyecto de Google Cloud detrás de escena para asociarla — no tienes que configurar nada de Cloud tú mismo.",
              "5. Copia la clave que aparece (empieza con \"AIza...\"). Guárdala en un lugar seguro: no la compartas ni la subas a un repositorio público.",
              "6. En este proyecto, copia apps/agent-orchestrator/.env.example a apps/agent-orchestrator/.env y pega tu clave en GEMINI_API_KEY=.",
              "7. (Opcional) La Gemini API tiene un nivel gratuito con límite de solicitudes por minuto. Si lo superas, en AI Studio → \"Plan and billing\" puedes vincular una cuenta de facturación de Google Cloud para pasar al nivel de pago (pagas solo por lo que uses, sin costo fijo).",
            ],
          },
          {
            type: "callout",
            kind: "success",
            text: "Con esto ya puedes correr todas las demos en modo \"Google AI Studio\" — que es el modo por defecto de esta app.",
          },
        ],
      },
      {
        title: "Camino B · Gemini Enterprise Agent Platform, paso a paso",
        durationMinutes: 8,
        blocks: [
          {
            type: "p",
            text: "Sigue esta ruta si prefieres el patrón de autenticación que usan las demos 4, 5 y 2 en modo \"Agent Platform\", o si vas a llevar esto a producción. Al final hay dos formas de autenticarte — elige la que prefieras.",
          },
          {
            type: "list",
            items: [
              "1. Entra a console.cloud.google.com con tu cuenta de Google. Si es la primera vez, acepta los términos de Google Cloud.",
              "2. Si te dieron un código de créditos, canjéalo ANTES de crear el proyecto en console.cloud.google.com/billing/redeem — así el proyecto nuevo queda ligado automáticamente a esos créditos.",
              "3. Crea un proyecto nuevo: arriba a la izquierda, haz clic en el selector de proyecto → \"Proyecto nuevo\" → dale un nombre (ej. mi-charla-gemini) → \"Crear\". Anota el ID del proyecto que se genera, lo necesitarás varias veces.",
              "4. Habilita la facturación del proyecto: menú ☰ → \"Facturación\" → vincula la cuenta de facturación con tus créditos (o crea una con tarjeta, si vas a pagar tú — dentro del nivel gratuito o de los créditos no se cobra nada).",
              "5. Habilita la API: en el buscador de la consola escribe \"Agent Platform API\" y haz clic en \"Habilitar\".",
              "6. En apps/agent-orchestrator/.env agrega (ya están comentadas en .env.example como referencia — solo descoméntalas y pon tu proyecto): GOOGLE_CLOUD_PROJECT=tu-proyecto-id y GOOGLE_CLOUD_LOCATION=global.",
            ],
          },
          {
            type: "callout",
            kind: "info",
            text: "Con esos 6 pasos, tu proyecto ya está listo. Ahora falta autenticar tus llamadas — elige UNA de las siguientes dos opciones, no ambas.",
          },
          {
            type: "p",
            text: "Opción 1 · API key (no necesitas instalar nada más)",
          },
          {
            type: "list",
            items: [
              "a. En la consola, ve a \"APIs y servicios\" → \"Credenciales\" → \"Crear credenciales\" → \"Clave de API\".",
              "b. (Recomendado) Restringe la key: en \"Restricciones de la API\", elige \"Restringir clave\" y selecciona \"Agent Platform API\" — así esa key solo sirve para esto.",
              "c. Copia la key generada y agrégala a apps/agent-orchestrator/.env como AGENT_PLATFORM_API_KEY=tu-key (ya está comentada en .env.example).",
            ],
          },
          {
            type: "callout",
            kind: "warning",
            text: "Esta key es distinta de tu GEMINI_API_KEY de Google AI Studio y no sirve en su lugar — está restringida a la Agent Platform API, así que una llamada en modo \"Google AI Studio\" con ella falla con PERMISSION_DENIED. Cada una vive en su propia variable de entorno y las usa un código distinto: nunca se mezclan.",
          },
          {
            type: "p",
            text: "Opción 2 · gcloud + credenciales de aplicación (sin ninguna key)",
          },
          {
            type: "list",
            items: [
              "a. Instala Google Cloud CLI (gcloud) en tu computador siguiendo cloud.google.com/sdk/docs/install — hay instalador para Mac, Windows y Linux.",
              "b. En una terminal, ejecuta: gcloud auth login (inicia sesión con tu cuenta de Google) y luego gcloud config set project TU_PROYECTO_ID.",
              "c. Genera credenciales de aplicación (ADC): gcloud auth application-default login.",
              "d. Dale a tu cuenta el rol necesario: en la consola, ve a \"IAM y administración\" → \"Conceder acceso\" → tu correo → rol \"Agent Platform User\" (roles/aiplatform.user).",
            ],
          },
          {
            type: "callout",
            kind: "warning",
            text: "Si vas a desplegar el backend en Cloud Run (como esta demo), no necesitas hacer la Opción 2 en tu máquina — Cloud Run se autentica con la identidad de su propia cuenta de servicio. Solo asegúrate de darle a esa cuenta de servicio el mismo rol \"Agent Platform User\", como se explica en DEPLOYMENT.md.",
          },
          {
            type: "p",
            text: "No confíes a ciegas en que estos pasos quedaron bien hechos — verifícalo tú mismo:",
          },
          {
            type: "code",
            filename: "Verificación — corre esto en tu terminal",
            code: `# Si elegiste la Opción 1 (API key):
grep AGENT_PLATFORM_API_KEY apps/agent-orchestrator/.env
# Debe mostrar tu key, no la línea comentada de .env.example

# Si elegiste la Opción 2 (gcloud + ADC):

# 1. ¿Tu CLI está logueada?
gcloud auth list
# Debe mostrar tu correo con un * al lado (cuenta activa)

# 2. ¿Existen credenciales de aplicación (ADC)?
ls ~/.config/gcloud/application_default_credentials.json
# Si dice "No such file or directory", falta el paso c (gcloud auth application-default login)

# 3. ¿Tu cuenta tiene el rol correcto en el proyecto?
gcloud projects get-iam-policy TU_PROYECTO_ID \\
  --flatten="bindings[].members" \\
  --filter="bindings.members:tu-correo@gmail.com" \\
  --format="table(bindings.role)"
# Debe listar roles/aiplatform.user (o roles/owner, que ya lo incluye)`,
          },
          {
            type: "callout",
            kind: "success",
            text: "Con cualquiera de las dos opciones lista, ya puedes cambiar el selector de cualquier demo a \"Agent Platform\" y correrá autenticándose con tu proyecto de Google Cloud.",
          },
        ],
      },
      {
        title: "Protege tu cuenta de un gasto sorpresa",
        durationMinutes: 2,
        blocks: [
          {
            type: "p",
            text: "Sin importar el camino que elijas, es buena práctica poner una red de seguridad antes de experimentar con una API de pago.",
          },
          {
            type: "list",
            items: [
              "En Google Cloud Console → \"Facturación\" → \"Presupuestos y alertas\", crea un presupuesto pequeño (ej. $1 o $5) con alertas por correo al 50% y al 100%.",
              "Esto no detiene el gasto por sí solo — solo te avisa. Más adelante, en la sección \"Cómo blindamos el costo en producción\" de este codelab, verás cómo convertir esa alerta en un corte automático real.",
            ],
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
                "Nube (Google AI Studio)",
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
                "Model Garden (Gemini Enterprise Agent Platform)",
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
            text: "Regla práctica: empieza en AI Studio para prototipar, usa Gemini Flash en el backend para tus agentes, añade Gemini Nano o Gemma cuando la latencia, el costo o el offline-first importen, y gradúa a Model Garden en la Gemini Enterprise Agent Platform cuando necesites escala de producción.",
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
            text: "Gemini Nano vive dentro de Chrome y se expone vía la Prompt API — un global LanguageModel, activado por defecto desde Chrome 148 en escritorio. LanguageModel.availability() te dice si el modelo está \"available\", \"downloadable\", \"downloading\" o \"unavailable\", y LanguageModel.create() abre una sesión. No hay llamada de red, no hay costo por token, y funciona sin conexión.",
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
              "Junto al botón de dictado hay un selector Google AI Studio / Agent Platform: la transcripción corre exactamente igual por cualquiera de los dos, solo cambia cómo se autentica la llamada.",
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
            text: "Gemini Flash es rápido y barato — perfecto para orquestar muchas llamadas de function calling en paralelo. En vez de un único prompt gigante, dividimos el problema en agentes especializados, cada uno con su propio set de herramientas. Este proyecto usa gemini-3.7-flash.",
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
              "El selector Google AI Studio / Agent Platform sobre el botón de ejecutar cambia cómo se autentican los 3 agentes ADK — mismo código, mismo modelo, credenciales distintas. Útil si tu evento solo da créditos de GCP.",
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
              "Ve a la ficha de Gemma-3n E2B (más liviano) o E4B (más capaz) en Hugging Face y acepta la licencia de Gemma (requerida una sola vez).",
              "Descarga el archivo que tenga \"-Web\" en el nombre (ej. gemma-3n-E2B-it-int4-Web.litertlm) — según la propia guía de MediaPipe LLM Inference para Web de Google, solo esos vienen convertidos para navegador; otras variantes (incluyendo los listados planos de TFLite en Kaggle) no funcionan aquí.",
              "Guarda el archivo como apps/web-client/public/models/gemma.task — la extensión no importa, MediaPipe lee el contenido (esa carpeta está en .gitignore, nunca subas el modelo al repo).",
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
    id: "demo-4-agent-platform",
    title: "Demo 4 (bonus) · AI Studio vs. Agent Platform",
    steps: [
      {
        title: "El concepto: dos formas de llamar al mismo modelo",
        durationMinutes: 2,
        blocks: [
          {
            type: "p",
            text: "Todas las demos anteriores usan Google AI Studio: generas una API key en aistudio.google.com y la pasas como texto plano. Es la forma más simple de empezar, y la que usa este proyecto en apps/agent-orchestrator/src/config/genai.ts.",
          },
          {
            type: "p",
            text: "La Gemini Enterprise Agent Platform (el nombre actual de lo que antes se llamaba Vertex AI) es la otra puerta de entrada al mismo modelo — pensada para producción dentro de Google Cloud. La diferencia no es el modelo, es la autenticación: en vez de una API key, usa la identidad del propio servicio (Cloud Run, en este caso). Cero secretos que rotar o filtrar.",
          },
          {
            type: "code",
            filename: "apps/agent-orchestrator/src/config/agentPlatformGenai.ts",
            code: `// AI Studio (Demo 2):
new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Gemini Enterprise Agent Platform (esta demo) — sin API key:
new GoogleGenAI({ vertexai: true, project, location: "global" });`,
          },
          {
            type: "callout",
            kind: "warning",
            text: "gemini-3.7-flash solo corre en la región \"global\" en la Agent Platform (sin residencia regional de datos todavía) — usar us-central1 u otra región da 404. Si copias este patrón, revisa la disponibilidad por región del modelo que necesites.",
          },
          {
            type: "p",
            text: "El mismo interruptor existe dentro de ADK: en vez de una cadena como modelo, le pasas una instancia de Gemini configurada con vertexai: true. Así es como las Demos 1, 2 y 5 ofrecen ambos modos con el mismo código de agente:",
          },
          {
            type: "code",
            filename: "apps/agent-orchestrator/src/agents/adkRuntime.ts",
            code: `function resolveAdkModel(mode: AiMode): string | Gemini {
  if (mode === "ai-studio") return GEMINI_MODEL;
  return new Gemini({ model: GEMINI_MODEL, vertexai: true, project, location: "global" });
}`,
          },
        ],
      },
      {
        title: "Pruébalo en vivo",
        durationMinutes: 1,
        blocks: [
          {
            type: "list",
            items: [
              "Elige una región y presiona \"Generar briefing de esta región\" — a diferencia de las demos 1-3 (un paciente a la vez), esta le pide a Gemini que lea el estado de todos los hospitales de esa región y redacte un resumen ejecutivo.",
              "Fíjate en la etiqueta \"vía Gemini Enterprise Agent Platform\" en el resultado — ese mismo texto sale de gemini-3.7-flash, sin ninguna API key involucrada.",
            ],
          },
          {
            type: "demo-link",
            label: "Abrir Demo 4 en vivo",
            url: `${WEB_CLIENT_URL}/#platform`,
          },
        ],
      },
    ],
  },
  {
    id: "demo-5-travel",
    title: "Demo 5 (extra) · Planificador de viajes multi-agente",
    steps: [
      {
        title: "El concepto: agentes de investigación en paralelo + síntesis",
        durationMinutes: 2,
        blocks: [
          {
            type: "p",
            text: "Este patrón aparece constantemente en apps agénticas: varios agentes especializados investigan aspectos independientes de un problema al mismo tiempo, y un agente final combina sus hallazgos en una única respuesta coherente. Aquí lo mostramos con un caso muy distinto al de triage médico — planificar un viaje — para dejar claro que el patrón, no el dominio, es lo reutilizable.",
          },
          {
            type: "p",
            text: "Tres agentes ADK (vuelos, hospedaje, actividades) reciben la misma solicitud de viaje y corren en paralelo con Promise.all; un cuarto agente (itinerario) recibe las tres salidas y las sintetiza en un plan día a día. Ninguno de los cuatro necesita herramientas — es generación pura, la forma más simple de un LlmAgent de ADK.",
          },
          {
            type: "code",
            filename: "apps/agent-orchestrator/src/agents/travelPlanner.ts",
            code: `const [flightResult, hotelResult, activityResult] = await Promise.all([
  runAdkAgentTurn(getFlightAgent(mode), summary),
  runAdkAgentTurn(getHotelAgent(mode), summary),
  runAdkAgentTurn(getActivityAgent(mode), summary),
]);

const itineraryResult = await runAdkAgentTurn(
  getItineraryAgent(mode),
  \`\${summary}\\n\\nFlight: \${flightResult.finalText}\\n\\nHotel: \${hotelResult.finalText}\\n\\nActivities: \${activityResult.finalText}\`,
);`,
          },
          {
            type: "callout",
            kind: "info",
            text: "Esta demo está inspirada en travel-planner-multi, un proyecto separado del mismo autor que ya combinaba Google AI Studio y ADK. Aquí se reconstruyó sobre la misma infraestructura ADK real que ya viste en la Demo 2 (createDualModeAdkAgent, runAdkAgentTurn) en vez de una capa de orquestación manual, y quedó sobre gemini-3.7-flash con soporte para ambos modos de autenticación.",
          },
        ],
      },
      {
        title: "Pruébalo en vivo",
        durationMinutes: 1,
        blocks: [
          {
            type: "list",
            items: [
              "Ajusta origen, destino, fechas, viajeros y presupuesto — o deja los valores de ejemplo.",
              "Presiona \"Planificar viaje con 4 agentes\" y observa las 3 tarjetas de investigación aparecer, seguidas del itinerario sintetizado.",
              "Igual que en las Demos 1 y 2, el selector Google AI Studio / Agent Platform decide cómo se autentican los 4 agentes.",
            ],
          },
          {
            type: "demo-link",
            label: "Abrir Demo 5 en vivo",
            url: `${WEB_CLIENT_URL}/#travel`,
          },
        ],
      },
    ],
  },
  {
    id: "demo-6-medical-panel",
    title: "Demo 6 (extra) · Panel de contexto médico con WebMCP",
    steps: [
      {
        title: "El concepto: WebMCP más allá de un formulario de triage",
        durationMinutes: 2,
        blocks: [
          {
            type: "p",
            text: "La Demo 1 mostró WebMCP con tres herramientas ligadas a un formulario. Esta demo aplica el mismo patrón a un caso de uso distinto — un panel de resultados de laboratorio — para mostrar que \"registrar herramientas en document.modelContext\" no es una receta de un solo uso: cualquier página con datos estructurados puede exponerlos así.",
          },
          {
            type: "p",
            text: "Además de WebMCP, usa el Summarizer API de Chrome (Summarizer.availability() / .create() / .summarize()) para el resumen inicial, y el mismo global LanguageModel de la Demo 1 para las preguntas de seguimiento — ambos on-device, cero llamadas de red.",
          },
          {
            type: "code",
            filename: "apps/web-client/src/mcp/medicalMcpTools.ts",
            code: `export const explainLabResultTool: MCPToolDefinition<{ entryId: string }, ...> = {
  name: "explainLabResult",
  description: "Generates a plain-language explanation of one lab result using on-device AI.",
  parameters: { type: "object", properties: { entryId: { type: "string" } }, required: ["entryId"] },
  handler: async ({ entryId }) => {
    const entry = findLabEntry(entryId);
    const { text, simulated } = await summarizeMedicalResult(entry.raw);
    return { explanation: text, simulated };
  },
};`,
          },
          {
            type: "callout",
            kind: "info",
            text: "Esta demo está inspirada en contextual-ai-panel, un proyecto separado del mismo autor. Aquí se reconstruyó con datos y estilo propios de este monorepo, y se le añadieron las tres herramientas WebMCP reales (listLabResults, getLabResult, explainLabResult) que el original no tenía.",
          },
        ],
      },
      {
        title: "Pruébalo en vivo",
        durationMinutes: 1,
        blocks: [
          {
            type: "list",
            items: [
              "Haz clic en cualquier resultado (ej. \"TSH\") para ver su explicación generada on-device.",
              "Cambia a la pestaña \"💬 Preguntar\" y haz una pregunta de seguimiento sobre ese resultado.",
              "Con WebMCP nativo activo (chrome://flags/#enable-webmcp-testing), estas tres herramientas quedan disponibles para cualquier agente de navegador que las descubra — no solo para el código de esta página.",
            ],
          },
          {
            type: "demo-link",
            label: "Abrir Demo 6 en vivo",
            url: `${WEB_CLIENT_URL}/#medical`,
          },
        ],
      },
    ],
  },
  {
    id: "orquestando-multiagentes",
    title: "Orchestrating Multi-Agent Workflows with Gemini Flash",
    steps: [
      {
        title: "¿Qué es un agente, y qué necesidad resuelve?",
        durationMinutes: 2,
        blocks: [
          {
            type: "p",
            text: "Un agente no es solo \"un prompt más inteligente\". Es un programa que recibe un objetivo en lenguaje natural, decide por sí mismo qué pasos dar y qué herramientas usar para lograrlo, y solo entonces responde — a diferencia de un chatbot clásico, que recibe una pregunta y genera texto sin poder consultar ni modificar nada fuera de su propia respuesta.",
          },
          {
            type: "p",
            text: "La necesidad que resuelve es concreta: tareas donde la respuesta correcta depende de datos que cambian (signos vitales de un paciente, capacidad de un hospital, inventario de insumos) y donde alguien tendría que revisar varias fuentes y decidir. Un agente puede consultar esas fuentes por su cuenta, en vez de esperar a que un humano lo haga.",
          },
          {
            type: "list",
            items: [
              "Demo 1 (WebMCP): el modelo decide cuándo llamar a una herramienta de la propia página — nadie programó \"si el usuario dice X, ejecuta Y\"; el modelo elige la herramienta.",
              "Demo 2 (ADK multi-agente): tres agentes distintos consultan tres fuentes distintas (vitales, capacidad hospitalaria, inventario), y cada uno decide si necesita llamar a su herramienta antes de responder.",
              "Demo 5 (ADK en paralelo): cuatro agentes investigan aspectos independientes de un mismo problema al mismo tiempo, sin que un humano coordine el orden.",
            ],
          },
          {
            type: "callout",
            kind: "info",
            text: "La pieza que distingue a un agente de una función normal es la autonomía sobre la herramienta: tú le das al modelo una lista de funciones disponibles con su descripción, y es el modelo — no tu código — quien decide si las necesita, con qué argumentos, y en qué orden.",
          },
        ],
      },
      {
        title: "Cómo se construye un agente con ADK, paso a paso",
        durationMinutes: 4,
        blocks: [
          {
            type: "p",
            text: "Este es el proceso real que este proyecto usa para crear cada agente de las Demos 2 y 5. Sigue estos cinco pasos con tu propio caso y tendrás un agente funcional.",
          },
          {
            type: "list",
            items: [
              "1. Define el dominio: qué decisión necesita tomar el agente, y qué dato externo necesita para tomarla bien. En este proyecto: ¿la prioridad de triage reportada coincide con los signos vitales?",
              "2. Escribe la herramienta (tool): una función normal de TypeScript con un nombre, una descripción en lenguaje natural, y un schema JSON de sus parámetros — el modelo lee la descripción para decidir cuándo llamarla.",
              "3. Escribe la instrucción (system prompt): el rol del agente, la tarea exacta, y restricciones explícitas (\"llama a la herramienta exactamente una vez\", \"nunca inventes datos\", \"responde en español\").",
              "4. Crea el Agent de ADK: nombre, modelo (gemini-3.7-flash), la instrucción del paso 3, y la lista de herramientas del paso 2.",
              "5. Ejecútalo con un Runner: le pasas el mensaje del usuario, y ADK se encarga del loop completo — decidir si llama a la herramienta, ejecutarla, y generar la respuesta final.",
            ],
          },
          {
            type: "code",
            filename: "apps/agent-orchestrator/src/mcp/tools.ts — paso 2",
            code: `export const validateClinicalUrgencyTool: MCPToolDefinition = {
  name: "validateClinicalUrgency",
  description: "Cross-checks a reported START triage priority against raw vitals using the authoritative server-side decision tree.",
  parameters: {
    type: "object",
    properties: {
      respiratoryRate: { type: "integer", description: "Breaths per minute." },
      pulseRate: { type: "integer", description: "Beats per minute." },
      reportedPriority: { type: "string", enum: ["IMMEDIATE", "DELAYED", "MINOR", "DECEASED"] },
    },
    required: ["respiratoryRate", "pulseRate", "reportedPriority"],
  },
  handler: async (args) => {
    // Logica deterministica, sin IA: el arbol de decision real del triage START
  },
};`,
          },
          {
            type: "code",
            filename: "apps/agent-orchestrator/src/agents/triageValidator.ts — pasos 3, 4 y 5",
            code: `const agent = new Agent({
  name: "triage_validator",
  model: "gemini-3.7-flash",
  instruction: "You are the Triage Validator agent... call validateClinicalUrgency exactly once with the patient's vitals and reported priority...",
  tools: [toAdkTool(validateClinicalUrgencyTool)],
});

const runner = new InMemoryRunner({ agent });
for await (const event of runner.runEphemeral({
  userId: "agentic-web-starter",
  newMessage: { role: "user", parts: [{ text: userPrompt }] },
})) {
  // ADK ya decidio llamar la herramienta y la ejecuto -- solo armamos el resultado
}`,
          },
          {
            type: "callout",
            kind: "success",
            text: "Este mismo patrón — herramienta con schema, instrucción, Agent y Runner — es todo lo que necesitas para cualquier dominio. Cambia validateClinicalUrgency por tu propia función y ya tienes el esqueleto de un agente nuevo.",
          },
        ],
      },
      {
        title: "Sin código · Gemini Enterprise y Agent Designer",
        durationMinutes: 3,
        blocks: [
          {
            type: "p",
            text: "Gemini Enterprise es la app (antes Agentspace) donde cualquier persona de tu organización — programe o no — puede crear, compartir y correr agentes. La pieza que hace esto posible sin código es Agent Designer: describes el agente en una sola frase en lenguaje natural, y Gemini genera una primera versión que puedes ajustar sin tocar código.",
          },
          {
            type: "list",
            items: [
              "1. Abre la app de Gemini Enterprise y haz clic en \"+ Create agent\".",
              "2. Escribe en una frase qué debe hacer el agente — por ejemplo: \"Responde preguntas sobre nuestras políticas de reembolso usando los PDFs del Drive de finanzas\".",
              "3. Opcionalmente, conecta fuentes de datos (Drive, sitios internos, Jira, Confluence) o sube archivos de referencia directamente.",
              "4. Gemini genera una primera versión del agente; pruébala en la pestaña Preview.",
              "5. Refina el comportamiento escribiéndole instrucciones adicionales en el panel de chat, igual que ajustarías un prompt.",
              "6. (Opcional) Cambia a \"Proceed to builder\" para editar visualmente el flujo en un lienzo, agregar subagentes, o construir lógica de varios pasos.",
              "7. Haz clic en \"Create\" para publicarlo en tu Agents gallery — el portal donde tu organización descubre y comparte agentes.",
            ],
          },
          {
            type: "callout",
            kind: "info",
            text: "Los agentes creados aquí quedan disponibles en la Agents gallery de tu organización, junto a los agentes hechos por Google — es la puerta más rápida para que alguien sin experiencia técnica arme algo funcional en minutos.",
          },
          {
            type: "links",
            items: [
              {
                label: "Agent Designer — overview",
                url: "https://docs.cloud.google.com/gemini/enterprise/docs/agent-designer",
                description: "Qué es Agent Designer y cómo se relaciona con el resto de Gemini Enterprise.",
              },
              {
                label: "Create an agent — guía oficial paso a paso",
                url: "https://docs.cloud.google.com/gemini/enterprise/docs/agent-designer/create-agent",
                description: "La fuente de los 7 pasos de arriba, con el detalle completo de cada pantalla.",
              },
              {
                label: "Codelab oficial: Create no-code agents with Gemini Enterprise",
                url: "https://codelabs.developers.google.com/next26/dev-keynote/gemini-enterprise",
                description: "Un tutorial guiado completo si quieres practicar esto con las manos, paso a paso.",
              },
            ],
          },
        ],
      },
      {
        title: "Sin código · Conversational Agents (Dialogflow CX)",
        durationMinutes: 2,
        blocks: [
          {
            type: "p",
            text: "Conversational Agents (el nombre actual de Dialogflow CX) resuelve un problema distinto al de Agent Designer: no arma un agente de un vistazo con una frase, sino que da un editor visual de flujos para diseñar conversaciones con estados explícitos — útil cuando necesitas control fino sobre cada paso (verificación de identidad, transferencia a un humano, integraciones con pagos), no solo respuestas generadas libremente por un LLM.",
          },
          {
            type: "list",
            items: [
              "Cada \"page\" del flujo representa un estado de la conversación (ej. \"pidiendo número de pedido\"), con intents que detectan qué dijo el usuario y rutas que deciden a qué page ir después.",
              "Los webhooks conectan cada page con tus propios sistemas — inventario, CRM, pasarela de pago — igual que una herramienta MCP, pero configurado visualmente en vez de en código.",
              "Puedes combinarlo con generación por LLM (Generative fallback) para las partes de la conversación donde sí quieres que el modelo improvise, dentro de los límites que tú definas.",
            ],
          },
          {
            type: "callout",
            kind: "success",
            text: "Regla práctica: usa Conversational Agents cuando la conversación necesita pasos obligatorios y auditables (regulado, transaccional). Usa Agent Designer cuando quieres que el modelo tenga más libertad para razonar sobre lenguaje natural libre.",
          },
          {
            type: "links",
            items: [
              {
                label: "Conversational Agents (Dialogflow CX) — documentación",
                url: "https://cloud.google.com/dialogflow/cx/docs",
                description: "El editor de flujos, states, intents y webhooks en detalle.",
              },
            ],
          },
        ],
      },
      {
        title: "Sin código · Agent Garden",
        durationMinutes: 2,
        blocks: [
          {
            type: "p",
            text: "Agent Garden no es una herramienta de creación desde cero — es una biblioteca curada de agentes ADK de referencia ya construidos (RAG, multi-agente, tool-use), con código real disponible en GitHub. Es el punto de partida cuando sabes que quieres algo parecido a un patrón conocido, en vez de empezar en blanco.",
          },
          {
            type: "list",
            items: [
              "1. Explora la galería y elige una muestra cuyo patrón se parezca a lo que necesitas — por ejemplo, un agente RAG sobre tus documentos.",
              "2. Cada muestra trae una descripción, casos de uso y un diagrama de su arquitectura — revísalo antes de clonar.",
              "3. Abre el link a GitHub de esa muestra y clona el repositorio.",
              "4. Ajusta la instrucción, las herramientas o los datos a tu propio dominio — es código ADK real, el mismo patrón que ya viste en la Demo 2.",
              "5. Despliega tu versión con el SDK de Agent Platform: a Agent Engine (gestionado), Cloud Run, o tu propia infraestructura.",
            ],
          },
          {
            type: "callout",
            kind: "info",
            text: "Agent Garden es la ruta \"sin código\" más honesta de las tres: técnicamente sí hay código (el del ejemplo), pero tú nunca partes de una página en blanco — copias, ajustas y despliegas.",
          },
          {
            type: "links",
            items: [
              {
                label: "Agent Garden — documentación",
                url: "https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/agent-garden",
                description: "Cómo explorar, clonar y personalizar las muestras de la galería.",
              },
            ],
          },
        ],
      },
      {
        title: "Con código · Multiagentes con ADK",
        durationMinutes: 3,
        blocks: [
          {
            type: "p",
            text: "Ya construiste un agente individual en el paso 2. Un sistema multiagente añade una capa de orquestación sobre varios de esos agentes. ADK soporta tres patrones principales, y los tres ya están corriendo en este proyecto:",
          },
          {
            type: "table",
            headers: ["Patrón", "Cómo funciona", "Dónde lo viste"],
            rows: [
              [
                "Paralelo",
                "Varios agentes reciben la misma entrada y corren al mismo tiempo con Promise.all; un agente final sintetiza sus salidas",
                "Demo 5 — vuelos, hospedaje y actividades en paralelo, luego un agente de itinerario",
              ],
              [
                "Secuencial / por etapas",
                "La salida de un agente alimenta la entrada del siguiente",
                "Demo 2 — el Hospital Router usa el resultado del Triage Validator para decidir a qué hospital enviar al paciente",
              ],
              [
                "Jerárquico (delegación)",
                "Un agente coordinador decide a cuál sub-agente delegar cada solicitud, según su descripción",
                "El patrón que usa Agent Designer internamente cuando armas un agente con \"subagentes\" en el lienzo visual",
              ],
            ],
          },
          {
            type: "callout",
            kind: "info",
            text: "No necesitas un framework distinto para cada patrón — es la misma llamada a InMemoryRunner y el mismo Agent de ADK. Lo que cambia es cómo tu propio código de orquestación (Promise.all, una cadena de await, o un agente delegador) conecta las salidas de un agente con la entrada del siguiente.",
          },
          {
            type: "links",
            items: [
              {
                label: "Documentación de ADK",
                url: "https://google.github.io/adk-docs/",
                description: "Los tres patrones de orquestación en detalle, con soporte oficial para Python, TypeScript, Go, Java y Kotlin.",
              },
            ],
          },
        ],
      },
      {
        title: "Con código · Agent Engine, paso a paso",
        durationMinutes: 3,
        blocks: [
          {
            type: "p",
            text: "Agent Engine es el runtime gestionado de la Gemini Enterprise Agent Platform (antes Vertex AI) para tus propios agentes ADK: le entregas tu código, y Google construye el contenedor, lo despliega y lo escala — sin que tú mantengas un Dockerfile ni un servicio de Cloud Run propio.",
          },
          {
            type: "list",
            items: [
              "1. Instala las dependencias de despliegue en tu entorno de Python.",
              "2. Asegúrate de tener un proyecto de Google Cloud con facturación habilitada — el mismo que usaste en \"Antes de empezar → Camino B\".",
              "3. Desde la carpeta de tu agente, corre el comando de despliegue con tu proyecto, región y un nombre.",
              "4. ADK empaqueta tu agente localmente y lo sube a Cloud Storage como staging.",
              "5. Agent Engine recibe ese paquete, construye el contenedor y levanta el servidor HTTP por ti — sin que definas ninguna infraestructura a mano.",
              "6. Prueba tu agente desplegado desde la consola o llamándolo directamente por su endpoint.",
            ],
          },
          {
            type: "code",
            filename: "Terminal — pasos 1 y 3",
            code: `pip install --upgrade --quiet "google-cloud-aiplatform[agent_engines,adk]>=1.112"

adk deploy agent_engine \\
  --project=$PROJECT_ID \\
  --region=$LOCATION_ID \\
  --display_name="Mi primer agente"`,
          },
          {
            type: "callout",
            kind: "warning",
            text: "Esto reemplaza al Dockerfile + Cloud Run que este proyecto usa para su propio backend (ver \"Cierre y recursos → Dónde desplegar esto\") — son dos formas válidas de llegar a producción; Agent Engine es la que menos infraestructura te obliga a mantener.",
          },
          {
            type: "links",
            items: [
              {
                label: "Deploy ADK agents to Agent Engine",
                url: "https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/runtime/quickstart-adk",
                description: "La guía oficial completa del comando adk deploy agent_engine y qué hace cada paso.",
              },
              {
                label: "Agent Engine — overview",
                url: "https://cloud.google.com/agent-builder/agent-engine/overview",
                description: "Qué gestiona Agent Engine por ti: escalado, sesiones, memoria.",
              },
            ],
          },
        ],
      },
      {
        title: "Con código · Protocolo A2A",
        durationMinutes: 2,
        blocks: [
          {
            type: "p",
            text: "Todo lo anterior asume que tú controlas todos los agentes. El protocolo A2A (Agent2Agent) resuelve el problema contrario: cómo un agente construido por otro equipo — o con otro framework, como LangGraph en vez de ADK — descubre qué puede hacer tu agente y le habla, sin que ambos compartan código.",
          },
          {
            type: "list",
            items: [
              "Cada agente publica un \"Agent Card\": un documento que describe sus capacidades, cómo autenticarse contra él, y cómo enviarle tareas — el equivalente a un contrato de API, pero pensado para agentes.",
              "Un agente cliente lee ese Agent Card, arma una tarea en el formato que A2A define, y la envía — sin necesitar el código fuente del otro agente.",
              "Google donó el protocolo a la Linux Foundation en 2025; hoy lo gobierna un consorcio de más de 150 organizaciones, no solo Google.",
            ],
          },
          {
            type: "callout",
            kind: "info",
            text: "Úsalo cuando tu multiagente cruza fronteras organizacionales o de framework. Dentro de un mismo equipo y un mismo repo — como las Demos 2 y 5 — llamar funciones de ADK directamente sigue siendo más simple que pasar por A2A.",
          },
          {
            type: "links",
            items: [
              {
                label: "A2A Protocol — especificación oficial",
                url: "https://a2a-protocol.org",
                description: "El formato del Agent Card y del intercambio de tareas entre agentes.",
              },
              {
                label: "Codelab: Purchasing Concierge con A2A",
                url: "https://codelabs.developers.google.com/intro-a2a-purchasing-concierge",
                description: "Un ejemplo end-to-end de dos agentes independientes hablándose por A2A, sobre Cloud Run y Agent Engine.",
              },
            ],
          },
        ],
      },
      {
        title: "Si tienes créditos de Google Cloud: qué puedes hacer",
        durationMinutes: 2,
        blocks: [
          {
            type: "p",
            text: "Si tienes créditos de Google Cloud para gastar en Gemini Enterprise, no tienes que usarlos solo para crear una API key — esa es apenas la puerta de entrada. Esta tabla resume qué hacer en cada nivel, apoyándote en los pasos que ya viste en esta misma sección.",
          },
          {
            type: "table",
            headers: ["Nivel", "Haz esto", "Por qué"],
            rows: [
              [
                "Solo quieres correr las demos de este codelab",
                "Camino B → Opción 1 de \"Antes de empezar\" (API key restringida a Agent Platform API)",
                "Es el mínimo viable: una key, una variable de entorno, listo",
              ],
              [
                "Quieres explorar sin escribir código",
                "Los 7 pasos de \"Sin código · Gemini Enterprise y Agent Designer\", arriba en esta sección",
                "Ves un agente funcionando en minutos, sin tocar una línea de código",
              ],
              [
                "Vas a desplegar un agente propio",
                "Los 6 pasos de \"Con código · Agent Engine\", arriba en esta sección",
                "Producción gestionada, sin mantener tu propio Cloud Run",
              ],
            ],
          },
          {
            type: "callout",
            kind: "info",
            text: "El paso de facturación (habilitar la Agent Platform API, vincular tus créditos) es el mismo sin importar qué construyas después — ya lo hiciste, o lo harás, una sola vez en \"Antes de empezar → Camino B\". Esta tabla es solo sobre qué hacer con esa cuenta ya lista.",
          },
          {
            type: "links",
            items: [
              {
                label: "Gemini Enterprise",
                url: "https://cloud.google.com/gemini-enterprise",
                description: "La app sin código — antes Agentspace. Arma agentes de negocio desde una galería, sobre tus propias fuentes de datos.",
              },
              {
                label: "Gemini Enterprise Agent Platform",
                url: "https://cloud.google.com/products/gemini-enterprise-agent-platform",
                description: "La plataforma de desarrollador — antes Vertex AI. Aquí viven ADK, Agent Engine y Model Garden.",
              },
              {
                label: "Agent Engine — overview",
                url: "https://cloud.google.com/agent-builder/agent-engine/overview",
                description: "El runtime gestionado para desplegar y escalar agentes ADK sin gestionar servidores.",
              },
              {
                label: "Documentación de ADK",
                url: "https://google.github.io/adk-docs/",
                description: "El framework que ya usaste en las Demos 2 y 5 — con soporte oficial para Python, TypeScript, Go, Java y Kotlin.",
              },
              {
                label: "Protocolo A2A (Agent2Agent)",
                url: "https://a2a-protocol.org",
                description: "Estándar abierto para que agentes de frameworks distintos se descubran y se hablen entre sí.",
              },
            ],
          },
        ],
      },
      {
        title: "Qué demos muestran esto, y el slide deck de esta sección",
        durationMinutes: 1,
        blocks: [
          {
            type: "list",
            items: [
              "Demo 2 · Gemini Flash multi-agente — tres agentes ADK (Triage Validator, Hospital Router, Supply Chain) orquestados con function calling real: la ruta de código, ya viva en este proyecto.",
              "Demo 5 (extra) · Planificador de viajes — cuatro agentes ADK corriendo en paralelo más un agente de síntesis: el mismo patrón, un dominio distinto, para dejar claro que no es una receta de un solo uso.",
              "La ruta sin código (Gemini Enterprise, Conversational Agents, Agent Garden) y el despliegue gestionado (Agent Engine) son la capa de plataforma que acabas de ver en detalle — sin una demo propia corriendo en este repositorio, hoy.",
            ],
          },
          {
            type: "demo-link",
            label: "Ver el slide deck de esta sección",
            url: "./slides-orquestacion.html",
            note: "Se abre en una pestaña nueva. Resume el mapa sin código / con código, qué demos lo ilustran, y trae los QR de créditos, del codelab y del repositorio.",
          },
        ],
      },
    ],
  },
  {
    id: "agentes-locales-webmcp",
    title: "Local Agents with Gemma, Gemini Nano, and WebMCP",
    steps: [
      {
        title: "Agente local vs. agente no local: dos formas distintas de razonar",
        durationMinutes: 3,
        blocks: [
          {
            type: "p",
            text: "Hasta ahora viste un agente no local (Gemini Flash, en la nube) orquestando tres agentes especializados en la Demo 2. Esta sección profundiza en la otra mitad del espectro: un agente local, donde el modelo que razona corre dentro del propio navegador o dispositivo del usuario — como en la Demo 3 (Gemma) y, para tareas más simples, en las Demos 1 y 6 (Gemini Nano).",
          },
          {
            type: "p",
            text: "La diferencia no es de grado, es de arquitectura. Un agente no local hace una llamada de red a un servidor que Google opera: paga latencia de ida y vuelta, cuesta por token, necesita conexión, y los datos del prompt viajan fuera del dispositivo. Un agente local ejecuta la inferencia en el mismo proceso donde vive tu UI: latencia cercana a cero, sin costo por llamada, funciona sin conexión, y ningún dato sale del navegador — a cambio de un modelo mucho más pequeño y menos capaz en tareas de razonamiento largo o multi-paso.",
          },
          {
            type: "table",
            headers: ["", "Agente local (Nano / Gemma)", "Agente no local (Gemini Flash)"],
            rows: [
              ["Dónde corre la inferencia", "En el navegador o dispositivo del usuario", "En la infraestructura de Google, vía API"],
              ["Latencia", "Prácticamente cero — sin round-trip de red", "Latencia de red + procesamiento en el servidor"],
              ["Costo por llamada", "Cero", "Por token, según el modelo"],
              ["Conectividad", "Funciona sin conexión (offline-first)", "Requiere conexión a internet"],
              ["Privacidad de los datos", "El prompt nunca sale del dispositivo", "El prompt viaja a un servidor (tú controlas cuál, ver Demo 4)"],
              ["Capacidad del modelo", "Limitada — contexto corto, menos fiable en tareas de varios pasos", "Alta — function calling robusto, contexto grande, multimodal"],
              ["Dónde lo viste en este proyecto", "Demo 1 (Nano), Demo 3 (Gemma), Demo 6 (Nano + Summarizer)", "Demo 2, Demo 4, Demo 5"],
            ],
          },
          {
            type: "callout",
            kind: "info",
            text: "No es una decisión de \"cuál es mejor\" — es una decisión de dónde importa cada tradeoff. Un formulario de triage que sugiere una prioridad mientras el usuario escribe necesita latencia cero, no el razonamiento más sofisticado posible: ahí un agente local gana. Orquestar tres fuentes de datos distintas para decidir a qué hospital enviar a un paciente sí necesita ese razonamiento: ahí gana un agente no local.",
          },
        ],
      },
      {
        title: "WebMCP a fondo: cómo un agente descubre y llama tus propias herramientas",
        durationMinutes: 4,
        blocks: [
          {
            type: "p",
            text: "Un modelo local o remoto que solo genera texto sigue dependiendo de un humano que copie esa salida y la pegue donde corresponda. WebMCP (document.modelContext) cierra esa brecha: es la propuesta de Google y Microsoft, en revisión por el W3C Web Machine Learning Community Group, para que cualquier página web declare sus propias acciones como herramientas estructuradas que un agente puede descubrir y ejecutar directamente.",
          },
          {
            type: "p",
            text: "Es fácil confundirlo con \"MCP\" a secas (Model Context Protocol), pero resuelven problemas distintos. El MCP clásico conecta un modelo con servidores externos — procesos separados que hablan por stdio o HTTP, típico de herramientas de escritorio o de un agente de backend. WebMCP vive dentro de la propia página: no hay proceso aparte, es el navegador quien media el registro y la ejecución de cada herramienta sobre el DOM real de esa página. Por eso encaja de forma natural con agentes locales — el modelo, la página y las herramientas comparten el mismo proceso — aunque el protocolo en sí es agnóstico a dónde vive el modelo que las llama.",
          },
          {
            type: "list",
            items: [
              "Cada herramienta se declara con un nombre, una descripción en lenguaje natural y un schema JSON de sus parámetros — el modelo lee esa descripción para decidir cuándo y cómo llamarla, exactamente igual que un FunctionTool de ADK en el backend.",
              "document.modelContext.registerTool() publica esa herramienta para cualquier agente de navegador que la descubra — no solo para el código de la propia página.",
              "Las anotaciones como readOnlyHint le dicen al agente si una acción es segura de ejecutar sin pedir confirmación explícita al usuario — una lectura no necesita el mismo permiso que una escritura.",
              "El feature-detection (if (!document.modelContext) return;) es lo que hace que este patrón nunca rompa nada: en un navegador sin soporte, la página sigue funcionando con las mismas funciones llamadas directamente por tu propio código.",
            ],
          },
          {
            type: "code",
            filename: "apps/web-client/src/mcp/webMcpTools.ts — el mismo catálogo, publicado dos formas",
            code: `// 1. Como funciones normales de TypeScript, siempre disponibles:
export const webMcpTools = [extractVitalsTool, updateTriageBadgeTool, cacheOfflineRecordTool];

// 2. Publicadas para cualquier agente de navegador, solo si la API existe:
export function registerWebMcpTools(): void {
  const modelContext = document.modelContext;
  if (!modelContext) return; // sin WebMCP: seguimos usando los tools localmente

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
          {
            type: "callout",
            kind: "warning",
            text: "WebMCP está en Origin Trial desde Chrome 149 (y Edge 150) — todavía no es un estándar estable, y la forma final de la API puede cambiar. Pruébalo localmente sin token con chrome://flags/#enable-webmcp-testing.",
          },
        ],
      },
      {
        title: "Gemini Nano vs. Gemma: dos rutas distintas para ser local",
        durationMinutes: 3,
        blocks: [
          {
            type: "p",
            text: "\"Agente local\" no significa una sola tecnología. Este proyecto usa dos, con tradeoffs opuestos entre sí, y elegir entre ellas depende de cuánto control necesitas sobre el modelo mismo.",
          },
          {
            type: "table",
            headers: ["", "Gemini Nano", "Gemma"],
            rows: [
              ["Dónde vive", "Dentro de Chrome — global LanguageModel (Prompt API)", "Donde tú decidas: navegador vía Google AI Edge/MediaPipe (WASM/WebGPU), servidor, móvil, Ollama"],
              ["Cómo se activa", "Ya viene instalado; LanguageModel.availability() y .create() lo activan", "Tú descargas el archivo del modelo (.litertlm) y lo cargas explícitamente"],
              ["Control sobre el modelo", "Caja cerrada: no eliges el tamaño ni haces fine-tuning", "Pesos abiertos: eliges la variante (E2B/E4B) y puedes ajustarlo a tu dominio"],
              ["Cuándo actualiza", "Con el navegador, fuera de tu control", "Cuando tú decidas volver a desplegar el archivo del modelo"],
              ["Mejor caso de uso", "Latencia cero dentro de Chrome, sin pedirle nada al usuario", "Necesitas portabilidad, control del runtime, o correr fuera de Chrome"],
              ["Dónde lo viste", "Demo 1 (triage en tiempo real) y Demo 6 (explicaciones de laboratorio)", "Demo 3 (reporte de traspaso del agente local)"],
            ],
          },
          {
            type: "callout",
            kind: "success",
            text: "Lección de arquitectura de la Demo 3, y la que más se repite en agentes locales: un modelo pequeño no es tan capaz como Gemini Flash, así que no le pidas que haga todo. Deja que herramientas WebMCP deterministicas resuelvan la parte crítica (extraer vitales, calcular una prioridad), y reserva al LLM local solo para lo que un LLM hace mejor — generar el texto final en lenguaje natural.",
          },
        ],
      },
      {
        title: "Dónde ya lo viste: el mismo patrón, tres veces",
        durationMinutes: 2,
        blocks: [
          {
            type: "p",
            text: "Las Demos 1, 3 y 6 no son variaciones cosméticas del mismo formulario — cada una prueba una pieza distinta de \"agente local + WebMCP\" que puedes reutilizar por separado en tu propio proyecto.",
          },
          {
            type: "list",
            items: [
              "Demo 1 — Gemini Nano decide cuándo llamar a extractVitals, updateTriageBadge y cacheOfflineRecord mientras el usuario escribe, sin que nadie programe \"si el texto dice X, ejecuta Y\": el modelo elige la herramienta y el momento.",
              "Demo 3 — la misma extracción de vitales y el mismo cálculo de prioridad corren sin ninguna IA (deterministas); Gemma solo redacta el reporte de traspaso en lenguaje natural, con un modo seguro que nunca depende de descargar el modelo en vivo.",
              "Demo 6 — el patrón WebMCP se aplica a un dominio distinto (un panel de resultados de laboratorio, no un formulario), y se combina con la Summarizer API de Chrome y el mismo LanguageModel de la Demo 1, ambos on-device y sin llamadas de red.",
            ],
          },
          {
            type: "callout",
            kind: "info",
            text: "Si solo puedes probar una demo en vivo para entender esta sección, prueba la Demo 3: es la única que compara explícitamente un modo con IA local real contra un modo seguro determinista, con el mismo código de UI para ambos.",
          },
          {
            type: "demo-link",
            label: "Abrir Demo 3 en vivo (Gemma local + WebMCP)",
            url: `${WEB_CLIENT_URL}/#gemma`,
            note: "La misma demo que ya viste en la sección Demo 3 — vuelve aquí cuando termines.",
          },
        ],
      },
      {
        title: "Qué demos muestran esto, y el slide deck de esta sección",
        durationMinutes: 1,
        blocks: [
          {
            type: "list",
            items: [
              "Demo 1 · Gemini Nano + WebMCP — el modelo local decide cuándo llamar a las herramientas de la propia página, en tiempo real mientras el usuario escribe.",
              "Demo 3 · Gemma local + WebMCP — el patrón completo de agente local: herramientas deterministas para la decisión crítica, LLM local solo para el texto final.",
              "Demo 6 · Panel de contexto médico — el mismo WebMCP aplicado a otro dominio, combinado con la Summarizer API on-device.",
              "Todas corren en la misma demo pública, sin instalar nada localmente.",
            ],
          },
          {
            type: "demo-link",
            label: "Abrir las demos en vivo",
            url: WEB_CLIENT_URL,
            note: "Firebase Hosting — abre en una pestaña nueva. Usa las pestañas 1, 3 y 6 para las demos de esta sección.",
          },
          {
            type: "demo-link",
            label: "Ver el slide deck de esta sección",
            url: "./slides-agentes-locales.html",
            note: "Se abre en una pestaña nueva. Resume local vs. no local, qué es WebMCP, Nano vs. Gemma, y trae los QR de créditos, del codelab, del repositorio y de las demos.",
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
                label: "Model Garden (Gemini Enterprise Agent Platform)",
                url: "https://cloud.google.com/model-garden",
                description: "Catálogo de modelos gestionados para llevar tus agentes a producción.",
              },
              {
                label: "Gemma-3n en Hugging Face — variantes \"-Web\"",
                url: "https://huggingface.co/google/gemma-3n-E2B-it-litert-lm",
                description: "Descarga el archivo .litertlm con \"-Web\" en el nombre, listo para MediaPipe en el navegador.",
              },
              {
                label: "Google AI Edge (MediaPipe)",
                url: "https://ai.google.dev/edge/mediapipe",
                description: "Runtime on-device para web, Android e iOS.",
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
  {
    id: "trustable-ai",
    title: "Building Trustable AI",
    steps: [
      {
        title: "Fluido no es lo mismo que confiable",
        durationMinutes: 2,
        blocks: [
          {
            type: "p",
            text: "El codelab \"Building Trustable AI at 100 MPH\" de Google usa un coach de carreras en tiempo real como ejemplo: un modelo puede sonar fluido y seguro sin serlo. Su ejemplo clásico es un piloto perdiendo agarre en una curva — una respuesta ingenua ignora el riesgo del momento; una respuesta confiable ajusta el consejo a la condición de la pista y a límites de seguridad explícitos, no solo a lo que el modelo \"cree\" que suena bien.",
          },
          {
            type: "p",
            text: "La tesis central, aplicable a cualquier dominio (incluido el triage médico de este proyecto): la confiabilidad no emerge de un modelo más grande o de un mejor prompt — emerge de la arquitectura alrededor del modelo.",
          },
          {
            type: "callout",
            kind: "info",
            text: "Ya viste una versión pequeña de esta misma idea en \"Lo que te llevas hoy\": heurísticos determinísticos y modos seguros que hacen que este proyecto nunca dependa 100% de que la IA responda bien en el momento exacto. Esta sección explica el mismo principio a escala de plataforma.",
          },
          {
            type: "links",
            items: [
              {
                label: "Building Trustable AI at 100 MPH (codelab original)",
                url: "https://codelabs.developers.google.com/codelabs/trustable-at-100-mph?hl=en#3",
                description: "El codelab de Google del que parte esta sección — arquitectura de confianza usando un coach de carreras como ejemplo.",
              },
            ],
          },
        ],
      },
      {
        title: "La arquitectura importa más que el modelo",
        durationMinutes: 2,
        blocks: [
          {
            type: "p",
            text: "El codelab propone una arquitectura modular con dos rutas separadas: una ruta reflexiva (determinística, en tiempo real — validaciones y límites duros que no pasan por el modelo) y una ruta estratégica (razonamiento del LLM sobre contexto más amplio). El modelo nunca es la única capa de decisión.",
          },
          {
            type: "list",
            items: [
              "Ancla el modelo en datos reales y frescos — en su ejemplo, telemetría en vivo por Server-Sent Events; en este proyecto, los signos vitales y el estado de capacidad hospitalaria que ya viste en las Demos 1 y 2.",
              "Normaliza y filtra los datos antes de que lleguen al modelo — límites de físicas de carrera en su caso, rangos clínicos válidos en el nuestro.",
              "Codifica el expertise de dominio como reglas explícitas, no como esperanza de que el modelo las infiera — su ejemplo son las reglas de manejo seguro; el equivalente de este proyecto es validateClinicalUrgencyTool de la Demo 2.",
              "Deja que el LLM razone y explique, pero nunca que sea la última palabra sobre una acción con consecuencias reales.",
            ],
          },
          {
            type: "callout",
            kind: "warning",
            text: "Esto no es exclusivo de casos de alto riesgo como carreras o salud — es la diferencia entre una demo que se ve bien en el escenario y un sistema que sigue siendo correcto cuando el input es raro, el modelo alucina, o la latencia se dispara.",
          },
        ],
      },
      {
        title: "Cómo se ve esto hoy con Gemini Enterprise",
        durationMinutes: 3,
        blocks: [
          {
            type: "p",
            text: "El codelab original construye su arquitectura de confianza a mano, sobre una API genérica de Gemini. Desde entonces, buena parte de esas capas ya no hay que construirlas desde cero — llegan como producto dentro de la Gemini Enterprise Agent Platform.",
          },
          {
            type: "table",
            headers: ["Capa de confianza", "Qué resuelve", "Producto de Gemini Enterprise"],
            rows: [
              [
                "Filtrar contenido dañino en la salida del modelo",
                "Bloquea categorías de daño antes de que la respuesta llegue al usuario",
                "Safety settings de la Gemini API — 5 categorías de daño configurables",
              ],
              [
                "Fijar el comportamiento y los límites del agente",
                "Evita que el modelo se salga del rol o de las reglas que definiste",
                "System instructions de la Gemini API",
              ],
              [
                "Anclar respuestas en datos verificables",
                "Reduce alucinaciones citando fuentes reales, con enlaces trazables",
                "Grounding with Google Search, con citas estructuradas (grounding_metadata)",
              ],
              [
                "Blindar el prompt y la respuesta contra ataques",
                "Detecta prompt injection, jailbreaks y fuga de datos sensibles",
                "Model Armor — inspecciona el tráfico antes de llegar al modelo y antes de llegar al usuario",
              ],
              [
                "Gobernar qué puede hacer cada agente",
                "Aplica mínimo privilegio y deja auditoría no repudiable de cada acción",
                "Agent Identity — identidad IAM nativa para agentes, con autenticación mTLS/DPoP",
              ],
              [
                "Centralizar el control sobre toda la flota de agentes",
                "Un solo punto para aplicar reglas de acceso y protección a todos tus agentes",
                "Agent Gateway — enruta e inspecciona el tráfico de agentes, integrado con Model Armor",
              ],
            ],
          },
          {
            type: "callout",
            kind: "success",
            text: "Regla práctica: usa las capas de la tabla en orden creciente de madurez. Empieza con safety settings + system instructions (gratis, en cualquier llamada a la Gemini API). Añade grounding cuando la exactitud factual importe. Sube a Model Armor + Agent Gateway + Agent Identity cuando tus agentes pasen de demo a producción con usuarios reales — es la versión gestionada de la arquitectura de guardrails que este codelab construye a mano.",
          },
          {
            type: "links",
            items: [
              {
                label: "Safety and factuality guidance",
                url: "https://ai.google.dev/gemini-api/docs/safety-guidance",
                description: "Safety settings y system instructions de la Gemini API — el punto de partida más simple.",
              },
              {
                label: "Model Armor",
                url: "https://cloud.google.com/security/products/model-armor",
                description: "Protección en tiempo de ejecución contra prompt injection, jailbreaks y fuga de datos sensibles.",
              },
              {
                label: "Agent Identity — overview",
                url: "https://docs.cloud.google.com/gemini-enterprise-agent-platform/govern/agent-identity-overview",
                description: "Identidad IAM nativa para agentes, con mínimo privilegio y auditoría no repudiable.",
              },
              {
                label: "Agent Gateway — overview",
                url: "https://docs.cloud.google.com/gemini-enterprise-agent-platform/govern/gateways/agent-gateway-overview",
                description: "Punto de control central para asegurar y gobernar todas las interacciones de tus agentes.",
              },
            ],
          },
        ],
      },
    ],
  },
];
