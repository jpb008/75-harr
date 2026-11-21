CREATE TABLE onboarding_answers (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  answers_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  version INTEGER NOT NULL,
  plan_json TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'onboarding',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, version)
);

CREATE INDEX idx_plans_user ON plans(user_id, version DESC);
