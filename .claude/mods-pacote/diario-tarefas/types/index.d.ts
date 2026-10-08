export type DiarioStatus = 'pending' | 'in_progress' | 'completed'

/** Uma tarefa da lista da conversa atual. */
export type DiarioTarefa = {
  id: string
  titulo: string
  status: DiarioStatus
  /** O texto no gerúndio que o Claude mostra enquanto faz ("Rodando os testes"). */
  ativo?: string
}

declare module 'claude-code' {
  interface PluginState {
    'diario-tarefas': {
      tarefas: DiarioTarefa[]
    }
  }
}
