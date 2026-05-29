"use client"

import { COLOR_SCHEMES, COLOR_INTENSITIES } from "@/types/colors"
import type { ColorIntensity, ColorMode, SchemeName } from "@/types/colors"

interface CAAColorSettingsProps {
  colorScheme?: string
  colorIntensity?: ColorIntensity
  colorSchemesActivated?: boolean
  colorMode?: ColorMode
  onChange: (updates: Record<string, unknown>) => void
}

export function CAAColorSettings({
  colorScheme, colorIntensity, colorSchemesActivated,
  colorMode, onChange,
}: CAAColorSettingsProps) {
  const active = colorSchemesActivated !== false
  const scheme = active && colorScheme
    ? COLOR_SCHEMES[colorScheme as SchemeName]
    : undefined

  return (
    <div className="space-y-4">
      {/* Master toggle */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-bold text-text-primary block">
            Esquemas de color
          </span>
          <span className="text-xs text-text-muted">
            Colorear celdas por categoría gramatical
          </span>
        </div>
        <button
          onClick={() => onChange({ colorSchemesActivated: !active })}
          className={`w-12 h-6 rounded-full transition-colors ${
            active ? "bg-brand" : "bg-border"
          } relative`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${
              active ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {active && (
        <>
          {/* Scheme selector */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">
              Esquema
            </label>
            <select
              value={colorScheme ?? "CS_MODIFIED_FITZGERALD_KEY"}
              onChange={(e) => onChange({ colorScheme: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border-2 border-border bg-surface text-text-primary text-sm"
            >
              {Object.entries(COLOR_SCHEMES).map(([key, scheme]) => (
                <option key={key} value={key}>{scheme.label}</option>
              ))}
            </select>
          </div>

          {/* Intensity selector */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">
              Intensidad
            </label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_INTENSITIES.map((int) => (
                <button
                  key={int.key}
                  onClick={() => onChange({ colorIntensity: int.key })}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all border-2 ${
                    (colorIntensity ?? "LIGHT") === int.key
                      ? "bg-brand text-white border-brand"
                      : "bg-surface text-text-secondary border-border hover:border-brand"
                  }`}
                >
                  {int.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color mode */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">
              Modo de color
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: "BACKGROUND" as ColorMode, label: "Fondo" },
                { key: "BORDER" as ColorMode, label: "Borde" },
                { key: "BOTH" as ColorMode, label: "Ambos" },
              ]).map((m) => (
                <button
                  key={m.key}
                  onClick={() => onChange({ colorMode: m.key })}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all border-2 ${
                    (colorMode ?? "BACKGROUND") === m.key
                      ? "bg-brand text-white border-brand"
                      : "bg-surface text-text-secondary border-border hover:border-brand"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color preview */}
          {scheme && (
            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">
                Vista previa
              </label>
              <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface-secondary border border-border">
                {scheme.categories.map((cat, i) => {
                  const intensity = colorIntensity ?? "LIGHT"
                  const c = scheme.colors[intensity]?.[i] ?? "#ccc"
                  return (
                    <div key={cat.key}
                      className="flex items-center gap-2 px-2 py-1 rounded-lg text-[10px] font-bold"
                      style={{ backgroundColor: c, color: ["#000000","#ffffff","#464646","#747474","#a3a3a3","#d1d1d1"].includes(c) ? "#1A202C" : c }}
                    >
                      <span className="w-3 h-3 rounded shrink-0" style={{ backgroundColor: c, border: "1px solid rgba(0,0,0,0.15)" }} />
                      <span>{cat.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
