# Mods do Claude Code

## Instalar (uma vez)

```
git clone -b claude/ecstatic-ptolemy-d87wbs https://github.com/neomaster/Workout
node Workout/mods/instalar.mjs
```

Pronto: em toda sessão do Claude Code as palavras-chave abaixo já funcionam.
Rodar `instalar.mjs` de novo não estraga nada.

## Palavras-chave

| Digite | O que faz |
|---|---|
| `/tokens` | Uso e restante de tokens, limites do plano e custo, em barras; abre o painel gráfico |
| `/tokens <tarefa>` | O mesmo, e diz o melhor modelo (Opus, Sonnet ou Haiku) para a tarefa |
| `/denso <texto>` | Versão econômica e mais densa do texto, já colocada na caixa de prompt |
| `/denso on` / `/denso off` | Liga ou desliga a compactação automática ao enviar |

`/denso` usa regras locais (grátis); só quando elas cortam menos de 10% de um texto
com 80 caracteres ou mais é que pede uma reescrita ao Haiku.

## Criar um mod novo

```
node Workout/mods/novo-mod.mjs meu-mod "o que ele faz"
```

Cria `mods/meu-mod/` com o comando `/meu-mod` funcionando e já instala.
Edite `mods/meu-mod/hooks/register.tsx` e, no Claude Code, rode `/reload-plugins`.

## Ajustes

- Palavras que escolhem o modelo: `KEYWORDS` em `token-meter/hooks/logic.ts`
  (`haiku` = tarefa leve, `opus` = tarefa difícil; o resto vai para Sonnet).
- Regras de compactação: `RULES` em `prompt-saver/hooks/dense.ts`.
