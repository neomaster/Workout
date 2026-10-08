// Chama o CLI do Claude Code (funciona no Windows, onde `claude` pode ser um .cmd).
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const MODS = dirname(fileURLToPath(import.meta.url))
export const ROOT = dirname(MODS)
export const MARKETPLACE = join(ROOT, '.claude-plugin', 'marketplace.json')

const isWin = process.platform === 'win32'
const quote = a => (isWin && /[\s"&|<>^]/.test(a) ? `"${a.replace(/"/g, '""')}"` : a)

export const claude = (...args) => {
  const r = spawnSync('claude', args.map(quote), { encoding: 'utf8', shell: isWin })
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim()

  return { ok: r.status === 0, out: out.split('\n').pop() ?? '' }
}

export const requireClaude = () => {
  if (!claude('--version').ok) {
    console.error('Não achei o comando `claude`. Instale o Claude Code e rode de novo:')
    console.error('  npm install -g @anthropic-ai/claude-code')
    process.exit(1)
  }
}

export const readMarketplace = () => JSON.parse(readFileSync(MARKETPLACE, 'utf8'))

// Registra esta pasta como marketplace e instala o mod (pode repetir sem problema).
export const install = name => {
  const mp = readMarketplace()
  const add = claude('plugin', 'marketplace', 'add', ROOT)
  if (!add.ok) return { ok: false, out: add.out }

  return claude('plugin', 'install', `${name}@${mp.name}`, '--scope', 'user')
}
