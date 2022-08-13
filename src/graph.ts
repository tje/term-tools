import { GRAPH } from './characters'

type IBarChartConfig = {
  width: number
  height: number
  characters?: string[]
  min?: number
  max?: number
  doubleFit?: boolean
}

export function barChart (series: number[], config: IBarChartConfig): string[] {
  const characters = config.characters ?? GRAPH.BRAILLE
  const doubleFit = config.doubleFit
    ?? (config.characters === undefined || config.characters.length > 1)

  const min = config.min ?? Math.min(...series)
  const max = config.max ?? Math.max(...series)

  const seriesRange = config.width * (doubleFit ? 2 : 1)
  let sliceRange = Math.max(0, series.length - seriesRange)
  if (doubleFit && sliceRange > 0 && (series.length - sliceRange) % 2 !== 0) {
    sliceRange++
  }
  const bucket = series.slice(sliceRange)
  bucket.reverse()

  const popIndex = () => {
    const val = Math.max(min, Math.min(max, bucket.shift() ?? 0))
    return ((val - min) / (max - min)) * config.height
  }

  const cols: string[][] = []
  while (bucket.length > 0) {
    const col: string[] = []
    const pos = popIndex()
    const pos2 = doubleFit
      ? popIndex()
      : null
    const p = pos % 1

    for (let y = 0; y < config.height; y++) {
      let idxR = 0
      let idxL = 0
      if (pos >= y && pos < y + 1) {
        idxL = Math.round(p * (characters[0].length - 1))
      } else if (pos >= y + 1) {
        idxL = characters[0].length - 1
      }

      if (doubleFit && pos2 !== null) {
        const p = pos2 % 1
        if (pos2 >= y && pos2 < y + 1) {
          idxR = Math.round(p * (characters[0].length - 1))
        } else if (pos2 >= y + 1) {
          idxR = characters[0].length - 1
        }
      }
      col.push(characters[idxR][idxL])
    }
    col.reverse()
    cols.push(col)
  }
  cols.reverse()

  const out: string[] = []
  for (let y = 0; y < config.height; y++) {
    const row = []
    for (let x = 0; x < cols.length; x++) {
      row.push(cols[x][y])
    }
    out.push(row.join('').padStart(config.width, characters[0][0]))
  }
  return out
}