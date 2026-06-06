'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Lumi } from '@/components/lumi/Lumi'
import { playSound, vibrate } from '@/lib/sounds'
import { EMOTIONS, SCENARIOS, shuffle, useGameStats } from '../lib/emociones-data'
import type { Scenario } from '../lib/emociones-data'

export default function SituacionesPage() {
  const [started, setStarted] = useState(false)
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [current, setCurrent] = useState(0)
  const [options, setOptions] = useState<typeof EMOTIONS>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const { stats, persist } = useGameStats('situaciones')

  const startGame = useCallback(() => {
    const s = shuffle(SCENARIOS).slice(0, 10)
    setScenarios(s)
    setCurrent(0)
    setOptions(shuffle(EMOTIONS))
    setSelected(null)
    setScore(0)
    setFinished(false)
    setStarted(true)
  }, [])

  const handleSelect = (id: string) => {
    if (selected) return
    setSelected(id)
    if (id === scenarios[current].emotionId) { playSound('correct'); vibrate('correct'); setScore(s => s + 1) }
    else { playSound('wrong'); vibrate('wrong') }
  }

  const handleNext = () => {
    const next = current + 1
    if (next < scenarios.length) {
      setCurrent(next)
      setOptions(shuffle(EMOTIONS))
      setSelected(null)
    } else {
      persist(score, scenarios.length)
      setFinished(true)
    }
  }

  if (!started) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>← Atrás</Button>
          <h1 className="text-xl font-extrabold text-text-primary">Situaciones y Emociones</h1>
        </div>
        <Lumi mood="thinking" message="Te contamos una situación. ¿Cómo te sentirías?" size="md" />
        {stats.played > 0 && (
          <Card variant="bordered" padding="sm">
            <p className="text-xs text-text-muted">{stats.played} partidas · Mejor: {stats.bestScore}/{10}</p>
          </Card>
        )}
        <Button variant="primary" size="lg" fullWidth onClick={startGame}>Comenzar</Button>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <Lumi mood={score >= 7 ? 'excited' : 'happy'} size="lg" />
        <h2 className="text-3xl font-extrabold">{score >= 8 ? '¡Increíble! 🌟' : score >= 5 ? '¡Buen trabajo! 👏' : '¡Sigue practicando! 💪'}</h2>
        <Card variant="bordered" padding="lg">
          <p className="text-4xl font-extrabold text-brand">{score}/{scenarios.length}</p>
          <p className="text-sm text-text-secondary">situaciones correctas</p>
        </Card>
        <div className="flex gap-3">
          <Button variant="primary" onClick={startGame}>Jugar otra vez</Button>
          <Button variant="outline" onClick={() => setStarted(false)}>Menú</Button>
        </div>
      </div>
    )
  }

  const s = scenarios[current]

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setStarted(false)}>← Atrás</Button>
        <h1 className="text-xl font-extrabold text-text-primary">Situaciones</h1>
        <span className="ml-auto text-xs font-bold text-text-muted bg-surface-secondary px-2 py-1 rounded-full">{current + 1}/{scenarios.length}</span>
      </div>

      <motion.div key={current} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6">
        <Lumi mood="thinking" message={s.situation} size="md" />
        <Card variant="bordered" padding="lg" className="text-center w-full max-w-xs">
          <p className="font-bold text-lg text-text-primary">{s.situation}</p>
          <p className="text-sm text-text-secondary mt-2">¿Cómo te sientes?</p>
        </Card>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          <AnimatePresence>
            {options.map((em) => {
              const isCorrect = em.id === s.emotionId
              const isSelected = selected === em.id
              let cls = 'bg-white border-border'
              if (selected && isCorrect) cls = 'bg-green-50 border-green-400'
              else if (selected && isSelected && !isCorrect) cls = 'bg-red-50 border-red-400'
              else if (selected && !isCorrect) cls = 'opacity-40 bg-white border-border'
              return (
                <motion.div key={em.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <Card onClick={() => handleSelect(em.id)} className={`cursor-pointer text-center border-2 transition-all ${cls}`}>
                    <span className="text-2xl block mb-1">{em.emoji}</span>
                    <span className="text-sm font-bold">{em.label}</span>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {selected && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
            <div className={`px-6 py-3 rounded-xl font-extrabold text-lg ${selected === s.emotionId ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {selected === s.emotionId ? '¡Correcto! 🎉' : `Es ${EMOTIONS.find(e => e.id === s.emotionId)?.label} ${EMOTIONS.find(e => e.id === s.emotionId)?.emoji}`}
            </div>
            <Button variant="primary" size="lg" onClick={handleNext} className="mt-3">
              {current < scenarios.length - 1 ? 'Siguiente →' : 'Ver resultado'}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
