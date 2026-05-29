-- ============================================================
-- CAA Tables
-- profile_id en caa_boards = auth.users.id (no profiles.id)
-- para coincidir con el patrón del route.ts existente
-- ============================================================

CREATE TABLE caa_boards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id      UUID REFERENCES children(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  grid_size     TEXT NOT NULL DEFAULT '4x6'
                  CHECK (grid_size IN ('3x4','4x6','5x8','5x10','5x12','5x16','custom')),
  columns       INTEGER NOT NULL DEFAULT 6,
  rows          INTEGER NOT NULL DEFAULT 4,
  is_template   BOOLEAN NOT NULL DEFAULT false,
  is_favorite   BOOLEAN NOT NULL DEFAULT false,
  category      TEXT,
  locked        BOOLEAN NOT NULL DEFAULT false,
  is_global_grid BOOLEAN NOT NULL DEFAULT false,
  settings      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE caa_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own boards"
  ON caa_boards FOR ALL
  USING (auth.uid() = profile_id);

-- Permitir leer tableros template a cualquiera autenticado
CREATE POLICY "Users read templates"
  ON caa_boards FOR SELECT
  USING (is_template = true AND auth.uid() IS NOT NULL);

-- ──────────────────────────────────────────────────────────────
CREATE TABLE caa_cells (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id            UUID NOT NULL REFERENCES caa_boards(id) ON DELETE CASCADE,
  position_row        INTEGER NOT NULL DEFAULT 0,
  position_col        INTEGER NOT NULL DEFAULT 0,
  label               TEXT NOT NULL DEFAULT '',
  pictogram_keyword   TEXT,
  pictogram_id        INTEGER,
  custom_image_url    TEXT,
  background_color    TEXT NOT NULL DEFAULT '#f1f5f9',
  border_color        TEXT NOT NULL DEFAULT '#94a3b8',
  text_color          TEXT NOT NULL DEFAULT '#1e293b',
  fitzgerald_key      TEXT CHECK (fitzgerald_key IN
                        ('social','subject','verb','object','descriptive','place','time')),
  color_category      TEXT,
  vocalization        TEXT,
  action_type         TEXT,           -- compat backward
  navigation_board_id UUID,
  is_folder           BOOLEAN NOT NULL DEFAULT false,
  order_index         INTEGER NOT NULL DEFAULT 0,
  -- layout libre (Asterics-AAC span)
  width               INTEGER DEFAULT 1,
  height              INTEGER DEFAULT 1,
  x                   INTEGER,
  y                   INTEGER,
  -- multi-action (array JSON de CAAAction)
  actions             JSONB NOT NULL DEFAULT '[]'::jsonb,
  vocabulary_level    INTEGER,
  hidden              BOOLEAN NOT NULL DEFAULT false,
  pronunciation       JSONB,
  dont_collect        BOOLEAN NOT NULL DEFAULT false,
  toggle_in_bar       BOOLEAN NOT NULL DEFAULT false,
  grid_element_type   TEXT DEFAULT 'normal',
  word_forms          JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_caa_cells_board ON caa_cells(board_id);

ALTER TABLE caa_cells ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage cells of own boards"
  ON caa_cells FOR ALL
  USING (
    board_id IN (
      SELECT id FROM caa_boards WHERE profile_id = auth.uid()
    )
  );

-- ──────────────────────────────────────────────────────────────
CREATE TABLE caa_usage_history (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id     UUID REFERENCES children(id) ON DELETE CASCADE,
  profile_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  board_id     UUID,
  cell_id      UUID,
  message_text TEXT,
  timestamp    TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id   TEXT,
  context      JSONB
);

CREATE INDEX idx_caa_usage_child ON caa_usage_history(child_id, timestamp DESC);

ALTER TABLE caa_usage_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own usage"
  ON caa_usage_history FOR ALL
  USING (auth.uid() = profile_id);

-- Auto-update updated_at en boards
CREATE OR REPLACE FUNCTION touch_caa_board()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER caa_board_updated
  BEFORE UPDATE ON caa_boards
  FOR EACH ROW EXECUTE FUNCTION touch_caa_board();