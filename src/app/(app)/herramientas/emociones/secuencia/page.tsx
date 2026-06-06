'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Lumi } from '@/components/lumi/Lumi'
import { playSound, vibrate } from '@/lib/sounds'
import { EMOTIONS, shuffle, useGameStats } from '../lib/emociones-data'
import type { Emotion } from '../lib/emociones-data'

export default function SecuenciaPage() {
  const [started, setStarted] = useState(false)
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy')
  const seqLen = difficulty === 'easy' ? 3 : 5
  const [sequence, setSequence] = useState<Emotion[]>([])
  const [showing, setShowing] = useState(true)
  const [playerSeq, setPlayerSeq] = useState<Emotion[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(0)
  const [total] = useState(5)
  const [finished, setFinished] = useState(false)
  const [failed, setFailed] = useState(false)
  const { stats, persist } = useGameStats('secuencia')

  const newRound = useCallback(() => {
    const seq = shuffle(EMOTIONS).slice(0, seqLen)
    setSequence(seq)
    setShowing(true)
    setPlayerSeq([])
    setCurrentStep(0)
    setFailed(false)
    setTimeout(() => setShowing(false), 1500)
  }, [seqLen])

  const startGame = useCallback(() => {
    setRound(0)
    setScore(0)
    setFinished(false)
    setStarted(true)
    setTimeout(() => newRound(), 100)
  }, [newRound])

  useEffect(() => {
    if (!showing && round > 0 && sequence.length > 0) {
      setShowing(false)
    }
  }, [showing, round, sequence])

  const handleEmotionClick = (em: Emotion) => {
    if (showing || failed || finished) return
    const expected = sequence[currentStep]
    if (em.id === expected.id) {
      playSound('correct')
      vibrate('correct')
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      setPlayerSeq(prev => [...prev, em])
      if (nextStep >= sequence.length) {
        setScore(s => s + 1)
        setTimeout(() => {
          const next = round + 1
          if (next < total) {
            setRound(next)
            newRound()
          } else {
            persist(score + 1, total)
            setFinished(true)
          }
        }, 500)
      }
    } else {
      playSound('wrong')
      vibrate('wrong')
      setFailed(true)
      setTimeout(() => {
        setRound(r => r + 1)
        if (round + 1 >= total) {
          persist(score, total)
          setFinished(true)
        } else {
          newRound()
        }
      }, 1500)
    }
  }

  if (!started) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>← Atrás</Button>
          <h1 className="text-xl font-extrabold text-text-primary">Secuencia de Emociones</h1>
        </div>
        <Lumi mood="thinking" message="Mira la secuencia y repítela" size="md" />
        {stats.played > 0 && <Card variant="bordered" padding="sm"><p className="text-xs text-text-muted">{stats.played} partidas · Mejor: {stats.bestScore}/{total}</p></Card>}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => { setDifficulty('easy'); startGame() }}
            className="bg-white rounded-xl border-2 border-border p-4 hover:border-brand transition-all">
            <span className="text-3xl">🌱</span>
            <p className="font-extrabold text-sm">Fácil</p>
            <p className="text-xs text-text-muted">3 emociones</p>
          </button>
          <button onClick={() => { setDifficulty('hard'); startGame() }}
            className="bg-white rounded-xl border-2 border-border p-4 hover:border-brand transition-all">
            <span className="text-3xl">🌳</span>
            <p className="font-extrabold text-sm">Difícil</p>
            <p className="text-xs text-text-muted">5 emociones</p>
          </button>
        </div>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <Lumi mood={score >= 3 ? 'excited' : 'happy'} size="lg" />
        <h2 className="text-3xl font-extrabold">{score >= 4 ? '¡Memoria increíble!' : score >= 2 ? '¡Bien!' : '¡Sigue practicando!'}</h2>
        <Card variant="bordered" padding="lg">
          <p className="text-4xl font-extrabold text-brand">{score}/{total}</p>
          <p className="text-sm text-text-secondary">secuencias correctas</p>
        </Card>
        <Button variant="primary" onClick={() => setStarted(false)}>Menú</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setStarted(false)}>← Atrás</Button>
        <h1 className="text-xl font-extrabold text-text-primary">Secuencia</h1>
        <span className="ml-auto text-xs font-bold text-text-muted bg-surface-secondary px-2 py-1 rounded-full">{round + 1}/{total}</span>
      </div>

      <div className="flex flex-col items-center gap-6">
        {showing ? (
          <div className="text-center">
            <Lumi mood="thinking" message="¡Observa la secuencia!" size="sm" />
            <div className="flex gap-3 justify-center mt-4">
              {sequence.map((em, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.3 }}
                  className="bg-white rounded-xl border-2 border-brand p-3 text-center">
                  <span className="text-4xl block">{em.emoji}</span>
                  <span className="text-xs font-bold mt-1">{em.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <Lumi mood={failed ? 'sad' : 'thinking'} message={failed ? '¡Fallaste! :(' : `Repite la secuencia (paso ${currentStep + 1}/${sequence.length})`} size="sm" />

            {!failed && (
              <div className="flex gap-2">
                {playerSeq.map((em, i) => (
                  <span key={i} className="text-2xl">{em.emoji}</span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-4 gap-3 max-w-xs">
              {EMOTIONS.map(em => (
                <button key={em.id} onClick={() => handleEmotionClick(em)}
                  disabled={showing || failed || finished}
                  className="p-3 rounded-xl border-2 border-border bg-white text-center hover:border-brand transition-all disabled:opacity-50">
                  <span className="text-3xl block">{em.emoji}</span>
                  <span className="text-[10px] font-bold">{em.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
