export interface ScannerOptions {
  autoScan?: boolean
  timeoutMs?: number
  timeoutFirstElementFactor?: number
  vertical?: boolean
  binary?: boolean
  startWithAction?: boolean
  roundsUntilBack?: number
  beepFeedback?: boolean
  readActive?: boolean
  readActiveRate?: number
  dualSwitch?: boolean
}

export type ScanPhase = "row" | "cell" | "idle"

export interface ScannerCallbacks {
  onActiveIndices: (indices: number[]) => void
  onSelect: (index: number) => void
  onAdvance: () => void
  onWrap: () => void
  onRestart: () => void
  onStop: () => void
  onReadActive?: (cell: { label?: string }) => void
}

const DEFAULT_OPTIONS: Required<ScannerOptions> = {
  autoScan: false,
  timeoutMs: 1000,
  timeoutFirstElementFactor: 1.0,
  vertical: false,
  binary: false,
  startWithAction: false,
  roundsUntilBack: 3,
  beepFeedback: false,
  readActive: false,
  readActiveRate: 1.0,
  dualSwitch: false,
}

/** Row-column / column-row scanner for AAC grids */
export class Scanner {
  private cells: { label?: string }[] = []
  private groups: { key: number; indices: number[] }[] = []
  private groupIndex = 0
  private cellIndex = 0
  private phase: ScanPhase = "idle"
  private running = false
  private timer: ReturnType<typeof setTimeout> | null = null
  private holdTimer: ReturnType<typeof setTimeout> | null = null
  private holding = false
  private options: Required<ScannerOptions>
  private callbacks: ScannerCallbacks
  private roundCount = 0
  private started = false

  constructor(options: ScannerOptions, callbacks: ScannerCallbacks) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.callbacks = callbacks
  }

  private get effectiveTimeout(): number {
    const base = this.options.timeoutMs
    if (!this.started && this.options.timeoutFirstElementFactor !== 1) {
      return Math.round(base * this.options.timeoutFirstElementFactor)
    }
    return base
  }

  /** Build groups indexed by row (or column if vertical) */
  init(cells: { position_row: number; position_col: number; label?: string }[]) {
    this.cells = cells
    this.groups = this.buildGroups(cells)
    this.groupIndex = 0
    this.cellIndex = 0
    this.phase = "idle"
    this.roundCount = 0
    this.started = false
  }

  private buildGroups(cells: { position_row: number; position_col: number }[]): { key: number; indices: number[] }[] {
    const map = new Map<number, number[]>()
    for (let i = 0; i < cells.length; i++) {
      const key = this.options.vertical ? cells[i].position_col : cells[i].position_row
      const arr = map.get(key) ?? []
      arr.push(i)
      map.set(key, arr)
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([key, indices]) => ({ key, indices }))
  }

  start() {
    if (this.running) return
    if (this.groups.length === 0) return
    this.running = true
    this.started = !this.options.startWithAction
    this.roundCount = 0
    this.groupIndex = 0
    this.cellIndex = 0
    this.phase = this.started ? "row" : "idle"
    if (this.started) {
      this.emitActive()
      if (this.options.autoScan) this.scheduleNext()
    }
  }

  stop() {
    this.running = false
    this.phase = "idle"
    this.clearTimers()
    this.callbacks.onActiveIndices([])
    this.callbacks.onStop()
  }

  pause() { this.clearTimers() }

  resume() {
    if (!this.running) return
    if (this.options.autoScan) this.scheduleNext()
  }

  destroy() {
    this.stop()
    this.cells = []
    this.groups = []
  }

  isRunning(): boolean { return this.running }
  getPhase(): ScanPhase { return this.phase }
  getGroupIndex(): number { return this.groupIndex }
  getCellIndex(): number { return this.cellIndex }

  private clearTimers() {
    if (this.timer) { clearTimeout(this.timer); this.timer = null }
    if (this.holdTimer) { clearTimeout(this.holdTimer); this.holdTimer = null }
  }

  private scheduleNext() {
    this.clearTimers()
    this.timer = setTimeout(() => this.advance(), this.effectiveTimeout)
  }

  /** Advance to next item (NEXT action) */
  advance() {
    if (!this.running) return
    this.clearTimers()

    if (!this.started) {
      this.started = true
      this.emitActive()
      if (this.options.autoScan) this.scheduleNext()
      return
    }

    if (this.phase === "row") {
      const prev = this.groupIndex
      this.groupIndex = (this.groupIndex + 1) % this.groups.length
      if (this.groupIndex === 0) this.roundCount++

      if (this.roundCount > this.options.roundsUntilBack) {
        this.roundCount = 0
        this.callbacks.onRestart()
      } else if (this.groupIndex === 0 && prev !== 0) {
        this.callbacks.onWrap()
      } else {
        this.callbacks.onAdvance()
      }

      this.emitActive()
      this.readActiveIfEnabled()
    } else {
      const group = this.groups[this.groupIndex]
      if (!group || group.indices.length <= 1) {
        // Single cell in group — select directly
        this.select()
        return
      }
      const prev = this.cellIndex
      this.cellIndex = (this.cellIndex + 1) % group.indices.length
      if (this.cellIndex === 0) {
        this.callbacks.onWrap()
        this.roundCount++
        if (this.roundCount > this.options.roundsUntilBack) {
          this.roundCount = 0
          this.phase = "row"
          this.callbacks.onRestart()
          this.emitActive()
          this.readActiveIfEnabled()
          if (this.options.autoScan) this.scheduleNext()
          return
        }
      } else if (prev !== this.cellIndex) {
        this.callbacks.onAdvance()
      }
      this.emitActive()
      this.readActiveIfEnabled()
    }

    if (this.options.autoScan) this.scheduleNext()
  }

  /** Select current item */
  select() {
    if (!this.running) return

    if (this.phase === "row") {
      const group = this.groups[this.groupIndex]
      if (!group || group.indices.length === 0) return

      if (group.indices.length === 1) {
        // Only one cell in this row — select it directly
        this.callbacks.onSelect(group.indices[0])
        this.phase = "row"
        this.emitActive()
        if (this.options.autoScan) this.scheduleNext()
        return
      }

      // Enter cell scanning
      this.phase = "cell"
      this.cellIndex = 0
      this.roundCount = 0
      this.callbacks.onAdvance()
      this.emitActive()
      this.readActiveIfEnabled()
      if (this.options.autoScan) this.scheduleNext()
    } else {
      const group = this.groups[this.groupIndex]
      if (!group) return
      const idx = group.indices[this.cellIndex]
      if (idx !== undefined) {
        this.callbacks.onSelect(idx)
      }
      // Return to row scanning
      this.phase = "row"
      this.emitActive()
      this.readActiveIfEnabled()
      if (this.options.autoScan) this.scheduleNext()
    }
  }

  /** Indices currently active (all in row during row-phase, single during cell-phase) */
  private getActiveIndices(): number[] {
    if (!this.running || this.phase === "idle") return []
    const group = this.groups[this.groupIndex]
    if (!group) return []
    if (this.phase === "row") return group.indices
    const idx = group.indices[this.cellIndex]
    return idx !== undefined ? [idx] : []
  }

  private emitActive() {
    const indices = this.getActiveIndices()
    this.callbacks.onActiveIndices(indices)
  }

  private readActiveIfEnabled() {
    if (!this.options.readActive) return
    const indices = this.getActiveIndices()
    if (indices.length > 0 && this.cells[indices[0]] && this.callbacks.onReadActive) {
      this.callbacks.onReadActive(this.cells[indices[0]])
    }
  }

  /** Single-switch mode: short press → advance, hold (400ms) → select */
  handleKeyDown() {
    if (!this.running) return
    this.holding = false
    this.clearTimers()
    if (this.options.startWithAction && !this.started) {
      this.started = true
      this.emitActive()
      this.readActiveIfEnabled()
      if (this.options.autoScan) this.scheduleNext()
      return
    }
    this.holdTimer = setTimeout(() => {
      this.holding = true
      this.select()
    }, 400)
  }

  handleKeyUp() {
    if (!this.running) return
    if (this.holdTimer) { clearTimeout(this.holdTimer); this.holdTimer = null }
    if (!this.holding) {
      this.advance()
    }
    this.holding = false
  }

  /** Dual-switch: separate handlers */
  handleNext() { this.advance() }
  handleSelect() { this.select() }

  updateOptions(opts: Partial<ScannerOptions>) {
    Object.assign(this.options, opts)
  }
}

/** Simple beep via AudioContext */
export function beep(freq = 800, duration = 80, type: OscillatorType = "square") {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.value = 0.15
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration / 1000)
  } catch { /* silent fail */ }
}

/** Setup keyboard handlers. Returns cleanup function. */
export function setupScannerKeyboard(
  scanner: Scanner,
  dualSwitch = false,
  nextKey = "Space",
  selectKey = "Enter"
) {
  const handleDown = (e: KeyboardEvent) => {
    if (e.repeat) return
    if (dualSwitch) {
      if (e.code === selectKey || e.key === selectKey) {
        e.preventDefault()
        scanner.handleSelect()
      } else if (e.code === nextKey || e.key === nextKey) {
        e.preventDefault()
        scanner.handleNext()
      }
    } else {
      if (e.code === nextKey || e.key === nextKey) {
        e.preventDefault()
        scanner.handleKeyDown()
      }
    }
  }
  const handleUp = (e: KeyboardEvent) => {
    if (!dualSwitch && (e.code === nextKey || e.key === nextKey)) {
      e.preventDefault()
      scanner.handleKeyUp()
    }
  }
  window.addEventListener("keydown", handleDown)
  window.addEventListener("keyup", handleUp)
  return () => {
    window.removeEventListener("keydown", handleDown)
    window.removeEventListener("keyup", handleUp)
  }
}
