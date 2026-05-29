'use client'

import { motion, AnimatePresence, useMotionValueEvent, useScroll } from 'framer-motion'
import { useSupabase } from '@/components/layout/SupabaseProvider'
import { useChildren, useTotalXp, useStreak } from '@/lib/hooks/useData'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Fredoka } from 'next/font/google'

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['600', '700'],
})

export function Header() {

  const { signOut } = useSupabase()
  const { children } = useChildren()
  const childId = children[0]?.id

  const { xp } = useTotalXp(childId)
  const { streak } = useStreak(childId)

  const childName = children[0]?.name ?? 'Amiguito'
  const [lives] = useState(3)

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Ocultar header al hacer scroll hacia abajo, mostrar al subir
  const [visible, setVisible] = useState(true)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, "change", (current) => {
    const prev = scrollY.getPrevious()
    if (prev === undefined) return
    const diff = current - prev
    if (current <= 0) setVisible(true)
    else if (diff > 8) setVisible(false)
    else if (diff < -8) setVisible(true)
  })

  return (
    <motion.header
      className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-border"
      animate={{ y: visible ? 0 : -64 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >

      <div className="w-full px-6 h-16 flex items-center justify-between relative">

        {/* LEFT */}
        <div className="flex items-center gap-2">
          <img
            src="/dino-logo.png"
            alt="DinoAprende"
            className="h-8 w-8 object-contain"
          />
          <h2 className={`${fredoka.className} text-lg font-bold text-brand-light`}>
            DinoAprende
          </h2>
        </div>

        {/* CENTER */}
        <div className="hidden sm:flex">
          <div className="bg-brand-bg border border-brand-light/40 text-sm px-5 py-1.5 rounded-full font-semibold text-text-secondary shadow-sm">
            Hola, <span className="font-extrabold text-text-primary">{childName}</span> 👋
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 relative">

          {/* Glass Stats Card */}
          <div className="flex items-center gap-6 bg-white/60 backdrop-blur-md border border-border px-4 py-2 rounded-2xl shadow-sm">

            <div className="text-sm font-bold text-streak-orange">
              🔥 {streak.current}
            </div>

            <div className="text-sm font-bold text-xp-gold">
              ⭐ {xp}
            </div>

            <div className="text-sm font-bold text-heart-red">
              ❤️ {lives}
            </div>

          </div>

          {/* ⚙️ MENU */}
          <div className="relative" ref={menuRef}>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 rounded-full bg-white/60 backdrop-blur-md border border-border flex items-center justify-center shadow-sm hover:bg-brand-bg transition-colors"
            >
              ⚙️
            </motion.button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 8, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-48 rounded-2xl shadow-lg overflow-hidden"
                >
                  {/* Gradient background */}
                  <div className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)',
                    }}
                  />
                  {/* Glass shine */}
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.2) 100%)',
                    border: '1px solid rgba(255,255,255,0.8)',
                  }} />
                  <div className="relative z-10">
                    <Link
                      href="/configuracion"
                      className="block px-4 py-3 text-sm font-semibold text-text-primary hover:bg-brand-bg transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Configuración
                    </Link>
                    <div className="h-px bg-border/60 mx-3" />
                    <button
                      onClick={signOut}
                      className="w-full text-left px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-500 hover:text-white active:bg-red-600 transition-all duration-150 cursor-pointer rounded-b-2xl"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>

    </motion.header>
  )
}



