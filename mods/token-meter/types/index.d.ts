export type Family = 'opus' | 'sonnet' | 'haiku'

export type ModelStat = {
  turns: number
  input: number
  output: number
  ms: number
}

export type Limit = { kind: string; percentUsed: number; resetsAt?: string }

export type Snapshot = {
  tokens: number | null
  window: number
  percent: number | null
  limits: Limit[]
  usd: number | null
}

export type Advice = {
  family: Family
  reasons: string[]
  prompt: string
}

export type Diag = { error: string | null; checks: number; at: number }

declare module 'claude-code' {
  interface PluginState {
    'token-meter': {
      snapshot: Snapshot | null
      models: Record<Family, ModelStat>
      advice: Advice | null
      history: number[]
      diag: Diag
    }
  }
}
