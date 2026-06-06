'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Lumi } from '@/components/lumi/Lumi'
import { playSound, vibrate } from '@/lib/sounds'
import { EMOTIONS, SCENARIOS, shuffle, useGameStats } from '../lib/emociones-data'
import type { Emotion, Scenario } from '../lib/emociones-data'

export default function RuletaPage() {
  const [started, setStarted] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null)
  const [situations, setSituations] = useState<Scenario[]>([])
  const [selectedSit, setSelectedSit] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(0)
  const [total] = useState(6)
  const [finished, setFinished] = useState(false)
  const { stats, persist } = useGameStats('ruleta')

  const spinWheel = useCallback(() => {
    if (spinning) return
    setSpinning(true)
    playSound('click')
    setTimeout(() => {
      const em = shuffle(EMOTIONS)[0]
      setCurrentEmotion(em)
      const correct = shuffle(SCENARIOS.filter(sc => sc.emotionId === em.id)).slice(0, 2)
      const wrong = shuffle(SCENARIOS.filter(sc => sc.emotionId !== em.id)).slice(0, 2)
      setSituations(shuffle([...correct, ...wrong]))
      setSelectedSit(null)
      setSpinning(false)
    }, 2000)
  }, [spinning])

  const startGame = useCallback(() => {
    setRound(0)
    setScore(0)
    setFinished(false)
    setStarted(true)
    setCurrentEmotion(null)
    setSituations([])
    setSelectedSit(null)
  }, [])

  const handleSelect = (idx: number) => {
    if (selectedSit !== null) return
    setSelectedSit(idx)
    const correct = situations[idx]?.emotionId === currentEmotion!.id
    if (correct) { playSound('correct'); vibrate('correct'); setScore(s => s + 1) }
    else { playSound('wrong'); vibrate('wrong') }
  }

  const handleNext = () => {
    const next = round + 1
    if (next < total) {
      setRound(next)
      setCurrentEmotion(null)
      setSituations([])
      setSelectedSit(null)
    } else {
      persist(score, total)
      setFinished(true)
    }
  }

  if (!started) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>← Atrás</Button>
          <h1 className="text-xl font-extrabold text-text-primary">Ruleta de Emociones</h1>
        </div>
        <Lumi mood="excited" message="Gira la ruleta y encuentra una situación para esa emoción" size="md" />
        {stats.played > 0 && (
          <Card variant="bordered" padding="sm">
            <p className="text-xs text-text-muted">{stats.played} partidas · Mejor: {stats.bestScore}/{total}</p>
          </Card>
        )}
        <Button variant="primary" size="lg" fullWidth onClick={startGame}>Comenzar</Button>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <Lumi mood={score >= 4 ? 'excited' : 'happy'} size="lg" />
        <h2 className="text-3xl font-extrabold">{score >= 5 ? '¡Increíble!' : score >= 3 ? '¡Buen trabajo!' : '¡Sigue practicando!'}</h2>
        <Card variant="bordered" padding="lg">
          <p className="text-4xl font-extrabold text-brand">{score}/{total}</p>
          <p className="text-sm text-text-secondary">ruletas acertadas</p>
        </Card>
        <Button variant="primary" onClick={startGame}>Jugar otra vez</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setStarted(false)}>← Atrás</Button>
        <h1 className="text-xl font-extrabold text-text-primary">Ruleta</h1>
        <span className="ml-auto text-xs font-bold text-text-muted bg-surface-secondary px-2 py-1 rounded-full">{round + 1}/{total}</span>
      </div>

      <div className="flex flex-col items-center gap-6">
        {!currentEmotion ? (
          <div className="flex flex-col items-center gap-4">
            <Lumi mood="excited" message="¡Gira la ruleta!" size="md" />
            <motion.button onClick={spinWheel} disabled={spinning}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-brand to-brand-dark text-white text-5xl shadow-lg flex items-center justify-center disabled:opacity-50"
              animate={spinning ? { rotate: 360 } : { rotate: 0 }}
              transition={spinning ? { duration: 2, ease: 'easeOut' } : {}}>
              🎡
            </motion.button>
          </div>
        ) : (
          <motion.div key={round} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 w-full">
            <Lumi mood="thinking" message={`¿Qué situación causa ${currentEmotion.label}?`} size="sm" />
            <div className="bg-white rounded-2xl border-[3px] border-border p-4 shadow-sm text-center">
              <span className="text-6xl block mb-2">{currentEmotion.emoji}</span>
              <p className="text-xl font-extrabold text-brand">{currentEmotion.label}</p>
            </div>

            <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
              {situations.map((sit, idx) => {
                const isCorrect = sit.emotionId === currentEmotion.id
                const isSelected = selectedSit === idx
                let cls = 'bg-white border-border'
                if (selectedSit !== null && isCorrect) cls = 'bg-green-50 border-green-400'
                else if (selectedSit !== null && isSelected && !isCorrect) cls = 'bg-red-50 border-red-400'
                else if (selectedSit !== null && !isCorrect) cls = 'opacity-40 bg-white border-border'
                return (
                  <button key={idx} onClick={() => handleSelect(idx)}
                    disabled={selectedSit !== null}
                    className={`text-left p-3 rounded-xl border-2 transition-all ${cls}`}>
                    <p className="text-sm font-bold">{sit.situation}</p>
                  </button>
                )
              })}
            </div>

            {selectedSit !== null && (
              <Button variant="primary" onClick={handleNext}>
                {round < total - 1 ? 'Siguiente →' : 'Ver resultado'}
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
