/** "alterado": o arquivo já existia e foi mudado. "criado": o Claude criou do zero. */
export type PontoTipo = 'alterado' | 'criado'

/** Uma alteração guardada na pasta .restauracao do projeto. */
export type PontoRestauracao = {
  id: string
  /** O caminho do arquivo, como a ferramenta recebeu (absoluto). */
  arquivo: string
  /** O caminho mostrado no painel (relativo à pasta do projeto, quando dá). */
  nome: string
  tipo: PontoTipo
  /** Nome da cópia dentro de .restauracao (o conteúdo de antes da alteração). */
  copia?: string
  /** Quando a alteração aconteceu, em ms. */
  quando: number
  /** A resposta do Claude em que aconteceu (o turnId). */
  resposta: string
  ferramenta: string
  /** Já foi restaurado (ou, se criado, apagado) pelo painel. */
  restaurado?: boolean
  restauradoEm?: number
}

/** A resposta em andamento e se o aviso dela já apareceu. */
export type PontoResposta = { id: string; avisada: boolean }

declare module 'claude-code' {
  interface PluginState {
    'ponto-restauracao': {
      pontos: PontoRestauracao[]
      resposta: PontoResposta
      /** Qual botão está esperando o segundo clique: o id do ponto, "todos" ou "". */
      confirmar: string
      /** Muda a cada 30 s para o "há 2 min" andar. */
      tick: number
    }
  }
}
