-- ============================================================
-- 00007: Add locked column to caa_boards for lock/unlock system
-- ============================================================

ALTER TABLE caa_boards
  ADD COLUMN IF NOT EXISTS locked BOOLEAN NOT NULL DEFAULT false;
