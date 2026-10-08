import { atom, read, update } from 'claude-code'
import type { Register, SessionContextUsage, SessionRateLimit } from 'claude-code'

import type { Uso } from '../types'

const uso = atom({ plugin: 'barra-uso', key: 'uso' } as const, null)

const CELULAS = 10

function paraUso(context: SessionContextUsage, rateLimits: SessionRateLimit[]): Uso {
  const janela = (kind: string) => {
    const r = rateLimits.find(l => l.kind === kind)
    return r && { percent: r.percentUsed, resetsAt: r.resetsAt }
  }
  return { contexto: context.percent, sessao: janela('five_hour'), semana: janela('seven_day') }
}

function cor(percent: number) {
  if (percent >= 85) return 'red'
  if (percent >= 60) return 'yellow'
  return 'green'
}

// Horário de Brasília (UTC-3, sem horário de verão).
function hora(iso: string) {
  const d = new Date(Date.parse(iso) - 3 * 3600_000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    const { context, rateLimits } = await $.session.usage()
    await update($, uso, () => paraUso(context, rateLimits))
    return result
  })

  on('session.measure', async ($, e, next) => {
    await update($, uso, () => paraUso(e.context, e.rateLimits))
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const atual = await read($, uso)
    if (e.props.hasSurvey || atual === null) return next(e)
    // Outras faixas (como a do gerenciador de mods) continuam aparecendo embaixo.
    const below = await next(e)

    const { Box, Text } = $.ui.resolve(e)

    const item = (key: string, rotulo: string, percent: number | undefined, extra?: string) => {
      if (percent === undefined) return null
      const cheias = Math.min(CELULAS, Math.round((percent / 100) * CELULAS))
      return (
        <Box key={key} flexDirection="row" gap={1}>
          <Text bold>{rotulo}</Text>
          <Text color={cor(percent)}>{'█'.repeat(cheias)}</Text>
          <Text dimColor>{'░'.repeat(CELULAS - cheias)}</Text>
          <Text color={cor(percent)}>{`${Math.round(percent)}%`}</Text>
          {extra ? <Text dimColor>{extra}</Text> : null}
        </Box>
      )
    }

    return (
      <Box flexDirection="column">
      <Box flexDirection="row" gap={3} paddingX={1}>
        {item('contexto', 'Contexto', atual.contexto)}
        {item('sessao', 'Sessão 5h', atual.sessao?.percent, atual.sessao?.resetsAt && `renova ${hora(atual.sessao.resetsAt)}`)}
        {item('semana', 'Semana', atual.semana?.percent)}
      </Box>
      {below}
      </Box>
    )
  })
}
