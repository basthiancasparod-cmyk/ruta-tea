-- ============================================================
-- 00035: More social stories (10 new stories)
-- ============================================================

INSERT INTO social_stories (id, slug, title, emoji, category, color, description, sort_order, is_public) VALUES
  ('a0000000-0000-0000-0000-00000000000d', 'hand-wash',     'Lavarse las manos',     '🧼', 'daily',     'from-sky-100 to-blue-50',       'Cómo lavarse las manos correctamente',        13, true),
  ('a0000000-0000-0000-0000-00000000000e', 'backpack',      'Preparar la mochila',   '🎒', 'school',    'from-yellow-100 to-lime-50',    'Cómo preparar la mochila para la escuela',    14, true),
  ('a0000000-0000-0000-0000-00000000000f', 'haircut',       'Ir a la peluquería',    '✂️', 'daily',     'from-violet-100 to-fuchsia-50', 'Qué hacer cuando voy a la peluquería',        15, true),
  ('a0000000-0000-0000-0000-000000000010', 'park',          'Ir al parque',          '🌳', 'community', 'from-green-100 to-emerald-50',  'Cómo divertirse en el parque',                16, true),
  ('a0000000-0000-0000-0000-000000000011', 'cross-street',  'Cruzar la calle',       '🚦', 'community', 'from-red-100 to-orange-50',     'Pasos para cruzar la calle con seguridad',    17, true),
  ('a0000000-0000-0000-0000-000000000012', 'birthday',      'Fiesta de cumpleaños',  '🎂', 'social',    'from-pink-100 to-rose-50',      'Cómo disfrutar de una fiesta de cumpleaños',  18, true),
  ('a0000000-0000-0000-0000-000000000013', 'beach',         'Ir a la playa',         '🏖️', 'community', 'from-cyan-100 to-sky-50',       'Un día en la playa',                          19, true),
  ('a0000000-0000-0000-0000-000000000014', 'vacation',      'Las vacaciones',        '🧳', 'daily',     'from-amber-100 to-orange-50',   'Cómo prepararse para las vacaciones',         20, true),
  ('a0000000-0000-0000-0000-000000000015', 'house-rules',   'Normas de casa',        '🏠', 'social',    'from-indigo-100 to-purple-50',  'Las reglas importantes en casa',              21, true),
  ('a0000000-0000-0000-0000-000000000016', 'making-mistakes','Me equivoco',           '💪', 'emotions',  'from-red-100 to-rose-50',       'Está bien equivocarse, todos lo hacemos',     22, true);

-- Pages for each new story
INSERT INTO story_pages (story_id, page_number, text, keyword, emoji) VALUES

  -- hand-wash (5 pages)
  ('a0000000-0000-0000-0000-00000000000d', 1, 'Lavarme las manos me protege de los gérmenes.',       'lavarse',    '🧼'),
  ('a0000000-0000-0000-0000-00000000000d', 2, 'Primero mojo mis manos con agua.',                     'agua',       '🚿'),
  ('a0000000-0000-0000-0000-00000000000d', 3, 'Pongo jabón y restriego bien entre los dedos.',        'jabon',      '🧴'),
  ('a0000000-0000-0000-0000-00000000000d', 4, 'Enjuago con agua hasta que no quede jabón.',            'agua',       '🚿'),
  ('a0000000-0000-0000-0000-00000000000d', 5, 'Las seco con una toalla limpia. ¡Manos limpias!',      'secarse',    '✅'),

  -- backpack (5 pages)
  ('a0000000-0000-0000-0000-00000000000e', 1, 'Cada tarde preparo mi mochila para el día siguiente.', 'mochila',    '🎒'),
  ('a0000000-0000-0000-0000-00000000000e', 2, 'Reviso la agenda para ver qué necesito llevar.',        'agenda',     '📋'),
  ('a0000000-0000-0000-0000-00000000000e', 3, 'Pongo los libros y cuadernos de las asignaturas.',      'libro',      '📚'),
  ('a0000000-0000-0000-0000-00000000000e', 4, 'No olvido el estuche, la botella de agua y la merienda.', 'agua',     '🍎'),
  ('a0000000-0000-0000-0000-00000000000e', 5, 'Dejo la mochila lista cerca de la puerta.',            'listo',      '✅'),

  -- haircut (5 pages)
  ('a0000000-0000-0000-0000-00000000000f', 1, 'A veces voy a la peluquería a cortarme el pelo.',      'peluqueria', '✂️'),
  ('a0000000-0000-0000-0000-00000000000f', 2, 'Me siento en una silla grande frente al espejo.',      'sentarse',   '🪑'),
  ('a0000000-0000-0000-0000-00000000000f', 3, 'El peluquero pone una capa para que no me manche.',    'proteger',   '🧥'),
  ('a0000000-0000-0000-0000-00000000000f', 4, 'Usa tijeras o una máquina que hace ruido, pero no duele.', 'tijeras', '🔊'),
  ('a0000000-0000-0000-0000-00000000000f', 5, 'Cuando termina, me miro al espejo. ¡Qué guapo!',       'feliz',      '😊'),

  -- park (6 pages)
  ('a0000000-0000-0000-0000-000000000010', 1, 'Ir al parque es una actividad divertida al aire libre.', 'parque',    '🌳'),
  ('a0000000-0000-0000-0000-000000000010', 2, 'Puedo columpiarme, bajar por el tobogán o trepar.',      'columpio',   '🎠'),
  ('a0000000-0000-0000-0000-000000000010', 3, 'A veces hay otros niños. Puedo saludar y jugar con ellos.', 'amigos',  '👋'),
  ('a0000000-0000-0000-0000-000000000010', 4, 'Espero mi turno en los juegos que usan otros.',           'esperar',    '⏳'),
  ('a0000000-0000-0000-0000-000000000010', 5, 'Cuando mamá o papá dice que es hora de irnos, recojo mis cosas.', 'recoger', '🧺'),
  ('a0000000-0000-0000-0000-000000000010', 6, 'Caminamos juntos de vuelta a casa. ¡Volveremos pronto!', 'casa',       '🏠'),

  -- cross-street (5 pages)
  ('a0000000-0000-0000-0000-000000000011', 1, 'Cruzar la calle es importante y hay que hacerlo con cuidado.', 'calle',  '🚦'),
  ('a0000000-0000-0000-0000-000000000011', 2, 'Siempre voy de la mano de un adulto.',                      'mano',       '🤝'),
  ('a0000000-0000-0000-0000-000000000011', 3, 'Miro a un lado y al otro para ver si vienen coches.',      'mirar',      '👀'),
  ('a0000000-0000-0000-0000-000000000011', 4, 'Cruzo por el paso de peatones cuando el semáforo está en verde.', 'semaforo', '🟢'),
  ('a0000000-0000-0000-0000-000000000011', 5, 'Camino rápido sin correr hasta la otra acera. ¡Bien!',     'caminar',    '✅'),

  -- birthday (6 pages)
  ('a0000000-0000-0000-0000-000000000012', 1, 'Hoy es mi cumpleaños o el de un amigo.',                   'cumpleanos', '🎂'),
  ('a0000000-0000-0000-0000-000000000012', 2, 'Hay globos, música y decoración de colores.',               'fiesta',     '🎈'),
  ('a0000000-0000-0000-0000-000000000012', 3, 'Vienen amigos y familiares a celebrar.',                     'amigos',     '👨‍👩‍👧‍👦'),
  ('a0000000-0000-0000-0000-000000000012', 4, 'Cantamos cumpleaños feliz y soplamos las velas.',           'cantar',     '🕯️'),
  ('a0000000-0000-0000-0000-000000000012', 5, 'A veces hay ruido y mucha gente. Está bien buscar un momento tranquilo.', 'tranquilo', '🧘'),
  ('a0000000-0000-0000-0000-000000000012', 6, 'Lo más importante es compartir y divertirnos juntos.',      'feliz',      '🎉'),

  -- beach (5 pages)
  ('a0000000-0000-0000-0000-000000000013', 1, 'Ir a la playa es divertido. Hay arena y mar.',              'playa',      '🏖️'),
  ('a0000000-0000-0000-0000-000000000013', 2, 'Me pongo protector solar y me quito los zapatos.',          'proteger',   '🧴'),
  ('a0000000-0000-0000-0000-000000000013', 3, 'Puedo hacer castillos de arena o jugar con la pelota.',    'arena',      '🏐'),
  ('a0000000-0000-0000-0000-000000000013', 4, 'Si entro al agua, me quedo cerca de la orilla con un adulto.', 'agua',    '🌊'),
  ('a0000000-0000-0000-0000-000000000013', 5, 'Al terminar, me seco, me cambio y recogemos todo.',        'secarse',    '✅'),

  -- vacation (5 pages)
  ('a0000000-0000-0000-0000-000000000014', 1, 'Las vacaciones son días especiales sin escuela.',            'vacaciones', '🏖️'),
  ('a0000000-0000-0000-0000-000000000014', 2, 'Preparamos una maleta con ropa para los días que estaremos fuera.', 'maleta', '🧳'),
  ('a0000000-0000-0000-0000-000000000014', 3, 'Viajamos a un lugar nuevo o visitamos a la familia.',       'viaje',      '🚗'),
  ('a0000000-0000-0000-0000-000000000014', 4, 'Hacemos actividades diferentes como pasear o nadar.',       'jugar',      '🎯'),
  ('a0000000-0000-0000-0000-000000000014', 5, 'Disfruto el tiempo con mi familia. ¡Las vacaciones son geniales!', 'familia', '😊'),

  -- house-rules (5 pages)
  ('a0000000-0000-0000-0000-000000000015', 1, 'En casa hay reglas que me ayudan a convivir en familia.',   'casa',       '🏠'),
  ('a0000000-0000-0000-0000-000000000015', 2, 'Recojo mis juguetes después de jugar.',                     'recoger',    '🧸'),
  ('a0000000-0000-0000-0000-000000000015', 3, 'Pido las cosas por favor y doy las gracias.',               'pedir',      '🙏'),
  ('a0000000-0000-0000-0000-000000000015', 4, 'Cuando alguien habla, espero mi turno para decir algo.',   'escuchar',   '👂'),
  ('a0000000-0000-0000-0000-000000000015', 5, 'Seguir las normas hace que todos estemos contentos.',      'feliz',      '🌟'),

  -- making-mistakes (5 pages)
  ('a0000000-0000-0000-0000-000000000016', 1, 'Todos nos equivocamos. Es parte de aprender.',              'error',      '💪'),
  ('a0000000-0000-0000-0000-000000000016', 2, 'Si me equivoco, respiro hondo y lo intento de nuevo.',      'respirar',   '🫁'),
  ('a0000000-0000-0000-0000-000000000016', 3, 'Puedo pedir ayuda a un adulto si no sé cómo arreglarlo.',  'ayuda',      '🤝'),
  ('a0000000-0000-0000-0000-000000000016', 4, 'Equivocarme no me hace menos. Solo significa que estoy aprendiendo.', 'aprender', '📖'),
  ('a0000000-0000-0000-0000-000000000016', 5, 'Cada error me enseña algo nuevo. ¡Sigo adelante!',          'feliz',      '🌟');
