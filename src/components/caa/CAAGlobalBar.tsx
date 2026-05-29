"use client"

import { motion } from "framer-motion"
import { Pictogram } from "@/components/ui/Pictogram"
import { type CAACell } from "@/types/caa"
import { resolveCellColors } from "@/types/colors"

interface CAAGlobalBarProps {
  cells: CAACell[]
  onCellTap: (cell: CAACell) => void
}

export function CAAGlobalBar({ cells, onCellTap }: CAAGlobalBarProps) {
  if (!cells.length) return null

  return (
    <div className="sticky top-0 z-20 bg-white border-b-2 border-border shadow-sm">
      <div className="flex gap-1 px-2 py-1.5 overflow-x-auto no-scrollbar">
        {cells.map(cell => {
          const cr = resolveCellColors(cell, undefined)
          return (
            <motion.button
              key={cell.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => onCellTap(cell)}
              className="flex items-center gap-1 rounded-lg border-2 px-2 py-1 shrink-0 transition-all hover:brightness-110 active:brightness-90"
              style={{
                backgroundColor: cr.bg,
                borderColor: cr.border,
              }}
              aria-label={cell.label}
            >
              <Pictogram keyword={cell.pictogram_keyword ?? ""} size={20} />
              <span className="text-[10px] font-bold leading-tight" style={{ color: cr.text }}>
                {cell.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
