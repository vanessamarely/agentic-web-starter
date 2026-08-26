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
];
