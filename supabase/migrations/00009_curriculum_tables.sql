-- ============================================================
-- 00009: Create curriculum tables for the learning module
--        (curriculum_areas, curriculum_modules, curriculum_exercises,
--         child_module_progress, child_exercise_progress)
-- ============================================================

-- 1. Curriculum Areas (e.g., "Social", "Cognitive", "Language")
CREATE TABLE IF NOT EXISTS curriculum_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '📚',
  age_range TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Curriculum Modules (e.g., "Ejercicio 1: Mira a Dino")
CREATE TABLE IF NOT EXISTS curriculum_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID NOT NULL REFERENCES curriculum_areas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  therapeutic_goal TEXT NOT NULL DEFAULT '',
  age_range TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  total_exercises INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Curriculum Exercises (individual activities within a module)
CREATE TABLE IF NOT EXISTS curriculum_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES curriculum_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  exercise_type TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  order_index INTEGER NOT NULL DEFAULT 0,
  xp_reward INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Child Module Progress (tracks a child's progress through a module)
CREATE TABLE IF NOT EXISTS child_module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES curriculum_modules(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  stars INTEGER NOT NULL DEFAULT 0,
  total_xp_earned INTEGER NOT NULL DEFAULT 0,
  exercises_completed INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(child_id, module_id)
);

-- 5. Child Exercise Progress (tracks individual exercise completion)
CREATE TABLE IF NOT EXISTS child_exercise_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES curriculum_exercises(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  attempts INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  stars INTEGER NOT NULL DEFAULT 0,
  last_played_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(child_id, exercise_id)
);

-- 6. RLS: Enable RLS on all tables
ALTER TABLE curriculum_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_exercise_progress ENABLE ROW LEVEL SECURITY;

-- 7. RLS: Curriculum content is public (any authenticated user can read)
CREATE POLICY "Anyone can view curriculum areas"
  ON curriculum_areas FOR SELECT USING (true);

CREATE POLICY "Anyone can view curriculum modules"
  ON curriculum_modules FOR SELECT USING (true);

CREATE POLICY "Anyone can view curriculum exercises"
  ON curriculum_exercises FOR SELECT USING (true);

-- 8. RLS: Child progress is scoped to the authenticated profile's children
CREATE POLICY "Profiles can manage child module progress"
  ON child_module_progress FOR ALL
  USING (
    child_id IN (
      SELECT c.id FROM children c
        JOIN profiles p ON p.id = c.profile_id
        JOIN auth.users u ON u.id = p.user_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Profiles can manage child exercise progress"
  ON child_exercise_progress FOR ALL
  USING (
    child_id IN (
      SELECT c.id FROM children c
        JOIN profiles p ON p.id = c.profile_id
        JOIN auth.users u ON u.id = p.user_id
      WHERE u.id = auth.uid()
    )
  );

-- 9. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_curriculum_modules_area_id ON curriculum_modules(area_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_exercises_module_id ON curriculum_exercises(module_id);
CREATE INDEX IF NOT EXISTS idx_child_module_progress_child ON child_module_progress(child_id);
CREATE INDEX IF NOT EXISTS idx_child_exercise_progress_child ON child_exercise_progress(child_id);
