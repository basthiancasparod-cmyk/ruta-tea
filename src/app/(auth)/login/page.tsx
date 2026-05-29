'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/auth/callback` } })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (mode === 'signup') {
      setError('Revisa tu correo para confirmar la cuenta')
      setLoading(false)
      return
    }

    const { data: children } = await supabase
      .from('children')
      .select('id')
      .limit(1)

    router.push(children && children.length > 0 ? '/ruta' : '/onboarding')
    router.refresh()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      <div className="flex flex-col items-center gap-4">
        <img
          src="/dino-logo.png"
          alt="Dino Aprende"
          width={170}
          height={170}
          className="object-contain mt-8"
          style={{ maxWidth: '100%' }}
        />
        <h1 className="text-3xl font-extrabold text-text-primary">
          {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </h1>
        {mode === 'signup' && (
          <p className="text-text-secondary text-center max-w-xs">
            Regístrate para comenzar a usar Dino Aprende
          </p>
        )}
      </div>

      <Card variant="default" padding="lg" className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-bold text-text-secondary block mb-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              className="w-full p-3 border-2 border-border rounded-xl text-base font-bold outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-text-secondary block mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full p-3 border-2 border-border rounded-xl text-base font-bold outline-none focus:border-brand"
            />
          </div>

          {error && (
            <p className="text-sm font-bold text-error text-center">{error}</p>
          )}

          <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
            {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            className="text-sm font-bold text-brand hover:underline"
          >
            {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </Card>
    </div>
  )
}
