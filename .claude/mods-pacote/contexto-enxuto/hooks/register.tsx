import { atom, read, update } from 'claude-code'
import type { Register, SessionContextUsage, SessionCost } from 'claude-code'

import type { Economia, Medida } from '../types'

const medida = atom({ plugin: 'contexto-enxuto', key: 'medida' } as const, null)
const economia = atom({ plugin: 'contexto-enxuto', key: 'economia' } as const, null)

const CELULAS = 12

function paraMedida(context: SessionContextUsage, cost?: SessionCost): Medida {
  return { tokens: context.tokens, janela: context.window, percent: context.percent, usd: cost?.usd }
}

function cor(percent: number) {
  if (percent >= 80) return 'red'
  if (percent >= 50) return 'yellow'
  return 'green'
}

function mil(n: number) {
  return n >= 1000 ? `${Math.round(n / 1000)} mil` : String(n)
}

function dolar(usd: number) {
  return `US$ ${usd.toFixed(usd < 1 ? 3 : 2).replace('.', ',')}`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    await $.command.register({
      name: 'enxugar',
      description: 'Reduz o contexto da conversa (opcional: o que deve ser mantido)',
    })
    const { context, cost } = await $.session.usage()
    await update($, medida, () => paraMedida(context, cost))
    return result
  })

  on('session.measure', async ($, e, next) => {
    await update($, medida, () => paraMedida(e.context, e.cost))
    return next(e)
  })

  on('command.run', { command: 'enxugar' }, async ($, e) => {
    const antes = (await $.session.usage()).context.tokens ?? 0
    const instrucoes = e.args.trim() || undefined
    let resultado
    try {
      resultado = await $.session.compact({ instructions: instrucoes })
    } catch {
      return { text: 'Contexto enxuto: espere o Claude terminar a resposta e tente de novo.' }
    }
    if ('skip' in resultado && resultado.skip) {
      return { text: `Contexto enxuto: a redução foi recusada (${resultado.skip}).` }
    }
    const { context, cost } = await $.session.usage()
    await update($, medida, () => paraMedida(context, cost))
    const depois = context.tokens ?? 0
    if (antes > 0 && depois > 0 && depois < antes) {
      const ganho: Economia = { antes, depois }
      await update($, economia, () => ganho)
      return { text: `Contexto reduzido: de ${mil(antes)} para ${mil(depois)} tokens.` }
    }
    return { text: 'Contexto reduzido. A barra se atualiza na próxima resposta.' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const atual = await read($, medida)
    if (e.props.hasSurvey || atual === null) return next(e)
    const ganho = await read($, economia)
    const below = await next(e)
    const { Box, Text } = $.ui.resolve(e)

    const percent = atual.percent ?? 0
    const cheias = Math.min(CELULAS, Math.round((percent / 100) * CELULAS))

    return (
      <Box flexDirection="column">
        <Box flexDirection="row" gap={1} paddingX={1}>
          <Text bold>Contexto</Text>
          <Text color={cor(percent)}>{'█'.repeat(cheias)}</Text>
          <Text dimColor>{'░'.repeat(CELULAS - cheias)}</Text>
          <Text color={cor(percent)}>{`${Math.round(percent)}%`}</Text>
          {atual.tokens !== undefined ? <Text dimColor>{`${mil(atual.tokens)} de ${mil(atual.janela)}`}</Text> : null}
          {atual.usd !== undefined ? <Text bold>{`· Custo ${dolar(atual.usd)}`}</Text> : null}
          {ganho ? <Text color="green">{`· enxugou ${mil(ganho.antes - ganho.depois)}`}</Text> : null}
          {percent >= 60 ? <Text color="yellow">· /enxugar</Text> : null}
        </Box>
        {below}
      </Box>
    )
  })
}
