<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Aria Noir

## Copy

`COPY.md` is the house's master prompt and the copy of record. Read it before
writing or editing any customer-facing words. Its two most easily broken
rules: no em-dashes, and the tagline *Frame your mind* is never explained.

## What is in scope

Eight routes. Nothing outside them is being designed, unless asked:

| | |
|---|---|
| Home | `/` |
| Story | `/arca-i`, `/arca-ii` |
| Buy | `/shop/[slug]` |
| Lookbook | `/lookbook/ss26` |
| The House | `/house/about` |
| Contact | `/contact` |
| Bag | `/bag` |

Other routes still build and still answer — policies, care, access, the
eyewear index, the Process — but they are not being designed. The Process in
particular is deliberately absent from every menu and from the footer; it is
reached from inside `/house/about` or not at all. See `lib/navigation.ts`.
