'use client'

import { motion } from 'framer-motion'
import { BabyDinoIcon } from '@/components/icons/DinoIcons'
import Image from 'next/image'
import type { EggState } from '@/lib/utils/eggState'

function cleanModuleName(name: string): string {
  const cleaned = name.replace(/^M[OÓ]DULO\s+\d+\s*[—–-]\s*/i, '')
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase()
}

// ─── Frozen Locked Overlay (Multi-layer 3D Ice Prism) ─────────────────────────

function FrozenOverlay() {
  return (
    <>
      <style>{`
        @keyframes iceShine {
          0%   { transform: translateX(-150%) skewX(-15deg); }
          100% { transform: translateX(350%) skewX(-15deg); }
        }
        @keyframes snowFloat {
          0%   { transform: translateY(0); opacity: 0; }
          20%  { opacity: 1; }
          100% { transform: translateY(-28px); opacity: 0; }
        }
        .anim-ice-shine { animation: iceShine 4s linear infinite; }
        .anim-snow { animation: snowFloat 5s ease-in-out infinite; }
        .anim-snow-2 { animation: snowFloat 5s ease-in-out 1.5s infinite; }
        .anim-snow-3 { animation: snowFloat 5s ease-in-out 3s infinite; }
      `}</style>

      {/* 1. Ice.png overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-visible" style={{ transform: 'translateY(12%)' }}>
        <Image
          src="/assets/ice.png"
          alt=""
          fill
          sizes="110px"
          className="object-contain opacity-80 drop-shadow-xl scale-x-112"
          unoptimized
        />
      </div>

      {/* 2. Moving shine */}
      <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[40%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent blur-lg anim-ice-shine" />
      </div>

      {/* 3. Floating snow */}
      <div className="absolute inset-0 z-30 pointer-events-none overflow-visible">
        <div className="absolute w-1.5 h-1.5 bg-white rounded-full blur-[0.5px] top-[25%] left-[20%] anim-snow" />
        <div className="absolute w-1 h-1 bg-white rounded-full top-[45%] left-[80%] anim-snow-2" />
        <div className="absolute w-1.5 h-1.5 bg-white/80 rounded-full blur-[1px] top-[70%] left-[40%] anim-snow-3" />
      </div>
    </>
  )
}

function LockedOverlay() {
  return <FrozenOverlay />
}

interface EggNodeProps {
  name: string
  state: EggState
  index: number
  imageSrc?: string
  fontClass?: string
  onClick?: () => void
}

export function EggNode({ name, state, index, imageSrc, fontClass, onClick }: EggNodeProps) {
  const isLocked    = state === 'locked'
  const isCompleted = state === 'completed'
  const isAvailable = state === 'available'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 200 }}
      whileHover={!isLocked ? { y: -6, transition: { duration: 0.2 } } : {}}
      whileTap={!isLocked ? { scale: 0.95 } : {}}
      onClick={isLocked ? undefined : onClick}
      className={`relative flex flex-col items-center group
        ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <motion.div
        animate={
          isAvailable ? { y: [0, -5, 0] } :
          isCompleted  ? { scale: [1, 1.05, 1] } : {}
        }
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-24 h-32 flex items-center justify-center"
      >

        {/* ── Modo PNG ── */}
        {imageSrc ? (
          <div className={`relative w-full h-full transition-all duration-300
            ${isCompleted ? 'brightness-110 saturate-125' : ''}
          `} style={{ minWidth: 0, minHeight: 0 }}>
            <Image
              src={imageSrc}
              alt={name}
              fill
              sizes="96px"
              className={`object-contain drop-shadow-lg transition-all duration-300 ${isLocked ? 'opacity-75 brightness-90 saturate-[0.3] hue-rotate-[160deg]' : ''}`}
              unoptimized
            />
            {/* Frost overlay para locked */}
            {isLocked && <LockedOverlay />}
            {/* Glow verde para available */}
            {isAvailable && (
              <div className="absolute inset-0 rounded-full -z-10 blur-md opacity-30 bg-emerald-300" />
            )}
          </div>
        ) : (
          /* ── Modo CSS (óvalo original, sin cambios) ── */
          <>
            <div
              className={`absolute inset-0 border-4 rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%]
                ${isLocked    ? 'bg-surface-secondary border-border' :
                  isCompleted ? 'bg-[#D4F5E0] border-[#6BCB77]' :
                                'bg-[#E8F8F4] border-[#6ECCB8]'}`}
              style={{
                boxShadow: isCompleted
                  ? '0 16px 40px rgba(107,203,119,0.30), inset 0 -4px 10px rgba(0,0,0,0.05)'
                  : isLocked
                  ? '0 8px 20px rgba(0,0,0,0.08)'
                  : '0 16px 40px rgba(68,179,157,0.25), inset 0 -4px 10px rgba(0,0,0,0.05)',
              }}
            />
            <div className="absolute top-3 left-6 w-10 h-4 bg-white/50 rounded-full rotate-[-15deg] pointer-events-none" />
            <div className="relative z-10">
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="w-14 h-14"
                >
                  <BabyDinoIcon className="w-full h-full" />
                </motion.div>
              ) : isLocked ? (
                <span className="text-xl text-text-muted">🔒</span>
              ) : (
                <span className="text-lg font-bold text-brand-dark">{index + 1}</span>
              )}
            </div>
          </>
        )}

        {/* ── Overlays de estado (ambos modos) ── */}
        {isLocked && !imageSrc && (
          <div className="absolute inset-0 flex items-end justify-center pb-1 pointer-events-none z-20">
            <span className="text-lg drop-shadow">🔒</span>
          </div>
        )}
        {isCompleted && (
          <div className="absolute top-0 right-0 w-6 h-6 bg-brand rounded-full
                          flex items-center justify-center shadow-md pointer-events-none z-20">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
        )}

      </motion.div>

      <p className={`text-sm font-semibold text-center mt-4 leading-snug max-w-[120px]
        ${isLocked ? 'text-text-muted' : 'text-text-secondary group-hover:text-brand-dark'}
        ${fontClass ?? ''} transition-colors`}
      >
        {cleanModuleName(name)}
      </p>

      {isLocked && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-gray-800 text-white text-[10px] font-medium px-2.5 py-1 rounded-md
                          shadow-lg whitespace-nowrap">
            Este nivel se encuentra bloqueado
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
                            border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800" />
          </div>
        </div>
      )}
    </motion.div>
  )
}