-- Room code generator function
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished')),
  round_count INTEGER NOT NULL DEFAULT 10,
  room_code TEXT NOT NULL UNIQUE DEFAULT generate_room_code(),
  is_private BOOLEAN NOT NULL DEFAULT true,
  question_ids JSONB NOT NULL DEFAULT '[]',
  current_question_index INTEGER NOT NULL DEFAULT -1,
  question_started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS sessions_room_code_idx ON sessions(room_code);
CREATE INDEX IF NOT EXISTS sessions_status_idx ON sessions(status) WHERE status != 'finished';

-- Session players
CREATE TABLE IF NOT EXISTS session_players (
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  is_ready BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (session_id, user_id)
);

-- Session answers
CREATE TABLE IF NOT EXISTS session_answers (
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  question_id UUID REFERENCES trivia_questions(id),
  answer_index INTEGER,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  response_time_ms INTEGER,
  score_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (session_id, user_id, question_index)
);

-- Match history
CREATE TABLE IF NOT EXISTS match_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  final_rank INTEGER NOT NULL,
  final_score INTEGER NOT NULL,
  questions_correct INTEGER NOT NULL,
  questions_total INTEGER NOT NULL,
  category_id TEXT REFERENCES categories(id),
  opponent_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS match_results_user_idx ON match_results(user_id, created_at DESC);

-- Matchmaking queue
CREATE TABLE IF NOT EXISTS matchmaking_queue (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id),
  display_name TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Friends (bidirectional: store both directions)
CREATE TABLE IF NOT EXISTS friends (
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, friend_id)
);

-- RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchmaking_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- sessions: any auth user can read; any auth user can create; only host can update
CREATE POLICY "sessions_select" ON sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "sessions_insert" ON sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "sessions_update" ON sessions FOR UPDATE TO authenticated USING (auth.uid() = host_id);

-- session_players: participants can read their session; any auth user can insert own row; own row update
CREATE POLICY "sp_select" ON session_players FOR SELECT TO authenticated USING (true);
CREATE POLICY "sp_insert" ON session_players FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sp_update" ON session_players FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "sp_delete" ON session_players FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- session_answers: participants can read all answers in their session; insert own; no update
CREATE POLICY "sa_select" ON session_answers FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM session_players sp WHERE sp.session_id = session_answers.session_id AND sp.user_id = auth.uid()));
CREATE POLICY "sa_insert" ON session_answers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- match_results: own rows only
CREATE POLICY "mr_select" ON match_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "mr_insert" ON match_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- matchmaking_queue: own row CRUD; all authenticated can read (needed for matching)
CREATE POLICY "mq_select" ON matchmaking_queue FOR SELECT TO authenticated USING (true);
CREATE POLICY "mq_insert" ON matchmaking_queue FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mq_delete" ON matchmaking_queue FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- friends: own rows
CREATE POLICY "friends_select" ON friends FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "friends_insert" ON friends FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "friends_delete" ON friends FOR DELETE TO authenticated USING (auth.uid() = user_id);
