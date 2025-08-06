# Controllers

A seguir um panorama das responsabilidades e principais métodos de cada controller no backend.

---

## 1. authController.js

Responsável por todo o fluxo de autenticação e sessão de usuário (cliente e restaurante).

- **login(req, res):**  
  Recebe email e senha, verifica credenciais e inicia sessão via cookie.  
- **logout(req, res):**  
  Limpa a sessão do usuário e encerra o cookie de autenticação.  
- **getClientSession(req, res):**  
  Rota `/api/client-me` — retorna dados básicos do cliente logado ou erro 401.  
- **getRestaurantSession(req, res):**  
  Rota `/api/me` — retorna dados básicos do restaurante logado ou erro 401.

---

## 2. clientController.js

Gerencia cadastro de clientes, favoritos e consultas de perfil.

- **registerClient(req, res):**  
  Valida payload, cria novo cliente no banco e retorna mensagem de sucesso.  
- **addFavorite(req, res):**  
  Marca um restaurante como favorito para o cliente autenticado.  
- **removeFavorite(req, res):**  
  Remove um favorito existente.  
- **getFavorites(req, res):**  
  Retorna lista de IDs ou objetos dos restaurantes favoritos do cliente.  

---

## 3. restaurantController.js

Cuida do cadastro, perfil e metadados de restaurantes.

- **registerRestaurant(req, res):**  
  Valida dados de registro, insere novo restaurante e retorna confirmação.  
- **getRestaurantById(req, res):**  
  Rota `/api/restaurants?id=` — busca restaurante(s) pelo ID e devolve dados de nome, rating, contagem.  
- **getTags(req, res):**  
  Rota `/api/restaurant-tags?id=` — retorna lista de tags associadas ao restaurante autenticado.

---

## 4. reviewController.js

Orquestra criação e consulta de avaliações de clientes.

- **createReview(req, res):**  
  Recebe `{ restaurantId, reviewerName, rating, reviewText }`, insere no banco e retorna status.  
- **listReviews(req, res):**  
  Rota `GET /api/reviews?restaurantId=` — retorna todas as avaliações de um restaurante.

---

## 5. reportController.js

Responsável por geração, histórico e download de relatórios analíticos.

- **generateAnalysis(req, res):**  
  POST `/api/business-analysis` — produz análise de negócio em texto (JSON ou PDF).  
- **getReportHistory(req, res):**  
  GET `/api/report-history?restaurantId=` — lista relatórios já gerados com data e ID.  
- **downloadReport(req, res):**  
  POST `/api/download-report` — retorna relatório em blob para download.

---

## 6. analysisController.js

- **businessAnalysis(req, res):**  
  1. Busca até 50 avaliações recentes.  
  2. Monta prompt para Gemini (análise de sentimento, pontos fortes/fracos, melhorias, média de notas).  
  3. Chama API GoogleGenerativeAI.  
  4. Persiste texto da análise em `reports`.  
  5. Se `format==='pdf'`, gera PDF via PDFKit e envia como download; caso contrário, retorna `{ analysis }` em JSON.

---

## 7. favoriteController.js

- **getFavoriteRestaurants(req, res):** retorna objetos de restaurantes favoritos com nota média e contagem.  
- **getFavoriteIds(req, res):** retorna somente IDs de restaurantes favoritos.  
- **toggleFavorite(req, res):** adiciona ou remove um favorito (`action==='add'` ou `'remove'`).

---

## 8. recommendationController.js

- **clientRecommendation(req, res):**  
  1. Busca até 100 avaliações recentes.  
  2. Obtém tags de restaurante e cliente.  
  3. Monta prompt para Gemini (recomendação sim/não, resumo de pontos fortes/fracos, justificativa).  
  4. Chama API GoogleGenerativeAI.  
  5. Se `format==='pdf'`, gera e envia relatório PDF; caso contrário, retorna `{ analysis }` em JSON.

---

## 9. discoveryController.js

Responsável por gerar o feed de descoberta de restaurantes para o dashboard do cliente, com base na compatibilidade de interesses (tags).

- **getDiscoveryFeed(req, res):**

  1. Verifica a identidade do cliente via cookie (`req.cookies.clientId`).
  2. Busca as tags do cliente autenticado.
  3. Busca todos os restaurantes e suas respectivas tags.
  4. Filtra a lista, retornando apenas os restaurantes que possuem 2 ou mais tags em comum com o cliente.
  5. Rota `GET /api/discovery` retorna um array de objetos de restaurante para o dashboard.

---