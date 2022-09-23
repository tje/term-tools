import { EASING } from './ease'

type ILogBoxOptions = {
  height: number
  fadeDuration: number
  fadeDelay: number
  ease: (x: number) => number
}

type ILogLine = {
  text: string
  ts: number
  color: number
}

export function createLogBox (options: Partial<ILogBoxOptions>) {
  const opts = {
    height: 10,
    fadeDuration: 1000,
    fadeDelay: 500,
    ease: EASING.CUBIC_OUT,
    ...options,
  }

  const lines: ILogLine[] = []

  const log = (text: string, color: number = 0xffffff) => {
    lines.push({
      text,
      ts: Date.now(),
      color,
    })
    if (lines.length > opts.height) {
      lines.splice(0, lines.length - opts.height)
    }
  }

  const render = (): string[] => {
    const out: string[] = []
    for (const line of lines) {
      const t = Date.now() - line.ts - opts.fadeDelay
      const pos = clamp(opts.ease(t / opts.fadeDuration))
      const [ r, g, b ] = blendRange(pos, line.color, 0x888888)
      out.push(`\x1b[38;2;${r};${g};${b}m${line.text}\x1b[0m`)
    }
    return out
  }

  return {
    log,
    render,
  }
}

type RGB = [ number, number, number ]

function hexToRgb (hex: number): RGB {
  return [
    (hex >> 16) & 255,
    (hex >> 8) & 255,
    hex & 255,
  ]
}
function rgbToHex (r: number, g: number, b: number): number {
  return (1 << 24) + (r << 16) + (g << 8) + b
}

function clamp (value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value))
}

function blend (left: number, right: number, amount: number): RGB {
  const lrgb = hexToRgb(left)
  const rrgb = hexToRgb(right)

  return lrgb.map((c, i) => c + Math.round((rrgb[i] - c) * amount)) as RGB
}

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
