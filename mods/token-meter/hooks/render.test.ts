import { test, expect, mock } from 'claude-code/testing'

const PANE = {
  title: 'Token Meter',
  isFocused: false,
  bodyColumns: 80,
  placement: 'dock',
  scroll: { bodyRows: 40 },
  view: {},
} as never

test('pane draws with live numbers on the terminal', async ($, on) => {
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
  await $.command.run({ command: 'tokens', args: '' })
  const ui = await $.ui.mount({
    plugin: 'token-meter',
    surface: 'terminal',
    component: 'Pane',
    requestId: 'token-meter',
    props: PANE,
  })
  expect(await ui.find({ type: 'Text', text: /CONTEXTO/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /COMPARATIVO/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /45% usado/ })).toBeDefined()
  await ui.unmount()
})
