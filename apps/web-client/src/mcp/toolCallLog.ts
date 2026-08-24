export interface ToolCallLogEntry {
  id: string;
  toolName: string;
  args: unknown;
  result: unknown;
  timestamp: string;
  agent: "gemini-nano" | "gemma-local" | "manual";
}

type Listener = (entries: ToolCallLogEntry[]) => void;

let entries: ToolCallLogEntry[] = [];
const listeners = new Set<Listener>();

export function logToolCall(entry: Omit<ToolCallLogEntry, "id" | "timestamp">): void {
  entries = [
    {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    },
    ...entries,
  ].slice(0, 30);
  listeners.forEach((listener) => listener(entries));
}

export function subscribeToolCallLog(listener: Listener): () => void {
  listeners.add(listener);
  listener(entries);
  return () => {
    listeners.delete(listener);
  };
}

export function clearToolCallLog(): void {
  entries = [];
  listeners.forEach((listener) => listener(entries));
}
