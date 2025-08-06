function goBack() {
  window.location.href='/Cliente/client_dashboard.html'
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
  } catch (error) {
    console.error('Erro ao carregar detalhes:', error);
    alert('Erro ao carregar detalhes do restaurante.');
  }
}

function setupStarRating() {
  const stars = document.querySelectorAll('#star-rating span');
  const ratingValue = document.getElementById('rating-value');

  stars.forEach(star => {
    star.addEventListener('click', () => {
      const value = parseInt(star.getAttribute('data-value'));
      ratingValue.value = value;

      stars.forEach(s => s.classList.remove('active'));
      for (let i = 0; i < value; i++) {
        stars[i].classList.add('active');
      }
    });

    star.addEventListener('mouseover', () => {
      const value = parseInt(star.getAttribute('data-value'));
      stars.forEach(s => s.classList.remove('hover'));
      for (let i = 0; i < value; i++) {
        stars[i].classList.add('hover');
      }
    });

    star.addEventListener('mouseout', () => {
      stars.forEach(s => s.classList.remove('hover'));
      const currentValue = parseInt(ratingValue.value);
      for (let i = 0; i < currentValue; i++) {
        stars[i].classList.add('active');
      }
    });
  });

  // Definir a primeira estrela como ativa por padrão
  stars[0].classList.add('active');
}

async function saveReview() {
  const urlParams = new URLSearchParams(window.location.search);
  const restaurantId = urlParams.get('id');
  const rating = parseInt(document.getElementById('rating-value').value);
  const reviewText = document.getElementById('review-text').value;

  if (!restaurantId) {
    alert('ID do restaurante não encontrado.');
    return;
  }

  if (rating < 1 || rating > 5) {
    alert('A nota deve estar entre 1 e 5 estrelas.');
    return;
  }

  try {
    // Obter informações do cliente logado
    const clientResponse = await fetch('/api/client-me', { credentials: 'include' });
    const clientData = await clientResponse.json();
    if (!clientResponse.ok) throw new Error(clientData.error || 'Usuário não autenticado.');

    const reviewerName = `${clientData.nome} ${clientData.sobrenome}`;

    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId, reviewerName, rating, reviewText }),
      credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    alert('Avaliação salva com sucesso!');
    window.location.href = `/Cliente/review.html?id=${restaurantId}`;
  } catch (error) {
    console.error('Erro ao salvar avaliação:', error);
    alert('Erro ao salvar avaliação. Certifique-se de que está logado.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadRestaurantDetails();
  setupStarRating();
  document.getElementById('save-review-btn').addEventListener('click', saveReview);
});