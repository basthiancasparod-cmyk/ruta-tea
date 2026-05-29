// src/types/curriculum.ts
import type { AgeRange } from './index'

export type CurriculumArea = {
  id: string
  name: string
  description: string
  icon: string
  age_range: AgeRange
  order_index: number
  created_at: string
}

export type CurriculumModule = {
  id: string
  area_id: string
  name: string
  description: string
  therapeutic_goal: string
  age_range: AgeRange
  order_index: number
  total_exercises: number
  created_at: string
}

export type ExerciseType = 
  | 'touch_screen'        // Ejercicio 1: Mira a Dino
  | 'select_face'         // Ejercicio 2: Sonido y rostro
  | 'identify_voice'      // Ejercicio 3: ¿Quién te llama?
  | 'balloon_pop'         // Ejercicio 4: Globo sorpresa
  | 'find_character'      // Ejercicio 5: Buscar a Dino
  | 'name_reward'         // Ejercicio 6: Nombre + recompensa
  | 'visual_attention'    // Ejercicio 7: Atención visual
  | 'hidden_sound'        // Ejercicio 8: Sonido escondido
  | 'social_routine'      // Ejercicio 9: Rutina social
  | 'sequence_challenge'  // Ejercicio 10: Mini juego final

export type CurriculumExercise = {
  id: string
  module_id: string
  title: string
  description: string
  exercise_type: ExerciseType
  content: Record<string, unknown>
  order_index: number
  xp_reward: number
  created_at: string
}

export type ChildModuleProgress = {
  id: string
  child_id: string
  module_id: string
  completed: boolean
  stars: number
  total_xp_earned: number
  exercises_completed: number
  started_at: string
  completed_at?: string
}

export type ChildExerciseProgress = {
  id: string
  child_id: string
  exercise_id: string
  completed: boolean
  attempts: number
  xp_earned: number
  stars: number
  last_played_at: string
}