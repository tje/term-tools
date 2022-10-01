import { EASING } from './ease'

type ILogBoxOptions = {
  /** Log box height in lines */
  height: number
  /** Duration of color fade animation in milliseconds */
  fadeDuration: number
  /** Animation start time delay in milliseconds */
  fadeDelay: number
  /** Fade on log entry ('instant') or replacement ('succession') */
  fadeMode: 'instant' | 'succession'
  /** Initialize with empty lines on creation if true */
  fill: boolean
  /** Animation easing function */
  ease: (x: number) => number
}

type ILogLine = {
  text: string
  ts: number
  color: number
}

/**
 * Creates a log box widget that renders a limited set of lines with animated
 * color fade.
 */
export function createLogBox (options: Partial<ILogBoxOptions> = {}) {
  const opts: ILogBoxOptions = {
    height: 10,
    fadeDuration: 1000,
    fadeDelay: 500,
    fadeMode: 'instant',
    fill: true,
    ease: EASING.CUBIC_OUT,
    ...options,
  }

  const lines: ILogLine[] = []
  while (opts.fill && lines.length < opts.height) {
    lines.push({ text: '', ts: 0, color: 0xffffff })
  }

  /**
   * Push a new log entry to the box.
   * @param msg Log message
   * @param color Optional color to use
   */
  const log = (msg: string, color: number = 0xffffff) => {
    const ts = Date.now()
    const entries = msg.split('\n')
      .map((text) => ({
        text,
        ts,
        color,
      }))
    lines.push(...entries)
    if (lines.length > opts.height) {
      lines.splice(0, lines.length - opts.height)
    }
    return (m: string) => {
      m.split('\n').slice(0 - entries.length).forEach((l, idx) => {
        entries[idx].text = l
      })
    }
  }

  /**
   * Render the log box, returning an array of strings.
   */
  const render = (): string[] => {
    const out: string[] = []
    lines.forEach((line, idx) => {
      const now = Date.now()
      let fd = opts.fadeDelay
      if (opts.fadeMode === 'succession') {
        fd = Math.max((lines[idx + 1]?.ts ?? now) - line.ts, fd)
      }
      const t = now - line.ts - fd
      const pos = clamp(opts.ease(t / opts.fadeDuration))
      const [ r, g, b ] = blendRange(pos, line.color, 0x888888)
      out.push(`\x1b[38;2;${r};${g};${b}m${line.text}\x1b[0m`)
    })
    return out
  }

  return {
    log,
    render,
  }
}

type RGB = [ number, number, number ]

/**
 * Converts a hex number into RGB values
 * @param hex Color code in hex notation (e.g. 0xff0000)
 * @return Tuple containing R, G, B number values (0-255)
 */
function hexToRgb (hex: number): RGB {
  return [
    (hex >> 16) & 255,
    (hex >> 8) & 255,
    hex & 255,
  ]
}

/**
 * Converts an RGB tuple into hex number
 * @todo Unused
 */
function rgbToHex (r: number, g: number, b: number): number {
  return (1 << 24) + (r << 16) + (g << 8) + b
}

/**
 * Min/max number clamp shortcut
 * @param value Number to clamp
 * @param min Minimum value
 * @param max Maximum value
 */
function clamp (value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Blends two colors together
 * @todo Unused
 */
function blend (left: number, right: number, amount: number): RGB {
  const lrgb = hexToRgb(left)
  const rrgb = hexToRgb(right)

  return lrgb.map((c, i) => c + Math.round((rrgb[i] - c) * amount)) as RGB
}

/**
 * Fades between a range of hex colors
 * @param amount Fade or progress amount betwee 0 and 1
 * @param colors Hex colors to fade between, at least two are required
 * @return RGB tuple
 */
function blendRange (amount: number, ...colors: number[]): RGB {
  if (colors.length < 2) {
    throw new Error('At least two colors must be provided')
  }

  const i = amount * (colors.length - 1)
  const left = colors[Math.floor(i)]
  const right = colors[Math.ceil(i)]
  if (left === right) {
    return hexToRgb(left)
  }

  const lrgb = hexToRgb(left)
  const rrgb = hexToRgb(right)

  return lrgb.map((c, i) => c + Math.round((rrgb[i] - c) * amount)) as RGB
}
