# agora-project

Projeto desenvolvido pela empresa fictícia **SALVATECH**, para a matéria de Processos de Software - UCSAL | Professor Elton.

## Como foi feito

- **HTML, CSS e JavaScript puros**, sem framework, sem build e sem `package.json`.
- Arquivos CSS e JS em **PascalCase** (`Globals.css`, `App.js`); páginas HTML em PascalCase dentro de `src/pages/`.
- O tema (claro/escuro) usa `prefers-color-scheme` e as variáveis de `src/styles/Theme.css`; o efeito de vidro está em `effects/LiquidGlass.css`.
- Os dados são **mocks em módulos JS** (`src/data/`) persistidos em `localStorage`/`sessionStorage`. Por usar módulos ES, o projeto precisa ser aberto por um servidor HTTP (veja "Como rodar").
- As decisões tomadas durante o desenvolvimento estão no [Decisions.md](./Decisions.md), junto com a participação de IA no projeto.

## Estrutura de pastas e arquivos

```
index.html                  landing pública
assets/icons/               ícones e logo
src/
├── login.html, Register.html, app.html
├── pages/
│   ├── Tarefas.html, TarefaAberta.html, History.html, NewTask.html
│   ├── RecoverAccount.html, Terms.html
│   ├── settings/           Settings, Security, Dispositivos, Privacidade
│   └── support/            Support (Fale conosco, Sobre, Ajuda)
├── scripts/                lógica de cada tela (Auth, Session, App, Tasks, Settings...)
├── data/                   mocks e persistência (AccountMock, MockTask, HistoryMock...)
└── styles/                 Globals.css, Theme.css e um arquivo por tela/componente
```

## Telas e fluxos

- **Landing** (`index.html`): apresentação e acesso ao app.
- **Autenticação**: login, registro com contas persistidas, termos, recuperação de conta por código e tela de entrada.
- **Início**: estatísticas, disposição do dia, tempo até o próximo compromisso, recomendação e próximas tarefas (concluir e adiantar).
- **Tarefas** e **Tarefa aberta**: filtros, dependências entre tarefas e ações de concluir/adiantar.
- **Histórico**: tarefas concluídas, adiadas e canceladas, com filtros.
- **Adicionar tarefa**: conversa em texto livre (ou voz, quando o navegador permite) que preenche prazo, título, tempo e prioridade.
- **Configurações**: perfil, segurança (e-mail de recuperação, trocar e-mail e senha), dispositivos e privacidade (exportar ou apagar dados).
- **Suporte**: fale conosco, como funciona (Sobre) e perguntas frequentes.

Conta de teste: `jhon@mail.com` (senha em `src/data/AgoraMock.js`). O relógio do protótipo é fixo (`NOW` em `AgoraMock.js`).

## Como rodar

### Localhost

Na raiz do projeto, inicie o servidor HTTP local:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Abra [a tela de login](http://127.0.0.1:8000/src/login.html). Também é possível abrir `src/login.html` com o Live Preview ou o Live Server. O navegador precisa carregar as páginas via HTTP para executar os módulos JavaScript.

### Deploy (Vercel)

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **Add New Project**
3. Selecione este repositório
4. Clique em **Deploy**
5. Pronto! A Vercel vai gerar um link de acesso (ou você pode adicionar um domínio personalizado)
