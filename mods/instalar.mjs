#!/usr/bin/env node
// Instala todos os mods desta pasta no Claude Code, para todas as sessões.
// Uso: node mods/instalar.mjs        (pode rodar de novo quando quiser)
import { install, readMarketplace, requireClaude, ROOT } from './cli.mjs'

requireClaude()
const mp = readMarketplace()
let failed = 0

for (const { name, description } of mp.plugins) {
  const r = install(name)
  console.log(`${r.ok ? '✔' : '✘'} ${name}${r.ok ? '' : ' — ' + r.out}`)
  if (r.ok && description) console.log(`    ${description}`)
  if (!r.ok) failed += 1
}

console.log(`\nMarketplace: ${ROOT}`)
console.log(failed ? `${failed} falharam.` : 'Pronto. Abra o Claude Code (`claude`) e use as palavras-chave acima.')
console.log('Editou um mod? No Claude Code rode /reload-plugins.')
process.exit(failed ? 1 : 0)
