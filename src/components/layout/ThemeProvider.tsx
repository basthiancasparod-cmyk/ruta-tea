'use client'

import { useEffect } from 'react'
import { applyTheme, getCookieTheme } from '@/lib/theme/themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyTheme(getCookieTheme())
  }, [])

  return <>{children}</>
}
