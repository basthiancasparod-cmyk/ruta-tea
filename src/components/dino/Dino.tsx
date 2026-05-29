'use client'

import { motion } from 'framer-motion'

type DinoMood = 'idle' | 'happy' | 'excited' | 'calling' | 'celebrating'

interface DinoProps {
  mood?: DinoMood
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  message?: string
  childName?: string
}

const sizeMap = {
  sm: 64,
  md: 96,
  lg: 128,
  xl: 160,
}

function DinoSvg({ size, mood }: { size: number; mood: DinoMood }) {
  const isExcited = mood === 'excited' || mood === 'celebrating'
  const isCalling = mood === 'calling'

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* Glow effect */}
      <motion.circle
        cx="60"
        cy="60"
        r="50"
        fill="#7C3AED"
        opacity="0.1"
        animate={isExcited ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      
      {/* Body */}
      <motion.ellipse
        cx="60"
        cy="70"
        rx="28"
        ry="32"
        fill="#8B5CF6"
        animate={isCalling ? { scaleY: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
      
      {/* Head */}
      <motion.circle
        cx="60"
        cy="40"
        r="24"
        fill="#8B5CF6"
        animate={isCalling ? { y: [0, -2, 0] } : {}}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
      
      {/* Spikes on back */}
      <motion.g
        animate={isExcited ? { rotate: [0, 5, 0, -5, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ originX: '60px', originY: '60px' }}
      >
        <path d="M 65 65 L 70 55 L 75 65 Z" fill="#A78BFA" />
        <path d="M 70 70 L 75 60 L 80 70 Z" fill="#A78BFA" />
        <path d="M 75 75 L 80 65 L 85 75 Z" fill="#A78BFA" />
      </motion.g>
      
      {/* Tail */}
      <motion.path
        d="M 85 80 Q 95 85 100 75 Q 105 65 95 60"
        stroke="#7C3AED"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        animate={{ rotate: [0, 10, 0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: '85px', originY: '70px' }}
      />
      
      {/* Eyes */}
      {mood === 'happy' || mood === 'celebrating' ? (
        <>
          <path d="M 48 36 Q 52 32 56 36" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 64 36 Q 68 32 72 36" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <motion.circle
            cx="52"
            cy="36"
            r="4"
            fill="white"
            animate={isCalling ? { scaleY: [1, 0.3, 1] } : {}}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.circle
            cx="68"
            cy="36"
            r="4"
            fill="white"
            animate={isCalling ? { scaleY: [1, 0.3, 1] } : {}}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </>
      )}
      
      {/* Mouth */}
      {mood === 'happy' || mood === 'celebrating' ? (
        <path d="M 50 46 Q 60 52 70 46" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
      ) : mood === 'calling' ? (
        <motion.ellipse
          cx="60"
          cy="48"
          rx="6"
          ry="8"
          fill="white"
          animate={{ scaleY: [1, 1.3, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      ) : (
        <path d="M 52 48 Q 60 50 68 48" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
      
      {/* Arms */}
      <ellipse cx="35" cy="65" rx="8" ry="12" fill="#7C3AED" opacity="0.8" />
      <ellipse cx="85" cy="65" rx="8" ry="12" fill="#7C3AED" opacity="0.8" />
      
      {/* Legs */}
      <ellipse cx="50" cy="100" rx="10" ry="8" fill="#7C3AED" />
      <ellipse cx="70" cy="100" rx="10" ry="8" fill="#7C3AED" />
      
      {/* Sparkles when celebrating */}
      {mood === 'celebrating' && (
        <>
          <motion.circle
            cx="30"
            cy="30"
            r="3"
            fill="#FDE047"
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.circle
            cx="90"
            cy="25"
            r="2.5"
            fill="#FDE047"
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
          <motion.circle
            cx="85"
            cy="45"
            r="3"
            fill="#FDE047"
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
          />
        </>
      )}
    </svg>
  )
}

export function Dino({
  mood = 'idle',
  size = 'md',
  className = '',
  message,
  childName,
}: DinoProps) {
  const px = sizeMap[size]

  return (
    <motion.div
      className={`flex flex-col items-center gap-3 ${className}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      <DinoSvg size={px} mood={mood} />
      {message && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative"
        >
          <div className="bg-white border-4 border-brand rounded-2xl px-6 py-3 shadow-lg max-w-xs">
            <p className="text-lg font-extrabold text-text-primary text-center">
              {message.replace('[nombre]', childName || 'amiguito')}
            </p>
          </div>
          {/* Speech bubble tail */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white" />
        </motion.div>
      )}
    </motion.div>
  )
}