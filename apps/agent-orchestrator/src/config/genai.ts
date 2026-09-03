import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY is not set. Copy .env.example to .env and provide a Google Gen AI API key.",
  );
}

export const genAI = new GoogleGenAI({ apiKey });

export const GEMINI_MODEL = "gemini-3.7-flash";
