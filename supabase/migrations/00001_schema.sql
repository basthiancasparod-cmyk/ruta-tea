-- ============================================================
-- Dino Aprende - Esquema completo de base de datos
-- ============================================================

-- 1. PROFILES (extiende auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('parent', 'professional')),
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- 2. CHILDREN (hijos asociados a un perfil)
CREATE TABLE children (
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

CREATE POLICY "Profiles can manage own children"
  ON children FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id = children.profile_id
    )
  );

-- 3. LESSONS (catálogo de lecciones)
CREATE TABLE lessons (
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

CREATE POLICY "Anyone can view lessons"
  ON lessons FOR SELECT
  USING (true);

-- 4. CHILD_PROGRESS (progreso por niño por lección)
CREATE TABLE child_progress (
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

CREATE POLICY "Profiles can manage child progress"
  ON child_progress FOR ALL
  USING (
    auth.uid() IN (
      SELECT p.user_id FROM profiles p
      JOIN children c ON c.profile_id = p.id
      WHERE c.id = child_progress.child_id
    )
  );

-- 5. FAMILY_RESOURCES (Rincón Familiar)
CREATE TABLE family_resources (
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

CREATE POLICY "Anyone can view family resources"
  ON family_resources FOR SELECT
  USING (true);

-- 6. STREAKS (rachas)
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL UNIQUE REFERENCES children(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles can manage streaks"
  ON streaks FOR ALL
  USING (
    auth.uid() IN (
      SELECT p.user_id FROM profiles p
      JOIN children c ON c.profile_id = p.id
      WHERE c.id = streaks.child_id
    )
  );

-- ============================================================
-- SEED DATA: Lecciones para 3-5 años / Nivel 1
-- ============================================================

INSERT INTO lessons (title, description, age_range, tea_level, therapy_type, order_index, xp_reward, content) VALUES
(
  'Atención conjunta',
  'Sigue con la mirada el objeto que Lumi te muestra.',
  '3-5', 1, 'esdm', 1, 50,
  '{"instructions": "Mira el objeto que aparece en pantalla y síguelo con la mirada.", "type": "attention", "data": {}}'
),
(
  'Imitación gestual',
  'Copia los gestos que hace Lumi con las manos.',
  '3-5', 1, 'aba', 2, 50,
  '{"instructions": "Observa el gesto y repítelo.", "type": "imitation", "data": {}}'
),
(
  'Vocabulario con pictos',
  'Relaciona el pictograma con la palabra correcta.',
  '3-5', 1, 'speech', 3, 50,
  '{"instructions": "Toca el pictograma que corresponde a la palabra.", "type": "pictogram_match", "data": {}}'
),
(
  'Señalar y pedir',
  'Aprende a señalar lo que quieres para pedirlo.',
  '3-5', 1, 'aba', 4, 60,
  '{"instructions": "Cuando quieras algo, señálalo con el dedo.", "type": "imitation", "data": {}}'
),
(
  'Emociones básicas',
  'Identifica las emociones: alegría, tristeza, enojo y miedo.',
  '3-5', 1, 'play', 5, 60,
  '{"instructions": "Elige la emoción que corresponde a la situación.", "type": "emotion_select", "data": {}}'
),
(
  'Rutina: levantarse',
  'Sigue los pasos para empezar el día.',
  '3-5', 1, 'teacch', 6, 70,
  '{"instructions": "Ordena los pictogramas de la rutina de la mañana.", "type": "sequence", "data": {}}'
),
(
  'Rutina: comer',
  'Aprende los pasos para la hora de la comida.',
  '3-5', 1, 'teacch', 7, 70,
  '{"instructions": "Ordena los pictogramas de la rutina de comer.", "type": "sequence", "data": {}}'
),
(
  'Juego simbólico',
  'Usa objetos imaginarios para jugar.',
  '3-5', 1, 'play', 8, 80,
  '{"instructions": "Juega con los objetos como si fueran otra cosa.", "type": "attention", "data": {}}'
),
(
  'Tomar turnos',
  'Espera tu turno para hablar o jugar.',
  '3-5', 1, 'social', 9, 80,
  '{"instructions": "Toca cuando sea tu turno y espera cuando sea el turno de Lumi.", "type": "imitation", "data": {}}'
),
(
  'Compartir',
  'Comparte tus juguetes con Lumi.',
  '3-5', 1, 'social', 10, 90,
  '{"instructions": "Arrastra el juguete para compartirlo con Lumi.", "type": "attention", "data": {}}'
);

-- ============================================================
-- SEED DATA: Recursos para el Rincón Familiar
-- ============================================================

INSERT INTO family_resources (category, title, content, icon, "order") VALUES
(
  'understanding_tea',
  '¿Qué es el TEA?',
  'El Trastorno del Espectro Autista (TEA) es una condición del neurodesarrollo que afecta la comunicación, la interacción social y el comportamiento. Cada persona en el espectro es única, con sus propias fortalezas y desafíos. El diagnóstico temprano y las intervenciones adecuadas pueden marcar una gran diferencia en el desarrollo del niño.',
  '🧠', 1
),
(
  'understanding_tea',
  'Los 3 niveles de apoyo',
  'El DSM-5 clasifica el TEA en 3 niveles: Nivel 1 (requiere apoyo): dificultades leves, puede comunicarse verbalmente pero tiene desafíos sociales. Nivel 2 (requiere apoyo notable): dificultades más marcadas, necesita terapia intensiva. Nivel 3 (requiere apoyo muy notable): necesita supervisión constante y apoyo en todas las áreas.',
  '📊', 2
),
(
  'understanding_tea',
  'Señales tempranas',
  'Algunas señales tempranas incluyen: poco o ningún contacto visual, no responder al nombre, retraso en el habla, movimientos repetitivos (aletear, mecerse), dificultad para jugar con otros niños, hipersensibilidad a sonidos o texturas, y apego inusual a objetos específicos.',
  '🔍', 3
),
(
  'first_steps',
  'Guía de 100 días',
  'Los primeros 100 días después del diagnóstico son cruciales. Esta guía te ayudará a: 1) Procesar el diagnóstico, 2) Armar el equipo terapéutico, 3) Entender las opciones de tratamiento, 4) Conectar con grupos de apoyo, 5) Organizar las terapias en casa.',
  '📅', 1
),
(
  'first_steps',
  'Armando tu equipo terapéutico',
  'Un equipo multidisciplinario ideal puede incluir: neurólogo pediátrico, psicólogo especializado en TEA, terapeuta ABA, fonoaudiólogo/logopeda, terapeuta ocupacional, psicopedagogo y trabajador social. Cada profesional aporta una perspectiva única.',
  '👥', 2
),
(
  'daily_life',
  'Guía de sueño',
  'Muchos niños con TEA tienen dificultades para dormir. Recomendaciones: establece una rutina consistente (misma hora, mismos pasos), crea un ambiente tranquilo y oscuro, usa apoyos visuales para la rutina de sueño, evita pantallas 1 hora antes de dormir, y considera melatonina solo bajo supervisión médica.',
  '🌙', 1
),
(
  'daily_life',
  'Alimentación selectiva',
  'La selectividad alimentaria es común. Estrategias: ofrece alimentos nuevos junto con conocidos, respeta las texturas que tolera, usa refuerzo positivo para probar nuevos alimentos, come en familia para modelar conductas alimentarias, consulta con un terapeuta ocupacional especializado.',
  '🍎', 2
),
(
  'daily_life',
  'Control de esfínteres',
  'El entrenamiento puede tomar más tiempo. Claves: espera señales de disposición, usa agendas visuales con pictogramas de la rutina del baño, establece horarios regulares, usa refuerzo positivo intensivo, mantén la calma ante accidentes.',
  '🚽', 3
),
(
  'emotional_support',
  'Guía para hermanos',
  'Los hermanos también necesitan apoyo. Dedica tiempo exclusivo para ellos, explica el TEA de forma positiva y adaptada a su edad, valida sus sentimientos (frustración, vergüenza, orgullo), involúcralos en juegos terapéuticos simples, y busca grupos de apoyo para hermanos.',
  '👫', 1
),
(
  'emotional_support',
  'Autocuidado para padres',
  'Cuidar de un niño con TEA puede ser agotador. Recomendaciones: toma descansos regulares (respiro), busca grupos de apoyo de otros padres, establece redes de ayuda familiar, no descuides tu salud física y mental, recuerda que pedir ayuda no es debilidad.',
  '💛', 2
),
(
  'downloads',
  'Agenda visual diaria',
  'Plantilla descargable de agenda visual con pictogramas para estructurar la rutina diaria del niño. Incluye pictogramas de: despertar, bañarse, vestirse, desayunar, cepillarse, jugar, comer, dormir.',
  '📋', 1
),
(
  'downloads',
  'Tarjetas de emociones',
  'Set de 6 tarjetas imprimibles con pictogramas de emociones básicas: alegría, tristeza, enojo, miedo, amor y cansancio. Cada tarjeta incluye el pictograma y la palabra escrita.',
  '🎴', 2
);

-- ============================================================
-- FUNCTIONS (utilidades)
-- ============================================================

-- Función para actualizar streaks diariamente
CREATE OR REPLACE FUNCTION update_streak()
RETURNS TRIGGER AS $$
DECLARE
  today DATE := CURRENT_DATE;
  yesterday DATE := today - 1;
BEGIN
  INSERT INTO streaks (child_id, current_streak, longest_streak, last_activity_date)
  VALUES (
    NEW.child_id,
    1,
    1,
    today
  )
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

-- Trigger para actualizar streak cuando se completa una lección
CREATE TRIGGER on_lesson_completed
  AFTER INSERT OR UPDATE OF completed ON child_progress
  FOR EACH ROW
  WHEN (NEW.completed = true)
  EXECUTE FUNCTION update_streak();
