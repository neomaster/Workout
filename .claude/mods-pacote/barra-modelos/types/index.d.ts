export type Fase = 'iniciada' | 'feita'

export type Analise = {
  /** Tipo de tarefa detectado, em português. */
  tarefa: string
  /** Exigência da tarefa, de 0 (trivial) a 100 (muito difícil). */
  exigencia: number
  fase: Fase
  /** Modelo que respondeu (só depois do turno), como a API o informa. */
  usado?: string
}

declare module 'claude-code' {
  interface PluginState {
    'barra-modelos': { analise: Analise | null; oculta: boolean }
  }
}
