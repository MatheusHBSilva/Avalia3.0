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
    if (!restaurantList) {
      throw new Error('Elemento restaurant-list não encontrado no DOM.');
    }
    restaurantList.innerHTML = ''; // Limpar lista atual

    // Carregar favoritos do cliente
    const favoritesResponse = await fetch('/api/favorites', { credentials: 'include' });
    if (!favoritesResponse.ok) {
      throw new Error(`Erro ao carregar favoritos: ${favoritesResponse.statusText}`);
    }
    const favoritesData = await favoritesResponse.json();
    const favorites = new Set(favoritesData.favorites || []);

    let url = '';
    if (currentMode === 'favorites') {
      url = '/api/favorites/restaurants';
    } else if (currentMode === 'search' && currentSearchQuery) {
      url = `/api/restaurants?search=${encodeURIComponent(currentSearchQuery)}`;
    } else {
      url = '/api/discovery';
    }

    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erro na requisição: ${response.statusText}`);
    }
    const data = await response.json();

    if (!data.restaurants || data.restaurants.length === 0) {
      restaurantList.innerHTML = '<p class="no-results">Nenhum restaurante encontrado.</p>';
      return;
    }

    // Evitar duplicatas com base no id do restaurante
    const seenIds = new Set();
    data.restaurants.forEach(restaurant => {
      if (!restaurant.id || !restaurant.restaurant_name || seenIds.has(restaurant.id)) {
        return; // Ignora restaurantes com dados inválidos ou duplicados
      }
      seenIds.add(restaurant.id);
      const li = document.createElement('li');
      const roundedRating = Math.round(restaurant.average_rating || 0);
      const stars = '★'.repeat(roundedRating) + '☆'.repeat(5 - roundedRating);
      const reviewCountText = restaurant.review_count === 1 ? '1 avaliação' : `${restaurant.review_count || 0} avaliações`;
      const favoriteClass = favorites.has(restaurant.id) ? 'heart-icon favorite' : 'heart-icon';
      li.innerHTML = `
        <div class="restaurant-card">
          <div class="restaurant-info">
            <a href="/Cliente/review.html?id=${restaurant.id}" class="restaurant-name">
              ${restaurant.restaurant_name}
            </a>
            <span class="restaurant-rating">${stars} (${restaurant.average_rating ? restaurant.average_rating.toFixed(1) : '0.0'}, ${reviewCountText})</span>
            <span class="${favoriteClass}" onclick="toggleFavorite(${restaurant.id}, this)"></span>
          </div>
        </div>
      `;
      restaurantList.appendChild(li);
    });
  } catch (error) {
    const restaurantList = document.getElementById('restaurant-list');
    if (restaurantList) {
      restaurantList.innerHTML = `<p class="no-results">${error.message || 'Erro ao carregar restaurantes.'}</p>`;
    }
    console.error('Erro ao carregar restaurantes:', error);
  }
}

async function toggleFavorite(restaurantId, element) {
  try {
    const response = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId, action: element.classList.contains('favorite') ? 'remove' : 'add' }),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao atualizar favorito.');
    }

    element.classList.toggle('favorite');
    await loadRestaurants();
  } catch (error) {
    console.error('Erro ao atualizar favorito:', error);
    alert('Erro ao atualizar favorito: ' + error.message);
  }
}

async function loadClientDashboard() {
  try {
    // Carregar informações do cliente logado
    const clientResponse = await fetch('/api/client-me', { credentials: 'include' });
    if (!clientResponse.ok) {
      window.location.href = '/Cliente/login_client.html';
      return;
    }
    const clientData = await clientResponse.json();

    // Preencher o nome do cliente no dropdown
    document.getElementById('client-name').textContent = clientData.nome;

    // Carregar restaurantes iniciais
    await loadRestaurants();
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