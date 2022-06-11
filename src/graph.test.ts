import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { barChart } from './graph'

test('braille chart characters', () => {
  const config = {
    width: 1,
    height: 1,
    min: 0,
    max: 100,
  }
  assert.equal(barChart([25, 100], config), '⣸')
  assert.equal(barChart([100, 100], config), '⣿')
  assert.equal(barChart([100, 0], config), '⡇')
  assert.equal(barChart([0, 0], config), '⠀')
})

test.run()
