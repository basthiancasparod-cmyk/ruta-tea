"use client"

interface CAAScanSettingsProps {
  scanEnabled?: boolean
  scanAuto?: boolean
  scanTimeoutMs?: number
  scanTimeoutFirstElementFactor?: number
  scanVertical?: boolean
  scanBinary?: boolean
  scanStartWithAction?: boolean
  scanRoundsUntilBack?: number
  scanBeepFeedback?: boolean
  scanReadActive?: boolean
  scanReadActiveRate?: number
  scanDualSwitch?: boolean
  onChange: (updates: Record<string, unknown>) => void
}

export function CAAScanSettings({
  scanEnabled, scanAuto, scanTimeoutMs, scanTimeoutFirstElementFactor,
  scanVertical, scanBinary, scanStartWithAction, scanRoundsUntilBack,
  scanBeepFeedback, scanReadActive, scanReadActiveRate, scanDualSwitch,
  onChange,
}: CAAScanSettingsProps) {
  const enabled = scanEnabled ?? false

  return (
    <div className="space-y-4">
      {/* Master toggle */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-bold text-text-primary block">
            Exploración (scanning)
          </span>
          <span className="text-xs text-text-muted">
            Navegar celdas con teclado/interruptor
          </span>
        </div>
        <button
          onClick={() => onChange({ scanEnabled: !enabled })}
          className={`w-12 h-6 rounded-full transition-colors ${
            enabled ? "bg-brand" : "bg-border"
          } relative`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${
              enabled ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <>
          {/* Auto vs Step */}
          <div>
            <span className="block text-sm font-bold text-text-primary mb-2">Modo</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onChange({ scanAuto: false })}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border-2 ${
                  !scanAuto
                    ? "bg-brand text-white border-brand"
                    : "bg-surface text-text-secondary border-border hover:border-brand"
                }`}
              >
                Paso a paso
              </button>
              <button
                onClick={() => onChange({ scanAuto: true })}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border-2 ${
                  scanAuto
                    ? "bg-brand text-white border-brand"
                    : "bg-surface text-text-secondary border-border hover:border-brand"
                }`}
              >
                Automático
              </button>
            </div>
          </div>

          {/* Speed (auto mode) */}
          {scanAuto && (
            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">
                Velocidad: {(scanTimeoutMs ?? 1000) / 1000}s
              </label>
              <input
                type="range" min="300" max="5000" step="100"
                value={scanTimeoutMs ?? 1000}
                onChange={(e) => onChange({ scanTimeoutMs: parseInt(e.target.value) })}
                className="w-full accent-brand"
              />
              <div className="flex justify-between text-xs text-text-muted mt-1">
                <span>Rápido</span>
                <span>Lento</span>
              </div>
            </div>
          )}

          {/* First element factor */}
          {scanAuto && (
            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">
                Pausa extra 1er elemento: {scanTimeoutFirstElementFactor?.toFixed(1) ?? "1.0"}x
              </label>
              <input
                type="range" min="1" max="5" step="0.5"
                value={scanTimeoutFirstElementFactor ?? 1}
                onChange={(e) => onChange({ scanTimeoutFirstElementFactor: parseFloat(e.target.value) })}
                className="w-full accent-brand"
              />
            </div>
          )}

          {/* Scan direction */}
          <div>
            <span className="block text-sm font-bold text-text-primary mb-2">Dirección</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onChange({ scanVertical: false })}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border-2 ${
                  !scanVertical
                    ? "bg-brand text-white border-brand"
                    : "bg-surface text-text-secondary border-border hover:border-brand"
                }`}
              >
                Filas ↕
              </button>
              <button
                onClick={() => onChange({ scanVertical: true })}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border-2 ${
                  scanVertical
                    ? "bg-brand text-white border-brand"
                    : "bg-surface text-text-secondary border-border hover:border-brand"
                }`}
              >
                Columnas ↔
              </button>
            </div>
          </div>

          {/* Binary scanning */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-text-primary block">Escaneo binario</span>
              <span className="text-xs text-text-muted">Divide grupos en mitades</span>
            </div>
            <button
              onClick={() => onChange({ scanBinary: !scanBinary })}
              className={`w-12 h-6 rounded-full transition-colors ${scanBinary ? "bg-brand" : "bg-border"} relative`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${scanBinary ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          {/* Dual switch */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-text-primary block">Dos pulsadores</span>
              <span className="text-xs text-text-muted">Teclas separadas para avanzar/seleccionar</span>
            </div>
            <button
              onClick={() => onChange({ scanDualSwitch: !scanDualSwitch })}
              className={`w-12 h-6 rounded-full transition-colors ${scanDualSwitch ? "bg-brand" : "bg-border"} relative`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${scanDualSwitch ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          {/* Start with action */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-text-primary block">Esperar acción para iniciar</span>
              <span className="text-xs text-text-muted">No iniciar automáticamente</span>
            </div>
            <button
              onClick={() => onChange({ scanStartWithAction: !scanStartWithAction })}
              className={`w-12 h-6 rounded-full transition-colors ${scanStartWithAction ? "bg-brand" : "bg-border"} relative`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${scanStartWithAction ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          {/* Rounds until back */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">
              Ciclos antes de reiniciar: {scanRoundsUntilBack ?? 3}
            </label>
            <input
              type="range" min="1" max="10" step="1"
              value={scanRoundsUntilBack ?? 3}
              onChange={(e) => onChange({ scanRoundsUntilBack: parseInt(e.target.value) })}
              className="w-full accent-brand"
            />
          </div>

          {/* Audio feedback */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-text-primary block">Sonido al avanzar</span>
              <span className="text-xs text-text-muted">Beep al cambiar de elemento</span>
            </div>
            <button
              onClick={() => onChange({ scanBeepFeedback: !scanBeepFeedback })}
              className={`w-12 h-6 rounded-full transition-colors ${scanBeepFeedback ? "bg-brand" : "bg-border"} relative`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${scanBeepFeedback ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          {/* Read aloud */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-text-primary block">Leer en voz alta</span>
              <span className="text-xs text-text-muted">Lee la celda al enfocarse</span>
            </div>
            <button
              onClick={() => onChange({ scanReadActive: !scanReadActive })}
              className={`w-12 h-6 rounded-full transition-colors ${scanReadActive ? "bg-brand" : "bg-border"} relative`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${scanReadActive ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          {/* Read rate */}
          {scanReadActive && (
            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">
                Velocidad de lectura: {scanReadActiveRate?.toFixed(1) ?? "1.0"}
              </label>
              <input
                type="range" min="0.3" max="3" step="0.1"
                value={scanReadActiveRate ?? 1}
                onChange={(e) => onChange({ scanReadActiveRate: parseFloat(e.target.value) })}
                className="w-full accent-brand"
              />
            </div>
          )}

          {/* Instructions */}
          <div className="p-3 rounded-xl bg-surface-secondary border border-border text-xs text-text-muted space-y-1">
            <p className="font-bold text-text-primary">Cómo usar:</p>
            {scanDualSwitch ? (
              <>
                <p>• <kbd className="px-1 py-0.5 rounded bg-border text-text-secondary font-mono text-[10px]">← →</kbd> mover entre elementos</p>
                <p>• <kbd className="px-1 py-0.5 rounded bg-border text-text-secondary font-mono text-[10px]">Espacio</kbd> o <kbd className="px-1 py-0.5 rounded bg-border text-text-secondary font-mono text-[10px]">Enter</kbd> seleccionar</p>
              </>
            ) : (
              <>
                <p>• <kbd className="px-1 py-0.5 rounded bg-border text-text-secondary font-mono text-[10px]">Espacio</kbd> pulso corto → siguiente</p>
                <p>• <kbd className="px-1 py-0.5 rounded bg-border text-text-secondary font-mono text-[10px]">Espacio</kbd> mantener (400ms) → seleccionar</p>
              </>
            )}
            {scanAuto && <p>• El avance es automático. Solo presiona para seleccionar.</p>}
            {!scanAuto && !scanDualSwitch && <p>• <kbd className="px-1 py-0.5 rounded bg-border text-text-secondary font-mono text-[10px]">← →</kbd> mover manualmente</p>}
            {scanStartWithAction && <p>• Presiona <kbd className="px-1 py-0.5 rounded bg-border text-text-secondary font-mono text-[10px]">Espacio</kbd> para iniciar.</p>}
          </div>
        </>
      )}
    </div>
  )
}
