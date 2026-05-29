'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino } from '@/components/dino'
import { playSound, vibrate } from '@/lib/sounds'

interface HiddenSoundExerciseProps {
  childName: string
  onComplete: (success: boolean) => void
}

const SOUND_ITEMS = [
  { emoji: '🔔', sound: 'correct', label: 'Campana' },
  { emoji: '🐱', sound: 'correct', label: 'Gato' },
  { emoji: '🐶', sound: 'correct', label: 'Perro' },
  { emoji: '🐔', sound: 'correct', label: 'Gallina' },
  { emoji: '🚗', sound: 'correct', label: 'Coche' },
  { emoji: '🌊', sound: 'correct', label: 'Agua' },
  { emoji: '🎵', sound: 'correct', label: 'Música' },
  { emoji: '⏰', sound: 'correct', label: 'Despertador' },
]

const DISTRACTORS = ['🟦', '🟢', '🟡', '🟣', '🟠', '🔴']

export function HiddenSoundExercise({ childName, onComplete }: HiddenSoundExerciseProps) {
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [phase, setPhase] = useState<'listening' | 'choosing' | 'feedback'>('listening')
  const [correctItem, setCorrectItem] = useState(SOUND_ITEMS[0])
  const [options, setOptions] = useState<string[]>([])
  const [correctIndex, setCorrectIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const initRound = () => {
    const item = SOUND_ITEMS[Math.floor(Math.random() * SOUND_ITEMS.length)]
    setCorrectItem(item)

    const distractors = [...DISTRACTORS].sort(() => Math.random() - 0.5).slice(0, 3)
    const allOptions = [item.emoji, ...distractors].sort(() => Math.random() - 0.5)
    setOptions(allOptions)
    setCorrectIndex(allOptions.indexOf(item.emoji))
    setSelectedIndex(null)
    setPhase('listening')
    playSound('correct')

    setTimeout(() => setPhase('choosing'), 2000)
  }

  useEffect(() => {
    initRound()
  }, [round])

  const handleSelect = (index: number) => {
    if (phase !== 'choosing' || selectedIndex !== null) return
    setSelectedIndex(index)
    setPhase('feedback')
    const isCorrect = index === correctIndex

    if (isCorrect) {
      playSound('celebration')
      vibrate('celebration')
      setScore(score + 1)
    } else {
      playSound('wrong')
      vibrate('wrong')
    }

    setTimeout(() => {
      if (round >= 4) {
        onComplete(score >= 3)
      } else {
        setRound(round + 1)
      }
    }, 2000)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 px-4">
      <AnimatePresence mode="wait">
        {phase === 'listening' && (
          <motion.div
            key="listening"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center"
          >
            <Dino mood="calling" size="lg" message="Escucha con atención..." childName={childName} />
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-8xl mt-8"
            >
              🔊
            </motion.div>
            <p className="text-lg font-bold text-text-secondary mt-4">¿Qué sonido escuchaste?</p>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'choosing' && (
        <>
          <Dino mood="calling" size="lg" message={`¡${childName}! Toca el que sonó`} childName={childName} />

          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            {options.map((option, index) => (
              <motion.button
                key={`${round}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSelect(index)}
                className={`text-6xl p-6 rounded-2xl bg-white shadow-md hover:shadow-lg hover:scale-105 transition-all ${
                  selectedIndex === index
                    ? index === correctIndex
                      ? 'ring-4 ring-success bg-success/10'
                      : 'ring-4 ring-error bg-error/10'
                    : ''
                }`}
              >
                {option}
              </motion.button>
            ))}
          </div>
        </>
      )}

      {phase === 'feedback' && selectedIndex !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Dino
            mood={selectedIndex === correctIndex ? 'celebrating' : 'idle'}
            size="lg"
            message={
              selectedIndex === correctIndex
                ? `¡Correcto! Era ${correctItem.label}`
                : `Era ${correctItem.label}`
            }
            childName={childName}
          />
          <div className="text-8xl mt-4">{correctItem.emoji}</div>
        </motion.div>
      )}

      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i < round
                ? i < score
                  ? 'bg-success'
                  : 'bg-error'
                : i === round
                  ? 'bg-brand'
                  : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
