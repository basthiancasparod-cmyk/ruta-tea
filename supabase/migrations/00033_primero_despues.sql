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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE primero_despues_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own boards"
  ON primero_despues_boards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = primero_despues_boards.child_id
      AND children.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own boards"
  ON primero_despues_boards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = primero_despues_boards.child_id
      AND children.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own boards"
  ON primero_despues_boards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = primero_despues_boards.child_id
      AND children.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own boards"
  ON primero_despues_boards FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = primero_despues_boards.child_id
      AND children.profile_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_primero_despues_child ON primero_despues_boards(child_id);
