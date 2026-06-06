'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Lumi } from '@/components/lumi/Lumi'
import { playSound, vibrate } from '@/lib/sounds'
import { EMOTIONS, shuffle, useGameStats } from '../lib/emociones-data'

type Intensity = 'bajo' | 'medio' | 'alto'

const INTENSITY_LEVELS: { id: Intensity; label: string; emoji: string; color: string }[] = [
  { id: 'bajo', label: 'Bajo', emoji: '😌', color: 'bg-green-100 border-green-400 text-green-700' },
  { id: 'medio', label: 'Medio', emoji: '😐', color: 'bg-amber-100 border-amber-400 text-amber-700' },
  { id: 'alto', label: 'Alto', emoji: '😲', color: 'bg-red-100 border-red-400 text-red-700' },
]

const SITUATIONS_WITH_INTENSITY: { sit: string; intensity: Intensity; emotionId: string }[] = [
  { sit: 'Se te cayó un lápiz', intensity: 'bajo', emotionId: 'triste' },
  { sit: 'Te gustó la comida', intensity: 'bajo', emotionId: 'alegre' },
  { sit: 'Viste un perro bonito', intensity: 'bajo', emotionId: 'alegre' },
  { sit: 'Tu amigo no te prestó un juguete', intensity: 'medio', emotionId: 'triste' },
  { sit: 'Ganaste un premio pequeño', intensity: 'medio', emotionId: 'alegre' },
  { sit: 'Alguien te empujó sin querer', intensity: 'medio', emotionId: 'enojado' },
  { sit: 'Se perdió tu peluche favorito', intensity: 'alto', emotionId: 'triste' },
  { sit: 'Te llevaron a tu restaurante favorito', intensity: 'alto', emotionId: 'alegre' },
  { sit: 'Rompieron tu juguete a propósito', intensity: 'alto', emotionId: 'enojado' },
  { sit: 'Viste una araña grande', intensity: 'alto', emotionId: 'asustado' },
  { sit: 'Hay un ruido pequeño', intensity: 'bajo', emotionId: 'asustado' },
  { sit: 'Te dijeron que mañana hay examen', intensity: 'medio', emotionId: 'nervioso' },
]

export default function TermometroPage() {
  const [started, setStarted] = useState(false)
  const [items, setItems] = useState<typeof SITUATIONS_WITH_INTENSITY>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<Intensity | null>(null)
  const [score, setScore] = useState(0)
  const [total] = useState(8)
  const [finished, setFinished] = useState(false)
  const { stats, persist } = useGameStats('termometro')

  const startGame = useCallback(() => {
    setItems(shuffle(SITUATIONS_WITH_INTENSITY).slice(0, total))
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
    setStarted(true)
  }, [])

  const handleSelect = (i: Intensity) => {
    if (selected) return
    setSelected(i)
    const correct = i === items[current].intensity
    if (correct) { playSound('correct'); vibrate('correct'); setScore(s => s + 1) }
    else { playSound('wrong'); vibrate('wrong') }
  }

  const handleNext = () => {
    const next = current + 1
    if (next < items.length) {
      setCurrent(next)
      setSelected(null)
    } else {
      persist(score, total)
      setFinished(true)
    }
  }

  const item = items[current]
  const emotion = EMOTIONS.find(e => e.id === item?.emotionId)

  if (!started) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>← Atrás</Button>
          <h1 className="text-xl font-extrabold text-text-primary">Termómetro de Intensidad</h1>
        </div>
        <Lumi mood="thinking" message="¿Qué tan fuerte sientes cada emoción?" size="md" />
        {stats.played > 0 && <Card variant="bordered" padding="sm"><p className="text-xs text-text-muted">{stats.played} partidas · Mejor: {stats.bestScore}/{total}</p></Card>}
        <Button variant="primary" size="lg" fullWidth onClick={startGame}>Comenzar</Button>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <Lumi mood={score >= 6 ? 'excited' : 'happy'} size="lg" />
        <h2 className="text-3xl font-extrabold">{score >= 6 ? '¡Perfecto!' : score >= 4 ? '¡Bien!' : '¡Sigue practicando!'}</h2>
        <Card variant="bordered" padding="lg">
          <p className="text-4xl font-extrabold text-brand">{score}/{total}</p>
          <p className="text-sm text-text-secondary">intensidades correctas</p>
        </Card>
        <Button variant="primary" onClick={startGame}>Jugar otra vez</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setStarted(false)}>← Atrás</Button>
        <h1 className="text-xl font-extrabold text-text-primary">Termómetro</h1>
        <span className="ml-auto text-xs font-bold text-text-muted bg-surface-secondary px-2 py-1 rounded-full">{current + 1}/{items.length}</span>
      </div>

      <motion.div key={current} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6">
        <Lumi mood="thinking" message={item.sit} size="md" />
        <Card variant="bordered" padding="lg" className="text-center w-full max-w-xs">
          <p className="text-lg font-bold">{item.sit}</p>
          {emotion && <p className="text-sm text-text-muted mt-1">Emoción: {emotion.emoji} {emotion.label}</p>}
          <p className="text-sm text-text-secondary mt-3">¿Qué tan intenso es?</p>
        </Card>

        {/* Thermometer visual */}
        <div className="flex items-end gap-3 h-40">
          {INTENSITY_LEVELS.map((level) => {
            const isSelected = selected === level.id
            const isCorrect = selected && level.id === items[current].intensity
            const height = level.id === 'alto' ? 'h-32' : level.id === 'medio' ? 'h-24' : 'h-16'
            let barColor = 'bg-gray-200'
            if (isSelected && isCorrect) barColor = 'bg-green-400'
            else if (isSelected && !isCorrect) barColor = 'bg-red-400'
            else if (isSelected) barColor = 'bg-gray-300'
            return (
              <button key={level.id} onClick={() => handleSelect(level.id)}
                disabled={!!selected}
                className="flex flex-col items-center gap-2">
                <span className="text-2xl">{level.emoji}</span>
                <div className={`w-12 ${height} ${barColor} rounded-t-lg border-2 transition-all ${isSelected && isCorrect ? 'border-green-500' : isSelected && !isCorrect ? 'border-red-500' : 'border-border'}`} />
                <span className="text-xs font-bold">{level.label}</span>
              </button>
            )
          })}
        </div>

        {selected && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <div className={`px-6 py-3 rounded-xl font-extrabold text-lg mb-3 ${selected === items[current].intensity ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {selected === items[current].intensity ? '¡Correcto! 🎉' : `Es intensidad ${INTENSITY_LEVELS.find(l => l.id === items[current].intensity)?.label}`}
            </div>
            <Button variant="primary" size="lg" onClick={handleNext}>
              {current < items.length - 1 ? 'Siguiente →' : 'Ver resultado'}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
