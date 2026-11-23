# Developing the coach suite (for Louis and his Claude)

The suite is plain HTML and JavaScript. There is no build step and no framework. Edit a file, reload the page. Working name KDNCE (being renamed). Live at https://coachcorn.github.io/suite/.

## Where things are

| Path | What it is |
|---|---|
| `suite/index.html` | The shell: home screen, tabs, sign-in, Settings, Offense/Defense switch. |
| `suite/gameplan.html` | Gameplan grid, drawing editor, predicted defense (`predict()`), libraries. |
| `suite/glossary.html` | Glossary tiles, definition builders, Hudl word import. |
| `suite/film.html` | Film Room (self-scout, tagger, reports, clips). |
| `suite/stats.html` | Stats tab. |
| `suite/sync.js` | Sync with the server (glossary, games, plans, schedule). |
| `suite/sw.js` | Offline cache. **Bump `const V='suite-vNN'` when a change ships.** |
| `almanac/index.html` | Sideline logger. Its own cache in `almanac/sw.js` (`almanac-vNN`). |
| `shared/glossary.js` | Glossary data model. |
| `shared/scout.js` | Opponent scout reader and `TECH` front codes. A copy of the Almanac importer; keep both in step. |
| `shared/importer.js`, `shared/filedrop.js`, `shared/demoseed.js` | Game import, drag-and-drop on imports, demo-mode fake season. |
| `server/` | Cloudflare Worker + D1 + R2. Routes are in `server/src/index.js`; see `server/README.md`. |
| `mental-reps/` | Flashcard app and its Apps Script (`Code.gs`). |
| `film-room/`, `alm-vkx64w/`, `mental-reps-v1/`, `install-grid/`, `long-term-wigs/` | Older or separate pages. Leave alone unless asked. |

## Where the defensive side plugs in
- **Side switch:** `suite/index.html` keeps `SIDE` ('O' or 'D') in localStorage key `suite_side`; `setSide()` re-renders home. The Defense home currently shows "Coming with the defensive side".
- **Placeholder tile:** the `dalmanac` ("Defensive Almanac") entry in the tool list in `suite/index.html`.
- **Front codes:** `TECH` exists in two places, `almanac/index.html` and `shared/scout.js`. Keep them identical. The glossary also seeds fronts (`side:'D'`) from `TECH`.
- **Predicted defense:** `predict()` in `suite/gameplan.html` and the predicted-call bar in `almanac/index.html`.
- **Glossary:** terms have a `side` field, so defensive terms can live in the same glossary.

## Run it locally
```
python3 -m http.server 8123    # from the repo root
# open http://localhost:8123/suite/
```
Signed out, the suite runs in **demo mode**: separate demo storage and a fake season. That is the safe way to work.

Headless tests: Playwright (Python) against that server. Run test scripts with `python3 -I`. Use one browser context per test when two pages must share localStorage. Everything so far has been tested in desktop Chromium only; nothing has run on a real iPad.

## Things that touch Noah's accounts (do not test against these)
- **Sync server** (`kdnce.coachnoahcornell.workers.dev`): holds Deer Creek's real glossary, games and plans behind a passcode. Work in demo mode, or deploy your own Worker and D1 database from `server/` and change `wrangler.toml` and the server address.
- **Apps Script URLs:** `suite/gameplan.html` ("Send to Mental Reps") and `mental-reps/index.html` post to Noah's Google Sheet endpoints. Testing those writes into his sheet.
- **Secrets** (`SIGNING_KEY`, `ADMIN_KEY`) live only in the Cloudflare dashboard. Never commit them.
- **The repo is public.** The Deer Creek film and game files already in `film-room/` stay (Noah's decision). Do not add rosters or player data.

## Scope
Noah's rule: Louis can do whatever the defensive side needs, as long as it does not break the offensive side. Before merging, open the suite signed out (demo mode), check the Gameplan, Almanac, Glossary and Film Room tabs still load, and confirm any shared file you touched (`shared/*.js`, `suite/index.html`, `suite/sync.js`) behaves the same for offense. Defensive vocabulary decisions are in the project doc `defense-vocabulary-decisions-2026-11-23.md` (Over/Under are fixed to the defense's left and right; positions, packages and strength are program settings).

## Branch and merge workflow (suggested, not yet agreed)
1. Work on a branch (start from `louis-defense`), not on `main`.
2. Open a pull request into `main`; Noah merges.
3. Leave the `sw.js` cache bump to whoever merges, so two branches do not conflict on that line.
4. Pull `main` before you start each session; both sides edit the same files (`suite/index.html` especially).

## Deploy and roll back
- The site is served from `main` (GitHub Pages). A push to `main` goes live in about a minute. iPad home-screen apps must be fully closed and reopened to pick up an update, which is why the cache number is bumped.
- Roll back with `git revert <commit>` and push, then bump the cache again. Do not force-push `main`.
- The server deploys from GitHub on push (`npx wrangler deploy --config server/wrangler.toml`).

## Conventions
- Do not change the 27-column Hudl export order.
- Deer Creek terminology only unless Noah says otherwise.
- Say what is untested. Noah wants data-first and direct; no hype.
- Collect test notes before big builds; build when Noah says go.
