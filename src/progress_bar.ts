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
