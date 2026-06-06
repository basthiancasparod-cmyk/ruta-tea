'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pictogram } from '@/components/ui/Pictogram'
import { useChildren } from '@/lib/hooks/useData'
import { useAgenda, type AgendaTask, type TaskCategory } from '@/lib/hooks/useAgenda'

const CATEGORY_META: Record<TaskCategory, { label: string; emoji: string; color: string }> = {
  morning:   { label: 'Mañana', emoji: '🌅', color: 'text-amber-500' },
  afternoon: { label: 'Tarde',  emoji: '☀️', color: 'text-orange-500' },
  evening:   { label: 'Noche',  emoji: '🌙', color: 'text-indigo-500' },
}

const KEYWORD_SUGGESTIONS = [
  'despertar','lavarse','vestirse','desayuno','cepillarse','jugar','comer',
  'leer','dibujar','ducharse','dormir','merendar','deberes','pasear',
]

const TIMER_PRESETS = [0, 1, 2, 3, 5, 10, 15, 30, 60, -1] as const
const TIMER_CUSTOM = -1

function ClockPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<'minutes' | 'hours'>('minutes')
  const S = 240, CX = S / 2, CY = S / 2
  const HOURS_OUTER = 88, HOURS_INNER = 66
  const MIN_R = 88, MIN_INNER = 72

  const hours = Math.floor(value / 60)
  const minutes = value % 60

  const setHours = (h: number) => onChange(Math.max(0, Math.min(23, h)) * 60 + minutes)
  const setMinutes = (m: number) => onChange(Math.max(0, Math.min(59, m)) + hours * 60)

  const polarToPos = (n: number, total: number, radius: number) => {
    const a = ((n / total) * 360 - 90) * (Math.PI / 180)
    return { x: CX + Math.cos(a) * radius, y: CY + Math.sin(a) * radius }
  }

  const posToValue = (px: number, py: number, total: number) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return mode === 'minutes' ? minutes : hours
    const dx = px - rect.left - CX, dy = py - rect.top - CY
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 25) return mode === 'minutes' ? minutes : hours
    let deg = Math.atan2(dy, dx) * 180 / Math.PI + 90
    if (deg < 0) deg += 360
    return Math.round((deg / 360) * total) % total
  }

  const [dragging, setDragging] = useState(false)

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    setDragging(true)
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const dx = e.clientX - rect.left - CX, dy = e.clientY - rect.top - CY
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (mode === 'minutes') {
      setMinutes(Math.max(1, posToValue(e.clientX, e.clientY, 60)))
    } else {
      const outerDist = Math.abs(dist - ((HOURS_OUTER + HOURS_INNER) / 2))
      const h = posToValue(e.clientX, e.clientY, 24)
      // If closer to outer ring, use even hours mapping; inner for odd
      let finalH = h
      if (dist > (HOURS_OUTER + HOURS_INNER) / 2) {
        // outer ring: even hours 0,2,4,...,22
        finalH = Math.round(h / 2) * 2 % 24
      } else {
        // inner ring: odd hours 1,3,5,...,23
        finalH = (Math.round(h / 2) * 2 + 1) % 24
      }
      setHours(finalH)
    }
  }

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: PointerEvent) => {
      if (mode === 'minutes') {
        setMinutes(Math.max(1, posToValue(e.clientX, e.clientY, 60)))
      } else {
        const rect = ref.current?.getBoundingClientRect()
        if (!rect) return
        const dx = e.clientX - rect.left - CX, dy = e.clientY - rect.top - CY
        const dist = Math.sqrt(dx * dx + dy * dy)
        const h = posToValue(e.clientX, e.clientY, 24)
        const finalH = dist > (HOURS_OUTER + HOURS_INNER) / 2
          ? Math.round(h / 2) * 2 % 24
          : (Math.round(h / 2) * 2 + 1) % 24
        setHours(finalH)
      }
    }
    const onUp = () => setDragging(false)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp) }
  }, [dragging, mode, hours, minutes, setHours, setMinutes])

  const minuteMarks = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
  const outerHours = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]
  const innerHours = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23]

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Digital display — tap to switch mode */}
      <div className="flex items-baseline gap-1 bg-surface-secondary rounded-xl px-4 py-2">
        <button onClick={() => setMode('hours')}
          className={`text-3xl font-extrabold tabular-nums px-2 py-1 rounded-lg transition-all ${mode === 'hours' ? 'bg-brand text-white' : 'text-text-primary hover:bg-white/50'}`}>
          {hours.toString().padStart(2, '0')}
        </button>
        <span className="text-2xl font-bold text-text-muted">:</span>
        <button onClick={() => setMode('minutes')}
          className={`text-3xl font-extrabold tabular-nums px-2 py-1 rounded-lg transition-all ${mode === 'minutes' ? 'bg-brand text-white' : 'text-text-primary hover:bg-white/50'}`}>
          {minutes.toString().padStart(2, '0')}
        </button>
      </div>

      {/* Clock face */}
      <div ref={ref} className="relative select-none touch-none" style={{ width: S, height: S }} onPointerDown={onPointerDown}>
        <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} className="absolute inset-0 pointer-events-none">
          {/* Background */}
          <circle cx={CX} cy={CY} r={94} fill="#f1f5f9" />
          <circle cx={CX} cy={CY} r={91} fill="white" stroke="#e2e8f0" strokeWidth="1" />

          {mode === 'minutes' && <>
            {/* Highlight */}
            {minuteMarks.filter(m => m === minutes).map(m => {
              const p = polarToPos(m, 60, MIN_INNER)
              return <circle key={`hl-${m}`} cx={p.x} cy={p.y} r={14} fill="var(--color-brand, #44B39D)" />
            })}

            {/* Hand */}
            {(() => {
              const tip = polarToPos(minutes, 60, MIN_R - 12)
              const rev = polarToPos(minutes + 30, 60, 20)
              return <g>
                <line x1={CX} y1={CY} x2={tip.x} y2={tip.y} stroke="var(--color-brand, #44B39D)" strokeWidth="3" strokeLinecap="round" />
                <line x1={rev.x} y1={rev.y} x2={CX} y2={CY} stroke="var(--color-brand, #44B39D)" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
              </g>
            })()}

            {/* Dots */}
            {Array.from({ length: 60 }, (_, m) => m % 5 !== 0 && (
              <circle key={`d-${m}`} cx={polarToPos(m, 60, MIN_R - 8).x} cy={polarToPos(m, 60, MIN_R - 8).y} r={2} fill="#94a3b8" />
            ))}

            {/* Numbers */}
            {minuteMarks.map(m => {
              const p = polarToPos(m, 60, MIN_INNER)
              return <text key={`n-${m}`} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
                className={`text-sm font-bold ${minutes === m ? 'fill-white' : 'fill-text-primary'}`}>{m}</text>
            })}
          </>}

          {mode === 'hours' && <>
            {/* Outer ring highlight */}
            {outerHours.filter(h => h === hours).map(h => {
              const p = polarToPos(h / 2, 12, HOURS_OUTER)
              return <circle key={`hl-${h}`} cx={p.x} cy={p.y} r={14} fill="var(--color-brand, #44B39D)" />
            })}

            {/* Inner ring highlight */}
            {innerHours.filter(h => h === hours).map(h => {
              const p = polarToPos((h - 1) / 2, 12, HOURS_INNER)
              return <circle key={`hl-${h}`} cx={p.x} cy={p.y} r={12} fill="var(--color-brand, #44B39D)" />
            })}

            {/* Hand */}
            {(() => {
              const isOuter = hours % 2 === 0
              const idx = isOuter ? hours / 2 : (hours - 1) / 2
              const r = isOuter ? HOURS_OUTER : HOURS_INNER
              const tip = polarToPos(idx, 12, r - 10)
              const rev = polarToPos(idx + 6, 12, 18)
              return <g>
                <line x1={CX} y1={CY} x2={tip.x} y2={tip.y} stroke="var(--color-brand, #44B39D)" strokeWidth="3" strokeLinecap="round" />
                <line x1={rev.x} y1={rev.y} x2={CX} y2={CY} stroke="var(--color-brand, #44B39D)" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
              </g>
            })()}

            {/* Outer ring numbers (even hours 0,2,4,...,22) */}
            {outerHours.map((h, i) => {
              const p = polarToPos(i, 12, HOURS_OUTER)
              return <text key={`oh-${h}`} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
                className={`text-sm font-bold ${hours === h ? 'fill-white' : 'fill-text-primary'}`}>{h}</text>
            })}

            {/* Inner ring numbers (odd hours 1,3,5,...,23) */}
            {innerHours.map((h, i) => {
              const p = polarToPos(i, 12, HOURS_INNER)
              return <text key={`ih-${h}`} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
                className={`text-xs font-bold ${hours === h ? 'fill-white' : 'fill-text-muted'}`}>{h}</text>
            })}
          </>}

          {/* Center */}
          <circle cx={CX} cy={CY} r={5} fill="white" stroke="var(--color-brand, #44B39D)" strokeWidth="2.5" />
          <circle cx={CX} cy={CY} r={2.5} fill="var(--color-brand, #44B39D)" />
        </svg>
        <div className="absolute inset-0 rounded-full" style={{ touchAction: 'none' }} />
      </div>

      {/* Fine-tune buttons */}
      <div className="flex items-center gap-4">
        <button onClick={() => mode === 'hours' ? setHours(hours - 1) : setMinutes(Math.max(1, minutes - 1))}
          className="w-10 h-10 rounded-full bg-white border-2 border-border text-text-secondary font-bold text-xl hover:border-brand hover:text-brand transition-all active:scale-90 flex items-center justify-center shadow-sm">−</button>
        <span className="text-xs font-bold text-text-muted">{mode === 'hours' ? 'Hora' : 'Minuto'}</span>
        <button onClick={() => mode === 'hours' ? setHours(hours + 1) : setMinutes(Math.min(59, minutes + 1))}
          className="w-10 h-10 rounded-full bg-white border-2 border-border text-text-secondary font-bold text-xl hover:border-brand hover:text-brand transition-all active:scale-90 flex items-center justify-center shadow-sm">+</button>
      </div>
    </div>
  )
}

type TimerStatus = 'idle' | 'running' | 'paused' | 'finished'

interface TimerInfo {
  remaining: number
  status: TimerStatus
}

function playAlarmSound() {
  try {
    const ctx = new (window.AudioContext ?? (window as unknown as Record<string, unknown>).webkitAudioContext as { new(): AudioContext })()
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'triangle'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.18)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.4)
      osc.start(ctx.currentTime + i * 0.18)
      osc.stop(ctx.currentTime + i * 0.18 + 0.4)
    })
  } catch {}
}

function formatTimer(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
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
              left: `${x}%`,
              top: -20,
              width: size,
              height: size * 0.6,
              backgroundColor: color,
            }}
            initial={{ y: -20, rotate: 0, opacity: 1 }}
            animate={{
              y: fall,
              x: drift,
              rotate: rotate,
              opacity: [1, 0.8, 0],
            }}
            transition={{ duration: 1.5 + Math.random(), delay, ease: 'easeIn' }}
          />
        )
      })}
    </div>
  )
}

function TimerConfigModal({
  currentSeconds,
  currentReward,
  currentAudioData,
  currentAudioLabel,
  currentUseTts,
  onSetDuration,
  onSetReward,
  onSetAudio,
  onSetTts,
  onSetAudioLabel,
  onDelete,
  onClose,
}: {
  currentSeconds: number
  currentReward?: string
  currentAudioData?: string | null
  currentAudioLabel?: string
  currentUseTts?: boolean
  onSetDuration: (seconds: number) => void
  onSetReward: (reward: string) => void
  onSetAudio: (audio_data: string | null) => void
  onSetTts: (use_tts: boolean) => void
  onSetAudioLabel: (label: string) => void
  onDelete: () => void
  onClose: () => void
}) {
  const rawMins = currentSeconds > 0 ? Math.round(currentSeconds / 60) : 0
  const isCustom = rawMins > 0 && !(TIMER_PRESETS as readonly number[]).includes(rawMins)
  const [mins, setMins] = useState(isCustom ? TIMER_CUSTOM : rawMins)
  const [customMins, setCustomMins] = useState(rawMins > 0 ? Math.max(1, rawMins) : 5)
  const [reward, setReward] = useState(currentReward ?? '')
  const [audioMode, setAudioMode] = useState<'none' | 'recorded' | 'tts'>(
    currentAudioData ? 'recorded' : currentUseTts ? 'tts' : 'none'
  )
  const [recordedData, setRecordedData] = useState<string | null>(currentAudioData ?? null)
  const [audioLabel, setAudioLabel] = useState(currentAudioLabel ?? '')

  const handleOk = () => {
    const finalMins = mins === TIMER_CUSTOM ? Math.max(1, customMins) : mins
    onSetDuration(finalMins * 60)
    onSetReward(reward)
    if (audioMode === 'none') { onSetAudio(null); onSetTts(false) }
    else if (audioMode === 'recorded') { onSetAudio(recordedData); onSetTts(false); onSetAudioLabel(audioLabel) }
    else { onSetAudio(null); onSetTts(true); onSetAudioLabel('') }
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
    >
      <div className="absolute inset-0 bg-black/85" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.92, y: 10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 10, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative w-full max-w-sm rounded-2xl shadow-lg"
        style={{ background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.2) 100%)',
          border: '1px solid rgba(255,255,255,0.8)',
        }} />
        <div className="relative p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="heading-section">⚙️ Configurar</p>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl hover:bg-black/5 flex items-center justify-center text-text-muted text-lg font-bold transition-colors">✕</button>
          </div>

          <div>
            <p className="text-xs font-bold text-text-secondary mb-2">⏱️ Temporizador</p>
            <div className="flex flex-wrap gap-1.5">
              {TIMER_PRESETS.map(p => (
                <button
                  key={p}
                  onClick={() => setMins(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    mins === p
                      ? 'bg-brand text-white border-brand'
                      : 'border-border text-text-secondary hover:border-brand hover:text-brand'
                  }`}
                >
                  {p === 0 ? 'Sin temporizador' : p === TIMER_CUSTOM ? 'Personalizado' : p < 60 ? `${p} minutos` : `${Math.floor(p / 60)} hora`}
                </button>
              ))}
            </div>
            {mins === TIMER_CUSTOM && (
              <div className="mt-3">
                <ClockPicker value={customMins} onChange={setCustomMins} />
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-bold text-text-secondary mb-2">🎁 Recompensa (opcional)</p>
            <input
              value={reward}
              onChange={e => setReward(e.target.value)}
              placeholder="Ej: Ver Peppa Pig"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <p className="text-xs font-bold text-text-secondary mb-2">🔊 Audio</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(['none', 'recorded', 'tts'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setAudioMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    audioMode === mode
                      ? 'bg-brand text-white border-brand'
                      : 'border-border text-text-secondary hover:border-brand hover:text-brand'
                  }`}
                >
                  {mode === 'none' ? 'Sin audio' : mode === 'recorded' ? '🎙️ Grabado' : '🔊 Sintetizado'}
                </button>
              ))}
            </div>
            {audioMode === 'recorded' && (
              <VoiceRecorder audioData={recordedData} audioLabel={audioLabel} onSave={setRecordedData} onLabelChange={setAudioLabel} />
            )}
            {audioMode === 'tts' && (
              <p className="text-[10px] text-text-muted">El dispositivo leerá el nombre de la tarea en voz alta</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="primary" size="md"
              onClick={handleOk}
              className="flex-1">
              OK
            </Button>
            <Button variant="ghost" size="md"
              onClick={() => { onClose(); onDelete() }}
              className="text-red-400 hover:text-red-500">
              🗑️ Eliminar tarea
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function AddTaskForm({
  onAdd,
  onCancel,
}: {
  onAdd: (task: Pick<AgendaTask, 'label' | 'keyword' | 'category'> & { timer_seconds?: number; reward?: string }) => void
  onCancel: () => void
}) {
  const [label, setLabel] = useState('')
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<TaskCategory>('morning')
  const [timerMins, setTimerMins] = useState(0)
  const [customMins, setCustomMins] = useState(5)
  const [reward, setReward] = useState('')

  const handleSubmit = () => {
    if (!label.trim() || !keyword.trim()) return
    const finalMins = timerMins === TIMER_CUSTOM ? Math.max(1, customMins) : timerMins
    onAdd({
      label: label.trim(),
      keyword: keyword.trim().toLowerCase(),
      category,
      timer_seconds: finalMins * 60,
      reward: reward.trim(),
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-xl border-2 border-brand/30 p-4 flex flex-col gap-3"
    >
      <p className="heading-card">➕ Nueva tarea</p>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-text-secondary">Nombre</label>
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="Ej: Desayunar"
          className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-text-secondary">Pictograma (palabra clave)</label>
        <input
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="Ej: desayuno"
          className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
        />
        {keyword.trim() && (
          <div className="flex items-center gap-2 mt-1">
            <Pictogram keyword={keyword.trim()} size={40} />
            <span className="text-xs text-text-muted">Vista previa</span>
          </div>
        )}
        <div className="flex flex-wrap gap-1 mt-1">
          {KEYWORD_SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => setKeyword(s)}
              className="text-badge px-2 py-0.5 rounded-full bg-surface border border-border text-text-secondary hover:border-brand hover:text-brand transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-text-secondary">Momento del día</label>
        <div className="flex gap-2">
          {(Object.entries(CATEGORY_META) as [TaskCategory, typeof CATEGORY_META[TaskCategory]][]).map(([cat, meta]) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                category === cat ? 'bg-brand text-white border-brand' : 'border-border text-text-secondary'
              }`}
            >
              {meta.emoji} {meta.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-text-secondary">⏱️ Temporizador</label>
        <div className="flex flex-wrap gap-1">
          {TIMER_PRESETS.map(p => (
            <button
              key={p}
              onClick={() => setTimerMins(p)}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                timerMins === p
                  ? 'bg-brand text-white border-brand'
                  : 'border-border text-text-secondary hover:border-brand hover:text-brand'
              }`}
            >
              {p === 0 ? 'Sin' : p === TIMER_CUSTOM ? 'Personalizado' : p < 60 ? `${p} min` : `${Math.floor(p / 60)} h`}
            </button>
          ))}
        </div>
        {timerMins === TIMER_CUSTOM && (
          <div className="mt-2">
            <ClockPicker value={customMins} onChange={setCustomMins} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-text-secondary">🎁 Recompensa (opcional)</label>
        <input
          value={reward}
          onChange={e => setReward(e.target.value)}
          placeholder="Ej: Ver Peppa Pig"
          className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
        />
      </div>

      <div className="flex gap-2">
        <Button variant="primary" size="sm" onClick={handleSubmit} className="flex-1">
          Añadir tarea
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </motion.div>
  )
}

const MAX_RECORD_SECONDS = 10

function VoiceRecorder({
  audioData,
  audioLabel,
  onSave,
  onLabelChange,
}: {
  audioData: string | null
  audioLabel?: string
  onSave: (data: string | null) => void
  onLabelChange?: (label: string) => void
}) {
  const [recording, setRecording] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [countdown, setCountdown] = useState(MAX_RECORD_SECONDS)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopAndClean = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    mediaRecorderRef.current?.stop()
    setRecording(false)
    setCountdown(MAX_RECORD_SECONDS)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      mediaRecorderRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        if (blob.size === 0) return
        const reader = new FileReader()
        reader.onloadend = () => onSave(reader.result as string)
        reader.readAsDataURL(blob)
      }
      mr.start()
      setRecording(true)
      setCountdown(MAX_RECORD_SECONDS)
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { stopAndClean(); return 0 }
          return prev - 1
        })
      }, 1000)
    } catch { /* permission denied */ }
  }

  const stopRecording = () => stopAndClean()

  const playAudio = () => {
    if (!audioData) return
    const audio = new Audio(audioData)
    setPlaying(true)
    audio.onended = () => setPlaying(false)
    audio.play().catch(() => setPlaying(false))
  }

  return (
    <div className="space-y-2">
      {recording ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Grabando... {countdown}s
          </div>
          <button onClick={stopRecording}
            className="px-3 py-1.5 rounded-lg border border-red-300 text-red-500 text-xs font-bold hover:bg-red-50 transition-colors">
            ⏹ Detener
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button onClick={startRecording}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-text-secondary hover:border-brand hover:text-brand text-xs font-bold transition-all">
            🎙️ Grabar
          </button>
          {audioData && (
            <>
              <button onClick={playAudio}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${playing ? 'bg-brand text-white' : 'border border-border text-text-secondary hover:border-brand hover:text-brand'}`}>
                {playing ? '🔊' : '🔊 Escuchar'}
              </button>
              <button onClick={() => {
                onSave(null)
                onLabelChange?.('')
              }}
                className="px-3 py-1.5 rounded-lg border border-red-200 text-red-400 text-xs font-bold hover:border-red-400 hover:text-red-500 transition-colors">
               🗑️
              </button>
            </>
          )}
        </div>
      )}
      {audioData && !recording && (
        <input
          value={audioLabel ?? ''}
          onChange={e => onLabelChange?.(e.target.value)}
          placeholder="Nombre del audio (ej: Voz de mamá)"
          className="w-full border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-brand"
        />
      )}
    </div>
  )
}

function playTts(text: string) {
  try {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'es-ES'
    u.rate = 0.9
    speechSynthesis.speak(u)
  } catch {}
}

function TaskCard({
  task,
  onToggle,
  onDelete,
  onSetTimerDuration,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onUpdateReward,
  onUpdateTts,
  onUpdateAudio,
  onUpdateAudioLabel,
  timerInfo,
}: {
  task: AgendaTask
  onToggle: () => void
  onDelete: () => void
  onSetTimerDuration: (seconds: number) => void
  onStartTimer: () => void
  onPauseTimer: () => void
  onResetTimer: () => void
  onUpdateReward: (reward: string) => void
  onUpdateTts: (use_tts: boolean) => void
  onUpdateAudio: (audio_data: string | null) => void
  onUpdateAudioLabel: (label: string) => void
  timerInfo: { remaining: number; status: TimerStatus }
}) {
  const meta = CATEGORY_META[task.category]
  const [showConfig, setShowConfig] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const hasTimer = task.timer_seconds > 0
  const { remaining, status } = timerInfo
  const isDone = task.done

  let cardBorder = isDone ? 'border-green-300 bg-green-50' : 'border-border bg-white hover:border-brand'
  if (!isDone && status === 'running') cardBorder = 'border-brand bg-brand/5'
  else if (!isDone && status === 'finished') cardBorder = 'border-amber-400 bg-amber-50'

  const handleToggle = () => {
    if (!isDone && cardRef.current) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 1000)
    }
    onToggle()
  }

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="relative"
    >
      {showConfetti && <ConfettiBurst />}

      <div className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${cardBorder}`}>
        <button
          onClick={handleToggle}
          className="shrink-0 w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all
            active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand/40
            min-h-[56px] min-w-[56px]
            text-2xl
            bg-white
            border-border"
          style={isDone ? {
            backgroundColor: '#22c55e',
            borderColor: '#22c55e',
          } : {}}
          aria-label={isDone ? 'Marcar como pendiente' : 'Marcar como completado'}
        >
          {isDone ? (
            <span className="text-white text-3xl font-bold leading-none">✓</span>
          ) : (
            <span className="text-border text-2xl">⬜</span>
          )}
        </button>

        <div onClick={handleToggle} className="cursor-pointer shrink-0">
          <Pictogram keyword={task.keyword} size={48} className={isDone ? 'opacity-60' : ''} />
        </div>

        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm leading-tight ${isDone ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
            {task.label}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className={`text-badge font-semibold ${meta.color}`}>
              {meta.emoji} {meta.label}
            </span>
            {!hasTimer && (
              <span className="text-badge text-text-muted ml-1">(sin timer)</span>
            )}
          </div>

          {task.reward && !isDone && (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-badge text-amber-500">🎁 Recompensa: {task.reward}</span>
            </div>
          )}

          {hasTimer && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`text-xs font-bold tabular-nums ${
                status === 'finished' ? 'text-amber-500' : 'text-text-primary'
              }`}>
                ⏱️ {formatTimer(remaining)}
              </span>

              {status === 'finished' && (
                <button
                  onClick={onResetTimer}
                  className="text-badge px-1.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-700 font-bold"
                >
                  🔄
                </button>
              )}

              {status === 'idle' && remaining > 0 && (
                <button
                  onClick={onStartTimer}
                  className="text-xs px-2 py-0.5 rounded-full bg-brand text-white font-bold leading-none
                    active:scale-95 transition-transform"
                >
                  ▶
                </button>
              )}

              {status === 'running' && (
                <button
                  onClick={onPauseTimer}
                  className="text-xs px-2 py-0.5 rounded-full bg-brand/20 text-brand font-bold leading-none
                    active:scale-95 transition-transform"
                >
                  ⏸
                </button>
              )}

              {status === 'paused' && (
                <button
                  onClick={onStartTimer}
                  className="text-xs px-2 py-0.5 rounded-full bg-brand text-white font-bold leading-none
                    active:scale-95 transition-transform"
                >
                  ▶
                </button>
              )}
            </div>
          )}

          {(task.audio_data || task.use_tts) && !isDone && (
            <button
              onClick={() => {
                if (task.audio_data) {
                  const a = new Audio(task.audio_data)
                  a.play().catch(() => {})
                } else if (task.use_tts) {
                  playTts(task.label)
                }
              }}
              className="mt-1 text-badge px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20 hover:bg-brand/20 transition-colors"
            >
              🔊 {task.use_tts ? 'Sintetizado' : task.audio_label || 'Audio'}
            </button>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowConfig(v => !v)}
            className={`text-sm p-1 transition-colors ${
              showConfig ? 'text-brand' : 'text-text-muted hover:text-text-primary'
            }`}
            aria-label="Configurar"
          >
            ⚙️
          </button>

          <AnimatePresence>
            {showConfig && (
              <TimerConfigModal
                currentSeconds={task.timer_seconds}
                currentReward={task.reward}
                currentAudioData={task.audio_data}
                currentAudioLabel={task.audio_label}
                currentUseTts={task.use_tts}
                onSetDuration={onSetTimerDuration}
                onSetReward={onUpdateReward}
                onSetAudio={onUpdateAudio}
                onSetTts={onUpdateTts}
                onSetAudioLabel={onUpdateAudioLabel}
                onDelete={() => { setShowConfig(false); onDelete() }}
                onClose={() => setShowConfig(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {status === 'finished' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2 bg-amber-400 text-white text-badge px-2 py-0.5 rounded-full shadow"
        >
          ⏰ ¡Tiempo!
        </motion.div>
      )}
    </motion.div>
  )
}

export default function AgendaVisualPage() {
  const { children } = useChildren()
  const childId = children[0]?.id ?? null
  const { agenda, tasks, loading, error, toggleDone, addTask, deleteTask, reorderTasks, resetAll, updateTimerDuration, updateReward, updateAudio, updateUseTts, updateAudioLabel } = useAgenda(childId)

  const [activeCategory, setActiveCategory] = useState<TaskCategory | 'all'>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [celebrate100, setCelebrate100] = useState(false)
  const timerRef = useRef<Record<string, TimerInfo>>({})
  const [timerTick, setTimerTick] = useState(0)
  const intervalsRef = useRef<Record<string, ReturnType<typeof setInterval>>>({})

  const pokeTimer = useCallback(() => setTimerTick(t => t + 1), [])

  const startTimer = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task || task.timer_seconds <= 0) return

    if (intervalsRef.current[taskId]) {
      clearInterval(intervalsRef.current[taskId])
      delete intervalsRef.current[taskId]
    }

    const existing = timerRef.current[taskId]
    const remaining = existing?.remaining ?? task.timer_seconds

    timerRef.current[taskId] = { remaining, status: 'running' }
    pokeTimer()

    intervalsRef.current[taskId] = setInterval(() => {
      const info = timerRef.current[taskId]
      if (!info || info.status !== 'running') return
      const next = info.remaining - 1
      if (next <= 0) {
        timerRef.current[taskId] = { remaining: 0, status: 'finished' }
        clearInterval(intervalsRef.current[taskId])
        delete intervalsRef.current[taskId]
        playAlarmSound()
        pokeTimer()
      } else {
        timerRef.current[taskId] = { ...info, remaining: next }
        pokeTimer()
      }
    }, 1000)
  }, [tasks, pokeTimer])

  const pauseTimer = useCallback((taskId: string) => {
    const info = timerRef.current[taskId]
    if (!info || info.status !== 'running') return
    timerRef.current[taskId] = { ...info, status: 'paused' }
    if (intervalsRef.current[taskId]) {
      clearInterval(intervalsRef.current[taskId])
      delete intervalsRef.current[taskId]
    }
    pokeTimer()
  }, [pokeTimer])

  const resetTimer = useCallback((taskId: string) => {
    if (intervalsRef.current[taskId]) {
      clearInterval(intervalsRef.current[taskId])
      delete intervalsRef.current[taskId]
    }
    const task = tasks.find(t => t.id === taskId)
    timerRef.current[taskId] = { remaining: task?.timer_seconds ?? 0, status: 'idle' }
    pokeTimer()
  }, [tasks, pokeTimer])

  useEffect(() => () => {
    Object.values(intervalsRef.current).forEach(id => clearInterval(id))
  }, [])

  const handleReset = useCallback(async () => {
    timerRef.current = {}
    Object.values(intervalsRef.current).forEach(id => clearInterval(id))
    intervalsRef.current = {}
    pokeTimer()
    await resetAll()
  }, [resetAll, pokeTimer])

  const getTimerInfo = useCallback((taskId: string): { remaining: number; status: TimerStatus } => {
    const info = timerRef.current[taskId]
    if (info) return { remaining: info.remaining, status: info.status }
    const task = tasks.find(t => t.id === taskId)
    if (task && task.timer_seconds > 0) return { remaining: task.timer_seconds, status: 'idle' }
    return { remaining: 0, status: 'idle' }
  }, [tasks])

  const filteredTasks = activeCategory === 'all'
    ? tasks
    : tasks.filter(t => t.category === activeCategory)

  const progress = tasks.length > 0
    ? Math.round((tasks.filter(t => t.done).length / tasks.length) * 100)
    : 0

  const lumiMessage = progress === 100
    ? '¡Completaste toda la rutina! 🎉'
    : progress > 50
    ? '¡Vas muy bien! Sigue así'
    : 'Completa tu rutina del día'

  useEffect(() => {
    if (progress === 100 && tasks.length > 0) {
      setCelebrate100(true)
      const t = setTimeout(() => setCelebrate100(false), 3000)
      return () => clearTimeout(t)
    }
  }, [progress, tasks.length])



  if (loading) {
    return (
      <div className="flex flex-col gap-4 pb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>← Atrás</Button>
          <div className="flex-1">
            <h1 className="heading-page">Agenda Visual</h1>
            <p className="text-body">Organiza la rutina diaria con pictogramas</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-16 rounded-xl bg-surface-secondary animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !childId) {
    return (
      <div className="flex flex-col gap-4 pb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>← Atrás</Button>
          <div className="flex-1">
            <h1 className="heading-page">Agenda Visual</h1>
            <p className="text-body">Organiza la rutina diaria con pictogramas</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="heading-card">
            {!childId
              ? '⚠️ No hay ningún niño seleccionado. Ve a Perfil para configurarlo.'
              : `⚠️ Error al cargar: ${error}`}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>← Atrás</Button>
        <div className="flex-1 min-w-0">
          <h1 className="heading-page">Agenda Visual</h1>
          <p className="text-body">Organiza la rutina diaria con pictogramas</p>
        </div>
        {agenda && (
          <span className="text-xs bg-surface border border-border rounded-full px-2 py-0.5 text-text-muted shrink-0">
            {agenda.name}
          </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <img src="/assets/dino-agenda-visual.png" alt="" width={138} height={161} className="object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        <p className="text-base font-bold text-text-primary">{lumiMessage}</p>
      </div>

      <div className="relative">
        <div className="bg-surface-secondary rounded-full h-4 overflow-hidden">
          <motion.div
            className="bg-brand h-full rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <motion.div
          className="absolute z-10 pointer-events-none"
          initial={{ left: 0 }}
          animate={{ left: `${progress}%` }}
          transition={{ duration: 0.5 }}
          style={{ transform: 'translate(-50%, -50%)', top: 'calc(50% - 14px)' }}
        >
          <img
            src="/assets/dino-indicador.png"
            alt=""
            width={40}
            height={48}
            className="object-contain drop-shadow-md"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </motion.div>
        <p className="text-xs font-bold text-text-secondary mt-2">
          {tasks.filter(t => t.done).length} de {tasks.length} completadas · {progress}%
        </p>
      </div>

      {celebrate100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8 }}
              className="text-7xl mb-4"
            >
              🎉
            </motion.div>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-extrabold text-white drop-shadow-lg"
            >
              ¡Rutina completada!
            </motion.p>
          </div>
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 rounded-full"
              style={{ backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length] }}
              initial={{ x: '50vw', y: '50vh', scale: 0 }}
              animate={{
                x: `${20 + Math.random() * 60}vw`,
                y: `${10 + Math.random() * 80}vh`,
                scale: [0, 1.5, 0.8, 0],
                opacity: [0, 1, 0.5, 0],
              }}
              transition={{ duration: 2 + Math.random() * 1.5, delay: Math.random() * 0.5 }}
            />
          ))}
        </motion.div>
      )}



      <div className="flex gap-2">
        <Button
          variant="primary"
          size="md"
          onClick={() => setShowAddForm(v => !v)}
          className="flex-1"
        >
          {showAddForm ? '✕ Cancelar' : '➕ Añadir tarea'}
        </Button>
        <Button
          variant="outline"
          size="md"
          onClick={handleReset}
          className="border-red-300 text-red-500 hover:bg-red-50"
        >
          🔄 Reiniciar
        </Button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <AddTaskForm
            onAdd={async (task) => { await addTask(task); setShowAddForm(false) }}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 'morning', 'afternoon', 'evening'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full font-bold text-xs transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-brand text-white'
                : 'bg-surface border border-border text-text-secondary'
            }`}
          >
            {cat === 'all'
              ? `Todas (${tasks.length})`
              : `${CATEGORY_META[cat].emoji} ${CATEGORY_META[cat].label} (${
                  tasks.filter(t => t.category === cat).length
                })`
            }
          </button>
        ))}
      </div>

      <Reorder.Group
        axis="y"
        values={filteredTasks}
        onReorder={(reordered) => {
          const others = tasks.filter(t => !filteredTasks.find(f => f.id === t.id))
          reorderTasks([...others, ...reordered])
        }}
        className="flex flex-col gap-2"
      >
        <AnimatePresence mode="popLayout">
          {filteredTasks.map(task => (
            <Reorder.Item key={task.id} value={task} as="div">
              <TaskCard
                task={task}
                onToggle={() => toggleDone(task.id)}
                onDelete={() => deleteTask(task.id)}
                onSetTimerDuration={(seconds) => updateTimerDuration(task.id, seconds)}
                onStartTimer={() => startTimer(task.id)}
                onPauseTimer={() => pauseTimer(task.id)}
                onResetTimer={() => resetTimer(task.id)}
                onUpdateReward={(reward) => updateReward(task.id, reward)}
                onUpdateTts={(use_tts) => updateUseTts(task.id, use_tts)}
                onUpdateAudio={(audio_data) => updateAudio(task.id, audio_data)}
                onUpdateAudioLabel={(label) => updateAudioLabel(task.id, label)}
                timerInfo={getTimerInfo(task.id)}
              />
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {filteredTasks.length === 0 && !showAddForm && (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">📋</p>
          <p className="heading-card text-text-muted">No hay tareas en este período</p>
          <p className="text-xs text-text-muted mt-1">Toca &quot;Añadir tarea&quot; para empezar</p>
        </div>
      )}

      {/* Consejos útiles */}
      <Card variant="default" padding="md" className="bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <span className="text-2xl shrink-0">💡</span>
          <div className="flex-1">
            <h3 className="heading-card mb-1">Consejos útiles</h3>
            <p className="text-meta leading-relaxed">
              La agenda visual ayuda a estructurar la rutina diaria y reduce la ansiedad por lo desconocido.
              Coloca las tareas en orden, usa temporizadores para marcar la duración, y celebra cada
              completación con una recompensa. La consistencia genera confianza y autonomía.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
