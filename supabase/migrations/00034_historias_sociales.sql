-- ============================================================
-- 00034: Social Stories tables (historias_sociales)
-- ============================================================

CREATE TABLE IF NOT EXISTS social_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📖',
  category TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'from-blue-100 to-cyan-50',
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT false,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS story_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES social_stories(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  text TEXT NOT NULL,
  keyword TEXT NOT NULL DEFAULT '',
  emoji TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS story_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES social_stories(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  current_page INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(story_id, child_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_story_pages_story ON story_pages(story_id, page_number);
CREATE INDEX IF NOT EXISTS idx_story_progress_child ON story_progress(child_id);
CREATE INDEX IF NOT EXISTS idx_story_progress_story_child ON story_progress(story_id, child_id);
CREATE INDEX IF NOT EXISTS idx_social_stories_public ON social_stories(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_social_stories_child ON social_stories(child_id) WHERE child_id IS NOT NULL;

-- RLS
ALTER TABLE social_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_progress ENABLE ROW LEVEL SECURITY;

-- Public stories: readable by all authenticated users
CREATE POLICY "Anyone can read public stories"
  ON social_stories FOR SELECT
  USING (is_public = true);

-- Custom stories: only the owning child's profile can read
CREATE POLICY "Users can read own custom stories"
  ON social_stories FOR SELECT
  USING (
    child_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM children
      WHERE children.id = social_stories.child_id
      AND auth.uid() IN (
        SELECT user_id FROM profiles WHERE id = children.profile_id
      )
    )
  );

CREATE POLICY "Users can insert custom stories"
  ON social_stories FOR INSERT
  WITH CHECK (
    child_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM children
      WHERE children.id = social_stories.child_id
      AND auth.uid() IN (
        SELECT user_id FROM profiles WHERE id = children.profile_id
      )
    )
  );

CREATE POLICY "Users can update own custom stories"
  ON social_stories FOR UPDATE
  USING (
    child_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM children
      WHERE children.id = social_stories.child_id
      AND auth.uid() IN (
        SELECT user_id FROM profiles WHERE id = children.profile_id
      )
    )
  );

CREATE POLICY "Users can delete own custom stories"
  ON social_stories FOR DELETE
  USING (
    child_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM children
      WHERE children.id = social_stories.child_id
      AND auth.uid() IN (
        SELECT user_id FROM profiles WHERE id = children.profile_id
      )
    )
  );

-- Story pages follow the parent story's visibility
CREATE POLICY "Anyone can read pages of public stories"
  ON story_pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM social_stories
      WHERE social_stories.id = story_pages.story_id
      AND social_stories.is_public = true
    )
  );

CREATE POLICY "Users can read pages of own stories"
  ON story_pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM social_stories
      WHERE social_stories.id = story_pages.story_id
      AND social_stories.child_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM children
        WHERE children.id = social_stories.child_id
        AND auth.uid() IN (
          SELECT user_id FROM profiles WHERE id = children.profile_id
        )
      )
    )
  );

CREATE POLICY "Users can insert pages to own stories"
  ON story_pages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM social_stories
      WHERE social_stories.id = story_pages.story_id
      AND social_stories.child_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM children
        WHERE children.id = social_stories.child_id
        AND auth.uid() IN (
          SELECT user_id FROM profiles WHERE id = children.profile_id
        )
      )
    )
  );

CREATE POLICY "Users can update pages of own stories"
  ON story_pages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM social_stories
      WHERE social_stories.id = story_pages.story_id
      AND social_stories.child_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM children
        WHERE children.id = social_stories.child_id
        AND auth.uid() IN (
          SELECT user_id FROM profiles WHERE id = children.profile_id
        )
      )
    )
  );

CREATE POLICY "Users can delete pages of own stories"
  ON story_pages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM social_stories
      WHERE social_stories.id = story_pages.story_id
      AND social_stories.child_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM children
        WHERE children.id = social_stories.child_id
        AND auth.uid() IN (
          SELECT user_id FROM profiles WHERE id = children.profile_id
        )
      )
    )
  );

-- Progress: only the child's own progress
CREATE POLICY "Users can read own progress"
  ON story_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = story_progress.child_id
      AND auth.uid() IN (
        SELECT user_id FROM profiles WHERE id = children.profile_id
      )
    )
  );

CREATE POLICY "Users can insert own progress"
  ON story_progress FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = story_progress.child_id
      AND auth.uid() IN (
        SELECT user_id FROM profiles WHERE id = children.profile_id
      )
    )
  );

CREATE POLICY "Users can update own progress"
  ON story_progress FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = story_progress.child_id
      AND auth.uid() IN (
        SELECT user_id FROM profiles WHERE id = children.profile_id
      )
    )
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_social_stories_updated_at ON social_stories;
CREATE TRIGGER set_social_stories_updated_at
  BEFORE UPDATE ON social_stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_story_progress_updated_at ON story_progress;
CREATE TRIGGER set_story_progress_updated_at
  BEFORE UPDATE ON story_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Seed data: 12 built-in social stories
-- ============================================================

INSERT INTO social_stories (id, slug, title, emoji, category, color, description, sort_order, is_public) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'doctor',     'Ir al médico',             '🩺', 'medical',   'from-blue-100 to-cyan-50',     'Prepara al niño para una visita médica',    1,  true),
  ('a0000000-0000-0000-0000-000000000002', 'dentist',    'Ir al dentista',           '🦷', 'medical',   'from-teal-100 to-emerald-50',  'Ayuda al niño en la consulta del dentista', 2,  true),
  ('a0000000-0000-0000-0000-000000000003', 'first-day-school', 'Primer día de clases', '🎒', 'school',    'from-yellow-100 to-amber-50',  'Cómo es el primer día en la escuela',       3,  true),
  ('a0000000-0000-0000-0000-000000000004', 'bedtime',    'Hora de dormir',           '🌙', 'daily',     'from-indigo-100 to-purple-50', 'Rutina para ir a dormir',                   4,  true),
  ('a0000000-0000-0000-0000-000000000005', 'sharing',    'Compartir juguetes',       '🧸', 'social',    'from-pink-100 to-rose-50',     'Aprende a compartir con amigos',            5,  true),
  ('a0000000-0000-0000-0000-000000000006', 'waiting',    'Esperar mi turno',         '⏳', 'social',    'from-orange-100 to-amber-50',  'Cómo esperar pacientemente',                6,  true),
  ('a0000000-0000-0000-0000-000000000007', 'shopping',   'Ir de compras',            '🛒', 'community', 'from-green-100 to-teal-50',    'Qué hacer al ir de compras',                7,  true),
  ('a0000000-0000-0000-0000-000000000008', 'car-travel', 'Viajar en coche',          '🚗', 'daily',     'from-sky-100 to-blue-50',      'Prepararse para un viaje en coche',         8,  true),
  ('a0000000-0000-0000-0000-000000000009', 'frustration','Manejar la frustración',   '🌋', 'emotions',  'from-red-100 to-orange-50',    'Cómo manejar la frustración',               9,  true),
  ('a0000000-0000-0000-0000-00000000000a', 'new-people', 'Conocer gente nueva',      '👋', 'social',    'from-purple-100 to-pink-50',   'Cómo conocer personas nuevas',              10, true),
  ('a0000000-0000-0000-0000-00000000000b', 'mealtime',   'La hora de comer',         '🍽️', 'daily',     'from-amber-100 to-yellow-50',  'Rutina para la hora de comer',              11, true),
  ('a0000000-0000-0000-0000-00000000000c', 'potty',      'Ir al baño',               '🚽', 'daily',     'from-cyan-100 to-blue-50',     'Cómo ir al baño solo',                      12, true);

-- Pages for each story
INSERT INTO story_pages (story_id, page_number, text, keyword, emoji) VALUES
  -- doctor (6 pages)
  ('a0000000-0000-0000-0000-000000000001', 1, 'A veces me duele algo o necesito un chequeo.',       'medico',     '🏥'),
  ('a0000000-0000-0000-0000-000000000001', 2, 'Voy a la consulta con mamá o papá.',                 'consulta',   '🚶'),
  ('a0000000-0000-0000-0000-000000000001', 3, 'La doctora me saluda y me pregunta cómo estoy.',     'doctor',     '👋'),
  ('a0000000-0000-0000-0000-000000000001', 4, 'Puede revisar mis oídos, mi boca y mi corazón.',     'revision',   '🩺'),
  ('a0000000-0000-0000-0000-000000000001', 5, 'Si necesito una vacuna, duele solo un poquito.',     'inyeccion',  '💉'),
  ('a0000000-0000-0000-0000-000000000001', 6, 'Al terminar, puedo elegir una actividad favorita.',  'casa',       '🎉'),

  -- dentist (5 pages)
  ('a0000000-0000-0000-0000-000000000002', 1, 'Ir al dentista ayuda a mantener mis dientes sanos.', 'dentista',   '🦷'),
  ('a0000000-0000-0000-0000-000000000002', 2, 'Me siento en una silla especial que se mueve.',      'sentarse',   '💺'),
  ('a0000000-0000-0000-0000-000000000002', 3, 'El dentista mira mis dientes con un espejito.',      'boca',       '🔦'),
  ('a0000000-0000-0000-0000-000000000002', 4, 'A veces usan un cepillo que hace ruido, pero no duele.', 'cepillarse', '🪥'),
  ('a0000000-0000-0000-0000-000000000002', 5, 'Si puedo quedarme quieto, todo termina más rápido.', 'tranquilo',  '🧘'),

  -- first-day-school (6 pages)
  ('a0000000-0000-0000-0000-000000000003', 1, 'Hoy es mi primer día en la escuela.',                'escuela',    '🏫'),
  ('a0000000-0000-0000-0000-000000000003', 2, 'Mamá o papá me llevan y me dicen que volverán.',     'familia',    '👨‍👩‍👦'),
  ('a0000000-0000-0000-0000-000000000003', 3, 'Mi maestra me recibe con una sonrisa.',              'maestro',    '👩‍🏫'),
  ('a0000000-0000-0000-0000-000000000003', 4, 'Hay otros niños en mi salón, todos están conociéndose.', 'amigos',  '👋'),
  ('a0000000-0000-0000-0000-000000000003', 5, 'Vamos a jugar, cantar y aprender cosas nuevas.',      'jugar',      '🧩'),
  ('a0000000-0000-0000-0000-000000000003', 6, 'Cuando termine el día, mamá o papá me recogen.',     'casa',       '🤗'),

  -- bedtime (5 pages)
  ('a0000000-0000-0000-0000-000000000004', 1, 'Cuando se hace de noche, es hora de prepararme para dormir.', 'noche',    '🌆'),
  ('a0000000-0000-0000-0000-000000000004', 2, 'Me pongo el pijama y lavo mis dientes.',              'pijama',     '🪥'),
  ('a0000000-0000-0000-0000-000000000004', 3, 'Mamá o papá me leen un cuento en la cama.',           'leer',       '📖'),
  ('a0000000-0000-0000-0000-000000000004', 4, 'Damos las buenas noches y apagamos la luz.',           'dormir',     '🌙'),
  ('a0000000-0000-0000-0000-000000000004', 5, 'Cierro los ojos y respiro hondo para descansar.',      'cama',       '😴'),

  -- sharing (5 pages)
  ('a0000000-0000-0000-0000-000000000005', 1, 'Cuando un amigo viene a casa, podemos jugar juntos.',  'amigos',     '🧸'),
  ('a0000000-0000-0000-0000-000000000005', 2, 'A veces tengo que compartir mis juguetes favoritos.',  'compartir',  '🤝'),
  ('a0000000-0000-0000-0000-000000000005', 3, 'Compartir no significa perderlo, solo prestarlo un rato.', 'turno',   '⏳'),
  ('a0000000-0000-0000-0000-000000000005', 4, 'Después de jugar, mi amigo me devuelve el juguete.',   'guardar',    '🔄'),
  ('a0000000-0000-0000-0000-000000000005', 5, 'Compartir hace que jugar juntos sea más divertido.',   'jugar',      '🎉'),

  -- waiting (5 pages)
  ('a0000000-0000-0000-0000-000000000006', 1, 'A veces hay que esperar para hacer algo divertido.',   'esperar',    '⏳'),
  ('a0000000-0000-0000-0000-000000000006', 2, 'Cuando otros hablan, espero a que terminen.',           'escuchar',   '👂'),
  ('a0000000-0000-0000-0000-000000000006', 3, 'Si quiero algo, puedo decir "¿Puedo hacerlo después?"', 'hablar',    '🗣️'),
  ('a0000000-0000-0000-0000-000000000006', 4, 'Mientras espero, puedo contar o respirar profundo.',    'tranquilo',  '🧘'),
  ('a0000000-0000-0000-0000-000000000006', 5, 'Cuando llega mi turno, lo disfruto mucho más.',         'feliz',      '🌟'),

  -- shopping (5 pages)
  ('a0000000-0000-0000-0000-000000000007', 1, 'A veces vamos al supermercado o a la tienda.',          'tienda',     '🏪'),
  ('a0000000-0000-0000-0000-000000000007', 2, 'Hay mucha gente y muchas cosas para ver.',               'gente',      '👥'),
  ('a0000000-0000-0000-0000-000000000007', 3, 'Puedo ayudar a buscar lo que necesitamos.',             'buscar',     '🔍'),
  ('a0000000-0000-0000-0000-000000000007', 4, 'Espero en la fila con mamá o papá hasta pagar.',        'esperar',    '🛒'),
  ('a0000000-0000-0000-0000-000000000007', 5, 'Cuando terminamos, volvemos a casa.',                   'casa',       '✅'),

  -- car-travel (6 pages)
  ('a0000000-0000-0000-0000-000000000008', 1, 'A veces viajamos en coche a lugares nuevos.',           'coche',      '🚗'),
  ('a0000000-0000-0000-0000-000000000008', 2, 'Me siento en mi silla y me pongo el cinturón.',         'sentarse',   '🔒'),
  ('a0000000-0000-0000-0000-000000000008', 3, 'El viaje puede ser corto o un poco largo.',             'viaje',      '🛣️'),
  ('a0000000-0000-0000-0000-000000000008', 4, 'Puedo mirar por la ventana o escuchar música.',         'ventana',    '🌳'),
  ('a0000000-0000-0000-0000-000000000008', 5, 'Respirar hondo me ayuda si me siento inquieto.',        'tranquilo',  '🧘'),
  ('a0000000-0000-0000-0000-000000000008', 6, 'Cuando llegamos, puedo estirar las piernas.',           'llegada',    '🎉'),

  -- frustration (5 pages)
  ('a0000000-0000-0000-0000-000000000009', 1, 'A veces las cosas no salen como yo quiero.',            'triste',     '😟'),
  ('a0000000-0000-0000-0000-000000000009', 2, 'Me siento frustrado y eso es normal.',                  'enfadado',   '😤'),
  ('a0000000-0000-0000-0000-000000000009', 3, 'Puedo respirar profundo tres veces para calmarme.',      'respirar',   '🫁'),
  ('a0000000-0000-0000-0000-000000000009', 4, 'Puedo pedir ayuda a un adulto si la necesito.',         'ayuda',      '🤝'),
  ('a0000000-0000-0000-0000-000000000009', 5, 'Después de calmarme, puedo intentarlo de nuevo.',       'feliz',      '💪'),

  -- new-people (5 pages)
  ('a0000000-0000-0000-0000-00000000000a', 1, 'A veces conozco personas que no he visto antes.',       'gente',      '👋'),
  ('a0000000-0000-0000-0000-00000000000a', 2, 'Puedo saludar con un hola o mover la mano.',            'saludar',    '🖐️'),
  ('a0000000-0000-0000-0000-00000000000a', 3, 'No tengo que hablar mucho si no quiero.',               'hablar',     '🤐'),
  ('a0000000-0000-0000-0000-00000000000a', 4, 'Puedo quedarme cerca de mamá o papá mientras me siento cómodo.', 'familia', '👨‍👩‍👦'),
  ('a0000000-0000-0000-0000-00000000000a', 5, 'Con el tiempo, conocer gente nueva es más fácil.',      'amigos',     '🌟'),

  -- mealtime (5 pages)
  ('a0000000-0000-0000-0000-00000000000b', 1, 'Es hora de comer y toda la familia se sienta junta.',   'comer',      '🍽️'),
  ('a0000000-0000-0000-0000-00000000000b', 2, 'Hay diferentes alimentos en la mesa.',                   'fruta',      '🥗'),
  ('a0000000-0000-0000-0000-00000000000b', 3, 'Puedo probar un poco de cada cosa.',                     'comida',     '👅'),
  ('a0000000-0000-0000-0000-00000000000b', 4, 'Si algo no me gusta, está bien dejarlo en el plato.',   'no',         '👍'),
  ('a0000000-0000-0000-0000-00000000000b', 5, 'Cuando termino, ayudo a recoger mi plato.',             'recoger',    '✅'),

  -- potty (5 pages)
  ('a0000000-0000-0000-0000-00000000000c', 1, 'Cuando siento que necesito ir al baño, aviso a un adulto.', 'bano',   '🚽'),
  ('a0000000-0000-0000-0000-00000000000c', 2, 'Voy al baño y me siento en la taza.',                    'sentarse',   '🚽'),
  ('a0000000-0000-0000-0000-00000000000c', 3, 'Hago lo que necesito y luego me limpio.',                'agua',       '🧻'),
  ('a0000000-0000-0000-0000-00000000000c', 4, 'Me lavo las manos con agua y jabón.',                    'lavarse',    '🧼'),
  ('a0000000-0000-0000-0000-00000000000c', 5, '¡Lo logré! Cada vez es más fácil.',                      'feliz',      '🌟');
