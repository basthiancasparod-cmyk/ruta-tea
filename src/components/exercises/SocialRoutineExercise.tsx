'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino } from '@/components/dino'
import { playSound, vibrate } from '@/lib/sounds'
import { Button } from '@/components/ui/Button'

interface SocialRoutineExerciseProps {
  childName: string
  onComplete: (success: boolean) => void
}

interface RoutineStep {
  emoji: string
  label: string
  instruction: string
  options: string[]
  correctIndex: number
}

const ROUTINES: RoutineStep[][] = [
  [
    { emoji: '👋', label: 'Saludar', instruction: '¿Qué haces cuando llegas?', options: ['👋 Saludar', '😴 Dormir', '🍽️ Comer'], correctIndex: 0 },
    { emoji: '😊', label: 'Sonreír', instruction: '¿Cómo muestras alegría?', options: ['😢 Llorar', '😊 Sonreír', '😤 Enojarse'], correctIndex: 1 },
    { emoji: '🤝', label: 'Compartir', instruction: '¿Qué haces con un juguete?', options: ['🙈 Esconder', '🤝 Compartir', '🗑️ Botar'], correctIndex: 1 },
    { emoji: '👀', label: 'Esperar', instruction: '¿Qué haces cuando es el turno de otro?', options: ['🙋 Interrumpir', '👀 Esperar', '🏃 Irse'], correctIndex: 1 },
  ],
  [
    { emoji: '🙏', label: 'Pedir ayuda', instruction: '¿Cómo pides ayuda?', options: ['🙏 Por favor', '😠 Gritar', '😢 Llorar'], correctIndex: 0 },
    { emoji: '🎮', label: 'Jugar juntos', instruction: '¿Cómo juegas con un amigo?', options: ['🎮 Jugar juntos', '📱 Solo', '🏃 Irse'], correctIndex: 0 },
    { emoji: '🫂', label: 'Consolar', instruction: 'Un amigo está triste, ¿qué haces?', options: ['😄 Reírte', '🫂 Consolar', '😤 Ignorar'], correctIndex: 1 },
    { emoji: '🎉', label: 'Celebrar', instruction: 'Un amigo logró algo, ¿qué haces?', options: ['🎉 Celebrar', '😐 Nada', '😠 Envidiar'], correctIndex: 0 },
  ],
  [
    { emoji: '🪀', label: 'Compartir juguete', instruction: '¿Cómo compartes?', options: ['🤲 Ofrecer', '🙈 Esconder', '👋 Decir no'], correctIndex: 0 },
    { emoji: '💬', label: 'Conversar', instruction: '¿Cómo hablas con alguien?', options: ['📱 Mensaje', '💬 Hablar', '😠 Gritar'], correctIndex: 1 },
    { emoji: '🎂', label: 'Cumpleaños', instruction: '¿Qué dices en un cumpleaños?', options: ['😢 Adiós', '🎂 Feliz cumpleaños', '😴 Buenas noches'], correctIndex: 1 },
    { emoji: '🏥', label: 'Tranquilizar', instruction: 'Un amigo se lastimó, ¿qué haces?', options: ['🏃 Te vas', '😂 Te ríes', '🏥 Ayudas'], correctIndex: 2 },
  ],
]

export function SocialRoutineExercise({ childName, onComplete }: SocialRoutineExerciseProps) {
  const [routineSet, setRoutineSet] = useState(0)
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [started, setStarted] = useState(false)

  const currentRoutine = ROUTINES[routineSet]
  const currentStep = currentRoutine[step]

  const handleStart = () => {
    setStarted(true)
    playSound('correct')
  }

  const handleSelect = (index: number) => {
    if (selected !== null) return
    setSelected(index)
    setShowFeedback(true)
    const isCorrect = index === currentStep.correctIndex

    if (isCorrect) {
      playSound('celebration')
      vibrate('celebration')
      setScore(score + 1)
    } else {
      playSound('wrong')
      vibrate('wrong')
    }

    setTimeout(() => {
      if (step >= currentRoutine.length - 1) {
        if (routineSet >= ROUTINES.length - 1) {
          onComplete(score >= Math.floor((currentRoutine.length * ROUTINES.length) / 2))
        } else {
          setRoutineSet(routineSet + 1)
          setStep(0)
          setSelected(null)
          setShowFeedback(false)
          setStarted(false)
        }
      } else {
        setStep(step + 1)
        setSelected(null)
        setShowFeedback(false)
      }
    }, 2000)
  }

  const totalSteps = ROUTINES.length * ROUTINES[0].length
  const completedSteps = routineSet * currentRoutine.length + step

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4">
        <Dino mood="excited" size="xl" message={`¡${childName}! Vamos a practicar rutinas sociales`} childName={childName} />
        <p className="text-lg font-bold text-text-secondary text-center max-w-xs">
          Aprenderemos a saludar, compartir y ayudar a los demás
        </p>
        <Button variant="primary" size="lg" onClick={handleStart} className="px-10 py-4 text-lg">
          ¡Comenzar! 🚀
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${routineSet}-${step}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="flex flex-col items-center gap-6 w-full max-w-sm"
        >
          <Dino
            mood="calling"
            size="lg"
            message={currentStep.instruction}
            childName={childName}
          />

          <div className="bg-white rounded-3xl p-6 shadow-lg border border-border/60 w-full">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-brand-bg flex items-center justify-center text-5xl">
                {currentStep.emoji}
              </div>
            </div>
            <p className="text-center font-extrabold text-text-primary text-lg mb-6">{currentStep.label}</p>

            <div className="space-y-3">
              {currentStep.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={selected === null ? { scale: 1.03 } : {}}
                  whileTap={selected === null ? { scale: 0.97 } : {}}
                  onClick={() => handleSelect(index)}
                  disabled={selected !== null}
                  className={`w-full p-4 rounded-2xl text-lg font-bold transition-all ${
                    selected === null
                      ? 'bg-gray-50 hover:bg-brand-bg border-2 border-border'
                      : selected === index
                        ? index === currentStep.correctIndex
                          ? 'bg-success/20 border-2 border-success'
                          : 'bg-error/20 border-2 border-error'
                        : index === currentStep.correctIndex
                          ? 'bg-success/10 border-2 border-success/50'
                          : 'bg-gray-50 border-2 border-border opacity-50'
                  }`}
                >
                  {option}
                </motion.button>
              ))}
            </div>
          </div>

          {showFeedback && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`text-2xl font-extrabold ${
                selected === currentStep.correctIndex ? 'text-success' : 'text-error'
              }`}
            >
              {selected === currentStep.correctIndex ? '¡Correcto! 🎉' : '¡Casi! Así se hace 💪'}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-1.5">
        {[...Array(totalSteps)].map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${
              i < completedSteps
                ? 'bg-success'
                : i === completedSteps
                  ? 'bg-brand'
                  : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
