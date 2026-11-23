> Copied from the KDNCE Project on 2026-11-23 (written 2026-11-21). The schema is in use. Where this doc conflicts with `defense-vocabulary-decisions-2026-11-23.md`, the decisions doc wins: for example Over/Under are fixed to the defense's left and right, defender positions, techniques, pressures and packages are program-defined terms, and there are no starter packs (new programs start blank).

# Shared glossary: schema v1 (draft for Noah's review, 2026-11-21)

## What it is
One glossary per program, read by the Almanac, Film Room and gameplan grid. It lives inside the suite (an editor page next to the other tools), not in Google Sheets or Apps Script. Data is stored on the device and moves between devices by export / import file or the sync server. Deer Creek's glossary is the first.

## Rules that keep it easy to change
1. Every file carries `schema` (a number). The loader upgrades old files with small tested migrations.
2. Only add fields. Never rename or delete one; mark it retired.
3. Unknown fields and unknown term types are ignored, never an error.
4. Every tool keeps its built-in defaults and works with no glossary. The glossary only adds to them.
5. A term has a permanent `id`. The name is only a label. Plays, drawings and scout rows store ids, not names. Old data that holds names is matched by name or alias when loaded.
6. A change of name or meaning adds a history entry with a start date. Old plays keep the meaning that applied when they were logged.
7. Glossary data is separate from tool code. Adding a term never needs a deploy.

## File shape
```json
{
  "schema": 1,
  "program": "deer-creek",
  "name": "Deer Creek",
  "rev": 14,
  "updated": "2026-11-21T07:50:00Z",
  "terms": [ ]
}
```
`rev` goes up by one on every save. It is how a tool knows its copy is stale.

## Term shape
```json
{
  "id": "ftag.heavy",
  "type": "ftag",
  "side": "O",
  "status": "active",
  "name": "Heavy",
  "aliases": [],
  "meaning": {
    "text": "Right tackle moves to the left side, tackle over.",
    "rules": [{ "op": "move", "who": "RT", "to": "left", "note": "tackle over" }]
  },
  "links": {},
  "source": "taught",
  "needsReview": false,
  "history": [{ "since": "2026-11-21", "name": "Heavy", "meaning": "Right tackle moves to the left side, tackle over." }]
}
```
- `id`: `type.slug`, fixed at creation, never changed even if the name changes.
- `type`: formation, ftag (formation tag), motion, tag (play tag), run, pass, oneword, glf, front, frontmod, shell, coverage, pressure. Free text, so a program can add types.
- `side`: O or D.
- `status`: active or retired. Retired terms stay for old data but are hidden in pickers.
- `meaning.text`: plain words a coach wrote. `meaning.rules`: optional structured steps the drawing tool can use. The rule vocabulary (`move`, `motion`, `route`, `block`) is a draft and will grow as terms are taught.
- `links`: relations by id. `pair` (Left/Right partner), `family`, `maps_to` (coarse tags).
- `source`: taught, imported or game. `needsReview`: true for any term added during a game, until someone approves it.
- `history`: newest last. The current name and meaning are the last entry; earlier plays resolve against the entry that was current on their date.

## Examples from what Noah had taught by 2026-11-21
Offense, with rules the drawing tool can use:
- `ftag.lite`: left tackle moves to the right side, tackle over (the mirror of Heavy).
- `ftag.outside`: boundary X/Z moves to the field hash, on the ball.
- `ftag.stooge`: H in the backfield, beside Q.
- `motion.map`: M starts opposite, in the box, then fast motion to the landing spot, QB snaps while he is moving. Needs a `landing` parameter set by the call.
- `oneword.texas`: run one word to the boundary; left hash G Vegas, right hash G Raider.

Defense fronts, one term per technique code. BEAR, OVER and UNDER exist in both an odd and an even version, so each gets two terms with the same display name and different ids. The package on the field picks which one:
- `front.base`: code 5-0-5, package odd.
- `front.bear.odd`: 3-0-3. `front.bear.even`: 5-3-0-3-5.
- `front.over.odd`: 4i-1-5. `front.over.even`: 4-2-3-5.
- `front.under.odd`: 5-1-4i. `front.under.even`: 5-3-2-4.
- Other odd: TITE 4-0-4, HEAVY 4i-0-4i, MASS 2-0-2, WIDE 9-0-9. Other even: INLAW 4-2i-2i-4, OUTLAW 5-3-3-5, VIPER 4-2-2-4, LOAD 9-3-1-5, CHOKE 4-0-4-9.
- `frontmod.mug` (LBs walked up) and `frontmod.boss` (both DTs the same side) are modifiers that attach to a front.
- Dropped and not in the glossary: TUFF, PLUS, Push/Pull.

Coverage, two layers (Noah: names are optional, each team decides):
- Coarse `shell` terms the film tagger can produce: MFC (middle of field closed), MFO (open), 1-high, 2-high, 3-high, man, zone.
- A team's own named coverages (Deer Creek: Black, Star, Clamp, Cleo, Sink, Read) are `coverage` terms with `maps_to` listing the coarse tags they mean. Star is Cover 3 with the cloud to the field, so it maps to MFC, 3-high, zone. The others are blank until Noah supplies the mapping.
- A name points to coarse tags, never the other way, because one coarse tag can hold several names. Old named data converts to coarse tags through this mapping.

## Adding terms during a game
The tool adds the word to the glossary with `source: "game"` and `needsReview: true`, and it works right away. It shows in a review list in the editor for approval, with its category fixed or merged into an existing term. Game additions travel on the device's copy, in the export file and through sync.

## Moving between devices
Export writes `glossary-<program>.json`. Import merges by `id`. When both copies changed a term, the one with the newer `updated` wins and the clash is listed for review. The sync server keeps this same format.

## Where each tool uses it
- Almanac: button lists, one-word rules, pairs, concept families, front names and codes.
- Film Room: tagging vocabulary, scout fields, reports.
- Gameplan grid: word pickers, drawings (from `meaning.rules`).

## Open questions (as of 2026-11-21)
1. Deer Creek's mapping of each named coverage to coarse tags (only Star is known).
2. How to tell the odd and even package for BEAR, OVER and UNDER in scout data.
3. Who may approve `needsReview` terms: Noah only, or any coach.
4. Rule vocabulary for drawings: to be defined as concepts, routes and blocking are taught.
5. Starter pack contents for a new program. (Later decided: none; new programs start blank.)
