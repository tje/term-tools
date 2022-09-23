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
