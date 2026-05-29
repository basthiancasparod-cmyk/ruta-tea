'use client'

import { motion } from 'framer-motion'

// 🌴 Palma estilizada
export function PalmIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <path d="M50 85 Q50 50 50 30" stroke="#8B7355" strokeWidth="6" strokeLinecap="round" />
      <path d="M50 30 Q20 20 15 45" stroke="#6BCB77" strokeWidth="5" strokeLinecap="round" />
      <path d="M50 30 Q80 20 85 45" stroke="#6BCB77" strokeWidth="5" strokeLinecap="round" />
      <path d="M50 45 Q25 35 20 55" stroke="#52B85F" strokeWidth="5" strokeLinecap="round" />
      <path d="M50 45 Q75 35 80 55" stroke="#52B85F" strokeWidth="5" strokeLinecap="round" />
      <path d="M50 25 Q50 5 50 15" stroke="#6BCB77" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

// 🪨 Roca estilizada
export function RockIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 60" className={className} fill="none">
      <ellipse cx="50" cy="40" rx="45" ry="18" fill="#B8A99A" opacity="0.4" />
      <path d="M20 40 Q25 20 50 18 Q75 20 80 40 Q75 50 50 52 Q25 50 20 40Z" fill="#C4B8A8" />
      <path d="M30 35 Q35 28 45 30" stroke="#A89880" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

// 🐾 Huella de dino (3 dedos)
export function FootprintIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} fill="none">
      <ellipse cx="20" cy="18" rx="7" ry="12" fill="#C4B8A8" opacity="0.5" transform="rotate(-20 20 18)" />
      <ellipse cx="30" cy="12" rx="7" ry="14" fill="#C4B8A8" opacity="0.5" />
      <ellipse cx="40" cy="18" rx="7" ry="12" fill="#C4B8A8" opacity="0.5" transform="rotate(20 40 18)" />
      <ellipse cx="30" cy="38" rx="14" ry="16" fill="#C4B8A8" opacity="0.5" />
    </svg>
  )
}

// 🦕 Pterodáctilo silueta
export function PteroIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 60" className={className} fill="none">
      <path d="M20 35 Q35 10 50 25 Q65 10 80 30 Q70 40 50 35 Q35 45 20 35Z" fill="#A8D8EA" opacity="0.6" />
      <circle cx="45" cy="28" r="2" fill="#1A202C" opacity="0.4" />
    </svg>
  )
}

// 🦖 Baby Dino (para dentro del huevo completado)
export function BabyDinoIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} fill="none">
      {/* Cuerpo */}
      <ellipse cx="40" cy="45" rx="22" ry="20" fill="#6BCB77" />
      {/* Cabeza */}
      <circle cx="40" cy="28" r="16" fill="#6BCB77" />
      {/* Ojos */}
      <circle cx="34" cy="24" r="3" fill="white" />
      <circle cx="46" cy="24" r="3" fill="white" />
      <circle cx="35" cy="24" r="1.5" fill="#1A202C" />
      <circle cx="47" cy="24" r="1.5" fill="#1A202C" />
      {/* Sonrisa */}
      <path d="M32 32 Q40 38 48 32" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* Espinas */}
      <path d="M30 40 L25 35 L32 38" fill="#52B85F" />
      <path d="M40 42 L38 36 L44 40" fill="#52B85F" />
      <path d="M50 40 L55 35 L48 38" fill="#52B85F" />
      {/* Brazos */}
      <ellipse cx="22" cy="48" rx="6" ry="4" fill="#52B85F" transform="rotate(-20 22 48)" />
      <ellipse cx="58" cy="48" rx="6" ry="4" fill="#52B85F" transform="rotate(20 58 48)" />
    </svg>
  )
}

// ☁️ Nube sutil
export function CloudIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 50" className={className} fill="none">
      <ellipse cx="30" cy="35" rx="20" ry="12" fill="#E2E8F0" opacity="0.5" />
      <ellipse cx="50" cy="28" rx="25" ry="15" fill="#E2E8F0" opacity="0.5" />
      <ellipse cx="70" cy="35" rx="18" ry="12" fill="#E2E8F0" opacity="0.5" />
    </svg>
  )
}

// 🌿 Arbusto
export function BushIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 60" className={className} fill="none">
      <circle cx="25" cy="40" r="15" fill="#6BCB77" opacity="0.4" />
      <circle cx="40" cy="30" r="18" fill="#52B85F" opacity="0.4" />
      <circle cx="55" cy="40" r="14" fill="#6BCB77" opacity="0.4" />
    </svg>
  )
}
