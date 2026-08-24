import { useMemo, useState } from "react";
import { modules } from "./data/content";
import { StepContent } from "./components/StepContent";

interface FlatStep {
  globalIndex: number;
  moduleId: string;
  moduleTitle: string;
  moduleStepIndex: number;
  title: string;
  durationMinutes: number;
  blocks: (typeof modules)[number]["steps"][number]["blocks"];
}

function useFlatSteps(): FlatStep[] {
  return useMemo(() => {
    const flat: FlatStep[] = [];
    let globalIndex = 0;
    for (const mod of modules) {
      mod.steps.forEach((step, moduleStepIndex) => {
        flat.push({
          globalIndex,
          moduleId: mod.id,
          moduleTitle: mod.title,
          moduleStepIndex,
          title: step.title,
          durationMinutes: step.durationMinutes,
          blocks: step.blocks,
        });
        globalIndex += 1;
      });
    }
    return flat;
  }, []);
}

export default function App() {
  const flatSteps = useFlatSteps();
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalMinutes = useMemo(
    () => flatSteps.reduce((sum, step) => sum + step.durationMinutes, 0),
    [flatSteps],
  );
  const current = flatSteps[currentIndex]!;
  const progressPct = Math.round(((currentIndex + 1) / flatSteps.length) * 100);

  const goTo = (index: number) => {
    setCurrentIndex(() => Math.max(0, Math.min(flatSteps.length - 1, index)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const step = (delta: number) => {
    setCurrentIndex((i) => Math.max(0, Math.min(flatSteps.length - 1, i + delta)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="h-1 w-full bg-[#e8eaed]">
        <div
          className="h-1 bg-gdev-blue transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="mx-auto flex max-w-6xl">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-y-auto border-r border-[#e8eaed] px-4 py-6 lg:block">
          <p className="px-2 text-[11px] font-medium uppercase tracking-wide text-[#5f6368]">
            Building Agentic Apps
          </p>
          <p className="mb-4 px-2 text-[11px] text-[#9aa0a6]">
            con Gemini Flash y Nano · ~{totalMinutes} min
          </p>
          <nav className="space-y-4">
            {modules.map((mod) => (
              <div key={mod.id}>
                <p className="mb-1 px-2 text-[11px] font-medium uppercase tracking-wide text-[#80868b]">
                  {mod.title}
                </p>
                <ul>
                  {mod.steps.map((step, stepIndex) => {
                    const flatStep = flatSteps.find(
                      (f) => f.moduleId === mod.id && f.moduleStepIndex === stepIndex,
                    )!;
                    const isActive = flatStep.globalIndex === currentIndex;
                    const isDone = flatStep.globalIndex < currentIndex;
                    return (
                      <li key={step.title}>
                        <button
                          type="button"
                          onClick={() => goTo(flatStep.globalIndex)}
                          className={`flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-left text-[13.5px] ${
                            isActive
                              ? "bg-[#e8f0fe] font-medium text-gdev-blue"
                              : "text-[#3c4043] hover:bg-[#f1f3f4]"
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                              isDone
                                ? "bg-gdev-green text-white"
                                : isActive
                                  ? "bg-gdev-blue text-white"
                                  : "border border-[#9aa0a6] text-[#9aa0a6]"
                            }`}
                          >
                            {isDone ? "✓" : flatStep.globalIndex + 1}
                          </span>
                          <span className="truncate">{step.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-6 py-8 sm:px-10">
          <div className="mb-1 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-[#80868b]">
            <span>{current.moduleTitle}</span>
            <span>·</span>
            <span>Paso {currentIndex + 1} de {flatSteps.length}</span>
            <span>·</span>
            <span>~{current.durationMinutes} min</span>
          </div>
          <h1 className="mb-6 text-[28px] font-normal leading-tight text-[#202124]">
            {current.title}
          </h1>

          <StepContent blocks={current.blocks} />

          <div className="mt-10 flex items-center justify-between border-t border-[#e8eaed] pt-6">
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={currentIndex === 0}
              className="rounded border border-[#dadce0] px-4 py-2 text-sm font-medium text-[#3c4043] hover:bg-[#f1f3f4] disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Atrás
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={currentIndex === flatSteps.length - 1}
              className="rounded bg-gdev-blue px-5 py-2 text-sm font-medium text-white hover:bg-[#174ea6] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente →
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
