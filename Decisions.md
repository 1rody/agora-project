## Decisoes durante o desenvolvimento tanto nos mocks quanto para referencia.

-MockProfile e mockTask 1. mockprofile renomeado para accountmock 2. mocktask movido junto de mockprofile para src/data assim faiclitando os dados mockados de serem lidos

-ao usar o tipo modulo no js condiciono necessariamewnte o funcionamento do site a estar no liveserver, entao para visualizar os dados mockados o site tem que estar rodando; (botao direito liveserver se voe tiver ocm a extencao do vscode se nao use o terminal)

## Decisoes da rodada de finalizacao (telas do Figma)

- Contas agora sao persistidas em localStorage (`agora-accounts`): o registro cria a conta de verdade, o login valida contra elas e a sessao guarda o id do perfil. Perfil novo comeca sem tarefas nem historico.
- A landing (`index.html`) abre o login pelo botao DOWNLOAD; SAIBA MAIS rola ate uma secao na propria pagina.
- O Historico e aberto por um link na tela Tarefas.
- Privacidade e dados e uma tela nova (exportar e apagar dados do perfil); Dispositivos permite encerrar a sessao dos aparelhos que nao sao o atual.
- A troca de senha ficou inline na tela Seguranca; a pagina `recovery/ChangePass.html` foi removida.
- O chat de nova tarefa entende periodos como "do dia 10/06 ate o dia 11", e o microfone usa a Web Speech API quando existe (senao fica desabilitado).
- `body` passou a definir a cor do texto pelo tema: so `h1/h2/span/p` tinham cor, e labels, `select` e `h3` ficavam pretos no tema escuro.
- As cores de prioridade sao mais escuras no tema claro, por contraste.

## Participacao de IA no desenvolvimento

A participacao de ferramentas de IA fica documentada aqui, e nao nos commits (os commits nao levam trailer `Co-Authored-By` de IA).

- Claude Code (Anthropic) atuou como assistente de desenvolvimento e lead da orquestracao: auditoria do projeto contra o Figma, spec dos requisitos, revisao e integracao dos diffs, testes no navegador e correcoes.
- Workers delegados via Alethe (Codex, em worktrees ou no checkout, sob arquivos de propriedade disjunta) escreveram a primeira versao de varias telas: autenticacao, Tarefas/Tarefa aberta, Historico/Chat, Configuracoes/Seguranca, Suporte e landing.
- Todo diff de worker foi lido e conferido pelo lead antes de entrar (check estatico de links/imports/ids + teste manual no navegador); o que falhou foi corrigido ou refeito.
- A direcao do produto, o design (Figma), as decisoes de escopo e a aprovacao final sao das pessoas do grupo.
