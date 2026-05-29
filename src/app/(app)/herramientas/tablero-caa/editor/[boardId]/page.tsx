"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Lumi } from "@/components/lumi/Lumi"
import { CAABoardEditor } from "@/components/caa/CAABoardEditor"
import { useCAABoard, useCAABoardMutations } from "@/lib/hooks/useCAA"
import { useSupabase } from "@/components/layout/SupabaseProvider"
import { useChildren } from "@/lib/hooks/useData"
import type { CAABoard, CAACell, GridSize } from "@/types/caa"

function cellToDB(cell: Partial<CAACell>): Record<string, unknown> {
  const { colorCategory, dontCollect, toggleInBar, gridElementType, wordForms, created_at, ...rest } = cell
  const db: Record<string, unknown> = { ...rest }
  if (dontCollect !== undefined) db.dont_collect = dontCollect
  if (toggleInBar !== undefined) db.toggle_in_bar = toggleInBar
  return db
}

export default function EditorPage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = use(params)
  const isNew = boardId === "nuevo"
  const router = useRouter()
  const { supabase } = useSupabase()
  const { board, cells, loading } = useCAABoard(isNew ? undefined : boardId)
  const { children } = useChildren()
  const childId = children[0]?.id
  const { createBoard, updateBoard } = useCAABoardMutations()

  const [boardData, setBoardData] = useState<Partial<CAABoard>>({
    name: "Nuevo Tablero",
    description: "",
    grid_size: "4x6",
    columns: 6,
    rows: 4,
    category: "custom",
    is_template: false,
    is_favorite: false,
    settings: { cellSize: "md", showLabels: true, voiceRate: 0.85, voicePitch: 1.0, autoSpeak: false },
  })
  const [boardCells, setBoardCells] = useState<CAACell[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (board && !isNew) { setBoardData(board); setBoardCells(cells) }
  }, [board, cells, isNew])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (isNew) {
        // Board via API route (funciona con auth users.id)
        const nb = await createBoard({ ...boardData, child_id: childId })
        // Cells via client-side Supabase directo
        for (const cell of boardCells) {
          const { id, ...cellData } = cell
          const { error: cErr } = await supabase
            .from("caa_cells")
            .insert({ ...cellToDB(cellData), board_id: nb.id })
          if (cErr) console.error("Error guardando celda:", cErr.message, cErr.code, cErr.details, cErr.hint)
        }
        router.push(`/herramientas/tablero-caa/tablero/${nb.id}`)
      } else {
        // Board update via API route
        await updateBoard(boardId, boardData)
        // Reemplazar celdas via cliente Supabase
        await supabase.from("caa_cells").delete().eq("board_id", boardId)
        for (const cell of boardCells) {
          const { id, ...cellData } = cell
          const { error: cErr } = await supabase
            .from("caa_cells")
            .insert({ ...cellToDB(cellData), board_id: boardId })
          if (cErr) console.error("Error guardando celda:", cErr.message, cErr.code, cErr.details, cErr.hint)
        }
        router.push(`/herramientas/tablero-caa/tablero/${boardId}`)
      }
    } catch (e) {
      console.error(e)
      alert("Error al guardar el tablero")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading && !isNew) return (
    <div className="flex items-center justify-center py-20">
      <Lumi mood="thinking" size="lg" message="Cargando editor..." />
    </div>
  )

  return (
    <div className="flex flex-col gap-6 pb-8">

      {/* ─── Config section — constrained width ─────────────── */}
      <div className="max-w-4xl mx-auto w-full px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>← Cancelar</Button>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-text-primary">{isNew ? "Crear Tablero" : "Editar Tablero"}</h1>
            <p className="text-meta">Diseña tu tablero personalizado</p>
          </div>
          <Button variant="primary" size="md" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "⏳ Guardando..." : "💾 Guardar"}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4">
        <Card variant="bordered" padding="md">
        <h2 className="heading-section mb-4">⚙️ Configuración</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">Nombre</label>
            <input type="text" value={boardData.name} onChange={e => setBoardData({ ...boardData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none"
              placeholder="Ej: Mi tablero de comidas" />
          </div>
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">Categoría</label>
            <select value={boardData.category} onChange={e => setBoardData({ ...boardData, category: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none">
              <option value="core">Core (vocabulario esencial)</option>
              <option value="fringe">Fringe (vocabulario específico)</option>
              <option value="emotions">Emociones</option>
              <option value="requests">Peticiones</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-text-primary mb-2">Descripción</label>
            <textarea value={boardData.description} onChange={e => setBoardData({ ...boardData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none resize-none" rows={2}
              placeholder="Describe el propósito de este tablero..." />
          </div>
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">Cuadrícula</label>
            <div className="flex flex-wrap gap-2">
              {(["3x4", "4x6", "5x8", "5x10", "5x12", "5x16"] as GridSize[]).map(size => {
                const [r, c] = size.split("x").map(Number)
                return (
                  <button key={size} onClick={() => setBoardData({ ...boardData, grid_size: size, rows: r, columns: c })}
                    className={`px-3 py-2 rounded-lg text-sm font-bold transition-all border-2 ${boardData.grid_size === size ? "bg-brand text-white border-brand" : "bg-surface border-border text-text-secondary hover:border-brand"}`}>
                    {size}
                  </button>
                )
              })}
              <button onClick={() => setBoardData({ ...boardData, grid_size: "custom" })}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-all border-2 ${boardData.grid_size === "custom" ? "bg-brand text-white border-brand" : "bg-surface border-border text-text-secondary hover:border-brand"}`}>
                Personalizado
              </button>
            </div>
            {boardData.grid_size === "custom" && (
              <div className="flex gap-4 mt-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-text-secondary mb-1">Filas</label>
                  <input type="number" min={2} max={10} value={boardData.rows ?? 5}
                    onChange={e => setBoardData({ ...boardData, rows: Math.min(10, Math.max(2, parseInt(e.target.value) || 2)) })}
                    className="w-full px-3 py-2 rounded-lg border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-text-secondary mb-1">Columnas</label>
                  <input type="number" min={2} max={16} value={boardData.columns ?? 6}
                    onChange={e => setBoardData({ ...boardData, columns: Math.min(16, Math.max(2, parseInt(e.target.value) || 2)) })}
                    className="w-full px-3 py-2 rounded-lg border-2 border-border bg-white text-sm font-medium focus:border-brand focus:outline-none" />
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">Tamaño celdas</label>
            <div className="grid grid-cols-4 gap-2">
              {(["sm", "md", "lg", "xl"] as const).map(size => (
                <button key={size} onClick={() => setBoardData({ ...boardData, settings: { ...boardData.settings, cellSize: size } })}
                  className={`px-2 py-2 rounded-lg text-xs font-bold transition-all ${boardData.settings?.cellSize === size ? "bg-brand text-white" : "bg-surface border-2 border-border text-text-secondary hover:border-brand"}`}>
                  {size.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">Velocidad voz: {boardData.settings?.voiceRate?.toFixed(1)}</label>
            <input type="range" min="0.5" max="2.0" step="0.1" value={boardData.settings?.voiceRate ?? 0.85}
              onChange={e => setBoardData({ ...boardData, settings: { ...boardData.settings, voiceRate: parseFloat(e.target.value) } })}
              className="w-full accent-brand" />
          </div>
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">Tono voz: {boardData.settings?.voicePitch?.toFixed(1)}</label>
            <input type="range" min="0.5" max="2.0" step="0.1" value={boardData.settings?.voicePitch ?? 1.0}
              onChange={e => setBoardData({ ...boardData, settings: { ...boardData.settings, voicePitch: parseFloat(e.target.value) } })}
              className="w-full accent-brand" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-text-primary">Mostrar etiquetas</span>
            <button onClick={() => setBoardData({ ...boardData, settings: { ...boardData.settings, showLabels: !boardData.settings?.showLabels } })}
              className={`w-12 h-6 rounded-full transition-colors relative ${boardData.settings?.showLabels ? "bg-brand" : "bg-border"}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${boardData.settings?.showLabels ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-text-primary">Auto-pronunciar</span>
            <button onClick={() => setBoardData({ ...boardData, settings: { ...boardData.settings, autoSpeak: !boardData.settings?.autoSpeak } })}
              className={`w-12 h-6 rounded-full transition-colors relative ${boardData.settings?.autoSpeak ? "bg-brand" : "bg-border"}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${boardData.settings?.autoSpeak ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>
      </Card>
    </div>

      {/* ─── Grid editor — full viewport width ──────────────── */}
      <div style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)' }} className="overflow-x-auto">
        <div className="px-4 lg:px-6">
          <CAABoardEditor cells={boardCells} columns={boardData.columns!} rows={boardData.rows!} onCellsChange={setBoardCells} cellSize={boardData.settings?.cellSize ?? "md"} />
        </div>
      </div>

      {/* ─── Tips — constrained width ───────────────────────── */}
      <div className="max-w-4xl mx-auto w-full px-4">
        <Card variant="default" padding="md" className="bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="heading-card mb-1">Consejos clínicos:</h3>
              <ul className="text-xs text-text-secondary space-y-1 list-disc list-inside">
                <li>Usa <strong>vocabulario core</strong> para palabras frecuentes (quiero, más, ayuda)</li>
                <li>Sigue el <strong>sistema Fitzgerald</strong> de colores por categoría gramatical</li>
                <li>Mantén pictogramas importantes en la <strong>misma posición siempre</strong></li>
                <li>Empieza con <strong>pocas celdas</strong> e incrementa gradualmente</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}