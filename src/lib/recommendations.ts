import type { Lesson, ChildProgress, ChildProfile } from '@/types'

export interface Recommendation {
  lesson: Lesson
  reason: string
  priority: 'high' | 'medium' | 'low'
  score: number
}

const THERAPY_BALANCE_WINDOW = 3

function calculateReviewScore(
  lesson: Lesson,
  progress: ChildProgress | undefined,
  child: ChildProfile | undefined
): { score: number; reason: string; priority: 'high' | 'medium' | 'low' } {
  if (!progress) {
    return {
      score: 50,
      reason: 'Primera vez en esta lección',
      priority: 'medium',
    }
  }

  if (progress.completed && progress.stars === 3) {
    return {
      score: 10,
      reason: '¡Ya dominas esta lección!',
      priority: 'low',
    }
  }

  if (progress.completed && progress.stars <= 1) {
    return {
      score: 90,
      reason: 'Necesitas repasar esta lección',
      priority: 'high',
    }
  }

  if (progress.completed && progress.stars === 2) {
    return {
      score: 60,
      reason: 'Puedes mejorar tu puntuación',
      priority: 'medium',
    }
  }

  const lastPlayed = new Date(progress.last_played_at)
  const daysSince = Math.floor((Date.now() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24))
  if (daysSince > 7) {
    return {
      score: 80,
      reason: `No la juegas hace ${daysSince} días, buen momento para repasar`,
      priority: 'high',
    }
  }

  if (daysSince > 3) {
    return {
      score: 65,
      reason: `Hace ${daysSince} días que no la juegas`,
      priority: 'medium',
    }
  }

  return {
    score: 30,
    reason: 'Ya la jugaste recientemente',
    priority: 'low',
  }
}

function getInterestBonus(lesson: Lesson, child: ChildProfile | undefined): number {
  if (!child) return 0
  const therapyMap: Record<string, string[]> = {
    musica: ['play', 'sensory'],
    animales: ['play', 'social'],
    colores: ['play', 'sensory', 'cognitive'],
    numeros: ['cognitive', 'teacch'],
    palabras: ['speech', 'cognitive'],
    dibujar: ['play', 'sensory'],
    construir: ['play', 'teacch'],
    bailar: ['play', 'sensory', 'social'],
  }

  for (const interest of child.interests) {
    const related = therapyMap[interest.toLowerCase()] ?? []
    if (related.includes(lesson.therapy_type)) return 15
  }
  return 0
}

export function getRecommendations(
  lessons: Lesson[],
  progress: ChildProgress[],
  child: ChildProfile | undefined,
  count: number = 3
): Recommendation[] {
  const progressMap = new Map(progress.map(p => [p.lesson_id, p]))

  const recentTherapies = progress
    .filter(p => p.completed)
    .sort((a, b) => new Date(b.last_played_at).getTime() - new Date(a.last_played_at).getTime())
    .slice(0, THERAPY_BALANCE_WINDOW)
    .map(p => {
      const lesson = lessons.find(l => l.id === p.lesson_id)
      return lesson?.therapy_type
    })
    .filter(Boolean) as string[]

  const scored = lessons
    .filter(l => {
      const prog = progressMap.get(l.id)
      if (!prog) return true
      if (prog.stars === 3) {
        const daysSince = Math.floor((Date.now() - new Date(prog.last_played_at).getTime()) / (1000 * 60 * 60 * 24))
        return daysSince > 14
      }
      return true
    })
    .map(lesson => {
      const prog = progressMap.get(lesson.id)
      const { score, reason, priority } = calculateReviewScore(lesson, prog, child)
      const interestBonus = getInterestBonus(lesson, child)
      const therapyPenalty = recentTherapies.filter(t => t === lesson.therapy_type).length * 10
      const finalScore = Math.max(0, Math.min(100, score + interestBonus - therapyPenalty))

      return {
        lesson,
        reason,
        priority: (finalScore >= 70 ? 'high' : finalScore >= 40 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
        score: finalScore,
      }
    })
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, count)
}
