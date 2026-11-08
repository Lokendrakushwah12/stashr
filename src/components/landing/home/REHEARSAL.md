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
