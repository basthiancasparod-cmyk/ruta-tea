-- ============================================================
-- 00011: Seed data for curriculum tables (age_range = '3-5')
--        7 areas × 10 modules × 5 exercises = 350 exercises
-- ============================================================

-- ─── 1. CURRICULUM AREAS ──────────────────────────────────────

INSERT INTO curriculum_areas (id, name, description, icon, age_range, order_index) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Comunicación',     'Desarrolla la comunicación y el lenguaje expresivo y receptivo',  '🗣️', '3-5', 1),
  ('a0000000-0000-0000-0000-000000000002', 'Social',           'Fortalece las habilidades de interacción social y empatía',       '🤝', '3-5', 2),
  ('a0000000-0000-0000-0000-000000000003', 'Motricidad Fina',  'Mejora la coordinación ojo-mano y movimientos precisos',          '✋',  '3-5', 3),
  ('a0000000-0000-0000-0000-000000000004', 'Motricidad Gruesa','Desarrolla el control corporal y movimientos grandes',            '🏃',  '3-5', 4),
  ('a0000000-0000-0000-0000-000000000005', 'Cognitivo',        'Estimula el pensamiento, la memoria y la resolución de problemas','🧠', '3-5', 5),
  ('a0000000-0000-0000-0000-000000000006', 'Autonomía',        'Promueve la independencia en actividades diarias',                '🌟',  '3-5', 6),
  ('a0000000-0000-0000-0000-000000000007', 'Sensorial',        'Explora y regula los sentidos y la percepción sensorial',         '🌈',  '3-5', 7);

-- ─── 2. CURRICULUM MODULES (10 per area = 70 total) ──────────

-- Area 1: Comunicación
INSERT INTO curriculum_modules (id, area_id, name, description, therapeutic_goal, age_range, order_index, total_exercises) VALUES
  ('m1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Responde a tu nombre',     'Responde cuando te llaman',             'Que el niño responda al ser llamado por su nombre',                                    '3-5', 1, 5),
  ('m1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Sonidos y emociones',      'Identifica sonidos emocionales',         'Que el niño asocie sonidos con expresiones faciales',                                  '3-5', 2, 5),
  ('m1000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Palabras mágicas',         'Usa palabras sociales básicas',          'Que el niño use "hola", "adiós", "gracias" en contexto',                              '3-5', 3, 5),
  ('m1000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Vocabulario de objetos',   'Nombra objetos cotidianos',              'Que el niño identifique y nombre objetos familiares',                                 '3-5', 4, 5),
  ('m1000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Órdenes simples',          'Sigue instrucciones básicas',            'Que el niño comprenda y ejecute órdenes de un paso',                                  '3-5', 5, 5),
  ('m1000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Preguntas sencillas',      'Responde preguntas básicas',             'Que el niño responda "sí/no" y "qué" a preguntas simples',                            '3-5', 6, 5),
  ('m1000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Descripciones',            'Describe objetos y personas',            'Que el niño use 2-3 palabras para describir atributos básicos',                       '3-5', 7, 5),
  ('m1000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Conversación guiada',      'Mantiene intercambios comunicativos',    'Que el niño participe en intercambios de ida y vuelta de 2-3 turnos',                 '3-5', 8, 5),
  ('m1000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'Narración',                'Cuenta eventos simples',                 'Que el niño relate una experiencia breve con apoyo visual',                           '3-5', 9, 5),
  ('m1000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'Juego comunicativo',       'Integra comunicación en juego',          'Que el niño use lenguaje espontáneo durante el juego simbólico',                     '3-5', 10, 5);

-- Area 2: Social
INSERT INTO curriculum_modules (id, area_id, name, description, therapeutic_goal, age_range, order_index, total_exercises) VALUES
  ('m2000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Contacto visual',          'Mantiene la mirada breve',               'Que el niño sostenga contacto visual 2-3 segundos al ser llamado',                    '3-5', 1, 5),
  ('m2000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Sonrisa social',           'Responde con sonrisa',                   'Que el niño sonría en respuesta a una interacción social',                            '3-5', 2, 5),
  ('m2000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Imitación',                'Imita gestos y acciones',                'Que el niño imite gestos simples (palmas, señalar, saludar)',                         '3-5', 3, 5),
  ('m2000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'Juego paralelo',           'Juega junto a otro',                     'Que el niño juegue al lado de un compañero sin interferir',                           '3-5', 4, 5),
  ('m2000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'Turnos',                   'Espera su turno',                        'Que el niño espere su turno en un juego de 2 personas',                               '3-5', 5, 5),
  ('m2000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 'Compartir',                'Comparte con otros',                     'Que el niño comparta un objeto con un compañero por iniciativa propia',               '3-5', 6, 5),
  ('m2000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002', 'Empatía básica',           'Reconoce emociones ajenas',              'Que el niño identifique alegría y tristeza en otros',                                 '3-5', 7, 5),
  ('m2000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002', 'Juego cooperativo',        'Colabora para un objetivo común',        'Que el niño realice una acción conjunta con un compañero para lograr una meta',       '3-5', 8, 5),
  ('m2000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000002', 'Saludo y despedida',       'Saluda y se despide autónomamente',      'Que el niño inicie el saludo y la despedida sin recordatorio',                       '3-5', 9, 5),
  ('m2000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000002', 'Fiesta social',            'Integra habilidades sociales',           'Que el niño combine saludo, contacto visual, turnos y compartir en un juego grupal',  '3-5', 10, 10);

-- Area 3: Motricidad Fina
INSERT INTO curriculum_modules (id, area_id, name, description, therapeutic_goal, age_range, order_index, total_exercises) VALUES
  ('m3010000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'Prensión',                 'Sujeta objetos pequeños',                'Que el niño sostenga objetos con pinza digital',                                      '3-5', 1, 5),
  ('m3010000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'Señalar',                  'Señala con el índice',                   'Que el niño señale objetos e imágenes con el dedo índice',                            '3-5', 2, 5),
  ('m3010000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'Arrastrar',                'Arrastra objetos en pantalla',           'Que el niño desplace objetos táctilmente de un lugar a otro',                         '3-5', 3, 5),
  ('m3010000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'Encajar',                  'Coloca objetos en su lugar',             'Que el niño inserte formas en sus correspondientes espacios',                         '3-5', 4, 5),
  ('m3010000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 'Trazos',                   'Realiza trazos simples',                 'Que el niño dibuje líneas rectas y círculos',                                         '3-5', 5, 5),
  ('m3010000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'Abotonar',                 'Manipula broches y botones',             'Que el niño abra y cierre botones grandes',                                           '3-5', 6, 5),
  ('m3010000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', 'Ensartar',                 'Ensarta cuentas en un hilo',             'Que el niño pase un cordón por agujeros de cuentas grandes',                          '3-5', 7, 5),
  ('m3010000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000003', 'Recortar',                 'Usa tijeras con control',                'Que el niño corte papel siguiendo líneas rectas',                                     '3-5', 8, 5),
  ('m3010000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003', 'Rasgar',                   'Rasga papel con control',                'Que el niño rasgue tiras de papel usando ambas manos',                                '3-5', 9, 5),
  ('m3010000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000003', 'Construcción fina',        'Construye con bloques pequeños',         'Que el niño apile 6+ bloques pequeños y construya torres estables',                  '3-5', 10, 5);

-- Area 4: Motricidad Gruesa
INSERT INTO curriculum_modules (id, area_id, name, description, therapeutic_goal, age_range, order_index, total_exercises) VALUES
  ('m4010000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'Gateo',                    'Gatea con coordinación',                 'Que el niño gatee alternando brazo y pierna contraria',                               '3-5', 1, 5),
  ('m4010000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'Caminar',                  'Camina con equilibrio',                  'Que el niño camine en línea recta con pasos coordinados',                             '3-5', 2, 5),
  ('m4010000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 'Correr',                   'Corre con control',                      'Que el niño corra y se detenga bajo control voluntario',                              '3-5', 3, 5),
  ('m4010000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'Saltar',                   'Salta con ambos pies',                   'Que el niño salte en el lugar cayendo sobre ambos pies',                              '3-5', 4, 5),
  ('m4010000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 'Equilibrio',               'Mantiene el equilibrio estático',        'Que el niño se mantenga en un pie 3-5 segundos',                                      '3-5', 5, 5),
  ('m4010000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004', 'Lanzar',                   'Lanza objetos con dirección',            'Que el niño lance una pelota hacia un blanco grande',                                 '3-5', 6, 5),
  ('m4010000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000004', 'Atrapar',                  'Atrapa objetos',                         'Que el niño atrape una pelota grande con ambos brazos',                               '3-5', 7, 5),
  ('m4010000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000004', 'Patear',                   'Patea con puntería',                     'Que el niño pateé una pelota hacia una dirección específica',                         '3-5', 8, 5),
  ('m4010000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000004', 'Trepar',                   'Trepa con seguridad',                    'Que el niño suba y baje de estructuras bajas usando brazos y piernas',                '3-5', 9, 5),
  ('m4010000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000004', 'Circuito motor',           'Completa un circuito grueso',            'Que el niño realice una secuencia de correr, saltar, lanzar y trepar',               '3-5', 10, 5);

-- Area 5: Cognitivo
INSERT INTO curriculum_modules (id, area_id, name, description, therapeutic_goal, age_range, order_index, total_exercises) VALUES
  ('m5010000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'Atención',                 'Mantiene la atención breve',             'Que el niño enfoque la atención en un estímulo por 10 segundos',                      '3-5', 1, 5),
  ('m5010000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', 'Memoria visual',           'Recuerda imágenes vistas',               'Que el niño recuerde 2-3 objetos después de 5 segundos',                              '3-5', 2, 5),
  ('m5010000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000005', 'Clasificación',            'Agrupa por categorías',                  'Que el niño clasifique objetos por color, forma o tamaño',                            '3-5', 3, 5),
  ('m5010000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005', 'Correspondencia',          'Relaciona elementos',                    'Que el niño empareje objetos iguales en una actividad uno a uno',                     '3-5', 4, 5),
  ('m5010000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', 'Causa y efecto',           'Comprende relación causa-efecto',        'Que el niño entienda que al tocar un botón ocurre algo',                             '3-5', 5, 5),
  ('m5010000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000005', 'Secuencias',               'Ordena secuencias simples',              'Que el niño ordene 3 imágenes en secuencia lógica',                                   '3-5', 6, 5),
  ('m5010000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000005', 'Resolver problemas',       'Soluciona problemas simples',            'Que el niño encuentre una solución a un problema concreto y simple',                  '3-5', 7, 5),
  ('m5010000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000005', 'Conceptos básicos',        'Comprende conceptos de cantidad',        'Que el niño identifique "uno", "muchos", "grande", "pequeño"',                       '3-5', 8, 5),
  ('m5010000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000005', 'Juego simbólico',          'Usa objetos simbólicamente',             'Que el niño use un objeto para representar otro en juego',                            '3-5', 9, 5),
  ('m5010000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000005', 'Desafío cognitivo',        'Integra habilidades cognitivas',         'Que el niño combine memoria, clasificación y secuenciación en un juego integrado',    '3-5', 10, 5);

-- Area 6: Autonomía
INSERT INTO curriculum_modules (id, area_id, name, description, therapeutic_goal, age_range, order_index, total_exercises) VALUES
  ('m6010000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006', 'Vestirse',                 'Participa en vestirse',                  'Que el niño colabore al vestirse (meter brazos, levantar piernas)',                    '3-5', 1, 5),
  ('m6010000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000006', 'Alimentación',             'Come de forma independiente',            'Que el niño use cubiertos y beba solo de un vaso',                                     '3-5', 2, 5),
  ('m6010000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000006', 'Higiene',                  'Realiza higiene básica',                 'Que el niño se lave las manos y se seque con ayuda mínima',                           '3-5', 3, 5),
  ('m6010000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000006', 'Control de esfínteres',    'Reconoce necesidad fisiológica',         'Que el niño comunique la necesidad de ir al baño',                                     '3-5', 4, 5),
  ('m6010000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000006', 'Recoger',                  'Recoge sus pertenencias',                'Que el niño guarde juguetes en su lugar con recordatorio',                            '3-5', 5, 5),
  ('m6010000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000006', 'Rutina matutina',          'Sigue rutina de la mañana',              'Que el niño complete los pasos de la rutina matutina con supervisión',                '3-5', 6, 5),
  ('m6010000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000006', 'Rutina nocturna',          'Sigue rutina de dormir',                 'Que el niño complete los pasos de la rutina nocturna con supervisión',                '3-5', 7, 5),
  ('m6010000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000006', 'Pedir ayuda',              'Solicita ayuda cuando la necesita',      'Que el niño pida ayuda verbalmente o con gesto cuando enfrenta una dificultad',       '3-5', 8, 5),
  ('m6010000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000006', 'Esperar',                  'Espera con paciencia',                   'Que el niño espere 2-3 minutos sin frustrarse',                                        '3-5', 9, 5),
  ('m6010000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000006', 'Día autónomo',             'Integra rutinas autónomas',              'Que el niño complete una secuencia de autonomía (vestir, comer, recoger, higiene)',   '3-5', 10, 5);

-- Area 7: Sensorial
INSERT INTO curriculum_modules (id, area_id, name, description, therapeutic_goal, age_range, order_index, total_exercises) VALUES
  ('m7010000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000007', 'Visual',                   'Responde a estímulos visuales',          'Que el niño siga un objeto en movimiento con la mirada',                              '3-5', 1, 5),
  ('m7010000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000007', 'Auditivo',                 'Responde a estímulos auditivos',         'Que el niño reaccione a sonidos del entorno y los identifique',                       '3-5', 2, 5),
  ('m7010000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000007', 'Táctil',                   'Explora texturas',                       'Que el niño toque y explore diferentes texturas sin rechazo',                         '3-5', 3, 5),
  ('m7010000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000007', 'Vestibular',               'Disfruta movimiento',                    'Que el niño tolere el movimiento mecedora o balanceo sin ansiedad',                   '3-5', 4, 5),
  ('m7010000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000007', 'Propiocepción',            'Toma conciencia corporal',               'Que el niño identifique partes de su cuerpo al nombrarlas',                           '3-5', 5, 5),
  ('m7010000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000007', 'Tolerancia sensorial',     'Tolera estímulos combinados',            'Que el niño permanezca regulado ante estímulos visuales y auditivos simultáneos',    '3-5', 6, 5),
  ('m7010000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000007', 'Regulación emocional',     'Se autorregula con apoyo',               'Que el niño use estrategias sensoriales para calmarse (respirar, apretar, mecer)',     '3-5', 7, 5),
  ('m7010000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000007', 'Exploración libre',        'Explora entorno sensorial',               'Que el niño investigue activamente un ambiente sensorial preparado',                  '3-5', 8, 5),
  ('m7010000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000007', 'Juego sensorial',          'Participa en juego sensorial',            'Que el niño interactúe con materiales sensoriales (arena, agua, pintura)',            '3-5', 9, 5),
  ('m7010000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000007', 'Integración sensorial',    'Integra múltiples sentidos',             'Que el niño procese y responda a estímulos de 2+ sentidos simultáneamente',          '3-5', 10, 5);

-- ─── 3. CURRICULUM EXERCISES ──────────────────────────────────
-- Generate 5 exercises per module using PL/pgSQL.
-- Each module gets a balanced mix of the 10 exercise types.

DO $$
DECLARE
  mod_ids UUID[] := ARRAY[
    -- Area 1: Comunicación
    'm1000000-0000-0000-0000-000000000001', 'm1000000-0000-0000-0000-000000000002',
    'm1000000-0000-0000-0000-000000000003', 'm1000000-0000-0000-0000-000000000004',
    'm1000000-0000-0000-0000-000000000005', 'm1000000-0000-0000-0000-000000000006',
    'm1000000-0000-0000-0000-000000000007', 'm1000000-0000-0000-0000-000000000008',
    'm1000000-0000-0000-0000-000000000009', 'm1000000-0000-0000-0000-000000000010',
    -- Area 2: Social
    'm2000000-0000-0000-0000-000000000001', 'm2000000-0000-0000-0000-000000000002',
    'm2000000-0000-0000-0000-000000000003', 'm2000000-0000-0000-0000-000000000004',
    'm2000000-0000-0000-0000-000000000005', 'm2000000-0000-0000-0000-000000000006',
    'm2000000-0000-0000-0000-000000000007', 'm2000000-0000-0000-0000-000000000008',
    'm2000000-0000-0000-0000-000000000009', 'm2000000-0000-0000-0000-000000000010',
    -- Area 3: Motricidad Fina
    'm3010000-0000-0000-0000-000000000001', 'm3010000-0000-0000-0000-000000000002',
    'm3010000-0000-0000-0000-000000000003', 'm3010000-0000-0000-0000-000000000004',
    'm3010000-0000-0000-0000-000000000005', 'm3010000-0000-0000-0000-000000000006',
    'm3010000-0000-0000-0000-000000000007', 'm3010000-0000-0000-0000-000000000008',
    'm3010000-0000-0000-0000-000000000009', 'm3010000-0000-0000-0000-000000000010',
    -- Area 4: Motricidad Gruesa
    'm4010000-0000-0000-0000-000000000001', 'm4010000-0000-0000-0000-000000000002',
    'm4010000-0000-0000-0000-000000000003', 'm4010000-0000-0000-0000-000000000004',
    'm4010000-0000-0000-0000-000000000005', 'm4010000-0000-0000-0000-000000000006',
    'm4010000-0000-0000-0000-000000000007', 'm4010000-0000-0000-0000-000000000008',
    'm4010000-0000-0000-0000-000000000009', 'm4010000-0000-0000-0000-000000000010',
    -- Area 5: Cognitivo
    'm5010000-0000-0000-0000-000000000001', 'm5010000-0000-0000-0000-000000000002',
    'm5010000-0000-0000-0000-000000000003', 'm5010000-0000-0000-0000-000000000004',
    'm5010000-0000-0000-0000-000000000005', 'm5010000-0000-0000-0000-000000000006',
    'm5010000-0000-0000-0000-000000000007', 'm5010000-0000-0000-0000-000000000008',
    'm5010000-0000-0000-0000-000000000009', 'm5010000-0000-0000-0000-000000000010',
    -- Area 6: Autonomía
    'm6010000-0000-0000-0000-000000000001', 'm6010000-0000-0000-0000-000000000002',
    'm6010000-0000-0000-0000-000000000003', 'm6010000-0000-0000-0000-000000000004',
    'm6010000-0000-0000-0000-000000000005', 'm6010000-0000-0000-0000-000000000006',
    'm6010000-0000-0000-0000-000000000007', 'm6010000-0000-0000-0000-000000000008',
    'm6010000-0000-0000-0000-000000000009', 'm6010000-0000-0000-0000-000000000010',
    -- Area 7: Sensorial
    'm7010000-0000-0000-0000-000000000001', 'm7010000-0000-0000-0000-000000000002',
    'm7010000-0000-0000-0000-000000000003', 'm7010000-0000-0000-0000-000000000004',
    'm7010000-0000-0000-0000-000000000005', 'm7010000-0000-0000-0000-000000000006',
    'm7010000-0000-0000-0000-000000000007', 'm7010000-0000-0000-0000-000000000008',
    'm7010000-0000-0000-0000-000000000009', 'm7010000-0000-0000-0000-000000000010'
  ];
  mod_id UUID;
  ex_type TEXT;
  titles TEXT[] := ARRAY['Toca y descubre', 'Elige la opción', 'Busca y encuentra', 'Escucha y responde', 'Sigue la secuencia'];
  descs TEXT[] := ARRAY['Sigue las instrucciones en pantalla', 'Selecciona la respuesta correcta', 'Encuentra el elemento correcto', 'Escucha atentamente y responde', 'Completa la secuencia de actividades'];
  type_cycle TEXT[] := ARRAY['touch_screen', 'select_face', 'find_character', 'hidden_sound', 'sequence_challenge'];
  i INT;
  ex_num INT;
BEGIN
  FOREACH mod_id IN ARRAY mod_ids LOOP
    FOR ex_num IN 1..5 LOOP
      i := (ex_num - 1) % 5 + 1;
      ex_type := type_cycle[1 + ((ex_num - 1 + array_position(mod_ids, mod_id)) % 5)];
      INSERT INTO curriculum_exercises (module_id, title, description, exercise_type, content, order_index, xp_reward)
      VALUES (
        mod_id,
        titles[i] || ' ' || ex_num::TEXT,
        descs[i],
        ex_type,
        jsonb_build_object('rounds', 3 + (ex_num % 3), 'difficulty', ex_num),
        ex_num,
        10 + (ex_num * 5)
      );
    END LOOP;
  END LOOP;
END $$;
