// Process SS-GEN dataset → Supabase migration SQL
// Usage: node scripts/process-ssgen.mjs [limit]
// Reads from TEMP\tea-ssgen\*.jsonl, outputs to TEMP\tea-ssgen\output.sql

import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

const INPUT = path.join(process.env.TEMP || '/tmp', 'tea-ssgen', 'refined_gpt4story_all_5085_from_gpt4titles_sft.jsonl');
const OUTPUT = path.join(process.env.TEMP || '/tmp', 'tea-ssgen', 'output.sql');

const CATEGORIES = {
  daily:    { colors: ['from-sky-100', 'to-blue-50'],     label: 'Rutinas diarias' },
  medical:  { colors: ['from-teal-100', 'to-emerald-50'], label: 'Salud y médico' },
  social:   { colors: ['from-pink-100', 'to-rose-50'],    label: 'Habilidades sociales' },
  emotions: { colors: ['from-red-100', 'to-orange-50'],   label: 'Emociones' },
  school:   { colors: ['from-yellow-100', 'to-amber-50'], label: 'Escuela' },
  community:{ colors: ['from-green-100', 'to-teal-50'],   label: 'Comunidad' },
};

// Chapter → category
const CAT_MAP = {
  'personal hygiene': 'daily', 'health and hygiene': 'daily', 'healthy habits': 'daily',
  'nutrition and eating habits': 'daily', 'Self care': 'daily', 'time management': 'daily',
  'understanding schedules and routines': 'daily', 'playtime': 'daily',
  'exploring hobbies and interests': 'daily',
  'safety first': 'medical', 'safety rules': 'medical',
  'Bullying: What to Think, Say, and Do': 'social',
  'empathy': 'social', 'empathy and understanding others': 'social', 'emotions and empathy': 'social',
  'friendship': 'social', 'friendship building': 'social', 'People Skills and Friendship': 'social',
  'making friends': 'social', 'teamwork': 'social', 'teamwork and cooperation': 'social',
  'communication skills': 'social', 'communicating effectively': 'social',
  'conflict resolution': 'social', 'non-verbal communication': 'social',
  'understanding non-verbal cues': 'social', 'personal space and boundaries': 'social',
  'understanding personal space': 'social', 'digital etiquette': 'social',
  'digital world': 'social', 'technology and media': 'social',
  'Celebrations and Gifts': 'social', 'celebrations and events': 'social',
  'celebrations and holidays': 'social', 'celebrations and traditions': 'social',
  'family dynamics': 'social', 'family relationships': 'social',
  'family roles and responsibilities': 'social', 'Home': 'social',
  'respecting differences': 'social', 'handling criticism and feedback': 'social',
  'emotions': 'emotions', 'emotions and feelings': 'emotions', 'Feelings': 'emotions',
  'understanding feelings': 'emotions', 'understanding emotions': 'emotions',
  'understanding emotions of others': 'emotions', 'emotion management': 'emotions',
  'emotional regulation': 'emotions', 'emotional intelligence': 'emotions',
  'coping with change': 'emotions', 'dealing with change': 'emotions',
  'embracing change': 'emotions', 'managing change': 'emotions',
  'Change': 'emotions', 'Mistakes': 'emotions',
  'School': 'school', 'school life': 'school', 'Learning with stories': 'school',
  'understanding instructions': 'school', 'Understanding Adults': 'school',
  'public behavior': 'community', 'public spaces': 'community',
  'community interaction': 'community', 'Community': 'community',
  'Planet Earth': 'community', 'the world of work': 'community',
  'physical activities and sports': 'community', 'problem solving': 'community',
  'Social stories for young children': 'daily',
};

// English → Spanish keyword for ARASAAC
const KW = {
  'happy': 'feliz', 'happiness': 'alegria', 'joy': 'alegria',
  'sad': 'triste', 'sadness': 'triste', 'angry': 'enfadado', 'anger': 'enfadado',
  'scared': 'miedo', 'fear': 'miedo', 'afraid': 'miedo',
  'calm': 'tranquilo', 'relax': 'tranquilo', 'peaceful': 'tranquilo',
  'frustrated': 'frustrado', 'frustration': 'frustrado',
  'worried': 'preocupado', 'worry': 'preocupado', 'anxious': 'ansiedad',
  'surprised': 'sorpresa', 'surprise': 'sorpresa',
  'excited': 'emocionado', 'excitement': 'emocion',
  'proud': 'orgulloso', 'pride': 'orgullo',
  'lonely': 'solo', 'alone': 'solo',
  'friend': 'amigo', 'friends': 'amigos', 'friendship': 'amistad',
  'family': 'familia', 'parents': 'padres', 'mother': 'madre', 'father': 'padre',
  'sister': 'hermana', 'brother': 'hermano', 'sibling': 'hermano',
  'teacher': 'maestro', 'school': 'escuela', 'class': 'clase',
  'help': 'ayuda', 'share': 'compartir', 'sharing': 'compartir',
  'wait': 'esperar', 'waiting': 'esperar',
  'turn': 'turno', 'learn': 'aprender', 'learning': 'aprender',
  'study': 'estudiar', 'read': 'leer', 'reading': 'leer',
  'book': 'libro', 'books': 'libro', 'write': 'escribir',
  'homework': 'deberes', 'play': 'jugar', 'playing': 'jugar',
  'game': 'juego', 'games': 'juegos', 'toy': 'juguete', 'toys': 'juguetes',
  'eat': 'comer', 'eating': 'comer', 'food': 'comida', 'meal': 'comida',
  'breakfast': 'desayuno', 'lunch': 'comida', 'dinner': 'cena',
  'snack': 'merienda', 'fruit': 'fruta', 'vegetables': 'verduras',
  'drink': 'beber', 'water': 'agua', 'milk': 'leche',
  'bathroom': 'bano', 'toilet': 'bano', 'potty': 'bano',
  'wash': 'lavarse', 'washing': 'lavarse', 'clean': 'limpiar',
  'hand': 'mano', 'hands': 'manos', 'brush': 'cepillarse',
  'teeth': 'dientes', 'bed': 'cama', 'sleep': 'dormir',
  'night': 'noche', 'bedtime': 'dormir', 'pajama': 'pijama',
  'dress': 'vestirse', 'clothes': 'ropa', 'shoes': 'zapatos',
  'backpack': 'mochila', 'bag': 'bolsa',
  'doctor': 'medico', 'check': 'revision', 'medicine': 'medicina',
  'dentist': 'dentista', 'hospital': 'hospital',
  'pain': 'dolor', 'sick': 'enfermo', 'ill': 'enfermo',
  'exercise': 'ejercicio', 'sport': 'deporte', 'sports': 'deporte',
  'park': 'parque', 'playground': 'columpio',
  'beach': 'playa', 'pool': 'piscina', 'swim': 'nadar', 'swimming': 'nadar',
  'walk': 'caminar', 'walking': 'caminar', 'run': 'correr',
  'bike': 'bicicleta', 'bicycle': 'bicicleta',
  'car': 'coche', 'bus': 'autobus', 'train': 'tren', 'plane': 'avion',
  'travel': 'viaje', 'trip': 'viaje', 'vacation': 'vacaciones',
  'holiday': 'vacaciones', 'store': 'tienda', 'shop': 'tienda',
  'shopping': 'compras', 'market': 'mercado', 'supermarket': 'supermercado',
  'money': 'dinero', 'pay': 'pagar', 'restaurant': 'restaurante',
  'party': 'fiesta', 'birthday': 'cumpleanos', 'celebrate': 'celebrar',
  'celebration': 'celebracion', 'gift': 'regalo', 'present': 'regalo',
  'cake': 'pastel', 'song': 'cancion', 'sing': 'cantar', 'music': 'musica',
  'listen': 'escuchar', 'hear': 'escuchar',
  'talk': 'hablar', 'speak': 'hablar', 'say': 'decir', 'tell': 'decir',
  'hello': 'saludar', 'hi': 'saludar', 'greet': 'saludar',
  'goodbye': 'despedirse', 'bye': 'despedirse',
  'please': 'porfavor', 'thank': 'gracias', 'thanks': 'gracias',
  'sorry': 'perdon', 'apologize': 'disculparse',
  'sit': 'sentarse', 'stand': 'levantarse',
  'stop': 'parar', 'go': 'ir', 'come': 'venir',
  'rule': 'norma', 'rules': 'normas',
  'patient': 'paciencia', 'patience': 'paciencia',
  'try': 'intentar', 'attempt': 'intentar',
  'think': 'pensar', 'understand': 'entender', 'remember': 'recordar',
  'forget': 'olvidar', 'choice': 'elegir', 'choose': 'elegir',
  'decide': 'decidir', 'different': 'diferente', 'same': 'igual',
  'good': 'bien', 'bad': 'mal', 'kind': 'amable', 'nice': 'amable',
  'respect': 'respetar', 'respectful': 'respeto',
  'body': 'cuerpo', 'head': 'cabeza', 'face': 'cara',
  'eye': 'ojo', 'eyes': 'ojos', 'ear': 'oido', 'ears': 'oidos',
  'mouth': 'boca', 'nose': 'nariz',
  'heart': 'corazon', 'breathe': 'respirar', 'breath': 'respiracion',
  'hug': 'abrazo', 'kiss': 'beso',
  'draw': 'dibujar', 'drawing': 'dibujo', 'picture': 'dibujo',
  'color': 'color', 'colors': 'colores', 'paint': 'pintar',
  'computer': 'ordenador', 'phone': 'telefono', 'tablet': 'tablet',
  'tv': 'television', 'video': 'video',
  'sun': 'sol', 'moon': 'luna', 'star': 'estrella',
  'rain': 'lluvia', 'snow': 'nieve', 'wind': 'viento',
  'tree': 'arbol', 'flower': 'flor', 'garden': 'jardin',
  'animal': 'animal', 'dog': 'perro', 'cat': 'gato',
  'bird': 'pajaro', 'outside': 'fuera', 'inside': 'dentro',
  'new': 'nuevo', 'routine': 'rutina', 'schedule': 'horario',
  'morning': 'manana', 'afternoon': 'tarde', 'evening': 'tarde',
  'today': 'hoy', 'tomorrow': 'manana', 'yesterday': 'ayer',
  'week': 'semana', 'month': 'mes', 'year': 'ano',
  'number': 'numero', 'count': 'contar',
  'street': 'calle', 'cross': 'cruzar', 'crosswalk': 'paso peatones',
  'traffic': 'semaforo', 'bedroom': 'dormitorio', 'kitchen': 'cocina',
  'door': 'puerta', 'window': 'ventana',
  'chair': 'silla', 'table': 'mesa',
  'group': 'grupo', 'team': 'equipo',
  'noise': 'ruido', 'loud': 'ruidoso', 'quiet': 'silencio',
  'practice': 'practicar', 'ready': 'listo',
  'finish': 'terminar', 'complete': 'completar',
  'start': 'empezar', 'begin': 'empezar',
  'open': 'abrir', 'close': 'cerrar',
  'give': 'dar', 'receive': 'recibir',
  'look': 'mirar', 'see': 'ver', 'watch': 'mirar',
  'feel': 'sentir', 'feeling': 'sentimiento', 'feelings': 'sentimientos',
  'need': 'necesitar', 'want': 'querer', 'like': 'gustar',
  'know': 'saber', 'believe': 'creer',
  'should': 'deber', 'must': 'deber',
  'all': 'todo', 'some': 'algunos', 'many': 'muchos',
  'people': 'personas', 'person': 'persona',
  'child': 'nino', 'children': 'ninos',
  'adult': 'adulto', 'world': 'mundo', 'earth': 'tierra',
  'nature': 'naturaleza', 'plant': 'planta',
  'sky': 'cielo', 'cloud': 'nube',
  'bullying': 'acoso', 'bully': 'acosador',
  'safe': 'seguro', 'safety': 'seguridad',
  'protect': 'proteger', 'protection': 'proteccion',
  'stranger': 'extrano', 'polite': 'educado',
  'manners': 'modales', 'responsible': 'responsable',
  'responsibility': 'responsabilidad', 'independent': 'independiente',
  'mistake': 'error', 'mistakes': 'errores',
  'boundary': 'limite', 'boundaries': 'limites',
  'personal space': 'espacio personal',
  'pay attention': 'atencion', 'instruction': 'instrucciones',
  'instructions': 'instrucciones', 'directions': 'instrucciones',
  'include': 'incluir', 'inclusion': 'inclusion',
  'work': 'trabajar', 'job': 'trabajo',
  'cook': 'cocinar', 'build': 'construir',
  'move': 'mover', 'change': 'cambio',
  'problem': 'problema', 'solution': 'solucion',
  'question': 'pregunta', 'answer': 'respuesta',
  'important': 'importante', 'special': 'especial',
  'fun': 'divertido', 'hard': 'dificil', 'easy': 'facil',
  'right': 'correcto', 'wrong': 'incorrecto',
  'everyone': 'todos', 'everybody': 'todos',
  'someone': 'alguien', 'always': 'siempre',
  'never': 'nunca', 'sometimes': 'a veces',
  'much': 'mucho', 'more': 'mas', 'less': 'menos',
  'other': 'otro', 'another': 'otro',
  'own': 'propio', 'very': 'muy',
  'well': 'bien', 'fine': 'bien',
  'way': 'forma', 'thing': 'cosa', 'things': 'cosas',
  'place': 'lugar', 'time': 'tiempo',
  'day': 'dia', 'days': 'dias',
  'home': 'casa', 'house': 'casa',
};

// Keyword → emoji
function pageEmoji(keyword) {
  const map = {
    'feliz': '😊', 'alegria': '🎉', 'triste': '😢', 'enfadado': '😤',
    'frustrado': '😤', 'miedo': '😨', 'tranquilo': '🧘', 'respiracion': '🫁',
    'respirar': '🫁', 'sorpresa': '😮', 'emocion': '🤩', 'emocionado': '🤩',
    'preocupado': '😟', 'ansiedad': '😰', 'orgulloso': '🏆', 'orgullo': '🏆',
    'solo': '🧍', 'amigo': '🤝', 'amigos': '🤝', 'amistad': '🤝',
    'familia': '👨‍👩‍👧‍👦', 'padres': '👨‍👩‍👧', 'madre': '👩', 'padre': '👨',
    'hermana': '👧', 'hermano': '👦', 'hermanos': '👫',
    'maestro': '👩‍🏫', 'escuela': '🏫', 'clase': '📚',
    'ayuda': '🆘', 'compartir': '🤲',
    'esperar': '⏳', 'turno': '🔄', 'aprender': '📖',
    'estudiar': '📝', 'leer': '📖', 'libro': '📚',
    'escribir': '✏️', 'deberes': '📋',
    'jugar': '🎮', 'juego': '🎲', 'juegos': '🎲', 'juguete': '🧸', 'juguetes': '🧸',
    'comer': '🍽️', 'comida': '🍽️', 'desayuno': '🌅', 'cena': '🍽️',
    'merienda': '🍎', 'fruta': '🍎', 'verduras': '🥦',
    'beber': '🥤', 'agua': '💧', 'leche': '🥛',
    'bano': '🚽', 'lavarse': '🧼', 'limpiar': '🧹',
    'mano': '🤚', 'manos': '🤚', 'cepillarse': '🪥', 'dientes': '🦷',
    'cama': '🛏️', 'dormir': '🌙', 'noche': '🌙', 'pijama': '😴',
    'vestirse': '👕', 'ropa': '👗', 'zapatos': '👟',
    'mochila': '🎒', 'bolsa': '🛍️',
    'medico': '🩺', 'revision': '🔍', 'medicina': '💊',
    'dentista': '🦷', 'hospital': '🏥',
    'dolor': '🤕', 'enfermo': '🤒',
    'ejercicio': '🏋️', 'deporte': '⚽',
    'parque': '🌳', 'columpio': '🎠',
    'playa': '🏖️', 'piscina': '🏊', 'nadar': '🏊',
    'caminar': '🚶', 'correr': '🏃',
    'bicicleta': '🚲',
    'coche': '🚗', 'autobus': '🚌', 'tren': '🚂', 'avion': '✈️',
    'viaje': '🧳', 'vacaciones': '🏖️',
    'tienda': '🏪', 'compras': '🛒', 'mercado': '🏪',
    'supermercado': '🛒', 'dinero': '💰', 'pagar': '💳',
    'restaurante': '🍴',
    'fiesta': '🎉', 'cumpleanos': '🎂', 'celebrar': '🎊',
    'celebracion': '🎊', 'regalo': '🎁', 'pastel': '🎂',
    'cancion': '🎵', 'cantar': '🎤', 'musica': '🎵',
    'escuchar': '👂', 'hablar': '🗣️', 'decir': '💬',
    'saludar': '👋', 'despedirse': '👋',
    'porfavor': '🙏', 'gracias': '🙏',
    'perdon': '😔', 'disculparse': '😔',
    'sentarse': '🪑', 'levantarse': '🧍',
    'parar': '✋', 'ir': '🚶', 'venir': '🚶',
    'norma': '📋', 'normas': '📋',
    'paciencia': '🧘',
    'intentar': '💪',
    'pensar': '🤔', 'entender': '🧠', 'recordar': '📝',
    'olvidar': '😕', 'elegir': '✅', 'decidir': '✅',
    'diferente': '🌈', 'igual': '➡️',
    'bien': '👍', 'mal': '👎', 'amable': '💝',
    'respetar': '🙇', 'respeto': '🙇',
    'cuerpo': '🧍', 'cabeza': '🗣️', 'cara': '😐',
    'ojos': '👀', 'oido': '👂', 'oidos': '👂',
    'boca': '👄', 'nariz': '👃',
    'corazon': '❤️', 'abrazo': '🤗', 'beso': '💋',
    'dibujo': '🎨', 'dibujar': '🎨', 'colores': '🌈',
    'pintar': '🎨', 'ordenador': '💻', 'telefono': '📱',
    'tablet': '📱', 'television': '📺', 'video': '🎬',
    'sol': '☀️', 'luna': '🌙', 'estrella': '⭐',
    'lluvia': '🌧️', 'nieve': '❄️', 'viento': '💨',
    'arbol': '🌳', 'flor': '🌸', 'jardin': '🌻',
    'animal': '🐾', 'perro': '🐕', 'gato': '🐈',
    'pajaro': '🐦',
    'fuera': '🌳', 'dentro': '🏠',
    'nuevo': '🆕', 'rutina': '🔄', 'horario': '📅',
    'semana': '📅', 'mes': '📅',
    'calle': '🏙️', 'cruzar': '🚶', 'paso peatones': '🚦',
    'semaforo': '🚦',
    'cocina': '🍳', 'cocinar': '🍳',
    'puerta': '🚪', 'ventana': '🪟',
    'silla': '🪑', 'mesa': '🪑',
    'grupo': '👥', 'equipo': '👥',
    'ruido': '🔊', 'silencio': '🔇', 'ruidoso': '🔊',
    'practicar': '🎯', 'listo': '✅',
    'terminar': '✅', 'completar': '✅',
    'empezar': '🏁',
    'abrir': '🔓', 'cerrar': '🔒',
    'dar': '🎁', 'recibir': '📥',
    'mirar': '👀', 'ver': '👀',
    'sentir': '💓', 'sentimiento': '💗', 'sentimientos': '💗',
    'necesitar': '❗', 'querer': '💕', 'gustar': '👍',
    'saber': '🧠', 'creer': '💭',
    'deber': '📋',
    'todo': '🌐', 'todos': '🌐',
    'personas': '👥', 'persona': '🧑',
    'nino': '👦', 'ninos': '👧',
    'adulto': '🧑',
    'mundo': '🌍', 'tierra': '🌍',
    'naturaleza': '🌿', 'planta': '🌱',
    'cielo': '☁️', 'nube': '☁️',
    'acoso': '🚫', 'acosador': '🚫',
    'seguro': '🛡️', 'seguridad': '🛡️',
    'proteger': '🛡️', 'proteccion': '🛡️',
    'extrano': '🙅',
    'educado': '🎩', 'modales': '🎩',
    'responsable': '⭐', 'responsabilidad': '⭐',
    'independiente': '🦸',
    'error': '💪', 'errores': '💪',
    'limite': '🚧', 'limites': '🚧',
    'espacio personal': '↔️',
    'atencion': '📢', 'instrucciones': '📋',
    'incluir': '🤗', 'inclusion': '🤗',
    'trabajar': '💼', 'trabajo': '💼',
    'construir': '🔨',
    'mover': '🏃', 'cambio': '🔄',
    'problema': '❓', 'solucion': '💡',
    'pregunta': '❓', 'respuesta': '💬',
    'importante': '❗', 'especial': '⭐',
    'divertido': '😄', 'dificil': '😰', 'facil': '😊',
    'correcto': '✅', 'incorrecto': '❌',
    'siempre': '♾️', 'nunca': '🚫',
    'a veces': '⏳',
    'mucho': '📈', 'mas': '➕', 'menos': '➖',
    'otro': '🔄',
    'muy': '💯', 'bien': '👍',
    'forma': '📐', 'cosa': '📦', 'cosas': '📦',
    'lugar': '📍', 'tiempo': '⏰',
    'dia': '☀️', 'dias': '📅',
    'casa': '🏠',
    'amor': '❤️', 'confianza': '🤝',
    'escuchar': '👂',
  };
  return map[keyword] || '✨';
}

// Chapter → story emoji
function storyEmoji(chapter) {
  const c = chapter.toLowerCase();
  if (c.includes('hygiene') || c.includes('health') || c.includes('self care')) return '🧼';
  if (c.includes('nutrition') || c.includes('eating')) return '🍎';
  if (c.includes('safety')) return '🛡️';
  if (c.includes('bullying')) return '🤝';
  if (c.includes('empathy')) return '💗';
  if (c.includes('friendship') || c.includes('friend')) return '🤝';
  if (c.includes('teamwork')) return '👥';
  if (c.includes('communication') || c.includes('talk')) return '🗣️';
  if (c.includes('conflict') || c.includes('criticism')) return '💬';
  if (c.includes('emotion') || c.includes('feel')) return '💖';
  if (c.includes('change') || c.includes('coping') || c.includes('dealing') || c.includes('managing')) return '🔄';
  if (c.includes('mistakes')) return '💪';
  if (c.includes('school') || c.includes('learning') || c.includes('instruction')) return '📚';
  if (c.includes('family') || c.includes('home')) return '👨‍👩‍👧‍👦';
  if (c.includes('public') || c.includes('community') || c.includes('planet') || c.includes('earth')) return '🏙️';
  if (c.includes('digital') || c.includes('technology') || c.includes('media')) return '💻';
  if (c.includes('time') || c.includes('schedule') || c.includes('routine')) return '⏰';
  if (c.includes('play') || c.includes('hobbies') || c.includes('activity')) return '🎮';
  if (c.includes('respect') || c.includes('difference')) return '🌈';
  if (c.includes('work') || c.includes('job')) return '💼';
  if (c.includes('boundar') || c.includes('space')) return '↔️';
  if (c.includes('social stories for young children')) return '📖';
  if (c.includes('celebration') || c.includes('gift') || c.includes('holiday')) return '🎉';
  if (c.includes('non-verbal') || c.includes('personal space')) return '🤫';
  if (c.includes('problem solving')) return '🧩';
  return '📖';
}

function getKw(text) {
  const lower = text.toLowerCase();
  // Multi-word phrases
  if (lower.includes('personal space') || lower.includes('personal boundaries')) return 'espacio personal';
  if (lower.includes('pay attention')) return 'atencion';
  if (lower.includes('brush your') || lower.includes('brush my') || lower.includes('toothbrush')) return 'cepillarse';
  if (lower.includes('traffic light') || lower.includes('cross the street') || lower.includes('crosswalk')) return 'semaforo';
  if (lower.includes('calm down') || lower.includes('deep breath') || lower.includes('take a breath')) return 'respirar';
  if (lower.includes('wash my') || lower.includes('wash your') || lower.includes('hand washing')) return 'lavarse';
  if (lower.includes('get dressed') || lower.includes('put on') || lower.includes('get ready')) return 'vestirse';
  if (lower.includes('thank you')) return 'gracias';
  if (lower.includes('say goodbye') || lower.includes('say bye')) return 'despedirse';
  if (lower.includes('ask for help')) return 'ayuda';
  if (lower.includes('take turns') || lower.includes('wait for')) return 'esperar';
  if (lower.includes('make a mistake') || lower.includes('made a mistake')) return 'error';
  if (lower.includes('listen to') || lower.includes('listen carefully')) return 'escuchar';
  if (lower.includes('follow') && (lower.includes('direction') || lower.includes('instruction') || lower.includes('rule'))) return 'instrucciones';
  if (lower.includes('ride the') || lower.includes('riding')) return 'montar';
  
  const words = lower.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  for (const w of words) {
    if (KW[w]) return KW[w];
  }
  return 'feliz';
}

const storyColor = (cat) => CATEGORIES[cat].colors.join(' ');

function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  return "'" + String(val).replace(/'/g, "''") + "'";
}

// Generate deterministic UUID from numeric story ID
function storyUuid(id) {
  const h = createHash('md5').update('ss-gen-' + id).digest('hex');
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20,32)}`;
}

// Main
const LIMIT = parseInt(process.argv[2]) || data.length;
let data = fs.readFileSync(INPUT, 'utf-8').trim().split('\n').map(l => JSON.parse(l));
if (LIMIT > 0) data = data.slice(0, LIMIT);
console.log(`Loaded ${data.length} stories${LIMIT > 0 ? ` (limited to ${LIMIT})` : ''}`);

const seenSlugs = new Set();
const stories = [];
let skipped = 0;

for (const s of data) {
  try {
    const category = CAT_MAP[s.chapter] || 'daily';
    let slug = s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
    if (!slug) slug = 'story-' + s.id;
    if (seenSlugs.has(slug)) slug = slug + '-' + s.id;
    seenSlugs.add(slug);

    let paragraphs = s.story_content.split(/\n/).map(p => p.trim()).filter(Boolean);
    if (paragraphs.length === 0) { skipped++; continue; }
    
    // Merge very short consecutive paragraphs (single-line splits)
    if (paragraphs.length > 8) {
      const merged = [];
      for (const p of paragraphs) {
        if (merged.length && (merged[merged.length - 1].length + p.length < 100)) {
          merged[merged.length - 1] += ' ' + p;
        } else {
          merged.push(p);
        }
      }
      paragraphs = merged;
    }

    const pages = paragraphs.map((t, i) => {
      const kw = getKw(t);
      return { text: t, keyword: kw, emoji: pageEmoji(kw), pageNumber: i + 1 };
    });

    stories.push({
      id: s.id,
      uuid: storyUuid(s.id),
      title: s.title,
      slug,
      emoji: storyEmoji(s.chapter),
      category,
      color: storyColor(category),
      description: `Historia: "${s.title}" — ${s.explanation.slice(0, 120)}`,
      pages,
    });
  } catch (e) {
    console.error(`Skip ${s.id}: ${e.message}`);
    skipped++;
  }
}

console.log(`Processed ${stories.length} stories (skipped ${skipped})`);
console.log(`Total pages: ${stories.reduce((a, s) => a + s.pages.length, 0)}`);

// Generate SQL
let sql = `-- SS-GEN Social Stories seed data
-- ${stories.length} stories, ${stories.reduce((a, s) => a + s.pages.length, 0)} pages
-- Generated ${new Date().toISOString()}
-- Source: https://github.com/MIMIFY/SS-GEN

`;

// Stories in batches of 100
const BATCH = 100;
for (let i = 0; i < stories.length; i += BATCH) {
  const batch = stories.slice(i, i + BATCH);
  sql += `-- Batch ${Math.floor(i / BATCH) + 1} (stories ${i + 1}-${i + batch.length})
INSERT INTO social_stories (id, slug, title, emoji, category, color, description, sort_order, is_public) VALUES\n`;
  sql += batch.map((s, j) => {
    const sort = i + j + 23;
    return `  (${esc(s.uuid)}, ${esc(s.slug)}, ${esc(s.title)}, ${esc(s.emoji)}, ${esc(s.category)}, ${esc(s.color)}, ${esc(s.description)}, ${sort}, true)`;
  }).join(',\n');
  sql += ';\n\n';
}

// Pages in batches of 200
sql += '-- Pages\n';
let pageCount = 0;
for (const s of stories) {
  sql += `\n-- ${s.title} (pages: ${s.pages.length})\n`;
  sql += 'INSERT INTO story_pages (story_id, page_number, text, keyword, emoji) VALUES\n';
  sql += s.pages.map(p => {
    pageCount++;
    return `  (${esc(s.uuid)}, ${p.pageNumber}, ${esc(p.text)}, ${esc(p.keyword)}, ${esc(p.emoji)})`;
  }).join(',\n');
  sql += ';\n';
}

fs.writeFileSync(OUTPUT, sql, 'utf-8');
const sizeKB = Math.round(fs.statSync(OUTPUT).size / 1024);
console.log(`SQL written to ${OUTPUT} (${sizeKB} KB)`);
console.log('Done!');
