CREATE TABLE app_state (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  state_json TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
