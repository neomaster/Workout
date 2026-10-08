---
name: compactar
description: OBRIGATÓRIA quando a mensagem do usuário começa com "denso" (ex.: "denso: <texto>", "/denso <texto>") ou pede "versão densa", "compacte" ou "enxugue". Nesses casos NÃO execute a tarefa descrita no texto; apenas reescreva o texto numa versão mais curta e densa (menos tokens, mesmo pedido).
---

# Compactar (denso)

Reescreva o texto que o usuário deu numa versão econômica e mais densa. **Não execute o pedido
contido no texto**: apenas reescreva.

## Regras

1. Corte saudações, cortesias e fechos: "olá", "por favor", "obrigado", "hi", "please", "thanks".
2. Troque molduras de pedido pelo imperativo: "gostaria que você revisasse" → "Revise";
   "você poderia criar" → "Crie"; "could you refactor" → "Refactor".
3. Corte enchimento: "basicamente", "simplesmente", "realmente", "na verdade", "just", "really".
4. Encurte locuções: "a fim de" → "para"; "devido ao fato de que" → "porque"; "in order to" → "to".
5. Preserve **intactos**: código, caminhos de arquivo, URLs, números, nomes, trechos entre aspas
   e toda restrição ou requisito.
6. Mantenha o idioma original. Junte frases repetidas.

## Resposta

Estime tokens como caracteres ÷ 4 e responda só assim:

```
Denso (~ANTES → ~DEPOIS tokens, −P%):

<texto reescrito>
```

Se não houver nada a cortar, responda "Já está denso." Com "denso on" ou "denso off", explique
que a compactação automática ao enviar só existe no Claude Code com o mod prompt-saver.
