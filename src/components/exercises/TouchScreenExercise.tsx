'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino } from '@/components/dino'
import { playSound, vibrate } from '@/lib/sounds'

interface TouchScreenExerciseProps {
  childName: string
  onComplete: (success: boolean) => void
}

export function TouchScreenExercise({ childName, onComplete }: TouchScreenExerciseProps) {
  const [phase, setPhase] = useState<'waiting' | 'calling' | 'success'>('waiting')
  const [callCount, setCallCount] = useState(0)

  useEffect(() => {
    // Espera 2 segundos y luego llama al niño
    const timer = setTimeout(() => {
      setPhase('calling')
      playSound('correct') // Simula voz llamando
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleTouch = () => {
    if (phase === 'calling') {
      setPhase('success')
      playSound('celebration')
      vibrate('celebration')
      
      const newCount = callCount + 1
      setCallCount(newCount)

      // Después de 3 llamados exitosos, completa el ejercicio
      if (newCount >= 3) {
        setTimeout(() => {
          onComplete(true)
        }, 2000)
      } else {
        // Resetea para otra ronda
        setTimeout(() => {
          setPhase('waiting')
          setTimeout(() => {
            setPhase('calling')
            playSound('correct')
          }, 1500)
        }, 2000)
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4">
      <AnimatePresence mode="wait">
        {phase === 'waiting' && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center"
          >
            <Dino mood="idle" size="xl" />
          </motion.div>
        )}

        {phase === 'calling' && (
          <motion.div
            key="calling"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleTouch}
            className="cursor-pointer"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Dino
                mood="calling"
                size="xl"
                message={`¡${childName}! ¡Toca aquí!`}
                childName={childName}
              />
            </motion.div>

            {/* Indicador visual de toque */}
            <motion.div
              className="mt-8 mx-auto w-32 h-32 rounded-full border-8 border-brand flex items-center justify-center"
              animate={{
                scale: [1, 1.2, 1],
                borderColor: ['#8B5CF6', '#A78BFA', '#8B5CF6'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              <span className="text-6xl">👆</span>
            </motion.div>
          </motion.div>
        )}

        {phase === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="text-center"
          >
            <Dino mood="celebrating" size="xl" message="¡Muy bien!" childName={childName} />
            
            {/* Confetti */}
            <div className="relative">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 1,
                    scale: 0,
                  }}
                  animate={{
                    x: (Math.random() - 0.5) * 400,
                    y: Math.random() * -300,
                    opacity: 0,
                    scale: 1,
                    rotate: Math.random() * 360,
                  }}
                  transition={{
                    duration: 1.5,
                    ease: 'easeOut',
                  }}
                >
                  {['🎉', '⭐', '✨', '🌟'][Math.floor(Math.random() * 4)]}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contador de progreso */}
      <div className="flex gap-2 mt-8">
        {[1, 2, 3].map((num) => (
          <div
            key={num}
            className={`w-4 h-4 rounded-full ${
              callCount >= num ? 'bg-success' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}