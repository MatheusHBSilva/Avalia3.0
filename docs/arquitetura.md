# Arquitetura da Aplicação 🏛️

A aplicação está organizada em camadas, cada uma com responsabilidades bem definidas, promovendo separação de responsabilidades e escalabilidade.

---

## 1. Camada de Apresentação (Frontend)

- **Local:** `client/`  
- **Responsabilidade:**  
  - HTML, CSS e JavaScript modular por área (Cliente e Restaurante).  
  - Scripts dedicados para cada página (`main.js`, `client_dashboard.js`, `rate.js`, `review.js`, etc.).  
  - Consome APIs REST via `fetch` sem misturar lógica de negócio no markup.

---

## 2. Camada de Roteamento

- **Local:** `server/routes/`  
- **Responsabilidade:**  
  - Define endpoints HTTP e métodos (GET, POST).  
  - Encaminha requisições para os controllers correspondentes.  
  - Arquivos exemplares: `authRoutes.js`, `clientRoutes.js`, `restaurantRoutes.js`, etc.

---

## 3. Camada de Controle (Controllers)

- **Local:** `server/controllers/`  
- **Responsabilidade:**  
  - Orquestra lógica de negócio: validação de dados, regras de autorização, formatação de resposta.  
  - Interage com a camada de models para CRUD e processamento.  
  - Arquivos exemplares: `authController.js`, `reviewController.js`, `reportController.js`.

---

## 4. Camada de Persistência (Models)

- **Local:** `server/models/`  
- **Responsabilidade:**  
  - Define esquemas de dados e entidades do domínio (Client, Restaurant, Review, Report).  
  - Isola detalhes de conexão e operações de banco de dados.  
  - Garantia de consistência na forma como os dados são armazenados e recuperados.

---

## 5. Middleware

- **Local:** `server/middlewares/`  
- **Responsabilidade:**  
  - Validações de input, autenticação e autorização antes da execução dos controllers.  
  - Exemplos: `validateLogin.js`, `clientMiddlewares.js`, `restaurantMiddlewares.js`.

---

## Fluxo de Dados

1. Frontend faz requisições JSON+cookies via `fetch`.  
2. Rotas recebem e passam para middleware de validação.  
3. Controllers processam a lógica e usam Models para acessar dados.  
4. Respostas JSON retornam ao cliente.

---

> Em resumo, o backend segue um MVC clássico (Models → Controllers → “Views” em JSON) e o frontend adota uma arquitetura em camadas e módulos.

### Veja mais em:

- [Models / DB (SQLite)](backend/modules.md)  
- [Controllers](backend/controllers.md)
- [Routes](backend/routes.md)
- [Middlewares](backend/middlewares.md)