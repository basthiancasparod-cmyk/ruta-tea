"use client"

import { motion } from "framer-motion"
import type { Suggestion } from "@/lib/caa/usePrediction"

interface CAAPredictionBarProps {
  suggestions: Suggestion[]
  onSelect: (word: string) => void
  loading?: boolean
}

export function CAAPredictionBar({ suggestions, onSelect, loading }: CAAPredictionBarProps) {
  if (!suggestions.length) return null

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="overflow-hidden border-b border-border bg-surface-secondary"
    >
      <div className="flex gap-1.5 px-3 py-1.5 overflow-x-auto no-scrollbar">
        {loading ? (
          <div className="flex gap-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-16 h-8 rounded-lg bg-border/40 animate-pulse" />
            ))}
          </div>
        ) : (
          suggestions.map((s, i) => (
            <motion.button
              key={`${s.word}-${i}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => onSelect(s.word)}
              className="px-3 py-1.5 rounded-lg bg-white border-2 border-brand/40 text-text-primary font-bold text-xs
                whitespace-nowrap hover:bg-brand-bg hover:border-brand transition-all active:bg-brand active:text-white"
            >
              {s.word}
            </motion.button>
          ))
        )}
      </div>
    </motion.div>
  )
}
