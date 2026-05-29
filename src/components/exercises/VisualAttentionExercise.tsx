'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino } from '@/components/dino'
import { playSound, vibrate } from '@/lib/sounds'

interface VisualAttentionExerciseProps {
  childName: string
  onComplete: (success: boolean) => void
}

const GRID_COLS = 4
const GRID_ROWS = 3

export function VisualAttentionExercise({ childName, onComplete }: VisualAttentionExerciseProps) {
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [phase, setPhase] = useState<'showing' | 'hidden' | 'answer' | 'feedback'>('showing')
  const [targetIndex, setTargetIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalCells = GRID_COLS * GRID_ROWS

  useEffect(() => {
    if (phase !== 'showing') return
    setTargetIndex(Math.floor(Math.random() * totalCells))
    playSound('correct')

    setTimeout(() => {
      setPhase('hidden')
      setTimeout(() => {
        setPhase('answer')
      }, 800)
    }, 1500)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [round, phase === 'showing'])

  const handleSelect = (index: number) => {
    if (phase !== 'answer' || selectedIndex !== null) return
    setSelectedIndex(index)
    const isCorrect = index === targetIndex

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
        setSelectedIndex(null)
        setPhase('showing')
      }
    }, 2000)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4">
      <Dino
        mood={phase === 'showing' ? 'calling' : phase === 'feedback' ? (selectedIndex === targetIndex ? 'celebrating' : 'idle') : 'idle'}
        size="lg"
        message={
          phase === 'showing'
            ? `¡${childName}! Mira dónde aparece Dino`
            : phase === 'hidden'
              ? '¿Dónde estaba Dino?'
              : phase === 'feedback'
                ? selectedIndex === targetIndex ? '¡Muy bien!' : '¡Casi!'
                : 'Toca donde viste a Dino'
        }
        childName={childName}
      />

      <div
        className="grid gap-3 w-full max-w-sm"
        style={{
          gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
        }}
      >
        {Array.from({ length: totalCells }).map((_, index) => (
          <motion.button
            key={`${round}-${index}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: 1,
              scale: 1,
              backgroundColor:
                phase === 'showing' && index === targetIndex
                  ? '#6ED7B0'
                  : selectedIndex === index
                    ? index === targetIndex
                      ? '#6ED7B0'
                      : '#FF6B6B'
                    : phase === 'feedback' && index === targetIndex
                      ? '#6ED7B0'
                      : '#E9EAF2',
            }}
            transition={{ delay: index * 0.03 }}
            onClick={() => handleSelect(index)}
            disabled={phase !== 'answer'}
            className={`aspect-square rounded-2xl flex items-center justify-center text-4xl transition-shadow ${
              phase === 'answer' ? 'cursor-pointer hover:shadow-lg hover:scale-105' : ''
            } ${phase === 'showing' && index === targetIndex ? 'shadow-lg shadow-[#6ED7B0]/40' : 'shadow-sm'}`}
          >
            {phase === 'showing' && index === targetIndex ? (
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                🦕
              </motion.span>
            ) : selectedIndex === index || (phase === 'feedback' && index === targetIndex) ? (
              index === targetIndex ? '✅' : '❌'
            ) : null}
          </motion.button>
        ))}
      </div>

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
