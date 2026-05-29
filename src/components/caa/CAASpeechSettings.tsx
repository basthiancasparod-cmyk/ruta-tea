"use client"

import { useState, useEffect, useCallback } from "react"
import { initVoices, getVoicesGroupedByLang, speakText, findBestVoice } from "@/lib/caa/speechService"

interface CAASpeechSettingsProps {
  preferredVoice?: string
  voiceRate?: number
  voicePitch?: number
  autoSpeak?: boolean
  onChange: (updates: Record<string, unknown>) => void
}

export function CAASpeechSettings({
  preferredVoice, voiceRate, voicePitch, autoSpeak,
  onChange,
}: CAASpeechSettingsProps) {
  const [voiceGroups, setVoiceGroups] = useState<ReturnType<typeof getVoicesGroupedByLang>>([])
  const [voiceLoaded, setVoiceLoaded] = useState(false)

  useEffect(() => {
    initVoices().then(() => {
      setVoiceGroups(getVoicesGroupedByLang())
      setVoiceLoaded(true)
    })
  }, [])

  const handleTestVoice = useCallback(() => {
    const v = findBestVoice(undefined, preferredVoice)
    const text = v
      ? `Hola, soy ${v.name}. Esta es mi voz.`
      : "Hola, esta es una prueba de voz."
    speakText(text, { voice: preferredVoice, rate: voiceRate ?? 1, pitch: voicePitch ?? 1 })
  }, [preferredVoice, voiceRate, voicePitch])

  return (
    <div className="space-y-4">
      {/* Voice selector */}
      <div>
        <label className="block text-sm font-bold text-text-primary mb-2">
          Voz preferida
        </label>
        <select
          value={preferredVoice ?? ""}
          onChange={(e) => onChange({ preferredVoice: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border-2 border-border bg-surface text-text-primary text-sm"
        >
          <option value="">Automática (recomendado)</option>
          {voiceGroups.map((g) => (
            <optgroup key={g.lang} label={g.lang}>
              {g.voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {!voiceLoaded && (
          <p className="text-xs text-text-muted mt-1">Cargando voces...</p>
        )}
      </div>

      {/* Test button */}
      <button
        onClick={handleTestVoice}
        disabled={!voiceLoaded}
        className="w-full px-3 py-2 rounded-lg border-2 border-border bg-surface text-text-primary text-sm font-bold hover:border-brand disabled:opacity-50 transition-colors"
      >
        Probar voz
      </button>

      {/* Voice Rate */}
      <div>
        <label className="block text-sm font-bold text-text-primary mb-2">
          Velocidad: {voiceRate?.toFixed(1) ?? 1.0}
        </label>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={voiceRate ?? 1.0}
          onChange={(e) => onChange({ voiceRate: parseFloat(e.target.value) })}
          className="w-full accent-brand"
        />
        <div className="flex justify-between text-xs text-text-muted mt-1">
          <span>Lento</span>
          <span>Normal</span>
          <span>Rápido</span>
        </div>
      </div>

      {/* Voice Pitch */}
      <div>
        <label className="block text-sm font-bold text-text-primary mb-2">
          Tono: {voicePitch?.toFixed(1) ?? 1.0}
        </label>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={voicePitch ?? 1.0}
          onChange={(e) => onChange({ voicePitch: parseFloat(e.target.value) })}
          className="w-full accent-brand"
        />
        <div className="flex justify-between text-xs text-text-muted mt-1">
          <span>Grave</span>
          <span>Normal</span>
          <span>Agudo</span>
        </div>
      </div>

      {/* Auto-speak toggle */}
      {autoSpeak !== undefined && (
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-text-primary block">
              Auto-pronunciar
            </span>
            <span className="text-xs text-text-muted">
              Hablar al tocar cada celda
            </span>
          </div>
          <button
            onClick={() => onChange({ autoSpeak: !autoSpeak })}
            className={`w-12 h-6 rounded-full transition-colors ${
              autoSpeak ? "bg-brand" : "bg-border"
            } relative`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${
                autoSpeak ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      )}
    </div>
  )
}
