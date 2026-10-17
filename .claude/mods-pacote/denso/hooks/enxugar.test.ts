import { expect, test } from 'claude-code/testing'

import { enxugar, medir, nivel, tokens } from './enxugar'

test('corta preenchimento e mantém o pedido', () => {
  const curta = enxugar('Por favor, você poderia me ajudar a corrigir o bug no login, com o objetivo de liberar a versão?')
  expect(curta).toBe('Corrigir o bug no login, para liberar a versão?')
})

test('a versão curta gasta menos tokens', () => {
  const longo = 'Eu gostaria que você, se possível, basicamente explicasse a fim de entender devido ao fato de que preciso aprender'
  expect(tokens(enxugar(longo)) < tokens(longo)).toBe(true)
})

test('texto já denso não tem economia', () => {
  const m = medir('Corrija o bug do login em auth.ts')
  expect(m.economia).toBe(0)
  expect(nivel(m.gordura)).toBe('denso')
})

test('texto cheio de gordura é verboso', () => {
  const m = medir('Por favor, por favor, eu gostaria que você realmente, basicamente, poderia me ajudar a fazer isso, obrigado')
  expect(nivel(m.gordura)).toBe('verboso')
})

test('junta palavras repetidas em seguida', () => {
  expect(enxugar('faça o o ajuste agora')).toBe('Faça o ajuste agora')
})
