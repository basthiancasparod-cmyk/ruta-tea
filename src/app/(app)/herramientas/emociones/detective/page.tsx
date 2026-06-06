'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Lumi } from '@/components/lumi/Lumi'
import { playSound, vibrate } from '@/lib/sounds'
import { EMOTIONS, shuffle, useGameStats } from '../lib/emociones-data'
import type { Emotion } from '../lib/emociones-data'

interface SceneCharacter {
  name: string
  emoji: string
  situation: string
  correctEmotionId: string
}

const SCENES: SceneCharacter[] = [
  { name: 'Luna', emoji: '👧', situation: 'Acaba de recibir un regalo sorpresa de su abuela', correctEmotionId: 'alegre' },
  { name: 'Max', emoji: '👦', situation: 'Su perrito se perdió en el parque', correctEmotionId: 'triste' },
  { name: 'Leo', emoji: '🧒', situation: 'Su hermano rompió su torre de bloques', correctEmotionId: 'enojado' },
  { name: 'Sofía', emoji: '👧', situation: 'Escuchó un ruido muy fuerte en la noche', correctEmotionId: 'asustado' },
  { name: 'Liam', emoji: '👦', situation: 'Su mamá le dio un abrazo muy apretado', correctEmotionId: 'amor' },
  { name: 'Emma', emoji: '👧', situation: 'Jugó todo el día en el parque sin parar', correctEmotionId: 'cansado' },
  { name: 'Noah', emoji: '🧒', situation: 'Vio un arcoíris gigante después de la lluvia', correctEmotionId: 'sorprendido' },
  { name: 'Aria', emoji: '👧', situation: 'Mañana tiene que hablar frente a toda la clase', correctEmotionId: 'nervioso' },
]

export default function DetectivePage() {
  const [started, setStarted] = useState(false)
  const [scenes, setScenes] = useState<SceneCharacter[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const { stats, persist } = useGameStats('detective')

  const startGame = useCallback(() => {
    setScenes(shuffle(SCENES))
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
    setStarted(true)
  }, [])

  const handleSelect = (id: string) => {
    if (selected) return
    setSelected(id)
    const correct = id === scenes[current].correctEmotionId
    if (correct) { playSound('correct'); vibrate('correct'); setScore(s => s + 1) }
    else { playSound('wrong'); vibrate('wrong') }
  }

  const handleNext = () => {
    const next = current + 1
    if (next < scenes.length) {
      setCurrent(next)
      setSelected(null)
    } else {
      persist(score, scenes.length)
      setFinished(true)
    }
  }

  if (!started) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>← Atrás</Button>
          <h1 className="text-xl font-extrabold text-text-primary">Detective de Emociones</h1>
        </div>
        <Lumi mood="excited" message="Investiga la escena y descubre qué siente cada personaje" size="md" />
        {stats.played > 0 && <Card variant="bordered" padding="sm"><p className="text-xs text-text-muted">{stats.played} partidas · Mejor: {stats.bestScore}/{SCENES.length}</p></Card>}
        <Button variant="primary" size="lg" fullWidth onClick={startGame}>Comenzar</Button>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <Lumi mood={score >= 6 ? 'excited' : 'happy'} size="lg" />
        <h2 className="text-3xl font-extrabold">{score >= 7 ? '¡Gran detective! 🕵️' : score >= 4 ? '¡Buen trabajo!' : '¡Sigue investigando!'}</h2>
        <Card variant="bordered" padding="lg">
          <p className="text-4xl font-extrabold text-brand">{score}/{SCENES.length}</p>
          <p className="text-sm text-text-secondary">casos resueltos</p>
        </Card>
        <Button variant="primary" onClick={startGame}>Jugar otra vez</Button>
      </div>
    )
  }

  const scene = scenes[current]
  const correctEmotion = EMOTIONS.find(e => e.id === scene.correctEmotionId)

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setStarted(false)}>← Atrás</Button>
        <h1 className="text-xl font-extrabold text-text-primary">Detective</h1>
        <span className="ml-auto text-xs font-bold text-text-muted bg-surface-secondary px-2 py-1 rounded-full">{current + 1}/{scenes.length}</span>
      </div>

      <motion.div key={current} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6">
        <Lumi mood="thinking" message={`Caso #${current + 1}: ¿Qué siente ${scene.name}?`} size="sm" />

        {/* Scene card */}
        <Card variant="bordered" padding="lg" className="text-center w-full max-w-sm">
          <div className="flex items-center justify-center gap-4 mb-3">
            <span className="text-6xl">{scene.emoji}</span>
            <div className="text-left">
              <p className="font-extrabold text-lg">{scene.name}</p>
              <p className="text-xs text-text-muted">Personaje</p>
            </div>
          </div>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3">
            <p className="text-sm font-bold text-amber-800">
              🔍 {scene.situation}
            </p>
          </div>
          <p className="text-sm font-bold text-text-secondary mt-3">¿Qué emoción siente {scene.name}?</p>
        </Card>

        {/* Emotion options */}
        <div className="grid grid-cols-4 gap-2 w-full max-w-sm">
          <AnimatePresence>
            {EMOTIONS.map(em => {
              const isCorrect = em.id === scene.correctEmotionId
              const isSelected = selected === em.id
              let cls = 'bg-white border-border'
              if (selected && isCorrect) cls = 'bg-green-50 border-green-400'
              else if (selected && isSelected && !isCorrect) cls = 'bg-red-50 border-red-400'
              else if (selected && !isCorrect) cls = 'opacity-30 bg-white border-border'
              return (
                <motion.button key={em.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  onClick={() => handleSelect(em.id)} disabled={!!selected}
                  className={`p-2 rounded-xl border-2 text-center transition-all ${cls}`}>
                  <span className="text-2xl block">{em.emoji}</span>
                  <span className="text-[10px] font-bold">{em.label}</span>
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>

        {selected && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
            <div className={`px-6 py-3 rounded-xl font-extrabold text-lg ${selected === scene.correctEmotionId ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {selected === scene.correctEmotionId
                ? '¡Caso resuelto! 🎉'
                : `${scene.name} siente ${correctEmotion?.label} ${correctEmotion?.emoji}`
              }
            </div>
            <Button variant="primary" size="lg" onClick={handleNext} className="mt-3">
              {current < scenes.length - 1 ? 'Siguiente caso →' : 'Ver resultado'}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
