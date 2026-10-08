import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { LivroPrompt } from '../types'

// Livro de Prompts: /salvar <nome> guarda a última mensagem enviada; /livro abre
// um painel com os prompts guardados, busca, "Usar" (vai para a caixa de texto,
// ou para a área de transferência) e "Apagar" (com confirmação).

const PAINEL = 'livro'
const TITULO_PAINEL = 'Livro de Prompts'
const CHAVE_STORE = 'prompts'
const AZUL = '#4F8EF7'

const prompts = atom({ plugin: 'livro-prompts', key: 'prompts' } as const, [])
const busca = atom({ plugin: 'livro-prompts', key: 'busca' } as const, '')
const confirmar = atom({ plugin: 'livro-prompts', key: 'confirmar' } as const, '')
const ultima = atom({ plugin: 'livro-prompts', key: 'ultima' } as const, '')

type Motor = EngineInterface

// ---------- os 3 exemplos da primeira vez ----------

const EXEMPLOS: ReadonlyArray<Pick<LivroPrompt, 'nome' | 'texto'>> = [
  {
    nome: 'Revisar texto',
    texto: [
      'Revise o texto abaixo. Corrija os erros de português, deixe as frases mais claras e mantenha o meu jeito de escrever.',
      'No final, liste o que você mudou e por quê.',
      '',
      'Texto:',
      '[cole seu texto aqui]',
    ].join('\n'),
  },
  {
    nome: 'Resumir arquivo',
    texto: [
      'Leia o arquivo [nome do arquivo] e me faça um resumo em até 10 tópicos curtos, em linguagem simples.',
      'Depois destaque as 3 informações mais importantes e diga se tem algo que eu preciso resolver.',
    ].join('\n'),
  },
  {
    nome: 'Planejar projeto',
    texto: [
      'Quero criar [descreva o seu projeto].',
      'Antes de começar, me faça até 5 perguntas para entender o que eu preciso.',
      'Depois monte um plano em etapas pequenas, explicando cada uma em linguagem simples, e só comece quando eu aprovar.',
    ].join('\n'),
  },
]

// ---------- contas ----------

const ACENTOS = new RegExp('[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36f) + ']', 'g')
const ESPACOS = new RegExp('\\s+', 'g')

function normalizar(s: string) {
  return s.normalize('NFD').replace(ACENTOS, '').toLowerCase()
}

function filtrar(lista: readonly LivroPrompt[], termo: string) {
  const alvo = normalizar(termo.trim())
  if (!alvo) return [...lista]
  return lista.filter(p => normalizar(p.nome).includes(alvo) || normalizar(p.texto).includes(alvo))
}

function umaLinha(s: string) {
  return s.replace(ESPACOS, ' ').trim()
}

function previa(texto: string, colunas: number) {
  const limite = Math.max(30, colunas * 2 - 4)
  const linha = umaLinha(texto)
  return linha.length > limite ? `${linha.slice(0, limite - 1).trimEnd()}…` : linha
}

function nomePadrao(texto: string) {
  const palavras = umaLinha(texto).split(' ').filter(Boolean).slice(0, 5)
  let nome = palavras.join(' ')
  if (nome.length > 40) nome = `${nome.slice(0, 39).trimEnd()}…`
  return nome || 'Prompt sem nome'
}

function data(ms: number) {
  const d = new Date(ms)
  const dois = (n: number) => String(n).padStart(2, '0')
  return `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()}`
}

function ehPrompt(v: unknown): v is LivroPrompt {
  if (typeof v !== 'object' || v === null) return false
  const p = v as Record<string, unknown>
  return typeof p.id === 'string' && typeof p.nome === 'string' && typeof p.texto === 'string' && typeof p.criadoEm === 'number'
}

let contador = 0
function novoId(agora: number) {
  contador += 1
  return `p${agora.toString(36)}${contador.toString(36)}`
}

// ---------- guardar (estado da conversa + store entre conversas) ----------

/** Carrega o livro do store para o estado; na primeira vez, põe os exemplos. */
async function garantir($: Motor) {
  const { version } = await $.state.get({ plugin: 'livro-prompts', key: 'prompts' } as const)
  if (version > 0) return
  const salvo = await $.store.get(CHAVE_STORE)
  let lista: LivroPrompt[]
  if (Array.isArray(salvo)) {
    lista = salvo.filter(ehPrompt)
  } else {
    const agora = await $.clock.now()
    lista = EXEMPLOS.map((ex, i) => ({ id: `exemplo-${i + 1}`, ...ex, criadoEm: agora, exemplo: true }))
    await $.store.set(CHAVE_STORE, lista)
  }
  await update($, prompts, () => lista)
}

async function mudar($: Motor, fn: (lista: LivroPrompt[]) => LivroPrompt[]) {
  await garantir($)
  const nova = await update($, prompts, lista => fn([...lista]))
  await $.store.set(CHAVE_STORE, nova)
  return nova
}

// ---------- a última mensagem enviada ----------

async function ultimaMensagem($: Motor) {
  const guardada = (await read($, ultima)).trim()
  if (guardada) return guardada
  // Plano B: a conversa (por exemplo, se o mod foi ligado depois da mensagem).
  try {
    const msgs = await $.session.messages()
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i]
      if (!m || m.role !== 'user' || (m.toolResults?.length ?? 0) > 0) continue
      const t = m.text.trim()
      if (!t || t.startsWith('<') || t.startsWith('/')) continue
      return t
    }
  } catch {
    // sem conversa para ler
  }
  return ''
}

// ---------- ações do painel ----------

async function usar($: Motor, p: LivroPrompt, surface: Parameters<Motor['ui']['copy']>[0]['surface']) {
  let rascunho = ''
  try {
    rascunho = (await $.prompt.read()).text
  } catch {
    rascunho = ''
  }
  const temRascunho = rascunho.trim().length > 0
  try {
    const feito = await $.prompt.fill(
      temRascunho ? { text: `\n\n${p.texto}`, mode: 'append' } : { text: p.texto, mode: 'replace' },
    )
    if (feito.isFilled) {
      $.ui.toast(`✏️ "${p.nome}" está na caixa de texto. Edite e envie!`)
      return
    }
  } catch {
    // segue para copiar
  }
  const copiado = await $.ui.copy({ text: p.texto, surface })
  if (copiado.isCopied) $.ui.toast('📋 Copiado! Cole na caixa de texto (Ctrl+V)', { timeoutMs: 6000 })
  else $.ui.toast('⚠️ Não consegui copiar. Selecione o texto no livro e copie à mão.', { timeoutMs: 6000 })
}

async function apertarApagar($: Motor, p: LivroPrompt) {
  if ((await read($, confirmar)) !== p.id) {
    await update($, confirmar, () => p.id)
    return
  }
  await mudar($, lista => lista.filter(x => x.id !== p.id))
  await update($, confirmar, () => '')
  $.ui.toast(`🗑️ Prompt apagado: ${p.nome}`)
}

// ---------- registro ----------

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'salvar',
      description: 'Guarda no Livro de Prompts a última mensagem que você enviou',
      argumentHint: '<nome>',
    })
    await $.command.register({
      name: 'livro',
      description: 'Abre o Livro de Prompts com as mensagens que você guardou',
    })
    await garantir($)
    return next(e)
  })

  // Lembra a última mensagem que a pessoa enviou (não os comandos com /).
  on('prompt.submit', async ($, e, next) => {
    const kind = e.origin.kind
    const daPessoa = kind === 'composer' || kind === 'bridge' || kind === 'sdk'
    const texto = e.text.trim()
    if (daPessoa && texto && !texto.startsWith('/')) await update($, ultima, () => e.text)
    return next(e)
  })

  // ----- /salvar <nome> -----

  on('command.run', { command: 'salvar' }, async ($, e) => {
    const texto = await ultimaMensagem($)
    if (!texto) {
      $.ui.toast('📘 Nada para salvar ainda: mande uma mensagem primeiro')
      return {
        text: 'Ainda não tem mensagem para salvar. Mande uma mensagem para o Claude e depois digite /salvar seguido de um nome.',
      }
    }
    const nome = umaLinha(e.args ?? '') || nomePadrao(texto)
    const agora = await $.clock.now()
    let atualizou = false
    await mudar($, lista => {
      const igual = lista.findIndex(p => normalizar(p.nome) === normalizar(nome))
      if (igual >= 0) {
        atualizou = true
        const antigo = lista[igual]!
        lista[igual] = { id: antigo.id, nome, texto, criadoEm: agora }
        return lista
      }
      return [{ id: novoId(agora), nome, texto, criadoEm: agora }, ...lista]
    })
    $.ui.toast(atualizou ? `📘 Prompt atualizado: ${nome}` : `📘 Prompt salvo: ${nome}`)
    return { text: `Prompt "${nome}" guardado no Livro de Prompts. Digite /livro para ver todos.` }
  })

  // ----- /livro -----

  on('command.run', { command: 'livro' }, async $ => {
    await garantir($)
    await update($, busca, () => '')
    await update($, confirmar, () => '')
    const aberto = await $.ui.open({ id: PAINEL, title: TITULO_PAINEL, columns: 52 })
    const total = (await read($, prompts)).length
    if (!aberto.isPlaced) {
      return { text: `O Livro de Prompts abriu, mas a janela está estreita para mostrá-lo agora (${aberto.reason}).` }
    }
    return { text: `Livro de Prompts aberto: ${total} ${total === 1 ? 'prompt guardado' : 'prompts guardados'}.` }
  })

  // Fechou o painel: esquece o "apagar?" pendente.
  on('ui.close', { id: PAINEL }, async ($, e, next) => {
    await update($, confirmar, () => '')
    return next(e)
  })

  // ----- o painel -----

  on('ui.render', { component: 'Pane', requestId: PAINEL }, async ($, e) => {
    const ui = $.ui.resolve(e)
    const { Box, Text, Button } = ui
    const lista = await read($, prompts)
    const termo = await read($, busca)
    const pendente = await read($, confirmar)
    const largura = Math.max(24, e.props.bodyColumns)
    const achados = filtrar(lista, termo)

    const campo =
      'Input' in ui ? (
        <ui.Input
          key="busca"
          label="🔎 "
          placeholder="Buscar pelo nome ou pelo texto…"
          value={termo}
          submitLabel="buscar"
          onInput={valor => void update($, busca, () => valor)}
          onSubmit={valor => void update($, busca, () => valor)}
        />
      ) : null

    const cartao = (p: LivroPrompt) => {
      const apagando = pendente === p.id
      return (
        <Box
          key={`p-${p.id}`}
          flexDirection="column"
          borderStyle="round"
          borderColor={apagando ? 'red' : 'gray'}
          paddingX={1}
        >
          <Box flexDirection="row" gap={1}>
            <Text bold color={AZUL} wrap="truncate-end">
              {p.nome}
            </Text>
            {p.exemplo ? <Text dimColor>· exemplo</Text> : null}
          </Box>
          <Text wrap="wrap">{previa(p.texto, largura - 4)}</Text>
          <Text dimColor>{p.exemplo ? 'Veio com o livro' : `Salvo em ${data(p.criadoEm)}`}</Text>
          {apagando ? (
            <Box flexDirection="column">
              <Text color="red">Apagar este prompt? Clique de novo para confirmar.</Text>
              <Box flexDirection="row" gap={1}>
                <Button key={`apagar-${p.id}`} onPress={() => void apertarApagar($, p)}>
                  Sim, apagar
                </Button>
                <Button key={`cancelar-${p.id}`} onPress={() => void update($, confirmar, () => '')}>
                  Cancelar
                </Button>
              </Box>
            </Box>
          ) : (
            <Box flexDirection="row" gap={1}>
              <Button key={`usar-${p.id}`} variant="primary" onPress={press => void usar($, p, press.surface)}>
                Usar
              </Button>
              <Button key={`apagar-${p.id}`} dimColor onPress={() => void apertarApagar($, p)}>
                Apagar
              </Button>
            </Box>
          )}
        </Box>
      )
    }

    let corpo
    if (lista.length === 0) {
      corpo = (
        <Text dimColor wrap="wrap">
          O livro está vazio. Mande uma mensagem para o Claude e depois digite /salvar seguido de um nome para guardá-la aqui.
        </Text>
      )
    } else if (achados.length === 0) {
      corpo = <Text dimColor wrap="wrap">{`Nada encontrado para "${termo.trim()}".`}</Text>
    } else {
      corpo = <Box flexDirection="column">{achados.map(cartao)}</Box>
    }

    const contagem =
      termo.trim() && lista.length > 0
        ? `${achados.length} de ${lista.length}`
        : `${lista.length} ${lista.length === 1 ? 'prompt' : 'prompts'}`

    return (
      <Box flexDirection="column" gap={1}>
        <Box flexDirection="column">
          <Box flexDirection="row" gap={1}>
            <Text bold color={AZUL}>
              📘 Livro de Prompts
            </Text>
            <Text dimColor>{`· ${contagem}`}</Text>
          </Box>
          <Text dimColor wrap="wrap">
            Guarde uma mensagem com /salvar nome. Clique em Usar para reaproveitar.
          </Text>
        </Box>
        {campo}
        {corpo}
      </Box>
    )
  })
}
