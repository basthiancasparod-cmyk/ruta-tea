'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Lumi } from '@/components/lumi/Lumi'
import { useCAABoards } from '@/lib/hooks/useCAA'
import { useChildren } from '@/lib/hooks/useData'
import { useCAABoardMutations } from '@/lib/hooks/useCAA'
import { useGridSets } from '@/lib/hooks/useGridSets'
import type { CAABoard } from '@/types/caa'

function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }: {
  open: boolean; title: string; message: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
        >
          <div className="absolute inset-0 bg-black/85" onClick={onCancel} />
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
            <div className="relative p-6 space-y-4">
              <p className="heading-section">{title}</p>
              <p className="text-sm text-text-secondary leading-relaxed">{message}</p>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" size="md" onClick={onCancel} className="flex-1">
                  Cancelar
                </Button>
                <Button variant="primary" size="md" onClick={onConfirm}
                  className="flex-1 bg-red-500 hover:bg-red-600 border-red-500 text-white">
                  {confirmLabel ?? 'Eliminar'}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function BoardCard({ board, index, onToggleFavorite, onDelete }: {
  board: CAABoard; index: number; onToggleFavorite: (b: CAABoard) => void; onDelete: (id: string) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card variant="bordered" padding="md" className="h-full hover:shadow-lg transition-shadow">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="heading-card truncate">{board.name}</h3>
              <p className="text-meta line-clamp-2 mt-1">
                {board.description || 'Sin descripción'}
              </p>
            </div>
            <button onClick={() => onToggleFavorite(board)}
              className="text-xl shrink-0 hover:scale-110 transition-transform">
              {board.is_favorite ? '⭐' : '☆'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-badge text-brand bg-brand-bg px-2 py-1 rounded-full">
              {board.grid_size}
            </span>
            {board.category && (
              <span className="text-badge text-text-muted bg-surface-secondary px-2 py-1 rounded-full">
                {board.category}
              </span>
            )}
            <span className="text-badge text-text-muted bg-surface-secondary px-2 py-1 rounded-full">
              {new Date(board.updated_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex gap-2 pt-2 border-t border-border">
            <Link href={`/herramientas/tablero-caa/tablero/${board.id}`} className="flex-1">
              <Button variant="primary" size="sm" fullWidth>▶ Usar</Button>
            </Link>
            <Link href={`/herramientas/tablero-caa/editor/${board.id}`}>
              <Button variant="outline" size="sm">✏️</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => onDelete(board.id)}
              className="text-red-600 hover:bg-red-50">🗑</Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default function BibliotecaPage() {
  const router = useRouter()
  const { children } = useChildren()
  const childId = children[0]?.id
  const { boards, loading, refetch } = useCAABoards(childId)
  const { gridSets } = useGridSets()
  const { updateBoard, deleteBoard } = useCAABoardMutations()

  const [filter, setFilter] = useState<'all' | 'favorites' | 'custom' | 'templates'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const filteredBoards = useMemo(() => {
    let result = boards.filter(b => !b.is_template)

    if (filter === 'favorites') result = result.filter(b => b.is_favorite)
    if (filter === 'templates') result = boards.filter(b => b.is_template)
    if (filter === 'custom') result = result.filter(b => b.category === 'custom')

    if (searchQuery) {
      result = result.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return result
  }, [boards, filter, searchQuery])

  const boardGridSetMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const gs of gridSets) {
      for (const link of gs.boards) {
        if (!map.has(link.board_id)) {
          map.set(link.board_id, gs.name)
        }
      }
    }
    return map
  }, [gridSets])

  const groupedBoards = useMemo(() => {
    const groups = new Map<string, CAABoard[]>()
    const uncategorized: CAABoard[] = []

    for (const board of filteredBoards) {
      const setName = boardGridSetMap.get(board.id)
      if (setName) {
        if (!groups.has(setName)) groups.set(setName, [])
        groups.get(setName)!.push(board)
      } else {
        uncategorized.push(board)
      }
    }

    return { groups, uncategorized }
  }, [filteredBoards, boardGridSetMap])

  const handleToggleFavorite = async (board: CAABoard) => {
    try {
      await updateBoard(board.id, { is_favorite: !board.is_favorite })
      refetch()
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return
    try {
      await deleteBoard(deleteTarget)
      setDeleteTarget(null)
      refetch()
    } catch (error) {
      console.error('Error deleting board:', error)
    }
  }, [deleteTarget, deleteBoard, refetch])

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          ← Atrás
        </Button>
        <div className="flex-1">
          <h1 className="heading-page">
            Mis Tableros
          </h1>
          <p className="text-body">
            {filteredBoards.length} tablero{filteredBoards.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => router.push('/herramientas/tablero-caa/editor/nuevo')}
        >
          + Nuevo
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="🔍 Buscar tableros..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none"
        />
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {(['all', 'favorites', 'custom', 'templates'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all
                ${filter === f
                  ? 'bg-brand text-white'
                  : 'bg-surface border border-border text-text-secondary hover:border-brand'
                }
              `}
            >
              {f === 'all' ? '📂 Todos' : f === 'favorites' ? '⭐ Favoritos' : f === 'custom' ? '✏️ Personalizados' : '📋 Plantillas'}
            </button>
          ))}
        </div>
      </div>

      {/* Boards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Lumi mood="thinking" size="md" message="Cargando tableros..." />
        </div>
      ) : filteredBoards.length === 0 ? (
        <Card variant="default" padding="lg">
          <div className="text-center py-8">
            <div className="text-5xl mb-3">📋</div>
            <h3 className="heading-card mb-2">
              No hay tableros aquí
            </h3>
            <p className="text-body mb-4">
              {searchQuery ? 'Intenta con otra búsqueda' : 'Crea tu primer tablero personalizado'}
            </p>
            {!searchQuery && (
              <Button
                variant="primary"
                size="md"
                onClick={() => router.push('/herramientas/tablero-caa/editor/nuevo')}
              >
                ✨ Crear Tablero
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Grouped by grid set */}
          {Array.from(groupedBoards.groups.entries()).map(([setName, setBoards]) => (
            <section key={setName}>
              <h2 className="heading-section mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand" />
                {setName}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {setBoards.map((board, i) => (
                  <BoardCard key={board.id} board={board} index={i}
                    onToggleFavorite={handleToggleFavorite} onDelete={(id) => setDeleteTarget(id)} />
                ))}
              </div>
            </section>
          ))}
          {/* Uncategorized boards */}
          {groupedBoards.uncategorized.length > 0 && (
            <section>
              <h2 className="heading-section text-text-secondary mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-border" />
                Sin categoría
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedBoards.uncategorized.map((board, i) => (
                  <BoardCard key={board.id} board={board} index={i}
                    onToggleFavorite={handleToggleFavorite} onDelete={(id) => setDeleteTarget(id)} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar tablero"
        message="¿Estás seguro de eliminar este tablero? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}