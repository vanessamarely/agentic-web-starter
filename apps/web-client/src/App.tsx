import { useEffect, useState } from "react";
import { ContextualTriagePanel } from "./components/ContextualTriagePanel";
import { OrchestrationConsole } from "./components/OrchestrationConsole";
import { LocalGemmaAgentPanel } from "./components/LocalGemmaAgentPanel";
import { registerWebMcpTools } from "./mcp/webMcpTools";

type TabId = "nano" | "flash" | "gemma";

const TABS: Array<{ id: TabId; label: string; sublabel: string }> = [
  { id: "nano", label: "1 · Gemini Nano + WebMCP", sublabel: "Edge / navegador" },
  { id: "flash", label: "2 · Gemini Flash multi-agente", sublabel: "Cloud / orquestación" },
  { id: "gemma", label: "3 · Gemma local + WebMCP", sublabel: "Edge / modelo abierto" },
];

function tabFromHash(): TabId {
  const hash = window.location.hash.replace("#", "");
  if (hash === "flash" || hash === "gemma" || hash === "nano") return hash;
  return "nano";
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>(() => tabFromHash());

  useEffect(() => {
    registerWebMcpTools();
    const onHashChange = () => setActiveTab(tabFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const selectTab = (id: TabId) => {
    window.location.hash = id;
    setActiveTab(id);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-6 pt-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => selectTab(tab.id)}
              className={`whitespace-nowrap rounded-t-lg border border-b-0 px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-slate-700 bg-slate-900 text-slate-100"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <div>{tab.label}</div>
              <div className="text-[10px] font-normal uppercase tracking-wide text-slate-600">
                {tab.sublabel}
              </div>
            </button>
          ))}
        </div>
      </nav>

      {activeTab === "nano" && <ContextualTriagePanel />}
      {activeTab === "flash" && <OrchestrationConsole />}
      {activeTab === "gemma" && <LocalGemmaAgentPanel />}
    </div>
  );
}
