'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Lumi } from '@/components/lumi/Lumi'
import { warmPictogramCache } from '@/components/ui/Pictogram'
import { playSound } from '@/lib/sounds'

type Emotion = 'happy' | 'sad' | 'angry' | 'scared' | 'tired' | 'nervous'
type EnergyLevel = 'high' | 'medium' | 'low'
type BreathPattern = 'box' | 'relaxing' | 'sigh' | 'extended'
type SoundType = 'rain' | 'waves' | 'forest' | 'brown-noise' | 'white-noise'
type Step = 'check-in' | 'home' | 'home-emergency' | 'breathing' | 'grounding' | 'bubbles' | 'sounds' | 'emergency-calm' | 'check-out' | 'history'
type CalmActivity = 'breathing' | 'grounding' | 'bubbles' | 'sounds'

interface CalmSession {
  id: string; date: string; moodBefore: string | null; moodAfter: string | null
  intensityBefore: number; intensityAfter: number; activity: string | null
  breathPattern?: string; duration: number; completedEmergency?: boolean
}

interface EmotionData { id: Emotion; emoji: string; label: string; pictogram: string; bg: string; border: string; energy: EnergyLevel }

interface BreathConfig { id: BreathPattern; icon: string; title: string; desc: string; phases: { key: string; duration: number; label: string }[] }

const EMOTIONS: EmotionData[] = [
  { id: 'happy', emoji: '😊', label: 'Alegre', pictogram: 'alegre', bg: 'bg-green-50', border: 'border-green-300', energy: 'low' },
  { id: 'sad', emoji: '😢', label: 'Triste', pictogram: 'triste', bg: 'bg-blue-50', border: 'border-blue-300', energy: 'low' },
  { id: 'angry', emoji: '😡', label: 'Enojado', pictogram: 'enfadado', bg: 'bg-red-50', border: 'border-red-300', energy: 'high' },
  { id: 'scared', emoji: '😨', label: 'Asustado', pictogram: 'miedo', bg: 'bg-purple-50', border: 'border-purple-300', energy: 'high' },
  { id: 'tired', emoji: '😴', label: 'Cansado', pictogram: 'cansado', bg: 'bg-gray-50', border: 'border-gray-300', energy: 'low' },
  { id: 'nervous', emoji: '😰', label: 'Nervioso', pictogram: 'nervioso', bg: 'bg-amber-50', border: 'border-amber-300', energy: 'high' },
]

const BREATH_PATTERNS: BreathConfig[] = [
  {
    id: 'box', icon: '⬛', title: 'Respiración cuadrada', desc: '4-4-4-4',
    phases: [
      { key: 'inhale', duration: 4000, label: 'Inhala' },
      { key: 'hold', duration: 4000, label: 'Sostén' },
      { key: 'exhale', duration: 4000, label: 'Exhala' },
      { key: 'hold', duration: 4000, label: 'Sostén' },
    ],
  },
  {
    id: 'relaxing', icon: '🌙', title: 'Relajante 4-7-8', desc: 'Inhala 4 · Sostén 7 · Exhala 8',
    phases: [
      { key: 'inhale', duration: 4000, label: 'Inhala' },
      { key: 'hold', duration: 7000, label: 'Sostén' },
      { key: 'exhale', duration: 8000, label: 'Exhala' },
    ],
  },
  {
    id: 'sigh', icon: '💨', title: 'Suspiro fisiológico', desc: 'Dos inhales · Exhalación larga',
    phases: [
      { key: 'inhale', duration: 2500, label: 'Inhala' },
      { key: 'inhale-more', duration: 2500, label: 'Inhala más' },
      { key: 'exhale', duration: 6000, label: 'Exhala lento' },
    ],
  },
  {
    id: 'extended', icon: '🌊', title: 'Exhalación extendida', desc: 'Inhala 4 · Exhala 8',
    phases: [
      { key: 'inhale', duration: 4000, label: 'Inhala' },
      { key: 'exhale', duration: 8000, label: 'Exhala lento' },
    ],
  },
]

const ACTIVITIES: { id: CalmActivity; icon: string; title: string; desc: string; energy: EnergyLevel[] }[] = [
  { id: 'breathing', icon: '💨', title: 'Respirar', desc: 'Elige tu patrón', energy: ['high', 'medium', 'low'] },
  { id: 'grounding', icon: '🌱', title: 'Anclaje 5-4-3-2-1', desc: 'Conecta con tus sentidos', energy: ['high', 'medium'] },
  { id: 'bubbles', icon: '🫧', title: 'Burbujas', desc: 'Explota las burbujas', energy: ['high'] },
  { id: 'sounds', icon: '🎵', title: 'Sonidos', desc: 'Elige tu ambiente', energy: ['high', 'medium', 'low'] },
]

const ACTIVITY_NAMES: Record<CalmActivity, string> = { breathing: 'Respiración', grounding: 'Anclaje', bubbles: 'Burbujas', sounds: 'Sonidos' }
const EMOTION_LABELS: Record<Emotion, string> = { happy: 'Alegre', sad: 'Triste', angry: 'Enojado', scared: 'Asustado', tired: 'Cansado', nervous: 'Nervioso' }
const SOUND_NAMES: Record<SoundType, string> = { rain: 'Lluvia', waves: 'Olas', forest: 'Bosque', 'brown-noise': 'Ruido marrón', 'white-noise': 'Ruido blanco' }

const SESSIONS_KEY = 'rincon-calma-sessions'
const PHASE_COLORS: Record<string, string> = { inhale: 'from-emerald-300 to-teal-300', 'inhale-more': 'from-teal-300 to-cyan-300', hold: 'from-amber-200 to-yellow-200', exhale: 'from-blue-300 to-indigo-300' }

function getEmotion(emotion: string | null): EmotionData | undefined { return EMOTIONS.find(e => e.id === emotion) }

function IntensitySlider({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center gap-2 w-full max-w-xs">
      <span className="text-xs text-text-muted w-12 text-right">Poco</span>
      <input type="range" min={1} max={5} step={1} value={value} disabled={disabled}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 accent-purple-500 h-2 rounded-full appearance-none bg-purple-200 cursor-pointer disabled:opacity-40"
      />
      <span className="text-xs text-text-muted w-12">Mucho</span>
    </div>
  )
}

function EmotionGrid({ emotions, onSelect, selected, intensity, onIntensityChange, showIntensity, disabled }: {
  emotions: EmotionData[]; onSelect?: (id: Emotion) => void; selected?: string | null
  intensity?: number; onIntensityChange?: (v: number) => void; showIntensity?: boolean; disabled?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
        {emotions.map(emotion => {
          const isSelected = selected === emotion.id
          return (
            <motion.button key={emotion.id} whileTap={{ scale: 0.93 }}
              onClick={() => onSelect?.(emotion.id)}
              disabled={disabled}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed ${
                isSelected ? 'bg-purple-100 border-purple-400 ring-2 ring-purple-300' : `${emotion.bg} ${emotion.border}`
              }`}
            >
              <span className="text-3xl">{emotion.emoji}</span>
              <span className="text-xs font-bold text-text-primary">{emotion.label}</span>
            </motion.button>
          )
        })}
      </div>
      {showIntensity && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">¿Con qué intensidad?</span>
          <IntensitySlider value={intensity ?? 3} onChange={onIntensityChange ?? (() => {})} disabled={disabled} />
        </div>
      )}
    </div>
  )
}

function BreathCircle({ config, onDone }: { config: BreathConfig; onDone: () => void }) {
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [cycles, setCycles] = useState(0)
  const phases = config.phases
  const current = phases[phaseIdx]

  useEffect(() => {
    const t = setTimeout(() => {
      const next = (phaseIdx + 1) % phases.length
      if (next === 0) setCycles(c => c + 1)
      setPhaseIdx(next)
    }, current.duration)
    return () => clearTimeout(t)
  }, [phaseIdx, current.duration, phases.length])

  const progress = useMemo(() => {
    const isInhale = current.key === 'inhale' || current.key === 'inhale-more'
    const isExhale = current.key === 'exhale'
    return isInhale ? 1.5 : isExhale ? 0.6 : 1
  }, [current.key])

  const gradient = PHASE_COLORS[current.key] ?? 'from-purple-300 to-pink-200'

  return (
    <div className="flex flex-col items-center gap-6 py-2">
      <p className="text-sm font-bold text-text-secondary">{config.title}</p>

      <div className="relative flex items-center justify-center w-52 h-52">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <motion.circle cx="50" cy="50" r="42" fill="none" stroke="rgba(168,85,247,0.15)" strokeWidth="2"
            strokeDasharray={264} strokeDashoffset={264 * (1 - (phaseIdx + 1) / phases.length)}
            animate={{ strokeDashoffset: 264 * (1 - (phaseIdx + 1) / phases.length) }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </svg>
        <motion.div
          animate={{ scale: progress }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-70 absolute`}
        />
        <motion.div
          animate={{ scale: Math.max(progress - 0.25, 0.4) }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-full bg-white/70 absolute flex items-center justify-center"
        >
          <span className="text-2xl">{config.icon}</span>
        </motion.div>
      </div>

      <div className="flex items-center gap-3">
        {phases.map((p, i) => (
          <motion.div key={p.key}
            animate={{ backgroundColor: i === phaseIdx ? 'rgba(168,85,247,0.3)' : 'rgba(168,85,247,0.1)', scale: i === phaseIdx ? 1.15 : 1 }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-text-secondary"
          >
            {i + 1}
          </motion.div>
        ))}
      </div>

      <motion.p key={phaseIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="text-xl font-extrabold text-text-primary"
      >
        {current.label}
      </motion.p>

      <p className="text-xs text-text-muted">Ciclo {cycles + 1}</p>

      <Button variant="outline" size="sm" onClick={onDone}>Terminar</Button>
    </div>
  )
}

function GroundingExercise({ onDone }: { onDone: () => void }) {
  const steps = [
    { sense: 'vista', icon: '👁️', label: '5 cosas que ves', count: 5, hint: 'Mira a tu alrededor...' },
    { sense: 'tacto', icon: '✋', label: '4 cosas que tocas', count: 4, hint: 'Siente las texturas...' },
    { sense: 'oido', icon: '👂', label: '3 cosas que oyes', count: 3, hint: 'Escucha con atención...' },
    { sense: 'olfato', icon: '👃', label: '2 cosas que hueles', count: 2, hint: 'Huele el aire...' },
    { sense: 'gusto', icon: '👅', label: '1 cosa que saboreas', count: 1, hint: 'Nota el sabor...' },
  ]
  const [stepIdx, setStepIdx] = useState(0)
  const [tapped, setTapped] = useState(0)
  const [completed, setCompleted] = useState(false)
  const current = steps[stepIdx]

  const handleTap = () => {
    if (completed) return
    const next = tapped + 1
    if (next >= current.count) {
      if (stepIdx >= steps.length - 1) {
        setCompleted(true)
        playSound('celebration')
      } else {
        setStepIdx(s => s + 1)
        setTapped(0)
        playSound('click')
      }
    } else {
      setTapped(next)
      playSound('click')
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 py-2">
      <Lumi mood="idle" message="Conecta con tus sentidos" size="sm" />

      <div className="w-full max-w-sm">
        <div className="flex gap-1 mb-4 justify-center">
          {steps.map((s, i) => (
            <motion.div key={s.sense} animate={{ backgroundColor: i < stepIdx ? '#a78bfa' : i === stepIdx ? '#c4b5fd' : '#e5e7eb' }}
              className="h-1.5 flex-1 rounded-full max-w-12" />
          ))}
        </div>

        <motion.div key={stepIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card variant="bordered" padding="lg" className={`text-center cursor-pointer active:scale-[0.98] transition-all ${completed ? 'bg-green-50 border-green-300' : 'hover:border-purple-300'}`}
            onClick={handleTap}
          >
            <span className="text-5xl block mb-3">{current.icon}</span>
            <p className="text-lg font-extrabold text-text-primary mb-1">{current.label}</p>
            <p className="text-sm text-text-muted mb-3">{current.hint}</p>

            <div className="flex justify-center gap-2">
              {Array.from({ length: current.count }).map((_, i) => (
                <motion.div key={i} animate={{ scale: i < tapped ? 1 : 0.8, backgroundColor: i < tapped ? '#a78bfa' : '#e5e7eb' }}
                  className="w-4 h-4 rounded-full" />
              ))}
            </div>
            <p className="text-xs text-text-muted mt-2">{tapped}/{current.count} — toca para contar</p>
          </Card>
        </motion.div>

        {completed && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-4">
            <p className="text-green-700 font-bold mb-2">¡Bien hecho! 🌟</p>
            <Button variant="outline" size="sm" onClick={onDone}>Terminar</Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function BubblePop({ onDone }: { onDone: () => void }) {
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number; size: number; color: string; popping: boolean }[]>([])
  const [score, setScore] = useState(0)
  const idRef = useRef(0)
  const colors = ['bg-purple-300/70', 'bg-pink-300/70', 'bg-blue-300/70', 'bg-teal-300/70', 'bg-amber-300/70']

  const addBubble = useCallback(() => {
    const id = idRef.current++
    setBubbles(prev => [...prev, { id, x: Math.random() * 85 + 5, y: Math.random() * 80 + 5, size: 35 + Math.random() * 35, color: colors[Math.floor(Math.random() * colors.length)], popping: false }])
    setTimeout(() => setBubbles(prev => prev.filter(b => b.id !== id)), 5000)
  }, [])

  useEffect(() => {
    const interval = setInterval(addBubble, 800)
    return () => clearInterval(interval)
  }, [addBubble])

  const popBubble = useCallback((id: number) => {
    setBubbles(prev => prev.map(b => b.id === id ? { ...b, popping: true } : b))
    setScore(s => s + 1)
    playSound('click')
    setTimeout(() => setBubbles(prev => prev.filter(b => b.id !== id)), 200)
  }, [])

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="flex items-center justify-between w-full max-w-xs">
        <span className="text-sm font-bold text-text-secondary">💥 {score}</span>
        <Lumi mood="excited" message="¡Explota!" size="sm" />
        <Button variant="outline" size="sm" onClick={onDone}>Terminar</Button>
      </div>

      <div className="relative w-72 h-80 rounded-2xl bg-gradient-to-b from-sky-100 via-purple-50 to-pink-100 overflow-hidden border-2 border-purple-200">
        <AnimatePresence>
          {bubbles.map(b => (
            <motion.button key={b.id} onClick={() => !b.popping && popBubble(b.id)}
              initial={{ scale: 0, opacity: 1 }}
              animate={b.popping ? { scale: 1.5, opacity: 0 } : { scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: b.popping ? 0.15 : 0.3 }}
              className={`absolute rounded-full ${b.color} flex items-center justify-center cursor-pointer`}
              style={{ width: b.size, height: b.size, left: `${b.x}%`, top: `${b.y}%` }}
            >
              <span className="text-sm select-none">{b.popping ? '💥' : '🫧'}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function EnhancedSoundPlayer({ onDone }: { onDone: () => void }) {
  const [active, setActive] = useState<SoundType | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  const stop = useCallback(() => {
    cleanupRef.current?.()
    cleanupRef.current = null
    try { sourceRef.current?.stop() } catch {}
    sourceRef.current = null
    try { ctxRef.current?.close() } catch {}
    ctxRef.current = null
  }, [])

  useEffect(() => stop, [stop])

  function buildNoiseBuffer(ctx: AudioContext, duration: number, modulate?: (t: number) => number, color: 'white' | 'brown' = 'white'): AudioBuffer {
    const bufferSize = ctx.sampleRate * duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let lastOut = 0
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate
      let sample = Math.random() * 2 - 1
      if (color === 'brown') { sample = (lastOut + (0.02 * sample)) / 1.02; lastOut = sample; sample *= 1.5 }
      const envelope = modulate ? modulate(t) : 1
      data[i] = sample * envelope
    }
    return buffer
  }

  function playBuffer(ctx: AudioContext, buffer: AudioBuffer, gainVal: number, freq?: number) {
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const gain = ctx.createGain()
    gain.gain.value = gainVal
    if (freq) {
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = freq
      source.connect(filter)
      filter.connect(gain)
    } else { source.connect(gain) }
    gain.connect(ctx.destination)
    source.start()
    return source
  }

  const playSoundType = useCallback((type: SoundType) => {
    const ctx = new AudioContext()
    ctxRef.current = ctx
    let source: AudioBufferSourceNode

    switch (type) {
      case 'rain': {
        const buf = buildNoiseBuffer(ctx, 4, t => Math.max(0, 1 - t / 4))
        source = playBuffer(ctx, buf, 0.15, 1000)
        break
      }
      case 'waves': {
        const buf = buildNoiseBuffer(ctx, 4, t => (Math.sin(t * 0.3) * 0.5 + 0.5) * 0.3)
        source = playBuffer(ctx, buf, 0.12, 500)
        break
      }
      case 'forest': {
        const buf = buildNoiseBuffer(ctx, 4, () => 0)
        source = playBuffer(ctx, buf, 0)
        const chirpInterval = setInterval(() => {
          if (!ctxRef.current) { clearInterval(chirpInterval); return }
          const osc = ctx.createOscillator()
          const chirpGain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.value = 1000 + Math.random() * 1500
          osc.frequency.linearRampToValueAtTime(500 + Math.random() * 500, ctx.currentTime + 0.1)
          chirpGain.gain.value = 0.04
          chirpGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
          osc.connect(chirpGain); chirpGain.connect(ctx.destination)
          osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.12)
        }, 2000 + Math.random() * 3000)
        cleanupRef.current = () => clearInterval(chirpInterval)
        break
      }
      case 'brown-noise': {
        const buf = buildNoiseBuffer(ctx, 4, undefined, 'brown')
        source = playBuffer(ctx, buf, 0.12)
        break
      }
      case 'white-noise': {
        const buf = buildNoiseBuffer(ctx, 4)
        source = playBuffer(ctx, buf, 0.08)
        break
      }
    }
    sourceRef.current = source!
  }, [])

  const handleToggle = (id: SoundType) => {
    stop()
    if (active !== id) {
      setActive(id)
      playSoundType(id)
    } else { setActive(null) }
  }

  const sounds: { id: SoundType; icon: string; label: string; color: string }[] = [
    { id: 'rain', icon: '🌧️', label: 'Lluvia', color: 'from-blue-200 to-blue-100' },
    { id: 'waves', icon: '🌊', label: 'Olas', color: 'from-cyan-200 to-blue-100' },
    { id: 'forest', icon: '🌲', label: 'Bosque', color: 'from-green-200 to-emerald-100' },
    { id: 'brown-noise', icon: '🔊', label: 'Ruido marrón', color: 'from-amber-200 to-orange-100' },
    { id: 'white-noise', icon: '📡', label: 'Ruido blanco', color: 'from-gray-200 to-slate-100' },
  ]

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <Lumi mood="idle" message="Elige un sonido" size="sm" />
      <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
        {sounds.map(s => (
          <button key={s.id} onClick={() => handleToggle(s.id)}
            className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all active:scale-[0.95] ${
              active === s.id ? 'bg-purple-100 border-purple-400 shadow-md ring-2 ring-purple-300' : 'bg-white border-border'
            }`}
          >
            <span className="text-2xl">{s.icon}</span>
            <span className="text-[11px] font-bold text-text-primary text-center leading-tight">{s.label}</span>
          </button>
        ))}
      </div>
      {active && <p className="text-xs text-text-muted">Toca de nuevo para detener</p>}
      <Button variant="outline" size="sm" onClick={() => { stop(); onDone() }}>Terminar</Button>
    </div>
  )
}

function EmergencyCalm({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'breath' | 'ground' | 'done'>('breath')
  const [breathPhase, setBreathPhase] = useState(0)
  const [tapCount, setTapCount] = useState(0)

  useEffect(() => {
    if (phase !== 'breath') return
    const t = setTimeout(() => {
      const next = (breathPhase + 1) % 4
      if (next === 0) setPhase('ground')
      else setBreathPhase(next)
    }, 3000)
    return () => clearTimeout(t)
  }, [phase, breathPhase])

  const handleTap = () => {
    if (phase === 'ground') {
      const next = tapCount + 1
      setTapCount(next)
      if (next >= 5) setPhase('done')
    }
  }

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
          <Lumi mood="happy" size="lg" />
        </motion.div>
        <p className="text-lg font-extrabold text-text-primary">Respira hondo</p>
        <p className="text-sm text-text-muted">Tómate tu tiempo para volver</p>
        <Button variant="outline" size="sm" onClick={onDone}>Listo</Button>
      </div>
    )
  }

  const breathLabels = ['Inhala', 'Sostén', 'Exhala', 'Sostén']

  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <motion.div animate={{ scale: phase === 'breath' ? [1, 1.3, 1] : 1 }} transition={{ duration: 3, repeat: phase === 'breath' ? 0 : 0 }}>
        <Lumi mood="idle" message={phase === 'breath' ? 'Respira conmigo' : 'Toca 5 veces'} size="md" />
      </motion.div>

      {phase === 'breath' ? (
        <>
          <p className="text-2xl font-extrabold text-text-primary">{breathLabels[breathPhase]}</p>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-300 opacity-70 mx-auto" />
          <p className="text-xs text-text-muted">Un momento... vamos a calmarnos</p>
        </>
      ) : (
        <Card variant="bordered" padding="lg" onClick={handleTap} className="cursor-pointer active:scale-[0.97] transition-all">
          <p className="text-lg font-extrabold text-text-primary mb-2">Toca para anclarte</p>
          <div className="flex justify-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div key={i} animate={{ scale: i < tapCount ? 1 : 0.7, backgroundColor: i < tapCount ? '#a78bfa' : '#e5e7eb' }}
                className="w-5 h-5 rounded-full" />
            ))}
          </div>
          <p className="text-xs text-text-muted mt-2">{tapCount}/5</p>
        </Card>
      )}
    </div>
  )
}

function HistoryView({ sessions, onClose }: { sessions: CalmSession[]; onClose: () => void }) {
  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }
  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60); const sec = s % 60
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`
  }

  const getActivityName = (a: string | null) => {
    if (!a) return '—'
    return ACTIVITY_NAMES[a as CalmActivity] ?? a
  }
  const getEmoji = (e: string | null) => getEmotion(e)?.emoji ?? '🤷'

  const insights = useMemo(() => {
    if (sessions.length === 0) return null
    const total = sessions.length
    const activityCounts: Record<string, number> = {}
    const emotionCounts: Record<string, number> = {}
    const before = sessions.map(s => s.moodBefore).filter(Boolean)
    const after = sessions.map(s => s.moodAfter).filter(Boolean)
    sessions.forEach(s => {
      if (s.activity) activityCounts[s.activity] = (activityCounts[s.activity] ?? 0) + 1
      if (s.moodBefore) emotionCounts[s.moodBefore] = (emotionCounts[s.moodBefore] ?? 0) + 1
    })
    const topActivity = Object.entries(activityCounts).sort((a, b) => b[1] - a[1])[0]
    const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]
    const improved = sessions.filter(s => s.moodBefore && s.moodAfter && s.moodBefore !== s.moodAfter).length
    return { total, topActivity, topEmotion, improved }
  }, [sessions])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onClose}>← Volver</Button>
        <h2 className="text-lg font-extrabold text-text-primary">Mi historial</h2>
      </div>

      {sessions.length === 0 ? (
        <Card variant="bordered" padding="lg" className="text-center">
          <span className="text-4xl block mb-2">📖</span>
          <p className="text-text-secondary font-bold">Aún no hay sesiones</p>
          <p className="text-xs text-text-muted mt-1">Cada visita al rincón de calma se guarda aquí</p>
        </Card>
      ) : (
        <>
          {insights && (
            <Card variant="default" padding="sm" className="bg-purple-50 border-purple-200">
              <p className="text-xs font-extrabold text-text-secondary mb-2">Tus tendencias</p>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <p className="text-lg font-extrabold text-brand">{insights.total}</p>
                  <p className="text-[10px] text-text-muted">Sesiones totales</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-brand">{insights.improved}</p>
                  <p className="text-[10px] text-text-muted">Cambiaste de emoción</p>
                </div>
                {insights.topActivity && (
                  <div>
                    <p className="text-sm font-extrabold text-brand">{ACTIVITY_NAMES[insights.topActivity[0] as CalmActivity] ?? insights.topActivity[0]}</p>
                    <p className="text-[10px] text-text-muted">Actividad favorita</p>
                  </div>
                )}
                {insights.topEmotion && (
                  <div>
                    <p className="text-sm font-extrabold text-brand">{EMOTION_LABELS[insights.topEmotion[0] as Emotion] ?? insights.topEmotion[0]} {getEmotion(insights.topEmotion[0])?.emoji}</p>
                    <p className="text-[10px] text-text-muted">Emoción más frecuente</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
            {sessions.map(s => (
              <Card key={s.id} variant="default" padding="sm">
                <div className="flex items-center gap-2">
                  <span>{getEmoji(s.moodBefore)}<span className="text-xs text-text-muted mx-0.5">→</span>{getEmoji(s.moodAfter)}</span>
                  <div className="text-xs flex-1 min-w-0">
                    <p className="font-bold text-text-primary truncate">{getActivityName(s.activity)}</p>
                    <p className="text-text-muted truncate">{formatDate(s.date)} · {formatDuration(s.duration)}</p>
                  </div>
                  {s.intensityBefore > 0 && (
                    <span className="text-xs text-text-muted shrink-0">{'⚡'.repeat(s.intensityBefore)}</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function RinconCalmaPage() {
  const [step, setStep] = useState<Step>('check-in')
  const [moodBefore, setMoodBefore] = useState<Emotion | null>(null)
  const [moodAfter, setMoodAfter] = useState<Emotion | null>(null)
  const [intensityBefore, setIntensityBefore] = useState(3)
  const [intensityAfter, setIntensityAfter] = useState(3)
  const [selectedActivity, setSelectedActivity] = useState<CalmActivity | null>(null)
  const [selectedBreath, setSelectedBreath] = useState<BreathPattern | null>(null)
  const [sessions, setSessions] = useState<CalmSession[]>([])
  const [sessionStart] = useState(Date.now())
  const [showHistory, setShowHistory] = useState(false)
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false)

  useEffect(() => {
    warmPictogramCache(EMOTIONS.map(e => e.pictogram))
    try { const raw = localStorage.getItem(SESSIONS_KEY); if (raw) setSessions(JSON.parse(raw)) } catch {}
  }, [])

  const saveSession = useCallback((after: Emotion | null, intensityAft: number) => {
    const session: CalmSession = {
      id: crypto.randomUUID(), date: new Date().toISOString(),
      moodBefore: moodBefore, moodAfter: after,
      intensityBefore, intensityAfter: intensityAft,
      activity: selectedActivity, breathPattern: selectedBreath ?? undefined,
      duration: Math.round((Date.now() - sessionStart) / 1000),
      completedEmergency: step === 'emergency-calm',
    }
    const updated = [session, ...sessions].slice(0, 50)
    setSessions(updated)
    try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated)) } catch {}
  }, [moodBefore, intensityBefore, selectedActivity, selectedBreath, sessionStart, sessions, step])

  const handleCheckIn = (emotion: Emotion) => {
    setMoodBefore(emotion)
    setStep('home')
    playSound('click')
  }

  const handleActivityDone = () => setStep('check-out')

  const handleCheckOut = (emotion: Emotion) => {
    setMoodAfter(emotion)
    saveSession(emotion, intensityAfter)
    playSound('celebration')
  }

  const handleRestart = () => {
    setStep('check-in'); setMoodBefore(null); setMoodAfter(null)
    setIntensityBefore(3); setIntensityAfter(3)
    setSelectedActivity(null); setSelectedBreath(null)
    setShowEmergencyConfirm(false)
  }

  const userEnergy = moodBefore ? (EMOTIONS.find(e => e.id === moodBefore)?.energy ?? 'medium') : null
  const filteredActivities = userEnergy ? ACTIVITIES.filter(a => a.energy.includes(userEnergy)) : ACTIVITIES

  if (showHistory) return (<div className="max-w-lg mx-auto px-4 py-6"><HistoryView sessions={sessions} onClose={() => setShowHistory(false)} /></div>)

  if (step === 'check-in') {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>← Atrás</Button>
          <h1 className="text-xl font-extrabold text-text-primary">Rincón de Calma</h1>
          {sessions.length > 0 && (
            <button onClick={() => setShowHistory(true)} className="ml-auto text-xs text-text-muted underline">Historial</button>
          )}
        </div>
        <Lumi mood="thinking" message="¿Cómo te sientes?" size="md" />
        <div className="mt-4">
          <EmotionGrid emotions={EMOTIONS} onSelect={handleCheckIn} showIntensity intensity={intensityBefore} onIntensityChange={setIntensityBefore} />
        </div>
        <button onClick={() => { setMoodBefore(null); setIntensityBefore(0); setStep('home') }}
          className="w-full mt-3 py-3 text-center text-xs font-bold text-text-muted bg-white rounded-xl border-2 border-border border-dashed active:scale-[0.98] transition-all"
        >No sé / Prefiero empezar</button>
      </div>
    )
  }

  if (step === 'home') {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={() => setStep('check-in')}>← Atrás</Button>
          <h2 className="text-lg font-extrabold text-text-primary">¿Qué necesitas?</h2>
          <button onClick={() => setShowEmergencyConfirm(true)} className="ml-auto text-2xl" title="Ayuda rápida">🆘</button>
        </div>

        <Lumi mood="idle" message={moodBefore ? `Estás ${EMOTION_LABELS[moodBefore]?.toLowerCase() ?? 'así'}` : 'Elige una actividad'} size="md" />

        {userEnergy && (
          <div className="flex justify-center gap-1 mb-3">
            <span className="text-xs text-text-muted">Energía:</span>
            {['high', 'medium', 'low'].map(e => (
              <span key={e} className={`text-xs px-2 py-0.5 rounded-full ${e === userEnergy ? 'bg-purple-200 text-purple-800 font-bold' : 'text-text-muted'}`}>
                {e === 'high' ? '🔥 Alta' : e === 'medium' ? '🌿 Media' : '😴 Baja'}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 mt-3">
          {filteredActivities.map(activity => (
            <motion.button key={activity.id} whileTap={{ scale: 0.97 }}
              onClick={() => { setSelectedActivity(activity.id); setStep(activity.id === 'breathing' ? 'home' : activity.id as Step); if (activity.id !== 'breathing') playSound('click') }}
              className="w-full flex items-center gap-3 p-3.5 bg-white rounded-2xl border-2 border-border active:border-purple-300 active:bg-purple-50 transition-all text-left"
            >
              <span className="text-2xl">{activity.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm text-text-primary">{activity.title}</p>
                <p className="text-[11px] text-text-muted truncate">{activity.desc}</p>
              </div>
              {activity.id === 'breathing' && <span className="text-xs text-text-muted">→ Elegir patrón</span>}
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {showEmergencyConfirm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40"
              onClick={() => setShowEmergencyConfirm(false)}
            >
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                className="bg-white rounded-2xl p-6 max-w-xs w-full text-center"
                onClick={e => e.stopPropagation()}
              >
                <span className="text-4xl block mb-2">🆘</span>
                <p className="font-extrabold text-text-primary mb-1">¿Necesitas ayuda rápida?</p>
                <p className="text-xs text-text-muted mb-4">Un ejercicio corto de respiración y anclaje para calmarte</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={() => setShowEmergencyConfirm(false)}>Cancelar</Button>
                  <Button variant="primary" size="sm" onClick={() => { setShowEmergencyConfirm(false); setStep('emergency-calm'); setSelectedActivity('grounding') }}>
                    Sí, ahora
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedActivity === 'breathing' && step === 'home' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
            <p className="text-xs font-bold text-text-secondary mb-2">Elige un patrón de respiración:</p>
            <div className="flex flex-col gap-2">
              {BREATH_PATTERNS.map(bp => (
                <button key={bp.id} onClick={() => { setSelectedBreath(bp.id); setStep('breathing'); playSound('click') }}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all active:scale-[0.97] text-left ${selectedBreath === bp.id ? 'bg-purple-100 border-purple-400' : 'bg-white border-border'}`}
                >
                  <span className="text-xl">{bp.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-text-primary">{bp.title}</p>
                    <p className="text-[10px] text-text-muted">{bp.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-3 justify-center">
              <Button variant="ghost" size="sm" onClick={() => setSelectedActivity(null)}>Cancelar</Button>
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  if (step === 'breathing') {
    const config = BREATH_PATTERNS.find(bp => bp.id === selectedBreath) ?? BREATH_PATTERNS[0]
    return (<div className="max-w-lg mx-auto px-4 py-6"><BreathCircle config={config} onDone={handleActivityDone} /></div>)
  }

  if (step === 'grounding') return (<div className="max-w-lg mx-auto px-4 py-6"><GroundingExercise onDone={handleActivityDone} /></div>)

  if (step === 'bubbles') return (<div className="max-w-lg mx-auto px-4 py-6"><BubblePop onDone={handleActivityDone} /></div>)

  if (step === 'sounds') return (<div className="max-w-lg mx-auto px-4 py-6"><EnhancedSoundPlayer onDone={handleActivityDone} /></div>)

  if (step === 'emergency-calm') return (<div className="max-w-lg mx-auto px-4 py-6"><EmergencyCalm onDone={handleActivityDone} /></div>)

  if (step === 'check-out') {
    const before = getEmotion(moodBefore)
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-extrabold text-text-primary">¿Cómo te sientes ahora?</h2>
        </div>
        {moodBefore && (
          <Card variant="default" padding="sm" className="text-center mb-3">
            <p className="text-xs text-text-muted">Antes: {before?.emoji} {before?.label}{'⚡'.repeat(intensityBefore)}</p>
          </Card>
        )}
        <EmotionGrid emotions={EMOTIONS} onSelect={handleCheckOut} showIntensity intensity={intensityAfter} onIntensityChange={setIntensityAfter} />
        {moodAfter && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-center">
            <Card variant="bordered" padding="md" className="bg-purple-50 border-purple-200">
              <Lumi mood="happy" size="lg" />
              <p className="text-lg font-extrabold text-text-primary mt-1">Gracias por venir al rincón de calma</p>
              <p className="text-xs text-text-muted mt-1">Siempre estoy aquí cuando me necesites</p>
            </Card>
            <div className="flex gap-2 mt-3 justify-center">
              <Button variant="outline" size="sm" onClick={handleRestart}>🔄 Otra vez</Button>
              <Button variant="primary" size="sm" onClick={() => window.history.back()}>Listo</Button>
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  return null
}
