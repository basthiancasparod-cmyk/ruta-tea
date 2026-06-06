'use client'

export interface Emotion {
  id: string
  label: string
  emoji: string
  pictogram: string
  color: string
  bg: string
  border: string
  energy: 'alta' | 'baja'
}

export interface Scenario {
  situation: string
  emotionId: string
  context?: string
}

export interface FacePart {
  id: string
  type: 'eyes' | 'eyebrows' | 'mouth' | 'nose'
  label: string
}

export const EMOTIONS: Emotion[] = [
  { id: 'alegre', label: 'Alegre', emoji: '😊', pictogram: 'alegre', color: '#22c55e', bg: 'bg-green-50', border: 'border-green-300', energy: 'baja' },
  { id: 'triste', label: 'Triste', emoji: '😢', pictogram: 'triste', color: '#3b82f6', bg: 'bg-blue-50', border: 'border-blue-300', energy: 'baja' },
  { id: 'enojado', label: 'Enojado', emoji: '😡', pictogram: 'enfadado', color: '#ef4444', bg: 'bg-red-50', border: 'border-red-300', energy: 'alta' },
  { id: 'asustado', label: 'Asustado', emoji: '😨', pictogram: 'miedo', color: '#a855f7', bg: 'bg-purple-50', border: 'border-purple-300', energy: 'alta' },
  { id: 'amor', label: 'Amor', emoji: '🥰', pictogram: 'amor', color: '#ec4899', bg: 'bg-pink-50', border: 'border-pink-300', energy: 'baja' },
  { id: 'cansado', label: 'Cansado', emoji: '😴', pictogram: 'cansado', color: '#6b7280', bg: 'bg-gray-50', border: 'border-gray-300', energy: 'baja' },
  { id: 'sorprendido', label: 'Sorprendido', emoji: '😮', pictogram: 'sorprendido', color: '#f59e0b', bg: 'bg-amber-50', border: 'border-amber-300', energy: 'alta' },
  { id: 'nervioso', label: 'Nervioso', emoji: '😰', pictogram: 'nervioso', color: '#f97316', bg: 'bg-orange-50', border: 'border-orange-300', energy: 'alta' },
]

export const SCENARIOS: Scenario[] = [
  { situation: 'Recibiste un regulo', emotionId: 'alegre' },
  { situation: 'Tu amigo te invitó a jugar', emotionId: 'alegre' },
  { situation: 'Se rompió tu juguete favorito', emotionId: 'triste' },
  { situation: 'Estás enfermo y no puedes salir', emotionId: 'triste' },
  { situation: 'Te quitaron tu turno', emotionId: 'enojado' },
  { situation: 'Alguien rompió tu dibujo', emotionId: 'enojado' },
  { situation: 'Hay un ruido muy fuerte', emotionId: 'asustado' },
  { situation: 'Hay una tormenta con rayos', emotionId: 'asustado' },
  { situation: 'Mamá te da un abrazo', emotionId: 'amor' },
  { situation: 'Tu abuela te regaló un peluche', emotionId: 'amor' },
  { situation: 'Es hora de dormir después de jugar mucho', emotionId: 'cansado' },
  { situation: 'Caminaste todo el día', emotionId: 'cansado' },
  { situation: 'Viste algo increíble en el cielo', emotionId: 'sorprendido' },
  { situation: 'Te dijeron que iremos a Disney', emotionId: 'sorprendido' },
  { situation: 'Tienes examen mañana', emotionId: 'nervioso' },
  { situation: 'Vas a conocer gente nueva', emotionId: 'nervioso' },
]

export const SITUATION_BY_EMOTION: Record<string, Scenario[]> = (() => {
  const map: Record<string, Scenario[]> = {}
  for (const s of SCENARIOS) {
    if (!map[s.emotionId]) map[s.emotionId] = []
    map[s.emotionId].push(s)
  }
  return map
})()

export const ENERGY_LEVELS = [
  { id: 'alta', label: 'Alta energía', emoji: '⚡', desc: 'Emociones fuertes que mueven mucho el cuerpo' },
  { id: 'baja', label: 'Baja energía', emoji: '😌', desc: 'Emociones tranquilas y suaves' },
]

export const FACE_PARTS = {
  eyes: [
    { id: 'happy-eyes', label: 'Ojos alegres', svg: 'M38 30 Q42 26 46 30 M54 30 Q58 26 62 30' },
    { id: 'sad-eyes', label: 'Ojos tristes', svg: 'M38 33 Q42 30 46 33 M54 33 Q58 30 62 33' },
    { id: 'angry-eyes', label: 'Ojos enojados', svg: 'M36 28 L46 32 M64 28 L54 32' },
    { id: 'scared-eyes', label: 'Ojos asustados', svg: 'M38 28 Q42 24 46 28 M54 28 Q58 24 62 28' },
    { id: 'surprised-eyes', label: 'Ojos sorprendidos', svg: 'circle 42 30 4 circle 58 30 4' },
    { id: 'love-eyes', label: 'Ojos de amor', svg: 'M38 30 Q42 26 46 30 M54 30 Q58 26 62 30' },
  ],
  eyebrows: [
    { id: 'happy-brows', label: 'Cejas alegres', svg: 'M35 22 Q42 18 49 22 M51 22 Q58 18 65 22' },
    { id: 'sad-brows', label: 'Cejas tristes', svg: 'M35 18 Q42 22 49 18 M51 18 Q58 22 65 18' },
    { id: 'angry-brows', label: 'Cejas enojadas', svg: 'M35 18 L49 22 M65 18 L51 22' },
    { id: 'scared-brows', label: 'Cejas asustadas', svg: 'M35 16 Q42 20 49 18 M65 16 Q58 20 51 18' },
    { id: 'surprised-brows', label: 'Cejas sorprendidas', svg: 'M35 16 Q42 12 49 16 M51 16 Q58 12 65 16' },
  ],
  mouth: [
    { id: 'happy-mouth', label: 'Boca alegre', svg: 'M40 42 Q50 50 60 42' },
    { id: 'sad-mouth', label: 'Boca triste', svg: 'M40 48 Q50 42 60 48' },
    { id: 'angry-mouth', label: 'Boca enojada', svg: 'M38 46 L62 46' },
    { id: 'scared-mouth', label: 'Boca asustada', svg: 'circle 50 46 6' },
    { id: 'surprised-mouth', label: 'Boca sorprendida', svg: 'ellipse 50 46 8 10' },
    { id: 'love-mouth', label: 'Boca amorosa', svg: 'M40 44 Q50 48 60 44' },
  ],
}

export const EMOTION_SONGS: Record<string, { color: string; note: string }> = {
  alegre: { color: '#22c55e', note: '🎵 Alegría' },
  triste: { color: '#3b82f6', note: '🎵 Tristeza' },
  enojado: { color: '#ef4444', note: '🎵 Enojo' },
  asustado: { color: '#a855f7', note: '🎵 Miedo' },
  amor: { color: '#ec4899', note: '🎵 Amor' },
  cansado: { color: '#6b7280', note: '🎵 Cansancio' },
  sorprendido: { color: '#f59e0b', note: '🎵 Sorpresa' },
  nervioso: { color: '#f97316', note: '🎵 Nervios' },
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function pickRandom<T>(arr: T[], count: number): T[] {
  return shuffle(arr).slice(0, count)
}

export function getEmotion(id: string): Emotion | undefined {
  return EMOTIONS.find(e => e.id === id)
}

export { useGameStats } from './use-stats'
