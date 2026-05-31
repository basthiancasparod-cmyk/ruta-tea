'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useChildren } from '@/lib/hooks/useData'
import { playSound } from '@/lib/sounds'
import type { FirstThenBoard } from '@/types'

const EMOJI_OPTIONS = [
  '📋', '✏️', '📚', '🎒', '🧹', '🛁', '🪥', '👕', '🥣', '🍎',
  '🧩', '🎮', '📱', '🎨', '🚗', '🏀', '🎵', '📺', '🏰', '🦕',
  '🎁', '🍦', '🏆', '🌟', '🎪', '🎈', '🍿', '🧸', '🎳', '🎭',
]

const PRESET_FIRST = [
  { emoji: '📚', label: 'Tarea' },
  { emoji: '🪥', label: 'Dientes' },
  { emoji: '🛁', label: 'Baño' },
  { emoji: '👕', label: 'Vestirse' },
  { emoji: '🥣', label: 'Desayunar' },
  { emoji: '🧹', label: 'Ordenar' },
  { emoji: '✏️', label: 'Escribir' },
  { emoji: '🎒', label: 'Mochila' },
]

const PRESET_THEN = [
  { emoji: '🧩', label: 'Jugar' },
  { emoji: '📱', label: 'Pantalla' },
  { emoji: '🎮', label: 'Videojuego' },
  { emoji: '📺', label: 'TV' },
  { emoji: '🎨', label: 'Dibujar' },
  { emoji: '🚗', label: 'Paseo' },
  { emoji: '🍦', label: 'Helado' },
  { emoji: '🏆', label: 'Premio' },
]

type BoardPhase = 'selecting' | 'first' | 'done_first' | 'then' | 'completed'

function PrimeroDespuesPage() {
  const router = useRouter()
  const { children } = useChildren()
  const child = children[0]

  const [boards, setBoards] = useState<FirstThenBoard[]>([])
  const [activeBoard, setActiveBoard] = useState<FirstThenBoard | null>(null)
  const [phase, setPhase] = useState<BoardPhase>('selecting')
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [firstRemaining, setFirstRemaining] = useState(0)
  const [showNewModal, setShowNewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)

  const tickRef = useRef(0)
  const startRef = useRef(0)

  const fetchBoards = useCallback(async () => {
    if (!child?.id) return
    setErrorMsg(null)
    try {
      const res = await fetch(`/api/primero-despues?childId=${child.id}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setBoards(data.boards)
    } catch (e) {
      setErrorMsg('Error al cargar tableros')
    } finally {
      setLoading(false)
    }
  }, [child?.id])

  useEffect(() => { fetchBoards() }, [fetchBoards])

  useEffect(() => {
    return () => cancelAnimationFrame(tickRef.current)
  }, [])

  const tick = useCallback(() => {
    const elapsed = Math.floor((Date.now() - startRef.current) / 1000)
    const next = Math.max(firstRemaining - elapsed, 0)
    if (next <= 0) {
      setFirstRemaining(0)
      setPhase('done_first')
      if (soundEnabled) playSound('xp')
      return
    }
    setFirstRemaining(next)
    tickRef.current = requestAnimationFrame(tick)
  }, [firstRemaining, soundEnabled])

  const startFirst = () => {
    if (!activeBoard) return
    const mins = activeBoard.first_minutes
    if (mins && mins > 0) {
      const secs = mins * 60
      setFirstRemaining(secs)
      startRef.current = Date.now()
      tickRef.current = requestAnimationFrame(tick)
    }
    setPhase('first')
  }

  const completeFirst = () => {
    cancelAnimationFrame(tickRef.current)
    setFirstRemaining(0)
    setPhase('then')
    setShowConfetti(true)
    if (soundEnabled) playSound('celebration')
    setTimeout(() => setShowConfetti(false), 3000)
  }

  const completeThen = () => {
    setPhase('completed')
    setShowConfetti(true)
    if (soundEnabled) playSound('celebration')
    setTimeout(() => setShowConfetti(false), 3000)
  }

  const resetBoard = () => {
    cancelAnimationFrame(tickRef.current)
    setPhase('selecting')
    setFirstRemaining(0)
    setShowConfetti(false)
  }

  const selectBoard = (board: FirstThenBoard) => {
    setActiveBoard(board)
    setPhase('selecting')
    setFirstRemaining(0)
    setShowConfetti(false)
  }

  const createBoard = async (data: {
    title: string; first_label: string; first_emoji: string; first_minutes: number | null
    then_label: string; then_emoji: string
  }) => {
    if (!child?.id) return
    setErrorMsg(null)
    try {
      const res = await fetch('/api/primero-despues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId: child.id, ...data }),
      })
      const result = await res.json()
      if (result.error) throw new Error(result.error)
      setBoards(prev => [result, ...prev])
      setActiveBoard(result)
      setPhase('selecting')
      setShowNewModal(false)
    } catch {
      setErrorMsg('Error al crear tablero')
    }
  }

  const updateBoard = async (boardId: string, data: Partial<FirstThenBoard>) => {
    if (!child?.id) return
    setErrorMsg(null)
    try {
      const res = await fetch('/api/primero-despues', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId, childId: child.id, ...data }),
      })
      const result = await res.json()
      if (result.error) throw new Error(result.error)
      setBoards(prev => prev.map(b => b.id === boardId ? result : b))
      if (activeBoard?.id === boardId) setActiveBoard(result)
      setShowEditModal(false)
    } catch {
      setErrorMsg('Error al guardar tablero')
    }
  }

  const deleteBoard = async (boardId: string) => {
    if (!child?.id) return
    setErrorMsg(null)
    try {
      const res = await fetch(`/api/primero-despues?boardId=${boardId}&childId=${child.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setBoards(prev => prev.filter(b => b.id !== boardId))
      if (activeBoard?.id === boardId) { setActiveBoard(null); setPhase('selecting') }
      setConfirmDelete(null)
    } catch {
      setErrorMsg('Error al eliminar tablero')
    }
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Atrás</Button>
        <div className="flex-1">
          <h1 className="heading-page">Primero - Después</h1>
          <p className="text-body">Organiza tareas con una recompensa al final</p>
        </div>
        <button onClick={() => setSoundEnabled(!soundEnabled)}
          className="text-lg opacity-50 hover:opacity-100 transition-opacity" title={soundEnabled ? 'Silenciar' : 'Activar sonido'}>
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <span className="text-red-500 text-sm">⚠️</span>
          <p className="text-xs font-bold text-red-700 flex-1">{errorMsg}</p>
          <button onClick={() => setErrorMsg(null)} className="text-xs font-bold text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {/* Board selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {boards.map(board => (
          <button key={board.id} onClick={() => selectBoard(board)}
            className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
              activeBoard?.id === board.id
                ? 'border-brand bg-brand text-white shadow-sm'
                : 'border-border bg-surface text-text-secondary hover:border-brand hover:text-brand'
            }`}>
            {board.first_emoji} → {board.then_emoji}
            {board.title && <span className="ml-1 opacity-70">· {board.title}</span>}
          </button>
        ))}
        <button onClick={() => setShowNewModal(true)}
          className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold border-2 border-dashed border-border text-text-secondary hover:border-brand hover:text-brand transition-all bg-surface">
          + Nuevo
        </button>
      </div>

      {loading ? (
        <div className="bg-surface rounded-2xl shadow-md border border-border p-12 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (!activeBoard && boards.length === 0) ? (
        <div className="bg-surface rounded-2xl shadow-md border border-border p-12 text-center">
          <div className="text-5xl mb-3">🦕</div>
          <p className="heading-section mb-2">Crea tu primer tablero</p>
          <p className="text-body mb-4">Un tablero Primero-Después ayuda a tu hijo a entender qué tarea debe hacer y qué recompensa le espera al terminar.</p>
          <p className="text-xs text-text-muted mb-4">Ejemplo: "Primero 🪥 Dientes, luego 🧩 Jugar"</p>
          <Button onClick={() => setShowNewModal(true)}>+ Crear tablero</Button>
        </div>
      ) : activeBoard ? (
        <>
          <div className="bg-surface rounded-2xl shadow-md border border-border p-6">
            {/* Board title */}
            {activeBoard.title && (
              <p className="text-center text-xs font-bold text-text-muted mb-3">{activeBoard.title}</p>
            )}

            {/* Confetti */}
            <AnimatePresence>
              {showConfetti && (
                <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                  {Array.from({ length: 20 }).map((_, i) => {
                    const x = Math.random() * 100
                    const drift = (Math.random() - 0.5) * 150
                    const fall = 200 + Math.random() * 400
                    const size = 6 + Math.random() * 6
                    const colors = ['#44B39D', '#F59E0B', '#8B5CF6', '#EF4444', '#6BCB77', '#4FC3F7']
                    return (
                      <motion.div key={i} className="absolute rounded-sm"
                        style={{ left: `${x}%`, top: -15, width: size, height: size * 0.6, backgroundColor: colors[i % colors.length] }}
                        initial={{ y: -15, rotate: 0, opacity: 1 }}
                        animate={{ y: fall, x: drift, rotate: 720, opacity: [1, 0.8, 0] }}
                        transition={{ duration: 1.5 + Math.random(), delay: Math.random() * 0.5, ease: 'easeIn' }}
                      />
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main two-panel display */}
            <div className="flex items-center gap-4 justify-center min-h-[220px]">
              {/* FIRST panel */}
              <motion.div layout
                className={`flex-1 max-w-[200px] rounded-2xl p-5 flex flex-col items-center gap-3 cursor-pointer transition-all border-2 ${
                  phase === 'completed'
                    ? 'border-green-300 bg-green-50 opacity-60'
                    : phase === 'then'
                    ? 'border-green-300 bg-green-50'
                    : phase === 'done_first'
                    ? 'border-amber-300 bg-amber-50 animate-pulse'
                    : phase === 'first'
                    ? 'border-brand bg-brand-bg/30'
                    : 'border-border bg-surface-secondary/50 hover:border-brand'
                }`}
                onClick={() => {
                  if (phase === 'selecting') startFirst()
                  else if (phase === 'first') completeFirst()
                  else if (phase === 'done_first') completeFirst()
                }}
              >
                <span className="text-5xl">{activeBoard.first_emoji}</span>
                <p className={`text-sm font-black text-center ${
                  phase === 'completed' ? 'text-green-500' : 'text-text-primary'
                }`}>
                  {activeBoard.first_label}
                </p>
                {phase === 'first' && activeBoard.first_minutes && activeBoard.first_minutes > 0 && (
                  <div className="bg-brand text-white text-sm font-black px-3 py-1 rounded-full tabular-nums">
                    {formatTime(firstRemaining)}
                  </div>
                )}
                {phase === 'selecting' && (
                  <span className="text-[10px] font-bold text-text-muted">Tocar para empezar</span>
                )}
                {phase === 'first' && (
                  <span className="text-[10px] font-bold text-amber-600">Tocar al terminar</span>
                )}
                {phase === 'done_first' && (
                  <span className="text-[10px] font-bold text-amber-600 animate-pulse">¡Tocar para continuar!</span>
                )}
                {(phase === 'then' || phase === 'completed') && (
                  <span className="text-[10px] font-bold text-green-600">✅ Listo</span>
                )}
              </motion.div>

              {/* Arrow */}
              <motion.div
                animate={{
                  scale: phase === 'then' || phase === 'completed' ? [1, 1.3, 1] : 1,
                }}
                transition={{ repeat: phase === 'then' ? Infinity : 0, duration: 1 }}
                className="text-3xl shrink-0"
              >
                {phase === 'completed' ? '✅' : phase === 'then' ? '🎉' : '→'}
              </motion.div>

              {/* THEN panel */}
              <motion.div layout
                className={`flex-1 max-w-[200px] rounded-2xl p-5 flex flex-col items-center gap-3 transition-all border-2 ${
                  phase === 'completed'
                    ? 'border-green-300 bg-green-50'
                    : phase === 'then'
                    ? 'border-amber-300 bg-amber-50 cursor-pointer hover:bg-amber-100'
                    : 'border-border bg-surface-secondary/50'
                }`}
                onClick={() => {
                  if (phase === 'then') completeThen()
                }}
              >
                <span className={`text-5xl ${phase === 'selecting' || phase === 'first' || phase === 'done_first' ? 'opacity-30 grayscale' : ''}`}>
                  {activeBoard.then_emoji}
                </span>
                <p className={`text-sm font-black text-center ${
                  phase === 'completed' ? 'text-green-600' : phase === 'then' ? 'text-amber-700' : 'text-text-muted'
                }`}>
                  {activeBoard.then_label}
                </p>
                {phase === 'then' && (
                  <span className="text-[10px] font-bold text-amber-600 animate-pulse">¡Tocar para recibir!</span>
                )}
                {phase === 'completed' && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-[10px] font-bold text-green-600">🎉 ¡Buen trabajo!</motion.span>
                )}
                {(phase === 'selecting' || phase === 'first' || phase === 'done_first') && (
                  <span className="text-[10px] font-bold text-text-muted">Recompensa</span>
                )}
              </motion.div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 justify-center">
            {(phase === 'first' || phase === 'done_first' || phase === 'then') && (
              <Button variant="outline" size="sm" onClick={resetBoard}>🔄 Empezar de nuevo</Button>
            )}
            {phase === 'completed' && (
              <Button size="sm" onClick={resetBoard}>🔄 Hacer otra vez</Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => { if (activeBoard) { setShowEditModal(true) } }}>✏️ Editar</Button>
          </div>
        </>
      ) : boards.length > 0 ? (
        <div className="bg-surface rounded-2xl shadow-md border border-border p-12 text-center">
          <p className="text-body">Selecciona un tablero de la lista arriba o crea uno nuevo.</p>
        </div>
      ) : null}

      {/* New Board Modal */}
      <AnimatePresence>
        {showNewModal && (
          <NewBoardModal
            onSave={createBoard}
            onClose={() => setShowNewModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Edit Board Modal */}
      <AnimatePresence>
        {showEditModal && activeBoard && (
          <EditBoardModal
            board={activeBoard}
            onSave={(data) => updateBoard(activeBoard.id, data)}
            onDelete={() => setConfirmDelete(activeBoard.id)}
            onClose={() => setShowEditModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Confirm delete */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40" onClick={() => setConfirmDelete(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface rounded-2xl shadow-xl w-72 p-5 border border-border text-center">
              <p className="text-sm font-bold text-text-primary mb-4">¿Eliminar este tablero?</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-secondary transition-colors">Cancelar</button>
                <button onClick={() => deleteBoard(confirmDelete)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-colors">Eliminar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function NewBoardModal({ onSave, onClose }: {
  onSave: (data: { title: string; first_label: string; first_emoji: string; first_minutes: number | null; then_label: string; then_emoji: string }) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState('')
  const [firstLabel, setFirstLabel] = useState('')
  const [firstEmoji, setFirstEmoji] = useState('📋')
  const [firstMinutes, setFirstMinutes] = useState('')
  const [thenLabel, setThenLabel] = useState('')
  const [thenEmoji, setThenEmoji] = useState('🎁')
  const [showFirstPicker, setShowFirstPicker] = useState(false)
  const [showThenPicker, setShowThenPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showFirstPicker && !showThenPicker) return
    const onClick = (e: MouseEvent) => { if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) { setShowFirstPicker(false); setShowThenPicker(false) } }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [showFirstPicker, showThenPicker])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstLabel.trim() || !thenLabel.trim()) return
    onSave({
      title: title.trim(),
      first_label: firstLabel.trim(),
      first_emoji: firstEmoji,
      first_minutes: firstMinutes ? Math.min(parseInt(firstMinutes), 120) : null,
      then_label: thenLabel.trim(),
      then_emoji: thenEmoji,
    })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="bg-surface rounded-2xl shadow-xl w-full max-w-sm p-5 border border-border max-h-[85vh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🦕</span>
          <h3 className="heading-section">Nuevo tablero</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">Título (opcional)</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none"
              placeholder="Ej: Rutina mañana" />
          </div>

          {/* FIRST */}
          <div className="bg-brand-bg/20 rounded-xl p-3 border border-brand/20">
            <p className="text-[10px] font-black text-brand uppercase tracking-wider mb-2">Primero</p>
            <div className="flex gap-2 mb-2" ref={pickerRef}>
              <div className="relative">
                <button type="button" onClick={() => { setShowFirstPicker(!showFirstPicker); setShowThenPicker(false) }}
                  className="w-10 h-10 rounded-xl bg-white border-2 border-border text-xl flex items-center justify-center hover:border-brand transition-colors">
                  {firstEmoji}
                </button>
                <AnimatePresence>
                  {showFirstPicker && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      className="absolute top-full left-0 mt-1 bg-white rounded-xl border-2 border-border shadow-lg p-2 w-64 z-10 grid grid-cols-6 gap-1">
                      {EMOJI_OPTIONS.map(e => (
                        <button key={e} type="button" onClick={() => { setFirstEmoji(e); setShowFirstPicker(false) }}
                          className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center hover:bg-surface-secondary transition-colors ${firstEmoji === e ? 'bg-brand-bg ring-2 ring-brand' : ''}`}>{e}</button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <input value={firstLabel} onChange={e => setFirstLabel(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none"
                placeholder="¿Qué tarea?" autoFocus />
            </div>
            <div className="flex items-center gap-2">
              <input type="number" min="1" max="120" value={firstMinutes} onChange={e => setFirstMinutes(e.target.value.replace(/\D/g, ''))}
                className="w-16 px-2 py-1.5 rounded-lg border-2 border-border bg-white text-xs font-bold text-center focus:border-brand focus:outline-none"
                placeholder="Min" />
              <span className="text-[10px] font-bold text-text-muted">minutos (opcional)</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {PRESET_FIRST.map(p => (
                <button key={p.label} type="button" onClick={() => { setFirstEmoji(p.emoji); setFirstLabel(p.label) }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${firstLabel === p.label ? 'bg-brand text-white' : 'bg-white text-text-secondary hover:bg-brand-bg hover:text-brand'}`}>
                  {p.emoji} {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* THEN */}
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
            <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider mb-2">Después</p>
            <div className="flex gap-2" ref={pickerRef}>
              <div className="relative">
                <button type="button" onClick={() => { setShowThenPicker(!showThenPicker); setShowFirstPicker(false) }}
                  className="w-10 h-10 rounded-xl bg-white border-2 border-border text-xl flex items-center justify-center hover:border-amber-400 transition-colors">
                  {thenEmoji}
                </button>
                <AnimatePresence>
                  {showThenPicker && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      className="absolute top-full left-0 mt-1 bg-white rounded-xl border-2 border-border shadow-lg p-2 w-64 z-10 grid grid-cols-6 gap-1">
                      {EMOJI_OPTIONS.map(e => (
                        <button key={e} type="button" onClick={() => { setThenEmoji(e); setShowThenPicker(false) }}
                          className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center hover:bg-surface-secondary transition-colors ${thenEmoji === e ? 'bg-amber-50 ring-2 ring-amber-400' : ''}`}>{e}</button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <input value={thenLabel} onChange={e => setThenLabel(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border-2 border-border bg-white text-sm font-medium focus:border-amber-400 focus:outline-none"
                placeholder="¿Recompensa?" />
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {PRESET_THEN.map(p => (
                <button key={p.label} type="button" onClick={() => { setThenEmoji(p.emoji); setThenLabel(p.label) }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${thenLabel === p.label ? 'bg-amber-400 text-white' : 'bg-white text-text-secondary hover:bg-amber-50 hover:text-amber-700'}`}>
                  {p.emoji} {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-secondary transition-colors border border-border">Cancelar</button>
            <button type="submit" disabled={!firstLabel.trim() || !thenLabel.trim()}
              className="flex-1 py-2 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-dark transition-colors disabled:opacity-50 shadow-sm">Crear</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

function EditBoardModal({ board, onSave, onDelete, onClose }: {
  board: FirstThenBoard
  onSave: (data: Partial<FirstThenBoard>) => void
  onDelete: () => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(board.title)
  const [firstLabel, setFirstLabel] = useState(board.first_label)
  const [firstEmoji, setFirstEmoji] = useState(board.first_emoji)
  const [firstMinutes, setFirstMinutes] = useState(board.first_minutes ? String(board.first_minutes) : '')
  const [thenLabel, setThenLabel] = useState(board.then_label)
  const [thenEmoji, setThenEmoji] = useState(board.then_emoji)
  const [showFirstPicker, setShowFirstPicker] = useState(false)
  const [showThenPicker, setShowThenPicker] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showFirstPicker && !showThenPicker) return
    const onClick = (e: MouseEvent) => { if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) { setShowFirstPicker(false); setShowThenPicker(false) } }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [showFirstPicker, showThenPicker])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstLabel.trim() || !thenLabel.trim()) return
    onSave({
      title: title.trim(),
      first_label: firstLabel.trim(),
      first_emoji: firstEmoji,
      first_minutes: firstMinutes ? Math.min(parseInt(firstMinutes), 120) : null,
      then_label: thenLabel.trim(),
      then_emoji: thenEmoji,
    })
  }

  if (confirmingDelete) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-surface rounded-2xl shadow-xl w-72 p-5 border border-border text-center">
          <p className="text-sm font-bold text-text-primary mb-4">¿Eliminar este tablero?</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => setConfirmingDelete(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-secondary transition-colors">Cancelar</button>
            <button onClick={() => { setConfirmingDelete(false); onDelete() }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-colors">Eliminar</button>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="bg-surface rounded-2xl shadow-xl w-full max-w-sm p-5 border border-border max-h-[85vh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🦕</span>
          <h3 className="heading-section">Editar tablero</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">Título (opcional)</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none"
              placeholder="Ej: Rutina mañana" />
          </div>

          <div className="bg-brand-bg/20 rounded-xl p-3 border border-brand/20">
            <p className="text-[10px] font-black text-brand uppercase tracking-wider mb-2">Primero</p>
            <div className="flex gap-2 mb-2" ref={pickerRef}>
              <div className="relative">
                <button type="button" onClick={() => { setShowFirstPicker(!showFirstPicker); setShowThenPicker(false) }}
                  className="w-10 h-10 rounded-xl bg-white border-2 border-border text-xl flex items-center justify-center hover:border-brand transition-colors">{firstEmoji}</button>
                <AnimatePresence>
                  {showFirstPicker && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      className="absolute top-full left-0 mt-1 bg-white rounded-xl border-2 border-border shadow-lg p-2 w-64 z-10 grid grid-cols-6 gap-1">
                      {EMOJI_OPTIONS.map(e => (
                        <button key={e} type="button" onClick={() => { setFirstEmoji(e); setShowFirstPicker(false) }}
                          className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center hover:bg-surface-secondary transition-colors ${firstEmoji === e ? 'bg-brand-bg ring-2 ring-brand' : ''}`}>{e}</button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <input value={firstLabel} onChange={e => setFirstLabel(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none"
                placeholder="¿Qué tarea?" />
            </div>
            <div className="flex items-center gap-2">
              <input type="number" min="1" max="120" value={firstMinutes} onChange={e => setFirstMinutes(e.target.value.replace(/\D/g, ''))}
                className="w-16 px-2 py-1.5 rounded-lg border-2 border-border bg-white text-xs font-bold text-center focus:border-brand focus:outline-none"
                placeholder="Min" />
              <span className="text-[10px] font-bold text-text-muted">minutos (opcional)</span>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
            <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider mb-2">Después</p>
            <div className="flex gap-2" ref={pickerRef}>
              <div className="relative">
                <button type="button" onClick={() => { setShowThenPicker(!showThenPicker); setShowFirstPicker(false) }}
                  className="w-10 h-10 rounded-xl bg-white border-2 border-border text-xl flex items-center justify-center hover:border-amber-400 transition-colors">{thenEmoji}</button>
                <AnimatePresence>
                  {showThenPicker && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      className="absolute top-full left-0 mt-1 bg-white rounded-xl border-2 border-border shadow-lg p-2 w-64 z-10 grid grid-cols-6 gap-1">
                      {EMOJI_OPTIONS.map(e => (
                        <button key={e} type="button" onClick={() => { setThenEmoji(e); setShowThenPicker(false) }}
                          className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center hover:bg-surface-secondary transition-colors ${thenEmoji === e ? 'bg-amber-50 ring-2 ring-amber-400' : ''}`}>{e}</button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <input value={thenLabel} onChange={e => setThenLabel(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border-2 border-border bg-white text-sm font-medium focus:border-amber-400 focus:outline-none"
                placeholder="¿Recompensa?" />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onDelete}
              className="px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors">Eliminar</button>
            <div className="flex-1" />
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-secondary transition-colors border border-border">Cancelar</button>
            <button type="submit" disabled={!firstLabel.trim() || !thenLabel.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-dark transition-colors disabled:opacity-50 shadow-sm">Guardar</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default PrimeroDespuesPage
