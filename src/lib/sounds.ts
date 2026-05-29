'use client'

type SoundName = 'correct' | 'wrong' | 'click' | 'celebration' | 'streak' | 'xp' | 'lumi_happy' | 'lumi_sad'

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.value = volume
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration)
}

function playSequence(notes: [number, number, string?][], baseDelay = 0) {
  notes.forEach(([freq, dur, type], i) => {
    setTimeout(() => playTone(freq, dur, (type as OscillatorType) ?? 'sine'), baseDelay + i * 120)
  })
}

export function playSound(name: SoundName) {
  try {
    switch (name) {
      case 'correct':
        playSequence([
          [523, 0.15],
          [659, 0.15],
          [784, 0.2],
        ])
        break
      case 'wrong':
        playSequence([
          [300, 0.2, 'sawtooth'],
          [250, 0.3, 'sawtooth'],
        ])
        break
      case 'click':
        playTone(800, 0.05, 'square', 0.08)
        break
      case 'celebration':
        playSequence([
          [523, 0.12],
          [659, 0.12],
          [784, 0.12],
          [1047, 0.3],
        ])
        setTimeout(() => {
          playSequence([
            [784, 0.12],
            [1047, 0.4],
          ])
        }, 350)
        break
      case 'streak':
        playSequence([
          [440, 0.1],
          [554, 0.1],
          [659, 0.1],
          [880, 0.3],
        ])
        break
      case 'xp':
        playSequence([
          [600, 0.1],
          [800, 0.15],
        ])
        break
      case 'lumi_happy':
        playSequence([
          [440, 0.2],
          [554, 0.2],
          [659, 0.25],
        ])
        break
      case 'lumi_sad':
        playSequence([
          [400, 0.25, 'sine'],
          [350, 0.3, 'sine'],
        ])
        break
    }
  } catch {
    // Silently ignore audio errors
  }
}

const HAPTIC = {
  click: [15],
  correct: [30, 50, 30],
  wrong: [50, 30, 50],
  celebration: [50, 80, 50, 80, 100],
  streak: [30, 60, 30, 60, 30],
}

export function vibrate(pattern: keyof typeof HAPTIC) {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(HAPTIC[pattern])
    }
  } catch {
    // Silently ignore vibration errors
  }
}

export function useSound() {
  return { playSound, vibrate }
}
