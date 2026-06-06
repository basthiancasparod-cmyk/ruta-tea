'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pictogram } from '@/components/ui/Pictogram'
import { Lumi } from '@/components/lumi/Lumi'
import { playSound, vibrate } from '@/lib/sounds'
import { EMOTIONS, shuffle } from '../lib/emociones-data'
import { useGameStats } from '../lib/use-stats'

interface MemCard {
  id: number
  emotionId: string
  flipped: boolean
  matched: boolean
}

export default function MemoryPage() {
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy')
  const pairCount = difficulty === 'easy' ? 4 : 6
  const [cards, setCards] = useState<MemCard[]>(() => createCards(pairCount))
  const [flippedIds, setFlippedIds] = useState<number[]>([])
  const [locked, setLocked] = useState(false)
  const [matchedCount, setMatchedCount] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [won, setWon] = useState(false)
  const [showMenu, setShowMenu] = useState(true)
  const { stats, persist } = useGameStats('memory')

  const resetGame = useCallback((pairs: number) => {
    setCards(createCards(pairs))
    setFlippedIds([])
    setLocked(false)
    setMatchedCount(0)
    setAttempts(0)
    setWon(false)
  }, [])

  useEffect(() => {
    if (matchedCount > 0 && matchedCount === pairCount) {
      setWon(true)
      playSound('celebration')
      vibrate('celebration')
      persist(pairCount, attempts)
    }
  }, [matchedCount, pairCount, persist])

  const handleFlip = (cardId: number) => {
    if (locked || won) return
    const card = cards.find(c => c.id === cardId)
    if (!card || card.flipped || card.matched) return

    const newCards = cards.map(c => c.id === cardId ? { ...c, flipped: true } : c)
    setCards(newCards)
    playSound('click')
    vibrate('click')

    const newFlipped = [...flippedIds, cardId]
    setFlippedIds(newFlipped)

    if (newFlipped.length === 2) {
      setLocked(true)
      setAttempts(a => a + 1)
      const [first, second] = newFlipped.map(id => newCards.find(c => c.id === id)!)
      if (first.emotionId === second.emotionId) {
        setTimeout(() => {
          setCards(prev => prev.map(c => c.id === first.id || c.id === second.id ? { ...c, matched: true } : c))
          setFlippedIds([])
          setLocked(false)
          setMatchedCount(m => m + 1)
          playSound('correct')
          vibrate('correct')
        }, 400)
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => c.id === first.id || c.id === second.id ? { ...c, flipped: false } : c))
          setFlippedIds([])
          setLocked(false)
          playSound('wrong')
          vibrate('wrong')
        }, 800)
      }
    }
  }

  if (showMenu) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>← Atrás</Button>
          <h1 className="text-xl font-extrabold text-text-primary">Memory de Emociones</h1>
        </div>
        <Lumi mood="excited" message="Encuentra los pares de emociones" size="md" />
        {stats.played > 0 && (
          <Card variant="bordered" padding="sm">
            <p className="text-xs text-text-muted">{stats.played} partidas · Mejor: {stats.bestScore} pares</p>
          </Card>
        )}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => { setDifficulty('easy'); setShowMenu(false); resetGame(4) }}
            className="bg-white rounded-xl border-2 border-border p-4 text-left hover:border-brand transition-all active:scale-[0.98]">
            <span className="text-3xl">🌱</span>
            <p className="font-extrabold text-sm mt-1">Fácil</p>
            <p className="text-xs text-text-muted">4 pares (8 cartas)</p>
          </button>
          <button onClick={() => { setDifficulty('hard'); setShowMenu(false); resetGame(6) }}
            className="bg-white rounded-xl border-2 border-border p-4 text-left hover:border-brand transition-all active:scale-[0.98]">
            <span className="text-3xl">🌳</span>
            <p className="font-extrabold text-sm mt-1">Difícil</p>
            <p className="text-xs text-text-muted">6 pares (12 cartas)</p>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setShowMenu(true)}>← Atrás</Button>
        <h1 className="text-xl font-extrabold text-text-primary">Memory</h1>
        <span className="ml-auto text-xs font-bold text-text-muted">Intentos: {attempts} · {matchedCount}/{pairCount}</span>
      </div>

      <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
        {cards.map((card) => {
          const emotion = EMOTIONS.find(e => e.id === card.emotionId)
          return (
            <motion.button key={card.id} onClick={() => handleFlip(card.id)} className="aspect-square perspective-500"
              whileTap={{ scale: 0.95 }} disabled={card.flipped || card.matched || locked || won}>
              <motion.div className="relative w-full h-full"
                animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
                transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
                style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center"
                  style={{ backfaceVisibility: 'hidden' }}>
                  <span className="text-2xl text-white/80">?</span>
                </div>
                <div className={`absolute inset-0 rounded-xl border-2 flex items-center justify-center ${card.matched ? 'border-success bg-success/10' : 'border-border bg-surface'}`}
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  {emotion && <Pictogram keyword={emotion.pictogram} size={56} />}
                </div>
              </motion.div>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {won && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
            <Lumi mood="excited" size="lg" message="¡Memoria completa!" />
            <p className="text-text-secondary mt-2">Completaste en {attempts} intentos</p>
            <div className="flex gap-3 justify-center mt-3">
              <Button variant="primary" onClick={() => resetGame(pairCount)}>Jugar otra vez</Button>
              <Button variant="outline" onClick={() => setShowMenu(true)}>Menú</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function createCards(pairCount: number): MemCard[] {
  const selected = shuffle(EMOTIONS).slice(0, pairCount)
  const doubled = [...selected, ...selected].map((e, i) => ({ id: i, emotionId: e.id, flipped: false, matched: false }))
  return shuffle(doubled)
}
