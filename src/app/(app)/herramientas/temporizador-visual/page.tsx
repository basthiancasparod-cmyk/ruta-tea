'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { playSound } from '@/lib/sounds'

const SVG_R = 130
const SVG_C = 2 * Math.PI * SVG_R

type TimerStatus = 'idle' | 'running' | 'paused' | 'finished'

const ACTIVITY_PRESETS = [
  { label: 'Jugar', emoji: '🧩', minutes: 10, color: 'bg-brand border-brand text-white', hover: 'hover:bg-brand-dark' },
  { label: 'Jugar', emoji: '🧩', minutes: 15, color: 'bg-brand border-brand text-white', hover: 'hover:bg-brand-dark' },
  { label: 'Tarea', emoji: '📚', minutes: 20, color: 'bg-blue-500 border-blue-500 text-white', hover: 'hover:bg-blue-600' },
  { label: 'Tarea', emoji: '📚', minutes: 30, color: 'bg-blue-500 border-blue-500 text-white', hover: 'hover:bg-blue-600' },
  { label: 'Baño', emoji: '🛁', minutes: 5, color: 'bg-cyan-500 border-cyan-500 text-white', hover: 'hover:bg-cyan-600' },
  { label: 'Baño', emoji: '🛁', minutes: 10, color: 'bg-cyan-500 border-cyan-500 text-white', hover: 'hover:bg-cyan-600' },
  { label: 'Comer', emoji: '🍽️', minutes: 15, color: 'bg-emerald-500 border-emerald-500 text-white', hover: 'hover:bg-emerald-600' },
  { label: 'Comer', emoji: '🍽️', minutes: 20, color: 'bg-emerald-500 border-emerald-500 text-white', hover: 'hover:bg-emerald-600' },
  { label: 'Pantalla', emoji: '📱', minutes: 10, color: 'bg-purple-500 border-purple-500 text-white', hover: 'hover:bg-purple-600' },
  { label: 'Pantalla', emoji: '📱', minutes: 15, color: 'bg-purple-500 border-purple-500 text-white', hover: 'hover:bg-purple-600' },
  { label: 'Dientes', emoji: '🪥', minutes: 2, color: 'bg-rose-500 border-rose-500 text-white', hover: 'hover:bg-rose-600' },
  { label: 'Ordenar', emoji: '🧹', minutes: 5, color: 'bg-amber-500 border-amber-500 text-white', hover: 'hover:bg-amber-600' },
]

const QUICK_DURATIONS = [1, 2, 3, 5, 10, 15, 20, 30]

const DINO_META: Record<TimerStatus, { label: string; className: string }> = {
  idle: { label: 'Preparado', className: 'opacity-100' },
  running: { label: 'En curso', className: 'animate-bounce' },
  paused: { label: 'En pausa', className: 'opacity-60 grayscale' },
  finished: { label: '¡Listo!', className: 'opacity-100' },
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function getProgressColor(ratio: number) {
  if (ratio > 0.5) return '#44B39D'
  if (ratio > 0.25) return '#F59E0B'
  return '#EF4444'
}

export default function TemporizadorVisualPage() {
  const router = useRouter()
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [customMinutes, setCustomMinutes] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [activityLabel, setActivityLabel] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const pausedElapsedRef = useRef(0)
  const startTimeRef = useRef(0)
  const rafRef = useRef<number>(0)
  const totalRef = useRef(0)
  const warningsFiredRef = useRef(new Set<number>())

  const clearTimer = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const tick = useCallback(() => {
    const elapsed = pausedElapsedRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000)
    const next = Math.max(totalRef.current - elapsed, 0)
    setRemaining(next)
    if (next <= 0) {
      setStatus('finished')
      setShowConfetti(true)
      playSound('celebration')
      return
    }
    if (soundEnabled) {
      if (next <= 60 && !warningsFiredRef.current.has(60)) { warningsFiredRef.current.add(60); playSound('click') }
      if (next <= 30 && !warningsFiredRef.current.has(30)) { warningsFiredRef.current.add(30); playSound('click') }
      if (next <= 10 && !warningsFiredRef.current.has(10)) { warningsFiredRef.current.add(10); playSound('xp') }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [soundEnabled])

  const setDuration = (minutes: number, label?: string) => {
    const secs = minutes * 60
    totalRef.current = secs
    setTotalSeconds(secs)
    setRemaining(secs)
    setStatus('running')
    setActivityLabel(label ?? '')
    setShowCustom(false)
    setShowConfetti(false)
    warningsFiredRef.current.clear()
    pausedElapsedRef.current = 0
    clearTimer()
    startTimeRef.current = Date.now()
    rafRef.current = requestAnimationFrame(tick)
  }

  const handlePause = () => {
    if (status !== 'running') return
    clearTimer()
    pausedElapsedRef.current = totalSeconds - remaining
    setStatus('paused')
  }

  const handleResume = () => {
    if (status !== 'paused') return
    setStatus('running')
    startTimeRef.current = Date.now()
    rafRef.current = requestAnimationFrame(tick)
  }

  const handleCancel = () => {
    clearTimer()
    setTotalSeconds(0)
    setRemaining(0)
    setStatus('idle')
    setActivityLabel('')
    setShowConfetti(false)
  }

  const handleCustomSet = () => {
    const mins = Math.min(parseInt(customMinutes) || 0, 120)
    if (mins < 1) return
    setDuration(mins, 'Personalizado')
    setCustomMinutes('')
  }

  const handlePreset = (p: typeof ACTIVITY_PRESETS[number]) => {
    setDuration(p.minutes, p.label)
  }

  const handleExtend = (extraMinutes: number) => {
    const extraSecs = extraMinutes * 60
    totalRef.current += extraSecs
    setTotalSeconds(prev => prev + extraSecs)
    setShowConfetti(false)
    setStatus('running')
    warningsFiredRef.current.clear()
    pausedElapsedRef.current = 0
    clearTimer()
    startTimeRef.current = Date.now()
    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'Escape') { handleCancel(); return }
      if (e.key === ' ') {
        e.preventDefault()
        if (status === 'running') handlePause()
        else if (status === 'paused') handleResume()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0
  const offset = SVG_C * (1 - progress)
  const progressColor = getProgressColor(progress)

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Atrás</Button>
        <div className="flex-1">
          <h1 className="heading-page">Temporizador Visual</h1>
          <p className="text-body">Ayuda visual para entender el paso del tiempo</p>
        </div>
      </div>

      {/* Confetti overlay */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => {
              const x = Math.random() * 100
              const drift = (Math.random() - 0.5) * 150
              const fall = 300 + Math.random() * 400
              const size = 6 + Math.random() * 8
              const colors = ['#44B39D', '#F59E0B', '#8B5CF6', '#EF4444', '#6BCB77', '#4FC3F7']
              const color = colors[i % colors.length]
              return (
                <motion.div key={i} className="absolute rounded-sm"
                  style={{ left: `${x}%`, top: -20, width: size, height: size * 0.6, backgroundColor: color }}
                  initial={{ y: -20, rotate: 0, opacity: 1 }}
                  animate={{ y: fall, x: drift, rotate: 720, opacity: [1, 0.8, 0] }}
                  transition={{ duration: 1.5 + Math.random(), delay: Math.random() * 0.5, ease: 'easeIn' }}
                />
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer Display */}
      <motion.div layout className="bg-surface rounded-2xl shadow-md border border-border p-6 flex flex-col items-center relative">
        <button onClick={() => setSoundEnabled(!soundEnabled)}
          className="absolute top-3 right-3 text-lg opacity-50 hover:opacity-100 transition-opacity z-10"
          title={soundEnabled ? 'Silenciar' : 'Activar sonido'}>
          {soundEnabled ? '🔊' : '🔇'}
        </button>
        <div className="relative w-72 h-72 flex items-center justify-center mb-2">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 280 280">
            <circle cx="140" cy="140" r={SVG_R} fill="none" stroke="#eef0f4" strokeWidth="10" />
            <motion.circle cx="140" cy="140" r={SVG_R} fill="none" stroke={progressColor} strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={SVG_C}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            />
          </svg>

          <div className="relative flex flex-col items-center">
            <motion.div key={status} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className={`w-[134px] h-[134px] mb-1 transition-all duration-300 ${DINO_META[status].className}`}>
              <img src="/assets/dino-modulo-temporizador.png" alt="Dino" className="w-full h-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/dino-temporizador.png' }} />
            </motion.div>
            {remaining > 0 && remaining <= 10 && (
              <div className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full mb-1 animate-pulse">
                ¡Ya casi!
              </div>
            )}
            <motion.p key={`time-${remaining}`}
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className={`text-5xl font-black tabular-nums tracking-tight ${remaining > 0 && remaining <= 10 ? 'text-red-500' : 'text-text-primary'}`}>
              {formatTime(remaining)}
            </motion.p>
            {activityLabel && (
              <p className="text-xs font-bold text-text-muted mt-1">
                {(() => {
                  const preset = ACTIVITY_PRESETS.find(p => p.label === activityLabel)
                  return preset ? `${preset.emoji} ${activityLabel}` : `⏰ ${activityLabel}`
                })()}
              </p>
            )}
          </div>
        </div>

        {/* Status + Controls */}
        {status === 'idle' && remaining === 0 && (
          <p className="text-sm font-bold text-text-muted mb-3">Selecciona una duración</p>
        )}
        {status === 'finished' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="mb-3 bg-green-50 border-2 border-green-300 rounded-xl px-6 py-3 text-center">
            <p className="text-lg font-black text-green-700">¡Tiempo cumplido! 🎉</p>
            <p className="text-sm font-bold text-green-600">¡Excelente trabajo!</p>
          </motion.div>
        )}

        <div className="flex gap-2">
          {(status === 'running' || status === 'paused') && (
            <>
              {status === 'running' ? (
                <button onClick={handlePause}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-sm">
                  ⏸ Pausar
                </button>
              ) : (
                <button onClick={handleResume}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-dark transition-colors shadow-sm">
                  ▶ Reanudar
                </button>
              )}
              <button onClick={handleCancel}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-secondary transition-colors border border-border">
                ✕ Cancelar
              </button>
            </>
          )}
          {status === 'finished' && (
            <div className="flex flex-wrap gap-2 justify-center">
              <button onClick={() => handleExtend(1)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-sm">
                +1 min
              </button>
              <button onClick={() => handleExtend(5)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-sm">
                +5 min
              </button>
              <button onClick={handleCancel}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-dark transition-colors shadow-sm">
                🔄 Nuevo
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick durations */}
      {status !== 'finished' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-2xl shadow-md border border-border p-5">
          <h2 className="heading-section flex items-center gap-2 mb-3">
            <span>⚡</span> Duración rápida
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_DURATIONS.map(m => (
              <button key={m} onClick={() => setDuration(m)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                  totalSeconds === m * 60 && status !== 'idle'
                    ? 'border-brand bg-brand text-white shadow-sm'
                    : 'border-border bg-white text-text-primary hover:border-brand hover:text-brand'
                }`}>
                {m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}min`}
              </button>
            ))}
            <button onClick={() => setShowCustom(!showCustom)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                showCustom ? 'border-brand bg-brand text-white shadow-sm' : 'border-border bg-white text-text-primary hover:border-brand hover:text-brand'
              }`}>
              ⏱ Personalizado
            </button>
          </div>
          <AnimatePresence>
            {showCustom && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                <div className="flex gap-2 pt-3">
                  <input value={customMinutes} onChange={e => setCustomMinutes(e.target.value.replace(/\D/g, ''))}
                    className="w-24 px-3 py-2 rounded-xl border-2 border-border bg-white text-sm font-bold text-center focus:border-brand focus:outline-none"
                    placeholder="Minutos" />
                  <button onClick={handleCustomSet} disabled={!customMinutes || parseInt(customMinutes) < 1}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-dark transition-colors disabled:opacity-50 shadow-sm">
                    Iniciar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Activity presets */}
      {status !== 'finished' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-surface rounded-2xl shadow-md border border-border p-5">
          <h2 className="heading-section flex items-center gap-2 mb-3">
            <span>🎯</span> Actividades
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ACTIVITY_PRESETS.map((p, i) => {
              const isActive = totalSeconds === p.minutes * 60 && activityLabel === p.label
              return (
                <motion.button key={`${p.label}-${p.minutes}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => handlePreset(p)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${
                    isActive
                      ? `${p.color} shadow-sm`
                      : 'border-border bg-white text-text-primary hover:border-brand hover:text-brand'
                  }`}>
                  <span className="text-lg">{p.emoji}</span>
                  <span>{p.label}</span>
                  <span className="ml-auto opacity-60">{p.minutes}&apos;</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
