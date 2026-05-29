-- ============================================================
-- 00005: Add actions[] (multi-action) + multi-span grid support
-- ============================================================

-- 1. Add multi-span columns to caa_cells
ALTER TABLE caa_cells
  ADD COLUMN IF NOT EXISTS width INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS height INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS x INTEGER,
  ADD COLUMN IF NOT EXISTS y INTEGER,
  ADD COLUMN IF NOT EXISTS actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS vocabulary_level INTEGER,
  ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pronunciation JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS dont_collect BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS toggle_in_bar BOOLEAN NOT NULL DEFAULT false;

-- 2. Migrate existing action_type to actions JSONB
UPDATE caa_cells
SET actions = jsonb_build_array(
  jsonb_build_object(
    'modelName',
    CASE
      WHEN action_type = 'add_to_message' THEN 'GridActionCollectElement'
      WHEN action_type = 'navigate' THEN 'GridActionNavigate'
      WHEN action_type = 'speak_instant' THEN 'GridActionSpeak'
      WHEN action_type = 'clear' THEN 'GridActionCollectElement'
      WHEN action_type = 'back' THEN 'GridActionNavigate'
      ELSE 'GridActionSpeak'
    END,
    'action',
    CASE
      WHEN action_type = 'add_to_message' THEN 'COLLECT_ACTION_SPEAK'
      WHEN action_type = 'clear' THEN 'COLLECT_ACTION_CLEAR'
      ELSE NULL
    END,
    'navType',
    CASE
      WHEN action_type = 'back' THEN 'TO_LAST'
      WHEN action_type = 'navigate' THEN 'TO_GRID'
      ELSE NULL
    END,
    'speakLanguage',
    CASE
      WHEN action_type = 'speak_instant' THEN 'es-ES'
      ELSE NULL
    END
  )
)
WHERE actions = '[]'::jsonb;

-- 3. Simplify caa_cells RLS to match boards pattern (direct auth.uid())
DROP POLICY IF EXISTS "Users can view own cells" ON caa_cells;
CREATE POLICY "Users can view own cells"
  ON caa_cells FOR SELECT
  USING (
    board_id IN (
      SELECT b.id FROM caa_boards b WHERE b.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own cells" ON caa_cells;
CREATE POLICY "Users can insert own cells"
  ON caa_cells FOR INSERT
  WITH CHECK (
    board_id IN (
      SELECT b.id FROM caa_boards b WHERE b.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own cells" ON caa_cells;
CREATE POLICY "Users can update own cells"
  ON caa_cells FOR UPDATE
  USING (
    board_id IN (
      SELECT b.id FROM caa_boards b WHERE b.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own cells" ON caa_cells;
CREATE POLICY "Users can delete own cells"
  ON caa_cells FOR DELETE
  USING (
    board_id IN (
      SELECT b.id FROM caa_boards b WHERE b.profile_id = auth.uid()
    )
  );

-- 4. Index for faster board lookups
CREATE INDEX IF NOT EXISTS idx_caa_cells_board_id ON caa_cells(board_id);
CREATE INDEX IF NOT EXISTS idx_caa_cells_position ON caa_cells(board_id, position_row, position_col);
