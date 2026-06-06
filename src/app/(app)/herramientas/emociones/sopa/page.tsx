'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Lumi } from '@/components/lumi/Lumi'
import { playSound, vibrate } from '@/lib/sounds'
import { shuffle, useGameStats } from '../lib/emociones-data'

const EMOJI_GRID: string[][] = [
  ['😊', '😢', '😡', '😨', '🥰', '😴', '😮', '😰'],
  ['🌟', '🌈', '🔥', '🌧️', '💕', '🌙', '⭐', '💫'],
  ['😡', '🌸', '😊', '🎵', '😢', '🎶', '😮', '🍀'],
  ['😨', '🎭', '😰', '🎪', '🥰', '🎨', '😴', '🎬'],
  ['😴', '🎯', '😮', '🎲', '😰', '🎳', '😡', '🎧'],
  ['🥰', '🎤', '😢', '🎸', '😊', '🎺', '😨', '🎻'],
  ['😊', '🎪', '😡', '🎭', '😴', '🎨', '🥰', '🎯'],
  ['😮', '🎲', '😰', '🎳', '😨', '🎧', '😢', '🎤'],
]

const FIND_TARGETS = [
  { emoji: '😊', label: 'Alegre' },
  { emoji: '😢', label: 'Triste' },
  { emoji: '😡', label: 'Enojado' },
  { emoji: '😨', label: 'Asustado' },
  { emoji: '🥰', label: 'Amor' },
  { emoji: '😴', label: 'Cansado' },
  { emoji: '😮', label: 'Sorprendido' },
  { emoji: '😰', label: 'Nervioso' },
]

export default function SopaPage() {
  const [started, setStarted] = useState(false)
  const [found, setFound] = useState<string[]>([])
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [targets] = useState(() => shuffle(FIND_TARGETS))
  const { stats, persist } = useGameStats('sopa')

  const findEmoji = (row: number, col: number): string => {
    return EMOJI_GRID[row]?.[col] ?? ''
  }

  const getTargetFromEmoji = (emoji: string) => {
    return FIND_TARGETS.find(t => t.emoji === emoji)
  }

  const handleCellClick = (row: number, col: number) => {
    if (finished) return
    const emoji = findEmoji(row, col)
    const target = getTargetFromEmoji(emoji)

    if (target && !found.includes(target.label)) {
      setFound(prev => [...prev, target.label])
      setSelectedCell([row, col])
      playSound('correct')
      vibrate('correct')
      const newScore = score + 1
      setScore(newScore)
      if (newScore >= FIND_TARGETS.length) {
        persist(newScore, FIND_TARGETS.length)
        setFinished(true)
      }
    } else if (!target) {
      playSound('wrong')
      vibrate('wrong')
      setSelectedCell([row, col])
      setTimeout(() => setSelectedCell(null), 300)
    }
  }

  if (!started) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>← Atrás</Button>
          <h1 className="text-xl font-extrabold text-text-primary">Sopa de Emociones</h1>
        </div>
        <Lumi mood="excited" message="Encuentra todas las emociones en la sopa" size="md" />
        {stats.played > 0 && <Card variant="bordered" padding="sm"><p className="text-xs text-text-muted">{stats.played} partidas · Mejor: {stats.bestScore}/{FIND_TARGETS.length}</p></Card>}
        <Button variant="primary" size="lg" fullWidth onClick={() => { setStarted(true); setFound([]); setScore(0); setFinished(false); setSelectedCell(null) }}>Comenzar</Button>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <Lumi mood="excited" size="lg" />
        <h2 className="text-3xl font-extrabold">¡Encontraste todas! 🌟</h2>
        <Card variant="bordered" padding="lg">
          <p className="text-4xl font-extrabold text-brand">{score}/{FIND_TARGETS.length}</p>
          <p className="text-sm text-text-secondary">emociones encontradas</p>
        </Card>
        <Button variant="primary" onClick={() => { setStarted(false); setFound([]); setScore(0); setFinished(false) }}>Jugar otra vez</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setStarted(false)}>← Atrás</Button>
        <h1 className="text-xl font-extrabold text-text-primary">Sopa</h1>
        <span className="ml-auto text-xs font-bold text-text-muted bg-surface-secondary px-2 py-1 rounded-full">{found.length}/{FIND_TARGETS.length}</span>
      </div>

      <Lumi mood="thinking" message="Busca las emociones en la sopa" size="sm" />

      {/* Targets to find */}
      <div className="flex flex-wrap gap-2 justify-center">
        {targets.map(t => (
          <span key={t.label} className={`px-3 py-1 rounded-full text-sm font-bold border-2 transition-all ${found.includes(t.label) ? 'bg-green-100 border-green-400 line-through opacity-50' : 'bg-white border-border'}`}>
            {t.emoji} {t.label}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-8 gap-1 max-w-sm mx-auto">
        {EMOJI_GRID.map((row, ri) => (
          row.map((cell, ci) => {
            const isSelected = selectedCell?.[0] === ri && selectedCell?.[1] === ci
            const target = getTargetFromEmoji(cell)
            const isFound = target && found.includes(target.label)
            return (
              <button key={`${ri}-${ci}`} onClick={() => handleCellClick(ri, ci)}
                className={`aspect-square flex items-center justify-center text-lg rounded-lg border-2 transition-all ${isFound ? 'bg-green-100 border-green-400 opacity-30' : isSelected ? 'bg-brand-bg border-brand scale-110' : 'bg-white border-border hover:border-brand'}`}>
                {cell}
              </button>
            )
          })
        ))}
      </div>
    </div>
  )
}
