-- ============================================================
-- 00030: Drop icon & color from calendar_events (derived from category)
-- ============================================================

ALTER TABLE calendar_events
  DROP COLUMN icon,
  DROP COLUMN color;
