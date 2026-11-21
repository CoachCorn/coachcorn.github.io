# Coach suite server (Cloudflare Worker + D1)

Sync for the suite app (coachcorn.github.io/suite): one passcode per program, glossary and Almanac games stored per program.
Runs on Cloudflare's free plan. Holds no secrets in this folder.

## Endpoints
- `GET /health`
- `POST /setup` (header `X-Admin-Key`) `{program, name, code}`: create a program or change its passcode (signs every device out)
- `POST /login` `{program, code}` -> `{token, name, exp}` (60 days; 10 wrong tries locks the program for 15 minutes)
- `GET /docs?since=` list of documents (no bodies)
- `GET /doc?key=glossary|game/<id>`
- `PUT /doc` `{key, baseRev, body, device}`: baseRev must match the server's rev (0 for new), else 409 with the server copy

## Deploy (Cloudflare dashboard)
1. D1: create a database named `coach-suite`; put its id in `wrangler.toml` (`database_id`). Tables are created on first request.
2. Workers: import this GitHub repo, root directory `server`, deploy command `npx wrangler deploy`.
3. Worker settings > Variables and Secrets: add secrets `SIGNING_KEY` and `ADMIN_KEY` (long random strings).
4. Open the suite app > Sign in > First-time setup with the admin key to create the program and staff passcode.

## Local test
`npx wrangler dev --local` with a `.dev.vars` file holding SIGNING_KEY and ADMIN_KEY.
