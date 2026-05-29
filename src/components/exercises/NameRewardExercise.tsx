'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino } from '@/components/dino'
import { playSound, vibrate } from '@/lib/sounds'

interface NameRewardExerciseProps {
  childName: string
  onComplete: (success: boolean) => void
}

const REWARDS = ['⭐', '🌟', '🎉', '🎊', '🏆', '💎', '🌈', '🦋']

export function NameRewardExercise({ childName, onComplete }: NameRewardExerciseProps) {
  const [phase, setPhase] = useState<'waiting' | 'calling' | 'reward' | 'done'>('waiting')
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [reward, setReward] = useState('⭐')

  useEffect(() => {
    if (phase === 'waiting') {
      const timer = setTimeout(() => {
        setPhase('calling')
        playSound('correct')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [phase])

  const handleResponse = () => {
    if (phase !== 'calling') return
    const earned = REWARDS[Math.floor(Math.random() * REWARDS.length)]
    setReward(earned)
    setPhase('reward')
    playSound('celebration')
    vibrate('celebration')
    setScore(score + 1)

    setTimeout(() => {
      if (round >= 4) {
        setPhase('done')
        setTimeout(() => onComplete(score >= 3), 2000)
      } else {
        setRound(round + 1)
        setPhase('waiting')
      }
    }, 2500)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 px-4">
      <AnimatePresence mode="wait">
        {phase === 'waiting' && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Dino mood="idle" size="xl" message="Escucha atentamente..." />
          </motion.div>
        )}

        {phase === 'calling' && (
          <motion.div
            key="calling"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleResponse}
            className="cursor-pointer"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <Dino
                mood="calling"
                size="xl"
                message={`¡${childName}! ¡Toca para recibir tu recompensa!`}
                childName={childName}
              />
            </motion.div>
            <motion.div
              className="mt-8 mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center shadow-xl"
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: ['0 0 20px rgba(234,179,8,0.3)', '0 0 40px rgba(234,179,8,0.6)', '0 0 20px rgba(234,179,8,0.3)'],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="text-6xl">🎁</span>
            </motion.div>
          </motion.div>
        )}

        {phase === 'reward' && (
          <motion.div
            key="reward"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="text-8xl mb-4"
            >
              {reward}
            </motion.div>
            <Dino mood="celebrating" size="lg" message="¡Recompensa ganada!" childName={childName} />

            <div className="mt-6 relative">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                  animate={{
                    x: (Math.random() - 0.5) * 300,
                    y: -Math.random() * 250 - 50,
                    opacity: 0,
                    scale: 1,
                    rotate: Math.random() * 360,
                  }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: i * 0.05 }}
                >
                  {['✨', '⭐', '🌟', '💫'][Math.floor(Math.random() * 4)]}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Dino mood="celebrating" size="xl" message="¡Completaste todas las recompensas!" childName={childName} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 mt-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i < round ? 'bg-success' : i === round ? 'bg-brand' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
