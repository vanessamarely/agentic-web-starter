export type AiMode = "ai-studio" | "agent-platform";

const OPTIONS: Array<{ id: AiMode; label: string; hint: string }> = [
  { id: "ai-studio", label: "Google AI Studio", hint: "API key · gratis / tus créditos" },
  { id: "agent-platform", label: "Agent Platform", hint: "ADC · créditos de GCP" },
];

/**
 * Lets a demo run against either Google AI Studio (an API key) or the
 * Gemini Enterprise Agent Platform (Application Default Credentials,
 * billed against GCP credits) — both call the same gemini-3.7-flash model.
 */
export function AiModeToggle({
  mode,
  onChange,
  className = "",
}: {
  mode: AiMode;
  onChange: (mode: AiMode) => void;
  className?: string;
}) {
  return (
    <div className={`inline-flex rounded-full border border-slate-700 bg-slate-950/60 p-0.5 ${className}`}>
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          title={option.hint}
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
            mode === option.id
              ? option.id === "ai-studio"
                ? "bg-sky-600 text-white"
                : "bg-purple-600 text-white"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
