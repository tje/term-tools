import { BORDERS } from './characters'

type IBoxCharacters = {
  H: string
  V: string
  TR: string
  TL: string
  BL: string
  BR: string
}

type IBoxConfig = {
  /** Label embedded in the border of the box */
  label?: string
  /** Box content */
  content: string | string[]
  /** Outer box width in characters, including borders and padding */
  width?: number
  /** Outer box height in lines, including borders */
  height?: number
  /** Vertical alignment of content when lines is less than height */
  vAlign?: 'top' | 'bottom'
  /** Horizontal alignment of content */
  hAlign?: 'left' | 'right'
  /** Side to anchor content when lines exceeds vertical height */
  vAnchor?: 'top' | 'bottom'
  /** Label position */
  labelPosition?: 'top' | 'bottom'
  /** Custom border character set to use */
  characters?: IBoxCharacters
  /** Customizable border color, should match valid ansi escape sequence */
  borderColor?: string
  /** Customizable background color */
  backgroundColor?: string
}

export function drawBox (opts: IBoxConfig): string[] {
  const label = opts.label
    ? LogLine.from(opts.label)
    : null
  const labelLen = label?.text.length ?? 0
  const vAnchor = opts.vAnchor
    ?? opts.vAlign
    ?? 'top'

  let lines = opts.content
  if (!Array.isArray(lines)) {
    lines = lines.split('\n')
  }

  const body = lines.map((l) => l.split('\n'))
    .flat()
    .map((l) => LogLine.from(l))

  const iw = opts.width
    ? opts.width - 4
    : Math.max(...body.map((l) => l.text.length), labelLen)

  const ih = opts.height
    ? opts.height - 2
    : body.length

  if (body.length < ih) {
    const filler = new Array(ih - body.length)
      .fill(' '.repeat(iw))
      .map((l) => LogLine.from(l))
    if (opts.vAlign === 'bottom') {
      body.unshift(...filler)
    } else {
      body.push(...filler)
    }
  }
  if (vAnchor === 'bottom') {
    body.splice(0, body.length - ih)
  } else {
    body.splice(ih)
  }

  const characters = { ...(opts.characters ?? BORDERS.SHARP) }
  if (opts.borderColor?.match(/^(\u001b\[[\d;]+m)+$/)) {
    const bc = Object.entries(characters).reduce(
      (acc, [ key, val ]) => ({
        ...acc,
        [key]: `${opts.borderColor}${val}\x1b[39m`,
      }),
      {},
    )
    Object.assign(characters, bc)
  }
  const { H, V, TL, TR, BL, BR } = characters

  const straight = H.repeat(iw + 2)
  const hl = H.repeat(Math.floor(Math.max(0, (iw - labelLen)) / 2))
  const hr = H.repeat(Math.ceil(Math.max(0, (iw - labelLen)) / 2))
  const headerLine = label
    ? `${hl} ${label.truncate(iw).toString()} ${hr}`
    : straight

  let header = straight
  let footer = straight
  if (opts.labelPosition === 'bottom') {
    footer = headerLine
  } else {
    header = headerLine
  }

  const out = [
    `${TL}${header}${TR}`,
    ...body.map((l) => {
      const line = l.truncate(iw)
      const text = line.toString()
      const sp = ' '.repeat(Math.max(0, iw - line.text.length))
      let entry = text + sp
      if (opts.hAlign === 'right') {
        entry = sp + text
      }
      return `${V} ${entry} ${V}`
    }),
    `${BL}${footer}${BR}`,
  ]
  return out.map((l) => {
    if (opts.backgroundColor) {
      return `${opts.backgroundColor}${l}\x1b[49m`
    }
    return l
  })
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
export class LogLine {
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
    return this.substring(0, len)
  }

  public substring (start: number, end?: number): LogLine {
    const idxStart = start < 0
      ? this.text.length + start
      : start
    const idxStop = end ?? this.text.length
    const text = this.text.substring(idxStart, idxStop)
    const controls = this.controls
      .map((control) => {
        const idx = Math.max(0, Math.min(idxStop, control[0] - idxStart))
        return [idx, control[1]]
      }) as ILogLineControl[]
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

/**
 * Lateral concatenation of groups of lines
 *
 * @example
 * joinLines(
 *   ['a', 'b'],
 *   ['c', 'd'],
 * )
 * // ['ac', 'bd']
 */
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
