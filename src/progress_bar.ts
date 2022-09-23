import { PROGRESS_BAR, PROGRESS_SPIN } from './characters'

/**
 * Renders a progress bar from a given character length and percentage value
 *
 * @example
 * let progress = 0
 * setInterval(() => {
 *   const bar = progressBar(20, progress / 100)
 *   process.stdout.write(`\r${bar} ${progress}%   `)
 *   progress = (progress + 1) % 100
 * }, 20)
 */
export function progressBar (width: number, progress: number, characters: string = PROGRESS_BAR.SHADED) {
  const fillNum = Math.min(progress * width, width)
  const barChars = Math.floor(fillNum)
  const remainder = fillNum % 1
  let barFill = characters[0].repeat(barChars)
  if (progress < 1 && barFill.length < width) {
    const mcIdx = Math.round((1 - remainder) * (characters.length - 1))
    barFill += characters[mcIdx]
  }
  return barFill.padEnd(width, characters[characters.length - 1])
}

type PrimitiveHint = 'number' | 'string' | 'default'

function * createSpinGenerator (characters: string, speed = 0) {
  const chars = characters.split('')
  let ts = Date.now()
  while (true) {
    const char = chars.shift()!
    chars.push(char)
    while (true) {
      yield char
      if (Date.now() > ts + speed) {
        ts = Date.now()
        break
      }
    }
  }
}

/**
 * Creates a self-stepping "spinner" instance that returns one character from a
 * sequence based on an internal clock
 *
 * @example
 * const spin = spinner()
 * setInterval(() => process.stdout.write(`\r${spin.value} Loading...`), 20)
 */
export function spinner (characters: string = PROGRESS_SPIN.BRAILLE_LINEAR, speed = 50) {
  const gen = createSpinGenerator(characters, speed)
  return {
    [Symbol.toPrimitive] (hint: PrimitiveHint) {
      switch (hint) {
        case 'default':
        case 'string':
          return this.value
        case 'number':
          return NaN
      }
    },
    get value () {
      return gen.next().value
    },
  }
}

type IAnimatedBarConfig = {
  /** Width of bar in characters */
  width: number
  /** Animation duration in milliseconds */
  duration: number
  /** Character set to use, must be at least 3 characters */
  characters: string
  /** Easing function */
  ease: (x: number) => number
}
type IAnimatedBar = {
  /**
   * Update the percentage value of the progress bar
   * @param {number} progress Number between 0 and 1
   * @param {number} speed Override with custom duration (0 = immediate)
   */
  update (progress: number, duration?: number): void
  /** Returns the rendered progress bar as a string */
  toString (): string
  /** Animated progress value between 0 and 1 */
  progress: number
  /** Whether bar is currently animating or not */
  isAnimating: boolean
  /** Remaining animation time in milliseconds */
  timeLeft: number
}
/**
 * Creates a progress bar that animates as it is drawn.
 *
 * @example
 * const bar = createAnimatedBar(15)
 * setInterval(() => process.stdout.write(`\r${bar}  `), 20)
 * setInterval(() => bar.update(Math.random()), 1000)
 */
export function createAnimatedBar (configOrWidth: number): IAnimatedBar
export function createAnimatedBar (configOrWidth: Partial<IAnimatedBarConfig>): IAnimatedBar
export function createAnimatedBar (configOrWidth: Partial<IAnimatedBarConfig> | IAnimatedBarConfig['width']): IAnimatedBar {
  const opts: IAnimatedBarConfig = {
    width: 10,
    duration: 500,
    characters: PROGRESS_BAR.SHADED,
    ease: (x) => x,
  }
  if (typeof configOrWidth === 'number') {
    opts.width = configOrWidth
  } else {
    Object.assign(opts, configOrWidth)
  }
  opts.width = Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, opts.width))
  opts.duration = Math.max(0, opts.duration)

  const { duration, width, characters, ease } = opts

  let _dur = duration
  let startTs = Date.now()
  let from = 0
  let to = 0

  const update = (pos: number, duration?: number) => {
    if (pos === to && duration === undefined) {
      return
    }
    from = getPos()
    to = pos
    startTs = Date.now()
    _dur = Math.max(0, duration ?? opts.duration)
  }

  const getPos = () => {
    const timePos = ease(Math.min(1, (Date.now() - startTs) / _dur))
    const pos = Math.max(0, Math.min(1, from + (to - from) * timePos))
    return pos
  }

  const toString = () => {
    return progressBar(width, getPos(), characters)
  }

  return {
    update,
    toString,
    // @ts-ignore
    [Symbol.toPrimitive] (hint: PrimitiveHint) {
      switch (hint) {
        case 'default':
        case 'string':
          return toString()
        case 'number':
          return getPos()
      }
    },
    get progress () {
      return getPos()
    },
    get isAnimating () {
      return Date.now() < startTs + _dur
    },
    get timeLeft () {
      return Math.max(0, (startTs + _dur) - Date.now())
    },
  }
}
