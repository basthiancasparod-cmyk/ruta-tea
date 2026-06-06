'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Lumi } from '@/components/lumi/Lumi'
import { playSound, vibrate } from '@/lib/sounds'
import { EMOTIONS, ENERGY_LEVELS, shuffle, useGameStats } from '../lib/emociones-data'
import type { Emotion } from '../lib/emociones-data'

export default function ClasificaPage() {
  const [started, setStarted] = useState(false)
  const [emotionsToSort, setEmotionsToSort] = useState<Emotion[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const { stats, persist } = useGameStats('clasifica')

  const startGame = useCallback(() => {
    setEmotionsToSort(shuffle(EMOTIONS))
    setCurrentIdx(0)
    setScore(0)
    setFinished(false)
    setShowFeedback(false)
    setStarted(true)
  }, [])

  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)

  const handleEnergyClick = (energy: string) => {
    if (showFeedback) return
    const current = emotionsToSort[currentIdx]
    const correct = current.energy === energy
    if (correct) { playSound('correct'); vibrate('correct'); setScore(s => s + 1) }
    else { playSound('wrong'); vibrate('wrong') }
    setLastCorrect(correct)
    setShowFeedback(true)
  }

  const handleNext = () => {
    const next = currentIdx + 1
    if (next < emotionsToSort.length) {
      setCurrentIdx(next)
      setShowFeedback(false)
    } else {
      persist(score, emotionsToSort.length)
      setFinished(true)
    }
  }

  const current = emotionsToSort[currentIdx]

  if (!started) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>← Atrás</Button>
          <h1 className="text-xl font-extrabold text-text-primary">Clasifica por Energía</h1>
        </div>
        <Lumi mood="thinking" message="¿La emoción es de alta o baja energía?" size="md" />
        {stats.played > 0 && <Card variant="bordered" padding="sm"><p className="text-xs text-text-muted">{stats.played} partidas · Mejor: {stats.bestScore}/{EMOTIONS.length}</p></Card>}
        <Button variant="primary" size="lg" fullWidth onClick={startGame}>Comenzar</Button>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <Lumi mood={score >= 6 ? 'excited' : 'happy'} size="lg" />
        <h2 className="text-3xl font-extrabold">{score >= 7 ? '¡Clasificación perfecta!' : score >= 4 ? '¡Buen trabajo!' : '¡Sigue practicando!'}</h2>
        <Card variant="bordered" padding="lg">
          <p className="text-4xl font-extrabold text-brand">{score}/{EMOTIONS.length}</p>
        </Card>
        <Button variant="primary" onClick={startGame}>Jugar otra vez</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setStarted(false)}>← Atrás</Button>
        <h1 className="text-xl font-extrabold text-text-primary">Clasifica</h1>
        <span className="ml-auto text-xs font-bold text-text-muted bg-surface-secondary px-2 py-1 rounded-full">{currentIdx + 1}/{emotionsToSort.length}</span>
      </div>

      <motion.div key={currentIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6">
        <Lumi mood="thinking" message="¿Alta o baja energía?" size="sm" />

        <div className="bg-white rounded-2xl border-[3px] border-border p-6 shadow-sm text-center">
          <span className="text-6xl block mb-2">{current.emoji}</span>
          <p className="text-xl font-extrabold">{current.label}</p>
        </div>

          {showFeedback && (
          <div className={`px-6 py-3 rounded-xl font-extrabold text-lg ${lastCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <span className="block text-center">
              {lastCorrect ? '✓ ' : '✗ '}
              {current.label} es energía <strong>{current.energy === 'alta' ? 'ALTA ⚡' : 'BAJA 😌'}</strong>
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {ENERGY_LEVELS.map(el => (
            <button key={el.id} onClick={() => handleEnergyClick(el.id)} disabled={showFeedback}
              className={`p-6 rounded-xl border-2 text-center transition-all ${showFeedback ? 'opacity-30' : 'bg-white border-border hover:border-brand hover:bg-brand-bg'}`}>
              <span className="text-4xl block mb-2">{el.emoji}</span>
              <p className="font-extrabold text-sm">{el.label}</p>
              <p className="text-[10px] text-text-muted mt-1">{el.desc}</p>
            </button>
          ))}
        </div>

        {showFeedback && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Button variant="primary" size="lg" onClick={handleNext}>
              {currentIdx < emotionsToSort.length - 1 ? 'Siguiente →' : 'Ver resultado'}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
