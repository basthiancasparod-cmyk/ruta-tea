'use client'

import { motion } from 'framer-motion'
import { playSound, vibrate } from '@/lib/sounds'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps {
  children: React.ReactNode
  variant?: Variant
  size?: Size
  disabled?: boolean
  fullWidth?: boolean
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
  title?: string
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-brand text-white shadow-[0_4px_0_#3A9A87] hover:shadow-[0_2px_0_#3A9A87] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]',
  secondary:
    'bg-accent text-white shadow-[0_4px_0_#F59E2E] hover:shadow-[0_2px_0_#F59E2E] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]',
  outline:
    'border-2 border-brand text-brand hover:bg-brand-bg active:bg-brand-light/30',
  ghost:
    'text-text-secondary hover:text-brand hover:bg-brand-bg active:bg-brand-light/30',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-5 py-2.5 text-base rounded-lg',
  lg: 'px-7 py-3.5 text-lg rounded-xl',
  xl: 'px-9 py-4.5 text-xl rounded-xl',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  onClick,
  className = '',
  type = 'button',
  title,
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={() => {
        if (!disabled) {
          playSound('click')
          vibrate('click')
        }
        onClick?.()
      }}
      disabled={disabled}
      title={title}
      whileTap={{ scale: 0.97 }}
      className={`
        font-bold tracking-tight transition-all duration-150 select-none
        disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {children}
    </motion.button>
  )
}
