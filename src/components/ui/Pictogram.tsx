"use client"

import { useState, useEffect, useRef } from "react"

// ─── IDs verificados de ARASAAC ───────────────────────────────────────────────
// Obtenidos via https://api.arasaac.org/v1/pictograms/es/search/{term}
// Solo usamos IDs reales — si no existe en este mapa se consulta la API
// ─── IDs reales verificados ARASAAC ─────────────────────────────────────────
const VERIFIED_IDS: Record<string, number> = {
  // Social
  "hola": 6522,
  "adios": 6028,
  "gracias": 8129,
  "por favor": 8195,
  "porfavor": 8195,
  "si": 5584,
  "no": 5526,

  // Personas
  "yo": 6632,
  "mama": 2458,
  "papa": 31146,
  "hermano": 2423,
  "amigo": 25790,
  "profesora": 6556,

  // Verbos
  "querer": 11538,
  "comer": 6456,
  "beber": 6061,
  "jugar": 23392,
  "ir": 8142,
  "ver": 6564,
  "dormir": 6479,
  "caminar": 6044,
  "correr": 6465,
  "saltar": 39052,
  "leer": 7141,
  "dibujar": 8088,
  "cantar": 6960,

  // Emociones
  "alegre": 35533,
  "triste": 35545,
  "enfadado": 35539,
  "miedo": 10261,
  "cansado": 35537,
  "amor": 8020,
  "sorprendido": 35529,
  "bien": 5397,
  "mal": 5504,

  // Objetos
  "agua": 32464,
  "comida": 4610,
  "juguete": 9813,
  "libro": 25191,
  "pelota": 3241,
  "tablet": 9165,

  // Lugares
  "casa": 6964,
  "escuela": 32446,
  "parque": 2859,
  "playa": 30518,
  "medico": 6561,
  "tienda": 35695,
  "restaurante": 32408,

  // Tiempo
  "hoy": 7131,
  "manana": 38277,
  "mañana": 38277,
  "ayer": 38279,
  "noche": 26997,
  "dia": 37731,
  "despues": 32749,
  "ahora": 32747,

  // Animales
  "perro": 7202,
  "gato": 7114,
  "pajaro": 2490,
  "pez": 2520,
  "caballo": 2294,
  "vaca": 2609,
  "conejo": 2351,
  "elefante": 2372,

  // Comida adicional
  "manzana": 2462,
  "leche": 2445,
  "pan": 2494,
  "galleta": 8312,
  "platano": 2530,
  "queso": 2541,
  "helado": 35209,
  "jugo": 11461,
  "pizza": 2527,
  "chocolate": 25940,

  // Colores
  "rojo": 2808,
  "azul": 4869,
  "verde": 4887,
  "amarillo": 2648,
  "blanco": 8043,
  "negro": 2886,
  "morado": 2907,
  "rosa": 3151,

  // Ropa
  "camiseta": 2309,
  "pantalones": 2565,
  "zapatos": 2775,
  "calcetines": 2298,
  "chaqueta": 4872,
  "gorro": 39395,

  // Otros
  "muneco": 3131,
  "puzzle": 2540,
  "peluche": 4945,
  "mas": 3220,
  "menos": 3200,
  "mucho": 7168,
  "poco": 7209,
  "grande": 4658,
  "pequeno": 5956
}

// ─── Emoji fallback para cuando ARASAAC no responde ──────────────────────────
const EMOJI_FB: Record<string, string> = {
  "hola":"👋","adios":"👋","gracias":"🙏","porfavor":"🙏","por favor":"🙏",
  "si":"✅","afirmacion":"✅","no":"❌","ayuda":"🆘","perdon":"😅",
  "yo":"👤","tu":"👥","mama":"👩","papa":"👨","hermano":"👦","hermana":"👧",
  "abuelo":"👴","abuela":"👵","amigo":"🤝","medico":"👨‍⚕️","profesora":"👩‍🏫","bebe":"👶",
  "querer":"❤️","necesitar":"⚠️","ir":"🚶","hacer":"🤲","ver":"👁️","dar":"🤲",
  "comer":"🍽️","beber":"🥤","dormir":"😴","jugar":"🎮","leer":"📖",
  "cantar":"🎵","dibujar":"✏️","correr":"🏃","saltar":"⬆️","caminar":"🚶",
  "lavarse":"🧼","vestirse":"👕","escribir":"✍️","escuchar":"👂",
  "agua":"💧","comida":"🍽️","leche":"🥛","pan":"🍞","galleta":"🍪",
  "manzana":"🍎","platano":"🍌","queso":"🧀","helado":"🍦","jugo":"🥤",
  "pizza":"🍕","chocolate":"🍫","arroz":"🍚","pollo":"🍗",
  "perro":"🐕","gato":"🐱","pajaro":"🐦","pez":"🐟","caballo":"🐴",
  "vaca":"🐄","conejo":"🐰","elefante":"🐘",
  "alegre":"😊","feliz":"😊","triste":"😢","enfadado":"😠","enojado":"😠",
  "miedo":"😨","asustado":"😨","cansado":"😴","amor":"❤️",
  "sorprendido":"😮","bien":"👍","mal":"👎","dolor":"🤕","hambre":"🤤","sed":"💧",
  "rojo":"🔴","azul":"🔵","verde":"🟢","amarillo":"🟡",
  "blanco":"⚪","negro":"⚫","morado":"🟣","rosa":"🌸",
  "camiseta":"👕","pantalones":"👖","zapatos":"👟","calcetines":"🧦",
  "chaqueta":"🧥","gorro":"🎩",
  "pelota":"⚽","muneco":"🧸","muñeco":"🧸","coche":"🚗",
  "peluche":"🧸","puzzle":"🧩","juguete":"🎁","piezas":"🧱",
  "casa":"🏠","escuela":"🏫","parque":"🌳","playa":"🏖️",
  "hospital":"🏥","tienda":"🏪","restaurante":"🍽️","aqui":"📍",
  "hoy":"📅","manana":"🌅","mañana":"🌅","ayer":"📆",
  "noche":"🌙","dia":"☀️","despues":"⏩","después":"⏩","ahora":"⚡","antes":"⏪",
  "mas":"➕","más":"➕","menos":"➖","mucho":"🔼","poco":"🔽",
  "grande":"🐘","pequeno":"🐭",
  "dientes":"🦷","manos":"🤲","toalla":"🧻",
}

// ─── Cache ────────────────────────────────────────────────────────────────────
const apiCache = new Map<string, number | null>()

async function resolveId(keyword: string): Promise<number | null> {
  const k = keyword.toLowerCase().trim()
  if (VERIFIED_IDS[k] !== undefined) return VERIFIED_IDS[k]
  if (apiCache.has(k)) return apiCache.get(k)!
  try {
    const res = await fetch(
      `https://api.arasaac.org/v1/pictograms/es/search/${encodeURIComponent(k)}`,
      { signal: AbortSignal.timeout(6000) }
    )
    if (!res.ok) { apiCache.set(k, null); return null }
    const data = await res.json()
    const id = Array.isArray(data) && data.length > 0 ? (data[0]._id as number) : null
    apiCache.set(k, id)
    return id
  } catch {
    apiCache.set(k, null)
    return null
  }
}

function arasaacUrl(id: number) {
  return `https://static.arasaac.org/pictograms/${id}/${id}_300.png`
}

export async function searchPictogramId(keyword: string) { return resolveId(keyword) }
export function getPictogramUrl(id: number) { return arasaacUrl(id) }

// ─── Component ────────────────────────────────────────────────────────────────
interface PictogramProps {
  keyword: string
  size?: number
  className?: string
}

export function Pictogram({ keyword, size = 120, className = "" }: PictogramProps) {
  const [phase, setPhase] = useState<"loading" | "img" | "emoji" | "err">("loading")
  const [url, setUrl] = useState<string | null>(null)
  const dead = useRef(false)
  const lower = keyword.toLowerCase().trim()
  const emoji = EMOJI_FB[lower]

  useEffect(() => {
    dead.current = false
    setPhase("loading")
    setUrl(null)
    resolveId(keyword).then((id) => {
      if (dead.current) return
      if (id) { setUrl(arasaacUrl(id)); setPhase("img") }
      else if (emoji) setPhase("emoji")
      else setPhase("err")
    })
    return () => { dead.current = true }
  }, [keyword])

  const box = `rounded-xl flex items-center justify-center ${className}`

  if (phase === "loading")
    return (
      <div className={`${box} bg-surface-secondary animate-pulse`} style={{ width: size, height: size }}>
        <span className="text-xl opacity-20">🖼️</span>
      </div>
    )

  if (phase === "emoji")
    return (
      <div className={`${box} bg-surface-secondary/50`} style={{ width: size, height: size }}
        role="img" aria-label={keyword}>
        <span style={{ fontSize: size * 0.52 }} role="img" aria-label={keyword}>{emoji}</span>
      </div>
    )

  if (phase === "img" && url)
    return (
      <img src={url} alt={keyword} width={size} height={size}
        className={`object-contain rounded-xl ${className}`}
        loading="lazy"
        onError={() => emoji ? setPhase("emoji") : setPhase("err")}
      />
    )

  return (
    <div className={`${box} bg-surface-secondary`} style={{ width: size, height: size }}>
      <span className="text-2xl">🖼️</span>
    </div>
  )
}

