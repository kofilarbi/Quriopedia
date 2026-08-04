-- Bug 3 fix: store user's IANA timezone alongside notification_time so the edge
-- function can compare notification_time in the user's local time rather than UTC.
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS notification_timezone TEXT NOT NULL DEFAULT 'UTC';
