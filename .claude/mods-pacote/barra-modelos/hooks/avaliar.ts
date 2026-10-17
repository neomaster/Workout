import type { Fase } from '../types'

export type Modelo = { id: string; nome: string; capacidade: number; custo: number }

// Capacidade: até que exigência o modelo resolve bem. Custo: peso relativo.
export const MODELOS: Modelo[] = [
  { id: 'haiku', nome: 'Haiku', capacidade: 35, custo: 1 },
  { id: 'sonnet', nome: 'Sonnet', capacidade: 65, custo: 3 },
  { id: 'opus', nome: 'Opus', capacidade: 85, custo: 5 },
  { id: 'fable', nome: 'Fable', capacidade: 100, custo: 8 },
]

const TIPOS: { tarefa: string; peso: number; re: RegExp }[] = [
  { tarefa: 'Arquitetura / design', peso: 80, re: /arquitet|redesenh|migra[çc][ãa]o|refator.*(grande|todo)|design de sistema|trade-?off/i },
  { tarefa: 'Depuração difícil', peso: 75, re: /race condition|deadlock|vazamento|memory leak|intermitente|n[ãa]o reproduz/i },
  { tarefa: 'Segurança / revisão', peso: 70, re: /seguran[çc]a|vulnerab|auditoria|code review|revis[ãa]o de c[óo]digo/i },
  { tarefa: 'Implementar funcionalidade', peso: 55, re: /implement|crie|criar|adicion|desenvolv|construa|mod\b|feature/i },
  { tarefa: 'Correção de bug', peso: 50, re: /bug|erro|corrig|conserte|falha|quebr/i },
  { tarefa: 'Testes', peso: 45, re: /teste|test\b|cobertura/i },
  { tarefa: 'Pesquisa / explicação', peso: 35, re: /explique|como funciona|o que [ée]|pesquis|por que/i },
  { tarefa: 'Edição simples', peso: 15, re: /renome|renomeie|typo|formate|traduz|ajuste (o )?texto|comente|commit/i },
]

export type Sinais = { prompt: string; ferramentas?: number; arquivos?: number; agentes?: number }

export function avaliar({ prompt, ferramentas = 0, arquivos = 0, agentes = 0 }: Sinais) {
  const achado = TIPOS.filter(t => t.re.test(prompt)).sort((a, b) => b.peso - a.peso)[0]
  let exigencia = achado?.peso ?? 40
  exigencia += Math.min(15, Math.floor(prompt.length / 150)) // pedidos longos tendem a ser complexos
  exigencia += Math.min(15, arquivos * 3) // muitos arquivos tocados
  exigencia += Math.min(10, Math.floor(ferramentas / 5))
  exigencia += Math.min(10, agentes * 5)
  return { tarefa: achado?.tarefa ?? 'Tarefa geral', exigencia: Math.max(0, Math.min(100, exigencia)) }
}

/** 0 a 100: sofrer por falta de capacidade pesa mais do que gastar a mais. */
export function adequacao(m: Modelo, exigencia: number) {
  const falta = Math.max(0, exigencia - m.capacidade)
  const sobra = Math.max(0, m.capacidade - exigencia)
  return Math.max(0, Math.round(100 - falta * 2.2 - sobra * 0.5 - m.custo * 1.5))
}

export function ranking(exigencia: number) {
  return MODELOS.map(m => ({ ...m, nota: adequacao(m, exigencia) })).sort((a, b) => b.nota - a.nota)
}

export function modeloDe(idApi?: string) {
  const id = (idApi ?? '').toLowerCase()
  return MODELOS.find(m => id.includes(m.id))?.id
}

export const rotuloFase = (f: Fase) => (f === 'feita' ? 'tarefa feita' : 'tarefa iniciada')
