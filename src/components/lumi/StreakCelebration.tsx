'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Lumi } from '@/components/lumi/Lumi'
import { playSound, vibrate } from '@/lib/sounds'

const milestones = [
  { days: 3, label: '¡3 días seguidos!', emoji: '🔥' },
  { days: 7, label: '¡Una semana!', emoji: '📅' },
  { days: 14, label: '¡Dos semanas!', emoji: '🎯' },
  { days: 30, label: '¡Un mes!', emoji: '🏆' },
  { days: 60, label: '¡Dos meses!', emoji: '💪' },
  { days: 100, label: '¡100 días!', emoji: '🌟' },
]

interface Props {
  currentStreak: number
  previousStreak?: number
}

export function StreakCelebration({ currentStreak, previousStreak = 0 }: Props) {
  const [show, setShow] = useState(false)
  const [milestone, setMilestone] = useState<typeof milestones[0] | null>(null)

  useEffect(() => {
    if (currentStreak <= previousStreak) return
    const hit = milestones.find(m => m.days === currentStreak)
    if (hit) {
      setMilestone(hit)
      setShow(true)
      playSound('streak')
      vibrate('streak')
      const timer = setTimeout(() => setShow(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [currentStreak, previousStreak])

  return (
    <AnimatePresence>
      {show && milestone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
        >
          <motion.div
            className="bg-surface rounded-2xl p-8 text-center shadow-xl max-w-xs mx-4"
            animate={{ rotate: [0, -2, 2, -2, 0] }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: 2 }}
            >
              <Lumi mood="excited" size="lg" />
            </motion.div>
            <motion.p
              className="text-4xl mt-4"
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ duration: 0.8 }}
            >
              {milestone.emoji}
            </motion.p>
            <h3 className="text-2xl font-extrabold text-text-primary mt-3">
              {milestone.label}
            </h3>
            <p className="text-text-secondary mt-2 text-sm">
              ¡Sigue así, vas increíble!
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShow(false)}
              className="mt-6 bg-brand text-white font-bold px-8 py-3 rounded-xl shadow-[0_3px_0_#3A9A87] active:translate-y-[3px] active:shadow-none transition-all"
            >
              ¡Gracias, Lumi!
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
