'use client'

import type { CAAUsageRecord } from '@/types/caa'

interface CAAHistoryPanelProps {
  history: CAAUsageRecord[]
  onClose: () => void
}

export function CAAHistoryPanel({ history, onClose }: CAAHistoryPanelProps) {
  const messageHistory = history.filter((h) => h.message_text)

  const wordFrequency = history.reduce((acc, record) => {
    const words = record.message_text?.split(' ') || []
    words.forEach((word) => {
      acc[word] = (acc[word] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  const topWords = Object.entries(wordFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  return (
    <>
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-text-primary">
            📊 Historial de Uso
          </h2>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-black/5 flex items-center justify-center text-text-muted text-lg font-bold transition-colors">✕</button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {history.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-sm font-bold text-text-primary">Aún no hay datos de uso</p>
            <p className="text-xs font-medium text-text-secondary mt-1">Empieza a usar el tablero para ver estadísticas</p>
          </div>
        )}

        {history.length > 0 && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-black/[0.04] rounded-xl p-3 text-center">
                <div className="text-2xl font-extrabold text-text-primary">
                  {messageHistory.length}
                </div>
                <div className="text-xs font-bold text-text-secondary mt-1">Mensajes</div>
              </div>
              <div className="bg-black/[0.04] rounded-xl p-3 text-center">
                <div className="text-2xl font-extrabold text-text-primary">
                  {history.length}
                </div>
                <div className="text-xs font-bold text-text-secondary mt-1">Interacciones</div>
              </div>
              <div className="bg-black/[0.04] rounded-xl p-3 text-center">
                <div className="text-2xl font-extrabold text-text-primary">
                  {Object.keys(wordFrequency).length}
                </div>
                <div className="text-xs font-bold text-text-secondary mt-1">Palabras únicas</div>
              </div>
            </div>

            {/* Top Words */}
            {topWords.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-text-primary mb-3">🔤 Palabras más usadas</h3>
                <div className="space-y-1.5">
                  {topWords.map(([word, count], index) => (
                    <div key={word}
                      className="flex items-center gap-2.5 bg-black/[0.02] rounded-xl px-3 py-2.5">
                      <span className="w-7 h-7 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span className="flex-1 font-bold text-sm text-text-primary">{word}</span>
                      <span className="text-xs font-bold text-text-muted bg-black/[0.04] px-2.5 py-1 rounded-lg">{count}×</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Messages */}
            {messageHistory.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-text-primary mb-3">💬 Mensajes recientes</h3>
                <div className="max-h-60 overflow-y-auto space-y-1.5">
                  {messageHistory.slice(0, 10).map((record) => (
                    <div key={record.id}
                      className="bg-black/[0.02] border border-border/60 rounded-xl p-3">
                      <p className="text-sm font-bold text-text-primary mb-1">"{record.message_text}"</p>
                      <p className="text-xs font-medium text-text-muted">
                        {new Date(record.timestamp).toLocaleString('es-ES', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}