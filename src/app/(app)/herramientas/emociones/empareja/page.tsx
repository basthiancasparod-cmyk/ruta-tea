'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Lumi } from '@/components/lumi/Lumi'
import { playSound, vibrate } from '@/lib/sounds'
import { EMOTIONS, shuffle, useGameStats } from '../lib/emociones-data'
import type { Emotion } from '../lib/emociones-data'

const COLOR_MAP: Record<string, { bg: string; label: string }> = {
  green: { bg: 'bg-green-100', label: 'Verde' },
  blue: { bg: 'bg-blue-100', label: 'Azul' },
  red: { bg: 'bg-red-100', label: 'Rojo' },
  purple: { bg: 'bg-purple-100', label: 'Púrpura' },
  pink: { bg: 'bg-pink-100', label: 'Rosa' },
  gray: { bg: 'bg-gray-100', label: 'Gris' },
  amber: { bg: 'bg-amber-100', label: 'Ámbar' },
  orange: { bg: 'bg-orange-100', label: 'Naranja' },
}

const EMOTION_COLORS: { emotionId: string; colorKey: string }[] = [
  { emotionId: 'alegre', colorKey: 'green' },
  { emotionId: 'triste', colorKey: 'blue' },
  { emotionId: 'enojado', colorKey: 'red' },
  { emotionId: 'asustado', colorKey: 'purple' },
  { emotionId: 'amor', colorKey: 'pink' },
  { emotionId: 'cansado', colorKey: 'gray' },
  { emotionId: 'sorprendido', colorKey: 'amber' },
  { emotionId: 'nervioso', colorKey: 'orange' },
]

export default function EmparejaPage() {
  const [started, setStarted] = useState(false)
  const [pairs, setPairs] = useState<{ emotionId: string; colorKey: string }[]>([])
  const [colorOrder, setColorOrder] = useState<string[]>([])
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null)
  const [matchedColors, setMatchedColors] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [total] = useState(8)
  const [finished, setFinished] = useState(false)
  const { stats, persist } = useGameStats('empareja')

  const startGame = useCallback(() => {
    setPairs(shuffle(EMOTION_COLORS))
    setColorOrder(shuffle(Object.keys(COLOR_MAP)))
    setSelectedEmotion(null)
    setMatchedColors([])
    setScore(0)
    setFinished(false)
    setStarted(true)
  }, [])

  const handleEmotionClick = (id: string) => {
    if (matchedColors.includes(EMOTION_COLORS.find(p => p.emotionId === id)?.colorKey ?? '')) return
    setSelectedEmotion(id)
    playSound('click')
  }

  const handleColorClick = (colorKey: string) => {
    if (!selectedEmotion || matchedColors.includes(colorKey)) return
    const pair = EMOTION_COLORS.find(p => p.emotionId === selectedEmotion)
    const match = pair?.colorKey === colorKey
    if (match) {
      playSound('correct')
      vibrate('correct')
      setMatchedColors(prev => [...prev, colorKey])
      setScore(s => s + 1)
      if (matchedColors.length + 1 >= total) {
        setFinished(true)
        persist(total, total)
      }
    } else {
      playSound('wrong')
      vibrate('wrong')
    }
    setSelectedEmotion(null)
  }

  if (!started) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>← Atrás</Button>
          <h1 className="text-xl font-extrabold text-text-primary">Empareja con Color</h1>
        </div>
        <Lumi mood="thinking" message="Cada emoción tiene un color. ¡Empareja!" size="md" />
        {stats.played > 0 && <Card variant="bordered" padding="sm"><p className="text-xs text-text-muted">{stats.played} partidas · Mejor: {stats.bestScore}/{total}</p></Card>}
        <Button variant="primary" size="lg" fullWidth onClick={startGame}>Comenzar</Button>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <Lumi mood="excited" size="lg" />
        <h2 className="text-3xl font-extrabold">¡Todos emparejados! 🌈</h2>
        <Card variant="bordered" padding="lg">
          <p className="text-4xl font-extrabold text-brand">{score}/{total}</p>
          <p className="text-sm text-text-secondary">parejas correctas</p>
        </Card>
        <Button variant="primary" onClick={startGame}>Jugar otra vez</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setStarted(false)}>← Atrás</Button>
        <h1 className="text-xl font-extrabold text-text-primary">Empareja</h1>
        <span className="ml-auto text-xs font-bold text-text-muted bg-surface-secondary px-2 py-1 rounded-full">{matchedColors.length}/{total}</span>
      </div>

      <Lumi mood="thinking" message="Toca una emoción, luego su color" size="sm" />

      <p className="text-xs text-center text-text-muted">Selecciona una emoción y luego su color correspondiente</p>

      <div className="flex flex-col gap-4 max-w-sm mx-auto w-full">
        {/* Emotion row */}
        <div className="flex justify-around">
          {pairs.map(p => {
            const emotion = EMOTIONS.find(e => e.id === p.emotionId)
            const isMatched = matchedColors.includes(p.colorKey)
            return (
              <button key={p.emotionId} onClick={() => handleEmotionClick(p.emotionId)}
                disabled={isMatched}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border-2 transition-all ${isMatched ? 'opacity-20 border-gray-200' : selectedEmotion === p.emotionId ? 'border-brand scale-110 bg-brand-bg' : 'border-border bg-white hover:border-brand'}`}>
                {emotion?.emoji}
              </button>
            )
          })}
        </div>

        {/* Color row */}
        <div className="flex justify-around">
          {colorOrder.map(key => {
            const val = COLOR_MAP[key]
            const isMatched = matchedColors.includes(key)
            return (
              <button key={key} onClick={() => handleColorClick(key)}
                disabled={matchedColors.includes(key)}
                className={`w-12 h-12 rounded-xl border-2 transition-all ${isMatched ? 'opacity-20 border-gray-200' : selectedEmotion ? `${val.bg} border-brand cursor-pointer hover:scale-110` : 'opacity-50 border-border cursor-default'}`}
                title={val.label} />
            )
          })}
        </div>
      </div>

      {selectedEmotion && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <p className="text-sm font-bold text-brand">Ahora elige su color</p>
        </motion.div>
      )}
    </div>
  )
}
