"use client"

import { useRef, useEffect, useState } from "react"
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
  const [optionsOpen, setOptionsOpen] = useState(false)
  const hasTokens = tokens.length > 0
  const hasSecondaryOptions = Boolean(onToggleCollectMode || onToggleAutoSpeak || keyboardMode)
  const removeLast = () => {
    if (!hasTokens) return
    onRemoveAt(tokens.length - 1)
  }

  useEffect(() => {
    if (mode === "separated" && scrollRef.current) {
      scrollRef.current.scrollTo({ left: scrollRef.current.scrollWidth, behavior: "smooth" })
    }
  }, [tokens.length, mode])

  return (
    <div ref={stripRef} className="px-2 pb-1">
      <div
        className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-xl border-2 bg-white p-1.5 shadow-sm transition-all ${
          hasTokens ? "border-brand/40" : "border-dashed border-border/50"
        }`}
      >
        <button
          onClick={speaking ? onStop : onSpeakAll}
          disabled={!speaking && !hasTokens}
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl font-black transition-all active:translate-y-[2px] disabled:opacity-30 ${
            speaking
              ? "border-2 border-red-300 bg-red-50 text-red-600"
              : "bg-brand text-white shadow-[0_4px_0_#3A9A87] active:shadow-none"
          }`}
          title={speaking ? "Parar voz" : "Hablar mensaje"}
          aria-label={speaking ? "Parar voz" : "Hablar mensaje"}
        >
          {speaking ? "⏹" : "▶"}
        </button>

        <div
          ref={scrollRef}
          className={`flex h-[58px] min-w-0 items-center gap-1.5 overflow-x-auto no-scrollbar rounded-xl border-2 border-dashed px-2 ${
            hasTokens ? "border-brand/30 bg-brand-bg/40" : "border-border/60 bg-surface-secondary/20"
          }`}
        >
          {!hasTokens && (
            <p className="w-full truncate text-center text-[11px] font-bold text-text-muted sm:text-xs">
              Toca los pictogramas para construir tu mensaje...
            </p>
          )}

          {hasTokens && mode === "text" && (
            <button
              onClick={removeLast}
              className="min-w-full truncate text-left text-sm font-extrabold text-text-primary active:scale-[0.99]"
              title="Eliminar ultimo pictograma"
            >
              {tokens.map(t => tokenLabel(t)).join(" ")}
            </button>
          )}

          {hasTokens && mode === "separated" && (
            <AnimatePresence mode="popLayout">
              {tokens.map((t, i) => (
                <motion.button
                  key={`${t.id}-${i}`}
                  layout
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 26 }}
                  onClick={() => onRemoveAt(i)}
                  className="inline-flex h-10 max-w-[150px] shrink-0 items-center gap-1 rounded-lg border-2 pl-1 pr-2 text-xs font-black transition-all hover:brightness-95 active:scale-95"
                  style={{ borderColor: t.color, backgroundColor: `${t.color}20` }}
                  title={t.pronunciation ? `Pronunciación: ${t.pronunciation}` : `Eliminar ${tokenLabel(t)}`}
                >
                  {(t.pictogram_keyword || t.imageUrl) && (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded bg-white/70">
                      {t.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.imageUrl} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <Pictogram keyword={t.pictogram_keyword ?? ""} size={28} />
                      )}
                    </span>
                  )}
                  {!t.pictogram_keyword && !t.imageUrl && (
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-sm font-black text-white"
                      style={{ backgroundColor: t.color }}
                    >
                      {tokenLabel(t)[0]}
                    </span>
                  )}
                  <span className="truncate text-text-primary">{tokenLabel(t)}</span>
                </motion.button>
              ))}
            </AnimatePresence>
          )}
        </div>

        <div className="relative flex shrink-0 items-center gap-1.5">
          <button
            onClick={removeLast}
            disabled={!hasTokens}
            className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-orange-200 bg-orange-50 text-2xl text-orange-600 transition-all hover:border-orange-300 hover:bg-orange-100 active:scale-95 disabled:opacity-30"
            title="Eliminar ultimo pictograma"
            aria-label="Eliminar ultimo pictograma"
          >
            ⌫
          </button>
          <button
            onClick={onClear}
            disabled={!hasTokens}
            className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-red-200 bg-red-50 text-2xl text-red-600 transition-all hover:border-red-300 hover:bg-red-100 active:scale-95 disabled:opacity-30"
            title="Limpiar mensaje"
            aria-label="Limpiar mensaje"
          >
            🗑
          </button>
          {hasSecondaryOptions && (
            <>
              <button
                onClick={() => setOptionsOpen(p => !p)}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 text-lg font-black transition-all active:scale-95 ${
                  optionsOpen ? "border-brand bg-brand-bg text-brand" : "border-border bg-white text-text-muted hover:border-brand hover:text-brand"
                }`}
                title="Mas opciones"
                aria-label="Mas opciones"
              >
                ⋯
              </button>
              <AnimatePresence>
                {optionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.14 }}
                    className="absolute right-0 top-[calc(100%+6px)] z-30 w-56 rounded-xl border-2 border-border bg-white p-2 shadow-lg"
                  >
                    <div className="grid gap-1.5">
                      {onToggleCollectMode && (
                        <button
                          onClick={() => {
                            onToggleCollectMode()
                            setOptionsOpen(false)
                          }}
                          className="flex min-h-11 items-center justify-between rounded-lg px-3 text-sm font-bold text-text-primary transition-colors hover:bg-surface-hover"
                        >
                          <span>Modo de mensaje</span>
                          <span className="rounded-md bg-surface-secondary px-2 py-1 text-xs">
                            {mode === "separated" ? "Pictos" : "Texto"}
                          </span>
                        </button>
                      )}
                      {onToggleAutoSpeak && (
                        <button
                          onClick={() => {
                            onToggleAutoSpeak()
                            setOptionsOpen(false)
                          }}
                          className="flex min-h-11 items-center justify-between rounded-lg px-3 text-sm font-bold text-text-primary transition-colors hover:bg-surface-hover"
                        >
                          <span>Auto-voz</span>
                          <span className={`rounded-md px-2 py-1 text-xs ${autoSpeak ? "bg-brand-bg text-brand" : "bg-surface-secondary text-text-muted"}`}>
                            {autoSpeak ? "Activa" : "Inactiva"}
                          </span>
                        </button>
                      )}
                      {keyboardMode && hasTokens && (
                        <>
                          <button
                            onClick={() => {
                              onRemoveWord()
                              setOptionsOpen(false)
                            }}
                            className="flex min-h-11 items-center justify-between rounded-lg px-3 text-sm font-bold text-text-primary transition-colors hover:bg-surface-hover"
                          >
                            <span>Borrar palabra</span>
                            <span className="text-lg text-orange-500">⌫</span>
                          </button>
                          <button
                            onClick={() => {
                              onRemoveChar()
                              setOptionsOpen(false)
                            }}
                            className="flex min-h-11 items-center justify-between rounded-lg px-3 text-sm font-bold text-text-primary transition-colors hover:bg-surface-hover"
                          >
                            <span>Borrar caracter</span>
                            <span className="text-lg text-orange-500">←</span>
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
