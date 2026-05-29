"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Header } from "./Header"
import { NavBar } from "./NavBar"
import { StreakCelebration } from "@/components/lumi/StreakCelebration"
import { useChildren, useStreak } from "@/lib/hooks/useData"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { children: kids } = useChildren()
  const childId = kids[0]?.id
  const { streak } = useStreak(childId)
  const [prevStreak, setPrevStreak] = useState(0)

  useEffect(() => {
    if (streak.current > 0) setPrevStreak(streak.current)
  }, [streak.current])

  const isBoard =
    pathname.includes("/herramientas/tablero-caa/quick") ||
    pathname.includes("/herramientas/tablero-caa/tablero")

  if (isBoard) {
    return (
      <main className="w-full h-screen overflow-hidden">
        {children}
      </main>
    )
  }

  return (
    <>
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 pb-24 bg-surface">
        {children}
      </main>

      <NavBar />
      <StreakCelebration
        currentStreak={streak.current}
        previousStreak={prevStreak}
      />
    </>
  )
}