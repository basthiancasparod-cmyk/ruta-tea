-- ============================================================
-- 00031: Registro de Conducta — token board & behavior logs
-- ============================================================

CREATE TABLE token_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id      UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  reward_text   TEXT NOT NULL DEFAULT 'Mi recompensa',
  reward_emoji  TEXT NOT NULL DEFAULT '🎁',
  total_tokens  INTEGER NOT NULL DEFAULT 10,
  earned_tokens INTEGER NOT NULL DEFAULT 0,
  is_completed  BOOLEAN NOT NULL DEFAULT false,
  session_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE behavior_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id      UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  behavior_type TEXT NOT NULL CHECK (behavior_type IN ('positive','challenging','neutral')),
  category      TEXT DEFAULT 'other',
  intensity     INTEGER CHECK (intensity BETWEEN 1 AND 5),
  description   TEXT NOT NULL DEFAULT '',
  antecedent    TEXT DEFAULT '',
  consequence   TEXT DEFAULT '',
  mood_before   INTEGER CHECK (mood_before BETWEEN 1 AND 5),
  mood_after    INTEGER CHECK (mood_after BETWEEN 1 AND 5),
  logged_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_token_sessions_child_date ON token_sessions(child_id, session_date);
CREATE INDEX idx_behavior_logs_child_date ON behavior_logs(child_id, logged_at);

ALTER TABLE token_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own child token_sessions"
  ON token_sessions FOR ALL
  USING (child_id IN (SELECT id FROM children WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY "Users manage own child behavior_logs"
  ON behavior_logs FOR ALL
  USING (child_id IN (SELECT id FROM children WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));
