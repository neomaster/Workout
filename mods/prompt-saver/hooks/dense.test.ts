import { test, expect } from 'claude-code/testing'

import { densify, estimate, savingPct, unquote } from './dense'

test('removes politeness and request frames, keeps the ask', async () => {
  const d = densify('Olá! Por favor, eu gostaria que você criasse um endpoint de login. Muito obrigado!')
  expect(d.text).toBe('Criasse um endpoint de login.')
  expect(d.after).toBeLessThan(d.before)
})

test('english frames and closings', async () => {
  const d = densify('Hi, could you please basically refactor this function in order to simplify it? Thanks a lot!')
  expect(d.text).toBe('Refactor this function to simplify it?')
})

test('leaves code, paths, urls and quotes untouched', async () => {
  const src = 'Por favor, corrija `just_do_it()` em src/app/main.ts e veja https://x.dev/really e "basically ok"'
  const d = densify(src)
  expect(d.text).toContain('`just_do_it()`')
  expect(d.text).toContain('src/app/main.ts')
  expect(d.text).toContain('https://x.dev/really')
  expect(d.text).toContain('"basically ok"')
  expect(d.text.toLowerCase()).not.toContain('por favor')
})

test('collapses duplicate lines and never grows the prompt', async () => {
  expect(densify('Rode os testes.\nRode os testes.\n\n\n\nFim.').text).toBe('Rode os testes.\n\nFim.')
  const tight = 'Rode os testes'
  expect(densify(tight).text).toBe(tight)
})

test('helpers', async () => {
  expect(unquote('“oi”')).toBe('oi')
  expect(estimate('abcdefgh')).toBe(2)
  expect(savingPct(100, 60)).toBe(40)
})
