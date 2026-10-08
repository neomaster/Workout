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

const USAGE = 'Uso: /denso <texto> · /denso on | off (compressão automática ao enviar)'

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'denso',
      description: 'Versão econômica e mais densa do texto (on/off: automático ao enviar)',
      argumentHint: '<texto> | on | off',
    })

    return next(e)
  })

  // /denso <texto>: regras locais primeiro (grátis); se cortarem pouco, tenta o Haiku.
  on('command.run', { command: 'denso' }, async ($, e) => {
    const text = unquote(e.args)
    const word = text.toLowerCase()

    if (!text) {
      return { text: `${USAGE}\nAutomático: ${(await read($, auto)) ? 'ligado' : 'desligado'}.` }
    }
    if (word === 'on' || word === 'off') {
      await update($, auto, () => word === 'on')

      return { text: `Compressão automática ${word === 'on' ? 'ligada' : 'desligada'}.` }
    }

    const d = densify(text)
    let s: Saving = { original: text, dense: d.text, before: d.before, after: d.after, how: 'regras' }

    if (savingPct(d.before, d.after) < 10 && text.length >= 80) {
      const r = await $.model
        .complete({ model: 'haiku', system: REWRITE_SYSTEM, prompt: text, effort: 'low', maxTokens: 1024, timeoutMs: 20000 })
        .catch(() => null)
      const ai = r?.isAnswered ? r.text.trim() : ''
      if (ai && ai.length < s.dense.length) {
        s = { original: text, dense: ai, before: estimate(text), after: estimate(ai), how: 'haiku' }
      }
    }

    if (s.after >= s.before) return { text: 'Seu texto já está denso: nada a cortar.' }
    await update($, last, () => s)
    await $.prompt.fill({ text: s.dense, mode: 'replace' }).catch(() => undefined)

    return { text: report(s) }
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
