"use client"

const SPEAK_EV = "caa-speaking"

export interface SpeakOptions {
  voice?: string
  rate?: number
  pitch?: number
  volume?: number
  lang?: string
  dontStop?: boolean
}

interface QueueItem {
  text: string
  options: SpeakOptions
}

let _synth: SpeechSynthesis | null = null
let _voices: SpeechSynthesisVoice[] = []
let _voicesLoaded = false
let _queue: QueueItem[] = []
let _speaking = false
let _utterance: SpeechSynthesisUtterance | null = null

function getSynth(): SpeechSynthesis {
  if (!_synth && typeof window !== "undefined") {
    _synth = window.speechSynthesis
  }
  return _synth!
}

export function initVoices(): Promise<SpeechSynthesisVoice[]> {
  if (_voicesLoaded) return Promise.resolve(_voices)
  const synth = getSynth()
  return new Promise((resolve) => {
    const check = () => {
      const v = synth.getVoices()
      if (v.length > 0) {
        _voices = v
        _voicesLoaded = true
        resolve(v)
      } else {
        setTimeout(check, 50)
      }
    }
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = () => {
        _voices = synth.getVoices()
        _voicesLoaded = true
        resolve(_voices)
      }
    }
    check()
  })
}

export function getVoices(lang?: string): SpeechSynthesisVoice[] {
  if (lang) return _voices.filter((v) => v.lang.startsWith(lang))
  return _voices
}

export function getVoiceById(id: string): SpeechSynthesisVoice | undefined {
  return _voices.find((v) => v.voiceURI === id)
}

export function getVoiceByName(name: string): SpeechSynthesisVoice | undefined {
  return _voices.find((v) => v.name === name)
}

export function getVoicesGroupedByLang(): { lang: string; langLabel: string; voices: SpeechSynthesisVoice[] }[] {
  const map = new Map<string, SpeechSynthesisVoice[]>()
  for (const v of _voices) {
    const existing = map.get(v.lang) ?? []
    existing.push(v)
    map.set(v.lang, existing)
  }
  return Array.from(map.entries())
    .map(([lang, voices]) => ({ lang, langLabel: lang, voices }))
    .sort((a, b) => a.lang.localeCompare(b.lang))
}

export function findBestVoice(lang?: string, preferredVoice?: string): SpeechSynthesisVoice | undefined {
  if (preferredVoice) {
    const byId = getVoiceById(preferredVoice)
    if (byId) return byId
    const byName = getVoiceByName(preferredVoice)
    if (byName) return byName
  }
  if (lang) {
    const voices = getVoices(lang)
    if (voices.length > 0) return voices[0]
  }
  return _voices.find((v) => v.lang.startsWith("es")) ?? _voices[0]
}

function dispatchSpeaking(speaking: boolean) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(SPEAK_EV, { detail: speaking }))
}

function createUtterance(text: string, options: SpeakOptions): SpeechSynthesisUtterance {
  const u = new SpeechSynthesisUtterance(text)
  const synth = getSynth()

  if (options.voice) {
    const v = findBestVoice(undefined, options.voice)
    if (v) u.voice = v
  }
  if (options.lang) u.lang = options.lang
  if (options.rate !== undefined) u.rate = Math.max(0.1, Math.min(10, options.rate))
  if (options.pitch !== undefined) u.pitch = Math.max(0, Math.min(2, options.pitch))
  if (options.volume !== undefined) u.volume = Math.max(0, Math.min(1, options.volume))

  u.onstart = () => {
    _speaking = true
    dispatchSpeaking(true)
  }
  u.onend = () => {
    _utterance = null
    _speaking = false
    dispatchSpeaking(false)
    processQueue()
  }
  u.onerror = () => {
    _utterance = null
    _speaking = false
    dispatchSpeaking(false)
    processQueue()
  }

  return u
}

function processQueue() {
  if (_queue.length === 0) return
  if (_speaking) return

  const item = _queue.shift()!
  _utterance = createUtterance(item.text, item.options)
  const synth = getSynth()
  try { synth.speak(_utterance!) } catch { processQueue() }
}

export function speakText(text: string, options?: SpeakOptions | number): void {
  const synth = getSynth()
  if (!synth) return

  let opts: SpeakOptions
  if (typeof options === "number") {
    opts = { rate: options }
  } else {
    opts = options ?? {}
  }

  if (!opts.dontStop) {
    stopSpeaking()
  }

  _queue.push({ text, options: opts })
  if (!_speaking) {
    processQueue()
  }
}

export function speakArray(texts: string[], options?: SpeakOptions): void {
  for (const t of texts) {
    speakText(t, { ...options, dontStop: true })
  }
}

export function stopSpeaking(): void {
  const synth = getSynth()
  if (!synth) return
  synth.cancel()
  _utterance = null
  _queue = []
  if (_speaking) {
    _speaking = false
    dispatchSpeaking(false)
  }
}

export function pauseSpeaking(): void {
  const synth = getSynth()
  if (synth && _speaking) synth.pause()
}

export function resumeSpeaking(): void {
  const synth = getSynth()
  if (synth) synth.resume()
}

export function isSpeaking(): boolean {
  return _speaking
}

export { SPEAK_EV }
