import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { joinLines, drawBox } from './box'

test('joinLines', () => {
  const joined = joinLines(['a', 'b'], ['c', 'd'])
  assert.equal(joined, ['ac', 'bd'])
})

test('joinLines: fill', () => {
  const joined = joinLines(['a', 'b'], ['1', '2', '3'])
  assert.equal(joined, ['a1', 'b2', ' 3'])
})

test('drawBox', () => {
  const box = drawBox({
    label: 'Test',
    content: ['a', 'b'],
  })
  // 4 lines, including content + borders
  assert.equal(box.length, 4)
  // 8 characters wide, including borders
  assert.equal(box[0].length, 8)
  // All lines are equal length
  assert.equal(
    Math.max(...box.map(l => l.length)),
    Math.min(...box.map(l => l.length)),
  )
})

test('drawBox: set outer width', () => {
  const box = drawBox({
    label: 'Test1',
    content: ['a', 'b'],
    width: 20,
  })
  assert.equal(box[0].length, 20)
})

test('drawBox: set outer height', () => {
  const box = drawBox({
    label: 'Test',
    content: ['a', 'b'],
    height: 10,
  })
  assert.equal(box.length, 10)
})

test('drawBox: align right', () => {
  const box = drawBox({
    label: 'Test',
    content: ['abc'],
    width: 10,
    hAlign: 'right',
  })
  assert.equal(/^.\s{4}abc\s.$/.test(box[1]), true)
})

test('drawBox: anchor bottom', () => {
  const box = drawBox({
    label: 'x',
    content: ['a', 'b', 'c', 'd', 'e'],
    height: 5,
    vAlign: 'bottom',
    vAnchor: 'bottom',
  })
  assert.equal(box[3], '│ e │')
})

test.run()
