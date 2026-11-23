> Copied from the KDNCE Project on 2026-11-23 (written 2026-11-21). Historical: the predictor bar has since been built (see scout-predictor-built-status.md). Where this conflicts with `defense-vocabulary-decisions-2026-11-23.md`, the decisions doc wins: Over/Under are fixed to the defense's left and right, not relative to TE strength.

# Defensive call predictor inside the almanac: handoff (2026-11-21)

Noah said to build the predictor inside the almanac (the go-ahead covered the predictor bar only, not the gameplan grid).

## Goal
In the almanac entry screen, after the formation is entered, show what the defense is most likely to do (from the opponent's Hudl-derived scouting data) so Noah can see it before calling the play, plus his own pre-decided "best call" into that look.

## Where Noah wants it (UI, his words condensed)
- Worried about visual clutter, so: a long horizontal popup/bar, split in half like the run/pass split, appearing only AFTER the formation data is entered (hidden before down, distance, hash and formation exist). Sits between the formation cards and the called play.
- Left half: predicted defense, two rows: top = most common, bottom = second most common. Each shows coverage + rushers + front with % and n.
- Right half: "best call" into that look. Noah does want this, but entered midweek during gameplanning (not decided Saturday morning): it comes from a guided "what's your favorite call into ____" section of the gameplan work (grid spec: gameplan-grid-spec.md, second grid). Until that exists, the right half stays empty or is skipped.
- Predicted call by formation; when n < 5 fall back to down and distance and/or personnel, and say that it fell back. Noah likes this behavior and wants it kept. Empty rows show nothing.
- Noah's data norms: 3+ clips is usually a valid sample; typically 300-400 clips per opponent (earlier estimate ~280). A 34-play Mustang check: coverage matched 21/34, front 23/34, all three 5/34, so show tendencies, not certainties.

## Data source and plumbing
- Source: the Defensive Call Predictor workbook (Google Sheets, "Opponent Scout" sheet with Raw Data, derived from the opponent's Hudl data). It holds per-play columns including V (T R/L = TE side) and W (F/B: F = Field, M = Middle, B = Boundary).
- Direction (Noah): NOT putting the predictor on the "Touchdown to Checkdown" Google Site. It lives in the film room / almanac / gameplanner tool.
- Needs a per-opponent export or file load so the almanac works offline on the sideline (built as the Scout button reading the Raw Data .xlsx).
- Idea under consideration (unsure): an opponent scout almanac. Worry: not enough people to tag front/coverage/pressure live, so rely on past data. Noah would NOT tag defensive fronts during the game.

## Front naming: structural technique codes (locked so far)
Noah is converting the predictor's Front Family from arbitrary names to structural codes so it reports "where they'll be." Display should show the code (and the name as secondary).
- Odd fronts (3 slots: strong tech - nose - weak tech): BASE 5-0-5, TITE 4-0-4, HEAVY 4i-0-4i, BEAR 3-0-3 (was "Big"), MASS 2-0-2, OVER 4i-1-5, UNDER 5-1-4i, WIDE 9-0-9 (fixed).
- Even fronts (4-5 slots, edge to edge): INLAW 4-2i-2i-4, OUTLAW 5-3-3-5, VIPER 4-2-2-4, LOAD 9-3-1-5, CHOKE 4-0-4-9, BEAR 5-3-0-3-5, OVER 4-2-3-5, UNDER 5-3-2-4.
- BEAR, OVER and UNDER appear in both lists; disambiguate by which package is on the field. TITE and HEAVY are odd only.
- MUG and BOSS are suffix modifiers on any base code (e.g. "505 BOSS"), not fronts. MUG = LBs walked up; BOSS = both DTs to the same side.
- TUFF is dead. Push/Pull (G-tag moves the DT) is NOT tracked; dropped. PLUS is not an active call.
- Superseded on 2026-11-23: this doc originally said OVER/UNDER are relative to TE/formation strength (Kong Rt example) and to use workbook columns V and W for the field/boundary read. Noah's later decision: Over/Under are the program's own calls, fixed to the defense's left and right, and a defensive rule everywhere including scout data.
- Open architecture decision: retag raw data with technique codes (name becomes cosmetic) vs. keep tagging by name and translate in a lookup layer for display and prediction. Currently the lookup layer (TECH table in code). Noah leans to relying on past data and not tagging in game.
- Future feature (save only): let Noah rename a front or add a new front/technique to the mapping himself (not hardcoded).

## Almanac code facts the predictor needs (as of v41)
- Single-file vanilla JS PWA, service worker `const V='almanac-vNN'` (bump on deploy). Storage localStorage `almanac_v1`, migration version `A.v`.
- Draft `d` has: down, dist, f (ball on), hash, ftags[], formation, motion, mpos, glf, call, tags[], result, gain, target, player, passer. Per-game `G().plan`, `G().extra`; master lists in `A.lists`.
- Entry order: Down, Distance, Ball on, Hash, Formation tag, Motion / Shift, Formation, FIB, GLF, Play tags, One Word, Run / Pass concepts, Target, Result, Gain/loss, Passer, Player. Search boxes on all the long lists; Enter jumps to the next search box.
- Render is `renderEntry()`; the predictor bar is built there once down/dist/hash/formation are set. Formation is always to the field in Deer Creek's one-word rules.
- Never change the 27-column Hudl export order. Deer Creek terminology only; Noah's personal terminology only if he says "my terminology", "personal" or "my stuff".
- Test approach used before: jsdom scripts that load the file and drive inputs; Playwright for screenshots.

## Related docs
gameplan-grid-spec.md (predicted defense strip, favorite-call grid), gameplan-grid-roadmap.md, almanac-product-vision-notes.md (these three are in the KDNCE Project, not in the repo).
