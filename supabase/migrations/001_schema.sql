-- Categories (reference data)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  bg_class TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Knowledge entries
CREATE TABLE IF NOT EXISTS entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  headline TEXT NOT NULL,
  body TEXT NOT NULL,
  read_more TEXT,
  type TEXT NOT NULL CHECK (type IN ('fact', 'vocab', 'insight')),
  published_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS entries_category_date ON entries(category_id, published_date);

-- User profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  notifications_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  notification_time TEXT NOT NULL DEFAULT '08:00',
  dark_mode BOOLEAN NOT NULL DEFAULT FALSE,
  streak_count INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_profiles_updated_at ON user_profiles;
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- User selected categories
CREATE TABLE IF NOT EXISTS user_categories (
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, category_id)
);

-- Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, entry_id)
);

-- RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Categories & entries: readable by all authenticated users
CREATE POLICY "categories_read" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "entries_read" ON entries FOR SELECT TO authenticated USING (true);

-- Profiles: only own row
CREATE POLICY "profiles_select" ON user_profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- User categories: only own rows
CREATE POLICY "user_categories_select" ON user_categories FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_categories_insert" ON user_categories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_categories_delete" ON user_categories FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Bookmarks: only own rows
CREATE POLICY "bookmarks_select" ON bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "bookmarks_insert" ON bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_delete" ON bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);
