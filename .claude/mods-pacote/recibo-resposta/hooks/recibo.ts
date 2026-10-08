import type { Recibo, ReciboComDuracao, Turno } from '../types'

/** Quantas vezes o mesmo arquivo editado (ou o mesmo comando falhando) conta como andar em círculos. */
export const LIMITE_CIRCULOS = 3

/** Até quanto a duração do turno pode diferir da linha "trabalhou por" para casar com ela. */
const TOLERANCIA_MS = 2000

export const AVISO = '↻ Parece que o Claude está andando em círculos'

export function turnoVazio(): Turno {
  return { criados: [], editados: [], edicoes: {}, comandos: 0, falhas: 0, outras: 0, falhasSeguidas: {}, avisado: false }
}

/** Caminho comparável: barras normais e minúsculas (o Windows não diferencia). */
export function normalizar(caminho: string): string {
  return caminho.split('\\').join('/').toLowerCase()
}

function nomeCurto(caminho: string): string {
  const partes = caminho.split('\\').join('/').split('/')
  return partes[partes.length - 1] || caminho
}

/** Um uso de ferramenta já resolvido, no formato que o recibo entende. */
export type Uso =
  | { tipo: 'arquivo'; caminho: string; criou: boolean; ok: boolean }
  | { tipo: 'comando'; comando: string; ok: boolean }
  | { tipo: 'outra' }

/**
 * Soma um uso ao turno. Devolve o turno novo e, quando o uso fez o turno
 * cruzar o limite de voltas em círculo pela primeira vez, o motivo do aviso.
 */
export function registrar(turno: Turno, uso: Uso): { turno: Turno; aviso?: string } {
  const t: Turno = {
    ...turno,
    criados: [...turno.criados],
    editados: [...turno.editados],
    edicoes: { ...turno.edicoes },
    falhasSeguidas: { ...turno.falhasSeguidas },
  }
  let motivo: string | undefined

  if (uso.tipo === 'arquivo') {
    const chave = normalizar(uso.caminho)
    if (uso.ok) {
      if (uso.criou) {
        if (!t.criados.includes(chave)) t.criados.push(chave)
        t.editados = t.editados.filter(c => c !== chave)
      } else if (!t.criados.includes(chave) && !t.editados.includes(chave)) {
        t.editados.push(chave)
      }
    }
    if (!uso.criou) {
      const vezes = (t.edicoes[chave] ?? 0) + 1
      t.edicoes[chave] = vezes
      if (vezes >= LIMITE_CIRCULOS) motivo = `${nomeCurto(uso.caminho)} editado ${vezes}x`
    }
  } else if (uso.tipo === 'comando') {
    t.comandos += 1
    const chave = uso.comando.trim()
    if (uso.ok) {
      delete t.falhasSeguidas[chave]
    } else {
      t.falhas += 1
      const vezes = (t.falhasSeguidas[chave] ?? 0) + 1
      t.falhasSeguidas[chave] = vezes
      if (vezes >= LIMITE_CIRCULOS) motivo = `o mesmo comando falhou ${vezes}x seguidas`
    }
  } else {
    t.outras += 1
  }

  if (motivo !== undefined && !t.avisado) {
    t.avisado = true
    return { turno: t, aviso: `${AVISO} · ${motivo}` }
  }
  return { turno: t }
}

export function resumir(turno: Turno): Recibo {
  return {
    criados: turno.criados.length,
    editados: turno.editados.length,
    comandos: turno.comandos,
    falhas: turno.falhas,
    outras: turno.outras,
  }
}

export function temAlgo(r: Recibo): boolean {
  return r.criados + r.editados + r.comandos + r.outras > 0
}

/** O recibo guardado cuja duração mais se aproxima da linha desenhada. */
export function maisProximo(lista: readonly ReciboComDuracao[], durationMs: number): Recibo | undefined {
  let melhor: ReciboComDuracao | undefined
  for (const r of lista) {
    const d = Math.abs(r.durationMs - durationMs)
    if (d <= TOLERANCIA_MS && (melhor === undefined || d < Math.abs(melhor.durationMs - durationMs))) melhor = r
  }
  return melhor
}

/** 48s, 1m 4s, 1h 2m */
export function duracao(ms: number): string {
  const total = Math.max(1, Math.round(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

/** Um pedaço do recibo: a contagem em destaque, o texto e a cor da contagem. */
export type Parte = { numero: number; texto: string; cor?: string; falhas?: number }

const plural = (n: number, um: string, varios: string) => (n === 1 ? um : varios)

export function partes(r: Recibo): Parte[] {
  const lista: Parte[] = []
  if (r.criados > 0) {
    lista.push({ numero: r.criados, texto: plural(r.criados, 'arquivo criado', 'arquivos criados'), cor: 'green' })
  }
  if (r.editados > 0) {
    const texto = r.criados > 0
      ? plural(r.editados, 'editado', 'editados')
      : plural(r.editados, 'arquivo editado', 'arquivos editados')
    lista.push({ numero: r.editados, texto, cor: 'yellow' })
  }
  if (r.comandos > 0) {
    lista.push({ numero: r.comandos, texto: plural(r.comandos, 'comando', 'comandos'), cor: 'cyan', falhas: r.falhas })
  }
  if (lista.length === 0 && r.outras > 0) {
    lista.push({ numero: r.outras, texto: plural(r.outras, 'ferramenta usada', 'ferramentas usadas'), cor: 'cyan' })
  }
  return lista
}

export function textoFalhas(n: number): string {
  return `(${n} ${plural(n, 'falhou', 'falharam')})`
}

/** O recibo inteiro numa linha, como aparece na tela. */
export function linha(r: Recibo, durationMs: number): string {
  const pedacos = partes(r).map(p => `${p.numero} ${p.texto}${p.falhas ? ` ${textoFalhas(p.falhas)}` : ''}`)
  return `🧾 ${[...pedacos, duracao(durationMs)].join(' · ')}`
}

/** Um trecho de texto do recibo já estilizado, para qualquer superfície desenhar como Text. */
export type Trecho = { key: string; texto: string; bold?: boolean; color?: string; dimColor?: boolean }

/** O recibo como trechos: contagens em negrito e cor, falhas em vermelho, separadores e duração apagados. */
export function trechos(r: Recibo, durationMs: number): Trecho[] {
  const sep = (k: string): Trecho => ({ key: k, texto: ' · ', dimColor: true })
  const lista: Trecho[] = []
  partes(r).forEach((p, i) => {
    if (i > 0) lista.push(sep(`s${i}`))
    lista.push({ key: `n${i}`, texto: String(p.numero), bold: true, color: p.cor })
    lista.push({ key: `t${i}`, texto: ` ${p.texto}` })
    if (p.falhas) lista.push({ key: `f${i}`, texto: ` ${textoFalhas(p.falhas)}`, color: 'red' })
  })
  lista.push(sep('sd'))
  lista.push({ key: 'd', texto: duracao(durationMs), dimColor: true })
  return lista
}
