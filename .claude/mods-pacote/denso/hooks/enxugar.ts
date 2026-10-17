import type { Medida } from '../types'

// Trocas de construções longas por curtas. Ordem importa: as mais específicas primeiro.
const TROCAS: [RegExp, string][] = [
  [/\b(por favor|pf|obrigado|obrigada|valeu)[,.!]?\s*/gi, ''],
  [/\b(please|kindly|thanks|thank you)[,.!]?\s*/gi, ''],
  [/\b(eu )?(gostaria|queria|quero|preciso) que (você|voce|vc) /gi, ''],
  [/\b(você|voce|vc) (poderia|pode|consegue)( me)?( ajudar a)? /gi, ''],
  [/\b(poderia|pode|consegue)( você| voce| vc)?( me)?( ajudar a)? /gi, ''],
  [/\b(i would like you to|i want you to|could you|can you|would you)\s+/gi, ''],
  [/\bgostaria de saber\b/gi, 'diga'],
  [/\bme (explique|diga|fale) (sobre|a respeito de)\b/gi, 'explique'],
  [/\bcom o objetivo de\b|\ba fim de\b|\bno sentido de\b/gi, 'para'],
  [/\bin order to\b/gi, 'to'],
  [/\bdevido ao fato de que\b|\bpelo fato de que\b|\btendo em vista que\b/gi, 'porque'],
  [/\bdue to the fact that\b/gi, 'because'],
  [/\bapesar do fato de que\b/gi, 'embora'],
  [/\bem virtude d[eoa]s?\b/gi, 'por'],
  [/\b(neste momento|no momento atual|atualmente)\b/gi, 'agora'],
  [/\bna maioria das vezes\b/gi, 'em geral'],
  [/\b(é|e) importante (notar|ressaltar|destacar|lembrar) que\s*/gi, ''],
  [/\bvale (a pena )?(ressaltar|destacar|lembrar) que\s*/gi, ''],
  [/\b(basicamente|na verdade|de certa forma|de modo geral|se possível|se possivel|literalmente|simplesmente|realmente|obviamente)[,]?\s*/gi, ''],
  [/\b(basically|actually|really|simply|just|literally)\s+/gi, ''],
  [/\b(uma série de|um grande número de)\b/gi, 'vários'],
]

export const tokens = (texto: string) => Math.ceil(texto.length / 3.8)

/** Versão mais curta do texto: corta preenchimento e repetição, mantém o sentido. */
export function enxugar(texto: string) {
  let t = texto
  for (const [re, por] of TROCAS) t = t.replace(re, por)
  t = t.replace(/\b(\p{L}+)(\s+\1\b)+/giu, '$1') // palavra repetida em seguida
  t = t.replace(/[ \t]+/g, ' ').replace(/ ([,.;:!?])/g, '$1').replace(/\n{3,}/g, '\n\n').trim()
  return t.length > 0 ? t.charAt(0).toUpperCase() + t.slice(1) : t
}

export function medir(texto: string): Medida {
  const antes = tokens(texto)
  const depois = tokens(enxugar(texto))
  const economia = antes === 0 ? 0 : Math.round(((antes - depois) / antes) * 100)
  return { tokens: antes, economia, gordura: Math.min(100, economia * 3) }
}

export const nivel = (g: number) => (g >= 45 ? 'verboso' : g >= 20 ? 'moderado' : 'denso')
export const cor = (g: number) => (g >= 45 ? 'red' : g >= 20 ? 'yellow' : 'green')
