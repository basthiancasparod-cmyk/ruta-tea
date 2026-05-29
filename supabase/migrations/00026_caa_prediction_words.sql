-- ============================================================
-- 00026: Prediction dictionary — palabras para autocompletado
-- ============================================================

CREATE TABLE caa_prediction_words (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word       TEXT NOT NULL,
  frequency  INTEGER NOT NULL DEFAULT 1,
  language   TEXT NOT NULL DEFAULT 'es',
  profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id   UUID REFERENCES children(id) ON DELETE CASCADE,
  board_id   UUID REFERENCES caa_boards(id) ON DELETE CASCADE,
  source     TEXT NOT NULL DEFAULT 'system'
               CHECK (source IN ('system','custom','board','learned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pred_words_lang ON caa_prediction_words(language, frequency DESC);
CREATE INDEX idx_pred_words_profile ON caa_prediction_words(profile_id);
CREATE INDEX idx_pred_words_board ON caa_prediction_words(board_id);

ALTER TABLE caa_prediction_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own prediction words"
  ON caa_prediction_words FOR SELECT
  USING (
    profile_id IS NULL OR auth.uid() = profile_id
  );

CREATE POLICY "Users manage own prediction words"
  ON caa_prediction_words FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users update own prediction words"
  ON caa_prediction_words FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users delete own prediction words"
  ON caa_prediction_words FOR DELETE
  USING (auth.uid() = profile_id);

-- Seed: Spanish common words (top ~300)
INSERT INTO caa_prediction_words (word, frequency, language, source) VALUES
('de', 1000, 'es', 'system'), ('la', 990, 'es', 'system'), ('que', 980, 'es', 'system'),
('el', 970, 'es', 'system'), ('en', 960, 'es', 'system'), ('y', 950, 'es', 'system'),
('a', 940, 'es', 'system'), ('los', 930, 'es', 'system'), ('se', 920, 'es', 'system'),
('del', 910, 'es', 'system'), ('las', 900, 'es', 'system'), ('un', 890, 'es', 'system'),
('por', 880, 'es', 'system'), ('con', 870, 'es', 'system'), ('no', 860, 'es', 'system'),
('una', 850, 'es', 'system'), ('su', 840, 'es', 'system'), ('para', 830, 'es', 'system'),
('es', 820, 'es', 'system'), ('al', 810, 'es', 'system'), ('lo', 800, 'es', 'system'),
('como', 790, 'es', 'system'), ('mas', 780, 'es', 'system'), ('pero', 770, 'es', 'system'),
('sus', 760, 'es', 'system'), ('le', 750, 'es', 'system'), ('ya', 740, 'es', 'system'),
('o', 730, 'es', 'system'), ('este', 720, 'es', 'system'), ('si', 710, 'es', 'system'),
('porque', 700, 'es', 'system'), ('esta', 690, 'es', 'system'), ('entre', 680, 'es', 'system'),
('cuando', 670, 'es', 'system'), ('muy', 660, 'es', 'system'), ('sin', 650, 'es', 'system'),
('sobre', 640, 'es', 'system'), ('tambien', 630, 'es', 'system'), ('me', 620, 'es', 'system'),
('hasta', 610, 'es', 'system'), ('hay', 600, 'es', 'system'), ('donde', 590, 'es', 'system'),
('quien', 580, 'es', 'system'), ('todo', 570, 'es', 'system'), ('bien', 560, 'es', 'system'),
('ella', 550, 'es', 'system'), ('estar', 540, 'es', 'system'), ('hacer', 520, 'es', 'system'),
('tener', 510, 'es', 'system'), ('haber', 500, 'es', 'system'), ('poder', 490, 'es', 'system'),
('decir', 480, 'es', 'system'), ('ir', 470, 'es', 'system'), ('ver', 460, 'es', 'system'),
('dar', 450, 'es', 'system'), ('saber', 440, 'es', 'system'), ('querer', 430, 'es', 'system'),
('gustar', 420, 'es', 'system'), ('jugar', 410, 'es', 'system'), ('comer', 400, 'es', 'system'),
('beber', 390, 'es', 'system'), ('dormir', 380, 'es', 'system'), ('leer', 370, 'es', 'system'),
('escribir', 360, 'es', 'system'), ('pensar', 350, 'es', 'system'), ('casa', 340, 'es', 'system'),
('agua', 330, 'es', 'system'), ('comida', 320, 'es', 'system'), ('amigo', 310, 'es', 'system'),
('familia', 300, 'es', 'system'), ('escuela', 290, 'es', 'system'), ('libro', 280, 'es', 'system'),
('mesa', 270, 'es', 'system'), ('silla', 260, 'es', 'system'), ('perro', 250, 'es', 'system'),
('gato', 240, 'es', 'system'), ('sol', 230, 'es', 'system'), ('luna', 220, 'es', 'system'),
('flor', 210, 'es', 'system'), ('arbol', 200, 'es', 'system'), ('cielo', 190, 'es', 'system'),
('tierra', 180, 'es', 'system'), ('mar', 170, 'es', 'system'), ('fuego', 160, 'es', 'system'),
('viento', 150, 'es', 'system'), ('grande', 140, 'es', 'system'), ('pequeno', 130, 'es', 'system'),
('bueno', 120, 'es', 'system'), ('malo', 110, 'es', 'system'), ('feliz', 100, 'es', 'system'),
('triste', 90, 'es', 'system'), ('rapido', 80, 'es', 'system'), ('lento', 70, 'es', 'system'),
('ayer', 60, 'es', 'system'), ('hoy', 50, 'es', 'system'), ('manana', 60, 'es', 'system'),
('noche', 55, 'es', 'system'), ('dia', 58, 'es', 'system'), ('semana', 52, 'es', 'system'),
('ano', 54, 'es', 'system'), ('tiempo', 56, 'es', 'system'), ('nombre', 48, 'es', 'system'),
('cosa', 46, 'es', 'system'), ('mundo', 44, 'es', 'system'), ('vida', 50, 'es', 'system'),
('mano', 42, 'es', 'system'), ('ojo', 40, 'es', 'system'), ('cabeza', 38, 'es', 'system'),
('corazon', 36, 'es', 'system'), ('siempre', 45, 'es', 'system'), ('nunca', 43, 'es', 'system'),
('ahora', 47, 'es', 'system'), ('despues', 41, 'es', 'system'), ('antes', 39, 'es', 'system'),
('luego', 37, 'es', 'system'), ('entonces', 35, 'es', 'system'), ('quizas', 33, 'es', 'system'),
('cada', 34, 'es', 'system'), ('tanto', 32, 'es', 'system'), ('mismo', 38, 'es', 'system'),
('otro', 36, 'es', 'system'), ('poco', 34, 'es', 'system'), ('mucho', 40, 'es', 'system'),
('algo', 32, 'es', 'system'), ('nada', 30, 'es', 'system'), ('alguien', 28, 'es', 'system'),
('nadie', 26, 'es', 'system'), ('cualquier', 24, 'es', 'system'), ('varios', 22, 'es', 'system'),
('ademas', 30, 'es', 'system'), ('durante', 28, 'es', 'system'), ('mediante', 20, 'es', 'system'),
('segun', 26, 'es', 'system'), ('contra', 24, 'es', 'system'), ('hacia', 28, 'es', 'system'),
('tras', 22, 'es', 'system'), ('salvo', 18, 'es', 'system'), ('incluso', 20, 'es', 'system'),
('excepto', 16, 'es', 'system'), ('gracias', 50, 'es', 'system'), ('hola', 45, 'es', 'system'),
('adios', 40, 'es', 'system'), ('perdon', 30, 'es', 'system'), ('salud', 25, 'es', 'system'),
('tengo', 200, 'es', 'system'), ('tienes', 150, 'es', 'system'), ('quiere', 120, 'es', 'system'),
('quiero', 130, 'es', 'system'), ('puedo', 110, 'es', 'system'), ('puedes', 100, 'es', 'system'),
('vamos', 90, 'es', 'system'), ('ven', 80, 'es', 'system'), ('mira', 70, 'es', 'system'),
('escucha', 50, 'es', 'system'), ('bebe', 40, 'es', 'system'), ('come', 38, 'es', 'system'),
('duerme', 30, 'es', 'system'), ('juega', 35, 'es', 'system'), ('corre', 28, 'es', 'system'),
('salta', 22, 'es', 'system'), ('sientate', 25, 'es', 'system'), ('levantate', 20, 'es', 'system'),
('espera', 30, 'es', 'system'), ('sigue', 24, 'es', 'system'), ('repite', 20, 'es', 'system'),
('dime', 30, 'es', 'system'), ('bano', 45, 'es', 'system'), ('cama', 40, 'es', 'system'),
('cocina', 35, 'es', 'system'), ('sala', 28, 'es', 'system'), ('puerta', 30, 'es', 'system'),
('ventana', 25, 'es', 'system'), ('techo', 18, 'es', 'system'), ('suelo', 16, 'es', 'system'),
('contento', 22, 'es', 'system'), ('enfermo', 18, 'es', 'system'), ('cansado', 20, 'es', 'system'),
('aburrido', 15, 'es', 'system'), ('asustado', 14, 'es', 'system'), ('sorprendido', 12, 'es', 'system'),
('caliente', 16, 'es', 'system'), ('frio', 20, 'es', 'system'), ('hambriento', 15, 'es', 'system'),
('sediento', 12, 'es', 'system'), ('limpio', 14, 'es', 'system'), ('sucio', 12, 'es', 'system'),
('mojado', 10, 'es', 'system'), ('seco', 10, 'es', 'system'), ('abierto', 12, 'es', 'system'),
('cerrado', 14, 'es', 'system'), ('encendido', 8, 'es', 'system'), ('apagado', 8, 'es', 'system'),
('fuerte', 12, 'es', 'system'), ('debil', 8, 'es', 'system'), ('bonito', 14, 'es', 'system'),
('feo', 10, 'es', 'system'), ('nuevo', 16, 'es', 'system'), ('viejo', 14, 'es', 'system'),
('joven', 12, 'es', 'system'), ('alto', 14, 'es', 'system'), ('bajo', 12, 'es', 'system'),
('gordo', 8, 'es', 'system'), ('delgado', 8, 'es', 'system'), ('guapo', 10, 'es', 'system'),
('amable', 10, 'es', 'system'), ('simpatico', 8, 'es', 'system'), ('serio', 8, 'es', 'system'),
('divertido', 12, 'es', 'system'), ('timido', 8, 'es', 'system'), ('valiente', 6, 'es', 'system'),
('profesor', 12, 'es', 'system'), ('medico', 10, 'es', 'system'), ('enfermero', 8, 'es', 'system'),
('policia', 8, 'es', 'system'), ('bombero', 6, 'es', 'system'), ('camionero', 4, 'es', 'system'),
('cocinero', 6, 'es', 'system'), ('cantante', 6, 'es', 'system'), ('pintor', 4, 'es', 'system'),
('musico', 6, 'es', 'system'), ('escritor', 4, 'es', 'system'), ('doctor', 8, 'es', 'system'),
('rojo', 20, 'es', 'system'), ('azul', 18, 'es', 'system'), ('verde', 18, 'es', 'system'),
('amarillo', 14, 'es', 'system'), ('naranja', 12, 'es', 'system'), ('morado', 10, 'es', 'system'),
('rosa', 14, 'es', 'system'), ('negro', 16, 'es', 'system'), ('blanco', 16, 'es', 'system'),
('gris', 12, 'es', 'system'), ('marron', 10, 'es', 'system'), ('color', 20, 'es', 'system'),
('uno', 30, 'es', 'system'), ('dos', 28, 'es', 'system'), ('tres', 26, 'es', 'system'),
('cuatro', 24, 'es', 'system'), ('cinco', 22, 'es', 'system'), ('seis', 20, 'es', 'system'),
('siete', 18, 'es', 'system'), ('ocho', 16, 'es', 'system'), ('nueve', 14, 'es', 'system'),
('diez', 16, 'es', 'system'), ('lunes', 14, 'es', 'system'), ('martes', 12, 'es', 'system'),
('miercoles', 10, 'es', 'system'), ('jueves', 10, 'es', 'system'), ('viernes', 12, 'es', 'system'),
('sabado', 14, 'es', 'system'), ('domingo', 12, 'es', 'system'), ('enero', 8, 'es', 'system'),
('febrero', 6, 'es', 'system'), ('marzo', 8, 'es', 'system'), ('abril', 6, 'es', 'system'),
('mayo', 8, 'es', 'system'), ('junio', 6, 'es', 'system'), ('julio', 8, 'es', 'system'),
('agosto', 6, 'es', 'system'), ('septiembre', 4, 'es', 'system'), ('octubre', 4, 'es', 'system'),
('noviembre', 4, 'es', 'system'), ('diciembre', 6, 'es', 'system'), ('primavera', 6, 'es', 'system'),
('verano', 8, 'es', 'system'), ('otono', 6, 'es', 'system'), ('invierno', 8, 'es', 'system'),
('izquierda', 10, 'es', 'system'), ('derecha', 14, 'es', 'system'), ('arriba', 12, 'es', 'system'),
('abajo', 12, 'es', 'system'), ('dentro', 10, 'es', 'system'), ('fuera', 12, 'es', 'system'),
('cerca', 10, 'es', 'system'), ('lejos', 8, 'es', 'system'), ('encima', 8, 'es', 'system'),
('debajo', 8, 'es', 'system'), ('delante', 8, 'es', 'system'), ('detras', 8, 'es', 'system'),
('lado', 10, 'es', 'system');
