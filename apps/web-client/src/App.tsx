import { useEffect } from "react";
import { ContextualTriagePanel } from "./components/ContextualTriagePanel";
import { registerWebMcpTools } from "./mcp/webMcpTools";

export default function App() {
  useEffect(() => {
    registerWebMcpTools();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <ContextualTriagePanel />
    </div>
  );
}
