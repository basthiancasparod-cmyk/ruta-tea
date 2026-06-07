'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useChildren } from '@/lib/hooks/useData'
import { useSupabase } from '@/components/layout/SupabaseProvider'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { TokenSession, BehaviorLog, BehaviorType } from '@/types'

function speakText(text: string) {
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'es-ES'
    u.rate = 0.85
    window.speechSynthesis.speak(u)
  } catch {}
}

function localDateStr(d?: Date) {
  const date = d ?? new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
const today = () => localDateStr()

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1)
  const start = new Date(first)
  start.setDate(start.getDate() - start.getDay())
  const days: Date[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    days.push(d)
  }
  return days
}

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

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
  { type: 'neutral', label: 'Observación', emoji: '👀' },
  { type: 'neutral', label: 'Transición', emoji: '➡️' },
  { type: 'neutral', label: 'Descanso', emoji: '💤' },
]

const REWARD_EMOJIS = ['🎁', '🧩', '🍦', '🎨', '📱', '🧸', '🎮', '🏀', '🎵', '🌈', '🍪', '🚗']

export default function RegistroConductaPage() {
  const router = useRouter()
  const { children: kids } = useChildren()
  const { supabase } = useSupabase()
  const childId = kids[0]?.id
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedDate, setSelectedDate] = useState(today())
  const now = new Date()
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())
  const [activeDates, setActiveDates] = useState<string[]>([])
  const [sessions, setSessions] = useState<TokenSession[]>([])
  const [logs, setLogs] = useState<BehaviorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [mood, setMood] = useState<number>(3)
  const [ttsEnabled, setTtsEnabled] = useState(true)

  const [logType, setLogType] = useState<BehaviorType>('positive')
  const [logIntensity, setLogIntensity] = useState<number>(3)
  const [logDesc, setLogDesc] = useState('')
  const [logPreset, setLogPreset] = useState<typeof BEHAVIOR_PRESETS[number] | null>(null)
  const [logImage, setLogImage] = useState<File | null>(null)
  const [logImagePreview, setLogImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)

  const [showNewBoard, setShowNewBoard] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editBoardReward, setEditBoardReward] = useState('')
  const [editBoardEmoji, setEditBoardEmoji] = useState('🎁')
  const [editBoardTokens, setEditBoardTokens] = useState(10)
  const [rewardText, setRewardText] = useState('')
  const [rewardEmoji, setRewardEmoji] = useState('🎁')
  const [tokenCount, setTokenCount] = useState(10)

  const [editingLog, setEditingLog] = useState<BehaviorLog | null>(null)
  const [viewingLog, setViewingLog] = useState<BehaviorLog | null>(null)
  const [editDesc, setEditDesc] = useState('')
  const [editIntensity, setEditIntensity] = useState<number>(3)
  const [editType, setEditType] = useState<BehaviorType>('positive')
  const [editImage, setEditImage] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [confirmDeleteLog, setConfirmDeleteLog] = useState<string | null>(null)
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [boardSaving, setBoardSaving] = useState(false)
  const editImageRef = useRef<HTMLInputElement>(null)

  const clientOffset = new Date().getTimezoneOffset()

  const fetchData = useCallback(async (date: string) => {
    if (!childId) return
    setLoading(true)
    try {
      const [logsRes, tokensRes] = await Promise.all([
        fetch(`/api/registro-conducta/logs?childId=${childId}&date=${date}&offset=${clientOffset}`),
        fetch(`/api/registro-conducta/tokens?childId=${childId}&date=${date}`),
      ])
      if (!logsRes.ok || !tokensRes.ok) {
        throw new Error('Error al cargar datos')
      }
      const logsData = await logsRes.json()
      const tokensData = await tokensRes.json()
      setLogs(logsData.logs ?? [])
      setSessions(tokensData.sessions ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [childId])

  const fetchActiveDates = useCallback(async (year: number, month: number) => {
    if (!childId) return
    try {
      const res = await fetch(`/api/registro-conducta/logs?childId=${childId}&month=${year}-${String(month + 1).padStart(2, '0')}&offset=${clientOffset}`)
      if (!res.ok) { console.warn('fetchActiveDates: response not ok'); return }
      const data = await res.json()
      setActiveDates(data.dates ?? [])
    } catch (e) { console.warn('fetchActiveDates', e) }
  }, [childId])

  useEffect(() => { fetchData(selectedDate) }, [fetchData, selectedDate])
  useEffect(() => { fetchActiveDates(calYear, calMonth) }, [fetchActiveDates, calYear, calMonth])

  useEffect(() => {
    return () => {
      if (logImagePreview) URL.revokeObjectURL(logImagePreview)
      if (editImagePreview) URL.revokeObjectURL(editImagePreview)
    }
  }, [logImagePreview, editImagePreview])

  const handleAddToken = async (sessionId: string) => {
    if (!childId) return
    const sess = sessions.find(s => s.id === sessionId)
    if (!sess) return
    const earned = Math.min(sess.earned_tokens + 1, sess.total_tokens)
    const completed = earned >= sess.total_tokens
    try {
      const res = await fetch('/api/registro-conducta/tokens', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, earned_tokens: earned, is_completed: completed }),
      })
      if (!res.ok) throw new Error('Error al añadir token')
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, earned_tokens: earned, is_completed: completed } : s))
      if (ttsEnabled) speakText(completed ? `¡Recompensa conseguida!` : `¡Buen trabajo!`)
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Error al añadir token')
    }
  }

  const handleCreateBoard = async () => {
    if (!childId || sessions.length >= 3) return
    setBoardSaving(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/registro-conducta/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, reward_text: rewardText || 'Mi recompensa', reward_emoji: rewardEmoji, total_tokens: tokenCount, session_date: selectedDate }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Error ${res.status}`)
      }
      const data = await res.json()
      setSessions(prev => [data, ...prev])
      setShowNewBoard(false)
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Error al crear tablero')
    } finally {
      setBoardSaving(false)
    }
  }

  const handleUpdateBoard = async () => {
    if (!editingSessionId) return
    const sess = sessions.find(s => s.id === editingSessionId)
    if (!sess) return
    setBoardSaving(true)
    setErrorMsg(null)
    const clamped = Math.min(sess.earned_tokens, editBoardTokens)
    const completed = clamped >= editBoardTokens
    try {
      const res = await fetch('/api/registro-conducta/tokens', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: editingSessionId, reward_text: editBoardReward, reward_emoji: editBoardEmoji, total_tokens: editBoardTokens, earned_tokens: clamped, is_completed: completed }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Error ${res.status}`)
      }
      setSessions(prev => prev.map(s => s.id === editingSessionId ? { ...s, reward_text: editBoardReward, reward_emoji: editBoardEmoji, total_tokens: editBoardTokens, earned_tokens: clamped, is_completed: completed } : s))
      setEditingSessionId(null)
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Error al guardar tablero')
    } finally {
      setBoardSaving(false)
    }
  }

  const handleDeleteSession = async () => {
    if (!deleteSessionId) return
    const id = deleteSessionId
    try {
      const res = await fetch(`/api/registro-conducta/tokens?sessionId=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar el tablero')
      setSessions(prev => prev.filter(s => s.id !== id))
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Error al eliminar el tablero')
    } finally {
      setDeleteSessionId(null)
    }
  }

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    const ext = file.name.split('.').pop() ?? 'png'
    const filePath = `${folder}/${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('conducta').upload(filePath, file, { upsert: true })
    if (uploadError) { console.error(uploadError); return null }
    const { data: urlData } = supabase.storage.from('conducta').getPublicUrl(filePath)
    return urlData.publicUrl
  }

  const handleLog = async () => {
    if (!childId || (!logDesc.trim() && !logPreset)) return
    setSaving(true)
    setImageUploading(true)
    setErrorMsg(null)
    try {
      let imageUrl: string | null = null
      if (logImage) {
        imageUrl = await uploadImage(logImage, childId)
        if (!imageUrl) { setErrorMsg('Error al subir la foto'); return }
      }
      const description = logPreset ? logPreset.label : logDesc.trim()
      const res = await fetch('/api/registro-conducta/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, behavior_type: logType, intensity: logIntensity, description, image_url: imageUrl, mood_before: mood, mood_after: mood, logged_at: new Date().toISOString() }),
      })
      if (!res.ok) { setErrorMsg('Error al guardar el registro'); return }
      const log = await res.json()
      setLogs(prev => [log, ...prev])
      setLogDesc('')
      setLogPreset(null)
      if (logImagePreview) URL.revokeObjectURL(logImagePreview)
      setLogImage(null)
      setLogImagePreview(null)
      if (ttsEnabled) speakText(logType === 'positive' ? '¡Bien!' : logType === 'challenging' ? 'Registrado' : 'Anotado')
      if (logType === 'positive') {
        const incomplete = sessions.find(s => !s.is_completed)
        if (incomplete) handleAddToken(incomplete.id)
      }
    } catch { setErrorMsg('Error de conexión al guardar')
    } finally {
      setSaving(false)
      setImageUploading(false)
    }
  }

  const handleEditLog = async () => {
    if (!editingLog || !childId) return
    setEditSaving(true)
    setErrorMsg(null)
    try {
      let imageUrl = editingLog.image_url
      if (editImage) {
        if (editingLog.image_url) {
          const pathMatch = editingLog.image_url.match(/conducta\/(.+)$/)
          if (pathMatch) {
            await supabase.storage.from('conducta').remove([pathMatch[1]])
          }
        }
        const url = await uploadImage(editImage, childId)
        if (url) imageUrl = url
      }
      const res = await fetch('/api/registro-conducta/logs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId: editingLog.id, description: editDesc, intensity: editIntensity, behavior_type: editType, image_url: imageUrl }),
      })
      if (!res.ok) { setErrorMsg('Error al editar el registro'); return }
      const updated = await res.json()
      setLogs(prev => prev.map(l => l.id === updated.id ? updated : l))
      if (editImagePreview) URL.revokeObjectURL(editImagePreview)
      setEditingLog(null)
      setEditImage(null)
      setEditImagePreview(null)
      setErrorMsg(null)
    } catch { setErrorMsg('Error de conexión al editar')
    } finally {
      setEditSaving(false)
    }
  }

  const handleDeleteLog = async (logId: string) => {
    try {
      const res = await fetch(`/api/registro-conducta/logs?logId=${logId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar el registro')
      setLogs(prev => prev.filter(l => l.id !== logId))
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Error al eliminar el registro')
    } finally {
      setConfirmDeleteLog(null)
    }
  }

  const openEditLog = (log: BehaviorLog) => {
    setEditingLog(log)
    setEditDesc(log.description)
    setEditIntensity(log.intensity ?? 3)
    setEditType(log.behavior_type)
    setEditImage(null)
    setEditImagePreview(null)
  }

  const positive = logs.filter(l => l.behavior_type === 'positive')
  const challenging = logs.filter(l => l.behavior_type === 'challenging')

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Atrás</Button>
        <div className="flex-1">
          <h1 className="heading-page">Registro de Conducta</h1>
          <p className="text-body">Refuerzo positivo y seguimiento diario</p>
        </div>
        <button onClick={() => setTtsEnabled(!ttsEnabled)}
          className="w-9 h-9 rounded-xl flex items-center justify-center border-2 border-border text-base hover:border-brand transition-all opacity-60 hover:opacity-100 shrink-0"
          title={ttsEnabled ? 'Silenciar voz' : 'Activar voz'}>{ttsEnabled ? '🗣️' : '🚫'}</button>
        <p className="text-xs font-bold text-text-muted text-right shrink-0">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Mini Calendar */}
      <div className="flex justify-center">
        <div className="bg-surface rounded-2xl shadow-md border border-border p-3 w-[260px]">
          <div className="flex items-center justify-between mb-1">
            <button onClick={() => { const d = new Date(calYear, calMonth - 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()) }}
              className="w-6 h-6 rounded-lg text-xs font-bold hover:bg-surface-secondary flex items-center justify-center text-text-muted">◀</button>
            <span className="text-xs font-bold text-text-primary">{MONTHS[calMonth]} {calYear}</span>
            <button onClick={() => { const d = new Date(calYear, calMonth + 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()) }}
              className="w-6 h-6 rounded-lg text-xs font-bold hover:bg-surface-secondary flex items-center justify-center text-text-muted">▶</button>
          </div>
          <div className="grid grid-cols-7 gap-px">
            {['D','L','M','M','J','V','S'].map((d, i) => (
              <div key={`hdr-${i}`} className="text-center text-[9px] font-bold text-text-muted py-0.5">{d}</div>
            ))}
            {getMonthDays(calYear, calMonth).map((d, i) => {
              const ds = localDateStr(d)
              const isCurrentMonth = d.getMonth() === calMonth
              const isSelected = ds === selectedDate
              const hasLog = activeDates.includes(ds)
              const isToday_ = ds === today()
              return (
                <button key={i} onClick={() => { setSelectedDate(ds); if (d.getMonth() !== calMonth) { setCalYear(d.getFullYear()); setCalMonth(d.getMonth()) } }}
                  className={`relative text-center text-[11px] font-bold rounded py-1 transition-all ${
                    isSelected ? 'bg-brand text-white shadow-sm'
                    : isToday_ ? 'bg-brand-bg text-brand'
                    : isCurrentMonth ? 'text-text-primary hover:bg-surface-secondary'
                    : 'text-text-muted/40'
                  }`}>
                  {d.getDate()}
                  {hasLog && <span className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-brand'}`} />}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-sm">⚠️</span>
            <p className="text-xs font-bold text-red-700 flex-1">{errorMsg}</p>
            <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600 text-xs font-bold">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div key={selectedDate} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl shadow-md border border-border p-4">
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
                <button key={v} onClick={() => { setMood(v); if (ttsEnabled) speakText(['Triste', 'Preocupado', 'Neutral', 'Contento', 'Feliz'][v - 1]) }}
                  className={`text-lg transition-all ${mood === v ? 'scale-125' : 'opacity-30 hover:opacity-60'}`}>
                  {['😢', '😟', '😐', '🙂', '😄'][v - 1]}
                </button>
              ))}
            </div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Ánimo</p>
          </div>
        </div>
      </motion.div>

      {/* Token Board */}
      <motion.div key={`token-${selectedDate}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-surface rounded-2xl shadow-md border border-border overflow-hidden">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading-section flex items-center gap-2">
              <span>🎯</span> Tablero de Recompensas
            </h2>
            {sessions.length < 3 && (
              <button onClick={() => { setRewardText(''); setRewardEmoji('🎁'); setTokenCount(10); setShowNewBoard(true) }}
                className="text-xs font-bold text-brand hover:text-brand-dark transition-colors">+ Nueva</button>
            )}
          </div>

          {loading ? (
            <div className="flex gap-1.5">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="w-9 h-9 rounded-xl bg-surface-secondary animate-pulse" />)}</div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-text-muted">No hay tableros para este día</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((sess) => (
                <div key={sess.id} className="bg-brand-bg/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{sess.reward_emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-text-secondary">Trabajando por:</p>
                      <p className="text-sm font-black text-brand truncate">{sess.reward_text}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-black text-text-primary">{sess.earned_tokens}/{sess.total_tokens}</p>
                      <p className="text-[10px] font-bold text-text-muted">tokens</p>
                    </div>
                    <div className="flex gap-0.5">
                      <button onClick={() => { setEditBoardReward(sess.reward_text); setEditBoardEmoji(sess.reward_emoji); setEditBoardTokens(sess.total_tokens); setEditingSessionId(sess.id) }}
                        className="w-9 h-9 rounded-lg text-sm hover:bg-surface-secondary flex items-center justify-center text-text-muted" title="Editar">✏️</button>
                      <button onClick={() => setDeleteSessionId(sess.id)}
                        className="w-9 h-9 rounded-lg text-sm hover:bg-red-50 flex items-center justify-center text-text-muted hover:text-red-500" title="Eliminar">🗑️</button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {Array.from({ length: sess.total_tokens }).map((_, i) => (
                      <motion.div key={i}
                        initial={i < sess.earned_tokens ? { scale: 0 } : undefined}
                        animate={i < sess.earned_tokens ? { scale: 1 } : undefined}
                        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: i * 0.05 }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${
                          i < sess.earned_tokens
                            ? 'border-amber-400 bg-amber-50'
                            : 'border-dashed border-border bg-surface-secondary'
                        }`}>
                        {i < sess.earned_tokens ? (
                          <img src="/eggs/egg-comun-0.png" alt="token" className="w-8 h-8 object-contain" />
                        ) : null}
                      </motion.div>
                    ))}
                  </div>

                  {sess.is_completed ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="text-center py-2 bg-green-50 border-2 border-green-300 rounded-xl">
                      <p className="text-sm font-black text-green-700">🎉 Recompensa conseguida</p>
                    </motion.div>
                  ) : (
                    <button onClick={() => handleAddToken(sess.id)}
                      className="w-full py-2 rounded-xl text-[11px] font-bold bg-brand text-white hover:bg-brand-dark transition-colors shadow-sm">
                      🥚 Dar token
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Log Form */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-surface rounded-2xl shadow-md border border-border p-5">
          <h2 className="heading-section flex items-center gap-2 mb-4">
            <span>📝</span> Registrar Conducta
          </h2>

          <div className="flex gap-1.5 mb-4">
            {(['positive', 'challenging', 'neutral'] as BehaviorType[]).map(type => (
              <button key={type} onClick={() => { setLogType(type); if (ttsEnabled) speakText(type === 'positive' ? 'Positiva' : type === 'challenging' ? 'Reto' : 'Neutral') }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  logType === type
                    ? type === 'positive' ? 'bg-green-500 text-white shadow-sm' : type === 'challenging' ? 'bg-amber-500 text-white shadow-sm' : 'bg-gray-400 text-white shadow-sm'
                    : 'bg-surface-secondary text-text-secondary hover:bg-border'
                }`}>
                {type === 'positive' ? '🌟 Positiva' : type === 'challenging' ? '⚠️ Reto' : '📌 Neutral'}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {BEHAVIOR_PRESETS.filter(p => p.type === logType).map(p => (
              <button key={p.label} onClick={() => { setLogPreset(p); setLogDesc(''); if (ttsEnabled) speakText(p.label) }}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                  logPreset?.label === p.label
                    ? logType === 'positive' ? 'bg-green-100 text-green-700 border border-green-300' : logType === 'challenging' ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-gray-100 text-gray-700 border border-gray-300'
                    : 'bg-surface-secondary text-text-secondary hover:bg-border'
                }`}>
                <span>{p.emoji}</span>
                <span className="whitespace-nowrap">{p.label}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-3">
            <input value={logDesc} onChange={(e) => { setLogDesc(e.target.value); setLogPreset(null) }}
              className="flex-1 px-3 py-2 rounded-xl border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none"
              placeholder="Describe lo que pasó..." />
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 rounded-xl border-2 border-dashed border-border bg-white text-sm font-medium text-text-muted hover:border-brand transition-colors">
              {logImagePreview ? '📸' : '📷'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) { setLogImage(f); setLogImagePreview(URL.createObjectURL(f)) } }} />
          </div>

          {logImagePreview && (
            <div className="relative inline-block mb-3">
              <img src={logImagePreview} alt="preview" className="h-20 rounded-xl object-cover border border-border" />
              <button onClick={() => { setLogImage(null); setLogImagePreview(null) }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">✕</button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-text-muted">Intensidad:</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(v => (
                  <button key={v} onClick={() => setLogIntensity(v)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      v <= logIntensity ? (logType === 'positive' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white') : 'bg-surface-secondary text-text-muted'
                    }`}>{v}</button>
                ))}
              </div>
            </div>
            <div className="flex-1" />
            <button onClick={handleLog} disabled={saving || (!logDesc.trim() && !logPreset)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-dark transition-colors disabled:opacity-50 shadow-sm">
              {imageUploading ? 'Subiendo...' : saving ? 'Guardando...' : '💾 Registrar'}
            </button>
          </div>
        </motion.div>
      {/* Timeline */}
      <motion.div key={`logs-${selectedDate}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-surface rounded-2xl shadow-md border border-border p-5">
        <h2 className="heading-section flex items-center gap-2 mb-4">
          <span>📋</span> Actividad
          <span className="text-xs font-bold text-text-muted ml-auto">{formatDate(selectedDate)} · {logs.length} registros</span>
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-text-muted">Cargando...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">🦕</p>
            <p className="text-sm text-text-muted">No hay registros para este día.</p>
          </div>
        ) : (
          <div className="space-y-1">
              {logs.map((log, i) => (
                <motion.div key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`flex items-start gap-3 p-3 rounded-xl group ${
                    log.behavior_type === 'positive' ? 'bg-green-50/50'
                    : log.behavior_type === 'challenging' ? 'bg-amber-50/50'
                    : 'bg-gray-50/50'
                  }`}>
                  <div className="flex-shrink-0 w-14 text-center pt-0.5">
                    <p className="text-[10px] font-bold text-text-muted">
                      {new Date(log.logged_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                    log.behavior_type === 'positive' ? 'bg-green-100 text-green-600'
                    : log.behavior_type === 'challenging' ? 'bg-amber-100 text-amber-600'
                    : 'bg-gray-100 text-gray-500'
                  }`}>
                    {log.behavior_type === 'positive' ? '✅' : log.behavior_type === 'challenging' ? '⚠️' : '📌'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-text-primary">{log.description}</p>
                    {log.intensity != null && (
                      <p className="text-[10px] font-bold text-text-muted">
                        Intensidad: {'●'.repeat(log.intensity)}{'○'.repeat(5 - log.intensity)}
                      </p>
                    )}
                    {log.image_url && (
                      <img src={log.image_url} alt="foto" className="mt-1.5 h-16 rounded-lg object-cover border border-border" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    )}
                  </div>
                  <div className="flex gap-0.5 opacity-60 hover:opacity-100 transition-opacity">
                    <button onClick={() => setViewingLog(log)}
                      className="w-9 h-9 rounded-lg text-sm hover:bg-surface-secondary flex items-center justify-center text-text-muted" title="Ver">👁️</button>
                    <button onClick={() => openEditLog(log)}
                      className="w-9 h-9 rounded-lg text-sm hover:bg-surface-secondary flex items-center justify-center text-text-muted" title="Editar">✏️</button>
                    <button onClick={() => setConfirmDeleteLog(log.id)}
                      className="w-9 h-9 rounded-lg text-sm hover:bg-red-50 flex items-center justify-center text-text-muted hover:text-red-500" title="Eliminar">🗑️</button>
                  </div>
                </motion.div>
              ))}
          </div>
        )}
      </motion.div>

      {/* New Board Modal */}
      <AnimatePresence>
        {showNewBoard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40" onClick={() => { setRewardText(''); setRewardEmoji('🎁'); setTokenCount(10); setShowNewBoard(false) }}>
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
                  <div className="flex flex-wrap gap-1.5">
                    {REWARD_EMOJIS.map(e => (
                      <button key={e} onClick={() => setRewardEmoji(e)}
                        className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${rewardEmoji === e ? 'bg-brand-bg ring-2 ring-brand' : 'hover:bg-surface-secondary'}`}>{e}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Tokens</label>
                  <div className="flex gap-1.5">
                    {[3, 5, 8, 10, 15].map(n => (
                      <button key={n} onClick={() => setTokenCount(n)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tokenCount === n ? 'bg-brand text-white shadow-sm' : 'bg-surface-secondary text-text-secondary hover:bg-border'}`}>{n}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => { setRewardText(''); setRewardEmoji('🎁'); setTokenCount(10); setShowNewBoard(false) }}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-secondary transition-colors border border-border">Cancelar</button>
                  <button onClick={handleCreateBoard} disabled={boardSaving}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-dark transition-colors disabled:opacity-50 shadow-sm">{boardSaving ? 'Creando...' : 'Crear'}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Board Modal */}
      <AnimatePresence>
        {editingSessionId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40" onClick={() => setEditingSessionId(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface rounded-2xl shadow-xl w-full max-w-sm p-5 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">✏️</span>
                <h3 className="heading-section">Editar Tablero</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Recompensa</label>
                  <input value={editBoardReward} onChange={e => setEditBoardReward(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Emoji</label>
                  <div className="flex flex-wrap gap-1.5">
                    {REWARD_EMOJIS.map(e => (
                      <button key={e} onClick={() => setEditBoardEmoji(e)}
                        className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${editBoardEmoji === e ? 'bg-brand-bg ring-2 ring-brand' : 'hover:bg-surface-secondary'}`}>{e}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Tokens</label>
                  <div className="flex gap-1.5">
                    {[3, 5, 8, 10, 15].map(n => (
                      <button key={n} onClick={() => setEditBoardTokens(n)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${editBoardTokens === n ? 'bg-brand text-white shadow-sm' : 'bg-surface-secondary text-text-secondary hover:bg-border'}`}>{n}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setEditingSessionId(null)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-secondary transition-colors border border-border">Cancelar</button>
                  <button onClick={handleUpdateBoard} disabled={boardSaving}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-dark transition-colors disabled:opacity-50 shadow-sm">{boardSaving ? 'Guardando...' : 'Guardar'}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Log Modal */}
      <AnimatePresence>
        {editingLog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40" onClick={() => setEditingLog(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface rounded-2xl shadow-xl w-full max-w-sm p-5 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">✏️</span>
                <h3 className="heading-section">Editar Registro</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Tipo</label>
                  <div className="flex gap-1.5">
                    {(['positive', 'challenging', 'neutral'] as BehaviorType[]).map(type => (
                      <button key={type} onClick={() => setEditType(type)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${editType === type ? (type === 'positive' ? 'bg-green-500 text-white' : type === 'challenging' ? 'bg-amber-500 text-white' : 'bg-gray-400 text-white') : 'bg-surface-secondary text-text-secondary hover:bg-border'}`}>
                        {type === 'positive' ? '✅ Positiva' : type === 'challenging' ? '⚠️ Reto' : '📌 Neutral'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Descripción</label>
                  <input value={editDesc} onChange={e => setEditDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Intensidad</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button key={v} onClick={() => setEditIntensity(v)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${editIntensity === v ? 'bg-brand text-white' : 'bg-surface-secondary text-text-secondary hover:bg-border'}`}>{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Foto</label>
                  <div className="flex items-center gap-2">
                    {editingLog.image_url && (
                      <img src={editingLog.image_url} alt="actual" className="h-12 rounded-lg object-cover border border-border" />
                    )}
                    <button onClick={() => editImageRef.current?.click()}
                      className="text-xs font-bold text-brand hover:text-brand-dark transition-colors">
                      {editingLog.image_url ? 'Cambiar' : 'Añadir foto'}
                    </button>
                    <input ref={editImageRef} type="file" accept="image/*" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) { setEditImage(f); setEditImagePreview(URL.createObjectURL(f)) } }} />
                  </div>
                  {editImagePreview && (
                    <img src={editImagePreview} alt="preview" className="mt-1 h-16 rounded-lg object-cover border border-border" />
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setEditingLog(null)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-secondary transition-colors border border-border">Cancelar</button>
                  <button onClick={handleEditLog} disabled={editSaving || !editDesc.trim()}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-dark transition-colors disabled:opacity-50 shadow-sm">
                    {editSaving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail View Modal */}
      <AnimatePresence>
        {viewingLog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40" onClick={() => setViewingLog(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface rounded-2xl shadow-xl w-full max-w-sm p-5 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                  viewingLog.behavior_type === 'positive' ? 'bg-green-100 text-green-600'
                  : viewingLog.behavior_type === 'challenging' ? 'bg-amber-100 text-amber-600'
                  : 'bg-gray-100 text-gray-500'
                }`}>
                  {viewingLog.behavior_type === 'positive' ? '✅' : viewingLog.behavior_type === 'challenging' ? '⚠️' : '📌'}
                </span>
                <h3 className="heading-section flex-1">
                  {viewingLog.behavior_type === 'positive' ? 'Conducta Positiva' : viewingLog.behavior_type === 'challenging' ? 'Conducta Reto' : 'Conducta Neutral'}
                </h3>
                <button onClick={() => setViewingLog(null)} className="text-text-muted hover:text-text-primary text-sm font-bold">✕</button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Descripción</p>
                  <p className="text-sm font-bold text-text-primary">{viewingLog.description}</p>
                </div>
                {viewingLog.intensity && (
                  <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Intensidad</p>
                    <p className="text-sm font-bold text-text-primary">{'●'.repeat(viewingLog.intensity)}{'○'.repeat(5 - viewingLog.intensity)}</p>
                  </div>
                )}
                {viewingLog.image_url && (
                  <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Foto</p>
                    <img src={viewingLog.image_url} alt="foto" className="w-full max-h-48 rounded-xl object-cover border border-border" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Hora</p>
                  <p className="text-sm font-bold text-text-primary">
                    {new Date(viewingLog.logged_at).toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {(viewingLog.mood_before != null || viewingLog.mood_after != null) && (
                  <div className="flex gap-4">
                    {viewingLog.mood_before != null && (
                      <div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Ánimo inicio</p>
                        <p className="text-xl">{['😢', '😟', '😐', '🙂', '😄'][viewingLog.mood_before - 1]}</p>
                      </div>
                    )}
                    {viewingLog.mood_after != null && (
                      <div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Ánimo final</p>
                        <p className="text-xl">{['😢', '😟', '😐', '🙂', '😄'][viewingLog.mood_after - 1]}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm delete log */}
      <AnimatePresence>
        {confirmDeleteLog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40" onClick={() => setConfirmDeleteLog(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface rounded-2xl shadow-xl w-72 p-5 border border-border text-center">
              <p className="text-sm font-bold text-text-primary mb-4">¿Eliminar este registro?</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => setConfirmDeleteLog(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-secondary transition-colors">Cancelar</button>
                <button onClick={() => handleDeleteLog(confirmDeleteLog)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-colors">Eliminar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm delete session */}
      <AnimatePresence>
        {deleteSessionId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40" onClick={() => setDeleteSessionId(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface rounded-2xl shadow-xl w-72 p-5 border border-border text-center">
              <p className="text-sm font-bold text-text-primary mb-4">¿Eliminar este tablero?</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => setDeleteSessionId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-secondary transition-colors">Cancelar</button>
                <button onClick={handleDeleteSession}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-colors">Eliminar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Consejos útiles */}
      <Card variant="default" padding="md" className="bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <span className="text-2xl shrink-0">💡</span>
          <div className="flex-1">
            <h3 className="heading-card mb-1">Consejos útiles</h3>
            <p className="text-meta leading-relaxed">
              El registro de conducta ayuda a identificar patrones y desencadenantes. Registra tanto conductas positivas como
              desafiantes para obtener una visión completa. Usa el sistema de fichas para motivar y celebra cada logro,
              por pequeño que sea. La consistencia es clave para el progreso.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
