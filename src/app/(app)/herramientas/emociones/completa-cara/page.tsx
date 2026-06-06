'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Lumi } from '@/components/lumi/Lumi'
import { playSound, vibrate } from '@/lib/sounds'
import { EMOTIONS, shuffle, useGameStats } from '../lib/emociones-data'
import type { Emotion } from '../lib/emociones-data'

interface PartOption {
  id: string
  type: 'eyes' | 'eyebrows' | 'mouth'
  label: string
  svg: string
  emotionId: string
}

const PART_DEFS: PartOption[] = [
  { id: 'happy-eyes', type: 'eyes', label: 'Ojos alegres', svg: 'M38 30 Q42 26 46 30 M54 30 Q58 26 62 30', emotionId: 'alegre' },
  { id: 'sad-eyes', type: 'eyes', label: 'Ojos tristes', svg: 'M38 33 Q42 30 46 33 M54 33 Q58 30 62 33', emotionId: 'triste' },
  { id: 'angry-eyes', type: 'eyes', label: 'Ojos enojados', svg: 'M36 28 L46 32 M64 28 L54 32', emotionId: 'enojado' },
  { id: 'scared-eyes', type: 'eyes', label: 'Ojos asustados', svg: 'M38 28 Q42 24 46 28 M54 28 Q58 24 62 28', emotionId: 'asustado' },
  { id: 'happy-brows', type: 'eyebrows', label: 'Cejas alegres', svg: 'M35 18 Q42 14 49 18 M51 18 Q58 14 65 18', emotionId: 'alegre' },
  { id: 'sad-brows', type: 'eyebrows', label: 'Cejas tristes', svg: 'M35 14 Q42 18 49 14 M51 14 Q58 18 65 14', emotionId: 'triste' },
  { id: 'angry-brows', type: 'eyebrows', label: 'Cejas enojadas', svg: 'M35 14 L49 18 M65 14 L51 18', emotionId: 'enojado' },
  { id: 'scared-brows', type: 'eyebrows', label: 'Cejas asustadas', svg: 'M35 12 Q42 16 49 14 M65 12 Q58 16 51 14', emotionId: 'asustado' },
  { id: 'happy-mouth', type: 'mouth', label: 'Boca alegre', svg: 'M40 42 Q50 50 60 42', emotionId: 'alegre' },
  { id: 'sad-mouth', type: 'mouth', label: 'Boca triste', svg: 'M40 48 Q50 42 60 48', emotionId: 'triste' },
  { id: 'angry-mouth', type: 'mouth', label: 'Boca enojada', svg: 'M38 46 L62 46', emotionId: 'enojado' },
  { id: 'scared-mouth', type: 'mouth', label: 'Boca asustada', svg: 'circle 50 46 6', emotionId: 'asustado' },
]

export default function CompletaCaraPage() {
  const [started, setStarted] = useState(false)
  const [targetEmotion, setTargetEmotion] = useState<Emotion | null>(null)
  const [selectedParts, setSelectedParts] = useState<Record<string, PartOption | null>>({ eyes: null, eyebrows: null, mouth: null })
  const [available, setAvailable] = useState<Record<string, PartOption[]>>({ eyes: [], eyebrows: [], mouth: [] })
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [total] = useState(6)
  const [finished, setFinished] = useState(false)
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const { stats, persist } = useGameStats('completa-cara')

  const newRound = useCallback(() => {
    const em = shuffle(EMOTIONS.filter(e => ['alegre', 'triste', 'enojado', 'asustado'].includes(e.id)))[0]
    setTargetEmotion(em)
    const correctParts = PART_DEFS.filter(p => p.emotionId === em.id)
    const wrongParts = shuffle(PART_DEFS.filter(p => p.emotionId !== em.id)).slice(0, 3)
    setAvailable({
      eyes: shuffle([correctParts.find(p => p.type === 'eyes')!, ...wrongParts.filter(p => p.type === 'eyes')]),
      eyebrows: shuffle([correctParts.find(p => p.type === 'eyebrows')!, ...wrongParts.filter(p => p.type === 'eyebrows')]),
      mouth: shuffle([correctParts.find(p => p.type === 'mouth')!, ...wrongParts.filter(p => p.type === 'mouth')]),
    })
    setSelectedParts({ eyes: null, eyebrows: null, mouth: null })
    setResult(null)
  }, [])

  const startGame = useCallback(() => {
    setRound(0)
    setScore(0)
    setFinished(false)
    setStarted(true)
    newRound()
  }, [newRound])

  const selectPart = (type: string, part: PartOption) => {
    if (result) return
    if (selectedParts[type]) return
    setSelectedParts(prev => ({ ...prev, [type]: part }))
    playSound('click')
    vibrate('click')
  }

  const evaluateAndNext = () => {
    const { eyes, eyebrows, mouth } = selectedParts
    const correct = targetEmotion!
    const allCorrect = eyes?.emotionId === correct.id && eyebrows?.emotionId === correct.id && mouth?.emotionId === correct.id
    if (allCorrect) { playSound('correct'); vibrate('correct'); setScore(s => s + 1) }
    else { playSound('wrong'); vibrate('wrong') }
    setResult(allCorrect ? 'correct' : 'wrong')
    setTimeout(() => {
      const next = round + 1
      if (next < total) {
        setRound(next)
        newRound()
      } else {
        persist(score + (allCorrect ? 1 : 0), total)
        setFinished(true)
      }
    }, 1200)
  }

  const allSelected = selectedParts.eyes && selectedParts.eyebrows && selectedParts.mouth

  const renderFace = () => {
    const eyesSvg = selectedParts.eyes?.svg
    const browsSvg = selectedParts.eyebrows?.svg
    const mouthSvg = selectedParts.mouth?.svg
    return (
      <svg viewBox="0 0 100 80" className="w-48 h-40">
        <circle cx="50" cy="40" r="35" fill="#fef3c7" stroke="#d4a574" strokeWidth="2" />
        {browsSvg && <path d={browsSvg} stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
        {eyesSvg?.includes('circle') ? (
          <><circle cx="42" cy="30" r="4" fill="#333" /><circle cx="58" cy="30" r="4" fill="#333" /></>
        ) : eyesSvg ? (
          <path d={eyesSvg} stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        ) : null}
        {mouthSvg?.includes('ellipse') ? (
          <ellipse cx="50" cy="46" rx="6" ry="4" fill="#e74c3c" />
        ) : mouthSvg?.includes('circle') ? (
          <circle cx="50" cy="46" r="6" fill="#e74c3c" />
        ) : mouthSvg ? (
          <path d={mouthSvg} stroke="#e74c3c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        ) : null}
      </svg>
    )
  }

  if (!started) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>← Atrás</Button>
          <h1 className="text-xl font-extrabold text-text-primary">Completa la Cara</h1>
        </div>
        <Lumi mood="thinking" message="Arma la expresión facial con las partes correctas" size="md" />
        {stats.played > 0 && <Card variant="bordered" padding="sm"><p className="text-xs text-text-muted">{stats.played} partidas · Mejor: {stats.bestScore}/{total}</p></Card>}
        <Button variant="primary" size="lg" fullWidth onClick={startGame}>Comenzar</Button>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <Lumi mood={score >= 4 ? 'excited' : 'happy'} size="lg" />
        <h2 className="text-3xl font-extrabold">{score >= 5 ? '¡Increíble!' : score >= 3 ? '¡Buen trabajo!' : '¡Sigue practicando!'}</h2>
        <Card variant="bordered" padding="lg">
          <p className="text-4xl font-extrabold text-brand">{score}/{total}</p>
          <p className="text-sm text-text-secondary">caras completadas</p>
        </Card>
        <Button variant="primary" onClick={startGame}>Jugar otra vez</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setStarted(false)}>← Atrás</Button>
        <h1 className="text-xl font-extrabold text-text-primary">Completa la Cara</h1>
        <span className="ml-auto text-xs font-bold text-text-muted bg-surface-secondary px-2 py-1 rounded-full">{round + 1}/{total}</span>
      </div>

      <motion.div key={round} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
        <Lumi mood="thinking" message={`Arma una cara ${targetEmotion?.label}`} size="sm" />
        <div className="bg-white rounded-2xl border-[3px] border-border p-4 shadow-sm">
          {renderFace()}
        </div>

        <p className="text-lg font-extrabold">Haz una cara <span className="text-brand">{targetEmotion?.label}</span> {targetEmotion?.emoji}</p>

        {(['eyes', 'eyebrows', 'mouth'] as const).map((type) => (
          <div key={type} className="w-full">
            <p className="text-xs font-bold text-text-secondary mb-2 capitalize">{type === 'eyebrows' ? 'Cejas' : type === 'eyes' ? 'Ojos' : 'Boca'}</p>
            <div className="flex gap-2">
              {available[type]?.map((part) => {
                const isSelected = selectedParts[type]?.id === part.id
                return (
                  <button key={part.id} onClick={() => selectPart(type, part)}
                    disabled={!!selectedParts[type] || !!result}
                    className={`flex-1 p-2 rounded-lg border-2 text-xs font-bold text-center transition-all ${isSelected ? 'border-brand bg-brand-bg' : selectedParts[type] ? 'opacity-30 border-border bg-gray-50' : 'border-border bg-white hover:border-brand'}`}>
                    {part.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {result && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <div className={`px-6 py-3 rounded-xl font-extrabold text-lg ${result === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {result === 'correct' ? '¡Correcto! 🎉' : `No es así. Sigue intentando.`}
            </div>
          </motion.div>
        )}

        {allSelected && !result && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Button variant="primary" size="lg" onClick={evaluateAndNext}>Comprobar</Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
