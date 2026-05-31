'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChildren } from '@/lib/hooks/useData'
import type { TokenSession, BehaviorLog, BehaviorType } from '@/types'

const today = () => new Date().toISOString().split('T')[0]

const EMOJIS = {
  positive: ['✅', '🌟', '💪', '🎉', '👏', '⭐', '🌈', '🦕'],
  challenging: ['⚠️', '😤', '💥', '🌀', '🌋', '😰', '⚡', '🦖'],
  neutral: ['📌', '➡️', '🔄', '⏳', '💤', '🤔'],
}

const BEHAVIOR_PRESETS: { type: BehaviorType; label: string; emoji: string }[] = [
  { type: 'positive', label: 'Siguió instrucciones', emoji: '✅' },
  { type: 'positive', label: 'Compartió/comunicó', emoji: '💬' },
  { type: 'positive', label: 'Esperó su turno', emoji: '⏳' },
  { type: 'positive', label: 'Se autorreguló', emoji: '🧘' },
  { type: 'positive', label: 'Inició tarea', emoji: '🚀' },
  { type: 'positive', label: 'Transición exitosa', emoji: '🔄' },
  { type: 'challenging', label: 'Berbíncua/rabieta', emoji: '🌋' },
  { type: 'challenging', label: 'Agresión física', emoji: '⚡' },
  { type: 'challenging', label: 'Autolesión', emoji: '💥' },
  { type: 'challenging', label: 'Evitación/huida', emoji: '🏃' },
  { type: 'challenging', label: 'Estereotipias intensas', emoji: '🌀' },
  { type: 'challenging', label: 'Gritos/vocalizaciones', emoji: '🔊' },
]

const MOODS = [
  { value: 5, label: 'Feliz', emoji: '😄' },
  { value: 4, label: 'Tranquilo', emoji: '🙂' },
  { value: 3, label: 'Neutral', emoji: '😐' },
  { value: 2, label: 'Irritado', emoji: '😟' },
  { value: 1, label: 'Muy molesto', emoji: '😢' },
]

export default function RegistroConductaPage() {
  const { children: kids } = useChildren()
  const childId = kids[0]?.id

  const [session, setSession] = useState<TokenSession | null>(null)
  const [logs, setLogs] = useState<BehaviorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [mood, setMood] = useState<number>(3)

  const [logType, setLogType] = useState<BehaviorType>('positive')
  const [logIntensity, setLogIntensity] = useState<number>(3)
  const [logDesc, setLogDesc] = useState('')
  const [logPreset, setLogPreset] = useState<typeof BEHAVIOR_PRESETS[number] | null>(null)
  const [saving, setSaving] = useState(false)
  const [showNewBoard, setShowNewBoard] = useState(false)
  const [rewardText, setRewardText] = useState('')
  const [rewardEmoji, setRewardEmoji] = useState('🎁')
  const [tokenCount, setTokenCount] = useState(10)

  const fetchData = useCallback(async () => {
    if (!childId) return
    setLoading(true)
    const date = today()
    try {
      const [logsRes, tokensRes] = await Promise.all([
        fetch(`/api/registro-conducta/logs?childId=${childId}&date=${date}`),
        fetch(`/api/registro-conducta/tokens?childId=${childId}&date=${date}`),
      ])
      const logsData = await logsRes.json()
      const tokensData = await tokensRes.json()
      setLogs(logsData.logs ?? [])
      setSession(tokensData.session ?? null)
    } catch (e) {
      console.error('Error fetching data:', e)
    } finally {
      setLoading(false)
    }
  }, [childId])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAddToken = async () => {
    if (!childId || !session) return
    const earned = Math.min(session.earned_tokens + 1, session.total_tokens)
    const completed = earned >= session.total_tokens

    const res = await fetch('/api/registro-conducta/tokens', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.id, earned_tokens: earned, is_completed: completed }),
    })
    if (res.ok) {
      setSession(prev => prev ? { ...prev, earned_tokens: earned, is_completed: completed } : prev)
    }
  }

  const handleCreateBoard = async () => {
    if (!childId) return
    const res = await fetch('/api/registro-conducta/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childId,
        reward_text: rewardText || 'Mi recompensa',
        reward_emoji: rewardEmoji,
        total_tokens: tokenCount,
        session_date: today(),
      }),
    })
    if (res.ok) {
      const data = await res.json()
      setSession(data)
      setShowNewBoard(false)
    }
  }

  const handleLog = async () => {
    if (!childId || (!logDesc.trim() && !logPreset)) return
    setSaving(true)
    try {
      const description = logPreset ? logPreset.label : logDesc.trim()
      const res = await fetch('/api/registro-conducta/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          behavior_type: logType,
          intensity: logIntensity,
          description,
          logged_at: new Date().toISOString(),
        }),
      })
      if (res.ok) {
        const log = await res.json()
        setLogs(prev => [log, ...prev])
        setLogDesc('')
        setLogPreset(null)
        if (logType === 'positive') handleAddToken()
      }
    } finally {
      setSaving(false)
    }
  }

  const positive = logs.filter(l => l.behavior_type === 'positive')
  const challenging = logs.filter(l => l.behavior_type === 'challenging')

  const weekLogs = logs

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/assets/dino-conducta.png" alt="Dino conducta" width={100} height={117} className="object-contain" />
          <div>
            <h1 className="heading-page">Registro de Conducta</h1>
            <p className="text-body">Refuerzo positivo y seguimiento diario</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-text-primary">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </div>

      {/* Stats Bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface rounded-2xl shadow-md border border-border p-4">
        <div className="flex items-center justify-around text-center">
          <div>
            <p className="text-2xl font-black text-green-600">{positive.length}</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Positivas</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div>
            <p className="text-2xl font-black text-amber-600">{challenging.length}</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Retos</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div>
            <p className="text-2xl font-black text-text-primary">{logs.length}</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Registros</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div>
            <div className="flex gap-0.5 justify-center">
              {[5, 4, 3, 2, 1].map(v => (
                <button key={v} onClick={() => setMood(v)}
                  className={`text-lg transition-all ${mood === v ? 'scale-125' : 'opacity-30 hover:opacity-60'}`}>
                  {MOODS.find(m => m.value === v)?.emoji}
                </button>
              ))}
            </div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Ánimo</p>
          </div>
        </div>
      </motion.div>

      {/* Token Board */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-surface rounded-2xl shadow-md border border-border overflow-hidden">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading-section flex items-center gap-2">
              <span>🎯</span> Tablero de Recompensas
            </h2>
            {!session && (
              <button onClick={() => setShowNewBoard(true)}
                className="text-xs font-bold text-brand hover:text-brand-dark transition-colors">
                + Nuevo tablero
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex gap-1.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="w-9 h-9 rounded-xl bg-surface-secondary animate-pulse" />
              ))}
            </div>
          ) : session ? (
            <>
              <div className="flex items-center gap-3 mb-4 p-3 bg-brand-bg/30 rounded-xl">
                <span className="text-3xl">{session.reward_emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-text-primary">Trabajando por:</p>
                  <p className="text-base font-black text-brand">{session.reward_text}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-text-primary">{session.earned_tokens}/{session.total_tokens}</p>
                  <p className="text-[10px] font-bold text-text-muted">tokens</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {Array.from({ length: session.total_tokens }).map((_, i) => (
                  <motion.div key={i}
                    initial={i < session.earned_tokens ? { scale: 0, rotate: -180 } : undefined}
                    animate={i < session.earned_tokens ? { scale: 1, rotate: 0 } : undefined}
                    transition={{ type: 'spring', stiffness: 300, damping: 15, delay: i * 0.05 }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold shadow-sm
                      ${i < session.earned_tokens
                        ? 'bg-amber-100 border-2 border-amber-400 text-amber-600'
                        : 'bg-surface-secondary border-2 border-dashed border-border text-text-muted'
                      }`}>
                    {i < session.earned_tokens ? '🥚' : '○'}
                  </motion.div>
                ))}
              </div>

              {session.is_completed ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="text-center py-3 bg-green-50 border-2 border-green-300 rounded-xl">
                  <p className="text-lg font-black text-green-700">🎉 Recompensa conseguida</p>
                  <p className="text-sm font-bold text-green-600">¡Excelente trabajo!</p>
                </motion.div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleAddToken}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-dark transition-colors shadow-sm">
                    🥚 Dar token
                  </button>
                  <button onClick={() => setShowNewBoard(true)}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-secondary transition-colors border border-border">
                    Nuevo
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-text-muted mb-3">Crea un tablero para empezar</p>
              <button onClick={() => setShowNewBoard(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-dark transition-colors">
                + Crear tablero
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Log Form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-surface rounded-2xl shadow-md border border-border p-5">
        <h2 className="heading-section flex items-center gap-2 mb-4">
          <span>📝</span> Registrar Conducta
        </h2>

        {/* Type toggle */}
        <div className="flex gap-1.5 mb-4">
          {(['positive', 'challenging', 'neutral'] as BehaviorType[]).map(type => (
            <button key={type} onClick={() => setLogType(type)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                logType === type
                  ? type === 'positive' ? 'bg-green-500 text-white shadow-sm'
                    : type === 'challenging' ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-gray-400 text-white shadow-sm'
                  : 'bg-surface-secondary text-text-secondary hover:bg-border'
              }`}>
              {type === 'positive' ? '🌟 Positiva' : type === 'challenging' ? '⚠️ Reto' : '📌 Neutral'}
            </button>
          ))}
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {BEHAVIOR_PRESETS.filter(p => p.type === logType).map(p => (
            <button key={p.label} onClick={() => { setLogPreset(p); setLogDesc('') }}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                logPreset?.label === p.label
                  ? logType === 'positive' ? 'bg-green-100 text-green-700 border border-green-300'
                    : logType === 'challenging' ? 'bg-amber-100 text-amber-700 border border-amber-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                  : 'bg-surface-secondary text-text-secondary hover:bg-border'
              }`}>
              <span>{p.emoji}</span>
              <span className="whitespace-nowrap">{p.label}</span>
            </button>
          ))}
        </div>

        {/* Custom description */}
        <input value={logDesc} onChange={(e) => { setLogDesc(e.target.value); setLogPreset(null) }}
          className="w-full px-3 py-2 rounded-xl border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none mb-3"
          placeholder="O describe lo que pasó..." />

        {/* Intensity + Submit row */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-text-muted">Intensidad:</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(v => (
                <button key={v} onClick={() => setLogIntensity(v)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    v <= logIntensity
                      ? logType === 'positive' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
                      : 'bg-surface-secondary text-text-muted'
                  }`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1" />
          <button onClick={handleLog} disabled={saving || (!logDesc.trim() && !logPreset)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-dark transition-colors disabled:opacity-50 shadow-sm">
            {saving ? 'Guardando...' : '💾 Registrar'}
          </button>
        </div>
      </motion.div>

      {/* Today's Timeline */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-surface rounded-2xl shadow-md border border-border p-5">
        <h2 className="heading-section flex items-center gap-2 mb-4">
          <span>📋</span> Actividad de Hoy
          <span className="text-xs font-bold text-text-muted ml-auto">{logs.length} registros</span>
        </h2>

        {logs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">🦕</p>
            <p className="text-sm text-text-muted">No hay registros hoy.<br />Comienza registrando una conducta.</p>
          </div>
        ) : (
          <div className="space-y-1">
            <AnimatePresence>
              {logs.map((log, i) => (
                <motion.div key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    log.behavior_type === 'positive' ? 'bg-green-50/50'
                    : log.behavior_type === 'challenging' ? 'bg-amber-50/50'
                    : 'bg-gray-50/50'
                  }`}>
                  <div className="flex-shrink-0 w-14 text-center">
                    <p className="text-[10px] font-bold text-text-muted">
                      {new Date(log.logged_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    log.behavior_type === 'positive' ? 'bg-green-100 text-green-600'
                    : log.behavior_type === 'challenging' ? 'bg-amber-100 text-amber-600'
                    : 'bg-gray-100 text-gray-500'
                  }`}>
                    {log.behavior_type === 'positive' ? '✅' : log.behavior_type === 'challenging' ? '⚠️' : '📌'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-text-primary truncate">{log.description}</p>
                    {log.intensity && (
                      <p className="text-[10px] font-bold text-text-muted">
                        Intensidad: {'●'.repeat(log.intensity)}{'○'.repeat(5 - log.intensity)}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* New Board Modal */}
      <AnimatePresence>
        {showNewBoard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40"
            onClick={() => setShowNewBoard(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface rounded-2xl shadow-xl w-full max-w-sm p-5 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🎯</span>
                <h3 className="heading-section">Nuevo Tablero</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Recompensa</label>
                  <input value={rewardText} onChange={e => setRewardText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none"
                    placeholder="Ej: 10min de iPad" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Emoji</label>
                  <div className="flex gap-1.5">
                    {['🎁', '🧩', '🍦', '🎨', '📱', '🧸', '🎮', '🏀', '🎵', '🌈'].map(e => (
                      <button key={e} onClick={() => setRewardEmoji(e)}
                        className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${rewardEmoji === e ? 'bg-brand-bg ring-2 ring-brand' : 'hover:bg-surface-secondary'}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Tokens necesarios</label>
                  <div className="flex gap-1.5">
                    {[3, 5, 8, 10, 15].map(n => (
                      <button key={n} onClick={() => setTokenCount(n)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tokenCount === n ? 'bg-brand text-white shadow-sm' : 'bg-surface-secondary text-text-secondary hover:bg-border'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowNewBoard(false)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-secondary transition-colors border border-border">
                    Cancelar
                  </button>
                  <button onClick={handleCreateBoard}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-dark transition-colors shadow-sm">
                    Crear
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
