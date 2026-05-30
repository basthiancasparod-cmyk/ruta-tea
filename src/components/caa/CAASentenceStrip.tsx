"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { MessageToken } from "@/types/caa"
import { playSound } from "@/lib/sounds"

interface Props {
  tokens: MessageToken[]
  onRemove: (i: number) => void
  onClear: () => void
  onSpeak: () => void
  isSpeaking?: boolean
  onStop?: () => void
}

export function CAASentenceStrip({ tokens, onRemove, onClear, onSpeak, isSpeaking, onStop }: Props) {
  const hasTokens = tokens.length > 0
  const removeLast = () => {
    if (!hasTokens) return
    playSound("click")
    onRemove(tokens.length - 1)
  }
  const handleSpeakToggle = () => {
    if (!hasTokens) return
    playSound("click")
    if (isSpeaking && onStop) onStop()
    else onSpeak()
  }
  const clearAll = () => {
    if (!hasTokens) return
    playSound("click")
    onClear()
  }

  return (
    <div
      className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border-2 bg-white p-2 shadow-sm transition-colors ${
        hasTokens ? "border-brand/50" : "border-border"
      }`}
    >
      <button
        type="button"
        disabled={!hasTokens}
        onClick={handleSpeakToggle}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand text-2xl text-white shadow-[0_3px_0_#00856A] transition-all active:translate-y-[2px] active:shadow-none disabled:bg-surface-secondary disabled:text-text-muted disabled:shadow-none"
        title={isSpeaking ? "Parar voz" : "Hablar mensaje"}
        aria-label={isSpeaking ? "Parar voz" : "Hablar mensaje"}
      >
        {isSpeaking ? "■" : "▶"}
      </button>

      <div className="min-w-0">
        <div
          className={`flex h-[52px] items-center gap-2 overflow-x-auto rounded-xl border-2 border-dashed px-2 ${
            hasTokens ? "border-brand/40 bg-brand-bg/40" : "border-border bg-surface-secondary/20"
          }`}
        >
          {tokens.length === 0 ? (
            <p className="w-full truncate text-center text-xs font-bold text-text-muted sm:text-sm">
              Toca los pictogramas para construir tu mensaje...
            </p>
          ) : (
            <AnimatePresence mode="popLayout">
              {tokens.map((t, i) => (
                <motion.button
                  key={`${t.id}-${i}`}
                  layout
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={() => {
                    playSound("click")
                    onRemove(i)
                  }}
                  className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border-2 bg-white pl-1.5 pr-2 text-xs font-black transition-all hover:brightness-95 active:scale-95"
                  style={{ borderColor: t.color, backgroundColor: `${t.color}18` }}
                  title={`Quitar "${t.label}"`}
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-black text-white"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.label[0]}
                  </span>
                  <span className="max-w-[92px] truncate text-text-primary">{t.label}</span>
                </motion.button>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          disabled={!hasTokens}
          onClick={removeLast}
          className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-border bg-white text-2xl transition-all hover:bg-surface-hover active:scale-95 disabled:opacity-40"
          title="Eliminar ultimo pictograma"
          aria-label="Eliminar ultimo pictograma"
        >
          ⌫
        </button>
        <button
          type="button"
          disabled={!hasTokens}
          onClick={clearAll}
          className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-border bg-white text-2xl transition-all hover:bg-surface-hover active:scale-95 disabled:opacity-40"
          title="Limpiar mensaje"
          aria-label="Limpiar mensaje"
        >
          🗑
        </button>
      </div>
    </div>
  )
}
