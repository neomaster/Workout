import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Saving } from '../types'
import { densify, estimate, meter, savingPct, unquote } from './dense'

const last = atom({ plugin: 'prompt-saver', key: 'last' } as const, null)
const auto = atom({ plugin: 'prompt-saver', key: 'auto' } as const, false)

const REWRITE_SYSTEM =
  'Reescreva o prompt do usuário de forma mais curta e densa, preservando TODOS os requisitos, ' +
  'nomes, caminhos, código, números e restrições. Mantenha o idioma original. Sem saudações, ' +
  'sem enchimento, em modo imperativo. Responda SOMENTE com o prompt reescrito.'

const report = (s: Saving): string => {
  const pct = savingPct(s.before, s.after)

  return [
    `Prompt denso (${s.how}) — ~${s.before} → ~${s.after} tokens (−${pct}%):`,
    '',
    s.dense,
    '',
    `${meter(pct)} economia ~${s.before - s.after} tokens · colocado na caixa de prompt: edite e envie.`,
  ].join('\n')
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'dense',
      description: 'Versão econômica e mais densa do prompt (regras locais, grátis)',
    })
    await $.command.register({
      name: 'dense-ai',
      description: 'Versão densa reescrita pelo Haiku (custa poucos tokens)',
    })
    await $.command.register({
      name: 'dense-auto',
      description: 'Liga/desliga a compressão automática dos prompts: on | off',
    })

    return next(e)
  })

  on('command.run', { command: 'dense' }, async ($, e) => {
    const text = unquote(e.args)
    if (!text) return { text: 'Uso: /dense <seu prompt>' }
    const d = densify(text)
    const s: Saving = { original: text, dense: d.text, before: d.before, after: d.after, how: 'regras' }
    await update($, last, () => s)
    await $.prompt.fill({ text: s.dense, mode: 'replace' })

    return { text: d.saved === 0 ? 'Seu prompt já está denso: nada a cortar.' : report(s) }
  })

  on('command.run', { command: 'dense-ai' }, async ($, e) => {
    const text = unquote(e.args)
    if (!text) return { text: 'Uso: /dense-ai <seu prompt>' }
    const r = await $.model.complete({
      model: 'haiku',
      system: REWRITE_SYSTEM,
      prompt: text,
      effort: 'low',
      maxTokens: 1024,
      timeoutMs: 20000,
    })
    if (!r.isAnswered) return { text: `Não consegui reescrever (${r.reason}). Tente /dense.` }
    const dense = r.text.trim()
    if (!dense || dense.length >= text.length) {
      return { text: 'O Haiku não conseguiu deixar mais curto; mantenha o original ou use /dense.' }
    }
    const s: Saving = { original: text, dense, before: estimate(text), after: estimate(dense), how: 'haiku' }
    await update($, last, () => s)
    await $.prompt.fill({ text: dense, mode: 'replace' })

    return { text: report(s) }
  })

  on('command.run', { command: 'dense-auto' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg !== 'on' && arg !== 'off') {
      const now = await read($, auto)

      return { text: `Compressão automática: ${now ? 'ligada' : 'desligada'}. Use /dense-auto on|off.` }
    }
    await update($, auto, () => arg === 'on')

    return { text: `Compressão automática ${arg === 'on' ? 'ligada' : 'desligada'}.` }
  })

  // No modo automático, comprime o prompt antes de enviar (só regras locais).
  on('prompt.submit', async ($, e, next) => {
    if (e.text.startsWith('/') || e.text.length < 60 || !(await read($, auto))) {
      await update($, last, () => null)

      return next(e)
    }
    const d = densify(e.text)
    if (savingPct(d.before, d.after) < 8) return next(e)
    await update($, last, () => ({
      original: e.text,
      dense: d.text,
      before: d.before,
      after: d.after,
      how: 'regras' as const,
    }))
    $.ui.toast(`Prompt compactado: −${savingPct(d.before, d.after)}% (~${d.saved} tokens)`)

    return next({ ...e, text: d.text })
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const s = await read($, last)
    if (e.props.hasSurvey || !s) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    const pct = savingPct(s.before, s.after)
    const filled = Math.round((Math.min(100, pct) / 100) * 20)

    return (
      <Box>
        <Text bold color="#00e676">💾 −{pct}% </Text>
        <Text color="#00e676">{'█'.repeat(filled)}</Text>
        <Text color="#37474f">{'▒'.repeat(20 - filled)}</Text>
        <Text color="#b0bec5"> ~{s.before} → ~{s.after} tokens ({s.how})</Text>
      </Box>
    )
  })
}
