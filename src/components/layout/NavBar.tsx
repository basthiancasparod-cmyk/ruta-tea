'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion, useMotionValueEvent, useScroll } from 'framer-motion'

const navItems = [
  { href: '/ruta', label: 'Ruta', icon: '🗺️' },
  { href: '/rincon-familiar', label: 'Rincón', icon: '📖' },
  { href: '/comunidad', label: 'Comunidad', icon: '👥' },
  { href: '/herramientas', label: 'Herramientas', icon: '🎮' },
  { href: '/configuracion', label: 'Perfil', icon: '⚙️' },
]

export function NavBar() {
  const pathname = usePathname()
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
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-border"
      animate={{ y: visible ? 0 : 80 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <div className="flex justify-around h-16 items-center">
        {navItems.map(item => {
          const active = pathname.startsWith(item.href)

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center text-xs font-bold ${
                  active ? 'text-brand' : 'text-text-muted'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </motion.div>
            </Link>
          )
        })}
      </div>
    </motion.nav>
  )
}
