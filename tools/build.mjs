#!/usr/bin/env node
/* Monta o app de arquivo único a partir de src/.
 *   index.html          — página completa (abrir no navegador ou servir no GitHub Pages)
 *   dist/artifact.html  — corpo da página para publicar como artifact no Claude
 *   dist/nucleo.js      — só a lógica, sem interface (usada pelos testes de unidade)
 * Uso: node tools/build.mjs [--check]   (--check falha se index.html estiver desatualizado)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const ler = p => readFileSync(join(RAIZ, p), "utf8");

/* a ordem importa: cada arquivo usa o que os anteriores definem */
const NUCLEO = ["base", "duelos", "musculos", "logica", "social", "alta", "renovacao", "extras", "cinesiologia"].map(n => `src/nucleo/${n}.js`);
const UI = ["ui1", "ui2", "social", "alta", "renovacao", "nuvem", "cartao", "cinesiologia", "ui3"].map(n => `src/ui/${n}.js`);

/* projeto do Supabase usado pelo app e pela página de cadastro */
const NUVEM = JSON.parse(ler("src/nuvem.config.json"));
const nucleo = NUCLEO.map(ler).join("\n");
const js = '"use strict";\n' + nucleo + "\n" + "const NUVEM_CFG = " + JSON.stringify(NUVEM) + ";\n" + UI.map(ler).join("\n");
const css = ler("src/estilo.css");
const casca = ler("src/casca.html");

const head = `<title>Torquímetro Gym</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
${css}</style>
`;
const corpo = casca + "\n<script>\n" + js.replace(/<\/script/g, "<\\/script") + "\n</script>\n";
const pagina = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Plano, registro e progresso de treino com a física de cada exercício: torque, trabalho e curva de tensão.">
<meta name="theme-color" content="#e0326e">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="192x192" href="icones/icone-192.png">
<link rel="apple-touch-icon" href="icones/apple-touch-icon.png">
${head}</head>
<body>
${corpo}</body>
</html>
`;

/* página de cadastro: o mesmo projeto do Supabase que o app usa */
const cadastro = ler("src/cadastro.html")
  .replace("{{NUVEM}}", JSON.stringify({url: NUVEM.url, chave: NUVEM.chave}))
  .replace("{{BIBLIOTECA}}", NUVEM.biblioteca);

if (process.argv.includes("--check")) {
  let atual = "";
  try { atual = ler("index.html"); } catch (e) {}
  let atualCad = "";
  try { atualCad = ler("cadastro.html"); } catch (e) {}
  if (atual !== pagina || atualCad !== cadastro) { console.error("index.html ou cadastro.html está desatualizado: rode `npm run build` e faça commit."); process.exit(1); }
  console.log("index.html em dia.");
  process.exit(0);
}

mkdirSync(join(RAIZ, "dist"), { recursive: true });
writeFileSync(join(RAIZ, "index.html"), pagina);
writeFileSync(join(RAIZ, "cadastro.html"), cadastro);
writeFileSync(join(RAIZ, "dist", "artifact.html"), head + corpo);
writeFileSync(join(RAIZ, "dist", "nucleo.js"), nucleo);
console.log(`index.html ${(pagina.length / 1024).toFixed(0)} KB · ${NUCLEO.length + UI.length} módulos`);
