"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { CAACellComponent } from "./CAACell"
import { CAACellEditModal } from "./CAACellEditModal"
import { Button } from "@/components/ui/Button"
import { FITZGERALD_COLORS } from "@/types/caa"
import type { CAACell, FitzgeraldKey } from "@/types/caa"
import { playSound } from "@/lib/sounds"

interface CAABoardEditorProps {
  cells: CAACell[]
  columns: number
  rows: number
  onCellsChange: (cells: CAACell[]) => void
  cellSize?: "sm" | "md" | "lg" | "xl"
}

const EMPTY_DIM: Record<string, string> = {
  sm: "w-[88px] h-[88px]",
  md: "w-[108px] h-[108px]",
  lg: "w-[132px] h-[132px]",
  xl: "w-[156px] h-[156px]",
}
const MIN_COL_PX: Record<string, number> = {
  sm: 88,
  md: 108,
  lg: 132,
  xl: 156,
}

function findCellAt(cells: CAACell[], row: number, col: number): CAACell | undefined {
  return cells.find(c => {
    const cw = c.width ?? 1; const ch = c.height ?? 1
    const cx = c.x ?? c.position_col; const cy = c.y ?? c.position_row
    return row >= cy && row < cy + ch && col >= cx && col < cx + cw
  })
}

function hasCellAt(cells: CAACell[], row: number, col: number, excludeId?: string): boolean {
  return cells.some(c => {
    if (excludeId && c.id === excludeId) return false
    const cw = c.width ?? 1; const ch = c.height ?? 1
    const cx = c.x ?? c.position_col; const cy = c.y ?? c.position_row
    return row >= cy && row < cy + ch && col >= cx && col < cx + cw
  })
}

function canPlaceAt(cells: CAACell[], row: number, col: number, width: number, height: number, excludeId?: string): boolean {
  for (let r = row; r < row + height; r++)
    for (let c = col; c < col + width; c++)
      if (hasCellAt(cells, r, c, excludeId)) return false
  return true
}

function duplicateCell(cell: CAACell): CAACell {
  return {
    ...cell,
    id: crypto.randomUUID(),
    label: `${cell.label} (copia)`,
    created_at: new Date().toISOString(),
  }
}

export function CAABoardEditor({
  cells, columns, rows, onCellsChange, cellSize = "md",
}: CAABoardEditorProps) {
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null)
  const [selectedPos, setSelectedPos] = useState<{ row: number; col: number } | null>(null)
  const [dragOverPos, setDragOverPos] = useState<{ row: number; col: number } | null>(null)
  const [resizing, setResizing] = useState<{ cellId: string; startX: number; startY: number; origW: number; origH: number } | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const selectedCell = selectedPos ? findCellAt(cells, selectedPos.row, selectedPos.col) : null

  const handleCellClick = (row: number, col: number) => {
    const clicked = findCellAt(cells, row, col)
    setSelectedPos({ row, col })
    playSound("click")
    if (clicked) {
      setEditingCell({ row, col })
    } else {
      const newCell: CAACell = {
        id: crypto.randomUUID(),
        board_id: "",
        position_row: row,
        position_col: col,
        label: "",
        background_color: "#f1f5f9",
        border_color: "#94a3b8",
        text_color: "#1e293b",
        action_type: "add_to_message",
        is_folder: false,
        order_index: cells.length + 1,
        created_at: new Date().toISOString(),
      }
      onCellsChange([...cells, newCell])
      setEditingCell({ row, col })
    }
  }

  const handleCellDoubleClick = (row: number, col: number) => {
    setEditingCell({ row, col })
  }

  const openEditModal = () => {
    if (selectedPos) setEditingCell(selectedPos)
  }

  // ── Drag & Drop ──────────────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent, row: number, col: number) => {
    e.preventDefault()
    setDragOverPos({ row, col })
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverPos(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, targetRow: number, targetCol: number) => {
    e.preventDefault()
    setDragOverPos(null)
    const sourceId = e.dataTransfer.getData("text/cell-id")
    if (!sourceId) return
    const sourceCell = cells.find(c => c.id === sourceId)
    if (!sourceCell) return

    const srcW = sourceCell.width ?? 1
    const srcH = sourceCell.height ?? 1

    if (!canPlaceAt(cells, targetRow, targetCol, srcW, srcH, sourceCell.id)) return

    const updated = cells.map(c =>
      c.id === sourceCell.id
        ? { ...c, position_row: targetRow, position_col: targetCol, x: targetCol, y: targetRow }
        : c
    )
    onCellsChange(updated)
    setSelectedPos({ row: targetRow, col: targetCol })
    playSound("correct")
  }, [cells, onCellsChange])

  // ── Resize handle ────────────────────────────────────────────
  const handleResizeStart = useCallback((e: React.MouseEvent, cell: CAACell) => {
    e.preventDefault()
    e.stopPropagation()
    setResizing({
      cellId: cell.id,
      startX: e.clientX,
      startY: e.clientY,
      origW: cell.width ?? 1,
      origH: cell.height ?? 1,
    })
  }, [])

  // Document-level listeners for resize drag
  useEffect(() => {
    if (!resizing || !gridRef.current || !selectedCell) return
    const grid = gridRef.current
    const rect = grid.getBoundingClientRect()
    const gx = columns
    const gy = rows
    const cellW = rect.width / gx
    const cellH = rect.height / gy

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - resizing.startX
      const dy = e.clientY - resizing.startY
      const newW = Math.max(1, Math.min(gx - (selectedCell.x ?? selectedCell.position_col), Math.round(resizing.origW + dx / cellW)))
      const newH = Math.max(1, Math.min(gy - (selectedCell.y ?? selectedCell.position_row), Math.round(resizing.origH + dy / cellH)))
      setResizing(prev => prev ? { ...prev, origW: newW, origH: newH } : null)
    }

    const onUp = () => {
      setResizing(current => {
        if (!current || !selectedCell) return null
        const updated = cells.map(c =>
          c.id === current.cellId
            ? { ...c, width: current.origW, height: current.origH }
            : c
        )
        onCellsChange(updated)
        playSound("click")
        return null
      })
    }

    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
    return () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
    }
  }, [resizing, columns, rows, selectedCell, cells, onCellsChange])

  // ── Duplicate ────────────────────────────────────────────────
  const handleDuplicate = () => {
    if (!selectedCell) return
    const dup = duplicateCell(selectedCell)
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < columns; c++)
        if (!hasCellAt(cells, r, c)) {
          dup.position_row = r; dup.position_col = c
          dup.x = c; dup.y = r
          onCellsChange([...cells, dup])
          setSelectedPos({ row: r, col: c })
          playSound("correct")
          return
        }
  }

  // ── Nudge ────────────────────────────────────────────────────
  const handleNudge = (dr: number, dc: number) => {
    if (!selectedCell) return
    const sr = (selectedCell.y ?? selectedCell.position_row) + dr
    const sc = (selectedCell.x ?? selectedCell.position_col) + dc
    const sw = selectedCell.width ?? 1
    const sh = selectedCell.height ?? 1
    if (sr < 0 || sc < 0 || sr + sh > rows || sc + sw > columns) return
    if (!canPlaceAt(cells, sr, sc, sw, sh, selectedCell.id)) return
    const updated = cells.map(c =>
      c.id === selectedCell.id
        ? { ...c, position_row: sr, position_col: sc, y: sr, x: sc }
        : c
    )
    onCellsChange(updated)
    setSelectedPos({ row: sr, col: sc })
    playSound("click")
  }

  // ── Delete selected ──────────────────────────────────────────
  const handleDeleteSelected = () => {
    if (!selectedCell) return
    onCellsChange(cells.filter(c => c.id !== selectedCell.id))
    setSelectedPos(null)
    playSound("click")
  }

  // ── Edit modal handlers ──────────────────────────────────────
  const handleCellSave = (cellData: Partial<CAACell>) => {
    if (!editingCell) return

    const existing = findCellAt(cells, editingCell.row, editingCell.col)
    const existingIdx = existing ? cells.indexOf(existing) : -1

    const newCell: CAACell = {
      id: existing ? existing.id : crypto.randomUUID(),
      board_id: "",
      position_row: editingCell.row,
      position_col: editingCell.col,
      label: cellData.label || "Nueva",
      pictogram_keyword: cellData.pictogram_keyword,
      background_color: cellData.background_color || "#FFFFFF",
      border_color: cellData.border_color || "#E2E8F0",
      text_color: cellData.text_color || "#1A202C",
      fitzgerald_key: cellData.fitzgerald_key,
      vocalization: cellData.vocalization,
      actions: cellData.actions ?? (cellData.action_type ? undefined : [{ modelName: "GridActionCollectElement" }]),
      is_folder: cellData.is_folder || false,
      width: cellData.width ?? (existing?.width ?? 1),
      height: cellData.height ?? (existing?.height ?? 1),
      x: existing ? (existing.x ?? existing.position_col) : editingCell.col,
      y: existing ? (existing.y ?? existing.position_row) : editingCell.row,
      dontCollect: cellData.dontCollect || false,
      toggleInBar: cellData.toggleInBar || false,
      hidden: cellData.hidden || false,
      colorCategory: cellData.colorCategory,
      custom_image_url: cellData.custom_image_url,
      wordForms: cellData.wordForms || [],
      order_index: existing ? existing.order_index : cells.length,
      created_at: existing ? existing.created_at : new Date().toISOString(),
    }

    const updated = [...cells]
    if (existingIdx >= 0) updated[existingIdx] = newCell
    else updated.push(newCell)

    onCellsChange(updated)
    setEditingCell(null)
    setSelectedPos({ row: editingCell.row, col: editingCell.col })
    playSound("correct")
  }

  const handleCellDelete = (row: number, col: number) => {
    onCellsChange(cells.filter(c => {
      const cw = c.width ?? 1; const ch = c.height ?? 1
      const cx = c.x ?? c.position_col; const cy = c.y ?? c.position_row
      return !(row >= cy && row < cy + ch && col >= cx && col < cx + cw)
    }))
    setEditingCell(null)
    setSelectedPos(null)
    playSound("click")
  }

  const currentEditCell = editingCell
    ? findCellAt(cells, editingCell.row, editingCell.col)
    : null

  // ── Fitzgerald quick-apply ───────────────────────────────────
  const applyFitzgerald = (key: FitzgeraldKey) => {
    const colors = FITZGERALD_COLORS[key]
    if (!selectedCell) return
    const updated = cells.map(c =>
      c.id === selectedCell.id
        ? { ...c, fitzgerald_key: key, background_color: colors.bg, border_color: colors.hex, text_color: colors.text }
        : c
    )
    onCellsChange(updated)
    playSound("click")
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Fitzgerald palette toolbar */}
      <div className="bg-white rounded-xl border-2 border-border p-3">
        <p className="text-xs font-bold text-text-secondary mb-2">
          🎨 Paleta Fitzgerald — Selecciona una celda del grid y luego aplica el color:
        </p>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(FITZGERALD_COLORS) as [FitzgeraldKey, typeof FITZGERALD_COLORS[FitzgeraldKey]][]).map(
            ([key, colors]) => (
              <button
                key={key}
                disabled={!selectedCell}
                onClick={() => applyFitzgerald(key)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all
                  ${selectedCell ? "hover:scale-105 cursor-pointer opacity-100" : "opacity-40 cursor-not-allowed"}
                `}
                style={{ backgroundColor: colors.bg, borderColor: colors.hex, color: colors.text }}
              >
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.hex }} />
                {colors.label}
              </button>
            )
          )}
        </div>
        {selectedCell && (
          <p className="text-xs text-brand font-bold mt-2">
            ✏️ Celda activa: Fila {selectedPos!.row + 1}, Col {selectedPos!.col + 1}
            {selectedCell ? ` — "${selectedCell.label}"` : ""}
          </p>
        )}
        {!selectedCell && (
          <p className="text-xs text-text-muted mt-2">
            👆 Toca una celda del grid para seleccionarla
          </p>
        )}
      </div>

      {/* Floating action toolbar */}
      <AnimatePresence>
        {selectedCell && !editingCell && !resizing && (
          <div className="flex items-center gap-1.5 flex-wrap bg-white rounded-xl border-2 border-brand p-2 shadow-lg">
            <Button variant="primary" size="sm" onClick={openEditModal}>
              ✏️ Editar
            </Button>
            <Button variant="outline" size="sm" onClick={handleDuplicate}>
              📋 Duplicar
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleNudge(-1, 0)} title="Arriba">
              ↑
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleNudge(0, -1)} title="Izquierda">
              ←
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleNudge(0, 1)} title="Derecha">
              →
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleNudge(1, 0)} title="Abajo">
              ↓
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDeleteSelected} className="text-red-600 hover:bg-red-50">
              🗑
            </Button>
          </div>
        )}
      </AnimatePresence>

      {/* Grid canvas */}
      <div className="overflow-x-auto pb-2" ref={gridRef}>
        <div
          className="grid gap-2 w-fit mx-auto p-4 bg-surface-secondary rounded-2xl border-2 border-dashed border-border relative"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(${MIN_COL_PX[cellSize ?? 'md']}px, 1fr))` }}
        >
          {Array.from({ length: rows }, (_, ri) =>
            Array.from({ length: columns }, (_, ci) => {
              const key = `${ri},${ci}`
              const cell = findCellAt(cells, ri, ci)
              const cx = cell?.x ?? cell?.position_col
              const cy = cell?.y ?? cell?.position_row
              const isOrigin = cell && cy === ri && cx === ci
              const isSelected = selectedPos?.row === ri && selectedPos?.col === ci
              const isDragOver = dragOverPos?.row === ri && dragOverPos?.col === ci
              const isEditingActive = editingCell?.row === ri && editingCell?.col === ci

              if (cell && !isOrigin) return <div key={key} />

              if (cell && isOrigin) {
                const cw = cell.width ?? 1; const ch = cell.height ?? 1
                return (
                  <div key={cell.id}
                    style={{
                      gridColumn: `${(cell.x ?? cell.position_col) + 1} / span ${cw}`,
                      gridRow: `${(cell.y ?? cell.position_row) + 1} / span ${ch}`,
                    }}
                    className={`
                      relative
                      ${isSelected && !isEditingActive ? "ring-4 ring-brand ring-offset-2 rounded-2xl" : ""}
                      ${isEditingActive ? "ring-4 ring-accent ring-offset-2 rounded-2xl" : ""}
                      ${resizing?.cellId === cell.id ? "opacity-80" : ""}
                    `}
                    draggable={!resizing}
                    onDragStart={(e) => {
                      if (!resizing) e.dataTransfer?.setData("text/cell-id", cell.id)
                    }}
                    onDragOver={(e) => handleDragOver(e, ri, ci)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, ri, ci)}
                  >
                    <CAACellComponent
                      cell={cell}
                      size={cellSize}
                      showLabels
                      fillGrid
                      onClick={() => handleCellClick(ri, ci)}
                      onEdit={() => handleCellDoubleClick(ri, ci)}
                      isEditing
                    />
                    {/* Resize handle */}
                    {isSelected && !isEditingActive && (
                      <div
                        onMouseDown={(e) => handleResizeStart(e, cell)}
                        className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize z-10
                          flex items-center justify-center"
                      >
                        <div className="w-3 h-3 bg-brand rounded-sm shadow-md border border-white" />
                      </div>
                    )}
                    {/* Drop indicator */}
                    {isDragOver && !cell && (
                      <div className="absolute inset-0 bg-brand/20 rounded-2xl border-2 border-dashed border-brand z-20" />
                    )}
                  </div>
                )
              }

              return (
                <button key={`e-${key}`}
                  onClick={() => handleCellClick(ri, ci)}
                  onDragOver={(e) => handleDragOver(e, ri, ci)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, ri, ci)}
                  className={`
                    ${EMPTY_DIM[cellSize]}
                    border-2 border-dashed rounded-2xl
                    flex items-center justify-center text-text-muted text-2xl transition-all relative
                    ${isSelected && !cell
                      ? "border-brand bg-brand-bg ring-4 ring-brand ring-offset-2"
                      : isDragOver
                        ? "border-brand bg-brand-bg/40"
                        : "border-border bg-white hover:border-brand hover:bg-brand-bg/50"
                    }
                  `}
                >
                  {isDragOver ? (
                    <span className="text-brand text-xs font-bold">↕</span>
                  ) : (
                    "+"
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editingCell && (
          <CAACellEditModal
            cell={currentEditCell}
            onSave={handleCellSave}
            onDelete={currentEditCell ? () => handleCellDelete(editingCell.row, editingCell.col) : undefined}
            onClose={() => setEditingCell(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
