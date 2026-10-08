import type { Advice, Family, Snapshot } from '../types'

export const FAMILIES: Family[] = ['opus', 'sonnet', 'haiku']

export const LABEL: Record<Family, string> = {
  opus: 'Opus',
  sonnet: 'Sonnet',
  haiku: 'Haiku',
}

// Perfil qualitativo (0-10). Estimativa editorial, NAO um benchmark medido.
export const PROFILE: Record<Family, Record<string, number>> = {
  opus: { Raciocinio: 10, Codigo: 9, Velocidade: 4, 'Custo-beneficio': 2 },
  sonnet: { Raciocinio: 8, Codigo: 8, Velocidade: 7, 'Custo-beneficio': 6 },
  haiku: { Raciocinio: 6, Codigo: 6, Velocidade: 10, 'Custo-beneficio': 10 },
}

export const familyOf = (model: string): Family | null => {
  const m = model.toLowerCase()
  if (m.includes('opus')) return 'opus'
  if (m.includes('sonnet')) return 'sonnet'
  if (m.includes('haiku')) return 'haiku'
  return null
}

export const bar = (percent: number, width = 24): string => {
  const p = Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 0))
  const filled = Math.round((p / 100) * width)
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

export const levelColor = (percent: number): string =>
  percent >= 85 ? 'red' : percent >= 60 ? 'yellow' : 'green'

export const fmt = (n: number): string =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1000
      ? `${(n / 1000).toFixed(1)}k`
      : String(Math.round(n))

// Palavras-chave: edite aqui. Separe por espaço; cada uma casa com o INICIO da palavra
// (ex.: "refat" pega refatorar, refatoração). Português e inglês juntos.
export const KEYWORDS = {
  // tarefas leves e rápidas -> Haiku
  haiku: 'renom format tradu transl resum summar list typo coment simples rápid quick explic',
  // tarefas difíceis e de muito raciocínio -> Opus
  opus: 'arquitet architect refat refactor segur secur otimiz optimiz migra projet debug algorit concorr',
}

const stems = (list: string): string[] => list.split(/\s+/).filter(Boolean)

const hits = (text: string, list: string): string[] =>
  stems(list).filter(k => new RegExp(`(?<![\\p{L}\\p{N}])${k}`, 'iu').test(text))

// Regra simples: mais palavras difíceis -> Opus; mais palavras leves -> Haiku; senão Sonnet.
export const advise = (prompt: string): Advice => {
  const hard = hits(prompt, KEYWORDS.opus)
  const easy = hits(prompt, KEYWORDS.haiku)
  const long = prompt.length > 1500
  const reasons: string[] = []

  let family: Family = 'sonnet'
  if (hard.length > easy.length || (long && hard.length === easy.length)) {
    if (hard.length > 0 || long) family = 'opus'
  } else if (easy.length > hard.length) {
    family = 'haiku'
  }

  if (family === 'opus') reasons.push(hard.length ? `exige raciocínio: ${hard.slice(0, 3).join(', ')}` : 'prompt muito longo')
  if (family === 'haiku') reasons.push(`tarefa leve: ${easy.slice(0, 3).join(', ')}`)
  if (family === 'sonnet') reasons.push('tarefa de uso geral')

  return { family, reasons, prompt: prompt.slice(0, 60) }
}

export const clampPct = (n: number): number =>
  Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0))

const SPARK = '▁▂▃▄▅▆▇█'
export const spark = (values: number[]): string =>
  values
    .map(v => SPARK[Math.min(SPARK.length - 1, Math.floor((clampPct(v) / 100) * SPARK.length))])
    .join('')

export const until = (iso: string | undefined, now: number): string => {
  if (!iso) return ''
  const ms = Date.parse(iso) - now
  if (!Number.isFinite(ms)) return ''
  if (ms <= 0) return 'reinicia agora'
  const m = Math.round(ms / 60000)
  const d = Math.floor(m / 1440)
  const h = Math.floor((m % 1440) / 60)
  return d > 0 ? `reinicia em ${d}d ${h}h` : h > 0 ? `reinicia em ${h}h ${m % 60}min` : `reinicia em ${m}min`
}

export const COLOR: Record<Family, string> = {
  opus: 'magenta',
  sonnet: 'cyan',
  haiku: 'green',
}

// Cores vivas (hex).
export const VIVID: Record<Family, string> = {
  opus: '#d500f9',
  sonnet: '#00b0ff',
  haiku: '#00e676',
}
export const TRACK = '#37474f'
export const GREEN = '#00e676'
export const YELLOW = '#ffea00'
export const RED = '#ff1744'

const hex = (n: number): string => Math.round(n).toString(16).padStart(2, '0')
const mix = (a: string, b: string, t: number): string => {
  const p = (s: string, i: number) => parseInt(s.slice(1 + i * 2, 3 + i * 2), 16)
  return '#' + [0, 1, 2].map(i => hex(p(a, i) + (p(b, i) - p(a, i)) * t)).join('')
}

// verde -> amarelo -> vermelho, pos 0..1
export const gradient = (pos: number): string => {
  const t = Math.max(0, Math.min(1, pos))
  return t < 0.5 ? mix(GREEN, YELLOW, t * 2) : mix(YELLOW, RED, (t - 0.5) * 2)
}

export type Cell = { ch: string; color: string }

// Barra de carregamento: celulas preenchidas em gradiente, resto em trilho.
export const cells = (percent: number, width: number, solid?: string): Cell[] => {
  const filled = Math.round((clampPct(percent) / 100) * width)
  return Array.from({ length: width }, (_, i) =>
    i < filled
      ? { ch: '█', color: solid ?? gradient(width <= 1 ? 0 : i / (width - 1)) }
      : { ch: '▒', color: TRACK },
  )
}

// Resumo em texto de /tokens: contexto, limites e (se houver) o melhor modelo.
export const summary = (snap: Snapshot | null, advice: Advice | null, now: number): string => {
  const lines: string[] = []
  if (snap?.percent != null) {
    const left = Math.max(0, snap.window - (snap.tokens ?? 0))
    lines.push(`Contexto   ${bar(snap.percent, 20)} ${Math.round(snap.percent)}% · restam ${fmt(left)} de ${fmt(snap.window)}`)
  } else {
    lines.push('Contexto   aguardando a 1ª resposta do modelo')
  }
  for (const l of snap?.limits ?? []) {
    const name = l.kind === 'five_hour' ? 'Limite 5h ' : l.kind === 'seven_day' ? 'Limite 7d ' : l.kind
    const reset = until(l.resetsAt, now)
    lines.push(`${name} ${bar(l.percentUsed, 20)} ${Math.round(l.percentUsed)}%${reset ? ' · ' + reset : ''}`)
  }
  if (snap && snap.limits.length === 0) lines.push('Limites    não informados por esta conta')
  if (snap?.usd != null) lines.push(`Custo      US$ ${snap.usd.toFixed(2)}`)
  if (advice) lines.push(`Modelo     ${LABEL[advice.family]} — ${advice.reasons.join('; ')}`)

  return lines.join('\n')
}
