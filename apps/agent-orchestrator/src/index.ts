import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { z } from "zod";
import {
  MedicalResourceRequestSchema,
  PatientTriageRecordSchema,
} from "@agentic-web-starter/shared-types";
import { runOrchestration } from "./agents/orchestrator.js";
import { transcribeAudio } from "./services/transcription.js";

const OrchestrateRequestSchema = z.object({
  patient: PatientTriageRecordSchema,
  regionId: z.string().min(1),
  resourceRequests: z.array(MedicalResourceRequestSchema).optional(),
});

const TranscribeRequestSchema = z.object({
  audioBase64: z.string().min(1),
  mimeType: z.string().min(1),
});

const app = express();
const port = Number.parseInt(process.env.PORT ?? "8787", 10);

app.use(cors());
// Voice-note audio, base64-encoded, needs more headroom than JSON API calls;
// Gemini's inline-data limit is 20MB total per request.
app.use(express.json({ limit: "20mb" }));

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/api/orchestrate", (req: Request, res: Response, next: NextFunction) => {
  const parsed = OrchestrateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", issues: parsed.error.issues });
    return;
  }

  runOrchestration(parsed.data)
    .then((result) => res.json(result))
    .catch(next);
});

app.post("/api/transcribe", (req: Request, res: Response, next: NextFunction) => {
  const parsed = TranscribeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", issues: parsed.error.issues });
    return;
  }

  transcribeAudio(parsed.data)
    .then((transcript) => res.json({ transcript }))
    .catch(next);
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({ error: message });
});

app.listen(port, () => {
  console.log(`Agent orchestrator listening on http://localhost:${port}`);
});
