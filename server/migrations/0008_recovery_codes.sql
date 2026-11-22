-- One-time recovery codes so a forgotten password can be reset without an
-- email service. Only a SHA-256 hash of each code is stored.
CREATE TABLE recovery_codes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  code_hash TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_recovery_codes_user ON recovery_codes(user_id);

-- Tokens issued before a password reset stop working (unix seconds).
ALTER TABLE users ADD COLUMN password_changed_at INTEGER;
-- Wrong-code throttle: 5 misses locks recovery for 15 minutes.
ALTER TABLE users ADD COLUMN recovery_failures INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN recovery_locked_until INTEGER;
