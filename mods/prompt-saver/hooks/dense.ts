// Compressor de prompts: so mexe em prosa; codigo, URLs e caminhos ficam intactos.

export const estimate = (text: string): number => Math.ceil(text.length / 4)

const L = '(?<![\\p{L}\\p{N}])'
const R = '(?![\\p{L}\\p{N}])'
const rule = (words: string, to = ''): [RegExp, string] => [
  new RegExp(`${L}(?:${words})${R}[,;:!]?\\s*`, 'giu'),
  to,
]

const RULES: [RegExp, string][] = [
  // saudacoes e cortesias
  [new RegExp(`^\\s*(?:ol[aá]|oi|bom dia|boa tarde|boa noite|hello|hi|hey)${R}[,!.]?\\s*`, 'iu'), ''],
  rule('por favor|pf|please|kindly'),
  // molduras de pedido -> imperativo
  rule('(?:eu )?(?:gostaria|quero|preciso|queria) que (?:voc[eê]|vc)(?: me)?'),
  rule('(?:voc[eê]|vc) poderia(?: me)?|poderia(?: me)?|(?:voc[eê]|vc) consegue(?: me)?'),
  rule('(?:can|could|would|will) you(?: please)?|i(?:\'d| would) like you to|i (?:want|need) you to|help me(?: to)?'),
  // enchimento
  rule('basicamente|simplesmente|realmente|na verdade|tipo assim|meio que|basically|simply|really|actually|just|sort of|kind of'),
  // verbosidade -> curto
  rule('a fim de|com o objetivo de|com a finalidade de', 'para '),
  rule('devido ao fato de que|em virtude do fato de que', 'porque '),
  rule('no momento atual|neste momento', 'agora '),
  rule('in order to', 'to '),
  rule('due to the fact that', 'because '),
  rule('at this point in time', 'now '),
  rule('it would be great if', ''),
  // fecho
  [new RegExp(`\\s*(?:muito )?obrigad[oa]s?(?: desde j[aá])?[!.]*\\s*$`, 'iu'), ''],
  [new RegExp(`\\s*(?:thanks(?: a lot| in advance)?|thank you(?: so much)?)[!.]*\\s*$`, 'iu'), ''],
]

const KEEP = /(```[\s\S]*?```|`[^`\n]+`|https?:\/\/\S+|(?:[\w.-]+[\/\\])+[\w.-]*|"[^"\n]+")/

const tidy = (s: string): string =>
  s
    .replace(/[ \t]+/g, ' ')
    .replace(/ +([,.;:!?])/g, '$1')
    .replace(/([!?.])\1+/g, '$1')
    .replace(/^[\s,;:.]+/, '')
    .replace(/(^|[.!?]\s+|\n)([a-zà-ú])/gu, (_, a: string, b: string) => a + b.toUpperCase())

export type Dense = { text: string; before: number; after: number; saved: number }

export const densify = (input: string): Dense => {
  const parts = input.split(KEEP)
  let out = parts
    .map((p, i) => {
      if (i % 2 === 1) return p
      let s = p
      for (const [re, to] of RULES) s = s.replace(re, to)
      return s
    })
    .join('')

  out = tidy(out)
  // linhas consecutivas repetidas e linhas em branco em excesso
  const lines: string[] = []
  for (const line of out.split('\n').map(l => l.trimEnd())) {
    if (line === '' && lines[lines.length - 1] === '') continue
    if (line !== '' && lines[lines.length - 1] === line) continue
    lines.push(line)
  }
  out = lines.join('\n').trim()

  // nunca devolve algo pior ou vazio
  if (!out || out.length >= input.trim().length) out = input.trim()
  const before = estimate(input)
  const after = estimate(out)

  return { text: out, before, after, saved: Math.max(0, before - after) }
}

export const unquote = (s: string): string =>
  s.trim().replace(/^["“'‘]+/, '').replace(/["”'’]+$/, '').trim()

export const savingPct = (before: number, after: number): number =>
  before <= 0 ? 0 : Math.max(0, Math.round(((before - after) / before) * 100))

export const meter = (pct: number, width = 20): string => {
  const f = Math.round((Math.max(0, Math.min(100, pct)) / 100) * width)
  return '█'.repeat(f) + '░'.repeat(width - f)
}
