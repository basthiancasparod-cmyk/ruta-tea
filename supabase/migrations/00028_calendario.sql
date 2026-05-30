-- ============================================================
-- 00028: Calendario infantil — child calendar & events
-- ============================================================

CREATE TABLE calendar_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  event_date  DATE NOT NULL,
  event_time  TIME,
  end_time    TIME,
  color       TEXT NOT NULL DEFAULT '#44B39D',
  icon        TEXT NOT NULL DEFAULT '📅',
  all_day     BOOLEAN NOT NULL DEFAULT false,
  repeat_type TEXT NOT NULL DEFAULT 'none'
                CHECK (repeat_type IN ('none','daily','weekly','monthly')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_calendar_events_child_date ON calendar_events(child_id, event_date);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own child calendar events"
  ON calendar_events FOR ALL
  USING (
    child_id IN (
      SELECT id FROM children WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );
