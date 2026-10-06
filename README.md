# Torquímetro Gym

Plano, registro e progresso de treino com a física de cada exercício. É um app de **arquivo único**, em português, sem servidor e sem conta: tudo fica no navegador de quem usa.

O escopo de aplicativo segue o [openGym](https://github.com/DuarteSantos8/openGym): semana de rotinas, treino guiado com descanso, progressão, 1RM, mapa muscular, calendário, peso corporal e importação do Strong, Hevy e FitNotes. Nenhum código do openGym foi copiado. A física vem do Torquímetro: cada exercício é uma alavanca, τ(θ) = F·|L·sen(θ−γ)| + d₀, e o trabalho de uma repetição é a área sob essa curva.

**Para usar:** abra `index.html` no navegador. Não precisa instalar nada.

## O que tem

| Tela | O que faz |
| --- | --- |
| Hoje | Treino do dia, sugestões em alta para a rotina, treino guiado com cronômetro de descanso |
| Plano | Programas prontos (PPL, superior/inferior, corpo inteiro, cinco dias e programas vindos das redes), rotinas próprias, leitura de posts de treino colados de redes sociais |
| Biblioteca | 157 exercícios com curva de torque, região de maior tensão (alongado, meio, encurtado), músculos e dicas; busca com autossugestão em português, inglês e espanhol; seção **Em alta nas redes** |
| Progresso | Recordes, 1RM estimado, volume e trabalho em joules, calendário, peso corporal, cobertura por grupo |
| Laboratório | Comparação de exercícios lado a lado e duelos de alavanca |
| Ajustes | Perfil, anilhas, equipamento, renovação semanal, backup e importação |

## Em alta nas redes

48 exercícios têm um **termômetro** calculado a partir de buscas no TikTok e no YouTube:

- **TikTok:** vídeos encontrados com o nome do exercício e páginas de busca que o próprio TikTok cria. O ID de cada vídeo guarda a data de publicação (os 32 bits altos são o horário Unix), e daí sai a tendência.
- **YouTube:** quantos resultados relevantes e quantos são shorts; na coleta pelo app, também visualizações e idade dos vídeos.
- **Fórmula:** termômetro = 45% presença no TikTok + 30% momento + 25% presença no YouTube. Viral a partir de 70, em alta a partir de 58, nicho a partir de 45.
- **Veredito:** compara o que os vídeos prometem (por exemplo, "carrega o alongado") com a curva de torque calculada.

O Instagram não entra na conta porque não deixa buscadores indexarem reels; o app só abre a hashtag lá.

### Renovação semanal

O próprio app renova a parada na primeira abertura de cada semana (a semana começa na segunda) e mostra a data e a hora da renovação. Cada semana fica num arquivo com a parada daquele dia. **Nenhum exercício sai do acervo:** quem entrou numa semana continua na biblioteca e aparece nas semanas seguintes.

| Fonte da renovação | Quando acontece |
| --- | --- |
| Varredura completa | Levantamento feito fora do app com `tools/atualizar.py` e publicado em `alta.json` |
| Arquivo de atualização | O app encontrou um `alta.json` mais novo ao lado da página |
| Coleta no YouTube | O app aberto como artifact no Claude para computador lê as buscas do YouTube pelo navegador do Claude |
| Renovação automática | Sem coleta possível: o termômetro é recalculado na data do dia com o último sinal medido |

Nos Ajustes dá para desligar a renovação automática ou a leitura do YouTube, renovar à mão e exportar ou importar o arquivo de semanas para outro aparelho (as semanas se somam, nada é apagado).

O TikTok pede verificação a navegadores automatizados, então o sinal do TikTok só muda nas varreduras completas.

### Varredura completa (manual)

1. Para cada exercício, faça uma busca restrita a `tiktok.com` e outra a `youtube.com` com o termo de `BUSCAS_ALTA` (em `src/nucleo/alta.js`).
2. Junte os links num arquivo no formato de `tools/exemplo-bruto.json`.
3. Rode:

```bash
python3 tools/atualizar.py alta.json bruto.json > alta_nova.json && mv alta_nova.json alta.json
```

O script não inventa números: tudo sai dos links. Exercícios novos entram por `"novos"`, copiando a alavanca de um exercício parecido (`baseId`).

## Desenvolvimento

Requisitos: Node 18 ou mais novo. Os testes de navegador usam Python 3 com Playwright.

```bash
npm run build   # monta index.html, dist/artifact.html e dist/nucleo.js a partir de src/
npm test        # build + testes de unidade (física, redes, em alta, renovação)
npm run check   # falha se index.html não corresponde a src/ (usado na CI)
npm run e2e     # testes de ponta a ponta com Playwright (opcional)
npm run serve   # serve a pasta em http://localhost:8000 (necessário para ler alta.json)
```

`index.html` é gerado, mas fica no repositório para o app funcionar direto no GitHub Pages ou baixando o arquivo. Edite sempre em `src/` e rode `npm run build` antes do commit.

```
src/
  nucleo/      lógica sem interface, na ordem em que é montada
    base.js        constantes físicas, exercícios-base, capacidade e aderência
    duelos.js      comparações prontas do Torquímetro
    musculos.js    músculos, regras de identificação e dicas
    logica.js      perfil de torque, trabalho, 1RM, progressão, anilhas, recuperação, CSV, programas
    social.js      redes, leitor de posts de treino, sinônimos em pt/en/es
    alta.js        pesquisa em alta, termômetro, veredito, autossugestão
    renovacao.js   semanas, leitura do YouTube, arquivo de renovações
  ui/          telas, ações e a coleta pelo navegador do Claude
  estilo.css   tema claro e escuro
  casca.html   estrutura da página
tools/         build, atualização semanal e dados brutos das pesquisas
tests/         testes de unidade (.cjs) e de ponta a ponta (e2e/)
alta.json      pesquisa e semanas publicadas ao lado da página
```

## Publicar

- **GitHub Pages:** em Settings → Pages, escolha "Deploy from a branch", branch `main`, pasta `/ (root)`. A página lê `alta.json` da mesma pasta.
- **Artifact no Claude:** publique `dist/artifact.html` com `alta.json` ao lado, declarando as capacidades `db`, `user` e `mcp` (servidor `host:claude_browser`, ferramentas `navigate` e `get_page_text`). A coleta no YouTube só funciona com a página aberta no Claude para computador; em qualquer outro lugar o app cai na renovação automática.

## Limites

É um modelo de demanda mecânica no segmento principal: não mede ativação de fibras, músculos individuais nem custo energético. O termômetro mede presença em buscas, não alcance real. Não substitui orientação profissional.
