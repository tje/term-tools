Poorly documented miscellaneous terminal utilities that I use sometimes.

![COOL GIF](./demo.gif)

## Usage

### Progress bars

`progressBar(width, percent[, characters])`
- `width` Character length of bar
- `percent` Progress, number between `0` and `1`
- `characters` *(optional)* Character set to use, at least 3 characters

```js
// Default progress bar, 10 chars wide @ 50%
const bar1 = tt.progressBar(10, 0.5)
console.log(bar1)

// Different character set
const bar2 = tt.progressBar(10, 0.5, tt.PROGRESS_BAR.PIPS)
console.log(bar2)
```

### Animated progress bars

`createAnimatedBar(config)`
- `config` Progress bar settings:
  - `config.width` Character length of bar
  - `config.duration` *(optional)* Animation duration in milliseconds
  - `config.characters` *(optional)* Character set to use, at least 3 characters
  - `config.ease` *(optional)* Easing function to use (default linear)

```js
const bar = tt.createAnimatedBar({
  width: 10,
  characters: tt.PROGRESS_BAR.FINE,
  ease: tt.EASING.CUBIC_OUT,
  duration: 500,
})
bar.update(0.25)
console.log(bar.toString())
```

### Spinners

`spinner([characters[, speed]])`
- `characters` *(optional)* Character set to use
- `speed` *(optional)* Time in milliseconds between steps

```js
// Default spinner - automatically steps based on internal clock
const spinner1 = tt.spinner()
console.log(spinner.value)

// Alternative character set and speed (100ms)
const spinner2 = tt.spinner(tt.PROGRESS_SPIN.BRAILLE_LINEAR, 100)
console.log(spinner2.value)
```

### Bar charts

`barChart(series, config)`
- `series` Array of numeric values
- `config` Bar chart settings:
  - `config.width` Chart width (characters)
  - `config.height` Chart height (in lines)
  - `config.min` *(optional)* Minimum value to clamp points to
  - `config.max` *(optional)* Maximum value to clamp points to
  - `config.characters` *(optional)* Character set to use


```js
const series = [10, 55, 21, 8, 76]

// One-line graph, 10 characters wide
const graph1 = tt.barChart(series, { width: 10, height: 1 })
console.log(graph1[0])

// Custom characters, min/max values
const graph2 = tt.barChart(series, {
  width: 10,
  height: 5,
  min: 0,
  max: 100,
  characters: tt.GRAPH.BRAILLE,
})
console.log(graph2.join('\n'))
```

### Log boxes

`createLogBox([config])`
- `config` Log box options, all optional:
  - `config.height` Maximum number of lines
  - `config.fadeDuration` Animation duration in milliseconds
  - `config.fadeDelay` Delay before animation starts (milliseconds)
  - `config.fadeMode` If set to `"succession"`, messages only begin animating when they're succeeded by another
  - `config.fill` If true, content is initialized with empty lines based on `height`
  - `config.ease` Custom easing function to use

```js
// Create a log box with default options
const logBox = tt.createLogBox()
logBox.log('First message!')

// Add another message every second
setInterval(() => logBox.log('Message'), 1000)

// Redraw the log box every 20ms
setInterval(() => {
  console.clear()
  console.log(logBox.render().join('\n'))
}, 20)
```

### Bordered boxes

`drawBox(config)`
- `config` Box settings:
  - `config.content` Array of strings making up the body of the box
  - `config.label` *(optional)* Box title, fit into the border
  - `config.labelPosition` *(optional)* Label position (`"top" | "bottom"`)
  - `config.width` *(optional)* Fixed outer width of the box in characters
  - `config.height` *(optional)* Fixed outer height of the box in lines
  - `config.vAlign` *(optional)* Vertical alignment of content (`"top" | "bottom"`)
  - `config.hAlign` *(optional)* Horizontal alignment of content (`"left" | "right"`)
  - `config.characters` *(optional)* Custom character set to use for borders

```js
// Draw a single box
const box = tt.drawBox({
  label: 'One',
  width: 20,
  height: 5,
  content: [
    'First line',
    'Second line',
  ],
})
console.log(box.join('\n'))

// Draw two boxes side-by-side
const box2 = tt.drawBox({
  label: 'Two',
  width: 20,
  height: 5,
  content: [
    'Another box!',
  ],
})
console.log(tt.joinLines(box, box2).join('\n'))
```
