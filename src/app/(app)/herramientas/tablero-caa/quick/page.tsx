"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Pictogram } from "@/components/ui/Pictogram"
import { playSound, vibrate } from "@/lib/sounds"
import { useChildren } from "@/lib/hooks/useData"
import { useCAABoardMutations, useCAAUsageHistory } from "@/lib/hooks/useCAA"
import { FITZGERALD_COLORS } from "@/types/caa"
import { getDefaultActions, type CAACell, type CAABoardSettings, type FitzgeraldKey } from "@/types/caa"
import { useCollectBar, speakText } from "@/lib/caa/collectBar"
import type { CollectMode } from "@/types/caa"
import type { SpeakOptions } from "@/lib/caa/speechService"
import { resolveCellColors } from "@/types/colors"
import { useScanner } from "@/lib/caa/useScanner"
import { useGlobalGrid } from "@/lib/caa/useGlobalGrid"
import { CAAGlobalBar } from "@/components/caa/CAAGlobalBar"


import { useWordForms } from "@/lib/caa/useWordForms"
import CAAStrip from "@/components/caa/CAAStrip"
import { CAASpeechSettings } from "@/components/caa/CAASpeechSettings"
import { CAAScanSettings } from "@/components/caa/CAAScanSettings"
import { CAAColorSettings } from "@/components/caa/CAAColorSettings"
import { CAAHistoryPanel } from "@/components/caa/CAAHistoryPanel"
import { CAASearchOverlay } from "@/components/caa/CAASearchOverlay"

const QUICK_CELLS: CAACell[] = [
  // ROW 0 — Social (purple) + Pronombres (yellow)
  { id:"q0",  board_id:"quick", position_row:0, position_col:0, label:"Hola",      pictogram_keyword:"hola",      fitzgerald_key:"social",      background_color:"#f3e8ff", border_color:"#a855f7", text_color:"#581c87", action_type:"add_to_message", is_folder:false, order_index:0,  created_at:"" },
  { id:"q1",  board_id:"quick", position_row:0, position_col:1, label:"Adiós",     pictogram_keyword:"adios",     fitzgerald_key:"social",      background_color:"#f3e8ff", border_color:"#a855f7", text_color:"#581c87", action_type:"add_to_message", is_folder:false, order_index:1,  created_at:"" },
  { id:"q2",  board_id:"quick", position_row:0, position_col:2, label:"Sí",        pictogram_keyword:"si",        fitzgerald_key:"social",      background_color:"#f3e8ff", border_color:"#a855f7", text_color:"#581c87", action_type:"add_to_message", is_folder:false, order_index:2,  created_at:"" },
  { id:"q3",  board_id:"quick", position_row:0, position_col:3, label:"No",        pictogram_keyword:"no",        fitzgerald_key:"social",      background_color:"#f3e8ff", border_color:"#a855f7", text_color:"#581c87", action_type:"add_to_message", is_folder:false, order_index:3,  created_at:"" },
  { id:"q4",  board_id:"quick", position_row:0, position_col:4, label:"Gracias",   pictogram_keyword:"gracias",   fitzgerald_key:"social",      background_color:"#f3e8ff", border_color:"#a855f7", text_color:"#581c87", action_type:"add_to_message", is_folder:false, order_index:4,  created_at:"" },
  { id:"q5",  board_id:"quick", position_row:0, position_col:5, label:"Por favor", pictogram_keyword:"porfavor",  fitzgerald_key:"social",      background_color:"#f3e8ff", border_color:"#a855f7", text_color:"#581c87", action_type:"add_to_message", is_folder:false, order_index:5,  created_at:"" },
  { id:"q6",  board_id:"quick", position_row:0, position_col:6, label:"Yo",        pictogram_keyword:"yo",        fitzgerald_key:"subject",     background_color:"#fef9c3", border_color:"#facc15", text_color:"#713f12", action_type:"add_to_message", is_folder:false, order_index:6,  created_at:"" },
  { id:"q7",  board_id:"quick", position_row:0, position_col:7, label:"Tú",        pictogram_keyword:"tu",        fitzgerald_key:"subject",     background_color:"#fef9c3", border_color:"#facc15", text_color:"#713f12", action_type:"add_to_message", is_folder:false, order_index:7,  created_at:"" },
  { id:"q8",  board_id:"quick", position_row:0, position_col:8, label:"Él",        pictogram_keyword:"el",        fitzgerald_key:"subject",     background_color:"#fef9c3", border_color:"#facc15", text_color:"#713f12", action_type:"add_to_message", is_folder:false, order_index:8,  created_at:"" },
  { id:"q9",  board_id:"quick", position_row:0, position_col:9, label:"Ella",      pictogram_keyword:"ella",      fitzgerald_key:"subject",     background_color:"#fef9c3", border_color:"#facc15", text_color:"#713f12", action_type:"add_to_message", is_folder:false, order_index:9,  created_at:"" },
  // ROW 1 — Personas/Subject (yellow)
  { id:"q10", board_id:"quick", position_row:1, position_col:0, label:"Nosotros",  pictogram_keyword:"nosotros",  fitzgerald_key:"subject",     background_color:"#fef9c3", border_color:"#facc15", text_color:"#713f12", action_type:"add_to_message", is_folder:false, order_index:10, created_at:"" },
  { id:"q11", board_id:"quick", position_row:1, position_col:1, label:"Mamá",      pictogram_keyword:"mama",      fitzgerald_key:"subject",     background_color:"#fef9c3", border_color:"#facc15", text_color:"#713f12", action_type:"add_to_message", is_folder:false, order_index:11, created_at:"" },
  { id:"q12", board_id:"quick", position_row:1, position_col:2, label:"Papá",      pictogram_keyword:"papa",      fitzgerald_key:"subject",     background_color:"#fef9c3", border_color:"#facc15", text_color:"#713f12", action_type:"add_to_message", is_folder:false, order_index:12, created_at:"" },
  { id:"q13", board_id:"quick", position_row:1, position_col:3, label:"Hermano",   pictogram_keyword:"hermano",   fitzgerald_key:"subject",     background_color:"#fef9c3", border_color:"#facc15", text_color:"#713f12", action_type:"add_to_message", is_folder:false, order_index:13, created_at:"" },
  { id:"q14", board_id:"quick", position_row:1, position_col:4, label:"Hermana",   pictogram_keyword:"hermana",   fitzgerald_key:"subject",     background_color:"#fef9c3", border_color:"#facc15", text_color:"#713f12", action_type:"add_to_message", is_folder:false, order_index:14, created_at:"" },
  { id:"q15", board_id:"quick", position_row:1, position_col:5, label:"Amigo",     pictogram_keyword:"amigo",     fitzgerald_key:"subject",     background_color:"#fef9c3", border_color:"#facc15", text_color:"#713f12", action_type:"add_to_message", is_folder:false, order_index:15, created_at:"" },
  { id:"q16", board_id:"quick", position_row:1, position_col:6, label:"Maestra",   pictogram_keyword:"profesora", fitzgerald_key:"subject",     background_color:"#fef9c3", border_color:"#facc15", text_color:"#713f12", action_type:"add_to_message", is_folder:false, order_index:16, created_at:"" },
  { id:"q17", board_id:"quick", position_row:1, position_col:7, label:"Bebé",      pictogram_keyword:"bebe",      fitzgerald_key:"subject",     background_color:"#fef9c3", border_color:"#facc15", text_color:"#713f12", action_type:"add_to_message", is_folder:false, order_index:17, created_at:"" },
  { id:"q18", board_id:"quick", position_row:1, position_col:8, label:"Doctor",    pictogram_keyword:"medico",    fitzgerald_key:"subject",     background_color:"#fef9c3", border_color:"#facc15", text_color:"#713f12", action_type:"add_to_message", is_folder:false, order_index:18, created_at:"" },
  { id:"q19", board_id:"quick", position_row:1, position_col:9, label:"Todos",     pictogram_keyword:"todos",     fitzgerald_key:"subject",     background_color:"#fef9c3", border_color:"#facc15", text_color:"#713f12", action_type:"add_to_message", is_folder:false, order_index:19, created_at:"" },
  // ROW 2 — Verbos (green)
  { id:"q20", board_id:"quick", position_row:2, position_col:0, label:"Querer",    pictogram_keyword:"querer",    fitzgerald_key:"verb",        background_color:"#dcfce7", border_color:"#22c55e", text_color:"#14532d", action_type:"add_to_message", is_folder:false, order_index:20, created_at:"" },
  { id:"q21", board_id:"quick", position_row:2, position_col:1, label:"Gustar",    pictogram_keyword:"gustar",    fitzgerald_key:"verb",        background_color:"#dcfce7", border_color:"#22c55e", text_color:"#14532d", action_type:"add_to_message", is_folder:false, order_index:21, created_at:"" },
  { id:"q22", board_id:"quick", position_row:2, position_col:2, label:"Comer",     pictogram_keyword:"comer",     fitzgerald_key:"verb",        background_color:"#dcfce7", border_color:"#22c55e", text_color:"#14532d", action_type:"add_to_message", is_folder:false, order_index:22, created_at:"" },
  { id:"q23", board_id:"quick", position_row:2, position_col:3, label:"Beber",     pictogram_keyword:"beber",     fitzgerald_key:"verb",        background_color:"#dcfce7", border_color:"#22c55e", text_color:"#14532d", action_type:"add_to_message", is_folder:false, order_index:23, created_at:"" },
  { id:"q24", board_id:"quick", position_row:2, position_col:4, label:"Jugar",     pictogram_keyword:"jugar",     fitzgerald_key:"verb",        background_color:"#dcfce7", border_color:"#22c55e", text_color:"#14532d", action_type:"add_to_message", is_folder:false, order_index:24, created_at:"" },
  { id:"q25", board_id:"quick", position_row:2, position_col:5, label:"Ir",        pictogram_keyword:"ir",        fitzgerald_key:"verb",        background_color:"#dcfce7", border_color:"#22c55e", text_color:"#14532d", action_type:"add_to_message", is_folder:false, order_index:25, created_at:"" },
  { id:"q26", board_id:"quick", position_row:2, position_col:6, label:"Ver",       pictogram_keyword:"ver",       fitzgerald_key:"verb",        background_color:"#dcfce7", border_color:"#22c55e", text_color:"#14532d", action_type:"add_to_message", is_folder:false, order_index:26, created_at:"" },
  { id:"q27", board_id:"quick", position_row:2, position_col:7, label:"Hacer",     pictogram_keyword:"hacer",     fitzgerald_key:"verb",        background_color:"#dcfce7", border_color:"#22c55e", text_color:"#14532d", action_type:"add_to_message", is_folder:false, order_index:27, created_at:"" },
  { id:"q28", board_id:"quick", position_row:2, position_col:8, label:"Tener",     pictogram_keyword:"tener",     fitzgerald_key:"verb",        background_color:"#dcfce7", border_color:"#22c55e", text_color:"#14532d", action_type:"add_to_message", is_folder:false, order_index:28, created_at:"" },
  { id:"q29", board_id:"quick", position_row:2, position_col:9, label:"Dormir",    pictogram_keyword:"dormir",    fitzgerald_key:"verb",        background_color:"#dcfce7", border_color:"#22c55e", text_color:"#14532d", action_type:"add_to_message", is_folder:false, order_index:29, created_at:"" },
  // ROW 3 — Verbos + Objetos (green → orange)
  { id:"q30", board_id:"quick", position_row:3, position_col:0, label:"Necesitar", pictogram_keyword:"necesitar", fitzgerald_key:"verb",        background_color:"#dcfce7", border_color:"#22c55e", text_color:"#14532d", action_type:"add_to_message", is_folder:false, order_index:30, created_at:"" },
  { id:"q31", board_id:"quick", position_row:3, position_col:1, label:"Ayudar",    pictogram_keyword:"ayudar",    fitzgerald_key:"verb",        background_color:"#dcfce7", border_color:"#22c55e", text_color:"#14532d", action_type:"add_to_message", is_folder:false, order_index:31, created_at:"" },
  { id:"q32", board_id:"quick", position_row:3, position_col:2, label:"Mirar",     pictogram_keyword:"mirar",     fitzgerald_key:"verb",        background_color:"#dcfce7", border_color:"#22c55e", text_color:"#14532d", action_type:"add_to_message", is_folder:false, order_index:32, created_at:"" },
  { id:"q33", board_id:"quick", position_row:3, position_col:3, label:"Escuchar",  pictogram_keyword:"escuchar",  fitzgerald_key:"verb",        background_color:"#dcfce7", border_color:"#22c55e", text_color:"#14532d", action_type:"add_to_message", is_folder:false, order_index:33, created_at:"" },
  { id:"q34", board_id:"quick", position_row:3, position_col:4, label:"Caminar",   pictogram_keyword:"andar",     fitzgerald_key:"verb",        background_color:"#dcfce7", border_color:"#22c55e", text_color:"#14532d", action_type:"add_to_message", is_folder:false, order_index:34, created_at:"" },
  { id:"q35", board_id:"quick", position_row:3, position_col:5, label:"Agua",      pictogram_keyword:"agua",      fitzgerald_key:"object",      background_color:"#fed7aa", border_color:"#fb923c", text_color:"#7c2d12", action_type:"add_to_message", is_folder:false, order_index:35, created_at:"" },
  { id:"q36", board_id:"quick", position_row:3, position_col:6, label:"Comida",    pictogram_keyword:"comida",    fitzgerald_key:"object",      background_color:"#fed7aa", border_color:"#fb923c", text_color:"#7c2d12", action_type:"add_to_message", is_folder:false, order_index:36, created_at:"" },
  { id:"q37", board_id:"quick", position_row:3, position_col:7, label:"Juguete",   pictogram_keyword:"juguete",   fitzgerald_key:"object",      background_color:"#fed7aa", border_color:"#fb923c", text_color:"#7c2d12", action_type:"add_to_message", is_folder:false, order_index:37, created_at:"" },
  { id:"q38", board_id:"quick", position_row:3, position_col:8, label:"Libro",     pictogram_keyword:"libro",     fitzgerald_key:"object",      background_color:"#fed7aa", border_color:"#fb923c", text_color:"#7c2d12", action_type:"add_to_message", is_folder:false, order_index:38, created_at:"" },
  { id:"q39", board_id:"quick", position_row:3, position_col:9, label:"Pelota",    pictogram_keyword:"pelota",    fitzgerald_key:"object",      background_color:"#fed7aa", border_color:"#fb923c", text_color:"#7c2d12", action_type:"add_to_message", is_folder:false, order_index:39, created_at:"" },
  // ROW 4 — Descriptivo (blue)
  { id:"q40", board_id:"quick", position_row:4, position_col:0, label:"Feliz",     pictogram_keyword:"alegre",    fitzgerald_key:"descriptive", background_color:"#dbeafe", border_color:"#3b82f6", text_color:"#1e3a8a", action_type:"add_to_message", is_folder:false, order_index:40, created_at:"" },
  { id:"q41", board_id:"quick", position_row:4, position_col:1, label:"Triste",    pictogram_keyword:"triste",    fitzgerald_key:"descriptive", background_color:"#dbeafe", border_color:"#3b82f6", text_color:"#1e3a8a", action_type:"add_to_message", is_folder:false, order_index:41, created_at:"" },
  { id:"q42", board_id:"quick", position_row:4, position_col:2, label:"Enojado",   pictogram_keyword:"enfadado",  fitzgerald_key:"descriptive", background_color:"#dbeafe", border_color:"#3b82f6", text_color:"#1e3a8a", action_type:"add_to_message", is_folder:false, order_index:42, created_at:"" },
  { id:"q43", board_id:"quick", position_row:4, position_col:3, label:"Cansado",   pictogram_keyword:"cansado",   fitzgerald_key:"descriptive", background_color:"#dbeafe", border_color:"#3b82f6", text_color:"#1e3a8a", action_type:"add_to_message", is_folder:false, order_index:43, created_at:"" },
  { id:"q44", board_id:"quick", position_row:4, position_col:4, label:"Bien",      pictogram_keyword:"bien",      fitzgerald_key:"descriptive", background_color:"#dbeafe", border_color:"#3b82f6", text_color:"#1e3a8a", action_type:"add_to_message", is_folder:false, order_index:44, created_at:"" },
  { id:"q45", board_id:"quick", position_row:4, position_col:5, label:"Mal",       pictogram_keyword:"mal",       fitzgerald_key:"descriptive", background_color:"#dbeafe", border_color:"#3b82f6", text_color:"#1e3a8a", action_type:"add_to_message", is_folder:false, order_index:45, created_at:"" },
  { id:"q46", board_id:"quick", position_row:4, position_col:6, label:"Grande",    pictogram_keyword:"grande",    fitzgerald_key:"descriptive", background_color:"#dbeafe", border_color:"#3b82f6", text_color:"#1e3a8a", action_type:"add_to_message", is_folder:false, order_index:46, created_at:"" },
  { id:"q47", board_id:"quick", position_row:4, position_col:7, label:"Pequeño",   pictogram_keyword:"pequeno",   fitzgerald_key:"descriptive", background_color:"#dbeafe", border_color:"#3b82f6", text_color:"#1e3a8a", action_type:"add_to_message", is_folder:false, order_index:47, created_at:"" },
  { id:"q48", board_id:"quick", position_row:4, position_col:8, label:"Bonito",    pictogram_keyword:"bonito",    fitzgerald_key:"descriptive", background_color:"#dbeafe", border_color:"#3b82f6", text_color:"#1e3a8a", action_type:"add_to_message", is_folder:false, order_index:48, created_at:"" },
  { id:"q49", board_id:"quick", position_row:4, position_col:9, label:"Malo",      pictogram_keyword:"malo",      fitzgerald_key:"descriptive", background_color:"#dbeafe", border_color:"#3b82f6", text_color:"#1e3a8a", action_type:"add_to_message", is_folder:false, order_index:49, created_at:"" },
  // ROW 5 — Lugar (pink) + Tiempo (gray)
  { id:"q50", board_id:"quick", position_row:5, position_col:0, label:"Casa",      pictogram_keyword:"casa",      fitzgerald_key:"place",       background_color:"#fce7f3", border_color:"#ec4899", text_color:"#831843", action_type:"add_to_message", is_folder:false, order_index:50, created_at:"" },
  { id:"q51", board_id:"quick", position_row:5, position_col:1, label:"Escuela",   pictogram_keyword:"escuela",   fitzgerald_key:"place",       background_color:"#fce7f3", border_color:"#ec4899", text_color:"#831843", action_type:"add_to_message", is_folder:false, order_index:51, created_at:"" },
  { id:"q52", board_id:"quick", position_row:5, position_col:2, label:"Parque",    pictogram_keyword:"parque",    fitzgerald_key:"place",       background_color:"#fce7f3", border_color:"#ec4899", text_color:"#831843", action_type:"add_to_message", is_folder:false, order_index:52, created_at:"" },
  { id:"q53", board_id:"quick", position_row:5, position_col:3, label:"Baño",      pictogram_keyword:"bano",      fitzgerald_key:"place",       background_color:"#fce7f3", border_color:"#ec4899", text_color:"#831843", action_type:"add_to_message", is_folder:false, order_index:53, created_at:"" },
  { id:"q54", board_id:"quick", position_row:5, position_col:4, label:"Calle",     pictogram_keyword:"calle",     fitzgerald_key:"place",       background_color:"#fce7f3", border_color:"#ec4899", text_color:"#831843", action_type:"add_to_message", is_folder:false, order_index:54, created_at:"" },
  { id:"q55", board_id:"quick", position_row:5, position_col:5, label:"Ahora",     pictogram_keyword:"ahora",     fitzgerald_key:"time",        background_color:"#f1f5f9", border_color:"#94a3b8", text_color:"#1e293b", action_type:"add_to_message", is_folder:false, order_index:55, created_at:"" },
  { id:"q56", board_id:"quick", position_row:5, position_col:6, label:"Después",   pictogram_keyword:"despues",   fitzgerald_key:"time",        background_color:"#f1f5f9", border_color:"#94a3b8", text_color:"#1e293b", action_type:"add_to_message", is_folder:false, order_index:56, created_at:"" },
  { id:"q57", board_id:"quick", position_row:5, position_col:7, label:"Hoy",       pictogram_keyword:"hoy",       fitzgerald_key:"time",        background_color:"#f1f5f9", border_color:"#94a3b8", text_color:"#1e293b", action_type:"add_to_message", is_folder:false, order_index:57, created_at:"" },
  { id:"q58", board_id:"quick", position_row:5, position_col:8, label:"Ayer",      pictogram_keyword:"ayer",      fitzgerald_key:"time",        background_color:"#f1f5f9", border_color:"#94a3b8", text_color:"#1e293b", action_type:"add_to_message", is_folder:false, order_index:58, created_at:"" },
  { id:"q59", board_id:"quick", position_row:5, position_col:9, label:"Mañana",    pictogram_keyword:"manana",    fitzgerald_key:"time",        background_color:"#f1f5f9", border_color:"#94a3b8", text_color:"#1e293b", action_type:"add_to_message", is_folder:false, order_index:59, created_at:"" },
]

const COLS = 10
const ROWS = 6
const GAP  = 6

// ─── Celda ────────────────────────────────────────────────────────────────────
function Cell({ cell, px, onTap, highlight, scanFocus, scanInactive, gridCol, gridRow, displayLabel, settings }: {
  cell: CAACell; px: number; onTap: (c: CAACell) => void; highlight?: boolean; scanFocus?: boolean; scanInactive?: boolean; gridCol?: string; gridRow?: string; displayLabel?: string; settings?: CAABoardSettings
}) {
  const cr = resolveCellColors(cell, settings)
  const pic = Math.round(px * 0.54)
  const fs  = Math.max(9, Math.round(px * 0.112))

  return (
    <motion.button
      layout
      whileTap={{ scale: 0.88 }}
      onClick={() => { playSound("click"); vibrate("click"); onTap(cell) }}
      className={`relative flex flex-col items-center justify-between rounded-2xl border-[3px] select-none overflow-hidden transition-all
        ${scanInactive ? "opacity-40 grayscale" : ""}
        ${scanFocus ? "ring-[6px] ring-red-500/60 ring-offset-2 z-10" : ""}`}
      style={{
        gridColumn: gridCol, gridRow: gridRow,
        backgroundColor: cr.bg,
        borderColor: cr.border,
        boxShadow: highlight ? `0 0 0 3px ${cr.border}80, 0 0 16px ${cr.border}40` : undefined,
        padding: `${Math.max(4, Math.round(px * 0.05))}px`,
      }}
      aria-label={cell.label}
    >
      {cell.fitzgerald_key && (
        <span className="absolute top-1 left-1 w-2 h-2 rounded-full opacity-70"
          style={{ backgroundColor: cr.border }} />
      )}
      {(settings?.highlightOnPress !== false) && highlight && (
        <motion.span initial={{ opacity: 0.5 }} animate={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ backgroundColor: `${cr.border}20` }} />
      )}
      <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
        {cell.custom_image_url ? (
          <img src={cell.custom_image_url} alt={cell.label} className="w-full h-full object-contain rounded-lg" />
        ) : cell.pictogram_keyword ? (
          <Pictogram keyword={cell.pictogram_keyword} size={pic} />
        ) : (
          <span className="text-4xl opacity-30">❓</span>
        )}
      </div>
      {(settings?.showLabels ?? true) && (
        <span
          className="font-extrabold text-center leading-tight line-clamp-1 w-full"
          style={{ fontSize: fs, color: cr.text }}
        >
          {displayLabel ?? cell.label}
        </span>
      )}
    </motion.button>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function QuickBoardPage() {
  const router   = useRouter()
  const { children } = useChildren()
  const childId  = children[0]?.id
  const { logUsage } = useCAABoardMutations()

  const [showLeg,    setShowLeg]    = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [cellPx,     setCellPx]     = useState(88)
  const [tappedId,   setTappedId]   = useState<string | null>(null)
  const [vocabLevel, setVocabLevel] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fullscreenToolsOpen, setFullscreenToolsOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [boardSettings, setBoardSettings] = useState<CAABoardSettings>(() => {
    if (typeof window === "undefined") return {}
    try {
      const saved = localStorage.getItem("quickBoardSettings")
      return saved ? JSON.parse(saved) : {}
    } catch { return {} }
  })
  const scanBtnRef = useRef(false)
  const topbarRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const globalBarRef = useRef<HTMLDivElement>(null)
  const kbInputRef = useRef<HTMLInputElement>(null)

  const { globalCells } = useGlobalGrid({ enabled: true })

  const {
    tokens, speaking, keyboardMode, collectMode, autoSpeak,
    addCell, removeWord, removeChar, clear, removeAt, speakAll, stop, initFromGrid,
    setAutoSpeak, setCollectMode, setKeyboardMode, reapplyWordForms,
  } = useCollectBar()

  // Init from static cells + sync settings
  useEffect(() => {
    initFromGrid(QUICK_CELLS, { ...boardSettings, collectMode: boardSettings.collectMode ?? ("separated" as CollectMode) })
  }, [initFromGrid])

  // ── Word Forms ──────────────────────────────────────────────
  const wf = useWordForms()

  // ── Persist settings ────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem("quickBoardSettings", JSON.stringify(boardSettings)) }
    catch { /* storage full or unavailable */ }
  }, [boardSettings])

  // ── Sync fullscreen state ───────────────────────────
  useEffect(() => {
    const handler = () => {
      const active = !!document.fullscreenElement
      setIsFullscreen(active)
      if (active) setFullscreenToolsOpen(false)
    }
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])

  // ── History ─────────────────────────────────────────
  const { history, loading: historyLoading } = useCAAUsageHistory(childId)

  // ── Keyboard input handling ─────────────────────────
  const handleKbKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      speakAll()
      setInputValue("")
    } else if (e.key === "Backspace" && !inputValue) {
      removeWord()
    }
  }, [inputValue, speakAll, removeWord])

  // Auto-focus keyboard input when mode activated
  useEffect(() => {
    if (keyboardMode) {
      setTimeout(() => kbInputRef.current?.focus(), 100)
    }
  }, [keyboardMode])

  // ── Clear tap highlight after 300ms
  useEffect(() => {
    if (!tappedId) return
    const t = setTimeout(() => setTappedId(null), 300)
    return () => clearTimeout(t)
  }, [tappedId])

  // ── ResizeObserver: calcula cellPx para llenar el ANCHO disponible ────────
  useEffect(() => {
    const calc = () => {
      requestAnimationFrame(() => {
        if (!gridRef.current || !topbarRef.current || !stripRef.current) return
        const topH = topbarRef.current.offsetHeight
        const stripH = stripRef.current.offsetHeight
        const globalH = globalBarRef.current?.offsetHeight ?? 0
        const availW = gridRef.current.clientWidth - 24
        const availH = window.innerHeight - topH - stripH - globalH - 24
        const byW = Math.floor((availW - (COLS - 1) * GAP) / COLS)
        const byH = Math.floor((availH - (ROWS - 1) * GAP) / ROWS)
        setCellPx(Math.max(Math.min(byW, byH), 52))
      })
    }
    calc()
    const ro = new ResizeObserver(calc)
    if (gridRef.current) ro.observe(gridRef.current)
    return () => ro.disconnect()
  }, [showLeg, globalCells.length, fullscreenToolsOpen, isFullscreen])

  // Build occupied set for filler positions
  const occupied = new Set(QUICK_CELLS.map(c => `${c.position_row},${c.position_col}`))
  const fillerPositions: { r: number; c: number }[] = []
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (!occupied.has(`${r},${c}`)) fillerPositions.push({ r, c })

  // ── Scanning ───────────────────────────────────────────────
  const handleTapRef = useRef<(cell: CAACell) => void>(undefined)
  const { isScanning, isActive, start: startScan, stop: stopScan } = useScanner(
    QUICK_CELLS,
    {
      enabled: boardSettings.scanEnabled ?? false,
      autoScan: boardSettings.scanAuto,
      timeoutMs: boardSettings.scanTimeoutMs,
      timeoutFirstElementFactor: boardSettings.scanTimeoutFirstElementFactor,
      vertical: boardSettings.scanVertical,
      binary: boardSettings.scanBinary,
      dualSwitch: boardSettings.scanDualSwitch,
      startWithAction: boardSettings.scanStartWithAction,
      roundsUntilBack: boardSettings.scanRoundsUntilBack,
      beepFeedback: boardSettings.scanBeepFeedback,
      readActive: boardSettings.scanReadActive,
      readActiveRate: boardSettings.scanReadActiveRate,
    },
    (cell) => handleTapRef.current?.(cell)
  )

  const voiceOpts = (): SpeakOptions => ({
    voice: boardSettings.preferredVoice,
    rate: boardSettings.voiceRate,
    pitch: boardSettings.voicePitch,
  })

  const handleTap = (cell: CAACell) => {
    setTappedId(cell.id)
    const actions = cell.actions ?? getDefaultActions(cell)
    const hasWfAction = actions.some(a => a.modelName === "GridActionWordForm")
    if (!hasWfAction && !cell.wordForms?.length) {
      wf.resetForms()
    }
    // Original Asterics-AAC flow: add to collect bar FIRST (via event handler),
    // then execute actions. addCell handles filtering (dontCollect, toggleInBar, etc.)
    const wasCollected = addCell(cell)
    for (const a of actions) {
      switch (a.modelName) {
        case "GridActionCollectElement":
          if (a.action === "COLLECT_ACTION_CLEAR") clear()
          else if (a.action === "COLLECT_ACTION_REMOVE_WORD") removeWord()
          else if (a.action === "COLLECT_ACTION_REMOVE_CHAR") removeChar()
          else if (a.action === "COLLECT_ACTION_SPEAK" || a.action === "COLLECT_ACTION_SPEAK_CONTINUOUS") {
            // tokens state is stale after addCell, build text directly
            const existing = tokens.map(t => t.vocalization ?? t.pronunciation ?? t.label).join(" ")
            const extra = wasCollected ? (cell.vocalization ?? cell.label) : ""
            const full = existing + (existing && extra ? " " : "") + extra
            if (full.trim()) speakText(full.trim(), voiceOpts())
          }
          break
        case "GridActionSpeak":
        case "GridActionSpeakCustom":
          speakText(a.speakText ?? cell.vocalization ?? cell.label, voiceOpts())
          break
        case "GridActionNavigate":
          if (a.navType === "TO_LAST") router.back()
          else if (a.navType === "TO_HOME") router.push("/herramientas/tablero-caa")
          else if (a.toGridId) router.push(`/herramientas/tablero-caa/tablero/${a.toGridId}`)
          break
        case "GridActionAudio":
          if (a.dataBase64) {
            const audio = new Audio(a.dataBase64)
            audio.play().catch(() => {})
          }
          break
        case "GridActionOpenWebpage":
          if (a.openURL) window.open(a.openURL, "_blank", "noopener")
          break
        case "GridActionYoutube":
          if (a.data) {
            window.open(
              a.playType === "YT_PLAY_SEARCH"
                ? `https://www.youtube.com/results?search_query=${encodeURIComponent(a.data)}`
                : `https://www.youtube.com/watch?v=${a.data}`,
              "_blank", "noopener"
            )
          }
          break
        case "GridActionHTTP":
          if (a.restUrl) {
            fetch(a.restUrl, { method: a.method ?? "POST", headers: { "Content-Type": a.contentType ?? "text/plain" }, body: a.body }).catch(() => {})
          }
          break
        case "GridActionChangeLang":
          if (a.language) {
            document.cookie = `NEXT_LOCALE=${a.language};path=/;max-age=31536000`
            window.location.reload()
          }
          break
        case "GridActionSystem":
          if (a.action === "SYS_ENTER_FULLSCREEN") document.documentElement.requestFullscreen?.()
          else if (a.action === "SYS_LEAVE_FULLSCREEN") document.exitFullscreen?.()
          break
        case "GridActionPredict":
          break
        case "GridActionWordForm":
          {
            const tags = a.wordFormTags ?? []
            if (a.wordFormMode === "WORDFORM_MODE_RESET_FORMS") {
              wf.resetForms()
            } else if (a.wordFormMode === "WORDFORM_MODE_NEXT_FORM") {
              wf.cycleNext(cell.id)
            } else if (a.wordFormMode === "WORDFORM_MODE_CHANGE_ELEMENTS" ||
                       a.wordFormMode === "WORDFORM_MODE_CHANGE_BAR") {
              wf.addTags(tags, a.toggle ?? false)
              reapplyWordForms((label, vocalization, wordForms) => {
                if (!wordForms?.length) return vocalization ?? label
                const preferred = wf.getPreferredWordForm(wordForms)
                return preferred?.value ?? vocalization ?? label
              })
            } else if (a.wordFormMode === "WORDFORM_MODE_CHANGE_EVERYWHERE") {
              wf.addTags(tags, a.toggle ?? false)
            } else if (tags.length > 0) {
              wf.addTags(tags, a.toggle ?? false)
            }
          }
          break
        case "GridActionVocabLevelToggle":
          setVocabLevel(prev => prev === (a.vocabularyLevel ?? 1) ? 0 : (a.vocabularyLevel ?? 1))
          break
        case "GridActionPredefined":
          break
        case "GridActionWebradio":
        case "GridActionPodcast":
          break
      }
    }
    if (childId) logUsage({
      child_id: childId, board_id: "quick",
      cell_id: cell.id, timestamp: new Date().toISOString(),
    })
  }
  handleTapRef.current = handleTap

  const logAndSpeak = () => {
    if (!tokens.length) return
    speakAll(voiceOpts())
    if (childId) logUsage({
      child_id: childId, board_id: "quick",
      message_text: tokens.map(t => t.vocalization ?? t.label).join(" "),
      timestamp: new Date().toISOString(),
    })
  }

  const toolbarActionsVisible = !isFullscreen || fullscreenToolsOpen
  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.()
    else document.documentElement.requestFullscreen?.()
  }

  return (
    <div className="flex flex-col h-full bg-surface">

      <div className="sticky top-0 z-10 bg-white border-b border-border">

        {/* Topbar — botones grandes para niños */}
        <div ref={topbarRef} className="flex items-center gap-2 px-2 py-2 overflow-x-auto no-scrollbar">
          <button onClick={() => router.back()}
            className="text-sm font-bold text-text-secondary hover:text-brand transition-colors px-3 py-2 rounded-lg hover:bg-brand-bg min-h-[44px] shrink-0">
            ← Atrás
          </button>
          <span className="text-sm font-extrabold text-text-primary flex-1 truncate shrink-0">
            💬 Tablero Rápido
          </span>
          {isFullscreen && (
            <motion.button onClick={() => setFullscreenToolsOpen(p => !p)}
              whileTap={{ scale: 0.96 }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-brand/40 bg-brand-bg text-brand shadow-sm transition-all hover:border-brand hover:bg-brand/10"
              title={fullscreenToolsOpen ? "Ocultar opciones" : "Mostrar opciones"}
              aria-label={fullscreenToolsOpen ? "Ocultar opciones" : "Mostrar opciones"}>
              <motion.span
                animate={{ rotate: fullscreenToolsOpen ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
                className="block text-2xl font-black leading-none"
              >
                ›
              </motion.span>
            </motion.button>
          )}
          {/* Acciones */}
          {toolbarActionsVisible && (
            <>
              <button onClick={() => setShowSearch(true)}
                className="text-base border-2 border-border rounded-lg px-3 py-2 transition-all whitespace-nowrap min-h-[44px] shrink-0
                  hover:border-brand hover:text-brand">
                🔍
              </button>
              <button onClick={() => setKeyboardMode(p => !p)}
                className={`text-base border-2 border-border rounded-lg px-3 py-2 transition-all whitespace-nowrap min-h-[44px] shrink-0
                  ${keyboardMode ? 'border-brand bg-brand/10 text-brand' : 'hover:border-brand hover:text-brand'}`}>
                ⌨️
              </button>
              <button onClick={() => setShowHistory(true)}
                className="text-base border-2 border-border rounded-lg px-3 py-2 transition-all whitespace-nowrap min-h-[44px] shrink-0
                  hover:border-brand hover:text-brand">
                📊
              </button>
              <button onClick={() => setShowSettings(true)}
                className="text-base border-2 border-border rounded-lg px-3 py-2 transition-all whitespace-nowrap min-h-[44px] shrink-0
                  hover:border-brand hover:text-brand">
                ⚙️
              </button>
              {isScanning ? (
                <button onClick={() => { stopScan(); setBoardSettings(s => ({ ...s, scanEnabled: false })) }}
                  className="text-sm font-bold border-2 border-accent bg-accent/10 text-accent rounded-lg px-3 py-2 transition-all whitespace-nowrap min-h-[44px] shrink-0">
                  🟢 Detener
                </button>
              ) : (
                <button onClick={() => { setBoardSettings(s => ({ ...s, scanEnabled: true })); scanBtnRef.current = true }}
                  className="text-sm font-bold border-2 border-border rounded-lg px-3 py-2 transition-all whitespace-nowrap min-h-[44px] shrink-0
                    hover:border-accent hover:text-accent">
                  🔘 Scan
                </button>
              )}
            </>
          )}
          <button onClick={toggleFullscreen}
            className="text-sm font-bold border-2 border-border rounded-lg px-3 py-2 transition-all whitespace-nowrap min-h-[44px] shrink-0
              hover:border-brand hover:text-brand">
            ⛶
          </button>
          {toolbarActionsVisible && (
            <button onClick={() => setShowLeg(p => !p)}
              className="text-base border-2 border-border rounded-lg px-3 py-2 transition-all whitespace-nowrap min-h-[44px] shrink-0
                hover:border-brand hover:text-brand">
              🎨
            </button>
          )}
        </div>

        {/* Leyenda */}
        {showLeg && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.12 }}
            className="overflow-hidden border-b border-border">
            <div className="flex gap-2 px-3 py-2 overflow-x-auto no-scrollbar">
              {(Object.entries(FITZGERALD_COLORS) as [FitzgeraldKey, typeof FITZGERALD_COLORS[FitzgeraldKey]][]).map(([k, v]) => (
                <span key={k}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-bold border whitespace-nowrap"
                  style={{ backgroundColor: v.bg, borderColor: v.hex, color: v.text }}>
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: v.hex }} />
                  {v.label}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        <CAAStrip
          tokens={tokens}
          speaking={speaking}
          keyboardMode={keyboardMode}
          collectMode={collectMode}
          autoSpeak={boardSettings.autoSpeak ?? false}
          onSpeakAll={logAndSpeak}
          onStop={stop}
          onClear={clear}
          onRemoveAt={removeAt}
          onRemoveWord={removeWord}
          onRemoveChar={removeChar}
          onToggleCollectMode={() => setCollectMode(collectMode === "text" ? "separated" : "text")}
          onToggleAutoSpeak={() => {
            const next = !(boardSettings.autoSpeak ?? false)
            setAutoSpeak(next)
            setBoardSettings(s => ({ ...s, autoSpeak: next }))
          }}
          stripRef={stripRef as React.RefObject<HTMLDivElement | null>}
        />

        {/* Input para teclado virtual */}
        {keyboardMode && (
          <div className="px-2 pb-2">
            <input ref={kbInputRef}
              type="text"
              inputMode="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKbKeyDown}
              placeholder="Escribe aquí y presiona Enter para hablar..."
              className="w-full px-4 py-3 rounded-xl border-2 border-brand/40 bg-white text-base font-bold text-text-primary
                placeholder:text-text-muted placeholder:font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/20
                min-h-[48px]"
              autoComplete="off"
              autoCorrect="on"
              autoCapitalize="sentences"
              enterKeyHint="send"
            />
          </div>
        )}
      </div>

      {/* Global bar */}
      {globalCells.length > 0 && (
        <div ref={globalBarRef}>
          <CAAGlobalBar cells={globalCells} onCellTap={handleTap} />
        </div>
      )}

      {/* Grid */}
      <div ref={gridRef} className="flex-1 flex items-center justify-center px-2 py-2">
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, ${cellPx}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${cellPx}px)`,
          gap: GAP,
        }}>
          {QUICK_CELLS.map((cell, i) => (
            <Cell key={cell.id} cell={cell} px={cellPx} onTap={handleTap} settings={boardSettings}
              highlight={tappedId === cell.id}
              scanFocus={isActive(i)}
              scanInactive={isScanning && !isActive(i)}
              displayLabel={wf.resolveDisplayText(cell)}
              gridCol={`${cell.position_col + 1} / span 1`}
              gridRow={`${cell.position_row + 1} / span 1`} />
          ))}
          {fillerPositions.map(({ r, c }) => (
            <div key={`e-${r}-${c}`}
              className="rounded-2xl border-2 border-dashed border-border/30 bg-white/40"
              style={{ gridColumn: `${c + 1} / span 1`, gridRow: `${r + 1} / span 1` }} />
          ))}
        </div>
      </div>

      {/* ─── Settings Panel ───────────────────────────────────── */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-black/85" onClick={() => setShowSettings(false)} />
            <motion.div
              initial={{ scale: 0.92, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 10, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl shadow-lg"
              style={{ background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)' }}
            >
              <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.2) 100%)',
                border: '1px solid rgba(255,255,255,0.8)',
              }} />
              <div className="relative p-5 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="heading-section">⚙️ Configuración</h2>
                  <button onClick={() => setShowSettings(false)}
                    className="w-9 h-9 rounded-xl hover:bg-black/5 flex items-center justify-center text-text-muted text-lg font-bold transition-colors">✕</button>
                </div>

                {/* Voice */}
                <div className="pb-4 border-b border-border/60">
                  <h3 className="heading-card mb-3">🗣️ Voz</h3>
                  <CAASpeechSettings
                    preferredVoice={boardSettings.preferredVoice}
                    voiceRate={boardSettings.voiceRate}
                    voicePitch={boardSettings.voicePitch}
                    autoSpeak={boardSettings.autoSpeak ?? false}
                    onChange={(updates) => {
                      setBoardSettings(s => ({ ...s, ...updates }))
                      if ('autoSpeak' in updates) setAutoSpeak(!!updates.autoSpeak)
                    }}
                  />
                </div>

                {/* Scanning */}
                <div className="pb-4 border-b border-border/60">
                  <h3 className="heading-card mb-3">🔄 Exploración</h3>
                  <CAAScanSettings
                    scanEnabled={boardSettings.scanEnabled}
                    scanAuto={boardSettings.scanAuto}
                    scanTimeoutMs={boardSettings.scanTimeoutMs}
                    scanTimeoutFirstElementFactor={boardSettings.scanTimeoutFirstElementFactor}
                    scanVertical={boardSettings.scanVertical}
                    scanBinary={boardSettings.scanBinary}
                    scanDualSwitch={boardSettings.scanDualSwitch}
                    scanStartWithAction={boardSettings.scanStartWithAction}
                    scanRoundsUntilBack={boardSettings.scanRoundsUntilBack}
                    scanBeepFeedback={boardSettings.scanBeepFeedback}
                    scanReadActive={boardSettings.scanReadActive}
                    scanReadActiveRate={boardSettings.scanReadActiveRate}
                    onChange={(updates) => setBoardSettings(s => ({ ...s, ...updates }))}
                  />
                </div>

                {/* Color scheme */}
                <div className="pb-4 border-b border-border/60">
                  <h3 className="heading-card mb-3">🎨 Colores</h3>
                  <CAAColorSettings
                    colorScheme={boardSettings.colorScheme}
                    colorIntensity={boardSettings.colorIntensity}
                    colorSchemesActivated={boardSettings.colorSchemesActivated}
                    colorMode={boardSettings.colorMode}
                    onChange={(updates) => setBoardSettings(s => ({ ...s, ...updates }))}
                  />
                </div>

                {/* Cell size */}
                <div className="pb-4 border-b border-border/60">
                  <label className="block text-sm font-bold text-text-primary mb-2">Tamaño de celdas</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                      <button key={size}
                        onClick={() => setBoardSettings(s => ({ ...s, cellSize: size }))}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all
                          ${(boardSettings.cellSize ?? 'md') === size
                            ? 'bg-brand text-white' : 'bg-black/[0.04] border-2 border-border/60 text-text-secondary hover:border-brand'}`}>
                        {size.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-text-primary block">Mostrar etiquetas</span>
                      <span className="text-xs text-text-muted">Texto debajo de los pictogramas</span>
                    </div>
                    <button onClick={() => setBoardSettings(s => ({ ...s, showLabels: !s.showLabels }))}
                      className={`w-12 h-6 rounded-full transition-colors ${boardSettings.showLabels !== false ? 'bg-brand' : 'bg-border/60'} relative`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${boardSettings.showLabels !== false ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-text-primary block">Auto-pronunciar</span>
                      <span className="text-xs text-text-muted">Hablar al tocar cada celda</span>
                    </div>
                    <button onClick={() => {
                      const next = !(boardSettings.autoSpeak ?? false)
                      setAutoSpeak(next)
                      setBoardSettings(s => ({ ...s, autoSpeak: next }))
                    }}
                      className={`w-12 h-6 rounded-full transition-colors ${boardSettings.autoSpeak ?? false ? 'bg-brand' : 'bg-border/60'} relative`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${boardSettings.autoSpeak ?? false ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── History Panel ────────────────────────────────────── */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-black/85" onClick={() => setShowHistory(false)} />
            <motion.div
              initial={{ scale: 0.92, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 10, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl shadow-lg"
              style={{ background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)' }}
            >
              <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.2) 100%)',
                border: '1px solid rgba(255,255,255,0.8)',
              }} />
              <div className="relative">
                {historyLoading ? (
                  <div className="p-8 text-center heading-card">Cargando historial...</div>
                ) : (
                  <CAAHistoryPanel history={history} onClose={() => setShowHistory(false)} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Search Overlay ──────────────────────────────────── */}
      {showSearch && (
        <CAASearchOverlay
          onNavigate={(boardId) => router.push(`/herramientas/tablero-caa/tablero/${boardId}`)}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  )
}
