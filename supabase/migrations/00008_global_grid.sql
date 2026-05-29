-- ============================================================
-- 00008: Add is_global_grid column to caa_boards
--        for the global grid (persistent navigation bar) system
-- ============================================================

ALTER TABLE caa_boards
  ADD COLUMN IF NOT EXISTS is_global_grid BOOLEAN NOT NULL DEFAULT false;
