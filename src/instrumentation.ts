// ─── Next.js Instrumentation Hook ────────────────────────────────────────────
// Next.js automatically runs this file at server startup (App Router).
// We register an OpenTelemetry provider that exports all AI SDK traces
// to Langfuse, giving us per-call latency, token usage, and prompt lineage.
//
// Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
// ─────────────────────────────────────────────────────────────────────────────

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { registerOTel } = await import('@vercel/otel')
    const { langfuseExporter } = await import('./lib/observability')

    registerOTel({
      serviceName: 'mentivo',
      traceExporter: langfuseExporter,
    })
  }
}
