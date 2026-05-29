'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Dino } from '@/components/dino'
import { useSupabase } from '@/components/layout/SupabaseProvider'
import { useChildren } from '@/lib/hooks/useData'
import { playSound, vibrate } from '@/lib/sounds'
import type { CurriculumExercise } from '@/types'

import {
  TouchScreenExercise,
  SelectFaceExercise,
  IdentifyVoiceExercise,
  BalloonPopExercise,
  FindCharacterExercise,
  NameRewardExercise,
  VisualAttentionExercise,
  HiddenSoundExercise,
  SocialRoutineExercise,
  SequenceChallengeExercise,
} from '@/components/exercises'

function EjercicioContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { supabase } = useSupabase()
  const { children } = useChildren()
  const child = children[0]
  
  const ageRange = params.ageRange as string
  const ejercicioId = params.ejercicioId as string
  const moduleId = searchParams.get('moduleId')
  const exerciseIndex = parseInt(searchParams.get('exerciseIndex') ?? '0', 10)

  const [exercise, setExercise] = useState<CurriculumExercise | null>(null)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [stars, setStars] = useState(0)
  const [moduleExercises, setModuleExercises] = useState<CurriculumExercise[]>([])
  const [nextExerciseId, setNextExerciseId] = useState<string | null>(null)

  // Fetch current exercise
  useEffect(() => {
    supabase
      .from('curriculum_exercises')
      .select('*')
      .eq('id', ejercicioId)
      .single()
      .then(({ data }) => {
        setExercise(data as CurriculumExercise)
        setLoading(false)
      })
  }, [ejercicioId, supabase])

  // Fetch all module exercises to find next one
  useEffect(() => {
    if (!moduleId) return
    supabase
      .from('curriculum_exercises')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_index')
      .then(({ data }) => {
        if (!data) return
        const sorted = data as CurriculumExercise[]
        setModuleExercises(sorted)
        const nextIdx = exerciseIndex + 1
        if (nextIdx < sorted.length) {
          setNextExerciseId(sorted[nextIdx].id)
        } else {
          setNextExerciseId(null)
        }
      })
  }, [moduleId, exerciseIndex, supabase])

  const handleComplete = async (success: boolean) => {
    if (!child || saving) return

    setSaving(true)
    const earnedStars = success ? 3 : 1
    const earnedXp = success ? exercise?.xp_reward ?? 10 : Math.floor((exercise?.xp_reward ?? 10) / 2)

    setStars(earnedStars)
    setCompleted(true)

    if (success) {
      playSound('celebration')
      vibrate('celebration')
    }

    await supabase.from('child_exercise_progress').upsert(
      {
        child_id: child.id,
        exercise_id: ejercicioId,
        completed: success,
        attempts: 1,
        xp_earned: earnedXp,
        stars: earnedStars,
        last_played_at: new Date().toISOString(),
      },
      { onConflict: 'child_id,exercise_id' }
    )

    if (exercise?.module_id) {
      const { data: moduleProgress } = await supabase
        .from('child_module_progress')
        .select('*')
        .eq('child_id', child.id)
        .eq('module_id', exercise.module_id)
        .single()

      const currentXp = moduleProgress?.total_xp_earned ?? 0
      const currentCompleted = moduleProgress?.exercises_completed ?? 0

      await supabase.from('child_module_progress').upsert(
        {
          child_id: child.id,
          module_id: exercise.module_id,
          total_xp_earned: currentXp + earnedXp,
          exercises_completed: success ? currentCompleted + 1 : currentCompleted,
        },
        { onConflict: 'child_id,module_id' }
      )
    }

    setSaving(false)
  }

  const handleContinue = () => {
    if (nextExerciseId) {
      router.push(`/ruta/nivel/${ageRange}/ejercicio/${nextExerciseId}?moduleId=${moduleId}&exerciseIndex=${exerciseIndex + 1}`)
    } else if (moduleId) {
      router.push(`/ruta/nivel/${ageRange}/modulo/${moduleId}?completo=1`)
    } else {
      router.push(`/ruta/nivel/${ageRange}`)
    }
  }

  const [showExitModal, setShowExitModal] = useState(false)

  const handleExit = () => {
    setShowExitModal(true)
  }

  const confirmExit = () => {
    setShowExitModal(false)
    router.push(`/ruta/nivel/${ageRange}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Dino mood="idle" message="Cargando ejercicio..." />
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Dino mood="idle" message="Ejercicio no encontrado" />
        <Button variant="primary" onClick={() => router.back()}>
          ← Volver
        </Button>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4">
        <Dino
          mood="celebrating"
          size="xl"
          message={stars >= 3 ? '¡Increíble!' : '¡Buen trabajo!'}
          childName={child?.name}
        />

        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-text-primary mb-2">
            {stars >= 3 ? '¡Perfecto! 🌟' : '¡Bien hecho! 👏'}
          </h2>
          <p className="text-lg text-text-secondary">
            Ganaste {exercise.xp_reward} XP
          </p>
          <div className="flex gap-1 justify-center mt-4 text-4xl">
            {'⭐'.repeat(stars)}
          </div>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleContinue}
            className="bg-brand hover:bg-brand-dark text-white font-extrabold px-10 py-4 rounded-2xl shadow-lg text-lg transition-colors"
          >
            {nextExerciseId ? 'Continuar →' : 'Ver resumen →'}
          </motion.button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setCompleted(false)
              setSaving(false)
            }}
          >
            Repetir
          </Button>
        </div>
      </div>
    )
  }

  const renderExercise = () => {
    const childName = child?.name ?? 'amiguito'

    switch (exercise.exercise_type) {
      case 'touch_screen':
        return <TouchScreenExercise childName={childName} onComplete={handleComplete} />
      case 'select_face':
        return <SelectFaceExercise childName={childName} onComplete={handleComplete} />
      case 'identify_voice':
        return <IdentifyVoiceExercise childName={childName} onComplete={handleComplete} />
      case 'balloon_pop':
        return <BalloonPopExercise childName={childName} onComplete={handleComplete} />
      case 'find_character':
        return <FindCharacterExercise childName={childName} onComplete={handleComplete} />
      case 'name_reward':
        return <NameRewardExercise childName={childName} onComplete={handleComplete} />
      case 'visual_attention':
        return <VisualAttentionExercise childName={childName} onComplete={handleComplete} />
      case 'hidden_sound':
        return <HiddenSoundExercise childName={childName} onComplete={handleComplete} />
      case 'social_routine':
        return <SocialRoutineExercise childName={childName} onComplete={handleComplete} />
      case 'sequence_challenge':
        return <SequenceChallengeExercise childName={childName} onComplete={handleComplete} />
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Dino mood="idle" message="Tipo de ejercicio desconocido" />
            <Button variant="primary" onClick={handleExit}>
              ← Volver
            </Button>
          </div>
        )
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#F8F7FC] to-white">
      {/* Premium floating header card */}
      <div className="sticky top-0 z-10 pt-0 px-4">
        <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-2.5 overflow-hidden">
          {/* Floating pastel particles */}
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-[#6ED7B0]/10 blur-xl pointer-events-none" />
          <div className="absolute -bottom-4 -left-4 w-14 h-14 rounded-full bg-[#B89CFF]/10 blur-lg pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-6 h-6 rounded-full bg-[#B89CFF]/8 blur-md pointer-events-none" />

          <div className="relative flex items-center gap-3">
            {/* ── LEFT: Back + Title ── */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleExit}
                className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-text-primary text-base shrink-0"
              >
                ✕
              </motion.button>
              <div className="min-w-0">
                <h1 className="text-base font-extrabold text-text-primary truncate leading-tight">
                  {exercise.title}
                </h1>
                <p className="text-[11px] font-semibold text-text-secondary truncate">
                  Ejercicio {exerciseIndex + 1} de {moduleExercises.length || '?'}
                </p>
              </div>
            </div>

            {/* ── CENTER: Progress line ── */}
            <div className="flex items-center gap-0 shrink-0">
              {moduleExercises.length > 0 && moduleExercises.map((_, idx) => {
                const isDone = idx < exerciseIndex
                const isCurrent = idx === exerciseIndex
                return (
                  <div key={idx} className="flex items-center">
                    <div className="relative flex items-center justify-center">
                      {isDone ? (
                        <div className="w-4 h-4 rounded-full bg-[#6ED7B0] shadow-[0_0_8px_rgba(110,215,176,0.6)] flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                            <path d="M2 6 L5 9 L10 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      ) : isCurrent ? (
                        <div className="w-7 h-7 flex items-center justify-center">
                          <Image
                            src="/assets/dino-indicador.png"
                            alt=""
                            width={28}
                            height={28}
                            className="object-contain drop-shadow-sm"
                          />
                        </div>
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-border" />
                      )}
                    </div>
                    {idx < moduleExercises.length - 1 && (
                      <div className={`w-5 h-1 mx-0.5 rounded-full transition-all duration-300 ${
                        isDone
                          ? 'bg-[#6ED7B0] shadow-[0_0_4px_rgba(110,215,176,0.5)]'
                          : 'bg-border'
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>

            {/* ── RIGHT: XP capsule ── */}
            <div className="shrink-0">
              <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-border rounded-full px-3 py-1.5 shadow-sm">
                <span className="text-sm">⭐</span>
                <span className="text-xs font-extrabold text-text-primary">{exercise.xp_reward} XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exit confirmation modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowExitModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-border p-8 max-w-sm w-full text-center"
          >
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-[#6ED7B0]/10 blur-xl pointer-events-none" />
            <div className="absolute -bottom-4 -left-4 w-14 h-14 rounded-full bg-[#B89CFF]/10 blur-lg pointer-events-none" />

            <div className="relative">
              <div className="text-4xl mb-4">🦕</div>
              <h2 className="text-xl font-extrabold text-text-primary mb-2">¿Salir del ejercicio?</h2>
              <p className="text-sm text-text-secondary mb-8 leading-relaxed">
                Perderás el progreso de este ejercicio si no lo has completado
              </p>
              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={confirmExit}
                  className="w-full bg-[#FF6B6B] hover:bg-[#E85555] text-white font-extrabold py-3.5 rounded-2xl shadow-lg transition-colors"
                >
                  Sí, salir
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowExitModal(false)}
                  className="w-full bg-white border-2 border-border text-text-primary font-bold py-3 rounded-2xl hover:bg-surface-hover transition-colors"
                >
                  Seguir practicando
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Exercise content */}
      <div className="flex-1">
        {renderExercise()}
      </div>
    </div>
  )
}

export default function EjercicioPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Dino mood="idle" message="Cargando..." />
      </div>
    }>
      <EjercicioContent />
    </Suspense>
  )
}
