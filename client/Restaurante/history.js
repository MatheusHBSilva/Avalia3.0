document.addEventListener('DOMContentLoaded', () => {
  fetchRestaurantDetails();
  document.querySelector('.back-button').addEventListener('click', () => {
    // Usar a rota direta para o dashboard é mais seguro que history.back()
    window.location.href = '/Restaurante/restaurant_dashboard.html';
  });
});

async function fetchRestaurantDetails() {
  const restaurantNameSpan = document.getElementById('restaurantName');
  const tagsContainer = document.getElementById('restaurantTags');
  const reportList = document.getElementById('reportList');
  const message = document.getElementById('message');

  try {
    // CORREÇÃO 1: Usando a rota correta para buscar dados do restaurante
    const meResponse = await fetch('/api/restaurant/me', {
      method: 'GET',
      credentials: 'include'
    });

    if (!meResponse.ok) {
        const meData = await meResponse.json();
        throw new Error(meData.error || 'Erro ao buscar dados do restaurante.');
    }
    const meData = await meResponse.json();

    restaurantNameSpan.textContent = meData.restaurantName;
    
    tagsContainer.innerHTML = ''; // Limpa tags antigas antes de adicionar novas
    meData.tags.forEach(tag => {
      const span = document.createElement('span');
      span.className = 'tag'; // Adiciona uma classe para possível estilização
      span.textContent = tag;
      tagsContainer.appendChild(span);
    });

    // CORREÇÃO 2: Usando a rota correta para buscar o histórico de relatórios
    // Não é preciso enviar o ID, pois o backend o obtém do cookie de sessão.
    const reportsResponse = await fetch('/api/reports', {
      method: 'GET',
      credentials: 'include'
    });

    if (!reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        throw new Error(reportsData.error || 'Erro ao carregar histórico de relatórios.');
    }
    const reportsData = await reportsResponse.json();

    reportList.innerHTML = ''; // Limpa a lista antes de preencher
    if (reportsData.reports.length === 0) {
        reportList.innerHTML = '<p>Nenhum relatório encontrado.</p>';
        return;
    }

    reportsData.reports.forEach(report => {
      const div = document.createElement('div');
      div.className = 'report-item'; // Adiciona uma classe para estilização
      const reportDate = new Date(report.created_at);
      
      // Formata a data e o botão para baixar/visualizar
      div.innerHTML = `
        <p>Relatório de: ${reportDate.toLocaleDateString('pt-BR')} às ${reportDate.toLocaleTimeString('pt-BR')}</p>
        <button onclick="viewReport(${report.id})">Acessar Relatório (PDF)</button>
      `;
      reportList.appendChild(div);
    });

  } catch (error) {
    console.error("Erro na página de histórico:", error);
    message.textContent = 'Erro ao carregar dados: ' + error.message;
    message.classList.add('error');
    message.style.display = 'block';
  }
}

/**
 * Função para visualizar o relatório em PDF em uma nova aba.
 * @param {number} reportId - O ID do relatório a ser visualizado.
 */
function viewReport(reportId) {
    // CORREÇÃO 3: Abrimos a rota GET que gera o PDF diretamente.
    // O navegador cuidará do download ou da exibição do PDF.
    window.open(`/api/reports/${reportId}`, '_blank');
}