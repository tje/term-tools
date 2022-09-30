type IBoxConfig = {
  /** Label embedded in the border of the box */
  label: string
  /** Box content */
  content: string | string[]
  /** Inner box width in characters */
  width?: number
  /** Inner box height in lines */
  height?: number
  /** Vertical alignment of content when lines is less than height */
  vAlign?: 'top' | 'bottom'
  /** Label position */
  labelPosition?: 'top' | 'bottom'
}

export function drawBox (opts: IBoxConfig): string[] {
  const label = opts.label

  let lines = opts.content
  if (!Array.isArray(lines)) {
    lines = lines.split('\n')
  }

  const body = lines.map((l) => l.split('\n'))
    .flat()
    .map((l) => LogLine.from(l))
  const iw = opts.width
    ?? Math.max(...body.map((l) => l.text.length), label.length + 2)

  if (opts.height) {
    if (body.length < opts.height) {
      const filler = new Array(opts.height - body.length)
        .fill(' '.repeat(iw))
      if (opts.vAlign === 'bottom') {
        body.unshift(...filler)
      } else {
        body.push(...filler)
      }
    }
    body.splice(opts.height)
  }

  const H = '─'
  const V = '│'
  const TL = '┌'
  const TR = '┐'
  const BL = '└'
  const BR = '┘'

  const labelLen = label.length // @todo w/ LogLine
  const hl = H.repeat(Math.floor((iw - labelLen) / 2 - 1))
  const hr = H.repeat(Math.ceil((iw - labelLen) / 2 - 1))
  const headerLine = `${hl} ${label} ${hr}`

  let header = H.repeat(iw)
  let footer = H.repeat(iw)
  if (opts.labelPosition === 'bottom') {
    footer = headerLine
  } else {
    header = headerLine
  }

  const out = [
    `${TL}${H}${header}${H}${TR}`,
    ...body.map((l) => {
      const line = l.truncate(iw)
      const text = line.toString()
      const sp = ' '.repeat(Math.max(0, iw - line.text.length))
      return `${V} ${text + sp} ${V}`
    }),
    `${BL}${H}${footer}${H}${BR}`,
  ]
  return out
}

// https://github.com/chalk/ansi-regex
const RX_ANSI = new RegExp(
  '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
)

/** String index and escape sequence */
type ILogLineControl = [number, string]

/**
 * Separates ANSI escape sequences (like color codes) from plain text
 * @todo Control code restoration likely doesn't account for most sequences such
 *    as cursor movements correctly, need to test and maybe switch to preserving
 *    all codes?
 */
class LogLine {
  constructor (private _text: string, private _controls: ILogLineControl[]) {}

  /**
   * Create a new LogLine instance from a string
   */
  public static from (s: string): LogLine {
    const controls: ILogLineControl[] = []
    let text = s
    let m: RegExpMatchArray | null = null
    while ((m = text.match(RX_ANSI)) !== null) {
      if (m.index === undefined) {
        break
      }
      controls.push([m.index, m[0]])
      text = text.substring(0, m.index) + text.substring(m.index + m[0].length)
    }

    return new LogLine(text, controls)
  }

  get text () {
    return this._text
  }

  get controls () {
    return this._controls
      .map((control) => control.slice()) as ILogLineControl[]
  }

  public truncate (len: number): LogLine {
    const text = this.text.substring(0, len)
    const lastControl = this.controls
      .find(([ idx ]) => idx === this.text.length)
    const controls = this.controls.filter(([ idx ]) => idx < len)
    if (lastControl) {
      lastControl[0] = text.length
      controls.push(lastControl)
    }
    return new LogLine(text, controls)
  }

  public padEnd (len: number, fill = ' ') {
    return new LogLine(this.text.padEnd(len, fill), this.controls)
  }

  public toString () {
    const controls = this.controls
    let str = this.text
    while (controls.length > 0) {
      const control = controls.pop()!
      str = str.substring(0, control[0]) + control[1] + str.substring(control[0])
    }
    return str
  }
}

export const createLogLine = (s: string) => LogLine.from(s)

export const joinLines = (...groups: string[][]) => {
  const out: string[] = []
  const maxRows = Math.max(...groups.map((g) => g.length))
  while (out.length < maxRows) {
    out.push('')
  }
  for (const group of groups) {
    const lines = group.map((l) => LogLine.from(l)) // @todo split(\n)
    while (lines.length < maxRows) {
      lines.push(LogLine.from(''))
    }
    const maxCols = Math.max(...lines.map((l) => l.text.length))
    for (let idx = 0; idx < maxRows; idx++) {
      const line = lines[idx].padEnd(maxCols)
      out[idx] += line.toString()
    }
  }
  return out
}
