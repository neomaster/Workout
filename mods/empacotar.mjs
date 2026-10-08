#!/usr/bin/env node
// Gera um .zip de cada skill dos mods, para enviar no Cowork ou no claude.ai.
// Uso: node mods/empacotar.mjs        -> mods/skills-zip/<skill>.zip
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import { MODS } from './cli.mjs'

const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = buf => {
  let c = 0xffffffff
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

// ZIP sem compressão (método "store"): abre em qualquer sistema.
const zip = files => {
  const locals = []
  const centrals = []
  let offset = 0
  for (const { name, data } of files) {
    const n = Buffer.from(name)
    const crc = crc32(data)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0x0800, 6)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(data.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(n.length, 26)
    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(0x0800, 8)
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(data.length, 20)
    central.writeUInt32LE(data.length, 24)
    central.writeUInt16LE(n.length, 28)
    central.writeUInt32LE(offset, 42)
    locals.push(local, n, data)
    centrals.push(central, n)
    offset += local.length + n.length + data.length
  }
  const size = centrals.reduce((s, b) => s + b.length, 0)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(files.length, 8)
  end.writeUInt16LE(files.length, 10)
  end.writeUInt32LE(size, 12)
  end.writeUInt32LE(offset, 16)
  return Buffer.concat([...locals, ...centrals, end])
}

const walk = dir =>
  readdirSync(dir).flatMap(f => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]))

const dist = join(MODS, 'skills-zip')
mkdirSync(dist, { recursive: true })
let count = 0
for (const mod of readdirSync(MODS)) {
  const skills = join(MODS, mod, 'skills')
  if (!statSync(join(MODS, mod)).isDirectory() || !readdirSync(join(MODS, mod)).includes('skills')) continue
  for (const skill of readdirSync(skills)) {
    const base = join(skills, skill)
    const files = walk(base).map(f => ({ name: `${skill}/${relative(base, f).split('\\').join('/')}`, data: readFileSync(f) }))
    writeFileSync(join(dist, `${skill}.zip`), zip(files))
    console.log(`✔ ${mod} → skills-zip/${skill}.zip`)
    count += 1
  }
}
console.log(count ? `\nEnvie os .zip de ${dist} como skill no Cowork ou no claude.ai.` : 'Nenhuma skill encontrada.')
