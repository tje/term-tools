import { GRAPH } from './characters'

type IBarChartConfig = {
  width: number
  height: number
  characters?: string[]
  min?: number
  max?: number
  doubleFit?: boolean
}
export function barChart (series: number[], config: IBarChartConfig) {
  const characters = config.characters ?? GRAPH.BRAILLE
  const doubleFit = config.doubleFit
    ?? (config.characters === undefined || config.characters.length > 1)

  const min = config.min ?? Math.min(...series)
  const max = config.max ?? Math.max(...series)

  const seriesRange = config.width * (doubleFit ? 2 : 1)
  let sliceRange = Math.max(0, series.length - 1 - seriesRange)
  if (doubleFit && sliceRange > 0 && (series.length - sliceRange) % 2 !== 0) {
    sliceRange++
  }
  const bucket = series.slice(sliceRange)
  bucket.reverse()

  const out: string[] = []
  while (bucket.length > 0) {
    const left = Math.max(min, Math.min(max, bucket.shift() ?? 0))
    const posLeft = (left - min) / (max - min)
    if (!doubleFit) {
      const charLine = characters[0]
      const char = charLine[Math.round(posLeft * (charLine.length - 1))]
      out.push(char)
      continue
    }
    const right = Math.max(min, Math.min(max, bucket.shift() ?? 0))
    const posRight = (right - min) / (max - min)
    const charRow = characters[Math.round(posRight * (characters.length - 1))]
    const char = charRow[Math.round(posLeft * (charRow.length - 1))]
    out.push(char)
  }
  out.reverse()
  return out.join('').padStart(config.width, ' ')
}
