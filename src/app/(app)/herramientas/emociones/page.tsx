'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lumi } from '@/components/lumi/Lumi'

const GAMES = [
  { href: '/herramientas/emociones/identifica', icon: '🔍', title: 'Identifica la Emoción', desc: 'Reconoce la emoción por su pictograma', color: 'from-green-100 to-emerald-50', iconBg: 'bg-green-100' },
  { href: '/herramientas/emociones/memory', icon: '🃏', title: 'Memory de Emociones', desc: 'Encuentra los pares de emociones', color: 'from-blue-100 to-cyan-50', iconBg: 'bg-blue-100' },
  { href: '/herramientas/emociones/situaciones', icon: '🎭', title: 'Situaciones y Emociones', desc: '¿Cómo te sentirías en cada situación?', color: 'from-yellow-100 to-amber-50', iconBg: 'bg-yellow-100' },
  { href: '/herramientas/emociones/completa-cara', icon: '🎨', title: 'Completa la Cara', desc: 'Arma la expresión facial correcta', color: 'from-pink-100 to-rose-50', iconBg: 'bg-pink-100' },
  { href: '/herramientas/emociones/ruleta', icon: '🎡', title: 'Ruleta de Emociones', desc: 'Gira y encuentra la situación correcta', color: 'from-purple-100 to-violet-50', iconBg: 'bg-purple-100' },
  { href: '/herramientas/emociones/intruso', icon: '🕵️', title: 'El Intruso', desc: '¿Cuál emoción no pertenece al grupo?', color: 'from-red-100 to-pink-50', iconBg: 'bg-red-100' },
  { href: '/herramientas/emociones/termometro', icon: '🌡️', title: 'Termómetro de Intensidad', desc: '¿Qué tan fuerte sientes la emoción?', color: 'from-orange-100 to-amber-50', iconBg: 'bg-orange-100' },
  { href: '/herramientas/emociones/sopa', icon: '🔤', title: 'Sopa de Emociones', desc: 'Encuentra las emociones escondidas', color: 'from-teal-100 to-emerald-50', iconBg: 'bg-teal-100' },
  { href: '/herramientas/emociones/empareja', icon: '🎯', title: 'Empareja con Color', desc: 'Cada emoción tiene su color', color: 'from-indigo-100 to-blue-50', iconBg: 'bg-indigo-100' },
  { href: '/herramientas/emociones/diario', icon: '📓', title: 'Diario Emocional', desc: '¿Cómo te sientes hoy?', color: 'from-cyan-100 to-sky-50', iconBg: 'bg-cyan-100' },
  { href: '/herramientas/emociones/secuencia', icon: '🔢', title: 'Secuencia de Emociones', desc: 'Recuerda y repite la secuencia', color: 'from-lime-100 to-green-50', iconBg: 'bg-lime-100' },
  { href: '/herramientas/emociones/causa-efecto', icon: '🧩', title: 'Causa y Efecto', desc: '¿Qué provocó esta emoción?', color: 'from-amber-100 to-yellow-50', iconBg: 'bg-amber-100' },
  { href: '/herramientas/emociones/clasifica', icon: '📊', title: 'Clasifica por Energía', desc: 'Ordena las emociones por intensidad', color: 'from-sky-100 to-blue-50', iconBg: 'bg-sky-100' },
  { href: '/herramientas/emociones/detective', icon: '🔎', title: 'Detective de Emociones', desc: 'Descubre qué siente cada personaje', color: 'from-violet-100 to-purple-50', iconBg: 'bg-violet-100' },
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200 } },
}

export default function EmocionesHubPage() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center gap-3">
        <button onClick={() => window.history.back()} className="text-text-secondary hover:text-brand text-lg">← Atrás</button>
        <h1 className="text-xl font-extrabold text-text-primary">Juego de Emociones</h1>
      </div>

      <Lumi mood="excited" message="Elige un juego para comenzar" size="md" />

      <motion.div variants={container} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GAMES.map((game) => (
          <motion.div key={game.href} variants={itemAnim}>
            <Link href={game.href} className="block h-full">
              <div className={`relative h-full bg-gradient-to-br ${game.color} rounded-xl shadow-sm p-4 overflow-hidden group cursor-pointer hover:shadow-md transition-all duration-300 active:scale-[0.98]`}>
                <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full ${game.iconBg} opacity-40 blur-xl pointer-events-none`} />
                <div className="relative flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${game.iconBg} flex items-center justify-center text-2xl shadow-sm shrink-0`}>
                    {game.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm text-text-primary">{game.title}</h3>
                    <p className="text-xs text-text-muted leading-snug">{game.desc}</p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
