'use client'

import { motion } from 'framer-motion'

type Mood = 'idle' | 'happy' | 'sad' | 'excited' | 'thinking'

interface LumiProps {
  mood?: Mood
  size?: 'sm' | 'md' | 'lg'
  className?: string
  message?: string
}

const sizeMap = {
  sm: 48,
  md: 72,
  lg: 96,
}

function LumiSvg({ size, mood }: { size: number; mood: Mood }) {
  const glowColor = mood === 'happy' || mood === 'excited' ? '#FFD699' : '#6ECCB8'

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Glow */}
      <circle cx="50" cy="50" r="45" fill={glowColor} opacity="0.15" />
      {/* Body */}
      <ellipse cx="50" cy="58" rx="22" ry="24" fill="#44B39D" />
      {/* Head */}
      <circle cx="50" cy="32" r="20" fill="#44B39D" />
      {/* Eyes */}
      {mood === 'happy' || mood === 'excited' ? (
        <>
          <path d="M38 30 Q42 26 46 30" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M54 30 Q58 26 62 30" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : mood === 'sad' ? (
        <>
          <circle cx="42" cy="30" r="3" fill="white" />
          <circle cx="58" cy="30" r="3" fill="white" />
          <path d="M44 37 Q50 33 56 37" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="42" cy="30" r="3.5" fill="white" />
          <circle cx="58" cy="30" r="3.5" fill="white" />
        </>
      )}
      {/* Smile */}
      {mood === 'happy' && (
        <path d="M40 38 Q50 45 60 38" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
      {mood === 'excited' && (
        <path d="M38 38 Q50 48 62 38" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
      {/* Star antenna */}
      <motion.g
        animate={{ rotate: [0, 10, 0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <line x1="50" y1="12" x2="50" y2="4" stroke="#FFD699" strokeWidth="2.5" strokeLinecap="round" />
        <polygon points="50,0 52,4 56,4 53,7 54,11 50,9 46,11 47,7 44,4 48,4" fill="#FFD699" />
      </motion.g>
      {/* Wings */}
      <motion.g
        animate={{ rotate: [0, -3, 0, 3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ellipse cx="28" cy="50" rx="8" ry="5" fill="#6ECCB8" opacity="0.6" />
        <ellipse cx="72" cy="50" rx="8" ry="5" fill="#6ECCB8" opacity="0.6" />
      </motion.g>
      {/* Sparkles */}
      {mood === 'excited' && (
        <>
          <motion.circle cx="25" cy="25" r="2" fill="#FFD699" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <motion.circle cx="75" cy="20" r="1.5" fill="#FFD699" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} />
          <motion.circle cx="78" cy="40" r="2" fill="#FFD699" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.6 }} />
        </>
      )}
    </svg>
  )
}

export function Lumi({
  mood = 'idle',
  size = 'md',
  className = '',
  message,
}: LumiProps) {
  const px = sizeMap[size]

  return (
    <motion.div
      className={`flex flex-col items-center gap-2 ${className}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      <LumiSvg size={px} mood={mood} />
      {message && (
        <motion.p
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-sm font-bold text-text-secondary text-center max-w-[200px]"
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  )
}
