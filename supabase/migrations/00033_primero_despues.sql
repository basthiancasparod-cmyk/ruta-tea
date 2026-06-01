-- ============================================================
-- 00033: First-Then Board table (primero_despues_boards)
-- ============================================================

CREATE TABLE IF NOT EXISTS primero_despues_boards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  first_label TEXT NOT NULL,
  first_emoji TEXT NOT NULL DEFAULT '📋',
  first_minutes INTEGER DEFAULT NULL,
  then_label TEXT NOT NULL,
  then_emoji TEXT NOT NULL DEFAULT '🎁',
  then_minutes INTEGER DEFAULT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  last_used_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS primero_despues_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES primero_despues_boards(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  first_duration_seconds INTEGER DEFAULT NULL,
  then_duration_seconds INTEGER DEFAULT NULL,
  completed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE primero_despues_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own boards"
  ON primero_despues_boards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = primero_despues_boards.child_id
      AND auth.uid() IN (
        SELECT user_id FROM profiles WHERE id = children.profile_id
      )
    )
  );

CREATE POLICY "Users can insert own boards"
  ON primero_despues_boards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = primero_despues_boards.child_id
      AND auth.uid() IN (
        SELECT user_id FROM profiles WHERE id = children.profile_id
      )
    )
  );

CREATE POLICY "Users can update own boards"
  ON primero_despues_boards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = primero_despues_boards.child_id
      AND auth.uid() IN (
        SELECT user_id FROM profiles WHERE id = children.profile_id
      )
    )
  );

CREATE POLICY "Users can delete own boards"
  ON primero_despues_boards FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = primero_despues_boards.child_id
      AND auth.uid() IN (
        SELECT user_id FROM profiles WHERE id = children.profile_id
      )
    )
  );

CREATE INDEX IF NOT EXISTS idx_primero_despues_child ON primero_despues_boards(child_id);
CREATE INDEX IF NOT EXISTS idx_primero_despues_sessions_board ON primero_despues_sessions(board_id);

ALTER TABLE primero_despues_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON primero_despues_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = primero_despues_sessions.child_id
      AND auth.uid() IN (
        SELECT user_id FROM profiles WHERE id = children.profile_id
      )
    )
  );

CREATE POLICY "Users can insert own sessions"
  ON primero_despues_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = primero_despues_sessions.child_id
      AND auth.uid() IN (
        SELECT user_id FROM profiles WHERE id = children.profile_id
      )
    )
  );

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_primero_despues_updated_at ON primero_despues_boards;
CREATE TRIGGER set_primero_despues_updated_at
  BEFORE UPDATE ON primero_despues_boards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
