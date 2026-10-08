/** O que o recibo mostra de um turno. */
export type Recibo = {
  criados: number
  editados: number
  comandos: number
  falhas: number
  outras: number
}

/** A contagem do turno que está rodando. */
export type Turno = {
  /** Arquivos novos (caminho normalizado). */
  criados: string[]
  /** Arquivos já existentes que foram alterados (sem os criados no turno). */
  editados: string[]
  /** Tentativas de edição por arquivo, para detectar voltas em círculo. */
  edicoes: Record<string, number>
  comandos: number
  falhas: number
  outras: number
  /** Falhas seguidas de cada comando (zera quando o mesmo comando dá certo). */
  falhasSeguidas: Record<string, number>
  /** Já mostrou o aviso de círculos neste turno. */
  avisado: boolean
}

/** Recibo guardado pela duração do turno, para casar com a linha "trabalhou por". */
export type ReciboComDuracao = Recibo & { durationMs: number }

declare module 'claude-code' {
  interface PluginState {
    'recibo-resposta': {
      turno: Turno
      recibos: Record<string, Recibo>
      recentes: ReciboComDuracao[]
      /** O recibo do último turno, mostrado na faixa acima do prompt (desktop); null quando dispensado. */
      faixa: ReciboComDuracao | null
    }
  }
}
