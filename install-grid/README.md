# Install Grid

Passcode-gated page where a coach filters install clips by concept, play (one-word call), formation, personnel, tag and game. Clips play from Google Drive embeds. A Grid tab shows formation by concept counts.

Live path once merged: /install-grid/

## Update the clips
1. Make `clips.json` (never commit it; it is git-ignored). Shape, see `clips.sample.json`:
   `{ "title": "...", "clips": [ { "id": "<Drive file id>", "play": "Cal", "concept": "Cross", "formation": "Spill Kong RT", "personnel": "11", "tags": ["Boot"], "game": "v Union", "note": "" } ] }`
2. Encrypt it: `IG_PASS='long passphrase' node build.mjs clips.json data.enc.json`
3. Commit `data.enc.json` and push.

## Notes
- `data.enc.json` is AES-256-GCM with a PBKDF2 key. The repo is public, so anyone can download it and try passcodes offline. Use a long passphrase, not a short word.
- The passcode hides the clip IDs, not the Drive files. Each clip must be shared "anyone with the link" for the embed to play for coaches who are not signed in. Only share clips you own or have permission to share.
- The committed `data.enc.json` holds the Mesh test (16 plays, 24 clips; manifest saved in the Football project). Rebuild it with `build.mjs` whenever clips change.
- Filters live in the URL hash, so a filtered view can be sent to another coach (after they unlock).
