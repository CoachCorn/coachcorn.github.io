# Defense vocabulary decisions, 2026-11-23 (Noah and Louis, working session)

Context: review of Louis's Call Predictor handoff (Call_Predictor_handoff_for_Noah.zip) against the shared glossary (glossary-schema-v1.md). Everything under "Decided" was stated by Noah unless marked as an inference. Nothing here is built yet.

## Decided
1. **Over / Under are the program's own calls, not traditional football usage.** Fixed to the defense's left and right, and treated as a defensive rule everywhere, including scout data (Noah: "it's all defensive rule, treat it as such").
   - Under: front slides to the defense's left. Written from defense-left to defense-right: 5-1-4i.
   - Over: the flip. Defense-left to defense-right: 4i-1-5.
   - Louis's page has Over as "the offense's right" (the defense's left), which is the opposite of this. His Over/Under pressure lists must be re-mapped.
2. **Fronts are built like the run-game rules**: an ordered left-to-right list of alignments by slot (for example DE, nose, DE with a technique each), with Over generated as the mirror of Under from one definition. Noah can teach the technique numbers. The same structure lets a program rename or add a front without code (his earlier request).
3. **Even-front BEAR / OVER / UNDER stay as separate terms** from the odd versions. Louis's tool is the program's DC terminology, which is mainly odd fronts. FLEX is dropped.
4. **Coverages: merge Louis's list with the glossary's, and review before publishing.** Merged terms land flagged needsReview and stay out of pickers until approved.
   - Star = cloud to the field. Hammer = the technique the corner plays to get to the cloud.
   - Star and Screw are a pair, like Carolina and Panther: Star is field, Screw is boundary.
   - Ruth = plain Cover 3, both corners deep.
5. **One glossary, with an offense/defense toggle inside the glossary itself** (the `side` field, O or D). Defaults from the tab where a word is added. Terms that exist on both sides get different ids.
6. **Defender positions are program-defined terms** (`side: D`, permanent ids such as `pos.spur`). Every program calls its defenders something different, so this is a setting like the offense position letters. Pressures and drawings point at the id, not the name. Deer Creek's seed:
   - S = Spur, field outside LB (always to the field)
   - W = Will, boundary outside LB
   - M = Mike, inside LB
   - Hawk = boundary inside LB
   - E = defensive end (two: field and boundary)
   - B = Bandit, boundary safety
   - F = Free, field safety
   - C = corner (two)
   - S is the field OLB, not the strength-side OLB as in Louis's page.
7. **Defender techniques** (used in pressure definitions and in "draw a pressure", the way "trap" is used for a guard in run drawings):
   - **Q**: a technique for the defensive end.
   - **Stick**: a technique any defender can play. It sends that defender to the A gap. Think "Long Stick to A".
   - Rip = nose right A gap. Liz = nose left A gap.
   - Fox = Spur (field) blitzes the B gap, field DE loops to the C gap.
8. **Pressure sides: Wild = field, Cat = boundary.** This replaces Louis's "Wild to the strength, Cat to the weak side".
9. **Smoke and Fog are field/boundary calls** (not left/right), because Spur is always field and the boundary players are fixed.
   - **Smoke** (to the field): Mike A gap (field), End Qs to the C gap, Spur B gap.
   - **Fog**: Mike A gap, Hawk B gap, End C gap.
10. **Defensive strength is a per-program setting.** Options: Field/Boundary, Left/Right, To/Away Pass Strength, To/Away TE, Custom.
    - **Deer Creek's default is Field/Boundary.**
    - **Middle hash fallback:** on the middle hash there is no field or boundary. Deer Creek goes to the side with multiple WRs. If the middle-hash look is 2x2 (or otherwise balanced), it goes to the QB's throwing arm: a right-handed QB means right, a left-handed QB means left.
    - **Custom** lets a program enter its own strength call when none of the built-in options cover it.
    - Louis's hardcoded "more eligible receivers" rule and his "formation points" middle-hash rule are replaced by this setting.
11. **Pressures and pops (about 25 terms) get added to the glossary**, seeded from Louis's defense_library.json with needsReview. Star/Screw, Wild/Cat and Rip/Liz are pairs (glossary `pair` link).
12. **The defense is multiple, so package is part of the call** (package, front, pressure, coverage). Louis's page has no package choice. Each package lists which positions are on the field. Deer Creek's seed packages:
    - **Base**: 3-4-4 (Spur, Will, Mike, Hawk).
    - **Cyclone**: 3-3-5. The nickel comes in for Hawk, so there is no Hawk in Cyclone.
    - **Cobra**: another DE comes in and Will comes out.
    - **Nickel and dime change weekly.** Coaches tell players their spot ("you are the Spur in nickel"). They are not seeded.
    - **3-high does not change who plays it.**
13. **A pressure is only offered in packages where its positions are on the field.** Fog needs Hawk (not in Cyclone), Smoke needs Spur.

## Inferences to confirm
- Cobra is a four-man line (4-3-4, with the extra DE replacing Will), so it uses the even fronts. That would make package the answer to open question 2 in the glossary schema (how to tell odd from even for BEAR, OVER and UNDER): Base and Cyclone are odd, Cobra is even.
- Louis's "never suggested" list already names Cobra, Creek, Stack and Viper as calls, plus "nickel automatics". Cobra there is probably this package.

## Still open
- How to hold nickel and dime, which change weekly: an editable weekly package setup, or only the package name with player assignments kept off the tool?
- How Custom resolves to a side (a rule the program writes, or set by hand per call).
- The QB-arm fallback needs the opponent QB's throwing hand as a data field. Where does it live (per opponent, per game, set in scout)?
- Louis's Smoke says nose Rip and Fog says nose Liz, which are fixed right and left. Does the nose call follow the field side (Rip when the field is right), or is it set some other way?
- "End Qs (C gap)" in Smoke: which end or ends play Q?
- Mapping of each named coverage to coarse shells (only Star is known).
