import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, RenderChildren } from 'claude-code'

import type { Diag, Family, ModelStat, Snapshot } from '../types'
import { FAMILIES, GREEN, LABEL, PROFILE, RED, TRACK, VIVID, YELLOW, advise, bar, cells, clampPct, familyOf, fmt, gradient, spark, until } from './logic'

const PANE = 'token-meter'

const empty = (): Record<Family, ModelStat> => ({
  opus: { turns: 0, input: 0, output: 0, ms: 0 },
  sonnet: { turns: 0, input: 0, output: 0, ms: 0 },
  haiku: { turns: 0, input: 0, output: 0, ms: 0 },
})

const snapshot = atom({ plugin: 'token-meter', key: 'snapshot' } as const, null)
const models = atom({ plugin: 'token-meter', key: 'models' } as const, empty())
const advice = atom({ plugin: 'token-meter', key: 'advice' } as const, null)
const history = atom({ plugin: 'token-meter', key: 'history' } as const, [])
const diag = atom({ plugin: 'token-meter', key: 'diag' } as const, { error: null, checks: 0, at: 0 } as Diag)

async function refresh($: EngineInterface) {
  const at = await $.clock.now()
  let u
  try {
    u = await $.session.usage()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await update($, diag, d => ({ error: `session.usage falhou: ${msg}`, checks: d.checks + 1, at }))

    return
  }
  await update($, diag, d => ({ error: null, checks: d.checks + 1, at }))
  const snap: Snapshot = {
    tokens: u.context.tokens ?? null,
    window: u.context.window,
    percent: u.context.percent ?? null,
    limits: u.rateLimits.map(l => ({
      kind: l.kind,
      percentUsed: l.percentUsed,
      resetsAt: l.resetsAt,
    })),
    usd: u.cost?.usd ?? null,
  }
  await update($, snapshot, () => snap)
  if (snap.percent !== null) {
    const sample = snap.percent
    await update($, history, h => (h[h.length - 1] === sample ? h : [...h, sample].slice(-48)))
  }
  const pct = snap.percent
  $.ui.status(pct === null ? undefined : `ctx ${bar(pct, 8)} ${Math.round(pct)}%`)
}

export const register: Register = on => {
  let startedAt = 0

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'tokens',
      description: 'Barras de uso de tokens, melhor modelo e desempenho',
    })
    await $.command.register({
      name: 'best-model',
      description: 'Recomenda Opus, Sonnet ou Haiku para a tarefa descrita',
    })
    await refresh($).catch(() => {})
    $.clock.every(15000, () => void refresh($).catch(() => {}))

    return next(e)
  })

  on('command.run', { command: 'tokens' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Token Meter' })
    await refresh($).catch(() => {})

    return { text: 'Token Meter aberto.' }
  })

  on('command.run', { command: 'best-model' }, async ($, e) => {
    const text = e.args.trim()
    if (!text) return { text: 'Uso: /best-model <descreva a tarefa>' }
    const a = advise(text)
    await update($, advice, () => a)

    return {
      text: `Melhor modelo: ${LABEL[a.family]} — ${a.reasons.join('; ')}`,
    }
  })

  on('prompt.submit', async ($, e, next) => {
    startedAt = await $.clock.now()
    if (!e.text.startsWith('/')) await update($, advice, () => advise(e.text))

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const u = e.usage
    const fam = u ? familyOf(u.model) : null
    if (u && fam) {
      const ms = Math.max(0, (await $.clock.now()) - startedAt)
      const input = u.input_tokens + u.cache_read_input_tokens + u.cache_creation_input_tokens
      await update($, models, m => ({
        ...m,
        [fam]: {
          turns: m[fam].turns + 1,
          input: m[fam].input + input,
          output: m[fam].output + u.output_tokens,
          ms: m[fam].ms + ms,
        },
      }))
    }
    await refresh($).catch(() => {})

    return next(e)
  })

  // Barra de carregamento acima do prompt.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const snap = await read($, snapshot)
    if (e.props.hasSurvey || !snap || snap.percent === null) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    const pct = clampPct(snap.percent)
    const left = Math.max(0, snap.window - (snap.tokens ?? 0))
    const a = await read($, advice)

    return (
      <Box>
        <Text bold color="#ffffff">⛽ </Text>
        {cells(pct, 24).map((c, i) => (
          <Text key={String(i)} color={c.color}>{c.ch}</Text>
        ))}
        <Text bold color={gradient(pct / 100)}> {Math.round(pct)}%</Text>
        <Text color="#b0bec5"> restam {fmt(left)}</Text>
        {a && <Text bold color={VIVID[a.family]}> ● {LABEL[a.family]}</Text>}
        <Text color="#78909c"> · /tokens</Text>
      </Box>
    )
  })

  // Painel gráfico.
  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const snap = await read($, snapshot)
    const stats = await read($, models)
    const a = await read($, advice)
    const hist = await read($, history)
    const dg = await read($, diag)
    const now = await $.clock.now()
    const W = Math.max(20, Math.min(56, (e.props.bodyColumns || 70) - 8))

    const Bar = (p: { pct: number; solid?: string; w?: number }) => (
      <Box>
        {cells(p.pct, p.w ?? W, p.solid).map((c, i) => (
          <Text key={String(i)} color={c.color}>{c.ch}</Text>
        ))}
      </Box>
    )
    const Big = (p: { pct: number }) => (
      <Box flexDirection="column">
        <Bar pct={p.pct} />
        <Bar pct={p.pct} />
      </Box>
    )
    const Card = (p: { title: string; color: string; children?: RenderChildren }) => (
      <Box flexDirection="column" borderStyle="round" borderColor={p.color} paddingX={1}>
        <Text bold color={p.color}>{p.title}</Text>
        {p.children}
      </Box>
    )

    const totalOut = FAMILIES.reduce((s, f) => s + stats[f].output, 0)
    const rate = (f: Family) => (stats[f].ms > 0 ? (stats[f].output / stats[f].ms) * 1000 : 0)
    const maxRate = Math.max(1, ...FAMILIES.map(rate))
    const pct = snap?.percent == null ? null : clampPct(snap.percent)
    const ROWS = 8
    const metrics: [string, string][] = [
      ['Raciocinio', 'Raciocínio'],
      ['Codigo', 'Código'],
      ['Velocidade', 'Velocid.'],
      ['Custo-beneficio', 'Custo/ben.'],
    ]

    return (
      <Box flexDirection="column">
        {(dg.error || pct === null) && (
          <Card title="🩺  DIAGNÓSTICO" color={dg.error ? '#ff1744' : '#ffea00'}>
            {dg.error && <Text bold color="#ff1744">{dg.error}</Text>}
            <Text color="#ffffff">
              Leituras de uso: {dg.checks}
              {dg.at ? ` · última há ${Math.max(0, Math.round((now - dg.at) / 1000))}s` : ' · nenhuma ainda'}
            </Text>
            <Text color="#b0bec5">
              {pct === null
                ? 'Sem dados de contexto: o motor só informa depois da 1ª resposta do modelo. Envie um prompt e abra /tokens de novo.'
                : 'Contexto lido normalmente.'}
            </Text>
            <Text color="#b0bec5">
              Limites do plano: {snap && snap.limits.length > 0 ? `${snap.limits.length} janela(s)` : 'não informados por esta conta'}
            </Text>
          </Card>
        )}
        <Card title="⛽  CONTEXTO" color="#00e5ff">
          {pct === null || !snap ? (
            <Text color="#b0bec5">Aguardando a primeira resposta…</Text>
          ) : (
            <Box flexDirection="column">
              <Text>
                <Text bold color={gradient(pct / 100)}>{Math.round(pct)}% usado</Text>
                <Text color="#b0bec5">  {fmt(snap.tokens ?? 0)} / {fmt(snap.window)}  ·  restam </Text>
                <Text bold color={GREEN}>{fmt(Math.max(0, snap.window - (snap.tokens ?? 0)))}</Text>
              </Text>
              <Big pct={pct} />
              <Text color="#78909c">0%{' '.repeat(Math.max(1, Math.floor(W / 2) - 5))}50%{' '.repeat(Math.max(1, Math.ceil(W / 2) - 6))}100%</Text>
              {hist.length > 1 && (
                <Text>
                  <Text color="#b0bec5">histórico </Text>
                  <Text bold color={gradient(pct / 100)}>{spark(hist)}</Text>
                </Text>
              )}
            </Box>
          )}
        </Card>

        <Card title="⏱  LIMITES DO PLANO" color="#ffea00">
          {(snap?.limits ?? []).length === 0 && (
            <Text color="#b0bec5">Sua conta não informa janelas de 5h/7d (não há limite diário fixo).</Text>
          )}
          {(snap?.limits ?? []).map(l => {
            const u = clampPct(l.percentUsed)
            const name = l.kind === 'five_hour' ? 'Janela de 5 horas' : l.kind === 'seven_day' ? 'Janela de 7 dias' : l.kind
            const reset = until(l.resetsAt, now)
            return (
              <Box key={l.kind} flexDirection="column">
                <Text>
                  <Text bold color="#ffffff">{name}  </Text>
                  <Text bold color={gradient(u / 100)}>{Math.round(u)}% usado</Text>
                  <Text color="#b0bec5">  ·  {Math.round(100 - u)}% resta{reset ? '  ·  ' + reset : ''}</Text>
                </Text>
                <Bar pct={u} />
              </Box>
            )
          })}
          {snap?.usd != null && <Text color="#b0bec5">💲 Custo da sessão: US$ {snap.usd.toFixed(2)}</Text>}
        </Card>

        <Card title="🎯  MELHOR MODELO PARA A TAREFA" color="#ff6d00">
          {a ? (
            <Box flexDirection="column">
              <Text color="#b0bec5">“{a.prompt}{a.prompt.length >= 60 ? '…' : ''}”</Text>
              {FAMILIES.map(f => {
                const best = f === a.family
                const fit = best ? 100 : f === 'sonnet' ? 55 : 25
                return (
                  <Box key={f}>
                    <Text bold={best} color={best ? VIVID[f] : '#78909c'}>
                      {(best ? '★ ' : '  ') + LABEL[f].padEnd(8)}
                    </Text>
                    <Bar pct={fit} solid={best ? VIVID[f] : '#607d8b'} w={Math.min(30, W)} />
                    <Text color={best ? VIVID[f] : '#78909c'}> {fit}%</Text>
                  </Box>
                )
              })}
              <Text color="#ffffff">{a.reasons.join(' · ')}</Text>
            </Box>
          ) : (
            <Text color="#b0bec5">Envie um prompt ou use /best-model &lt;tarefa&gt;.</Text>
          )}
        </Card>

        <Card title="📊  COMPARATIVO (estimativa 0-10)" color="#d500f9">
          <Box flexDirection="column">
            {Array.from({ length: ROWS }, (_, r) => {
              const level = ROWS - r
              return (
                <Box key={String(r)}>
                  {metrics.map(([key]) => (
                    <Box key={key}>
                      {FAMILIES.map(f => {
                        const ht = Math.max(1, Math.round(((PROFILE[f][key] ?? 0) / 10) * ROWS))
                        return (
                          <Text key={f} color={VIVID[f]}>
                            {ht >= level ? '███ ' : '    '}
                          </Text>
                        )
                      })}
                      <Text>{'  '}</Text>
                    </Box>
                  ))}
                </Box>
              )
            })}
            <Box>
              {metrics.map(([key]) => (
                <Box key={key}>
                  {FAMILIES.map(f => (
                    <Text key={f} bold color={VIVID[f]}>
                      {String(PROFILE[f][key] ?? 0).padEnd(4)}
                    </Text>
                  ))}
                  <Text>{'  '}</Text>
                </Box>
              ))}
            </Box>
            <Box>
              {metrics.map(([, label]) => (
                <Text key={label} color="#ffffff">{label.padEnd(14)}</Text>
              ))}
            </Box>
            <Text>
              <Text bold color={VIVID.opus}>■ Opus   </Text>
              <Text bold color={VIVID.sonnet}>■ Sonnet   </Text>
              <Text bold color={VIVID.haiku}>■ Haiku</Text>
            </Text>
          </Box>
        </Card>

        <Card title="⚡  MEDIDO NESTA SESSÃO" color="#00e676">
          {totalOut === 0 ? (
            <Text color="#b0bec5">Nenhum turno concluído ainda.</Text>
          ) : (
            FAMILIES.filter(f => stats[f].turns > 0).map(f => (
              <Box key={f} flexDirection="column">
                <Text>
                  <Text bold color={VIVID[f]}>{LABEL[f]}  </Text>
                  <Text color="#b0bec5">
                    {fmt(stats[f].output)} tok saída · {stats[f].turns} turnos · {rate(f).toFixed(1)} tok/s
                  </Text>
                </Text>
                <Bar pct={(stats[f].output / totalOut) * 100} solid={VIVID[f]} />
                <Bar pct={(rate(f) / maxRate) * 100} solid="#ffffff" />
              </Box>
            ))
          )}
          <Text color="#78909c">1ª barra: parte da saída · 2ª (branca): velocidade relativa</Text>
        </Card>
      </Box>
    )
  })
}
