-- ============================================================
-- CAA Tables + RLS policies
-- ============================================================

-- 1. TABLA: caa_boards
CREATE TABLE IF NOT EXISTS caa_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  grid_size TEXT NOT NULL DEFAULT '4x6',
  columns INTEGER NOT NULL DEFAULT 6,
  rows INTEGER NOT NULL DEFAULT 4,
  is_template BOOLEAN NOT NULL DEFAULT false,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  category TEXT DEFAULT 'custom',
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE caa_boards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own boards" ON caa_boards;
CREATE POLICY "Users can view own boards"
  ON caa_boards FOR SELECT
  USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own boards" ON caa_boards;
CREATE POLICY "Users can insert own boards"
  ON caa_boards FOR INSERT
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own boards" ON caa_boards;
CREATE POLICY "Users can update own boards"
  ON caa_boards FOR UPDATE
  USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own boards" ON caa_boards;
CREATE POLICY "Users can delete own boards"
  ON caa_boards FOR DELETE
  USING (profile_id = auth.uid());

-- 2. TABLA: caa_cells
CREATE TABLE IF NOT EXISTS caa_cells (
  id TEXT NOT NULL,
  board_id UUID NOT NULL REFERENCES caa_boards(id) ON DELETE CASCADE,
  position_row INTEGER NOT NULL,
  position_col INTEGER NOT NULL,
  label TEXT NOT NULL,
  pictogram_keyword TEXT,
  pictogram_id INTEGER,
  custom_image_url TEXT,
  background_color TEXT NOT NULL DEFAULT '#FFFFFF',
  border_color TEXT NOT NULL DEFAULT '#E2E8F0',
  text_color TEXT NOT NULL DEFAULT '#1A202C',
  fitzgerald_key TEXT,
  vocalization TEXT,
  action_type TEXT NOT NULL DEFAULT 'add_to_message',
  navigation_board_id UUID,
  is_folder BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id, board_id)
);

ALTER TABLE caa_cells ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own cells" ON caa_cells;
CREATE POLICY "Users can view own cells"
  ON caa_cells FOR SELECT
  USING (
    auth.uid() IN (
      SELECT p.user_id FROM profiles p
      JOIN caa_boards b ON b.profile_id = p.id
      WHERE b.id = caa_cells.board_id
    )
  );

DROP POLICY IF EXISTS "Users can insert own cells" ON caa_cells;
CREATE POLICY "Users can insert own cells"
  ON caa_cells FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT p.user_id FROM profiles p
      JOIN caa_boards b ON b.profile_id = p.id
      WHERE b.id = caa_cells.board_id
    )
  );

DROP POLICY IF EXISTS "Users can update own cells" ON caa_cells;
CREATE POLICY "Users can update own cells"
  ON caa_cells FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT p.user_id FROM profiles p
      JOIN caa_boards b ON b.profile_id = p.id
      WHERE b.id = caa_cells.board_id
    )
  );

DROP POLICY IF EXISTS "Users can delete own cells" ON caa_cells;
CREATE POLICY "Users can delete own cells"
  ON caa_cells FOR DELETE
  USING (
    auth.uid() IN (
      SELECT p.user_id FROM profiles p
      JOIN caa_boards b ON b.profile_id = p.id
      WHERE b.id = caa_cells.board_id
    )
  );

-- 3. TABLA: caa_usage_history
CREATE TABLE IF NOT EXISTS caa_usage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  board_id TEXT,
  cell_id TEXT,
  message_text TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE caa_usage_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own usage history" ON caa_usage_history;
CREATE POLICY "Users can view own usage history"
  ON caa_usage_history FOR SELECT
  USING (
    auth.uid() IN (
      SELECT p.user_id FROM profiles p
      JOIN children c ON c.profile_id = p.id
      WHERE c.id = caa_usage_history.child_id
    )
  );

DROP POLICY IF EXISTS "Users can insert usage history" ON caa_usage_history;
CREATE POLICY "Users can insert usage history"
  ON caa_usage_history FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT p.user_id FROM profiles p
      JOIN children c ON c.profile_id = p.id
      WHERE c.id = caa_usage_history.child_id
    )
  );
