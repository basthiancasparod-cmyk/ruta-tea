'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'


const tools = [
  {
    href: '/herramientas/tablero-caa',
    img: '/assets/tablero-aac.png',
    title: 'Tablero de Comunicación (AAC)',
    desc: 'Comunicación aumentativa con pictogramas y voz',
    gradient: 'from-green-100 to-emerald-50',
    iconBg: 'bg-green-100',
  },
  {
    href: '/herramientas/agenda-visual',
    img: '/assets/agenda-visual.png',
    title: 'Agenda Visual',
    desc: 'Crea rutinas diarias con pictogramas arrastrables',
    gradient: 'from-blue-100 to-cyan-50',
    iconBg: 'bg-blue-100',
  },
  {
    href: '/herramientas/temporizador-visual',
    img: '/assets/dino-temporizador.png',
    title: 'Temporizador',
    desc: 'Cuenta regresiva visual para anticipar cambios',
    gradient: 'from-orange-100 to-amber-50',
    iconBg: 'bg-orange-100',
  },
  {
    href: '/herramientas/emociones',
    img: '/assets/juego-emociones.png',
    title: 'Juego de Emociones',
    desc: 'Aprende a reconocer y expresar emociones',
    gradient: 'from-yellow-100 to-amber-50',
    iconBg: 'bg-yellow-100',
  },
  {
    href: '/herramientas/primero-despues',
    img: '/assets/dino-an-des.png',
    title: 'Primero - Después',
    desc: 'Organiza actividades con estructura clara',
    gradient: 'from-indigo-100 to-blue-50',
    iconBg: 'bg-indigo-100',
  },
  {
    href: '/herramientas/rincon-calma',
    img: '/assets/dino-calma.png',
    title: 'Rincón de Calma',
    desc: 'Herramientas para regulacion emocional',
    gradient: 'from-teal-100 to-emerald-50',
    iconBg: 'bg-teal-100',
  },
  {
    href: '/herramientas/registro-conducta',
    img: '/assets/dino-conducta.png',
    title: 'Registro de Conducta',
    desc: 'Seguimiento de comportamientos y progreso',
    gradient: 'from-red-100 to-pink-50',
    iconBg: 'bg-red-100',
  },
  {
    href: '/herramientas/calendario',
    img: '/assets/dino-calendario.png',
    title: 'Calendario',
    desc: 'Visualiza eventos importantes del mes',
    gradient: 'from-cyan-100 to-blue-50',
    iconBg: 'bg-cyan-100',
  },
{
    href: '/herramientas/historias-sociales',
    img: '/assets/dino-historias.png',
    title: 'Historias Sociales',
    desc: 'Aprende situaciones nuevas paso a paso',
    gradient: 'from-purple-100 to-pink-50',
    iconBg: 'bg-purple-100',
  },
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200 } },
}

export default function HerramientasPage() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
<img src="/assets/dino-herramientas.png" alt="Dino" className="w-[110px] h-[129px] object-contain drop-shadow-xl" />
        <div>
          <h1 className="heading-page">Herramientas</h1>
          <p className="text-body">Recursos interactivos para el día a día</p>
        </div>
      </div>

      {/* Tool cards */}
      <motion.div variants={container} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <motion.div key={tool.href} variants={itemAnim}>
            <Link href={tool.href} className="block h-full">
              <div className={`relative h-full bg-gradient-to-br ${tool.gradient} rounded-2xl shadow-md p-6 overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300 active:scale-[0.98]`}>
                {/* Floating decorative elements */}
                <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${tool.iconBg} opacity-40 blur-xl pointer-events-none`} />
                <div className="absolute bottom-4 -left-4 w-12 h-12 rounded-full bg-white/30 blur-lg pointer-events-none" />
                <div className="absolute top-1/3 right-8 w-6 h-6 rounded-full bg-white/20 blur-md pointer-events-none" />

                <div className="relative flex flex-col items-center text-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.3 }}
                    className={`w-16 h-16 rounded-2xl ${tool.iconBg} flex items-center justify-center text-3xl shadow-sm`}
                  >
<img src={tool.img} alt={tool.title} className="w-10 h-10 object-contain" />
                  </motion.div>
                  <h3 className="heading-section">{tool.title}</h3>
                  <p className="text-meta leading-snug">{tool.desc}</p>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-6 right-6 h-1 rounded-full bg-white/40" />
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
