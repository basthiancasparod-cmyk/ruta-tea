'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino } from '@/components/dino'
import { playSound, vibrate } from '@/lib/sounds'

interface SequenceChallengeExerciseProps {
  childName: string
  onComplete: (success: boolean) => void
}

const COLORS = [
  { bg: '#FF6B6B', active: '#FF8E8E', emoji: '🔴', label: 'Rojo' },
  { bg: '#4ECDC4', active: '#7EDDD6', emoji: '🟢', label: 'Verde' },
  { bg: '#45B7D1', active: '#78CCE0', emoji: '🔵', label: 'Azul' },
  { bg: '#FFD93D', active: '#FFE680', emoji: '🟡', label: 'Amarillo' },
]

export function SequenceChallengeExercise({ childName, onComplete }: SequenceChallengeExerciseProps) {
  const [phase, setPhase] = useState<'intro' | 'watching' | 'input' | 'feedback'>('intro')
  const [sequence, setSequence] = useState<number[]>([])
  const [playerIndex, setPlayerIndex] = useState(0)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(0)
  const [lives, setLives] = useState(3)
  const [flashIndex, setFlashIndex] = useState(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startRound = () => {
    const newSeq = [...sequence, Math.floor(Math.random() * COLORS.length)]
    setSequence(newSeq)
    setPlayerIndex(0)
    setPhase('watching')
  }

  const playSequence = () => {
    setFlashIndex(0)
    let i = 0
    const interval = setInterval(() => {
      if (i < sequence.length) {
        setActiveIndex(sequence[i])
        playSound('correct')
        setTimeout(() => setActiveIndex(null), 400)
        i++
        setFlashIndex(i)
      } else {
        clearInterval(interval)
        setPhase('input')
        setPlayerIndex(0)
        setActiveIndex(null)
      }
    }, 800)
  }

  useEffect(() => {
    if (phase === 'watching' && sequence.length > 0) {
      setTimeout(() => playSequence(), 500)
    }
  }, [phase])

  const handleStart = () => {
    const firstSeq = [Math.floor(Math.random() * COLORS.length)]
    setSequence(firstSeq)
    setPhase('watching')
    playSound('celebration')
  }

  const handleColorClick = (index: number) => {
    if (phase !== 'input') return
    setActiveIndex(index)
    playSound('correct')

    const isCorrect = index === sequence[playerIndex]

    if (!isCorrect) {
      const newLives = lives - 1
      setLives(newLives)
      setPhase('feedback')
      playSound('wrong')
      vibrate('wrong')
      setTimeout(() => setActiveIndex(null), 300)

      setTimeout(() => {
        if (newLives <= 0) {
          onComplete(score >= 3)
        } else {
          setPhase('watching')
          setPlayerIndex(0)
        }
      }, 2000)
      return
    }

    setTimeout(() => setActiveIndex(null), 300)

    const nextIdx = playerIndex + 1
    if (nextIdx >= sequence.length) {
      setScore(score + 1)
      setPhase('feedback')
      playSound('celebration')
      vibrate('celebration')

      setTimeout(() => {
        if (round >= 4) {
          onComplete(score >= 3)
        } else {
          setRound(round + 1)
          startRound()
        }
      }, 1500)
    } else {
      setPlayerIndex(nextIdx)
    }
  }

  if (phase === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4">
        <Dino mood="excited" size="xl" message={`¡${childName}! El desafío final`} childName={childName} />
        <p className="text-lg font-bold text-text-secondary text-center max-w-xs">
          Memoria la secuencia de colores. ¡Cada ronda es más larga!
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className="bg-gradient-to-r from-brand to-brand-dark text-white font-extrabold px-12 py-4 rounded-2xl text-xl shadow-lg"
        >
          ¡Comenzar! 🎮
        </motion.button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4">
      <Dino
        mood={phase === 'feedback' ? 'celebrating' : phase === 'input' ? 'calling' : 'idle'}
        size="md"
        message={
          phase === 'watching'
            ? 'Observa la secuencia...'
            : phase === 'input'
              ? `¡${childName}! Repite la secuencia`
              : '¡Bien hecho!'
        }
        childName={childName}
      />

      {/* Vidas */}
      <div className="flex gap-1">
        {[...Array(3)].map((_, i) => (
          <span key={i} className={`text-2xl ${i < lives ? '' : 'opacity-20'}`}>
            ❤️
          </span>
        ))}
      </div>

      {/* Grid de colores */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        {COLORS.map((color, index) => (
          <motion.button
            key={`${round}-${index}`}
            animate={{
              scale: activeIndex === index ? 1.1 : 1,
              opacity: phase === 'watching' ? 0.7 : 1,
            }}
            whileHover={phase === 'input' ? { scale: 1.05 } : {}}
            whileTap={phase === 'input' ? { scale: 0.95 } : {}}
            onClick={() => handleColorClick(index)}
            disabled={phase !== 'input'}
            className={`aspect-square rounded-3xl flex items-center justify-center text-5xl shadow-lg transition-shadow ${
              phase === 'input' ? 'cursor-pointer hover:shadow-xl' : ''
            }`}
            style={{
              backgroundColor: activeIndex === index ? color.active : color.bg,
              boxShadow: activeIndex === index ? `0 0 30px ${color.bg}80` : `0 4px 15px ${color.bg}40`,
            }}
          >
            <motion.span
              animate={activeIndex === index ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {color.emoji}
            </motion.span>
          </motion.button>
        ))}
      </div>

      {/* Progreso */}
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i < round
                ? 'bg-success'
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
