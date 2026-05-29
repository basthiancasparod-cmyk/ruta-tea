"use client"

import { useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Pictogram } from "@/components/ui/Pictogram"
import { effectiveCollectMode, type CollectToken } from "@/lib/caa/collectBar"
import type { CollectMode } from "@/types/caa"

interface StripProps {
  tokens: CollectToken[]
  speaking: boolean
  keyboardMode: boolean
  collectMode?: CollectMode
  autoSpeak?: boolean
  onSpeakAll: () => void
  onStop: () => void
  onClear: () => void
  onRemoveAt: (i: number) => void
  onRemoveWord: () => void
  onRemoveChar: () => void
  onToggleCollectMode?: () => void
  onToggleAutoSpeak?: () => void
  stripRef?: React.RefObject<HTMLDivElement | null>
}

function tokenLabel(t: CollectToken): string {
  return t.vocalization ?? t.pronunciation ?? t.label
}

export default function CAAStrip({
  tokens, speaking, keyboardMode, collectMode = "auto", autoSpeak = false,
  onSpeakAll, onStop, onClear, onRemoveAt,
  onRemoveWord, onRemoveChar,
  onToggleCollectMode, onToggleAutoSpeak,
  stripRef,
}: StripProps) {
  const mode = effectiveCollectMode(collectMode, tokens)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mode === "separated" && scrollRef.current) {
      scrollRef.current.scrollTo({ left: scrollRef.current.scrollWidth, behavior: "smooth" })
    }
  }, [tokens.length, mode])

  return (
    <div ref={stripRef} className="px-2 pb-1">
      <div className={`
        flex flex-col rounded-xl border-2 bg-white transition-all overflow-hidden
        ${tokens.length ? "border-brand/40" : "border-dashed border-border/50"}
      `}>
        {/* Empty state */}
        {tokens.length === 0 && (
          <div className="flex items-center justify-center min-h-[44px] px-3">
            <p className="text-[11px] text-text-muted font-medium">
              Toca los pictogramas para construir tu mensaje…
            </p>
          </div>
        )}

        {/* Tokens area */}
        {tokens.length > 0 && mode === "text" && (
          <div className="px-3 py-2 min-h-[44px] flex items-center overflow-x-auto no-scrollbar">
            <span className="text-sm font-bold text-text-primary whitespace-nowrap">
              {tokens.map(t => tokenLabel(t)).join(" ")}
            </span>
          </div>
        )}

        {tokens.length > 0 && mode === "separated" && (
          <div ref={scrollRef} className="overflow-x-auto no-scrollbar max-h-[120px]">
            <AnimatePresence mode="popLayout">
              <div className="flex gap-1 px-2 py-1.5 items-start flex-wrap">
                {tokens.map((t, i) => (
                  <motion.button
                    key={`${t.id}-${i}`}
                    layout
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 26 }}
                    onClick={() => onRemoveAt(i)}
                    className="inline-flex items-center gap-1 rounded-lg text-xs font-bold border-2
                      hover:brightness-95 active:scale-95 transition-all shrink-0 max-w-[160px]"
                    style={{
                      borderColor: t.color,
                      backgroundColor: `${t.color}20`,
                      padding: t.pictogram_keyword || t.imageUrl ? "2px 6px 2px 2px" : "2px 6px 2px 4px",
                    }}
                    title={t.pronunciation ? `Pronunciación: ${t.pronunciation}` : undefined}
                  >
                    {(t.pictogram_keyword || t.imageUrl) && (
                      <span className="w-6 h-6 rounded flex items-center justify-center shrink-0 overflow-hidden">
                        <Pictogram keyword={t.pictogram_keyword ?? ""} size={24} />
                      </span>
                    )}
                    {!t.pictogram_keyword && !t.imageUrl && (
                      <span className="w-4 h-4 rounded flex items-center justify-center text-white text-[9px] font-black shrink-0"
                        style={{ backgroundColor: t.color }}>
                        {tokenLabel(t)[0]}
                      </span>
                    )}
                    <div className="min-w-0">
                      <span className="text-text-primary truncate block">{tokenLabel(t)}</span>
                      {t.pronunciation && (
                        <span className="text-text-muted text-[8px] font-normal truncate block leading-tight">
                          {t.pronunciation}
                        </span>
                      )}
                    </div>
                    <span className="text-text-muted text-[9px] ml-0.5 shrink-0">✕</span>
                  </motion.button>
                ))}
              </div>
            </AnimatePresence>
          </div>
        )}

        {/* Controls bar — botones grandes */}
        <div className="flex items-center gap-2 px-2 py-1.5 border-t border-border/30">
          {/* Left: mode toggles */}
          <div className="flex gap-1">
            {onToggleCollectMode && (
              <button onClick={onToggleCollectMode}
                className="px-3 py-2 rounded-lg text-sm font-bold transition-all min-h-[44px]
                  hover:bg-surface-secondary border-2 border-border"
                title="Cambiar modo de colección">
                {mode === "separated" ? "📷" : "📝"}
              </button>
            )}
            {onToggleAutoSpeak && (
              <button onClick={onToggleAutoSpeak}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-all min-h-[44px] border-2
                  ${autoSpeak ? "bg-brand/10 text-brand border-brand" : "hover:bg-surface-secondary text-text-muted border-border"}`}
                title={autoSpeak ? "Auto-hablar activado" : "Auto-hablar desactivado"}>
                🔊{autoSpeak ? "✓" : ""}
              </button>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Word count */}
          {tokens.length > 0 && (
            <span className="text-[10px] font-bold text-text-muted mr-1">
              {tokens.length} {tokens.length === 1 ? "palabra" : "palabras"}
            </span>
          )}

          {/* Right: action buttons */}
          {keyboardMode && tokens.length > 0 && (
            <>
              <button onClick={onRemoveWord}
                className="px-3 py-2 rounded-lg bg-white border-2 border-border text-text-secondary text-sm hover:border-orange-300 hover:text-orange-500 transition-all min-h-[44px]"
                title="Borrar palabra">
                ⌫
              </button>
              <button onClick={onRemoveChar}
                className="px-3 py-2 rounded-lg bg-white border-2 border-border text-text-secondary text-sm hover:border-orange-300 hover:text-orange-500 transition-all min-h-[44px]"
                title="Borrar carácter">
                ←
              </button>
            </>
          )}
          {speaking ? (
            <button onClick={onStop}
              className="flex items-center px-4 py-2 rounded-lg bg-red-50 border-2 border-red-300 text-red-600 text-sm font-bold hover:bg-red-100 transition-all min-h-[44px]">
              ⏹
            </button>
          ) : (
            <button onClick={onSpeakAll} disabled={!tokens.length}
              className="flex items-center px-4 py-2 rounded-lg bg-brand text-white text-sm font-bold disabled:opacity-25 hover:bg-brand/90 transition-all shadow-[0_3px_0_#3A9A87] active:shadow-none active:translate-y-[2px] min-h-[44px]">
              🔊
            </button>
          )}
          <button onClick={onClear} disabled={!tokens.length}
            className="px-3 py-2 rounded-lg bg-white border-2 border-border text-text-secondary text-sm disabled:opacity-25 hover:border-red-300 hover:text-red-500 transition-all min-h-[44px]"
            title="Limpiar mensaje">
            🗑
          </button>
        </div>
      </div>
    </div>
  )
}
