'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Pictogram } from '@/components/ui/Pictogram'
import { playSound } from '@/lib/sounds'

interface Activity {
  id: string
  title: string
  description: string
  keyword: string
  type: 'colorear' | 'trazar' | 'completar'
}

const activities: Activity[] = [
  { id: '1', title: 'Colorea la manzana', description: 'Pinta la manzana de rojo', keyword: 'manzana', type: 'colorear' },
  { id: '2', title: 'Traza el círculo', description: 'Sigue la línea del círculo', keyword: 'sol', type: 'trazar' },
  { id: '3', title: 'Completa la cara', description: 'Dibuja la emoción que falta', keyword: 'alegre', type: 'completar' },
  { id: '4', title: 'Colorea el perro', description: 'Pinta al perro de marrón', keyword: 'perro', type: 'colorear' },
  { id: '5', title: 'Traza el triángulo', description: 'Sigue la línea del triángulo', keyword: 'casa', type: 'trazar' },
  { id: '6', title: 'Une los puntos', description: 'Conecta los puntos del 1 al 5', keyword: 'pelota', type: 'completar' },
]

export function DescargableActivities() {
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  const toggleComplete = (id: string) => {
    setCompleted(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    playSound('correct')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Actividades interactivas para hacer en casa
        </p>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          🖨️ Imprimir todo
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {activities.map((act, i) => {
          const isDone = completed.has(act.id)
          return (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                variant={isDone ? 'highlight' : 'default'}
                padding="md"
                className={isDone ? '' : 'cursor-pointer hover:border-brand'}
                onClick={() => !isDone && toggleComplete(act.id)}
              >
                <div className="flex items-center gap-3">
                  <Pictogram keyword={act.keyword} size={72} className="rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-sm text-text-primary">{act.title}</h3>
                    <p className="text-xs text-text-muted">{act.description}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-brand-bg text-brand">
                      {act.type}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleComplete(act.id) }}
                    className={`text-xl transition-all ${isDone ? 'scale-110' : 'opacity-50 hover:opacity-100'}`}
                  >
                    {isDone ? '✅' : '⬜'}
                  </button>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible; }
          .print-only { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  )
}
