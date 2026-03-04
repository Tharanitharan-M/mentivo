// ─── AI Model Configuration ────────────────────────────────────────────────────
// To switch providers, update the import and model name here — one place only.
//
// Gemini (current):
import { google } from "@ai-sdk/google";
export const model = google("gemini-2.5-flash");
//
// OpenAI (example):
// import { openai } from '@ai-sdk/openai';
// export const model = openai('gpt-4o');
//
// Anthropic (example):
// import { anthropic } from '@ai-sdk/anthropic';
// export const model = anthropic('claude-3-5-sonnet-20241022');
// ──────────────────────────────────────────────────────────────────────────────
