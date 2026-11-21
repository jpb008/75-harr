CREATE TABLE weekly_reviews (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  week_start TEXT NOT NULL,
  answers_json TEXT NOT NULL,
  stats_json TEXT NOT NULL,
  proposed_adjustments_json TEXT,
  applied INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, week_start)
);
