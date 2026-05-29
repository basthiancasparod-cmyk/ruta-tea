import Link from 'next/link'
import { Lumi } from '@/components/lumi/Lumi'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <Lumi mood="happy" size="lg" />
        <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">
          Bienvenido a{' '}
          <span className="text-brand">Dino Aprende</span>
        </h1>
        <p className="text-lg text-text-secondary max-w-md">
          Una plataforma divertida y educativa para acompañar a niños con TEA
          en su desarrollo, con terapias gamificadas y recursos para toda la familia.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/login"
          className="w-full bg-brand text-white font-extrabold text-lg py-4 px-8 rounded-xl shadow-[0_4px_0_#3A9A87] hover:translate-y-[2px] hover:shadow-[0_2px_0_#3A9A87] active:translate-y-[4px] active:shadow-none transition-all text-center"
        >
          Comenzar ahora
        </Link>
        <Link
          href="/login"
          className="w-full border-2 border-brand text-brand font-bold text-lg py-4 px-8 rounded-xl hover:bg-brand-bg transition-all text-center"
        >
          Iniciar sesión
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 w-full max-w-2xl">
        {[
          { icon: '🧩', title: 'Ruta Terapéutica', desc: 'Lecciones gamificadas diseñadas por especialistas' },
          { icon: '📖', title: 'Rincón Familiar', desc: 'Guías, recursos y apoyo para toda la familia' },
          { icon: '🎮', title: 'Herramientas', desc: 'Agendas visuales, CAA y juegos interactivos' },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-surface border border-border rounded-xl p-5 flex flex-col items-center gap-2 text-center"
          >
            <span className="text-3xl">{item.icon}</span>
            <h3 className="heading-card">{item.title}</h3>
            <p className="text-xs text-text-muted">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
