import { useEffect, useState } from "react";
import { subscribeToolCallLog, type ToolCallLogEntry } from "../mcp/toolCallLog";

const AGENT_LABEL: Record<ToolCallLogEntry["agent"], string> = {
  "gemini-nano": "Gemini Nano",
  "gemma-local": "Gemma (local)",
  manual: "UI",
};

const AGENT_COLOR: Record<ToolCallLogEntry["agent"], string> = {
  "gemini-nano": "text-sky-400",
  "gemma-local": "text-purple-400",
  manual: "text-slate-500",
};

function formatValue(value: unknown): string {
  if (value === undefined) return "—";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function ToolCallConsole() {
  const [entries, setEntries] = useState<ToolCallLogEntry[]>([]);

  useEffect(() => subscribeToolCallLog(setEntries), []);

  return (
    <div className="rounded-lg border border-slate-800 bg-black/40 p-3 font-mono text-xs">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Llamadas a herramientas WebMCP
        </span>
        <span className="text-slate-600">{entries.length} recientes</span>
      </div>
      {entries.length === 0 ? (
        <p className="py-2 text-slate-600">
          Aún no se han invocado herramientas. Escribe en las notas de campo para ver{" "}
          <code>extractVitals</code> dispararse en tiempo real.
        </p>
      ) : (
        <ul className="max-h-56 space-y-1.5 overflow-y-auto">
          {entries.map((entry) => (
            <li key={entry.id} className="border-l-2 border-slate-800 pl-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-300">{entry.toolName}()</span>
                <span className={AGENT_COLOR[entry.agent]}>{AGENT_LABEL[entry.agent]}</span>
                <span className="ml-auto text-slate-700">
                  {new Date(entry.timestamp).toLocaleTimeString([], {
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
              <div className="truncate text-slate-600">
                args: <span className="text-slate-500">{formatValue(entry.args)}</span>
              </div>
              <div className="truncate text-slate-600">
                → <span className="text-green-500/80">{formatValue(entry.result)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
