ALTER TABLE calendar_events
  ADD COLUMN category TEXT DEFAULT 'general',
  ADD COLUMN repeat_config JSONB DEFAULT NULL;

ALTER TABLE calendar_events
  ALTER COLUMN category SET DEFAULT 'general',
  ALTER COLUMN category SET NOT NULL;

UPDATE calendar_events SET category = 'general' WHERE category IS NULL;
