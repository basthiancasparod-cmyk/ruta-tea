-- ============================================================
-- 00010: Fix missing fields from 00005 migration
--  1. Add updated_at to caa_cells (referenced by frontend helpers)
--  2. Re-migrate navigation_board_id → actions[0].toGridId
-- ============================================================

-- 1. Add updated_at column to caa_cells
ALTER TABLE caa_cells
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 2. Update existing navigation cells: migrate navigation_board_id → toGridId
--    (00005 only set navType='TO_GRID' but didn't include the target board)
UPDATE caa_cells
SET actions = jsonb_set(actions, '{0,toGridId}', to_jsonb(navigation_board_id::text), true)
WHERE navigation_board_id IS NOT NULL
  AND actions @> '[{"modelName": "GridActionNavigate", "navType": "TO_GRID"}]'::jsonb
  AND (actions #>> '{0,toGridId}') IS NULL;

-- 3. Add an index on navigation_board_id for any remaining lookups
CREATE INDEX IF NOT EXISTS idx_caa_cells_navigation_board ON caa_cells(navigation_board_id)
  WHERE navigation_board_id IS NOT NULL;
