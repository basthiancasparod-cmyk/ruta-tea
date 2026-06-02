'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Lumi } from '@/components/lumi/Lumi'
import { warmPictogramCache } from '@/components/ui/Pictogram'
import { playSound } from '@/lib/sounds'

type Emotion = 'alegre' | 'triste' | 'enojado' | 'asustado' | 'cansado' | 'nervioso'
type Step = 'check-in' | 'activities' | 'breathing' | 'calming-jar' | 'sounds' | 'check-out'
type ActivityType = 'breathing' | 'calming-jar' | 'sounds'

interface CalmSession {
  id: string
  date: string
  moodBefore: string | null
  moodAfter: string | null
  activity: string | null
  duration: number
}

interface EmotionData {
  id: Emotion
  emoji: string
  label: string
  pictogram: string
  bg: string
  border: string
}

const EMOTIONS: EmotionData[] = [
  { id: 'alegre', emoji: '😊', label: 'Alegre', pictogram: 'alegre', bg: 'bg-green-50', border: 'border-green-300' },
  { id: 'triste', emoji: '😢', label: 'Triste', pictogram: 'triste', bg: 'bg-blue-50', border: 'border-blue-300' },
  { id: 'enojado', emoji: '😡', label: 'Enojado', pictogram: 'enfadado', bg: 'bg-red-50', border: 'border-red-300' },
  { id: 'asustado', emoji: '😨', label: 'Asustado', pictogram: 'miedo', bg: 'bg-purple-50', border: 'border-purple-300' },
  { id: 'cansado', emoji: '😴', label: 'Cansado', pictogram: 'cansado', bg: 'bg-gray-50', border: 'border-gray-300' },
  { id: 'nervioso', emoji: '😰', label: 'Nervioso', pictogram: 'nervioso', bg: 'bg-amber-50', border: 'border-amber-300' },
]

const ACTIVITIES: { id: ActivityType; icon: string; title: string; desc: string }[] = [
  { id: 'breathing', icon: '💨', title: 'Respirar', desc: 'Respira con Lumi' },
  { id: 'calming-jar', icon: '🫧', title: 'Frasco mágico', desc: 'Toca las burbujas' },
  { id: 'sounds', icon: '🎵', title: 'Sonidos', desc: 'Sonidos tranquilos' },
]

const SESSIONS_KEY = 'rincon-calma-sessions'

function getEmotion(emotion: string | null): EmotionData | undefined {
  return EMOTIONS.find(e => e.id === emotion)
}

function BreathingExercise({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'inhale' | 'hold-in' | 'exhale' | 'hold-out'>('inhale')
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    const phases: { key: typeof phase; duration: number }[] = [
      { key: 'inhale', duration: 4000 },
      { key: 'hold-in', duration: 4000 },
      { key: 'exhale', duration: 6000 },
      { key: 'hold-out', duration: 2000 },
    ]
    const idx = phases.findIndex(p => p.key === phase)
    const t = setTimeout(() => {
      const next = phases[(idx + 1) % phases.length]
      setPhase(next.key)
      if (next.key === 'inhale') setCycle(c => c + 1)
    }, phases[idx].duration)
    return () => clearTimeout(t)
  }, [phase])

  const scale = phase === 'inhale' ? 1.6 : phase === 'hold-in' ? 1.6 : phase === 'exhale' ? 1 : 0.6

  const phaseText = {
    inhale: 'Inhala',
    'hold-in': 'Sostén',
    exhale: 'Exhala',
    'hold-out': 'Sostén',
  }

  return (
    <div className="flex flex-col items-center gap-8 py-6">
      <Lumi mood="idle" message="Respira conmigo" size="md" />

      <div className="relative flex items-center justify-center w-48 h-48">
        <motion.div
          animate={{ scale }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-300 via-pink-200 to-blue-200 opacity-80 absolute"
        />
        <motion.div
          animate={{ scale: Math.max(scale - 0.3, 0.4) }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-full bg-white/60 absolute flex items-center justify-center"
        >
          <span className="text-xl">🫁</span>
        </motion.div>
      </div>

      <motion.p
        key={phase}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-extrabold text-text-primary"
      >
        {phaseText[phase]}
      </motion.p>

      <p className="text-sm text-text-muted">Ciclo {cycle + 1}</p>

      <Button variant="outline" size="sm" onClick={onDone}>Terminar</Button>
    </div>
  )
}

function CalmingJar({ onDone }: { onDone: () => void }) {
  const [bubbles, setBubbles] = useState<{ id: number; x: number; size: number; color: string; delay: number; driftX: number }[]>([])
  const idRef = useRef(0)
  const colors = ['bg-purple-300/60', 'bg-pink-300/60', 'bg-blue-300/60', 'bg-teal-300/60']

  const addBubble = useCallback((x: number) => {
    const id = idRef.current++
    setBubbles(prev => [...prev, {
      id, x, size: 20 + Math.random() * 30,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
      driftX: (Math.random() - 0.5) * 10,
    }])
    setTimeout(() => setBubbles(prev => prev.filter(b => b.id !== id)), 6000)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      addBubble(Math.random() * 80 + 10)
    }, 1500)
    return () => clearInterval(interval)
  }, [addBubble])

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <Lumi mood="idle" message="Toca la pantalla" size="sm" />

      <div
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const cx = ((e.clientX - rect.left) / rect.width) * 100
          for (let i = 0; i < 3; i++) {
            setTimeout(() => addBubble(cx + (Math.random() - 0.5) * 20), i * 100)
          }
        }}
        className="relative w-64 h-80 rounded-2xl bg-gradient-to-b from-sky-100 via-purple-50 to-pink-100 overflow-hidden cursor-pointer border-2 border-purple-200"
      >
        <AnimatePresence>
          {bubbles.map(b => (
            <motion.div
              key={b.id}
              initial={{ opacity: 1, y: '100%' }}
              animate={{ opacity: 0, y: '-20%', x: `${b.driftX}%` }}
              exit={{ opacity: 0 }}
              transition={{ duration: 5 + b.delay, ease: 'easeOut' }}
              className={`absolute bottom-0 rounded-full ${b.color}`}
              style={{ width: b.size, height: b.size, left: `${b.x}%` }}
            />
          ))}
        </AnimatePresence>
      </div>

      <p className="text-xs text-text-muted">Toca para crear burbujas</p>
      <Button variant="outline" size="sm" onClick={onDone}>Terminar</Button>
    </div>
  )
}

function SoundPlayer({ onDone }: { onDone: () => void }) {
  const [active, setActive] = useState<string | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  const stopSound = useCallback(() => {
    cleanupRef.current?.()
    cleanupRef.current = null
    try { sourceRef.current?.stop() } catch {}
    sourceRef.current = null
  }, [])

  function buildNoiseBuffer(ctx: AudioContext, duration: number, modulate?: (t: number) => number): AudioBuffer {
    const bufferSize = ctx.sampleRate * duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate
      const envelope = modulate ? modulate(t) : 1
      data[i] = (Math.random() * 2 - 1) * envelope
    }
    return buffer
  }

  const playRain = useCallback(() => {
    const ctx = new AudioContext()
    ctxRef.current = ctx
    const buffer = buildNoiseBuffer(ctx, 4, t => Math.max(0, 1 - t / 4))
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const gain = ctx.createGain()
    gain.gain.value = 0.15
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 1000
    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start()
    sourceRef.current = source
  }, [])

  const playWaves = useCallback(() => {
    const ctx = new AudioContext()
    ctxRef.current = ctx
    const buffer = buildNoiseBuffer(ctx, 4, t => (Math.sin(t * 0.3) * 0.5 + 0.5) * 0.3)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const gain = ctx.createGain()
    gain.gain.value = 0.12
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 500
    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start()
    sourceRef.current = source
  }, [])

  const playForest = useCallback(() => {
    const ctx = new AudioContext()
    ctxRef.current = ctx
    const buffer = buildNoiseBuffer(ctx, 4, () => 0)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const gain = ctx.createGain()
    gain.gain.value = 0
    const highpass = ctx.createBiquadFilter()
    highpass.type = 'highpass'
    highpass.frequency.value = 4000

    const chirpInterval = setInterval(() => {
      if (!ctxRef.current) { clearInterval(chirpInterval); return }
      const osc = ctx.createOscillator()
      const chirpGain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 1000 + Math.random() * 1500
      osc.frequency.linearRampToValueAtTime(500 + Math.random() * 500, ctx.currentTime + 0.1)
      chirpGain.gain.value = 0.04
      chirpGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
      osc.connect(chirpGain)
      chirpGain.connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.12)
    }, 2000 + Math.random() * 3000)

    source.connect(highpass)
    highpass.connect(gain)
    gain.connect(ctx.destination)
    source.start()

    cleanupRef.current = () => clearInterval(chirpInterval)
    sourceRef.current = source
  }, [])

  useEffect(() => {
    return () => {
      try { ctxRef.current?.close() } catch {}
    }
  }, [])

  const handleToggle = (id: string) => {
    stopSound()
    try { ctxRef.current?.close() } catch {}
    ctxRef.current = null
    if (active === id) {
      setActive(null)
    } else {
      setActive(id)
      if (id === 'rain') playRain()
      else if (id === 'waves') playWaves()
      else if (id === 'forest') playForest()
    }
  }

  const sounds = [
    { id: 'rain', icon: '🌧️', label: 'Lluvia' },
    { id: 'waves', icon: '🌊', label: 'Olas' },
    { id: 'forest', icon: '🌲', label: 'Bosque' },
  ]

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <Lumi mood="idle" message="Elige un sonido" size="sm" />

      <div className="flex flex-wrap justify-center gap-3">
        {sounds.map(s => (
          <button
            key={s.id}
            onClick={() => handleToggle(s.id)}
            className={`flex flex-col items-center gap-2 px-6 py-4 rounded-2xl border-2 transition-all active:scale-[0.96] ${
              active === s.id
                ? 'bg-purple-100 border-purple-400 shadow-md'
                : 'bg-white border-border'
            }`}
          >
            <span className="text-3xl">{s.icon}</span>
            <span className="text-sm font-bold text-text-primary">{s.label}</span>
            {active === s.id && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 24 }}
                className="h-1 bg-purple-400 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {active && (
        <p className="text-sm text-text-muted">Toca de nuevo para detener</p>
      )}

      <Button variant="outline" size="sm" onClick={() => { handleToggle(''); onDone() }}>Terminar</Button>
    </div>
  )
}

function HistoryView({ sessions, onClose }: { sessions: CalmSession[]; onClose: () => void }) {
  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`
  }

  const getActivityName = (a: string | null) => {
    if (!a) return '—'
    const act = ACTIVITIES.find(x => x.id === a)
    return act ? act.title : a
  }

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
          <p className="text-xs text-text-muted mt-1">Cada vez que uses el rincón de calma, se guardará aquí</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
          {sessions.map(s => {
            const before = getEmotion(s.moodBefore)
            const after = getEmotion(s.moodAfter)
            return (
              <Card key={s.id} variant="default" padding="sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span>{before?.emoji ?? '🤷'}</span>
                      <span className="text-xs text-text-muted">→</span>
                      <span>{after?.emoji ?? '🤷'}</span>
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-text-primary">{getActivityName(s.activity)}</p>
                      <p className="text-text-muted">{formatDate(s.date)} · {formatDuration(s.duration)}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function RinconCalmaPage() {
  const [step, setStep] = useState<Step>('check-in')
  const [moodBefore, setMoodBefore] = useState<string | null>(null)
  const [moodAfter, setMoodAfter] = useState<string | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null)
  const [sessions, setSessions] = useState<CalmSession[]>([])
  const [sessionStart] = useState(Date.now())
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    warmPictogramCache(EMOTIONS.map(e => e.pictogram))
    try {
      const raw = localStorage.getItem(SESSIONS_KEY)
      if (raw) setSessions(JSON.parse(raw))
    } catch {}
  }, [])

  const saveSession = useCallback((after: string | null) => {
    const session: CalmSession = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      moodBefore,
      moodAfter: after,
      activity: selectedActivity,
      duration: Math.round((Date.now() - sessionStart) / 1000),
    }
    const updated = [session, ...sessions].slice(0, 20)
    setSessions(updated)
    try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated)) } catch {}
  }, [moodBefore, selectedActivity, sessionStart, sessions])

  const handleActivityDone = () => {
    setStep('check-out')
  }

  const handleCheckOut = (emotion: string | null) => {
    setMoodAfter(emotion)
    saveSession(emotion)
    playSound('celebration')
    setStep('check-out')
  }

  const handleRestart = () => {
    setStep('check-in')
    setMoodBefore(null)
    setMoodAfter(null)
    setSelectedActivity(null)
  }

  if (showHistory) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <HistoryView sessions={sessions} onClose={() => setShowHistory(false)} />
      </div>
    )
  }

  if (step === 'check-in') {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>← Atrás</Button>
          <h1 className="text-xl font-extrabold text-text-primary">Rincón de Calma</h1>
          {sessions.length > 0 && (
            <button onClick={() => setShowHistory(true)} className="ml-auto text-sm text-text-muted underline">
              Historial
            </button>
          )}
        </div>

        <Lumi mood="thinking" message="¿Cómo te sientes?" size="md" />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
          {EMOTIONS.map((emotion) => (
            <motion.div
              key={emotion.id}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={() => {
                  setMoodBefore(emotion.id)
                  setStep('activities')
                }}
                className={`w-full flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-[0.96] ${emotion.bg} ${emotion.border}`}
              >
                <span className="text-3xl">{emotion.emoji}</span>
                <span className="text-sm font-bold text-text-primary">{emotion.label}</span>
              </button>
            </motion.div>
          ))}
        </div>

        <button
          onClick={() => { setMoodBefore(null); setStep('activities') }}
          className="w-full mt-3 py-3 text-center text-sm font-bold text-text-muted bg-white rounded-xl border-2 border-border border-dashed active:scale-[0.98] transition-all"
        >
          No sé / Prefiero empezar
        </button>
      </div>
    )
  }

  if (step === 'activities') {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setStep('check-in')}>← Atrás</Button>
          <h2 className="text-lg font-extrabold text-text-primary">Elige una actividad</h2>
        </div>

        <Lumi
          mood="idle"
          message={moodBefore ? `Veo que estás ${getEmotion(moodBefore)?.label.toLowerCase()}. Elige algo que te ayude` : 'Elige lo que quieras hacer'}
          size="md"
        />

        <div className="flex flex-col gap-3 mt-6">
          {ACTIVITIES.map((activity) => (
            <motion.div key={activity.id} whileTap={{ scale: 0.98 }}>
              <button
                onClick={() => {
                  setSelectedActivity(activity.id)
                  setStep(activity.id)
                  playSound('click')
                }}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-border active:border-purple-300 active:bg-purple-50 transition-all"
              >
                <span className="text-3xl">{activity.icon}</span>
                <div className="text-left">
                  <p className="font-extrabold text-text-primary">{activity.title}</p>
                  <p className="text-xs text-text-muted">{activity.desc}</p>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  if (step === 'breathing') {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-extrabold text-text-primary">Respiración</h2>
        </div>
        <BreathingExercise onDone={handleActivityDone} />
      </div>
    )
  }

  if (step === 'calming-jar') {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-extrabold text-text-primary">Frasco de la calma</h2>
        </div>
        <CalmingJar onDone={handleActivityDone} />
      </div>
    )
  }

  if (step === 'sounds') {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-extrabold text-text-primary">Sonidos</h2>
        </div>
        <SoundPlayer onDone={handleActivityDone} />
      </div>
    )
  }

  if (step === 'check-out') {
    const before = getEmotion(moodBefore)
    const after = getEmotion(moodAfter)

    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-extrabold text-text-primary">¿Cómo te sientes ahora?</h2>
        </div>

        {moodBefore && (
          <Card variant="default" padding="sm" className="text-center mb-4">
            <p className="text-xs text-text-muted">Antes estabas</p>
            <span className="text-2xl">{before?.emoji}</span>
            <span className="text-sm font-bold text-text-secondary ml-1">{before?.label}</span>
          </Card>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {EMOTIONS.map((emotion) => {
            const isSelected = moodAfter === emotion.id
            return (
              <motion.div key={emotion.id} whileTap={{ scale: 0.95 }}>
                <button
                  onClick={() => handleCheckOut(emotion.id)}
                  className={`w-full flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-[0.96] ${
                    isSelected ? 'bg-purple-100 border-purple-400' : `${emotion.bg} ${emotion.border}`
                  }`}
                >
                  <span className="text-3xl">{emotion.emoji}</span>
                  <span className="text-sm font-bold text-text-primary">{emotion.label}</span>
                </button>
              </motion.div>
            )
          })}
        </div>

        {moodAfter && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <Card variant="bordered" padding="lg" className="bg-purple-50 border-purple-200">
              {moodAfter === 'alegre' ? (
                <>
                  <Lumi mood="happy" size="lg" />
                  <p className="text-lg font-extrabold text-text-primary mt-2">¡Qué bien!</p>
                  <p className="text-sm text-text-muted">Me alegra que estés mejor</p>
                </>
              ) : (
                <>
                  <Lumi mood="happy" size="md" />
                  <p className="text-lg font-extrabold text-text-primary mt-2">Está bien</p>
                  <p className="text-sm text-text-muted">El rincón de calma siempre está aquí para ti</p>
                </>
              )}
            </Card>

            <div className="flex gap-3 mt-4 justify-center">
              <Button variant="outline" size="sm" onClick={handleRestart}>
                🔄 Empezar de nuevo
              </Button>
              <Button variant="primary" size="sm" onClick={() => window.history.back()}>
                Listo
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  return null
}
