# 🔐 Autenticação (Login/Logout)

## Função: `login(userType)`

**Localização**  
`client/auth.js`

---

### Descrição  
Realiza a autenticação do usuário (cliente ou restaurante), valida o tipo retornado pelo servidor e redireciona para o dashboard correspondente.

---

### Assinatura  
```js
async function login(userType)
```

### Parâmetros

- **userType** (string)  
  'client' ou 'restaurant' que indica qual dashboard deve ser carregado após o login.

### Fluxo de execução

1. **Coleta de dados**  
   - Lê `email` e `password` pelos campos `#email` e `#password`.  
   - Seleciona o elemento `#message` para exibir feedback.

2. **Validação básica**  
   - Se algum campo estiver vazio, exibe mensagem de erro e interrompe o processo.

3. **Requisição à API**  
   - Envia `POST /api/login` com corpo `{ email, password }` e `credentials: 'include'`.  
   - Aguarda e converte a resposta para JSON.

4. **Tratamento de falhas**  
   - Se `res.ok` for `false`, exibe `data.error` ou mensagem genérica e interrompe.

5. **Checagem de tipo**  
   - Compara `data.userType` com o `expectedType` passado.  
   - Se não coincidirem, exibe “Permissão negada para esta área.” e aborta.

6. **Redirecionamento**  
   - Se `userType === 'restaurant'`, redireciona para `/Restaurante/dashboard.html`.  
   - Se `userType === 'client'`, redireciona para `/Cliente/Client_dashboard.html`.

7. **Erro de conexão**  
   - Em caso de exceção, exibe “Erro ao conectar ao servidor.” e registra o erro no console.  

## Função: `logout()`

**Localização**  
`client/auth.js`

---

### Descrição  
Encerra a sessão do usuário no backend e, independente do resultado da requisição, redireciona para a página inicial.

---

### Assinatura  
```js
async function logout()
```

### Parâmetros

- Nenhum

### Fluxo de execução

1. **Requisição de logout**  
   - Envia `POST /api/logout` com `credentials: 'include'` para invalidar o cookie de sessão no servidor.

2. **Redirecionamento**  
   - Após a conclusão da requisição (sucesso ou falha), define:
     ```js
     window.location.href = '/index.html'
     ```

3. **Tratamento de falhas**  
   - Se ocorrer uma exceção durante o fetch, registra o erro no console:
     ```js
     console.error(err)
     ```
   - Em seguida, prossegue com o redirecionamento.

