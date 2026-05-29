'use client'

import { useRef, useState, useCallback } from 'react'

interface GlowEggImageProps {
  src: string
  alt: string
  onClick?: () => void
}

function extractDominantColor(img: HTMLImageElement): string {
  const canvas = document.createElement('canvas')
  const size = 32
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return '#6ECCB8'
  ctx.drawImage(img, 0, 0, size, size)
  const data = ctx.getImageData(0, 0, size, size).data
  const buckets: Record<string, { r: number; g: number; b: number; count: number }> = {}
  for (let i = 0; i < data.length; i += 16) {
    const r = Math.round(data[i] / 32) * 32
    const g = Math.round(data[i + 1] / 32) * 32
    const b = Math.round(data[i + 2] / 32) * 32
    const key = `${r},${g},${b}`
    if (!buckets[key]) buckets[key] = { r, g, b, count: 0 }
    buckets[key].count++
  }
  const dominant = Object.values(buckets).reduce((a, b) => (a.count > b.count ? a : b))
  return `rgb(${dominant.r},${dominant.g},${dominant.b})`
}

export function GlowEggImage({ src, alt, onClick }: GlowEggImageProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [glowColor, setGlowColor] = useState<string>('#6ECCB8')
  const [loaded, setLoaded] = useState(false)

  const onLoad = useCallback(() => {
    if (imgRef.current && !loaded) {
      setLoaded(true)
      try {
        const color = extractDominantColor(imgRef.current)
        setGlowColor(color)
      } catch {}
    }
  }, [loaded])

  return (
    <div className="relative w-24 h-32 flex items-center justify-center">
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={onLoad}
        className="w-full h-full object-contain drop-shadow-lg transition-all duration-300 hover:scale-105"
        style={{
          filter: `drop-shadow(0 0 0px transparent)`,
          transition: 'filter 0.3s ease, transform 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter = `drop-shadow(0 0 12px ${glowColor}) drop-shadow(0 0 24px ${glowColor})`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = 'drop-shadow(0 0 0px transparent)'
        }}
      />
    </div>
  )
}
