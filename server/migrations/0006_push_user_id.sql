ALTER TABLE subscriptions ADD COLUMN user_id TEXT REFERENCES users(id);
