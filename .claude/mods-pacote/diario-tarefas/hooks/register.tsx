import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { DiarioStatus, DiarioTarefa } from '../types'

// Diário de tarefas: o Claude ganha a ferramenta ListaDeTarefas (o app desktop
// não tem TodoWrite/TaskCreate), a faixa acima da caixa de texto mostra o
// progresso, e quando tudo fica feito a barra fica verde, aparece um sininho e
// a campainha toca uma vez. /diario abre o painel com a lista.

const PAINEL = 'diario'
const TITULO_PAINEL = 'Diário de tarefas'
const FERRAMENTA = 'ListaDeTarefas'
const CELULAS_FAIXA = 10
const CELULAS_PAINEL = 20
const AMARELO = '#F5E765'

const tarefas = atom({ plugin: 'diario-tarefas', key: 'tarefas' } as const, [])

type Motor = EngineInterface

// ---------- contas ----------

function resumo(lista: readonly DiarioTarefa[]) {
  const total = lista.length
  const feitas = lista.filter(t => t.status === 'completed').length
  const atual = lista.find(t => t.status === 'in_progress')
  const proxima = lista.find(t => t.status === 'pending')
  return { total, feitas, atual, proxima, completo: total > 0 && feitas === total }
}

function cheias(feitas: number, total: number, celulas: number) {
  if (total === 0) return 0
  return Math.min(celulas, Math.round((feitas / total) * celulas))
}

function ehStatus(v: unknown): v is DiarioStatus {
  return v === 'pending' || v === 'in_progress' || v === 'completed'
}

// ---------- som (mesmo esquema da campainha-pronto) ----------

async function tocar($: Motor) {
  try {
    if ((await $.env.get('OS')) === 'Windows_NT') {
      // No Windows o PowerShell toca o .wav (o terminal não tem player).
      const barra = String.fromCharCode(92)
      const arquivo = [$.plugin.root, 'sons', 'campainha.wav'].join(barra).replaceAll("'", "''")
      await $.process.run(
        [
          'powershell.exe',
          '-NoProfile',
          '-NonInteractive',
          '-Command',
          `(New-Object System.Media.SoundPlayer '${arquivo}').PlaySync()`,
        ],
        { timeoutMs: 15_000 },
      )
    } else {
      await $.audio.play({ asset: 'sons/campainha.wav' })
    }
  } catch (erro) {
    $.ui.log(`diario-tarefas: não tocou o som (${String(erro)})`, { to: 'debug' })
  }
}

// Toda mudança passa por aqui: se a lista acabou de ficar completa, toca a campainha.
async function mudar($: Motor, fn: (lista: DiarioTarefa[]) => DiarioTarefa[]) {
  let antes: readonly DiarioTarefa[] = []
  const nova = await update($, tarefas, lista => {
    antes = lista
    return fn([...lista])
  })
  if (!resumo(antes).completo && resumo(nova).completo) void tocar($)
  return nova
}

// ---------- a ferramenta ListaDeTarefas ----------

const DESCRICAO = [
  'Sua lista de tarefas, que o usuário vê na tela: uma barra de progresso acima da caixa de texto e o painel /diario.',
  'Use SEMPRE que o usuário pedir para "usar sua lista de tarefas" (ou "lista de tarefas", "to-do", "checklist") e em qualquer trabalho com várias etapas.',
  'Como usar: (1) acao "criar" com todos os títulos em "tarefas", antes de começar;',
  '(2) antes de começar cada tarefa, acao "em_andamento" com o número dela em "tarefa";',
  '(3) assim que terminar aquela tarefa, acao "feita" com o número dela.',
  'Marque uma de cada vez, à medida que trabalha, nunca todas de uma vez no final.',
  'acao "adicionar" acrescenta títulos ao fim da lista; acao "ver" só mostra a lista.',
  'Cada chamada devolve o estado atual da lista em texto.',
].join(' ')

const ESQUEMA = {
  type: 'object',
  properties: {
    acao: {
      type: 'string',
      enum: ['criar', 'adicionar', 'em_andamento', 'feita', 'ver'],
      description: 'O que fazer com a lista.',
    },
    tarefas: {
      type: 'array',
      items: { type: 'string' },
      description: 'Para "criar" ou "adicionar": os títulos das tarefas, curtos, na ordem em que serão feitas.',
    },
    tarefa: {
      type: ['integer', 'string'],
      description: 'Para "em_andamento" ou "feita": o número da tarefa (1, 2, 3...) ou o título dela.',
    },
  },
  required: ['acao'],
}

function textoDaLista(lista: readonly DiarioTarefa[]) {
  const { total, feitas, completo, atual, proxima } = resumo(lista)
  if (total === 0) return 'A lista de tarefas está vazia. Use acao "criar" com os títulos.'
  const linhas = lista.map((t, i) => {
    const marca = t.status === 'completed' ? '[x]' : t.status === 'in_progress' ? '[>]' : '[ ]'
    const extra = t.status === 'in_progress' ? ' (em andamento)' : ''
    return `${i + 1}. ${marca} ${t.titulo}${extra}`
  })
  let dica = ''
  if (completo) dica = 'Todas as tarefas estão feitas.'
  else if (atual) dica = `Quando terminar a ${lista.indexOf(atual) + 1}, marque como "feita".`
  else if (proxima) dica = `Próximo passo: marque a ${lista.indexOf(proxima) + 1} como "em_andamento" e comece.`
  return [`Lista de tarefas: ${feitas} de ${total} feitas.`, ...linhas, dica].filter(Boolean).join('\n')
}

/** Acha a tarefa pelo número (1, "2") ou pelo título. */
function acharIndice(lista: readonly DiarioTarefa[], ref: unknown) {
  if (typeof ref === 'number' && Number.isInteger(ref)) {
    return ref >= 1 && ref <= lista.length ? ref - 1 : -1
  }
  if (typeof ref !== 'string') return -1
  const limpo = ref.trim()
  if (/^[0-9]+$/.test(limpo)) return acharIndice(lista, Number(limpo))
  const alvo = limpo.toLowerCase()
  const exato = lista.findIndex(t => t.titulo.toLowerCase() === alvo)
  if (exato >= 0) return exato
  return alvo ? lista.findIndex(t => t.titulo.toLowerCase().includes(alvo)) : -1
}

function titulosDe(v: unknown) {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === 'string').map(x => x.trim()).filter(Boolean)
}

async function usarFerramenta($: Motor, entrada: Record<string, unknown>) {
  const acao = entrada.acao
  if (acao === 'criar' || acao === 'adicionar') {
    const titulos = titulosDe(entrada.tarefas)
    if (titulos.length === 0) return 'Faltou "tarefas": a lista de títulos. Nada mudou.'
    const nova = await mudar($, lista => {
      const base = acao === 'criar' ? [] : lista
      const novas = titulos.map((titulo, i) => ({
        id: String(base.length + i + 1),
        titulo,
        status: 'pending' as const,
      }))
      return [...base, ...novas]
    })
    return textoDaLista(nova)
  }
  if (acao === 'em_andamento' || acao === 'feita') {
    const lista = await read($, tarefas)
    const refs = entrada.tarefa !== undefined ? [entrada.tarefa] : Array.isArray(entrada.tarefas) ? entrada.tarefas : []
    const indices = refs.map(r => acharIndice(lista, r))
    if (indices.length === 0 || indices.some(i => i < 0)) {
      return `Não encontrei a tarefa ${JSON.stringify(entrada.tarefa ?? entrada.tarefas ?? '')}. Nada mudou.\n${textoDaLista(lista)}`
    }
    const status: DiarioStatus = acao === 'feita' ? 'completed' : 'in_progress'
    const ids = new Set(indices.map(i => lista[i]?.id))
    const nova = await mudar($, atual => atual.map(t => (ids.has(t.id) ? { ...t, status } : t)))
    return textoDaLista(nova)
  }
  if (acao === 'ver') return textoDaLista(await read($, tarefas))
  return 'acao inválida: use "criar", "adicionar", "em_andamento", "feita" ou "ver".'
}

function idDoTexto(texto: string | undefined) {
  const achou = texto?.match(/#([0-9]+)/)
  return achou?.[1]
}

// ---------- desenhos ----------

const SINO_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" ` +
  `stroke="${AMARELO}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">` +
  `<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" fill="rgba(245,231,101,0.25)"/>` +
  `<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>` +
  `</svg>`

// ---------- registro ----------

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.tool.register({ name: FERRAMENTA, description: DESCRICAO, inputSchema: ESQUEMA })
    await $.command.register({
      name: 'diario',
      description: 'Abre o diário com as tarefas desta conversa',
    })
    return next(e)
  })

  // /clear começa outra conversa: a lista recomeça vazia.
  on('session.end', async ($, e, next) => {
    if (e.reason === 'clear') await update($, tarefas, () => [])
    return next(e)
  })

  // ----- a ferramenta própria (funciona no app desktop) -----

  on('tool.call', { tool: 'mcp__diario-tarefas__ListaDeTarefas' }, async ($, e) => {
    const entrada = e as unknown as Record<string, unknown>
    return { result: await usarFerramenta($, entrada) }
  })

  // ----- as ferramentas do Claude Code no terminal, se existirem -----

  on('tool.call', { tool: 'TodoWrite' }, async ($, e, next) => {
    const ran = await next(e)
    if (e.agentId !== undefined || ran.deny !== undefined || ran.isError) return ran
    const lista: DiarioTarefa[] = e.todos.map((t, i) => ({
      id: String(i + 1),
      titulo: t.content,
      status: t.status,
      ativo: t.activeForm,
    }))
    await mudar($, () => lista)
    return ran
  })

  on('tool.call', { tool: 'TaskCreate' }, async ($, e, next) => {
    const ran = await next(e)
    if (e.agentId !== undefined || ran.deny !== undefined || ran.isError) return ran
    const resultado = ran.result as { task?: { id?: unknown } } | undefined
    const idBruto = resultado?.task?.id
    await mudar($, lista => {
      const id =
        (typeof idBruto === 'string' || typeof idBruto === 'number' ? String(idBruto) : undefined) ??
        idDoTexto(ran.text) ??
        String(lista.length + 1)
      const nova: DiarioTarefa = { id, titulo: e.subject, status: 'pending', ativo: e.activeForm }
      return [...lista.filter(t => t.id !== id), nova]
    })
    return ran
  })

  on('tool.call', { tool: 'TaskUpdate' }, async ($, e, next) => {
    const ran = await next(e)
    if (e.agentId !== undefined || ran.deny !== undefined || ran.isError) return ran
    const resultado = ran.result as { success?: unknown } | undefined
    if (resultado?.success === false) return ran
    const pedido = e.status
    if (pedido === 'deleted') {
      await mudar($, lista => lista.filter(t => t.id !== e.taskId))
      return ran
    }
    await mudar($, lista => {
      const existe = lista.some(t => t.id === e.taskId)
      const base: DiarioTarefa[] = existe
        ? lista
        : [...lista, { id: e.taskId, titulo: e.subject ?? `Tarefa ${e.taskId}`, status: 'pending' }]
      return base.map(t =>
        t.id !== e.taskId
          ? t
          : { ...t, titulo: e.subject ?? t.titulo, ativo: e.activeForm ?? t.ativo, status: pedido ?? t.status },
      )
    })
    return ran
  })

  on('tool.call', { tool: 'TaskList' }, async ($, e, next) => {
    const ran = await next(e)
    if (e.agentId !== undefined || ran.deny !== undefined || ran.isError) return ran
    const resultado = ran.result as { tasks?: unknown } | undefined
    if (!Array.isArray(resultado?.tasks)) return ran
    const vindas = resultado.tasks as Array<{ id?: unknown; subject?: unknown; status?: unknown }>
    await mudar($, lista =>
      vindas
        .filter(t => typeof t.subject === 'string' && ehStatus(t.status))
        .map(t => {
          const id = String(t.id)
          const antes = lista.find(x => x.id === id)
          return { id, titulo: t.subject as string, status: t.status as DiarioStatus, ativo: antes?.ativo }
        }),
    )
    return ran
  })

  // ----- /diario -----

  on('command.run', { command: 'diario' }, async $ => {
    const aberto = await $.ui.open({ id: PAINEL, title: TITULO_PAINEL })
    const lista = await read($, tarefas)
    const { total, feitas } = resumo(lista)
    if (!aberto.isPlaced) {
      return { text: `Diário aberto, mas a janela está estreita para mostrá-lo agora (${aberto.reason}).` }
    }
    return {
      text: total === 0 ? 'Diário de tarefas aberto.' : `Diário de tarefas aberto: ${feitas} de ${total} feitas.`,
    }
  })

  // ----- faixa acima da caixa de texto -----

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const lista = await read($, tarefas)
    if (e.props.hasSurvey || lista.length === 0) return next(e)
    // As outras faixas (campainha, barra de uso...) continuam logo abaixo.
    const below = await next(e)

    const ui = $.ui.resolve(e)
    const { Box, Text } = ui
    const { total, feitas, atual, proxima, completo } = resumo(lista)
    const n = cheias(feitas, total, CELULAS_FAIXA)

    let sino = null
    if (completo) {
      if (e.surface !== 'terminal' && 'Svg' in ui) {
        const { Svg } = ui
        sino = <Svg source={SINO_SVG} alt="🔔" width={18} height={18} />
      } else {
        sino = <Text color={AMARELO}>🔔</Text>
      }
    }

    const faixa = (
      <Box flexDirection="row" alignItems="center" gap={1} paddingX={1}>
        <Text bold>Tarefas</Text>
        <Text> </Text>
        <Text color={completo ? 'green' : 'cyan'}>{'█'.repeat(n)}</Text>
        <Text dimColor>{'░'.repeat(CELULAS_FAIXA - n)}</Text>
        <Text> </Text>
        {completo ? (
          <Text color="green" bold>{`✓ ${feitas} de ${total} feitas`}</Text>
        ) : (
          <Text bold>{`${feitas} de ${total} feitas`}</Text>
        )}
        {sino}
        {atual && !completo ? (
          <Text color="yellow" wrap="truncate-end">{`· agora: ${atual.ativo ?? atual.titulo}`}</Text>
        ) : !completo && proxima ? (
          <Text dimColor wrap="truncate-end">{`· próxima: ${proxima.titulo}`}</Text>
        ) : null}
      </Box>
    )

    return (
      <Box flexDirection="column">
        {faixa}
        {below}
      </Box>
    )
  })

  // ----- painel lateral (/diario) -----

  on('ui.render', { component: 'Pane', requestId: PAINEL }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const lista = await read($, tarefas)
    const largura = Math.max(20, e.props.bodyColumns)
    const { total, feitas, completo } = resumo(lista)
    const celulas = Math.max(8, Math.min(CELULAS_PAINEL, largura - 18))
    const n = cheias(feitas, total, celulas)
    const pct = total === 0 ? 0 : Math.round((feitas / total) * 100)

    const linha = (t: DiarioTarefa, i: number) => {
      if (t.status === 'in_progress') {
        return (
          <Box key={`t-${t.id}`} flexDirection="column" borderStyle="round" borderColor="yellow" paddingX={1}>
            <Box flexDirection="row" gap={1}>
              <Text color="yellow" bold>▶ ☐</Text>
              <Text color="yellow" bold wrap="wrap">{t.titulo}</Text>
            </Box>
            <Text color="yellow" dimColor wrap="truncate-end">{`   agora: ${t.ativo ?? t.titulo}`}</Text>
          </Box>
        )
      }
      const feita = t.status === 'completed'
      return (
        <Box key={`t-${t.id}`} flexDirection="row" gap={1} paddingX={2}>
          <Text dimColor>{`${String(i + 1).padStart(2, ' ')}.`}</Text>
          <Text color={feita ? 'green' : undefined} bold={!feita}>{feita ? '☑' : '☐'}</Text>
          <Text color={feita ? 'green' : undefined} dimColor={feita} strikethrough={feita} wrap="wrap">
            {t.titulo}
          </Text>
        </Box>
      )
    }

    return (
      <Box flexDirection="column" gap={1}>
        <Box flexDirection="column">
          <Text bold color="cyan">{'📓 Diário de tarefas'}</Text>
          {total === 0 ? (
            <Text dimColor>Nenhuma tarefa nesta conversa ainda.</Text>
          ) : (
            <Box flexDirection="row" gap={1}>
              <Text color={completo ? 'green' : 'cyan'}>{'█'.repeat(n)}</Text>
              <Text dimColor>{'░'.repeat(celulas - n)}</Text>
              <Text bold color={completo ? 'green' : undefined}>
                {completo ? `✓ ${feitas} de ${total} feitas` : `${feitas} de ${total} feitas`}
              </Text>
              <Text dimColor>{`${pct}%`}</Text>
            </Box>
          )}
        </Box>

        {total === 0 ? (
          <Text dimColor wrap="wrap">
            Peça ao Claude: "use sua lista de tarefas" num trabalho com várias etapas, e a lista aparece aqui.
          </Text>
        ) : (
          <Box flexDirection="column">{lista.map(linha)}</Box>
        )}

        {completo ? <Text color="green" bold>{'🔔 Tudo feito!'}</Text> : null}
      </Box>
    )
  })
}
