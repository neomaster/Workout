export type Medida = {
  /** Tokens estimados do texto original. */
  tokens: number
  /** Tokens que a versão curta economiza, em % do original. */
  economia: number
  /** Verbosidade de 0 (denso) a 100 (cheio de gordura). */
  gordura: number
}

export type Analise = {
  pedido: Medida | null
  resposta: Medida | null
  /** Versão mais curta do último pedido, quando há o que cortar. */
  sugestao?: string
}

declare module 'claude-code' {
  interface PluginState {
    denso: { analise: Analise | null; auto: boolean; oculta: boolean }
  }
}
