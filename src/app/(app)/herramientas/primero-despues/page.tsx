'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useChildren } from '@/lib/hooks/useData'
import { playSound } from '@/lib/sounds'
import type { FirstThenBoard, FirstThenSession } from '@/types'

function speakText(text: string) {
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'es-ES'
    u.rate = 0.85
    window.speechSynthesis.speak(u)
  } catch {}
}

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
  const { children, loading: childrenLoading } = useChildren()
  const child = children[0]

  const [boards, setBoards] = useState<FirstThenBoard[]>([])
  const [filteredBoards, setFilteredBoards] = useState<FirstThenBoard[]>([])
  const [activeBoard, setActiveBoard] = useState<FirstThenBoard | null>(null)
  const [phase, setPhase] = useState<BoardPhase>('selecting')
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [firstRemaining, setFirstRemaining] = useState(0)
  const [thenRemaining, setThenRemaining] = useState(0)
  const [showNewModal, setShowNewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showTemplatesModal, setShowTemplatesModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sessions, setSessions] = useState<FirstThenSession[]>([])
  const [boardStats, setBoardStats] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)
  const [showFullscreenHint, setShowFullscreenHint] = useState(false)

  const tickRef = useRef(0)
  const startRef = useRef(0)
  const remainingRef = useRef(0)
  const thenStartRef = useRef(0)
  const thenTickRef = useRef(0)
  const thenRemainingRef = useRef(0)

  const fetchBoards = useCallback(async () => {
    if (!child?.id) return
    setErrorMsg(null)
    try {
      const [boardsRes, sessionsRes] = await Promise.all([
        fetch(`/api/primero-despues?childId=${child.id}`),
        fetch(`/api/primero-despues/sessions?childId=${child.id}`),
      ])
      const boardsData = await boardsRes.json()
      if (boardsData.error) throw new Error(boardsData.error)
      const sessionsData = await sessionsRes.json()
      setBoards(boardsData.boards)
      setFilteredBoards(boardsData.boards)
      setSessions(sessionsData.sessions ?? [])
      const stats: Record<string, number> = {}
      for (const s of (sessionsData.sessions ?? [])) {
        stats[s.board_id] = (stats[s.board_id] || 0) + 1
      }
      setBoardStats(stats)
    } catch {
      setErrorMsg('Error al cargar tableros')
    } finally {
      setLoading(false)
    }
  }, [child?.id])

  useEffect(() => { fetchBoards() }, [fetchBoards])

  useEffect(() => {
    if (!childrenLoading && !child) setLoading(false)
  }, [childrenLoading, child])

  useEffect(() => {
    return () => { cancelAnimationFrame(tickRef.current); cancelAnimationFrame(thenTickRef.current) }
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBoards(boards)
    } else {
      const q = searchQuery.toLowerCase()
      setFilteredBoards(boards.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.first_label.toLowerCase().includes(q) ||
        b.then_label.toLowerCase().includes(q)
      ))
    }
  }, [searchQuery, boards])

  const tick = useCallback(() => {
    const elapsed = Math.floor((Date.now() - startRef.current) / 1000)
    const next = Math.max(remainingRef.current - elapsed, 0)
    if (next <= 0) {
      remainingRef.current = 0
      setFirstRemaining(0)
      setPhase('done_first')
      if (soundEnabled) playSound('xp')
      return
    }
    setFirstRemaining(next)
    tickRef.current = requestAnimationFrame(tick)
  }, [soundEnabled])

  const thenTick = useCallback(() => {
    const elapsed = Math.floor((Date.now() - thenStartRef.current) / 1000)
    const next = Math.max(thenRemainingRef.current - elapsed, 0)
    if (next <= 0) {
      thenRemainingRef.current = 0
      setThenRemaining(0)
      setPhase('completed')
      setShowConfetti(true)
      if (soundEnabled) playSound('celebration')
      setTimeout(() => setShowConfetti(false), 3000)
      return
    }
    setThenRemaining(next)
    thenTickRef.current = requestAnimationFrame(thenTick)
  }, [soundEnabled])

  const startFirst = () => {
    if (!activeBoard) return
    const mins = activeBoard.first_minutes
    if (mins && mins > 0) {
      const secs = mins * 60
      remainingRef.current = secs
      setFirstRemaining(secs)
      startRef.current = Date.now()
      tickRef.current = requestAnimationFrame(tick)
    }
    setPhase('first')
    if (ttsEnabled) speakText(`Primero ${activeBoard.first_label}`)
  }

  const completeFirst = () => {
    cancelAnimationFrame(tickRef.current)
    setFirstRemaining(0)
    setPhase('then')
    if (ttsEnabled) speakText(`¡Muy bien! Ahora ${activeBoard?.then_label ?? 'la recompensa'}`)
    if (activeBoard?.then_minutes && activeBoard.then_minutes > 0) {
      const secs = activeBoard.then_minutes * 60
      thenRemainingRef.current = secs
      setThenRemaining(secs)
      thenStartRef.current = Date.now()
      thenTickRef.current = requestAnimationFrame(thenTick)
    }
  }

  const completeThen = () => {
    cancelAnimationFrame(thenTickRef.current)
    setThenRemaining(0)
    setPhase('completed')
    setShowConfetti(true)
    if (soundEnabled) playSound('celebration')
    if (ttsEnabled) speakText('¡Buen trabajo!')
    setTimeout(() => setShowConfetti(false), 3000)
    if (activeBoard && child?.id) {
      fetch('/api/primero-despues/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId: activeBoard.id, childId: child.id }),
      }).then(() => fetchBoards())
    }
  }

  const resetBoard = () => {
    cancelAnimationFrame(tickRef.current)
    cancelAnimationFrame(thenTickRef.current)
    setPhase('selecting')
    setFirstRemaining(0)
    setThenRemaining(0)
    setShowConfetti(false)
  }

  const selectBoard = (board: FirstThenBoard) => {
    setActiveBoard(board)
    setPhase('selecting')
    setFirstRemaining(0)
    setThenRemaining(0)
    setShowConfetti(false)
  }

  const createBoard = async (data: {
    title: string; first_label: string; first_emoji: string; first_minutes: number | null
    then_label: string; then_emoji: string; then_minutes: number | null
  }) => {
    if (!child?.id) return
    setErrorMsg(null)
    setSaving(true)
    try {
      const res = await fetch('/api/primero-despues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId: child.id, ...data }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Error ${res.status}`)
      }
      const result = await res.json()
      if (result.error) throw new Error(result.error)
      setBoards(prev => [result, ...prev])
      setActiveBoard(result)
      setPhase('selecting')
      setShowNewModal(false)
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Error al crear tablero')
    } finally {
      setSaving(false)
    }
  }

  const updateBoard = async (boardId: string, data: Partial<FirstThenBoard>) => {
    if (!child?.id) return
    setErrorMsg(null)
    setSaving(true)
    try {
      const res = await fetch('/api/primero-despues', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId, childId: child.id, ...data }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Error ${res.status}`)
      }
      const result = await res.json()
      if (result.error) throw new Error(result.error)
      setBoards(prev => prev.map(b => b.id === boardId ? result : b))
      if (activeBoard?.id === boardId) setActiveBoard(result)
      setShowEditModal(false)
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Error al guardar tablero')
    } finally {
      setSaving(false)
    }
  }

  const deleteBoard = async (boardId: string) => {
    if (!child?.id) return
    setErrorMsg(null)
    try {
      const res = await fetch(`/api/primero-despues?boardId=${boardId}&childId=${child.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Error ${res.status}`)
      }
      setBoards(prev => prev.filter(b => b.id !== boardId))
      if (activeBoard?.id === boardId) { setActiveBoard(null); setPhase('selecting') }
      setConfirmDelete(null)
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Error al eliminar tablero')
      setConfirmDelete(null)
    }
  }

  const handleReorder = async (reordered: FirstThenBoard[]) => {
    const prevBoards = boards
    const prevFiltered = filteredBoards
    setFilteredBoards(reordered)
    const updated = reordered.map((b, i) => ({ ...b, sort_order: i }))
    const updatedMap = new Map(updated.map(b => [b.id, b]))
    setBoards(prev => prev.map(b => updatedMap.get(b.id) ?? b))
    if (activeBoard) setActiveBoard(updatedMap.get(activeBoard.id) ?? activeBoard)
    try {
      const res = await fetch('/api/primero-despues', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId: child?.id, reorder: true, boards: updated.map(b => ({ id: b.id, sort_order: b.sort_order })) }),
      })
      if (!res.ok) throw new Error('Error al reordenar')
    } catch {
      setBoards(prevBoards)
      setFilteredBoards(prevFiltered)
      setErrorMsg('Error al reordenar tableros')
    }
  }

  const toggleFullscreen = () => {
    if (fullscreen) {
      setFullscreen(false)
      window.dispatchEvent(new CustomEvent('pd-chrome', { detail: false }))
      if (document.fullscreenElement) document.exitFullscreen()
    } else {
      setFullscreen(true)
      window.dispatchEvent(new CustomEvent('pd-chrome', { detail: true }))
      document.documentElement.requestFullscreen().catch(() => {})
      setShowFullscreenHint(true)
      setTimeout(() => setShowFullscreenHint(false), 3000)
    }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreen) { toggleFullscreen(); return }
      if (e.key === 'Escape' && phase !== 'selecting') { resetBoard(); return }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (!activeBoard) return
        if (phase === 'selecting') startFirst()
        else if (phase === 'first') completeFirst()
        else if (phase === 'done_first') completeFirst()
        else if (phase === 'then') completeThen()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, activeBoard, fullscreen])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  const todayCount = sessions.filter(s =>
    new Date(s.completed_at).toDateString() === new Date().toDateString()
  ).length

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } } as const
  const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 28 } } }

  const favoriteBoards = boards.filter(b => b.is_favorite)
  const recentBoards = [...boards].filter(b => b.last_used_at).sort((a, b) => new Date(b.last_used_at!).getTime() - new Date(a.last_used_at!).getTime()).slice(0, 5)

  const quickActions = [
    { title: 'Mis Tableros', desc: 'Ver y gestionar tableros', icon: '📚', gradient: 'from-blue-100 to-cyan-50', iconBg: 'bg-blue-100', action: () => document.getElementById('pd-boards')?.scrollIntoView({ behavior: 'smooth' }) },
    { title: 'Crear Tablero', desc: 'Diseña un tablero nuevo', icon: '✨', gradient: 'from-purple-100 to-violet-50', iconBg: 'bg-purple-100', action: () => setShowNewModal(true) },
    { title: 'Plantillas', desc: 'Usa una plantilla rápida', icon: '📋', gradient: 'from-orange-100 to-amber-50', iconBg: 'bg-orange-100', action: () => setShowTemplatesModal(true) },
  ]

  const quickTemplates = [
    { title: 'Rutina mañana', first: { emoji: '🪥', label: 'Dientes' }, then: { emoji: '🧩', label: 'Jugar' }, firstMin: 3 },
    { title: 'Tarea escolar', first: { emoji: '📚', label: 'Tarea' }, then: { emoji: '📱', label: 'Pantalla' }, firstMin: 15 },
    { title: 'Baño', first: { emoji: '🛁', label: 'Baño' }, then: { emoji: '🍦', label: 'Helado' }, firstMin: 10 },
    { title: 'Ordenar', first: { emoji: '🧹', label: 'Ordenar' }, then: { emoji: '🎮', label: 'Videojuego' }, firstMin: 5 },
  ]

  const toggleFavorite = async (boardId: string, current: boolean) => {
    setBoards(prev => prev.map(b => b.id === boardId ? { ...b, is_favorite: !current } : b))
    if (activeBoard?.id === boardId) setActiveBoard(prev => prev ? { ...prev, is_favorite: !current } : null)
    try {
      const res = await fetch('/api/primero-despues', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId, childId: child?.id, is_favorite: !current }),
      })
      if (!res.ok) throw new Error('Error al actualizar favorito')
    } catch {
      setBoards(prev => prev.map(b => b.id === boardId ? { ...b, is_favorite: current } : b))
      if (activeBoard?.id === boardId) setActiveBoard(prev => prev ? { ...prev, is_favorite: current } : null)
      setErrorMsg('Error al actualizar favorito')
    }
  }

  return (
    <motion.div className="flex flex-col gap-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Atrás</Button>
        <div className="flex-1">
          <h1 className="heading-page">Primero - Después</h1>
          <p className="text-body">Organiza tareas con una recompensa al final</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-9 h-9 rounded-xl flex items-center justify-center border-2 border-border text-base hover:border-brand transition-all opacity-60 hover:opacity-100"
            title={soundEnabled ? 'Silenciar' : 'Activar sonido'}>{soundEnabled ? '🔊' : '🔇'}</button>
          <button onClick={() => setTtsEnabled(!ttsEnabled)}
            className="w-9 h-9 rounded-xl flex items-center justify-center border-2 border-border text-base hover:border-brand transition-all opacity-60 hover:opacity-100"
            title={ttsEnabled ? 'Silenciar voz' : 'Activar voz'}>{ttsEnabled ? '🗣️' : '🚫'}</button>
          <button onClick={toggleFullscreen}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 text-base transition-all ${fullscreen ? 'border-brand bg-brand/10 text-brand' : 'border-border opacity-60 hover:opacity-100 hover:border-brand'}`}
            title={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}>⛶</button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showFullscreenHint && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-brand/10 border border-brand/30 rounded-xl px-4 py-2.5 text-xs font-bold text-brand text-center">
            Presiona Esc para salir de pantalla completa · Espacio para avanzar fases
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errorMsg && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <span className="text-red-500 text-sm">⚠️</span>
            <p className="text-xs font-bold text-red-700 flex-1">{errorMsg}</p>
            <button onClick={() => setErrorMsg(null)} className="text-xs font-bold text-red-500 hover:text-red-700">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot + tagline */}
      <motion.div variants={itemVariants} className="flex flex-col items-center gap-2 text-center py-1">
        <img src="/assets/dino-primero-despues.png" alt="Dino" width={120} height={120} className="object-contain" />
        <p className="text-base font-bold text-text-primary">¡Primero la tarea, luego la recompensa!</p>
      </motion.div>

      {/* Stats bar */}
      {activeBoard && (
        <motion.div variants={itemVariants} className="flex items-center gap-2 text-[11px] font-bold">
          <span className="bg-brand/10 text-brand px-2.5 py-1 rounded-lg border border-brand/20">Hoy: {todayCount} completados</span>
          {boardStats[activeBoard.id] > 0 && (
            <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-200">Este tablero: {boardStats[activeBoard.id]} veces</span>
          )}
        </motion.div>
      )}

      {/* Quick Access */}
      <motion.div variants={itemVariants}>
        <h2 className="text-sm font-extrabold text-text-secondary mb-3 tracking-wide">ACCESO RÁPIDO</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickActions.map((action, i) => (
            <motion.div key={action.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <button onClick={action.action} className="w-full text-left">
                <div className={`relative bg-gradient-to-br ${action.gradient} rounded-2xl shadow-md p-4 overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300 active:scale-[0.98] min-h-[120px] flex flex-col items-center justify-center text-center w-full`}>
                  <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full ${action.iconBg} opacity-40 blur-xl`} />
                  <div className="w-14 h-14 rounded-xl bg-white/80 flex items-center justify-center text-2xl shadow-sm mb-2">{action.icon}</div>
                  <h3 className="text-xs font-extrabold text-text-primary mb-0.5">{action.title}</h3>
                  <p className="text-[10px] font-bold text-text-secondary leading-tight">{action.desc}</p>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Loading */}
      {loading && (
        <motion.div variants={itemVariants} className="rounded-2xl bg-surface border border-border p-16 flex items-center justify-center shadow-sm">
          <div className="w-7 h-7 border-[3px] border-brand border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && boards.length === 0 && (
        <motion.div variants={itemVariants}>
          <Card variant="default" padding="lg" className="text-center">
            <div className="flex flex-col items-center gap-4">
              <div>
                <h2 className="heading-section text-lg mb-1">Crea tu primer tablero</h2>
                <p className="text-body text-sm max-w-md mx-auto">Un tablero Primero-Después ayuda a tu hijo a entender qué tarea debe hacer y qué recompensa le espera al terminar.</p>
              </div>
              <div className="bg-white/60 rounded-xl px-4 py-2 text-xs font-bold text-text-muted border border-brand/20">
                Ejemplo: &ldquo;Primero 🪥 Dientes, luego 🧩 Jugar&rdquo;
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setShowNewModal(true)}>✨ Crear tablero</Button>
                <Button variant="outline" onClick={() => setShowTemplatesModal(true)}>📋 Ver plantillas</Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Favorites */}
      {!loading && favoriteBoards.length > 0 && (
        <motion.div variants={itemVariants}>
          <h2 className="heading-section flex items-center gap-2 mb-3">⭐ Favoritos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {favoriteBoards.map(board => (
              <Card key={board.id} variant="bordered" padding="md" className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => selectBoard(board)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="heading-card mb-1 truncate">{board.first_emoji} → {board.then_emoji}</h3>
                    {board.title && <p className="text-meta text-xs truncate">{board.title}</p>}
                    <div className="flex gap-1.5 mt-2">
                      <span className="text-badge text-brand bg-brand-bg px-2 py-0.5 rounded-full">{board.first_label}</span>
                      <span className="text-badge text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">{board.then_label}</span>
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); toggleFavorite(board.id, true) }} className="text-xl shrink-0 ml-2">⭐</button>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent */}
      {!loading && recentBoards.length > 0 && (
        <motion.div variants={itemVariants}>
          <h2 className="heading-section mb-3">📌 Recientes</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentBoards.map(board => (
              <Card key={board.id} variant="default" padding="sm" className="min-w-[160px] hover:shadow-md transition-shadow cursor-pointer" onClick={() => selectBoard(board)}>
                <h3 className="heading-card mb-1 truncate text-center">{board.first_emoji} → {board.then_emoji}</h3>
                <div className="flex justify-center gap-1">
                  <span className="text-badge text-text-muted bg-surface-secondary px-2 py-0.5 rounded-full text-[10px]">{boardStats[board.id] || 0} usos</span>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* All boards */}
      {!loading && boards.length > 0 && (
        <motion.div variants={itemVariants} id="pd-boards">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="heading-section flex-1">📋 Mis tableros</h2>
            <span className="text-[10px] font-bold text-text-muted">arrastra para reordenar</span>
          </div>
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-40">🔍</span>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-border bg-white text-xs font-bold focus:border-brand focus:outline-none transition-colors"
                placeholder="Buscar tableros..." />
            </div>
            <Button onClick={() => setShowNewModal(true)}>+ Nuevo</Button>
          </div>
          <Reorder.Group axis="x" values={filteredBoards} onReorder={handleReorder} className="flex gap-2 overflow-x-auto pb-1.5">
            {filteredBoards.map((board, i) => (
              <Reorder.Item key={board.id} value={board}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, type: 'spring' as const, stiffness: 300, damping: 28 }}
                onClick={() => selectBoard(board)}
                className={`shrink-0 cursor-grab active:cursor-grabbing px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border-2 select-none ${activeBoard?.id === board.id ? 'border-brand bg-brand text-white shadow-sm' : 'border-border bg-surface text-text-secondary hover:border-brand hover:text-brand hover:shadow-sm active:scale-[0.97]'}`}>
                <span className="text-[10px] opacity-40 mr-1">⠿</span>
                {board.first_emoji} → {board.then_emoji}
                {board.title && <span className="ml-1 opacity-60">· {board.title}</span>}
                {boardStats[board.id] > 0 && <span className="ml-1.5 text-[10px] bg-white/30 px-1.5 py-0.5 rounded-full">{boardStats[board.id]}</span>}
              </Reorder.Item>
            ))}
          </Reorder.Group>
          <div className="text-[10px] font-bold text-text-muted flex gap-3 mt-1">
            <span>⌨️ <kbd className="px-1 py-0.5 bg-surface-secondary rounded text-[9px]">Espacio</kbd> avanzar</span>
            <span><kbd className="px-1 py-0.5 bg-surface-secondary rounded text-[9px]">Esc</kbd> reiniciar</span>
            <span><kbd className="px-1 py-0.5 bg-surface-secondary rounded text-[9px]">⛶</kbd> pantalla completa</span>
          </div>
        </motion.div>
      )}

      {/* Active board panel */}
      <AnimatePresence>
        {activeBoard && (
          <motion.div key={activeBoard.id} variants={itemVariants} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="bg-white rounded-2xl shadow-sm border-2 border-border p-6">
              {activeBoard.title && <p className="text-center text-[11px] font-bold text-text-muted uppercase tracking-wider mb-4">{activeBoard.title}</p>}
              <AnimatePresence>
                {showConfetti && (
                  <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                    {Array.from({ length: 20 }).map((_, i) => {
                      const x = Math.random() * 100; const drift = (Math.random() - 0.5) * 150; const fall = 200 + Math.random() * 400
                      const size = 6 + Math.random() * 6; const colors = ['#44B39D', '#F59E0B', '#8B5CF6', '#EF4444', '#6BCB77', '#4FC3F7']
                      return (
                        <motion.div key={i} className="absolute rounded-sm"
                          style={{ left: `${x}%`, top: -15, width: size, height: size * 0.6, backgroundColor: colors[i % colors.length] }}
                          initial={{ y: -15, rotate: 0, opacity: 1 }}
                          animate={{ y: fall, x: drift, rotate: 720, opacity: [1, 0.8, 0] }}
                          transition={{ duration: 1.5 + Math.random(), delay: Math.random() * 0.5, ease: 'easeIn' }} />
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex items-center gap-5 justify-center min-h-[240px]">
                <motion.div layout
                  className={`flex-1 max-w-[220px] rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all border-[3px] ${phase === 'completed' ? 'border-green-300 bg-green-50 opacity-60' : phase === 'then' ? 'border-green-300 bg-green-50' : phase === 'done_first' ? 'border-amber-300 bg-amber-50 animate-pulse' : phase === 'first' ? 'border-brand bg-brand-bg/20 shadow-sm' : 'border-border bg-surface-secondary/40 hover:border-brand hover:shadow-sm active:scale-[0.98]'}`}
                  onClick={() => { if (phase === 'selecting') startFirst(); else if (phase === 'first') completeFirst(); else if (phase === 'done_first') completeFirst() }}>
                  <span className="text-6xl">{activeBoard.first_emoji}</span>
                  <p className={`text-sm font-black text-center ${phase === 'completed' ? 'text-green-500' : 'text-text-primary'}`}>{activeBoard.first_label}</p>
                  {phase === 'first' && activeBoard.first_minutes && activeBoard.first_minutes > 0 && <div className="bg-brand text-white text-sm font-black px-3 py-1 rounded-full tabular-nums">{formatTime(firstRemaining)}</div>}
                  {phase === 'selecting' && <span className="text-[10px] font-bold text-text-muted">Tocar para empezar</span>}
                  {phase === 'first' && <span className="text-[10px] font-bold text-amber-600">Tocar al terminar</span>}
                  {phase === 'done_first' && <span className="text-[10px] font-bold text-amber-600 animate-pulse">¡Tocar para continuar!</span>}
                  {(phase === 'then' || phase === 'completed') && <span className="text-[10px] font-bold text-green-600">✅ Listo</span>}
                </motion.div>
                <motion.div animate={{ scale: phase === 'then' || phase === 'completed' ? [1, 1.3, 1] : 1 }} transition={{ repeat: phase === 'then' ? Infinity : 0, duration: 1 }} className="text-3xl shrink-0">
                  {phase === 'completed' ? '✅' : phase === 'then' ? '🎉' : '→'}
                </motion.div>
                <motion.div layout
                  className={`flex-1 max-w-[220px] rounded-2xl p-6 flex flex-col items-center gap-3 transition-all border-[3px] ${phase === 'completed' ? 'border-green-300 bg-green-50' : phase === 'then' ? 'border-amber-300 bg-amber-50 cursor-pointer hover:bg-amber-100 active:scale-[0.98]' : 'border-border bg-surface-secondary/40'}`}
                  onClick={() => { if (phase === 'then') completeThen() }}>
                  <span className={`text-6xl ${phase === 'selecting' || phase === 'first' || phase === 'done_first' ? 'opacity-30 grayscale' : ''}`}>{activeBoard.then_emoji}</span>
                  <p className={`text-sm font-black text-center ${phase === 'completed' ? 'text-green-600' : phase === 'then' ? 'text-amber-700' : 'text-text-muted'}`}>{activeBoard.then_label}</p>
                  {phase === 'then' && activeBoard.then_minutes && activeBoard.then_minutes > 0 && <div className="bg-amber-400 text-white text-sm font-black px-3 py-1 rounded-full tabular-nums">{formatTime(thenRemaining)}</div>}
                  {phase === 'then' && <span className="text-[10px] font-bold text-amber-600 animate-pulse">¡Tocar para recibir!</span>}
                  {phase === 'completed' && <motion.span initial={{ scale: 0 }} animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-[10px] font-bold text-green-600">🎉 ¡Buen trabajo!</motion.span>}
                  {(phase === 'selecting' || phase === 'first' || phase === 'done_first') && <span className="text-[10px] font-bold text-text-muted">Recompensa</span>}
                </motion.div>
              </div>
              <div className="flex items-center justify-center gap-2 mt-4">
                <button onClick={() => toggleFavorite(activeBoard.id, activeBoard.is_favorite)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border-2 ${activeBoard.is_favorite ? 'bg-amber-50 border-amber-200 text-amber-700' : 'border-border text-text-secondary hover:border-amber-300 hover:text-amber-600'}`}>
                  {activeBoard.is_favorite ? '⭐ Favorito' : '☆ Favorito'}
                </button>
              </div>
            </div>
            <div className="flex gap-2 justify-center mt-3">
              {(phase === 'first' || phase === 'done_first' || phase === 'then') && <Button variant="outline" size="sm" onClick={resetBoard}>🔄 Empezar de nuevo</Button>}
              {phase === 'completed' && <Button size="sm" onClick={resetBoard}>🔄 Hacer otra vez</Button>}
              <Button variant="ghost" size="sm" onClick={() => { if (activeBoard) setShowEditModal(true) }}>✏️ Editar</Button>
              <button onClick={() => { if (activeBoard) setConfirmDelete(activeBoard.id) }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors border-2 border-transparent hover:border-red-200">🗑 Eliminar</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info card */}
      <motion.div variants={itemVariants}>
        <Card variant="default" padding="md" className="bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <h3 className="heading-card mb-1">Consejo de uso</h3>
              <p className="text-meta leading-relaxed">
                El tablero Primero-Después usa la técnica de economía de fichas: el niño completa una tarea y recibe una recompensa.
                Úsalo en sesiones cortas y celebra cada logro para reforzar el comportamiento positivo.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Templates modal */}
      <AnimatePresence>
        {showTemplatesModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40" onClick={() => setShowTemplatesModal(false)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface rounded-2xl shadow-xl w-full max-w-sm p-5 border border-border">
              <h3 className="heading-section mb-3">📋 Plantillas rápidas</h3>
              <div className="space-y-2">
                {quickTemplates.map(t => (
                  <button key={t.title} onClick={() => {
                    setShowTemplatesModal(false)
                    createBoard({ title: t.title, first_label: t.first.label, first_emoji: t.first.emoji, first_minutes: t.firstMin, then_label: t.then.label, then_emoji: t.then.emoji, then_minutes: null })
                  }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-border hover:border-brand hover:bg-brand-bg/20 transition-all text-left active:scale-[0.98]">
                    <span className="text-2xl shrink-0">{t.first.emoji}→{t.then.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-text-primary">{t.title}</p>
                      <p className="text-[10px] font-bold text-text-muted truncate">Primero {t.first.label} · Luego {t.then.label} · {t.firstMin} min</p>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowTemplatesModal(false)}
                className="w-full mt-3 py-2.5 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-secondary transition-colors border border-border">Cancelar</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New board modal */}
      <AnimatePresence>
        {showNewModal && <NewBoardModal saving={saving} onSave={createBoard} onClose={() => setShowNewModal(false)} />}
      </AnimatePresence>

      {/* Edit board modal */}
      <AnimatePresence>
        {showEditModal && activeBoard && (
          <EditBoardModal board={activeBoard} saving={saving} onSave={(data) => updateBoard(activeBoard.id, data)}
            onDelete={() => setConfirmDelete(activeBoard.id)} onClose={() => setShowEditModal(false)} />
        )}
      </AnimatePresence>

      {/* Confirm delete */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40" onClick={() => setConfirmDelete(null)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
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
    </motion.div>
  )
}

function NewBoardModal({ saving, onSave, onClose }: {
  saving: boolean
  onSave: (data: { title: string; first_label: string; first_emoji: string; first_minutes: number | null; then_label: string; then_emoji: string; then_minutes: number | null }) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState('')
  const [firstLabel, setFirstLabel] = useState('')
  const [firstEmoji, setFirstEmoji] = useState('📋')
  const [firstMinutes, setFirstMinutes] = useState('')
  const [thenLabel, setThenLabel] = useState('')
  const [thenEmoji, setThenEmoji] = useState('🎁')
  const [thenMinutes, setThenMinutes] = useState('')
  const [showFirstPicker, setShowFirstPicker] = useState(false)
  const [showThenPicker, setShowThenPicker] = useState(false)
  const firstPickerRef = useRef<HTMLDivElement>(null)
  const thenPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showFirstPicker && !showThenPicker) return
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (showFirstPicker && firstPickerRef.current && !firstPickerRef.current.contains(target)) setShowFirstPicker(false)
      if (showThenPicker && thenPickerRef.current && !thenPickerRef.current.contains(target)) setShowThenPicker(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [showFirstPicker, showThenPicker])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstLabel.trim() || !thenLabel.trim()) return
    onSave({
      title: title.trim(), first_label: firstLabel.trim(), first_emoji: firstEmoji,
      first_minutes: firstMinutes ? Math.min(parseInt(firstMinutes), 120) : null,
      then_label: thenLabel.trim(), then_emoji: thenEmoji,
      then_minutes: thenMinutes ? Math.min(parseInt(thenMinutes), 120) : null,
    })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.92, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.92, y: 10, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-sm max-h-[85vh] overflow-y-auto rounded-2xl shadow-xl border border-white/80"
        style={{ background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)' }}>
        <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.2) 100%)' }} />
        <div className="relative z-10 p-5">
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
            <div className="bg-brand-bg/20 rounded-xl p-3 border border-brand/20">
              <p className="text-[10px] font-black text-brand uppercase tracking-wider mb-2">Primero</p>
              <div className="flex gap-2 mb-2" ref={firstPickerRef}>
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
                  placeholder="¿Qué tarea?" autoFocus />
              </div>
              <div className="flex items-center gap-2">
                <input type="number" min="1" max="120" value={firstMinutes} onChange={e => setFirstMinutes(e.target.value.replace(/\D/g, ''))}
                  className="w-16 px-2 py-1.5 rounded-lg border-2 border-border bg-white text-xs font-bold text-center focus:border-brand focus:outline-none" placeholder="Min" />
                <span className="text-[10px] font-bold text-text-muted">minutos (opcional)</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {PRESET_FIRST.map(p => (
                  <button key={p.label} type="button" onClick={() => { setFirstEmoji(p.emoji); setFirstLabel(p.label) }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${firstLabel === p.label ? 'bg-brand text-white' : 'bg-white text-text-secondary hover:bg-brand-bg hover:text-brand'}`}>
                    {p.emoji} {p.label}</button>
                ))}
              </div>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
              <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider mb-2">Después</p>
              <div className="flex gap-2 mb-2" ref={thenPickerRef}>
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
              <div className="flex items-center gap-2 mt-2">
                <input type="number" min="1" max="120" value={thenMinutes} onChange={e => setThenMinutes(e.target.value.replace(/\D/g, ''))}
                  className="w-16 px-2 py-1.5 rounded-lg border-2 border-border bg-white text-xs font-bold text-center focus:border-amber-400 focus:outline-none" placeholder="Min" />
                <span className="text-[10px] font-bold text-text-muted">minutos (opcional)</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {PRESET_THEN.map(p => (
                  <button key={p.label} type="button" onClick={() => { setThenEmoji(p.emoji); setThenLabel(p.label) }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${thenLabel === p.label ? 'bg-amber-400 text-white' : 'bg-white text-text-secondary hover:bg-amber-50 hover:text-amber-700'}`}>
                    {p.emoji} {p.label}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-secondary transition-colors border border-border">Cancelar</button>
              <button type="submit" disabled={!firstLabel.trim() || !thenLabel.trim() || saving}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-dark transition-colors disabled:opacity-50 shadow-sm">{saving ? 'Guardando...' : 'Crear'}</button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}

function EditBoardModal({ board, saving, onSave, onDelete, onClose }: {
  board: FirstThenBoard; saving: boolean; onSave: (data: Partial<FirstThenBoard>) => void; onDelete: () => void; onClose: () => void
}) {
  const [title, setTitle] = useState(board.title)
  const [firstLabel, setFirstLabel] = useState(board.first_label)
  const [firstEmoji, setFirstEmoji] = useState(board.first_emoji)
  const [firstMinutes, setFirstMinutes] = useState(board.first_minutes ? String(board.first_minutes) : '')
  const [thenLabel, setThenLabel] = useState(board.then_label)
  const [thenEmoji, setThenEmoji] = useState(board.then_emoji)
  const [thenMinutes, setThenMinutes] = useState(board.then_minutes ? String(board.then_minutes) : '')
  const [showFirstPicker, setShowFirstPicker] = useState(false)
  const [showThenPicker, setShowThenPicker] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const firstPickerRef = useRef<HTMLDivElement>(null)
  const thenPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showFirstPicker && !showThenPicker) return
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (showFirstPicker && firstPickerRef.current && !firstPickerRef.current.contains(target)) setShowFirstPicker(false)
      if (showThenPicker && thenPickerRef.current && !thenPickerRef.current.contains(target)) setShowThenPicker(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [showFirstPicker, showThenPicker])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstLabel.trim() || !thenLabel.trim()) return
    onSave({
      title: title.trim(), first_label: firstLabel.trim(), first_emoji: firstEmoji,
      first_minutes: firstMinutes ? Math.min(parseInt(firstMinutes), 120) : null,
      then_label: thenLabel.trim(), then_emoji: thenEmoji,
      then_minutes: thenMinutes ? Math.min(parseInt(thenMinutes), 120) : null,
    })
  }

  if (confirmingDelete) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
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
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.92, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.92, y: 10, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-sm max-h-[85vh] overflow-y-auto rounded-2xl shadow-xl border border-white/80"
        style={{ background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)' }}>
        <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.2) 100%)' }} />
        <div className="relative z-10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🦕</span>
            <h3 className="heading-section">Editar tablero</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">Título (opcional)</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none" placeholder="Ej: Rutina mañana" />
            </div>
            <div className="bg-brand-bg/20 rounded-xl p-3 border border-brand/20">
              <p className="text-[10px] font-black text-brand uppercase tracking-wider mb-2">Primero</p>
              <div className="flex gap-2 mb-2" ref={firstPickerRef}>
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
                  className="flex-1 px-3 py-2 rounded-xl border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none" placeholder="¿Qué tarea?" />
              </div>
              <div className="flex items-center gap-2">
                <input type="number" min="1" max="120" value={firstMinutes} onChange={e => setFirstMinutes(e.target.value.replace(/\D/g, ''))}
                  className="w-16 px-2 py-1.5 rounded-lg border-2 border-border bg-white text-xs font-bold text-center focus:border-brand focus:outline-none" placeholder="Min" />
                <span className="text-[10px] font-bold text-text-muted">minutos (opcional)</span>
              </div>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
              <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider mb-2">Después</p>
              <div className="flex gap-2" ref={thenPickerRef}>
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
                  className="flex-1 px-3 py-2 rounded-xl border-2 border-border bg-white text-sm font-medium focus:border-amber-400 focus:outline-none" placeholder="¿Recompensa?" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="number" min="1" max="120" value={thenMinutes} onChange={e => setThenMinutes(e.target.value.replace(/\D/g, ''))}
                  className="w-16 px-2 py-1.5 rounded-lg border-2 border-border bg-white text-xs font-bold text-center focus:border-amber-400 focus:outline-none" placeholder="Min" />
                <span className="text-[10px] font-bold text-text-muted">minutos (opcional)</span>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={onDelete}
                className="px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors">Eliminar</button>
              <div className="flex-1" />
              <button type="button" onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-secondary transition-colors border border-border">Cancelar</button>
              <button type="submit" disabled={!firstLabel.trim() || !thenLabel.trim() || saving}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-dark transition-colors disabled:opacity-50 shadow-sm">{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default PrimeroDespuesPage
