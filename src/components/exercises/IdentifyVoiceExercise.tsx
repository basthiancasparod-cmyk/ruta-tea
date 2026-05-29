'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Dino } from '@/components/dino'
import { Button } from '@/components/ui/Button'
import { playSound, vibrate } from '@/lib/sounds'

interface IdentifyVoiceExerciseProps {
  childName: string
  onComplete: (success: boolean) => void
}

const voiceScenarios = [
  { text: '[nombre]', isCorrect: true },
  { text: 'Hola', isCorrect: false },
  { text: 'Mira', isCorrect: false },
  { text: '[nombre], ven', isCorrect: true },
  { text: 'Buenos días', isCorrect: false },
]

export function IdentifyVoiceExercise({ childName, onComplete }: IdentifyVoiceExerciseProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [lastWasCorrect, setLastWasCorrect] = useState(false)

  const currentScenario = voiceScenarios[currentIndex]

  useEffect(() => {
    // Simula reproducir el audio
    const timer = setTimeout(() => {
      playSound('correct')
    }, 500)
    return () => clearTimeout(timer)
  }, [currentIndex])

  const handleResponse = (userSaysYes: boolean) => {
    if (showFeedback) return

    const isCorrect = userSaysYes === currentScenario.isCorrect
    setLastWasCorrect(isCorrect)
    setShowFeedback(true)

    if (isCorrect) {
      setScore(score + 1)
      playSound('celebration')
      vibrate('correct')
    } else {
      playSound('wrong')
      vibrate('wrong')
    }

    setTimeout(() => {
      if (currentIndex >= voiceScenarios.length - 1) {
        onComplete(score >= 3)
      } else {
        setCurrentIndex(currentIndex + 1)
        setShowFeedback(false)
      }
    }, 2000)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 px-4">
      <Dino
        mood="calling"
        size="lg"
        message="Escucha... ¿dicen tu nombre?"
        childName={childName}
      />

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl p-8 border-4 border-brand shadow-xl">
          <div className="text-6xl mb-4">🔊</div>
          <p className="text-2xl font-extrabold text-text-primary">
            "{currentScenario.text.replace('[nombre]', childName)}"
          </p>
        </div>
      </motion.div>

      {!showFeedback ? (
        <div className="flex gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => handleResponse(true)}
            className="px-8 py-6 text-xl"
          >
            ✅ Sí, es mi nombre
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleResponse(false)}
            className="px-8 py-6 text-xl"
          >
            ❌ No es mi nombre
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`text-3xl font-extrabold ${
            lastWasCorrect ? 'text-success' : 'text-error'
          }`}
        >
          {lastWasCorrect ? '¡Correcto! 🎉' : '¡Casi! Inténtalo de nuevo 💪'}
        </motion.div>
      )}

      {/* Progreso */}
      <div className="flex gap-2">
        {voiceScenarios.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i < currentIndex
                ? 'bg-success'
                : i === currentIndex
                  ? 'bg-brand'
                  : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}