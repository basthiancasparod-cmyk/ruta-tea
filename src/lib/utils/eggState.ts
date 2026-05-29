import type { CurriculumModule } from '@/types/curriculum'

export type EggState = 'locked' | 'available' | 'completed'

export function getEggState(
  module: CurriculumModule,
  modules: CurriculumModule[],
  completedIds: Set<string>,
  prevAreaCompleted?: boolean
): EggState {
  if (completedIds.has(module.id)) return 'completed'

  const sorted = [...modules].sort((a, b) => a.order_index - b.order_index)
  const idx = sorted.findIndex(m => m.id === module.id)

  // Primer módulo del área: bloqueado si hay área anterior sin completar
  if (idx === 0) return prevAreaCompleted ?? true ? 'available' : 'locked'

  // Disponible solo si el anterior está completado
  const prev = sorted[idx - 1]
  return completedIds.has(prev.id) ? 'available' : 'locked'
}