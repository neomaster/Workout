export type Medida = { tokens?: number; janela: number; percent?: number; usd?: number }
export type Economia = { antes: number; depois: number }

declare module 'claude-code' {
  interface PluginState {
    'contexto-enxuto': {
      medida: Medida | null
      economia: Economia | null
    }
  }
}
