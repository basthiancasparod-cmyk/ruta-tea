'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Lumi } from '@/components/lumi/Lumi'

type Difficulty = 'easy' | 'medium' | 'hard'

interface EmotionScenario {
  emoji: string
  emotion: string
  situation: string
  context?: string
}

interface GameStats {
  played: number
  bestScore: number
  totalCorrect: number
  totalQuestions: number
}

const SCENARIOS_BY_LEVEL: Record<Difficulty, EmotionScenario[]> = {
  easy: [
    { emoji: '🎁', emotion: 'alegre', situation: 'Recibiste un regalo' },
    { emoji: '😭', emotion: 'triste', situation: 'Se rompió tu juguete favorito' },
    { emoji: '👻', emotion: 'asustado', situation: 'Hay un ruido fuerte' },
    { emoji: '😤', emotion: 'enojado', situation: 'Te quitaron tu turno' },
    { emoji: '🥰', emotion: 'amor', situation: 'Mamá te da un abrazo' },
    { emoji: '😴', emotion: 'cansado', situation: 'Es hora de dormir' },
  ],
  medium: [
    { emoji: '🎁', emotion: 'alegre', situation: 'Recibiste un regalo' },
    { emoji: '😭', emotion: 'triste', situation: 'Se rompió tu juguete favorito' },
    { emoji: '👻', emotion: 'asustado', situation: 'Hay un ruido fuerte' },
    { emoji: '😤', emotion: 'enojado', situation: 'Te quitaron tu turno' },
    { emoji: '🥰', emotion: 'amor', situation: 'Mamá te da un abrazo' },
    { emoji: '😴', emotion: 'cansado', situation: 'Es hora de dormir' },
    { emoji: '🎢', emotion: 'sorprendido', situation: 'Viste algo increíble' },
    { emoji: '🤗', emotion: 'alegre', situation: 'Tu amigo te invita a jugar' },
    { emoji: '🥉', emotion: 'enojado', situation: 'Perdiste el juego' },
  ],
  hard: [
    { emoji: '🎁', emotion: 'alegre', situation: 'Recibiste un regalo' },
    { emoji: '😭', emotion: 'triste', situation: 'Se rompió tu juguete favorito' },
    { emoji: '👻', emotion: 'asustado', situation: 'Hay un ruido fuerte' },
    { emoji: '😤', emotion: 'enojado', situation: 'Te quitaron tu turno' },
    { emoji: '🥰', emotion: 'amor', situation: 'Mamá te da un abrazo' },
    { emoji: '😴', emotion: 'cansado', situation: 'Es hora de dormir' },
    { emoji: '🎢', emotion: 'sorprendido', situation: 'Viste algo increíble' },
    { emoji: '🤗', emotion: 'alegre', situation: 'Tu amigo te invita a jugar' },
    { emoji: '🥉', emotion: 'enojado', situation: 'Perdiste el juego' },
    { emoji: '🤒', emotion: 'triste', situation: 'Estás enfermo' },
    { emoji: '🧸', emotion: 'amor', situation: 'Tu abuela te regaló un peluche' },
    { emoji: '⚡', emotion: 'asustado', situation: 'Hay una tormenta con rayos' },
  ],
}

const EMOTIONS = [
  { label: 'Alegre', value: 'alegre', emoji: '😊', color: 'bg-green-100 border-green-400 hover:bg-green-200' },
  { label: 'Triste', value: 'triste', emoji: '😢', color: 'bg-blue-100 border-blue-400 hover:bg-blue-200' },
  { label: 'Enojado', value: 'enojado', emoji: '😡', color: 'bg-red-100 border-red-400 hover:bg-red-200' },
  { label: 'Asustado', value: 'asustado', emoji: '😨', color: 'bg-purple-100 border-purple-400 hover:bg-purple-200' },
  { label: 'Amor', value: 'amor', emoji: '🥰', color: 'bg-pink-100 border-pink-400 hover:bg-pink-200' },
  { label: 'Cansado', value: 'cansado', emoji: '😴', color: 'bg-gray-100 border-gray-400 hover:bg-gray-200' },
  { label: 'Sorprendido', value: 'sorprendido', emoji: '😮', color: 'bg-amber-100 border-amber-400 hover:bg-amber-200' },
]

const STATS_KEY = 'emociones-stats'

const difficultyInfo: Record<Difficulty, { label: string; emoji: string }> = {
  easy: { label: 'Fácil', emoji: '🌱' },
  medium: { label: 'Medio', emoji: '🌿' },
  hard: { label: 'Difícil', emoji: '🌳' },
}

export default function EmocionesPage() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [currentScenario, setCurrentScenario] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [stats, setStats] = useState<GameStats>({ played: 0, bestScore: 0, totalCorrect: 0, totalQuestions: 0 })

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STATS_KEY)
      if (stored) setStats(JSON.parse(stored))
    } catch { /* empty */ }
  }, [])

  const persistStats = useCallback((newStats: GameStats) => {
    setStats(newStats)
    localStorage.setItem(STATS_KEY, JSON.stringify(newStats))
  }, [])

  if (difficulty === null) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            ← Atrás
          </Button>
          <h1 className="text-xl font-extrabold text-text-primary">Juego de Emociones</h1>
        </div>

        <Lumi mood="excited" message="Elige un nivel para comenzar" size="md" />

        {/* Stats */}
        {stats.played > 0 && (
          <Card variant="bordered" padding="md">
            <p className="text-xs font-bold text-text-secondary mb-2">Tu progreso</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-extrabold text-brand">{stats.played}</p>
                <p className="text-[10px] text-text-muted">Partidas</p>
              </div>
              <div>
                <p className="text-lg font-extrabold text-brand">
                  {stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0}%
                </p>
                <p className="text-[10px] text-text-muted">Aciertos</p>
              </div>
              <div>
                <p className="text-lg font-extrabold text-brand">{stats.bestScore}</p>
                <p className="text-[10px] text-text-muted">Mejor</p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-3">
          {(Object.entries(difficultyInfo) as [Difficulty, { label: string; emoji: string }][]).map(([key, info]) => (
            <button
              key={key}
              onClick={() => {
                setDifficulty(key)
                setCurrentScenario(0)
                setScore(0)
                setFinished(false)
                setSelected(null)
                setShowResult(false)
              }}
              className="bg-white rounded-xl border-2 border-border p-4 text-left hover:border-brand transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{info.emoji}</span>
                <div>
                  <p className="heading-card">{info.label}</p>
                  <p className="text-xs text-text-muted">
                    {key === 'easy' ? '6 emociones básicas' : key === 'medium' ? '9 situaciones' : '12 situaciones'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const scenarios = SCENARIOS_BY_LEVEL[difficulty]
  const scenario = scenarios[currentScenario]

  const handleSelect = (emotion: string) => {
    if (showResult) return
    setSelected(emotion)
    setShowResult(true)
    if (emotion === scenario.emotion) setScore((s) => s + 1)
  }

  const handleNext = () => {
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario((s) => s + 1)
      setSelected(null)
      setShowResult(false)
    } else {
      const finalScore = score + (selected === scenario.emotion ? 1 : 0)
      const newStats: GameStats = {
        played: stats.played + 1,
        bestScore: Math.max(stats.bestScore, finalScore),
        totalCorrect: stats.totalCorrect + finalScore,
        totalQuestions: stats.totalQuestions + scenarios.length,
      }
      persistStats(newStats)
      setFinished(true)
    }
  }

  const handleRetry = () => {
    setCurrentScenario(0)
    setSelected(null)
    setShowResult(false)
    setScore(0)
    setFinished(false)
  }

  const handleBackToMenu = () => {
    setDifficulty(null)
    setCurrentScenario(0)
    setSelected(null)
    setShowResult(false)
    setScore(0)
    setFinished(false)
  }

  if (finished) {
    const percentage = Math.round((score / scenarios.length) * 100)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
          <Lumi mood={percentage >= 70 ? 'excited' : 'happy'} size="lg" />
        </motion.div>
        <h2 className="text-3xl font-extrabold">
          {percentage >= 80 ? '¡Increíble! 🌟' : percentage >= 60 ? '¡Buen trabajo! 👏' : '¡Sigue practicando! 💪'}
        </h2>
        <div className="bg-white rounded-xl border-2 border-border p-4 w-full max-w-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-text-secondary">Aciertos</span>
            <span className="text-lg font-extrabold text-brand">{score}/{scenarios.length}</span>
          </div>
          <div className="bg-surface-secondary rounded-full h-2.5 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-orange-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRetry}>
            🔄 Jugar de nuevo
          </Button>
          <Button variant="outline" onClick={handleBackToMenu}>
            🏠 Menú
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={handleBackToMenu}>
          ← Atrás
        </Button>
        <h1 className="text-xl font-extrabold text-text-primary">Juego de Emociones</h1>
        <span className="ml-auto text-xs font-bold text-text-muted bg-surface-secondary px-2 py-1 rounded-full">
          {difficultyInfo[difficulty].emoji} {currentScenario + 1}/{scenarios.length}
        </span>
      </div>

      <motion.div
        key={currentScenario}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6"
      >
        <Lumi mood="thinking" message={scenario.situation} size="md" />

        <Card variant="bordered" padding="lg" className="text-center w-full max-w-xs">
          <motion.span
            key={scenario.emoji}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="text-6xl block mb-3"
          >
            {scenario.emoji}
          </motion.span>
          <p className="font-bold text-lg text-text-primary">{scenario.situation}</p>
          {scenario.context && (
            <p className="text-sm text-text-muted mt-1">{scenario.context}</p>
          )}
          <p className="text-sm text-text-secondary mt-2">¿Cómo te sientes?</p>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-sm">
          <AnimatePresence>
            {EMOTIONS.map((em) => {
              const isCorrect = em.value === scenario.emotion
              const isSelected = selected === em.value

              let borderClass = 'border-border'
              let bgClass = 'bg-white'
              if (showResult && isCorrect) { borderClass = 'border-green-400'; bgClass = 'bg-green-50' }
              else if (showResult && isSelected && !isCorrect) { borderClass = 'border-red-400'; bgClass = 'bg-red-50' }

              return (
                <motion.div
                  key={em.value}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Card
                    variant="default"
                    padding="md"
                    onClick={() => handleSelect(em.value)}
                    className={`cursor-pointer text-center transition-all ${borderClass} ${bgClass} ${
                      em.color
                    } ${
                      showResult && !isCorrect && !isSelected ? 'opacity-40' : ''
                    }`}
                  >
                    <span className="text-3xl block mb-1">{em.emoji}</span>
                    <span className="text-xs font-bold">{em.label}</span>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {showResult && (
          <motion.div
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            className="text-center"
          >
            <div className={`px-6 py-3 rounded-xl font-extrabold text-lg ${
              selected === scenario.emotion
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {selected === scenario.emotion
                ? '¡Correcto! 🎉'
                : `Es ${scenario.emotion} ${EMOTIONS.find((e) => e.value === scenario.emotion)?.emoji ?? ''}`
              }
            </div>
            <Button variant="primary" size="lg" onClick={handleNext} className="mt-3">
              {currentScenario < scenarios.length - 1 ? 'Siguiente →' : 'Ver resultado →'}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
