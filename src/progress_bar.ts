import { PROGRESS_BAR, PROGRESS_SPIN } from './characters'

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
  width: number
  speed: number
  characters: string
  ease: (x: number) => number
}

export function createAnimatedBar (configOrWidth: Partial<IAnimatedBarConfig> | IAnimatedBarConfig['width']) {
  const opts: IAnimatedBarConfig = {
    width: 10,
    speed: 500,
    characters: PROGRESS_BAR.SHADED,
    ease: (x) => x,
  }
  if (typeof configOrWidth === 'number') {
    opts.width = configOrWidth
  } else {
    Object.assign(opts, configOrWidth)
  }
  opts.width = Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, opts.width))
  opts.speed = Math.max(0, opts.speed)

  const { speed, width, characters, ease } = opts

  let startTs = Date.now()
  let from = 0
  let to = 0

  const update = (pos: number) => {
    if (pos === to) {
      return
    }
    from = getPos()
    to = pos
    startTs = Date.now()
  }

  const getPos = () => {
    const timePos = ease(Math.min(1, (Date.now() - startTs) / speed))
    const pos = from + (to - from) * timePos
    return pos
  }

  const toString = () => {
    return progressBar(width, getPos(), characters)
  }

  return {
    update,
    toString,
    [Symbol.toPrimitive] (hint: PrimitiveHint) {
      switch (hint) {
        case 'default':
        case 'string':
          return this.value
        case 'number':
          return getPos()
      }
    },
    get value () {
      return toString()
    },
  }
}
