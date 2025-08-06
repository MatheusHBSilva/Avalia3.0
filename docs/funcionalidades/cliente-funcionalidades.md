# Funções – Cliente 👥

## Principais Funções

## /main.js

### 1. `fetchRestaurants()`

**Objetivo:** Buscar e renderizar cards de restaurantes conforme modo atual (todos, favoritos ou busca).

Resumo das etapas:  
1. Limpa a lista e esconde mensagens.  
2. Puxa IDs de favoritos do endpoint `/api/favorites`.  
3. Monta URL com base em `currentMode` e `currentSearchQuery`.  
4. Faz `GET` no endpoint escolhido e trata erros.  
5. Para cada restaurante, cria card com nome, avaliação e ícone de favorito.  
6. Adiciona handlers:
   - Clique no card → direciona para reviews.  
   - Clique no coração → adiciona/remove favorito (`POST /api/favorites`).  
7. Em erros de rede ou API, exibe alerta e loga no console.

---

## /client_dashboard.js

### 2. `loadClientDashboard()`

**Objetivo:** Inicializar o dashboard do cliente.

Resumo das etapas:  
1. Faz `GET /api/client-me` para validar sessão e obter nome.  
2. Se não autenticado, redireciona para login.  
3. Exibe nome do cliente no header.  
4. Chama `loadRestaurants()` para popular a lista inicial.

---

### 3. `updateDisplay()`

**Objetivo:** Alternar a UI entre modos de busca e favoritos.

Resumo das etapas:  
1. Se `currentMode === 'favorites'`, substitui a search bar por um header “Favoritos” com botão “Voltar”.  
2. Caso contrário, garante que a search bar esteja presente e remove o header de favoritos.

---

### 4. Modos de exibição e busca

- `showFavorites()`: define `currentMode = 'favorites'`, limpa busca, recarrega lista e atualiza display.  
- `showAllRestaurants()`: reseta `currentMode` e `currentSearchQuery`, insere search bar e recarrega lista.  
- `searchRestaurants()`: atualiza `currentSearchQuery`, ajusta `currentMode` para `'search'` ou `'all'`, recarrega lista.

---

### 5. `toggleDropdown()` e Listener Global

- `toggleDropdown()`: mostra/oculta o menu dropdown de perfil.  
- Event Listener em `document.click`: fecha dropdown ao clicar fora dele.

---

## /rate.js

### 6. `loadRestaurantDetails()`
**Objetivo:** Buscar e exibir o nome do restaurante na página de avaliação.

Resumo das etapas:
1. Extrai `restaurantId` da query string.
2. Se ausente, exibe `alert('ID do restaurante não encontrado.')` e aborta.
3. Faz `GET /api/restaurants?id=${restaurantId}` com `credentials: 'include'.`
4. Se `!response.ok`, lança erro e alerta genérico.
5. Preenche `#restaurant-name` com o nome retornado.

### 7. `setupStarRating()`
**Objetivo:** Deixar interativas as estrelas de avaliação (seleção e hover).

Resumo das etapas:
1. Seleciona todos os spans em `#star-rating` e o input `#rating-value`.
2. Em `click`, atualiza `rating-value` e aplica classe `active` às estrelas até o índice clicado.
3. Em `mouseover`, aplica classe `hover` aos spans até a posição em foco.
4. Em `mouseout`, remove todas as classes `hover` e restaura as `active` conforme `rating-value`.
5. Marca a primeira estrela como `active` por padrão.

### 8. `saveReview()`
**Objetivo:** Enviar a avaliação ao backend e recarregar a página de review.

Resumo das etapas:
1. Lê `restaurantId`, `rating` e `reviewText` do DOM.
2. Valida presença de ID e rating entre 1 e 5; se inválido, exibe alerta e aborta.
3. Faz `GET /api/client-me` para obter dados do cliente; se falhar, lança erro.
4. Constrói `reviewerName` e envia `POST /api/reviews` com payload e `credentials: 'include'`.
5. Se sucesso, exibe `alert('Avaliação salva com sucesso!')` e recarrega:

    ```js
    window.location.href = `/Cliente/review.html?id=${restaurantId}`
    ```
6. Em erro, registra no console e exibe alerta de falha.

## /register.js

### 8. `registerClient()`

**Objetivo:** Validar o formulário de cadastro e enviar dados do novo cliente ao backend.

Resumo das etapas:  
1. Lê do DOM os valores de `nome`, `sobrenome`, `cpf`, `telefone`, `email`, `senha` e `tags`. Oculta a `#message`.  
2. Valida: se algum campo estiver vazio, exibe em `#message` o texto  **Por favor, preencha todos os campos obrigatórios.** e aborta.  
3. Envia `POST /api/register-client` com  
    ```js
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, sobrenome, cpf, telefone, email, senha, tags })
    ```
4. Converte a resposta em JSON e, se `!response.ok`, exibe em `#message`: `data.error || 'Erro ao cadastrar.'` e aborta.
5. Em caso de sucesso, mostra em `#message` a `data.message`, aplica classe `success`, limpa o formulário (zera todos os inputs).
6. No bloco catch, se falhar a requisição, exibe em `#message`: `'Erro ao conectar ao servidor.'` e registra o erro no console com

    ```js
    console.error('Erro no cadastro:', error)
    ``` 

## /review.js

### 9. `loadRestaurantDetails()`

**Objetivo:** Carregar e exibir informações do restaurante (nome, nota e tags).

Resumo das etapas:
1. Lê `restaurantId` da query string; se não existir, alerta e aborta.
2. Faz `GET /api/restaurants?id=${restaurantId}` com `credentials: 'include'`; trata erro de resposta.
3. Preenche:
* `#restaurant-name` com `restaurant.restaurant_name`.
* `#restaurant-rating` com média e contagem de avaliações.
4. Faz `GET /api/restaurant-tags?id=${restaurantId}`; renderiza cada tag em `#restaurant-tags`.
5. Em erro, loga no console e alerta “Erro ao carregar detalhes do restaurante.”

### 10. `generateGeneralReview()`

**Objetivo:** Solicitar ao backend uma análise geral do restaurante (IA ou recomendação).

Resumo das etapas:

1. Lê `restaurantId` da query string; se ausente, alerta e aborta.
2. Mostra spinner (`#loading-spinner`), desativa botão (`#general-review-btn`) e oculta resultado anterior.
3. Faz POST /api/client-recommendation com payload { restaurantId, format: 'json' } e credentials: 'include'; trata falha.
4. Exibe `data.analysis` em `#review-result` (adiciona classe `show`).
5. No `finally`, esconde o spinner e reativa o botão.
6. Em erro, loga no console e alerta “Erro ao gerar avaliação geral.”

### 11. `rateRestaurant()`

**Objetivo:** Redirecionar à página de avaliação manual (rate.html).

Resumo das etapas:

1. Lê `restaurantId` da query string.
2. Executa:

    ```js
    window.location.href = `/Cliente/rate.html?id=${restaurantId}`;
    ```
