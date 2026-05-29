-- ============================================================
-- 00025: Grid Sets — agrupa tableros CAA en conjuntos
--        (Asterics-AAC GridSet concept)
-- ============================================================

CREATE TABLE caa_grid_sets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  icon          TEXT,
  color         TEXT,
  order_index   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_caa_grid_sets_profile ON caa_grid_sets(profile_id, order_index);

ALTER TABLE caa_grid_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own grid sets"
  ON caa_grid_sets FOR ALL
  USING (auth.uid() = profile_id);

-- ──────────────────────────────────────────────────────────────

CREATE TABLE caa_grid_set_boards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grid_set_id   UUID NOT NULL REFERENCES caa_grid_sets(id) ON DELETE CASCADE,
  board_id      UUID NOT NULL REFERENCES caa_boards(id) ON DELETE CASCADE,
  order_index   INTEGER NOT NULL DEFAULT 0,
  UNIQUE(grid_set_id, board_id)
);

CREATE INDEX idx_caa_grid_set_boards_set ON caa_grid_set_boards(grid_set_id, order_index);
CREATE INDEX idx_caa_grid_set_boards_board ON caa_grid_set_boards(board_id);

ALTER TABLE caa_grid_set_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own grid set boards"
  ON caa_grid_set_boards FOR ALL
  USING (
    grid_set_id IN (
      SELECT id FROM caa_grid_sets WHERE profile_id = auth.uid()
    )
  );

-- Auto-update updated_at on grid sets
CREATE TRIGGER caa_grid_set_updated
  BEFORE UPDATE ON caa_grid_sets
  FOR EACH ROW EXECUTE FUNCTION touch_caa_board();
