# Torquímetro Gym

Plano, registro e progresso de treino com a física de cada exercício. É um app de **arquivo único**, em português, sem servidor e sem conta: tudo fica no navegador de quem usa.

O escopo de aplicativo segue o [openGym](https://github.com/DuarteSantos8/openGym): semana de rotinas, treino guiado com descanso, progressão, 1RM, mapa muscular, calendário, peso corporal e importação do Strong, Hevy e FitNotes. Nenhum código do openGym foi copiado. A física vem do Torquímetro: cada exercício é uma alavanca, τ(θ) = F·|L·sen(θ−γ)| + d₀, e o trabalho de uma repetição é a área sob essa curva.

**Para usar:** abra `index.html` no navegador. Não precisa instalar nada.

## O que tem

| Tela | O que faz |
| --- | --- |
| Hoje | Treino do dia, sugestões em alta para a rotina, treino guiado com cronômetro de descanso, rampa de aquecimento automática e nota fixa por exercício |
| Plano | Programas prontos (PPL, superior/inferior, corpo inteiro, cinco dias e programas vindos das redes), rotinas próprias, rotina compartilhada por link, leitura de posts de treino colados de redes sociais |
| Biblioteca | 157 exercícios com curva de torque, região de maior tensão (alongado, meio, encurtado), músculos e dicas; busca com autossugestão em português, inglês e espanhol; seção **Em alta nas redes** |
| Progresso | Plano × feito por músculo, recordes, 1RM estimado, volume e trabalho em joules, calendário, peso corporal, cobertura por grupo |
| Laboratório | Comparação de exercícios lado a lado e duelos de alavanca |
| Ajustes | Conta Google e sincronização, perfil, anilhas, equipamento, renovação semanal, backup em JSON, treinos em CSV (formato do Hevy) e importação do Strong, Hevy e FitNotes |

### Funções de treino

- **Rampa de aquecimento:** no treino, “+ rampa de aquecimento” monta as séries até a carga da primeira série válida, arredondadas ao passo das suas anilhas. Com barra, começa na barra vazia (100 kg → 20×10, 40×8, 60×5, 80×3). Tocar de novo refaz a rampa sem duplicar e mantém as séries de aquecimento já feitas.
- **Nota fixa por exercício:** ajuste do banco, pino da máquina, pegada. Aparece no treino e na ficha do exercício e vai junto no CSV.
- **Plano × feito:** séries por músculo nos últimos 7 dias contra o que a semana do plano prevê (secundário conta meia), com a aderência em porcentagem e quem ficou para trás.
- **Rotina por link:** “Compartilhar” gera um link com a rotina inteira no endereço (nada passa por servidor). Quem abre vê a rotina e decide se importa. O link também pode ser colado em Plano → Importar rotina.
- **Carga da semana:** um medidor na tela Hoje compara o trabalho mecânico dos últimos 7 dias com a média semanal das 4 semanas anteriores. Abaixo de 0,8× é semana leve, de 0,8× a 1,3× está na faixa, acima de 1,5× é salto brusco.
- **Medidas corporais:** cintura, quadril, peito, braço, coxa, panturrilha e % de gordura em Progresso, com gráfico por medida, variação desde o primeiro registro e as razões cintura ÷ altura e cintura ÷ quadril. Vão junto na sincronização com a conta.
- **Imagem do treino:** ao salvar um treino (ou ao abrir um do histórico), “Imagem para compartilhar” gera um cartão 1080 × 1350 com séries, volume, trabalho, onde caiu a tensão e a melhor série de cada exercício. No celular abre o menu de compartilhar; no computador, baixa o PNG.
- **Cargas por % do 1RM:** na ficha de cada exercício, a tabela de 100% a 50% do seu 1RM estimado, arredondada às suas anilhas, com as repetições possíveis em cada faixa.
- **CSV:** os treinos saem no formato do Hevy, com uma coluna a mais com o id do exercício, e voltam pela própria importação sem perder nada.

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
    extras.js      rampa de aquecimento, plano × feito, CSV, rotina por link, mescla com a nuvem
    cinesiologia.js  modelo cinesiológico e análise de vídeo (pura, testada com quadros sintéticos)
    anatomia.js    músculos (origem, inserção, inervação, ação, plano), amplitudes articulares e cadeias musculares
    biomecanica.js análise cinesiológica de cada exercício e de cada grupo ou músculo, sem precisar de vídeo
  ui/          telas, ações, coleta pelo navegador do Claude e sincronização com a nuvem
  cadastro.html  página de cadastro com Google (o build gera a da raiz)
  nuvem.config.json  endereço e chave publicável do Supabase
  estilo.css   tema claro e escuro
  casca.html   estrutura da página
tools/         build, atualização semanal e dados brutos das pesquisas
icones/        ícones do app instalável
manifest.webmanifest, sw.js   app instalável e modo offline
supabase/      migrações do banco (cadastro, treinos, estado, RLS)
vendor/        supabase-js 2.117.3 (MIT), servido junto para funcionar offline
tests/         testes de unidade (.cjs) e de ponta a ponta (e2e/)
alta.json      pesquisa e semanas publicadas ao lado da página
```

## Cadastro com Google e banco de dados

`cadastro.html` é a página de cadastro: **Entrar com o Google**, completar o perfil (apelido, altura, massa, objetivo, experiência, dias por semana, local) e pronto. No app, **Ajustes → Conta e nuvem** mostra a conta e sincroniza. A sincronização roda sozinha ao abrir o app e depois de cada treino salvo ou excluído. Sem cadastro, o app continua funcionando só com o navegador.

O banco é um projeto do Supabase (`torquimetro-gym`, São Paulo). O esquema está em `supabase/migrations/`:

| Tabela | O que guarda |
| --- | --- |
| `perfis` | Um cadastro por conta Google, criado sozinho no primeiro login com nome, e-mail e foto; o formulário completa o resto |
| `treinos` | Um treino por linha, com as séries em `itens` (jsonb). `apagado` leva exclusões de um aparelho a outro |
| `estado_app` | Rotinas, semana do plano, ajustes, peso corporal, notas e exercícios próprios |

Cada pessoa só lê e altera as próprias linhas (RLS em todas as tabelas). O perfil só aceita mudança nos campos do formulário, nunca no dono ou no e-mail. A chave publicável em `src/nuvem.config.json` é pública por natureza: quem protege os dados são essas regras.

Na sincronização, um treino que mudou só de um lado vence; se mudou dos dois lados, fica o do aparelho e ele sobe. Dados de exemplo nunca sobem. Na primeira sincronização de um aparelho que já tinha rotinas, elas se somam às da conta.

### Ativar o login com Google (uma vez)

1. No [Google Cloud Console](https://console.cloud.google.com/auth/clients), crie um **OAuth client ID** do tipo **Web application**. Em **Authorized JavaScript origins**, ponha `https://neomaster.github.io` (e `http://localhost:8000` para testar). Em **Authorized redirect URIs**, ponha `https://pfyldwzlnvhjuzvtyise.supabase.co/auth/v1/callback`.
2. No Supabase, em **Authentication → Sign In / Providers → Google**, ligue o provedor e cole o Client ID e o Client Secret.
3. Em **Authentication → URL Configuration**, defina **Site URL** como `https://neomaster.github.io/Workout/` e adicione em **Redirect URLs** `https://neomaster.github.io/Workout/**` e `http://localhost:8000/**`.

Até isso ser feito, o botão do Google mostra "O login com Google ainda não foi ativado neste projeto".

## Instalar no celular

Servido pelo GitHub Pages (ou qualquer servidor https), o app é instalável: no Chrome do Android, “Adicionar à tela inicial”; no Safari do iPhone, Compartilhar → “Adicionar à Tela de Início”. Depois da primeira visita ele abre sem internet. A página fica no cache e se atualiza em segundo plano, então uma versão nova aparece na abertura seguinte. `alta.json` tenta a rede primeiro.

## Cinesiologia e análise de vídeo

Cada exercício tem um modelo cinesiológico montado por regra a partir do nome, do grupo e da alavanca (`src/nucleo/cinesiologia.js`): padrão de movimento (26 padrões, de agachamento a puxada vertical), tipo de cadeia cinética, ações articulares com o plano de cada uma, agonistas, sinergistas e estabilizadores, o que a curva de torque pede, cadência sugerida (por exemplo 3-1-1-0 quando o pico está no alongado), a execução passo a passo e os erros comuns com a correção. Aparece na ficha do exercício, em **Cinesiologia: como executar**.

### Análise cinesiológica sem vídeo

A ficha de cada exercício tem também uma **Análise cinesiológica** completa (`src/nucleo/biomecanica.js`, com a base em `src/nucleo/anatomia.js`):

- **Movimento articular**: ação concêntrica e excêntrica de cada articulação, plano e eixo, e a amplitude anatômica de referência (por exemplo, quadril com flexão de ≈125° e extensão de ≈10°).
- **Mecânica**: tipo de cadeia cinética, classe de alavanca, onde o braço de momento da resistência é máximo, se a força comprime ou traciona a articulação e qual intenção faz cada músculo liderar.
- **Músculos no movimento**: agonistas, sinergistas, estabilizadores e antagonistas, com a ação de cada um neste exercício, o tipo de contração e o comprimento em que trabalha.
- **Biarticulares**: insuficiência ativa e passiva de reto femoral, isquiotibiais, gastrocnêmio e das cabeças longas do bíceps e do tríceps, conforme a posição do exercício (panturrilha sentada isola o sóleo, flexora sentada alonga os isquiotibiais, tríceps francês alonga a cabeça longa e assim por diante).
- **Torque × força-comprimento**: o pico da curva do app cruzado com a relação força-comprimento e com a alavanca do próprio músculo.
- **Cadeias musculares** envolvidas (trilhos de Myers, cadeias de Souchard e tendências do GDS), **compensações e segurança**, e a **anatomia dos agonistas** (origem, inserção, inervação, ação e plano).

Na Biblioteca, ao escolher uma categoria ou tocar num músculo do mapa, aparece a **Análise cinesiológica do grupo**:

- como os músculos movem o corpo (articulações, ações, biarticulares, antagonistas e onde atuam como sinergistas);
- onde fica o pico de torque nos exercícios do grupo e quais padrões e cadeias eles usam;
- quantos exercícios treinam cada ação, no grupo e fora dele;
- a combinação sugerida para cobrir o alongado, o encurtado e as duas posições do biarticular;
- as ações que nenhum exercício da biblioteca treina diretamente.

Bases resumidas com palavras próprias:

- CAMPOS, M. A. *Biomecânica da Musculação*. Rio de Janeiro: Sprint, 2000.
- *Como funcionam as cadeias musculares* (e-book, Pilates QC).
- Quadros *Músculo: origem e inserção*.

Onde a prática atual diverge do livro (puxada por trás da nuca, por exemplo), a ficha diz qual é qual.

### Vídeos

Nos vídeos das indicações (TikTok, YouTube, Instagram e os salvos), a ficha mostra **o que observar** segundo o modelo. Para avaliar um vídeo, **Avaliar um vídeo da execução** abre o analisador:

- O MediaPipe Pose roda no próprio navegador (o vídeo não sai do aparelho) e marca os 33 pontos do corpo a cada 0,1 s.
- O analisador acompanha o ângulo da articulação principal do padrão (joelho, quadril, cotovelo, ombro ou tornozelo), conta as repetições e mede amplitude, descida e subida de cada uma.
- O resultado compara com o modelo: amplitude completa ou cortada (avisando quando a parte cortada é justamente a do pico de torque), cadência, consistência entre repetições, simetria entre os lados e estabilidade do tronco.

O vídeo pode vir de dois lugares:

- **Link do YouTube, TikTok ou Instagram** (incluindo Shorts e Reels, e os botões **Avaliar** ao lado dos vídeos das indicações e dos salvos). Essas redes não deixam uma página ler o arquivo do vídeo, então o app mostra o vídeo num player incorporado e, com a sua permissão de captura da aba, lê só a imagem da área do player enquanto o vídeo toca. Funciona no Chrome, Edge e Firefox de computador; celulares não têm captura de aba.
- **Arquivo do aparelho**: um vídeo salvo ou a gravação da sua própria série; funciona também no celular. O modelo de pose vem do jsDelivr e do Google na primeira análise, então funciona no GitHub Pages e com `npm run serve`, não dentro do visualizador do Claude. A estimativa erra alguns graus: é uma segunda opinião, não um laudo.

## Acessibilidade

`npm run a11y` passa o axe-core (WCAG 2 A e AA) em todas as telas e na página de cadastro, nos temas claro e escuro; hoje não há violações. Para isso o rosa, o verde, o azul e o âmbar do tema claro ficaram um pouco mais escuros, e no tema escuro o texto sobre cor de destaque passou a ser escuro.

## Publicar

- **GitHub Pages:** em Settings → Pages, escolha "Deploy from a branch", branch `main`, pasta `/ (root)`. A página lê `alta.json` da mesma pasta.
- **Artifact no Claude:** publique `dist/artifact.html` com `alta.json` ao lado, declarando as capacidades `db`, `user` e `mcp` (servidor `host:claude_browser`, ferramentas `navigate` e `get_page_text`). A coleta no YouTube só funciona com a página aberta no Claude para computador; em qualquer outro lugar o app cai na renovação automática.

## Limites

É um modelo de demanda mecânica no segmento principal: não mede ativação de fibras, músculos individuais nem custo energético. O termômetro mede presença em buscas, não alcance real. Não substitui orientação profissional.
