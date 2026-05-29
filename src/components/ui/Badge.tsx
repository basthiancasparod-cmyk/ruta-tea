'use client'

import { motion } from 'framer-motion'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'xp' | 'streak' | 'level' | 'star'
  size?: 'sm' | 'md'
  className?: string
}

const variantStyles = {
  xp: 'bg-xp-gold text-white',
  streak: 'bg-streak-orange text-white',
  level: 'bg-brand text-white',
  star: 'bg-accent text-white',
}

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5 rounded-md',
  md: 'text-sm px-3 py-1 rounded-lg',
}

export function Badge({
  children,
  variant = 'xp',
  size = 'md',
  className = '',
}: BadgeProps) {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center gap-1 font-bold ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </motion.span>
  )
}
