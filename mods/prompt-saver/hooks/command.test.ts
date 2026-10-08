import { test, expect } from 'claude-code/testing'

test('/denso compacta por regras e preenche a caixa', async ($, on) => {
  const filled: string[] = []
  on('prompt.fill', async (_$, e) => {
    filled.push(e.text)

    return { isFilled: true }
  })
  const r = await $.command.run({ command: 'denso', args: 'Olá, por favor, você poderia revisar o arquivo src/app.js? Muito obrigado!' })
  expect(r.text).toContain('(regras)')
  expect(filled[0]).toBe('Revisar o arquivo src/app.js?')
})

test('/denso usa o Haiku quando as regras cortam pouco', async ($, on) => {
  on('prompt.fill', async () => ({ isFilled: true }))
  on('model.complete', async () => ({
    value: {
      isAnswered: true,
      text: 'Simplifique as funções e conclua: na próxima sessão, só a palavra-chave.',
      usage: { input_tokens: 1, output_tokens: 1, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
    } as never,
  }))
  const r = await $.command.run({
    command: 'denso',
    args: 'Facilite ainda mais, lapide estas funções e conclua para que na próxima sessão o usuário utilize apenas a palavra-chave necessária.',
  })
  expect(r.text).toContain('(haiku)')
})

test('/denso on | off liga e desliga o automático', async $ => {
  expect((await $.command.run({ command: 'denso', args: 'on' })).text).toContain('ligada')
  expect((await $.command.run({ command: 'denso', args: '' })).text).toContain('Automático: ligado')
  expect((await $.command.run({ command: 'denso', args: 'off' })).text).toContain('desligada')
})
