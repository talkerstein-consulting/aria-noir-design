# Aria Noir — interface style guide

`COPY.md` governs the words. This governs everything the words sit in.

Two rules sit above all the others, because every violation of the house's
look is a violation of one of them:

1. **No radii, no shadows.** Every corner on this site is square and nothing
   casts a shadow. Fill is spent deliberately and only where it buys
   something: the main CTA (so the one action a screen wants is the
   highest-contrast object on it) and the held heart (because filled versus
   outlined is the fastest state pair a person can read). Everything else is
   hairlines and type.
2. **Colour is never the only carrier of a state.** Every state that matters
   is also a word, a rule weight, or a shape. An error turns a rule accent
   *and* says what to do; a selected swatch is ruled *and* named in the
   panel above it.

Everything below is the vocabulary that follows from those two.

---

## 1. Tokens

Defined in `src/styles/tokens.css`. Never write a literal colour, duration
or rule weight in a component.

| Token | What it is for |
|---|---|
| `--ink` / `--paper` | The two grounds. Nothing in between is a ground. |
| `--fg-primary` | Headings, the answer to a question, the thing being bought. |
| `--fg-secondary` | Body on ink. |
| `--fg-tertiary` | Supporting body, the paragraph under a heading. |
| `--fg-quiet` | Labels, eyebrows, prices in a list, the separator in a trail. |
| `--fg-rule` | Every hairline. |
| `--fg-accent` | Errors, and the one mark on a progress bar. Not decoration. |
| `--rule-weight` | 1px. There is no second rule weight. |
| `--dur-fast` / `--dur-base` / `--dur-scene` | Hover; a control changing; a section arriving. |

A section declares its own ground with `.on-ink` or `.on-paper`. The header
reads that declaration to choose its own tone — a section that forgets to
declare one gets a white header over whatever it is, so declare it.

## 2. Type

Three families, from `src/styles/typography.css`:

- `--font-display` (Libre Bodoni) — headings and the one-line answers in a
  search result. Never for a label.
- `--font-ui` (Manrope) — body, labels, buttons, fields.
- `--font-mono` (IBM Plex Mono) — numerals that are being compared, step
  indices, route paths, the bag's tally.

Classes, in descending size: `t-display-lg`, `t-display-md`, `t-display-xs`,
`t-body` (`--lede`, `--tight`), `t-caption`, `t-eyebrow`, `t-label`.

`t-eyebrow` is the interface's smallest voice: 0.6875rem, 0.12em tracking,
uppercase, `--fg-quiet`. Every label, every step title and every crumb is at
that step. There is nothing smaller except `--font-mono` at 0.5625rem, which
exists only for the bag's tally.

Prices always carry `tabular-nums`. A column of prices that shifts by a
digit's width is a column nobody can scan.

## 3. Breadcrumbs

**Component:** `src/components/crumbs.tsx` · **CSS:** `.crumbs` in
`src/styles/commerce.css`

```tsx
<Crumbs trail={[{ label: "Eyewear", href: "/eyewear" }]} current="ARCA I" />
```

```
EYEWEAR · THE STORY · ARCA I
└ link   └ link      └ aria-current="page", one step brighter, not a link
```

The whole format:

- One line at `t-eyebrow` scale. Uppercase, 0.12em tracking, `--fg-quiet`.
- The separator is a **middot at 45% opacity**. Not a chevron, not a slash:
  a chevron is a second glyph weight inside the smallest type on the page.
- The last crumb is the current page. It is `--fg-secondary`, carries
  `aria-current="page"`, and **is not a link**.
- **It never starts with "Home."** The wordmark two centimetres above it
  already goes home. A trail whose first link is the thing the reader is
  holding is a trail that padded itself.
- It never wraps. On a phone the **last** crumb truncates with an ellipsis,
  because the end of the trail is where the reader is standing.
- Hover and focus move the crumb to `--fg-primary`. Nothing else moves.
- The whole thing sits in a `<nav aria-label="Breadcrumb">`.

**Where it belongs:** any page a reader can arrive at from more than two
directions. Today that is exactly one page — `/shop/[slug]`, reached from
the story, the index, *You may also like*, and search — plus `/held`, which
hangs off the desk. It does **not** belong on the home page, on a story
page, or on `/bag`: those are destinations, not depths.

## 4. The chrome

Fixed header, three columns: `1fr auto 1fr`.

```
MENU  ⌕                      ARIA                      ⌾  ⛉²
└ word, quiet CTA            └ wordmark, links home     └ profile, bag
      └ search glyph
```

- **Left:** `MENU` as a word (its CLOSE state is the same button's lower
  line, lifting upward in both directions — see `cta-link.tsx`), then the
  search glyph.
- **Centre:** the wordmark, `aria-label="Aria Noir — home"`.
- **Right:** profile, then bag.

Icons are **lucide-react**, and the rules are not negotiable, because five
different icon sizes in one band is what makes a header look assembled:

| | |
|---|---|
| Glyph | 1.125rem, `stroke-width: 1.25` |
| Target | 2.25rem square (`.nav-icon`) |
| Rest | `opacity: .86`, no fill, no plate, no radius |
| Hover / focus | `opacity: 1`; focus adds a 1px `currentColor` outline at 2px offset |
| Label | Always an `aria-label`, because a glyph has no accessible name |

The **bag tally** is a mono numeral at 0.5625rem in the corner of the glyph,
not a filled badge. It waits for the store's `ready` flag: the bag lives in
localStorage, so before mount the count is unknown rather than zero, and a
`0` that becomes a `2` a frame later reads as the shop finding things it had
lost.

The profile glyph goes to `/access` for a stranger and `/desk` for someone
known. Same door; the door knows.

## 5. Search

**Component:** `src/components/site-search.tsx` · index in `src/lib/search.ts`

A full sheet of ink under the header. One rule, one field, the answers
underneath — no card, no shadow, no radius.

- The field is display type at `clamp(1.5rem, 4vw, 2.25rem)` over a single
  hairline, with the glyph at 60% to its left and `Close` at eyebrow scale
  to its right.
- Answers group under eyebrow headings with a count: **Frames**,
  **Colourways**, **Pages** — in that order, always.
- A hit is one row: the label in `t-body` on the left, the note
  (`--fg-quiet`) on the right, a hairline beneath. Price for a colourway,
  material for a frame, one orienting word for a page.
- Two characters is the threshold. Below it the sheet offers the catalogue
  rather than showing nothing.
- A miss is said in words, and then offers three routes out. Search is
  never a dead end.
- Escape closes. Focus enters the field on open and the query clears 400ms
  after close, so the sheet is not seen emptying itself.

## 6. Controls

**Two CTAs. Main is filled, secondary is outlined.** Same box, same padding,
same type, same square corners, same glyph shuffle — fill versus outline is
the only difference, which is what makes them read as one control at two
weights rather than two components. No radii anywhere.

| | When | How |
|---|---|---|
| `<CtaLink>` / `<CtaButton>` (default, `kind="main"`) | The **one** thing the screen wants done — *Add to bag*, *Checkout*, *Sign in*, a step's commit | `.cta-main` — **solid fill** in the section's foreground, label in the section's ground, square corners, shuffle on hover. `aria-current="page"` holds the fill accent. |
| `<CtaLink kind="secondary">` / `<CtaButton kind="secondary">` | The second action, where two fills would fight — *Talk to the studio*, *Shop all*, *Not you?* | `.cta-secondary` — the same box, **outlined**: hairline border, no fill. |
| `.menu-link` | The menu stack — navigation, not a CTA | No box at all; the glyph shuffle and a colour that answers. `NavShuffleLink`. |
| `.link-quiet` | Footer columns, legal, socials | Colour shift only. |
| `.nav-icon` | The chrome, and only the chrome | See above. |

**One main per screen.** Everything else that is still a CTA is secondary.

Both define hover, focus-visible, active and disabled. The main CTA fills
with `--fg-primary` and sets its label in `--ground`, so it inverts
correctly on ink and on paper without being told which it is on — which is
why **every section must declare `.on-ink` or `.on-paper`**. A section that
paints `bg-paper` without declaring the ground renders its CTA in the
body's dark tokens: white fill on a white page.

An **out of stock** primary is a `disabled` button that changes its word
(*Out of the workshop*), not a hidden one. A control that disappears leaves
the reader wondering what they did.

## 7. The field

**CSS:** `.field`, `.field-error`

```
TELEPHONE                        ← label, t-eyebrow scale, always visible
+1 555 0134
─────────────────────────────    ← one hairline, no box
A number the courier can reach on the day.   ← accent, only once wrong
```

- Label above, always. A placeholder that vanishes when you type is a label
  you cannot check your own answer against.
- Underline only. No box, no fill, no radius.
- Focus turns the rule `--fg-primary`. That is the whole focus treatment.
- **Optional** is marked (` · optional`, 60% opacity). Required is not —
  most fields are required, so marking them marks everything.
- Validate **on blur**, never on keystroke. Telling someone their email is
  wrong while they are still typing the `@` is a scold.
- An error sets `data-invalid` on the label (rule goes `--fg-accent`) **and**
  renders `.field-error` with `role="alert"` saying what to do about it.
  `aria-invalid` and `aria-describedby` on the input.
- Always the right `autoComplete` and the right `inputMode`. A phone field
  that opens a qwerty keyboard is a bug.

## 8. The folding step

**Component:** `src/components/shop/checkout-steps.tsx` · **CSS:** `.step`

The pattern for any surface that asks more than one question. Flow and
rationale are in `docs/COMMERCE-FLOWS.md`; this is how it looks.

```
01  WHO IS BUYING                                        CHANGE
    As a guest. No account, no password.          ← folded: the answer

02  WHERE IT GOES
    ┌ open: the only step with height
    └ …

03  WHAT YOU ARE BUYING                           ← dimmed: not askable yet
```

- Three states on `data-state`: `open` (body shown, summary hidden), `done`
  (summary shown, `CHANGE` offered), `waiting` (head at 40%, nothing else).
- Hairline above each step, one below the last. No boxes.
- The index is mono at eyebrow scale, in `--fg-quiet`. It tells the reader
  how many questions are left before they read the first one.
- The head is the whole button, and it carries `aria-expanded`.
- An answered step folds to **its answer**, not to its title repeated.

## 9. Product surfaces

- **Card:** photograph **square** (`.card-shot`, `aspect-ratio: 1/1`), name
  (`.card-name`), then the quiet line under it. The proportion is declared
  once in `interactions.css` and read by all six card surfaces — the bag's
  cross-sell, *You may also like*, the held list and both index grids — so
  it is one number, never a utility class copied six times. The acetate
  swatch is the card's background, so a colourway the shoot has not reached
  is honest about being an approximation rather than showing a sibling
  colour.

  Square is the **card's** shape, not the site's. The story and campaign
  plates (`product-opening`, `product-spec`, `text-pair`, `sticky-study`,
  `buy-campaign`) stay at `4/5`: those are a photographic rhythm running
  down a column, and a card is an object in a grid.
- **Colourway picker:** the acetate itself as the mark, the selected one
  named in words in the panel above. Never colour alone.
- **Offer panel:** collection eyebrow → name → colourway → note → price →
  hairline → picker → quantity and add to bag → the shipping line → hold.
  That order does not change between houses.
- **Hold:** `.hold-toggle`, `aria-pressed`, filled heart plus the word
  *Held*. The site's only fill, and the word is why it is allowed.
- **A model never fills its stage.** Every glb on the site — private
  access, the eyewear turntable, the buy page's opening, the story pages —
  is fitted inside the same margin, and that margin is `MODEL_AIR` in
  `lib/model-fit.ts`. Fit against the bounding **sphere**, never the box: a
  frame is narrowest face-on and widest at three-quarters, so a box fit is
  correct for one moment of a rotation the reader can still perform by
  hand. A stage that pushes the camera back instead of scaling the object
  uses `MODEL_MARGIN`, which is the same rule stated from the other end.

  The margin is not decoration. Every one of these stages carries type on
  the same screen as the object, and the air is what keeps the two from
  reading as one crowded thing. **Do not tune the fit per surface.** It was
  tuned per surface before — 0.86 on the buy and story pages, 0.95 in
  private access, a camera margin of 1.12 on the index — and the result was
  three amounts of air on four screens showing the same six objects, with
  the tightest of them running the temples to the edge of a phone.

## 10. The wait

| | |
|---|---|
| A route | `.site-loading` — full sheet of ink, `/logo/aria-loader.svg` drawing itself in the middle, nothing else. `src/app/loading.tsx`. |
| A canvas | `.stage-loader` — a word, a hairline, a number, scoped to the stage that is loading. |
| A list from localStorage | One hairline's worth of height until `ready`. **Never** the empty state. |

That last one is a rule, not a preference: rendering "nothing here" and
replacing it a frame later reads as the shop losing things.

## 11. Empty and failure states

Every one of these is a designed region with somewhere to go, never a
thrown error and never a bare sentence:

- Empty bag, empty held list, empty orders.
- A bag line whose colourway went out of the workshop: the line stays,
  greys, and says it will not be taken to checkout.
- A colourway with no photograph: the acetate, as the ground.
- Nothing matched a search: the words, then three routes.
- A route that throws: `src/app/error.tsx`. A route that is missing:
  `src/app/not-found.tsx`.

## 12. Accessibility floor

Not a phase. A change that breaks one of these is not finished.

- Everything reachable by keyboard, with a **visible** `:focus-visible`.
  Never `outline: none` without a replacement in the same rule.
- One `<h1>` per page. On the buy page it is the name in the offer panel —
  the opening's centred copy is decorative and `aria-hidden`.
- Every icon-only control has an `aria-label`. Every decorative image has
  `alt=""`.
- A toggle carries `aria-pressed`; a disclosure carries `aria-expanded` and
  `aria-controls`; a panel carries `role="region"` and `aria-labelledby`.
- An overlay locks the page with `overflow: hidden` **and**
  `scrollbar-gutter: stable`, or every fixed element on screen jumps by the
  scrollbar's width.
- `prefers-reduced-motion` is honoured everywhere, including in
  self-animating SVGs — the route loader hides the mark and shows a
  hairline instead.

## 13. Mobile

- 44px minimum target. `.nav-icon` is 36px of box around an 18px glyph and
  sits in a 24px-padded band, which clears it; nothing smaller than that
  ships.
- No horizontal overflow, ever. The breadcrumb truncates rather than
  scrolls.
- The buy row pins to the foot of the screen and **takes itself away** once
  the film has been scrolled past. A sticky element that covers content is
  worse than no sticky element.
- Test at 375px before calling anything done.
