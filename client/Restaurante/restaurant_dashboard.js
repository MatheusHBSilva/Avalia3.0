// Variável para guardar o ID do restaurante logado
let currentRestaurantId = null;

/**
 * Função principal que roda quando o HTML da página está pronto.
 */
document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
  initializeDashboardButtons();
});

/**
 * Adiciona os "escutadores de eventos" a cada botão do dashboard.
 */
function initializeDashboardButtons() {
  const logoutBtn = document.getElementById('logoutBtn');
  const generateBtn = document.getElementById('generateAnalysisBtn');
  const historyBtn = document.getElementById('historyBtn');
  const editTagsBtn = document.getElementById('editTagsBtn');
  const evaluationsBtn = document.getElementById('evaluationsBtn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
  if (generateBtn) {
    generateBtn.addEventListener('click', generateBusinessAnalysis);
  }
  if (historyBtn) {
    historyBtn.addEventListener('click', () => {
      window.location.href = '/Restaurante/history.html';
    });
  }
  if (editTagsBtn) {
    editTagsBtn.addEventListener('click', () => {
      window.location.href = '/Restaurante/edit_restaurant_tags.html';
    });
  }
  if (evaluationsBtn) {
    evaluationsBtn.addEventListener('click', evaluationsView);
  }
}

/**
 * Carrega os dados do restaurante logado e preenche a página.
 */
async function loadDashboardData() {
  try {
    const response = await fetch('/api/restaurant/me', { credentials: 'include' });

    if (!response.ok) {
      alert('Sua sessão expirou ou é inválida. Por favor, faça o login novamente.');
      logout();
      return;
    }

    const data = await response.json();
    
    // ALTERAÇÃO IMPORTANTE: Armazena o ID do restaurante para uso posterior
    currentRestaurantId = data.restaurantId;

    document.getElementById('restaurantName').textContent = data.restaurantName || 'Nome não disponível';
    document.getElementById('averageRating').textContent = data.averageRating || 'N/A';
    document.getElementById('reviewCount').textContent = data.reviewCount || '0';
    document.getElementById('telefone').textContent = data.restaurantPhone || 'Não informado';
    document.getElementById('email').textContent = data.restaurantEmail || 'Não informado';

    const tagsContainer = document.getElementById('restaurantTags');
    tagsContainer.innerHTML = ''; 
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
      });
    } else {
      tagsContainer.textContent = 'Nenhuma tag definida.';
    }
  } catch (error) {
    console.error("Erro crítico ao carregar dados do dashboard:", error);
    alert('Não foi possível conectar ao servidor para carregar os dados.');
  }
}

/**
 * Busca o ID do restaurante e redireciona para a página de avaliações.
 */
async function evaluationsView() {
  // A variável 'currentRestaurantId' já foi definida pelo loadDashboardData
  if (currentRestaurantId) {
    window.location.href = `/Restaurante/evaluationsRestaurant.html?id=${currentRestaurantId}`;
  } else {
    alert('Não foi possível obter o ID do restaurante. Tente recarregar a página.');
  }
}

/**
 * FUNÇÃO COMPLETA: Chama a API do backend para gerar a análise de negócios com a IA.
 */
async function generateBusinessAnalysis() {
  const generateBtn = document.getElementById('generateAnalysisBtn');
  const messageDiv = document.getElementById('message');

  if (!currentRestaurantId) {
    alert('Erro: ID do restaurante não encontrado. Não é possível gerar a análise.');
    return;
  }

  try {
    // Desabilita o botão e mostra a mensagem de carregamento
    generateBtn.disabled = true;
    messageDiv.textContent = 'Gerando análise com IA... Isso pode levar um momento.';
    messageDiv.style.display = 'block';

    // Chama a rota da API responsável por criar a análise
    const response = await fetch('/api/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ restaurantId: currentRestaurantId }) // Envia o ID do restaurante
    });

    const result = await response.json();

    if (!response.ok) {
      // Se a API retornar um erro, exibe-o
      throw new Error(result.error || 'Ocorreu um erro desconhecido no servidor.');
    }
    
    const reportDiv = document.getElementById('analysisReport') || document.createElement('div');
    reportDiv.id = 'analysisReport';
    reportDiv.className = 'analysis-report';
    reportDiv.innerHTML = `
      <h3>Análise de Negócio</h3>
      <pre>${result.analysis}</pre>
      <button id="downloadPdf" class="pdf-button">Baixar como PDF</button>
    `;
    document.querySelector('.container').appendChild(reportDiv);

    document.getElementById('downloadPdf').addEventListener('click', async () => {
      try {
        const pdfResponse = await fetch('/api/analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ restaurantId: currentRestaurantId, format: 'pdf' })
        });

        if (!pdfResponse.ok) {
          throw new Error('Erro ao gerar PDF.');
        }

        const blob = await pdfResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_analise_${currentRestaurantId}.pdf`;
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

    // Mostra a mensagem de sucesso
    messageDiv.textContent = result.message || 'Análise gerada com sucesso!';

  } catch (error) {
    console.error('Erro ao gerar análise de negócios:', error);
    messageDiv.textContent = `Erro: ${error.message}`;
  } finally {
    // Reabilita o botão após a conclusão (sucesso ou falha)
    generateBtn.disabled = false;
  }
}