## 🔄 Fluxo de Colaboração no Repositório:

**Branch Base para Desenvolvimento**

- A branch principal para desenvolvimento será: **`main`**.
- Todas as branches dia devem ser criadas a partir da branch **`main`**.

**Fluxo de desenvolvimento:**

1. Crie sua branch a partir da **`main`**.
2. Faça commits e PRs sempre com base na **`main`**.
3. Após a aprovação do PR, a branch será mesclada na **`main`**.
---

## ✏️ Regras para Revisão de Código: 
O principal objetivo da revisão é diminuir bugs e garantir um melhor entendimento das ações realizadas no código.
Durante a revisão, é importante:


1. **Seguir um padrão consistente de nomenclatura de variáveis e formatação do código.**
2. **Identificar e corrigir bugs e código redundante.**
3. **Informar claramente sobre todas as alterações feitas.**
4. **Verificar se as implementações estão de acordo com os requisitos do projeto; caso contrário, buscar entender o motivo e explicar para o grupo.**
---

## 📄 Padrão para Criação de Branches

A nomeclatura das branches devem seguir o padrão:

**`<type>/<description>`**

Onde:

- **Type**: Define o propósito da branch.
    - **`feat`**: Para novas funcionalidades.
    - **`fix`**: Para correções de bugs.
    - **`refactor`**: Para refatoração de código.
    - **`docs`**: Para documentação.
    - **`test`**: Para adição ou modificação de testes.
- **Description**: Uma breve descrição do que será desenvolvido ou alterado.

**Exemplo:**

- **`feat/login-page`**

- **`fix/email-bug`**

- **`refactor/api-rout`**

- **`docs/api-description`**

## 📄 Padrão de Comentário de Commit

**`<type>(branch_name):what_was_done_in_the_commit`**

Todos os commits devem seguir a estrutura:

**Exemplo:**

- **`fix(email-bug): fixes template formatting error`**
- **`refactor(notifications-module): simplifies notification sending logic`**

**Boas práticas:**

- Commits menores e frequentes.
- Mensagens no imperativo, como "add", "fix", "refactor".

## 📄 Padrão para Pull Requests

**Título:** Segue o mesmo padrão dos commits: **`<type>(branch): brief description`**.

**Descrição:**

A descrição do PR deve incluir:

1. O propósito do Pull Request
2. Alterações realizadas.
3. Passos para teste.

## 📄 Padrão de nomenclatura de variáveis e funções:
- Todas devem seguir o padrão **`camelCase`** e ser escritas em **inglês**.
---


## Como Instalar <>

1. Certifique-se que o node esteja devidamente instalado.
2. Clone o repositório.
```jsx
git clone URL_DO_REPOSITÓRIO
```
3. Vá em terminal e abra o novo terminal.
4. Com o terminal aberto, escreva essa sentença abaixo e dê enter:
```jsx
npm install express sqlite3 bcrypt cors cookie-parser @google/generative-ai pdfkit dotenv
```

## 📂 Descrição das dependências

`express`: Framework minimalista para criação de servidores web em Node.js.

`sqlite3`: Biblioteca para utilizar o banco de dados SQLite em Node.js.

`bcrypt`: Utilizado para hashing seguro de senhas.

`cors`: Middleware para habilitar CORS (Cross-Origin Resource Sharing) nas requisições HTTP.

`cookie-parser`: Middleware para fazer o parsing de cookies enviados nas requisições.

`@google/generative-ai`: SDK da Google para integrar funcionalidades de inteligência artificial generativa.

`pdfkit`: Biblioteca para criação de arquivos PDF diretamente no servidor.

`dotenv`: Carrega variáveis de ambiente a partir de um arquivo .env para configuração do projeto.


## Como rodar <>
0. Inicie o servidor usando o comando.
```jsx
npm start
```
1. Acesse o localhost no seu navegador.
