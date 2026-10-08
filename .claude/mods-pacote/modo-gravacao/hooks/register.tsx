import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import { mascarar, mascararTudo } from './mascara'

// Modo Gravação: /gravando liga e desliga. Ligado, e-mails, telefones, CPFs,
// CNPJs, valores em R$, chaves e senhas aparecem como •••••• NA TELA.
// Só o desenho muda: a conversa guardada (e o que o Claude lê) continua igual.

const ligado = atom({ plugin: 'modo-gravacao', key: 'ligado' } as const, false)

const FONTE = 'Segoe UI, Inter, system-ui, -apple-system, sans-serif'
const FAIXA_TEXTO = '● GRAVANDO · dados ocultos'
const FAIXA_L = 270
const FAIXA_A = 30

const igual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

async function alternar($: EngineInterface) {
  const agora = await update($, ligado, atual => !atual)
  if (agora) {
    $.ui.toast('🔴 Modo gravação ligado: e-mails, valores e senhas ficam ocultos na tela.', { timeoutMs: 6000 })
  } else {
    $.ui.toast('⚪ Modo gravação desligado: a tela volta a mostrar tudo.', { timeoutMs: 4000 })
  }
  // Redesenha as mensagens que já estão na tela.
  $.ui.invalidate('ui.render')
  return agora
}

// Faixa do app desktop: fundo escuro, borda vermelha suave e um ponto que pulsa.
function faixaSvg() {
  const W = FAIXA_L
  const H = FAIXA_A
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="${H / 2}" fill="rgba(30,18,20,0.96)" stroke="rgba(239,68,68,0.55)" stroke-width="1.5"/>` +
    `<circle cx="18" cy="${H / 2}" r="8" fill="rgba(239,68,68,0.25)">` +
    `<animate attributeName="r" values="5;9;5" dur="1.6s" repeatCount="indefinite"/>` +
    `<animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.6s" repeatCount="indefinite"/>` +
    `</circle>` +
    `<circle cx="18" cy="${H / 2}" r="5" fill="#EF4444"/>` +
    `<text x="34" y="${H / 2 + 4.5}" font-family="${FONTE}" font-size="13" font-weight="700" fill="#FFFFFF" letter-spacing="0.6">GRAVANDO</text>` +
    `<text x="118" y="${H / 2 + 4.5}" font-family="${FONTE}" font-size="13" fill="#F3B4B4">· dados ocultos</text>` +
    `</svg>`
  )
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'gravando',
      description: 'Liga/desliga o modo gravação (esconde e-mails, valores e senhas da tela)',
      immediate: true,
    })
    return next(e)
  })

  on('command.run', { command: 'gravando' }, async $ => {
    const agora = await alternar($)
    return {
      text: agora
        ? '🔴 Modo gravação ligado: dados sensíveis aparecem como •••••• na tela.'
        : 'Modo gravação desligado: a tela volta a mostrar tudo.',
    }
  })

  // ---------- a faixa vermelha acima da caixa de texto ----------

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || !(await read($, ligado))) return next(e)
    // As faixas dos outros mods continuam aparecendo embaixo.
    const below = await next(e)

    const ui = $.ui.resolve(e)
    const { Box, Text, Button } = ui
    const desligar = <Button key="desligar" label="Desligar" hotkey="g" onPress={() => void alternar($)} />

    let faixa
    if (e.surface !== 'terminal' && 'Svg' in ui) {
      const { Svg } = ui
      faixa = (
        <Box key="modo-gravacao" flexDirection="row" alignItems="center" gap={2} paddingX={1}>
          <Svg source={faixaSvg()} alt={FAIXA_TEXTO} width={FAIXA_L} height={FAIXA_A} />
          {desligar}
        </Box>
      )
    } else {
      faixa = (
        <Box
          key="modo-gravacao"
          flexDirection="row"
          alignItems="center"
          gap={2}
          paddingX={1}
          borderStyle="round"
          borderColor="red"
        >
          <Box flexDirection="row" gap={1}>
            <Text color="red" bold>
              ●
            </Text>
            <Text bold>GRAVANDO</Text>
            <Text color="#F3B4B4">· dados ocultos</Text>
          </Box>
          {desligar}
        </Box>
      )
    }

    return (
      <Box flexDirection="column">
        {faixa}
        {below}
      </Box>
    )
  })

  // ---------- o que aparece na conversa ----------
  // Daqui para baixo só muda o desenho: a conversa guardada não é tocada.

  on('ui.render', { component: 'UserMessage' }, async ($, e, next) => {
    if (!(await read($, ligado))) return next(e)
    const text = mascarar(e.props.text)
    return text === e.props.text ? next(e) : next({ ...e, props: { ...e.props, text } })
  })

  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    if (!(await read($, ligado))) return next(e)
    const text = mascarar(e.props.text)
    return text === e.props.text ? next(e) : next({ ...e, props: { ...e.props, text } })
  })

  on('ui.render', { component: 'CommandOutput' }, async ($, e, next) => {
    if (!(await read($, ligado))) return next(e)
    const text = mascarar(e.props.text)
    return text === e.props.text ? next(e) : next({ ...e, props: { ...e.props, text } })
  })

  on('ui.render', { component: 'ToolUse' }, async ($, e, next) => {
    if (!(await read($, ligado))) return next(e)
    const props = { ...e.props, input: mascararTudo(e.props.input) }
    if (e.props.output !== undefined) props.output = mascararTudo(e.props.output)
    return igual(props, e.props) ? next(e) : next({ ...e, props })
  })

  on('ui.render', { component: 'ToolResult' }, async ($, e, next) => {
    if (!(await read($, ligado))) return next(e)
    const output = mascararTudo(e.props.output)
    return igual(output, e.props.output) ? next(e) : next({ ...e, props: { ...e.props, output } })
  })

  on('ui.render', { component: 'ToolGroup' }, async ($, e, next) => {
    if (!(await read($, ligado))) return next(e)
    const calls = e.props.calls.map(call => {
      const nova = { ...call, input: mascararTudo(call.input) }
      if (call.output !== undefined) nova.output = mascararTudo(call.output)
      return nova
    })
    return igual(calls, e.props.calls) ? next(e) : next({ ...e, props: { ...e.props, calls } })
  })
}
