#!/usr/bin/env node
// Cria um mod pronto em mods/<nome>, registra no marketplace e já instala.
// Uso: node mods/novo-mod.mjs <nome> "descrição"
// Depois: abra o Claude Code e digite /<nome>. Editou? Rode /reload-plugins.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

import { install, MARKETPLACE as mpPath, MODS as modsDir } from './cli.mjs'

const [name, ...rest] = process.argv.slice(2)
const description = rest.join(' ') || `Mod ${name}`

if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error('Uso: node mods/novo-mod.mjs <nome-em-minusculas> "descrição"')
  process.exit(1)
}

const dir = join(modsDir, name)
if (existsSync(dir)) {
  console.error(`Já existe: ${dir}`)
  process.exit(1)
}

const write = (path, text) => {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, text)
}

write(
  join(dir, '.claude-plugin', 'plugin.json'),
  JSON.stringify({ name, version: '0.1.0', description }, null, 2) + '\n',
)
write(join(dir, 'hooks', 'hooks.json'), '{ "modules": ["./register.tsx"] }\n')
write(
  join(dir, 'hooks', 'register.tsx'),
  `import type { Register } from 'claude-code'

// Ponto de partida: o comando /${name}. Troque o corpo pelo que o mod deve fazer.
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: '${name}', description: ${JSON.stringify(description)} })

    return next(e)
  })

  on('command.run', { command: '${name}' }, async ($, e) => {
    $.ui.toast('${name}: ' + (e.args || 'funcionando'))

    return { text: '${name} funcionando. Argumentos: ' + (e.args || '(nenhum)') }
  })
}
`,
)

const mp = JSON.parse(readFileSync(mpPath, 'utf8'))
if (!mp.plugins.some(p => p.name === name)) {
  mp.plugins.push({ name, source: `./mods/${name}`, description })
  writeFileSync(mpPath, JSON.stringify(mp, null, 2) + '\n')
}

console.log(`✔ Mod criado em ${dir}`)
const r = install(name)
if (r.ok) {
  console.log(`✔ Instalado. No Claude Code digite: /${name}`)
} else {
  console.log(`✘ Não instalei automaticamente (${r.out}).`)
  console.log(`  Rode: claude plugin install ${name}@${mp.name}`)
}
console.log(`Edite ${join(dir, 'hooks', 'register.tsx')} e rode /reload-plugins.`)
