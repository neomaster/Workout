import { atom, read, update } from 'claude-code'
import type { Register, ToolCallInput, ToolCallResult } from 'claude-code'

import type { ReciboComDuracao } from '../types'
import { maisProximo, registrar, resumir, temAlgo, trechos, turnoVazio } from './recibo'
import type { Uso } from './recibo'

// A contagem do turno em andamento.
const turno = atom({ plugin: 'recibo-resposta', key: 'turno' } as const, turnoVazio())
// Recibo de cada linha "trabalhou por Xs", pelo id dessa linha no transcript.
const recibos = atom({ plugin: 'recibo-resposta', key: 'recibos' } as const, {})
// Recibos dos últimos turnos com a duração, para casar a linha quando o id não chegou.
const recentes = atom({ plugin: 'recibo-resposta', key: 'recentes' } as const, [])
// O recibo do último turno na faixa acima do prompt (o desktop não desenha a linha "trabalhou por").
const faixa = atom({ plugin: 'recibo-resposta', key: 'faixa' } as const, null)

const GUARDAR = 40

const ARQUIVO = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit'])
const COMANDO = new Set(['Bash', 'PowerShell'])

function caminhoDe(e: ToolCallInput): string | undefined {
  const args = e as unknown as { file_path?: unknown; notebook_path?: unknown }
  const p = args.file_path ?? args.notebook_path
  return typeof p === 'string' ? p : undefined
}

/** Traduz a chamada já executada para o que o recibo conta; undefined quando não conta. */
function usoDe(e: ToolCallInput, ran: ToolCallResult): Uso | undefined {
  if (ran.deny !== undefined) return undefined
  const nome = String(e.tool)
  const ok = ran.isError !== true

  if (ARQUIVO.has(nome)) {
    const caminho = caminhoDe(e)
    if (caminho === undefined) return { tipo: 'outra' }
    const tipo = ok && nome === 'Write' ? (ran.result as { type?: unknown } | undefined)?.type : undefined
    return { tipo: 'arquivo', caminho, criou: tipo === 'create', ok }
  }
  if (COMANDO.has(nome)) {
    const comando = (e as unknown as { command?: unknown }).command
    return { tipo: 'comando', comando: typeof comando === 'string' ? comando : '', ok }
  }
  return { tipo: 'outra' }
}

export const register: Register = on => {
  // Cada pedido novo começa um recibo zerado (turn.start só vem do loop principal).
  on('turn.start', async ($, e, next) => {
    await update($, turno, () => turnoVazio())
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    if (e.agentId !== undefined) return ran // subagentes ficam de fora do recibo
    const uso = usoDe(e, ran)
    if (uso === undefined) return ran

    let aviso: string | undefined
    await update($, turno, atual => {
      const r = registrar(atual, uso)
      aviso = r.aviso
      return r.turno
    })
    if (aviso !== undefined) $.ui.toast(aviso, { timeoutMs: 7000 })
    return ran
  })

  // A linha "trabalhou por Xs" entra no transcript como um aviso do sistema:
  // guarda o recibo pelo id dela, que é o requestId com que ela é desenhada.
  on('session.append', async ($, e, next) => {
    if (e.agentId === undefined && e.message.type === 'system' && e.message.name === 'turn_duration') {
      const atual = await read($, turno)
      const recibo = resumir(atual)
      await update($, recibos, mapa => {
        const ids = Object.keys(mapa)
        const mantidos = ids.slice(Math.max(0, ids.length - GUARDAR + 1))
        const novo: Record<string, typeof recibo> = {}
        for (const id of mantidos) {
          const r = mapa[id]
          if (r !== undefined) novo[id] = r
        }
        novo[e.uuid] = recibo
        return novo
      })
    }
    return next(e)
  })

  // Fim do turno: guarda o recibo com a duração (reserva para casar a linha
  // "trabalhou por" no terminal) e põe na faixa acima do prompt (desktop).
  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId === undefined) {
      const recibo: ReciboComDuracao = { ...resumir(await read($, turno)), durationMs: e.durationMs }
      await update($, recentes, lista => [...lista.slice(-(GUARDAR - 1)), recibo])
      await update($, faixa, () => (temAlgo(recibo) ? recibo : null))
    }
    return result
  })

  // A faixa some quando a pessoa manda a próxima mensagem.
  on('prompt.submit', async ($, e, next) => {
    await update($, faixa, () => null)
    return next(e)
  })

  // Desenha o recibo logo abaixo da linha "trabalhou por Xs", sem tirar a original.
  on('ui.render', { component: 'TurnDuration' }, async ($, e, next) => {
    const porId = await read($, recibos)
    const recibo = porId[e.requestId] ?? maisProximo(await read($, recentes), e.props.durationMs)
    if (recibo === undefined || !temAlgo(recibo)) return next(e)

    const original = await next(e)
    const { Box, Text } = $.ui.resolve(e)
    return (
      <Box flexDirection="column">
        {original}
        <Box flexDirection="row">
          <Text>{'🧾 '}</Text>
          {trechos(recibo, e.props.durationMs).map(t => (
            <Text key={t.key} bold={t.bold} color={t.color} dimColor={t.dimColor}>{t.texto}</Text>
          ))}
        </Box>
      </Box>
    )
  })

  // Desktop (e qualquer superfície que não seja o terminal): o recibo numa faixa
  // acima do prompt, composta com as outras faixas. No terminal ele já aparece
  // embaixo da linha "trabalhou por", então aqui não duplica.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.surface === 'terminal' || e.props.hasSurvey) return next(e)
    const recibo = await read($, faixa)
    if (recibo === null) return next(e)

    const below = await next(e)
    const { Box, Text, Button } = $.ui.resolve(e)
    return (
      <Box flexDirection="column">
        <Box key="recibo" flexDirection="row" paddingX={1}>
          <Box flexDirection="row" flexGrow={1} flexWrap="wrap">
            <Text>{'🧾 '}</Text>
            <Text bold>Recibo</Text>
            <Text dimColor>{' · '}</Text>
            {trechos(recibo, recibo.durationMs).map(t => (
              <Text key={t.key} bold={t.bold} color={t.color} dimColor={t.dimColor}>{t.texto}</Text>
            ))}
          </Box>
          <Button
            key="fechar"
            plain
            dimColor
            label="×"
            onPress={() => {
              void update($, faixa, () => null)
            }}
          />
        </Box>
        {below}
      </Box>
    )
  })
}
