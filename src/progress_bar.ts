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


function * createSpinner (characters: string) {
  const chars = characters.split('')
  while (true) {
    const char = chars.shift()!
    chars.push(char)
    yield char
  }
}
export function spinner (characters: string = PROGRESS_SPIN.BASIC) {
  const gen = createSpinner(characters)
  return {
    [Symbol.toPrimitive] () {
      return gen.next().value
    }
  }
}
