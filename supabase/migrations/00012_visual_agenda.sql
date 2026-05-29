-- ============================================================
-- Módulo: Agenda Visual
-- ============================================================

-- Tabla de agendas por niño
CREATE TABLE visual_agendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Mi Agenda',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE visual_agendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles can manage own agendas"
  ON visual_agendas FOR ALL
  USING (
    auth.uid() IN (
      SELECT p.user_id FROM profiles p
      JOIN children c ON c.profile_id = p.id
      WHERE c.id = visual_agendas.child_id
    )
  );

-- Tabla de tareas por agenda
CREATE TABLE agenda_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_id UUID NOT NULL REFERENCES visual_agendas(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  keyword TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('morning', 'afternoon', 'evening')),
  order_index INTEGER NOT NULL DEFAULT 0,
  done BOOLEAN NOT NULL DEFAULT false,
  done_at TIMESTAMPTZ,
  timer_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE agenda_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles can manage agenda tasks"
  ON agenda_tasks FOR ALL
  USING (
    auth.uid() IN (
      SELECT p.user_id FROM profiles p
      JOIN children c ON c.profile_id = p.id
      JOIN visual_agendas va ON va.child_id = c.id
      WHERE va.id = agenda_tasks.agenda_id
    )
  );

-- Historial de rutinas completadas
CREATE TABLE agenda_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_id UUID NOT NULL REFERENCES visual_agendas(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tasks_total INTEGER NOT NULL DEFAULT 0,
  tasks_done INTEGER NOT NULL DEFAULT 0,
  snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(agenda_id, completed_date)
);

ALTER TABLE agenda_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles can view agenda history"
  ON agenda_history FOR ALL
  USING (
    auth.uid() IN (
      SELECT p.user_id FROM profiles p
      JOIN children c ON c.profile_id = p.id
      WHERE c.id = agenda_history.child_id
    )
  );

-- Función: reset diario automático
CREATE OR REPLACE FUNCTION reset_agenda_daily(p_agenda_id UUID)
RETURNS void AS $$
DECLARE
  v_total INTEGER;
  v_done INTEGER;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE done = true)
  INTO v_total, v_done
  FROM agenda_tasks WHERE agenda_id = p_agenda_id;

  -- Guardar snapshot en historial si hubo actividad
  IF v_done > 0 THEN
    INSERT INTO agenda_history (agenda_id, child_id, tasks_total, tasks_done, snapshot)
    SELECT
      p_agenda_id,
      va.child_id,
      v_total,
      v_done,
      json_agg(json_build_object(
        'id', at.id, 'label', at.label, 'done', at.done,
        'category', at.category, 'timer_seconds', at.timer_seconds
      ))
    FROM visual_agendas va
    JOIN agenda_tasks at ON at.agenda_id = va.id
    WHERE va.id = p_agenda_id
    GROUP BY va.child_id
    ON CONFLICT (agenda_id, completed_date) DO NOTHING;
  END IF;

  -- Reset tareas
  UPDATE agenda_tasks
  SET done = false, done_at = NULL, timer_seconds = 0
  WHERE agenda_id = p_agenda_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Índices
CREATE INDEX idx_agenda_tasks_agenda_id ON agenda_tasks(agenda_id);
CREATE INDEX idx_agenda_tasks_order ON agenda_tasks(agenda_id, order_index);
CREATE INDEX idx_visual_agendas_child ON visual_agendas(child_id);
CREATE INDEX idx_agenda_history_child ON agenda_history(child_id, completed_date DESC);
