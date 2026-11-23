> Copied from the KDNCE Project on 2026-11-23 (written 2026-11-21, almanac v45). Since then the Glossary became a tab in the suite (suite/glossary.html) with category tiles, definition builders and a Hudl word import, and it syncs through the server. Treat this as the original design status.

# Shared glossary: built status (2026-11-21, almanac v45)

Live. Design: glossary-schema-v1.md. Code: shared/glossary.js in CoachCorn/coachcorn.github.io (loaded by almanac/index.html and the alm-vkx64w copy; cached by the almanac service worker).

## How it works
- Storage: localStorage key `glossary_v1_deer-creek` on the device, same site as the Almanac. Any page on coachcorn.github.io opened in the same app/browser shares it. iPad home-screen apps keep separate storage, so the Glossary screen lived inside the Almanac at first.
- First open seeds Deer Creek (223 terms): formations, formation tags, motions, play tags (run/pass uses), run and pass concepts, one words (meanings generated from the one-word rules), GLFs, routes, 16 fronts with codes (BEAR/OVER/UNDER as odd + even ids), MUG/BOSS, 7 coarse shells, 6 named coverages. Star maps to MFC/3-high/zone; Black, Clamp, Cleo, Sink, Read are flagged for review until mapped. Words already on that device but not in the built-in lists are seeded flagged for review.
- Glossary to Almanac: add, rename (old name kept as an alias) or retire changes the buttons; editing a front code changes the predictor bar.
- Almanac to glossary: every save checks the lists; a new word is added with source "game" and flagged for review. Deleting a word in Setup retires it (a tag only loses that run/pass use).
- Glossary screen: search, type filter, Review queue, edit/approve, add, retire / bring back, export JSON, import JSON (merge by id; the most recently changed copy of a term wins; seed terms never beat an edit).
- If shared/glossary.js does not load, the Almanac runs exactly as before on its built-in lists.

## Not done as of this doc
- Film Room and gameplan grid did not read it yet (they do now).
- No sync between devices except export/import (the server exists now).
- Drawing rules (meaning.rules) were not filled; meanings were text only.
- Coverage mappings for Black, Clamp, Cleo, Sink, Read.
- Scout coverage names are not yet translated to coarse shells in the predictor.
