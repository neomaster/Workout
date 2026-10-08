# Mods do Claude

Cada mod tem duas partes:

- **o mod** (hooks): barras, painel e comandos grátis. Roda no Claude Code: terminal (CLI),
  aba Code do app desktop, extensão do VS Code e app mobile conectado a uma sessão do Claude Code.
- **a skill reserva**: o mesmo pedido, respondido pelo Claude. Roda onde há skills: Claude Code,
  Cowork e claude.ai.

## Palavras-chave

| Onde | Uso de tokens e melhor modelo | Prompt denso |
|---|---|---|
| Claude Code (CLI, desktop, VS Code, mobile) | `/tokens` ou `/tokens <tarefa>` | `/denso <texto>` · `/denso on` · `/denso off` |
| Cowork e claude.ai | `tokens: <tarefa>` | `denso: <texto>` |

No Claude Code o `/denso` é grátis (regras locais); só quando as regras cortam menos de 10% de
um texto com 80+ caracteres ele pede ao Haiku. Fora do Claude Code quem reescreve é o Claude.
O uso de tokens em barras só aparece onde o ambiente informa os números (Claude Code).

## Instalar

**Claude Code** (uma vez, no terminal):

```
git clone -b claude/ecstatic-ptolemy-d87wbs https://github.com/neomaster/Workout
node Workout/mods/instalar.mjs
```

**Cowork e claude.ai**: envie como skill os arquivos de `mods/skills-zip/`
(`compactar.zip` e `modelo.zip`) no menu de skills das configurações.

## Criar um mod novo

```
node Workout/mods/novo-mod.mjs meu-mod "o que ele faz"
node Workout/mods/empacotar.mjs
```

O primeiro cria `mods/meu-mod/` (comando `/meu-mod` e a skill reserva `meu-mod-skill`) e já
instala no Claude Code. O segundo gera `skills-zip/meu-mod-skill.zip` para o Cowork e o claude.ai.
Editou? No Claude Code rode `/reload-plugins`; para os outros, rode `empacotar.mjs` e reenvie o zip.

Não dê à skill o mesmo nome do comando: no Claude Code ela tomaria o lugar do comando do mod.

## Ajustes

- Palavras que escolhem o modelo: `KEYWORDS` em `token-meter/hooks/logic.ts` e a lista igual em
  `token-meter/skills/modelo/SKILL.md` (`haiku` = leve, `opus` = difícil; o resto vai para Sonnet).
- Regras de compactação: `RULES` em `prompt-saver/hooks/dense.ts` e
  `prompt-saver/skills/compactar/SKILL.md`.
