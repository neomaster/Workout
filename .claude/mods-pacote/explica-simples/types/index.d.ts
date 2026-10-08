/** O que o painel "Em palavras simples" está mostrando. */
export type ExplicaSimplesPainel = {
  /** pensando: esperando o modelo · pronto: resultado · erro · sem-resposta: nada para explicar. */
  fase: 'pensando' | 'pronto' | 'erro' | 'sem-resposta'
  /** Texto corrido ou diagrama de passos. */
  modo: 'texto' | 'diagrama'
  /** A resposta original do Claude que está sendo explicada. */
  fonte: string
  /** A explicação em Markdown (modo texto). */
  texto: string
  /** Título curto do diagrama. */
  titulo: string
  /** Os passos do diagrama, em ordem. */
  passos: string[]
  /** Uma analogia do dia a dia que acompanha o diagrama. */
  analogia: string
  /** Mensagem amigável quando algo deu errado. */
  erro: string
}

declare module 'claude-code' {
  interface PluginState {
    'explica-simples': {
      painel: ExplicaSimplesPainel
    }
  }
}
