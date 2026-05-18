# Mentivo — Design System

Last updated: 2026-05-17

A working document for the visual and editorial direction of mentivo.app.
The goal is for the marketing site to feel like a product made by people who
care — not like a Midjourney-blended SaaS template.

---

## 1. The problem we're solving

The previous landing page exhibited most of the patterns the industry now
recognises as "AI slop":

| Pattern                                              | Where it appeared                  | Why it reads as fake                                 |
| ---------------------------------------------------- | ---------------------------------- | ---------------------------------------------------- |
| Fabricated user counts ("2,400+ developers")         | Hero social-proof, Stats, CTA      | Pre-launch products don't have crowds                |
| Fabricated completion-rate stat ("94% vs 13%")       | Stats, Testimonials                | Implied study with no source = signal of dishonesty  |
| Invented testimonials with avatars + 5-star ratings  | CTA scrolling columns              | Generic first-names + initials are a tell            |
| Pulsing coloured dot on every chip/label             | Hero, Navbar, Stats, CTA           | Decorative "liveness theatre"; nothing is happening  |
| Rainbow accent palette                               | All sections                       | Blue, purple, orange, green, cyan, rose all at once  |
| Gradient text on every emphasis word                 | Hero, Features, CTA                | Treats type as decoration, not hierarchy             |
| Glow / coloured drop-shadows on every card           | Hero floats, CTA card              | The visual equivalent of "AI-generated" lighting     |
| Mac-traffic-light browser chrome on tiny floats      | Hero, HowItWorks frames            | Bauhaus-grade overuse                                |
| "AI-powered" pill at top of hero                     | Hero tag                           | Says nothing; every site has it                      |

These are not individually bad. They are bad in combination, used as
substitutes for substance.

---

## 2. What credible product companies actually do

A quick scan of sites users perceive as polished and trustworthy:

**Linear** (linear.app). Off-black background that's warm, not blue.
Pure white headlines. One accent — a muted purple — used sparingly.
Type does the hierarchy work; colour does not. Heavy use of real product
screenshots, not mock floats.

**Vercel** (vercel.com). Pure black + pure white + geist. The product is
the protagonist. No fake numbers; instead, named customer logos.

**Stripe** (stripe.com). Restrained palette, lots of whitespace, an
editorial feel. Numbers shown are real ($1T+ processed), sourced, dated.

**Anthropic** (anthropic.com). Warm cream + near-black with one warm
orange accent. Serif headlines. Almost no chrome. Editorial confidence.

**Raycast** (raycast.com). Subtle gradient backgrounds, soft pastels,
beautiful typography. Motion is felt, never seen.

**Arc / The Browser Company** (arc.net). Bold, oversized type carries
the page. Colour is functional, not decorative.

**Common thread:**

1. One brand colour, used as accent — not as identity
2. Real screenshots over invented chrome
3. Type hierarchy carries the page (size + weight, not gradient + glow)
4. Whitespace is treated as content
5. Motion is calm and purposeful — entrance, hover, focus — never ambient
6. Copy is specific. No "AI-powered". No "leverage". No fake metrics.

---

## 3. The Mentivo system

### 3.1 Palette

We move from the cold blue/purple SaaS default to a **warm editorial dark**.
Mentivo is about humans learning — the palette should feel human.

| Token            | Hex / value                         | Use                                      |
| ---------------- | ----------------------------------- | ---------------------------------------- |
| `--bg`           | `#0b0a09`                           | Page background (stone-950 warm-shifted) |
| `--bg-elevated`  | `#131110`                           | Cards, surfaces on hover                 |
| `--surface`      | `rgba(250, 250, 249, 0.025)`        | Default card fill                        |
| `--surface-2`    | `rgba(250, 250, 249, 0.045)`        | Hover                                    |
| `--border`       | `rgba(250, 250, 249, 0.08)`         | Hairlines                                |
| `--border-2`     | `rgba(250, 250, 249, 0.14)`         | Hover hairlines                          |
| `--text-1`       | `#fafaf9`                           | Primary text (stone-50)                  |
| `--text-2`       | `#a8a29e`                           | Secondary text (stone-400)               |
| `--text-3`       | `#78716c`                           | Tertiary, labels (stone-500)             |
| `--text-4`       | `#44403c`                           | Disabled / hint (stone-700)              |
| `--accent`       | `#f59e0b`                           | The Mentivo amber. **Single** accent.    |
| `--accent-soft`  | `rgba(245, 158, 11, 0.12)`          | Amber tint surface                       |
| `--accent-line`  | `rgba(245, 158, 11, 0.32)`          | Amber border                             |
| `--success`      | `#84cc16`                           | Reserved for "done" / completed states   |
| `--danger`       | `#ef4444`                           | Reserved for genuine error UI            |

Rules:

- **One accent.** Amber. Use blue, green, purple, cyan, rose nowhere on
  the marketing site. Success/error are utility colours, not decoration.
- Cards never get a coloured background — only a coloured **inset
  border** on hover at most. The page stays calm.
- No glow blobs behind sections. No coloured drop-shadows. If lighting
  is needed, it's a soft warm radial at <8% opacity.

### 3.2 Type

- Family: Geist Sans (kept). Geist Mono for code/identifier moments only.
- Headlines tighten: `tracking-[-0.035em]`, `leading-[0.96]`, weight 600.
  No `font-black` (900) — it reads as "AI poster".
- Display sizes: hero h1 `clamp(48px, 6vw, 76px)`; section h2 `clamp(34px, 4vw, 48px)`.
- Body: 16px / 1.65 on hero, 15px / 1.7 elsewhere.
- Eyebrow labels: 11px, weight 500, `tracking-[0.18em]`, uppercase,
  `text-3` colour, no chip background, no pulsing dot. Just a short
  rule on the left and the label text.

### 3.3 Motion

Motion supports content; it should never demand attention.

- Entrance: `opacity 0 → 1` and `y: 14 → 0`, duration `0.6s`, `power2.out`.
  No 60px drops. No bounces (`back.out`) — those are children's toys.
- Stagger: `0.06s` max between siblings.
- Hover on interactive surfaces: 120ms ease — `border-color` and
  `background` shift, optional `translateY(-1px)`. Never scale.
- Parallax: reserved for the hero mockup only, very subtle.
- **No infinite loops.** The previous CTA had two columns scrolling
  forever — that's noise, not motion. Replaced by a static, honest
  comparison block.
- No `animate-pulse` on dots. No shimmer on every button (kept only on
  primary CTA, slowed to 5s).

### 3.4 Components

**Eyebrow** — replaces the old `section-label`:

```
┃ The process            (11px uppercase, tracked, text-3)
```

A 12px-wide amber rule on the left, then the label. No pill, no dot.

**Primary button** — solid amber on `text-1` (`bg-amber-500 text-stone-950`),
slight inset shadow, 14px weight-600. Shimmer kept but slowed to 5s and
delayed 3s on first paint.

**Secondary button** — `bg-transparent border border-[--border]
text-[--text-1]`. Hover: `border-[--border-2]`.

**Card** — `bg-[--surface] border border-[--border] rounded-2xl`.
Hover: `bg-[--surface-2] border-[--border-2] -translate-y-[1px]`.
No coloured backgrounds. No coloured borders by default.

**Screenshot frame** — the existing window-chrome treatment is good for
the **main** hero shot. Smaller previews use a simpler frame: hairline
border, no traffic lights, a single muted caption above the image. Less
mac-OS cosplay.

### 3.5 Content principles

- **No invented metrics.** If we cannot source it, we don't print it.
- **No invented testimonials.** Until real ones exist, we use product
  truth: the philosophy, what's included, what's different.
- **No "AI-powered" framing.** That's a category, not a value prop.
  We say what it does in plain English: "Builds real projects with you,
  one line at a time."
- **Honest comparison over fake praise.** A direct, calm comparison
  table (Tutorials / AI codegen / Mentivo) earns trust faster than five
  invented quotes.
- **Specificity over adjectives.** "Write every line yourself" beats
  "powerful learning experience."

---

## 4. Section-by-section direction

### 4.1 Navbar
- Calmer scrolled state: background `rgba(11, 10, 9, 0.72)`, backdrop
  blur, hairline bottom border. No shadow.
- Primary CTA shifts from blue to amber.

### 4.2 Hero
- Eyebrow becomes "An AI coding mentor" — no pulsing dot, no chip.
- Headline structure unchanged but `gradient-text-blue` is replaced by
  a clean `text-amber-400` on "teaches you" — single word emphasis.
- Remove the "2,400+ developers building right now" line and the
  rainbow avatar stack. Replace with one honest line: a short product
  promise ("No installs. No copy-paste. One real project at a time.")
  set in `text-3` with an amber leading rule.
- Floating "Roadmap created" stat chip removed — it's staged trophy art.
- Floating dashboard card kept (real product surface). Floating
  "learning session" card kept on xl.

### 4.3 Stats → Principles
Section replaced. Instead of fake numbers, three plain statements that
read like a manifesto. No counters, no `+` suffixes. Eyebrow: "Why
Mentivo exists".

### 4.4 Features (bento)
- Same bento layout, same cards, same copy.
- Per-card accent palette removed; cards use a single neutral surface.
- The `#1 feature` badge becomes an amber eyebrow inside the card head.
- Icon chips: neutral surface with amber stroke only for the lead card.

### 4.5 How It Works
- Same 5-step structure (it works).
- Per-step rainbow tints (blue / orange / green / amber / violet)
  replaced by amber for all steps. Step number badge uses the amber
  tint at varying opacity (1.0 → 0.6) to show progression.
- Big background numbers stay (they're tasteful) but shift to neutral
  stone-800 at 50% opacity.

### 4.6 CTA → Comparison + Final CTA
- Scrolling fake testimonials **removed**.
- Replaced with a **comparison block**: three columns —
  "YouTube tutorials" / "AI codegen tools" / "Mentivo" — each with a
  short row-by-row honest comparison. This is the trust move.
- Final CTA card simplified: warm dark, single amber border line on
  top, no glow blob. Two buttons. Three "what's included" chips below.

### 4.7 Footer
- Drop the gradient hairline. Single hairline border. Stone-700 text.

---

## 5. Files touched

- `src/app/globals.css` — palette + utilities
- `src/app/page.tsx` — section order, replaces `<StatsSection>` with
  `<PrinciplesSection>`, splits old `<CTASection>` into
  `<ComparisonSection>` + final CTA inside `<CTASection>`
- `src/components/landing/Navbar.tsx`
- `src/components/landing/HeroSection.tsx`
- `src/components/landing/PrinciplesSection.tsx` *(new)*
- `src/components/landing/FeaturesSection.tsx`
- `src/components/landing/HowItWorks.tsx`
- `src/components/landing/ComparisonSection.tsx` *(new)*
- `src/components/landing/CTASection.tsx`
- `src/components/landing/Footer.tsx`

The old `StatsSection.tsx` is removed because its job (fake metrics)
no longer exists. The old `CTASection.tsx` keeps the file but loses
the testimonials block.

---

## 6. What we're *not* doing

To stay disciplined:

- No carousel of "AS SEEN IN" logos we don't have.
- No customer-logo grid until we have customers.
- No "Trusted by teams at" line.
- No 3D illustrations / Spline scenes / Three.js gradient meshes.
- No floating "Online — 42 building now" widgets.
- No countdown timers, "limited spots", or scarcity tropes.
- No noise grain on top of the whole page — the previous `noise`
  utility is kept in CSS but not applied site-wide.
