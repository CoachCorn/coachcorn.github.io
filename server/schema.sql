-- Coach suite server: one row per program, one row per synced document.
CREATE TABLE IF NOT EXISTS programs (
  id TEXT PRIMARY KEY,          -- e.g. deer-creek
  name TEXT NOT NULL,
  pass_salt TEXT NOT NULL,
  pass_hash TEXT NOT NULL,
  created TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS docs (
  program TEXT NOT NULL,
  key TEXT NOT NULL,            -- glossary, game/<id>
  rev INTEGER NOT NULL,
  body TEXT NOT NULL,
  updated TEXT NOT NULL,
  device TEXT,
  PRIMARY KEY (program, key)
);
CREATE TABLE IF NOT EXISTS fails (
  program TEXT NOT NULL,
  at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS fails_p ON fails(program, at);
