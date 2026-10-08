export type Saving = {
  original: string
  dense: string
  before: number
  after: number
  how: 'regras' | 'haiku'
}

declare module 'claude-code' {
  interface PluginState {
    'prompt-saver': { last: Saving | null; auto: boolean }
  }
}
