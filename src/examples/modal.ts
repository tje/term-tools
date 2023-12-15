import { drawBox } from '../box'
import { BORDERS } from '../characters'

const lorem = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat sed lectus vestibulum mattis ullamcorper velit. Pellentesque elit eget gravida cum sociis natoque penatibus. Ultrices in iaculis nunc sed. Lacinia at quis risus sed vulputate odio. Tortor aliquam nulla facilisi cras fermentum odio. Augue ut lectus arcu bibendum. Nunc sed blandit libero volutpat sed. Eget est lorem ipsum dolor sit. Scelerisque eu ultrices vitae auctor eu augue. Elit eget gravida cum sociis natoque penatibus. Magna fringilla urna porttitor rhoncus dolor. Feugiat nibh sed pulvinar proin gravida hendrerit lectus. Ullamcorper dignissim cras tincidunt lobortis. Porta nibh venenatis cras sed felis eget velit aliquet. Euismod quis viverra nibh cras. Non curabitur gravida arcu ac tortor dignissim convallis aenean. Senectus et netus et malesuada. Odio facilisis mauris sit amet massa vitae.',
  'Auctor augue mauris augue neque. Mollis aliquam ut porttitor leo a. Rhoncus dolor purus non enim. Proin sed libero enim sed faucibus turpis in eu. Enim nunc faucibus a pellentesque sit amet porttitor. Viverra nibh cras pulvinar mattis nunc. Vel elit scelerisque mauris pellentesque pulvinar pellentesque habitant. At consectetur lorem donec massa sapien. Vulputate dignissim suspendisse in est ante. Mi proin sed libero enim sed faucibus turpis in eu. Quis auctor elit sed vulputate mi sit. Non enim praesent elementum facilisis. Faucibus pulvinar elementum integer enim neque. At quis risus sed vulputate odio. Tincidunt tortor aliquam nulla facilisi. Eget magna fermentum iaculis eu non. Faucibus interdum posuere lorem ipsum dolor sit amet. Adipiscing bibendum est ultricies integer quis auctor elit sed. Augue lacus viverra vitae congue eu consequat ac felis donec. Ante metus dictum at tempor commodo.',
  'Quis auctor elit sed vulputate. Dignissim convallis aenean et tortor at risus. Eget felis eget nunc lobortis mattis aliquam faucibus. Luctus venenatis lectus magna fringilla urna porttitor. Cursus eget nunc scelerisque viverra. Tincidunt id aliquet risus feugiat. Ut etiam sit amet nisl. Sagittis aliquam malesuada bibendum arcu vitae elementum curabitur vitae nunc. Donec ac odio tempor orci dapibus ultrices in iaculis. Eget est lorem ipsum dolor sit amet consectetur. Varius duis at consectetur lorem donec massa. Lobortis elementum nibh tellus molestie nunc. Et pharetra pharetra massa massa ultricies mi quis hendrerit dolor.',
  'Urna neque viverra justo nec ultrices dui sapien. Porttitor lacus luctus accumsan tortor posuere ac. Pretium fusce id velit ut tortor pretium. Egestas congue quisque egestas diam in arcu. Velit dignissim sodales ut eu sem integer vitae justo. In hac habitasse platea dictumst quisque sagittis purus sit amet. Gravida dictum fusce ut placerat orci nulla pellentesque dignissim enim. Lacus sed turpis tincidunt id aliquet risus feugiat. Porta lorem mollis aliquam ut porttitor leo a diam sollicitudin. Egestas egestas fringilla phasellus faucibus. Eget mauris pharetra et ultrices neque. Id faucibus nisl tincidunt eget nullam non. Pellentesque habitant morbi tristique senectus et netus et malesuada. Volutpat sed cras ornare arcu dui vivamus. Vitae auctor eu augue ut lectus arcu. Turpis in eu mi bibendum neque egestas congue quisque. Curabitur vitae nunc sed velit dignissim sodales. Hendrerit dolor magna eget est. Blandit cursus risus at ultrices mi tempus imperdiet.',
  'Sit amet mauris commodo quis imperdiet massa tincidunt nunc pulvinar. Maecenas pharetra convallis posuere morbi leo urna. Sit amet massa vitae tortor condimentum lacinia quis. Mauris augue neque gravida in fermentum et sollicitudin ac orci. Ac turpis egestas integer eget aliquet. Ridiculus mus mauris vitae ultricies leo integer malesuada nunc. Quam vulputate dignissim suspendisse in est ante in. Nisi quis eleifend quam adipiscing. Cras ornare arcu dui vivamus arcu. Sed cras ornare arcu dui vivamus arcu felis bibendum. Ullamcorper a lacus vestibulum sed arcu non. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas. Interdum consectetur libero id faucibus nisl. Suspendisse faucibus interdum posuere lorem ipsum dolor sit amet consectetur. Lacus luctus accumsan tortor posuere ac. Amet cursus sit amet dictum sit amet justo. Donec pretium vulputate sapien nec sagittis aliquam malesuada.',
]

const BOX_WIDTH = 30
const BOX_HEIGHT = 10
const TRANSLUCENT = true

const { stdin, stdout } = process
stdin.setRawMode(true)
// Enable mouse events
stdout.write('\x1b[?1000h\x1b[?1006h\x1b[?1002h')
stdout.clearScreenDown()
process.on('exit', () => {
  // Disable mouse events
  stdout.write('\x1b[?1002l\x1b[?1006l\x1b[?1000l')
})
process.on('SIGINT', () => {
  console.log('sigint')
  process.exit(1)
})

let boxX = Math.floor(stdout.columns / 2 - (BOX_WIDTH / 2))
let boxY = Math.floor(stdout.rows / 2 - (BOX_HEIGHT / 2))
let offX = 0
let offY = 0
let isDragging = false

// Listen for mouse movements from stdin, tracking if/where the modal is being
// dragged
stdin.on('data', (buf) => {
  const msg = buf.toString('utf8')
  const [ seq, _meta, col, row, bit ] = msg.match(/\x1b\[<(\d+);(\d+);(\d+)([Mm])/) || []
  if (seq) {
    const mx = parseInt(col, 10)
    const my = parseInt(row, 10) - 1
    const isDown = bit === 'M'
    if (!isDown) {
      isDragging = false
      return
    }
    if (!isDragging && mx >= boxX && mx <= boxX + BOX_WIDTH && my >= boxY && my < boxY + BOX_HEIGHT) {
      offX = mx - boxX
      offY = my - boxY
      isDragging = true
    }
    if (!isDragging) {
      return
    }
    boxX = Math.max(1, Math.min(stdout.columns - BOX_WIDTH + 1, mx - offX))
    boxY = Math.max(1, Math.min(stdout.rows - BOX_HEIGHT - 1, my - offY))
  } else if (['q', '\x03', '\x04'].includes(msg)) {
    process.exit(0)
  }
})

const bgBox = drawBox({
  width: stdout.columns,
  height: stdout.rows - 1,
  content: [
    ...lorem,
    ...lorem,
    ...lorem,
    ...lorem,
  ],
})

const generateContent = () => {
  const content = bgBox.slice()

  const boxCfg: Parameters<typeof drawBox>[0] = {
    width: BOX_WIDTH,
    height: BOX_HEIGHT,
    label: 'Modal',
    borderColor: '\x1b[90m',
    backgroundColor: '\x1b[48;5;236m',
    characters: BORDERS.SHARP,
    content: [
      'This is a floating box',
      '',
      'Drag it around',
      '',
      'Press `q` to quit',
    ],
  }
  // Redraw the background characters inside the empty space of the modal with a
  // much dimmer foreground color to appear translucent
  if (TRANSLUCENT) {
    while (boxCfg.content.length < BOX_HEIGHT - 2) {
      boxCfg.content.push('')
    }
    Object.assign(boxCfg, {
      content: boxCfg.content.map((l, i) => {
        if (l.length < BOX_WIDTH - 4) {
          const other = content[boxY + i + 1].slice(boxX + 1 + l.length, boxX + 1 + BOX_WIDTH)
          return `${l}\x1b[38;5;${isDragging ? '235' : '237'}m${other}`
        }
        return l
      }),
    })
  }
  if (isDragging) {
    Object.assign(boxCfg, {
      borderColor: '\x1b[31m',
      label: `\x1b[91m${boxCfg.label}\x1b[39m`,
      backgroundColor: '\x1b[48;5;234m',
    })
  }
  const box = drawBox(boxCfg)

  let y = boxY
  box.forEach((ln) => {
    const left = content[y].substring(0, boxX -1)

    let right = content[y].substring(boxX + BOX_WIDTH - 1)
    if (y > boxY) {
      // Cast shadow to the right by redrawing the next two characters in a
      // dimmer color
      right = `\x1b[90;40m${right.substring(0, 2)}\x1b[0m${right.substring(2)}`
    }
    content[y] = left + ln + right
    y += 1
  })
  if (content[y]) {
    // Cast shadow underneath
    content[y] = content[y].substring(0, boxX + 1)
      + '\x1b[90;40m' + content[y].substring(boxX + 1, boxX + BOX_WIDTH + 1) + '\x1b[0m'
      + content[y].substring(boxX + BOX_WIDTH + 1)
  }

  return content
}

// Regenerate all of the content on an interval, comparing the new frame with
// the previous and only repainting changes
let _last: string[] = []
setInterval(() => {
  const next = generateContent()
  if (_last.length === 0) {
    console.clear()
    console.log(next.join('\n'))
    _last = next
    return
  }

  let _c = 0
  let o = ''
  for (let i = 0; i < next.length; i++) {
    if (next[i] !== _last[i]) {
      if (_c === 0) {
        _c = i
        const s = `\x1b[${next.length - i}A\r${next[i]}`
        o += s
      } else {
        const s = `\x1b[${i - _c}B\r${next[i]}`
        o += s
        _c = i
      }
    }
  }
  if (_c > 0) {
    const s = `\x1b[${next.length - _c}B\r`
    o += s
    stdout.write(o)
  }
  _last = next
}, 10)
