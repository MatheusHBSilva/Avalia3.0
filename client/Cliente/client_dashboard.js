let currentMode = 'all'; // 'all', 'favorites', ou 'search'
let currentSearchQuery = '';

function updateDisplay() {
  const searchContainer = document.getElementById('search-container');
  const searchBar = document.querySelector('.search-bar');
  const favoritesMode = document.createElement('div');
  favoritesMode.className = 'favorites-mode';
  favoritesMode.innerHTML = `
    <div class="favorites-title">Favoritos</div>
    <button class="back-button" onclick="showAllRestaurants()">Voltar</button>
  `;

  if (currentMode === 'favorites') {
    if (!searchContainer.querySelector('.favorites-mode')) {
      searchContainer.innerHTML = '';
      searchContainer.appendChild(favoritesMode);
      favoritesMode.classList.add('show');
    }
  } else {
    if (searchContainer.querySelector('.favorites-mode')) {
      searchContainer.innerHTML = '';
    }
    if (!searchContainer.querySelector('.search-bar')) {
      searchContainer.innerHTML = '<div class="search-bar"><input type="text" id="search-input" placeholder="Pesquisar restaurantes..." oninput="searchRestaurants()"></div>';
    }
  }
}

async function loadRestaurants() {
  try {
    const restaurantList = document.getElementById('restaurant-list');
    restaurantList.innerHTML = ''; // Limpar lista atual

    // Carregar favoritos do cliente
    const favoritesResponse = await fetch('/api/favorites', { credentials: 'include' });
    const favoritesData = await favoritesResponse.json();
    const favorites = new Set(favoritesData.favorites);

    let url = '';
    if (currentMode === 'favorites') {
      url = '/api/favorites/restaurants';
    } else if (currentMode === 'search' && currentSearchQuery) {
      url = `/api/restaurants?search=${encodeURIComponent(currentSearchQuery)}`;
    } else {
      url = '/api/discovery';
    }

    const response = await fetch(url, { credentials: 'include' });
    const data = await response.json();
    if (!response.ok) {
      // Adiciona uma verificação para o caso de não haver restaurantes recomendados
      if (data.restaurants && data.restaurants.length === 0) {
        restaurantList.innerHTML = '<p class="no-results">Nenhum restaurante encontrado com base nos seus interesses. Explore e avalie mais para receber recomendações!</p>';
        return;
      }
      throw new Error(data.error || 'Erro ao carregar restaurantes.');
    }

    // Se a resposta for um array vazio, exibe uma mensagem
    if (data.restaurants.length === 0) {
      restaurantList.innerHTML = '<p class="no-results">Nenhum restaurante encontrado. Tente buscar por um nome ou explore os favoritos.</p>';
      return;
    }

    data.restaurants.forEach(restaurant => {
      const restaurantCard = document.createElement('div');
      restaurantCard.classList.add('restaurant-card');
      restaurantCard.innerHTML = `
        <div class="restaurant-info">
          <div class="restaurant-name">${restaurant.restaurant_name}</div>
          <div class="restaurant-rating">⭐ ${parseFloat(restaurant.average_rating).toFixed(1)} (${restaurant.review_count} avaliações)</div>
        </div>
        <span class="heart-icon ${favorites.has(restaurant.id) ? 'favorite' : ''}" data-id="${restaurant.id}"></span>
      `;

      // Adicionar evento de clique para redirecionar ao clicar no card
      restaurantCard.addEventListener('click', (e) => {
        if (e.target.classList.contains('heart-icon')) return;
        window.location.href = `/Cliente/review.html?id=${restaurant.id}`;
      });

      // Adicionar evento de clique no coração
      const heartIcon = restaurantCard.querySelector('.heart-icon');
      heartIcon.addEventListener('click', async (e) => {
        e.stopPropagation();
        const restaurantId = heartIcon.getAttribute('data-id');
        const isFavorite = heartIcon.classList.contains('favorite');

        try {
          const action = isFavorite ? 'remove' : 'add';
          const favResponse = await fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ restaurantId, action }),
            credentials: 'include'
          });

          const favData = await favResponse.json();
          if (favResponse.ok) {
            heartIcon.classList.toggle('favorite');
            if (currentMode === 'favorites') {
              loadRestaurants(); // Recarregar para atualizar a lista de favoritos
            }
          } else {
            alert(favData.error || 'Erro ao atualizar favorito.');
          }
        } catch (error) {
          console.error('Erro ao atualizar favorito:', error);
          alert('Erro ao conectar ao servidor.');
        }
      });

      restaurantList.appendChild(restaurantCard);
    });
  } catch (error) {
    console.error('Erro ao carregar restaurantes:', error);
    // Evita alertar o usuário se for apenas uma lista vazia
    if (!error.message.includes("Unexpected token '<'")) {
        alert('Erro ao carregar restaurantes.');
    }
  }
}

async function loadClientDashboard() {
  try {
    // Carregar informações do cliente logado
    const clientResponse = await fetch('/api/client-me', { credentials: 'include' });
    const clientData = await clientResponse.json();
    if (!clientResponse.ok) {
      window.location.href = '/Cliente/login_client.html';
      return;
    }

    // Preencher o nome do cliente no dropdown
    document.getElementById('client-name').textContent = clientData.nome;

    // Carregar restaurantes iniciais
    loadRestaurants();
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    window.location.href = '/Cliente/login_client.html';
  }
}

function toggleDropdown() {
  const dropdown = document.getElementById('dropdown');
  dropdown.classList.toggle('show');
}

async function showFavorites() {
  currentMode = 'favorites';
  currentSearchQuery = '';
  await loadRestaurants();
  updateDisplay();
  toggleDropdown(); // Fechar dropdown após clicar
}

// Nova função para editar tags
function editTags() {
  window.location.href = '/Cliente/edit_tags.html'; // Redireciona para a página de edição de tags
  toggleDropdown(); // Fechar dropdown após clicar
}

async function showAllRestaurants() {
  currentMode = 'all'; // Resetar o modo para 'all'
  currentSearchQuery = ''; // Limpar a query de busca
  const searchContainer = document.getElementById('search-container');
  searchContainer.innerHTML = '<div class="search-bar"><input type="text" id="search-input" placeholder="Pesquisar restaurantes..." oninput="searchRestaurants()"></div>';
  await loadRestaurants();
}

async function searchRestaurants() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return; // Evitar busca se a barra de pesquisa não estiver presente
  const query = searchInput.value.trim();
  currentSearchQuery = query;
  currentMode = query ? 'search' : 'all';
  await loadRestaurants();
}

// Fechar dropdown ao clicar fora
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('dropdown');
  const profilePic = document.querySelector('.profile-pic');
  if (profilePic && !profilePic.contains(e.target) && dropdown.classList.contains('show')) {
    dropdown.classList.remove('show');
  }
});

document.addEventListener('DOMContentLoaded', loadClientDashboard);