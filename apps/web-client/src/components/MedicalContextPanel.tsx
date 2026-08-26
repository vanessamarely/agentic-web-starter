import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FLAG_COLOR,
  FLAG_LABEL,
  MEDICAL_REPORT_SECTIONS,
  type LabEntry,
} from "../data/medicalReportData";
import {
  askAboutMedicalResult,
  getMedicalAiReadiness,
  isMedicalPanelDemoMode,
  setMedicalPanelDemoMode,
  summarizeMedicalResult,
  type MedicalAiReadiness,
} from "../ai/nano/medicalPanelAi";
import { isNativeWebMcpSupported } from "../mcp/webMcpTools";
import { registerMedicalPanelWebMcpTools } from "../mcp/medicalMcpTools";

type PanelTab = "summary" | "chat";

const READINESS_LABEL: Record<MedicalAiReadiness, string> = {
  ready: "IA on-device lista (Summarizer / LanguageModel)",
  unavailable: "Modelo aún no disponible en este Chrome",
  unsupported: "Este navegador no tiene Summarizer/Prompt API",
};

interface ChatMsg {
  role: "user" | "assistant";
  text: string;
}

export function MedicalContextPanel() {
  const [activeSectionId, setActiveSectionId] = useState(MEDICAL_REPORT_SECTIONS[0]!.id);
  const [activeEntry, setActiveEntry] = useState<LabEntry | null>(null);
  const [activeTab, setActiveTab] = useState<PanelTab>("summary");
  const [readiness, setReadiness] = useState<MedicalAiReadiness>("unsupported");
  const [demoMode, setDemoMode] = useState(() => isMedicalPanelDemoMode());

  const [summaryText, setSummaryText] = useState("");
  const [summarySimulated, setSummarySimulated] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    registerMedicalPanelWebMcpTools();
  }, []);

  useEffect(() => {
    let cancelled = false;
    void getMedicalAiReadiness().then((r) => {
      if (!cancelled) setReadiness(r);
    });
    return () => {
      cancelled = true;
    };
  }, [demoMode]);

  const activeSection = useMemo(
    () => MEDICAL_REPORT_SECTIONS.find((s) => s.id === activeSectionId)!,
    [activeSectionId],
  );

  const handleToggleDemoMode = useCallback((enabled: boolean) => {
    setMedicalPanelDemoMode(enabled);
    setDemoMode(enabled);
  }, []);

  const handleSelectEntry = useCallback(async (entry: LabEntry) => {
    setActiveEntry(entry);
    setActiveTab("summary");
    setChatMessages([]);
    setChatInput("");
    setSummaryText("");
    setSummaryLoading(true);
    const { text, simulated } = await summarizeMedicalResult(entry.raw);
    setSummaryText(text);
    setSummarySimulated(simulated);
    setSummaryLoading(false);
  }, []);

  const handleSendChat = useCallback(async () => {
    if (!chatInput.trim() || !activeEntry || chatLoading) return;
    const question = chatInput.trim();
    const history = [...chatMessages, { role: "user" as const, text: question }];
    setChatMessages(history);
    setChatInput("");
    setChatLoading(true);
    const priorTurns = chatMessages
      .map((m) => `${m.role === "user" ? "Paciente" : "Asistente"}: ${m.text}`)
      .join("\n");
    const { text } = await askAboutMedicalResult(activeEntry.raw, question, priorTurns);
    setChatMessages([...history, { role: "assistant", text }]);
    setChatLoading(false);
  }, [activeEntry, chatInput, chatLoading, chatMessages]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Panel de Contexto Médico</h1>
          <p className="text-sm text-slate-400">{READINESS_LABEL[readiness]}</p>
        </div>
        <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <input
            type="checkbox"
            checked={demoMode}
            onChange={(e) => handleToggleDemoMode(e.target.checked)}
            className="accent-sky-500"
          />
          Modo demo (simular IA on-device)
        </label>
      </header>

      <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
        <p>
          <strong className="text-slate-300">Qué hace este panel:</strong> haz clic en cualquier
          resultado clínico para recibir una explicación on-device en lenguaje cotidiano y hacer
          preguntas de seguimiento — inspirado en el ejemplo{" "}
          <span className="text-slate-300">contextual-ai-panel</span>, reconstruido con datos y
          estilo propios de este monorepo, y ahora expuesto como herramientas WebMCP reales.
        </p>
        <span
          className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold ${
            isNativeWebMcpSupported() ? "bg-emerald-950 text-emerald-400" : "bg-slate-800 text-slate-500"
          }`}
        >
          {isNativeWebMcpSupported()
            ? "WebMCP nativo activo — listLabResults / getLabResult / explainLabResult registradas en document.modelContext"
            : "WebMCP nativo no detectado — actívalo en chrome://flags/#enable-webmcp-testing (Chrome 149+)"}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1.1fr]">
        <section className="space-y-3">
          <div className="flex gap-1.5">
            {MEDICAL_REPORT_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSectionId(section.id)}
                className={`rounded px-2.5 py-1.5 text-xs font-semibold ${
                  activeSectionId === section.id
                    ? "bg-slate-800 text-slate-100"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            {activeSection.entries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => void handleSelectEntry(entry)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  activeEntry?.id === entry.id
                    ? "border-sky-700 bg-sky-950/40"
                    : "border-slate-800 bg-slate-900 hover:border-slate-700"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-100">{entry.term}</p>
                  <p className="text-xs text-slate-500">
                    {entry.value} · ref {entry.ref}
                  </p>
                </div>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${FLAG_COLOR[entry.flag]}`}>
                  {FLAG_LABEL[entry.flag]}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          {!activeEntry ? (
            <p className="text-sm text-slate-500">
              Selecciona un resultado para ver su explicación generada on-device.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100">{activeEntry.term}</h3>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${FLAG_COLOR[activeEntry.flag]}`}>
                  {FLAG_LABEL[activeEntry.flag]}
                </span>
              </div>

              <div className="flex gap-1.5 border-b border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("summary")}
                  className={`rounded px-2.5 py-1 text-xs font-semibold ${
                    activeTab === "summary" ? "bg-slate-800 text-slate-100" : "text-slate-500"
                  }`}
                >
                  ✦ Resumen
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("chat")}
                  className={`rounded px-2.5 py-1 text-xs font-semibold ${
                    activeTab === "chat" ? "bg-slate-800 text-slate-100" : "text-slate-500"
                  }`}
                >
                  💬 Preguntar
                </button>
              </div>

              {activeTab === "summary" && (
                <div>
                  {summaryLoading ? (
                    <p className="text-sm text-slate-500">Generando explicación on-device…</p>
                  ) : (
                    <>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300">
                        {summaryText}
                      </p>
                      <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-600">
                        {summarySimulated ? "🔒 Simulado para demo" : "🔒 On-device · 0 llamadas de red"}
                      </p>
                    </>
                  )}
                </div>
              )}

              {activeTab === "chat" && (
                <div className="space-y-3">
                  <div className="max-h-56 space-y-2 overflow-y-auto">
                    {chatMessages.length === 0 && (
                      <p className="text-sm text-slate-500">
                        Haz cualquier pregunta sobre <strong>{activeEntry.term}</strong>…
                      </p>
                    )}
                    {chatMessages.map((m, i) => (
                      <div
                        key={i}
                        className={`rounded px-3 py-2 text-sm ${
                          m.role === "user"
                            ? "ml-6 bg-sky-950/40 text-sky-200"
                            : "mr-6 bg-slate-800 text-slate-300"
                        }`}
                      >
                        {m.text}
                      </div>
                    ))}
                    {chatLoading && <p className="text-xs text-slate-500">Pensando…</p>}
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleSendChat();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      className="flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={`Pregunta sobre ${activeEntry.term}…`}
                      disabled={chatLoading}
                    />
                    <button
                      type="submit"
                      disabled={chatLoading || !chatInput.trim()}
                      className="rounded bg-sky-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      →
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <p className="rounded border border-slate-800 bg-slate-950/60 px-3 py-2 text-[11px] text-slate-500">
        Esta explicación es orientativa. Consulta siempre con tu médico antes de tomar decisiones
        clínicas. Los datos procesados nunca salen de tu dispositivo.
      </p>
    </div>
  );
}
