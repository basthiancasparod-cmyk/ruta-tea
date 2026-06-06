'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pictogram } from '@/components/ui/Pictogram'
import { Lumi } from '@/components/lumi/Lumi'
import { playSound, vibrate } from '@/lib/sounds'
import { EMOTIONS, shuffle, useGameStats } from '../lib/emociones-data'
import type { Emotion } from '../lib/emociones-data'

type Step = 'menu' | 'playing' | 'result'

export default function IdentificaPage() {
  const [step, setStep] = useState<Step>('menu')
  const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null)
  const [options, setOptions] = useState<Emotion[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(0)
  const [total] = useState(8)
  const { stats, persist } = useGameStats('identifica')

  const startGame = useCallback(() => {
    const shuffled = shuffle(EMOTIONS)
    setCurrentEmotion(shuffled[0])
    setOptions(shuffle(EMOTIONS))
    setSelected(null)
    setScore(0)
    setRound(0)
    setStep('playing')
  }, [])

  const handleSelect = (id: string) => {
    if (selected) return
    setSelected(id)
    const correct = id === currentEmotion!.id
    if (correct) { playSound('correct'); vibrate('correct'); setScore(s => s + 1) }
    else { playSound('wrong'); vibrate('wrong') }
  }

  const handleNext = () => {
    const next = round + 1
    if (next < total) {
      const shuffled = shuffle(EMOTIONS)
      setCurrentEmotion(shuffled[0])
      setOptions(shuffle(EMOTIONS))
      setSelected(null)
      setRound(next)
    } else {
      persist(score, total)
      setStep('result')
    }
  }

  if (step === 'menu') {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>← Atrás</Button>
          <h1 className="text-xl font-extrabold text-text-primary">Identifica la Emoción</h1>
        </div>
        <Lumi mood="thinking" message="Mira el pictograma y elige la emoción correcta" size="md" />
        {stats.played > 0 && (
          <Card variant="bordered" padding="sm">
            <p className="text-xs font-bold text-text-secondary mb-1">Tu progreso</p>
            <p className="text-xs text-text-muted">{stats.played} partidas · Mejor: {stats.bestScore}/{total}</p>
          </Card>
        )}
        <Button variant="primary" size="lg" fullWidth onClick={startGame}>Comenzar</Button>
      </div>
    )
  }

  if (step === 'result') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <Lumi mood={score >= 6 ? 'excited' : 'happy'} size="lg" />
        <h2 className="text-3xl font-extrabold">{score >= 7 ? '¡Increíble!' : score >= 5 ? '¡Buen trabajo!' : '¡Sigue practicando!'}</h2>
        <Card variant="bordered" padding="lg">
          <p className="text-4xl font-extrabold text-brand">{score}/{total}</p>
          <p className="text-sm text-text-secondary">emociones identificadas</p>
        </Card>
        <div className="flex gap-3">
          <Button variant="primary" onClick={startGame}>Jugar otra vez</Button>
          <Button variant="outline" onClick={() => setStep('menu')}>Menú</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setStep('menu')}>← Atrás</Button>
        <h1 className="text-xl font-extrabold text-text-primary">Identifica</h1>
        <span className="ml-auto text-xs font-bold text-text-muted bg-surface-secondary px-2 py-1 rounded-full">{round + 1}/{total}</span>
      </div>

      <motion.div key={round} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-center gap-6">
        <Lumi mood="thinking" message="¿Qué emoción es?" size="sm" />
        <div className="bg-white rounded-2xl border-[3px] border-border p-6 shadow-sm">
          {currentEmotion && <Pictogram keyword={currentEmotion.pictogram} size={140} />}
        </div>
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          <AnimatePresence>
            {options.map((em) => {
              const isCorrect = em.id === currentEmotion!.id
              const isSelected = selected === em.id
              let cls = 'bg-white border-border'
              if (selected && isCorrect) cls = 'bg-green-50 border-green-400'
              else if (selected && isSelected && !isCorrect) cls = 'bg-red-50 border-red-400'
              else if (selected && !isCorrect) cls = 'opacity-40 bg-white border-border'
              return (
                <motion.div key={em.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <Card variant="default" padding="sm" onClick={() => handleSelect(em.id)} className={`cursor-pointer text-center border-2 transition-all ${cls}`}>
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
            <div className={`px-6 py-3 rounded-xl font-extrabold text-lg ${selected === currentEmotion!.id ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {selected === currentEmotion!.id ? '¡Correcto! 🎉' : `Es ${currentEmotion!.label} ${currentEmotion!.emoji}`}
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
