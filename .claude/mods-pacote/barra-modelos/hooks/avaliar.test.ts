import { expect, test } from 'claude-code/testing'

import { adequacao, avaliar, MODELOS, modeloDe, ranking } from './avaliar'

test('tarefa simples favorece o modelo pequeno', () => {
  const { exigencia } = avaliar({ prompt: 'renomeie a variável x' })
  expect(ranking(exigencia)[0]!.id).toBe('haiku')
})

test('arquitetura favorece um modelo grande', () => {
  const { tarefa, exigencia } = avaliar({ prompt: 'redesenhe a arquitetura do sistema' })
  expect(tarefa).toBe('Arquitetura / design')
  expect(['opus', 'fable'].includes(ranking(exigencia)[0]!.id)).toBe(true)
})

test('arquivos e agentes elevam a exigência depois da tarefa feita', () => {
  const antes = avaliar({ prompt: 'corrija o bug' }).exigencia
  const depois = avaliar({ prompt: 'corrija o bug', arquivos: 5, agentes: 2, ferramentas: 20 }).exigencia
  expect(depois > antes).toBe(true)
})

test('nota fica entre 0 e 100', () => {
  for (const m of MODELOS)
    for (const x of [0, 50, 100]) {
      const n = adequacao(m, x)
      expect(n >= 0 && n <= 100).toBe(true)
    }
})

test('reconhece o modelo pelo id da API', () => {
  expect(modeloDe('claude-sonnet-5-5')).toBe('sonnet')
  expect(modeloDe(undefined)).toBe(undefined)
})
