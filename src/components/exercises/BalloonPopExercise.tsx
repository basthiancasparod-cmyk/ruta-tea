'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino } from '@/components/dino'
import { playSound, vibrate } from '@/lib/sounds'

interface BalloonPopExerciseProps {
  childName: string
  onComplete: (success: boolean) => void
}

const balloonColors = ['🎈', '🎈', '🎈', '🎈', '🎈']

export function BalloonPopExercise({ childName, onComplete }: BalloonPopExerciseProps) {
  const [correctBalloon, setCorrectBalloon] = useState(0)
  const [poppedBalloons, setPoppedBalloons] = useState<number[]>([])
  const [isCallingName, setIsCallingName] = useState(false)
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)

  useEffect(() => {
    setCorrectBalloon(Math.floor(Math.random() * 5))
    
    // Simula llamar el nombre después de 2 segundos
    const timer = setTimeout(() => {
      setIsCallingName(true)
      playSound('correct')
    }, 2000)

    return () => clearTimeout(timer)
  }, [round])

  const handleBalloonClick = (index: number) => {
    if (!isCallingName || poppedBalloons.includes(index)) return

    const isCorrect = index === correctBalloon
    setPoppedBalloons([...poppedBalloons, index])

    if (isCorrect) {
      playSound('celebration')
      vibrate('celebration')
      setScore(score + 1)

      setTimeout(() => {
        if (round >= 4) {
          onComplete(score >= 3)
        } else {
          setRound(round + 1)
          setPoppedBalloons([])
          setIsCallingName(false)
        }
      }, 2000)
    } else {
      playSound('wrong')
      vibrate('wrong')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 px-4">
      <Dino
        mood={isCallingName ? 'calling' : 'idle'}
        size="lg"
        message={isCallingName ? `¡${childName}! Toca el globo` : 'Espera...'}
        childName={childName}
      />

      <div className="grid grid-cols-3 gap-6 w-full max-w-lg">
        {balloonColors.map((balloon, index) => (
          <AnimatePresence key={index}>
            {!poppedBalloons.includes(index) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{
                  scale: 1,
                  y: [0, -10, 0],
                }}
                exit={{
                  scale: 0,
                  rotate: 360,
                  opacity: 0,
                }}
                transition={{
                  y: {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: index * 0.2,
                  },
                }}
                onClick={() => handleBalloonClick(index)}
                className={`text-7xl cursor-pointer ${
                  isCallingName && index === correctBalloon ? 'animate-pulse' : ''
                }`}
              >
                {balloon}
              </motion.div>
            )}
          </AnimatePresence>
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