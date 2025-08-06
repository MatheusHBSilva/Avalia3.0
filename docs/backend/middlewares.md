# Middlewares

## 1. clientMiddlewares.js

**Responsabilidade:** Garantir que o cliente esteja autenticado antes de acessar rotas protegidas.

- `validateGetClient(req, res, next)`  
  1. Lê `clientId` de `req.cookies`.  
  2. Se ausente, responde com `401 Unauthorized` e `{ error: 'Não autenticado.' }`.  
  3. Caso contrário, chama `next()`.

---

## 2. restaurantMiddlewares.js

**Responsabilidade:** Validar presença de `restaurantId` no corpo da requisição.

- `idBodyRestaurant(req, res, next)`  
  1. Verifica se `req.body.restaurantId` existe e é um número.  
  2. Se inválido, responde com `400 Bad Request` e `{ error: 'restaurantId é obrigatório.' }`.  
  3. Caso válido, chama `next()`.

---

## 3. validateLogin.js

**Responsabilidade:** Validar payload de login antes de autenticar usuário.

- `validateLogin(req, res, next)`  
  1. Verifica presença de `email` e `password` em `req.body`.  
  2. Se algum estiver vazio ou faltando, responde com `400 Bad Request` e mensagem de erro.  
  3. Se ok, chama `next()` para prosseguir com o controller de login.

---

## 4. validateReportId.js

**Responsabilidade:** Assegurar que rotas de download/histórico recebam um `reportId` válido.

- `validateReportId(req, res, next)`  
  1. Lê `reportId` de `req.body` ou `req.query`.  
  2. Se ausente ou não numérico, responde com `400 Bad Request` e `{ error: 'reportId inválido.' }`.  
  3. Caso válido, chama `next()`.
