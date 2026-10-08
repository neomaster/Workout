import type { EngineInterface, Register } from 'claude-code'

// Guarda-costas: antes de o Claude apagar, mover ou sobrescrever arquivos,
// mostra um aviso e pergunta ao usuário (pelo diálogo de pergunta do próprio
// Claude Code, que aparece em qualquer modo de permissão, até no automático).
// Pastas protegidas com /proteger ficam fora de alcance: tudo que altera algo
// dentro delas é negado direto.

const CHAVE = 'pastas'
const PERMITIR = 'Permitir desta vez'
const BLOQUEAR = 'Bloquear'

const BARRA_INVERTIDA = String.fromCharCode(92)
const TAB = String.fromCharCode(9)
const LF = String.fromCharCode(10)
const CR = String.fromCharCode(13)

const SEPARADORES = new Set([';', '&', '|', '(', ')', '{', '}', '`', LF])
const ESPACOS = new Set([' ', TAB, CR, '<'])

const PREFIXOS = new Set(['sudo', 'doas', 'env', 'nohup', 'time', 'command', 'exec', 'nice', 'builtin', '!'])
const APAGAR = new Set(['rm', 'rmdir', 'del', 'erase', 'rd', 'remove-item', 'ri', 'unlink', 'shred'])
const MOVER = new Set(['mv', 'move', 'move-item', 'mi'])
const CONCHAS = new Set(['bash', 'sh', 'zsh', 'dash', 'powershell', 'pwsh', 'cmd'])
const FLAGS_CONCHA = new Set(['-c', '-lc', '-command', '/c', '/k'])
const ESCREVE = new Set([
  'cp', 'copy', 'copy-item', 'cpi', 'xcopy', 'robocopy', 'touch', 'mkdir', 'md',
  'new-item', 'ni', 'set-content', 'sc', 'add-content', 'ac', 'out-file',
  'clear-content', 'clc', 'tee', 'tee-object', 'rename-item', 'ren', 'rni',
  'ln', 'chmod', 'truncate', 'dd', 'rsync', 'tar', 'unzip', 'expand-archive',
])

type Achado = {
  tipo: 'apagar' | 'mover' | 'git-clean' | 'git-reset' | 'sobrescrever'
  alvo: string
}

type Analise = { achados: Achado[]; escreve: boolean; palavras: string[] }

type Token = { texto: string; separador?: true; redireciona?: true }

// ---------- leitura do comando ----------

function tokenizar(comando: string): Token[] {
  const tokens: Token[] = []
  let atual = ''
  let temAtual = false
  let aspa = ''
  const fecha = () => {
    if (temAtual) tokens.push({ texto: atual })
    atual = ''
    temAtual = false
  }
  for (const ch of comando) {
    if (aspa !== '') {
      if (ch === aspa) aspa = ''
      else atual += ch
      continue
    }
    if (ch === '"' || ch === "'") {
      aspa = ch
      temAtual = true
      continue
    }
    if (ESPACOS.has(ch)) {
      fecha()
      continue
    }
    if (SEPARADORES.has(ch)) {
      fecha()
      tokens.push({ texto: ';', separador: true })
      continue
    }
    if (ch === '>') {
      fecha()
      if (tokens[tokens.length - 1]?.redireciona !== true) tokens.push({ texto: '>', redireciona: true })
      continue
    }
    atual += ch
    temAtual = true
  }
  fecha()
  return tokens
}

function ehFlag(palavra: string): boolean {
  return palavra.startsWith('-') || (palavra.length === 2 && palavra[0] === '/')
}

function nomeDoComando(palavra: string): string {
  const partes = palavra.split(BARRA_INVERTIDA).join('/').split('/')
  const nome = (partes[partes.length - 1] ?? '').toLowerCase()
  return nome.endsWith('.exe') ? nome.slice(0, -4) : nome
}

export function analisar(comando: string, profundidade = 0): Analise {
  const res: Analise = { achados: [], escreve: false, palavras: [] }
  const segmentos: Token[][] = [[]]
  for (const t of tokenizar(comando)) {
    if (t.separador) segmentos.push([])
    else segmentos[segmentos.length - 1]?.push(t)
  }

  for (const seg of segmentos) {
    if (seg.some(t => t.redireciona)) res.escreve = true
    const palavras = seg.filter(t => !t.redireciona).map(t => t.texto)
    res.palavras.push(...palavras)

    let i = 0
    while (i < palavras.length) {
      const p = (palavras[i] ?? '').toLowerCase()
      if (PREFIXOS.has(p) || (p.includes('=') && !p.startsWith('-'))) {
        i++
        continue
      }
      if (p === 'xargs') {
        i++
        while (i < palavras.length && (palavras[i] ?? '').startsWith('-')) i++
        continue
      }
      break
    }
    if (i >= palavras.length) continue

    const verbo = nomeDoComando(palavras[i] ?? '')
    const resto = palavras.slice(i + 1)
    const alvos = resto.filter(p => !ehFlag(p))

    if (APAGAR.has(verbo)) {
      res.achados.push({ tipo: 'apagar', alvo: alvos.join(' ') })
      res.escreve = true
    } else if (MOVER.has(verbo)) {
      res.achados.push({ tipo: 'mover', alvo: alvos.join(' ') })
      res.escreve = true
    } else if (verbo === 'find' && resto.some(p => p.toLowerCase() === '-delete')) {
      res.achados.push({ tipo: 'apagar', alvo: alvos[0] ?? '.' })
      res.escreve = true
    } else if (verbo === 'git') {
      let j = 0
      while (j < resto.length && (resto[j] ?? '').startsWith('-')) {
        const f = resto[j]
        j += f === '-C' || f === '-c' ? 2 : 1
      }
      const sub = (resto[j] ?? '').toLowerCase()
      const depois = resto.slice(j + 1).filter(p => !ehFlag(p))
      if (sub === 'clean') {
        res.achados.push({ tipo: 'git-clean', alvo: '' })
        res.escreve = true
      } else if (sub === 'reset' && resto.some(p => p.toLowerCase() === '--hard')) {
        res.achados.push({ tipo: 'git-reset', alvo: '' })
        res.escreve = true
      } else if (sub === 'rm') {
        res.achados.push({ tipo: 'apagar', alvo: depois.join(' ') })
        res.escreve = true
      } else if (sub === 'mv') {
        res.achados.push({ tipo: 'mover', alvo: depois.join(' ') })
        res.escreve = true
      }
    } else if (CONCHAS.has(verbo) && profundidade < 3) {
      const k = resto.findIndex(p => FLAGS_CONCHA.has(p.toLowerCase()))
      if (k >= 0) {
        const dentroDaConcha = analisar(resto.slice(k + 1).join(' '), profundidade + 1)
        res.achados.push(...dentroDaConcha.achados)
        res.palavras.push(...dentroDaConcha.palavras)
        if (dentroDaConcha.escreve) res.escreve = true
      }
    } else if (ESCREVE.has(verbo) || (verbo === 'sed' && resto.some(p => p.startsWith('-i')))) {
      res.escreve = true
    }
  }
  return res
}

// ---------- caminhos ----------

function ehLetra(c: string | undefined): boolean {
  return c !== undefined && c.toLowerCase() !== c.toUpperCase() && c.length === 1
}

function ehAbsoluto(s: string): boolean {
  return s.startsWith('/') || (s.length >= 2 && s[1] === ':' && ehLetra(s[0]))
}

/** Caminho absoluto com barras normais, `.` e `..` resolvidos (mantém maiúsculas). */
export function normalizar(caminho: string, cwd: string): string {
  let s = caminho.split(BARRA_INVERTIDA).join('/').trim()
  // Forma do Git Bash: /c/Users -> c:/Users
  if (s.length >= 2 && s[0] === '/' && ehLetra(s[1]) && (s.length === 2 || s[2] === '/')) {
    s = `${s[1]}:${s.slice(2)}`
  }
  if (!ehAbsoluto(s)) s = `${normalizar(cwd, '/')}/${s}`
  const saida: string[] = []
  const partes = s.split('/')
  partes.forEach((parte, n) => {
    if (parte === '' && n === 0) saida.push('')
    else if (parte === '' || parte === '.') return
    else if (parte === '..') {
      if (saida.length > 1) saida.pop()
    } else saida.push(parte)
  })
  const junto = saida.join('/')
  return junto === '' ? '/' : junto
}

function dentro(caminho: string, pasta: string): boolean {
  const a = caminho.toLowerCase()
  const b = pasta.toLowerCase()
  return a === b || a.startsWith(b.endsWith('/') ? b : `${b}/`)
}

function exibir(caminho: string, cwd: string): string {
  const abs = normalizar(caminho, cwd)
  const base = normalizar(cwd, '/')
  return dentro(abs, base) && abs.length > base.length ? abs.slice(base.length + 1) : abs
}

function curto(texto: string, max = 70): string {
  const limpo = texto.split(LF).join(' ').trim()
  return limpo.length > max ? `${limpo.slice(0, max - 1)}…` : limpo
}

function descrever(achados: Achado[]): string {
  const a = achados[0]
  if (a === undefined) return 'o Claude quer alterar arquivos'
  const alvo = curto(a.alvo, 60)
  let frase: string
  switch (a.tipo) {
    case 'apagar':
      frase = `o Claude quer apagar ${alvo || 'arquivos'}`
      break
    case 'mover':
      frase = `o Claude quer mover ${alvo || 'arquivos'}`
      break
    case 'git-clean':
      frase = 'o Claude quer apagar os arquivos não rastreados do Git (git clean)'
      break
    case 'git-reset':
      frase = 'o Claude quer descartar suas alterações no Git (git reset --hard)'
      break
    case 'sobrescrever':
      frase = `o Claude quer sobrescrever ${alvo}`
      break
  }
  const mais = achados.length - 1
  return mais > 0 ? `${frase} (e mais ${mais} ${mais === 1 ? 'ação' : 'ações'})` : frase
}

async function pastasProtegidas($: EngineInterface): Promise<string[]> {
  const valor = await $.store.get(CHAVE)
  return Array.isArray(valor) ? valor.filter((v): v is string => typeof v === 'string') : []
}

function tirarAspas(s: string): string {
  const t = s.trim()
  const ini = t[0]
  return t.length >= 2 && (ini === '"' || ini === "'") && t[t.length - 1] === ini ? t.slice(1, -1) : t
}

// ---------- registro ----------

export const register: Register = on => {
  // Chamadas que o usuário liberou no diálogo do guarda-costas: o pedido de
  // permissão normal do Claude Code não pergunta de novo.
  const liberados = new Set<string>()

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'proteger',
      description: 'Guarda-costas: protege uma pasta (sem argumento, lista as protegidas)',
      argumentHint: '[pasta]',
    })
    await $.command.register({
      name: 'desproteger',
      description: 'Guarda-costas: tira uma pasta da lista de protegidas',
      argumentHint: '<pasta>',
    })
    return next(e)
  })

  on('command.run', { command: 'proteger' }, async ($, e) => {
    const pastas = await pastasProtegidas($)
    const pedido = tirarAspas(e.args)
    if (pedido === '') {
      if (pastas.length === 0) {
        return { text: '🛡 Guarda-costas: nenhuma pasta protegida ainda. Use /proteger <pasta>.' }
      }
      return { text: ['🛡 Guarda-costas: pastas protegidas', ...pastas.map(p => `  • ${p}`)].join(LF) }
    }
    const pasta = normalizar(pedido, await $.session.cwd())
    if (pastas.some(p => p.toLowerCase() === pasta.toLowerCase())) {
      return { text: `🛡 Guarda-costas: ${pasta} já estava protegida.` }
    }
    await $.store.set(CHAVE, [...pastas, pasta])
    const existe = await $.fs.stat(pasta).then(
      s => s.kind === 'dir',
      () => false,
    )
    const aviso = existe ? '' : ' (essa pasta ainda não existe, mas já fica protegida)'
    return {
      text:
        `🛡 Guarda-costas: ${pasta} agora está protegida${aviso}. ` +
        `O Claude não pode apagar, mover nem alterar nada dentro dela. Para liberar: /desproteger ${pasta}`,
    }
  })

  on('command.run', { command: 'desproteger' }, async ($, e) => {
    const pastas = await pastasProtegidas($)
    const pedido = tirarAspas(e.args)
    if (pedido === '') return { text: '🛡 Guarda-costas: diga qual pasta, por exemplo /desproteger docs' }
    const pasta = normalizar(pedido, await $.session.cwd())
    const resto = pastas.filter(p => p.toLowerCase() !== pasta.toLowerCase())
    if (resto.length === pastas.length) return { text: `🛡 Guarda-costas: ${pasta} não estava protegida.` }
    await $.store.set(CHAVE, resto)
    return { text: `🛡 Guarda-costas: ${pasta} não está mais protegida.` }
  })

  on('tool.call', async ($, e, next) => {
    const ferramenta = String(e.tool)
    if (!['Bash', 'PowerShell', 'Write', 'Edit', 'NotebookEdit'].includes(ferramenta)) return next(e)

    const cwd = await $.session.cwd()
    const pastas = await pastasProtegidas($)

    const negarProtegida = (pasta: string) => {
      $.ui.toast(`🛡 Guarda-costas: bloqueei uma alteração na pasta protegida ${pasta}`, { timeoutMs: 8000 })
      return {
        deny:
          `Guarda-costas: ${pasta} é uma pasta protegida pelo usuário. Nada dentro dela pode ser ` +
          `apagado, movido ou alterado. Não tente contornar. Se o usuário quiser liberar, ` +
          `ele mesmo roda /desproteger ${pasta}.`,
      }
    }

    const perguntar = async (achados: Achado[], acao: string) => {
      const frase = descrever(achados)
      $.ui.toast(`🛡 Guarda-costas: ${frase}`, { timeoutMs: 10000 })
      let resposta: string | undefined
      try {
        resposta = await $.ui.ask(`🛡 Guarda-costas: ${frase}. (${curto(acao, 140)}) Deixar rodar?`, {
          options: [BLOQUEAR, PERMITIR],
          header: 'Proteção',
        })
      } catch {
        resposta = undefined
      }
      if (resposta === PERMITIR) {
        if (e.tool_use_id !== undefined) liberados.add(e.tool_use_id)
        $.ui.toast('🛡 Guarda-costas: liberado por você')
        return next(e)
      }
      if (resposta === undefined) {
        return {
          deny:
            `Guarda-costas: ${frase} (${curto(acao)}), e essa ação precisa da confirmação do usuário, ` +
            `mas não deu para perguntar (pergunta fechada ou sessão sem tela). Nada foi executado. ` +
            `Para liberar, o usuário pode rodar o comando ele mesmo ou desligar o mod guarda-costas.`,
        }
      }
      $.ui.toast('🛡 Guarda-costas: bloqueado')
      const disse = resposta === BLOQUEAR ? '' : ` O usuário respondeu: "${resposta}".`
      return {
        deny:
          `Guarda-costas: o usuário bloqueou esta ação (${frase}: ${curto(acao)}). Nada foi executado.${disse} ` +
          `Não tente de novo nem contorne o bloqueio; pergunte ao usuário como seguir.`,
      }
    }

    if (e.tool === 'Write' || e.tool === 'Edit' || e.tool === 'NotebookEdit') {
      const caminho = e.tool === 'NotebookEdit' ? e.notebook_path : e.file_path
      const abs = normalizar(caminho, cwd)
      const pasta = pastas.find(p => dentro(abs, p))
      if (pasta !== undefined) return negarProtegida(pasta)
      if (e.tool !== 'Write') return next(e)
      const existe = await $.fs.stat(caminho).then(
        s => s.kind === 'file',
        () => false,
      )
      if (!existe) return next(e)
      const mostrado = exibir(caminho, cwd)
      return perguntar([{ tipo: 'sobrescrever', alvo: mostrado }], `Write em ${mostrado}`)
    }

    if (e.tool === 'Bash' || e.tool === 'PowerShell') {
      const comando = e.command
      const analise = analisar(comando)
      if (pastas.length > 0 && (analise.escreve || analise.achados.length > 0)) {
        const caminhos = analise.palavras.filter(p => !ehFlag(p)).map(p => normalizar(p, cwd))
        const pasta = pastas.find(pr => caminhos.some(c => dentro(c, pr)))
        if (pasta !== undefined) return negarProtegida(pasta)
      }
      if (analise.achados.length > 0) return perguntar(analise.achados, comando)
    }
    return next(e)
  })

  on('tool.check', async ($, e, next) => {
    const veredito = await next(e)
    if (e.tool_use_id !== undefined && liberados.has(e.tool_use_id) && veredito.decision !== 'deny') {
      return { decision: 'allow', reason: 'Liberado pelo usuário no diálogo do guarda-costas' }
    }
    return veredito
  })
}
