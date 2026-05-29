"use client"

import { motion } from "framer-motion"
import { Pictogram } from "@/components/ui/Pictogram"
import { resolveCellColors } from "@/types/colors"
import type { CAACell, CAABoardSettings } from "@/types/caa"
import { playSound, vibrate } from "@/lib/sounds"

const SIZE_MAP = { sm: 72, md: 88, lg: 108, xl: 128 }
const CELL_DIM = {
  sm: "w-[88px] h-[88px]",
  md: "w-[108px] h-[108px]",
  lg: "w-[132px] h-[132px]",
  xl: "w-[156px] h-[156px]",
}

interface CAACellProps {
  cell: CAACell
  size?: "sm" | "md" | "lg" | "xl"
  showLabels?: boolean
  onClick?: (cell: CAACell) => void
  isSelected?: boolean
  isEditing?: boolean
  onEdit?: () => void
  className?: string
  fillGrid?: boolean
  boardSettings?: CAABoardSettings
}

export function CAACellComponent({
  cell,
  size = "md",
  showLabels = true,
  onClick,
  isSelected,
  isEditing,
  onEdit,
  className = "",
  fillGrid,
  boardSettings,
}: CAACellProps) {
  const cr = resolveCellColors(cell, boardSettings)
  const picSize = SIZE_MAP[size]

  const handle = () => {
    playSound("click")
    vibrate("click")
    onClick?.(cell)
  }

  return (
    <motion.button
      onClick={handle}
      onDoubleClick={isEditing ? onEdit : undefined}
      whileTap={{ scale: 0.93 }}
      className={`
        group relative flex flex-col items-center justify-between
        p-2 pt-3 rounded-2xl border-[3px]
        transition-all duration-150 select-none
        ${fillGrid ? "w-full h-full min-w-0 min-h-0" : CELL_DIM[size]}
        ${isSelected
          ? "ring-4 ring-brand shadow-lg scale-105"
          : "hover:shadow-md hover:scale-[1.03]"
        }
        ${className}
      `}
      style={{
        backgroundColor: cr.bg,
        borderColor: cr.border,
      }}
      aria-label={cell.label}
    >
      {/* Color dot */}
      {(cell.fitzgerald_key || cell.colorCategory) && (
        <span
          className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full opacity-80"
          style={{ backgroundColor: cr.border }}
        />
      )}

      {/* Folder badge */}
      {cell.is_folder && (
        <span className="absolute top-1 right-1 text-[10px]">📁</span>
      )}

      {/* Pictogram */}
      <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
        {cell.custom_image_url ? (
          <img
            src={cell.custom_image_url}
            alt={cell.label}
            className="w-full h-full object-contain rounded-lg"
          />
        ) : cell.pictogram_keyword ? (
          <Pictogram
            keyword={cell.pictogram_keyword}
            size={picSize}
            className="w-full h-full"
          />
        ) : (
          <span className="text-4xl opacity-30">❓</span>
        )}
      </div>

      {/* Label */}
      {showLabels && (
        <span
          className="text-[11px] font-extrabold text-center leading-tight line-clamp-2 w-full px-0.5 mt-1"
          style={{ color: cr.text }}
        >
          {cell.label}
        </span>
      )}

      {/* Edit overlay */}
      {isEditing && (
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 bg-black/15 transition-opacity flex items-center justify-center">
          <span className="text-white text-[10px] font-bold bg-black/60 px-2 py-1 rounded-lg">
            ✏️ Editar
          </span>
        </div>
      )}
    </motion.button>
  )
}