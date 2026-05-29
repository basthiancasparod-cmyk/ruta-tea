'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino } from '@/components/dino'
import { playSound, vibrate } from '@/lib/sounds'

interface FindCharacterExerciseProps {
  childName: string
  onComplete: (success: boolean) => void
}

const ALL_CHARACTERS = ['🦕', '🐱', '🐶', '🐰', '🐸', '🦊', '🐻', '🐼']

export function FindCharacterExercise({ childName, onComplete }: FindCharacterExerciseProps) {
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [characters, setCharacters] = useState<string[]>([])
  const [dinoIndex, setDinoIndex] = useState(0)

  useEffect(() => {
    const shuffled = [...ALL_CHARACTERS].sort(() => Math.random() - 0.5)
    const count = Math.min(3 + round, 7)
    const chars = shuffled.slice(0, count)
    const dinoPos = Math.floor(Math.random() * chars.length)
    chars[dinoPos] = '🦕'
    setCharacters(chars)
    setDinoIndex(dinoPos)
    setSelectedIndex(null)
    playSound('correct')
  }, [round])

  const handleSelect = (index: number) => {
    if (selectedIndex !== null) return
    setSelectedIndex(index)
    const isCorrect = index === dinoIndex

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
    }, 1500)
  }

  const totalRounds = 5

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 px-4">
      <Dino
        mood={selectedIndex === null ? 'calling' : selectedIndex === dinoIndex ? 'celebrating' : 'idle'}
        size="lg"
        message={
          selectedIndex === null
            ? `¡${childName}! Busca a Dino`
            : selectedIndex === dinoIndex
              ? '¡Lo encontraste!'
              : '¡Ese no es Dino!'
        }
        childName={childName}
      />

      <div className="grid grid-cols-4 gap-4 w-full max-w-md">
        {characters.map((char, index) => (
          <AnimatePresence key={`${round}-${index}`}>
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleSelect(index)}
              disabled={selectedIndex !== null}
              className={`text-6xl p-4 rounded-2xl transition-all ${
                selectedIndex === null
                  ? 'hover:scale-110 bg-white/80 shadow-md'
                  : selectedIndex === index
                    ? index === dinoIndex
                      ? 'bg-success/20 ring-4 ring-success scale-110'
                      : 'bg-error/20 ring-4 ring-error'
                    : index === dinoIndex && selectedIndex !== null
                      ? 'ring-4 ring-success/50'
                      : 'opacity-40'
              }`}
            >
              {char}
            </motion.button>
          </AnimatePresence>
        ))}
      </div>

      <div className="flex gap-2">
        {[...Array(totalRounds)].map((_, i) => (
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
