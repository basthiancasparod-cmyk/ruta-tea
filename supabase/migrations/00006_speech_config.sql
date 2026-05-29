-- ============================================================
-- 00006: Add speech_config column to children table
-- ============================================================

ALTER TABLE children
  ADD COLUMN IF NOT EXISTS speech_config JSONB NOT NULL DEFAULT '{}'::jsonb;
