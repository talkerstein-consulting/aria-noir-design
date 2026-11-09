# Aria Noir — website feedback (round of 5–7 Nov 2026)

Compiled 8 Nov 2026 from Slack `#aria-noir` and Jai's review deck.

**Sources**
- **[PDF]** Jai Jind, *ARIA NOIR – Website Review*, 5 Nov 2026 (posted by Raviv, 6 Nov): [`2026-11-06 ARIA NOIR - Website Review.pdf`](./2026-11-06%20ARIA%20NOIR%20-%20Website%20Review.pdf)
- **[CALL]** Rishon's notes from the 5 Nov call with Jai (`#aria-noir`, 5 Nov 10:15)
- **[RAVIV]** Raviv's follow-ups in `#aria-noir`, 5 Nov 16:23–17:12
- **[FATHOM]** Internal team meeting, 5 Nov 2026, Aria Noir segments at ~19:00–21:00 and 1:36–1:52: <https://fathom.video/share/isfee8PG8sPzKiGT4o-_KPMm5ssXZC5j> (see §13)
- **Asset source:** Jai's showcase/portal <https://arianoir-showcase.pages.dev/>. Mirrored to `scrape/showcase/` by `scripts/scrape_showcase.py` (gitignored).

**Precedence (Raviv, 6 Nov):** implement the PDF ("official feedback from the customer") **unless Raviv's own notes contradict it** — Raviv's notes win.

Status keys: ✅ decided · 🟡 open / not decided · ❓ conflict to resolve

---

## 1. Principles (PDF)
- **Do more with less.** One frame, given space, beats six crowded together.
- **Show exactly what they'll get.** Every image and film shows the real frames, true to shape and colourway. Inaccurate imagery is "the single biggest risk to the business".
- **Real people behind the maison.** No purely AI presentation: human models, real faces on About, real packaging, real craft.
- **Animation:** "say a lot with silence". Busy motion only belongs in the Gallery. [CALL]
- **The bar:** "an award-winning site the fashion world is glad to welcome". Prices will go up, so every page should look worth a higher price. [PDF]

## 2. Keep (don't break)
- ARCA I and ARCA II films: the benchmark. [PDF]
- ARCA II feature flowing into the colourway lightbox on white. [PDF]
- "Frame your mind" hero image. [PDF]
- "Before it exists" image and its hover highlight. [PDF]
- Double-helix 8 motif. [PDF]
- The minimal Shop All view at ARCA I ("the quiet showroom"). Make it a second way to browse. [PDF]
- Gallery: "absolutely incredible", plus the scroll and the collection filter. [PDF][CALL]
- Story pages ("like a Bond film") flowing into the product page. [CALL]
- Homepage moving between rich imagery and plain product shots. [CALL]
- Mobile: ARCA II turntable size, ARCA I loading image, cookie banner, About page, worn shots and details. [PDF]

## 3. Homepage
| # | Item | Source | Status |
|---|---|---|---|
| H1 | Replace the six-tile grid with an **auto carousel**: one frame at a time, soft blur transition, a short ARCA-style close-up clip per slide, full screen, slide links to that frame's page. Portrait on mobile, cinematic on desktop. Sits directly below the hero. | PDF | ✅ |
| H2 | **Hero: muted film loop.** | PDF · Rems (8 Nov) | ✅ |
| H3 | Keep the ARCA II feature and lightbox, then add **further frame features, one per section**. | PDF | ✅ |
| H4 | Expand "Before it exists" into **Eternal 8 + pre-order** (see §6). | PDF | ✅ |
| H5 | **Journal + Instagram feed**. IG feed goes at the bottom of the homepage. For now a styled IG feed; later a Meshki-style strip of real people with their handles. | PDF · RAVIV · CALL | ✅ |
| H6 | House Letter sign-up stays, but **calm the pop-up and burning flame** (too much animation). Also tone down the moving section Raviv flagged. | CALL · RAVIV | ✅ |
| H7 | **More breathing room between sections.** They currently run back to back. | RAVIV | ✅ |
| H8 | More white space between tiles (Meshki-style negative space). | CALL · PDF | ✅ |

## 4. Footer and navigation (every page)
| # | Item | Source | Status |
|---|---|---|---|
| F1 | **Remove the giant ARIA NOIR wordmark.** Put a small monogram just above Privacy · Terms · Privacy preferences. Same on desktop and mobile. | PDF | ✅ |
| F2 | **Remove the "Something new is taking shape" sign-up block** that sits after the footer. | PDF | ✅ |
| F3 | Careers link goes in the footer. | CALL · PDF | ✅ |
| F4 | Press: low-key footer link. A prominent "As seen in" only for genuine editorial (Bloomberg yes, Yahoo Finance no). No press logos on the homepage. | PDF · CALL · FATHOM | ✅ **Press page** (Rems, 8 Nov), with an inquiry form and social links, under Maison and linked from the footer. Content exists on Jai's showcase; see [PRESS-CONTENT.md](./PRESS-CONTENT.md). |
| N1 | Replace **"About" in the header with "MAISON"**, with About · Heritage · Craftsmanship · The Book under it. | RAVIV | ✅ |
| N2 | "Collections" becomes "Frames" or "The Collection". "The House" becomes "The Maison". | PDF | ✅ |
| N3 | Use **text instead of icons** in the header. | RAVIV | ✅ (check whether this covers cart and account) |
| N4 | Add a **country/currency selector** (there's nowhere to change it today). | RAVIV | ✅ |

## 5. Frame and product pages
### Films (PDF)
| Frame | Today | Needed |
|---|---|---|
| ARCA I | Benchmark intro film | Re-crop the one scene that doesn't fit mobile |
| ARCA II | Benchmark intro film | Keep |
| AHAVA | Mood imagery, frames only at the end | New film; frames early and often. Lead with product. |
| MONARCA · MATRIARCA | No intro film | New film for each |
| PATRIARCA | Opening film shows off-brand frames | Reshoot or rebuild with the real frames |
| El Patrón sweaters | Colourways out of date | All five colourways, a film for each |

Direction: cinematic, dramatic, high fashion, provocative but elegant. Reference: Franky's ARCA II shot of the face lit by the glow.

### Turntable
- **New renders for every frame** (Jai's Blender 360° set; the old one has a shadow under the lens). Use the highest resolution. [PDF][CALL]
- Size: desktop PATRIARCA **at least 25% bigger**; ARCA I mobile **about 15% bigger**; ARCA II mobile is perfect, leave it. [PDF]
- **No play button.** It turns slowly on its own when in view, stops when grabbed, and stays still under reduced motion. [PDF]
- **Snap to the store section** after the dark-to-light transition so it works straight away. [PDF]
- Must **work in landscape on mobile**, where it currently disappears. [PDF]
- /arca-ii: the Caramel Stripe render shows at a different size. Swap in the new renders. [PDF]

### Imagery
- **Stop:** off-brand AI try-on and mockup images, old 3D models with bad lighting, AI images with shifted colour, mood shots with no product. [PDF]
- **Start:** imagery rebuilt from the 3D source, macro shots from the real dashboard photos, real packaging and carrying-case photos. Check every image against the physical frame before it ships. [PDF]
- /arca-i mobile: **remove the two old 3D pieces** mid-page. [PDF]
- /arca-ii: the "Worn · Noir" B&W image has off colour. Check it against the real colourway. [PDF]
- **Packaging/product images from Jai's asset page go on every product page** (template). [RAVIV]
- Replace product images still left over from the first pass. Macros with a wrong emblem are in the old images. [CALL][RAVIV]

### Product page template
| # | Item | Source | Status |
|---|---|---|---|
| P1 | **AR try-on comes out.** It looked glitchy and "kills the whole vibe". Replace it with static images on three head sizes showing the 145 mm width, plus an elegant note that the frames fit large. Don't suggest Fitting Box. | CALL | ✅ **Remove.** The team call [FATHOM 1:37] decided it: "Forget the AR glasses stuff… it's just going to be a guide." Replace it with a measurement/fit guide, no photo try-on. (The PDF's "rebuild from 3D source" is about the try-on *images* and mockups.) The latest `rems-branch` commits are try-on work, so they need to be reverted or hidden. |
| P2 | **Add to Cart stays** (needed for abandoned-cart data). Optional pop-up on add: checkout or keep shopping. Don't add friction. | CALL | ✅ (pop-up 🟡) |
| P3 | **Fit dropdown** in the product FAQs. | CALL | ✅ |
| P4 | **Tech specs + measurements + "how to choose your size" guide** on every product page, taken from the info on Jai's showcase product cards (total front width etc.). Make the guide a diagram. PD (pupillary distance) and fit questions go to Jai. | RAVIV · FATHOM | ✅ (format: table vs diagram 🟡) |
| P5 | **Quality / how it's made + packaging section** at the bottom of each product page, modelled on Jacques Marie Mage. Some of it also goes on About. The "how it's made" video is on Jai's asset page. | CALL · RAVIV | ✅ |
| P6 | **Reviews** low on the page, just before the footer. Nothing offered in exchange. Ask all buyers, not just happy ones (no review gating). | CALL | ✅ |
| P7 | **Price font** looks like Courier. Bring it into the serif/sans system. | PDF | ✅ |
| P8 | **Registration / Warranty** footer page: register your frame (warranty card) now; the blockchain/digital-certificate registry comes later. | RAVIV · FATHOM | ✅ (simple form now; certificate later) |
| P9 | **Turntables: use Jai's new Blender 360° renders** in place of the current 72-frame 800px snapshots in `public/images/spin/`. Source: `scrape/showcase/turntable/<slug>/0000–0359.webp` (39 colourways, 1600×1014). | FATHOM · PDF | ✅ |
| P10 | **Mobile gyro is too sensitive** and triggers by accident. Reduce it. | FATHOM | ✅ |

## 5b. Packaging and unboxing
| # | Item | Source | Status |
|---|---|---|---|
| U1 | **Unboxing video: Jai is handling it.** Static images first, video later. Our team showed a **white-glove unboxing** as the reference. | CALL | ✅ (waiting on Jai) |
| U2 | **Packaging shots are needed ASAP**, static first. Some of the 249 real dashboard photos show packaging. **New packaging is coming**, so expect a re-shoot when it lands. | CALL | ✅ (Franky) |
| U3 | **Real packaging and carrying-case photos**, not AI. "One perfect crop says it all." | PDF | ✅ |
| U4 | **Packaging/product images from Jai's asset site go on every product page** (template), in the quality-and-packaging section modelled on Jacques Marie Mage (P5). | RAVIV · CALL | ✅ |
| U5 | Jai's checklist (Next): "Real packaging photos; **plan the unboxing**." | PDF | ✅ |

## 6. Brand, story and copy
- **Terms:** Maison (brand) · The Collection (everything we sell) · Frame (each design) · Colourway (each version) · **The Eternal 8** (yearly core range). [PDF]
- **Restore the motto:** "By designers, for designers." Not "for visionaries". [PDF]
- **Eternal 8 + pre-order** under "Before it exists": Show (turntables of the new Eternal 8) → Reserve (pre-order with early access to that year's limited edition) → Register (numbered **digital certificate of authenticity**). Never say "NFT" in customer-facing copy. [PDF]
- **The book:** a ghostwritten coffee-table book that is the source of truth for all copy. Showcase it as a Book/lookbook page under Maison. Get it in exchange for an email ("You read this far, still curious?"). The book and music could both live on About. Jai to send the book. [PDF][RAVIV]
- **The making:** milled acetate, gold-plated emblems, hand finishing. Made with G-Force Optical (Wenzhou) and a US partner (name TBC). Draft copy is on page 18 of the PDF. Use it once the facts are confirmed. [PDF]
- **The 888** inside every temple. Tie it to the 8 motif and the Eternal 8. [PDF]
- **Don't claim yet:** 18K gold · CE · UV400 · Rx-ready · unqualified "handmade" · "sustainable". [PDF]
- Policies are on Jai's showcase site: <https://arianoir-showcase.pages.dev/about/#contact>. [RAVIV]

## 7. People, content and sound
- **About:** real people, human models across the site. [PDF]
- **Real + AI:** a gallery collection of only real photos with its own theme, drawn from the 249 real photos in the dashboard. [CALL]
- **Journal:** articles from newsletter content (domain authority, groundwork for relaunching *Éternité* in print). [PDF]
- **Galleries the client can update themselves.** [PDF]
- **Sweaters:** a dedicated collection page, like the one for glasses. [RAVIV] (On the call it was 🟡; Raviv's note decides it.)
- **Music:** the current track is wrong. Mood reference is Silent Hill 1–2 (Akira Yamaoka); commission or license original music. Archive Jai's own soundtrack and videos as brand assets. [PDF]
- **Films:** Jai is curating real-footage clips. Media page vs gallery is 🟡. [CALL]
- **Architecture:** plan space for a future ARIA NOIR hotel (later). [PDF]
- **Reshoot** with real models in Ukraine or Spain: needs scoping. [PDF]

## 8. Mobile (PDF)
- Carousel in portrait with motion blur.
- Macro close-up product shots.
- Price font (see P7).
- Footer monogram (see F1).
- ARCA I: re-crop the one film scene, remove the two 3D pieces, snap the turntable to the store, make it 15% bigger, and make it work in landscape.
- ~~Desktop vs mobile treatment~~. Disregarded by Rems, 8 Nov.

## 9. Still open
- Gallery image → product links that work on mobile (a hover overlay felt too heavy). [CALL]
- ~~Hero: still vs film (H2)~~. Decided 8 Nov: muted film loop.
- ~~Press placement (F4)~~. Decided 8 Nov: Press page.
- ~~Desktop vs mobile treatment~~ and ~~how much of Jai's extra content goes on the site~~. Disregarded by Rems, 8 Nov.
- Film/soundtrack placement.
- **Parked:** live try-on, modular homes. [CALL]
- **With Jai:** no launch date, no piracy-protection promises. [CALL]

## 10. Jai's prioritised checklist (PDF p.24)
**Now:** carousel to spec · film briefs (AHAVA, MONARCA, MATRIARCA, PATRIARCA, El Patrón) · replace off-brand imagery and old 3D pieces · footer monogram + remove trailing block · restore motto · turntables (new renders, size, snap, landscape)
**Next:** extend homepage with frame features · white space on every tiled image · Eternal 8 pre-order + certificate · naming rollout · price font · real packaging photos, plan unboxing
**Then:** Journal, Press, Careers, IG feed · editable galleries · music brief, scope reshoot · making copy once facts are confirmed · space for Architecture

## 11. Waiting on Jai
Brand book · turntable renders (shared in WhatsApp) · dashboard photo sets (product, macro, packaging) · soundtrack files · US factory name and site · Bloomberg/press links · curated film clips · craftsmanship paragraph · a fresh look at mobile + desktop.

## 12. Not site build (other owners)
- Franky: assets, macros, packaging shots, the real-photo set. [CALL]
- Rems + Dev: photo viewer — loosen the activity lock, per-photo select + Stripe checkout at $5/photo, add the ~45 remaining Monarca photos. [CALL] Dev is wiring the portal charge (Nov 7 thread).
- Photo portal [FATHOM]: Franky curates 40–50 top images for Jai to buy. The contract rate stays at $5/image in batches of 50. Add a **"mark for fix"** option so Jai can request edits without rejecting an image.
- Franky [FATHOM]: the image problem is mainly the side/angle shots of the emblem. Redo the rushed collection images.

## 13. Team meeting, 5 Nov (Fathom) — Aria Noir decisions
Internal call (Rems, Raviv, Rishon, Franky, Dev). Action items assigned to **Rems** unless noted.
- **Context:** Jai's first harsh feedback came from a quick look at a few product shots, not the whole site. He's now "Quantum Leap" happy, about 80% there. "Some things are maybe a little too grand."
- **Reduce mobile gyro sensitivity** (P10). @19:26
- **Book a review with Jai next week.** @21:01
- **Import the new 3D models / turntables** from Jai's portal and replace the current snapshot sequences (P9). @1:37
- **Product pages:** bring over the technical info and the measurement/size guide from Jai's portal cards. Turn the guide into a diagram (P4). @1:37
- **Sweaters get their own collection page.** @1:37
- **Remove the AR try-on** and replace it with the guide (P1). @1:37
- **Registration / Warranty** footer page (P8). @1:37
- **Maison menu** instead of About, with Craftsmanship, History/Heritage, About, Press under it. @1:39
- **Press page** with an inquiry form and social links. Jai's press links are mostly weak (Bloomberg is the good one), so keep them off the homepage. @1:39
- **"How it's made" film** (black-and-white and colour versions) on Maison → Craftsmanship, with screenshots/sequence at the bottom of every product page (Jacques Marie Mage style). Short snippets could work as transition animations. Don't re-edit Jai's videos. @1:46
- **Music videos:** some clips are on brand and usable in pieces. Other content (books, soundtrack) can go under Maison. Discuss with Jai before committing. @1:47
- **Instagram feed at the bottom of the homepage**, styled like the Meshki Bridal (wedding suite) social strip: more vertical, displayed creatively, not a plain grid. @1:50
- **More spacing** between sections (Dev/Rems). @1:51
- **Later, not in scope:** blockchain/NFT registration per pair.
