import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Analise, Medida } from '../types'
import { cor, enxugar, medir, nivel } from './enxugar'

const analise = atom({ plugin: 'denso', key: 'analise' } as const, null)
const auto = atom({ plugin: 'denso', key: 'auto' } as const, false)
const oculta = atom({ plugin: 'denso', key: 'oculta' } as const, false)

const CELULAS = 12
const MIN_CARACTERES = 20
const ECONOMIA_MINIMA = 10 // abaixo disso a troca não vale a pena

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'denso',
      description: 'Enxuga um texto (/denso <texto>), liga o modo automático (/denso auto) ou mostra a faixa (/denso mostrar)',
    })
    return next(e)
  })

  on('command.run', { command: 'denso' }, async ($, e) => {
    const arg = e.args.trim()
    if (arg === 'auto') {
      const ligado = !(await read($, auto))
      await update($, auto, () => ligado)
      return { text: ligado ? 'Denso: modo automático ligado.' : 'Denso: modo automático desligado.' }
    }
    if (arg === 'mostrar') {
      await update($, oculta, () => false)
      return { text: 'Denso: faixa visível.' }
    }
    if (arg === '') {
      const a = await read($, analise)
      if (a?.sugestao) return { text: `Mais curto: ${a.sugestao}` }
      return { text: 'Uso: /denso <texto> para enxugar, /denso auto para ligar ou desligar o automático, /denso mostrar para exibir a faixa.' }
    }
    const m = medir(arg)
    const curta = enxugar(arg)
    return { text: `${nivel(m.gordura)}, ~${m.tokens} tokens, até -${m.economia}%\n${curta}` }
  })

  // Mede o pedido antes de ele ir ao modelo; com o modo automático ligado, envia a versão curta.
  on('prompt.submit', async ($, e, next) => {
    const eComando = e.text.trimStart().startsWith('/')
    if (eComando || e.text.length < MIN_CARACTERES) return next(e)

    const pedido = medir(e.text)
    const curta = enxugar(e.text)
    const util = pedido.economia >= ECONOMIA_MINIMA && curta !== e.text
    await update($, analise, (a: Analise | null) => ({
      pedido,
      resposta: a?.resposta ?? null,
      sugestao: util ? curta : undefined,
    }))

    if (util && (await read($, auto))) {
      $.ui.toast(`denso: pedido enxugado em ${pedido.economia}%`)
      return next({ ...e, text: curta })
    }
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined && e.answer.length >= MIN_CARACTERES) {
      const resposta = medir(e.answer)
      await update($, analise, (a: Analise | null) => ({
        pedido: a?.pedido ?? null,
        resposta,
        sugestao: a?.sugestao,
      }))
    }
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const a = await read($, analise)
    if (e.props.hasSurvey || a === null || (await read($, oculta))) return next(e)
    if (a.pedido === null && a.resposta === null) return next(e)
    const below = await next(e)
    const ligado = await read($, auto)

    const { Box, Button, Text } = $.ui.resolve(e)

    const barra = (key: string, rotulo: string, m: Medida | null) => {
      if (m === null) return null
      const cheias = Math.round((m.gordura / 100) * CELULAS)
      return (
        <Box key={key} flexDirection="row" gap={1}>
          <Text bold>{rotulo.padEnd(9)}</Text>
          <Text color={cor(m.gordura)}>{'█'.repeat(cheias)}</Text>
          <Text dimColor>{'░'.repeat(CELULAS - cheias)}</Text>
          <Text color={cor(m.gordura)}>{nivel(m.gordura)}</Text>
          <Text dimColor>
            ~{m.tokens} tokens{m.economia > 0 ? `, até -${m.economia}%` : ''}
          </Text>
        </Box>
      )
    }

    return (
      <Box flexDirection="column">
        <Box flexDirection="column" paddingX={1}>
          <Box flexDirection="row" gap={2}>
            <Text bold>Densidade</Text>
            <Button
              key="auto"
              label={ligado ? 'Auto: ligado' : 'Auto: desligado'}
              onPress={() => update($, auto, (v: boolean) => !v)}
            />
            <Button key="ocultar" label="Ocultar" onPress={() => update($, oculta, () => true)} />
          </Box>
          {barra('pedido', 'Pedido', a.pedido)}
          {barra('resposta', 'Resposta', a.resposta)}
          {a.sugestao ? (
            <Box flexDirection="column">
              <Text dimColor>Mais curto:</Text>
              <Text color="green">{a.sugestao}</Text>
            </Box>
          ) : null}
        </Box>
        {below}
      </Box>
    )
  })
}
