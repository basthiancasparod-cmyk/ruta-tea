-- ============================================================
-- Dino Aprende - Script de migración completo
-- Copia y pega TODO este contenido en el SQL Editor de Supabase
-- (https://supabase.com/dashboard/project/yocmtfrrjfqwiptlebrk/sql/new)
-- ============================================================

-- 1. TABLA: profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('parent', 'professional')),
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- 2. TABLA: children
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  age_range TEXT NOT NULL CHECK (age_range IN ('0-2', '3-5', '6-10', '11-14')),
  tea_level INTEGER NOT NULL CHECK (tea_level BETWEEN 1 AND 3),
  interests TEXT[] DEFAULT '{}',
  sensory_sensitivities TEXT[] DEFAULT '{}',
  avatar_pictogram TEXT DEFAULT '🧒',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE children ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles can manage own children" ON children;
CREATE POLICY "Profiles can manage own children"
  ON children FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id = children.profile_id
    )
  );

-- 3. TABLA: lessons
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  age_range TEXT NOT NULL CHECK (age_range IN ('0-2', '3-5', '6-10', '11-14')),
  tea_level INTEGER NOT NULL CHECK (tea_level BETWEEN 1 AND 3),
  therapy_type TEXT NOT NULL CHECK (therapy_type IN (
    'aba', 'teacch', 'esdm', 'speech', 'occupational',
    'social', 'cognitive', 'play', 'sensory', 'pecs'
  )),
  order_index INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view lessons" ON lessons;
CREATE POLICY "Anyone can view lessons"
  ON lessons FOR SELECT USING (true);

-- 4. TABLA: child_progress
CREATE TABLE IF NOT EXISTS child_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0,
  stars INTEGER NOT NULL DEFAULT 0 CHECK (stars BETWEEN 0 AND 3),
  last_played_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(child_id, lesson_id)
);

ALTER TABLE child_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles can manage child progress" ON child_progress;
CREATE POLICY "Profiles can manage child progress"
  ON child_progress FOR ALL
  USING (
    auth.uid() IN (
      SELECT p.user_id FROM profiles p
      JOIN children c ON c.profile_id = p.id
      WHERE c.id = child_progress.child_id
    )
  );

-- 5. TABLA: family_resources
CREATE TABLE IF NOT EXISTS family_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN (
    'understanding_tea', 'daily_life', 'emotional_support',
    'first_steps', 'downloads'
  )),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📄',
  downloadable_url TEXT DEFAULT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE family_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view family resources" ON family_resources;
CREATE POLICY "Anyone can view family resources"
  ON family_resources FOR SELECT USING (true);

-- 6. TABLA: streaks
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL UNIQUE REFERENCES children(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles can manage streaks" ON streaks;
CREATE POLICY "Profiles can manage streaks"
  ON streaks FOR ALL
  USING (
    auth.uid() IN (
      SELECT p.user_id FROM profiles p
      JOIN children c ON c.profile_id = p.id
      WHERE c.id = streaks.child_id
    )
  );

-- 7. FUNCIÓN: actualizar streaks
CREATE OR REPLACE FUNCTION update_streak()
RETURNS TRIGGER AS $$
DECLARE
  today DATE := CURRENT_DATE;
  yesterday DATE := today - 1;
BEGIN
  INSERT INTO streaks (child_id, current_streak, longest_streak, last_activity_date)
  VALUES (NEW.child_id, 1, 1, today)
  ON CONFLICT (child_id) DO UPDATE SET
    current_streak = CASE
      WHEN streaks.last_activity_date = yesterday THEN streaks.current_streak + 1
      WHEN streaks.last_activity_date = today THEN streaks.current_streak
      ELSE 1
    END,
    longest_streak = CASE
      WHEN streaks.last_activity_date = yesterday THEN GREATEST(streaks.longest_streak, streaks.current_streak + 1)
      WHEN streaks.last_activity_date = today THEN streaks.longest_streak
      ELSE GREATEST(streaks.longest_streak, 1)
    END,
    last_activity_date = today,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para streaks
DROP TRIGGER IF EXISTS on_lesson_completed ON child_progress;
CREATE TRIGGER on_lesson_completed
  AFTER INSERT OR UPDATE OF completed ON child_progress
  FOR EACH ROW
  WHEN (NEW.completed = true)
  EXECUTE FUNCTION update_streak();

-- 8. SEED: Lecciones (3-5 años, Nivel 1)
INSERT INTO lessons (title, description, age_range, tea_level, therapy_type, order_index, xp_reward, content)
SELECT * FROM (VALUES
  ('Atención conjunta', 'Sigue con la mirada el objeto que Lumi te muestra.', '3-5', 1, 'esdm', 1, 50, '{"instructions": "Mira el objeto que aparece en pantalla y síguelo con la mirada.", "type": "attention", "data": {}}'::jsonb),
  ('Imitación gestual', 'Copia los gestos que hace Lumi con las manos.', '3-5', 1, 'aba', 2, 50, '{"instructions": "Observa el gesto y repítelo.", "type": "imitation", "data": {}}'::jsonb),
  ('Vocabulario con pictos', 'Relaciona el pictograma con la palabra correcta.', '3-5', 1, 'speech', 3, 50, '{"instructions": "Toca el pictograma que corresponde a la palabra.", "type": "pictogram_match", "data": {}}'::jsonb),
  ('Señalar y pedir', 'Aprende a señalar lo que quieres para pedirlo.', '3-5', 1, 'aba', 4, 60, '{"instructions": "Cuando quieras algo, señalalo con el dedo.", "type": "imitation", "data": {}}'::jsonb),
  ('Emociones básicas', 'Identifica las emociones: alegría, tristeza, enojo y miedo.', '3-5', 1, 'play', 5, 60, '{"instructions": "Elige la emoción que corresponde a la situación.", "type": "emotion_select", "data": {}}'::jsonb),
  ('Rutina: levantarse', 'Sigue los pasos para empezar el día.', '3-5', 1, 'teacch', 6, 70, '{"instructions": "Ordena los pictogramas de la rutina de la mañana.", "type": "sequence", "data": {}}'::jsonb),
  ('Rutina: comer', 'Aprende los pasos para la hora de la comida.', '3-5', 1, 'teacch', 7, 70, '{"instructions": "Ordena los pictogramas de la rutina de comer.", "type": "sequence", "data": {}}'::jsonb),
  ('Juego simbólico', 'Usa objetos imaginarios para jugar.', '3-5', 1, 'play', 8, 80, '{"instructions": "Juega con los objetos como si fueran otra cosa.", "type": "attention", "data": {}}'::jsonb),
  ('Tomar turnos', 'Espera tu turno para hablar o jugar.', '3-5', 1, 'social', 9, 80, '{"instructions": "Toca cuando sea tu turno y espera cuando sea el turno de Lumi.", "type": "imitation", "data": {}}'::jsonb),
  ('Compartir', 'Comparte tus juguetes con Lumi.', '3-5', 1, 'social', 10, 90, '{"instructions": "Arrastra el juguete para compartirlo con Lumi.", "type": "attention", "data": {}}'::jsonb)
) AS v
WHERE NOT EXISTS (SELECT 1 FROM lessons LIMIT 1);

-- 9. SEED: Recursos Rincón Familiar
INSERT INTO family_resources (category, title, content, icon, "order")
SELECT * FROM (VALUES
  ('understanding_tea', '¿Qué es el TEA?', 'El Trastorno del Espectro Autista (TEA) es una condición del neurodesarrollo que afecta la comunicación, la interacción social y el comportamiento. Cada persona en el espectro es única, con sus propias fortalezas y desafíos.', '🧠', 1),
  ('understanding_tea', 'Los 3 niveles de apoyo', 'El DSM-5 clasifica el TEA en 3 niveles según el apoyo necesario: Nivel 1 (requiere apoyo), Nivel 2 (requiere apoyo notable), Nivel 3 (requiere apoyo muy notable).', '📊', 2),
  ('understanding_tea', 'Señales tempranas', 'Señales tempranas incluyen: poco contacto visual, no responder al nombre, retraso en el habla, movimientos repetitivos, dificultad para jugar con otros niños.', '🔍', 3),
  ('first_steps', 'Guía de 100 días', 'Los primeros 100 días después del diagnóstico son cruciales. Organiza el equipo terapéutico, entiende opciones de tratamiento y conecta con grupos de apoyo.', '📅', 1),
  ('first_steps', 'Armando tu equipo terapéutico', 'Un equipo multidisciplinario ideal incluye: neurólogo, psicólogo, terapeuta ABA, fonoaudiólogo, terapeuta ocupacional y psicopedagogo.', '👥', 2),
  ('daily_life', 'Guía de sueño', 'Muchos niños con TEA tienen dificultades para dormir: establece una rutina consistente, ambiente tranquilo, usa apoyos visuales y evita pantallas antes de dormir.', '🌙', 1),
  ('daily_life', 'Alimentación selectiva', 'Ofrece alimentos nuevos junto con conocidos, respeta texturas toleradas, usa refuerzo positivo, y consulta con un terapeuta ocupacional.', '🍎', 2),
  ('daily_life', 'Control de esfínteres', 'Usa agendas visuales, establece horarios regulares, refuerzo positivo intensivo, y mantén la calma ante accidentes.', '🚽', 3),
  ('emotional_support', 'Guía para hermanos', 'Dedica tiempo exclusivo, explica el TEA de forma positiva, valida sus sentimientos e involúcralos en actividades.', '👫', 1),
  ('emotional_support', 'Autocuidado para padres', 'Toma descansos regulares, busca grupos de apoyo, no descuides tu salud. Pedir ayuda no es debilidad.', '💛', 2),
  ('downloads', 'Agenda visual diaria', 'Plantilla descargable de agenda visual con pictogramas para estructurar la rutina diaria.', '📋', 1),
  ('downloads', 'Tarjetas de emociones', 'Set de tarjetas imprimibles con pictogramas de emociones básicas: alegría, tristeza, enojo, miedo, amor y cansancio.', '🎴', 2)
) AS v
WHERE NOT EXISTS (SELECT 1 FROM family_resources LIMIT 1);
