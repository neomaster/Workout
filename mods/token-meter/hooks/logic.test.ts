import { test, expect } from 'claude-code/testing'

import { advise, bar, clampPct, familyOf, spark, until } from './logic'

test('bar fills proportionally and clamps', async () => {
  expect(bar(50, 10)).toBe('█████░░░░░')
  expect(bar(150, 4)).toBe('████')
  expect(bar(-5, 4)).toBe('░░░░')
})

test('familyOf maps model ids', async () => {
  expect(familyOf('claude-opus-5-5')).toBe('opus')
  expect(familyOf('claude-sonnet-5-5')).toBe('sonnet')
  expect(familyOf('claude-haiku-5-5')).toBe('haiku')
  expect(familyOf('gpt')).toBe(null)
})

test('advise picks a tier from simple keywords', async () => {
  expect(advise('renomeie esta variável').family).toBe('haiku')
  expect(advise('traduza e resuma o texto').family).toBe('haiku')
  expect(advise('projete a arquitetura e faça a refatoração').family).toBe('opus')
  expect(advise('find the security bug and optimize it').family).toBe('opus')
  expect(advise('adicione um endpoint com paginação').family).toBe('sonnet')
  expect(advise('refatore e formate').family).toBe('sonnet')
})

test('spark maps percentages to blocks', async () => {
  expect(spark([0, 50, 100])).toBe('▁▅█')
  expect(clampPct(NaN)).toBe(0)
})

test('until formats the reset countdown', async () => {
  const now = Date.parse('2026-01-01T00:00:00Z')
  expect(until('2026-01-01T02:13:00Z', now)).toBe('reinicia em 2h 13min')
  expect(until('2026-01-03T05:00:00Z', now)).toBe('reinicia em 2d 5h')
  expect(until(undefined, now)).toBe('')
})

import { cells, gradient } from './logic'

test('cells fill a loading bar with a gradient', async () => {
  const c = cells(50, 10)
  expect(c.filter(x => x.ch === '█').length).toBe(5)
  expect(c.length).toBe(10)
  expect(gradient(0)).toBe('#00e676')
  expect(gradient(1)).toBe('#ff1744')
})
