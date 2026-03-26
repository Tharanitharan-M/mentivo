import type { NextConfig } from "next";

// ─── Content Security Policy ──────────────────────────────────────────────────
// Restricts which resources browsers can load, significantly reducing XSS
// attack surface. Particularly important here because:
//   1. We render AI-generated HTML inside milestone workspace iframes
//   2. We load external scripts (Monaco editor CDN, Google fonts)
//
// The sandbox iframe for learner code is handled at the component level with
// the `sandbox` attribute — CSP here covers the main app shell.
// ─────────────────────────────────────────────────────────────────────────────

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob: https://lh3.googleusercontent.com;
  connect-src 'self' https://*.neon.tech https://generativelanguage.googleapis.com https://us.cloud.langfuse.com;
  frame-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\n/g, " ").trim();

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy,
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
