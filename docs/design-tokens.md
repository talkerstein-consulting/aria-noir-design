# Aria Noir — Atomic Design Token Reference

Every value below is extracted verbatim from the build — [tokens.css](../src/styles/tokens.css), [typography.css](../src/styles/typography.css), [interactions.css](../src/styles/interactions.css), [commerce.css](../src/styles/commerce.css), and [layout.tsx](../src/app/layout.tsx). Nothing here is invented. For the *behavioral* / when-to-use vocabulary of each component, [STYLE-GUIDE.md](../STYLE-GUIDE.md) is the house's own reference and takes precedence if the two ever disagree.

> **Filename note:** this file lives under `docs/` rather than at the repo root, because this filesystem is case-insensitive — a `style-guide.md` at the root silently collides with `STYLE-GUIDE.md` and overwrites it. Keep this reference here, not back at the root under a same-named-but-cased file.

The site's two governing rules, restated because they shape every atom below: **no fills, no radii, no shadows** (the site is hairlines and type — the one exception is the held heart, which fills), and **colour is never the only carrier of a state**.

---

## 1. Foundations (Tokens)

### 1.1 Color

Three inks total. The site is a black page that turns white once, with gold as the only chromatic accent.

| Token | Value | Use |
|---|---|---|
| `--ink` | `#000000` | The dark ground — ~90% of the site. |
| `--paper` | `#ffffff` | The light ground — finale + footer, past the white iris. |
| `--gold` | `#c6a664` | Accent fills and text-on-ink. ~2:1 contrast on paper — do not set gold text on a light ground. |
| `--gold-on-light` | `#6f5622` | Gold TEXT on light sections only (WCAG-legible variant of `--gold`). |

**Semantic ramp** — named by job, not by opacity. Components read these, never raw colors. Two mirrored halves: `-dark` for content on `--ink`, `-light` for content on `--paper`.

| Token (dark / on-ink) | Value | Token (light / on-paper) | Value |
|---|---|---|---|
| `--text-primary-dark` | `var(--paper)` | `--text-primary-light` | `var(--ink)` |
| `--text-secondary-dark` | `color-mix(in srgb, var(--paper) 70%, transparent)` | `--text-secondary-light` | `color-mix(in srgb, var(--ink) 70%, transparent)` |
| `--text-tertiary-dark` | `color-mix(in srgb, var(--paper) 50%, transparent)` | `--text-tertiary-light` | `color-mix(in srgb, var(--ink) 60%, transparent)` |
| `--text-quiet-dark` | `color-mix(in srgb, var(--paper) 40%, transparent)` | `--text-quiet-light` | `color-mix(in srgb, var(--ink) 40%, transparent)` |
| `--text-accent-dark` | `var(--gold)` | `--text-accent-light` | `var(--gold-on-light)` |
| `--rule-dark` | `color-mix(in srgb, var(--paper) 15%, transparent)` | `--rule-light` | `color-mix(in srgb, var(--ink) 10%, transparent)` |

**Rule:** never reach for `--text-primary-dark` etc. directly in a component. A section declares its ground with `.on-ink` / `.on-paper` (from `typography.css`), which resolves an indirection layer components actually read:

```css
/* .on-ink / .on-paper / body (default) set: */
--fg-primary   /* headings, the thing being bought */
--fg-secondary /* body copy on ink */
--fg-tertiary  /* supporting body, paragraph under a heading */
--fg-quiet     /* labels, eyebrows, prices in a list */
--fg-accent    /* errors, the one mark on a progress bar — never decoration */
--fg-rule      /* every hairline */
--ground       /* the raw --ink or --paper */
```

```tsx
<section className="on-ink ...">   {/* or on-paper */}
  <p style={{ color: "var(--fg-secondary)" }}>…</p>
</section>
```

### 1.2 Text (Typography)

**Font families** — two, permanently. Loaded via `next/font/google` in [layout.tsx](../src/app/layout.tsx:6):

| Family | Token | Weights | Role |
|---|---|---|---|
| Libre Bodoni | `--font-display` (`var(--font-display-stack)`, fallback Georgia/"Times New Roman"/serif) | 400, 500, 600, 700 (+ italic) | Headings, pull quotes, the wordmark. Never a label. |
| Manrope | `--font-ui` (`var(--font-ui-stack)`, fallback ui-sans-serif/system-ui/sans-serif) | 400, 500, 600, 700, 800 | Body, labels, CTAs, fields. |
| IBM Plex Mono | `--font-mono` (`var(--font-mono-stack)`, fallback ui-monospace/"SF Mono"/Menlo/Consolas/monospace) | 400, 500, 600, 700 | Header chrome only (`MENU`/`CLOSE`), step indices, route paths, the bag tally — fixed advance width so a label swap never resizes its box. |

**Display scale** — fluid `clamp()`, so breakpoint step-ups collapse into one value. Leading gets *tighter* as size grows.

| Class | Token | `clamp()` | Line-height | Was |
|---|---|---|---|---|
| `.t-display-hero` | `--display-hero` | `clamp(3.5rem, 17vw, 12rem)` | `--leading-display-hero: 0.82` | `19vw → sm:15vw → 12rem` (product hero name only) |
| `.t-display-xl` | `--display-xl` | `clamp(3rem, 9vw, 6rem)` | `--leading-display-xl: 1.02` | `text-5xl → sm:7xl → md:8xl` |
| `.t-display-lg` | `--display-lg` | `clamp(2.25rem, 6.5vw, 3.75rem)` | `--leading-display-lg: 1.05` | `text-4xl → sm:6xl` |
| `.t-display-md` | `--display-md` | `clamp(1.875rem, 4.5vw, 3rem)` | `--leading-display-md: 1.12` | `text-3xl → sm:5xl` |
| — | `--display-sm` | `clamp(1.25rem, 2.6vw, 1.875rem)` | `--leading-display-quote: 1.3` | pull quotes (`.t-quote`, italic) |
| `.t-display-xs` | `--display-xs` | `clamp(1rem, 1.6vw, 1.25rem)` | `--leading-display-xs: 1.35` | hero standfirst, mixed roman/italic |

**Body / UI scale** — `--leading-body: 1.65`.

| Token | Size | Use |
|---|---|---|
| `--text-eyebrow` | `0.6875rem` (11px) | The single most-used size on the site — labels, eyebrows, crumbs. |
| `--text-micro` | `0.625rem` (10px) | Legal, HUD, rail text; also the bag's tally at `0.5625rem` in commerce.css. |
| `--text-caption` | `0.75rem` (12px) | `.t-caption` |
| `--text-body-sm` | `0.875rem` (14px) | Default body (`.t-body` below 640px) |
| `--text-body` | `1rem` (16px) | Body on wide viewports (`.t-body` at ≥640px) |
| `--text-body-lg` | `1.125rem` (18px) | Light-section lede (`.t-body--lede` at ≥640px), buy-page price |

**Tracking** — two directions only. Display tightens; small uppercase type opens.

| Token | Value | Use |
|---|---|---|
| `--track-display` | `-0.02em` | Display headings |
| `--track-body` | `-0.01em` | Body copy |
| `--track-label` | `0.3em` | Uppercase labels, colourway lists |
| `--track-eyebrow` | `0.35em` | Section eyebrows — the house value |
| `--track-wide` | `0.4em` | Rare extra-open rail / caption |

**Weights** — Manrope 700 bold on `.cta-main`, 700 bold on `.cta-buy` (bordered rather than underlined, so the same weight reads as commerce rather than navigation), 400 default body/fields.

### 1.3 Grid & Spacing

| Token | Value | Role |
|---|---|---|
| `--gutter` | `1.5rem` | Page gutter, mobile (`px-6`) |
| `--gutter-wide` | `2.5rem` | Page gutter, ≥640px (`sm:px-10`) |
| `--page-measure` | `80rem` | The page's column (`max-w-7xl`) — every section holding words or a grid is `mx-auto max-w-7xl`. |
| `--section-pad` | `8rem` | Section vertical padding (`py-32`) |
| `--section-pad-wide` | `12rem` | Section vertical padding, ≥640px (`sm:py-48`) |

**Breakpoints in use** (Tailwind defaults, referenced directly in CSS): `640px` (sm), `768px` (md), `1024px` (lg — the buy-grid two-column split).

**Stack scale** — the vertical rhythm *inside* a section.

| Class | Token | Value |
|---|---|---|
| — | `--stack-xs` | `0.5rem` |
| — | `--stack-sm` | `1rem` |
| `.stack` (default) | `--stack-md` | `1.5rem` |
| `.stack--lg` | `--stack-lg` | `2.5rem` |
| `.stack--xl` | `--stack-xl` | `4rem` |
| `.stack--2xl` | `--stack-2xl` | `6rem` |

**Measure** (body copy line length) — the only three in use:

| Token | Value | Class |
|---|---|---|
| `--measure-tight` | `52ch` | `.t-body--tight`, `.t-caption` |
| `--measure` | `62ch` | `.t-body` default |
| `--measure-wide` | `68ch` | `.t-body--wide` |

**Interaction geometry**

| Token | Value | Role |
|---|---|---|
| `--rule-weight` | `1px` | Every line on the site is a hairline. There is no second rule weight. |
| `--cta-gap` | `6px` | CTA label → its underline |
| `--focus-offset` | `4px` | |

**Motion**

| Token | Value | Job |
|---|---|---|
| `--ease-inout` | `cubic-bezier(0.65, 0, 0.35, 1)` | Swaps: glyph shuffles, rule sweeps |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Arrivals: reveals, plates, rises |
| `--ease-inout-strong` | `cubic-bezier(0.83, 0, 0.17, 1)` | Choreographed scene beats |
| `--dur-fast` | `0.3s` | Hover colour changes |
| `--dur-base` | `0.45s` | Glyph shuffle / control state change |
| `--dur-slow` | `0.5s` | Rule sweep |
| `--dur-reveal` | `0.85s` | Plate wipe |
| `--dur-scene` | `0.9s` | Full-section rise |

---

## 2. Atoms

### 2.1 CTA (Buttons & Links)

**Exactly two classes: main is FILLED, secondary is OUTLINED.** `cta-link.tsx` exposes them as `kind="main"` (default) or `kind="secondary"` — there is no `tone`, `variant`, `bare`, `strong` or `buy` prop any more. Context that used to be a third visual style is now `aria-current` (current page) or the section's own `.on-ink`/`.on-paper` ground.

Both are the **same box** — same padding, same type, same square corners, same shuffle. Fill versus outline is the only difference.

```css
/* the shared box */
.cta-main,
.cta-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1em 2em;              /* 1x block, 2x inline */
  border: var(--rule-weight) solid transparent;
  border-radius: 0;              /* no radii, ever */
  font-family: var(--font-ui-stack);
  font-weight: 700;
  font-size: var(--text-eyebrow);
  letter-spacing: var(--track-label);
  text-transform: uppercase;
  text-align: center;
  cursor: pointer;
  transition:
    background-color var(--dur-fast) ease, border-color var(--dur-fast) ease,
    color var(--dur-fast) ease, opacity var(--dur-fast) ease;
}
```

**`.cta-main` — solid fill.** The one thing the screen wants done. Fills with the section's own foreground and sets its label in the section's own ground, so it inverts correctly on ink and on paper without being told which it is on.

```css
.cta-main {
  background: var(--fg-primary);
  border-color: var(--fg-primary);
  color: var(--ground);
}
.cta-main:hover, .cta-main:focus-visible {
  background: var(--fg-accent); border-color: var(--fg-accent); color: var(--ground);
}
.cta-main:active {
  background: var(--fg-accent); border-color: var(--fg-accent);
  color: var(--ground); opacity: 0.85;
}
.cta-main:focus-visible {
  outline: var(--rule-weight) solid var(--fg-accent);
  outline-offset: var(--focus-offset);
}
.cta-main:disabled, .cta-main[aria-disabled="true"] { opacity: 0.4; cursor: not-allowed; }
.cta-main[aria-current="page"] {
  background: var(--fg-accent); border-color: var(--fg-accent); color: var(--ground);
}
```

**`.cta-secondary` — the outline.** The second action in a section, where two fills would fight.

```css
.cta-secondary {
  background: transparent;
  border-color: var(--fg-rule);
  color: var(--fg-primary);
}
.cta-secondary:hover, .cta-secondary:focus-visible {
  border-color: var(--fg-accent); color: var(--fg-accent);
}
.cta-secondary:active {
  border-color: var(--fg-accent); color: var(--fg-accent);
  background: color-mix(in srgb, var(--fg-accent) 12%, transparent);
}
```

**One main per screen.** Both carry the glyph shuffle; on a phone both go full-span unless they share a row (`.buy-row`).

```tsx
<CtaButton alt="In the bag" swapped={added !== null} onClick={addToBag}>
  Add to bag
</CtaButton>
<CtaLink href={buyHref} kind="secondary">Product spec</CtaLink>
```

> **Ground is mandatory.** Because the main CTA fills with `--fg-primary` and labels in `--ground`, a section that paints `bg-paper` without declaring `.on-paper` renders a white fill on a white page. Every section declares its ground.

**`.menu-link` — the menu stack.** Navigation, not a CTA: no box, no fill, no outline, just the shuffle. Six filled blocks down the middle of a black page is a form, not a menu. See `NavShuffleLink` in `cta-link.tsx`.

**`.link-quiet` — nav, footer, list links.** Colour shift only, no rule, no motion.

```css
.link-quiet {
  font-family: var(--font-ui-stack);
  font-size: var(--text-body-sm);
  color: var(--fg-secondary);
  transition: color var(--dur-fast) ease;
}
.link-quiet:hover, .link-quiet:focus-visible { color: var(--fg-primary); }
```

**Interaction states, all controls:**

| State | Treatment |
|---|---|
| Hover | Colour → `--fg-accent` (border-color for `.cta-buy` / `.swatch` / `.qty`) |
| Focus-visible | `outline: var(--rule-weight) solid var(--fg-accent); outline-offset: var(--focus-offset);` — never `outline: none` without this replacement |
| Active | `.cta-main` dims to 0.75 opacity at accent colour; `.cta-buy` tints its background `color-mix(in srgb, var(--fg-accent) 12%, transparent)` |
| Disabled | `opacity: 0.4` + `cursor: not-allowed`, word changes (e.g. *Out of the workshop*) — never hidden |
| Reduced motion | Transition duration drops to `0.01ms`; travel removed, colour change kept (colour is information) |

---

## 3. Molecules & Organisms

### 3.1 Card

One recipe, six surfaces: `cart-table.tsx`, `also-like.tsx`, `held-view.tsx`, `house-grid.tsx`, and `house-index.tsx` (×2).

- **Image aspect ratio:** **square** — `.card-shot` (`aspect-ratio: 1/1`), declared once in `interactions.css`, never as a per-file utility class
- **Border radius:** `0` (none — house rule: no radii)
- **Shadow:** `none` (house rule: no shadows)
- **Border:** none on the card itself — the surrounding hairline is the section's own rule, not a per-card border
- **Background fill:** `bg-ink` behind the photograph (or the acetate swatch, for a colourway the shoot has not reached)
- **Internal spacing:** `gap-3` (0.75rem) between image and text block
- **Focus ring:** the card's own gold ring, not the UA default — `.card-link:focus-visible`

```css
.card-shot {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
}
```

```tsx
<Link href={`/shop/${slug}`} className="card-link group flex flex-col gap-3">
  <div className="card-shot bg-ink">
    <Image src={shot} alt="" fill className="object-cover" />
  </div>
  <h3 className="card-name">{house.name}</h3>
  <p className="t-caption">{colourwayNote}</p>
</Link>
```

> Square is the **card's** shape, not the site's. The story and campaign plates — `product-opening`, `product-spec`, `text-pair`, `sticky-study`, `buy-campaign` — stay at `aspect-[4/5]`: those are a photographic rhythm running down a column, and a card is an object in a grid.

**The swatch card** (`.swatch` / `.swatch--thumb`) follows the same no-radius, hairline-only rule at object scale: a square inset by a 1px border rather than filling the box.

### 3.2 Section

```css
.section {
  padding-inline: var(--gutter);
  padding-block: var(--section-pad);
}
@media (min-width: 640px) {
  .section { padding-inline: var(--gutter-wide); padding-block: var(--section-pad-wide); }
}
.section--flush { padding-block: 0; } /* full-bleed plates */
```

Sections holding words or a grid use `mx-auto max-w-7xl` (`--page-measure`) on the content column; every section declares `.on-ink` or `.on-paper` explicitly — the header reads that declaration to choose its own tone.

---

## 4. Design rules & conventions

The client-supplied checklist, reconciled against the build. Status keys:
✅ already the house rule · ⚠️ flagged conflict, needs sign-off · 🆕 new convention, nothing existing contradicts it.

**CTAs are now fully aligned** — the "main + buy, two classes only" rule below has been implemented across `interactions.css`, `cta-link.tsx`, and every call site; it is no longer a flagged conflict.

### 4.1 Grid
| Rule | Status | Note |
|---|---|---|
| Bound layout by a fixed width unless stated otherwise | ✅ | `--page-measure: 80rem`. |
| Proper margins on mobile, all around | ✅ | `--gutter: 1.5rem` mobile, `--gutter-wide: 2.5rem` ≥640px. |
| No horizontal scrollbar unless stated otherwise | ✅ | `.buy-page { overflow-x: clip; }`; breadcrumbs truncate. |

### 4.2 Color tokens
| Rule | Status | Note |
|---|---|---|
| WCAG AA/AAA-compliant combinations on all usages | ⚠️ **partial** | `--gold` on `--paper` is ~2:1 — not AA. Always read `--fg-accent` (never raw `--gold`) so the ground picks the compliant variant automatically. |

### 4.3 Iconography
| Rule | Status | Note |
|---|---|---|
| lucide-react by default | ✅ | `.nav-icon`, 1.125rem glyph, stroke-width 1.25. |
| Chevrons over arrows unless stated | 🆕 | No conflicting usage; apply to any new directional icon. |

### 4.4 CTAs
| Rule | Status | Note |
|---|---|---|
| Button padding: 1× top/bottom, 2× left/right | ✅ | `padding: 1em 2em` on the shared CTA box. |
| Mobile 2-column CTA layout mirrors desktop 2-CTA layout | 🆕 | No current multi-CTA row to violate this — apply when building one. |
| Icon padding, icon → check on pressed state | 🆕 | Model on `.hold-toggle` (heart outline → filled) when built. |
| Static / hover / active / disabled on every button | ✅ | Both `.cta-main` and `.cta-buy` now define all four. |
| Main CTA = filled, secondary = outline | ✅ | Implemented — `.cta-main` solid fill, `.cta-secondary` outlined, both square-cornered. See §2.1. |
| Error text shown when a deactivated button is pressed | 🆕 | Extend `.field-error`'s `role="alert"` pattern. |
| A pinned conversion CTA when none is on screen | ✅ | `.buy-row[data-pinned]`. |
| Only one main CTA on screen at a time | ✅ | `aria-current` / `.cta-buy` scoping — see §2.1. |
| CTA full-span on mobile if singular in its container | ✅ | `.cta-buy { width: 100%; }` below 1024px. |

### 4.5 Chips
| Rule | Status | Note |
|---|---|---|
| Chips styled distinctly from CTAs, not clickable by default | 🆕 | Build on `.t-label`/`.t-eyebrow` (no cursor, no hover-to-accent), never on `.cta-main`/`.cta-buy`/`.link-quiet`. |

### 4.6 Navigation
| Rule | Status | Note |
|---|---|---|
| Nav buttons animate into × when active | ✅ (menu) / ⚠️ partial (others) | `.nav-burger`, `.nav-icon--morph`. Profile/bag don't toggle in place today. |
| Search animates from magnifying glass into intake | ✅ | `.nav-icon--morph` + `.sheet`. |
| Back button present except checkout; raise if missing | 🆕 | `.crumbs` covers `/shop/[slug]` and `/held` today. |
| Sub-nav categories scroll sideways, not stacked | 🆕 | No rail exists yet; don't reuse `.sitemap-list`. |

### 4.7 Loading state
| Rule | Status | Note |
|---|---|---|
| Logo animation default, colour-fill slides up as transition | ✅ | `.site-loading` + `.route-wipe[data-lift]`. |

### 4.8 Grid of cards
| Rule | Status | Note |
|---|---|---|
| Filter function present on every ecommerce grid | 🆕 | None exists; scope with the user before adding — the eyewear index is explicitly out of the eight designed routes. |

### 4.9 Images
| Rule | Status | Note |
|---|---|---|
| No two identical images on one page | 🆕 | Content/QA discipline, not a token. |

### 4.10 Text
| Rule | Status | Note |
|---|---|---|
| Headings span, not stack, on desktop if nothing sits across them | 🆕 | Per-layout decision. |
| Headings stack on mobile, ≤3 lines, raise if exceeded | 🆕 | `text-wrap: balance` already fights ragged wraps. |
| Truncate past 4 lines, "read more" expands container | 🆕 | Model expand on `.faq-panel`'s `grid-template-rows: 0fr → 1fr`. |
| Headings left-aligned on mobile regardless of desktop | ✅ | Default in every `.t-display-*` recipe. |
| Never a hairline before a preheader/eyebrow | ✅ | Confirmed against every eyebrow usage. |

### 4.11 Interactions
| Rule | Status | Note |
|---|---|---|
| Hover follows a single root logic | ✅ | Uniform `--fg-*` colour shift, `var(--dur-fast)`. |
| Transitions follow a single logic | ✅ | Three named eases only. |
| Slide-throughout or fade-throughout, never mixed | ✅ | Panels slide, scrims fade. |

### 4.12 States
| Rule | Status | Note |
|---|---|---|
| Loading, error, success, disabled — all components | ⚠️ **tracked gap** | `.field` has error, no explicit success; no site-wide success motif beyond `.bag-added`. Backfill per-component as touched. |

### 4.13 Single source of truth
✅ Already the house's first principle — `tokens.css` and `STYLE-GUIDE.md` both open on it.

### 4.14 Mandatories
| Mandate | Status |
|---|---|
| Reuse existing components/tokens before creating new ones | ✅ |
| Never introduce a new spacing/color/font/radius/shadow value if a token serves the purpose | ✅ |
| Every interactive component: hover, focus, active, disabled, loading, error, success where applicable | ⚠️ tracked — see §4.12 |
| Fix the shared component, not page-specific overrides, unless the variation is explicit | ✅ — `kind` prop on the shared `cta-link.tsx`, not per-page CSS |
