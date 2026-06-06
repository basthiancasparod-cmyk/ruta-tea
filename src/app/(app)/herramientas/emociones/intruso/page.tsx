'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Lumi } from '@/components/lumi/Lumi'
import { playSound, vibrate } from '@/lib/sounds'
import { EMOTIONS, shuffle, useGameStats } from '../lib/emociones-data'
import type { Emotion } from '../lib/emociones-data'

export default function IntrusoPage() {
  const [started, setStarted] = useState(false)
  const [group, setGroup] = useState<Emotion[]>([])
  const [intrusoId, setIntrusoId] = useState<string>('')
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(0)
  const [total] = useState(8)
  const [finished, setFinished] = useState(false)
  const [category, setCategory] = useState('')
  const { stats, persist } = useGameStats('intruso')

  const newRound = useCallback(() => {
    const alta = EMOTIONS.filter(e => e.energy === 'alta')
    const baja = EMOTIONS.filter(e => e.energy === 'baja')
    const useAlta = Math.random() > 0.5
    const mainEnergy = useAlta ? alta : baja
    const otherEnergy = useAlta ? baja : alta
    const mainGroup = shuffle(mainEnergy).slice(0, 3)
    const intr = shuffle(otherEnergy)[0]
    setIntrusoId(intr.id)
    setGroup(shuffle([...mainGroup, intr]))
    setCategory(useAlta ? 'alta energía ⚡' : 'baja energía 😌')
    setSelected(null)
  }, [])

  const startGame = useCallback(() => {
    setRound(0)
    setScore(0)
    setFinished(false)
    setStarted(true)
    newRound()
  }, [newRound])

  const handleSelect = (id: string) => {
    if (selected) return
    setSelected(id)
    const correct = id === intrusoId
    if (correct) { playSound('correct'); vibrate('correct'); setScore(s => s + 1) }
    else { playSound('wrong'); vibrate('wrong') }
  }

  const handleNext = () => {
    const next = round + 1
    if (next < total) {
      setRound(next)
      newRound()
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
          <h1 className="text-xl font-extrabold text-text-primary">El Intruso</h1>
        </div>
        <Lumi mood="thinking" message="Hay 3 emociones similares y 1 diferente. Encuentra el intruso." size="md" />
        {stats.played > 0 && <Card variant="bordered" padding="sm"><p className="text-xs text-text-muted">{stats.played} partidas · Mejor: {stats.bestScore}/{total}</p></Card>}
        <Button variant="primary" size="lg" fullWidth onClick={startGame}>Comenzar</Button>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <Lumi mood={score >= 6 ? 'excited' : 'happy'} size="lg" />
        <h2 className="text-3xl font-extrabold">{score >= 7 ? '¡Eres un gran detective!' : score >= 4 ? '¡Buen trabajo!' : '¡Sigue practicando!'}</h2>
        <Card variant="bordered" padding="lg">
          <p className="text-4xl font-extrabold text-brand">{score}/{total}</p>
          <p className="text-sm text-text-secondary">intrusos encontrados</p>
        </Card>
        <Button variant="primary" onClick={startGame}>Jugar otra vez</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setStarted(false)}>← Atrás</Button>
        <h1 className="text-xl font-extrabold text-text-primary">Intruso</h1>
        <span className="ml-auto text-xs font-bold text-text-muted bg-surface-secondary px-2 py-1 rounded-full">{round + 1}/{total}</span>
      </div>

      <motion.div key={round} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6">
        <Lumi mood="thinking" message="¿Cuál es el intruso?" size="sm" />
        <p className="text-sm text-text-secondary text-center max-w-xs">
          Tres emociones son de <strong>{category}</strong> y una no. ¿Cuál es el <strong className="text-brand">intruso</strong>?
        </p>

        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          <AnimatePresence>
            {group.map((em) => {
              const isIntruso = em.id === intrusoId
              const isSelected = selected === em.id
              let cls = 'bg-white border-border'
              if (selected) {
                if (isIntruso && isSelected) cls = 'bg-green-50 border-green-400'
                else if (!isIntruso && isSelected) cls = 'bg-red-50 border-red-400'
                else cls = 'opacity-40 bg-white border-border'
              }
              return (
                <motion.div key={em.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                  <Card onClick={() => handleSelect(em.id)} className={`cursor-pointer text-center border-2 transition-all ${cls}`}>
                    <span className="text-4xl block mb-1">{em.emoji}</span>
                    <span className="text-sm font-bold">{em.label}</span>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {selected && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
            <div className={`px-6 py-3 rounded-xl font-extrabold text-lg ${selected === intrusoId ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {selected === intrusoId ? '¡Correcto! 🎉' : `El intruso era ${EMOTIONS.find(e => e.id === intrusoId)?.label} ${EMOTIONS.find(e => e.id === intrusoId)?.emoji}`}
            </div>
            <Button variant="primary" size="lg" onClick={handleNext} className="mt-3">
              {round < total - 1 ? 'Siguiente →' : 'Ver resultado'}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
