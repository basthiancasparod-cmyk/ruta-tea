'use client'

import { motion } from 'framer-motion'

// Elementos decorativos distribuidos uniformemente
const DECORATIONS = [
  // Zona superior (0-20%)
  { emoji: '🌴', left: '8%', top: '2%', size: 'text-4xl', opacity: 0.12, sway: true },
  { emoji: '☁️', left: '75%', top: '5%', size: 'text-3xl', opacity: 0.08, sway: false },
  { emoji: '🪨', left: '85%', top: '8%', size: 'text-2xl', opacity: 0.15, sway: false },
  { emoji: '🌿', left: '5%', top: '12%', size: 'text-2xl', opacity: 0.12, sway: true },
  
  // Zona 20-40%
  { emoji: '🦕', left: '80%', top: '18%', size: 'text-3xl', opacity: 0.10, sway: true },
  { emoji: '🌴', left: '12%', top: '22%', size: 'text-3xl', opacity: 0.10, sway: true },
  { emoji: '🪨', left: '88%', top: '28%', size: 'text-3xl', opacity: 0.12, sway: false },
  { emoji: '🐾', left: '6%', top: '32%', size: 'text-xl', opacity: 0.15, sway: false },
  { emoji: '🌋', left: '78%', top: '35%', size: 'text-4xl', opacity: 0.08, sway: false },
  
  // Zona 40-60%
  { emoji: '🌴', left: '85%', top: '42%', size: 'text-4xl', opacity: 0.10, sway: true },
  { emoji: '🪨', left: '8%', top: '45%', size: 'text-2xl', opacity: 0.14, sway: false },
  { emoji: '🦖', left: '15%', top: '48%', size: 'text-2xl', opacity: 0.10, sway: true },
  { emoji: '🌿', left: '82%', top: '52%', size: 'text-3xl', opacity: 0.10, sway: true },
  { emoji: '🐾', left: '88%', top: '55%', size: 'text-lg', opacity: 0.12, sway: false },
  
  // Zona 60-80%
  { emoji: '🌴', left: '5%', top: '62%', size: 'text-3xl', opacity: 0.12, sway: true },
  { emoji: '🪨', left: '90%', top: '65%', size: 'text-3xl', opacity: 0.12, sway: false },
  { emoji: '🦕', left: '10%', top: '68%', size: 'text-3xl', opacity: 0.10, sway: true },
  { emoji: '🌿', left: '85%', top: '72%', size: 'text-2xl', opacity: 0.12, sway: true },
  { emoji: '🐾', left: '7%', top: '78%', size: 'text-xl', opacity: 0.14, sway: false },
  
  // Zona 80-100%
  { emoji: '🌴', left: '88%', top: '82%', size: 'text-4xl', opacity: 0.10, sway: true },
  { emoji: '🪨', left: '12%', top: '85%', size: 'text-3xl', opacity: 0.12, sway: false },
  { emoji: '🌋', left: '75%', top: '88%', size: 'text-3xl', opacity: 0.08, sway: false },
  { emoji: '🦖', left: '8%', top: '92%', size: 'text-2xl', opacity: 0.10, sway: true },
  { emoji: '🌿', left: '82%', top: '95%', size: 'text-3xl', opacity: 0.10, sway: true },
  { emoji: '☁️', left: '20%', top: '96%', size: 'text-2xl', opacity: 0.06, sway: false },
]

export function JurassicScenery() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {DECORATIONS.map((item, index) => (
        <motion.div
          key={index}
          className={`absolute ${item.size}`}
          style={{
            left: item.left,
            top: item.top,
            opacity: item.opacity,
          }}
          animate={
            item.sway
              ? { rotate: [0, 3, 0, -3, 0] }
              : {}
          }
          transition={{
            duration: 5 + (index % 3),
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.2,
          }}
        >
          {item.emoji}
        </motion.div>
      ))}
    </div>
  )
}
