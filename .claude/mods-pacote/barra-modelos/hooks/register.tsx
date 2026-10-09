import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Analise } from '../types'
import { avaliar, modeloDe, ranking, rotuloFase } from './avaliar'

const analise = atom({ plugin: 'barra-modelos', key: 'analise' } as const, null)
const oculta = atom({ plugin: 'barra-modelos', key: 'oculta' } as const, false)

const CELULAS = 12

function cor(nota: number) {
  if (nota >= 70) return 'green'
  if (nota >= 45) return 'yellow'
  return 'red'
}

export const register: Register = on => {
  let prompt = ''
  let ferramentas = 0
  let agentes = 0
  const arquivos = new Set<string>()

  // Tarefa iniciada: avalia só pelo texto do pedido.
  on('prompt.submit', async ($, e, next) => {
    prompt = e.text
    ferramentas = 0
    agentes = 0
    arquivos.clear()
    const base = avaliar({ prompt })
    await update($, analise, () => ({ ...base, fase: 'iniciada' }) as Analise)
    return next(e)
  })

  // Durante o turno, o que a tarefa realmente exigiu refina a avaliação.
  on('tool.call', async ($, e, next) => {
    ferramentas += 1
    if (e.tool === 'Agent') agentes += 1
    const alvo = (e.input as { file_path?: unknown }).file_path
    if ((e.tool === 'Edit' || e.tool === 'Write') && typeof alvo === 'string') arquivos.add(alvo)
    return next(e)
  })

  // Tarefa feita: reavalia com o que aconteceu e registra o modelo que respondeu.
  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined) {
      const base = avaliar({ prompt, ferramentas, arquivos: arquivos.size, agentes })
      const usado = modeloDe(e.usage?.model)
      await update($, analise, () => ({ ...base, fase: 'feita', usado }) as Analise)
    }
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const atual = await read($, analise)
    const escondida = await read($, oculta)
    if (e.props.hasSurvey || atual === null || escondida) return next(e)
    const below = await next(e)

    const { Box, Button, Text } = $.ui.resolve(e)
    const lista = ranking(atual.exigencia)
    const melhor = lista[0]!
    const usadoNota = lista.find(m => m.id === atual.usado)

    const veredito =
      atual.fase === 'iniciada'
        ? `Melhor para esta tarefa: ${melhor.nome}`
        : !atual.usado
          ? `Melhor para o que foi feito: ${melhor.nome}`
          : usadoNota && usadoNota.id === melhor.id
            ? `${usadoNota.nome} foi a escolha certa`
            : `Rodou em ${usadoNota?.nome ?? atual.usado}; o ideal seria ${melhor.nome}`

    return (
      <Box flexDirection="column">
        <Box flexDirection="column" paddingX={1}>
          <Box flexDirection="row" gap={2}>
            <Text bold>Modelos</Text>
            <Text dimColor>
              {atual.tarefa} · exigência {atual.exigencia}/100 · {rotuloFase(atual.fase)}
            </Text>
            <Button key="ocultar" label="Ocultar" onPress={() => update($, oculta, () => true)} />
          </Box>
          {lista.map(m => {
            const cheias = Math.round((m.nota / 100) * CELULAS)
            const eMelhor = m.id === melhor.id
            const eUsado = m.id === atual.usado
            return (
              <Box key={m.id} flexDirection="row" gap={1}>
                <Text bold={eMelhor}>{m.nome.padEnd(7)}</Text>
                <Text color={cor(m.nota)}>{'█'.repeat(cheias)}</Text>
                <Text dimColor>{'░'.repeat(CELULAS - cheias)}</Text>
                <Text color={cor(m.nota)}>{`${m.nota}%`.padStart(4)}</Text>
                {eMelhor ? <Text color="green">★ melhor</Text> : null}
                {eUsado ? <Text dimColor>◀ usado</Text> : null}
              </Box>
            )
          })}
          <Text dimColor>{veredito}</Text>
        </Box>
        {below}
      </Box>
    )
  })
}
