import { useCallback, useRef, useState } from "react";
import type { AiMode } from "./AiModeToggle";

type RecorderState = "idle" | "recording" | "transcribing" | "error";

const PREFERRED_MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];

function pickSupportedMimeType(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  return PREFERRED_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? null;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function VoiceNoteButton({
  onTranscript,
  mode = "ai-studio",
}: {
  onTranscript: (text: string) => void;
  mode?: AiMode;
}) {
  const [state, setState] = useState<RecorderState>("idle");
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const supported = typeof navigator !== "undefined" && !!navigator.mediaDevices && pickSupportedMimeType() !== null;

  const handleStop = useCallback(
    async (mimeType: string) => {
      setState("transcribing");
      try {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const audioBase64 = await blobToBase64(blob);
        const response = await fetch("/api/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audioBase64, mimeType: mimeType.split(";")[0], mode }),
        });
        const body = (await response.json()) as { transcript?: string; error?: string };
        if (!response.ok || !body.transcript) {
          throw new Error(body.error ?? `HTTP ${response.status}`);
        }
        onTranscript(body.transcript);
        setState("idle");
      } catch (err) {
        setState("error");
        setError(err instanceof Error ? err.message : "No se pudo transcribir el audio.");
      }
    },
    [mode, onTranscript],
  );

  const startRecording = useCallback(async () => {
    setError(null);
    const mimeType = pickSupportedMimeType();
    if (!mimeType) {
      setState("error");
      setError("Este navegador no soporta grabación de audio (MediaRecorder).");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        void handleStop(mimeType);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setState("recording");
    } catch {
      setState("error");
      setError("No se pudo acceder al micrófono. Revisa los permisos del navegador.");
    }
  }, [handleStop]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  if (!supported) return null;

  return (
    <div className="inline-flex items-center gap-2">
      {state === "recording" ? (
        <button
          type="button"
          onClick={stopRecording}
          className="flex items-center gap-1.5 rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> Detener grabación
        </button>
      ) : (
        <button
          type="button"
          onClick={startRecording}
          disabled={state === "transcribing"}
          className="rounded border border-amber-800 bg-amber-950/60 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-900/60 disabled:opacity-50"
        >
          {state === "transcribing" ? "Transcribiendo…" : "🎙️ Dictar nota de voz"}
        </button>
      )}
      <span className="rounded bg-amber-950 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-500">
        ☁️ {mode === "agent-platform" ? "Nube · Agent Platform" : "Nube · AI Studio"}
      </span>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
