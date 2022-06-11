import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { progressBar, spinner } from './progress_bar'
import { PROGRESS_BAR, PROGRESS_SPIN } from './characters'


test('full bar', () => {
  const bar = progressBar(10, 1)
  const char = PROGRESS_BAR.SHADED[0]
  assert.equal(bar, char.repeat(10))
})

test('empty bar', () => {
  const bar = progressBar(10, 0)
  assert.equal(bar, ' '.repeat(10))
})

test('shaded', () => {
  const chars = PROGRESS_BAR.SHADED
  for (let i = 0; i < chars.length; i++) {
    const p = i / (chars.length - 1)
    const bar = progressBar(1, p, chars)
    const char = chars[chars.length - 1 - i]
    assert.equal(bar, char)
  }
})

test('fine', () => {
  const chars = PROGRESS_BAR.FINE
  for (let i = 0; i < chars.length; i++) {
    const p = i / (chars.length - 1)
    const bar = progressBar(1, p, chars)
    const char = chars[chars.length - 1 - i]
    assert.equal(bar, char)
  }
})

test.run()
