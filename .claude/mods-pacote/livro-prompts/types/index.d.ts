/** Um prompt guardado no livro. */
export type LivroPrompt = {
  id: string
  nome: string
  texto: string
  /** Quando foi salvo, em milissegundos. */
  criadoEm: number
  /** Veio pronto com o mod. */
  exemplo?: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'livro-prompts': {
      prompts: LivroPrompt[]
      busca: string
      /** O id do prompt esperando o segundo clique em "Apagar" ('' quando nenhum). */
      confirmar: string
      /** A última mensagem que a pessoa enviou nesta conversa. */
      ultima: string
    }
  }
}
