'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Dino } from '@/components/dino'
import { Card } from '@/components/ui/Card'
import { playSound, vibrate } from '@/lib/sounds'

interface SelectFaceExerciseProps {
  childName: string
  onComplete: (success: boolean) => void
}

const faces = ['😊', '😃', '🙂']

export function SelectFaceExercise({ childName, onComplete }: SelectFaceExerciseProps) {
  const [correctIndex, setCorrectIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)

  useEffect(() => {
    // Randomiza qué cara gira
    setCorrectIndex(Math.floor(Math.random() * 3))
    playSound('correct') // Simula decir el nombre
  }, [round])

  const handleSelect = (index: number) => {
    if (selected !== null) return

    setSelected(index)
    const isCorrect = index === correctIndex

    if (isCorrect) {
      playSound('celebration')
      vibrate('correct')
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
        setSelected(null)
      }
    }, 2000)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 px-4">
      <Dino
        mood="calling"
        size="lg"
        message={`¡${childName}! Toca la cara que te mira`}
        childName={childName}
      />

      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        {faces.map((face, index) => (
          <motion.div
            key={index}
            animate={
              index === correctIndex && selected === null
                ? {
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }
                : {}
            }
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatDelay: 0.5,
            }}
          >
            <Card
              variant="default"
              padding="lg"
              onClick={() => handleSelect(index)}
              className={`cursor-pointer text-center transition-all ${
                selected === null
                  ? 'hover:scale-105 hover:shadow-lg'
                  : selected === index
                    ? index === correctIndex
                      ? 'border-success border-4 bg-success/10'
                      : 'border-error border-4 bg-error/10'
                    : 'opacity-50'
              }`}
            >
              <div className="text-6xl">{face}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Progreso */}
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i < round
                ? i < score
                  ? 'bg-success'
                  : 'bg-error'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}