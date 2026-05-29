'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Pictogram } from '@/components/ui/Pictogram'
import type { CAABoard } from '@/types/caa'

interface CellResult {
  id: string
  board_id: string
  label: string
  pictogram_keyword?: string
  vocalization?: string
  board_name: string
}

interface CAASearchOverlayProps {
  onNavigate: (boardId: string) => void
  onClose: () => void
}

export function CAASearchOverlay({ onNavigate, onClose }: CAASearchOverlayProps) {
  const [query, setQuery] = useState('')
  const [cells, setCells] = useState<CellResult[]>([])
  const [boards, setBoards] = useState<CAABoard[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    fetch('/api/caa/boards').then(r => r.ok && r.json()).then(d => setBoards(d ?? [])).catch(() => {})
  }, [])

  const boardResults = query.trim()
    ? boards.filter(b =>
        b.name.toLowerCase().includes(query.toLowerCase()) ||
        b.description?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : []

  const searchCells = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setCells([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/caa/cells/search?q=${encodeURIComponent(q)}`)
      if (res.ok) setCells(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => searchCells(query), 250)
    return () => clearTimeout(timer)
  }, [query, searchCells])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
    >
      {/* Backdrop sólido — mismo patrón ChestModal */}
      <div className="absolute inset-0 bg-black/85" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.92, y: 10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 10, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl shadow-xl"
        style={{ background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)' }}
      >
        {/* Glass shine overlay */}
        <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.2) 100%)',
          border: '1px solid rgba(255,255,255,0.8)',
        }} />

        <div className="relative">
          {/* Header */}
          <div className="px-5 py-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔍</span>
              <input ref={inputRef}
                value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar tableros y celdas..."
                className="flex-1 text-base font-bold outline-none bg-transparent text-text-primary placeholder:text-text-muted"
                onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
              />
              {query ? (
                <button onClick={() => setQuery('')}
                  className="w-9 h-9 rounded-xl hover:bg-black/5 flex items-center justify-center text-text-muted text-lg font-bold transition-colors">✕</button>
              ) : (
                <button onClick={onClose}
                  className="w-9 h-9 rounded-xl hover:bg-black/5 flex items-center justify-center text-text-muted text-lg font-bold transition-colors">✕</button>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-3 space-y-1">
            {!query.trim() && (
              <div className="flex flex-col items-center py-10">
                <span className="text-4xl mb-3">🔍</span>
                <p className="text-sm font-bold text-text-primary">Escribe para buscar tableros y celdas</p>
              </div>
            )}

            {query.trim().length === 1 && (
              <p className="text-xs font-bold text-text-primary text-center py-10">Escribe al menos 2 caracteres</p>
            )}

            {boardResults.length > 0 && (
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider px-2 py-1.5">📋 Tableros</p>
                {boardResults.map(board => (
                  <button key={board.id} onClick={() => onNavigate(board.id)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-black/[0.03] transition-colors text-left">
                    <span className="text-xl">📋</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-text-primary truncate">{board.name}</p>
                      {board.description && <p className="text-xs text-text-secondary truncate">{board.description}</p>}
                    </div>
                    <span className="text-[11px] font-bold text-text-muted bg-black/[0.04] rounded-md px-2 py-1">{board.grid_size}</span>
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-center py-6">
                <span className="text-sm font-medium text-text-secondary animate-pulse">Buscando...</span>
              </div>
            )}

            {!loading && cells.length > 0 && (
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider px-2 py-1.5">🔤 Celdas</p>
                {cells.map(cell => (
                  <button key={cell.id} onClick={() => onNavigate(cell.board_id)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-black/[0.03] transition-colors text-left">
                    <div className="w-9 h-9 rounded-xl bg-black/[0.04] flex items-center justify-center">
                      <Pictogram keyword={cell.pictogram_keyword ?? ''} size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-text-primary">{cell.label}</p>
                      <p className="text-xs text-text-secondary truncate">{cell.board_name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!loading && query.trim().length >= 2 && boardResults.length === 0 && cells.length === 0 && (
              <div className="flex flex-col items-center py-10">
                <span className="text-3xl mb-2">🔍</span>
                <p className="text-sm font-bold text-text-primary">Sin resultados para &quot;{query}&quot;</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
