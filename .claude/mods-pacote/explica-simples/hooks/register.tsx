import { atom, read, update } from 'claude-code'
import type { EngineInterface, ModelCompleteRequest, ModelCompleteResult, Register, SessionMessage } from 'claude-code'

import type { ExplicaSimplesPainel } from '../types'

// Explica Simples: /simples pega a última resposta do Claude e mostra, num painel
// ao lado, a mesma ideia em palavras simples (ou como um diagrama de passos).

type Motor = EngineInterface
type Modo = ExplicaSimplesPainel['modo']

const PAINEL = 'explica-simples'
const TITULO = 'Em palavras simples'
const PENSANDO = 'Traduzindo para palavras simples…'
const SEM_RESPOSTA = 'Ainda não tem resposta para explicar.'

const NL = String.fromCharCode(10)
const MODELO_RAPIDO = 'haiku'
const LIMITE_FONTE = 12000
const LIMITE_MARKDOWN = 9500

const AZUL = '#6aa6ff'
const LARANJA = '#f0a35e'
const CINZA = '#8a948b'
const FONTE_SVG = 'Segoe UI, Inter, system-ui, -apple-system, sans-serif'

const VAZIO: ExplicaSimplesPainel = {
  fase: 'sem-resposta',
  modo: 'texto',
  fonte: '',
  texto: '',
  titulo: '',
  passos: [],
  analogia: '',
  erro: '',
}

const painel = atom({ plugin: 'explica-simples', key: 'painel' } as const, VAZIO)

/** Troca o que o painel mostra (o que não for dito volta ao vazio). */
function salvar($: Motor, parte: Partial<ExplicaSimplesPainel>) {
  const novo: ExplicaSimplesPainel = { ...VAZIO, ...parte }
  return update($, painel, () => novo)
}

// Cada pedido ganha um número; só o mais recente pode escrever no painel.
let rodada = 0

// ---------- a última resposta ----------

/** Junta os textos da última resposta do Claude (todas as partes do último turno). */
export function ultimaResposta(msgs: readonly SessionMessage[]): string {
  let i = msgs.length - 1
  while (i >= 0) {
    const m = msgs[i]
    if (m !== undefined && m.role === 'assistant' && m.text.trim() !== '') break
    i--
  }
  if (i < 0) return ''

  const partes: string[] = []
  for (let j = i; j >= 0; j--) {
    const m = msgs[j]
    if (m === undefined) continue
    if (m.role === 'assistant') {
      if (m.text.trim() !== '') partes.unshift(m.text.trim())
      continue
    }
    // Resultado de ferramenta faz parte do mesmo turno; uma mensagem da pessoa encerra.
    if (m.toolResults !== undefined && m.toolResults.length > 0) continue
    break
  }
  return partes.join(NL + NL)
}

// ---------- pedidos ao modelo ----------

const SISTEMA =
  'Você é um professor paciente que explica assuntos técnicos para quem nunca programou. ' +
  'Escreva sempre em português do Brasil, com carinho e sem enrolação.'

function pedidoTexto(fonte: string) {
  return [
    'Reescreva a resposta abaixo para um iniciante total.',
    '',
    'Regras:',
    '- Frases curtas e diretas.',
    '- Sem termos técnicos. Se um termo for indispensável, explique logo depois entre parênteses, em poucas palavras.',
    '- Inclua uma analogia com uma situação do dia a dia (cozinha, mercado, correio, restaurante, casa, trânsito). Nunca use analogias de jogos ou videogames.',
    '- Mantenha só as ideias principais; deixe de fora detalhes que não ajudam o iniciante.',
    '- Use Markdown simples: parágrafos curtos, no máximo uma lista curta e negrito nas ideias-chave. Sem títulos, tabelas ou blocos de código.',
    '- No máximo umas 200 palavras.',
    '- Responda só com a explicação, sem frases como "Claro!" ou "Aqui está".',
    '',
    'Resposta original:',
    '<<<',
    fonte,
    '>>>',
  ].join(NL)
}

function pedidoDiagrama(fonte: string) {
  return [
    'Transforme a resposta abaixo num diagrama simples de passos para um iniciante total.',
    '',
    'Responda EXATAMENTE neste formato, uma coisa por linha, sem mais nada:',
    'TITULO: (até 6 palavras)',
    'PASSO: (até 9 palavras)',
    'PASSO: (até 9 palavras)',
    '(de 3 a 6 linhas PASSO, na ordem em que as coisas acontecem)',
    'ANALOGIA: (uma frase comparando com uma situação do dia a dia; nunca de jogos ou videogames)',
    '',
    'Regras: português do Brasil, palavras simples, sem termos técnicos (ou com o termo explicado entre parênteses).',
    '',
    'Resposta original:',
    '<<<',
    fonte,
    '>>>',
  ].join(NL)
}

function tirarRotulo(linha: string, rotulos: string[]): string | undefined {
  const sem = linha.trim()
  const maiuscula = sem.toUpperCase()
  for (const r of rotulos) {
    if (maiuscula.startsWith(r)) {
      let resto = sem.slice(r.length).trim()
      while (resto.startsWith(':') || resto.startsWith('-')) resto = resto.slice(1).trim()
      return resto
    }
  }
  return undefined
}

function limparMarcador(linha: string) {
  let s = linha.trim()
  while (s.length > 0 && '-*•0123456789.)'.includes(s.charAt(0))) s = s.slice(1)
  return s.split('**').join('').trim()
}

/** Lê a resposta do modelo no formato TITULO / PASSO / ANALOGIA. */
export function lerDiagrama(texto: string) {
  let titulo = ''
  let analogia = ''
  const passos: string[] = []
  for (const linha of texto.split(NL)) {
    if (linha.trim() === '') continue
    const t = tirarRotulo(linha, ['TITULO', 'TÍTULO'])
    if (t !== undefined) {
      titulo = t
      continue
    }
    const a = tirarRotulo(linha, ['ANALOGIA'])
    if (a !== undefined) {
      analogia = a
      continue
    }
    const p = tirarRotulo(linha, ['PASSO'])
    if (p !== undefined) {
      if (p !== '') passos.push(limparMarcador(p))
      continue
    }
    const s = linha.trim()
    if (s.startsWith('-') || s.startsWith('*') || '123456789'.includes(s.charAt(0))) {
      const limpo = limparMarcador(s)
      if (limpo !== '') passos.push(limpo)
    }
  }
  return { titulo, passos: passos.slice(0, 8), analogia }
}

function mensagemDeErro(r: ModelCompleteResult): string {
  if (r.isAnswered) return ''
  if (r.reason === 'aborted') return 'Demorou demais e eu parei. Tente de novo daqui a pouco.'
  if (r.reason === 'empty-reply') return 'O Claude não devolveu nenhum texto. Tente de novo.'
  if (r.reason === 'api-error') {
    if (r.error === 'rate_limit' || r.error === 'overloaded') {
      return 'O Claude está muito ocupado agora. Espere um minutinho e tente de novo.'
    }
  }
  return 'Não consegui falar com o Claude agora. Confira sua internet e tente de novo.'
}

async function perguntar($: Motor, pedido: Omit<ModelCompleteRequest, 'model'>): Promise<ModelCompleteResult> {
  let r: ModelCompleteResult | undefined
  try {
    r = await $.model.complete({ model: MODELO_RAPIDO, ...pedido })
  } catch {
    r = undefined // modelo rápido bloqueado: usa o da conversa
  }
  const modeloRuim =
    r !== undefined && !r.isAnswered && r.reason === 'api-error' && (r.error === 'model_not_found' || r.error === 'invalid_request')
  if (r === undefined || modeloRuim) {
    const daConversa = await $.session.model()
    r = await $.model.complete({ model: daConversa, ...pedido })
  }
  return r
}

/** Pede a explicação ao modelo e guarda no painel. */
async function gerar($: Motor, fonte: string, modo: Modo) {
  const minha = ++rodada
  await salvar($, { fase: 'pensando', modo, fonte })

  let r: ModelCompleteResult
  try {
    r = await perguntar($, {
      system: SISTEMA,
      prompt: modo === 'diagrama' ? pedidoDiagrama(fonte) : pedidoTexto(fonte),
      maxTokens: modo === 'diagrama' ? 600 : 1200,
      timeoutMs: 90_000,
    })
  } catch {
    if (minha === rodada) {
      await salvar($, { fase: 'erro', modo, fonte, erro: 'Não consegui falar com o Claude agora. Tente de novo.' })
    }
    return
  }
  if (minha !== rodada) return

  if (!r.isAnswered) {
    await salvar($, { fase: 'erro', modo, fonte, erro: mensagemDeErro(r) })
    return
  }

  if (modo === 'texto') {
    await salvar($, { fase: 'pronto', modo, fonte, texto: r.text.trim() })
    return
  }

  const d = lerDiagrama(r.text)
  if (d.passos.length < 2) {
    await salvar($, {
      fase: 'erro',
      modo,
      fonte,
      erro: 'Não consegui montar o diagrama desta vez. Tente de novo ou veja em texto.',
    })
    return
  }
  await salvar($, { fase: 'pronto', modo, fonte, ...d })
}

// ---------- o que vai para a área de transferência ----------

function passosComSetas(p: ExplicaSimplesPainel) {
  const linhas = p.passos.map((passo, i) => (i === 0 ? `${i + 1}. ${passo}` : `→ ${i + 1}. ${passo}`))
  const partes = [p.titulo, ...linhas]
  if (p.analogia) partes.push('', `Comparação: ${p.analogia}`)
  return partes.filter((x, i) => i > 0 || x !== '').join(NL)
}

/** O diagrama como código Mermaid (para colar em quem desenha Mermaid). */
export function mermaid(passos: readonly string[]) {
  const linhas = ['flowchart TD']
  passos.forEach((passo, i) => {
    const rotulo = passo.split('"').join("'")
    linhas.push(`  P${i + 1}["${i + 1}. ${rotulo}"]`)
  })
  for (let i = 1; i < passos.length; i++) linhas.push(`  P${i} --> P${i + 1}`)
  return linhas.join(NL)
}

function textoParaCopiar(p: ExplicaSimplesPainel) {
  return p.modo === 'diagrama' ? passosComSetas(p) : p.texto
}

// ---------- desenho do diagrama (desktop) ----------

function xml(texto: string) {
  return texto.split('&').join('&amp;').split('<').join('&lt;').split('>').join('&gt;').split('"').join('&quot;')
}

function quebrar(texto: string, largura: number): string[] {
  const linhas: string[] = []
  let atual = ''
  for (const palavra of texto.split(' ')) {
    if (palavra === '') continue
    const junto = atual === '' ? palavra : `${atual} ${palavra}`
    if (junto.length > largura && atual !== '') {
      linhas.push(atual)
      atual = palavra
    } else {
      atual = junto
    }
  }
  if (atual !== '') linhas.push(atual)
  return linhas.length > 0 ? linhas : ['']
}

export function diagramaSvg(passos: readonly string[]) {
  const W = 420
  const caixaX = 20
  const caixaL = W - 40
  const linhaA = 19
  const seta = 30
  let y = 10
  let corpo = ''

  passos.forEach((passo, i) => {
    const linhas = quebrar(passo, 34)
    const h = Math.max(52, 22 + linhas.length * linhaA)
    corpo +=
      `<rect x="${caixaX}" y="${y}" width="${caixaL}" height="${h}" rx="14" fill="#3466d6" stroke="#6aa6ff" stroke-width="1.5"/>` +
      `<circle cx="${caixaX + 28}" cy="${y + h / 2}" r="14" fill="#ffffff"/>` +
      `<text x="${caixaX + 28}" y="${y + h / 2 + 5}" text-anchor="middle" font-family="${FONTE_SVG}" font-size="14" font-weight="700" fill="#3466d6">${i + 1}</text>`
    const topo = y + h / 2 - ((linhas.length - 1) * linhaA) / 2 + 5
    linhas.forEach((l, k) => {
      corpo += `<text x="${caixaX + 54}" y="${topo + k * linhaA}" font-family="${FONTE_SVG}" font-size="15" fill="#ffffff">${xml(l)}</text>`
    })
    y += h
    if (i < passos.length - 1) {
      const cx = W / 2
      corpo +=
        `<line x1="${cx}" y1="${y + 4}" x2="${cx}" y2="${y + seta - 8}" stroke="#8a94a6" stroke-width="2.5" stroke-linecap="round"/>` +
        `<path d="M${cx - 7} ${y + seta - 12} L${cx} ${y + seta - 3} L${cx + 7} ${y + seta - 12}" fill="none" stroke="#8a94a6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`
      y += seta
    }
  })
  const H = y + 10
  const source = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${corpo}</svg>`
  return { source, W, H }
}

// ---------- registro ----------

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'simples',
      description: 'Explica a última resposta em palavras simples (use "/simples diagrama" para ver em passos)',
      argumentHint: '[diagrama]',
    })
    return next(e)
  })

  on('command.run', { command: 'simples' }, async ($, e) => {
    const modo: Modo = String(e.args ?? '').toLowerCase().includes('diagrama') ? 'diagrama' : 'texto'
    const msgs = await $.session.messages()
    const fonte = Array.isArray(msgs) ? ultimaResposta(msgs).slice(0, LIMITE_FONTE) : ''

    if (fonte === '') {
      rodada++
      await salvar($, { fase: 'sem-resposta', modo })
      const aberto = await $.ui.open({ id: PAINEL, title: TITULO })
      return aberto.isPlaced ? {} : { text: `${SEM_RESPOSTA} Faça uma pergunta ao Claude e depois digite /simples.` }
    }

    await salvar($, { fase: 'pensando', modo, fonte })
    const aberto = await $.ui.open({ id: PAINEL, title: TITULO })
    await gerar($, fonte, modo)
    if (aberto.isPlaced) return {}

    // Onde o painel não aparece, o resultado vai na própria conversa.
    const p = await read($, painel)
    if (p.fase === 'erro') return { text: `😕 ${p.erro}` }
    return { text: `${TITULO}:${NL}${NL}${p.modo === 'diagrama' ? passosComSetas(p) : p.texto}` }
  })

  on('ui.render', { component: 'Pane', requestId: PAINEL }, async ($, e) => {
    const ui = $.ui.resolve(e)
    const { Box, Text, Button, Markdown } = ui
    const p = await read($, painel)
    const pronto = p.fase === 'pronto'

    let conteudo
    if (p.fase === 'pensando') {
      conteudo = (
        <Box key="pensando" flexDirection="column" gap={1}>
          <Text color={AZUL}>{`⏳ ${PENSANDO}`}</Text>
          <Text dimColor>Isso leva só alguns segundos.</Text>
        </Box>
      )
    } else if (p.fase === 'sem-resposta') {
      conteudo = (
        <Box key="vazio" flexDirection="column" gap={1}>
          <Text>{`🤔 ${SEM_RESPOSTA}`}</Text>
          <Text dimColor>Faça uma pergunta ao Claude e, quando ele responder, digite /simples.</Text>
        </Box>
      )
    } else if (p.fase === 'erro') {
      conteudo = (
        <Box key="erro" flexDirection="column" gap={1}>
          <Text color={LARANJA}>{`😕 ${p.erro}`}</Text>
          <Box flexDirection="row">
            <Button key="tentar" label="Tentar de novo" variant="primary" onPress={() => gerar($, p.fonte, p.modo)} />
          </Box>
        </Box>
      )
    } else if (p.modo === 'texto') {
      conteudo = (
        <Box key="texto" flexDirection="column" borderStyle="round" borderColor={AZUL} paddingX={2} paddingY={1}>
          <Markdown key="explicacao" text={p.texto.slice(0, LIMITE_MARKDOWN)} />
        </Box>
      )
    } else {
      const desenho = diagramaSvg(p.passos)
      const largura = Math.min(desenho.W, Math.max(260, (e.props.bodyColumns || 60) * 7))
      const alt = passosComSetas(p)
      conteudo = (
        <Box key="diagrama" flexDirection="column" gap={1}>
          {p.titulo ? <Text bold>{p.titulo}</Text> : null}
          {e.surface !== 'terminal' && 'Svg' in ui ? (
            <ui.Svg source={desenho.source} alt={alt} width={largura} />
          ) : (
            <Box flexDirection="column">
              {p.passos.map((passo, i) => (
                <Text key={`passo-${i}`}>
                  {i === 0 ? `   ${i + 1}. ${passo}` : ` → ${i + 1}. ${passo}`}
                </Text>
              ))}
            </Box>
          )}
          {p.analogia ? <Text>{`🏠 ${p.analogia}`}</Text> : null}
        </Box>
      )
    }

    const outroModo: Modo = p.modo === 'texto' ? 'diagrama' : 'texto'
    return (
      <Box flexDirection="column" gap={1} paddingX={1} paddingY={1}>
        <Box flexDirection="column">
          <Text bold>{`💡 ${TITULO}`}</Text>
          <Text color={CINZA}>
            {p.modo === 'diagrama' ? 'A última resposta, em passos' : 'A última resposta, sem complicação'}
          </Text>
        </Box>
        {conteudo}
        {pronto || (p.fase === 'erro' && p.fonte !== '') ? (
          <Box flexDirection="row" gap={2} flexWrap="wrap">
            {pronto ? (
              <Button
                key="copiar"
                label="Copiar"
                variant="primary"
                onPress={async press => {
                  const r = await $.ui.copy({ text: textoParaCopiar(p), surface: press.surface })
                  $.ui.toast(r.isCopied ? '📋 Copiado! É só colar onde quiser.' : '⚠️ Não consegui copiar. Selecione o texto com o mouse.')
                }}
              />
            ) : null}
            {pronto && p.modo === 'diagrama' ? (
              <Button
                key="mermaid"
                label="Copiar como Mermaid"
                onPress={async press => {
                  const r = await $.ui.copy({ text: mermaid(p.passos), surface: press.surface })
                  $.ui.toast(r.isCopied ? '📋 Código do diagrama copiado!' : '⚠️ Não consegui copiar.')
                }}
              />
            ) : null}
            <Button
              key="trocar"
              label={outroModo === 'diagrama' ? 'Ver como diagrama' : 'Ver em texto'}
              onPress={() => gerar($, p.fonte, outroModo)}
            />
          </Box>
        ) : null}
      </Box>
    )
  })
}
