# Mods do Claude Code

Dois mods que carregam em **todas** as sessões depois de instalados no escopo de usuário.

## Instalar (uma vez, no terminal do Claude Code)

```
/plugin install token-meter --marketplace neomaster/workout
/plugin install prompt-saver --marketplace neomaster/workout
```

Responda `y` em "Add marketplace?" e escolha o escopo **user**.

## token-meter
- `/tokens` abre o painel (contexto, limites 5h/7d, melhor modelo, comparativo, medição).
- `/best-model <tarefa>` recomenda Opus, Sonnet ou Haiku.
- Palavras-chave: edite `KEYWORDS` em `token-meter/hooks/logic.ts` (`haiku` = leve, `opus` = difícil).

## prompt-saver
- `/dense <prompt>` compacta por regras; `/dense-ai <prompt>` reescreve com Haiku; `/dense-auto on|off`.
