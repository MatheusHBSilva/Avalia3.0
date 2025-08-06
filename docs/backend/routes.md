# Routes

Cada arquivo em `server/routes/` define um conjunto de endpoints REST que encaminham requisições para os controllers correspondentes.

---

## authRoutes.js

- **POST /api/login**  
  Autentica cliente ou restaurante e inicia sessão (cookie).  
- **POST /api/logout**  
  Encerra sessão e limpa cookie de autenticação.  
- **GET /api/client-me**  
  Retorna dados básicos do cliente logado (ou 401 se não autenticado).  
- **GET /api/me**  
  Retorna dados básicos do restaurante logado (ou 401 se não autenticado).

---

## clientRoutes.js

- **POST /api/register-client**  
  Recebe payload de cadastro de cliente e cria novo registro.  
- **GET /api/favorites**  
  Retorna lista de IDs de restaurantes favoritos do cliente.  
- **GET /api/favorites/restaurants**  
  Retorna lista detalhada de restaurantes favoritos com média de nota e contagem.  
- **POST /api/favorites**  
  Adiciona ou remove um restaurante dos favoritos do cliente (action: `add` ou `remove`).

---

## restaurantRoutes.js

- **POST /api/register**  
  Recebe payload de cadastro de restaurante e cria novo registro.  
- **GET /api/restaurants**  
  - Sem query: lista restaurantes (opções de paginação, busca ou aleatório).  
  - Com `?id=`: busca restaurante específico por ID.  
- **GET /api/restaurant-tags**  
  Retorna tags associadas a um restaurante (por `id` na query).

---

## reviewRoutes.js

- **GET /api/reviews?restaurantId=**  
  Lista todas as avaliações de um restaurante.  
- **POST /api/reviews**  
  Cria uma nova avaliação recebendo `{ restaurantId, reviewerName, rating, reviewText }`.

---

## reportRoutes.js

- **POST /api/business-analysis**  
  Gera análise de negócio (JSON ou PDF) usando `analysisController.businessAnalysis`.  
- **POST /api/client-recommendation**  
  Gera recomendação personalizada (JSON ou PDF) usando `recommendationController.clientRecommendation`.  
- **GET /api/report-history?restaurantId=**  
  Lista histórico de relatórios já gerados para o restaurante autenticado.  
- **POST /api/download-report**  
  Envia o PDF de um relatório específico para download.

---

## analysisRoutes.js

- **POST /api/business-analysis**  
  - Middleware: `idBodyRestaurant` (verifica `restaurantId` no body)  
  - Controller: `analysisController.businessAnalysis`

---

## favoriteRoutes.js

- **GET  /api/favorites**  
  - Middleware: `validateGetClient` (verifica cliente autenticado)  
  - Controller: `favoriteController.getFavoriteIds`

- **POST /api/favorites**  
  - Controller: `favoriteController.toggleFavorite`

- **GET  /api/favorites/restaurants**  
  - Middleware: `validateGetClient`  
  - Controller: `favoriteController.getFavoriteRestaurants`

---

## recommendationRoutes.js

- **POST /api/client-recommendation**  
  - Middlewares:  
    1. `idBodyRestaurant` (verifica `restaurantId`)  
    2. `validateGetClient` (verifica cliente autenticado)  
  - Controller: `recommendationController.clientRecommendation`

---

## discoveryRoutes.js
- **GET /api/discovery**
  - Retorna uma lista de restaurantes para o dashboard do cliente, com base em um mínimo de 2 tags em comum.
  - Lógica de Autenticação: A validação do cliente logado é feita diretamente no controller, via `req.cookies.clientId`.
  - Controller: `discoveryController.getDiscoveryFeed`

---