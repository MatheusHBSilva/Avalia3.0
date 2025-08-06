# Funções – Restaurant 🍽️

## Principais Funções

## /restaurant_dashboard.js

### 1. `fetchRestaurantDetails()`

**Objetivo:** Carregar dados do restaurante logado (nome, tags, avaliação média e contagem) e exibir no dashboard.

Resumo das etapas:  
1. Faz `GET /api/me` com `credentials: 'include'`.  
   - Se falhar, mostra erro em `#message` e interrompe.  
   - Preenche `#restaurantName` e renderiza cada tag em `#restaurantTags`.  
2. Lê `restaurantId` de `meData` e faz `GET /api/restaurants?id=${restaurantId}`.  
   - Se resposta inválida ou lista vazia, exibe “Restaurante não encontrado.”  
   - Atualiza `#averageRating`, `#reviewCount` e monta estrelas em `#ratingStars`.  
3. Em erro de rede, mostra mensagem de conexão com o servidor e loga no console.

---

### 2. `generateBusinessAnalysis()`

**Objetivo:** Solicitar análise de negócio ao backend e permitir download em PDF.

Resumo das etapas:  
1. Obtém `restaurantId` via `GET /api/me`; se ausente, exibe “Restaurante não autenticado.”.  
2. Exibe “Gerando análise...” em `#message`.  
3. Envia `POST /api/business-analysis` com `{ restaurantId }`.  
   - Se falhar, exibe erro e interrompe.  
4. Cria (ou atualiza) o elemento `#analysisReport` com título, `<pre>` do texto `data.analysis` e botão `#downloadPdf`.  
5. No clique de `#downloadPdf`:  
   - Envia outra `POST /api/business-analysis` com `{ restaurantId, format: 'pdf' }`.  
   - Converte a resposta em blob e dispara download automático.  
   - Se falhar, exibe erro em `#message`.  
6. Atualiza `#message` para “Análise gerada com sucesso!” e aplica classe `success`.

---

## /register.js

### 3. `register()`

**Objetivo:** Validar o formulário de cadastro de restaurante e enviar os dados ao backend.

Resumo das etapas:  
1. Lê do DOM:  
   - `restaurantName`, `cnpj`, `email`, `password` e `tags`  
   - Oculta a `#message`.  
2. Valida campos obrigatórios:  
   - Se `restaurantName`, `cnpj`, `email` ou `password` estiverem vazios, exibe em `#message`:  
     ```
     Por favor, preencha todos os campos obrigatórios.
     ```  
   - Aplica classe `error` e aborta.  
3. Envia `POST /api/register` com:  
   ```js
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify({ restaurantName, cnpj, email, password, tags })

4. Converte resposta em JSON e, se `!response.ok`, exibe em `#message`: `data.error || 'Erro ao cadastrar.'`.
5. Em caso de sucesso, mostra em `#message` a `data.message`, aplica classe `success` e limpa todos os campos do formulário.
6. No bloco `catch`, se houver falha na requisição, exibe em `#message`: `'Erro ao conectar ao servidor.'`.

## /history.js

### 4. `downloadReport(reportId, date)`

**Objetivo:** Gerar e baixar o PDF de um relatório específico.

Resumo das etapas:  
1. Envia `POST /api/download-report` com `{ reportId }` e `credentials: 'include'`.  
2. Se `!response.ok`, lança erro.  
3. Converte resposta em blob, cria `ObjectURL`, adiciona `<a>` temporário com `download="relatorio_${date.replace(/\//g,'-')}.pdf"` e dispara o clique.  
4. Remove o `<a>` e revoga o URL.  
5. Em erro, exibe `#message` com a mensagem de falha.
