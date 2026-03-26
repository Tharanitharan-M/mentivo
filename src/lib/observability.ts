// ─── Langfuse Observability ───────────────────────────────────────────────────
// Creates the Langfuse exporter that OpenTelemetry will use to ship traces.
// Imported by src/instrumentation.ts which Next.js loads at startup.
//
// Required env vars (add to .env.local):
//   LANGFUSE_PUBLIC_KEY
//   LANGFUSE_SECRET_KEY
//   LANGFUSE_BASEURL  (defaults to https://cloud.langfuse.com)
// ─────────────────────────────────────────────────────────────────────────────

import { LangfuseExporter } from 'langfuse-vercel'

export const langfuseExporter = new LangfuseExporter({
  // Credentials are read from LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY env vars
  // by the LangfuseExporter constructor automatically.
  debug: process.env.NODE_ENV === 'development',
})
