'use client'

import { useEffect, useState } from 'react'
import type { ThemeId } from '@/lib/theme/themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>('default')

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)theme=([^;]+)/)
    const cookie = match?.[1] as ThemeId | undefined
    const valid = cookie ?? 'default'
    setTheme(valid)
    document.documentElement.setAttribute('data-theme', valid)
  }, [])

  return <>{children}</>
}
