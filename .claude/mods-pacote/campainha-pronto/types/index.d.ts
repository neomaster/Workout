export type CampainhaAviso = {
  /** Quanto a resposta levou, em milissegundos. */
  duracaoMs: number
}

declare module 'claude-code' {
  interface PluginState {
    'campainha-pronto': {
      /** Quando o Claude começou a trabalhar (ms desde a época), ou null parado. */
      inicio: number | null
      /** Último tique do relógio enquanto trabalha (redesenha a pílula). */
      agora: number
      /** O cartão de "Pronto!" na tela, ou null. */
      aviso: CampainhaAviso | null
    }
  }
}
