# Instruções para o Claude: instalar o Pacote de Mods do Claude

Este arquivo é para você, Claude. A pessoa que pediu a instalação é iniciante:
fale com ela em português simples, sem termos técnicos, sem mostrar código,
caminhos de configuração ou comandos. Faça o trabalho técnico você mesmo.

O pacote tem 10 mods do Claude Code (plugins de function hooks), um por pasta,
dentro da pasta `mods` ao lado deste arquivo:

| Pasta | Nome para a pessoa | O que faz |
| --- | --- | --- |
| gerenciador-mods | Gerenciador de Mods | `/mods` abre um painel para ligar e desligar cada mod |
| barra-uso | Barra de Uso | Contexto, limite de 5 horas e da semana acima da caixa de texto |
| recibo-resposta | Recibo da Resposta | Resumo do que o Claude fez depois de cada resposta |
| campainha-pronto | Campainha de Pronto | Som e aviso com um sininho quando o Claude termina |
| guarda-costas | Guarda-costas | Pergunta antes de apagar, mover ou sobrescrever arquivos |
| diario-tarefas | Diário de Tarefas | Barra de progresso das tarefas e painel `/diario` |
| ponto-restauracao | Ponto de Restauração | Guarda uma cópia antes de o Claude mudar um arquivo; `/voltar` desfaz |
| modo-gravacao | Modo Gravação | `/gravando` esconde e-mails, valores e senhas da tela |
| explica-simples | Explica Simples | `/simples` reescreve a última resposta em palavras simples |
| livro-prompts | Livro de Prompts | `/salvar` guarda uma mensagem; `/livro` mostra as salvas |

## Instalar

1. **Confira a versão.** Mods precisam do Claude Code 2.1.287 ou mais novo.
   Se a versão for mais antiga, peça para a pessoa atualizar o app e pare aqui.
2. **Copie a pasta `mods` inteira para um lugar fixo**, para continuar
   funcionando mesmo que a pessoa apague o download:
   `<pasta do usuário>/.claude/mods-pacote/` (no Windows,
   `%USERPROFILE%\.claude\mods-pacote\`). Copie também este arquivo para lá.
   Não altere nada dentro das pastas dos mods. Se já existir uma instalação
   anterior, substitua as pastas dos mods.
3. **Ative os mods em todas as conversas** no arquivo de configurações do
   usuário, `<pasta do usuário>/.claude/settings.json`:
   - Antes, faça uma cópia de segurança: `settings.json.antes-dos-mods`.
   - Leia o JSON, mantenha tudo o que já existe e, dentro de `"env"`
     (crie se não existir):
     - `CLAUDE_CODE_PLUGIN_DIRS`: o caminho absoluto de cada uma das 10 pastas
       de mod copiadas, separados por `;` no Windows ou `:` no macOS e Linux.
       Se a variável já tiver outros caminhos, mantenha-os e acrescente os
       novos, sem repetir.
       **O caminho do `gerenciador-mods` tem que ser o PRIMEIRO da lista**:
       o Claude Code só deixa um mod desligar os que vêm depois dele.
     - `CLAUDE_CODE_PLUGIN_DIR_WATCH`: `"1"`.
   - Grave o JSON válido de volta e leia de novo para confirmar.
4. **Confira cada mod**, se o comando estiver disponível:
   `claude plugin validate <pasta do mod>`. Se algum falhar, diga à pessoa
   qual mod não funcionou, em linguagem simples, e siga com os outros.
5. **Explique para a pessoa**, com estas palavras ou parecidas:
   > Pronto! Os mods estão instalados. Eles aparecem nas conversas novas:
   > clique em **+ Novo**, abra uma conversa e digite **/mods** para ver
   > todos e ligar ou desligar cada um.

## Instalar só alguns mods

Se a pessoa pediu só um ou alguns mods (pelo nome da tabela acima), faça os
mesmos passos da instalação, mas copie e ative apenas as pastas desses mods.
Mods que já estavam instalados continuam como estão. O Gerenciador de Mods é
recomendado junto: se ele ainda não estiver instalado, pergunte à pessoa se
quer instalar também, explicando que ele serve para ligar e desligar os mods.

## Desinstalar

Quando a pessoa pedir para desinstalar:

1. Em `<pasta do usuário>/.claude/settings.json`, dentro de `"env"`, tire de
   `CLAUDE_CODE_PLUGIN_DIRS` os caminhos que apontam para
   `.claude/mods-pacote`. Se não sobrar nenhum caminho, apague a variável e
   também `CLAUDE_CODE_PLUGIN_DIR_WATCH`. Não mexa no resto do arquivo.
2. Apague a pasta `<pasta do usuário>/.claude/mods-pacote`, depois de
   confirmar com a pessoa.
3. Diga: "Pronto, os mods foram removidos. As conversas novas já abrem sem eles."
