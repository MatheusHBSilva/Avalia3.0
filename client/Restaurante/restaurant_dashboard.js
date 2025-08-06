document.addEventListener('DOMContentLoaded', () => {
  fetchRestaurantDetails();
  document.querySelector('.back-button').addEventListener('click', () => {
    window.history.back();
  });
  document.getElementById('historyBtn').addEventListener('click', () => {
    window.location.href = '/Restaurante/history.html';
  });
});

async function fetchRestaurantDetails() {
  const restaurantNameSpan = document.getElementById('restaurantName');
  const restaurantEmailSpan = document.getElementById('email');
  const restaurantPhoneSpan = document.getElementById('telefone');
  const averageRatingSpan = document.getElementById('averageRating');
  const ratingStarsDiv = document.getElementById('ratingStars');
  const reviewCountSpan = document.getElementById('reviewCount');
  const tagsContainer = document.getElementById('restaurantTags');
  const message = document.getElementById('message');

  try {
    const meResponse = await fetch('/api/me', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const meData = await meResponse.json();

    if (!meResponse.ok) {
      message.textContent = meData.error || 'Erro ao buscar dados do restaurante.';
      message.classList.add('error');
      message.style.display = 'block';
      return;
    }

    restaurantNameSpan.textContent = meData.restaurantName;
    restaurantEmailSpan.textContent = meData.restaurantEmail;
    restaurantPhoneSpan.textContent = meData.restaurantPhone;
    meData.tags.forEach(tag => {
      const span = document.createElement('span');
      span.textContent = tag;
      tagsContainer.appendChild(span);
    });

    const restaurantId = meData.restaurantId;
    const response = await fetch(`/api/restaurants?id=${restaurantId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    if (!response.ok || !data.restaurants || data.restaurants.length === 0) {
      message.textContent = 'Restaurante não encontrado.';
      message.classList.add('error');
      message.style.display = 'block';
      return;
    }

    const restaurant = data.restaurants[0];
    const averageRating = restaurant.average_rating;
    const reviewCount = restaurant.review_count;

    averageRatingSpan.textContent = averageRating.toFixed(1);
    reviewCountSpan.textContent = reviewCount === 1 ? '1 avaliação' : `${reviewCount} avaliações`;
    const roundedRating = Math.round(averageRating);
    ratingStarsDiv.innerHTML = `${'★'.repeat(roundedRating)}${'☆'.repeat(5 - roundedRating)}`;
  } catch (error) {
    message.textContent = 'Erro ao conectar ao servidor: ' + error.message;
    message.classList.add('error');
    message.style.display = 'block';
  }
}

async function generateBusinessAnalysis() {
  const message = document.getElementById('message');
  const restaurantId = (await (await fetch('/api/me', { credentials: 'include' })).json()).restaurantId;

  if (!restaurantId) {
    message.textContent = 'Restaurante não autenticado.';
    message.classList.add('error');
    message.style.display = 'block';
    return;
  }

  try {
    message.textContent = 'Gerando análise...';
    message.classList.remove('error');
    message.classList.add('success');
    message.style.display = 'block';

    const response = await fetch('/api/business-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao gerar análise.');
    }

    const reportDiv = document.getElementById('analysisReport') || document.createElement('div');
    reportDiv.id = 'analysisReport';
    reportDiv.className = 'analysis-report';
    reportDiv.innerHTML = `
      <h3>Análise de Negócio</h3>
      <pre>${data.analysis}</pre>
      <button id="downloadPdf" class="pdf-button">Baixar como PDF</button>
    `;
    document.querySelector('.container').appendChild(reportDiv);

    document.getElementById('downloadPdf').addEventListener('click', async () => {
      try {
        const pdfResponse = await fetch('/api/business-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ restaurantId, format: 'pdf' })
        });

        if (!pdfResponse.ok) {
          throw new Error('Erro ao gerar PDF.');
        }

        const blob = await pdfResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_analise_${restaurantId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        message.textContent = error.message || 'Erro ao baixar PDF.';
        message.classList.add('error');
        message.style.display = 'block';
      }
    });

    message.textContent = 'Análise gerada com sucesso!';
    message.classList.add('success');
    message.style.display = 'block';
  } catch (error) {
    message.textContent = error.message || 'Erro ao gerar análise.';
    message.classList.add('error');
    message.style.display = 'block';
  }
}