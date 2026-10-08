import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, Timer } from 'claude-code'

// Campainha de pronto: pílula "Trabalhando há ..." enquanto o Claude trabalha e,
// quando uma resposta demorada termina, um sininho, um cartão e uma notificação.

const inicio = atom({ plugin: 'campainha-pronto', key: 'inicio' } as const, null)
const agora = atom({ plugin: 'campainha-pronto', key: 'agora' } as const, 0)
const aviso = atom({ plugin: 'campainha-pronto', key: 'aviso' } as const, null)

/** Limite padrão (segundos) se o userConfig não disser outro. */
const LIMITE_PADRAO_S = 20
const SOM = 'sons/campainha.wav'
const FONTE = 'Segoe UI, Inter, system-ui, -apple-system, sans-serif'

type Motor = EngineInterface

/** "12 s", "1 min 20 s", "3 min", "1 h 5 min". */
function duracao(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  if (s < 60) return `${s} s`
  const m = Math.floor(s / 60)
  if (m >= 60) return `${Math.floor(m / 60)} h ${m % 60} min`
  const r = s % 60
  return r ? `${m} min ${r} s` : `${m} min`
}

function xml(texto: string) {
  return texto.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

// ---------- desenhos (desktop) ----------

const SINO =
  '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>'

function onda(atraso: string, cor: string) {
  return (
    `<circle r="26" fill="none" stroke="${cor}" stroke-width="1.5">` +
    `<animate attributeName="r" values="26;46" dur="1.8s" begin="${atraso}" repeatCount="indefinite"/>` +
    `<animate attributeName="opacity" values="1;0" dur="1.8s" begin="${atraso}" repeatCount="indefinite"/>` +
    `</circle>`
  )
}

const CARTAO_L = 500
const CARTAO_A = 120

function cartaoSvg(tempo: string) {
  const W = CARTAO_L
  const H = CARTAO_A
  const tx = 124
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<defs>` +
    `<filter id="brilho" x="-60%" y="-60%" width="220%" height="220%">` +
    `<feGaussianBlur stdDeviation="2.6" result="b"/>` +
    `<feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>` +
    `</filter>` +
    `<radialGradient id="halo"><stop offset="0" stop-color="rgba(245,231,101,0.30)"/><stop offset="1" stop-color="rgba(245,231,101,0)"/></radialGradient>` +
    `</defs>` +
    `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="rgba(40,38,44,0.95)" stroke="rgba(245,231,101,0.55)" stroke-width="1.5"/>` +
    // sino com halo, ondas e balanço
    `<g transform="translate(62 ${H / 2})">` +
    `<circle r="42" fill="url(#halo)"/>` +
    `<circle r="28" fill="none" stroke="rgba(245,231,101,0.7)" stroke-width="1.3"/>` +
    `<circle r="37" fill="none" stroke="rgba(245,231,101,0.45)" stroke-width="1.1"/>` +
    onda('0s', 'rgba(245,231,101,0.7)') +
    onda('0.9s', 'rgba(245,231,101,0.45)') +
    `<g transform="translate(-22.8 -22.8) scale(1.9)">` +
    `<g filter="url(#brilho)" fill="none" stroke="#F5E765" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">` +
    `<animateTransform attributeName="transform" type="rotate" values="0 12 3;14 12 3;-11 12 3;7 12 3;-4 12 3;0 12 3;0 12 3" keyTimes="0;0.1;0.22;0.34;0.46;0.58;1" dur="2.4s" repeatCount="indefinite"/>` +
    SINO +
    `</g></g></g>` +
    // pílula verde "Terminou"
    `<rect x="${tx}" y="16" width="106" height="26" rx="13" fill="rgba(43,215,154,0.14)" stroke="rgba(43,215,154,0.45)"/>` +
    `<g transform="translate(${tx + 11} 20.5) scale(0.72)" fill="none" stroke="#2BD79A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></g>` +
    `<text x="${tx + 34}" y="34" font-family="${FONTE}" font-size="13" font-weight="600" fill="#2BD79A">Terminou</text>` +
    // textos
    `<text x="${tx}" y="72" font-family="${FONTE}" font-size="20" font-weight="700" fill="#FFFFFF">Pronto! O Claude terminou.</text>` +
    `<text x="${tx}" y="97" font-family="${FONTE}" font-size="14" fill="#C8C6CC">Pode voltar quando quiser · levou ${xml(tempo)}</text>` +
    `</svg>`
  )
}

function pontos(ms: number) {
  const ativo = Math.floor(ms / 1000) % 3
  return [0, 1, 2].map(i => (i === ativo ? 1 : 0.35))
}

function pilulaSvg(tempo: string, ms: number) {
  const texto = `Trabalhando há ${tempo}`
  const W = Math.round(32 + texto.length * 7.2 + 40)
  const H = 30
  const op = pontos(ms)
  const dots = op
    .map((o, i) => `<tspan dx="${i === 0 ? 8 : 3}" font-size="10" fill-opacity="${o}">●</tspan>`)
    .join('')
  const source =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="15" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.08)"/>` +
    `<text x="16" y="20" font-family="${FONTE}" font-size="13" font-weight="600" fill="#C8C6CC">${xml(texto)}${dots}</text>` +
    `</svg>`
  return { source, W, H }
}

// ---------- som ----------

async function tocar($: Motor) {
  try {
    if ((await $.env.get('OS')) === 'Windows_NT') {
      // No Windows o terminal não tem player: o PowerShell toca o .wav.
      const arquivo = `${$.plugin.root}/${SOM}`.replaceAll("'", "''")
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
      await $.audio.play({ asset: SOM })
    }
  } catch (erro) {
    $.ui.log(`campainha: não tocou o som (${String(erro)})`, { to: 'debug' })
  }
}

// O tique que redesenha a pílula a cada segundo (some num hot reload, como os timers).
let tique: Timer | undefined

function parar() {
  tique?.cancel()
  tique = undefined
}

async function comecar($: Motor) {
  const t = await $.clock.now()
  await update($, aviso, () => null)
  await update($, inicio, () => t)
  await update($, agora, () => t)
  parar()
  tique = $.clock.every(1000, () => {
    void $.clock.now().then(n => update($, agora, () => n))
  })
}

export const register: Register = (on, options) => {
  const limiteS = typeof options.limiteSegundos === 'number' ? options.limiteSegundos : LIMITE_PADRAO_S
  const limiteMs = Math.max(0, limiteS) * 1000

  on('prompt.submit', async ($, e, next) => {
    // Só um prompt com o Claude parado começa a contagem (não os do meio do turno).
    if (e.turnId === undefined) await comecar($)
    return next(e)
  })

  on('turn.start', async ($, e, next) => {
    if ((await read($, inicio)) === null) await comecar($)
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId !== undefined) return next(e)
    parar()
    const comeco = await read($, inicio)
    const fim = await $.clock.now()
    const ms = comeco !== null ? fim - comeco : e.durationMs
    await update($, inicio, () => null)

    if (e.reason === 'answer' && !e.isAborted && ms >= limiteMs) {
      await update($, aviso, () => ({ duracaoMs: ms }))
      $.ui.toast(`🔔 Pronto! Terminei em ${duracao(ms)}`, { timeoutMs: 6000 })
      void tocar($)
    }
    return next(e)
  })

  // O Claude parou pedindo permissão: toca a campainha também.
  on('classic.PermissionRequest', async ($, e, next) => {
    void tocar($)
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)
    const comeco = await read($, inicio)
    const cartao = await read($, aviso)
    const trabalhando = e.props.isWorking && comeco !== null
    if (!trabalhando && cartao === null) return next(e)

    // Outras faixas (como a barra-uso) continuam aparecendo embaixo.
    const below = await next(e)
    const ui = $.ui.resolve(e)
    const { Box, Text, Button } = ui

    let minha
    if (trabalhando && comeco !== null) {
      const ms = Math.max(0, (await read($, agora)) - comeco)
      const tempo = duracao(ms)
      if (e.surface !== 'terminal' && 'Svg' in ui) {
        const { Svg } = ui
        const pilula = pilulaSvg(tempo, ms)
        minha = (
          <Box paddingX={1}>
            <Svg source={pilula.source} alt={`Trabalhando há ${tempo}`} width={pilula.W} height={pilula.H} />
          </Box>
        )
      } else {
        const p = pontos(ms)
        minha = (
          <Box paddingX={1} flexDirection="row">
            <Text color="#C8C6CC" bold>{`Trabalhando há ${tempo} `}</Text>
            {p.map((o, i) => (
              <Text key={`p${i}`} color="yellow" dimColor={o < 1}>
                ●
              </Text>
            ))}
          </Box>
        )
      }
    } else if (cartao !== null) {
      const tempo = duracao(cartao.duracaoMs)
      const fechar = () => update($, aviso, () => null)
      if (e.surface !== 'terminal' && 'Svg' in ui) {
        const { Svg } = ui
        minha = (
          <Box flexDirection="row" alignItems="center" gap={2} paddingX={1} paddingY={1}>
            <Svg
              source={cartaoSvg(tempo)}
              alt={`🔔 Pronto! Terminei em ${tempo}`}
              width={CARTAO_L}
              height={CARTAO_A}
            />
            <Button key="ok" label="OK" hotkey="o" variant="primary" onPress={fechar} />
          </Box>
        )
      } else {
        minha = (
          <Box flexDirection="row" alignItems="center" gap={2} paddingX={1} borderStyle="round" borderColor="yellow">
            <Text color="yellow" bold>{`🔔 Pronto! Terminei em ${tempo}`}</Text>
            <Text dimColor>Pode voltar quando quiser.</Text>
            <Button key="ok" label="OK" hotkey="o" variant="primary" onPress={fechar} />
          </Box>
        )
      }
    }

    return (
      <Box flexDirection="column">
        {minha}
        {below}
      </Box>
    )
  })
}
