'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'
import { Dino } from '@/components/dino'
import { playSound, vibrate } from '@/lib/sounds'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TouchScreenExerciseProps {
  childName: string
  onComplete: (success: boolean) => void
}

type Phase =
  | 'intro'        // Presentación inicial
  | 'distraction'  // Dino está distraído / ocupado
  | 'calling'      // Dino llama al niño por su nombre
  | 'waiting'      // Ventana de respuesta activa
  | 'success'      // Niño respondió correctamente
  | 'missed'       // No respondió a tiempo
  | 'complete'     // Terminó todas las rondas

// ─── Configuración terapéutica por ronda ─────────────────────────────────────
// Cada ronda aumenta ligeramente la demanda cognitiva
const ROUNDS_CONFIG = [
  { callDelay: 1500, windowMs: 5000, distraction: false, callText: (name: string) => `¡${name}!` },
  { callDelay: 2000, windowMs: 4500, distraction: false, callText: (name: string) => `¡${name}, mira!` },
  { callDelay: 2500, windowMs: 4000, distraction: true,  callText: (name: string) => `${name}...` },
  { callDelay: 2000, windowMs: 4000, distraction: true,  callText: (name: string) => `¡${name}!` },
  { callDelay: 3000, windowMs: 3500, distraction: true,  callText: (name: string) => `¡${name}, ven!` },
]

// ─── Utilidad: voz del navegador ──────────────────────────────────────────────
function speakName(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'es-ES'
  utter.rate = 0.85
  utter.pitch = 1.15
  utter.volume = 1

  // Preferir voz femenina en español si disponible
  const voices = window.speechSynthesis.getVoices()
  const esVoice =
    voices.find(v => v.lang.startsWith('es') && v.name.toLowerCase().includes('female')) ||
    voices.find(v => v.lang.startsWith('es')) ||
    voices[0]
  if (esVoice) utter.voice = esVoice

  if (onEnd) utter.onend = onEnd
  window.speechSynthesis.speak(utter)
}

// ─── Partícula de celebración ─────────────────────────────────────────────────
interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  vx: number
  vy: number
  rotation: number
  shape: 'circle' | 'star' | 'square'
}

const CELEBRATION_COLORS = ['#6ED7B0', '#B89CFF', '#FFD93D', '#FF8E8E', '#74C0FC', '#FFA94D']

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 20,
    y: 50,
    color: CELEBRATION_COLORS[Math.floor(Math.random() * CELEBRATION_COLORS.length)],
    size: 8 + Math.random() * 12,
    vx: (Math.random() - 0.5) * 120,
    vy: -(60 + Math.random() * 120),
    rotation: Math.random() * 360,
    shape: (['circle', 'star', 'square'] as const)[Math.floor(Math.random() * 3)],
  }))
}

// ─── Componente: Ondas de sonido ──────────────────────────────────────────────
function SoundWaves({ active }: { active: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[1, 2, 3].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2 border-brand/30"
          initial={{ width: 80, height: 80, opacity: 0 }}
          animate={
            active
              ? {
                  width: [80, 80 + i * 50, 80 + i * 70],
                  height: [80, 80 + i * 50, 80 + i * 70],
                  opacity: [0, 0.6, 0],
                }
              : { opacity: 0 }
          }
          transition={
            active
              ? {
                  duration: 1.8,
                  delay: i * 0.3,
                  repeat: Infinity,
                  ease: 'easeOut',
                }
              : {}
          }
        />
      ))}
    </div>
  )
}

// ─── Componente: Partícula individual ────────────────────────────────────────
function ParticleEl({ p }: { p: Particle }) {
  const shape =
    p.shape === 'star' ? (
      <svg viewBox="0 0 24 24" fill={p.color} width={p.size} height={p.size}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ) : p.shape === 'square' ? (
      <div
        style={{
          width: p.size,
          height: p.size,
          backgroundColor: p.color,
          borderRadius: 2,
        }}
      />
    ) : (
      <div
        style={{
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          backgroundColor: p.color,
        }}
      />
    )

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${p.x}%`, top: `${p.y}%` }}
      initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
      animate={{
        x: p.vx * 3,
        y: p.vy * 3,
        opacity: 0,
        rotate: p.rotation,
        scale: [1, 1.2, 0.5],
      }}
      transition={{ duration: 1.4, ease: [0.2, 0.8, 0.4, 1] }}
    >
      {shape}
    </motion.div>
  )
}

// ─── Componente: Barra de cuenta regresiva ────────────────────────────────────
function CountdownBar({ durationMs, active }: { durationMs: number; active: boolean }) {
  return (
    <div className="w-full h-2 bg-border rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-brand-light to-brand"
        initial={{ width: '100%' }}
        animate={active ? { width: '0%' } : { width: '100%' }}
        transition={active ? { duration: durationMs / 1000, ease: 'linear' } : { duration: 0 }}
      />
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function TouchScreenExercise({ childName, onComplete }: TouchScreenExerciseProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [particles, setParticles] = useState<Particle[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [missedCount, setMissedCount] = useState(0)
  const [showCaregiverTip, setShowCaregiverTip] = useState(false)

  const windowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dinoControls = useAnimationControls()

  const config = ROUNDS_CONFIG[round] ?? ROUNDS_CONFIG[ROUNDS_CONFIG.length - 1]

  // ── Limpiar timers al desmontar ──
  useEffect(() => {
    return () => {
      windowTimerRef.current && clearTimeout(windowTimerRef.current)
      callTimerRef.current && clearTimeout(callTimerRef.current)
      window.speechSynthesis?.cancel()
    }
  }, [])

  // ── Iniciar ejercicio ──
  const startRound = useCallback(
    (roundIndex: number) => {
      const cfg = ROUNDS_CONFIG[roundIndex] ?? ROUNDS_CONFIG[ROUNDS_CONFIG.length - 1]
      setPhase(cfg.distraction ? 'distraction' : 'calling')

      const callDelay = cfg.distraction ? cfg.callDelay : 800

      callTimerRef.current = setTimeout(() => {
        setPhase('calling')
        setIsSpeaking(true)

        speakName(cfg.callText(childName), () => {
          setIsSpeaking(false)
          setPhase('waiting')

          // Ventana de respuesta
          windowTimerRef.current = setTimeout(() => {
            // Si llegó acá sin responder → missed
            setPhase('missed')
            setMissedCount(c => c + 1)
            playSound('wrong')
            vibrate('wrong')

            setTimeout(() => advanceOrComplete(roundIndex, score, false), 2200)
          }, cfg.windowMs)
        })
      }, callDelay)
    },
    [childName, score]
  )

  const advanceOrComplete = useCallback(
    (currentRound: number, currentScore: number, wasSuccess: boolean) => {
      const nextRound = currentRound + 1
      if (nextRound >= ROUNDS_CONFIG.length) {
        setPhase('complete')
        setTimeout(() => onComplete(currentScore >= 3), 1500)
      } else {
        setRound(nextRound)
        setPhase('intro')
        setTimeout(() => startRound(nextRound), 1200)
      }
    },
    [onComplete, startRound]
  )

  // ── Arrancar en la primera ronda ──
  useEffect(() => {
    if (phase === 'intro' && round === 0) {
      const t = setTimeout(() => startRound(0), 1800)
      return () => clearTimeout(t)
    }
  }, []) // eslint-disable-line

  // ── Tocar la pantalla ──
  const handleTouch = useCallback(() => {
    if (phase !== 'calling' && phase !== 'waiting') return

    // Limpiar timers pendientes
    windowTimerRef.current && clearTimeout(windowTimerRef.current)
    callTimerRef.current && clearTimeout(callTimerRef.current)
    window.speechSynthesis?.cancel()

    const newScore = score + 1
    setScore(newScore)
    setPhase('success')
    setParticles(generateParticles(28))
    playSound('celebration')
    vibrate('celebration')

    // Dino celebra con un bounce
    dinoControls.start({
      y: [0, -20, 0, -10, 0],
      transition: { duration: 0.7, ease: 'easeOut' },
    })

    setTimeout(() => {
      setParticles([])
      advanceOrComplete(round, newScore, true)
    }, 2200)
  }, [phase, score, round, dinoControls, advanceOrComplete])

  // ── Mensajes del Dino por fase ──
  const getDinoProps = () => {
    switch (phase) {
      case 'intro':
        return { mood: 'idle' as const, message: 'Preparando...' }
      case 'distraction':
        return { mood: 'idle' as const, message: '🎵 La la la...' }
      case 'calling':
        return { mood: 'calling' as const, message: config.callText(childName) }
      case 'waiting':
        return { mood: 'calling' as const, message: `¡${childName}! 👆` }
      case 'success':
        return { mood: 'celebrating' as const, message: '¡Perfecto! 🎉', childName }
      case 'missed':
        return { mood: 'idle' as const, message: '¡Inténtalo otra vez! 💪' }
      case 'complete':
        return { mood: 'celebrating' as const, message: '¡Lo lograste! 🌟', childName }
      default:
        return { mood: 'idle' as const, message: '' }
    }
  }

  const dinoProps = getDinoProps()

  // ── Render ──
  return (
    <div
      className="relative flex flex-col items-center justify-between min-h-[70vh] px-4 py-6 select-none overflow-hidden"
      onClick={handleTouch}
    >
      {/* ── Partículas de celebración ── */}
      <AnimatePresence>
        {particles.map(p => (
          <ParticleEl key={p.id} p={p} />
        ))}
      </AnimatePresence>

      {/* ── Progreso superior ── */}
      <div className="w-full max-w-sm space-y-3 z-10">
        {/* Dots de ronda */}
        <div className="flex justify-center gap-2">
          {ROUNDS_CONFIG.map((_, i) => (
            <motion.div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i < round
                  ? 'bg-success w-4 h-4'
                  : i === round
                  ? 'bg-brand w-5 h-5 ring-2 ring-brand/30'
                  : 'bg-border w-3 h-3'
              }`}
              animate={i === round ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1.5 }}
            />
          ))}
        </div>

        {/* Barra de tiempo — solo en fase 'waiting' */}
        <AnimatePresence>
          {phase === 'waiting' && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0.8 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0 }}
            >
              <CountdownBar durationMs={config.windowMs} active={phase === 'waiting'} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Centro: Dino + ondas + zona de toque ── */}
      <div className="relative flex flex-col items-center gap-6 z-10 flex-1 justify-center">
        {/* Ondas de sonido alrededor del Dino */}
        <div className="relative">
          <SoundWaves active={isSpeaking} />
          <motion.div animate={dinoControls}>
            <Dino
              mood={dinoProps.mood}
              size="xl"
              message={dinoProps.message}
              childName={dinoProps.childName}
            />
          </motion.div>
        </div>

        {/* ── Botón / zona de toque ── */}
        <AnimatePresence mode="wait">
          {(phase === 'calling' || phase === 'waiting') && (
            <motion.div
              key="tap-zone"
              initial={{ opacity: 0, scale: 0.7, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              className="flex flex-col items-center gap-3"
            >
              {/* Ripple pulsante */}
              <div className="relative">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full bg-brand/20"
                    animate={{
                      scale: [1, 2.2],
                      opacity: [0.6, 0],
                    }}
                    transition={{
                      duration: 1.6,
                      delay: i * 0.5,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  />
                ))}
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(139,92,246,0.4)',
                      '0 0 0 20px rgba(139,92,246,0)',
                    ],
                  }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="relative w-28 h-28 rounded-full bg-gradient-to-br from-brand-light to-brand flex items-center justify-center shadow-2xl cursor-pointer z-10"
                  onClick={handleTouch}
                >
                  <span className="text-5xl">👆</span>
                </motion.button>
              </div>

              <motion.p
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-sm font-extrabold text-brand"
              >
                ¡Toca aquí!
              </motion.p>
            </motion.div>
          )}

          {phase === 'success' && (
            <motion.div
              key="success-msg"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="text-center"
            >
              <div className="text-5xl mb-2">
                {score >= 4 ? '🏆' : score >= 2 ? '⭐' : '✅'}
              </div>
              <p className="text-xl font-extrabold text-success">¡Muy bien!</p>
            </motion.div>
          )}

          {phase === 'missed' && (
            <motion.div
              key="missed-msg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center px-6 py-4 bg-orange-50 rounded-2xl border-2 border-orange-200"
            >
              <p className="text-sm font-bold text-orange-600">
                Practica llamar su nombre suavemente 🎙️
              </p>
            </motion.div>
          )}

          {phase === 'distraction' && (
            <motion.div
              key="distraction"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-3 text-3xl"
            >
              {['🎵', '🌟', '🎵'].map((e, i) => (
                <motion.span
                  key={i}
                  animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 1.2, delay: i * 0.3, repeat: Infinity }}
                >
                  {e}
                </motion.span>
              ))}
            </motion.div>
          )}

          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="flex gap-1 justify-center text-3xl mb-2">
                {Array.from({ length: Math.min(score, 5) }).map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.15, type: 'spring' }}
                  >
                    ⭐
                  </motion.span>
                ))}
              </div>
              <p className="font-extrabold text-text-primary text-lg">
                {score} de {ROUNDS_CONFIG.length} respuestas
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Guía para el cuidador ── */}
      <div className="w-full max-w-sm z-10">
        <motion.button
          onClick={e => {
            e.stopPropagation()
            setShowCaregiverTip(t => !t)
          }}
          className="flex items-center gap-2 text-xs text-text-muted font-semibold mx-auto"
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-base">💡</span>
          <span>Guía para el acompañante</span>
        </motion.button>

        <AnimatePresence>
          {showCaregiverTip && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 bg-amber-50 border border-amber-200 rounded-2xl p-4 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-xs text-amber-800 font-semibold leading-relaxed">
                🎯 <strong>Objetivo:</strong> Que {childName} oriente su mirada o cuerpo cuando
                escucha su nombre.
                <br />
                <br />
                📋 <strong>Cómo acompañar:</strong> Sitúate frente a {childName} y refuerza
                inmediatamente cualquier movimiento de cabeza o contacto visual con una sonrisa o
                su objeto favorito.
                <br />
                <br />
                ⚠️ <strong>Si no responde:</strong> Llama suavemente su nombre una sola vez y
                espera. Evita repetirlo muchas veces seguidas para no reducir su valor.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}