'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Lumi } from '@/components/lumi/Lumi'
import { useSupabase } from '@/components/layout/SupabaseProvider'
import type { TeaLevel } from '@/types'

export default function OnboardingPage() {
  const router = useRouter()
  const { supabase, user, loading } = useSupabase()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [teaLevel, setTeaLevel] = useState<TeaLevel | null>(null)
  const [interests, setInterests] = useState<string[]>([])
  const [sensitivities, setSensitivities] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (loading || !user) return
    supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()
      .then(({ data: profile }) => {
        if (!profile) return
        supabase
          .from('children')
          .select('id')
          .eq('profile_id', profile.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data) router.replace('/ruta')
          })
      })
  }, [loading, user])

  const allInterests = ['Animales', 'Coches', 'Música', 'Dibujar', 'Agua', 'Bloques', 'Pelotas', 'Naturaleza']
  const allSensitivities = ['Sonidos fuertes', 'Luces brillantes', 'Texturas', 'Multitudes', 'Sabores nuevos']

  const steps = [
    {
      title: '¿Cómo se llama tu niño?',
      component: (
        <div className="flex flex-col items-center gap-4">
          <Lumi mood="thinking" message="¡Cuéntame cómo se llama!" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del niño..."
            className="w-full max-w-xs text-center text-xl font-bold p-4 border-2 border-border rounded-xl focus:border-brand outline-none"
            autoFocus
          />
        </div>
      ),
    },
    {
      title: '¿Qué edad tiene?',
      component: (
        <div className="flex flex-col items-center gap-4">
          <Lumi mood="thinking" message="¿Cuántos años tiene?" />
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {['0-2 años', '3-5 años', '6-10 años', '11-14 años'].map((a) => (
              <Card
                key={a}
                variant={age === a ? 'highlight' : 'default'}
                onClick={() => setAge(a)}
                className="cursor-pointer text-center"
                padding="lg"
              >
                <span className="text-2xl block mb-1">
                  {a.startsWith('0') ? '👶' : a.startsWith('3') ? '🧒' : a.startsWith('6') ? '👦' : '🧑'}
                </span>
                <span className="font-bold text-sm">{a}</span>
              </Card>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Nivel de TEA',
      component: (
        <div className="flex flex-col items-center gap-4">
          <Lumi mood="thinking" message="¿Qué nivel le diagnosticaron?" />
          <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
            {[
              { level: 1 as TeaLevel, label: 'Nivel 1', desc: 'Requiere apoyo', color: 'bg-green-100 text-green-700' },
              { level: 2 as TeaLevel, label: 'Nivel 2', desc: 'Requiere apoyo notable', color: 'bg-orange-100 text-orange-700' },
              { level: 3 as TeaLevel, label: 'Nivel 3', desc: 'Requiere apoyo muy notable', color: 'bg-red-100 text-red-700' },
            ].map((item) => (
              <Card
                key={item.level}
                variant={teaLevel === item.level ? 'highlight' : 'default'}
                onClick={() => setTeaLevel(item.level)}
                className="cursor-pointer"
                padding="md"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-extrabold px-3 py-1 rounded-full ${item.color}`}>
                    {item.label}
                  </span>
                  <span className="text-sm text-text-secondary">{item.desc}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Intereses del niño',
      component: (
        <div className="flex flex-col items-center gap-4">
          <Lumi mood="happy" message="¿Qué le gusta hacer?" />
          <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
            {allInterests.map((i) => (
              <Card
                key={i}
                variant={interests.includes(i) ? 'highlight' : 'default'}
                onClick={() =>
                  setInterests((prev) =>
                    prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
                  )
                }
                className="cursor-pointer text-center"
                padding="md"
              >
                <span className="font-bold text-sm">{i}</span>
              </Card>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Sensibilidades sensoriales',
      component: (
        <div className="flex flex-col items-center gap-4">
          <Lumi mood="thinking" message="¿Qué cosas lo incomodan?" />
          <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
            {allSensitivities.map((s) => (
              <Card
                key={s}
                variant={sensitivities.includes(s) ? 'highlight' : 'default'}
                onClick={() =>
                  setSensitivities((prev) =>
                    prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                  )
                }
                className="cursor-pointer"
                padding="md"
              >
                <span className="font-bold text-sm">{s}</span>
              </Card>
            ))}
          </div>
        </div>
      ),
    },
  ]

  const canProceed = () => {
    switch (step) {
      case 0: return name.trim().length > 0
      case 1: return age.length > 0
      case 2: return teaLevel !== null
      case 3: return interests.length > 0
      case 4: return true
      default: return false
    }
  }

  const handleFinish = async () => {
    if (!user) return
    setSaving(true)

    const ageRange = age.split(' ')[0]

    await supabase.from('profiles').upsert({
      user_id: user.id,
      name: user.email?.split('@')[0] ?? 'Familiar',
      role: 'parent',
    }, { onConflict: 'user_id' })

    const { error: profileError } = await supabase.from('profiles').upsert({
      user_id: user.id,
      name: user.email?.split('@')[0] ?? 'Familiar',
      role: 'parent',
    }, { onConflict: 'user_id' })
    console.log('profile error:', profileError)

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) { setSaving(false); return }

    const { data: existing } = await supabase
      .from('children')
      .select('id')
      .eq('profile_id', profile.id)
      .maybeSingle()

    if (existing) {
      await supabase.from('children').update({
        name,
        age_range: ageRange,
        tea_level: teaLevel,
        interests,
        sensory_sensitivities: sensitivities,
      }).eq('id', existing.id)
    } else {
      await supabase.from('children').insert({
        profile_id: profile.id,
        name,
        birth_date: new Date().toISOString().split('T')[0],
        age_range: ageRange,
        tea_level: teaLevel,
        interests,
        sensory_sensitivities: sensitivities,
      })
    }

    router.push('/ruta')
  }

  const current = steps[step]

  if (loading) return null

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="flex items-center gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-colors ${i <= step ? 'bg-brand' : 'bg-border'}`}
          />
        ))}
      </div>

      <h2 className="heading-page text-center">
        {current.title}
      </h2>

      {current.component}

      <div className="flex gap-3 mt-4">
        {step > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setStep((s) => s - 1)}>
            Atrás
          </Button>
        )}
        {step < steps.length - 1 ? (
          <Button variant="primary" disabled={!canProceed()} onClick={() => setStep((s) => s + 1)}>
            Siguiente
          </Button>
        ) : (
          <Button variant="primary" disabled={saving} onClick={handleFinish}>
            {saving ? 'Guardando...' : '¡Comenzar!'}
          </Button>
        )}
      </div>
    </div>
  )
}



