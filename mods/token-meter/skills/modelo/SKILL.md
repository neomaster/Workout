---
name: modelo
description: OBRIGATÓRIA quando a mensagem do usuário começa com "tokens" ou "modelo" (ex.: "tokens: <tarefa>", "modelo: <tarefa>") ou pergunta qual o melhor modelo ou quanto resta de tokens. Nesses casos NÃO execute a tarefa; diga o melhor modelo (Opus, Sonnet ou Haiku) com barras comparativas e o uso de tokens só se o ambiente informar.
---

# Modelo e tokens

## 1. Uso de tokens

Mostre o uso e o restante **só se o ambiente informar números reais** (ex.: o Claude Code com o
mod token-meter, que tem o comando `/tokens` com o painel). Nunca invente números: se esta versão
não expõe o uso, diga isso em uma linha.

Barra de 20 células: `█` para usado, `░` para restante. Ex.: `█████████░░░░░░░░░░░ 45%`.

## 2. Melhor modelo para a tarefa

Procure no texto da tarefa palavras que **começam** com:

- **Haiku** (tarefa leve): renom, format, tradu, transl, resum, summar, list, typo, coment,
  simples, rápid, quick, explic
- **Opus** (exige raciocínio): arquitet, architect, refat, refactor, segur, secur, otimiz,
  optimiz, migra, projet, debug, algorit, concorr

Mais palavras de Opus → **Opus**. Mais de Haiku → **Haiku**. Empate ou nenhuma → **Sonnet**.
Texto com mais de 1500 caracteres desempata para Opus. Diga quais palavras decidiram.

## 3. Barras comparativas (estimativa qualitativa, 0-10 — não é benchmark)

| | Raciocínio | Código | Velocidade | Custo-benefício |
|---|---|---|---|---|
| Opus | 10 | 9 | 4 | 2 |
| Sonnet | 8 | 8 | 7 | 6 |
| Haiku | 6 | 6 | 10 | 10 |

Desenhe uma barra de 10 células por modelo em cada critério (`██████████` = 10) e marque o
recomendado com ★.
