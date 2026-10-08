import { test, expect, mock } from 'claude-code/testing'

const SURFACES = ['terminal', 'desktop', 'vscode', 'mobile'] as const

const PANE = {
  title: 'Token Meter',
  isFocused: false,
  bodyColumns: 80,
  placement: 'dock',
  scroll: { bodyRows: 40 },
  view: {},
} as never

const BAND = { hasSurvey: false, isWorking: false, maxRows: 10, columns: 80, scroll: { bodyRows: 10 } } as never

test('/tokens answers in text and the pane and band draw on every surface', async ($, on) => {
  mock.clock(on)
  on('ui.open', async () => ({ value: {} as never }))
  on('ui.status', async () => ({ value: undefined as never }))
  on('session.usage', async () => ({
    value: {
      startedAt: 0,
      context: { tokens: 90000, window: 200000, percent: 45 },
      rateLimits: [{ kind: 'five_hour', percentUsed: 72, resetsAt: '2030-01-01T00:00:00Z' }],
      cost: { usd: 1.23 },
    } as never,
  }))
  const r = await $.command.run({ command: 'tokens', args: 'traduza e resuma este texto' })
  expect(r.text).toContain('45%')
  expect(r.text).toContain('Haiku')

  for (const surface of SURFACES) {
    const pane = await $.ui.mount({ plugin: 'token-meter', surface, component: 'Pane', requestId: 'token-meter', props: PANE })
    expect(await pane.find({ type: 'Text', text: /CONTEXTO/ })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: /45% usado/ })).toBeDefined()
    await pane.unmount()

    const band = await $.ui.mount({ plugin: 'token-meter', surface, component: 'AbovePrompt', props: BAND })
    expect(await band.find({ type: 'Text', text: /45%/ })).toBeDefined()
    await band.unmount()
  }
})
