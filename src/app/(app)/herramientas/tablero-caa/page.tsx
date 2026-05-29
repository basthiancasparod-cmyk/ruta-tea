'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useCAABoards } from '@/lib/hooks/useCAA'
import { useChildren } from '@/lib/hooks/useData'
import type { CAABoard } from '@/types/caa'

export default function TableroCAAPage() {
  const router = useRouter()
  const { children } = useChildren()
  const childId = children[0]?.id
  const { boards, loading } = useCAABoards(childId)
  
  const [favoriteBoards, setFavoriteBoards] = useState<CAABoard[]>([])
  const [recentBoards, setRecentBoards] = useState<CAABoard[]>([])
  const [templates, setTemplates] = useState<CAABoard[]>([])

  useEffect(() => {
    if (boards.length > 0) {
      setFavoriteBoards(boards.filter(b => b.is_favorite))
      setRecentBoards(boards.filter(b => !b.is_template).slice(0, 3))
      setTemplates(boards.filter(b => b.is_template))
    }
  }, [boards])

  const quickActions = [
    {
      title: 'Tablero Rápido',
      desc: 'Empieza a comunicar ahora',
      icon: '💬',
      href: '/herramientas/tablero-caa/quick',
      gradient: 'from-green-100 to-emerald-50',
      iconBg: 'bg-green-100',
    },
    {
      title: 'Mis Tableros',
      desc: 'Ver todos los tableros guardados',
      icon: '📚',
      href: '/herramientas/tablero-caa/biblioteca',
      gradient: 'from-blue-100 to-cyan-50',
      iconBg: 'bg-blue-100',
    },
    {
      title: 'Crear Tablero',
      desc: 'Diseña un tablero personalizado',
      icon: '✨',
      href: '/herramientas/tablero-caa/editor/nuevo',
      gradient: 'from-purple-100 to-violet-50',
      iconBg: 'bg-purple-100',
    },
    {
      title: 'Plantillas',
      desc: 'Explora tableros prediseñados',
      icon: '📋',
      href: '/herramientas/tablero-caa/plantillas',
      gradient: 'from-orange-100 to-amber-50',
      iconBg: 'bg-orange-100',
    },
  ]

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          ← Atrás
        </Button>
        <div className="flex-1">
          <h1 className="heading-page">
            Sistema CAA
          </h1>
          <p className="text-body">
            Comunicación Aumentativa y Alternativa
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 text-center py-2">
        <img src="/assets/dino-tablero-aac.png" alt="" width={138} height={161} className="object-contain" />
        <p className="text-base font-bold text-text-primary">¡Construye frases y comunícate con pictogramas!</p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-extrabold text-text-secondary mb-3 tracking-wide">
          ACCESO RÁPIDO
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={action.href}>
                <div
                  className={`
                    relative h-full bg-gradient-to-br ${action.gradient}
                    rounded-2xl shadow-md p-4 overflow-hidden
                    group cursor-pointer hover:shadow-lg
                    transition-all duration-300 active:scale-[0.98]
                    min-h-[140px] flex flex-col items-center justify-center text-center
                  `}
                >
                  <div
                    className={`absolute -top-4 -right-4 w-16 h-16 rounded-full ${action.iconBg} opacity-40 blur-xl`}
                  />
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                    className={`w-14 h-14 rounded-xl ${action.iconBg} flex items-center justify-center text-2xl shadow-sm mb-2`}
                  >
                    {action.icon}
                  </motion.div>
                  <h3 className="heading-card mb-1">
                    {action.title}
                  </h3>
                  <p className="text-badge text-text-secondary leading-tight">
                    {action.desc}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Favorite Boards */}
      {favoriteBoards.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="heading-section flex items-center gap-2">
              ⭐ Favoritos
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {favoriteBoards.map((board) => (
              <Link
                key={board.id}
                href={`/herramientas/tablero-caa/tablero/${board.id}`}
              >
                <Card
                  variant="bordered"
                  padding="md"
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="heading-card mb-1">
                        {board.name}
                      </h3>
                      <p className="text-meta line-clamp-2">
                        {board.description || 'Sin descripción'}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-badge text-brand bg-brand-bg px-2 py-0.5 rounded-full">
                          {board.grid_size}
                        </span>
                        {board.category && (
                          <span className="text-badge text-text-muted bg-surface-secondary px-2 py-0.5 rounded-full">
                            {board.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xl">⭐</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Boards */}
      {recentBoards.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="heading-section">
              📌 Recientes
            </h2>
            <Link href="/herramientas/tablero-caa/biblioteca">
              <span className="text-xs font-bold text-brand hover:text-brand-dark">
                Ver todos →
              </span>
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {recentBoards.map((board) => (
              <Link
                key={board.id}
                href={`/herramientas/tablero-caa/tablero/${board.id}`}
              >
                <Card
                  variant="default"
                  padding="sm"
                  className="min-w-[160px] hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h3 className="heading-card mb-1 truncate">
                    {board.name}
                  </h3>
                  <span className="text-badge text-brand bg-brand-bg px-2 py-0.5 rounded-full">
                    {board.grid_size}
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Getting Started */}
      {boards.length === 0 && !loading && (
        <Card variant="highlight" padding="lg">
          <div className="text-center">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="heading-section mb-2">
              ¡Bienvenido al Sistema CAA!
            </h3>
            <p className="text-body mb-4 max-w-md mx-auto">
              Crea tu primer tablero de comunicación personalizado o comienza
              con una plantilla prediseñada.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="primary"
                size="md"
                onClick={() =>
                  router.push('/herramientas/tablero-caa/editor/nuevo')
                }
              >
                ✨ Crear Tablero
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() =>
                  router.push('/herramientas/tablero-caa/plantillas')
                }
              >
                📋 Ver Plantillas
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Info Card */}
      <Card variant="default" padding="md" className="bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <span className="text-2xl">💡</span>
          <div className="flex-1">
            <h3 className="heading-card mb-1">
              ¿Qué es CAA?
            </h3>
            <p className="text-meta leading-relaxed">
              La Comunicación Aumentativa y Alternativa (CAA) permite expresarse
              mediante pictogramas, imágenes y símbolos. Ideal para niños con
              dificultades en el habla o lenguaje.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}