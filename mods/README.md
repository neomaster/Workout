# Mods do Claude Code

Os mods desta pasta carregam em **todas** as sessões do Claude Code depois de instalados uma vez.
A pasta do repositório é o marketplace: o Claude Code lê os mods direto dela, então uma edição
vale com `/reload-plugins`, sem reinstalar.

## Configurar (uma vez)

No terminal (PowerShell no Windows):

```
git clone -b claude/ecstatic-ptolemy-d87wbs https://github.com/neomaster/Workout C:\Users\<voce>\Workout
claude plugin marketplace add C:\Users\<voce>\Workout
claude plugin install token-meter@workout-mods
claude plugin install prompt-saver@workout-mods
```

Depois abra o Claude Code (`claude`) em qualquer pasta: os comandos já estão lá.

## Criar um mod novo

```
node mods/novo-mod.mjs meu-mod "o que ele faz"
claude plugin install meu-mod@workout-mods
```

Isso cria `mods/meu-mod/` com o comando `/meu-mod` funcionando e o registra no marketplace.
Edite `mods/meu-mod/hooks/register.tsx` e rode `/reload-plugins` no Claude Code para ver a mudança.
Para checar antes: `claude plugin validate mods/meu-mod`.

## token-meter
- `/tokens` abre o painel (contexto, limites 5h/7d, melhor modelo, comparativo, medição).
- `/best-model <tarefa>` recomenda Opus, Sonnet ou Haiku.
- Palavras-chave: edite `KEYWORDS` em `token-meter/hooks/logic.ts` (`haiku` = leve, `opus` = difícil).

## prompt-saver
- `/dense <prompt>` compacta por regras; `/dense-ai <prompt>` reescreve com Haiku; `/dense-auto on|off`.
