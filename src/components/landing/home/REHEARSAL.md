# FeatureBento — rehearsal notes

Built with the Stageshow skill (`.claude/skills/stageshow`), kit vendored in
`src/components/landing/stageshow/kit` (MIT, see `../stageshow/LICENSE`).

**Gold copied:** `examples/bento` (hero-and-strip grid, run-in copy, one
Stage per tile at 1:1, one beat per tile on scroll-in, 110ms apart).

**What changed:** five Stashr tiles — Links (hero: a note whose links read
as chips, real Figma/GitHub/Notion marks from the kit), Write (statement:
⇧↵ / ⌘↵ at display size, the one dark tile), Team (invite → Invited),
Boards (Stashr's folder cards, stacked), Activity (a new row arrives on
top). No window chrome anywhere. Stashr's tokens: Geist, indigo primary,
7px control radius, Lastik on folder names. Follows the page theme
(next-themes); the Write tile is indigo-tinted on dark pages.

**Film:** `film.mjs --gate` → `rehearsal passed` at 1280 after fixing a
6px near-alignment (name vs list labels) and two pixel-snapping landings
(`will-change: transform`). Checked in the real page at 1280, light and dark.

**Not checked:** the 600–899px two-column layout and the phone column were
not filmed; seven kit files carry `// @ts-nocheck` (upstream was written for
a looser tsconfig).

# HeroDemo — rehearsal notes

**Gold copied:** `examples/hero-demo` (cursor beats over named targets,
`a.type` / `a.key` keycaps, a reset to `initial` so the loop has no seam).

**Story (12s):** click the composer on a "Launch plan" board, type a list,
Enter, paste a link that lands as a Google Docs chip, ⌘↵ posts it; the
composer closes like the app's, the note joins the timeline, the details
column's Links count rolls 1 → 2 and "You added a note" lands in Activity.
Poster = the posted state. Follows the page theme after mount.

**Film:** `--gate` → `rehearsal passed` at 1000 wide after fixing an
unclipped window, a cut-off composer at the payoff (now collapses on post),
pop-ins (placeholder/note crossfade, chip and new-line entrances) and
layout-stepping chips (own layers).

**Not done:** no `compact` design. Below `md` the page shows the static
screenshot instead; a phone-column redesign failed the gate's gutter checks
and was dropped rather than shipped half-right.
