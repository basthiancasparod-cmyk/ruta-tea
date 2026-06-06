'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Lumi } from '@/components/lumi/Lumi'
import { playSound, vibrate } from '@/lib/sounds'
import { EMOTIONS, useGameStats } from '../lib/emociones-data'

interface Entry {
  date: string
  emotionId: string
  note: string
}

export default function DiarioPage() {
  const [entries, setEntries] = useState<Entry[]>(() => {
    try {
      const stored = localStorage.getItem('diario-emociones')
      return stored ? JSON.parse(stored) : []
    } catch { return [] }
  })
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const { stats } = useGameStats('diario')

  const saveEntry = () => {
    if (!selectedEmotion) return
    const newEntry: Entry = {
      date: new Date().toISOString().split('T')[0],
      emotionId: selectedEmotion,
      note,
    }
    const updated = [newEntry, ...entries]
    setEntries(updated)
    localStorage.setItem('diario-emociones', JSON.stringify(updated))
    setSaved(true)
    playSound('celebration')
    vibrate('celebration')
  }

  const today = new Date().toISOString().split('T')[0]
  const todayEntry = entries.find(e => e.date === today)
  const weekEntries = entries.filter(e => {
    const d = new Date(e.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return d >= weekAgo
  })

  const getEmotionCounts = () => {
    const counts: Record<string, number> = {}
    for (const e of weekEntries) {
      counts[e.emotionId] = (counts[e.emotionId] || 0) + 1
    }
    return counts
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>← Atrás</Button>
        <h1 className="text-xl font-extrabold text-text-primary">Diario Emocional</h1>
      </div>

      {!showHistory ? (
        <>
          {todayEntry ? (
            <div className="text-center">
              <Lumi mood="happy" message="¡Ya registraste cómo te sientes hoy!" size="md" />
              <Card variant="bordered" padding="lg" className="mt-4">
                <span className="text-5xl block mb-2">{EMOTIONS.find(e => e.id === todayEntry.emotionId)?.emoji}</span>
                <p className="text-lg font-extrabold">{EMOTIONS.find(e => e.id === todayEntry.emotionId)?.label}</p>
                {todayEntry.note && <p className="text-sm text-text-muted mt-2">"{todayEntry.note}"</p>}
              </Card>
              <Button variant="outline" className="mt-4" onClick={() => setShowHistory(true)}>Ver historial</Button>
            </div>
          ) : saved ? (
            <div className="text-center">
              <Lumi mood="excited" message="¡Gracias por compartir!" size="lg" />
              <Card variant="bordered" padding="lg" className="mt-4">
                <span className="text-5xl block mb-2">{EMOTIONS.find(e => e.id === selectedEmotion)?.emoji}</span>
                <p className="text-lg font-extrabold">{EMOTIONS.find(e => e.id === selectedEmotion)?.label}</p>
                {note && <p className="text-sm text-text-muted mt-2">"{note}"</p>}
              </Card>
              <div className="flex gap-3 justify-center mt-4">
                <Button variant="outline" onClick={() => setShowHistory(true)}>Ver historial</Button>
                <Button variant="outline" onClick={() => { setSelectedEmotion(null); setNote(''); setSaved(false) }}>Nuevo registro</Button>
              </div>
            </div>
          ) : (
            <>
              <Lumi mood="thinking" message="¿Cómo te sientes hoy?" size="md" />

              <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
                {EMOTIONS.map(em => (
                  <motion.button key={em.id} onClick={() => { setSelectedEmotion(em.id); playSound('click') }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${selectedEmotion === em.id ? 'border-brand bg-brand-bg scale-110' : 'border-border bg-white'}`}>
                    <span className="text-3xl block">{em.emoji}</span>
                    <span className="text-[10px] font-bold">{em.label}</span>
                  </motion.button>
                ))}
              </div>

              {selectedEmotion && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                  <textarea value={note} onChange={e => setNote(e.target.value)}
                    placeholder="¿Quieres agregar algo? (opcional)"
                    className="w-full p-3 rounded-xl border-2 border-border bg-white text-sm resize-none h-20 focus:border-brand focus:outline-none" />
                  <Button variant="primary" size="lg" fullWidth onClick={saveEntry}>
                    Guardar
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>← Volver</Button>
            <p className="font-bold text-sm">Historial</p>
          </div>

          {entries.length === 0 ? (
            <p className="text-center text-text-muted py-8">Aún no hay registros</p>
          ) : (
            <>
              {/* Week summary */}
              <Card variant="bordered" padding="md">
                <p className="text-xs font-bold text-text-secondary mb-2">Últimos 7 días</p>
                <div className="flex gap-2">
                  {EMOTIONS.map(em => {
                    const count = getEmotionCounts()[em.id] || 0
                    return (
                      <div key={em.id} className="flex-1 text-center">
                        <span className="text-2xl block">{em.emoji}</span>
                        <span className="text-xs font-bold">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Entries list */}
              <div className="flex flex-col gap-2">
                {entries.slice(0, 30).map((entry, i) => {
                  const em = EMOTIONS.find(e => e.id === entry.emotionId)
                  return (
                    <div key={i} className="bg-white rounded-xl border-2 border-border p-3 flex items-center gap-3">
                      <span className="text-3xl">{em?.emoji}</span>
                      <div>
                        <p className="text-xs font-bold text-text-muted">{entry.date}</p>
                        <p className="text-sm font-bold">{em?.label}</p>
                        {entry.note && <p className="text-xs text-text-muted">{entry.note}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
