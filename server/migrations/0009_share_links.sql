-- Private read-only links a user can send to one accountability friend.
-- The page shows only a nickname, the 75 Hard day count, streak and
-- whether today's checklist is done.
CREATE TABLE share_links (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  nickname TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_share_links_user ON share_links(user_id);
