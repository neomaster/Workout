/** Se o modo gravação está ligado nesta conversa. */
export type ModoGravacaoLigado = boolean

declare module 'claude-code' {
  interface PluginState {
    'modo-gravacao': { ligado: ModoGravacaoLigado }
  }
}
