'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { playSound } from '@/lib/sounds'

type Emotion = 'happy' | 'sad' | 'angry' | 'scared' | 'tired' | 'nervous'
type EnergyLevel = 'high' | 'medium' | 'low'
type BreathPattern = 'box' | 'relaxing' | 'sigh' | 'extended'
type SoundType = 'rain' | 'waves' | 'forest' | 'brown-noise' | 'white-noise'
type Step = 'check-in' | 'home' | 'breathing' | 'grounding' | 'bubbles' | 'sounds' | 'emergency-calm' | 'check-out' | 'history'
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

const SESSIONS_KEY = 'rincon-calma-sessions'
const PHASE_COLORS: Record<string, string> = { inhale: '#34d399', 'inhale-more': '#2dd4bf', hold: '#fbbf24', exhale: '#60a5fa' }
const PETAL_COLORS = ['#a78bfa', '#34d399', '#f472b6', '#60a5fa']

function getEmotion(emotion: string | null): EmotionData | undefined { return EMOTIONS.find(e => e.id === emotion) }

function DinoCalma({ message, size = 'md' }: { message?: string; size?: 'sm' | 'md' | 'lg' }) {
  const px = { sm: 100, md: 140, lg: 180 }[size]
  return (
    <div className="flex flex-col items-center gap-2">
      <img src="/assets/dino-ricon-calma.png" alt="" width={px} height={px} className="object-contain"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
      {message && <p className="text-sm font-bold text-text-primary text-center">{message}</p>}
    </div>
  )
}

function IntensitySlider({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  const clamped = Math.max(1, Math.min(5, value))
  return (
    <div className="flex items-center gap-2 w-full max-w-xs">
      <span className="text-xs text-text-muted w-12 text-right">Poco</span>
      <input type="range" min={1} max={5} step={1} value={clamped} disabled={disabled}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 accent-purple-500 h-2 rounded-full appearance-none bg-purple-200 cursor-pointer disabled:opacity-40"
        aria-label="Intensidad de la emoción"
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
            <motion.button key={emotion.id} whileTap={{ scale: 0.95 }}
              onClick={() => onSelect?.(emotion.id)}
              disabled={disabled}
              className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isSelected
                  ? 'bg-purple-100 border-purple-400 ring-2 ring-purple-300'
                  : `${emotion.bg} ${emotion.border} bg-white hover:border-purple-300`
              }`}
            >
              <span className="text-5xl">{emotion.emoji}</span>
              <span className="text-base font-bold text-text-primary">{emotion.label}</span>
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

  const prevPhaseIdx = phaseIdx === 0 ? phases.length - 1 : phaseIdx - 1
  const prevKey = phases[prevPhaseIdx].key
  const currentKey = current.key

  const isInhale = currentKey === 'inhale' || currentKey === 'inhale-more'
  const isExhale = currentKey === 'exhale'
  const isPrevInhale = prevKey === 'inhale' || prevKey === 'inhale-more'

  const petalRadius = isInhale ? 64 : isExhale ? 24 : isPrevInhale ? 64 : 24
  const petalScale = isInhale ? 1 : isExhale ? 0.6 : isPrevInhale ? 1 : 0.6
  const groupRotation = isInhale ? 45 : isExhale ? 0 : isPrevInhale ? 45 : 0
  const centerScale = isInhale ? 1.3 : isExhale ? 0.8 : isPrevInhale ? 1.3 : 0.8

  const circumference = 2 * Math.PI * 60
  const PETAL_COUNT = 4

  return (
    <div className="flex flex-col items-center gap-6 py-2">
      <p className="text-sm font-bold text-text-secondary">{config.title}</p>

      <div className="relative flex items-center justify-center w-56 h-56">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(168,85,247,0.12)" strokeWidth="3" />
          <motion.circle key={phaseIdx}
            cx="70" cy="70" r="60" fill="none"
            stroke={PHASE_COLORS[currentKey] ?? '#a78bfa'}
            strokeWidth="3" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: current.duration / 1000, ease: 'linear' }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="relative w-full h-full"
            animate={{ rotate: groupRotation }}
            transition={{ duration: current.duration / 1000, ease: 'easeInOut' }}
          >
            {Array.from({ length: PETAL_COUNT }).map((_, i) => {
              const angle = (i * 360) / PETAL_COUNT
              const rad = (angle * Math.PI) / 180
              const x = Math.cos(rad) * petalRadius
              const y = Math.sin(rad) * petalRadius
              return (
                <motion.div
                  key={i}
                  className="absolute w-8 h-8 rounded-full left-1/2 top-1/2 -ml-4 -mt-4"
                  style={{
                    background: `radial-gradient(circle at 40% 35%, ${PETAL_COLORS[i]}80, ${PETAL_COLORS[i]}40)`,
                  }}
                  animate={{ x, y, scale: petalScale }}
                  transition={{ duration: current.duration / 1000, ease: 'easeInOut' }}
                />
              )
            })}
          </motion.div>
        </div>

        <motion.div
          className="w-14 h-14 rounded-full bg-white flex items-center justify-center z-10 shadow-inner"
          animate={{ scale: centerScale }}
          transition={{ duration: current.duration / 1000, ease: 'easeInOut' }}
        >
          <span className="text-xl">{config.icon}</span>
        </motion.div>
      </div>

      <div className="flex items-center gap-3">
        {phases.map((p, i) => (
          <motion.div key={p.key + i}
            animate={{
              backgroundColor: i === phaseIdx ? `${PHASE_COLORS[p.key]}40` : 'rgba(168,85,247,0.08)',
              scale: i === phaseIdx ? 1.2 : 1,
              borderColor: i === phaseIdx ? PHASE_COLORS[p.key] : 'rgba(168,85,247,0.15)',
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-text-secondary border-2"
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

function GroundingExercise({ onDone, soundEnabled }: { onDone: () => void; soundEnabled?: boolean }) {
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
        if (soundEnabled) playSound('celebration')
      } else {
        setStepIdx(s => s + 1)
        setTapped(0)
        if (soundEnabled) playSound('click')
      }
    } else {
      setTapped(next)
      if (soundEnabled) playSound('click')
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 py-2">
      <DinoCalma message="Conecta con tus sentidos" size="sm" />

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

function BubblePop({ onDone, soundEnabled }: { onDone: () => void; soundEnabled?: boolean }) {
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
    if (soundEnabled) playSound('click')
    setTimeout(() => setBubbles(prev => prev.filter(b => b.id !== id)), 200)
  }, [])

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="flex items-center justify-between w-full max-w-xs">
        <span className="text-sm font-bold text-text-secondary">💥 {score}</span>
        <DinoCalma message="¡Explota!" size="sm" />
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

function EnhancedSoundPlayer({ onDone, soundEnabled }: { onDone: () => void; soundEnabled?: boolean }) {
  const [active, setActive] = useState<SoundType | null>(null)
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({})
  const ctxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)

  const stop = useCallback(() => {
    Object.values(audioRefs.current).forEach(a => { a.pause(); a.currentTime = 0 })
    audioRefs.current = {}
    try { sourceRef.current?.stop() } catch {}
    sourceRef.current = null
    try { ctxRef.current?.close() } catch {}
    ctxRef.current = null
  }, [])

  useEffect(() => stop, [stop])

  function buildNoiseBuffer(ctx: AudioContext, duration: number, color: 'white' | 'brown' = 'white'): AudioBuffer {
    const bufferSize = ctx.sampleRate * duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let lastOut = 0
    for (let i = 0; i < bufferSize; i++) {
      let sample = Math.random() * 2 - 1
      if (color === 'brown') { sample = (lastOut + (0.02 * sample)) / 1.02; lastOut = sample; sample *= 1.5 }
      data[i] = sample
    }
    return buffer
  }

  const playSoundType = useCallback((type: SoundType) => {
    if (type === 'rain' || type === 'waves' || type === 'forest') {
      const filename = type === 'rain' ? 'rain.ogg' : type === 'waves' ? 'waves.ogg' : 'forest.ogg'
      const audio = new Audio(`/assets/sounds/${filename}`)
      audio.loop = true
      audio.volume = 0.5
      audioRefs.current[type] = audio
      audio.play().catch(() => {})
      return
    }

    const ctx = new AudioContext()
    ctxRef.current = ctx
    const buf = buildNoiseBuffer(ctx, 4, type === 'brown-noise' ? 'brown' : 'white')
    const source = ctx.createBufferSource()
    source.buffer = buf
    source.loop = true
    const gain = ctx.createGain()
    gain.gain.value = type === 'brown-noise' ? 0.12 : 0.08
    source.connect(gain)
    gain.connect(ctx.destination)
    source.start()
    sourceRef.current = source
  }, [])

  const handleToggle = (id: SoundType) => {
    stop()
    if (active !== id) {
      if (!soundEnabled) return
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
      <DinoCalma message="Elige un sonido" size="sm" />
      <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
        {sounds.map(s => (
          <button key={s.id} onClick={() => handleToggle(s.id)} aria-label={s.label}
            className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all active:scale-[0.95] ${
              active === s.id ? 'bg-purple-100 border-purple-400 shadow-md ring-2 ring-purple-300' : 'bg-white border-border hover:border-purple-300'
            }`}
          >
            <span className="text-3xl">{s.icon}</span>
            <span className="text-sm font-bold text-text-primary text-center leading-tight">{s.label}</span>
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
                <DinoCalma size="lg" />
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
      <motion.div animate={{ scale: phase === 'breath' ? [1, 1.3, 1] : 1 }} transition={{ duration: 3, repeat: phase === 'breath' ? Infinity : 0 }}>
        <DinoCalma message={phase === 'breath' ? 'Respira conmigo' : 'Toca 5 veces'} size="md" />
      </motion.div>

      {phase === 'breath' ? (
        <>
          <p className="text-2xl font-extrabold text-text-primary">{breathLabels[breathPhase]}</p>
          <motion.div
            animate={{ scale: breathPhase % 2 === 0 ? [1, 1.2, 1] : [1, 0.85, 1] }}
            transition={{ duration: 3, ease: 'easeInOut' }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-300 opacity-70 mx-auto"
          />
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
        <div className="flex-1">
          <h1 className="heading-page">Mi historial</h1>
          <p className="text-body">Todas tus visitas al rincón de calma</p>
        </div>
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
                  <p className="text-badge text-text-muted font-semibold">Sesiones totales</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-brand">{insights.improved}</p>
                  <p className="text-badge text-text-muted font-semibold">Cambiaste de emoción</p>
                </div>
                {insights.topActivity && (
                  <div>
                    <p className="text-sm font-extrabold text-brand">{ACTIVITY_NAMES[insights.topActivity[0] as CalmActivity] ?? insights.topActivity[0]}</p>
                    <p className="text-badge text-text-muted font-semibold">Actividad favorita</p>
                  </div>
                )}
                {insights.topEmotion && (
                  <div>
                    <p className="text-sm font-extrabold text-brand">{EMOTION_LABELS[insights.topEmotion[0] as Emotion] ?? insights.topEmotion[0]} {getEmotion(insights.topEmotion[0])?.emoji}</p>
                    <p className="text-badge text-text-muted font-semibold">Emoción más frecuente</p>
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

const CONFETTI_COLORS = ['#44B39D', '#FFB347', '#6BCB77', '#8B5CF6', '#FF6B6B', '#FFC800', '#FF6B00']

function ConfettiBurst() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => {
        const x = Math.random() * 100
        const drift = (Math.random() - 0.5) * 200
        const fall = 300 + Math.random() * 400
        const delay = Math.random() * 0.5
        const size = 6 + Math.random() * 8
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length]
        const rotate = Math.random() * 720
        return (
          <motion.div
            key={i}
            className="absolute rounded-sm"
            style={{
              left: `${x}%`, top: -20,
              width: size, height: size * 0.6,
              backgroundColor: color,
            }}
            initial={{ y: -20, rotate: 0, opacity: 1 }}
            animate={{ y: fall, x: drift, rotate, opacity: [1, 0.8, 0] }}
            transition={{ duration: 1.5 + Math.random(), delay, ease: 'easeIn' }}
          />
        )
      })}
    </div>
  )
}

function SoundToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className="text-lg shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      title={enabled ? 'Silenciar' : 'Activar sonido'}
      aria-label={enabled ? 'Silenciar sonidos' : 'Activar sonidos'}
    >
      {enabled ? '🔊' : '🔇'}
    </button>
  )
}

function StepWrapper({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex flex-col gap-4 ${className}`}
    >
      {children}
    </motion.div>
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
  const sessionStartRef = useRef(Date.now())
  const [showHistory, setShowHistory] = useState(false)
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    try { const raw = localStorage.getItem(SESSIONS_KEY); if (raw) setSessions(JSON.parse(raw)) } catch {}
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'Escape') {
        if (showEmergencyConfirm) { setShowEmergencyConfirm(false); return }
        if (step === 'check-in') { window.history.back(); return }
        if (step === 'home') { setStep('check-in'); return }
        if (step !== 'check-out') { setStep('home'); return }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [step, showEmergencyConfirm])

  const saveSession = useCallback((after: Emotion | null, intensityAft: number) => {
    const session: CalmSession = {
      id: crypto.randomUUID(), date: new Date().toISOString(),
      moodBefore: moodBefore, moodAfter: after,
      intensityBefore, intensityAfter: intensityAft,
      activity: selectedActivity, breathPattern: selectedBreath ?? undefined,
      duration: Math.round((Date.now() - sessionStartRef.current) / 1000),
      completedEmergency: step === 'emergency-calm',
    }
    const updated = [session, ...sessions].slice(0, 50)
    setSessions(updated)
    try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated)) } catch {}
  }, [moodBefore, intensityBefore, selectedActivity, selectedBreath, sessions, step])

  const ps = useCallback((name: 'click' | 'celebration') => {
    if (soundEnabled) playSound(name)
  }, [soundEnabled])

  const handleCheckIn = (emotion: Emotion) => {
    setMoodBefore(emotion)
    setStep('home')
    ps('click')
  }

  const handleActivityDone = () => setStep('check-out')

  const handleCheckOut = (emotion: Emotion) => {
    setMoodAfter(emotion)
    saveSession(emotion, intensityAfter)
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 2500)
    ps('celebration')
  }

  const handleRestart = () => {
    setStep('check-in'); setMoodBefore(null); setMoodAfter(null)
    setIntensityBefore(3); setIntensityAfter(3)
    setSelectedActivity(null); setSelectedBreath(null)
    setShowEmergencyConfirm(false)
    sessionStartRef.current = Date.now()
  }

  const userEnergy = moodBefore ? (EMOTIONS.find(e => e.id === moodBefore)?.energy ?? 'medium') : null
  const filteredActivities = userEnergy ? ACTIVITIES.filter(a => a.energy.includes(userEnergy)) : ACTIVITIES

  function renderStepContent() {
    if (showHistory) return (
      <div className="flex flex-col gap-4 pb-8">
        <StepWrapper>
          <HistoryView sessions={sessions} onClose={() => setShowHistory(false)} />
        </StepWrapper>
      </div>
    )

    switch (step) {
      case 'check-in':
        return (
          <div className="flex flex-col gap-4 pb-8">
            <StepWrapper>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => window.history.back()}>← Atrás</Button>
                <div className="flex-1">
                  <h1 className="heading-page">Rincón de Calma</h1>
                  <p className="text-body">Un espacio seguro para aprender a autorregularse</p>
                </div>
                <SoundToggle enabled={soundEnabled} onToggle={() => setSoundEnabled(v => !v)} />
                {sessions.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setShowHistory(true)}>Historial</Button>
                )}
              </div>
              <div className="flex flex-col items-center gap-4">
                <DinoCalma message="¿Cómo te sientes?" size="md" />
                <EmotionGrid emotions={EMOTIONS} onSelect={handleCheckIn} showIntensity intensity={intensityBefore} onIntensityChange={setIntensityBefore} />
                <Button variant="outline" size="md" onClick={() => { setMoodBefore(null); setIntensityBefore(3); setStep('home') }}
                  className="w-full max-w-xs border-dashed"
                >No sé / Prefiero empezar</Button>
              </div>
              <Card variant="default" padding="md" className="bg-blue-50 border-blue-200">
                <div className="flex gap-3">
                  <span className="text-2xl shrink-0">💡</span>
                  <div className="flex-1">
                    <h3 className="heading-card mb-1">Consejos útiles</h3>
                    <p className="text-meta leading-relaxed">
                      El rincón de calma es un espacio seguro para que el niño aprenda a autorregularse.
                      Animalo a elegir la actividad que más le guste y celebra su esfuerzo, no solo el
                      resultado. La consistencia crea predictibilidad y reduce la ansiedad.
                    </p>
                  </div>
                </div>
              </Card>
            </StepWrapper>
          </div>
        )

      case 'home':
        return (
          <div className="flex flex-col gap-4 pb-8">
            <StepWrapper>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setStep('check-in')}>← Atrás</Button>
                <div className="flex-1">
                  <h1 className="heading-page">Rincón de Calma</h1>
                  <p className="text-body">Elije lo que necesitas ahora</p>
                </div>
                <SoundToggle enabled={soundEnabled} onToggle={() => setSoundEnabled(v => !v)} />
                <button onClick={() => setShowEmergencyConfirm(true)} className="text-2xl shrink-0" title="Ayuda rápida" aria-label="Ayuda rápida de emergencia">🆘</button>
              </div>

              <div className="flex flex-col items-center gap-4">
                <DinoCalma message={moodBefore ? `Estás ${EMOTION_LABELS[moodBefore]?.toLowerCase() ?? 'así'}` : 'Elige una actividad'} size="md" />

                {userEnergy && (
                  <div className="flex justify-center gap-1">
                    <span className="text-xs text-text-muted">Energía:</span>
                    {['high', 'medium', 'low'].map(e => (
                      <span key={e} className={`text-badge px-2 py-0.5 rounded-full ${e === userEnergy ? 'bg-purple-200 text-purple-800 font-bold' : 'text-text-muted'}`}>
                        {e === 'high' ? '🔥 Alta' : e === 'medium' ? '🌿 Media' : '😴 Baja'}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-2 w-full max-w-sm">
                  {filteredActivities.map(activity => (
                    <motion.button key={activity.id} whileTap={{ scale: 0.97 }}
                      onClick={() => { setSelectedActivity(activity.id); setStep(activity.id === 'breathing' ? 'home' : activity.id as Step); if (activity.id !== 'breathing') ps('click') }}
                      className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border-2 border-border active:border-purple-300 active:bg-purple-50 transition-all text-left hover:border-purple-300"
                      aria-label={activity.title}
                    >
                      <span className="text-3xl">{activity.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-base text-text-primary">{activity.title}</p>
                        <p className="text-meta truncate">{activity.desc}</p>
                      </div>
                      {activity.id === 'breathing' && <span className="text-xs text-text-muted">→ Elegir patrón</span>}
                      {activity.id === 'sounds' && <span className="text-xs text-text-muted shrink-0">🎵</span>}
                    </motion.button>
                  ))}
                </div>
              </div>

              {selectedActivity === 'breathing' && step === 'home' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-xs font-bold text-text-secondary mb-2">Elige un patrón de respiración:</p>
                  <div className="flex flex-col gap-2">
                    {BREATH_PATTERNS.map(bp => (
                      <button key={bp.id} onClick={() => { setSelectedBreath(bp.id); setStep('breathing'); ps('click') }}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all active:scale-[0.97] text-left ${
                          selectedBreath === bp.id ? 'bg-purple-100 border-purple-400' : 'bg-white border-border hover:border-purple-300'
                        }`}
                        aria-label={bp.title}
                      >
                        <span className="text-2xl">{bp.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-text-primary">{bp.title}</p>
                          <p className="text-badge text-text-muted font-semibold">{bp.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3 justify-center">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedActivity(null)}>Cancelar</Button>
                  </div>
                </motion.div>
              )}

              <Card variant="default" padding="md" className="bg-blue-50 border-blue-200">
                <div className="flex gap-3">
                  <span className="text-2xl shrink-0">💡</span>
                  <div className="flex-1">
                    <h3 className="heading-card mb-1">Consejos útiles</h3>
                    <p className="text-meta leading-relaxed">
                      El rincón de calma es un espacio seguro para que el niño aprenda a autorregularse.
                      Animalo a elegir la actividad que más le guste y celebra su esfuerzo, no solo el
                      resultado. La consistencia crea predictibilidad y reduce la ansiedad.
                    </p>
                  </div>
                </div>
              </Card>

              <AnimatePresence>
                {showEmergencyConfirm && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40"
                    onClick={() => setShowEmergencyConfirm(false)}
                  >
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                      className="bg-white rounded-2xl p-6 max-w-xs w-full text-center shadow-lg"
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
            </StepWrapper>
          </div>
        )

      case 'breathing': {
        const config = BREATH_PATTERNS.find(bp => bp.id === selectedBreath) ?? BREATH_PATTERNS[0]
        return (
          <div className="flex flex-col gap-4 pb-8">
            <StepWrapper>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setStep('home')}>← Atrás</Button>
                <div className="flex-1">
                  <h1 className="heading-page">Respirar</h1>
                  <p className="text-body">Sigue el ritmo de tu respiración</p>
                </div>
                <SoundToggle enabled={soundEnabled} onToggle={() => setSoundEnabled(v => !v)} />
              </div>
              <Card variant="bordered" padding="lg" className="w-full max-w-sm mx-auto">
                <BreathCircle config={config} onDone={handleActivityDone} />
              </Card>
            </StepWrapper>
          </div>
        )
      }

      case 'grounding':
        return (
          <div className="flex flex-col gap-4 pb-8">
            <StepWrapper>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setStep('home')}>← Atrás</Button>
                <div className="flex-1">
                  <h1 className="heading-page">Anclaje 5-4-3-2-1</h1>
                  <p className="text-body">Conecta con tus sentidos</p>
                </div>
                <SoundToggle enabled={soundEnabled} onToggle={() => setSoundEnabled(v => !v)} />
              </div>
              <GroundingExercise onDone={handleActivityDone} soundEnabled={soundEnabled} />
            </StepWrapper>
          </div>
        )

      case 'bubbles':
        return (
          <div className="flex flex-col gap-4 pb-8">
            <StepWrapper>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setStep('home')}>← Atrás</Button>
                <div className="flex-1">
                  <h1 className="heading-page">Burbujas</h1>
                  <p className="text-body">Explota las burbujas para calmarte</p>
                </div>
                <SoundToggle enabled={soundEnabled} onToggle={() => setSoundEnabled(v => !v)} />
              </div>
              <BubblePop onDone={handleActivityDone} soundEnabled={soundEnabled} />
            </StepWrapper>
          </div>
        )

      case 'sounds':
        return (
          <div className="flex flex-col gap-4 pb-8">
            <StepWrapper>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setStep('home')}>← Atrás</Button>
                <div className="flex-1">
                  <h1 className="heading-page">Sonidos</h1>
                  <p className="text-body">Elige tu ambiente sonoro</p>
                </div>
                <SoundToggle enabled={soundEnabled} onToggle={() => setSoundEnabled(v => !v)} />
              </div>
              <EnhancedSoundPlayer onDone={handleActivityDone} soundEnabled={soundEnabled} />
            </StepWrapper>
          </div>
        )

      case 'emergency-calm':
        return (
          <div className="flex flex-col gap-4 pb-8">
            <StepWrapper>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setStep('home')}>← Atrás</Button>
                <div className="flex-1">
                  <h1 className="heading-page">Ayuda rápida</h1>
                  <p className="text-body">Un momento para calmarte</p>
                </div>
                <SoundToggle enabled={soundEnabled} onToggle={() => setSoundEnabled(v => !v)} />
              </div>
              <EmergencyCalm onDone={handleActivityDone} />
            </StepWrapper>
          </div>
        )

      case 'check-out': {
        const before = getEmotion(moodBefore)
        return (
          <div className="flex flex-col gap-4 pb-8">
            <StepWrapper>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <h1 className="heading-page">¿Cómo te sientes ahora?</h1>
                  <p className="text-body">Compara cómo estabas antes de la actividad</p>
                </div>
                <SoundToggle enabled={soundEnabled} onToggle={() => setSoundEnabled(v => !v)} />
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
                    <DinoCalma size="lg" />
                    <p className="text-lg font-extrabold text-text-primary mt-1">Gracias por venir al rincón de calma</p>
                    <p className="text-xs text-text-muted mt-1">Siempre estoy aquí cuando me necesites</p>
                  </Card>
                  <div className="flex gap-2 mt-3 justify-center">
                    <Button variant="outline" size="sm" onClick={handleRestart}>🔄 Otra vez</Button>
                    <Button variant="primary" size="sm" onClick={() => window.history.back()}>Listo</Button>
                  </div>
                </motion.div>
              )}
            </StepWrapper>
          </div>
        )
      }

      default:
        return null
    }
  }

  return (
    <>
      {showConfetti && <ConfettiBurst />}
      <AnimatePresence mode="wait">
        <motion.div
          key={showHistory ? 'history' : step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>
    </>
  )
}
