## Decisoes durante o desenvolvimento tanto nos mocks quanto para referencia.

-MockProfile e mockTask 1. mockprofile renomeado para accountmock 2. mocktask movido junto de mockprofile para src/data assim faiclitando os dados mockados de serem lidos

-ao usar o tipo modulo no js condiciono necessariamewnte o funcionamento do site a estar no liveserver, entao para visualizar os dados mockados o site tem que estar rodando; (botao direito liveserver se voe tiver ocm a extencao do vscode se nao use o terminal)

## Participacao de IA no desenvolvimento

A participacao de ferramentas de IA fica documentada aqui, e nao nos commits (os commits nao levam trailer `Co-Authored-By` de IA).

- Claude Code (Anthropic) atuou como assistente de desenvolvimento e lead da orquestracao: auditoria do projeto contra o Figma, spec dos requisitos, revisao e integracao dos diffs, testes no navegador e correcoes.
- Workers delegados via Alethe (Codex, em worktrees ou no checkout, sob arquivos de propriedade disjunta) escreveram a primeira versao de varias telas: autenticacao, Tarefas/Tarefa aberta, Historico/Chat, Configuracoes/Seguranca, Suporte e landing.
- Todo diff de worker foi lido e conferido pelo lead antes de entrar (check estatico de links/imports/ids + teste manual no navegador); o que falhou foi corrigido ou refeito.
- A direcao do produto, o design (Figma), as decisoes de escopo e a aprovacao final sao das pessoas do grupo.
