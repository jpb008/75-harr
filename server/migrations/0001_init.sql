CREATE TABLE subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  tz_offset_minutes INTEGER NOT NULL DEFAULT 0,
  last_sent_date TEXT,
  last_sent_level TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
