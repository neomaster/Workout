import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { PontoRestauracao, PontoTipo } from '../types'

// Ponto de Restauração: antes de o Claude mudar um arquivo que já existe
// (Write, Edit, MultiEdit, NotebookEdit), guarda o conteúdo de antes numa
// pasta .restauracao dentro do projeto, com data e hora no nome, e anota no
// índice (.restauracao/indice.json). Arquivo criado do zero fica anotado como
// "criado". /voltar abre o painel com as últimas alterações e os botões para
// voltar atrás.

type Motor = EngineInterface

const PAINEL = 'voltar'
const TITULO = 'Pontos de restauração'
const PASTA = '.restauracao'
const INDICE = 'indice.json'
const MAXIMO = 30
const FERRAMENTAS = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit'])

const BARRA = String.fromCharCode(92)
const LF = String.fromCharCode(10)

const AZUL = '#6aa6ff'
const VERDE = '#4cc176'
const LARANJA = '#e8a33d'
const VERMELHO = '#e5534b'
const CINZA = '#8a948b'

const pontos = atom({ plugin: 'ponto-restauracao', key: 'pontos' } as const, [])
const resposta = atom({ plugin: 'ponto-restauracao', key: 'resposta' } as const, { id: '', avisada: false })
const confirmar = atom({ plugin: 'ponto-restauracao', key: 'confirmar' } as const, '')
const tick = atom({ plugin: 'ponto-restauracao', key: 'tick' } as const, 0)

// ---------- caminhos ----------

type Base = { raiz: string; sep: string; pasta: string }

function semBarraNoFim(s: string) {
  let t = s
  while (t.length > 1 && (t.endsWith('/') || t.endsWith(BARRA))) t = t.slice(0, -1)
  return t
}

async function pastaBase($: Motor): Promise<Base> {
  let raiz: string
  try {
    raiz = await $.session.root()
  } catch {
    raiz = await $.session.cwd()
  }
  raiz = semBarraNoFim(raiz)
  const windows = raiz.includes(BARRA) || raiz[1] === ':'
  const sep = windows ? BARRA : '/'
  return { raiz, sep, pasta: `${raiz}${sep}${PASTA}` }
}

function ehAbsoluto(s: string) {
  return s.startsWith('/') || s.startsWith(BARRA) || s[1] === ':'
}

function absoluto(caminho: string, base: Base) {
  return ehAbsoluto(caminho) ? caminho : `${base.raiz}${base.sep}${caminho}`
}

function comparavel(s: string) {
  return semBarraNoFim(s.split(BARRA).join('/')).toLowerCase()
}

function dentroDe(caminho: string, pasta: string) {
  const a = comparavel(caminho)
  const b = comparavel(pasta)
  return a === b || a.startsWith(`${b}/`)
}

function exibir(caminho: string, raiz: string) {
  const normal = caminho.split(BARRA).join('/')
  const r = semBarraNoFim(raiz.split(BARRA).join('/'))
  return dentroDe(normal, r) && normal.length > r.length ? normal.slice(r.length + 1) : normal
}

function nomeDoArquivo(caminho: string) {
  const partes = caminho.split(BARRA).join('/').split('/')
  return partes[partes.length - 1] ?? caminho
}

function dentroDaPasta(base: Base, nome: string) {
  return `${base.pasta}${base.sep}${nome}`
}

// ---------- datas ----------

function dois(n: number) {
  return String(n).padStart(2, '0')
}

function hora(ms: number) {
  const d = new Date(ms)
  return `${dois(d.getHours())}:${dois(d.getMinutes())}`
}

function haQuanto(ms: number, agora: number) {
  const min = Math.floor((agora - ms) / 60_000)
  if (min < 1) return 'agora mesmo'
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h} h`
  const dias = Math.floor(h / 24)
  return dias === 1 ? 'há 1 dia' : `há ${dias} dias`
}

let sequencia = 0

function nomeDaCopia(agora: number, caminho: string, prefixo = '') {
  const d = new Date(agora)
  const data = `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`
  const tempo = `${dois(d.getHours())}-${dois(d.getMinutes())}-${dois(d.getSeconds())}`
  sequencia = (sequencia + 1) % 100
  const arquivo = nomeDoArquivo(caminho).slice(-80)
  return `${prefixo}${data}_${tempo}-${dois(sequencia)}__${arquivo}`
}

// ---------- o índice (.restauracao/indice.json) ----------

// Uma coisa de cada vez no índice: edições em paralelo não se atropelam.
let fila: Promise<unknown> = Promise.resolve()
function emFila<T>(fn: () => Promise<T>): Promise<T> {
  const vez = fila.then(fn, fn)
  fila = vez.catch(() => undefined)
  return vez
}

function ehPonto(v: unknown): v is PontoRestauracao {
  if (typeof v !== 'object' || v === null) return false
  const p = v as Record<string, unknown>
  return (
    typeof p.id === 'string' &&
    typeof p.arquivo === 'string' &&
    typeof p.nome === 'string' &&
    (p.tipo === 'alterado' || p.tipo === 'criado') &&
    typeof p.quando === 'number' &&
    typeof p.resposta === 'string'
  )
}

async function lerIndice($: Motor, base: Base): Promise<PontoRestauracao[]> {
  const arquivo = dentroDaPasta(base, INDICE)
  try {
    if (!(await $.fs.exists(arquivo))) return []
    const dados = JSON.parse(String(await $.fs.read(arquivo))) as { pontos?: unknown }
    return Array.isArray(dados.pontos) ? dados.pontos.filter(ehPonto) : []
  } catch (erro) {
    $.ui.log(`ponto-restauracao: não li o índice (${String(erro)})`, { to: 'debug' })
    return []
  }
}

async function salvarIndice($: Motor, base: Base, lista: PontoRestauracao[]) {
  await $.fs.write(dentroDaPasta(base, INDICE), JSON.stringify({ versao: 1, pontos: lista }, null, 2) + LF)
  await update($, pontos, () => lista)
}

async function garantirGitignore($: Motor, base: Base) {
  const arquivo = dentroDaPasta(base, '.gitignore')
  if (!(await $.fs.exists(arquivo))) {
    await $.fs.write(arquivo, `# Cópias do mod Ponto de Restauração: não vão para o Git${LF}*${LF}`)
  }
}

async function recarregar($: Motor) {
  const base = await pastaBase($)
  const lista = await emFila(() => lerIndice($, base))
  await update($, pontos, () => lista)
  return lista
}

// ---------- apagar arquivos (cópias antigas, arquivo criado pelo Claude) ----------

async function apagarArquivos($: Motor, caminhos: string[]) {
  const alvos = caminhos.filter(Boolean)
  if (alvos.length === 0) return
  try {
    if ((await $.env.get('OS')) === 'Windows_NT') {
      // Os caminhos vão por variável de ambiente: nada de aspas para escapar.
      const script =
        'foreach ($p in ($env:PONTO_ALVOS -split [char]10)) { if ($p) { Remove-Item -LiteralPath $p -Force -ErrorAction SilentlyContinue } }'
      await $.process.run(['powershell.exe', '-NoProfile', '-NonInteractive', '-Command', script], {
        env: { PONTO_ALVOS: alvos.join(LF) },
        timeoutMs: 20_000,
      })
    } else {
      await $.process.run(['rm', '-f', '--', ...alvos], { timeoutMs: 20_000 })
    }
  } catch (erro) {
    $.ui.log(`ponto-restauracao: não apaguei (${String(erro)})`, { to: 'debug' })
  }
}

// ---------- guardar um ponto ----------

type Novo = { caminho: string; tipo: PontoTipo; antes?: string; ferramenta: string }

async function guardar($: Motor, base: Base, novo: Novo) {
  await emFila(async () => {
    const agora = await $.clock.now()
    const vez = await read($, resposta)
    let copia: string | undefined
    if (novo.tipo === 'alterado' && novo.antes !== undefined) {
      copia = nomeDaCopia(agora, novo.caminho)
      await $.fs.write(dentroDaPasta(base, copia), novo.antes)
    }
    await garantirGitignore($, base)
    const ponto: PontoRestauracao = {
      id: `p${agora}-${dois(sequencia)}${Math.floor(Math.random() * 1000)}`,
      arquivo: novo.caminho,
      nome: exibir(novo.caminho, base.raiz),
      tipo: novo.tipo,
      quando: agora,
      resposta: vez.id || 'sem-resposta',
      ferramenta: novo.ferramenta,
    }
    if (copia !== undefined) ponto.copia = copia
    const lista = [...(await lerIndice($, base)), ponto]
    const sai = lista.slice(0, Math.max(0, lista.length - MAXIMO))
    await salvarIndice($, base, lista.slice(-MAXIMO))
    const velhas = sai.flatMap(p => (p.copia ? [dentroDaPasta(base, p.copia)] : []))
    if (velhas.length > 0) void apagarArquivos($, velhas)
    if (!vez.avisada) {
      $.ui.toast('📌 Ponto de restauração criado')
      await update($, resposta, () => ({ id: vez.id, avisada: true }))
    }
  })
}

// ---------- voltar atrás ----------

async function marcar($: Motor, base: Base, ids: Set<string>, mudar?: (p: PontoRestauracao) => PontoRestauracao) {
  const agora = await $.clock.now()
  await emFila(async () => {
    const lista = await lerIndice($, base)
    const nova = lista.map(p => {
      if (!ids.has(p.id)) return p
      const feito = { ...p, restaurado: true, restauradoEm: agora }
      return mudar ? mudar(feito) : feito
    })
    await salvarIndice($, base, nova)
  })
}

/** Volta o arquivo ao conteúdo guardado. Devolve uma mensagem de erro, ou undefined se deu certo. */
async function voltarConteudo($: Motor, base: Base, ponto: PontoRestauracao): Promise<string | undefined> {
  if (ponto.copia === undefined) return 'Esta alteração não tem cópia guardada.'
  let texto: string
  try {
    texto = String(await $.fs.read(dentroDaPasta(base, ponto.copia)))
  } catch {
    return `Não achei a cópia de ${ponto.nome} na pasta ${PASTA}.`
  }
  try {
    await $.fs.write(ponto.arquivo, texto)
  } catch (erro) {
    return `Não consegui gravar ${ponto.nome} (${String(erro)}).`
  }
  return undefined
}

/** Apaga um arquivo que o Claude criou, guardando antes uma cópia por segurança. */
async function apagarCriado($: Motor, base: Base, ponto: PontoRestauracao): Promise<{ erro?: string; copia?: string }> {
  if (!(await $.fs.exists(ponto.arquivo))) return {}
  let copia: string | undefined
  try {
    const texto = String(await $.fs.read(ponto.arquivo))
    copia = nomeDaCopia(await $.clock.now(), ponto.arquivo, 'apagado_')
    await $.fs.write(dentroDaPasta(base, copia), texto)
  } catch {
    copia = undefined
  }
  await apagarArquivos($, [ponto.arquivo])
  if (await $.fs.exists(ponto.arquivo)) return { erro: `Não consegui apagar ${ponto.nome}.`, copia }
  return { copia }
}

async function restaurarUm($: Motor, id: string) {
  const base = await pastaBase($)
  const ponto = (await lerIndice($, base)).find(p => p.id === id)
  await update($, confirmar, () => '')
  if (ponto === undefined) {
    $.ui.toast('⚠ Esse ponto não existe mais')
    return
  }
  if (ponto.tipo === 'criado') {
    const { erro, copia } = await apagarCriado($, base, ponto)
    if (erro !== undefined) {
      $.ui.toast(`⚠ ${erro}`)
      return
    }
    await marcar($, base, new Set([id]), p => (copia ? { ...p, copia } : p))
    $.ui.toast('🗑 Arquivo apagado')
    return
  }
  const erro = await voltarConteudo($, base, ponto)
  if (erro !== undefined) {
    $.ui.toast(`⚠ ${erro}`)
    return
  }
  await marcar($, base, new Set([id]))
  $.ui.toast('↩ Arquivo restaurado')
}

/** O que "Restaurar todos desta resposta" desfaz: o ponto mais antigo de cada arquivo da última resposta. */
function alvosDaUltimaResposta(lista: readonly PontoRestauracao[]) {
  // O índice fica na ordem em que as alterações aconteceram: a última é a mais nova.
  const ultimo = lista[lista.length - 1]
  if (ultimo === undefined) return { resposta: '', alvos: [] as PontoRestauracao[] }
  const daResposta = lista.filter(p => p.resposta === ultimo.resposta)
  const porArquivo = new Map<string, PontoRestauracao>()
  for (const p of daResposta) {
    const chave = comparavel(p.arquivo)
    if (!porArquivo.has(chave)) porArquivo.set(chave, p)
  }
  const alvos = [...porArquivo.values()].filter(p => !p.restaurado)
  return { resposta: ultimo.resposta, alvos }
}

async function restaurarTodos($: Motor) {
  const base = await pastaBase($)
  const lista = await lerIndice($, base)
  await update($, confirmar, () => '')
  const { resposta: daResposta, alvos } = alvosDaUltimaResposta(lista)
  if (alvos.length === 0) {
    $.ui.toast('Nada para desfazer nesta resposta')
    return
  }
  const feitos = new Set<string>()
  const copias = new Map<string, string>()
  const erros: string[] = []
  for (const p of alvos) {
    if (p.tipo === 'criado') {
      const { erro, copia } = await apagarCriado($, base, p)
      if (erro !== undefined) erros.push(erro)
      else {
        feitos.add(p.id)
        if (copia) copias.set(p.id, copia)
      }
    } else {
      const erro = await voltarConteudo($, base, p)
      if (erro !== undefined) erros.push(erro)
      else feitos.add(p.id)
    }
  }
  // Os pontos mais novos da mesma resposta também ficam como restaurados.
  for (const p of lista) {
    if (p.resposta === daResposta && alvos.some(a => comparavel(a.arquivo) === comparavel(p.arquivo) && feitos.has(a.id))) {
      feitos.add(p.id)
    }
  }
  await marcar($, base, feitos, p => {
    const copia = copias.get(p.id)
    return copia ? { ...p, copia } : p
  })
  if (erros.length > 0) {
    $.ui.toast(`⚠ ${erros[0]}${erros.length > 1 ? ` (e mais ${erros.length - 1})` : ''}`)
  } else {
    const n = alvos.length
    $.ui.toast(n === 1 ? '↩ Arquivo restaurado' : `↩ ${n} arquivos restaurados`)
  }
}

// ---------- relógio do "há 2 min" ----------

let relogioLigado = false
function ligarRelogio($: Motor) {
  if (relogioLigado) return
  relogioLigado = true
  $.clock.every(30_000, () => {
    void (async () => {
      try {
        await $.clock.now().then(t => update($, tick, () => t))
      } catch {
        // sem problema: atualiza na próxima
      }
    })()
  })
}

// ---------- registro ----------

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'voltar',
      description: 'Ponto de Restauração: mostra as últimas alterações nos arquivos e deixa voltar atrás',
    })
    try {
      await recarregar($)
    } catch {
      // O painel lê de novo quando abrir.
    }
    ligarRelogio($)
    return next(e)
  })

  // Cada resposta do Claude é um turno: o aviso aparece uma vez por resposta.
  on('turn.start', async ($, e, next) => {
    await update($, resposta, () => ({ id: e.turnId, avisada: false }))
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    const ferramenta = String(e.tool)
    if (!FERRAMENTAS.has(ferramenta)) return next(e)
    const entrada = e as unknown as Record<string, unknown>
    const bruto = ferramenta === 'NotebookEdit' ? entrada.notebook_path : entrada.file_path
    if (typeof bruto !== 'string' || bruto.trim() === '') return next(e)

    let base: Base
    try {
      base = await pastaBase($)
    } catch {
      return next(e)
    }
    const caminho = absoluto(bruto, base)
    // A própria pasta das cópias não entra na conta.
    if (dentroDe(caminho, base.pasta)) return next(e)

    let existia = false
    let antes: string | undefined
    try {
      existia = await $.fs.exists(caminho)
      if (existia) antes = String(await $.fs.read(caminho))
    } catch (erro) {
      // Pasta, arquivo grande demais (mais de 4 MB) ou sem permissão: segue sem cópia.
      $.ui.log(`ponto-restauracao: sem cópia de ${caminho} (${String(erro)})`, { to: 'debug' })
      return next(e)
    }
    if (!existia && ferramenta !== 'Write') return next(e)

    const ran = await next(e)
    if (ran.deny !== undefined || ran.isError === true) return ran

    try {
      await guardar($, base, { caminho, tipo: existia ? 'alterado' : 'criado', antes, ferramenta })
    } catch (erro) {
      $.ui.log(`ponto-restauracao: não guardei o ponto (${String(erro)})`, { to: 'debug' })
    }
    return ran
  })

  on('command.run', { command: 'voltar' }, async $ => {
    ligarRelogio($)
    await update($, confirmar, () => '')
    await $.clock.now().then(t => update($, tick, () => t))
    const lista = await recarregar($)
    const aberto = await $.ui.open({ id: PAINEL, title: TITULO })
    if (!aberto.isPlaced) {
      return { text: `Painel de restauração aberto, mas a janela está estreita para mostrá-lo agora (${aberto.reason}).` }
    }
    const n = lista.length
    return {
      text:
        n === 0
          ? 'Painel de restauração aberto: ainda não há alterações guardadas neste projeto.'
          : `Painel de restauração aberto: ${n} ${n === 1 ? 'alteração guardada' : 'alterações guardadas'}.`,
    }
  })

  on('ui.render', { component: 'Pane', requestId: PAINEL }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const lista = await read($, pontos)
    const pedindo = await read($, confirmar)
    await read($, tick)
    const agora = await $.clock.now()

    const novos = [...lista].reverse()
    const { alvos } = alvosDaUltimaResposta(lista)
    const criadosNoTodos = alvos.filter(p => p.tipo === 'criado').length

    // Agrupa por resposta, na ordem da mais nova para a mais antiga.
    const grupos: { resposta: string; itens: PontoRestauracao[] }[] = []
    for (const p of novos) {
      const g = grupos.find(x => x.resposta === p.resposta)
      if (g) g.itens.push(p)
      else grupos.push({ resposta: p.resposta, itens: [p] })
    }

    const botoes = (p: PontoRestauracao) => {
      if (p.tipo === 'criado') {
        if (p.restaurado) return null
        if (pedindo === p.id) {
          return (
            <Box flexDirection="row" gap={2} flexWrap="wrap">
              <Button
                key={`confirmar-${p.id}`}
                label="Confirmar: apagar"
                variant="primary"
                onPress={() => restaurarUm($, p.id)}
              />
              <Button key={`cancelar-${p.id}`} label="Cancelar" onPress={() => update($, confirmar, () => '')} />
            </Box>
          )
        }
        return <Button key={`apagar-${p.id}`} label="Apagar" onPress={() => update($, confirmar, () => p.id)} />
      }
      return (
        <Button
          key={`restaurar-${p.id}`}
          label={p.restaurado ? 'Restaurar de novo' : 'Restaurar'}
          variant={p.restaurado ? 'secondary' : 'primary'}
          onPress={() => restaurarUm($, p.id)}
        />
      )
    }

    const etiqueta = (p: PontoRestauracao) => {
      if (p.restaurado) {
        const quando = p.restauradoEm ? ` às ${hora(p.restauradoEm)}` : ''
        return <Text color={VERDE}>{p.tipo === 'criado' ? `✓ Apagado${quando}` : `✓ Restaurado${quando}`}</Text>
      }
      return p.tipo === 'criado' ? <Text color={LARANJA}>✚ Criado</Text> : <Text color={AZUL}>✎ Alterado</Text>
    }

    const cartao = (p: PontoRestauracao) => {
      const nome = nomeDoArquivo(p.nome)
      const pasta = p.nome.length > nome.length ? p.nome.slice(0, p.nome.length - nome.length - 1) : ''
      return (
        <Box
          key={`ponto-${p.id}`}
          flexDirection="column"
          borderStyle="round"
          borderColor={p.restaurado ? CINZA : p.tipo === 'criado' ? LARANJA : AZUL}
          paddingX={1}
        >
          <Box flexDirection="row" justifyContent="space-between" gap={1} flexWrap="wrap">
            <Text bold wrap="truncate-end">{`📄 ${nome}`}</Text>
            {etiqueta(p)}
          </Box>
          {pasta ? <Text dimColor wrap="truncate-start">{`em ${pasta}`}</Text> : null}
          <Text color={CINZA}>{`${hora(p.quando)} · ${haQuanto(p.quando, agora)}`}</Text>
          {p.tipo === 'criado' && !p.restaurado && pedindo === p.id ? (
            <Text color={VERMELHO} wrap="wrap">O arquivo vai ser apagado. Tem certeza?</Text>
          ) : null}
          {botoes(p)}
        </Box>
      )
    }

    let todos = null
    if (alvos.length > 0) {
      const n = alvos.length
      const resumo = `${n} ${n === 1 ? 'arquivo' : 'arquivos'}${
        criadosNoTodos > 0 ? ` (apaga ${criadosNoTodos} ${criadosNoTodos === 1 ? 'criado' : 'criados'})` : ''
      }`
      todos =
        pedindo === 'todos' ? (
          <Box flexDirection="column" borderStyle="round" borderColor={LARANJA} paddingX={1}>
            <Text bold wrap="wrap">{`Desfazer a última resposta inteira: ${resumo}?`}</Text>
            <Box flexDirection="row" gap={2} flexWrap="wrap">
              <Button key="todos-confirmar" label="Confirmar" variant="primary" onPress={() => restaurarTodos($)} />
              <Button key="todos-cancelar" label="Cancelar" onPress={() => update($, confirmar, () => '')} />
            </Box>
          </Box>
        ) : (
          <Box flexDirection="column">
            <Button
              key="todos"
              label="↩ Restaurar todos desta resposta"
              variant="primary"
              onPress={() => update($, confirmar, () => 'todos')}
            />
            <Text dimColor>{`Desfaz a última resposta: ${resumo}`}</Text>
          </Box>
        )
    }

    return (
      <Box flexDirection="column" gap={1} paddingX={1}>
        <Box flexDirection="column">
          <Text bold color={AZUL}>📌 Pontos de restauração</Text>
          <Text dimColor wrap="wrap">
            {`Antes de o Claude mexer num arquivo, uma cópia fica guardada na pasta ${PASTA} do projeto (as últimas ${MAXIMO}).`}
          </Text>
        </Box>

        {lista.length === 0 ? (
          <Text dimColor wrap="wrap">
            Nenhuma alteração ainda. Quando o Claude criar ou mudar um arquivo, ela aparece aqui.
          </Text>
        ) : null}

        {todos}

        {grupos.map((g, i) => (
          <Box key={`grupo-${i}`} flexDirection="column" gap={1}>
            <Text bold color={CINZA}>
              {`${i === 0 ? 'Última resposta' : 'Resposta'} · ${hora(g.itens[g.itens.length - 1]?.quando ?? 0)}`}
            </Text>
            {g.itens.map(cartao)}
          </Box>
        ))}
      </Box>
    )
  })
}
