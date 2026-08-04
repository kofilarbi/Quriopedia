-- Bug 6 fix: give the matchmaking creator a way to relay the new session ID to
-- matched non-creator players without a separate coordination table.
-- 1. session_id column on matchmaking_queue — creator writes it, non-creators poll it.
-- 2. UPDATE policy — any authenticated user may update any row (queue is transient;
--    the session_id FK ensures only real session IDs can be written).
ALTER TABLE matchmaking_queue
  ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES sessions(id) ON DELETE SET NULL;

CREATE POLICY "mq_update" ON matchmaking_queue
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);
