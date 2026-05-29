'use client'

interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'bordered' | 'highlight' | 'premium'
  padding?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
}

const variantStyles: Record<string, string> = {
  default: 'bg-surface border border-border',
  bordered: 'bg-surface border-[3px] border-brand shadow-sm',
  highlight: 'bg-brand-bg border-[3px] border-brand shadow-md',
}

const paddingStyles = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  onClick,
  className = '',
}: CardProps) {
  const isPremium = variant === 'premium'

  const base = isPremium
    ? 'relative overflow-hidden rounded-2xl shadow-lg'
    : `rounded-lg ${variantStyles[variant]}`

  const pad = paddingStyles[padding]

  return (
    <div className={`${base} ${pad} ${className}`}>
      {isPremium && (
        <>
          <div className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)',
            }}
          />
          <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.2) 100%)',
            border: '1px solid rgba(255,255,255,0.8)',
          }} />
        </>
      )}
      <div className={`relative ${isPremium ? 'z-10' : ''}`}>
        {children}
      </div>
    </div>
  )
}
