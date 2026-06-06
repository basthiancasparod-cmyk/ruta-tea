'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Lumi } from '@/components/lumi/Lumi'
import { playSound, vibrate } from '@/lib/sounds'
import { EMOTIONS, SITUATION_BY_EMOTION, shuffle, useGameStats } from '../lib/emociones-data'
import type { Scenario } from '../lib/emociones-data'

export default function CausaEfectoPage() {
  const [started, setStarted] = useState(false)
  const [targetEmotionId, setTargetEmotionId] = useState<string>('')
  const [options, setOptions] = useState<Scenario[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(0)
  const [total] = useState(8)
  const [finished, setFinished] = useState(false)
  const { stats, persist } = useGameStats('causa-efecto')

  const newRound = useCallback(() => {
    const emIds = Object.keys(SITUATION_BY_EMOTION)
    const targetId = shuffle(emIds)[0]
    setTargetEmotionId(targetId)
    const correct = shuffle(SITUATION_BY_EMOTION[targetId])[0]
    const wrong = shuffle(
      Object.entries(SITUATION_BY_EMOTION)
        .filter(([k]) => k !== targetId)
        .flatMap(([, v]) => v)
    ).slice(0, 3)
    setOptions(shuffle([correct, ...wrong]).slice(0, 4))
    setSelected(null)
  }, [])

  const startGame = useCallback(() => {
    setRound(0)
    setScore(0)
    setFinished(false)
    setStarted(true)
    newRound()
  }, [newRound])

  const handleSelect = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    const correct = options[idx]?.emotionId === targetEmotionId
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

  const targetEmotion = EMOTIONS.find(e => e.id === targetEmotionId)

  if (!started) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>← Atrás</Button>
          <h1 className="text-xl font-extrabold text-text-primary">Causa y Efecto</h1>
        </div>
        <Lumi mood="thinking" message="Dada una emoción, ¿qué situación la causó?" size="md" />
        {stats.played > 0 && <Card variant="bordered" padding="sm"><p className="text-xs text-text-muted">{stats.played} partidas · Mejor: {stats.bestScore}/{total}</p></Card>}
        <Button variant="primary" size="lg" fullWidth onClick={startGame}>Comenzar</Button>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <Lumi mood={score >= 6 ? 'excited' : 'happy'} size="lg" />
        <h2 className="text-3xl font-extrabold">{score >= 6 ? '¡Eres un experto!' : score >= 4 ? '¡Buen trabajo!' : '¡Sigue practicando!'}</h2>
        <Card variant="bordered" padding="lg">
          <p className="text-4xl font-extrabold text-brand">{score}/{total}</p>
        </Card>
        <Button variant="primary" onClick={startGame}>Jugar otra vez</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setStarted(false)}>← Atrás</Button>
        <h1 className="text-xl font-extrabold text-text-primary">Causa y Efecto</h1>
        <span className="ml-auto text-xs font-bold text-text-muted bg-surface-secondary px-2 py-1 rounded-full">{round + 1}/{total}</span>
      </div>

      <motion.div key={round} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
        <Lumi mood="thinking" message="¿Qué pudo haber causado esta emoción?" size="sm" />

        <div className="bg-white rounded-2xl border-[3px] border-border p-6 shadow-sm text-center">
          <span className="text-6xl block mb-2">{targetEmotion?.emoji}</span>
          <p className="text-xl font-extrabold text-brand">{targetEmotion?.label}</p>
        </div>

        <p className="text-sm font-bold text-text-secondary">¿Qué situación causó esta emoción?</p>

        <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
          {options.map((opt, idx) => {
            const isCorrect = opt.emotionId === targetEmotionId
            const isSelected = selected === idx
            let cls = 'bg-white border-border'
            if (selected !== null && isCorrect) cls = 'bg-green-50 border-green-400'
            else if (selected !== null && isSelected && !isCorrect) cls = 'bg-red-50 border-red-400'
            else if (selected !== null && !isCorrect) cls = 'opacity-40 bg-white border-border'
            return (
              <button key={idx} onClick={() => handleSelect(idx)} disabled={selected !== null}
                className={`text-left p-3 rounded-xl border-2 transition-all ${cls}`}>
                <p className="text-sm font-bold">{opt.situation}</p>
              </button>
            )
          })}
        </div>

        {selected !== null && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Button variant="primary" size="lg" onClick={handleNext}>
              {round < total - 1 ? 'Siguiente →' : 'Ver resultado'}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
