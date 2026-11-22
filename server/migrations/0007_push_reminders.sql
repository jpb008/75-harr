-- Per-kind "last sent on local date" map (JSON) so each reminder type
-- (workout, evening, weekly money, weigh-in) is sent at most once a day.
ALTER TABLE subscriptions ADD COLUMN sent_log TEXT;
