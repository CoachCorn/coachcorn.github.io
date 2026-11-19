# Film Room

Offensive game reports: Game Result & Why, Stats, Film Tagger. One page, one data file per game.

## Add a game
1. Put the game file in `games/` as `YYYY-opponent.json` (built by the tagger from film + almanac + roster).
2. Add it to `games/index.json`, newest first: `{"id":"2026-opponent","label":"Opponent (W 28-21)"}`.
3. Put turning-point clips in `clips/YYYY-opponent/` (MP4 plus a JPG poster for each).

Link to a specific game with `?game=2026-union`.

## Views
This public folder is the program view. Play calls, tags, Hudl numbers and review flags are stripped out. The staff view is built separately and is not published here.
