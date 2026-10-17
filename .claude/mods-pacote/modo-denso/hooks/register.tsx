import type { Register } from 'claude-code'

const CHAVE = 'ligado'
const SECAO = {
  id: 'modo-denso:instrucao',
  scope: 'session',
  text:
    'Modo denso ligado: responda de forma curta, densa e direta. Vá ao ponto, ' +
    'sem introduções, repetições ou resumos finais; use poucas linhas e listas curtas.',
} as const

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'denso',
      description: 'Liga ou desliga respostas curtas e diretas',
    })
    if ((await $.store.get(CHAVE)) === true) $.ui.status('⚡ denso')
    return next(e)
  })

  on('command.run', { command: 'denso' }, async $ => {
    const ligado = (await $.store.get(CHAVE)) !== true
    await $.store.set(CHAVE, ligado)
    $.ui.status(ligado ? '⚡ denso' : undefined)
    return {
      text: ligado
        ? 'Modo denso ligado: respostas curtas e diretas. Digite /denso de novo para desligar.'
        : 'Modo denso desligado: respostas no tamanho normal.',
    }
  })

  on('prompt.compose', async ($, e, next) => {
    const res = await next(e)
    if ((await $.store.get(CHAVE)) !== true) return res
    return { sections: [...res.sections.filter(s => s.id !== SECAO.id), SECAO] }
  })
}
