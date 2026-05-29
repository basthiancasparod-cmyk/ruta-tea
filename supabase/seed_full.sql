-- ============================================================
-- Dino Aprende - Seed: Lecciones para TODAS las edades y niveles
-- Ejecutar después de migration.sql
-- ============================================================

-- Limpiar lecciones existentes para evitar duplicados
DELETE FROM child_progress;
DELETE FROM lessons;

-- ============================================================
-- EDAD 0-2 años (Intervención Temprana)
-- ============================================================

-- Nivel 1 (apoyo)
INSERT INTO lessons (title, description, age_range, tea_level, therapy_type, order_index, xp_reward, content)
VALUES
('Seguimiento visual', 'Sigue el objeto brillante con la mirada.', '0-2', 1, 'esdm', 1, 40, '{"instructions": "Mueve el objeto lentamente frente al niño.", "type": "attention", "data": {"sensory": "visual"}}'),
('Atención conjunta', 'Mira donde señala Lumi y luego mira el objeto.', '0-2', 1, 'esdm', 2, 40, '{"instructions": "Señala el objeto y espera que el niño mire.", "type": "attention", "data": {}}'),
('Imitación vocal', 'Repite el sonido que hace Lumi: "ah", "eh", "oh".', '0-2', 1, 'speech', 3, 40, '{"instructions": "Escucha el sonido y trata de imitarlo.", "type": "imitation", "data": {"sounds": ["ah", "eh", "oh"]}}'),
('Sonrisa social', 'Lumi sonríe y espera una sonrisa de vuelta.', '0-2', 1, 'esdm', 4, 45, '{"instructions": "Sonríe al niño y espera que sonría de vuelta.", "type": "attention", "data": {}}'),
('Tocar y sentir', 'Toca diferentes texturas: suave, áspero, rugoso.', '0-2', 1, 'sensory', 5, 40, '{"instructions": "Toca cada textura y observa la reacción.", "type": "attention", "data": {"textures": ["suave", "áspero", "rugoso"]}}'),
('Juego de aparecer', 'Lumi aparece y desaparece: ¡cucú!', '0-2', 1, 'play', 6, 45, '{"instructions": "Lumi se esconde y aparece. Espera la reacción.", "type": "attention", "data": {}}');

-- Nivel 2 (apoyo notable) - mismas áreas, más repetición, más simple
INSERT INTO lessons (title, description, age_range, tea_level, therapy_type, order_index, xp_reward, content)
VALUES
('Seguimiento visual', 'Sigue la luz con la mirada (nivel 2).', '0-2', 2, 'esdm', 1, 30, '{"instructions": "Mueve la luz lentamente. Más repeticiones.", "type": "attention", "data": {"sensory": "visual", "repetitions": 5}}'),
('Atención conjunta', 'Mira donde señalo (nivel 2).', '0-2', 2, 'esdm', 2, 30, '{"instructions": "Señala y espera. Más ayuda visual.", "type": "attention", "data": {"prompt_level": "high"}}'),
('Imitación vocal', 'Repite sonidos simples: "a", "o".', '0-2', 2, 'speech', 3, 30, '{"instructions": "Sonidos muy simples con apoyo visual.", "type": "imitation", "data": {"sounds": ["a", "o"]}}'),
('Tocar texturas', 'Explora texturas con ayuda.', '0-2', 2, 'sensory', 4, 30, '{"instructions": "Toca cada textura con guía mano sobre mano.", "type": "attention", "data": {"textures": ["suave", "rugoso"]}}');

-- Nivel 3 (apoyo muy notable) - más simples, más sensorial
INSERT INTO lessons (title, description, age_range, tea_level, therapy_type, order_index, xp_reward, content)
VALUES
('Estimulación visual', 'Mira luces de colores que se mueven.', '0-2', 3, 'sensory', 1, 20, '{"instructions": "Estimulación visual con luces suaves.", "type": "attention", "data": {"sensory": "lights"}}'),
('Estimulación táctil', 'Siente texturas suaves en las manos.', '0-2', 3, 'sensory', 2, 20, '{"instructions": "Texturas muy suaves, estimulación gentil.", "type": "attention", "data": {"textures": ["seda", "algodón"]}}'),
('Sonidos calmantes', 'Escucha sonidos suaves y relajantes.', '0-2', 3, 'sensory', 3, 20, '{"instructions": "Sonidos suaves de la naturaleza.", "type": "attention", "data": {"sounds": ["nature", "lullaby"]}}');

-- ============================================================
-- EDAD 3-5 años (Preescolar) - SE MANTIENE LA EXISTENTE
-- Nivel 1
-- ============================================================
INSERT INTO lessons (title, description, age_range, tea_level, therapy_type, order_index, xp_reward, content)
VALUES
('Atención conjunta', 'Sigue con la mirada el objeto que Lumi te muestra.', '3-5', 1, 'esdm', 1, 50, '{"instructions": "Mira el objeto que aparece en pantalla y síguelo con la mirada.", "type": "attention", "data": {}}'),
('Imitación gestual', 'Copia los gestos que hace Lumi con las manos.', '3-5', 1, 'aba', 2, 50, '{"instructions": "Observa el gesto y repítelo.", "type": "imitation", "data": {}}'),
('Vocabulario con pictos', 'Relaciona el pictograma con la palabra correcta.', '3-5', 1, 'speech', 3, 50, '{"instructions": "Toca el pictograma que corresponde a la palabra.", "type": "pictogram_match", "data": {}}'),
('Señalar y pedir', 'Aprende a señalar lo que quieres para pedirlo.', '3-5', 1, 'aba', 4, 60, '{"instructions": "Cuando quieras algo, señalalo con el dedo.", "type": "imitation", "data": {}}'),
('Emociones básicas', 'Identifica las emociones: alegría, tristeza, enojo y miedo.', '3-5', 1, 'play', 5, 60, '{"instructions": "Elige la emoción que corresponde a la situación.", "type": "emotion_select", "data": {}}'),
('Rutina: levantarse', 'Sigue los pasos para empezar el día.', '3-5', 1, 'teacch', 6, 70, '{"instructions": "Ordena los pictogramas de la rutina de la mañana.", "type": "sequence", "data": {}}'),
('Rutina: comer', 'Aprende los pasos para la hora de la comida.', '3-5', 1, 'teacch', 7, 70, '{"instructions": "Ordena los pictogramas de la rutina de comer.", "type": "sequence", "data": {}}'),
('Juego simbólico', 'Usa objetos imaginarios para jugar.', '3-5', 1, 'play', 8, 80, '{"instructions": "Juega con los objetos como si fueran otra cosa.", "type": "attention", "data": {}}'),
('Tomar turnos', 'Espera tu turno para hablar o jugar.', '3-5', 1, 'social', 9, 80, '{"instructions": "Toca cuando sea tu turno y espera cuando sea el turno de Lumi.", "type": "imitation", "data": {}}'),
('Compartir', 'Comparte tus juguetes con Lumi.', '3-5', 1, 'social', 10, 90, '{"instructions": "Arrastra el juguete para compartirlo con Lumi.", "type": "attention", "data": {}}');

-- Nivel 2 (apoyo notable) - mismo rango, más estructura
INSERT INTO lessons (title, description, age_range, tea_level, therapy_type, order_index, xp_reward, content)
VALUES
('Atención conjunta guiada', 'Sigue el objeto con ayuda visual.', '3-5', 2, 'esdm', 1, 40, '{"instructions": "Sigue el objeto con una flecha que te guía.", "type": "attention", "data": {"prompt_level": "high"}}'),
('Imitación simple', 'Copia un solo gesto: levantar la mano.', '3-5', 2, 'aba', 2, 40, '{"instructions": "Observa el gesto simple y copialo.", "type": "imitation", "data": {"simple": true}}'),
('Vocabulario: 2 pictos', 'Elige entre 2 pictogramas.', '3-5', 2, 'speech', 3, 40, '{"instructions": "Toca el pictograma correcto entre 2 opciones.", "type": "pictogram_match", "data": {"options": 2}}'),
('Señalar con ayuda', 'Señala con la guía de Lumi.', '3-5', 2, 'aba', 4, 45, '{"instructions": "Lumi te ayuda a señalar con su mano.", "type": "imitation", "data": {"prompt_level": "high"}}'),
('Emociones: alegre/triste', 'Identifica alegre o triste.', '3-5', 2, 'play', 5, 45, '{"instructions": "Elige entre alegre y triste.", "type": "emotion_select", "data": {"emotions": ["alegre", "triste"]}}'),
('Rutina visual guiada', 'Sigue la rutina con pictos grandes.', '3-5', 2, 'teacch', 6, 50, '{"instructions": "Arrastra los pictogramas grandes a su lugar.", "type": "sequence", "data": {"visual_prompt": true}}');

-- Nivel 3 (apoyo muy notable) - mismo rango, muy estructurado
INSERT INTO lessons (title, description, age_range, tea_level, therapy_type, order_index, xp_reward, content)
VALUES
('Mirar juntos', 'Mira la pantalla con Lumi.', '3-5', 3, 'esdm', 1, 25, '{"instructions": "Mira la pantalla junto con Lumi.", "type": "attention", "data": {"joint_attention": true}}'),
('Tocar el picto', 'Toca el pictograma que aparece.', '3-5', 3, 'speech', 2, 25, '{"instructions": "Toca cualquier pictograma para empezar.", "type": "attention", "data": {"free_touch": true}}'),
('Escuchar y calmar', 'Escucha la canción de Lumi.', '3-5', 3, 'sensory', 3, 25, '{"instructions": "Escucha la música calmante con Lumi.", "type": "attention", "data": {"music": "calming"}}');

-- ============================================================
-- EDAD 6-10 años (Escolar)
-- ============================================================

-- Nivel 1
INSERT INTO lessons (title, description, age_range, tea_level, therapy_type, order_index, xp_reward, content)
VALUES
('Conversación: saludo', 'Saluda y espera la respuesta.', '6-10', 1, 'social', 1, 60, '{"instructions": "Di hola y espera a que te respondan.", "type": "imitation", "data": {"conversation": true}}'),
('Historias sociales', 'Lee una historia sobre ir al colegio.', '6-10', 1, 'cognitive', 2, 60, '{"instructions": "Sigue la historia social paso a paso.", "type": "attention", "data": {"story": "school"}}'),
('Autorregulación', 'Identifica cómo te sientes y qué hacer.', '6-10', 1, 'cognitive', 3, 70, '{"instructions": "Elige la emoción y luego la acción para calmarte.", "type": "emotion_select", "data": {"regulation": true}}'),
('Lectoescritura: vocales', 'Reconoce las vocales con pictos.', '6-10', 1, 'speech', 4, 70, '{"instructions": "Toca la vocal que corresponde al sonido.", "type": "pictogram_match", "data": {"letters": ["A", "E", "I", "O", "U"]}}'),
('Juego de reglas', 'Sigue las reglas de un juego simple.', '6-10', 1, 'play', 5, 80, '{"instructions": "Sigue las reglas del juego con Lumi.", "type": "imitation", "data": {"game_rules": true}}'),
('Autonomía: vestirse', 'Ordena los pasos para vestirse.', '6-10', 1, 'occupational', 6, 80, '{"instructions": "Ordena los pictogramas de vestirse en secuencia.", "type": "sequence", "data": {"task": "dressing"}}'),
('Empatía básica', '¿Cómo se siente el otro niño?', '6-10', 1, 'social', 7, 90, '{"instructions": "Observa la situación y elige cómo se siente.", "type": "emotion_select", "data": {"empathy": true}}'),
('Resolver problemas', 'Elige la solución correcta.', '6-10', 1, 'cognitive', 8, 90, '{"instructions": "Lee el problema y elige la mejor solución.", "type": "emotion_select", "data": {"problem_solving": true}}');

-- Nivel 2
INSERT INTO lessons (title, description, age_range, tea_level, therapy_type, order_index, xp_reward, content)
VALUES
('Saludo con picto', 'Toca el picto de saludo.', '6-10', 2, 'social', 1, 50, '{"instructions": "Toca el pictograma de hola para saludar.", "type": "pictogram_match", "data": {"simple_conversation": true}}'),
('Historia social visual', 'Sigue la historia con imágenes.', '6-10', 2, 'cognitive', 2, 50, '{"instructions": "Sigue la historia imagen por imagen.", "type": "attention", "data": {"story": "school", "visual_only": true}}'),
('Calmarse: 3 pasos', 'Sigue los pasos para calmarte.', '6-10', 2, 'cognitive', 3, 55, '{"instructions": "Toca los pasos en orden: respirar, contar, pedir ayuda.", "type": "sequence", "data": {"regulation": true}}'),
('Vocales con imágenes', 'Relaciona vocal con imagen.', '6-10', 2, 'speech', 4, 50, '{"instructions": "Une cada vocal con una imagen que empiece con esa letra.", "type": "pictogram_match", "data": {"letters": ["A", "E", "I"]}}');

-- Nivel 3
INSERT INTO lessons (title, description, age_range, tea_level, therapy_type, order_index, xp_reward, content)
VALUES
('Saludo guiado', 'Saluda con la mano junto a Lumi.', '6-10', 3, 'social', 1, 30, '{"instructions": "Levanta la mano junto con Lumi para saludar.", "type": "imitation", "data": {"prompt_level": "high"}}'),
('Respirar con Lumi', 'Respira junto con la animación.', '6-10', 3, 'sensory', 2, 30, '{"instructions": "Inhala y exhala siguiendo a Lumi.", "type": "attention", "data": {"breathing": true}}');

-- ============================================================
-- EDAD 11-14 años (Adolescencia)
-- ============================================================

-- Nivel 1
INSERT INTO lessons (title, description, age_range, tea_level, therapy_type, order_index, xp_reward, content)
VALUES
('Conversación avanzada', 'Mantén una conversación de 3 turnos.', '11-14', 1, 'social', 1, 80, '{"instructions": "Responde y mantén la conversación por 3 intercambios.", "type": "imitation", "data": {"turns": 3}}'),
('Manejo de ansiedad', 'Identifica la ansiedad y usa técnicas.', '11-14', 1, 'cognitive', 2, 80, '{"instructions": "Reconoce los signos de ansiedad y elige una técnica.", "type": "emotion_select", "data": {"anxiety": true}}'),
('Autonomía: salir solo', 'Sigue los pasos para preparar una salida.', '11-14', 1, 'occupational', 3, 90, '{"instructions": "Ordena los pasos para preparar una salida.", "type": "sequence", "data": {"task": "going_out"}}'),
('Redes sociales seguras', 'Identifica situaciones seguras en internet.', '11-14', 1, 'cognitive', 4, 100, '{"instructions": "Elige si la situación es segura o no.", "type": "emotion_select", "data": {"internet_safety": true}}'),
('Intereses como fortaleza', 'Comparte tu interés especial con Lumi.', '11-14', 1, 'social', 5, 100, '{"instructions": "Háblale a Lumi sobre tu tema favorito.", "type": "attention", "data": {"special_interest": true}}');

-- Nivel 2
INSERT INTO lessons (title, description, age_range, tea_level, therapy_type, order_index, xp_reward, content)
VALUES
('Conversación guiada', 'Responde preguntas simples.', '11-14', 2, 'social', 1, 60, '{"instructions": "Responde con frases cortas a Lumi.", "type": "imitation", "data": {"turns": 2, "prompt_level": "high"}}'),
('Técnica de respiración', 'Sigue la respiración guiada.', '11-14', 2, 'cognitive', 2, 60, '{"instructions": "Sigue el círculo que se agranda y achica.", "type": "attention", "data": {"breathing": "guided"}}'),
('Preparar salida visual', 'Sigue la lista visual para salir.', '11-14', 2, 'occupational', 3, 65, '{"instructions": "Marca los items de la lista visual.", "type": "sequence", "data": {"task": "going_out", "visual": true}}');

-- Nivel 3
INSERT INTO lessons (title, description, age_range, tea_level, therapy_type, order_index, xp_reward, content)
VALUES
('Saludo social', 'Toca el picto para saludar.', '11-14', 3, 'social', 1, 35, '{"instructions": "Toca el pictograma para saludar.", "type": "pictogram_match", "data": {"simple": true}}'),
('Rutina de calma', 'Sigue los pasos para calmarte.', '11-14', 3, 'sensory', 2, 35, '{"instructions": "Sigue los pasos uno por uno.", "type": "sequence", "data": {"regulation": true}}');
