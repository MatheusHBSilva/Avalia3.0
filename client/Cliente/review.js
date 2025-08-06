function goBack() {
  window.location.href='/Cliente/client_dashboard.html';
}

async function loadRestaurantDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const restaurantId = urlParams.get('id');

  if (!restaurantId) {
    alert('ID do restaurante não encontrado.');
    return;
  }

  try {
    const response = await fetch(`/api/restaurants?id=${restaurantId}`, { credentials: 'include' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    const restaurant = data.restaurants[0];
    document.getElementById('restaurant-name').textContent = restaurant.restaurant_name;
    document.getElementById('telefone').textContent = "Telefone: " +  restaurant.telefone;
    document.getElementById('endereco').textContent = "Endereço: " + restaurant.endereco;
    document.getElementById('restaurant-rating').textContent = `Média: ${restaurant.average_rating} (${restaurant.review_count} avaliações)`;

    const tagsResponse = await fetch(`/api/restaurant-tags?id=${restaurantId}`, { credentials: 'include' });
    const tagsData = await tagsResponse.json();
    const tagsContainer = document.getElementById('restaurant-tags');
    tagsData.tags.forEach(tag => {
      const span = document.createElement('span');
      span.textContent = tag;
      tagsContainer.appendChild(span);
    });
  } catch (error) {
    console.error('Erro ao carregar detalhes:', error);
    alert('Erro ao carregar detalhes do restaurante.');
  }
}

async function generateGeneralReview() {
  const urlParams = new URLSearchParams(window.location.search);
  const restaurantId = urlParams.get('id');

  if (!restaurantId) {
    alert('ID do restaurante não encontrado.');
    return;
  }

  const spinner = document.getElementById('loading-spinner');
  const resultContainer = document.getElementById('review-result');
  const button = document.getElementById('general-review-btn');

  try {
    // Mostrar o spinner e desativar o botão
    spinner.style.display = 'block';
    button.disabled = true;
    resultContainer.classList.remove('show'); // Esconder o resultado anterior, se houver

    const response = await fetch(`/api/client-recommendation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId, format: 'json' }),
      credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    resultContainer.textContent = data.analysis;
    resultContainer.classList.add('show');
  } catch (error) {
    console.error('Erro ao gerar avaliação geral:', error);
    alert('Erro ao gerar avaliação geral.');
  } finally {
    // Esconder o spinner e reativar o botão
    spinner.style.display = 'none';
    button.disabled = false;
  }
}

async function rateRestaurant() {
  const urlParams = new URLSearchParams(window.location.search);
  const restaurantId = urlParams.get('id');
  window.location.href = `/Cliente/rate.html?id=${restaurantId}`;
}

document.addEventListener('DOMContentLoaded', loadRestaurantDetails);