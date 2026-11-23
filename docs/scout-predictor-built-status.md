> Copied from the KDNCE Project on 2026-11-23 (written 2026-11-21, almanac v43). The repo has moved on since. Where this conflicts with `defense-vocabulary-decisions-2026-11-23.md`, the decisions doc wins (for example, Over/Under are fixed to the defense's left and right).

# Scout import + predicted call bar: built status (2026-11-21, almanac v43)

Supersedes the "nothing is built yet" status in defensive-predictor-almanac-handoff.md. Live at https://coachcorn.github.io/almanac/ (repo CoachCorn/coachcorn.github.io, almanac/index.html; old copy alm-vkx64w mirrored). Tested only on a mock workbook so far, not on Noah's real scout file.

## What exists
- Header "Scout" button: pick the Raw Data tab as .xlsx (or .csv). Parsed in the browser with no library (zip + XML via DecompressionStream; needs a recent iPad Safari, CSV is the fallback). Stored per game in G().scout = {name, src, at, rows[]}.
- The workbook is split into opponent blocks (a row with only a team name in column A starts one; otherwise play numbers restarting start an unlabeled "Block N (plays a-b)"). Offense rows (ODK not D) are skipped. Noah picks the block and names it.
- Row fields kept: play #, down, distance, hash, ball on (from YARD LN: negative = own, positive = opp), formation (OFF FORM, LT/RT stripped), personnel, front, rushers (PRESSURE BROUGHT), coverage, EFF, explosive, gain, play type, concept.
- Predicted call bar: between the formation cards and the play, shown only after formation AND hash are picked. Left = two most common looks (coverage, rush count, front as technique code + name) with % and n. Right = Best call slots, row-aligned (Best call / Best call 2). A muted line shows the top coverage, rush and front alone.
- Lookup order, first level with at least 3 plays wins, and the bar says which: formation + down & distance + field zone; formation + down & distance; formation only; down & distance only.
- Distance buckets: 1st and 4th down = any distance; 2nd and 3rd = 1-3, 4-6, 7+. Field zones from Ball on: backed up (1-20), own 20-40 (21-40), open field (41-60), plus territory (61-80), opp 20-10 (81-90), red zone (91-99). Edge placement is provisional until checked against the real file (the import warns when its zones disagree with the sheet's FIELD ZONE tags).
- Technique codes shown from the locked table. BEAR / OVER / UNDER have odd and even versions: with 3 rushers the odd code is shown, otherwise only the name. MUG / BOSS append as suffixes; DBL is ignored.

## Best call data contract (for the gameplan grid "send to almanac")
G().best = { "FRONT|RUSH|COVERAGE": "CALL", "COVERAGE": "CALL" }. Exact look key wins, then coverage-only. A value may be an array (first item shown). Calls are typed by Noah midweek in the gameplan grid second grid; the predictor never fills them. Nothing writes G().best yet, so the right column shows "not set".

## Midweek notes (not built)
Green/red numbers per concept into a look: +N% eff and +N% explosive vs the opponent's own average, each number colored separately (green above, red below), with clip count, 3-clip floor, no ranking needed. Lives in the gameplan grid second grid, not in the Almanac. Rules: EFF = 1st down 4+, 2nd down half to go rounded up, 3rd/4th convert; explosive = 15+ any play type.

## Open
- Real scout .xlsx still needs a run through the importer (block names, zone edges, formation spellings). A later check (2026-11-22) of a real Hudl export read 347 defensive plays in 5 unlabeled blocks with 0 skipped; COVERAGE was blank on 168 plays and FRONT FAMILY blank on 94.
- Almanac's own stats still use explosive 12 run / 16 pass; Noah's scout rule is 15. Ask before changing.
- Odd vs even front for BEAR / OVER / UNDER: how to tell which package was on the field. (Inference in the decisions doc: package decides; Base and Cyclone odd, Cobra even.)
- Front tagging stays by name with a translation table (TECH in the code); rename/add-a-front editing is not built.
