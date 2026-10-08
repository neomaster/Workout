export type ModInfo = {
  name: string
  description: string
  root: string
  isGlobal: boolean
  carregado: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'gerenciador-mods': { off: string[]; mods: ModInfo[]; carregados: string[]; ordem: string[] }
  }
}
