import { GRAPH } from './characters'

type IBarChartConfig = {
  /** Chart width in characters */
  width: number
  /** Chart height in number of lines */
  height: number
  /** Character set to use */
  characters?: string[]
  /** Minimum y-axis value */
  min?: number
  /** Maximum y-axis value */
  max?: number
  /** Whether character set can squeeze two values in one character (braille) */
  doubleFit?: boolean
}

/**
 * Renders a bar chart from a given series, returning an array of strings based
 * on height
 *
 * @example
 * const series = []
 * const chartConfig = {
 *   width: 15,
 *   height: 4,
 * }
 * setInterval(() => {
 *   series.push(Math.random() * 100)
 *   if (series.length > 30) {
 *     series.splice(0, series.length - 30)
 *   }
 *   const rows = barChart(series, chartConfig)
 *   console.clear()
 *   console.log(rows.join('\n'))
 * }, 50)
 */
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
