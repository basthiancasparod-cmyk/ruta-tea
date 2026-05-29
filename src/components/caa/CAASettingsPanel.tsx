'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useCAABoardMutations } from '@/lib/hooks/useCAA'
import type { CAABoard } from '@/types/caa'
import { CAASpeechSettings } from './CAASpeechSettings'
import { CAAColorSettings } from './CAAColorSettings'
import { CAAScanSettings } from './CAAScanSettings'

interface CAASettingsPanelProps {
  board: CAABoard
  onClose: () => void
  onSaved?: () => void
}

export function CAASettingsPanel({ board, onClose, onSaved }: CAASettingsPanelProps) {
  const { updateBoard } = useCAABoardMutations()
  const [settings, setSettings] = useState(board.settings)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateBoard(board.id, { settings })
      onSaved?.()
      onClose()
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error al guardar configuración')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card variant="bordered" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-text-primary">
            ⚙️ Configuración
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-surface-secondary flex items-center justify-center text-text-muted"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Speech Settings */}
          <div className="pb-3 border-b border-border">
            <h3 className="text-sm font-extrabold text-text-primary mb-3">🗣️ Voz</h3>
            <CAASpeechSettings
              preferredVoice={settings.preferredVoice}
              voiceRate={settings.voiceRate}
              voicePitch={settings.voicePitch}
              autoSpeak={settings.autoSpeak}
              onChange={(updates) => setSettings({ ...settings, ...updates })}
            />
          </div>

          {/* Scanning Settings */}
          <div className="pb-3 border-b border-border">
            <h3 className="text-sm font-extrabold text-text-primary mb-3">🔄 Exploración</h3>
            <CAAScanSettings
              scanEnabled={settings.scanEnabled}
              scanAuto={settings.scanAuto}
              scanTimeoutMs={settings.scanTimeoutMs}
              scanTimeoutFirstElementFactor={settings.scanTimeoutFirstElementFactor}
              scanVertical={settings.scanVertical}
              scanBinary={settings.scanBinary}
              scanDualSwitch={settings.scanDualSwitch}
              scanStartWithAction={settings.scanStartWithAction}
              scanRoundsUntilBack={settings.scanRoundsUntilBack}
              scanBeepFeedback={settings.scanBeepFeedback}
              scanReadActive={settings.scanReadActive}
              scanReadActiveRate={settings.scanReadActiveRate}
              onChange={(updates) => setSettings({ ...settings, ...updates })}
            />
          </div>

          {/* Global Grid Settings */}
          <div className="pb-3 border-b border-border">
            <h3 className="text-sm font-extrabold text-text-primary mb-3">🌐 Barra Global</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-text-primary block">
                    Mostrar barra global
                  </span>
                  <span className="text-xs text-text-muted">
                    Botones de navegación persistentes
                  </span>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, globalGridActive: !settings.globalGridActive })}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.globalGridActive ? 'bg-brand' : 'bg-border'} relative`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${settings.globalGridActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Color Scheme Settings */}
          <div className="pb-3 border-b border-border">
            <h3 className="text-sm font-extrabold text-text-primary mb-3">🎨 Colores</h3>
            <CAAColorSettings
              colorScheme={settings.colorScheme}
              colorIntensity={settings.colorIntensity}
              colorSchemesActivated={settings.colorSchemesActivated}
              colorMode={settings.colorMode}
              onChange={(updates) => setSettings({ ...settings, ...updates })}
            />
          </div>

          {/* Cell Size */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">
              Tamaño de celdas
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setSettings({ ...settings, cellSize: size })}
                  className={`
                    px-3 py-2 rounded-lg text-xs font-bold transition-all
                    ${settings.cellSize === size
                      ? 'bg-brand text-white'
                      : 'bg-surface border-2 border-border text-text-secondary hover:border-brand'
                    }
                  `}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-text-primary block">
                  Mostrar etiquetas
                </span>
                <span className="text-xs text-text-muted">
                  Texto debajo de los pictogramas
                </span>
              </div>
              <button
                onClick={() =>
                  setSettings({ ...settings, showLabels: !settings.showLabels })
                }
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.showLabels ? 'bg-brand' : 'bg-border'
                } relative`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${
                    settings.showLabels ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-text-primary block">
                  Resaltar al presionar
                </span>
                <span className="text-xs text-text-muted">
                  Feedback visual al tocar
                </span>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    highlightOnPress: !settings.highlightOnPress,
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.highlightOnPress ? 'bg-brand' : 'bg-border'
                } relative`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${
                    settings.highlightOnPress ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button variant="outline" size="md" onClick={onClose} fullWidth>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              disabled={isSaving}
              fullWidth
            >
              {isSaving ? '⏳ Guardando...' : '💾 Guardar'}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}