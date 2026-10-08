import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { ModInfo } from '../types'

const PANE = 'gerenciador-mods'
const SELF = 'gerenciador-mods'

// Desligados só nesta conversa: o mod é recusado quando (re)carrega.
const off = atom({ plugin: 'gerenciador-mods', key: 'off' } as const, [])
const mods = atom({ plugin: 'gerenciador-mods', key: 'mods' } as const, [])
// Mods carregados nesta conversa (por nome). Fica no estado da conversa, que sobrevive às recargas do gerenciador.
const carregados = atom({ plugin: 'gerenciador-mods', key: 'carregados' } as const, [])
// Lista completa de mods que o Claude Code montou ao abrir a conversa (engine.create), independente da ordem.
let montadosNaCarga: string[] = []
// Ordem real em que o Claude Code carregou os mods ao abrir a conversa.
const ordem = atom({ plugin: 'gerenciador-mods', key: 'ordem' } as const, [])

const SEP = String.fromCharCode(92)

function norm(p: string) {
  let out = p.split('/').join(SEP).toLowerCase()
  while (out.endsWith(SEP)) out = out.slice(0, -1)
  return out
}

async function home($: EngineInterface) {
  return (await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME')) ?? ''
}

// Mods globais: pastas de CLAUDE_CODE_PLUGIN_DIRS. Como o Claude Code, vale primeiro o ambiente
// com que a conversa foi aberta; sem ele, o que está no settings.json do usuário.
async function globalDirs($: EngineInterface): Promise<string[]> {
  let raw = (await $.env.get('CLAUDE_CODE_PLUGIN_DIRS')) ?? ''
  if (!raw.trim()) {
    const settings = await $.settings.read({ source: 'user' })
    raw = (settings.env as Record<string, string> | undefined)?.CLAUDE_CODE_PLUGIN_DIRS ?? ''
  }
  return raw.split(';').map(s => s.trim()).filter(Boolean)
}

async function readMod($: EngineInterface, root: string, globals: Set<string>, conhecidos: Set<string>): Promise<ModInfo | null> {
  try {
    const manifest = JSON.parse(String(await $.fs.read(`${root}${SEP}.claude-plugin${SEP}plugin.json`)))
    return {
      name: manifest.name,
      description: manifest.description ?? '',
      root,
      isGlobal: globals.has(norm(root)),
      carregado: manifest.name === SELF || conhecidos.has(manifest.name) || raizesVistas.has(manifest.name),
    }
  } catch {
    return null
  }
}

// Quando cada mod se registrou pela última vez (ms) e de qual pasta veio.
const registros = new Map<string, number>()
const raizesVistas = new Map<string, string>()

// Onde a última busca procurou e o que deu errado, para o painel explicar quando não acha nada.
let diagnostico = ''

function semOrigem(id: string) {
  const i = id.lastIndexOf('@')
  return i > 0 ? id.slice(0, i) : id
}

function parent(path: string) {
  const parts = path.split('/').join(SEP).split(SEP)
  parts.pop()
  return parts.join(SEP)
}

async function scan($: EngineInterface): Promise<ModInfo[]> {
  // Só nos testes automáticos: a lista vem pronta de uma variável de ambiente.
  const teste = await $.env.get('GERENCIADOR_MODS_TESTE')
  if (teste) return JSON.parse(teste) as ModInfo[]
  const notas: string[] = []
  let globals: string[] = []
  try {
    globals = await globalDirs($)
  } catch (err) {
    notas.push(`settings: ${String(err)}`)
  }
  const globalSet = new Set(globals.map(norm))

  // Os mods só desta conversa ficam na pasta de mods da sessão; os globais vêm do settings.json.
  const raiz = norm($.plugin.root).includes(`${SEP}dev-mods${SEP}`) ? parent($.plugin.root) : ''
  const casa = await home($)
  const sessionDir = casa ? `${casa}${SEP}.claude${SEP}dev-mods${SEP}${await $.session.id()}` : raiz
  const roots = new Map<string, string>()
  try {
    const entries = await $.fs.list(sessionDir)
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      const root = `${sessionDir}${SEP}${entry.name}`
      roots.set(norm(root), root)
    }
    notas.push(`${sessionDir}: ${entries.length} itens`)
  } catch (err) {
    notas.push(`${sessionDir}: ${String(err)}`)
  }
  const biblioteca = casa ? `${casa}${SEP}.claude${SEP}mods-pacote` : ''
  if (biblioteca) {
    try {
      for (const entry of await $.fs.list(biblioteca)) {
        if (entry.kind !== 'dir' || entry.name.startsWith('.')) continue
        const root = `${biblioteca}${SEP}${entry.name}`
        roots.set(norm(root), root)
      }
    } catch {
      // Sem biblioteca instalada.
    }
  }
  for (const dir of globals) roots.set(norm(dir), dir)
  for (const root of raizesVistas.values()) roots.set(norm(root), root)

  const conhecidos = new Set(await read($, carregados))
  const found: ModInfo[] = []
  for (const root of roots.values()) {
    const mod = await readMod($, root, globalSet, conhecidos)
    if (mod && !found.some(m => m.name === mod.name)) found.push(mod)
  }
  diagnostico = notas.join(' · ')
  return found.sort((a, b) => (a.name === SELF ? -1 : b.name === SELF ? 1 : a.name.localeCompare(b.name)))
}

async function refresh($: EngineInterface) {
  const list = await scan($)
  await update($, mods, () => list)
}

// Mudar o arquivo de código do mod faz o Claude Code recarregá-lo (o hooks.json não basta).
// Alterna uma quebra de linha no fim de cada módulo listado no hooks.json: o código continua o mesmo.
async function reload($: EngineInterface, mod: ModInfo) {
  const hooks = `${mod.root}${SEP}hooks${SEP}hooks.json`
  let modulos: string[] = ['./register.tsx']
  try {
    const lidos = JSON.parse(String(await $.fs.read(hooks))).modules
    if (Array.isArray(lidos) && lidos.length > 0) modulos = lidos.map(String)
  } catch {
    // Sem hooks.json legível, tenta o nome padrão.
  }
  for (const modulo of modulos) {
    const relativo = modulo.split('/').filter(parte => parte !== '.' && parte !== '').join(SEP)
    const arquivo = `${mod.root}${SEP}hooks${SEP}${relativo}`
    const text = String(await $.fs.read(arquivo))
    const novo = text.endsWith('\n') ? text.slice(0, -1) : `${text}\n`
    await $.fs.write(arquivo, novo)
  }
}


// O Claude Code só deixa um mod barrar os que vêm DEPOIS dele na fila. Por isso o gerenciador
// precisa ser o primeiro da lista de mods globais.
function primeiroOGerenciador($: EngineInterface, dirs: string[]) {
  const proprio = norm($.plugin.root)
  const eu = dirs.filter(d => norm(d) === proprio)
  return eu.length > 0 ? [...eu, ...dirs.filter(d => norm(d) !== proprio)] : dirs
}

async function garantirPrimeiro($: EngineInterface) {
  const path = `${await home($)}${SEP}.claude${SEP}settings.json`
  if (!(await $.fs.exists(path))) return
  const settings = JSON.parse(String(await $.fs.read(path)))
  const env = settings.env ?? {}
  const dirs = String(env.CLAUDE_CODE_PLUGIN_DIRS ?? '').split(';').map((d: string) => d.trim()).filter(Boolean)
  const ordenado = primeiroOGerenciador($, dirs)
  if (dirs.length === 0 || ordenado.join(';') === dirs.join(';')) return
  env.CLAUDE_CODE_PLUGIN_DIRS = ordenado.join(';')
  settings.env = env
  await $.fs.write(path, JSON.stringify(settings, null, 2) + String.fromCharCode(10))
}

async function veioAntes($: EngineInterface, nome: string) {
  const fila = await read($, ordem)
  const i = fila.indexOf(nome)
  const g = fila.indexOf(SELF)
  return i >= 0 && g >= 0 && i < g
}

async function setConversation($: EngineInterface, mod: ModInfo, ligar: boolean): Promise<string> {
  if (mod.carregado && (await veioAntes($, mod.name))) {
    return `${nomeBonito(mod.name)} carregou antes do gerenciador nesta conversa, então não dá para desligar aqui. Abra uma conversa nova: nela vai funcionar.`
  }
  if (!mod.carregado) {
    return `${nomeBonito(mod.name)} não está ativo nesta conversa. Use "Em todas as conversas" para ativar a partir da próxima conversa.`
  }
  const atual = (await read($, off)).includes(mod.name)
  if (atual === !ligar) return `${nomeBonito(mod.name)} já está ${ligar ? 'ligado' : 'desligado'} nesta conversa.`
  await update($, off, names => (ligar ? names.filter(n => n !== mod.name) : [...names.filter(n => n !== mod.name), mod.name]))
  const antes = await $.clock.now()
  try {
    await reload($, mod)
  } catch (err) {
    const msg = `Não consegui recarregar ${nomeBonito(mod.name)}: ${String(err)}`
    $.ui.toast(msg)
    return msg
  }
  $.ui.toast(`${nomeBonito(mod.name)}: ${ligar ? 'ligando' : 'desligando'} nesta conversa…`)
  $.clock.after(5000, () => {
    if ((registros.get(mod.name) ?? 0) < antes) {
      $.ui.toast(`${nomeBonito(mod.name)} ainda não recarregou. Isso acontece quando o Claude está respondendo: espere ele terminar.`)
    }
  })
  return `${nomeBonito(mod.name)} ${ligar ? 'ligado' : 'desligado'} nesta conversa.`
}

async function toggleConversation($: EngineInterface, mod: ModInfo) {
  const isOff = (await read($, off)).includes(mod.name)
  const msg = await setConversation($, mod, isOff)
  if (msg.includes('Abra uma conversa nova') || msg.includes('não está ativo')) $.ui.toast(msg)
}

async function setGlobal($: EngineInterface, mod: ModInfo, ativar: boolean): Promise<string> {
  if (mod.isGlobal === ativar) return `${nomeBonito(mod.name)} já está ${ativar ? 'em' : 'fora de'} todas as conversas.`
  const path = `${await home($)}${SEP}.claude${SEP}settings.json`
  let settings: Record<string, any> = {}
  if (await $.fs.exists(path)) {
    try {
      settings = JSON.parse(String(await $.fs.read(path)))
    } catch {
      const msg = 'Não consegui ler o settings.json. Nada foi alterado.'
      $.ui.toast(msg)
      return msg
    }
  }
  const env: Record<string, string> = { ...(settings.env ?? {}) }
  const dirs = (env.CLAUDE_CODE_PLUGIN_DIRS ?? '').split(';').map(s => s.trim()).filter(Boolean)
  const rest = dirs.filter(d => norm(d) !== norm(mod.root))
  const lista = primeiroOGerenciador($, ativar ? [...rest, mod.root] : rest)
  if (lista.length > 0) {
    env.CLAUDE_CODE_PLUGIN_DIRS = lista.join(';')
    // No app desktop, sem isto o Claude Code não percebe quando um mod muda.
    env.CLAUDE_CODE_PLUGIN_DIR_WATCH = '1'
  } else {
    delete env.CLAUDE_CODE_PLUGIN_DIRS
  }
  settings.env = env
  try {
    await $.fs.write(path, JSON.stringify(settings, null, 2) + String.fromCharCode(10))
  } catch {
    const msg = 'Não consegui salvar o settings.json. Nada foi alterado.'
    $.ui.toast(msg)
    return msg
  }
  await refresh($)
  // Desativar em todas também desliga nesta; ativar em todas também liga nesta.
  if (mod.name !== SELF) await setConversation($, mod, ativar)
  const msg = ativar
    ? `${nomeBonito(mod.name)} vai estar em todas as conversas novas.`
    : `${nomeBonito(mod.name)} saiu de todas as conversas.`
  $.ui.toast(msg)
  return msg
}

async function toggleGlobal($: EngineInterface, mod: ModInfo) {
  await setGlobal($, mod, !mod.isGlobal)
}

const VERDE = '#4cc176'
const AZUL = '#0A84FF'
const CINZA = '#8a948b'

const NOMES: Record<string, string> = {
  'gerenciador-mods': 'Gerenciador de Mods',
  'barra-uso': 'Barra de Uso',
}

function nomeBonito(name: string) {
  if (NOMES[name]) return NOMES[name]
  const texto = name.split('-').join(' ')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

async function comando($: EngineInterface, args: string) {
  const [acao = '', ...resto] = args.trim().split(' ').filter(Boolean)
  const alvo = resto.join(' ').toLowerCase()
  await refresh($)
  if (acao === 'ligar-todas' || acao === 'desligar-todas') {
    const lista = await read($, mods)
    const mod = lista.find(m => m.name.toLowerCase() === alvo || nomeBonito(m.name).toLowerCase() === alvo)
    if (!mod) return { text: `Não encontrei o mod "${alvo}". Digite /mods lista para ver os nomes.` }
    return { text: await setGlobal($, mod, acao === 'ligar-todas') }
  }
  if (acao === 'ligar' || acao === 'desligar') {
    const lista = await read($, mods)
    const mod = lista.find(m => m.name.toLowerCase() === alvo || nomeBonito(m.name).toLowerCase() === alvo)
      ?? lista.find(m => alvo !== '' && (m.name.toLowerCase().includes(alvo) || nomeBonito(m.name).toLowerCase().includes(alvo)))
    if (!mod) return { text: `Não encontrei o mod "${alvo}". Digite /mods lista para ver os nomes.` }
    if (mod.name === SELF) return { text: 'O Gerenciador de Mods fica sempre ligado.' }
    return { text: await setConversation($, mod, acao === 'ligar') }
  }
  if (acao === 'lista') {
    const lista = await read($, mods)
    const offList = await read($, off)
    return { text: lista.map(m => `${!m.carregado ? 'inativo' : m.name === SELF || !offList.includes(m.name) ? 'ligado' : 'desligado'}${m.isGlobal ? ' (todas)' : ''} · ${m.name}`).join(String.fromCharCode(10)) }
  }
  await $.ui.open({ id: PANE, title: 'Mods' })
  return { text: 'Painel de mods aberto.' }
}

export const register: Register = on => {
  on('engine.create', async ($, e, next) => {
    // Na carga da conversa vem a lista inteira; numa recarga, só os mods que mudaram.
    montadosNaCarga = e.plugins.map(semOrigem)
    return next(e)
  })

  on('plugin.register', async ($, e, next) => {
    registros.set(e.name, await $.clock.now())
    raizesVistas.set(e.name, e.root)
    await update($, carregados, nomes => (nomes.includes(e.name) ? nomes : [...nomes, e.name]))
    if (e.name !== SELF && (await read($, off)).includes(e.name)) {
      return { refuse: 'desligado nesta conversa pelo gerenciador-mods' }
    }
    return next(e)
  })

  on('session.start', async ($, e, next) => {
    if (montadosNaCarga.length > 0) {
      const lista = montadosNaCarga
      await update($, carregados, nomes => [...new Set([...nomes, ...lista])])
      // Só a carga da conversa traz a fila inteira; numa recarga vem um mod só.
      if (lista.length > 1) await update($, ordem, () => lista)
    }
    try {
      await garantirPrimeiro($)
    } catch {
      // Sem settings legível: nada a ajustar.
    }
    await $.command.register({ name: 'mods', description: 'Abre o painel de mods' })
    await $.command.register({ name: 'gerenciar-mods', description: 'Abre o painel de mods' })
    try {
      await refresh($)
    } catch {
      // A faixa aparece na próxima atualização.
    }
    return next(e)
  })

  on('command.run', { command: 'mods' }, ($, e) => comando($, e.args))
  on('command.run', { command: 'gerenciar-mods' }, ($, e) => comando($, e.args))

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const list = await read($, mods)
    const offList = await read($, off)
    const ligados = list.filter(m => m.name === SELF || (m.carregado && !offList.includes(m.name))).length
    const globais = list.filter(m => m.isGlobal).length

    // Cada linha: o rótulo e um único botão que é o próprio interruptor.
    const linha = (chave: string, rotulo: string, ligado: boolean, fixo: boolean, aoClicar: () => void) => (
      <Box key={chave} flexDirection="row" alignItems="center" justifyContent="space-between" gap={2}>
        <Text color={ligado ? undefined : CINZA}>{rotulo}</Text>
        {fixo ? (
          <Text color={VERDE}>● Sempre ligado</Text>
        ) : (
          <Button key={`${chave}-botao`} label={ligado ? '● Ligado' : '○ Desligado'} variant={ligado ? 'primary' : 'secondary'} onPress={aoClicar} />
        )}
      </Box>
    )

    return (
      <Box flexDirection="column" gap={1} paddingX={1} paddingY={1}>
        <Box flexDirection="column">
          <Text bold>Seus mods</Text>
          <Text color={CINZA}>{`${list.length} mods · ${ligados} ligados nesta conversa · ${globais} em todas as conversas`}</Text>
        </Box>

        {list.length === 0 && <Text dimColor>{`Nenhum mod encontrado. Procurei em: ${diagnostico}`}</Text>}

        {list.map(mod => {
          const isSelf = mod.name === SELF
          const isOn = isSelf || (mod.carregado && !offList.includes(mod.name))
          return (
            <Box key={`mod-${mod.name}`} flexDirection="column" gap={1} borderStyle="round" borderColor={isOn ? VERDE : CINZA} paddingX={2} paddingY={1}>
              <Box flexDirection="column">
                <Text bold>{nomeBonito(mod.name)}</Text>
                {mod.description ? <Text dimColor>{mod.description}</Text> : null}
              </Box>
              {mod.carregado ? (
                linha(`conversa-${mod.name}`, 'Nesta conversa', isOn, isSelf, () => toggleConversation($, mod))
              ) : (
                <Box key={`conversa-${mod.name}`} flexDirection="row" justifyContent="space-between" gap={2}>
                  <Text color={CINZA}>Nesta conversa</Text>
                  <Text color={CINZA}>Inativo</Text>
                </Box>
              )}
              {linha(`global-${mod.name}`, 'Em todas as conversas', mod.isGlobal, false, () => toggleGlobal($, mod))}
            </Box>
          )
        })}

        <Text dimColor>Clique no botão para ligar ou desligar. "Nesta conversa" vale na hora; "Em todas as conversas", a partir da próxima conversa.</Text>
        <Button key="atualizar" label="Atualizar lista" plain onPress={() => refresh($)} />
      </Box>
    )
  })
}
