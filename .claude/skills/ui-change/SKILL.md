---
name: ui-change
description: Use when you add or change any Emberforge menu, panel, modal, screen, button, layout or CSS (src/ui/, theme.css). Loads the UI rules, then checks the change in real headless Chrome at a modern phone size and at web size.
---

# UI change

Work on the game UI with the rules in `rules.md` (this folder). Read it first. It holds the screen order, the footer rules, the no-movement rule, notices, mobile and desktop rules, and the shared CSS classes. When the user agrees a new UI rule, add it to `rules.md` in the same step.

Other rules that stay in `CLAUDE.md` still apply: every player text goes through `t()` in both languages, colours come from `theme.css`, no em dashes.

## Verify (required step of every UI change)

1. Start `npm run dev`.
2. Open the changed screen with `npm run shot -- <url> '<steps json>' <width> <height>` at two sizes:
   - a modern phone (2025 or newer, for example a Pixel 10 at about 412x915). The size is not strict. Do not support small or old phones.
   - web size, 1280x720.
3. Click through the whole changed flow. Take screenshots and read each one with the image reader. A background browser tab gets no animation frames, so use `shot` for anything that moves.
4. Check on both sizes: layout, no overflow or clipping, no sideways scroll, buttons reachable and about 44 px high, text readable, the footer in view.
5. Ask: "What moves when a timer fires or a sale ends here?" The answer must be: nothing.
6. Fix each problem. Run the steps again. Repeat until both sizes are right.
7. Stop the dev server. Run `npm run check`.
8. In your report, say which sizes and flows you looked at. If you could not look at the screen, say so.

Follow the browser safety rules in `CLAUDE.md`.
