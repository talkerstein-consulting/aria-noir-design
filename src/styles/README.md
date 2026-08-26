# Aria Noir — style system

Reverse-engineered from the build, not invented. Every value here was
already in the codebase; the system is what happened when the duplicates
were collapsed and the survivors were named.

```
src/styles/tokens.css        colour · type · rhythm · motion
src/styles/typography.css    type + layout recipes, ground-aware
src/styles/interactions.css  the three interactive objects
src/app/globals.css          grain, reveals, scrollbar, Lenis (unchanged)
```

## The one rule: declare the ground

The page is black for ~90% of its length, then the white iris fires and it
is white for the rest. Every recipe reads `--fg-*`, and `--fg-*` comes from
the ground:

```jsx
<section className="on-ink section">…</section>    // dark half
<footer  className="on-paper section">…</footer>   // past the iris
```

Set it once per section, and `t-eyebrow`, `t-body`, `cta`, `link-quiet`,
`hairline` all resolve themselves. This is what `variant="dark"` used to do
by hand, one component at a time.

## Colour

Three inks: `--ink`, `--paper`, `--gold`. Plus `--gold-on-light` — `--gold`
is only ~2:1 on paper, so it is a fill colour there, never a text colour.

Above them sits a ramp named by **job**, not by opacity, mirrored across
both grounds:

| Role | Job |
| --- | --- |
| `--fg-primary` | headings, prices, the answer to the question |
| `--fg-secondary` | body copy |
| `--fg-tertiary` | labels, quiet eyebrows |
| `--fg-quiet` | legal, captions, placeholders |
| `--fg-accent` | gold — one per section, no more |
| `--fg-rule` | every hairline |

Stop writing `text-paper/70`. The opacity was never the point; "this is a
secondary line" was.

## Type

Two families, permanently. **Libre Bodoni** sets headings, pull quotes and
the wordmark. **Manrope** sets every label, paragraph and CTA. A serif
caption or a sans headline is a bug.

| Recipe | Replaces |
| --- | --- |
| `t-display-xl` | `text-5xl sm:text-7xl md:text-8xl leading-[1.02] tracking-tight` |
| `t-display-lg` | `text-4xl sm:text-6xl leading-[1.05] tracking-tight` |
| `t-display-md` | `text-3xl sm:text-5xl` |
| `t-quote` | the italic serif aside |
| `t-eyebrow` | `font-ui text-[11px] tracking-[0.35em] text-gold uppercase` ×11 |
| `t-body` | `font-ui text-sm leading-relaxed text-pretty text-paper/70 sm:text-base` ×5 |
| `t-caption` `t-label` `t-micro` | the small print tiers |
| `t-figure` | prices and spec numbers (tabular) |

The display sizes are `clamp()`, so one class covers what took three
breakpoint utilities. Display leading gets **tighter** as type grows —
that inversion is why the headings read as carved.

`t-body` carries its own `max-width`. Measure is part of the recipe, not a
decision at the call site, which is why body copy never runs edge to edge.

**Tracking has two directions and no middle.** Display tightens
(`--track-display`); small uppercase opens (`--track-eyebrow`, the house
value at `0.35em`). The old `0.2 / 0.25 / 0.3em` spread collapsed into one
`--track-label` — three values doing one job at sizes where nobody could
tell them apart.

## Rhythm

`section` is the page gutter and vertical rhythm in one class
(`--gutter`/`--section-pad`, matching `SECTION_PAD` in `lib/timeline.ts`).
`stack`, `stack--sm/lg/xl/2xl` are the five vertical gaps. The steps are
far apart on purpose: this page separates ideas by a lot or not at all.

## Motion

Three curves, each with a job:

- `--ease-inout` — things that **swap**: glyph shuffles, rule sweeps
- `--ease-out` — things that **arrive**: reveals, plates, rises
- `--ease-inout-strong` — choreographed scene beats

Durations run `--dur-fast` (colour) → `--dur-scene` (a section rising).
`--stagger-char` and `--stagger-word` are the same wave gesture at two
scales — the CTA hover and the scroll reveals are deliberately one hand.

## Interactions — three objects, no buttons

There are no fills, borders, pills or radii anywhere. An action is a word
with a rule under it, and **the rule is what moves**.

**`cta`** — the primary action. Label over a continuous hairline; on
hover/focus a gold rule sweeps left to right while the glyphs lift and
swap, each letter one `--stagger-char` behind the last.
`<CtaLink tone="quiet">` is the second action in a section, the one that
must not fight the first.

**`link-quiet`** — nav, footer columns, legal, socials. Colour shift only.
These are wayfinding, not invitations; giving them the CTA's wave would
flatten the difference between "read this" and "buy this".

**`field`** / `field-row` / `field-submit` — the one input. A baseline with
type on it: the CTA's underline, standing still. The row's rule goes gold
on `:focus-within`, and the submit arrow leans in the direction it means.

### Focus is a first-class state

Every hover rule in `interactions.css` is paired with `:focus-visible`, and
everything focusable takes the same offset hairline ring in `--fg-accent`.
The build had no focus styling at all — a gold underline that only appears
for a mouse is not a navigable site.

### Reduced motion

`prefers-reduced-motion` drops **travel only**. Colour still changes: that
is information, not decoration.

## Adding something

1. Is there a recipe? Use it.
2. Is there a token? Compose from it.
3. Neither? The value belongs in `tokens.css`, not in a `className`.

A hard-coded hex, a fourth easing curve, or a sixth tracking value is the
signal that something wants to be a token.
