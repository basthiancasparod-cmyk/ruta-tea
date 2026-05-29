'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Dino } from '@/components/dino'
import { useCurriculumExercises, useChildren, useExerciseProgress } from '@/lib/hooks/useData'
import { useSupabase } from '@/components/layout/SupabaseProvider'
import type { CurriculumModule } from '@/types'

export default function ModuloPage() {
  const params = useParams()
  const router = useRouter()
  const { supabase } = useSupabase()
  const ageRange = params.ageRange as string
  const moduloId = params.moduloId as string

  const { children } = useChildren()
  const child = children[0]
  const { exercises, loading } = useCurriculumExercises(moduloId)
  const { exerciseProgress } = useExerciseProgress(child?.id)
  const [module, setModule] = useState<CurriculumModule | null>(null)

  useEffect(() => {
    supabase
      .from('curriculum_modules')
      .select('*')
      .eq('id', moduloId)
      .single()
      .then(({ data }) => setModule(data as CurriculumModule))
  }, [moduloId, supabase])

  useEffect(() => {
    if (loading || !exercises.length) return

    const firstIncomplete = exercises.findIndex(ex => {
      const prog = exerciseProgress.find(p => p.exercise_id === ex.id)
      return !prog?.completed
    })

    const targetIndex = firstIncomplete === -1 ? exercises.length - 1 : firstIncomplete
    router.replace(`/ruta/nivel/${ageRange}/ejercicio/${exercises[targetIndex].id}?moduleId=${moduloId}&exerciseIndex=${targetIndex}`)
  }, [loading, exercises, exerciseProgress, ageRange, moduloId, router])

  const completedCount = exerciseProgress.filter(p => p.completed).length
  const allDone = !loading && exercises.length > 0 && completedCount >= exercises.length

  if (allDone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4">
        <Dino mood="celebrating" size="xl" message="¡Módulo completado!" childName={child?.name} />
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-text-primary mb-2">¡Felicidades! 🎉</h2>
          <p className="text-lg text-text-secondary">Completaste todos los ejercicios de este módulo</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/ruta/nivel/${ageRange}`)}
            className="bg-brand hover:bg-brand-dark text-white font-extrabold px-8 py-3 rounded-2xl shadow-lg transition-colors"
          >
            Volver a la ruta
          </motion.button>
        </div>
      </div>
    )
  }

  if (exercises.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4">
        <Dino mood="idle" size="xl" message="Este módulo no tiene ejercicios disponibles aún" childName={child?.name} />
        <button
          onClick={() => router.push(`/ruta/nivel/${ageRange}`)}
          className="bg-brand hover:bg-brand-dark text-white font-extrabold px-8 py-3 rounded-2xl shadow-lg transition-colors"
        >
          Volver a la ruta
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Dino mood="idle" message="Preparando ejercicios..." />
    </div>
  )
}
