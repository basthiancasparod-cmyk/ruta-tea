-- ============================================================
-- Dino Aprende - Módulo Comunidad (foro, eventos, grupos de apoyo)
-- ============================================================

-- 7. FORUM_CATEGORIES
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '💬',
  post_count INTEGER NOT NULL DEFAULT 0,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view forum categories" ON forum_categories;
CREATE POLICY "Anyone can view forum categories"
  ON forum_categories FOR SELECT USING (true);

-- 8. FORUM_POSTS
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  reply_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view forum posts" ON forum_posts;
CREATE POLICY "Anyone can view forum posts"
  ON forum_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Profiles can create posts" ON forum_posts;
CREATE POLICY "Profiles can create posts"
  ON forum_posts FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = forum_posts.author_id
  ));

-- 9. FORUM_REPLIES
CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view replies" ON forum_replies;
CREATE POLICY "Anyone can view replies"
  ON forum_replies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Profiles can create replies" ON forum_replies;
CREATE POLICY "Profiles can create replies"
  ON forum_replies FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = forum_replies.author_id
  ));

-- 10. COMMUNITY_EVENTS
CREATE TABLE IF NOT EXISTS community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  event_date DATE NOT NULL,
  event_time TEXT DEFAULT '',
  location TEXT DEFAULT '',
  is_online BOOLEAN NOT NULL DEFAULT false,
  link TEXT DEFAULT '',
  organizer TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view events" ON community_events;
CREATE POLICY "Anyone can view events"
  ON community_events FOR SELECT USING (true);

-- 11. SUPPORT_GROUPS
CREATE TABLE IF NOT EXISTS support_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  schedule TEXT DEFAULT '',
  location TEXT DEFAULT '',
  contact TEXT DEFAULT '',
  focus TEXT NOT NULL DEFAULT 'general',
  icon TEXT NOT NULL DEFAULT '👥',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE support_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view support groups" ON support_groups;
CREATE POLICY "Anyone can view support groups"
  ON support_groups FOR SELECT USING (true);

-- ============================================================
-- SEED: Categorías del foro
-- ============================================================
INSERT INTO forum_categories (name, slug, description, icon, "order")
SELECT * FROM (VALUES
  ('Experiencias', 'experiencias', 'Comparte tus vivencias y lecciones aprendidas', '💛', 1),
  ('Terapias', 'terapias', 'Discute terapias, profesionales y enfoques', '🧠', 2),
  ('Recomendaciones', 'recomendaciones', 'Recomienda libros, apps, juguetes y más', '⭐', 3),
  ('Preguntas', 'preguntas', 'Haz preguntas a la comunidad', '❓', 4)
) AS v
WHERE NOT EXISTS (SELECT 1 FROM forum_categories LIMIT 1);

-- ============================================================
-- SEED: Posts de ejemplo
-- ============================================================
DO $$
DECLARE
  cat_exp_id UUID;
  cat_ter_id UUID;
  cat_rec_id UUID;
  cat_preg_id UUID;
  profile_id UUID;
BEGIN
  SELECT id INTO cat_exp_id FROM forum_categories WHERE slug = 'experiencias' LIMIT 1;
  SELECT id INTO cat_ter_id FROM forum_categories WHERE slug = 'terapias' LIMIT 1;
  SELECT id INTO cat_rec_id FROM forum_categories WHERE slug = 'recomendaciones' LIMIT 1;
  SELECT id INTO cat_preg_id FROM forum_categories WHERE slug = 'preguntas' LIMIT 1;
  SELECT id INTO profile_id FROM profiles LIMIT 1;

  IF cat_exp_id IS NOT NULL AND profile_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM forum_posts LIMIT 1) THEN
    INSERT INTO forum_posts (category_id, author_id, title, content, is_pinned) VALUES
    (cat_exp_id, profile_id, '¡Hola! Somos una familia nueva en Dino Aprende',
     'Acabamos de recibir el diagnóstico de nuestro hijo de 4 años. Queremos compartir nuestra experiencia y aprender de otras familias. ¡Gracias por este espacio!',
     true),
    (cat_ter_id, profile_id, '¿ABA o ESDM? Comparando enfoques',
     'Estamos evaluando qué terapia es mejor para nuestro hijo. Hemos leído sobre ABA y ESDM pero nos gustaría escuchar experiencias de otras familias. ¿Cuál ha funcionado mejor para ustedes?',
     false),
    (cat_rec_id, profile_id, 'Mi top 5 de juguetes sensoriales',
     'Después de probar muchos juguetes, estos son los que más le gustan a mi hijo: 1) Pelota con texturas, 2) Blocs sensoriales, 3) Arena cinética, 4) Luz de proyección, 5) Manta con peso. ¿Cuáles recomiendan ustedes?',
     false),
    (cat_preg_id, profile_id, '¿A qué edad empezar logopedia?',
     'Nuestro hijo tiene 2 años y medio y aún no habla. La pediatra recomienda esperar pero nosotros queremos empezar logopedia ya. ¿Algún consejo?',
     false);
  END IF;
END $$;

-- ============================================================
-- SEED: Eventos de ejemplo
-- ============================================================
INSERT INTO community_events (title, description, event_date, event_time, location, is_online, link, organizer)
SELECT * FROM (VALUES
  ('Taller: Introducción a ABA en casa',
   'Aprende técnicas básicas de ABA para implementar en el hogar. Taller práctico para padres.',
   CURRENT_DATE + INTERVAL '14 days', '10:00 - 12:00', 'Online vía Zoom', true, 'https://zoom.us/', 'Asociación TEA'),
  ('Grupo de apoyo para padres',
   'Encuentro mensual para compartir experiencias y apoyarnos mutuamente.',
   CURRENT_DATE + INTERVAL '7 days', '18:00 - 19:30', 'Centro de Desarrollo Infantil, Madrid', false, '', 'Dino Aprende'),
  ('Webinar: Alimentación selectiva',
   'Estrategias para manejar la selectividad alimentaria en niños con TEA.',
   CURRENT_DATE + INTERVAL '21 days', '17:00 - 18:30', 'Online vía Google Meet', true, 'https://meet.google.com/', 'NutriTEA')
) AS v
WHERE NOT EXISTS (SELECT 1 FROM community_events LIMIT 1);

-- ============================================================
-- SEED: Grupos de apoyo
-- ============================================================
INSERT INTO support_groups (name, description, schedule, location, contact, focus, icon)
SELECT * FROM (VALUES
  ('Padres de niños TEA', 'Grupo de apoyo semanal para padres y madres. Compartimos experiencias, recursos y consejos en un espacio seguro.',
   'Sábados 10:00-11:30', 'Online', 'padres@rutatea.com', 'parents', '👩‍👩‍👧'),
  ('Hermanos TEA', 'Espacio dedicado a hermanos de niños con TEA. Para compartir y sentirse comprendidos.',
   'Sábados 16:00-17:00', 'Online', 'hermanos@rutatea.com', 'siblings', '👫'),
  ('Red de madres primerizas', 'Para madres que recibieron el diagnóstico recientemente. Apoyo en los primeros pasos.',
   'Miércoles 18:00-19:00', 'Online', 'madres@rutatea.com', 'new_parents', '💛'),
  ('Grupo de adolescentes', 'Para adolescentes con TEA (12-17 años). Socialización, apoyo y actividades.',
   'Domingos 11:00-12:30', 'Presencial - Sala Joven TEA', 'adolescentes@rutatea.com', 'teens', '🌟')
) AS v
WHERE NOT EXISTS (SELECT 1 FROM support_groups LIMIT 1);
