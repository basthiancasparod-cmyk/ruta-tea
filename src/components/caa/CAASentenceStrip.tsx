"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { MessageToken } from "@/types/caa"
import { Button } from "@/components/ui/Button"
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
  return (
    <div className="flex flex-col gap-3">
      {/* Strip */}
      <div className={`bg-white rounded-2xl shadow-sm border-2 border-dashed p-4 min-h-[80px] transition-colors ${tokens.length ? "border-brand/50" : "border-border"}`}>
        {tokens.length === 0
          ? <p className="text-text-muted text-sm font-medium flex items-center justify-center h-full pt-2">Toca los pictogramas para construir tu mensaje…</p>
          : (
            <AnimatePresence mode="popLayout">
              <div className="flex flex-wrap gap-2">
                {tokens.map((t, i) => (
                  <motion.button key={`${t.id}-${i}`} layout initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    onClick={() => { playSound("click"); onRemove(i) }}
                    className="inline-flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-xl text-sm font-bold border-2 bg-white hover:brightness-95 active:scale-95 transition-all"
                    style={{ borderColor: t.color, backgroundColor: `${t.color}18` }}
                    title={`Quitar "${t.label}"`}
                  >
                    <span className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: t.color }}>
                      <span className="text-white text-[9px] font-black">{t.label[0]}</span>
                    </span>
                    <span className="text-text-primary">{t.label}</span>
                    <span className="text-text-muted text-xs">✕</span>
                  </motion.button>
                ))}
              </div>
            </AnimatePresence>
          )
        }
      </div>

      {/* Controls */}
      <div className="flex gap-2 items-center flex-wrap">
        <Button variant="primary" size="md" disabled={tokens.length === 0} onClick={onSpeak}>
          🔊 Hablar
        </Button>
        <AnimatePresence>
          {isSpeaking && onStop && (
            <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}>
              <Button variant="outline" size="md" onClick={onStop}>⏹ Parar</Button>
            </motion.div>
          )}
        </AnimatePresence>
        <Button variant="outline" size="md" onClick={onClear} disabled={tokens.length === 0}>🗑 Limpiar</Button>
        <span className="ml-auto text-xs font-bold text-text-muted">{tokens.length} {tokens.length === 1 ? "palabra" : "palabras"}</span>
      </div>
    </div>
  )
}
