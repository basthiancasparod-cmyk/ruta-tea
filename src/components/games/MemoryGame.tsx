'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Pictogram } from '@/components/ui/Pictogram'
import { Lumi } from '@/components/lumi/Lumi'
import { playSound, vibrate } from '@/lib/sounds'

interface CardData {
  id: number
  keyword: string
  flipped: boolean
  matched: boolean
}

const pairs = [
  { keyword: 'manzana', label: 'Manzana' },
  { keyword: 'perro', label: 'Perro' },
  { keyword: 'gato', label: 'Gato' },
  { keyword: 'sol', label: 'Sol' },
  { keyword: 'casa', label: 'Casa' },
  { keyword: 'arbol', label: 'Árbol' },
  { keyword: 'pelota', label: 'Pelota' },
  { keyword: 'flor', label: 'Flor' },
]

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function createCards(count: number): CardData[] {
  const selected = shuffleArray(pairs).slice(0, count)
  const doubled = [...selected, ...selected].map((p, i) => ({
    id: i,
    keyword: p.keyword,
    flipped: false,
    matched: false,
  }))
  return shuffleArray(doubled)
}

export function MemoryGame() {
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy')
  const pairCount = difficulty === 'easy' ? 6 : 8
  const [cards, setCards] = useState<CardData[]>(() => createCards(pairCount))
  const [flippedIds, setFlippedIds] = useState<number[]>([])
  const [locked, setLocked] = useState(false)
  const [matchedCount, setMatchedCount] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [won, setWon] = useState(false)

  const resetGame = useCallback(() => {
    setCards(createCards(pairCount))
    setFlippedIds([])
    setLocked(false)
    setMatchedCount(0)
    setAttempts(0)
    setWon(false)
  }, [pairCount])

  useEffect(() => {
    if (matchedCount === pairCount) {
      setWon(true)
      playSound('celebration')
      vibrate('celebration')
    }
  }, [matchedCount, pairCount])

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
      
      if (first.keyword === second.keyword) {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === first.id || c.id === second.id ? { ...c, matched: true } : c
          ))
          setFlippedIds([])
          setLocked(false)
          setMatchedCount(m => m + 1)
          playSound('correct')
          vibrate('correct')
        }, 400)
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === first.id || c.id === second.id ? { ...c, flipped: false } : c
          ))
          setFlippedIds([])
          setLocked(false)
          playSound('wrong')
          vibrate('wrong')
        }, 800)
      }
    }
  }

  const gridCols = difficulty === 'easy' ? 'grid-cols-4' : 'grid-cols-4'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={difficulty === 'easy' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => { setDifficulty('easy'); resetGame() }}
          >
            Fácil (6 pares)
          </Button>
          <Button
            variant={difficulty === 'hard' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => { setDifficulty('hard'); resetGame() }}
          >
            Difícil (8 pares)
          </Button>
        </div>
        <div className="text-sm text-text-secondary">
          Intentos: <span className="font-bold">{attempts}</span>
          <span className="mx-2">·</span>
          Aciertos: <span className="font-bold text-success">{matchedCount}/{pairCount}</span>
        </div>
      </div>

      <div className={`grid ${gridCols} gap-2 max-w-md mx-auto`}>
        {cards.map((card) => (
          <motion.button
            key={card.id}
            onClick={() => handleFlip(card.id)}
            className="aspect-square perspective-500"
            whileTap={{ scale: 0.95 }}
            disabled={card.flipped || card.matched || locked || won}
          >
            <motion.div
              className="relative w-full h-full"
              animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Back */}
              <div
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <span className="text-3xl text-white/80">?</span>
              </div>
              {/* Front */}
              <div
                className={`absolute inset-0 rounded-xl border-2 flex items-center justify-center ${
                  card.matched ? 'border-success bg-success/10' : 'border-border bg-surface'
                }`}
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <Pictogram keyword={card.keyword} size={72} className="rounded-lg" />
              </div>
            </motion.div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {won && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="text-center py-4"
          >
            <Lumi mood="excited" size="lg" message="¡Memoria completa!" />
            <p className="text-text-secondary mt-2">
              Completaste el juego en {attempts} intentos
            </p>
            <Button variant="primary" onClick={resetGame} className="mt-3">
              Jugar otra vez
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
