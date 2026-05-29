'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number
  max: number
  label?: string
  showPercentage?: boolean
  className?: string
}

export function ProgressBar({
  value,
  max,
  label,
  showPercentage = false,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100)

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-xs font-bold text-text-secondary">{label}</span>
          )}
          {showPercentage && (
            <span className="text-xs font-bold text-brand">{percentage}%</span>
          )}
        </div>
      )}
      <div className="w-full h-3 bg-border rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-brand to-brand-light rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
